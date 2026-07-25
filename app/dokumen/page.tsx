import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function DocumentsPage() {
  return (
    <PlaceholderPage
      eyebrow="Dokumen"
      title="Dokumen"
      description="Ruang kerja untuk manifest, invoice, kuitansi, dan dokumen pendukung perjalanan."
      icon={FileText}
      items={["Invoice draft", "Kuitansi", "Manifest peserta"]}
    />
  );
}
