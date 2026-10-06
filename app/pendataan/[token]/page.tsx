import type { Metadata } from "next";
import { PendataanForm } from "./pendataan-form";

type Props = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Pendataan Jamaah — El Massa Tour & Travel",
  // Link pribadi per jamaah; jangan sampai terindeks mesin pencari.
  robots: { index: false, follow: false },
};

export default async function PendataanPage({ params }: Props) {
  const { token } = await params;
  return <PendataanForm token={token} />;
}
