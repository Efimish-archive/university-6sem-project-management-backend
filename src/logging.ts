import { Elysia } from "elysia";

export const logging = () =>
  new Elysia({
    name: "elysia-logging-middleware",
  }).onAfterResponse(
    { as: "global" },
    ({ request: { method, url, headers }, set }) => {
      const time = new Date().toLocaleString("ru");
      const userAgent = headers.get("User-Agent") ?? "unknown UA";
      console.log(`[${time}] [${userAgent}] ${method} ${url} -> ${set.status}`);
    },
  );
