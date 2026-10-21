/**
 * Format nama orang/jamaah menjadi Title Case yang wajar.
 * Contoh: "ASPA LISTINA" -> "Aspa Listina"
 */
export function toTitleCase(str?: string | null): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
