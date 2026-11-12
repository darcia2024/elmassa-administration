// Tutorial recorder engine: Playwright + cursor/caption overlays -> webm -> mp4.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { REPO } from "./db.mjs";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./seed.mjs";

export const BASE = "http://localhost:3100";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(HERE, "raw");
const STATE = path.join(HERE, "state.json");
export const OUT = path.join(REPO, "public", "tutorial");
// ffmpeg + ffprobe harus ada di PATH, atau set env FFMPEG ke path lengkap ffmpeg(.exe).
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const FFPROBE = FFMPEG.replace(/ffmpeg(\.exe)?$/i, (m) => m.replace(/ffmpeg/i, "ffprobe"));
const W = 1280, H = 720;
fs.mkdirSync(RAW, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(HERE, "chapters"), { recursive: true });

const OVERLAY_JS = () => {
  if (!document.documentElement || document.getElementById("tut-cursor")) return;
  const style = document.createElement("style");
  style.textContent = `
    nextjs-portal, [data-nextjs-toast], [data-next-badge-root] { display:none !important; }
    #tut-cursor{position:fixed;z-index:2147483647;pointer-events:none;width:26px;height:26px;left:-40px;top:-40px;
      filter:drop-shadow(1px 2px 2px rgba(0,0,0,.35));transition:transform .12s}
    #tut-cursor.down{transform:scale(.82)}
    .tut-ripple{position:fixed;z-index:2147483646;pointer-events:none;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;
      border:3px solid rgba(190,40,70,.85);animation:tutr .55s ease-out forwards}
    @keyframes tutr{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}
    #tut-cap{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(12px);z-index:2147483645;pointer-events:none;
      max-width:960px;display:flex;align-items:center;gap:14px;padding:13px 22px 13px 14px;border-radius:16px;
      background:rgba(28,20,24,.92);color:#fff;font:600 19px/1.35 Manrope,Segoe UI,sans-serif;letter-spacing:.1px;
      box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;transition:opacity .3s,transform .3s}
    #tut-cap.on{opacity:1;transform:translateX(-50%) translateY(0)}
    #tut-cap b{flex:none;background:linear-gradient(135deg,#c2416b,#d23c3c);border-radius:10px;padding:5px 10px;font-size:14px;font-weight:800;letter-spacing:.5px}
    #tut-card{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
      background:radial-gradient(circle at 30% 20%,#fff6f2,#f6e7e3 60%,#efd9d4);font-family:Manrope,Segoe UI,sans-serif;color:#3a1d22;
      opacity:0;transition:opacity .45s}
    #tut-card.on{opacity:1}
    #tut-card img{height:86px}
    #tut-card .k{font-size:15px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#b8344f}
    #tut-card .t{font-size:46px;font-weight:800;text-align:center;max-width:1000px;line-height:1.15}
    #tut-card .s{font-size:21px;color:#6b4a4f;text-align:center;max-width:860px;line-height:1.45}
    #tut-hl{position:fixed;z-index:2147483644;pointer-events:none;border:3px solid #d23c5c;border-radius:12px;
      box-shadow:0 0 0 9999px rgba(20,10,14,.28);transition:all .35s;opacity:0}
    #tut-hl.on{opacity:1}`;
  document.documentElement.appendChild(style);
  const c = document.createElement("div");
  c.id = "tut-cursor";
  c.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2.5L19.5 12.6L12.4 13.9L9.1 21L4 2.5Z" fill="#fff" stroke="#1d1d1d" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  document.documentElement.appendChild(c);
  const cap = document.createElement("div"); cap.id = "tut-cap"; document.documentElement.appendChild(cap);
  const hl = document.createElement("div"); hl.id = "tut-hl"; document.documentElement.appendChild(hl);
  const last = window.__tutPos || { x: -40, y: -40 };
  c.style.left = last.x + "px"; c.style.top = last.y + "px";
  if (window.__tutListeners) return;
  window.__tutListeners = true;
  document.addEventListener("mousemove", (e) => { const c = document.getElementById("tut-cursor"); if (!c) return; c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; window.__tutPos = { x: e.clientX, y: e.clientY }; try { sessionStorage.setItem("__tutPos", JSON.stringify(window.__tutPos)); } catch {} }, true);
  document.addEventListener("mousedown", (e) => { document.getElementById("tut-cursor")?.classList.add("down"); const r = document.createElement("div"); r.className = "tut-ripple"; r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px"; document.documentElement.appendChild(r); setTimeout(() => r.remove(), 600); }, true);
  document.addEventListener("mouseup", () => document.getElementById("tut-cursor")?.classList.remove("down"), true);
};

async function ensureOverlay(page) {
  await page.evaluate(OVERLAY_JS).catch(() => {});
}

export async function makeState() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/login");
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="@"]', DEMO_EMAIL);
  await page.fill('input[type="password"]', DEMO_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 60000 });
  await ctx.storageState({ path: STATE });
  await browser.close();
}

