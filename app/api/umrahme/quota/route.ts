import { NextResponse } from "next/server";
import { getQuota, listQuotaLedger } from "@/lib/umrahme/store";

/**
 * Saldo kuota lisensi UmrahMe milik travel ini.
 *
 * Read-only dengan sengaja. Kuota bertambah hanya lewat panel admin vendor
 * (license_topup) dan berkurang hanya saat akun diterbitkan (license_consume),
 * jadi sisi travel tidak punya jalan untuk menaikkan saldonya sendiri --
 * persis kelemahan versi localStorage yang digantikan ini.
 */
export async function GET() {
  try {
    const [quota, ledger] = await Promise.all([getQuota(), listQuotaLedger(30)]);

    return NextResponse.json(
      { ok: true, data: { ...quota, ledger } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
