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

const bookingHistory: CustomerBookingHistory[] = [];

const paymentHistory: CustomerPaymentHistory[] = [];

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
