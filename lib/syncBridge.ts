export type SyncUpdatePayload = {
  id: string;
  nomorJamaah: string;
  nama: string;
  kamar?: string;
  bus?: string;
  flight?: string;
  rombongan?: string;
  eVisa?: string;
  timestamp: number;
};

export const SYNC_JAMAAH_KEY = "el_massa_jamaah_live_updates";
export const SYNC_PAYMENT_KEY = "umrahme_payment_uploads";

/**
 * Broadcast update data jamaah dari El Massa Web Admin ke Aplikasi UmrahMe
 */
export function broadcastJamaahUpdateFromAdmin(data: Partial<SyncUpdatePayload> & { nomorJamaah: string; nama: string }) {
  const payload: SyncUpdatePayload = {
    id: data.id || String(Date.now()),
    nomorJamaah: data.nomorJamaah,
    nama: data.nama,
    kamar: data.kamar,
    bus: data.bus,
    flight: data.flight,
    rombongan: data.rombongan,
    eVisa: data.eVisa,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(SYNC_JAMAAH_KEY, JSON.stringify(payload));
    // Dispatch custom event for same-origin tabs
    window.dispatchEvent(new CustomEvent("el_massa_jamaah_update", { detail: payload }));
  } catch (err) {
    console.warn("Broadcast update failed", err);
  }
}
