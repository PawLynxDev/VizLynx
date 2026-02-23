import { router, publicProcedure } from "../trpc";
import { uploadRouter } from "./upload";
import { projectRouter } from "./project";
import { templateRouter } from "./template";
import { generationRouter } from "./generation";
import { brandKitRouter } from "./brandKit";
import { promotionRouter } from "./promotion";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: "ok" };
  }),
  upload: uploadRouter,
  project: projectRouter,
  template: templateRouter,
  generation: generationRouter,
  brandKit: brandKitRouter,
  promotion: promotionRouter,
});

export type AppRouter = typeof appRouter;
