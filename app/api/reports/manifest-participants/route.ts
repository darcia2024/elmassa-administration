import { NextRequest, NextResponse } from "next/server";
import { getManifestReportRows } from "@/lib/seed-data/derived";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const documentStatus = searchParams.get("documentStatus")?.trim();
  const paymentStatus = searchParams.get("paymentStatus")?.trim();

  const data = getManifestReportRows()
    .filter((item) => !startDate || item.departureDateValue >= startDate)
    .filter((item) => !endDate || item.departureDateValue <= endDate)
    .filter((item) => !documentStatus || documentStatus === "Semua" || item.documentStatus === documentStatus)
    .filter((item) => !paymentStatus || paymentStatus === "Semua" || item.paymentStatus === paymentStatus)
    .filter((item) => {
      const searchable = `${item.participant} ${item.bookingCode} ${item.packageName} ${item.passport}`.toLowerCase();
      return query.length === 0 || searchable.includes(query);
    })
    .sort((first, second) => first.departureDateValue.localeCompare(second.departureDateValue));

  const completeDocuments = data.filter((item) => item.documentStatus === "Lengkap").length;
  const paidParticipants = data.filter((item) => item.paymentStatus === "Lunas").length;

  return NextResponse.json(
    {
      data,
      summary: {
        participantCount: data.length,
        completeDocuments,
        pendingDocuments: Math.max(data.length - completeDocuments, 0),
        paidParticipants,
        pendingPaymentParticipants: Math.max(data.length - paidParticipants, 0),
      },
      meta: {
        source: "dummy",
        filters: {
          documentStatus: documentStatus ?? null,
          endDate: endDate ?? null,
          paymentStatus: paymentStatus ?? null,
          q: query,
          startDate: startDate ?? null,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
