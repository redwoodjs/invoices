import { route } from "rwsdk/router";
import { LoginPage } from "./login-page";
import { sessionStore } from "@/worker";
import { link } from "@/app/shared/links";

export const userRoutes = [
  route("/login", LoginPage),
  route("/logout", async function ({ request }) {
    const headers = new Headers();
    await sessionStore.remove(request, headers);
    headers.set("Location", link("/"));

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
];
