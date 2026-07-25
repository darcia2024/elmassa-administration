import type { ScheduleRow } from "@/lib/seed-data/schedules";

const scheduleStatuses = ["Terjadwal", "Berangkat", "Selesai"] as const;

type SchedulePayload = Record<string, unknown>;

type ScheduleValidationResult<T> =
  | {
      data: T;
      errors: null;
    }
  | {
      data: null;
      errors: string[];
    };

type ScheduleCreatePayload = Omit<ScheduleRow, "id">;
type ScheduleGlobalPatchPayload = Partial<Omit<ScheduleRow, "id">>;
type SchedulePackagePatchPayload = Partial<Omit<ScheduleRow, "id" | "packageId">>;

function isRecord(value: unknown): value is SchedulePayload {
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

function normalizeRequiredNumber(value: unknown, field: string, errors: string[]) {
  const normalized = typeof value === "string" && value.trim() === "" ? NaN : Number(value);

  if (!Number.isFinite(normalized) || normalized <= 0) {
    errors.push(`${field} harus berupa angka lebih dari 0`);
  }

  return normalized;
}

function normalizeOptionalNumber(value: unknown, field: string, errors: string[]) {
  if (value === undefined) {
    return undefined;
  }

  return normalizeRequiredNumber(value, field, errors);
}

function validateQuota(value: number | undefined, field: string, errors: string[]) {
  if (value !== undefined && !Number.isInteger(value)) {
    errors.push(`${field} harus berupa bilangan bulat`);
  }
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateDate(value: string | undefined, field: string, errors: string[]) {
  if (value !== undefined && !isIsoDate(value)) {
    errors.push(`${field} harus berformat YYYY-MM-DD`);
  }
}

function validateDateRange(departureDate: string | undefined, returnDate: string | undefined, errors: string[]) {
  if (!departureDate || !returnDate || !isIsoDate(departureDate) || !isIsoDate(returnDate)) {
    return;
  }

  if (returnDate < departureDate) {
    errors.push("returnDate tidak boleh sebelum departureDate");
  }
}

function normalizeStatus(value: unknown, errors: string[]) {
  if (value === undefined || value === null || value === "") {
    return "Terjadwal";
  }

  const normalized = String(value).trim();

  if (!scheduleStatuses.includes(normalized as (typeof scheduleStatuses)[number])) {
    errors.push(`status harus salah satu dari: ${scheduleStatuses.join(", ")}`);
  }

  return normalized;
}

function normalizeOptionalStatus(value: unknown, errors: string[]) {
  if (value === undefined) {
    return undefined;
  }

  return normalizeStatus(value, errors);
}

export function validateScheduleCreate(
  payload: unknown,
  packageIdOverride?: string,
): ScheduleValidationResult<ScheduleCreatePayload> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return { data: null, errors: ["Payload harus berupa object"] };
  }

  const packageId = packageIdOverride?.trim() || normalizeRequiredString(payload.packageId, "packageId", errors);
  const departureDate = normalizeRequiredString(payload.departureDate, "departureDate", errors);
  const returnDate = normalizeRequiredString(payload.returnDate, "returnDate", errors);
  const price = normalizeRequiredNumber(payload.price, "price", errors);
  const quota = normalizeRequiredNumber(payload.quota, "quota", errors);
  const meetingPoint = normalizeOptionalString(payload.meetingPoint) ?? "";
  const status = normalizeStatus(payload.status, errors);

  validateDate(departureDate, "departureDate", errors);
  validateDate(returnDate, "returnDate", errors);
  validateDateRange(departureDate, returnDate, errors);
  validateQuota(quota, "quota", errors);

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      packageId,
      departureDate,
      returnDate,
      price,
      quota,
      meetingPoint,
      status,
    },
    errors: null,
  };
}

export function validateSchedulePatch(payload: unknown): ScheduleValidationResult<ScheduleGlobalPatchPayload> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return { data: null, errors: ["Payload harus berupa object"] };
  }

  const packageId = payload.packageId === undefined ? undefined : normalizeRequiredString(payload.packageId, "packageId", errors);
  const departureDate = payload.departureDate === undefined ? undefined : normalizeRequiredString(payload.departureDate, "departureDate", errors);
  const returnDate = payload.returnDate === undefined ? undefined : normalizeRequiredString(payload.returnDate, "returnDate", errors);
  const price = normalizeOptionalNumber(payload.price, "price", errors);
  const quota = normalizeOptionalNumber(payload.quota, "quota", errors);
  const meetingPoint = normalizeOptionalString(payload.meetingPoint);
  const status = normalizeOptionalStatus(payload.status, errors);

  validateDate(departureDate, "departureDate", errors);
  validateDate(returnDate, "returnDate", errors);
  validateDateRange(departureDate, returnDate, errors);
  validateQuota(quota, "quota", errors);

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      packageId,
      departureDate,
      returnDate,
      price,
      quota,
      meetingPoint,
      status,
    },
    errors: null,
  };
}

export function omitPackageIdFromSchedulePatch(payload: ScheduleGlobalPatchPayload): SchedulePackagePatchPayload {
  const { packageId: _packageId, ...rest } = payload;
  return rest;
}
