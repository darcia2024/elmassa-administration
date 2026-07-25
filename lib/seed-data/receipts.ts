import { findPaymentRow, listPaymentRows, type PaymentRow } from "@/lib/seed-data/payments";

export function toReceiptDetail(payment: PaymentRow) {
  return {
    receipt: {
      number: payment.receiptNumber,
      date: payment.date,
      receivedFrom: payment.customerName,
      amount: payment.amount,
      amountDisplay: payment.amountDisplay,
      amountWords: payment.amountWords,
      paymentFor: payment.paymentFor,
      paymentMethod: payment.paymentMethod,
      account: payment.account,
      staff: payment.staff,
      status: payment.status,
    },
    payment: {
      id: payment.id,
      bookingCode: payment.bookingCode,
      customerName: payment.customerName,
      customerPhone: payment.customerPhone,
      packageName: payment.packageName,
    },
  };
}

export function listReceiptDetails() {
  return listPaymentRows().map(toReceiptDetail);
}

export function findReceiptDetail(paymentIdOrReceiptNumber: string) {
  const payment = findPaymentRow(paymentIdOrReceiptNumber);
  return payment ? toReceiptDetail(payment) : null;
}

export function generateReceiptFromPayment(paymentIdOrReceiptNumber: string) {
  return findReceiptDetail(paymentIdOrReceiptNumber);
}
