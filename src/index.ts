import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { staticPlugin } from "@elysiajs/static";
import { env } from "@/env";
import { logging } from "@/logging";

import { testRouter } from "@/api/test";
import { postsRouter } from "@/api/posts";
import { recipesRouter } from "@/api/recipes";
import { cuisinesRouter } from "@/api/cuisines";
import { allergensRouter } from "@/api/allergens";
import { ingredientsRouter } from "@/api/ingredients";
import { usersRouter } from "@/api/users";

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
  .use(staticPlugin())
  .use(logging())
  .use(testRouter)
  .use(postsRouter)
  .use(recipesRouter)
  .use(cuisinesRouter)
  .use(allergensRouter)
  .use(ingredientsRouter)
  .use(usersRouter)
  .listen(env.PORT);

console.log(`🦊 Elysia is running at ${env.HOST}`);
