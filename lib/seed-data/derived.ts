import { listBookingRows, listParticipantsForBooking } from "@/lib/seed-data/bookings";
import { listCustomerRows } from "@/lib/seed-data/customers";
import { listInstallmentRows } from "@/lib/seed-data/installments";
import { listInvoiceRows } from "@/lib/seed-data/invoices";
import { listPackageRows } from "@/lib/seed-data/packages";
import { listPaymentRows } from "@/lib/seed-data/payments";
import { listAllScheduleRows } from "@/lib/seed-data/schedules";

export function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

export function getDashboardStats() {
  const packages = listPackageRows();
  const customers = listCustomerRows();
  const bookings = listBookingRows();
  const payments = listPaymentRows();
  const schedules = listAllScheduleRows();
  const totalRevenue = payments.reduce((total, payment) => total + payment.amount, 0);

  return {
    generatedAt: new Date().toISOString(),
    metrics: [
      {
        key: "packages",
        label: "Total Paket",
        value: packages.length,
        displayValue: String(packages.length),
        note: `${packages.filter((item) => item.status === "Aktif").length} paket aktif`,
        trendPercent: 0,
      },
      {
        key: "customers",
        label: "Pelanggan",
        value: customers.length,
        displayValue: String(customers.length),
        note: `${customers.filter((item) => item.status === "Aktif").length} pelanggan aktif`,
        trendPercent: 0,
      },
      {
        key: "bookings",
        label: "Booking",
        value: bookings.length,
        displayValue: String(bookings.length),
        note: `${bookings.filter((item) => item.status !== "Lunas").length} perlu follow-up`,
        trendPercent: 0,
      },
      {
        key: "revenue",
        label: "Pemasukan",
        value: totalRevenue,
        displayValue: formatRupiah(totalRevenue),
        note: `${payments.length} pembayaran masuk`,
        trendPercent: 0,
      },
    ],
    recentBookings: bookings.map((booking) => ({
      code: booking.code,
      customer: booking.customerName,
      packageName: booking.packageName,
      departureDate: booking.departureDate,
      departureLabel: formatLongDate(booking.departureDate),
      status: booking.status,
      paidAmount: booking.paidAmount,
      paidDisplay: formatRupiah(booking.paidAmount),
    })),
    upcomingDepartures: schedules
      .map((schedule) => {
        const pkg = packages.find((item) => item.id === schedule.packageId);
        const participants = bookings
          .filter((booking) => booking.scheduleId === schedule.id)
          .flatMap((booking) => listParticipantsForBooking(booking.id));

        return {
          packageName: pkg?.name ?? "Paket tidak ditemukan",
          departureDate: schedule.departureDate,
          dateLabel: formatShortDate(schedule.departureDate),
          bookedSeats: participants.length,
          quota: schedule.quota,
          status: schedule.status,
        };
      })
      .sort((first, second) => first.departureDate.localeCompare(second.departureDate)),
    weeklyRevenue: [
      {
        day: "Aktual",
        amount: totalRevenue,
      },
    ],
  };
}

export function getLatestDepartures() {
  const packages = listPackageRows();
  const bookings = listBookingRows();

  return listAllScheduleRows()
    .map((schedule) => {
      const pkg = packages.find((item) => item.id === schedule.packageId);
      const participants = bookings
        .filter((booking) => booking.scheduleId === schedule.id)
        .flatMap((booking) => listParticipantsForBooking(booking.id));

      return {
        id: schedule.id,
        packageName: pkg?.name ?? "Paket tidak ditemukan",
        serviceType: pkg?.serviceType ?? "",
        departureDate: schedule.departureDate,
        returnDate: schedule.returnDate,
        dateLabel: formatShortDate(schedule.departureDate),
        price: schedule.price,
        priceDisplay: formatRupiah(schedule.price),
        quota: schedule.quota,
        bookedSeats: participants.length,
        availableSeats: Math.max(schedule.quota - participants.length, 0),
        meetingPoint: schedule.meetingPoint,
        status: schedule.status,
      };
    })
    .sort((first, second) => first.departureDate.localeCompare(second.departureDate));
}

export function getBookingListRows() {
  return listBookingRows().map((booking) => {
    const remaining = Math.max(booking.totalPrice - booking.paidAmount, 0);

    return {
      code: booking.code,
      customer: booking.customerName,
      packageName: booking.packageName,
      departure: formatLongDate(booking.departureDate),
      participants: listParticipantsForBooking(booking.id).length,
      totalDisplay: formatRupiah(booking.totalPrice),
      paidDisplay: formatRupiah(booking.paidAmount),
      remainingDisplay: formatRupiah(remaining),
      status: booking.status,
    };
  });
}

