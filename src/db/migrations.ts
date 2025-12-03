import { type Migrations } from "rwsdk/db";

export const migrations = {
  "001_initial_schema": {
    async up(db) {
      return [
        await db.schema
          .createTable("User")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("email", "text", (col) => col.notNull().unique())
          .addColumn("authToken", "text")
          .addColumn("authTokenExpiresAt", "text")
          .addColumn("createdAt", "text", (col) => col.notNull())
          .addColumn("updatedAt", "text")
          .execute(),
      ];
    },

    async down(db) {
      await db.schema.dropTable("User").ifExists().execute();
    },
  },

  "002_add_credential_table": {
    async up(db) {
      return [
        await db.schema
          .createTable("Credential")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("userId", "text", (col) => col.notNull().unique())
          .addColumn("credentialId", "text", (col) => col.notNull().unique())
          .addColumn("publicKey", "blob", (col) => col.notNull())
          .addColumn("counter", "integer", (col) => col.notNull().defaultTo(0))
          .addColumn("createdAt", "text", (col) => col.notNull())
          .addForeignKeyConstraint(
            "Credential_userId_fkey",
            ["userId"],
            "User",
            ["id"]
          )
          .execute(),
      ];
    },

    async down(db) {
      await db.schema.dropTable("Credential").ifExists().execute();
    },
  },

  "003_add_invoice_table": {
    async up(db) {
      return [
        await db.schema
          .createTable("Invoice")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("title", "text", (col) =>
            col.notNull().defaultTo("invoice")
          )
          .addColumn("userId", "text", (col) => col.notNull())
          .addColumn("number", "text", (col) => col.notNull())
          .addColumn("date", "text", (col) => col.notNull())
          .addColumn("status", "text", (col) =>
            col.notNull().defaultTo("draft")
          )
          .addColumn("supplierLogo", "text")
          .addColumn("supplierName", "text")
          .addColumn("supplierContact", "text")
          .addColumn("customer", "text")
          .addColumn("notesA", "text")
          .addColumn("notesB", "text")
          .addColumn("items", "text", (col) => col.notNull().defaultTo("[]"))
          .addColumn("taxes", "text", (col) => col.notNull().defaultTo("[]"))
          .addColumn("labels", "text", (col) =>
            col
              .notNull()
              .defaultTo(
                '{"invoiceNumber":"Invoice #","invoiceDate":"Date","itemDescription":"Description","itemQuantity":"Quantity","itemPrice":"Price","subtotal":"Subtotal","total":"Total"}'
              )
          )
          .addColumn("currency", "text", (col) => col.notNull().defaultTo("$"))
          .addColumn("createdAt", "text", (col) => col.notNull())
          .addColumn("updatedAt", "text")
          .addForeignKeyConstraint("Invoice_userId_fkey", ["userId"], "User", [
            "id",
          ])
          .addUniqueConstraint("Invoice_userId_number_key", [
            "userId",
            "number",
          ])
          .execute(),
      ];
    },

    async down(db) {
      await db.schema.dropTable("Invoice").ifExists().execute();
    },
  },

  "004_add_deleted_at_to_invoice": {
    async up(db) {
      return [
        await db.schema
          .alterTable("Invoice")
          .addColumn("deletedAt", "text")
          .execute(),
      ];
    },

    async down(db) {
      return [
        await db.schema.alterTable("Invoice").dropColumn("deletedAt").execute(),
      ];
    },
  },

  "005_split_customer_field": {
    async up(db) {
      // Add new columns
      await db.schema
        .alterTable("Invoice")
        .addColumn("customerName", "text")
        .addColumn("customerDetails", "text")
        .execute();

      // Migrate existing data: split by first newline
      const invoices = await db
        .selectFrom("Invoice")
        .select(["id", "customer"])
        .execute();

      for (const invoice of invoices) {
        if (invoice.customer) {
          const lines = invoice.customer.split("\n");
          const customerName = lines[0] || "";
          const customerDetails = lines.slice(1).join("\n") || null;

          await db
            .updateTable("Invoice")
            .set({ customerName, customerDetails })
            .where("id", "=", invoice.id)
            .execute();
        }
      }

      // Drop old customer column
      await db.schema
        .alterTable("Invoice")
        .dropColumn("customer")
        .execute();
    },

    async down(db) {
      // Re-add customer column
      await db.schema
        .alterTable("Invoice")
        .addColumn("customer", "text")
        .execute();

      // Migrate data back
      const invoices = await db
        .selectFrom("Invoice")
        .select(["id", "customerName", "customerDetails"])
        .execute();

      for (const invoice of invoices) {
        const customer = [invoice.customerName, invoice.customerDetails]
          .filter(Boolean)
          .join("\n");

        await db
          .updateTable("Invoice")
          .set({ customer })
          .where("id", "=", invoice.id)
          .execute();
      }

      // Drop new columns
      await db.schema
        .alterTable("Invoice")
        .dropColumn("customerName")
        .dropColumn("customerDetails")
        .execute();
    },
  },
} satisfies Migrations;
