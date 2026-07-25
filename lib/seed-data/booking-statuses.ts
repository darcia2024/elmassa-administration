export type BookingStatusRow = {
  id: string;
  name: string;
  stage: string;
  description: string;
  paymentImpact: string;
  documentImpact: string;
  ownerRole: string;
  mode: "Aktif" | "Manual";
  sortOrder: number;
};

const bookingStatusRows: BookingStatusRow[] = [
  {
    id: "status-belum-bayar",
    name: "Belum Bayar",
    stage: "Booking",
    description: "Booking sudah dibuat, invoice atau DP belum tercatat.",
    paymentImpact: "Masuk sisa tagihan",
    documentImpact: "Mulai kumpulkan dokumen",
    ownerRole: "Admin Operasional",
    mode: "Aktif",
    sortOrder: 20,
  },
];

export function listBookingStatusRows() {
  return [...bookingStatusRows].sort((left, right) => left.sortOrder - right.sortOrder);
}
