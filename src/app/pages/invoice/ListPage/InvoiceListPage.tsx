import { Layout } from "@/app/pages/Layout";
import { requestInfo, type RequestInfo } from "rwsdk/worker";

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
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

export type InvoiceItem = {
  description: string;
  price: number;
  quantity: number;
};

export type InvoiceTaxes = {
  description: string;
  amount: number;
};

async function getInvoiceListSummary(userId: string, customer?: string | null) {
  let query = db
    .selectFrom("Invoice")
    .select(["id", "number", "date", "status", "customer"])
    .where("userId", "=", userId)
    .where("deletedAt", "is", null);

  if (customer) {
    query = query.where("customer", "like", `%${customer}%`);
  }

  return await query.orderBy("date", "desc").execute();
}

export async function InvoiceListPage({ request }: RequestInfo) {
  const user = requestInfo.ctx.user!;
  const url = new URL(request.url);
  const customerFilter = url.searchParams.get("customer") ?? "";
  const invoices = await getInvoiceListSummary(user.id, customerFilter || null);

  return (
    <Layout>
      <div className="space-y-2 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <a
            href={link("/invoice/bin")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View Deleted Invoices
          </a>
          <form
            method="GET"
            action={link("/invoice/list")}
            className="flex items-center gap-2"
          >
            <Input
              type="text"
              name="customer"
              placeholder="Filter by customer"
              defaultValue={customerFilter}
              className="w-48 sm:w-64"
            />
            <Button type="submit" variant="outline" size="sm">
              Filter
            </Button>
            {customerFilter && (
              <a
                href={link("/invoice/list")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </a>
            )}
          </form>
        </div>
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
