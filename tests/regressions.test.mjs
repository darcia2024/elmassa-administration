import { test } from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Compile the real TypeScript module; replace only IO boundaries, never business logic.
function load(file, mocks = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports, require: id => id in mocks ? mocks[id] : require(id),
    fetch, Response, console, Buffer, process,
  }, { filename: file });
  return exports;
}
const jsonResponse = { NextResponse: { json: (body, init) => Response.json(body, init) } };
const validSchedule = { id: "dep-1", packageId: "pkg-live", departureDate: "2026-11-04", returnDate: "2026-11-16", price: 30000000, quota: 45, meetingPoint: "", status: "Terjadwal" };

test("publish waits for server confirmation and rejects HTTP, application and network failures", async () => {
  const { publishPackage } = load("lib/catalog/publish-package.ts");
  let complete;
  let settled = false;
  const pending = publishPackage({ id: "pkg-live" }, () => new Promise(resolve => { complete = resolve; })).then(() => { settled = true; });
  await Promise.resolve();
  assert.equal(settled, false);
  complete(Response.json({ ok: true }));
  await pending;
  assert.equal(settled, true);
  for (const response of [Response.json({ error: "Ditolak" }, { status: 403 }), Response.json({ ok: false }), new Response("not JSON", { status: 502 })]) {
    await assert.rejects(publishPackage({}, async () => response));
  }
  await assert.rejects(publishPackage({}, async () => { throw Error("offline"); }), /offline/);
});

test("partial schedule edit rejects a return date before the existing departure", async () => {
  let updated = false;
  const validators = load("lib/validation/schedules.ts");
  const route = load("app/api/schedules/[scheduleId]/route.ts", {
    "next/server": jsonResponse,
    "@/lib/validation/schedules": validators,
    "@/lib/schedules/store": {
      findScheduleRowById: async () => validSchedule,
      updateScheduleRowById: async () => { updated = true; },
      packageExists: async () => true,
    },
  });
  const response = await route.PATCH({ json: async () => ({ returnDate: "2026-11-01" }) }, { params: Promise.resolve({ scheduleId: "dep-1" }) });
  assert.equal(response.status, 400);
  assert.equal(updated, false);
});

test("schedule creation uses live catalogue and awaits database results", async () => {
  const route = load("app/api/schedules/route.ts", {
    "next/server": jsonResponse,
    "@/lib/validation/schedules": load("lib/validation/schedules.ts"),
    "@/lib/schedules/store": {
      packageExists: async id => id === "pkg-live",
      createScheduleRow: async row => ({ ...row, id: "persisted-id" }),
    },
  });
  const response = await route.POST({ json: async () => validSchedule });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).data.id, "persisted-id");
  assert.equal((await route.POST({ json: async () => ({ ...validSchedule, packageId: "missing" }) })).status, 404);
});

test("margin preserves missing costs and supports real losses", () => {
  const { estimateBookingMargin: estimate } = load("lib/reports/margin.ts");
  for (const cost of [null, undefined, "", "bad", 0, -1]) assert.equal(estimate(60000000, 2, cost).estimatedMargin, null);
  assert.equal(estimate(60000000, 2, 25000000).estimatedMargin, 10000000);
  assert.equal(estimate(40000000, 2, 25000000).estimatedMargin, -10000000);
  assert.equal(estimate(60000000, 0, 25000000).estimatedMargin, null);
});

test("forgot password rejects invalid input and reports storage failure", async () => {
  let calls = 0;
  const route = load("app/api/auth/forgot-password/route.ts", {
    "next/server": jsonResponse,
    "@/lib/auth/staff-store": { ensureStaffTable: async () => {} },
    "@/lib/auth/password-reset-requests": { requestPasswordReset: async () => { calls++; throw Error("offline"); } },
  });
  assert.equal((await route.POST({ json: async () => ({ email: "bad" }) })).status, 400);
  assert.equal(calls, 0);
  assert.equal((await route.POST({ json: async () => ({ email: "staff@example.com" }) })).status, 503);
});

test("admin reset updates real staff store and never returns password secrets", async () => {
  let saved;
  let resolved;
  const row = { id: "staff-id", email: "staff@example.com", name: "Staf", role: "Admin Master", status: "Aktif", passwordHash: "secret", passwordSalt: "salt" };
  const route = load("app/api/auth/admin/reset-password/route.ts", {
    "next/server": jsonResponse,
    "next/headers": { headers: async () => new Headers({ "x-el-massa-user-id": "staff-id" }) },
    "@/lib/auth/staff-store": {
      findStaffById: async () => row, findStaffByEmail: async () => row,
      updateStaff: async (id, patch) => { saved = { id, ...patch }; return row; },
    },
    "@/lib/auth/password-reset-requests": { resolvePasswordResetRequests: async email => { resolved = email; } },
  });
  const response = await route.POST({ json: async () => ({ email: row.email, newPassword: "new-password-123" }) });
  assert.equal(response.status, 200);
  assert.equal(saved.password, "new-password-123");
  assert.equal(resolved, row.email);
  assert.equal(JSON.stringify(await response.json()).includes("secret"), false);
});
