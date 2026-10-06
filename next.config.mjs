import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  // Template Siskopatuh dibaca dengan fs saat runtime; tanpa ini berkasnya
  // tidak ikut terbawa ke fungsi serverless saat deploy.
  outputFileTracingIncludes: {
    "/api/manifest/generate": ["./lib/manifest/templates/**"],
  },
};

export default nextConfig;
