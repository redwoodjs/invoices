import { Layout } from "@/app/pages/Layout";
import { requestInfo } from "rwsdk/worker";

import { NewInvoiceButton } from "./components/NewInvoiceButton";
import { db } from "@/db/db";

import { link } from "@/app/shared/links";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

export type InvoiceItem = {
  description: string;
  price: number;
  quantity: number;
};

export type InvoiceTaxes = {
  description: string;
  amount: number;
};

async function getInvoiceListSummary(userId: string) {
  return await db
    .selectFrom("Invoice")
    .select(["id", "number", "date", "status", "customer"])
    .where("userId", "=", userId)
    .where("deletedAt", "is", null)
    .orderBy("date", "desc")
    .execute();
}

export async function InvoiceListPage() {
  const user = requestInfo.ctx.user!;
  const invoices = await getInvoiceListSummary(user.id);

  return (
    <Layout>
      <div className="space-y-2 py-4 flex justify-between items-center">
        <a
          href={link("/invoice/bin")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View Deleted Invoices
        </a>
        <NewInvoiceButton />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        {!invoices.length && <TableCaption>No invoices found</TableCaption>}
        <TableBody>
          {invoices &&
            invoices.map((i) => (
              <InvoiceListItem key={"invoice-" + i.id} {...i} />
            ))}
        </TableBody>
      </Table>
    </Layout>
  );
}

function InvoiceListItem(
  props: Awaited<ReturnType<typeof getInvoiceListSummary>>[0]
) {
  return (
    <TableRow>
      <TableCell>
        <a href={link("/invoice/:id", { id: props.id })}>{props.number}</a>
      </TableCell>
      <TableCell>
        {props.date
          ? new Date(props.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : ""}
      </TableCell>
      <TableCell>{props.customer ?? ""}</TableCell>
      <TableCell className="text-right">
        <a href={link("/invoice/:id", { id: props.id })}>Edit</a>
      </TableCell>
    </TableRow>
  );
}
