import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const invoiceDetails = [
  {
    number: "INV-2407-018",
    bookingCode: "BK-2407-018",
    customer: "Siti Rahma",
    address: "Jl. Kemang Pratama No. 12, Bekasi",
    issueDate: "10 Jul 2026",
    dueDate: "28 Jul 2026",
    status: "Sebagian",
    items: [
      { name: "Paket Umrah Reguler 12 Hari", qty: 1, priceDisplay: "Rp 32.500.000", totalDisplay: "Rp 32.500.000" },
    ],
    paidDisplay: "Rp 12.500.000",
    remainingDisplay: "Rp 20.000.000",
    totalDisplay: "Rp 32.500.000",
  },
];

type InvoiceDetailPageProps = {
  params: Promise<{
    number: string;
  }>;
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { number } = await params;
  const invoice = invoiceDetails.find((item) => item.number === decodeURIComponent(number));

  if (!invoice) {
    notFound();
  }

  return (
    <AppShell eyebrow="Dokumen Invoice" title={invoice.number}>
      <section className="mx-auto max-w-5xl rounded-lg border border-stone-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 border-b border-stone-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-brand-brown">El Massa Tour & Travel</p>
            <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Invoice</h1>
            <p className="mt-2 text-sm text-stone-500">Jl. Kemang Pratama, Bekasi</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-brand-cream p-4 text-sm">
            <p className="text-xs font-bold uppercase text-stone-500">Nomor Invoice</p>
            <p className="mt-1 font-bold text-brand-cocoa">{invoice.number}</p>
            <p className="mt-3 text-xs font-bold uppercase text-stone-500">Status</p>
            <p className="mt-1 font-bold text-brand-cocoa">{invoice.status}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase text-stone-500">Ditagihkan kepada</p>
            <h2 className="mt-2 text-xl font-bold text-brand-cocoa">{invoice.customer}</h2>
            <p className="mt-2 text-sm text-stone-500">{invoice.address}</p>
            <p className="mt-2 text-sm font-semibold text-brand-cocoa">{invoice.bookingCode}</p>
          </div>
          <div className="text-sm sm:text-right">
            <p className="text-stone-500">Tanggal terbit: <span className="font-bold text-brand-cocoa">{invoice.issueDate}</span></p>
            <p className="mt-2 text-stone-500">Jatuh tempo: <span className="font-bold text-brand-cocoa">{invoice.dueDate}</span></p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Item</th>
                <th className="px-4 py-3 font-bold">Qty</th>
                <th className="px-4 py-3 font-bold">Harga</th>
                <th className="px-4 py-3 font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoice.items.map((item) => (
                <tr key={item.name}>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{item.name}</td>
                  <td className="px-4 py-4">{item.qty}</td>
                  <td className="px-4 py-4">{item.priceDisplay}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{item.totalDisplay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-6 w-full max-w-sm space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-stone-500">Total tagihan</span>
            <span className="font-bold text-brand-cocoa">{invoice.totalDisplay}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-stone-500">Terbayar</span>
            <span className="font-bold text-brand-cocoa">{invoice.paidDisplay}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-stone-200 pt-3 text-lg">
            <span className="font-bold text-brand-cocoa">Sisa</span>
            <span className="font-bold text-brand-cocoa">{invoice.remainingDisplay}</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
