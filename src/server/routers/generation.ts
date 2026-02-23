import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { renderTemplate, scaleConfig } from "@/lib/media/templates";
import { uploadBuffer, generateFileKey, getObjectBuffer } from "@/lib/storage/s3";
import { resolveConfig, DEFAULT_BRAND } from "@/lib/media/brandResolver";
import { generateCopy } from "@/lib/ai/copywriter";
import type { TemplateConfig } from "@/types";
import { EXPORT_SIZES } from "@/types";

function buildBrand(brandKit: {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  fontHeading: string;
  fontBody: string;
} | null) {
  if (!brandKit) return DEFAULT_BRAND;
  return {
    colors: {
      primary: brandKit.colorPrimary,
      secondary: brandKit.colorSecondary,
      accent: brandKit.colorAccent,
      background: brandKit.colorBackground,
      text: brandKit.colorText,
    },
    fonts: {
      heading: brandKit.fontHeading,
      body: brandKit.fontBody,
    },
  };
}

export const generationRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        sizeId: z.string().optional(),
        textOverrides: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, userId: ctx.user.id },
        include: {
          template: true,
          brandKit: true,
          sourceImages: {
            where: { status: "processed" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const sourceImage = project.sourceImages[0];
      if (!sourceImage?.processedUrl) {
        throw new Error("No processed image available. Please upload and process an image first.");
      }

      await ctx.db.project.update({
        where: { id: input.projectId },
        data: { status: "processing" },
      });

      try {
        let config = project.template.config as unknown as TemplateConfig;

        // Resolve brand colors/fonts
        const brand = buildBrand(project.brandKit);
        config = resolveConfig(config, brand);

        // Apply text overrides
        if (input.textOverrides) {
          config.textOverlays = config.textOverlays.map((overlay, i) => {
            const override = input.textOverrides?.[String(i)];
            return override !== undefined ? { ...overlay, text: override } : overlay;
          });
        }

        // Scale to target size if specified
        let targetWidth = config.width;
        let targetHeight = config.height;
        if (input.sizeId) {
          const exportSize = EXPORT_SIZES.find((s) => s.id === input.sizeId);
          if (exportSize) {
            config = scaleConfig(config, exportSize.width, exportSize.height);
            targetWidth = exportSize.width;
            targetHeight = exportSize.height;
          }
        }

        const publicUrl = process.env.R2_PUBLIC_URL!;
        const processedFileKey = sourceImage.processedUrl!.replace(`${publicUrl}/`, "");
        const processedBuffer = await getObjectBuffer(processedFileKey);
        const imageBuffer = await renderTemplate(processedBuffer, config);

        const fileKey = generateFileKey("generated", ctx.user.id, input.projectId, "png");
        const imageUrl = await uploadBuffer(fileKey, imageBuffer, "image/png");

        const generated = await ctx.db.generatedContent.create({
          data: {
            imageUrl,
            fileKey,
            width: targetWidth,
            height: targetHeight,
            projectId: input.projectId,
          },
        });

        await ctx.db.project.update({
          where: { id: input.projectId },
          data: { status: "completed" },
        });

        return generated;
      } catch (error) {
        await ctx.db.project.update({
          where: { id: input.projectId },
          data: { status: "draft" },
        });
        throw new Error(
          `Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  generateBatch: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        sizeIds: z.array(z.string()),
        textOverrides: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, userId: ctx.user.id },
        include: {
          template: true,
          brandKit: true,
          sourceImages: {
            where: { status: "processed" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!project) throw new Error("Project not found");
      const sourceImage = project.sourceImages[0];
      if (!sourceImage?.processedUrl) {
        throw new Error("No processed image available.");
      }

      await ctx.db.project.update({
        where: { id: input.projectId },
        data: { status: "processing" },
      });

      try {
        let baseConfig = project.template.config as unknown as TemplateConfig;
        const brand = buildBrand(project.brandKit);
        baseConfig = resolveConfig(baseConfig, brand);

        if (input.textOverrides) {
          baseConfig.textOverlays = baseConfig.textOverlays.map((overlay, i) => {
            const override = input.textOverrides?.[String(i)];
            return override !== undefined ? { ...overlay, text: override } : overlay;
          });
        }

        const publicUrl = process.env.R2_PUBLIC_URL!;
        const processedFileKey = sourceImage.processedUrl!.replace(`${publicUrl}/`, "");
        const processedBuffer = await getObjectBuffer(processedFileKey);

        const results = [];

        for (const sizeId of input.sizeIds) {
          const exportSize = EXPORT_SIZES.find((s) => s.id === sizeId);
          if (!exportSize) continue;

          const scaled = scaleConfig(baseConfig, exportSize.width, exportSize.height);
          const imageBuffer = await renderTemplate(processedBuffer, scaled);
          const fileKey = generateFileKey("generated", ctx.user.id, input.projectId, "png");
          const imageUrl = await uploadBuffer(fileKey, imageBuffer, "image/png");

          const generated = await ctx.db.generatedContent.create({
            data: {
              imageUrl,
              fileKey,
              width: exportSize.width,
              height: exportSize.height,
              projectId: input.projectId,
            },
          });
          results.push(generated);
        }

        await ctx.db.project.update({
          where: { id: input.projectId },
          data: { status: "completed" },
        });

        return results;
      } catch (error) {
        await ctx.db.project.update({
          where: { id: input.projectId },
          data: { status: "draft" },
        });
        throw new Error(
          `Batch generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  generateCopy: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        productName: z.string().min(1),
        productDescription: z.string().default(""),
        tone: z.enum(["professional", "casual", "bold", "playful"]).default("professional"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, userId: ctx.user.id },
        include: { template: true },
      });

      if (!project) throw new Error("Project not found");

      const config = project.template.config as unknown as TemplateConfig;
      const textSlots = config.textOverlays.map((overlay, index) => ({
        index,
        placeholder: overlay.text,
      }));

      return generateCopy({
        productName: input.productName,
        productDescription: input.productDescription,
        templateCategory: project.template.category,
        tone: input.tone,
        textSlots,
      });
    }),

  getResult: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, userId: ctx.user.id },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return ctx.db.generatedContent.findFirst({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
      });
    }),

  getResults: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, userId: ctx.user.id },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return ctx.db.generatedContent.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
      });
    }),
});
