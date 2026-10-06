// Memetakan alias "@/..." (lihat tsconfig.json) supaya skrip Node bisa mengimpor kode TypeScript
// aplikasi langsung: node --import ./scratch/register-alias.mjs --env-file=.env.local scratch/<skrip>.mjs
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = path.join(root, specifier.slice(2));
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
