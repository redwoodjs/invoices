import { defineLinks } from "rwsdk/router";

export const link = defineLinks([
  "/",

  "/user/login",
  "/user/logout",
  "/user/auth",

  "/invoice/list",
  "/invoice/bin",
  "/invoice/:id",
  "/invoice/:id/upload",
  "/invoice/logos",
]);
