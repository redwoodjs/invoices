"use server";

import { type Invoice as DbInvoice } from "@/db/db";
import { db } from "@/db/db";
import type {
  InvoiceItem,
  InvoiceLabels,
  InvoiceTaxes,
} from "./InvoiceDetailPage";
import type { Invoice as FormInvoice } from "./InvoiceForm";
import { requestInfo } from "rwsdk/worker";

export async function saveInvoice(
  id: string,
  invoice: Omit<FormInvoice, "items" | "taxes" | "labels">,
  labels: InvoiceLabels,
  items: InvoiceItem[],
  taxes: InvoiceTaxes[]
) {
  const { ctx } = requestInfo;

  const existingInvoice = await db
    .selectFrom("Invoice")
    .select(["id"])
    .where("id", "=", id)
    .where("userId", "=", ctx?.user?.id!)
    .executeTakeFirst();

  if (!existingInvoice) {
    throw new Error("Invoice not found");
  }

  const data: DbInvoice = {
    ...invoice,
    customer: invoice.customer,
    date:
      typeof invoice.date === "string"
        ? invoice.date
        : invoice.date.toISOString(),
    createdAt:
      typeof invoice.createdAt === "string"
        ? invoice.createdAt
        : invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt
      ? typeof invoice.updatedAt === "string"
        ? invoice.updatedAt
        : invoice.updatedAt.toISOString()
      : null,
    items: JSON.stringify(items),
    taxes: JSON.stringify(taxes),
    labels: JSON.stringify(labels),
  };

  await db
    .insertInto("Invoice")
    .values(data)
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        title: data.title,
        userId: data.userId,
        number: data.number,
        date: data.date,
        status: data.status,
        supplierLogo: data.supplierLogo,
        supplierName: data.supplierName,
        supplierContact: data.supplierContact,
        customer: data.customer,
        notesA: data.notesA,
        notesB: data.notesB,
        items: data.items,
        taxes: data.taxes,
        labels: data.labels,
        currency: data.currency,
        updatedAt: new Date().toISOString(),
      })
    )
    .execute();
}

export async function deleteLogo(id: string) {
  const { ctx } = requestInfo;

  const existingInvoice = await db
    .selectFrom("Invoice")
    .select(["id"])
    .where("id", "=", id)
    .where("userId", "=", ctx?.user?.id!)
    .executeTakeFirst();

  if (!existingInvoice) {
    throw new Error("Invoice not found");
  }

  await db
    .updateTable("Invoice")
    .set({ supplierLogo: null })
    .where("id", "=", id)
    .execute();
}

export async function deleteInvoice(id: string) {
  const { ctx } = requestInfo;

  const existingInvoice = await db
    .selectFrom("Invoice")
    .select(["id"])
    .where("id", "=", id)
    .where("userId", "=", ctx?.user?.id!)
    .executeTakeFirst();

  if (!existingInvoice) {
    throw new Error("Invoice not found");
  }

  await db
    .updateTable("Invoice")
    .set({ deletedAt: new Date().toISOString() })
    .where("id", "=", id)
    .where("userId", "=", ctx?.user?.id!)
    .execute();
}
