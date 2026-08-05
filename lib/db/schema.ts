import { relations } from "drizzle-orm";
import { boolean, date, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * This file is a typed map of the database, not a query layer -- every
 * route in this app reads/writes through raw `pg` via lib/db/connection.ts
 * (getPool()), never through Drizzle. Kept for its `$inferSelect` types and
 * as documentation of table shape + relations.
 *
 * There is no live migration tool: `drizzle-kit` and drizzle.config.ts were
 * removed since schema changes (e.g. the payments/installments/invoices
 * booking_id -> booking_code migration) are applied as one-off raw SQL run
 * directly against Supabase, then reflected here by hand. The old
 * drizzle-kit-generated migrations under /drizzle are historical only --
 * running `drizzle-kit generate` against this file would not produce
 * anything meant to be applied.
 */

export const packages = pgTable("packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  serviceType: text("service_type").notNull(),
  packageType: text("package_type").notNull().default("Reguler"),
  itinerary: text("itinerary").notNull().default(""),
  basePrice: integer("base_price"),
  durationDays: integer("duration_days"),
  status: text("status").notNull().default("Draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  packageId: uuid("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  departureDate: date("departure_date").notNull(),
  returnDate: date("return_date").notNull(),
  price: integer("price").notNull(),
  quota: integer("quota").notNull(),
  meetingPoint: text("meeting_point").notNull().default(""),
  status: text("status").notNull().default("Terjadwal"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const scheduleDepartures = pgTable("schedule_departures", {
  id: uuid("id").defaultRandom().primaryKey(),
  packageId: uuid("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  departureDate: date("departure_date").notNull(),
  returnDate: date("return_date").notNull(),
  price: integer("price").notNull(),
  quota: integer("quota").notNull(),
  bookedSeats: integer("booked_seats").notNull().default(0),
  meetingPoint: text("meeting_point").notNull().default(""),
  status: text("status").notNull().default("Terjadwal"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Mirrors the ad-hoc table created by `ensureTable()` in app/api/bookings/route.ts.
// This is the booking table actually written to in production — the Drizzle
// `bookings` table above is unused (see HANDOFF.md section 2). Declared here so
// payments/installments/invoices can reference it and so this file stays a
// truthful map of the database instead of describing a table nothing writes to.
export const realBookings = pgTable("real_bookings", {
  code: text("code").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull().default(""),
  nik: text("nik").notNull().default(""),
  packageId: text("package_id").notNull().default(""),
  packageName: text("package_name").notNull(),
  departure: text("departure").notNull().default(""),
  roomType: text("room_type").notNull().default("Quad (4 Orang)"),
  participants: integer("participants").notNull().default(1),
  totalAmount: integer("total_amount").notNull().default(0),
  paidAmount: integer("paid_amount").notNull().default(0),
  remainingAmount: integer("remaining_amount").notNull().default(0),
  status: text("status").notNull().default("Belum Bayar"),
  umrahMeStatus: text("umrah_me_status").notNull().default("Aktif 🟢"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  customerType: text("customer_type").notNull().default("Individu"),
  status: text("status").notNull().default("Prospek"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  scheduleId: uuid("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("Belum Bayar"),
  totalPrice: integer("total_price").notNull(),
  bookingDate: date("booking_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingCode: text("booking_code")
    .notNull()
    .references(() => realBookings.code, { onDelete: "cascade" }),
  name: text("name").notNull(),
  passportNumber: text("passport_number").notNull().default(""),
  contact: text("contact").notNull().default(""),
  documentStatus: text("document_status").notNull().default("Belum Lengkap"),
  visaNumber: text("visa_number").notNull().default(""),
  visaExpiry: date("visa_expiry"),
  ticketNumber: text("ticket_number").notNull().default(""),
  roomType: text("room_type").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const manifestExports = pgTable("manifest_exports", {
  id: uuid("id").defaultRandom().primaryKey(),
  scheduleId: uuid("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status").notNull().default("Draft"),
  generatedBy: text("generated_by").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companyIdentity = pgTable("company_identity", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  legalName: text("legal_name").notNull().default(""),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  website: text("website").notNull().default(""),
  logoUrl: text("logo_url").notNull().default(""),
  documentFooter: text("document_footer").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceTypes = pgTable("service_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Wisata"),
  defaultDuration: text("default_duration").notNull().default(""),
  documentTemplate: text("document_template").notNull().default(""),
  status: text("status").notNull().default("Aktif"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull().default(""),
  accountName: text("account_name").notNull(),
  branch: text("branch").notNull().default(""),
  isPrimary: boolean("is_primary").notNull().default(false),
  status: text("status").notNull().default("Aktif"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const staffUsers = pgTable("staff_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  role: text("role").notNull().default("Sales"),
  branch: text("branch").notNull().default("Bekasi"),
  status: text("status").notNull().default("Aktif"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookingStatuses = pgTable("booking_statuses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  stage: text("stage").notNull().default("Booking"),
  description: text("description").notNull().default(""),
  paymentImpact: text("payment_impact").notNull().default(""),
  documentImpact: text("document_impact").notNull().default(""),
  ownerRole: text("owner_role").notNull().default("Admin Operasional"),
  mode: text("mode").notNull().default("Aktif"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("Sales"),
  branch: text("branch").notNull().default("Bekasi"),
  status: text("status").notNull().default("Aktif"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiresAt: timestamp("password_reset_expires_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingCode: text("booking_code")
    .notNull()
    .references(() => realBookings.code, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: integer("subtotal").notNull(),
  discountAmount: integer("discount_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull(),
  paidAmount: integer("paid_amount").notNull().default(0),
  status: text("status").notNull().default("Draft"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const installments = pgTable("installments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingCode: text("booking_code")
    .notNull()
    .references(() => realBookings.code, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  sequence: integer("sequence").notNull(),
  label: text("label").notNull().default(""),
  dueDate: date("due_date").notNull(),
  amount: integer("amount").notNull(),
  paidAmount: integer("paid_amount").notNull().default(0),
  status: text("status").notNull().default("Terjadwal"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingCode: text("booking_code")
    .notNull()
    .references(() => realBookings.code, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  installmentId: uuid("installment_id").references(() => installments.id, { onDelete: "set null" }),
  bankAccountId: uuid("bank_account_id").references(() => bankAccounts.id, { onDelete: "set null" }),
  paymentDate: date("payment_date").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull().default("Transfer"),
  referenceNumber: text("reference_number").notNull().default(""),
  proofUrl: text("proof_url").notNull().default(""),
  status: text("status").notNull().default("Tercatat"),
  receivedBy: text("received_by").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const receipts = pgTable("receipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  paymentId: uuid("payment_id")
    .notNull()
    .references(() => payments.id, { onDelete: "cascade" }),
  receiptNumber: text("receipt_number").notNull(),
  issuedDate: date("issued_date").notNull(),
  receivedFrom: text("received_from").notNull(),
  amount: integer("amount").notNull(),
  amountWords: text("amount_words").notNull().default(""),
  paymentFor: text("payment_for").notNull(),
  status: text("status").notNull().default("Terbit"),
  issuedBy: text("issued_by").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const packagesRelations = relations(packages, ({ many }) => ({
  scheduleDepartures: many(scheduleDepartures),
  schedules: many(schedules),
}));

export const schedulesRelations = relations(schedules, ({ many, one }) => ({
  bookings: many(bookings),
  manifestExports: many(manifestExports),
  package: one(packages, {
    fields: [schedules.packageId],
    references: [packages.id],
  }),
}));

export const scheduleDeparturesRelations = relations(scheduleDepartures, ({ one }) => ({
  package: one(packages, {
    fields: [scheduleDepartures.packageId],
    references: [packages.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ many, one }) => ({
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
  participants: many(participants),
  schedule: one(schedules, {
    fields: [bookings.scheduleId],
    references: [schedules.id],
  }),
}));

export const realBookingsRelations = relations(realBookings, ({ many }) => ({
  installments: many(installments),
  invoices: many(invoices),
  payments: many(payments),
  participants: many(participants),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  booking: one(realBookings, {
    fields: [participants.bookingCode],
    references: [realBookings.code],
  }),
}));

export const manifestExportsRelations = relations(manifestExports, ({ one }) => ({
  schedule: one(schedules, {
    fields: [manifestExports.scheduleId],
    references: [schedules.id],
  }),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ many }) => ({
  payments: many(payments),
}));

export const invoicesRelations = relations(invoices, ({ many, one }) => ({
  booking: one(realBookings, {
    fields: [invoices.bookingCode],
    references: [realBookings.code],
  }),
  installments: many(installments),
  payments: many(payments),
}));

export const installmentsRelations = relations(installments, ({ many, one }) => ({
  booking: one(realBookings, {
    fields: [installments.bookingCode],
    references: [realBookings.code],
  }),
  invoice: one(invoices, {
    fields: [installments.invoiceId],
    references: [invoices.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ many, one }) => ({
  bankAccount: one(bankAccounts, {
    fields: [payments.bankAccountId],
    references: [bankAccounts.id],
  }),
  booking: one(realBookings, {
    fields: [payments.bookingCode],
    references: [realBookings.code],
  }),
  installment: one(installments, {
    fields: [payments.installmentId],
    references: [installments.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  receipts: many(receipts),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  payment: one(payments, {
    fields: [receipts.paymentId],
    references: [payments.id],
  }),
}));

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;
export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;
export type ScheduleDeparture = typeof scheduleDepartures.$inferSelect;
export type NewScheduleDeparture = typeof scheduleDepartures.$inferInsert;
export type RealBooking = typeof realBookings.$inferSelect;
export type NewRealBooking = typeof realBookings.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type ManifestExport = typeof manifestExports.$inferSelect;
export type NewManifestExport = typeof manifestExports.$inferInsert;
export type CompanyIdentity = typeof companyIdentity.$inferSelect;
export type NewCompanyIdentity = typeof companyIdentity.$inferInsert;
export type ServiceType = typeof serviceTypes.$inferSelect;
export type NewServiceType = typeof serviceTypes.$inferInsert;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type NewBankAccount = typeof bankAccounts.$inferInsert;
export type StaffUser = typeof staffUsers.$inferSelect;
export type NewStaffUser = typeof staffUsers.$inferInsert;
export type BookingStatus = typeof bookingStatuses.$inferSelect;
export type NewBookingStatus = typeof bookingStatuses.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Installment = typeof installments.$inferSelect;
export type NewInstallment = typeof installments.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;
