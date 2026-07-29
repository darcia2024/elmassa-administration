export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  customerType: string;
  groupName?: string;
  status: string;
};

const babelCustomerNames = [
  { name: "H. Rusli Suparman", city: "Pangkalpinang", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Hj. Zubaidah Mansur", city: "Pangkalpinang", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "H. Ruslan Efendi", city: "Tanjung Pandan (Belitung)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Hj. Rohani Syahputri", city: "Tanjung Pandan (Belitung)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Iskandar Harun", city: "Sungailiat (Bangka)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Ernawati Abdullah", city: "Sungailiat (Bangka)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Syahril Ismail", city: "Koba (Bangka Tengah)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Fatimah Zohra", city: "Koba (Bangka Tengah)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Herry Kurniawan", city: "Manggar (Belitung Timur)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Rosita Nur", city: "Manggar (Belitung Timur)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Hendra Wijaya", city: "Toboali (Bangka Selatan)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Titin Suryani", city: "Toboali (Bangka Selatan)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Arifin Ahmad", city: "Pangkalpinang", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Maimunah Ismail", city: "Pangkalpinang", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Syamsul Bahri", city: "Muntok (Bangka Barat)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Hasnah Abdullah", city: "Muntok (Bangka Barat)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Bambang Irawan", city: "Sungailiat (Bangka)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Suhaili Rusli", city: "Sungailiat (Bangka)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Hamzah Sutan", city: "Tanjung Pandan (Belitung)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Faridah Zakaria", city: "Tanjung Pandan (Belitung)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Romlan Effendi", city: "Belinyu (Bangka)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Nurhayati Sutan", city: "Belinyu (Bangka)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Ridwan Hasan", city: "Pangkalpinang", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Halimah Iskandar", city: "Pangkalpinang", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Zainal Abidin", city: "Koba (Bangka Tengah)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Marzuki Suparman", city: "Koba (Bangka Tengah)", group: "Rombongan Spesial Oktober (01-12 Okt 2026)" },
  { name: "Badaruddin Ahmad", city: "Toboali (Bangka Selatan)", group: "Rombongan Berkah November (08-18 Nov 2026)" },
  { name: "Rustam Efendi", city: "Toboali (Bangka Selatan)", group: "Jamaah VIP Executive (September 2026)" },
  { name: "Kasman Djafar", city: "Manggar (Belitung Timur)", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Masriah Harun", city: "Manggar (Belitung Timur)", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Syarifuddin Rusli", city: "Tanjung Pandan (Belitung)", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Yahya Mansur", city: "Tanjung Pandan (Belitung)", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Saiful Arifin", city: "Pangkalpinang", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Darmawan Syahputri", city: "Pangkalpinang", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Zulkifli Syahril", city: "Sungailiat (Bangka)", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Nurbaiti Ismail", city: "Sungailiat (Bangka)", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Abdullah Hasnan", city: "Muntok (Bangka Barat)", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Maryam Ahmad", city: "Muntok (Bangka Barat)", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Bujang Lapok", city: "Pangkalpinang", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
  { name: "Sumarni Marpaung", city: "Pangkalpinang", group: "Rombongan Bangka Belitung (08-18 Jul 2026)" },
];

const customerRows: CustomerRow[] = babelCustomerNames.map((person, i) => ({
  id: `cust-${(i + 1).toString().padStart(3, "0")}`,
  name: person.name,
  phone: `0812-7199-${1000 + i + 1}`,
  email: `${person.name.toLowerCase().replace(/[^a-z]/g, ".")}@elmassa.test`,
  address: `Jl. Utama No. ${i + 1}, ${person.city}`,
  city: person.city,
  customerType: i < 30 ? "Rombongan" : i < 36 ? "Keluarga" : "Individu",
  groupName: person.group,
  status: "Aktif",
}));

export function listCustomerRows() {
  return customerRows;
}

export function findCustomerRow(id: string) {
  return customerRows.find((item) => item.id === id);
}

export function createCustomerRow(payload: Omit<CustomerRow, "id">) {
  const row = {
    ...payload,
    id: `cust-${crypto.randomUUID()}`,
  };

  customerRows.push(row);
  return row;
}

export function updateCustomerRow(id: string, payload: Partial<Omit<CustomerRow, "id">>) {
  const index = customerRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<CustomerRow, "id">>;

  customerRows[index] = {
    ...customerRows[index],
    ...updates,
  };

  return customerRows[index];
}
