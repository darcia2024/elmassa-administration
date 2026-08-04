import { NextRequest, NextResponse } from "next/server";
import { listReceiptDetails } from "@/lib/receipts/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();
  const bookingCode = searchParams.get("bookingCode")?.trim();

  const all = await listReceiptDetails();

  const data = all.filter((item) => {
    const searchable =
      `${item.receipt.number} ${item.payment.bookingCode} ${item.receipt.receivedFrom} ${item.payment.packageName}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesStatus = !status || status === "Semua" || item.receipt.status === status;
    const matchesBooking = !bookingCode || item.payment.bookingCode === bookingCode;

    return matchesQuery && matchesStatus && matchesBooking;
  });

  const totalAmount = data.reduce((total, item) => total + item.receipt.amount, 0);

  return NextResponse.json(
    {
      data,
      summary: {
        receiptCount: data.length,
        totalAmount,
        totalAmountDisplay: `Rp ${totalAmount.toLocaleString("id-ID")}`,
      },
      meta: {
        total: data.length,
        source: "supabase",
        filters: {
          bookingCode: bookingCode ?? null,
          q: query,
          status: status ?? null,
        },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
