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
  // Katalog posters: let browsers and the CDN keep them for a day instead of
  // re-checking on every visit. A replaced poster ships under a new file name
  // or (for uploads) a new ?v= hash, so a day-old copy is never wrong for long.
  async headers() {
    return [
      {
        source: "/poster-katalog/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
