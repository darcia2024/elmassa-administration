"use client";

import type { LetterRecord } from "./types";

/**
 * Printable letter body. One layout, five wordings — the paragraph is chosen by
 * letter type so a single component can serve every surat in the menu, and
 * anything typed into `body` overrides it for one-off wording.
 */

const COMPANY = {
  name: "PT. AL MASSA AZKA WISATA",
  brand: "El Massa Tour & Travel",
  license: "Izin PPIU Kemenag RI No. 10032300465890002",
  address: "Komplek Ruko Best Cinema, Pangkalpinang, Bangka Belitung",
};

function formatDateID(iso: string | null | undefined): string {
  if (!iso) return "—";
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(iso);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const [, year, month, day] = match;
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

function bodyFor(letter: LetterRecord): string {
  if (letter.body.trim()) return letter.body;

  const trip = letter.packageName
    ? `program ${letter.packageName}${letter.departureDate ? ` dengan keberangkatan ${formatDateID(letter.departureDate)}` : ""}`
    : "program ibadah umrah yang kami selenggarakan";

  switch (letter.letterType) {
    case "paspor-baru":
      return `yang bersangkutan adalah benar calon jamaah umrah kami yang terdaftar pada ${trip}. Sehubungan dengan hal tersebut, kami mohon kesediaan Bapak/Ibu untuk dapat memproses pembuatan Paspor Republik Indonesia atas nama yang bersangkutan guna keperluan perjalanan ibadah umrah.`;

    case "paspor-tambah-nama":
      return `yang bersangkutan adalah benar calon jamaah umrah kami yang terdaftar pada ${trip}. Sesuai ketentuan Kerajaan Arab Saudi, nama pada paspor jamaah umrah wajib terdiri dari sekurang-kurangnya 3 (tiga) suku kata. Oleh karena itu kami mohon kesediaan Bapak/Ibu untuk dapat memproses penambahan nama pada paspor yang bersangkutan.`;

    case "paspor-ganti":
      return `yang bersangkutan adalah benar calon jamaah umrah kami yang terdaftar pada ${trip}. Sehubungan dengan kondisi paspor yang bersangkutan, kami mohon kesediaan Bapak/Ibu untuk dapat memproses penggantian Paspor Republik Indonesia atas nama tersebut guna keperluan perjalanan ibadah umrah.`;

    case "izin-cuti": {
      const employer = String(letter.extra?.employer ?? "instansi tempat yang bersangkutan bekerja");
      const period = String(letter.extra?.leaveDates ?? "masa keberangkatan");
      return `yang bersangkutan adalah benar calon jamaah umrah kami yang terdaftar pada ${trip}. Sehubungan dengan hal tersebut, kami mohon kesediaan pimpinan ${employer} untuk dapat memberikan izin cuti kepada yang bersangkutan selama ${period} guna menunaikan ibadah umrah.`;
    }

    default:
      return `bersama surat ini kami sampaikan pemberitahuan kepada yang bersangkutan sehubungan dengan ${trip}. Demikian pemberitahuan ini kami sampaikan untuk dapat diperhatikan sebagaimana mestinya.`;
  }
}

export function LetterDocument({ letter }: { letter: LetterRecord }) {
  const showIdentity = letter.letterType !== "pemberitahuan";

  return (
    <article className="mx-auto w-full max-w-[210mm] bg-white px-10 py-9 text-[13px] leading-relaxed text-stone-900 print:px-0 print:py-0">

      {/* Kop surat */}
      <header className="flex items-start gap-4 border-b-[3px] border-double border-stone-800 pb-3">
        <img src="/logo-el-massa.png" alt="" className="h-16 w-auto shrink-0 object-contain" />
        <div className="min-w-0 flex-1 text-center">
          <h1 className="text-lg font-black uppercase tracking-wide text-stone-950">{COMPANY.name}</h1>
          <p className="text-sm font-bold text-stone-800">{COMPANY.brand}</p>
          <p className="mt-0.5 text-[11px] text-stone-600">{COMPANY.address}</p>
          <p className="text-[11px] font-semibold text-stone-700">{COMPANY.license}</p>
        </div>
      </header>

      {/* Nomor & perihal */}
      <div className="mt-6 space-y-0.5 text-[13px]">
        <div className="flex gap-2">
          <span className="w-20 shrink-0">Nomor</span>
          <span>: <strong className="font-mono">{letter.letterNumber}</strong></span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0">Lampiran</span>
          <span>: —</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0">Perihal</span>
          <span>: <strong className="underline">{letter.subject}</strong></span>
        </div>
      </div>

      <div className="mt-5">
        <p className="font-semibold">{letter.recipientTo}</p>
        <p>di Tempat</p>
      </div>

      <p className="mt-5">
        <em>Assalamu&apos;alaikum Warahmatullahi Wabarakatuh.</em>
      </p>

      <p className="mt-3 text-justify">
        Dengan hormat, bersama surat ini kami dari <strong>{COMPANY.name} ({COMPANY.brand})</strong> selaku
        Penyelenggara Perjalanan Ibadah Umrah (PPIU) resmi Kemenag RI menerangkan bahwa
        {showIdentity ? " calon jamaah berikut:" : ` ${bodyFor(letter)}`}
      </p>

      {showIdentity ? (
        <>
          <table className="mt-3 ml-6 text-[13px]">
            <tbody>
              {[
                ["Nama Lengkap", letter.recipientName.toUpperCase()],
                ["NIK", letter.recipientNik],
                ["Tempat / Tgl Lahir", [letter.birthPlace, formatDateID(letter.birthDate)].filter(Boolean).join(" / ")],
                ["Alamat", letter.address],
                ["No. Paspor", letter.passportNumber],
                ["Program", letter.packageName],
                ["Keberangkatan", letter.departureDate ? formatDateID(letter.departureDate) : ""],
              ]
                .filter(([, value]) => String(value ?? "").trim() !== "" && String(value).trim() !== "—")
                .map(([label, value]) => (
                  <tr key={String(label)} className="align-top">
                    <td className="py-0.5 pr-2 whitespace-nowrap">{label}</td>
                    <td className="py-0.5 pr-2">:</td>
                    <td className="py-0.5 font-bold text-stone-950">{value}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <p className="mt-3 text-justify">Bahwa {bodyFor(letter)}</p>
        </>
      ) : null}

      <p className="mt-3 text-justify">
        Demikian surat ini kami buat dengan sebenarnya. Atas perhatian dan kerja samanya kami ucapkan terima kasih.
      </p>

      <p className="mt-3">
        <em>Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh.</em>
      </p>

      {/* Tanda tangan */}
      <div className="mt-8 flex justify-end">
        <div className="w-64 text-center">
          <p>Pangkalpinang, {formatDateID(letter.issuedDate)}</p>
          <p className="font-semibold">{COMPANY.brand}</p>
          <div className="h-16" />
          <p className="font-bold underline text-stone-950">{letter.issuedBy || "( ....................... )"}</p>
          <p className="text-[12px]">Pimpinan / Staf Berwenang</p>
        </div>
      </div>

      <footer className="mt-8 border-t border-stone-300 pt-2 text-[10px] text-stone-500">
        <p>Surat ini diterbitkan melalui sistem operasional {COMPANY.brand} dan tercatat dengan nomor {letter.letterNumber}.</p>
      </footer>
    </article>
  );
}
