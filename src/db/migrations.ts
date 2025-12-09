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

  "005_add_customer_name_column": {
    async up(db) {
      const results = [
        await db.schema
          .alterTable("Invoice")
          .addColumn("customerName", "text")
          .execute(),
      ];

      // Populate existing records by extracting first line from customer field
      const invoices = await db
        .selectFrom("Invoice")
        .select(["id", "customer"])
        .where("customer", "is not", null)
        .where("customer", "!=", "")
        .execute();

      for (const invoice of invoices) {
        if (invoice.customer) {
          const firstLine = invoice.customer.split("\n")[0] || invoice.customer;
          await db
            .updateTable("Invoice")
            .set({ customerName: firstLine })
            .where("id", "=", invoice.id)
            .execute();
        }
      }

      return results;
    },

    async down(db) {
      return [
        await db.schema
          .alterTable("Invoice")
          .dropColumn("customerName")
          .execute(),
      ];
    },
  },
} satisfies Migrations;
