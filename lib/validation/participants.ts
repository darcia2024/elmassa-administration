import type { ParticipantRow } from "@/lib/seed-data/bookings";

const documentStatuses = ["Lengkap", "Belum Lengkap"] as const;

type ParticipantValidationResult<T> =
  | {
      data: T;
      errors: null;
    }
  | {
      data: null;
      errors: string[];
    };

type ParticipantCreatePayload = Omit<ParticipantRow, "id" | "bookingId">;
type ParticipantPatchPayload = Partial<ParticipantCreatePayload>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRequiredString(value: unknown, field: string, errors: string[]) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    errors.push(`${field} wajib diisi`);
  }

  return normalized;
}

function normalizeOptionalString(value: unknown) {
  return value === undefined ? undefined : String(value).trim();
}

function normalizeDocumentStatus(value: unknown, errors: string[]) {
  if (value === undefined || value === null || value === "") {
    return "Belum Lengkap";
  }

  const normalized = String(value).trim();

  if (!documentStatuses.includes(normalized as (typeof documentStatuses)[number])) {
    errors.push(`documentStatus harus salah satu dari: ${documentStatuses.join(", ")}`);
  }

  return normalized;
}

function normalizeOptionalDocumentStatus(value: unknown, errors: string[]) {
  if (value === undefined) {
    return undefined;
  }

  return normalizeDocumentStatus(value, errors);
}

export function validateParticipantCreate(payload: unknown): ParticipantValidationResult<ParticipantCreatePayload> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return { data: null, errors: ["Payload harus berupa object"] };
  }

  const name = normalizeRequiredString(payload.name, "name", errors);
  const passportNumber = normalizeOptionalString(payload.passportNumber) ?? "";
  const contact = normalizeOptionalString(payload.contact) ?? "";
  const documentStatus = normalizeDocumentStatus(payload.documentStatus, errors);

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      name,
      passportNumber,
      contact,
      documentStatus,
    },
    errors: null,
  };
}

export function validateParticipantPatch(payload: unknown): ParticipantValidationResult<ParticipantPatchPayload> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return { data: null, errors: ["Payload harus berupa object"] };
  }

  const name = payload.name === undefined ? undefined : normalizeRequiredString(payload.name, "name", errors);
  const passportNumber = normalizeOptionalString(payload.passportNumber);
  const contact = normalizeOptionalString(payload.contact);
  const documentStatus = normalizeOptionalDocumentStatus(payload.documentStatus, errors);

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      name,
      passportNumber,
      contact,
      documentStatus,
    },
    errors: null,
  };
}
