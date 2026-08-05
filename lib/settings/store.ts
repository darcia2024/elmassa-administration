import { getPool } from "@/lib/db/connection";

/**
 * Company identity and bank accounts — the details printed on invoices and
 * receipts. These used to be constants in the page files, so editing them meant
 * a code change and a redeploy.
 */

export type CompanyIdentity = {
  id: string;
  name: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  documentFooter: string;
  kemenkumham: string;
  ppiu: string;
  gmapsUrl: string;
};

export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  isPrimary: boolean;
  status: string;
  notes: string;
};

const IDENTITY_COLUMNS = `
  id, name,
  legal_name as "legalName",
  address, phone, email, website,
  logo_url as "logoUrl",
  document_footer as "documentFooter",
  COALESCE(kemenkumham, '') as kemenkumham,
  COALESCE(ppiu, '') as ppiu,
  COALESCE(gmaps_url, '') as "gmapsUrl"
`;

const ACCOUNT_COLUMNS = `
  id,
  bank_name as "bankName",
  account_number as "accountNumber",
  account_name as "accountName",
  branch,
  is_primary as "isPrimary",
  status,
  notes
`;

// The legally required registration numbers had no home in the migrated schema.
const DEFAULT_IDENTITY = {
  name: "El Massa Tour & Travel",
  legalName: "PT. AL MASSA AZKA WISATA",
  address:
    "Komplek Ruko Best Cinema, Jln. Gabek Raya, Selindung Baru, Kec. Gabek, Kota Pangkal Pinang, Bangka Belitung",
  phone: "081249476778",
  email: "elmassatour@gmail.com",
  website: "www.elmassatour.com",
  documentFooter:
    "Terima kasih telah mempercayakan perjalanan ibadah Anda kepada PT. AL MASSA AZKA WISATA (El Massa Tour). SK Kemenkumham: AHU-0112355.AH.01.01. • No. Izin PPIU: 10032300465890002.",
  kemenkumham: "AHU-0112355.AH.01.01.",
  ppiu: "10032300465890002",
  gmapsUrl:
    "https://maps.google.com/?q=Komplek+Ruko+Best+Cinema+Jln+Gabek+Raya+Selindung+Baru+Pangkalpinang",
};

let ready = false;

