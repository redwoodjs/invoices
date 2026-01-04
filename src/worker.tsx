import { defineApp, ErrorResponse } from "rwsdk/worker";
import { render, prefix, route } from "rwsdk/router";
import { env } from "cloudflare:workers";
import { defineDurableSession } from "rwsdk/auth";

import { db } from "@/db/db";

import { Session } from "./session/durable-object";
export { SessionDurableObject } from "./session/durable-object";
export { AppDurableObject } from "./db/durable-object";

import { link } from "@/app/shared/links";
import { Document } from "@/app/document";
import { HomePage } from "@/app/pages/home";

import { userRoutes } from "@/app/pages/user/routes";
import { invoiceRoutes } from "@/app/pages/invoice/routes";

export const sessionStore = defineDurableSession({
  sessionDurableObject: env.SESSION_DURABLE_OBJECT,
});

export type AppContext = {
  session: Session | null;
  user: {
    id: string;
    email: string;
  } | null;
  theme: "dark" | "light" | "system";
};

export const getUser = async (session: Session | null) => {
  if (!session?.userId) {
    return null;
  }

  const user = await db
    .selectFrom("User")
    .select(["id", "email"])
    .where("id", "=", session.userId)
    .executeTakeFirst();

  return user || null;
};

const app = defineApp([
  async ({ request, ctx, response }) => {
    // Read theme from cookie
    const cookieHeader = request.headers.get("Cookie");

    // Improved regex to handle multiple cookies and ignore "undefined"
    const themeMatch = cookieHeader?.match(
      /(?:^|;)\s*theme=(dark|light|system)(?:;|$)/
    );
    ctx.theme = "system";
    if (
      themeMatch?.[1] &&
      ["dark", "light", "system"].includes(themeMatch[1])
    ) {
      ctx.theme = themeMatch[1] as "dark" | "light" | "system";
    }

    try {
      ctx.session = await sessionStore.load(request);
      ctx.user = await getUser(ctx.session);
    } catch (error) {
      if (error instanceof ErrorResponse && error.code === 401) {
        await sessionStore.remove(request, response.headers);
        response.headers.set("Location", "/user/login");
        return new Response(null, {
          status: 302,
          headers: response.headers,
        });
      }
    }
  },
  render(Document, [
    route("/", [
      ({ ctx }) => {
        if (ctx.user) {
          console.log("redirecting to invoice list");
          return new Response(null, {
            status: 302,
            headers: { Location: link("/invoice/list") },
          });
        }
      },
      HomePage,
    ]),
    prefix("/user", userRoutes),
    prefix("/invoice", invoiceRoutes),
  ]),
]);

export default app;
