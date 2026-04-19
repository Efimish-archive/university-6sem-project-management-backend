import { Elysia } from "elysia";
import { z } from "zod";
import { db, schema } from "@/db";
import { context } from "@/context";
import { eq } from "drizzle-orm";
import { HttpError } from "@/error";
import argon2 from "argon2";

const LoginSchema = z.object({
  login: z.string(),
  password: z.string(),
});

export const authController = new Elysia({ prefix: "/auth" }).use(context).post(
  "/login",
  async ({ body, jwt }) => {
    const admin = await db.query.admins.findFirst({
      where: eq(schema.admins.login, body.login),
    });
    if (!admin) throw new HttpError(400, "Неверные данные");

    const isPasswordCorrect = await argon2.verify(
      admin.passwordHash,
      body.password,
    );
    if (!isPasswordCorrect) throw new HttpError(400, "Неверные данные");

    const token = await jwt.sign({
      sub: admin.login,
    });

    return { token };
  },
  {
    body: LoginSchema,
    response: {
      200: z.object({
        token: z.string(),
      }),
      400: "error",
    },
  },
);
