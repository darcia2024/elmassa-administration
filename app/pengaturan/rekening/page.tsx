"use client";

import { CreditCard, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";

type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  isPrimary: boolean;
  status: string;
};

const initialAccounts: BankAccount[] = [
  {
    id: "rek-bca",
    bankName: "BCA",
    accountNumber: "1234567890",
    accountName: "El Massa Tour & Travel",
    branch: "Bekasi",
    isPrimary: true,
    status: "Aktif",
  },
];

const emptyForm = {
  accountName: "",
  accountNumber: "",
  bankName: "",
  branch: "",
  isPrimary: false,
  status: "Aktif",
};

const statusStyles: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Nonaktif: "bg-stone-100 text-stone-600 ring-stone-200",
};

export default function PaymentAccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [form, setForm] = useState<Omit<BankAccount, "id">>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const activeCount = useMemo(() => accounts.filter((account) => account.status === "Aktif").length, [accounts]);
  const primaryAccount = useMemo(() => accounts.find((account) => account.isPrimary), [accounts]);

  const selectedAccount = editingId ? accounts.find((account) => account.id === editingId) : null;

  const handleSubmit = () => {
    if (!form.bankName.trim() || !form.accountName.trim()) {
      return;
    }

    if (editingId) {
      setAccounts((current) =>
        current.map((account) =>
          account.id === editingId
            ? {
                ...account,
                ...form,
              }
            : account,
        ),
      );
      setEditingId(null);
      setForm(emptyForm);
      return;
    }

    setAccounts((current) => [
      ...current,
      {
        ...form,
        id: `rek-${crypto.randomUUID()}`,
        isPrimary: accounts.length === 0,
      },
    ]);
    setForm(emptyForm);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingId(account.id);
    setForm({
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      branch: account.branch,
      isPrimary: account.isPrimary,
      status: account.status,
    });
  };

  const handleDelete = (accountId: string) => {
    setAccounts((current) => {
      const deletedAccount = current.find((account) => account.id === accountId);
      const remainingAccounts = current.filter((account) => account.id !== accountId);

      if (!deletedAccount?.isPrimary || remainingAccounts.length === 0) {
        return remainingAccounts;
      }

      return remainingAccounts.map((account, index) => ({
        ...account,
        isPrimary: index === 0,
      }));
    });
    if (editingId === accountId) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const handleSetPrimary = (accountId: string) => {
    setAccounts((current) =>
      current.map((account) => ({
        ...account,
        isPrimary: account.id === accountId,
      })),
    );
  };

  return (
    <AppShell eyebrow="Pengaturan" title="Rekening Pembayaran">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Rekening</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{accounts.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data dummy lokal</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Aktif</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{activeCount}</p>
          <p className="mt-2 text-sm text-stone-500">Bisa dipilih di form pembayaran</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Mode</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{primaryAccount?.bankName ?? "-"}</p>
          <p className="mt-2 text-sm text-stone-500">Rekening utama dokumen</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-brand-cocoa">{editingId ? "Edit Rekening" : "Tambah Rekening"}</h3>
              <p className="text-sm text-stone-500">Perubahan disimpan di state dummy.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Bank / kanal
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.bankName} onChange={(event) => setForm({ ...form, bankName: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Nomor rekening
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.accountNumber} onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Atas nama
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.accountName} onChange={(event) => setForm({ ...form, accountName: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Cabang
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Status
              <select className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option>Aktif</option>
                <option>Nonaktif</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" type="button" onClick={handleSubmit}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {editingId ? "Simpan" : "Tambah"}
            </button>
            <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Reset
            </button>
          </div>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-cocoa">Daftar Rekening</h3>
              <p className="mt-1 text-sm text-stone-500">Pilih satu rekening utama untuk invoice dan kuitansi.</p>
            </div>
            <span className="w-fit rounded-md bg-brand-cream px-3 py-2 text-xs font-bold uppercase text-brand-brown ring-1 ring-brand-rose">
              {selectedAccount ? `Edit ${selectedAccount.bankName}` : "Mode tambah"}
            </span>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead className="bg-brand-cream text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Bank</th>
                  <th className="px-4 py-3 font-bold">Nomor</th>
                  <th className="px-4 py-3 font-bold">Atas Nama</th>
                  <th className="px-4 py-3 font-bold">Cabang</th>
                  <th className="px-4 py-3 font-bold">Utama</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {accounts.map((account) => (
                  <tr key={account.id} className="text-stone-700 hover:bg-brand-cream">
                    <td className="px-4 py-4 font-bold text-brand-cocoa">{account.bankName}</td>
                    <td className="px-4 py-4">{account.accountNumber}</td>
                    <td className="px-4 py-4">{account.accountName}</td>
                    <td className="px-4 py-4">{account.branch}</td>
                    <td className="px-4 py-4">
                      {account.isPrimary ? (
                        <span className="rounded-full bg-brand-rose px-2.5 py-1 text-xs font-bold text-brand-pink ring-1 ring-brand-pink/20">
                          Utama
                        </span>
                      ) : (
                        <button className="h-8 rounded-md border border-stone-200 bg-white px-3 text-xs font-bold text-brand-cocoa" type="button" onClick={() => handleSetPrimary(account.id)}>
                          Jadikan utama
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[account.status]}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-stone-200 bg-white text-brand-cocoa disabled:cursor-not-allowed disabled:text-stone-300" type="button" aria-label={`Jadikan ${account.bankName} rekening utama`} onClick={() => handleSetPrimary(account.id)} disabled={account.isPrimary}>
                          <Star className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-stone-200 bg-white text-brand-cocoa" type="button" aria-label={`Edit ${account.bankName}`} onClick={() => handleEdit(account)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-stone-200 bg-white text-rose-700" type="button" aria-label={`Hapus ${account.bankName}`} onClick={() => handleDelete(account.id)}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
