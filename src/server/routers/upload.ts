import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { removeBackground } from "@/lib/ai/rembg";
import { uploadBuffer, generateFileKey, getObjectBuffer } from "@/lib/storage/s3";

export const uploadRouter = router({
  confirmUpload: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        fileKey: z.string(),
        publicUrl: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, userId: ctx.user.id },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const sourceImage = await ctx.db.sourceImage.create({
        data: {
          originalUrl: input.publicUrl,
          fileKey: input.fileKey,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          status: "uploaded",
          projectId: input.projectId,
        },
      });

      return sourceImage;
    }),

  triggerBackgroundRemoval: protectedProcedure
    .input(
      z.object({
        sourceImageId: z.string(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sourceImage = await ctx.db.sourceImage.findFirst({
        where: { id: input.sourceImageId },
        include: { project: true },
      });

      if (!sourceImage || sourceImage.project.userId !== ctx.user.id) {
        throw new Error("Source image not found");
      }

      // Mark as processing
      await ctx.db.sourceImage.update({
        where: { id: input.sourceImageId },
        data: { status: "processing" },
      });

      try {
        // Fetch original image from R2 and call rembg
        const originalBuffer = await getObjectBuffer(sourceImage.fileKey);
        const processedBuffer = await removeBackground(originalBuffer, sourceImage.mimeType);

        // Upload processed image to R2
        const processedKey = generateFileKey(
          "processed",
          ctx.user.id,
          input.projectId,
          "png"
        );
        const processedUrl = await uploadBuffer(processedKey, processedBuffer, "image/png");

        // Update source image record
        const updated = await ctx.db.sourceImage.update({
          where: { id: input.sourceImageId },
          data: {
            processedUrl,
            status: "processed",
          },
        });

        return updated;
      } catch (error) {
        await ctx.db.sourceImage.update({
          where: { id: input.sourceImageId },
          data: { status: "failed" },
        });
        throw new Error(
          `Background removal failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),
});
