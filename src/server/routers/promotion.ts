import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { getObjectBuffer, uploadBuffer, getPublicUrl } from "@/lib/storage/s3";
import { analyzeProduct } from "@/lib/ai/productAnalyzer";
import { generateFluxImage, generateKlingVideo } from "@/lib/ai/fal";
import { compositeTextOnImage } from "@/lib/media/textCompositor";
import { EXPORT_SIZES } from "@/types";
import type { TextOverlay } from "@/types";
import sharp from "sharp";

export const promotionRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.promotion.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        sourceImageUrl: true,
        finalImageUrl: true,
        createdAt: true,
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const promotion = await ctx.db.promotion.findFirst({
        where: { id: input.id, userId: ctx.user.id },
        include: { exports: true, brandKit: true },
      });
      if (!promotion) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return promotion;
    }),

  create: protectedProcedure
    .input(
      z.object({
        sourceImageUrl: z.string(),
        sourceImageKey: z.string(),
        sourceFileName: z.string(),
        sourceFileSize: z.number(),
        sourceMimeType: z.string(),
        brandKitId: z.string().optional(),
        tone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create promotion record
      const promotion = await ctx.db.promotion.create({
        data: {
          userId: ctx.user.id,
          status: "analyzing",
          sourceImageUrl: input.sourceImageUrl,
          sourceImageKey: input.sourceImageKey,
          sourceFileName: input.sourceFileName,
          sourceFileSize: input.sourceFileSize,
          sourceMimeType: input.sourceMimeType,
          brandKitId: input.brandKitId,
        },
      });

      // Fetch image and analyze
      try {
        const imageBuffer = await getObjectBuffer(input.sourceImageKey);

        // Get brand context if brandKit selected
        let brandContext: string | undefined;
        if (input.brandKitId) {
          const kit = await ctx.db.brandKit.findUnique({
            where: { id: input.brandKitId },
          });
          if (kit) {
            brandContext = `Brand: ${kit.name}. Colors: primary ${kit.colorPrimary}, accent ${kit.colorAccent}. Fonts: ${kit.fontHeading}/${kit.fontBody}.`;
          }
        }

        const analysis = await analyzeProduct({
          imageBuffer,
          mimeType: input.sourceMimeType,
          brandContext,
          tone: input.tone ?? "professional",
        });

        const updated = await ctx.db.promotion.update({
          where: { id: promotion.id },
          data: {
            status: "draft",
            fluxPrompt: analysis.fluxPrompt,
            marketingHeadline: analysis.headline,
            marketingSubline: analysis.subline,
            marketingCta: analysis.cta,
            productAnalysis: analysis.productDescription,
          },
        });

        return updated;
      } catch (error) {
        console.error("[promotion.create] Analysis failed:", error);
        await ctx.db.promotion.update({
          where: { id: promotion.id },
          data: { status: "draft" },
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Analysis failed",
        });
      }
    }),

  analyze: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        tone: z.string().optional(),
        brandKitId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const promotion = await ctx.db.promotion.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!promotion) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.promotion.update({
        where: { id: input.id },
        data: { status: "analyzing" },
      });

      const imageBuffer = await getObjectBuffer(promotion.sourceImageKey);

      let brandContext: string | undefined;
      const brandKitId = input.brandKitId ?? promotion.brandKitId;
      if (brandKitId) {
        const kit = await ctx.db.brandKit.findUnique({
          where: { id: brandKitId },
        });
        if (kit) {
          brandContext = `Brand: ${kit.name}. Colors: primary ${kit.colorPrimary}, accent ${kit.colorAccent}. Fonts: ${kit.fontHeading}/${kit.fontBody}.`;
        }
      }

      const analysis = await analyzeProduct({
        imageBuffer,
        mimeType: promotion.sourceMimeType,
        brandContext,
        tone: input.tone ?? "professional",
      });

      return ctx.db.promotion.update({
        where: { id: input.id },
        data: {
          status: "draft",
          fluxPrompt: analysis.fluxPrompt,
          marketingHeadline: analysis.headline,
          marketingSubline: analysis.subline,
          marketingCta: analysis.cta,
          productAnalysis: analysis.productDescription,
          brandKitId: input.brandKitId ?? promotion.brandKitId,
        },
      });
    }),

  generateImage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        prompt: z.string(),
        aspectRatio: z.string().optional(),
        seed: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const promotion = await ctx.db.promotion.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!promotion) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.promotion.update({
        where: { id: input.id },
        data: { status: "generating", fluxPrompt: input.prompt },
      });

      try {
        const result = await generateFluxImage({
          prompt: input.prompt,
          imageUrl: promotion.sourceImageUrl,
          aspectRatio: input.aspectRatio ?? "1:1",
          seed: input.seed,
        });

        // Download the Flux result and upload to R2
        const response = await fetch(result.imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fluxKey = `promotion-flux/${ctx.user.id}/${promotion.id}/${crypto.randomUUID()}.png`;
        const pngBuffer = await sharp(buffer).png().toBuffer();
        await uploadBuffer(fluxKey, pngBuffer, "image/png");
        const fluxUrl = getPublicUrl(fluxKey);

        return ctx.db.promotion.update({
          where: { id: input.id },
          data: {
            status: "generated",
            fluxImageUrl: fluxUrl,
            fluxImageKey: fluxKey,
            fluxSeed: result.seed,
          },
        });
      } catch (error) {
        await ctx.db.promotion.update({
          where: { id: input.id },
          data: { status: "draft" },
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Image generation failed",
        });
      }
    }),

  compositeText: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        headline: z.string(),
        subline: z.string().optional(),
        cta: z.string().optional(),
        textPosition: z.enum(["top", "center", "bottom"]).default("bottom"),
        textColor: z.string().default("#ffffff"),
        font: z.string().default("Inter"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const promotion = await ctx.db.promotion.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!promotion || !promotion.fluxImageKey) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No generated image found" });
      }

      const baseBuffer = await getObjectBuffer(promotion.fluxImageKey);
      const meta = await sharp(baseBuffer).metadata();
      const imgWidth = meta.width ?? 1080;
      const imgHeight = meta.height ?? 1080;

      // Build text overlays based on position
      const yPositions = {
        top: { headline: imgHeight * 0.12, subline: imgHeight * 0.18, cta: imgHeight * 0.25 },
        center: { headline: imgHeight * 0.45, subline: imgHeight * 0.52, cta: imgHeight * 0.6 },
        bottom: { headline: imgHeight * 0.75, subline: imgHeight * 0.82, cta: imgHeight * 0.9 },
      };
      const pos = yPositions[input.textPosition];

      const overlays: TextOverlay[] = [];

      if (input.headline) {
        overlays.push({
          text: input.headline,
          font: input.font,
          size: Math.round(imgWidth * 0.055),
          weight: "bold",
          color: input.textColor,
          align: "center",
          x: "center",
          y: Math.round(pos.headline),
        });
      }

      if (input.subline) {
        overlays.push({
          text: input.subline,
          font: input.font,
          size: Math.round(imgWidth * 0.03),
          weight: "normal",
          color: input.textColor,
          align: "center",
          x: "center",
          y: Math.round(pos.subline),
        });
      }

      if (input.cta) {
        overlays.push({
          text: input.cta,
          font: input.font,
          size: Math.round(imgWidth * 0.028),
          weight: "semibold",
          color: "#ffffff",
          align: "center",
          x: "center",
          y: Math.round(pos.cta),
          background: {
            color: "rgba(108, 99, 255, 0.9)",
            paddingX: 24,
            paddingY: 10,
            borderRadius: 8,
          },
        });
      }

      const composited = await compositeTextOnImage({ baseImageBuffer: baseBuffer, textOverlays: overlays });

      const finalKey = `promotion-final/${ctx.user.id}/${promotion.id}/${crypto.randomUUID()}.png`;
      await uploadBuffer(finalKey, composited, "image/png");
      const finalUrl = getPublicUrl(finalKey);

      return ctx.db.promotion.update({
        where: { id: input.id },
        data: {
          status: "composited",
          finalImageUrl: finalUrl,
          finalImageKey: finalKey,
          finalWidth: imgWidth,
          finalHeight: imgHeight,
          marketingHeadline: input.headline,
          marketingSubline: input.subline ?? promotion.marketingSubline,
          marketingCta: input.cta ?? promotion.marketingCta,
        },
      });
    }),

  generateVideo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        prompt: z.string().optional(),
        duration: z.string().optional(),
        aspectRatio: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const promotion = await ctx.db.promotion.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!promotion) throw new TRPCError({ code: "NOT_FOUND" });

      const imageUrl = promotion.finalImageUrl ?? promotion.fluxImageUrl ?? promotion.sourceImageUrl;

      await ctx.db.promotion.update({
        where: { id: input.id },
        data: { videoStatus: "generating" },
      });

      try {
        const result = await generateKlingVideo({
          prompt: input.prompt ?? promotion.fluxPrompt ?? "Product showcase with elegant motion",
          imageUrl,
          duration: input.duration ?? "5",
          aspectRatio: input.aspectRatio ?? "1:1",
        });

        // Download video and upload to R2
        const response = await fetch(result.videoUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const videoKey = `promotion-video/${ctx.user.id}/${promotion.id}/${crypto.randomUUID()}.mp4`;
        await uploadBuffer(videoKey, buffer, "video/mp4");
        const videoUrl = getPublicUrl(videoKey);

        return ctx.db.promotion.update({
          where: { id: input.id },
          data: {
            videoStatus: "completed",
            videoUrl,
            videoKey,
          },
        });
      } catch (error) {
        await ctx.db.promotion.update({
          where: { id: input.id },
          data: { videoStatus: "failed" },
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Video generation failed",
        });
      }
    }),

  exportSizes: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        sizeIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const promotion = await ctx.db.promotion.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!promotion) throw new TRPCError({ code: "NOT_FOUND" });

      const sourceKey = promotion.finalImageKey ?? promotion.fluxImageKey;
      if (!sourceKey) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No image to export" });
      }

      const sourceBuffer = await getObjectBuffer(sourceKey);
      const sizes = EXPORT_SIZES.filter((s) => input.sizeIds.includes(s.id));

      // Delete existing exports for this promotion
      await ctx.db.promotionExport.deleteMany({
        where: { promotionId: input.id },
      });

      const exports = [];
      for (const size of sizes) {
        const resized = await sharp(sourceBuffer)
          .resize(size.width, size.height, { fit: "cover" })
          .png()
          .toBuffer();

        const exportKey = `promotion-exports/${ctx.user.id}/${promotion.id}/${size.id}.png`;
        await uploadBuffer(exportKey, resized, "image/png");
        const exportUrl = getPublicUrl(exportKey);

        const exp = await ctx.db.promotionExport.create({
          data: {
            promotionId: input.id,
            imageUrl: exportUrl,
            fileKey: exportKey,
            width: size.width,
            height: size.height,
            sizeLabel: size.label,
          },
        });
        exports.push(exp);
      }

      await ctx.db.promotion.update({
        where: { id: input.id },
        data: { status: "completed" },
      });

      return exports;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        brandKitId: z.string().nullish(),
        marketingHeadline: z.string().optional(),
        marketingSubline: z.string().optional(),
        marketingCta: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const promotion = await ctx.db.promotion.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!promotion) throw new TRPCError({ code: "NOT_FOUND" });

      const { id, ...data } = input;
      return ctx.db.promotion.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const promotion = await ctx.db.promotion.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!promotion) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.promotion.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