async function ensureTables() {
  if (ready) return;

  await getPool().query(`
    ALTER TABLE company_identity ADD COLUMN IF NOT EXISTS kemenkumham TEXT DEFAULT '';
    ALTER TABLE company_identity ADD COLUMN IF NOT EXISTS ppiu TEXT DEFAULT '';
    ALTER TABLE company_identity ADD COLUMN IF NOT EXISTS gmaps_url TEXT DEFAULT '';
  `);

  // Seed once with the details the pages used to hardcode, so documents keep
  // printing the real company data instead of going blank.
  const existing = await getPool().query(`SELECT COUNT(*)::int AS n FROM company_identity;`);

  if (existing.rows[0]?.n === 0) {
    await getPool().query(
      `INSERT INTO company_identity
         (name, legal_name, address, phone, email, website, document_footer, kemenkumham, ppiu, gmaps_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [
        DEFAULT_IDENTITY.name,
        DEFAULT_IDENTITY.legalName,
        DEFAULT_IDENTITY.address,
        DEFAULT_IDENTITY.phone,
        DEFAULT_IDENTITY.email,
        DEFAULT_IDENTITY.website,
        DEFAULT_IDENTITY.documentFooter,
        DEFAULT_IDENTITY.kemenkumham,
        DEFAULT_IDENTITY.ppiu,
        DEFAULT_IDENTITY.gmapsUrl,
      ],
    );
  }

  ready = true;
}

export async function getCompanyIdentity(): Promise<CompanyIdentity> {
  await ensureTables();
  const res = await getPool().query(
    `SELECT ${IDENTITY_COLUMNS} FROM company_identity ORDER BY created_at ASC LIMIT 1;`,
  );
  return res.rows[0];
}

export async function updateCompanyIdentity(patch: Partial<CompanyIdentity>): Promise<CompanyIdentity> {
  const current = await getCompanyIdentity();

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.name !== undefined) push("name", patch.name);
  if (patch.legalName !== undefined) push("legal_name", patch.legalName);
  if (patch.address !== undefined) push("address", patch.address);
  if (patch.phone !== undefined) push("phone", patch.phone);
  if (patch.email !== undefined) push("email", patch.email);
  if (patch.website !== undefined) push("website", patch.website);
  if (patch.logoUrl !== undefined) push("logo_url", patch.logoUrl);
  if (patch.documentFooter !== undefined) push("document_footer", patch.documentFooter);
  if (patch.kemenkumham !== undefined) push("kemenkumham", patch.kemenkumham);
  if (patch.ppiu !== undefined) push("ppiu", patch.ppiu);
  if (patch.gmapsUrl !== undefined) push("gmaps_url", patch.gmapsUrl);

  if (sets.length === 0) return current;

  sets.push("updated_at = NOW()");
  values.push(current.id);

  await getPool().query(`UPDATE company_identity SET ${sets.join(", ")} WHERE id = $${values.length};`, values);

  return getCompanyIdentity();
}

export async function listBankAccounts(): Promise<BankAccount[]> {
  await ensureTables();
  const res = await getPool().query(
    `SELECT ${ACCOUNT_COLUMNS} FROM bank_accounts ORDER BY is_primary DESC, created_at ASC;`,
  );
  return res.rows;
}

/** Exactly one account can be primary — it is the one printed on invoices. */
async function clearOtherPrimaries(keepId?: string) {
  await getPool().query(
    `UPDATE bank_accounts SET is_primary = false WHERE ($1::uuid IS NULL OR id <> $1::uuid);`,
    [keepId ?? null],
  );
}

export async function createBankAccount(input: {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch?: string;
  isPrimary?: boolean;
  status?: string;
  notes?: string;
}): Promise<BankAccount> {
  await ensureTables();

  const res = await getPool().query(
    `INSERT INTO bank_accounts (bank_name, account_number, account_name, branch, is_primary, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${ACCOUNT_COLUMNS};`,
    [
      input.bankName.trim(),
      input.accountNumber.trim(),
      input.accountName.trim(),
      input.branch?.trim() || "",
      Boolean(input.isPrimary),
      input.status || "Aktif",
      input.notes?.trim() || "",
    ],
  );

  if (res.rows[0].isPrimary) await clearOtherPrimaries(res.rows[0].id);

  return res.rows[0];
}

export async function updateBankAccount(
  id: string,
  patch: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    branch?: string;
    isPrimary?: boolean;
    status?: string;
    notes?: string;
  },
): Promise<BankAccount | null> {
  await ensureTables();

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.bankName !== undefined) push("bank_name", patch.bankName.trim());
  if (patch.accountNumber !== undefined) push("account_number", patch.accountNumber.trim());
  if (patch.accountName !== undefined) push("account_name", patch.accountName.trim());
  if (patch.branch !== undefined) push("branch", patch.branch.trim());
  if (patch.isPrimary !== undefined) push("is_primary", Boolean(patch.isPrimary));
  if (patch.status !== undefined) push("status", patch.status);
  if (patch.notes !== undefined) push("notes", patch.notes.trim());

  if (sets.length === 0) return null;

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(
    `UPDATE bank_accounts SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING ${ACCOUNT_COLUMNS};`,
    values,
  );

  if (res.rowCount === 0) return null;
  if (res.rows[0].isPrimary) await clearOtherPrimaries(id);

  return res.rows[0];
}

/**
 * Documents print whichever account is_primary — deleting that one without
 * promoting another leaves nothing for them to print at all.
 */
export async function deleteBankAccount(id: string): Promise<boolean> {
  await ensureTables();

  const deleted = await getPool().query(
    `DELETE FROM bank_accounts WHERE id = $1 RETURNING is_primary AS "wasPrimary";`,
    [id],
  );
  if (deleted.rowCount === 0) return false;

  if (deleted.rows[0].wasPrimary) {
    await getPool().query(`
      UPDATE bank_accounts SET is_primary = true
      WHERE id = (
        SELECT id FROM bank_accounts
        WHERE status = 'Aktif'
        ORDER BY created_at ASC
        LIMIT 1
      );
    `);
  }

  return true;
}
