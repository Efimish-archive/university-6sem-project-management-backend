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

      const response = await fetch("http://100.91.68.15:8000/predict", {
        method: "POST",
        body: formData,
      });
      const json = (await response.json()) as {
        number: string;
      };
      return json;
    },
    {
      body: ImageSchema,
      response: z.object({
        number: z.string(),
      }),
    },
  );
