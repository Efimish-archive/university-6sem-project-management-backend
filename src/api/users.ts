import { Elysia } from "elysia";
import { z } from "zod";
import { db, schema } from "@/db";
import { context } from "@/context";
import { eq } from "drizzle-orm";
import { HttpError } from "@/error";

const PostUserSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string(),
});

const GetUserSchema = PostUserSchema.extend({
  id: z.number(),
});

export const usersController = new Elysia({ prefix: "/users" })
  .use(context)
  .get(
    "",
    async () => {
      const dbUsers = await db.query.users.findMany();
      return dbUsers;
    },
    {
      response: {
        200: GetUserSchema.array(),
      },
      auth: true,
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const dbUser = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });
      if (!dbUser) throw new HttpError(404, "Номер не найден");
      return dbUser;
    },
    {
      params: z.object({ id: z.number() }),
      response: {
        200: GetUserSchema,
        404: "error",
      },
      auth: true,
    },
  )
  .post(
    "",
    async ({ body }) => {
      try {
        const [dbUser] = await db.insert(schema.users).values(body).returning();
        return dbUser;
      } catch {
        throw new HttpError(409, "Номер уже существует");
      }
    },
    {
      body: PostUserSchema,
      response: {
        200: GetUserSchema,
      },
      auth: true,
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const [dbUser] = await db
        .update(schema.users)
        .set(body)
        .where(eq(schema.users.id, id))
        .returning();
      if (!dbUser) throw new HttpError(404, "Номер не найден");
      return dbUser;
    },
    {
      params: z.object({ id: z.number() }),
      body: GetUserSchema.partial(),
      response: {
        200: GetUserSchema,
        404: "error",
      },
      auth: true,
    },
  )
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      const [dbUser] = await db
        .delete(schema.users)
        .where(eq(schema.users.id, id))
        .returning();
      if (!dbUser) throw new HttpError(404, "Номер не найден");
      return dbUser;
    },
    {
      params: z.object({ id: z.number() }),
      response: {
        200: GetUserSchema,
        404: "error",
      },
      auth: true,
    },
  );
