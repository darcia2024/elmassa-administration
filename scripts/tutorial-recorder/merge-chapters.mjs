// Menggabungkan chapters/<slug>.json (durasi + detik tiap langkah) ke
// app/tutorial/chapters.json, yang dibaca halaman /tutorial.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.resolve(HERE, "../../app/tutorial/chapters.json");

export function mergeChapters() {
  const dir = path.join(HERE, "chapters");
  // Keep entries for videos that were not re-recorded this run.
  const out = fs.existsSync(TARGET) ? JSON.parse(fs.readFileSync(TARGET, "utf8")) : {};
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      out[j.slug] = { duration: j.duration, chapters: j.chapters };
    }
  }
  const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(TARGET, JSON.stringify(sorted, null, 2) + "\n");
  console.log("chapters.json:", Object.keys(sorted).length, "video");
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) mergeChapters();
