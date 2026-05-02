import { Elysia, fileType } from "elysia";
import { z } from "zod";
import { db, schema } from "@/db";
import { context } from "@/context";
import { asc, eq } from "drizzle-orm";
import { HttpError } from "@/error";

const NumberSchema = z.object({
  number: z.string(),
  car: z.string(),
  userId: z.number(),
});

const ImageSchema = z.object({
  file: z
    .file()
    .mime(["image/png", "image/jpeg", "image/webp"])
    .refine((file) =>
      fileType(file, ["image/png", "image/jpeg", "image/webp"]),
    ),
});

export const numbersController = new Elysia({ prefix: "/numbers" })
  .use(context)
  .get(
    "",
    async () => {
      const dbNumbers = await db.query.numbers.findMany({
        orderBy: [asc(schema.numbers.number)],
      });
      return dbNumbers;
    },
    {
      response: {
        200: NumberSchema.array(),
      },
      auth: true,
    },
  )
  .get(
    "/:number",
    async ({ params: { number } }) => {
      const dbNumber = await db.query.numbers.findFirst({
        where: eq(schema.numbers.number, number),
      });
      if (!dbNumber) throw new HttpError(404, "Номер не найден");
      return dbNumber;
    },
    {
      params: z.object({ number: z.string() }),
      response: {
        200: NumberSchema,
        404: "error",
      },
      auth: true,
    },
  )
  .post(
    "",
    async ({ body }) => {
      try {
        const [dbNumber] = await db
          .insert(schema.numbers)
          .values(body)
          .returning();
        return dbNumber;
      } catch {
        throw new HttpError(409, "Номер уже существует");
      }
    },
    {
      body: NumberSchema,
      response: {
        200: NumberSchema,
      },
      auth: true,
    },
  )
  .put(
    "/:number",
    async ({ params: { number }, body }) => {
      const [dbNumber] = await db
        .update(schema.numbers)
        .set(body)
        .where(eq(schema.numbers.number, number))
        .returning();
      if (!dbNumber) throw new HttpError(404, "Номер не найден");
      return dbNumber;
    },
    {
      params: z.object({ number: z.string() }),
      body: NumberSchema.partial(),
      response: {
        200: NumberSchema,
        404: "error",
      },
      auth: true,
    },
  )
  .delete(
    "/:number",
    async ({ params: { number } }) => {
      const [dbNumber] = await db
        .delete(schema.numbers)
        .where(eq(schema.numbers.number, number))
        .returning();
      if (!dbNumber) throw new HttpError(404, "Номер не найден");
      return dbNumber;
    },
    {
      params: z.object({ number: z.string() }),
      response: {
        200: NumberSchema,
        404: "error",
      },
      auth: true,
    },
  )
  .post(
    "/check",
    async ({ body: { file } }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8001/predict", {
        method: "POST",
        body: formData,
      });
      const number = (await response.json()).number as string;
      const dbNumber = await db.query.numbers.findFirst({
        where: eq(schema.numbers.number, number),
        with: {
          user: true,
        },
      });
      if (!dbNumber) return { number, isInDb: false };
      return { number, isInDb: true, info: dbNumber };
    },
    {
      body: ImageSchema,
      response: z.object({
        number: z.string(),
        isInDb: z.boolean(),
        info: z
          .object({
            car: z.string(),
            user: z.object({
              firstName: z.string(),
              lastName: z.string(),
              middleName: z.string(),
            }),
          })
          .optional(),
      }),
    },
  );
