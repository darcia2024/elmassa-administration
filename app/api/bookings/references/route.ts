import { NextResponse } from "next/server";
import { listCustomerRows } from "@/lib/seed-data/customers";
import { listPackageRows } from "@/lib/seed-data/packages";
import { listAllScheduleRows } from "@/lib/seed-data/schedules";

const bookingStatuses = ["Belum Bayar", "DP", "Lunas", "Dibatalkan", "Refund"];
const participantDocumentStatuses = ["Lengkap", "Belum Lengkap"];

export async function GET() {
  const packages = listPackageRows();
  const packageById = new Map(packages.map((item) => [item.id, item]));

  const customers = listCustomerRows()
    .filter((item) => item.status !== "Nonaktif")
    .map((item) => ({
      id: item.id,
      label: item.name,
      name: item.name,
      phone: item.phone,
      email: item.email,
      customerType: item.customerType,
      status: item.status,
    }));

  const packageOptions = packages
    .filter((item) => item.status === "Aktif")
    .map((item) => ({
      id: item.id,
      label: item.name,
      name: item.name,
      serviceType: item.serviceType,
      packageType: item.packageType,
      basePrice: item.basePrice,
      durationDays: item.durationDays,
    }));

  const schedules = listAllScheduleRows()
    .filter((item) => item.status === "Terjadwal" || item.status === "Berangkat")
    .map((item) => {
      const packageRow = packageById.get(item.packageId);

      return {
        id: item.id,
        label: `${packageRow?.name ?? "Paket"} - ${item.departureDate}`,
        packageId: item.packageId,
        packageName: packageRow?.name ?? null,
        departureDate: item.departureDate,
        returnDate: item.returnDate,
        price: item.price,
        quota: item.quota,
        meetingPoint: item.meetingPoint,
        status: item.status,
      };
    })
    .sort((first, second) => first.departureDate.localeCompare(second.departureDate));

  return NextResponse.json(
    {
      data: {
        customers,
        packages: packageOptions,
        schedules,
        bookingStatuses,
        participantDocumentStatuses,
      },
      meta: {
        source: "dummy",
        totals: {
          customers: customers.length,
          packages: packageOptions.length,
          schedules: schedules.length,
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
