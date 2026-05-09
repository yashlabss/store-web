#!/usr/bin/env node
/**
 * Creates store-web/.env.local when missing so `next dev` has localhost overrides.
 * Production relies on committed `.env` only (do not ship `.env.local`).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const localFile = path.join(root, ".env.local");

if (fs.existsSync(localFile)) {
  process.exit(0);
}

const body = `# Local development — overrides store-web/.env (gitignored).

NEXT_PUBLIC_APP_NAME=Mintlin DEV
NEXT_PUBLIC_API_BASE_URL=
BACKEND_URL=http://127.0.0.1:5000
NEXT_PUBLIC_STORE_BASE_URL=http://localhost:3000
`;

fs.writeFileSync(localFile, body, "utf8");
console.log(
  "Created store-web/.env.local with localhost defaults — edit if your API runs elsewhere."
);
