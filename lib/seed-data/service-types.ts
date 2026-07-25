export const serviceTypeCategories = ["Religi", "Wisata", "Khusus"] as const;
export const serviceTypeStatuses = ["Aktif", "Draft", "Nonaktif"] as const;

export type ServiceTypeCategory = (typeof serviceTypeCategories)[number];
export type ServiceTypeStatus = (typeof serviceTypeStatuses)[number];

export type ServiceTypeRow = {
  id: string;
  name: string;
  category: ServiceTypeCategory;
  defaultDuration: string;
  documentTemplate: string;
  status: ServiceTypeStatus;
  notes: string;
};

export type ServiceTypePayload = {
  name?: string;
  category?: string;
  defaultDuration?: string;
  documentTemplate?: string;
  status?: string;
  notes?: string;
};

const serviceTypeRows: ServiceTypeRow[] = [
  {
    id: "srv-umrah",
    name: "Umrah",
    category: "Religi",
    defaultDuration: "9-13 hari",
    documentTemplate: "Invoice Umrah",
    status: "Aktif",
    notes: "Paket ibadah umrah reguler dan plus.",
  },
];

export function listServiceTypeRows() {
  return serviceTypeRows;
}

export function findServiceTypeRow(id: string) {
  return serviceTypeRows.find((item) => item.id === id);
}

export function createServiceTypeRow(payload: Omit<ServiceTypeRow, "id"> & { id?: string }) {
  const row: ServiceTypeRow = {
    ...payload,
    id: payload.id ?? `srv-${crypto.randomUUID()}`,
  };

  serviceTypeRows.push(row);

  return row;
}

export function updateServiceTypeRow(id: string, payload: Partial<Omit<ServiceTypeRow, "id">>) {
  const index = serviceTypeRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<ServiceTypeRow, "id">>;

  serviceTypeRows[index] = {
    ...serviceTypeRows[index],
    ...updates,
  };

  return serviceTypeRows[index];
}

export function deleteServiceTypeRow(id: string) {
  const index = serviceTypeRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  serviceTypeRows.splice(index, 1);

  return true;
}

export function parseServiceTypePayload(payload: ServiceTypePayload, options: { partial?: boolean } = {}) {
  const errors: Record<string, string> = {};
  const name = payload.name === undefined ? undefined : String(payload.name).trim();
  const category = payload.category === undefined ? undefined : String(payload.category).trim();
  const defaultDuration = payload.defaultDuration === undefined ? undefined : String(payload.defaultDuration).trim();
  const documentTemplate = payload.documentTemplate === undefined ? undefined : String(payload.documentTemplate).trim();
  const status = payload.status === undefined ? undefined : String(payload.status).trim();
  const notes = payload.notes === undefined ? undefined : String(payload.notes).trim();

  if (!options.partial || name !== undefined) {
    if (!name) {
      errors.name = "Nama layanan wajib diisi";
    } else if (name.length > 80) {
      errors.name = "Nama layanan maksimal 80 karakter";
    }
  }

  if (!options.partial || category !== undefined) {
    if (!category) {
      errors.category = "Kategori wajib diisi";
    } else if (!serviceTypeCategories.includes(category as ServiceTypeCategory)) {
      errors.category = `Kategori harus salah satu dari: ${serviceTypeCategories.join(", ")}`;
    }
  }

  if (!options.partial || documentTemplate !== undefined) {
    if (!documentTemplate) {
      errors.documentTemplate = "Template dokumen wajib diisi";
    } else if (documentTemplate.length > 80) {
      errors.documentTemplate = "Template dokumen maksimal 80 karakter";
    }
  }

  if (defaultDuration !== undefined && defaultDuration.length > 60) {
    errors.defaultDuration = "Durasi default maksimal 60 karakter";
  }

  if (!options.partial || status !== undefined) {
    if (!status) {
      errors.status = "Status wajib diisi";
    } else if (!serviceTypeStatuses.includes(status as ServiceTypeStatus)) {
      errors.status = `Status harus salah satu dari: ${serviceTypeStatuses.join(", ")}`;
    }
  }

  if (notes !== undefined && notes.length > 240) {
    errors.notes = "Catatan maksimal 240 karakter";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      name,
      category: category as ServiceTypeCategory | undefined,
      defaultDuration,
      documentTemplate,
      status: status as ServiceTypeStatus | undefined,
      notes,
    },
  };
}
