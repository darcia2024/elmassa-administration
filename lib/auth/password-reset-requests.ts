import { getPool } from "@/lib/db/connection";

export async function ensurePasswordResetRequests() {
  await getPool().query(`CREATE TABLE IF NOT EXISTS staff_password_reset_requests (
    email TEXT PRIMARY KEY, message TEXT NOT NULL DEFAULT '',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), resolved_at TIMESTAMPTZ
  )`);
}

export async function requestPasswordReset(email: string, message: string) {
  await ensurePasswordResetRequests();
  // One pending request per email; repeated submissions are limited in the DB
  // so the limit works across server instances, without revealing account existence.
  await getPool().query(`INSERT INTO staff_password_reset_requests (email, message)
    SELECT LOWER(email), $2 FROM staff_users WHERE LOWER(email) = $1
    ON CONFLICT (email) DO UPDATE SET message = EXCLUDED.message,
      requested_at = NOW(), resolved_at = NULL
    WHERE staff_password_reset_requests.requested_at < NOW() - INTERVAL '5 minutes'`, [email, message]);
}

export async function resolvePasswordResetRequests(email: string) {
  await ensurePasswordResetRequests();
  await getPool().query(`UPDATE staff_password_reset_requests SET resolved_at = NOW() WHERE email = LOWER($1)`, [email]);
}
