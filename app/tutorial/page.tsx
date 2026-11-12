import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { TutorialLibrary } from "./tutorial-library";

export const metadata: Metadata = {
  title: "Video Tutorial — El Massa Travel",
};

export default function TutorialPage() {
  return (
    <AppShell eyebrow="Panduan" title="Video Tutorial">
      <TutorialLibrary />
    </AppShell>
  );
}