export function getPackagePageRows() {
  const schedules = listAllScheduleRows();
  const bookings = listBookingRows();

  const packages = listPackageRows().map((pkg) => {
    const packageSchedules = schedules.filter((schedule) => schedule.packageId === pkg.id);
    const activeBookings = bookings
      .filter((booking) => packageSchedules.some((schedule) => schedule.id === booking.scheduleId))
      .reduce((total, booking) => total + booking.participantCount, 0);

    return {
      id: pkg.id,
      name: pkg.name,
      type: pkg.serviceType,
      category: pkg.packageType,
      priceDisplay: pkg.basePrice === null ? "Menyesuaikan" : `Mulai ${formatRupiah(pkg.basePrice)}`,
      duration: pkg.durationDays === null ? "-" : `${pkg.durationDays} hari`,
      departures: packageSchedules.length,
      activeBookings,
      status: pkg.status,
      itinerary: pkg.itinerary,
    };
  });

  const departures = schedules.map((schedule) => {
    const bookedSeats = bookings
      .filter((booking) => booking.scheduleId === schedule.id)
      .reduce((total, booking) => total + booking.participantCount, 0);

    return {
      id: schedule.id,
      packageId: schedule.packageId,
      date: schedule.departureDate,
      returnDate: schedule.returnDate,
      priceDisplay: formatRupiah(schedule.price),
      quota: schedule.quota,
      bookedSeats,
      meetingPoint: schedule.meetingPoint,
      status: schedule.status,
    };
  });

  return { departures, packages };
}

export function getCustomerPageRows() {
  const bookings = listBookingRows();

  return listCustomerRows().map((customer) => {
    const customerBookings = bookings.filter((booking) => booking.customerId === customer.id);
    const lastBooking = customerBookings.sort((first, second) => second.bookingDate.localeCompare(first.bookingDate))[0];

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? "",
      type: customer.customerType,
      groupName: customer.groupName ?? "Umrah Spesial Oktober 2026 (25 Okt - 05 Nov 2026)",
      status: customer.status,
      city: customer.city,
      address: customer.address,
      lastBooking: lastBooking?.packageName ?? "Umrah Spesial Muharram 11 Hari",
      totalBookings: customerBookings.length || 1,
    };
  });
}

export function getIncomeReportRows() {
  return listPaymentRows().map((payment) => ({
    id: payment.receiptNumber.replace("KW", "INC"),
    serviceType: "Umrah",
    packageName: payment.packageName,
    bookingCode: payment.bookingCode,
    customer: payment.customerName,
    date: formatLongDate(payment.date),
    dateValue: payment.date,
    amount: payment.amount,
    margin: Math.round(payment.amount * 0.168),
    status: payment.status === "Terverifikasi" ? "Parsial" : "Menunggu Cek",
  }));
}

export function getBookingDepartureReportRows() {
  const bookings = listBookingRows();

  return listAllScheduleRows().map((schedule) => {
    const scheduleBookings = bookings.filter((booking) => booking.scheduleId === schedule.id);
    const booked = scheduleBookings.reduce((total, booking) => total + booking.participantCount, 0);
    const paidBookings = scheduleBookings.filter((booking) => booking.status === "Lunas").length;
    const receivable = scheduleBookings.reduce(
      (total, booking) => total + Math.max(booking.totalPrice - booking.paidAmount, 0),
      0,
    );
    const pkg = listPackageRows().find((item) => item.id === schedule.packageId);

    return {
      scheduleId: schedule.id,
      packageName: pkg?.name ?? "Paket tidak ditemukan",
      departureDate: formatLongDate(schedule.departureDate),
      departureDateValue: schedule.departureDate,
      quota: schedule.quota,
      booked,
      paidBookings,
      receivable,
      status: schedule.status,
    };
  });
}

export function getManifestReportRows() {
  return listBookingRows().flatMap((booking) =>
    listParticipantsForBooking(booking.id).map((participant) => ({
      participant: participant.name,
      bookingCode: booking.code,
      packageName: booking.packageName,
      departure: formatLongDate(booking.departureDate),
      departureDateValue: booking.departureDate,
      passport: participant.passportNumber,
      documentStatus: participant.documentStatus,
      paymentStatus: booking.status,
    })),
  );
}

export function getPaymentPageRows() {
  return listPaymentRows().map((payment) => ({
    receipt: payment.receiptNumber,
    bookingCode: payment.bookingCode,
    customer: payment.customerName,
    packageName: payment.packageName,
    date: formatLongDate(payment.date),
    amountDisplay: payment.amountDisplay,
    method: payment.paymentMethod,
    account: payment.account,
    status: payment.status,
  }));
}

export function getInvoicePageRows() {
  return listInvoiceRows().map((invoice) => ({
    number: invoice.number,
    bookingCode: invoice.bookingCode,
    customer: invoice.customer,
    packageName: invoice.packageName,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    totalDisplay: invoice.totalDisplay,
    paidDisplay: invoice.paidDisplay,
    remainingDisplay: invoice.remainingDisplay,
    status: invoice.status,
  }));
}

export function getSchedulePageRows() {
  const bookings = listBookingRows();

  return listAllScheduleRows().map((schedule) => {
    const bookedSeats = bookings
      .filter((booking) => booking.scheduleId === schedule.id)
      .reduce((total, booking) => total + booking.participantCount, 0);
    const pkg = listPackageRows().find((item) => item.id === schedule.packageId);

    return {
      id: schedule.id,
      packageName: pkg?.name ?? "Paket tidak ditemukan",
      departureDate: formatLongDate(schedule.departureDate),
      returnDate: formatLongDate(schedule.returnDate),
      priceDisplay: formatRupiah(schedule.price),
      quota: schedule.quota,
      bookedSeats,
      meetingPoint: schedule.meetingPoint,
      status: schedule.status,
    };
  });
}
