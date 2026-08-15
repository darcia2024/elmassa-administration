import { getPool } from "@/lib/db/connection";

/**
 * Stok perlengkapan jamaah (koper, kain ihram, buku doa, …).
 *
 * `inventory_items` holds the catalogue; `inventory_movements` is the stock
 * ledger. Stock on hand is SUM(masuk) - SUM(keluar) computed on read — never a
 * stored balance, so the number on screen is always exactly what the movements
 * add up to and cannot silently drift.
 */

export const ITEM_CATEGORIES = [
  "Perlengkapan Jamaah",
  "Perlengkapan Pria",
  "Perlengkapan Wanita",
  "Dokumen & Cetakan",
  "Lainnya",
] as const;

export const MOVEMENT_TYPES = ["masuk", "keluar"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  minimumStock: number;
  unitCost: number;
  notes: string;
  stockIn: number;
  stockOut: number;
  stock: number;
  isLow: boolean;
  stockValue: number;
  createdAt: string;
};

export type InventoryMovement = {
  id: string;
  itemId: string;
  itemName: string;
  movementType: MovementType;
  quantity: number;
  packageId: string;
  packageName: string;
  notes: string;
  recordedBy: string;
  movedAt: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ITEM_SELECT = `
  i.id,
  i.sku,
  i.name,
  i.category,
  i.unit,
  i.minimum_stock AS "minimumStock",
  i.unit_cost     AS "unitCost",
  i.notes,
  i.created_at    AS "createdAt",
  COALESCE(mv.masuk, 0)::int  AS "stockIn",
  COALESCE(mv.keluar, 0)::int AS "stockOut"
`;

const ITEM_FROM = `
  FROM inventory_items i
  LEFT JOIN (
    SELECT item_id,
           SUM(quantity) FILTER (WHERE movement_type = 'masuk')::int  AS masuk,
           SUM(quantity) FILTER (WHERE movement_type = 'keluar')::int AS keluar
    FROM inventory_movements
    GROUP BY item_id
  ) mv ON mv.item_id = i.id
`;

function toItem(row: Record<string, unknown>): InventoryItem {
  const stockIn = Number(row.stockIn);
  const stockOut = Number(row.stockOut);
  const stock = stockIn - stockOut;
  const minimumStock = Number(row.minimumStock);
  const unitCost = Number(row.unitCost);

  return {
    ...(row as unknown as InventoryItem),
    stockIn,
    stockOut,
    stock,
    minimumStock,
    unitCost,
    isLow: stock <= minimumStock,
    stockValue: stock * unitCost,
  };
}

export async function listItems(): Promise<InventoryItem[]> {
  const res = await getPool().query(`SELECT ${ITEM_SELECT} ${ITEM_FROM} ORDER BY i.name ASC;`);
  return res.rows.map(toItem);
}

export async function findItem(id: string): Promise<InventoryItem | null> {
  if (!UUID_PATTERN.test(id)) return null;
  const res = await getPool().query(`SELECT ${ITEM_SELECT} ${ITEM_FROM} WHERE i.id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ? toItem(res.rows[0]) : null;
}

export async function createItem(input: {
  name: string;
  sku?: string;
  category?: string;
  unit?: string;
  minimumStock?: number;
  unitCost?: number;
  notes?: string;
}): Promise<InventoryItem> {
  const res = await getPool().query(
    `INSERT INTO inventory_items (sku, name, category, unit, minimum_stock, unit_cost, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id;`,
    [
      (input.sku ?? "").trim(),
      input.name.trim(),
      input.category ?? "Perlengkapan Jamaah",
      (input.unit ?? "pcs").trim(),
      Number(input.minimumStock) || 0,
      Number(input.unitCost) || 0,
      (input.notes ?? "").trim(),
    ],
  );
  return (await findItem(res.rows[0].id))!;
}

export async function updateItem(
  id: string,
  patch: {
    name?: string;
    sku?: string;
    category?: string;
    unit?: string;
    minimumStock?: number;
    unitCost?: number;
    notes?: string;
  },
): Promise<InventoryItem | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.name !== undefined) push("name", patch.name.trim());
  if (patch.sku !== undefined) push("sku", patch.sku.trim());
  if (patch.category !== undefined) push("category", patch.category);
  if (patch.unit !== undefined) push("unit", patch.unit.trim());
  if (patch.minimumStock !== undefined) push("minimum_stock", Number(patch.minimumStock) || 0);
  if (patch.unitCost !== undefined) push("unit_cost", Number(patch.unitCost) || 0);
  if (patch.notes !== undefined) push("notes", patch.notes.trim());

  if (sets.length === 0) return findItem(id);

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(`UPDATE inventory_items SET ${sets.join(", ")} WHERE id = $${values.length};`, values);
  if (res.rowCount === 0) return null;
  return findItem(id);
}

export async function deleteItem(id: string): Promise<boolean> {
  if (!UUID_PATTERN.test(id)) return false;
  // inventory_movements cascades, so the item's ledger goes with it.
  const res = await getPool().query(`DELETE FROM inventory_items WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function listMovements(itemId?: string): Promise<InventoryMovement[]> {
  const conditions = itemId && UUID_PATTERN.test(itemId) ? `WHERE m.item_id = $1` : "";
  const values = conditions ? [itemId] : [];

  const res = await getPool().query(
    `SELECT
       m.id,
       m.item_id        AS "itemId",
       i.name           AS "itemName",
       m.movement_type  AS "movementType",
       m.quantity,
       m.package_id     AS "packageId",
       COALESCE(pp.name, '') AS "packageName",
       m.notes,
       m.recorded_by    AS "recordedBy",
       TO_CHAR(m.moved_at, 'YYYY-MM-DD') AS "movedAt"
     FROM inventory_movements m
     JOIN inventory_items i ON i.id = m.item_id
     LEFT JOIN published_packages pp ON pp.id = m.package_id
     ${conditions}
     ORDER BY m.moved_at DESC, m.created_at DESC;`,
    values,
  );

  return res.rows.map((row) => ({ ...row, quantity: Number(row.quantity) }));
}

export type MovementResult =
  | { ok: true; item: InventoryItem }
  | { ok: false; error: string };

/**
 * Records a stock movement. An outgoing movement larger than what is on hand is
 * refused rather than allowed to push the balance negative — the whole point of
 * a stock card is that it reflects something physically countable.
 */
export async function createMovement(input: {
  itemId: string;
  movementType: MovementType;
  quantity: number;
  movedAt: string;
  packageId?: string;
  notes?: string;
  recordedBy?: string;
}): Promise<MovementResult> {
  const quantity = Number(input.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, error: "Jumlah harus bilangan bulat lebih dari 0" };
  }

  const item = await findItem(input.itemId);
  if (!item) return { ok: false, error: "Barang tidak ditemukan" };

  if (input.movementType === "keluar" && quantity > item.stock) {
    return {
      ok: false,
      error: `Stok ${item.name} tinggal ${item.stock} ${item.unit}, tidak bisa keluar ${quantity} ${item.unit}`,
    };
  }

  await getPool().query(
    `INSERT INTO inventory_movements (item_id, movement_type, quantity, package_id, notes, recorded_by, moved_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7);`,
    [
      input.itemId,
      input.movementType,
      quantity,
      (input.packageId ?? "").trim(),
      (input.notes ?? "").trim(),
      (input.recordedBy ?? "").trim(),
      input.movedAt,
    ],
  );

  return { ok: true, item: (await findItem(input.itemId))! };
}

export async function deleteMovement(id: string): Promise<boolean> {
  if (!UUID_PATTERN.test(id)) return false;
  const res = await getPool().query(`DELETE FROM inventory_movements WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
