export async function publishPackage(pkg: unknown, send: typeof fetch = fetch): Promise<void> {
  const response = await send("/api/packages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pkg),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true) {
    throw new Error(result?.error || "Paket gagal disimpan. Silakan coba lagi.");
  }
}
