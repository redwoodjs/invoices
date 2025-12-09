"use client";

import { useState, useTransition } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";

import { newInvoice, getCustomerNames } from "./functions";

export function NewInvoiceButton() {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<
    Array<{ name: string; address: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadCustomers = async () => {
    const customerList = await getCustomerNames();
    setCustomers(customerList);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      loadCustomers();
    } else {
      setSearchTerm("");
    }
  };

  const createInvoice = async (customerName?: string, customer?: string) => {
    // @ts-expect-error https://react.dev/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-a-transition
    startTransition(async () => {
      const invoice = await newInvoice(customerName, customer);
      setDialogOpen(false);
      startTransition(() => {
        window.location.href = `/invoice/${invoice.id}`;
      });
    });
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isPending}>New Invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Select an existing customer or create a new invoice without a
            customer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {customers.length > 0 && (
            <>
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.name}
                      onClick={() =>
                        createInvoice(customer.name, customer.address)
                      }
                      className="w-full text-left p-3 border rounded-md hover:bg-accent transition-colors"
                      disabled={isPending}
                    >
                      <div className="font-semibold">{customer.name}</div>
                      {customer.address && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {customer.address.split("\n")[0]}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No customers found
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={() => createInvoice()} disabled={isPending}>
            New Invoice (No Customer)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
