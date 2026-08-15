import { getPool } from "@/lib/db/connection";

/**
 * Data kepegawaian, stored in `employees`.
 *
 * Deliberately separate from `staff_users` (login accounts + RBAC role): a
 * driver or a muthawwif is an employee with no system account, and a system
 * account can belong to an owner who is not on payroll. Merging the two would
 * have forced every employee to get a login.
 */

export const EMPLOYMENT_STATUSES = ["Tetap", "Kontrak", "Harian", "Magang"] as const;
export const EMPLOYEE_STATUSES = ["Aktif", "Cuti", "Nonaktif"] as const;

export type EmployeeRecord = {
  id: string;
  employeeNumber: string;
  name: string;
  nik: string;
  position: string;
  division: string;
  joinDate: string | null;
  employmentStatus: string;
  salary: number;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: string;
  notes: string;
  createdAt: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SELECT_COLUMNS = `
  id,
  employee_number   AS "employeeNumber",
  name,
  nik,
  position,
  division,
  TO_CHAR(join_date, 'YYYY-MM-DD') AS "joinDate",
  employment_status AS "employmentStatus",
  salary,
  phone,
  email,
  address,
  emergency_contact AS "emergencyContact",
  emergency_phone   AS "emergencyPhone",
  status,
  notes,
  created_at        AS "createdAt"
`;

function toRecord(row: Record<string, unknown>): EmployeeRecord {
  return { ...(row as unknown as EmployeeRecord), salary: Number(row.salary) };
}

export async function listEmployees(): Promise<EmployeeRecord[]> {
  const res = await getPool().query(`SELECT ${SELECT_COLUMNS} FROM employees ORDER BY name ASC;`);
  return res.rows.map(toRecord);
}

export async function findEmployee(id: string): Promise<EmployeeRecord | null> {
  if (!UUID_PATTERN.test(id)) return null;
  const res = await getPool().query(`SELECT ${SELECT_COLUMNS} FROM employees WHERE id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ? toRecord(res.rows[0]) : null;
}

export async function createEmployee(input: {
  name: string;
  employeeNumber?: string;
  nik?: string;
  position?: string;
  division?: string;
  joinDate?: string | null;
  employmentStatus?: string;
  salary?: number;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  status?: string;
  notes?: string;
}): Promise<EmployeeRecord> {
  const res = await getPool().query(
    `INSERT INTO employees (
       employee_number, name, nik, position, division, join_date, employment_status,
       salary, phone, email, address, emergency_contact, emergency_phone, status, notes
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id;`,
    [
      (input.employeeNumber ?? "").trim(),
      input.name.trim(),
      (input.nik ?? "").trim(),
      (input.position ?? "").trim(),
      (input.division ?? "").trim(),
      input.joinDate || null,
      input.employmentStatus ?? "Kontrak",
      Number(input.salary) || 0,
      (input.phone ?? "").trim(),
      (input.email ?? "").trim(),
      (input.address ?? "").trim(),
      (input.emergencyContact ?? "").trim(),
      (input.emergencyPhone ?? "").trim(),
      input.status ?? "Aktif",
      (input.notes ?? "").trim(),
    ],
  );
  return (await findEmployee(res.rows[0].id))!;
}

export async function updateEmployee(
  id: string,
  patch: Partial<Omit<EmployeeRecord, "id" | "createdAt">>,
): Promise<EmployeeRecord | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.employeeNumber !== undefined) push("employee_number", patch.employeeNumber.trim());
  if (patch.name !== undefined) push("name", patch.name.trim());
  if (patch.nik !== undefined) push("nik", patch.nik.trim());
  if (patch.position !== undefined) push("position", patch.position.trim());
  if (patch.division !== undefined) push("division", patch.division.trim());
  if (patch.joinDate !== undefined) push("join_date", patch.joinDate || null);
  if (patch.employmentStatus !== undefined) push("employment_status", patch.employmentStatus);
  if (patch.salary !== undefined) push("salary", Number(patch.salary) || 0);
  if (patch.phone !== undefined) push("phone", patch.phone.trim());
  if (patch.email !== undefined) push("email", patch.email.trim());
  if (patch.address !== undefined) push("address", patch.address.trim());
  if (patch.emergencyContact !== undefined) push("emergency_contact", patch.emergencyContact.trim());
  if (patch.emergencyPhone !== undefined) push("emergency_phone", patch.emergencyPhone.trim());
  if (patch.status !== undefined) push("status", patch.status);
  if (patch.notes !== undefined) push("notes", patch.notes.trim());

  if (sets.length === 0) return findEmployee(id);

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(`UPDATE employees SET ${sets.join(", ")} WHERE id = $${values.length};`, values);
  if (res.rowCount === 0) return null;
  return findEmployee(id);
}

export async function deleteEmployee(id: string): Promise<boolean> {
  if (!UUID_PATTERN.test(id)) return false;
  const res = await getPool().query(`DELETE FROM employees WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
