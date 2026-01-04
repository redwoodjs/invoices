import type { RequestInfo } from "rwsdk/worker";

import { Layout } from "./layout";
import { InvoiceForm } from "./invoice/detail-page/invoice-form";

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
          customerName: "",
          customer: "",
          currency: "$",
          notesA: "",
          notesB: "",
          createdAt: new Date(),
          updatedAt: null,
        }}
        ctx={ctx}
      />
    </Layout>
  );
}
