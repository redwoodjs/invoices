"use server";

import { db } from "@/db/db";
import { requestInfo } from "rwsdk/worker";

export async function newInvoice() {
  const { ctx } = requestInfo;
  const userId = ctx.user?.id!;

  const lastInvoice = await db
    .selectFrom("Invoice")
    .select([
      "number",
      "supplierName",
      "supplierLogo",
      "supplierContact",
      "notesA",
      "notesB",
      "taxes",
    ])
    .where("userId", "=", userId)
    .where("deletedAt", "is", null)
    .orderBy("createdAt", "desc")
    .executeTakeFirst();

  const invoiceId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newInvoice = await db
    .insertInto("Invoice")
    .values({
      id: invoiceId,
      number: (Number(lastInvoice?.number || 0) + 1).toString(),
      supplierName: lastInvoice?.supplierName || null,
      supplierLogo: lastInvoice?.supplierLogo || null,
      supplierContact: lastInvoice?.supplierContact || null,
      notesA: lastInvoice?.notesA || null,
      notesB: lastInvoice?.notesB || null,
      taxes: lastInvoice?.taxes || "[]",
      userId,
      title: "invoice",
      date: now,
      status: "draft",
      items: "[]",
      labels:
        '{"invoiceNumber":"Invoice #","invoiceDate":"Date","itemDescription":"Description","itemQuantity":"Quantity","itemPrice":"Price","subtotal":"Subtotal","total":"Total"}',
      currency: "$",
      createdAt: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return newInvoice;
}
