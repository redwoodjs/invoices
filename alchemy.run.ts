import alchemy from "alchemy";
import {
  Worker,
  DurableObjectNamespace,
  R2Bucket,
  WranglerJson,
} from "alchemy/cloudflare";

const app = await alchemy("billable-alchemy");

const r2 = await R2Bucket("billable-bucket", {
  name: "billable",
  adopt: true,
});

const sessionDO = await DurableObjectNamespace("session-do", {
  className: "SessionDurableObject",
});

const appDO = await DurableObjectNamespace("app-do", {
  className: "AppDurableObject",
});

const worker = await Worker("billable-worker", {
  name: "billable-alchemy",
  entrypoint: "alchemy.dummy.ts",
  bindings: {
    R2: r2,
    SESSION_DURABLE_OBJECT: sessionDO,
    APP_DURABLE_OBJECT: appDO,
    APP_URL: "https://billable.me",
    APP_NAME: "billable",
    WEBAUTHN_APP_NAME: "billable",
  },
  compatibilityDate: "2025-10-11",
  compatibilityFlags: ["nodejs_compat"],
});

await WranglerJson({
  worker,
  path: "wrangler.jsonc",
  transform: {
    wrangler: (config: any) => {
      // Fix up the generated config to match the real production resources
      const fixedConfig: any = {
        ...config,
        name: "billable",
        main: "src/worker.tsx",
        account_id: "1634a8e653b2ce7e0f7a23cca8cbd86a",
        assets: {
          binding: "ASSETS",
        },
        placement: {
          mode: "smart",
        },
        observability: {
          enabled: true,
        },
        routes: [
          {
            pattern: "billable.me",
            custom_domain: true,
          },
        ],
        migrations: [
          {
            tag: "alchemy:v4",
          },
        ],
      };

      // Fix DO bindings to remove script_name if present
      if (fixedConfig.durable_objects?.bindings) {
        fixedConfig.durable_objects.bindings =
          fixedConfig.durable_objects.bindings.map((b: any) => {
            if (b.script_name) {
              const { script_name, ...rest } = b;
              return rest;
            }
            return b;
          });
      }

      return fixedConfig;
    },
  },
});
