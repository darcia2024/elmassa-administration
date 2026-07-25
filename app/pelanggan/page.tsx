import { AppShell } from "@/components/app-shell";
import { getCustomerPageRows } from "@/lib/seed-data/derived";
import { CustomerList } from "./customer-list";

export default function CustomersPage() {
  const customers = getCustomerPageRows();

  return (
    <AppShell eyebrow="Data Pelanggan" title="Manajemen Pelanggan">
      <CustomerList customers={customers} />
    </AppShell>
  );
}
