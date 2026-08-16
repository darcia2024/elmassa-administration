import { NextRequest, NextResponse } from "next/server";
import { listNotifications, markRead, markUnread } from "@/lib/notifications/store";

/**
 * proxy.ts sudah memverifikasi sesi dan menyuntikkan id staf ke header ini,
 * jadi route tidak perlu membaca cookie lagi. Kalau headernya tidak ada,
 * berarti request tidak lewat proxy -- tolak, jangan tebak siapa penggunanya.
 */
function userIdFrom(request: NextRequest): string | null {
  return request.headers.get("x-el-massa-user-id");
}

export async function GET(request: NextRequest) {
  const userId = userIdFrom(request);
  if (!userId) {
    return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
  }

  try {
    const data = await listNotifications(userId);

    return NextResponse.json(
      {
        data,
        meta: {
          total: data.length,
          unread: data.filter((n) => !n.read).length,
          kritis: data.filter((n) => n.severity === "kritis" && !n.read).length,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("Gagal menyusun notifikasi:", err);
    return NextResponse.json({ error: "Gagal memuat notifikasi" }, { status: 500 });
  }
}

/**
 * Menandai sudah/belum dibaca. Body: { keys: string[], read: boolean }.
 *
 * Notifikasinya sendiri tidak bisa "dihapus" -- ia cerminan keadaan data, jadi
 * satu-satunya cara menghilangkannya adalah membereskan penyebabnya (melunasi
 * tagihan, mengisi nomor visa). Tombol hapus-semua yang lama karena itu tidak
 * dipertahankan: ia memberi kesan pekerjaan selesai padahal tidak ada yang
 * berubah di lapangan.
 */
export async function PATCH(request: NextRequest) {
  const userId = userIdFrom(request);
  if (!userId) {
    return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
  }

  let body: { keys?: unknown; read?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON" }, { status: 400 });
  }

  const keys = Array.isArray(body.keys)
    ? body.keys.filter((k): k is string => typeof k === "string" && k.length > 0).slice(0, 500)
    : [];

  if (keys.length === 0) {
    return NextResponse.json({ error: "Tidak ada notifikasi yang dipilih", fields: { keys: "Wajib diisi" } }, { status: 400 });
  }

  try {
    if (body.read === false) {
      await markUnread(userId, keys);
    } else {
      await markRead(userId, keys);
    }

    return NextResponse.json({ data: { keys, read: body.read !== false } });
  } catch (err) {
    console.error("Gagal menyimpan status baca notifikasi:", err);
    return NextResponse.json({ error: "Gagal menyimpan status notifikasi" }, { status: 500 });
  }
}
