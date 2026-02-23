import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const brandKitRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.brandKit.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const brandKit = await ctx.db.brandKit.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!brandKit) throw new Error("Brand kit not found");
      return brandKit;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        colorPrimary: z.string().default("#6c63ff"),
        colorSecondary: z.string().default("#1a1a2e"),
        colorAccent: z.string().default("#ff6b6b"),
        colorBackground: z.string().default("#ffffff"),
        colorText: z.string().default("#1a1a2e"),
        fontHeading: z.string().default("Inter"),
        fontBody: z.string().default("Inter"),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If setting as default, unset other defaults
      if (input.isDefault) {
        await ctx.db.brandKit.updateMany({
          where: { userId: ctx.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      return ctx.db.brandKit.create({
        data: { ...input, userId: ctx.user.id },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        colorPrimary: z.string().optional(),
        colorSecondary: z.string().optional(),
        colorAccent: z.string().optional(),
        colorBackground: z.string().optional(),
        colorText: z.string().optional(),
        fontHeading: z.string().optional(),
        fontBody: z.string().optional(),
        isDefault: z.boolean().optional(),
        logoLightUrl: z.string().nullable().optional(),
        logoLightKey: z.string().nullable().optional(),
        logoDarkUrl: z.string().nullable().optional(),
        logoDarkKey: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.brandKit.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!existing) throw new Error("Brand kit not found");

      if (input.isDefault) {
        await ctx.db.brandKit.updateMany({
          where: { userId: ctx.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      const { id, ...data } = input;
      return ctx.db.brandKit.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.brandKit.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!existing) throw new Error("Brand kit not found");

      await ctx.db.brandKit.delete({ where: { id: input.id } });
      return { success: true };
    }),

  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.brandKit.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!existing) throw new Error("Brand kit not found");

      await ctx.db.brandKit.updateMany({
        where: { userId: ctx.user.id, isDefault: true },
        data: { isDefault: false },
      });
      return ctx.db.brandKit.update({
        where: { id: input.id },
        data: { isDefault: true },
      });
    }),
});
