"use client";

import { useTransition } from "react";
import { Button } from "@/app/components/ui/button";

import { newInvoice } from "./functions";
import { link } from "@/app/shared/links";

export function NewInvoiceButton() {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    // @ts-expect-error https://react.dev/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-a-transition
    startTransition(async () => {
      const invoice = await newInvoice();
      startTransition(() => {
        window.location.href = link("/invoice/:id", { id: invoice.id });
      });
    });
  };

  return (
    <Button onClick={onClick} disabled={isPending}>
      New Invoice
    </Button>
  );
}