export async function record(slug, fn, { loggedIn = true } = {}) {
  if (loggedIn && !fs.existsSync(STATE)) await makeState();
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    locale: "id-ID",
    timezoneId: "Asia/Jakarta",
    storageState: loggedIn ? STATE : undefined,
    recordVideo: { dir: RAW, size: { width: W, height: H } },
  });
  await ctx.addInitScript(() => {
    try { const p = sessionStorage.getItem("__tutPos"); if (p) window.__tutPos = JSON.parse(p); } catch {}
  });
  await ctx.addInitScript(`(${OVERLAY_JS.toString()})(); document.addEventListener('DOMContentLoaded', () => (${OVERLAY_JS.toString()})());`);
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  const chapters = [];
  const t0 = Date.now();
  const t = makeHelpers(page, chapters, t0);
  let failed = null;
  const started = Date.now();
  try {
    await fn(t, page);
  } catch (e) {
    failed = e;
    console.error(`[${slug}] FAILED:`, e.message.split("\n")[0]);
    await page.screenshot({ path: path.join(RAW, `${slug}-fail.png`) }).catch(() => {});
  }
  const video = page.video();
  await ctx.close();
  await browser.close();
  const src = await video.path();
  if (failed) { console.error(`[${slug}] raw kept at ${src}`); return false; }
  const mp4 = path.join(OUT, `${slug}.mp4`);
  // Start the video on the opening title card (skips the blank first paint and page load).
  const startAt = Math.max(0.4, (chapters.startAt ?? 0.4) + 0.15);
  for (const ch of chapters) ch.t = Math.max(0, Math.round((ch.t - startAt) * 10) / 10);
  execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-ss", String(startAt), "-i", src, "-c:v", "libx264", "-preset", "slow", "-tune", "stillimage", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);
  execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-ss", "1.5", "-i", mp4, "-frames:v", "1", "-q:v", "3", path.join(OUT, `${slug}.jpg`)]);
  const dur = parseFloat(execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4]).toString().trim());
  fs.writeFileSync(path.join(HERE, "chapters", `${slug}.json`), JSON.stringify({ slug, duration: Math.round(dur), chapters }, null, 1));
  // Playlist thumbnail: a frame from the middle step (the poster is the title card).
  const mid = chapters.length >= 3 ? chapters[Math.floor(chapters.length / 2)].t + 1.5 : dur * 0.4;
  execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-ss", String(mid), "-i", mp4, "-frames:v", "1", "-vf", "scale=480:-1", "-q:v", "4", path.join(OUT, `${slug}-thumb.jpg`)]);
  const secs = Math.round((Date.now() - started) / 1000);
  console.log(`[${slug}] OK ~${secs}s -> ${mp4}`);
  fs.rmSync(src, { force: true });
  return true;
}

