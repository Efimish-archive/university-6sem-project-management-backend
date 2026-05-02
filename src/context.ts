import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { z } from "zod";
import { env } from "@/env";
import { HttpError } from "@/error";

const AuthSchema = z.object({
  sub: z.string(),
});

export const context = new Elysia({ name: "context" })
  .use(bearer())
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    }),
  )
  .model({
    error: z.object({
      error: z.string(),
      code: z.number(),
    }),
  })
  .macro("auth", {
    detail: {
      security: [{ bearerAuth: [] }],
    },
    headers: z.object({
      authorization: z.string(),
    }),
    response: {
      401: "error",
    },
    resolve: async ({ bearer, jwt }) => {
      const error = new HttpError(401, "Вы не авторизованы");
      if (!bearer) throw error;

      const auth = await jwt.verify(bearer);
      if (!auth) throw error;

      const { data } = AuthSchema.safeParse(auth);
      if (!data) throw error;

      return { auth: data };
    },
  });
