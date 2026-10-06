import type { Metadata } from "next";
import { safeReturnUrl } from "@/lib/jamaah/public-view";
import { PendataanForm } from "./pendataan-form";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ kembali?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Pendataan Jamaah — El Massa Tour & Travel",
  // Link pribadi per jamaah; jangan sampai terindeks mesin pencari.
  robots: { index: false, follow: false },
};

export default async function PendataanPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { kembali } = await searchParams;
  const returnUrl = safeReturnUrl(Array.isArray(kembali) ? kembali[0] : kembali);
  return <PendataanForm token={token} returnUrl={returnUrl} />;
}
