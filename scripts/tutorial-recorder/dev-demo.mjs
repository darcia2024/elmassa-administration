// Menjalankan aplikasi (next dev, port 3100) terhadap database DEMO lokal saja.
// Semua env yang bisa menjangkau layanan asli ditimpa di sini; env proses
// menang atas .env.local, jadi Supabase produksi tidak tersentuh.
import { spawn } from "node:child_process";
import path from "node:path";
import { REPO, DEMO_URL } from "./db.mjs";

const env = {
  ...process.env,
  DATABASE_URL: `${DEMO_URL}?sslmode=disable`,
  NEXTAUTH_SECRET: "demo-secret-for-local-tutorial-recording-only-000000",
  // Hanya membentuk teks link yang tampil di video (link pendataan, dll).
  NEXT_PUBLIC_APP_URL: "https://elmassa-administration.vercel.app",
  SUPABASE_URL: "http://127.0.0.1:9",
  SUPABASE_SERVICE_ROLE_KEY: "demo-disabled",
  INITIAL_ADMIN_PASSWORD: "demo12345",
  ALLOW_DATA_RESET: "false",
};

const child = spawn(process.execPath, [path.join(REPO, "node_modules/next/dist/bin/next"), "dev", "-p", "3100"], {
  cwd: REPO,
  env,
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 0));
