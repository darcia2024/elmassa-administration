export type LetterTypeId =
  | "pemberitahuan"
  | "paspor-baru"
  | "paspor-tambah-nama"
  | "paspor-ganti"
  | "izin-cuti";

export type LetterTypeDef = {
  id: LetterTypeId;
  label: string;
  shortLabel: string;
  code: string;
  subject: string;
  recipient: string;
  description: string;
  requires: Array<"passportNumber" | "birthPlace" | "birthDate" | "address" | "employer" | "leaveDates">;
};

export type LetterRecord = {
  id: string;
  letterNumber: string;
  letterType: LetterTypeId;
  letterTypeLabel: string;
  recipientName: string;
  recipientNik: string;
  passportNumber: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  bookingCode: string;
  packageId: string;
  packageName: string;
  departureDate: string;
  subject: string;
  body: string;
  extra: Record<string, unknown>;
  issuedDate: string;
  issuedBy: string;
  status: string;
  createdAt: string;
  /** Filled in by the page from the type definition — not stored per letter. */
  recipientTo: string;
};

export type LetterCandidate = {
  name: string;
  nik: string;
  passportNumber: string;
  bookingCode: string;
  packageId: string;
  packageName: string;
  departureDate: string;
  phone: string;
};

export function formatDateID(iso: string | null | undefined): string {
  if (!iso) return "—";
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(iso);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const [, year, month, day] = match;
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}