function makeHelpers(page, chapters = [], t0 = Date.now()) {
  let cardCount = 0;
  const sleep = (ms) => page.waitForTimeout(ms);
  const loc = (target) => (typeof target === "string" ? page.locator(target).filter({ visible: true }).first() : target);

  async function moveTo(target) {
    const el = loc(target);
    await ensureOverlay(page);
    await el.waitFor({ state: "visible" });
    await el.scrollIntoViewIfNeeded();
    await sleep(250);
    const box = await el.boundingBox();
    if (!box) throw new Error("no box for target");
    const x = box.x + Math.min(box.width / 2, 60 + box.width * 0.3);
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y, { steps: 18 });
    await sleep(350);
    return el;
  }

  const t = {
    page,
    sleep,
    async goto(p) {
      await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
      await ensureOverlay(page);
      await page.waitForLoadState("networkidle").catch(() => {});
      await sleep(900);
    },
    async card(title, sub, kicker = "Tutorial El Massa", ms = 3600) {
      await ensureOverlay(page);
      const instant = cardCount++ === 0;
      if (instant) chapters.startAt = (Date.now() - t0) / 1000;
      await page.evaluate(({ title, sub, kicker, instant }) => {
        let el = document.getElementById("tut-card");
        if (!el) { el = document.createElement("div"); el.id = "tut-card"; document.documentElement.appendChild(el); }
        el.innerHTML = `<img src="/logo-el-massa.png"><div class="k">${kicker}</div><div class="t">${title}</div>${sub ? `<div class="s">${sub}</div>` : ""}`;
        // The opening card shows at once so the video never starts on a half-faded page.
        if (instant) el.style.transition = "none";
        el.getBoundingClientRect();
        el.classList.add("on");
        if (instant) { el.getBoundingClientRect(); el.style.transition = ""; }
      }, { title, sub, kicker, instant });
      await sleep(ms);
      await page.evaluate(() => { const el = document.getElementById("tut-card"); if (el) el.classList.remove("on"); });
      await sleep(500);
      await page.evaluate(() => document.getElementById("tut-card")?.remove());
    },
    async say(text, ms = 2600, step) {
      await ensureOverlay(page);
      await page.evaluate(({ text, step }) => {
        const cap = document.getElementById("tut-cap");
        cap.innerHTML = (step ? `<b>${step}</b>` : "") + `<span>${text}</span>`;
        cap.classList.add("on");
      }, { text, step: step ?? null });
      if (step && !chapters.some((c) => c.step === String(step))) chapters.push({ step: String(step), text, t: (Date.now() - t0) / 1000 });
      await sleep(ms);
    },
    async hush() { await page.evaluate(() => document.getElementById("tut-cap")?.classList.remove("on")).catch(() => {}); await sleep(300); },
    async highlight(target, ms = 1800) {
      const el = await moveTo(target);
      const box = await el.boundingBox();
      await page.evaluate((b) => { const h = document.getElementById("tut-hl"); Object.assign(h.style, { left: b.x - 6 + "px", top: b.y - 6 + "px", width: b.width + 12 + "px", height: b.height + 12 + "px" }); h.classList.add("on"); }, box);
      await sleep(ms);
      await page.evaluate(() => document.getElementById("tut-hl")?.classList.remove("on"));
      await sleep(300);
    },
    async hover(target, ms = 900) { await moveTo(target); await sleep(ms); },
    async click(target, ms = 1100) {
      const el = await moveTo(target);
      await el.click();
      await sleep(ms);
      await ensureOverlay(page);
    },
    async type(target, text, { delay = 45, clear = true } = {}) {
      const el = await moveTo(target);
      await el.click();
      // Select-all then type over it: a Backspace first would let a controlled
      // number input snap back to "0" and the digits would append after it.
      if (clear) await page.keyboard.press("Control+A");
      await page.keyboard.type(String(text), { delay });
      await sleep(450);
    },
    async select(target, value, ms = 900) {
      // No click: a real click opens the native dropdown, which then stays
      // painted over the page and blocks selectOption.
      const el = await moveTo(target);
      await sleep(300);
      await el.selectOption(value);
      await sleep(ms);
    },
    async scroll(dy, ms = 1300) {
      await page.mouse.move(800, 420, { steps: 8 });
      for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, dy / 6); await sleep(60); }
      await sleep(ms);
    },
    async scrollTo(target, ms = 900) {
      const el = loc(target);
      await el.evaluate((n) => n.scrollIntoView({ behavior: "smooth", block: "center" }));
      await sleep(ms);
    },
    async top(ms = 900) {
      await page.evaluate(() => { window.scrollTo({ top: 0, behavior: "smooth" }); document.querySelectorAll("main, [class*='overflow-y-auto']").forEach((n) => n.scrollTo?.({ top: 0, behavior: "smooth" })); });
      await sleep(ms);
    },
    async fill(target, value, ms = 700) {
      const el = await moveTo(target);
      await el.click().catch(() => {});
      await el.fill(String(value));
      await sleep(ms);
    },
    field: (label, tag) => {
      const want = tag ? `self::${tag}` : "self::input or self::select or self::textarea";
      const lab = `(//label[contains(normalize-space(.), "${label}")])[1]`;
      // A control nested inside the <label> comes first; otherwise the next one after it.
      return page.locator(`xpath=${lab}//*[${want}] | ${lab}/following::*[${want}][1]`).first();
    },
    text: (s, opts) => page.getByText(s, { exact: false, ...opts }).first(),
    btn: (name) => page.getByRole("button", { name }).first(),
    link: (name) => page.getByRole("link", { name }).first(),
  };
  return t;
}
