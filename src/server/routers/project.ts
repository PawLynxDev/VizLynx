import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const projectRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: { userId: ctx.user.id },
      include: {
        template: true,
        brandKit: true,
        sourceImages: { take: 1 },
        generatedContent: { take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, userId: ctx.user.id },
        include: {
          template: true,
          brandKit: true,
          sourceImages: { orderBy: { createdAt: "desc" } },
          generatedContent: { orderBy: { createdAt: "desc" } },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        templateId: z.string(),
        brandKitId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          templateId: input.templateId,
          brandKitId: input.brandKitId ?? null,
          userId: ctx.user.id,
          status: "draft",
        },
      });
    }),

  updateBrandKit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        brandKitId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!project) throw new Error("Project not found");

      return ctx.db.project.update({
        where: { id: input.id },
        data: { brandKitId: input.brandKitId },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      await ctx.db.project.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
