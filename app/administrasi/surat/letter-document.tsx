"use client";

import type { LetterRecord } from "./types";

/**
 * Template cetak per jenis surat.
 *
 * Sebelumnya semua jenis memakai satu badan surat dengan paragraf berbeda.
 * Surat resmi tidak begitu: yang dikirim ke Imigrasi menyebut identitas
 * lengkap pemohon dan dasar keberangkatannya, yang dikirim ke tempat kerja
 * menyebut periode cuti, dan yang dikirim ke jamaah tidak memakai blok
 * identitas sama sekali. Masing-masing punya penerima, isi, dan lampiran
 * keterangan yang berbeda -- itu yang dipisahkan di sini.
 */

const COMPANY = {
  legal: "PT. AL MASSA AZKA WISATA",
  brand: "El Massa Tour & Travel",
  license: "Izin PPIU Kemenag RI No. 10032300465890002",
  address: "Komplek Ruko Best Cinema, Pangkalpinang, Kepulauan Bangka Belitung",
  phone: "0717-000000",
  email: "admin@elmassa.travel",
};

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function tanggalID(iso: string | null | undefined): string {
  if (!iso) return "";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

type Baris = [string, string];

/** Baris identitas yang kosong tidak dicetak, supaya surat tidak berisi titik-titik kosong. */
function Identitas({ rows }: { rows: Baris[] }) {
  const isi = rows.filter(([, v]) => String(v ?? "").trim() !== "");
  if (isi.length === 0) return null;

  return (
    <table className="my-3 ml-8 text-[11pt]">
      <tbody>
        {isi.map(([label, value]) => (
          <tr key={label} className="align-top">
            <td className="whitespace-nowrap py-0.5 pr-3">{label}</td>
            <td className="py-0.5 pr-2">:</td>
            <td className="py-0.5 font-bold text-stone-950">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function identitasJamaah(letter: LetterRecord): Baris[] {
  const ttl = [letter.birthPlace, tanggalID(letter.birthDate)].filter(Boolean).join(", ");
  return [
    ["Nama Lengkap", letter.recipientName.toUpperCase()],
    ["NIK", letter.recipientNik],
    ["Tempat / Tanggal Lahir", ttl],
    ["Alamat", letter.address],
    ["Nomor Paspor", letter.passportNumber],
  ];
}

function keberangkatan(letter: LetterRecord): Baris[] {
  return [
    ["Program", letter.packageName],
    ["Rencana Keberangkatan", tanggalID(letter.departureDate)],
    ["Kode Booking", letter.bookingCode],
  ];
}

/** Isi surat per jenis. `body` yang diketik staf selalu menang. */
function Isi({ letter }: { letter: LetterRecord }) {
  if (letter.body.trim()) {
    return <p className="mt-3 whitespace-pre-line text-justify">{letter.body}</p>;
  }

  const pembuka = (
    <>
      Yang bertanda tangan di bawah ini, pimpinan <strong>{COMPANY.legal}</strong> ({COMPANY.brand}),
      selaku Penyelenggara Perjalanan Ibadah Umrah (PPIU) resmi berizin Kementerian Agama Republik
      Indonesia, dengan ini menerangkan bahwa:
    </>
  );

  switch (letter.letterType) {
    case "paspor-baru":
      return (
        <>
          <p className="mt-3 text-justify">{pembuka}</p>
          <Identitas rows={identitasJamaah(letter)} />
          <p className="text-justify">
            adalah benar calon jamaah umrah yang telah terdaftar pada program kami:
          </p>
          <Identitas rows={keberangkatan(letter)} />
          <p className="text-justify">
            Sehubungan dengan hal tersebut, dan mengingat paspor merupakan dokumen wajib bagi
            perjalanan ibadah umrah, kami mohon kesediaan Bapak/Ibu untuk berkenan memproses
            <strong> penerbitan Paspor Republik Indonesia</strong> atas nama yang bersangkutan.
          </p>
          <p className="mt-2 text-justify">
            Kami menyatakan bahwa data yang tercantum di atas adalah benar, dan yang bersangkutan
            berangkat semata-mata untuk menunaikan ibadah umrah bersama travel kami.
          </p>
        </>
      );

    case "paspor-tambah-nama": {
      const namaBaru = String(letter.extra?.namaBaru ?? "").trim();
      return (
        <>
          <p className="mt-3 text-justify">{pembuka}</p>
          <Identitas rows={identitasJamaah(letter)} />
          <p className="text-justify">
            adalah benar calon jamaah umrah kami yang terdaftar pada program berikut:
          </p>
          <Identitas rows={keberangkatan(letter)} />
          <p className="text-justify">
            Sesuai ketentuan Kerajaan Arab Saudi, nama pada paspor jamaah umrah wajib terdiri dari
            sekurang-kurangnya <strong>3 (tiga) suku kata</strong>. Nama yang bersangkutan saat ini
            belum memenuhi ketentuan tersebut, sehingga permohonan visa tidak dapat diproses.
          </p>
          {namaBaru ? (
            <Identitas rows={[["Nama pada paspor saat ini", letter.recipientName.toUpperCase()],
                              ["Nama yang dimohonkan", namaBaru.toUpperCase()]]} />
          ) : null}
          <p className="text-justify">
            Oleh karena itu kami mohon kesediaan Bapak/Ibu untuk berkenan memproses
            <strong> penambahan nama pada paspor</strong> yang bersangkutan.
          </p>
        </>
      );
    }

    case "paspor-ganti": {
      const alasan = String(letter.extra?.alasan ?? "").trim();
      return (
        <>
          <p className="mt-3 text-justify">{pembuka}</p>
          <Identitas rows={identitasJamaah(letter)} />
          <p className="text-justify">
            adalah benar calon jamaah umrah kami yang terdaftar pada program berikut:
          </p>
          <Identitas rows={[...keberangkatan(letter), ...(alasan ? ([["Alasan Penggantian", alasan]] as Baris[]) : [])]} />
          <p className="text-justify">
            Sehubungan dengan kondisi paspor yang bersangkutan sebagaimana disebutkan di atas, kami
            mohon kesediaan Bapak/Ibu untuk berkenan memproses <strong>penggantian Paspor Republik
            Indonesia</strong> atas nama tersebut, agar keberangkatan ibadah umrah yang bersangkutan
            dapat berjalan sesuai jadwal.
          </p>
        </>
      );
    }

    case "izin-cuti": {
      const employer = String(letter.extra?.employer ?? "").trim();
      const periode = String(letter.extra?.leaveDates ?? "").trim();
      return (
        <>
          <p className="mt-3 text-justify">{pembuka}</p>
          <Identitas rows={[
            ["Nama Lengkap", letter.recipientName.toUpperCase()],
            ["NIK", letter.recipientNik],
            ["Instansi / Perusahaan", employer],
          ]} />
          <p className="text-justify">
            adalah benar calon jamaah umrah kami yang akan menunaikan ibadah umrah pada:
          </p>
          <Identitas rows={[...keberangkatan(letter),
                            ...(periode ? ([["Periode Cuti Dimohonkan", periode]] as Baris[]) : [])]} />
          <p className="text-justify">
            Berkenaan dengan hal tersebut, kami mohon kesediaan pimpinan
            {employer ? <strong> {employer} </strong> : " instansi yang bersangkutan "}
            untuk berkenan <strong>memberikan izin cuti</strong> kepada yang bersangkutan selama masa
            keberangkatan, mengingat rangkaian ibadah umrah harus diikuti secara penuh dari
            keberangkatan hingga kepulangan.
          </p>
        </>
      );
    }

    default:
      return (
        <>
          <p className="mt-3 text-justify">
            Dengan hormat, sehubungan dengan penyelenggaraan program{" "}
            <strong>{letter.packageName || "ibadah umrah"}</strong>
            {letter.departureDate ? <> dengan rencana keberangkatan <strong>{tanggalID(letter.departureDate)}</strong></> : null},
            bersama ini kami sampaikan pemberitahuan kepada Bapak/Ibu calon jamaah untuk dapat
            diperhatikan sebagaimana mestinya.
          </p>
          <p className="mt-2 text-justify">
            Kami mengimbau seluruh jamaah untuk memastikan kelengkapan dokumen, mengikuti kegiatan
            manasik sesuai jadwal, serta menyelesaikan kewajiban administrasi sebelum tanggal
            keberangkatan.
          </p>
        </>
      );
  }
}

export type SignatureIdentity = {
  signatureUrl?: string;
  signatureName?: string;
  signaturePosition?: string;
  stampUrl?: string;
};

export function LetterDocument({
  letter,
  identity,
}: {
  letter: LetterRecord;
  /** Tanda tangan & stempel dari Pengaturan > Identitas Perusahaan. */
  identity?: SignatureIdentity;
}) {
  return (
    <article className="surat-a4 mx-auto bg-white text-stone-900">
      {/* Ukuran kertas dikunci ke A4 supaya pratinjau di layar sama persis
          dengan hasil cetak, dan warna kop tidak dibuang printer. */}
      <style>{`
        .surat-a4 {
          display: flex;
          flex-direction: column;
          width: 210mm;
          min-height: 297mm;
          padding: 14mm 20mm 16mm;
          font-size: 11.5pt;
          line-height: 1.6;
          box-sizing: border-box;
        }
        @page { size: A4 portrait; margin: 0; }
        @media print {
          .surat-a4 {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            box-shadow: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Kop surat resmi — satu gambar berisi logo, badan hukum, izin PPIU & alamat. */}
      <header>
        <img
          src="/kop-surat-el-massa.png"
          alt={`Kop surat ${COMPANY.legal}`}
          className="block w-full"
        />
      </header>

      {/* Nomor & perihal */}
      <div className="mt-6 flex items-start justify-between gap-8">
        <div className="space-y-0.5">
          {([
            ["Nomor", letter.letterNumber],
            ["Lampiran", "—"],
            ["Perihal", letter.subject],
          ] as Baris[]).map(([k, v], i) => (
            <div key={k} className="flex gap-2">
              <span className="w-[72px] shrink-0">{k}</span>
              <span>
                :{" "}
                {i === 0 ? <strong className="font-mono">{v}</strong>
                  : i === 2 ? <strong className="underline">{v}</strong>
                  : v}
              </span>
            </div>
          ))}
        </div>
        <p className="shrink-0 whitespace-nowrap">Pangkalpinang, {tanggalID(letter.issuedDate)}</p>
      </div>

      {/* Tujuan */}
      <div className="mt-6">
        <p>Kepada</p>
        <p className="font-semibold">{letter.recipientTo}</p>
        <p>di Tempat</p>
      </div>

      <p className="mt-4">
        <em>Assalamu&apos;alaikum Warahmatullahi Wabarakatuh.</em>
      </p>

      <Isi letter={letter} />

      <p className="mt-3 text-justify">
        Demikian surat ini kami buat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
        Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.
      </p>

      <p className="mt-3">
        <em>Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh.</em>
      </p>

      {/* Tanda tangan. Stempel ditumpuk di belakang tanda tangan seperti surat
          basah, dan hanya muncul kalau gambarnya memang sudah diunggah -- kalau
          belum, blok ini tetap menyisakan ruang untuk tanda tangan manual. */}
      <div className="mt-10 flex justify-end">
        <div className="w-[260px] text-center">
          <p className="font-semibold">{COMPANY.brand}</p>

          <div className="relative mx-auto flex h-24 w-full items-center justify-center">
            {identity?.stampUrl ? (
              <img
                src={identity.stampUrl}
                alt=""
                className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-[70%] -translate-y-1/2 object-contain opacity-80"
              />
            ) : null}
            {identity?.signatureUrl ? (
              <img
                src={identity.signatureUrl}
                alt="Tanda tangan"
                className="relative max-h-20 w-auto object-contain"
              />
            ) : null}
          </div>

          <p className="font-bold uppercase text-stone-950 underline">
            {letter.issuedBy || identity?.signatureName || "( ................................. )"}
          </p>
          <p className="text-[10pt]">{identity?.signaturePosition || "Pimpinan"}</p>
        </div>
      </div>

      <footer className="mt-auto border-t border-stone-300 pt-2 text-[8.5pt] leading-snug text-stone-500">
        <p>
          Surat ini diterbitkan melalui sistem operasional {COMPANY.brand} dan tercatat dengan nomor{" "}
          <span className="font-mono">{letter.letterNumber}</span>. Keaslian dapat dikonfirmasi ke
          kantor kami pada alamat tertera di atas.
        </p>
      </footer>
    </article>
  );
}
