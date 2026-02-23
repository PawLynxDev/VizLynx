import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const templateRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.template.findMany({
        where: {
          isActive: true,
          ...(input?.category ? { category: input.category } : {}),
        },
        orderBy: { createdAt: "asc" },
      });
    }),
});
