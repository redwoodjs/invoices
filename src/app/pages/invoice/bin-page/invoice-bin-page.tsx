import { Layout } from "@/app/pages/layout";
import { requestInfo } from "rwsdk/worker";

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

async function getDeletedInvoices(userId: string) {
  return await db
    .selectFrom("Invoice")
    .select(["id", "number", "date", "status", "customer", "deletedAt"])
    .where("userId", "=", userId)
    .where("deletedAt", "is not", null)
    .orderBy("deletedAt", "desc")
    .execute();
}

export async function InvoiceBinPage() {
  const user = requestInfo.ctx.user!;
  const invoices = await getDeletedInvoices(user.id);

  return (
    <Layout>
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Deleted Invoices</h1>
          <a
            href={link("/invoice/list")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to Invoices
          </a>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Deleted</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          {!invoices.length && (
            <TableCaption>No deleted invoices found</TableCaption>
          )}
          <TableBody>
            {invoices &&
              invoices.map((i) => (
                <InvoiceBinItem key={"invoice-" + i.id} {...i} />
              ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}

function InvoiceBinItem(
  props: Awaited<ReturnType<typeof getDeletedInvoices>>[0]
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
      <TableCell>
        {props.deletedAt
          ? new Date(props.deletedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </TableCell>
      <TableCell className="text-right">
        <a href={link("/invoice/:id", { id: props.id })}>View</a>
      </TableCell>
    </TableRow>
  );
}
