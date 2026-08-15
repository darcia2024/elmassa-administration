import { NextResponse } from "next/server";
import { getCashflowSummary } from "@/lib/expenses/store";
import { listReceivables } from "@/lib/reports/store";

/**
 * Pemasukan vs pengeluaran, plus the receivables/jatuh-tempo side.
 *
 * Receivables come from lib/reports/store so this page and Laporan Piutang can
 * never quote different numbers for the same debt.
 */
export async function GET() {
  const [cashflow, receivables] = await Promise.all([getCashflowSummary(), listReceivables()]);

  const outstanding = receivables.reduce((sum, r) => sum + r.remaining, 0);
  const overdue = receivables.filter((r) => r.priority === "Tinggi");

  return NextResponse.json(
    {
      data: {
        ...cashflow,
        piutang: {
          rows: receivables,
          count: receivables.length,
          outstanding,
          overdueCount: overdue.length,
          overdueAmount: overdue.reduce((sum, r) => sum + r.remaining, 0),
        },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
