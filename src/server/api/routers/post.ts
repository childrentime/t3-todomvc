import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
        ids: z.array(z.string())
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.updateMany({
        where: {
          id: {
            in: input.ids
          }
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
});
