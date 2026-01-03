"use server";

import { db } from "@/db/db";
import { requestInfo } from "rwsdk/worker";

export async function getCustomerNames() {
  const { ctx } = requestInfo;
  const userId = ctx.user?.id!;

  const customers = await db
    .selectFrom("Invoice")
    .select(["customerName", "customer"])
    .where("userId", "=", userId)
    .where("deletedAt", "is", null)
    .where("customerName", "is not", null)
    .where("customerName", "!=", "")
    .distinct()
    .orderBy("customerName", "asc")
    .execute();

  // Group by customerName and get the most recent customer address for each
  const customerMap = new Map<string, string>();
  for (const customer of customers) {
    if (customer.customerName && !customerMap.has(customer.customerName)) {
      customerMap.set(customer.customerName, customer.customer || "");
    }
  }

  return Array.from(customerMap.entries()).map(([name, address]) => ({
    name,
    address,
  }));
}

export async function newInvoice(customerName?: string, customer?: string) {
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
      customerName: customerName || null,
      customer: customer || null,
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
