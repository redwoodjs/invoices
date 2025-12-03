import type { RequestInfo } from "rwsdk/worker";

import { Layout } from "./Layout";
import { InvoiceForm } from "./invoice/DetailPage/InvoiceForm";

export function HomePage({ ctx }: RequestInfo) {
  return (
    <Layout>
      <InvoiceForm
        invoice={{
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
          userId: ctx.user?.id ?? "",
          supplierName: "",
          supplierContact: "",
          supplierLogo: null,
          customer: null,
          currency: "$",
          notesA: "",
          notesB: "",
          createdAt: new Date(),
          updatedAt: null,
          deletedAt: null,
        }}
        ctx={ctx}
      />
    </Layout>
  );
}
