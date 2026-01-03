"use server";

import { requestInfo } from "rwsdk/worker";

export async function setTheme(theme: "dark" | "light" | "system") {
  const cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  requestInfo.response.headers.set("Set-Cookie", cookie);
}
