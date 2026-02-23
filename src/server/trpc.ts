import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "./db";

export const createTRPCContext = async () => {
  const { userId: clerkId } = await auth();

  let user = null;
  if (clerkId) {
    user = await db.user.findUnique({ where: { clerkId } });
  }

  return { db, clerkId, user };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.clerkId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Upsert user on first authenticated request
  let user = ctx.user;
  if (!user) {
    const clerkUser = await (await import("@clerk/nextjs/server")).currentUser();
    if (!clerkUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    user = await ctx.db.user.upsert({
      where: { clerkId: ctx.clerkId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
        avatarUrl: clerkUser.imageUrl,
      },
      create: {
        clerkId: ctx.clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
        avatarUrl: clerkUser.imageUrl,
      },
    });
  }

  return next({
    ctx: { ...ctx, clerkId: ctx.clerkId, user },
  });
});
