import "rwsdk/worker";
import type { AppContext } from "../src/worker";

declare module "rwsdk/worker" {
  export interface DefaultAppContext extends AppContext {}
  export type App = typeof import("../src/worker").app;
}
