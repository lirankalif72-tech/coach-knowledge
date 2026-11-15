"use strict";
/* מאמן ידע – לוגיקת האפליקציה */

const APP_VERSION = "3.0.0";
const KEY = "ck_state_v3";
const LEVELS = { easy: "קל", medium: "בינוני", hard: "מתקדם", expert: "מומחה" };
const LEVEL_ORDER = ["easy", "medium", "hard", "expert"];
const TYPES = { mc: "אמריקאית", tf: "נכון / לא נכון", open: "פתוחה" };
const DAY = 86400000;
const BOX_DAYS = [0, 1, 2, 4, 8, 16];

/* ───────── כלים ───────── */
const $ = s => document.querySelector(s);
const app = $("#app");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function hash(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(arr, rand = Math.random) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function today(d = new Date()) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function dayDiff(a, b) { return Math.round((new Date(b + "T12:00") - new Date(a + "T12:00")) / DAY); }
function fmtTime(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

BANK.forEach(q => { q.id = q.f + "-" + hash(q.q); });
const BY_ID = Object.fromEntries(BANK.map(q => [q.id, q]));

/* ───────── מצב שמור ───────── */
const DEFAULT = () => ({
  v: 3, xp: 0, answered: 0, correct: 0, flashSeen: 0,
  history: [], qs: {}, bm: [], ach: {}, days: [],
  streak: { n: 0, best: 0, last: null },
  daily: {}, best: { speed: 0 },
  settings: { theme: "auto", sound: true, vib: true, instant: true }
});
let S = load();
function load() {
  let s = DEFAULT();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) s = Object.assign(DEFAULT(), JSON.parse(raw));
    else {
      // העברת היסטוריה מהגרסה הקודמת
      const old = JSON.parse(localStorage.getItem("fitnessHistory") || "[]");
      if (Array.isArray(old) && old.length) s.history = old.map(h => ({ date: h.date, mode: "custom", title: "מבחן", score: h.score, n: (h.total || 0) + (h.open || 0) }));
    }
    s.settings = Object.assign(DEFAULT().settings, s.settings || {});
    s.streak = Object.assign(DEFAULT().streak, s.streak || {});
    s.best = Object.assign(DEFAULT().best, s.best || {});
  } catch (e) { s = DEFAULT(); }
  return s;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

/* ───────── רמות ו־XP ───────── */
const levelOf = xp => Math.floor(Math.sqrt(xp / 60)) + 1;
const xpFor = L => 60 * (L - 1) * (L - 1);
function levelTitle(L) {
  if (L <= 2) return "מתאמן מתחיל";
  if (L <= 4) return "מתאמן מתמיד";
  if (L <= 6) return "מדריך בהכשרה";
  if (L <= 9) return "מדריך מוסמך";
  if (L <= 13) return "מאמן בכיר";
  return "מומחה ידע";
}
function addXP(n) {
  const before = levelOf(S.xp);
  S.xp += Math.round(n);
  const after = levelOf(S.xp);
  if (after > before) setTimeout(() => toast("🚀", `עלית לרמה ${after} – ${levelTitle(after)}!`), 400);
}

/* ───────── רצף ימים ───────── */
function touchStreak() {
  const t = today();
  if (!S.days.includes(t)) { S.days.push(t); S.days = S.days.slice(-60); }
  if (S.streak.last === t) return;
  S.streak.n = S.streak.last && dayDiff(S.streak.last, t) === 1 ? S.streak.n + 1 : 1;
  S.streak.last = t;
  S.streak.best = Math.max(S.streak.best, S.streak.n);
}
function currentStreak() {
  if (!S.streak.last) return 0;
  return dayDiff(S.streak.last, today()) <= 1 ? S.streak.n : 0;
}

/* ───────── חזרה מרווחת (לייטנר) ───────── */
function record(q, score) {
  const st = S.qs[q.id] || { s: 0, c: 0, w: 0, box: 0, due: 0 };
  st.s++;
  if (score >= 1) { st.c++; st.box = Math.min(5, st.box + 1); }
  else if (score > 0) { st.box = Math.max(1, st.box); }
  else { st.w++; st.box = 1; }
  st.due = Date.now() + BOX_DAYS[st.box] * DAY;
  st.last = Date.now();
  S.qs[q.id] = st;
  S.answered++;
  if (score >= 1) S.correct++;
}
const mistakes = () => BANK.filter(q => { const s = S.qs[q.id]; return s && s.w > 0 && s.box <= 2; })
  .sort((a, b) => (S.qs[a.id].box - S.qs[b.id].box) || (S.qs[a.id].due - S.qs[b.id].due));
function topicStats(f) {
  const qs = BANK.filter(q => q.f === f);
  let seen = 0, c = 0, s = 0, box = 0;
  qs.forEach(q => { const st = S.qs[q.id]; if (st) { seen++; c += st.c; s += st.s; box += st.box; } });
  return { total: qs.length, seen, acc: s ? pct(c, s) : null, mastery: Math.round(box / (qs.length * 5) * 100) };
}

/* ───────── הישגים ───────── */
const ACH = [
  { id: "first", em: "🎉", t: "צעד ראשון", d: "סיימת מבחן ראשון" },
  { id: "perfect", em: "💯", t: "מושלם", d: "100% במבחן של 5+ שאלות" },
  { id: "streak3", em: "🔥", t: "על הגל", d: "רצף של 3 ימים" },
  { id: "streak7", em: "🏅", t: "שבוע מלא", d: "רצף של 7 ימים" },
  { id: "q100", em: "📚", t: "100 שאלות", d: "ענית על 100 שאלות" },
  { id: "q500", em: "🧠", t: "מכונת ידע", d: "ענית על 500 שאלות" },
  { id: "daily5", em: "📅", t: "יומי קבוע", d: "5 אתגרים יומיים" },
  { id: "speed10", em: "⚡", t: "זריז", d: "10+ במבחן מהירות" },
  { id: "speed20", em: "🚀", t: "ברק", d: "20+ במבחן מהירות" },
  { id: "exam", em: "🎓", t: "עברת!", d: "עברת סימולציית מבחן" },
  { id: "topics", em: "🗺️", t: "סייר", d: "ענית בכל 9 התחומים" },
  { id: "flash50", em: "🃏", t: "שולף כרטיסים", d: "50 כרטיסיות" }
];
function unlock(id) {
  if (S.ach[id]) return false;
  S.ach[id] = today();
  const a = ACH.find(x => x.id === id);
  setTimeout(() => toast(a.em, "הישג חדש: " + a.t), 900);
  return true;
}
function checkAchievements(ctx = {}) {
  if (S.history.length) unlock("first");
  if (ctx.perfect) unlock("perfect");
  const st = currentStreak();
  if (st >= 3) unlock("streak3");
  if (st >= 7) unlock("streak7");
  if (S.answered >= 100) unlock("q100");
  if (S.answered >= 500) unlock("q500");
  if (Object.keys(S.daily).length >= 5) unlock("daily5");
  if (S.best.speed >= 10) unlock("speed10");
  if (S.best.speed >= 20) unlock("speed20");
  if (ctx.examPassed) unlock("exam");
  if (Object.keys(TOPICS).every(f => BANK.some(q => q.f === f && S.qs[q.id]))) unlock("topics");
  if (S.flashSeen >= 50) unlock("flash50");
}

/* ───────── סאונד ורטט ───────── */
let actx = null;
function beep(good) {
  if (S.settings.vib && navigator.vibrate) navigator.vibrate(good ? 25 : [40, 50, 40]);
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = good ? [660, 880] : [220, 180];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = good ? "sine" : "triangle"; o.frequency.value = f;
      const t = actx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.18);
    });
  } catch (e) { }
}

