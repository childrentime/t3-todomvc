import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        value: z.string(),
        completed: z.boolean(),
        deleted: z.boolean(),
        randomId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          ...input,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.updateMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        data: {
          deleted: true,
        },
      });
    }),

  edit: protectedProcedure
    .input(
      z.object({
        value: z.string(),
        completed: z.boolean(),
        deleted: z.boolean(),
        randomId: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      return ctx.db.post.update({
        data: {
          ...rest,
        },
        where: { id, createdById: ctx.session.user.id },
      });
    }),

  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  inifinite: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      }),
    )
    .query(async (opts) => {
      const { input } = opts;
      const limit = input.limit ?? 5;
      const {  cursor } = input;
      const items = await db.post.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor:  cursor ? { id:  cursor } : undefined,
      });
      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
    }),
});
