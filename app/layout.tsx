import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "El Massa Travel",
  description: "Dashboard operasional El Massa Tour & Travel",
};

import { FloatingRevisionNotes } from "@/components/floating-revision-notes";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={manrope.variable} suppressHydrationWarning>
      <body className={`${manrope.className} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <FloatingRevisionNotes />
      </body>
    </html>
  );
}
