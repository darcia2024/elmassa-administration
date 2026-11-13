import { getPosterImage } from "@/lib/katalog/store";

// Posters uploaded in the flyer tab live as base64 in the DB. The katalog
// links here with ?v=<content hash>, so each version of a poster is a
// different URL and can be cached by browsers and the CDN for a year: the
// database is read once per poster version, not once per visitor.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await getPosterImage(id).catch((err) => {
    console.error("Poster katalog gagal dibaca:", err);
    return null;
  });
  if (!image) return new Response("Poster tidak ditemukan", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: image.etag,
    },
  });
}