/* ───────── ממשק כללי ───────── */
function toast(em, text) {
  const t = document.createElement("div");
  t.className = "toast"; t.innerHTML = `<span class="em">${em}</span><span>${esc(text)}</span>`;
  document.body.append(t); setTimeout(() => t.remove(), 3300);
}
function confetti() {
  const box = document.createElement("div"); box.className = "confetti";
  const colors = ["#34d399", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa"];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%"; p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.5 + "s"; p.style.animationDuration = 1.4 + Math.random() * 1.2 + "s";
    box.append(p);
  }
  document.body.append(box); setTimeout(() => box.remove(), 3200);
}
function modal(title, text, okLabel = "אישור", cancelLabel = "ביטול", danger = false) {
  return new Promise(res => {
    const bg = document.createElement("div"); bg.className = "modal-bg";
    bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h2>${esc(title)}</h2><p class="muted">${esc(text)}</p>
      <div class="row">${cancelLabel ? `<button class="btn" data-r="0">${esc(cancelLabel)}</button>` : ""}<button class="btn ${danger ? "danger" : "primary"}" data-r="1">${esc(okLabel)}</button></div></div>`;
    bg.addEventListener("click", e => {
      const r = e.target.dataset.r;
      if (r !== undefined || e.target === bg) { bg.remove(); res(r === "1"); }
    });
    document.body.append(bg);
    bg.querySelector('[data-r="1"]').focus();
  });
}
function applyTheme() {
  const t = S.settings.theme;
  const real = t === "auto" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : t;
  document.documentElement.dataset.theme = real;
  document.querySelector('meta[name="theme-color"]').content = real === "light" ? "#f3f5f9" : "#0b0f17";
}
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", applyTheme);
function updateHeader() {
  $("#streakChip span").textContent = currentStreak();
  $("#levelChip span").textContent = levelOf(S.xp);
}

/* ───────── ניווט ───────── */
let tab = "home";
function go(t) {
  stopTimer();
  tab = t; session = null; document.body.classList.remove("in-quiz");
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === t));
  ({ home: renderHome, practice: renderPractice, stats: renderStats, glossary: renderGlossary, settings: renderSettings })[t]();
  updateHeader(); window.scrollTo(0, 0);
}
document.querySelectorAll(".nav button").forEach(b => b.onclick = () => go(b.dataset.tab));
$("#settingsBtn").onclick = () => go("settings");

/* ───────── מסך בית ───────── */
function renderHome() {
  const L = levelOf(S.xp), lo = xpFor(L), hi = xpFor(L + 1);
  const d = S.daily[today()];
  const mis = mistakes().length;
  const h = new Date().getHours();
  const greet = h < 5 ? "לילה טוב" : h < 12 ? "בוקר טוב" : h < 17 ? "צהריים טובים" : h < 21 ? "ערב טוב" : "לילה טוב";

  // המלצה: התחום החלש ביותר מבין אלה שנוסו, אחרת תחום שעוד לא נוסה
  const ts = Object.keys(TOPICS).map(f => ({ f, ...topicStats(f) }));
  const tried = ts.filter(t => t.seen >= 3 && t.acc !== null).sort((a, b) => a.acc - b.acc);
  const untried = ts.filter(t => t.seen === 0);
  let rec = null;
  if (tried.length && tried[0].acc < 80) rec = { f: tried[0].f, why: `הדיוק שלך כאן ${tried[0].acc}% – בוא נחזק` };
  else if (untried.length) rec = { f: untried[0].f, why: "עוד לא תרגלת את התחום הזה" };

  app.innerHTML = `<div class="fade-in">
  <div class="hero">
    <div class="muted small">${greet} 👋</div>
    <div class="level-row" style="margin-top:8px">
      <div class="level-badge">${L}</div>
      <div style="flex:1">
        <b style="font-size:17px">${levelTitle(L)}</b>
        <div class="muted xs">${S.xp - lo} / ${hi - lo} XP לרמה הבאה</div>
        <div class="xpbar"><i style="width:${pct(S.xp - lo, hi - lo)}%"></i></div>
      </div>
    </div>
  </div>

  <div class="card daily ${d ? "done" : ""}" id="dailyCard">
    <div class="em">${d ? "✅" : "🏆"}</div>
    <div style="flex:1"><b style="font-size:16px">אתגר יומי</b>
      <div class="muted small">${d ? `הושלם היום · ${d.score}% · חוזר מחר` : "5 שאלות חדשות בכל יום · ‎+30 XP בונוס"}</div></div>
    <span class="chev">‹</span>
  </div>

  <div class="grid2">
    <button class="mode" data-go="quick"><span class="em">🎲</span><b>תרגול מהיר</b><span>10 שאלות מכל התחומים</span></button>
    <button class="mode" data-go="speed"><span class="em">⚡</span><b>מבחן מהירות</b><span>60 שניות · שיא: ${S.best.speed}</span></button>
    <button class="mode" data-go="exam"><span class="em">🎓</span><b>סימולציית מבחן</b><span>30 שאלות · 35 דק׳ · סף 70%</span></button>
    <button class="mode" data-go="mistakes"><span class="em">🔁</span><b>חזרה על טעויות</b><span>${mis ? mis + " שאלות לחיזוק" : "אין טעויות פתוחות"}</span></button>
  </div>

  ${rec ? `<div class="tip" style="margin-top:12px" data-topic="${rec.f}"><span style="font-size:22px">💡</span><div><b>המלצה: ${TOPICS[rec.f].name}</b><div class="small muted">${rec.why}</div></div></div>` : ""}

  <div class="section-title"><h2>תחומי לימוד</h2><span class="muted xs">${BANK.length} שאלות במאגר</span></div>
  <div class="card" style="padding:4px 16px">
    ${ts.map(t => `<div class="topic" data-topic="${t.f}">
      <div class="em">${TOPICS[t.f].icon}</div>
      <div class="tx"><b>${TOPICS[t.f].name}</b><span class="muted xs">${t.total} שאלות · שליטה ${t.mastery}%${t.acc !== null ? " · דיוק " + t.acc + "%" : ""}</span>
      <div class="mini-bar"><i style="width:${t.mastery}%"></i></div></div><span class="chev">‹</span></div>`).join("")}
  </div>
  <p class="footer-note">זהו כלי לימודי בלבד. הוא אינו תחליף להכשרה מוסמכת, להנחיות רפואיות או לייעוץ מקצועי.</p>
  </div>`;

  $("#dailyCard").onclick = () => d ? toast("✅", "כבר השלמת את האתגר היום – נתראה מחר!") : startMode("daily");
  app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => startMode(b.dataset.go));
  app.querySelectorAll("[data-topic]").forEach(b => b.onclick = () => topicSheet(b.dataset.topic));
}

function topicSheet(f) {
  const t = topicStats(f);
  const bg = document.createElement("div"); bg.className = "modal-bg";
  bg.innerHTML = `<div class="modal"><div style="font-size:34px">${TOPICS[f].icon}</div><h2>${TOPICS[f].name}</h2>
    <p class="muted small">${t.total} שאלות · ראית ${t.seen} · שליטה ${t.mastery}%</p>
    <div class="col" style="margin-top:12px">
      <button class="btn primary block" data-a="quiz">🎯 מבחן של 10 שאלות</button>
      <button class="btn block" data-a="flash">🃏 כרטיסיות לימוד</button>
      <button class="btn ghost block" data-a="x">סגירה</button></div></div>`;
  bg.onclick = e => {
    const a = e.target.dataset.a;
    if (a || e.target === bg) bg.remove();
    if (a === "quiz") startMode("topic", { f });
    if (a === "flash") startFlash([f]);
  };
  document.body.append(bg);
}

/* ───────── מסך תרגול (בונה מבחן) ───────── */
const builder = { topics: new Set(Object.keys(TOPICS)), fmt: "mixed", level: "all", count: 10 };
function renderPractice() {
  const mis = mistakes().length;
  app.innerHTML = `<div class="fade-in">
  <h1>תרגול</h1><p class="muted" style="margin-top:0">בונים מבחן בדיוק לפי מה שצריך.</p>
  <div class="card">
    <h2>🛠️ מבחן מותאם אישית</h2>
    <label class="lbl">תחומים <button class="link-btn xs" id="allT">${builder.topics.size === Object.keys(TOPICS).length ? "נקה הכול" : "בחר הכול"}</button></label>
    <div class="chips" id="tchips">${Object.entries(TOPICS).map(([k, v]) => `<button class="chip ${builder.topics.has(k) ? "on" : ""}" data-k="${k}">${v.icon} ${v.name}</button>`).join("")}</div>
    <label class="lbl">סוג שאלות</label>
    <div class="seg" id="fmt">${[["mixed", "משולב"], ["mc", "אמריקאיות"], ["tf", "נכון/לא"], ["open", "פתוחות"]].map(([k, v]) => `<button data-k="${k}" class="${builder.fmt === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <label class="lbl">רמת קושי</label>
    <div class="seg" id="lvl">${[["all", "הכול"], ...Object.entries(LEVELS)].map(([k, v]) => `<button data-k="${k}" class="${builder.level === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <label class="lbl">מספר שאלות</label>
    <div class="seg" id="cnt">${[5, 10, 15, 20, 30].map(n => `<button data-k="${n}" class="${builder.count === n ? "on" : ""}">${n}</button>`).join("")}</div>
    <div class="switch-row" style="margin-top:8px;border:0"><div><b class="small">משוב מיידי אחרי כל שאלה</b><div class="muted xs">כבוי = תשובות והסברים רק בסוף</div></div>
      <label class="switch"><input type="checkbox" id="instant" ${S.settings.instant ? "checked" : ""}><i></i></label></div>
    <div class="muted xs" id="poolInfo" style="margin:4px 0 12px"></div>
    <button class="btn primary block lg" id="startCustom">התחלת מבחן</button>
  </div>

  <div class="section-title"><h2>מצבי לימוד</h2></div>
  <div class="grid2">
    <button class="mode" data-m="flash"><span class="em">🃏</span><b>כרטיסיות</b><span>הפוך, למד ודרג את עצמך</span></button>
    <button class="mode" data-m="mistakes"><span class="em">🔁</span><b>חזרה על טעויות</b><span>${mis} שאלות</span></button>
    <button class="mode" data-m="bookmarks"><span class="em">⭐</span><b>שאלות שמורות</b><span>${S.bm.length} שאלות</span></button>
    <button class="mode" data-m="due"><span class="em">🧠</span><b>חזרה חכמה</b><span>${dueQuestions().length} שאלות לחזרה היום</span></button>
  </div>
  </div>`;

  const info = () => {
    const n = customPool().length;
    $("#poolInfo").textContent = n ? `${n} שאלות מתאימות במאגר` : "אין שאלות שמתאימות לבחירה – נסה להרחיב";
    $("#startCustom").disabled = !n;
  };
  $("#tchips").onclick = e => {
    const k = e.target.closest(".chip")?.dataset.k; if (!k) return;
    builder.topics.has(k) ? builder.topics.delete(k) : builder.topics.add(k);
    e.target.closest(".chip").classList.toggle("on"); info();
    $("#allT").textContent = builder.topics.size === Object.keys(TOPICS).length ? "נקה הכול" : "בחר הכול";
  };
  $("#allT").onclick = () => {
    if (builder.topics.size === Object.keys(TOPICS).length) builder.topics.clear(); else Object.keys(TOPICS).forEach(k => builder.topics.add(k));
    renderPractice();
  };
  [["#fmt", "fmt"], ["#lvl", "level"], ["#cnt", "count"]].forEach(([sel, key]) => {
    $(sel).onclick = e => {
      const b = e.target.closest("button"); if (!b) return;
      builder[key] = key === "count" ? +b.dataset.k : b.dataset.k;
      $(sel).querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); info();
    };
  });
  $("#instant").onchange = e => { S.settings.instant = e.target.checked; save(); };
  $("#startCustom").onclick = () => startMode("custom");
  app.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
    const m = b.dataset.m;
    if (m === "flash") startFlash([...builder.topics].length ? [...builder.topics] : Object.keys(TOPICS));
    else startMode(m);
  });
  info();
}
function customPool() {
  return BANK.filter(q => builder.topics.has(q.f) && (builder.fmt === "mixed" || q.t === builder.fmt) && (builder.level === "all" || q.l === builder.level));
}
const dueQuestions = () => BANK.filter(q => { const s = S.qs[q.id]; return s && s.due <= Date.now() && s.box < 5; });

/* ───────── בניית סשן ───────── */
let session = null, timerId = null;
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

function pickBalanced(pool, n, rand = Math.random) {
  // בחירה מאוזנת בין תחומים
  const groups = {};
  shuffle(pool, rand).forEach(q => (groups[q.f] = groups[q.f] || []).push(q));
  const keys = shuffle(Object.keys(groups), rand), out = [];
  while (out.length < n && keys.some(k => groups[k].length)) keys.forEach(k => { if (out.length < n && groups[k].length) out.push(groups[k].shift()); });
  return shuffle(out, rand);
}

async function startMode(mode, opt = {}) {
  let qs = [], title = "", instant = true, timeLimit = 0;
  const closed = BANK.filter(q => q.t !== "open");
  switch (mode) {
    case "quick": qs = pickBalanced(BANK, 10); title = "תרגול מהיר"; break;
    case "topic": qs = shuffle(BANK.filter(q => q.f === opt.f)).slice(0, 10); title = TOPICS[opt.f].name; break;
    case "custom": qs = shuffle(customPool()).slice(0, builder.count); title = "מבחן מותאם"; instant = S.settings.instant; break;
    case "daily": {
      const r = rng(parseInt(hash("daily" + today()), 36));
      qs = pickBalanced(closed, 5, r); title = "אתגר יומי"; break;
    }
    case "exam": qs = pickBalanced(closed, 30); title = "סימולציית מבחן"; instant = false; timeLimit = 35 * 60; break;
    case "speed": qs = shuffle(closed); title = "מבחן מהירות"; timeLimit = 60; break;
    case "mistakes": qs = mistakes().slice(0, 15); title = "חזרה על טעויות"; break;
    case "bookmarks": qs = shuffle(S.bm.map(id => BY_ID[id]).filter(Boolean)).slice(0, 20); title = "שאלות שמורות"; break;
    case "due": qs = shuffle(dueQuestions()).slice(0, 15); title = "חזרה חכמה"; break;
    case "retry": qs = opt.qs; title = "תרגול חוזר"; break;
  }
  if (!qs.length) {
    const msg = { mistakes: "אין כרגע שאלות לחזרה – כל הכבוד! ענה על עוד שאלות והטעויות יופיעו כאן.", bookmarks: "עוד לא שמרת שאלות. במהלך מבחן אפשר ללחוץ על ☆ כדי לשמור שאלה.", due: "אין שאלות שמחכות לחזרה היום. תרגל עוד, והאפליקציה תתזמן לך חזרות." }[mode] || "לא נמצאו שאלות.";
    await modal("אין שאלות כאן", msg, "הבנתי", null); return;
  }
  session = {
    mode, title, instant, timeLimit, start: Date.now(),
    items: qs.map(q => ({ q, order: q.t === "mc" ? shuffle(q.o.map((_, i) => i)) : null, ans: null, done: false, grade: null, flag: false })),
    idx: 0, speedOk: 0, speedNo: 0
  };
  document.body.classList.add("in-quiz");
  if (timeLimit) {
    timerId = setInterval(tick, 250);
  }
  renderQuestion();
}
function remaining() { return session.timeLimit - (Date.now() - session.start) / 1000; }
function tick() {
  if (!session) return stopTimer();
  const r = remaining(), el = $("#timer");
  if (el) { el.textContent = fmtTime(r); el.classList.toggle("low", r <= (session.mode === "speed" ? 10 : 120)); }
  if (r <= 0) { stopTimer(); if (session.mode === "speed") finishSpeed(); else finish(true); }
}

/* ───────── הצגת שאלה ───────── */
function renderQuestion() {
  const s = session, it = s.items[s.idx], q = it.q;
  const isSpeed = s.mode === "speed", isExam = !s.instant;
  const bm = S.bm.includes(q.id);
  const total = s.items.length;
  const progress = isSpeed ? 0 : isExam ? pct(s.items.filter(x => x.ans !== null).length, total) : pct(s.idx + (it.done ? 1 : 0), total);

  let opts = "";
  if (q.t === "mc") {
    opts = it.order.map((oi, di) => {
      let cls = "";
      if (it.done && s.instant) { if (oi === q.a) cls = "ok"; else if (di === it.ans) cls = "no"; }
      else if (it.ans === di) cls = "sel";
      return `<button class="opt ${cls}" data-i="${di}" ${it.done && s.instant ? "disabled" : ""}><span class="k">${"אבגד"[di]}</span><span>${esc(q.o[oi])}</span></button>`;
    }).join("");
  } else if (q.t === "tf") {
    opts = `<div class="tf">${[[1, "✓ נכון"], [0, "✗ לא נכון"]].map(([v, l]) => {
      let cls = "";
      if (it.done && s.instant) { if (v === q.a) cls = "ok"; else if (it.ans === v) cls = "no"; }
      else if (it.ans === v) cls = "sel";
      return `<button class="opt ${cls}" data-v="${v}" ${it.done && s.instant ? "disabled" : ""}>${l}</button>`;
    }).join("")}</div>`;
  } else {
    opts = `<textarea id="openAns" placeholder="כתוב כאן את התשובה שלך – גם בנקודות קצרות זה מצוין..." ${it.done ? "readonly" : ""}>${esc(it.ans || "")}</textarea>`;
  }

  let fb = "";
  if (it.done && s.instant && !isSpeed) {
    if (q.t === "open") {
      fb = `<div class="feedback info"><b class="t">📝 תשובה לדוגמה</b>${esc(q.a)}<div class="small muted" style="margin-top:8px">💡 ${esc(q.e)}</div>
        ${it.grade === null ? `<div style="margin-top:12px;font-weight:700">איך ענית ביחס לתשובה לדוגמה?</div>
        <div class="grade"><button class="btn danger" data-g="0">לא ידעתי</button><button class="btn" data-g="0.5">חלקית</button><button class="btn primary" data-g="1">ידעתי</button></div>`
          : `<div style="margin-top:10px" class="small"><b>דירגת: ${it.grade === 1 ? "ידעתי ✅" : it.grade === 0.5 ? "חלקית 🟡" : "לא ידעתי ❌"}</b></div>`}</div>`;
    } else {
      const ok = it.grade === 1;
      const right = q.t === "mc" ? q.o[q.a] : (q.a ? "נכון" : "לא נכון");
      fb = `<div class="feedback ${ok ? "good" : "bad"}"><b class="t">${ok ? pickPraise() : "לא מדויק"}</b>${ok ? "" : `התשובה הנכונה: <b>${esc(right)}</b><br>`}${esc(q.e)}</div>`;
    }
  }

  const last = s.idx === total - 1;
  let actions = "";
  if (isSpeed) actions = "";
  else if (isExam) {
    actions = `<button class="btn" id="prev" ${s.idx === 0 ? "disabled" : ""}>→ הקודמת</button>
      ${last ? `<button class="btn primary" id="submit">הגשת המבחן</button>` : `<button class="btn primary" id="nextQ">הבאה ←</button>`}`;
  } else if (!it.done) actions = `<button class="btn primary lg" id="check">בדיקת תשובה</button>`;
  else if (q.t === "open" && it.grade === null) actions = "";
  else actions = `<button class="btn primary lg" id="nextQ">${last ? "לתוצאות 🏁" : "לשאלה הבאה ←"}</button>`;

  app.innerHTML = `<div class="fade-in">
    <div class="qhead">
      <button class="x" id="quit" aria-label="יציאה">✕</button>
      ${isSpeed ? `<div class="speed-score" style="flex:1">✅ ${s.speedOk} · ❌ ${s.speedNo}</div>` : `<div class="progress"><i style="width:${progress}%"></i></div>`}
      ${s.timeLimit ? `<span class="timer" id="timer">${fmtTime(remaining())}</span>` : `<span class="muted small" style="flex:none">${s.idx + 1}/${total}</span>`}
    </div>
    <div class="tags"><span class="tag">${TOPICS[q.f].icon} ${TOPICS[q.f].name}</span><span class="tag lv-${q.l}">${LEVELS[q.l]}</span><span class="tag">${TYPES[q.t]}</span>${isExam ? `<span class="tag">שאלה ${s.idx + 1} מתוך ${total}</span>` : ""}</div>
    <div class="qtext">${esc(q.q)}</div>
    <div id="opts">${opts}</div>
    ${fb}
    <div class="qtools">
      <button class="bm-btn ${bm ? "on" : ""}" id="bm">${bm ? "★ שמורה" : "☆ שמירת שאלה"}</button>
      ${isExam ? `<button class="bm-btn ${it.flag ? "on" : ""}" id="flag">${it.flag ? "🚩 מסומנת" : "🏳️ סימון לבדיקה"}</button>` : ""}
    </div>
    ${isExam ? `<div class="card flat" style="padding:12px"><div class="muted xs">ניווט מהיר · ${s.items.filter(x => x.ans !== null).length}/${total} נענו</div><div class="navgrid">${s.items.map((x, i) => `<button data-n="${i}" class="${x.ans !== null ? "ans" : ""} ${i === s.idx ? "cur" : ""} ${x.flag ? "flag" : ""}">${i + 1}</button>`).join("")}</div></div>` : ""}
    <div class="qactions">${actions}</div>
  </div>`;
  bindQuestion();
}
const PRAISE = ["נכון! 🎯", "מצוין! 💪", "בדיוק! ✨", "יפה מאוד! 👏", "תשובה נכונה! 🔥"];
const pickPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

function bindQuestion() {
  const s = session, it = s.items[s.idx];
  $("#quit").onclick = quit;
  $("#opts").onclick = e => {
    const b = e.target.closest(".opt"); if (!b || b.disabled) return;
    if (it.done && s.instant) return;
    it.ans = b.dataset.i !== undefined ? +b.dataset.i : +b.dataset.v;
    if (s.mode === "speed") return answerSpeed();
    renderQuestion();
  };
  const ta = $("#openAns"); if (ta) ta.oninput = () => { it.ans = ta.value; };
  $("#check") && ($("#check").onclick = check);
  $("#nextQ") && ($("#nextQ").onclick = next);
  $("#prev") && ($("#prev").onclick = () => { s.idx--; renderQuestion(); });
  $("#submit") && ($("#submit").onclick = submitExam);
  app.querySelectorAll("[data-g]").forEach(b => b.onclick = () => gradeOpen(+b.dataset.g));
  app.querySelectorAll("[data-n]").forEach(b => b.onclick = () => { s.idx = +b.dataset.n; renderQuestion(); });
  $("#bm").onclick = () => {
    const id = it.q.id;
    S.bm = S.bm.includes(id) ? S.bm.filter(x => x !== id) : [...S.bm, id]; save();
    const on = S.bm.includes(id); $("#bm").classList.toggle("on", on); $("#bm").textContent = on ? "★ שמורה" : "☆ שמירת שאלה";
  };
  $("#flag") && ($("#flag").onclick = () => { it.flag = !it.flag; renderQuestion(); });
}

function scoreOf(it) {
  const q = it.q;
  if (it.ans === null || it.ans === "") return 0;
  if (q.t === "mc") return it.order[it.ans] === q.a ? 1 : 0;
  if (q.t === "tf") return it.ans === q.a ? 1 : 0;
  return it.grade;
}
async function check() {
  const s = session, it = s.items[s.idx];
  if (it.ans === null || (typeof it.ans === "string" && !it.ans.trim())) {
    if (it.q.t === "open") {
      if (!(await modal("לא כתבת תשובה", "אפשר לחשוב על התשובה בראש ולראות את התשובה לדוגמה.", "להציג תשובה", "חזרה"))) return;
      it.ans = "";
    } else { toast("👆", "בחר תשובה קודם"); return; }
  }
  it.done = true;
  if (it.q.t !== "open") {
    it.grade = scoreOf(it);
    record(it.q, it.grade);
    if (it.grade === 1) addXP(10);
    beep(it.grade === 1);
    save();
  }
  renderQuestion();
  setTimeout(() => { const f = app.querySelector(".feedback"); f && f.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
}
function gradeOpen(g) {
  const it = session.items[session.idx];
  it.grade = g; record(it.q, g); addXP(10 * g); beep(g > 0); save();
  renderQuestion();
}
function next() {
  const s = session;
  if (!s.instant) { if (s.idx < s.items.length - 1) { s.idx++; renderQuestion(); } return; }
  if (s.idx < s.items.length - 1) { s.idx++; renderQuestion(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  else finish();
}
async function quit() {
  const s = session;
  const answered = s.items.filter(x => x.done || x.ans !== null).length;
  if (answered === 0 || await modal("לצאת מהמבחן?", "התשובות שכבר נבדקו נשמרות בהתקדמות שלך, אבל המבחן לא ייספר כמבחן שהושלם.", "יציאה", "המשך במבחן", true)) go(tab === "practice" ? "practice" : "home");
}
async function submitExam() {
  const s = session;
  const un = s.items.filter(x => x.ans === null).length, fl = s.items.filter(x => x.flag).length;
  const txt = (un ? `יש ${un} שאלות שלא נענו. ` : "") + (fl ? `סימנת ${fl} שאלות לבדיקה. ` : "") + "לאחר ההגשה לא ניתן לשנות תשובות.";
  if (await modal("להגיש את המבחן?", txt, "הגשה", "חזרה למבחן")) finish();
}

/* ───────── מבחן מהירות ───────── */
function answerSpeed() {
  const s = session, it = s.items[s.idx];
  it.done = true; it.grade = scoreOf(it);
  record(it.q, it.grade);
  if (it.grade === 1) { s.speedOk++; addXP(5); } else s.speedNo++;
  beep(it.grade === 1);
  // הצגת הצבע לרגע
  const btns = app.querySelectorAll(".opt");
  btns.forEach(b => {
    const v = b.dataset.i !== undefined ? it.order[+b.dataset.i] : +b.dataset.v;
    const chosen = b.dataset.i !== undefined ? +b.dataset.i === it.ans : +b.dataset.v === it.ans;
    if (v === it.q.a) b.classList.add("ok"); else if (chosen) b.classList.add("no");
    b.disabled = true;
  });
  setTimeout(() => {
    if (!session || session.mode !== "speed") return;
    if (remaining() <= 0) return;
    if (s.idx >= s.items.length - 1) { s.items.push(...shuffle(s.items.map(x => ({ q: x.q, order: x.q.t === "mc" ? shuffle(x.q.o.map((_, i) => i)) : null, ans: null, done: false, grade: null })))); }
    s.idx++; renderQuestion();
  }, it.grade === 1 ? 450 : 900);
}
function finishSpeed() {
  const s = session; const ok = s.speedOk, no = s.speedNo;
  const prev = S.best.speed, isBest = ok > prev;
  if (isBest) S.best.speed = ok;
  touchStreak();
  S.history.unshift({ date: new Date().toLocaleDateString("he-IL"), mode: "speed", title: "מבחן מהירות", score: pct(ok, ok + no), n: ok + no, extra: ok + " נכונות" });
  S.history = S.history.slice(0, 50);
  checkAchievements(); save();
  if (isBest && ok > 0) confetti();
  const answered = s.items.filter(x => x.done);
  showResult({ title: isBest && ok ? "שיא אישי חדש! 🏆" : ok >= 10 ? "מהיר וחד! ⚡" : "סיבוב טוב!", big: ok, bigLabel: "נכונות", p: pct(ok, ok + no),
    sub: `ענית על ${ok + no} שאלות ב־60 שניות · השיא שלך: ${S.best.speed}`, items: answered, xp: ok * 5 });
}

/* ───────── סיום מבחן ───────── */
function finish(timeUp = false) {
  stopTimer();
  const s = session;
  if (!s.instant) {
    // מבחן ללא משוב: בדיקה רק עכשיו
    s.items.forEach(it => { if (it.q.t !== "open") { it.done = true; it.grade = scoreOf(it); record(it.q, it.grade); if (it.grade === 1) addXP(10); } });
  }
  const graded = s.items.filter(it => it.grade !== null);
  const sum = graded.reduce((a, it) => a + it.grade, 0);
  const score = graded.length ? Math.round(sum / graded.length * 100) : 0;
  const correct = graded.filter(it => it.grade === 1).length;
  let bonus = 20;
  if (s.mode === "daily") { S.daily[today()] = { score }; bonus += 30; }
  const perfect = score === 100 && graded.length >= 5;
  if (perfect) bonus += 25;
  const examPassed = s.mode === "exam" && score >= 70;
  addXP(bonus);
  touchStreak();
  S.history.unshift({ date: new Date().toLocaleDateString("he-IL"), mode: s.mode, title: s.title, score, n: s.items.length });
  S.history = S.history.slice(0, 50);
  checkAchievements({ perfect, examPassed }); save();
  if (score >= 85 || examPassed) confetti();

  const xpGained = graded.reduce((a, it) => a + it.grade * 10, 0) + bonus;
  const secs = (Date.now() - s.start) / 1000;
  let title = score >= 90 ? "מצוין! 🌟" : score >= 75 ? "עבודה טובה! 💪" : score >= 55 ? "בכיוון הנכון 👍" : "יש מה לחזק 📚";
  if (s.mode === "exam") title = examPassed ? "עברת את המבחן! 🎓" : "עדיין לא – אבל קרוב 💡";
  showResult({ title, big: score + "%", p: score, items: s.items,
    sub: `${correct} נכונות מתוך ${graded.length}${timeUp ? " · הזמן נגמר ⏰" : ""} · זמן: ${fmtTime(secs)}${s.mode === "exam" ? " · סף מעבר 70%" : ""}`, xp: xpGained });
}

function showResult({ title, big, bigLabel, p, sub, items, xp }) {
  const mode = session.mode;
  session = null; document.body.classList.remove("in-quiz");
  const wrong = items.filter(it => it.grade !== null && it.grade < 1).map(it => it.q);
  const color = p >= 75 ? "var(--accent)" : p >= 55 ? "var(--warn)" : "var(--bad)";
  const reviewHtml = items.map((it, i) => {
    const q = it.q;
    const g = it.grade;
    const pill = g === null ? `<span class="pill mid">לא דורג</span>` : g === 1 ? `<span class="pill ok">נכון</span>` : g > 0 ? `<span class="pill mid">חלקי</span>` : `<span class="pill no">${it.ans === null ? "לא נענתה" : "שגוי"}</span>`;
    let body = "";
    if (q.t === "mc") body = `${it.ans !== null && g < 1 ? `תשובתך: ${esc(q.o[it.order[it.ans]])}<br>` : ""}התשובה הנכונה: <b>${esc(q.o[q.a])}</b>`;
    else if (q.t === "tf") body = `התשובה הנכונה: <b>${q.a ? "נכון" : "לא נכון"}</b>`;
    else body = `תשובה לדוגמה: ${esc(q.a)}`;
    return `<div class="review-item" data-ok="${g === 1 ? 1 : 0}"><div class="q">${pill}${i + 1}. ${esc(q.q)}</div><div class="small">${body}</div><div class="small muted" style="margin-top:4px">💡 ${esc(q.e)}</div></div>`;
  }).join("");

  app.innerHTML = `<div class="fade-in">
    <div class="card" style="text-align:center">
      <div class="muted small">תוצאות</div>
      <div class="ring" style="--p:${p};--c:${color}"><div><div><b>${big}</b>${bigLabel ? `<div class="muted xs">${bigLabel}</div>` : ""}</div></div></div>
      <h1 style="font-size:24px">${title}</h1>
      <p class="muted small" style="margin:4px 0 14px">${sub}</p>
      <div class="grid3">
        <div class="statbox"><b dir="ltr">+${Math.round(xp)}</b><span>XP</span></div>
        <div class="statbox"><b>🔥 ${currentStreak()}</b><span>רצף ימים</span></div>
        <div class="statbox"><b>${levelOf(S.xp)}</b><span>רמה</span></div>
      </div>
      <div class="col" style="margin-top:16px">
        ${wrong.length ? `<button class="btn primary block" id="retry">🔁 תרגול חוזר על ${wrong.length} הטעויות</button>` : ""}
        <div class="row"><button class="btn block" id="again" style="flex:1">שוב</button><button class="btn block" id="share" style="flex:1">שיתוף 📤</button></div>
        <button class="btn ghost block" id="home">חזרה לבית</button>
      </div>
    </div>
    ${items.length ? `<div class="section-title"><h2>סקירת תשובות</h2><button class="link-btn small" id="onlyWrong">רק טעויות</button></div>
    <div class="card" style="padding:4px 16px" id="review">${reviewHtml}</div>` : ""}
  </div>`;
  window.scrollTo(0, 0); updateHeader();
  $("#retry") && ($("#retry").onclick = () => startMode("retry", { qs: shuffle(wrong) }));
  $("#again").onclick = () => mode === "retry" ? go("home") : startMode(mode === "topic" ? "quick" : mode === "daily" ? "quick" : mode);
  $("#home").onclick = () => go("home");
  $("#share").onclick = () => share(`השגתי ${typeof big === "number" ? big + " נכונות במבחן מהירות" : big} ב"מאמן ידע" – אפליקציית תרגול למדריכי כושר 💪`);
  let onlyWrong = false;
  $("#onlyWrong") && ($("#onlyWrong").onclick = () => {
    onlyWrong = !onlyWrong; $("#onlyWrong").textContent = onlyWrong ? "הצג הכול" : "רק טעויות";
    app.querySelectorAll(".review-item").forEach(r => r.classList.toggle("hidden", onlyWrong && r.dataset.ok === "1"));
  });
}
async function share(text) {
  const url = location.href.split("#")[0];
  try {
    if (navigator.share) { await navigator.share({ title: "מאמן ידע", text, url }); return; }
    await navigator.clipboard.writeText(text + " " + url); toast("📋", "הועתק ללוח");
  } catch (e) { }
}

/* ───────── כרטיסיות ───────── */
let flash = null;
function startFlash(topics) {
  const pool = BANK.filter(q => topics.includes(q.f));
  // קודם שאלות חלשות/חדשות, אחר כך השאר
  const sorted = shuffle(pool).sort((a, b) => ((S.qs[a.id]?.box ?? 0) - (S.qs[b.id]?.box ?? 0)));
  flash = { cards: sorted.slice(0, 20), idx: 0, known: 0, again: 0 };
  document.body.classList.add("in-quiz");
  renderFlash();
}
function renderFlash() {
  const f = flash;
  if (f.idx >= f.cards.length) {
    document.body.classList.remove("in-quiz");
    app.innerHTML = `<div class="fade-in card" style="text-align:center"><div style="font-size:46px">🃏</div><h1>סיימת את החפיסה!</h1>
      <p class="muted">ידעת ${f.known} · לחזרה ${f.again}</p><div class="col"><button class="btn primary block" id="fa">חפיסה נוספת</button><button class="btn ghost block" id="fh">חזרה לבית</button></div></div>`;
    touchStreak(); checkAchievements(); save(); updateHeader();
    $("#fa").onclick = () => startFlash(Object.keys(TOPICS)); $("#fh").onclick = () => go("home");
    return;
  }
  const q = f.cards[f.idx];
  const ans = q.t === "mc" ? q.o[q.a] : q.t === "tf" ? (q.a ? "✓ נכון" : "✗ לא נכון") : q.a;
  app.innerHTML = `<div class="fade-in">
    <div class="qhead"><button class="x" id="fq">✕</button><div class="progress"><i style="width:${pct(f.idx, f.cards.length)}%"></i></div><span class="muted small">${f.idx + 1}/${f.cards.length}</span></div>
    <div class="flash-wrap"><div class="flash" id="card">
      <div class="face"><div class="tags"><span class="tag">${TOPICS[q.f].icon} ${TOPICS[q.f].name}</span><span class="tag lv-${q.l}">${LEVELS[q.l]}</span></div>
        <div class="qtext">${esc(q.q)}</div><div class="hint">👆 הקש כדי להפוך</div></div>
      <div class="face back"><div class="muted xs" style="font-weight:700">התשובה</div><div style="font-size:18px;font-weight:750;margin:8px 0 12px">${esc(ans)}</div>
        <div class="small muted">💡 ${esc(q.e)}</div></div>
    </div></div>
    <div class="grid2" style="margin-top:14px"><button class="btn danger lg" id="again">🔁 לחזרה</button><button class="btn primary lg" id="knew">✓ ידעתי</button></div>
  </div>`;
  $("#card").onclick = () => $("#card").classList.toggle("flip");
  $("#fq").onclick = () => go("home");
  const rate = ok => {
    const st = S.qs[q.id] || { s: 0, c: 0, w: 0, box: 0, due: 0 };
    st.box = ok ? Math.min(5, st.box + 1) : 1; st.due = Date.now() + BOX_DAYS[st.box] * DAY; S.qs[q.id] = st;
    S.flashSeen++; ok ? f.known++ : f.again++; if (ok) addXP(3);
    save(); f.idx++; renderFlash();
  };
  $("#again").onclick = () => rate(false); $("#knew").onclick = () => rate(true);
}

/* ───────── מסך התקדמות ───────── */
function renderStats() {
  const acc = pct(S.correct, S.answered);
  const exams = S.history.filter(h => h.mode !== "speed");
  const avg = exams.length ? Math.round(exams.reduce((a, h) => a + (h.score || 0), 0) / exams.length) : null;
  const seen = Object.keys(S.qs).filter(id => BY_ID[id]).length;
  const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(Date.now() - i * DAY); days.push({ k: today(d), l: "אבגדהוש"[d.getDay()] }); }
  app.innerHTML = `<div class="fade-in">
  <h1>ההתקדמות שלך</h1>
  <div class="grid3" style="margin-top:12px">
    <div class="statbox"><b>${S.answered}</b><span>שאלות נענו</span></div>
    <div class="statbox"><b>${S.answered ? acc + "%" : "—"}</b><span>דיוק כללי</span></div>
    <div class="statbox"><b>${avg !== null ? avg + "%" : "—"}</b><span>ממוצע מבחנים</span></div>
    <div class="statbox"><b>🔥 ${currentStreak()}</b><span>רצף נוכחי</span></div>
    <div class="statbox"><b>${S.streak.best}</b><span>רצף שיא</span></div>
    <div class="statbox"><b>⚡ ${S.best.speed}</b><span>שיא מהירות</span></div>
  </div>
  <div class="card">
    <h2>השבוע שלך</h2><div class="muted xs">ימים שבהם תרגלת</div>
    <div class="week">${days.map(d => `<div><i class="${S.days.includes(d.k) ? "on" : ""}"></i>${d.l}׳</div>`).join("")}</div>
  </div>
  <div class="card">
    <h2>שליטה לפי תחום</h2><div class="muted xs">שליטה עולה כשעונים נכון שוב ושוב לאורך זמן · ראית ${seen} מתוך ${BANK.length} שאלות</div>
    ${Object.keys(TOPICS).map(f => { const t = topicStats(f); return `<div class="bar-row"><div class="top"><span>${TOPICS[f].icon} ${TOPICS[f].name}</span><span class="muted">${t.mastery}%${t.acc !== null ? ` · דיוק ${t.acc}%` : ""}</span></div><div class="track"><i style="width:${t.mastery}%;background:${t.acc === null ? "var(--line)" : t.acc >= 75 ? "var(--accent)" : t.acc >= 55 ? "var(--warn)" : "var(--bad)"}"></i></div></div>`; }).join("")}
  </div>
  <div class="card">
    <h2>הישגים <span class="muted small">${Object.keys(S.ach).length}/${ACH.length}</span></h2>
    <div class="ach-grid">${ACH.map(a => `<div class="ach ${S.ach[a.id] ? "on" : ""}"><div class="em">${a.em}</div><b>${a.t}</b><span>${a.d}</span></div>`).join("")}</div>
  </div>
  <div class="card">
    <h2>מבחנים אחרונים</h2>
    ${S.history.length ? S.history.slice(0, 15).map(h => `<div class="hist-row"><span>${esc(h.title || "מבחן")} <span class="muted xs">· ${esc(h.date)}${h.n ? " · " + h.n + " שאלות" : ""}</span></span><b>${h.extra ? esc(h.extra) : h.score === null || h.score === undefined ? "—" : h.score + "%"}</b></div>`).join("")
      : `<div class="empty"><span class="em">📝</span>עדיין אין תוצאות. המבחן הראשון מחכה לך!</div>`}
  </div></div>`;
}

/* ───────── מילון ───────── */
function renderGlossary() {
  app.innerHTML = `<div class="fade-in"><h1>מילון מונחים</h1><p class="muted" style="margin-top:0">${GLOSSARY.length} מונחים שכל מדריך כושר צריך להכיר.</p>
    <input class="search" id="gq" type="search" placeholder="🔍 חיפוש מונח..." autocomplete="off">
    <div class="card" style="padding:4px 16px" id="glist"></div></div>`;
  const draw = term => {
    const t = term.trim().toLowerCase();
    const list = GLOSSARY.filter(([k, v]) => !t || k.toLowerCase().includes(t) || v.toLowerCase().includes(t)).sort((a, b) => a[0].localeCompare(b[0], "he"));
    $("#glist").innerHTML = list.length ? list.map(([k, v]) => `<div class="term"><b>${esc(k)}</b><span class="muted small">${esc(v)}</span></div>`).join("") : `<div class="empty"><span class="em">🤷</span>לא נמצא מונח מתאים</div>`;
  };
  $("#gq").oninput = e => draw(e.target.value); draw("");
}

/* ───────── הגדרות ───────── */
function renderSettings() {
  document.querySelectorAll(".nav button").forEach(b => b.classList.remove("on"));
  const st = S.settings;
  app.innerHTML = `<div class="fade-in"><h1>הגדרות</h1>
  <div class="card">
    <label class="lbl" style="margin-top:0">ערכת צבעים</label>
    <div class="seg" id="theme">${[["auto", "אוטומטי"], ["dark", "כהה 🌙"], ["light", "בהיר ☀️"]].map(([k, v]) => `<button data-k="${k}" class="${st.theme === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <div style="margin-top:10px">
      <div class="switch-row"><b class="small">צלילים</b><label class="switch"><input type="checkbox" data-s="sound" ${st.sound ? "checked" : ""}><i></i></label></div>
      <div class="switch-row"><b class="small">רטט</b><label class="switch"><input type="checkbox" data-s="vib" ${st.vib ? "checked" : ""}><i></i></label></div>
      <div class="switch-row"><div><b class="small">משוב מיידי במבחן מותאם</b><div class="muted xs">אחרי כל שאלה, או רק בסוף</div></div><label class="switch"><input type="checkbox" data-s="instant" ${st.instant ? "checked" : ""}><i></i></label></div>
    </div>
  </div>
  <div class="card">
    <h2>הנתונים שלך</h2>
    <p class="muted small" style="margin-top:0">כל הנתונים נשמרים רק במכשיר הזה. אפשר לגבות ולשחזר אותם – למשל כשעוברים לטלפון חדש.</p>
    <div class="col">
      <button class="btn block" id="exp">💾 גיבוי לקובץ</button>
      <button class="btn block" id="imp">📂 שחזור מקובץ</button>
      <input type="file" id="impFile" accept="application/json,.json" class="hidden">
      <button class="btn danger block" id="reset">🗑️ איפוס כל ההתקדמות</button>
    </div>
  </div>
  <div class="card">
    <h2>על האפליקציה</h2>
    <p class="muted small" style="margin-top:0">מאמן ידע · גרסה ${APP_VERSION} · ${BANK.length} שאלות ב־${Object.keys(TOPICS).length} תחומים</p>
    <div class="col">
      <button class="btn block" id="installBtn">📲 התקנה למסך הבית</button>
      <button class="btn block" id="shareApp">📤 שיתוף האפליקציה</button>
      <a class="btn ghost block" href="privacy.html" style="text-decoration:none;color:inherit">🔒 מדיניות פרטיות</a>
    </div>
    <p class="footer-note">כלי לימודי בלבד. אינו תחליף להכשרה מוסמכת, להנחיות רפואיות או לייעוץ מקצועי. שאלות פתוחות נבדקות בבדיקה עצמית מול תשובה לדוגמה.</p>
  </div></div>`;
  $("#theme").onclick = e => { const b = e.target.closest("button"); if (!b) return; st.theme = b.dataset.k; save(); applyTheme(); renderSettings(); };
  app.querySelectorAll("[data-s]").forEach(i => i.onchange = () => { st[i.dataset.s] = i.checked; save(); if (i.dataset.s === "sound" && i.checked) beep(true); });
  $("#exp").onclick = () => {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `coach-knowledge-backup-${today()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast("💾", "הגיבוי נשמר");
  };
  $("#imp").onclick = () => $("#impFile").click();
  $("#impFile").onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || !("xp" in data) || !("qs" in data)) throw 0;
      if (!(await modal("לשחזר גיבוי?", "ההתקדמות הנוכחית תוחלף בנתונים מהקובץ.", "שחזור", "ביטול"))) return;
      localStorage.setItem(KEY, JSON.stringify(data)); S = load(); applyTheme(); toast("✅", "הגיבוי שוחזר"); go("home");
    } catch (err) { modal("הקובץ לא תקין", "זה לא נראה כמו קובץ גיבוי של מאמן ידע.", "הבנתי", null); }
  };
  $("#reset").onclick = async () => {
    if (await modal("לאפס הכול?", "כל ההיסטוריה, הנקודות, ההישגים והשאלות השמורות יימחקו. אי אפשר לבטל את זה.", "איפוס", "ביטול", true)) {
      const theme = S.settings; S = DEFAULT(); S.settings = theme; save(); toast("🧹", "ההתקדמות אופסה"); go("home");
    }
  };
  $("#installBtn").onclick = install;
  $("#shareApp").onclick = () => share("מאמן ידע – אפליקציה חינמית לתרגול ומבחנים למדריכי כושר 💪");
}

/* ───────── מקלדת ───────── */
document.addEventListener("keydown", e => {
  if (!session || e.target.tagName === "TEXTAREA") return;
  const it = session.items[session.idx];
  const keys = { "1": 0, "2": 1, "3": 2, "4": 3 };
  if (e.key in keys && it.q.t === "mc" && !(it.done && session.instant)) { it.ans = keys[e.key]; session.mode === "speed" ? answerSpeed() : renderQuestion(); }
  if (e.key === "Enter") { const b = $("#check") || $("#nextQ"); b && b.click(); }
});

/* ───────── התקנה ו־Service Worker ───────── */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; });
async function install() {
  if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; }
  else if (matchMedia("(display-mode: standalone)").matches) toast("✅", "האפליקציה כבר מותקנת");
  else modal("התקנה למסך הבית", "פתח את תפריט הדפדפן ובחר 'הוספה למסך הבית' או 'התקנת אפליקציה'.", "הבנתי", null);
}
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(() => { });

/* ───────── הפעלה ───────── */
applyTheme();
const startParam = new URLSearchParams(location.search).get("mode");
go("home");
if (startParam && ["daily", "quick", "speed", "exam"].includes(startParam)) {
  if (!(startParam === "daily" && S.daily[today()])) startMode(startParam);
}
