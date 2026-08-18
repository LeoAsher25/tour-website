// Script-only shim: the real `server-only` package throws outside Next.js
// server context. Scripts (seed, migrations) import modules that guard with
// it, so we point tsx at this no-op via scripts/tsconfig.json.
export {};
