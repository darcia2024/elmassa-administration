export type CustomerBookingHistory = {
  code: string;
  customerId: string;
  packageName: string;
  departureDate: string;
  status: string;
  totalPrice: number;
  paidAmount: number;
};

export type CustomerPaymentHistory = {
  receipt: string;
  customerId: string;
  bookingCode: string;
  paymentDate: string;
  amount: number;
  accountDestination: string;
};

const bookingHistory: CustomerBookingHistory[] = [
  {
    code: "BK-2407-018",
    customerId: "cust-001",
    packageName: "Umrah Reguler 12 Hari",
    departureDate: "2026-08-12",
    status: "DP",
    totalPrice: 32_500_000,
    paidAmount: 12_500_000,
  },
];

const paymentHistory: CustomerPaymentHistory[] = [
  {
    receipt: "KW-2407-044",
    customerId: "cust-001",
    bookingCode: "BK-2407-018",
    paymentDate: "2026-07-25",
    amount: 7_500_000,
    accountDestination: "BCA El Massa",
  },
];

export function getCustomerHistory(customerId: string) {
  const bookings = bookingHistory.filter((item) => item.customerId === customerId);
  const payments = paymentHistory.filter((item) => item.customerId === customerId);
  const totalBilled = bookings.reduce((total, item) => total + item.totalPrice, 0);
  const totalPaid = payments.reduce((total, item) => total + item.amount, 0);

  return {
    bookings,
    payments,
    paymentSummary: {
      totalBilled,
      totalPaid,
      remainingBalance: totalBilled - totalPaid,
      bookingCount: bookings.length,
      paymentCount: payments.length,
    },
  };
}
