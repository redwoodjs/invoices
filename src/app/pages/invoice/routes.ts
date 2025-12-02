import { index, route } from "rwsdk/router";
import type { RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import { db } from "@/db/db";

import { InvoiceListPage } from "./ListPage/InvoiceListPage";
import { InvoiceDetailPage } from "./DetailPage/InvoiceDetailPage";
import { InvoiceBinPage } from "./BinPage/InvoiceBinPage";

function isAuthenticated({ ctx }: RequestInfo) {
  if (!ctx.user) {
    console.log("User is not logged in");
    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  }
}

export const invoiceRoutes = [
  index(function () {
    // redirect to invoice/list
    return new Response(null, {
      status: 301,
      headers: {
        Location: "/invoice/list",
      },
    });
  }),
  route("/list", [isAuthenticated, InvoiceListPage]),
  route("/bin", [isAuthenticated, InvoiceBinPage]),
  route("/:id", [isAuthenticated, InvoiceDetailPage]),
  route("/:id/upload", [
    isAuthenticated,
    async ({ request, params, ctx }) => {
      if (
        request.method !== "POST" &&
        !request.headers.get("content-type")?.includes("multipart/form-data")
      ) {
        return new Response("Method not allowed", { status: 405 });
      }

      const formData = await request.formData();
      const file = formData.get("file") as File;

      // Stream the file directly to R2
      const r2ObjectKey = `/invoice/logos/${ctx?.user?.id}/${
        params.id
      }-${Date.now()}-${file.name}`;
      await env.R2.put(r2ObjectKey, file.stream(), {
        httpMetadata: {
          contentType: file.type,
        },
      });

      await db
        .updateTable("Invoice")
        .set({ supplierLogo: r2ObjectKey })
        .where("id", "=", params.id)
        .execute();

      return new Response(JSON.stringify({ key: r2ObjectKey }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ]),
  route("/logos/*", [
    isAuthenticated,
    async ({ params }) => {
      const object = await env.R2.get("/invoice/logos/" + params.$0);
      if (object === null) {
        return new Response("Object Not Found", { status: 404 });
      }
      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType as string,
        },
      });
    },
  ]),
];
