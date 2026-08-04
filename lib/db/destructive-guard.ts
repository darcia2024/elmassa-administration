import { NextResponse } from "next/server";

/**
 * Guard for operations that wipe entire tables.
 *
 * These endpoints sit behind no session check, so without a gate anyone who
 * knows the URL can empty the production database. They stay disabled unless
 * ALLOW_DATA_RESET is explicitly set to "true" in the environment, which makes
 * a full wipe a deliberate act rather than one stray request.
 */
export function isDataResetAllowed(): boolean {
  return process.env.ALLOW_DATA_RESET === "true";
}

export function dataResetBlockedResponse() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Penghapusan massal dinonaktifkan. Set ALLOW_DATA_RESET=true di environment untuk mengaktifkannya sementara.",
    },
    { status: 403 },
  );
}
