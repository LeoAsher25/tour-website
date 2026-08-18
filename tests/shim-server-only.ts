// Test-only shim: the real `server-only` package throws when imported outside
// the Next.js server context. Tests import modules that guard with it, so we
// point tsx at this no-op during test runs (see tests/tsconfig.json).
export {};
