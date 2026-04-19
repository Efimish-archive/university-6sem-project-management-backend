import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { env } from "@/env";
import { logging } from "@/logging";

import { authController } from "@/api/auth";
import { numbersController } from "@/api/numbers";

new Elysia()
  .use(
    openapi({
      path: "",
      documentation: {
        info: {
          title: "Управление IT проектами",
          version: "0.0.0",
        },
        components: {
          securitySchemes: {
            bearer: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    })
  )
  .use(logging())
  .use(authController)
  .use(numbersController)
  .listen(env.PORT);

console.log(`🦊 Elysia is running at ${env.HOST}`);
