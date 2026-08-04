import { getPool } from "@/lib/db/connection";

/**
 * Reference lists: the service types sold, and the booking statuses used across
 * the transaction flow.
 *
 * The booking statuses are seeded to match what the code actually produces —
 * see derivePaymentStatus in lib/bookings/store.ts. A settings page listing
 * statuses the system never assigns is worse than no page at all.
 */

export type ServiceType = {
  id: string;
  name: string;
  category: string;
  defaultDuration: string;
  documentTemplate: string;
  status: string;
  notes: string;
};

export type BookingStatus = {
  id: string;
  name: string;
  stage: string;
  description: string;
  paymentImpact: string;
  documentImpact: string;
  owner: string;
  status: string;
  sortOrder: number;
};

const SERVICE_COLUMNS = `
  id, name, category,
  default_duration as "defaultDuration",
  document_template as "documentTemplate",
  status, notes
`;

const STATUS_COLUMNS = `
  id, name, stage, description,
  payment_impact as "paymentImpact",
  document_impact as "documentImpact",
  owner_role as "owner",
  mode as "status",
  sort_order as "sortOrder"
`;

const SEED_STATUSES = [
  ["Prospek", "Pra-booking", "Pelanggan baru masuk pipeline, belum ada jadwal atau tagihan final.", "Belum ditagih", "Belum diminta", "Sales", "Aktif", 1],
  ["Belum Bayar", "Booking", "Booking tercatat, belum ada pembayaran masuk sama sekali.", "Tagihan penuh terbuka", "Invoice terbit", "Admin Operasional", "Aktif", 2],
  ["DP", "Booking", "Sebagian pembayaran sudah masuk, masih ada sisa tagihan.", "Sisa tagihan berjalan", "Kuitansi per setoran", "Keuangan", "Aktif", 3],
  ["Lunas", "Pelunasan", "Seluruh tagihan sudah dibayar penuh.", "Tidak ada sisa", "Kuitansi pelunasan", "Keuangan", "Aktif", 4],
  ["Dibatalkan", "Penutupan", "Booking dibatalkan sebelum keberangkatan.", "Tagihan dihentikan", "Dokumen ditarik", "Admin Operasional", "Manual", 5],
  ["Refund", "Penutupan", "Dana jamaah dikembalikan sesuai ketentuan pembatalan.", "Pengembalian dana", "Bukti refund", "Keuangan", "Manual", 6],
] as const;

let ready = false;

async function ensureSeeded() {
  if (ready) return;

  const statusCount = await getPool().query(`SELECT COUNT(*)::int AS n FROM booking_statuses;`);

  if (statusCount.rows[0]?.n === 0) {
    for (const row of SEED_STATUSES) {
      await getPool().query(
        `INSERT INTO booking_statuses
           (name, stage, description, payment_impact, document_impact, owner_role, mode, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        row as unknown as unknown[],
      );
    }
  }

  ready = true;
}

export async function listBookingStatuses(): Promise<BookingStatus[]> {
  await ensureSeeded();
  const res = await getPool().query(
    `SELECT ${STATUS_COLUMNS} FROM booking_statuses ORDER BY sort_order ASC, created_at ASC;`,
  );
  return res.rows;
}

export async function listServiceTypes(): Promise<ServiceType[]> {
  const res = await getPool().query(
    `SELECT ${SERVICE_COLUMNS} FROM service_types ORDER BY created_at ASC;`,
  );
  return res.rows;
}

export async function createServiceType(input: {
  name: string;
  category?: string;
  defaultDuration?: string;
  documentTemplate?: string;
  status?: string;
  notes?: string;
}): Promise<ServiceType> {
  const res = await getPool().query(
    `INSERT INTO service_types (name, category, default_duration, document_template, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${SERVICE_COLUMNS};`,
    [
      input.name.trim(),
      input.category || "Wisata",
      input.defaultDuration?.trim() || "",
      input.documentTemplate?.trim() || "",
      input.status || "Aktif",
      input.notes?.trim() || "",
    ],
  );

  return res.rows[0];
}

export async function updateServiceType(
  id: string,
  patch: {
    name?: string;
    category?: string;
    defaultDuration?: string;
    documentTemplate?: string;
    status?: string;
    notes?: string;
  },
): Promise<ServiceType | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.name !== undefined) push("name", patch.name.trim());
  if (patch.category !== undefined) push("category", patch.category);
  if (patch.defaultDuration !== undefined) push("default_duration", patch.defaultDuration.trim());
  if (patch.documentTemplate !== undefined) push("document_template", patch.documentTemplate.trim());
  if (patch.status !== undefined) push("status", patch.status);
  if (patch.notes !== undefined) push("notes", patch.notes.trim());

  if (sets.length === 0) return null;

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(
    `UPDATE service_types SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING ${SERVICE_COLUMNS};`,
    values,
  );

  return res.rows[0] ?? null;
}

export async function deleteServiceType(id: string): Promise<boolean> {
  const res = await getPool().query(`DELETE FROM service_types WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
