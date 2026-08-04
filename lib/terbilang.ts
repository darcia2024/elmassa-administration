const ONES = [
  "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas",
];

/** Spells out an integer in Indonesian (e.g. 12500 -> "dua belas ribu lima ratus"). */
function spellNumber(n: number): string {
  if (n < 12) return ONES[n];
  if (n < 20) return `${spellNumber(n - 10)} belas`;
  if (n < 100) return `${spellNumber(Math.floor(n / 10))} puluh${n % 10 !== 0 ? ` ${spellNumber(n % 10)}` : ""}`;
  if (n < 200) return `seratus${n % 100 !== 0 ? ` ${spellNumber(n % 100)}` : ""}`;
  if (n < 1000) return `${spellNumber(Math.floor(n / 100))} ratus${n % 100 !== 0 ? ` ${spellNumber(n % 100)}` : ""}`;
  if (n < 2000) return `seribu${n % 1000 !== 0 ? ` ${spellNumber(n % 1000)}` : ""}`;
  if (n < 1000000) return `${spellNumber(Math.floor(n / 1000))} ribu${n % 1000 !== 0 ? ` ${spellNumber(n % 1000)}` : ""}`;
  if (n < 1000000000) return `${spellNumber(Math.floor(n / 1000000))} juta${n % 1000000 !== 0 ? ` ${spellNumber(n % 1000000)}` : ""}`;
  if (n < 1000000000000) return `${spellNumber(Math.floor(n / 1000000000))} miliar${n % 1000000000 !== 0 ? ` ${spellNumber(n % 1000000000)}` : ""}`;
  return `${spellNumber(Math.floor(n / 1000000000000))} triliun${n % 1000000000000 !== 0 ? ` ${spellNumber(n % 1000000000000)}` : ""}`;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** e.g. amountToWordsIDR(5000000) -> "Lima Juta Rupiah". Used on printed kuitansi. */
export function amountToWordsIDR(amount: number): string {
  const rounded = Math.max(Math.round(amount), 0);
  if (rounded === 0) return "Nol Rupiah";
  return `${capitalize(spellNumber(rounded))} Rupiah`;
}
