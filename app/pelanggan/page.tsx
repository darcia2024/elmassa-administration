import { AppShell } from "@/components/app-shell";
import { listCustomers } from "@/lib/customers/store";
import { CustomerList } from "./customer-list";

// Read fresh on every visit — a jamaah who registered on another device has to
// show up here without waiting for a rebuild.
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <AppShell eyebrow="Data Pelanggan" title="Manajemen Pelanggan">
      <CustomerList customers={customers} />
    </AppShell>
  );
}
