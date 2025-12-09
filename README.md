# Invoices: Billing Made Simple. Period.

Billable is personal invoicing software that allows a user to input information about their business entity, the client, and items, quanitities and prices. It calculates the total, and includes the ability to add tax.

<a href="./screenshot.png" target="_blank"><img src="./screenshot.png" alt="Screenshot" style="max-width: 640px;" /></a>

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/redwoodjs/example-billable.git)

## Features

- Upload logos
- Print to PDF
- User accounts via Passkey authentication
- Save invoices to Durable Objects

Built with RedwoodSDK.

## Installation

```bash
pnpm install
pnpm dev
```

## Infrastructure Configuration

This project uses [Alchemy](https://alchemy.run) to generate the `wrangler.jsonc` configuration file. Alchemy is used **only for configuration generation** - deployment and development still use the standard tools.

### Generating wrangler.jsonc

To regenerate the `wrangler.jsonc` file after making changes to infrastructure:

```bash
npm run generate:wrangler
```

This runs `alchemy.run.ts`, which:

- Defines the Cloudflare Worker, R2 bucket, and Durable Objects
- Generates `wrangler.jsonc` with the correct bindings and configuration
- Uses a transform function to adjust the generated config for production use

### How It Works

1. **`alchemy.run.ts`**: Defines the infrastructure resources (Worker, R2, Durable Objects) and uses `WranglerJson` to generate the config file
2. **`alchemy.dummy.ts`**: A minimal worker file used during config generation (not used in production)
3. The generated `wrangler.jsonc` is then used by Wrangler for deployment

### Important Notes

- **Development**: Still uses `pnpm dev` (Vite) - no changes to your workflow
- **Deployment**: Still uses `wrangler deploy` - Alchemy only generates the config
- **Config Updates**: When you modify infrastructure (add bindings, change resources), run `npm run generate:wrangler` to update `wrangler.jsonc`
- The Alchemy script uses temporary resource names (`billable-alchemy`) to avoid conflicts with production resources during generation
