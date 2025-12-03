import { linkFor } from "rwsdk/router";
import type { App } from "rwsdk/worker";

export const link: ReturnType<typeof linkFor> = linkFor<App>();
