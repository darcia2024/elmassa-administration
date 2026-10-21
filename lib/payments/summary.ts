import { getPool } from "@/lib/db/connection";

export type PaymentSummaryStats = {
  totalBookings: number;
  totalPax: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  countLunas: number;
  count50: number;
  countDp: number;
  countBelumBayar: number;
  jamaahLunas: number;
  jamaah50: number;
  jamaahDp: number;
  jamaahBelumBayar: number;
};

export type JamaahPaymentStatus = {
  status: "Lunas" | "Sudah 50%" | "DP" | "Belum Bayar";
  paidAmount: number;
  totalAmount: number;
  remainingAmount: number;
  percentPaid: number;
  bookingCode: string;
  packageName: string;
};

export type PaymentSummaryResponse = {
  meta: PaymentSummaryStats;
  global: PaymentSummaryStats;
  byPackageName: Record<string, PaymentSummaryStats>;
  byPackageId: Record<string, PaymentSummaryStats>;
  byJamaahId: Record<string, JamaahPaymentStatus>;
};

function emptyStats(): PaymentSummaryStats {
  return {
    totalBookings: 0,
    totalPax: 0,
    totalBilled: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    countLunas: 0,
    count50: 0,
    countDp: 0,
    countBelumBayar: 0,
    jamaahLunas: 0,
    jamaah50: 0,
    jamaahDp: 0,
    jamaahBelumBayar: 0,
  };
}

export function resolveBookingPaymentStatus(
  total: number,
  paid: number,
  remaining: number,
): "Lunas" | "Sudah 50%" | "DP" | "Belum Bayar" {
  if ((total > 0 && paid >= total) || (paid > 0 && remaining <= 0)) return "Lunas";
  if (total > 0 && paid >= total * 0.5) return "Sudah 50%";
  if (paid > 0) return "DP";
  return "Belum Bayar";
}

export async function getPaymentSummary(opts?: {
  packageId?: string | null;
  group?: string | null;
}): Promise<PaymentSummaryResponse> {
  const pool = getPool();

  const query = `
    SELECT
      b.code AS "bookingCode",
      b.package_id AS "packageId",
      b.package_name AS "packageName",
      b.customer_name AS "customerName",
      COALESCE(b.participants, 1) AS "participants",
      COALESCE(b.total_amount, 0) AS "totalAmount",
      COALESCE(b.paid_amount, 0) AS "paidAmount",
      COALESCE(b.remaining_amount, 0) AS "remainingAmount",
      b.status,
      COALESCE(ARRAY_AGG(pa.jamaah_id) FILTER (WHERE pa.jamaah_id IS NOT NULL), '{}') AS "jamaahIds"
    FROM real_bookings b
    LEFT JOIN participants pa ON pa.booking_code = b.code
    GROUP BY b.code, b.package_id, b.package_name, b.customer_name, b.participants, b.total_amount, b.paid_amount, b.remaining_amount, b.status
    ORDER BY b.created_at ASC;
  `;

  const res = await pool.query(query);
  const allRows = res.rows;

  const globalStats = emptyStats();
  const byPackageName: Record<string, PaymentSummaryStats> = {};
  const byPackageId: Record<string, PaymentSummaryStats> = {};
  const byJamaahId: Record<string, JamaahPaymentStatus> = {};

  for (const r of allRows) {
    const total = Number(r.totalAmount) || 0;
    const paid = Number(r.paidAmount) || 0;
    const remaining = Math.max(total - paid, 0);
    const pax = Number(r.participants) || 1;
    const status = resolveBookingPaymentStatus(total, paid, remaining);
    const percentPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

    // Update globalStats
    globalStats.totalBookings += 1;
    globalStats.totalPax += pax;
    globalStats.totalBilled += total;
    globalStats.totalPaid += paid;
    globalStats.totalOutstanding += remaining;

    if (status === "Lunas") {
      globalStats.countLunas += 1;
      globalStats.jamaahLunas += pax;
    } else if (status === "Sudah 50%") {
      globalStats.count50 += 1;
      globalStats.jamaah50 += pax;
    } else if (status === "DP") {
      globalStats.countDp += 1;
      globalStats.jamaahDp += pax;
    } else {
      globalStats.countBelumBayar += 1;
      globalStats.jamaahBelumBayar += pax;
    }

    // Group keys
    const pkgName = String(r.packageName || "").trim();
    const pkgNameKey = pkgName.toLowerCase();
    const pkgId = String(r.packageId || "").trim();

    // By Package Name
    if (pkgName) {
      if (!byPackageName[pkgName]) byPackageName[pkgName] = emptyStats();
      if (!byPackageName[pkgNameKey]) byPackageName[pkgNameKey] = byPackageName[pkgName];

      const s = byPackageName[pkgName];
      s.totalBookings += 1;
      s.totalPax += pax;
      s.totalBilled += total;
      s.totalPaid += paid;
      s.totalOutstanding += remaining;

      if (status === "Lunas") {
        s.countLunas += 1;
        s.jamaahLunas += pax;
      } else if (status === "Sudah 50%") {
        s.count50 += 1;
        s.jamaah50 += pax;
      } else if (status === "DP") {
        s.countDp += 1;
        s.jamaahDp += pax;
      } else {
        s.countBelumBayar += 1;
        s.jamaahBelumBayar += pax;
      }
    }

    // By Package ID
    if (pkgId) {
      if (!byPackageId[pkgId]) byPackageId[pkgId] = emptyStats();
      const s = byPackageId[pkgId];
      s.totalBookings += 1;
      s.totalPax += pax;
      s.totalBilled += total;
      s.totalPaid += paid;
      s.totalOutstanding += remaining;

      if (status === "Lunas") {
        s.countLunas += 1;
        s.jamaahLunas += pax;
      } else if (status === "Sudah 50%") {
        s.count50 += 1;
        s.jamaah50 += pax;
      } else if (status === "DP") {
        s.countDp += 1;
        s.jamaahDp += pax;
      } else {
        s.countBelumBayar += 1;
        s.jamaahBelumBayar += pax;
      }
    }

    // By Jamaah IDs
    const jamaahIds = (r.jamaahIds || []) as string[];
    for (const jId of jamaahIds) {
      byJamaahId[jId] = {
        status,
        paidAmount: paid,
        totalAmount: total,
        remainingAmount: remaining,
        percentPaid,
        bookingCode: r.bookingCode,
        packageName: pkgName,
      };
    }
  }

  // Determine scoped stats if query param provided
  let scopedStats = globalStats;
  if (opts?.packageId && byPackageId[opts.packageId]) {
    scopedStats = byPackageId[opts.packageId];
  } else if (opts?.group) {
    const groupFilter = opts.group.trim().toLowerCase();
    const key = Object.keys(byPackageName).find(
      (k) =>
        k.toLowerCase() === groupFilter ||
        groupFilter.includes(k.toLowerCase()) ||
        k.toLowerCase().includes(groupFilter),
    );
    if (key && byPackageName[key]) {
      scopedStats = byPackageName[key];
    }
  }

  return {
    meta: scopedStats,
    global: globalStats,
    byPackageName,
    byPackageId,
    byJamaahId,
  };
}
