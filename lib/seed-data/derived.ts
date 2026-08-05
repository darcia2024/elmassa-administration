import { listBookingRows, listParticipantsForBooking } from "@/lib/seed-data/bookings";
import { listCustomerRows } from "@/lib/seed-data/customers";
import { listPackageRows } from "@/lib/seed-data/packages";
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
