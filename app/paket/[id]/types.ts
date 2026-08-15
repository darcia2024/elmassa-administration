import type { ItineraryDayItem } from "@/lib/itinerary-generator";

/** One departure group, as `/api/packages/[id]` returns it. */
export type PackageDetail = {
  id: string;
  name: string;
  category: string;
  duration: string;
  departuresDate: string;
  departureDate: string;
  returnDate: string;
  price: string;
  numericPrice: number;
  dpMinimum: string;
  makkahHotel: string;
  madinahHotel: string;
  airline: string;
  targetPax: number;
  featured: boolean;
  domesticAirline: string;
  internationalAirline: string;
  flightRoute: string;
  startPoint: string;
  programUmrah: string;
  itinerary: ItineraryDayItem[];
  includes: string[];
  excludes: string[];
  posterImg: string;
  bannerImg: string;
  costingData: Record<string, unknown>;
};

export type GroupParticipant = {
  id: string;
  bookingCode: string;
  customerName: string;
  packageId: string;
  packageName: string;
  departure: string;
  name: string;
  passportNumber: string;
  contact: string;
  documentStatus: string;
  visaNumber: string;
  visaExpiry: string | null;
  ticketNumber: string;
  roomType: string;
  jakartaRoomType: string;
  jakartaRoomNo: string;
  makkahRoomType: string;
  makkahRoomNo: string;
  madinahRoomType: string;
  madinahRoomNo: string;
};

export type GroupPaymentInstallment = {
  id: string;
  label: string;
  date: string;
  amount: number;
  method: string;
  status: string;
  receiptNumber: string | null;
};

export type GroupPaymentRow = {
  bookingCode: string;
  customerName: string;
  phone: string;
  participants: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  isSettled: boolean;
  installments: GroupPaymentInstallment[];
};

export function formatIDR(value: number): string {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

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
