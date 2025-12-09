"use server";

import { type RequestInfo } from "rwsdk/worker";
import { Layout } from "@/app/pages/Layout";
import { Invoice, InvoiceForm } from "./InvoiceForm";
import { db } from "@/db/db";
import {
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { link } from "@/app/shared/links";

export type InvoiceLabels = {
  invoiceNumber: string;
  invoiceDate: string;
  itemDescription: string;
  itemQuantity: string;
  itemPrice: string;
  total: string;
  subtotal: string;
};

export type InvoiceItem = {
  description: string;
  price: number;
  quantity: number;
};

export type InvoiceTaxes = {
  description: string;
  amount: number;
};

async function getInvoice(id: string, userId: string) {
  if (id === "new") {
    return {
      id: "new",
      title: "INVOICE",
      number: "1",
      items: [
        {
          description: "",
          quantity: 1,
          price: 1,
        },
      ],
      taxes: [],
      labels: {
        invoiceNumber: "",
        invoiceDate: "",
        itemDescription: "",
        itemQuantity: "",
        itemPrice: "",
        total: "",
        subtotal: "",
      },
      date: new Date(),
      status: "draft",
      userId,
      supplierName: "",
      supplierContact: "",
      supplierLogo: null,
      customer: "",
      customerName: "",
      currency: "$",
      notesA: "",
      notesB: "",
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };
  }

  const invoice = await db
    .selectFrom("Invoice")
    .selectAll()
    .where("id", "=", id)
    .where("userId", "=", userId)
    .executeTakeFirstOrThrow();

  // Helper function to safely parse JSON strings
  const safeParseJson = (value: unknown, defaultValue: any) => {
    if (typeof value === "string") {
      if (!value || value.trim() === "") {
        return defaultValue;
      }
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    }
    return value ?? defaultValue;
  };

  return {
    ...invoice,
    items: safeParseJson(invoice.items, []),
    taxes: safeParseJson(invoice.taxes, []),
    labels: safeParseJson(invoice.labels, {
      invoiceNumber: "",
      invoiceDate: "",
      itemDescription: "",
      itemQuantity: "",
      itemPrice: "",
      total: "",
      subtotal: "",
    }),
    date: invoice.date ? new Date(invoice.date) : new Date(),
    createdAt: invoice.createdAt ? new Date(invoice.createdAt) : new Date(),
    updatedAt: invoice.updatedAt ? new Date(invoice.updatedAt) : null,
    deletedAt: invoice.deletedAt || null,
  };
}

export async function InvoiceDetailPage({ params, ctx }: RequestInfo) {
  const invoice = await getInvoice(params.id, ctx.user!.id);

  return (
    <Layout>
      <BreadcrumbList>
        <BreadcrumbLink href={link("/invoice/list")}>Invoices</BreadcrumbLink>
        <BreadcrumbSeparator />

        <BreadcrumbPage>Edit Invoice</BreadcrumbPage>
      </BreadcrumbList>
      <InvoiceForm invoice={invoice as Invoice} ctx={ctx} />
    </Layout>
  );
}
