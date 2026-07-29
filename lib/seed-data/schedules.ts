export type ScheduleRow = {
  id: string;
  packageId: string;
  departureDate: string;
  returnDate: string;
  price: number;
  quota: number;
  meetingPoint: string;
  status: string;
};

const scheduleRows: ScheduleRow[] = [
  {
    id: "dep-umr-20261001",
    packageId: "pkg-umrah-oktober-12d",
    departureDate: "2026-10-01",
    returnDate: "2026-10-12",
    price: 33500000,
    quota: 45,
    meetingPoint: "Bandara Depati Amir Pangkalpinang (PGK) - Connecting CGK Flight Garuda & Saudia",
    status: "Terjadwal",
  },
  {
    id: "dep-umr-20261108",
    packageId: "pkg-umrah-november-11d",
    departureDate: "2026-11-08",
    returnDate: "2026-11-18",
    price: 35500000,
    quota: 45,
    meetingPoint: "Bandara Depati Amir Pangkalpinang (PGK) - Connecting CGK Flight Garuda & Saudia",
    status: "Terjadwal",
  },
];

export function listScheduleRows(packageId: string) {
  return scheduleRows.filter((item) => item.packageId === packageId);
}

export function listAllScheduleRows() {
  return scheduleRows;
}

export function findScheduleRow(packageId: string, scheduleId: string) {
  return scheduleRows.find((item) => item.packageId === packageId && item.id === scheduleId);
}

export function findScheduleRowById(scheduleId: string) {
  return scheduleRows.find((item) => item.id === scheduleId);
}

export function createScheduleRow(payload: Omit<ScheduleRow, "id">) {
  const row = {
    ...payload,
    id: `dep-${crypto.randomUUID()}`,
  };

  scheduleRows.push(row);
  return row;
}

export function updateScheduleRow(
  packageId: string,
  scheduleId: string,
  payload: Partial<Omit<ScheduleRow, "id" | "packageId">>,
) {
  const index = scheduleRows.findIndex((item) => item.packageId === packageId && item.id === scheduleId);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<ScheduleRow, "id" | "packageId">>;

  scheduleRows[index] = {
    ...scheduleRows[index],
    ...updates,
  };

  return scheduleRows[index];
}

export function updateScheduleRowById(
  scheduleId: string,
  payload: Partial<Omit<ScheduleRow, "id">>,
) {
  const index = scheduleRows.findIndex((item) => item.id === scheduleId);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<ScheduleRow, "id">>;

  scheduleRows[index] = {
    ...scheduleRows[index],
    ...updates,
  };

  return scheduleRows[index];
}

export function deleteScheduleRow(packageId: string, scheduleId: string) {
  const index = scheduleRows.findIndex((item) => item.packageId === packageId && item.id === scheduleId);

  if (index === -1) {
    return false;
  }

  scheduleRows.splice(index, 1);
  return true;
}

export function deleteScheduleRowById(scheduleId: string) {
  const index = scheduleRows.findIndex((item) => item.id === scheduleId);

  if (index === -1) {
    return false;
  }

  scheduleRows.splice(index, 1);
  return true;
}
