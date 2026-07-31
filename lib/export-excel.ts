/**
 * Universal Client-Side Excel & CSV Exporter with UTF-8 BOM
 * Compatible with Microsoft Excel, Google Sheets, & Apple Numbers
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  try {
    // UTF-8 BOM byte sequence to make Excel detect UTF-8 encoding automatically
    const bom = "\uFEFF";
    const headerLine = headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(",");
    const bodyLines = rows.map((row) =>
      row
        .map((cell) => {
          const str = cell === null || cell === undefined ? "" : String(cell);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const fullCsv = [headerLine, ...bodyLines].join("\r\n");
    const blob = new Blob([bom + fullCsv], { type: "text/csv;charset=utf-8;" });
    const dateStr = new Date().toISOString().slice(0, 10);
    const fullFilename = `${filename.toLowerCase().replace(/\s+/g, "-")}_${dateStr}.csv`;

    if (typeof window !== "undefined") {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fullFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Export Excel error:", error);
    alert("Gagal mengunduh file Excel/CSV. Silakan coba lagi.");
  }
}
