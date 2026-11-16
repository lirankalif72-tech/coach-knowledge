"use strict";
/* מאמן ידע – לוגיקת האפליקציה */

const APP_VERSION = "8.9.2";
const KEY = "ck_state_v3";
const CONTACT = "lirankalif72@gmail.com";
const LEVELS = { easy: "קל", medium: "בינוני", hard: "מתקדם", expert: "מומחה" };
const TYPES = { mc: "אמריקאית", tf: "נכון / לא נכון", open: "פתוחה" };
const DAY = 86400000;
const BOX_DAYS = [0, 1, 2, 4, 8, 16];
const SAVER_ROTATE = 120; // שניות בין עובדות בשומר המסך

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
const topicOf = f => TOPICS[f] || { name: "מילון מונחים", icon: "📖" };
const baseUrl = () => location.origin + location.pathname;

BANK.forEach(q => { q.id = q.f + "-" + hash(q.q + (q.img || "")); });
const BY_ID = Object.fromEntries(BANK.map(q => [q.id, q]));
const TOPIC_KEYS = Object.keys(TOPICS);

/* ───────── מצב שמור ───────── */
const DEFAULT = () => ({
  v: 4, xp: 0, answered: 0, correct: 0, flashSeen: 0, name: "", goal: 20, onboarded: false,
  history: [], qs: {}, bm: [], ach: {}, days: [], goalDays: [], todayN: { d: "", n: 0 },
  streak: { n: 0, best: 0, last: null }, daily: {}, best: { speed: 0, survival: 0, combo: 0 },
  factSeen: [], factFav: [], challenges: 0, certs: 0, foodText: "", myFoods: [],
  mode: null, coins: 60, coinsTotal: 0, items: { fifty: 2, skip: 2, time: 1, shield: 1 }, map: {}, missions: null, accent: "green", owned: ["green"],
  settings: {
    theme: "auto", sound: true, vib: true, instant: true,
    rem: { on: false, every: 120, at: "18:00", quietFrom: "22:00", quietTo: "08:00", fact: true, last: 0 },
    saver: { on: true, idle: 60, wake: true }
  }
});
let S = load();
function load() {
  const d = DEFAULT();
  let s = d;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      s = Object.assign(d, p);
      s.settings = Object.assign(DEFAULT().settings, p.settings || {});
      s.settings.rem = Object.assign(DEFAULT().settings.rem, (p.settings || {}).rem || {});
      s.settings.saver = Object.assign(DEFAULT().settings.saver, (p.settings || {}).saver || {});
      s.streak = Object.assign(DEFAULT().streak, p.streak || {});
      s.best = Object.assign(DEFAULT().best, p.best || {});
      s.todayN = Object.assign(DEFAULT().todayN, p.todayN || {});
      s.items = Object.assign({ fifty: 0, skip: 0, time: 0, shield: 0 }, p.items || DEFAULT().items);
      s.map = p.map || {}; s.owned = p.owned || ["green"];
      if (p.history && p.history.length) s.onboarded = true;
    } else {
      const old = JSON.parse(localStorage.getItem("fitnessHistory") || "[]");
      if (Array.isArray(old) && old.length) { s.history = old.map(h => ({ date: h.date, mode: "custom", title: "מבחן", score: h.score, n: (h.total || 0) + (h.open || 0) })); s.onboarded = true; }
    }
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
  if (after > before) setTimeout(() => levelUp(after), 500);
}

/* ───────── רצף, מטרה יומית ───────── */
function touchStreak() {
  const t = today();
  if (!S.days.includes(t)) { S.days.push(t); S.days = S.days.slice(-90); }
  if (S.streak.last === t) return;
  const gap = S.streak.last ? dayDiff(S.streak.last, t) : 99;
  if (gap === 1) S.streak.n++;
  else if (gap === 2 && (S.items.shield || 0) > 0) { S.items.shield--; S.streak.n++; setTimeout(() => toast("🛡️", "מגן הרצף הציל את הרצף שלך!"), 600); }
  else S.streak.n = 1;
  S.streak.last = t;
  S.streak.best = Math.max(S.streak.best, S.streak.n);
}
const currentStreak = () => { if (!S.streak.last) return 0; const g = dayDiff(S.streak.last, today()); return g <= 1 || (g === 2 && (S.items.shield || 0) > 0) ? S.streak.n : 0; };
const todayCount = () => S.todayN.d === today() ? S.todayN.n : 0;
function bumpToday() {
  const t = today();
  if (S.todayN.d !== t) S.todayN = { d: t, n: 0 };
  S.todayN.n++;
  if (S.todayN.n === S.goal && !S.goalDays.includes(t)) {
    S.goalDays.push(t); S.goalDays = S.goalDays.slice(-120);
    addXP(25);
    setTimeout(() => { toast("🎯", `השלמת את המטרה היומית – ${S.goal} שאלות! ‎+25 XP`); confetti(); }, 300);
  }
}

/* ───────── חזרה מרווחת ───────── */
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
  if (score >= 1) { S.correct++; if (typeof missionEvent === "function") missionEvent("correct", { f: q.f }); }
  bumpToday();
}
const mistakes = () => BANK.filter(q => { const s = S.qs[q.id]; return s && s.w > 0 && s.box <= 2; })
  .sort((a, b) => (S.qs[a.id].box - S.qs[b.id].box) || (S.qs[a.id].due - S.qs[b.id].due));
const dueQuestions = () => BANK.filter(q => { const s = S.qs[q.id]; return s && s.due <= Date.now() && s.box < 5; });
function topicStats(f) {
  const qs = BANK.filter(q => q.f === f);
  let seen = 0, c = 0, s = 0, box = 0;
  qs.forEach(q => { const st = S.qs[q.id]; if (st) { seen++; c += st.c; s += st.s; box += st.box; } });
  return { total: qs.length, seen, acc: s ? pct(c, s) : null, mastery: Math.round(box / (qs.length * 5) * 100) };
}
function groupAcc(keyFn) {
  const g = {};
  BANK.forEach(q => { const st = S.qs[q.id]; if (!st || !st.s) return; const k = keyFn(q); g[k] = g[k] || { c: 0, s: 0 }; g[k].c += st.c; g[k].s += st.s; });
  return g;
}

/* ───────── הישגים ───────── */
const ACH = [
  { id: "first", em: "🎉", t: "צעד ראשון", d: "סיימת מבחן ראשון" },
  { id: "perfect", em: "💯", t: "מושלם", d: "100% במבחן של 5+ שאלות" },
  { id: "streak3", em: "🔥", t: "על הגל", d: "רצף של 3 ימים" },
  { id: "streak7", em: "🏅", t: "שבוע מלא", d: "רצף של 7 ימים" },
  { id: "streak30", em: "👑", t: "חודש של התמדה", d: "רצף של 30 ימים" },
  { id: "goal1", em: "🎯", t: "בול במטרה", d: "השלמת מטרה יומית" },
  { id: "goal7", em: "📈", t: "7 מטרות", d: "השלמת 7 מטרות יומיות" },
  { id: "q100", em: "📚", t: "100 שאלות", d: "ענית על 100 שאלות" },
  { id: "q500", em: "🧠", t: "מכונת ידע", d: "ענית על 500 שאלות" },
  { id: "q1000", em: "🏆", t: "אלוף הידע", d: "ענית על 1,000 שאלות" },
  { id: "daily5", em: "📅", t: "יומי קבוע", d: "5 אתגרים יומיים" },
  { id: "speed10", em: "⚡", t: "זריז", d: "10+ במבחן מהירות" },
  { id: "speed20", em: "🚀", t: "ברק", d: "20+ במבחן מהירות" },
  { id: "survive10", em: "❤️", t: "שורד", d: "10+ במצב הישרדות" },
  { id: "survive25", em: "🛡️", t: "בלתי שביר", d: "25+ במצב הישרדות" },
  { id: "exam", em: "🎓", t: "עברת!", d: "עברת סימולציית מבחן" },
  { id: "cert", em: "📜", t: "בעל תעודה", d: "הורדת תעודת הצטיינות" },
  { id: "topics", em: "🗺️", t: "סייר", d: "ענית בכל התחומים" },
  { id: "master", em: "🥇", t: "מומחה תחום", d: "50% שליטה בתחום" },
  { id: "flash50", em: "🃏", t: "שולף כרטיסים", d: "50 כרטיסיות" },
  { id: "facts50", em: "💡", t: "סקרן", d: "קראת 50 עובדות" },
  { id: "challenge", em: "🤝", t: "מאתגר", d: "שלחת אתגר לחבר" },
  { id: "boss", em: "👑", t: "קוטל בוסים", d: "הבסת בוס במסע" },
  { id: "stars30", em: "🌟", t: "אספן כוכבים", d: "30 כוכבים במסע" },
  { id: "combo10", em: "☄️", t: "בלתי עציר", d: "קומבו של 10" },
  { id: "rich", em: "💰", t: "עשיר", d: "הרווחת 500 מטבעות" },
  { id: "chest", em: "🎁", t: "צייד אוצרות", d: "פתחת תיבת אוצר" }
];
function unlock(id) {
  if (S.ach[id]) return;
  S.ach[id] = today();
  const a = ACH.find(x => x.id === id);
  setTimeout(() => toast(a.em, "הישג חדש: " + a.t), 900);
}
function checkAchievements(ctx = {}) {
  if (S.history.length) unlock("first");
  if (ctx.perfect) unlock("perfect");
  const st = currentStreak();
  if (st >= 3) unlock("streak3");
  if (st >= 7) unlock("streak7");
  if (st >= 30) unlock("streak30");
  if (S.goalDays.length >= 1) unlock("goal1");
  if (S.goalDays.length >= 7) unlock("goal7");
  if (S.answered >= 100) unlock("q100");
  if (S.answered >= 500) unlock("q500");
  if (S.answered >= 1000) unlock("q1000");
  if (Object.keys(S.daily).length >= 5) unlock("daily5");
  if (S.best.speed >= 10) unlock("speed10");
  if (S.best.speed >= 20) unlock("speed20");
  if (S.best.survival >= 10) unlock("survive10");
  if (S.best.survival >= 25) unlock("survive25");
  if (ctx.examPassed) unlock("exam");
  if (S.certs > 0) unlock("cert");
  if (TOPIC_KEYS.every(f => BANK.some(q => q.f === f && S.qs[q.id]))) unlock("topics");
  if (TOPIC_KEYS.some(f => topicStats(f).mastery >= 50)) unlock("master");
  if (S.flashSeen >= 50) unlock("flash50");
  if (S.factSeen.length >= 50) unlock("facts50");
  if (S.challenges > 0) unlock("challenge");
  if (Object.values(S.jr || {}).some(m => m.boss)) unlock("boss");
  if (Object.values(S.jr || {}).reduce((a, m) => a + (m.st || []).reduce((x, y) => x + (y || 0), 0), 0) >= 30) unlock("stars30");
  if ((S.best.combo || 0) >= 10) unlock("combo10");
  if ((S.coinsTotal || 0) >= 500) unlock("rich");
  if (S.chests > 0) unlock("chest");
}

/* ───────── סאונד ורטט ───────── */
let actx = null;
function beep(good, up = 0) {
  if (S.settings.vib && navigator.vibrate) navigator.vibrate(good ? 25 : [40, 50, 40]);
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    (good ? [660 * (1 + up * 0.06), 880 * (1 + up * 0.06)] : [220, 180]).forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = good ? "sine" : "triangle"; o.frequency.value = f;
      const t = actx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.18);
    });
  } catch (e) { }
}

/* ───────── ממשק כללי ───────── */
function floatReward(text) {
  const el = document.createElement("div"); el.className = "float-rew"; el.setAttribute("dir", "ltr"); el.textContent = text;
  document.body.append(el); setTimeout(() => el.remove(), 1300);
}
function levelUp(L) {
  const bonus = 25 + L * 5; addCoins(bonus); save();
  confetti(); beep(true, 6);
  sheet(`<div class="lvup"><div class="lvup-badge">${L}</div><h2>עלית רמה!</h2><p class="muted">התואר החדש שלך: <b>${levelTitle(L)}</b></p>
    <div class="lvup-gift" dir="ltr">+${bonus} 🪙</div><button class="btn primary lg" data-close>יאללה, ממשיכים 💪</button></div>`, (e, close) => { if (e.target.closest("[data-close]")) close(); });
}
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
function sheet(html, onClick) {
  const bg = document.createElement("div"); bg.className = "modal-bg";
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => bg.remove();
  bg.addEventListener("click", e => { if (e.target === bg) return close(); onClick && onClick(e, close); });
  document.body.append(bg);
  return { bg, close };
}
function modal(title, text, okLabel = "אישור", cancelLabel = "ביטול", danger = false) {
  return new Promise(res => {
    const { bg } = sheet(`<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p>
      <div class="row">${cancelLabel ? `<button class="btn" data-r="0">${esc(cancelLabel)}</button>` : ""}<button class="btn ${danger ? "danger" : "primary"}" data-r="1">${esc(okLabel)}</button></div>`,
      (e, close) => { const r = e.target.dataset.r; if (r !== undefined) { close(); res(r === "1"); } });
    bg.addEventListener("click", e => { if (e.target === bg) res(false); });
    bg.querySelector('[data-r="1"]').focus();
  });
}
function prompt2(title, text, value = "", placeholder = "") {
  return new Promise(res => {
    const { bg } = sheet(`<h2>${esc(title)}</h2><p class="muted small">${esc(text)}</p><input class="search" id="p2" value="${esc(value)}" placeholder="${esc(placeholder)}" maxlength="40">
      <div class="row"><button class="btn" data-r="0">ביטול</button><button class="btn primary" data-r="1">אישור</button></div>`,
      (e, close) => { const r = e.target.dataset.r; if (r !== undefined) { const v = bg.querySelector("#p2").value.trim(); close(); res(r === "1" ? v : null); } });
    bg.addEventListener("click", e => { if (e.target === bg) res(null); });
    setTimeout(() => bg.querySelector("#p2").focus(), 50);
  });
}
function applyTheme() {
  const t = S.settings.theme;
  const real = t === "auto" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : t;
  document.documentElement.dataset.theme = real;
  if (typeof applyAccent === "function") applyAccent();
  document.querySelector('meta[name="theme-color"]').content = real === "light" ? "#f3f5f9" : "#0b0f17";
}
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", applyTheme);
function updateHeader() {
  $("#streakChip span").textContent = currentStreak();
  $("#coinChip span").textContent = S.coins;
  $("#coinChip").classList.toggle("hidden", S.mode !== "play");
  $("#modeChip").textContent = S.mode === "play" ? "🎮" : "📚";
  $("#modeChip").title = S.mode === "play" ? "מצב משחק – הקש למצב לימוד" : "מצב לימוד – הקש למצב משחק";
}
function goalRing(size = 58) {
  const n = todayCount(), p = Math.min(100, pct(n, S.goal)), done = n >= S.goal;
  return `<div class="goal-ring ${done ? "done" : ""}" style="--p:${p};width:${size}px;height:${size}px" title="מטרה יומית: ${n} מתוך ${S.goal}"><div>${done ? `<b>✓</b><span>מטרה</span>` : `<b>${n}</b><span dir="ltr">/${S.goal}</span>`}</div></div>`;
}
function figHtml(q) { return q.img && typeof FIGS !== "undefined" && FIGS[q.img] ? `<div class="fig">${FIGS[q.img]}</div>` : ""; }

/* ───────── ניווט ───────── */
let tab = "home";
function go(t, sub) {
  stopTimer(); stopFactTimer();
  tab = t; session = null; flash = null; document.body.classList.remove("in-quiz");
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === t));
  ({ home: renderHome, practice: renderPractice, learn: renderLearn, plan: s => renderPlan(s), tools: renderTools, stats: renderStats, settings: renderSettings })[t](sub);
  updateHeader(); window.scrollTo(0, 0);
}
document.querySelectorAll(".nav button").forEach(b => b.onclick = () => go(b.dataset.tab));
$("#settingsBtn").onclick = () => go("settings");

/* ───────── עובדות ───────── */
function nextFact(cat) {
  const pool = FACTS.map((f, i) => ({ ...f, i })).filter(f => !cat || f.c === cat);
  const unseen = pool.filter(f => !S.factSeen.includes(f.i));
  const pick = (unseen.length ? unseen : pool)[Math.floor(Math.random() * (unseen.length ? unseen.length : pool.length))];
  if (!S.factSeen.includes(pick.i)) { S.factSeen.push(pick.i); save(); }
  return pick;
}
const factTag = c => c === "psy" ? "🧠 פסיכולוגיה" : "💪 כושר וגוף";
let factTimer = null;
function stopFactTimer() { if (factTimer) { clearInterval(factTimer); factTimer = null; } }

/* ───────── מסך בית ───────── */
function renderHome() {
  if (S.mode === "play") return renderPlayHome();
  const L = levelOf(S.xp), lo = xpFor(L), hi = xpFor(L + 1);
  const d = S.daily[today()];
  const mis = mistakes().length;
  const h = new Date().getHours();
  const greet = h < 5 ? "לילה טוב" : h < 12 ? "בוקר טוב" : h < 17 ? "צהריים טובים" : h < 21 ? "ערב טוב" : "לילה טוב";
  const ts = TOPIC_KEYS.map(f => ({ f, ...topicStats(f) }));
  const tried = ts.filter(t => t.seen >= 3 && t.acc !== null).sort((a, b) => a.acc - b.acc);
  const untried = ts.filter(t => t.seen === 0);
  let rec = null;
  if (tried.length && tried[0].acc < 80) rec = { f: tried[0].f, why: `הדיוק שלך כאן ${tried[0].acc}% – בוא נחזק` };
  else if (untried.length) rec = { f: untried[0].f, why: "עוד לא תרגלת את התחום הזה" };
  const termIdx = parseInt(hash("term" + today()), 36) % GLOSSARY.length;
  const [term, def] = GLOSSARY[termIdx];
  const fact = nextFact();

  app.innerHTML = `<div class="fade-in">
  <div class="hero">
    <div class="muted small">${greet}${S.name ? ", " + esc(S.name) : ""} 👋</div>
    <div class="level-row" style="margin-top:8px">
      <div class="level-badge">${L}</div>
      <div style="flex:1;min-width:0">
        <b style="font-size:17px">${levelTitle(L)}</b>
        <div class="muted xs">${S.xp - lo} / ${hi - lo} XP לרמה הבאה</div>
        <div class="xpbar"><i style="width:${pct(S.xp - lo, hi - lo)}%"></i></div>
      </div>
      ${goalRing()}
    </div>
  </div>

  <button class="card coach-card" id="coachCard"><span class="em">🧑‍🏫</span><div style="flex:1;text-align:start"><b>האימון האישי שלך</b><div class="muted small">${rec ? esc(rec.why) + " · " + TOPICS[rec.f].icon + " " + TOPICS[rec.f].name : "5 דקות על מה שהכי צריך חיזוק"}</div></div><span class="chev">‹</span></button>

  <div id="todayRow" class="today-row"></div>

  <div class="card fact-card" id="factCard">
    <div class="row" style="justify-content:space-between"><b>💡 הידעת?</b><span class="tag">${factTag(fact.c)}</span></div>
    <p id="factText" style="margin:8px 0 10px;font-size:15.5px">${linkTerms(fact.t)}</p>
    <div class="row"><button class="link-btn small" id="factFav">${S.factFav.includes(fact.i) ? "❤️ אהובה" : "🤍 שמירה"}</button><button class="link-btn small" id="factAsk">❓ לא הבנתי</button><span class="spacer"></span><button class="link-btn small" id="factNext">עוד אחת ←</button></div>
  </div>

  <div class="section-title"><h2>🎯 תרגול</h2></div>
  <div class="grid2">
    <button class="mode" data-go="quick"><span class="em">🎲</span><b>תרגול מהיר</b><span>10 שאלות ברמה שלך</span></button>
    <button class="mode" data-go="exam"><span class="em">🎓</span><b>סימולציית מבחן</b><span>30 שאלות · 35 דק׳</span></button>
    <button class="mode" data-go="mistakes"><span class="em">🔁</span><b>חזרה על טעויות</b><span>${mis ? mis + " שאלות לחיזוק" : "אין טעויות פתוחות"}</span></button>
    <button class="mode" id="flashBtn"><span class="em">🗂️</span><b>כרטיסיות</b><span>ידעתי / לא ידעתי</span></button>
  </div>
  <button class="btn block more-btn" id="moreModes">➕ עוד דרכים לתרגל ולשחק</button>

  <div class="section-title"><h2>📚 תחומי לימוד</h2><span class="muted xs">${BANK.length} שאלות</span></div>
  <div class="card" style="padding:4px 16px">
    ${ts.map(t => `<div class="topic" data-topic="${t.f}">
      <div class="em">${TOPICS[t.f].icon}</div>
      <div class="tx"><b>${TOPICS[t.f].name}</b><span class="muted xs">${t.total} שאלות · שליטה ${t.mastery}%${t.acc !== null ? " · דיוק " + t.acc + "%" : ""}</span>
      <div class="mini-bar"><i style="width:${t.mastery}%"></i></div></div><span class="chev">‹</span></div>`).join("")}
  </div>
  <p class="footer-note">זהו כלי לימודי בלבד. הוא אינו תחליף להכשרה מוסמכת, להנחיות רפואיות או לייעוץ מקצועי.</p>
  </div>`;

  app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => startMode(b.dataset.go));
  app.querySelectorAll("[data-topic]").forEach(b => b.onclick = () => topicSheet(b.dataset.topic));
  $("#coachCard").onclick = () => typeof coachSession === "function" ? coachSession() : startMode("quick");
  $("#flashBtn").onclick = () => typeof flashSwipe === "function" ? flashSwipe() : startFlash(TOPIC_KEYS);
  $("#moreModes").onclick = () => typeof moreModesSheet === "function" && moreModesSheet();
  let cur = fact;
  const showFact = f => {
    cur = f; const el = $("#factText"); if (!el) return stopFactTimer();
    el.classList.remove("fade-in"); void el.offsetWidth; el.classList.add("fade-in");
    el.innerHTML = linkTerms(f.t); $("#factCard .tag").textContent = factTag(f.c);
    $("#factFav").textContent = S.factFav.includes(f.i) ? "❤️ אהובה" : "🤍 שמירה";
  };
  $("#factNext").onclick = () => showFact(nextFact());
  $("#factFav").onclick = () => { toggleFav(cur.i); showFact(cur); };
  $("#factAsk").onclick = () => askSheet(cur.t);
  factTimer = setInterval(() => showFact(nextFact()), SAVER_ROTATE * 1000);
}
function toggleFav(i) { S.factFav = S.factFav.includes(i) ? S.factFav.filter(x => x !== i) : [...S.factFav, i]; save(); }

function topicSheet(f) {
  const t = topicStats(f);
  sheet(`<div style="font-size:34px">${TOPICS[f].icon}</div><h2>${TOPICS[f].name}</h2>
    <p class="muted small">${t.total} שאלות · ראית ${t.seen} · שליטה ${t.mastery}%</p>
    <div class="col" style="margin-top:12px">
      <button class="btn primary block" data-a="quiz">🎯 מבחן של 10 שאלות</button>
      <button class="btn block" data-a="lesson">📘 שיעור קצר</button>
      <button class="btn block" data-a="flash">🃏 כרטיסיות לימוד</button>
      <button class="btn ghost block" data-a="x">סגירה</button></div>`,
    (e, close) => {
      const a = e.target.dataset.a; if (!a) return; close();
      if (a === "quiz") startMode("topic", { f });
      if (a === "flash") startFlash([f]);
      if (a === "lesson") go("learn", { lesson: f });
    });
}

/* ───────── מסך תרגול ───────── */
const builder = { topics: new Set(TOPIC_KEYS), fmt: "mixed", level: "all", count: 10 };
function renderPractice() {
  const mis = mistakes().length, allOn = builder.topics.size === TOPIC_KEYS.length;
  app.innerHTML = `<div class="fade-in">
  <h1>תרגול</h1><p class="muted" style="margin-top:0">בונים מבחן בדיוק לפי מה שצריך.</p>
  <div class="card">
    <h2>🛠️ מבחן מותאם אישית</h2>
    <label class="lbl">תחומים <button class="link-btn xs" id="allT">${allOn ? "נקה הכול" : "בחר הכול"}</button></label>
    <div class="chips" id="tchips">${TOPIC_KEYS.map(k => `<button class="chip ${builder.topics.has(k) ? "on" : ""}" data-k="${k}">${TOPICS[k].icon} ${TOPICS[k].name}</button>`).join("")}</div>
    <label class="lbl">סוג שאלות</label>
    <div class="seg" id="fmt">${[["mixed", "משולב"], ["mc", "אמריקאיות"], ["tf", "נכון/לא"], ["open", "פתוחות"], ["img", "איורים"]].map(([k, v]) => `<button data-k="${k}" class="${builder.fmt === k ? "on" : ""}">${v}</button>`).join("")}</div>
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
    <button class="mode" data-m="due"><span class="em">🧠</span><b>חזרה חכמה</b><span>${dueQuestions().length} שאלות לחזרה היום</span></button>
    <button class="mode" data-m="mistakes"><span class="em">🔁</span><b>חזרה על טעויות</b><span>${mis} שאלות</span></button>
    <button class="mode" data-m="bookmarks"><span class="em">⭐</span><b>שאלות שמורות</b><span>${S.bm.length} שאלות</span></button>
    <button class="mode" data-m="survival"><span class="em">❤️</span><b>הישרדות</b><span>3 טעויות ונגמר</span></button>
    <button class="mode" data-m="terms"><span class="em">📖</span><b>מבחן מונחים</b><span>${GLOSSARY.length} מונחים</span></button>
  </div></div>`;
  const info = () => {
    const n = customPool().length;
    $("#poolInfo").textContent = n ? `${n} שאלות מתאימות במאגר` : "אין שאלות שמתאימות לבחירה – נסה להרחיב";
    $("#startCustom").disabled = !n;
  };
  $("#tchips").onclick = e => {
    const c = e.target.closest(".chip"); if (!c) return; const k = c.dataset.k;
    builder.topics.has(k) ? builder.topics.delete(k) : builder.topics.add(k);
    c.classList.toggle("on"); info();
    $("#allT").textContent = builder.topics.size === TOPIC_KEYS.length ? "נקה הכול" : "בחר הכול";
  };
  $("#allT").onclick = () => { if (builder.topics.size === TOPIC_KEYS.length) builder.topics.clear(); else TOPIC_KEYS.forEach(k => builder.topics.add(k)); renderPractice(); };
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
    if (m === "flash") startFlash(builder.topics.size ? [...builder.topics] : TOPIC_KEYS); else startMode(m);
  });
  info();
}
function customPool() {
  return BANK.filter(q => builder.topics.has(q.f) && (builder.fmt === "mixed" || (builder.fmt === "img" ? !!q.img : q.t === builder.fmt)) && (builder.level === "all" || q.l === builder.level));
}

/* ───────── בניית סשן ───────── */
let session = null, timerId = null;
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
/* ───── רמת קושי מותאמת: מתחילים בקל, והקושי עולה לפי ההתקדמות בכל נושא ───── */
const DIFF_W = [
  { easy: 1, medium: .25, hard: 0, expert: 0 },        // מתחיל
  { easy: .8, medium: .8, hard: .1, expert: 0 },        // בדרך
  { easy: .5, medium: 1, hard: .6, expert: .15 },       // מתקדם
  { easy: .4, medium: 1, hard: 1, expert: 1 }           // הכל
];
const DIFF_NAMES = ["מתחיל", "בינוני", "מתקדם", "הכל"];
function topicStage(f, cache) {
  if (cache && f in cache) return cache[f];
  const ok = BANK.reduce((a, q) => a + (q.f === f && S.qs[q.id] && S.qs[q.id].c > 0 ? 1 : 0), 0);
  const st = ok < 12 ? 0 : ok < 30 ? 1 : ok < 55 ? 2 : 3;
  if (cache) cache[f] = st;
  return st;
}
function diffStage(f, cache) {
  const d = (S.settings && S.settings.diff) || "auto";
  if (d !== "auto") return { easy: 0, medium: 1, hard: 2, all: 3 }[d] ?? 3;
  return topicStage(f, cache);
}
/* טריות: שאלות שלא נראו – קודם; שאלות שהופיעו לאחרונה – בסוף. עם byLevel – שאלות מעל הרמה שלך נדחות לסוף */
function freshSort(pool, byLevel = false) {
  const rec = new Map((S.recent || []).map((id, i) => [id, i + 1])), cache = {};
  return pool.map(q => {
    let k = (rec.has(q.id) ? 1e14 * (1 + rec.get(q.id) / 1000) : 0) + ((S.qs[q.id] && S.qs[q.id].last) || 0) + Math.random() * 864e5;
    if (byLevel && TOPICS[q.f]) { const w = DIFF_W[diffStage(q.f, cache)][q.l] ?? 1; if (w <= 0) k += 5e14; else if (Math.random() >= w) k += 5e13 * (1.2 - w); }
    return { q, k };
  }).sort((a, b) => a.k - b.k).map(x => x.q);
}
function levelPool(pool) {
  const cache = {}, out = pool.filter(q => !TOPICS[q.f] || (DIFF_W[diffStage(q.f, cache)][q.l] ?? 1) > 0.05);
  return out.length >= 10 ? out : pool;
}
function markSeen(qs) {
  S.recent = (S.recent || []).filter(id => !qs.some(q => q.id === id)).concat(qs.map(q => q.id)).slice(-260);
}
function pickBalanced(pool, n, rand = Math.random) {
  const groups = {};
  (rand === Math.random ? freshSort(pool, true) : shuffle(pool, rand)).forEach(q => (groups[q.f] = groups[q.f] || []).push(q));
  const keys = shuffle(Object.keys(groups).sort(), rand), out = [];
  while (out.length < n && keys.some(k => groups[k].length)) keys.forEach(k => { if (out.length < n && groups[k].length) out.push(groups[k].shift()); });
  return shuffle(out, rand);
}
function termQuestions(n) {
  const rec = new Set(S.recent || []);
  const fresh = shuffle(GLOSSARY).sort((a, b) => rec.has("g-" + hash(a[0])) - rec.has("g-" + hash(b[0])));
  return fresh.slice(0, n).map(([k, v]) => {
    const wrong = shuffle(GLOSSARY.filter(g => g[0] !== k)).slice(0, 3).map(g => g[1]);
    return { id: "g-" + hash(k), f: "glossary", l: "medium", t: "mc", q: `מה פירוש המונח "${k}"?`, o: [v, ...wrong], a: 0, e: `${k}: ${v}` };
  });
}
const mkItem = (q, rand = Math.random) => ({ q, order: q.t === "mc" ? shuffle(q.o.map((_, i) => i), rand) : null, ans: null, done: false, grade: null, flag: false });

async function startMode(mode, opt = {}) {
  let qs = [], title = "", instant = true, timeLimit = 0, seed = null, rand = Math.random;
  const closed = BANK.filter(q => q.t !== "open");
  switch (mode) {
    case "quick": qs = pickBalanced(BANK, 10); title = "תרגול מהיר"; break;
    case "topic": qs = shuffle(freshSort(BANK.filter(q => q.f === opt.f), true).slice(0, 10)); title = TOPICS[opt.f].name; break;
    case "custom": qs = shuffle(customPool()).slice(0, builder.count); title = "מבחן מותאם"; instant = S.settings.instant; break;
    case "daily": rand = rng(parseInt(hash("daily" + today()), 36)); qs = pickBalanced(levelPool(closed), 5, rand); title = "אתגר יומי"; break;
    case "exam": qs = pickBalanced(closed, 30); title = "סימולציית מבחן"; instant = false; timeLimit = 35 * 60; break;
    case "speed": qs = freshSort(closed, true); title = "מבחן מהירות"; timeLimit = 60 + 5 * ((S.up && S.up.time) || 0); break;
    case "sudden": qs = ["easy", "medium", "hard", "expert"].flatMap(l => freshSort(closed.filter(q => q.l === l))); title = "מוות פתאומי"; break;
    case "coach": qs = opt.qs; title = opt.title || "🧑‍🏫 האימון האישי שלך"; break;
    case "final": {
      const plan = { anatomy: 6, physio: 5, nutrition: 4, technique: 6, program: 6, trx: 2, special: 3, psych: 3, scenarios: 2, safety: 3 };
      qs = shuffle(Object.entries(plan).flatMap(([f, n]) => freshSort(closed.filter(q => q.f === f)).slice(0, n)));
      title = "🎓 מבחן גמר מדומה"; instant = false; timeLimit = 50 * 60; break;
    }
    case "img": qs = freshSort(BANK.filter(q => q.img)).slice(0, 10); title = "🖼️ אתגר תמונה"; break;
    case "survival": qs = ["easy", "medium", "hard", "expert"].flatMap(l => freshSort(closed.filter(q => q.l === l))); title = "הישרדות"; break;
    case "challenge":
      seed = opt.seed || Math.floor(Math.random() * 2e9);
      rand = rng(seed); qs = pickBalanced(closed, 10, rand); title = opt.from ? `אתגר מ${opt.from}` : "אתגר חבר"; break;
    case "terms": qs = termQuestions(10); title = "מבחן מונחים"; break;
    case "mistakes": qs = mistakes().slice(0, 15); title = "חזרה על טעויות"; break;
    case "bookmarks": qs = shuffle(S.bm.map(id => BY_ID[id]).filter(Boolean)).slice(0, 20); title = "שאלות שמורות"; break;
    case "due": qs = shuffle(dueQuestions()).slice(0, 15); title = "חזרה חכמה"; break;
    case "retry": qs = opt.qs; title = "תרגול חוזר"; break;
    case "stage": { const st = STAGES[opt.f][opt.i], t = TIERS[st.tier]; qs = shuffle(freshSort(st.pool).slice(0, t.q)); title = `${TOPICS[opt.f].name} · ${t.em} ${t.n} ${st.j + 1}`; break; }
    case "boss": { const pool = closed.filter(q => q.f === opt.f), hard = pool.filter(q => q.l === "hard" || q.l === "expert"); qs = freshSort(hard.length >= 20 ? hard : pool).slice(0, 20); title = `קרב בוס · ${TOPICS[opt.f].name}`; break; }
  }
  if (!qs.length) {
    const msg = { mistakes: "אין כרגע שאלות לחזרה – כל הכבוד! ענה על עוד שאלות והטעויות יופיעו כאן.", bookmarks: "עוד לא שמרת שאלות. במהלך מבחן אפשר ללחוץ על ☆ כדי לשמור שאלה.", due: "אין שאלות שמחכות לחזרה היום. תרגל עוד, והאפליקציה תתזמן לך חזרות." }[mode] || "לא נמצאו שאלות.";
    await modal("אין שאלות כאן", msg, "הבנתי", null); return;
  }
  stopFactTimer();
  if (!seed && mode !== "daily") markSeen(qs.slice(0, mode === "speed" || mode === "survival" || mode === "sudden" ? 25 : qs.length));
  const goldIdx = PLAY() && qs.length >= 5 && !["exam", "final", "daily", "challenge", "speed"].includes(mode) && Math.random() < 0.6 ? 1 + Math.floor(Math.random() * (qs.length - 1)) : -1;
  const maxL = mode === "sudden" ? 1 : mode === "stage" ? stageLives() : 3;
  session = { mode, title, instant, timeLimit, start: Date.now(), seed, opt, lives: maxL, maxL, combo: 0, maxCombo: 0, coinsEarned: 0, bossHp: mode === "boss" ? BOSS_HP : 0,
    items: qs.map((q, i) => Object.assign(mkItem(q, rand), i === goldIdx ? { gold: true } : {})), idx: 0, speedOk: 0, speedNo: 0 };
  document.body.classList.add("in-quiz");
  if (timeLimit) timerId = setInterval(tick, 250);
  renderQuestion();
}
const remaining = () => session.timeLimit - (Date.now() - session.start) / 1000;
function tick() {
  if (!session) return stopTimer();
  const r = remaining(), el = $("#timer");
  if (el) { el.textContent = fmtTime(r); el.classList.toggle("low", r <= (session.mode === "speed" ? 10 : 120)); }
  if (r <= 0) { stopTimer(); session.mode === "speed" ? finishSpeed() : finish(true); }
}

/* ───────── הצגת שאלה ───────── */
const PRAISE = ["נכון! 🎯", "מצוין! 💪", "בדיוק! ✨", "יפה מאוד! 👏", "תשובה נכונה! 🔥"];
const pickPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];
function renderQuestion() {
  const s = session, it = s.items[s.idx], q = it.q;
  const isSpeed = s.mode === "speed", isSurv = s.mode === "survival" || s.mode === "sudden", isExam = !s.instant;
  const bm = S.bm.includes(q.id), total = s.items.length;
  const answeredN = s.items.filter(x => x.ans !== null).length;
  const progress = isExam ? pct(answeredN, total) : pct(s.idx + (it.done ? 1 : 0), total);
  const showRes = it.done && s.instant;

  let opts = "";
  if (q.t === "mc") {
    opts = it.order.map((oi, di) => {
      let cls = "";
      if (showRes) { if (oi === q.a) cls = "ok"; else if (di === it.ans) cls = "no"; }
      else if (it.ans === di) cls = "sel";
      const cut = !showRes && it.cut && it.cut.includes(di);
      return `<button class="opt ${cls} ${cut ? "cut" : ""}" data-i="${di}" ${showRes || cut ? "disabled" : ""}><span class="k">${"אבגד"[di]}</span><span>${esc(q.o[oi])}</span>${it.aud && !showRes ? `<em class="aud" style="--p:${it.aud[di]}%">${it.aud[di]}%</em>` : ""}</button>`;
    }).join("");
  } else if (q.t === "tf") {
    opts = `<div class="tf">${[[1, "✓ נכון"], [0, "✗ לא נכון"]].map(([v, l]) => {
      let cls = "";
      if (showRes) { if (v === q.a) cls = "ok"; else if (it.ans === v) cls = "no"; }
      else if (it.ans === v) cls = "sel";
      return `<button class="opt ${cls}" data-v="${v}" ${showRes ? "disabled" : ""}>${l}</button>`;
    }).join("")}</div>`;
  } else {
    opts = `<textarea id="openAns" placeholder="כתוב כאן את התשובה שלך – גם בנקודות קצרות זה מצוין..." ${it.done ? "readonly" : ""}>${esc(it.ans || "")}</textarea>`;
  }

  let fb = "";
  if (showRes && !isSpeed) {
    const more = q.f in (typeof LESSONS !== "undefined" ? LESSONS : {}) ? `<button class="link-btn xs" id="learnMore">📘 למד עוד על הנושא</button>` : "";
    if (q.t === "open") {
      fb = `<div class="feedback info"><b class="t">📝 תשובה לדוגמה</b>${esc(q.a)}<div class="small muted" style="margin-top:8px">💡 ${linkTerms(q.e)}</div>
        ${it.grade === null ? `<div style="margin-top:12px;font-weight:700">איך ענית ביחס לתשובה לדוגמה?</div>
        <div class="grade"><button class="btn danger" data-g="0">לא ידעתי</button><button class="btn" data-g="0.5">חלקית</button><button class="btn primary" data-g="1">ידעתי</button></div>`
          : `<div style="margin-top:10px" class="small"><b>דירגת: ${it.grade === 1 ? "ידעתי ✅" : it.grade === 0.5 ? "חלקית 🟡" : "לא ידעתי ❌"}</b></div>`}<div class="row" style="gap:14px">${more}<button class="link-btn xs" id="askQBtn">❓ יש לי שאלה</button></div></div>`;
    } else {
      const ok = it.grade === 1;
      const right = q.t === "mc" ? q.o[q.a] : (q.a ? "נכון" : "לא נכון");
      const isBoss = s.mode === "boss";
      const verdict = ok ? (isBoss ? "💥 פגיעה בבוס!" : pickPraise()) : isSurv ? `לא מדויק – נשארו ${s.lives} ❤️` : isBoss ? `😵 הבוס פגע בך – נשארו ${s.lives} ❤️` : "לא מדויק";
      const coinTxt = PLAY() && ok && it.coins ? ` <span class="coin-pop">‎+${it.coins} 🪙</span>` : "";
      const tools = `<div class="row" style="gap:14px;flex-wrap:wrap">${more}<button class="link-btn xs" id="askQBtn">❓ יש לי שאלה</button>${LESSONS[q.f] ? `<button class="link-btn xs" id="lessonQBtn">📘 שיעור על ${esc(topicOf(q.f).name)}</button>` : ""}</div>`;
      fb = PLAY()
        ? `<div class="feedback ${ok ? "good" : "bad"}"><b class="t">${verdict}${coinTxt}</b>${ok ? "" : `התשובה הנכונה: <b>${esc(right)}</b>`}<details class="why"><summary>💡 למה?</summary><div>${linkTerms(q.e)}</div>${tools}</details></div>`
        : `<div class="feedback ${ok ? "good" : "bad"}"><b class="t">${verdict}</b>${ok ? "" : `התשובה הנכונה: <b>${esc(right)}</b><br>`}${linkTerms(q.e)}${tools}</div>`;
    }
  }

  const last = s.idx === total - 1;
  let actions = "";
  if (isSpeed) actions = "";
  else if (isExam) actions = `<button class="btn" id="prev" ${s.idx === 0 ? "disabled" : ""}>→ הקודמת</button>${last ? `<button class="btn primary" id="submit">הגשת המבחן</button>` : `<button class="btn primary" id="nextQ">הבאה ←</button>`}`;
  else if (!it.done) actions = `<button class="btn primary lg" id="check">בדיקת תשובה</button>`;
  else if (q.t === "open" && it.grade === null) actions = "";
  else if ((isSurv || s.mode === "boss") && s.lives <= 0) actions = `<button class="btn primary lg" id="nextQ">לתוצאות 🏁</button>`;
  else if (s.mode === "stage" && s.lives <= 0) actions = `<button class="btn primary lg" id="nextQ">💔 נגמרו הלבבות – לתוצאות</button>`;
  else if (s.mode === "boss" && s.bossHp <= 0) actions = `<button class="btn primary lg" id="nextQ">👑 ניצחון! לתוצאות</button>`;
  else actions = `<button class="btn primary lg" id="nextQ">${last ? "לתוצאות 🏁" : "לשאלה הבאה ←"}</button>`;

  let headMid = `<div class="progress"><i style="width:${progress}%"></i></div>`;
  if (isSpeed) headMid = `<div class="speed-score" style="flex:1">✅ ${s.speedOk} · ❌ ${s.speedNo}</div>`;
  if (isSurv) headMid = `<div class="speed-score" style="flex:1">${"❤️".repeat(Math.max(0, s.lives))}${"🤍".repeat((s.maxL || 3) - Math.max(0, s.lives))} <span class="muted small">· ${s.items.filter(x => x.grade === 1).length} נכונות</span></div>`;
  if (s.mode === "boss") headMid = `<div class="boss-bar"><span class="boss-em ${it.done && it.grade === 1 ? "hit" : ""}">👹</span><div class="hp"><i style="width:${pct(s.bossHp, BOSS_HP)}%"></i></div><span class="xs">${"❤️".repeat(Math.max(0, s.lives))}${"🤍".repeat((s.maxL || 3) - Math.max(0, s.lives))}</span></div>`;
  if (s.mode === "stage") { const need = TIERS[STAGES[s.opt.f][s.opt.i].tier].q - (s.maxL - 1), ok = s.items.filter(x => x.grade === 1).length;
    headMid = `<div class="stage-hud"><div class="progress"><i style="width:${progress}%"></i></div><span class="xs" title="תשובות נכונות מתוך הנדרש">🎯 ${ok}/${need}</span><span class="xs">${"❤️".repeat(Math.max(0, s.lives))}${"🖤".repeat((s.maxL || 3) - Math.max(0, s.lives))}</span></div>`; }
  const mult = comboMult(s.combo);
  const comboTag = PLAY() && s.combo >= 2 ? `<span class="tag combo ${mult > 1 ? "hot" : ""}">🔥 ${s.combo} ברצף${mult > 1 ? ` · x${mult}` : ""}</span>` : "";
  const puBar = PLAY() && s.instant && !it.done && q.t !== "open" ? `<div class="pu-bar">
      ${q.t === "mc" && !it.aud ? `<button class="pu" data-pu="aud" ${(S.items.aud || 0) > 0 ? "" : "disabled"}>📊 קהל <b>${S.items.aud || 0}</b></button>` : ""}
      ${q.t === "mc" && !it.cut ? `<button class="pu" data-pu="fifty" ${(S.items.fifty || 0) > 0 ? "" : "disabled"}>✂️ 50:50 <b>${S.items.fifty || 0}</b></button>` : ""}
      ${s.mode !== "daily" && s.mode !== "challenge" ? `<button class="pu" data-pu="skip" ${(S.items.skip || 0) > 0 ? "" : "disabled"}>⏭️ דילוג <b>${S.items.skip || 0}</b></button>` : ""}
      ${s.timeLimit ? `<button class="pu" data-pu="time" ${(S.items.time || 0) > 0 ? "" : "disabled"}>⏱️ ‎+10 שנ׳ <b>${S.items.time || 0}</b></button>` : ""}
      <button class="pu shop" data-pu="shop">🛒</button></div>` : "";
  const headEnd = s.timeLimit ? `<span class="timer" id="timer">${fmtTime(remaining())}</span>` : (isSurv || s.mode === "boss") ? "" : `<span class="muted small" style="flex:none">${s.idx + 1}/${total}</span>`;
  const tp = topicOf(q.f);

  app.innerHTML = `<div class="fade-in">
    <div class="qhead"><button class="x" id="quit" aria-label="יציאה">✕</button>${headMid}${headEnd}</div>
    <div class="tags"><span class="tag">${tp.icon} ${tp.name}</span><span class="tag lv-${q.l}">${LEVELS[q.l]}</span><span class="tag">${TYPES[q.t]}</span>${it.gold && PLAY() ? `<span class="tag gold">✨ שאלת זהב · x3</span>` : ""}${isExam ? `<span class="tag">שאלה ${s.idx + 1} מתוך ${total}</span>` : ""}${comboTag}</div>
    <div class="qtext">${esc(q.q)}</div>
    ${figHtml(q)}
    <div id="opts">${opts}</div>
    ${puBar}
    ${fb}
    <div class="qtools">
      ${BY_ID[q.id] ? `<button class="bm-btn ${bm ? "on" : ""}" id="bm">${bm ? "★ שמורה" : "☆ שמירת שאלה"}</button>` : "<span></span>"}
      ${isExam ? `<button class="bm-btn ${it.flag ? "on" : ""}" id="flag">${it.flag ? "🚩 מסומנת" : "🏳️ סימון לבדיקה"}</button>` : `<button class="bm-btn" id="report">⚑ דיווח על טעות</button>`}
    </div>
    ${isExam ? `<div class="card flat" style="padding:12px"><div class="muted xs">ניווט מהיר · ${answeredN}/${total} נענו</div><div class="navgrid">${s.items.map((x, i) => `<button data-n="${i}" class="${x.ans !== null ? "ans" : ""} ${i === s.idx ? "cur" : ""} ${x.flag ? "flag" : ""}">${i + 1}</button>`).join("")}</div></div>` : ""}
    <div class="qactions">${actions}</div>
  </div>`;
  bindQuestion();
}
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
  app.querySelectorAll("[data-pu]").forEach(b => b.onclick = () => usePower(b.dataset.pu));
  $("#check") && ($("#check").onclick = check);
  $("#nextQ") && ($("#nextQ").onclick = next);
  $("#prev") && ($("#prev").onclick = () => { s.idx--; renderQuestion(); });
  $("#submit") && ($("#submit").onclick = submitExam);
  $("#learnMore") && ($("#learnMore").onclick = () => lessonSheet(it.q.f));
  $("#report") && ($("#report").onclick = () => reportQuestion(it.q));
  $("#askQBtn") && ($("#askQBtn").onclick = () => askSheet(it.q.q + " — " + it.q.e));
  $("#lessonQBtn") && ($("#lessonQBtn").onclick = () => lessonSheet(it.q.f));
  app.querySelectorAll("[data-g]").forEach(b => b.onclick = () => gradeOpen(+b.dataset.g));
  app.querySelectorAll("[data-n]").forEach(b => b.onclick = () => { s.idx = +b.dataset.n; renderQuestion(); });
  $("#bm") && ($("#bm").onclick = () => {
    const id = it.q.id;
    S.bm = S.bm.includes(id) ? S.bm.filter(x => x !== id) : [...S.bm, id]; save();
    const on = S.bm.includes(id); $("#bm").classList.toggle("on", on); $("#bm").textContent = on ? "★ שמורה" : "☆ שמירת שאלה";
  });
  $("#flag") && ($("#flag").onclick = () => { it.flag = !it.flag; renderQuestion(); });
}
function reportQuestion(q) {
  const body = `שלום,\nמצאתי בעיה בשאלה הבאה באפליקציית מאמן ידע:\n\n"${q.q}"\n(מזהה: ${q.id})\n\nמה לדעתי לא נכון:\n`;
  location.href = `mailto:${CONTACT}?subject=${encodeURIComponent("דיווח על שאלה – מאמן ידע")}&body=${encodeURIComponent(body)}`;
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
    onAnswer(s, it);
    beep(it.grade === 1, s.combo);
    save();
  }
  renderQuestion(); updateHeader();
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
  if ((s.mode === "survival" || s.mode === "sudden") && s.lives <= 0) return finishSurvival();
  if (s.mode === "stage" && s.lives <= 0) return finishStage();
  if (s.mode === "boss" && (s.lives <= 0 || s.bossHp <= 0)) return finishBoss();
  if (s.mode === "boss" && s.idx >= s.items.length - 1) return finishBoss();
  if (s.idx < s.items.length - 1) { s.idx++; renderQuestion(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  else s.mode === "survival" || s.mode === "sudden" ? finishSurvival() : s.mode === "stage" ? finishStage() : finish();
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
  if (it.grade === 1) { s.speedOk++; addXP(5); addCoins(1, true); s.coinsEarned++; } else s.speedNo++;
  beep(it.grade === 1);
  app.querySelectorAll(".opt").forEach(b => {
    const isMc = b.dataset.i !== undefined;
    const v = isMc ? it.order[+b.dataset.i] : +b.dataset.v;
    const chosen = isMc ? +b.dataset.i === it.ans : +b.dataset.v === it.ans;
    if (v === it.q.a) b.classList.add("ok"); else if (chosen) b.classList.add("no");
    b.disabled = true;
  });
  setTimeout(() => {
    if (!session || session.mode !== "speed" || remaining() <= 0) return;
    if (s.idx >= s.items.length - 1) s.items.push(...shuffle(s.items.map(x => mkItem(x.q))));
    s.idx++; renderQuestion();
  }, it.grade === 1 ? 450 : 900);
}
function logHistory(entry) {
  S.history.unshift({ date: new Date().toLocaleDateString("he-IL"), ...entry });
  S.history = S.history.slice(0, 60);
}
function finishSpeed() {
  const s = session, ok = s.speedOk, no = s.speedNo, isBest = ok > S.best.speed;
  if (isBest) S.best.speed = ok;
  touchStreak();
  logHistory({ mode: "speed", title: "מבחן מהירות", score: pct(ok, ok + no), n: ok + no, extra: ok + " נכונות" });
  missionEvent("speed"); checkAchievements(); save();
  if (isBest && ok > 0) confetti();
  showResult({ title: isBest && ok ? "שיא אישי חדש! 🏆" : ok >= 10 ? "מהיר וחד! ⚡" : "סיבוב טוב!", big: ok, bigLabel: "נכונות", p: pct(ok, ok + no),
    sub: `ענית על ${ok + no} שאלות ב־60 שניות · השיא שלך: ${S.best.speed}`, items: s.items.filter(x => x.done), xp: ok * 5, shareText: `ענו ${ok} תשובות נכונות במבחן מהירות` });
}
function finishSurvival() {
  const s = session, items = s.items.filter(x => x.done), ok = items.filter(x => x.grade === 1).length;
  const sd = s.mode === "sudden", bk = sd ? "sudden" : "survival";
  const isBest = ok > (S.best[bk] || 0); if (isBest) S.best[bk] = ok;
  addXP(20); touchStreak();
  logHistory({ mode: "survival", title: sd ? "מוות פתאומי" : "הישרדות", score: pct(ok, items.length), n: items.length, extra: ok + " ברצף" });
  checkAchievements(); save();
  if (isBest && ok > 0) confetti();
  showResult({ title: isBest && ok ? (sd ? "שיא מוות פתאומי! 💀" : "שיא הישרדות חדש! 🛡️") : ok >= 10 ? "שורד אמיתי! ❤️" : sd ? "טעות אחת – ונגמר 💀" : "נגמרו הלבבות", big: ok, bigLabel: "נכונות", p: pct(ok, items.length),
    sub: `${sd ? "ענית נכון ברצף על" : "שרדת"} ${sd ? ok : items.length} שאלות · השיא שלך: ${S.best[bk]}`, items, xp: ok * (sd ? 15 : 10) + 20, shareText: sd ? `ענו ${ok} ברצף בלי טעות במוות פתאומי` : `שרדו ${ok} שאלות במצב הישרדות` });
}

/* ───────── סיום מבחן ───────── */
function finish(timeUp = false) {
  stopTimer();
  const s = session;
  if (!s.instant) s.items.forEach(it => { if (it.q.t !== "open") { it.done = true; it.grade = scoreOf(it); record(it.q, it.grade); if (it.grade === 1) { addXP(10); addCoins(2, true); } } });
  const graded = s.items.filter(it => it.grade !== null);
  const sum = graded.reduce((a, it) => a + it.grade, 0);
  const score = graded.length ? Math.round(sum / graded.length * 100) : 0;
  const correct = graded.filter(it => it.grade === 1).length;
  let bonus = 20;
  if (s.mode === "daily") { S.daily[today()] = { score }; bonus += 30; }
  const perfect = score === 100 && graded.length >= 5;
  if (perfect) bonus += 25;
  const isExam = s.mode === "exam" || s.mode === "final", examPassed = isExam && score >= 70;
  S.lastExamMode = s.mode;
  addXP(bonus); touchStreak();
  logHistory({ mode: s.mode, title: s.title, score, n: s.items.length });
  checkAchievements({ perfect, examPassed }); save();
  if (score >= 85 || examPassed) confetti();
  const xpGained = graded.reduce((a, it) => a + it.grade * 10, 0) + bonus;
  const secs = (Date.now() - s.start) / 1000;
  let title = score >= 90 ? "מצוין! 🌟" : score >= 75 ? "עבודה טובה! 💪" : score >= 55 ? "בכיוון הנכון 👍" : "יש מה לחזק 📚";
  if (isExam) title = examPassed ? (s.mode === "final" ? "עברת את מבחן הגמר! 🎓" : "עברת את המבחן! 🎓") : "עדיין לא – אבל קרוב 💡";
  let vs = null;
  if (s.mode === "challenge" && s.opt.from) {
    const them = +s.opt.theirScore || 0;
    vs = { me: score, them, from: s.opt.from };
    title = score > them ? "ניצחת באתגר! 🏆" : score === them ? "תיקו! 🤝" : "הפעם הם ניצחו 💪";
    if (typeof recordRival === "function") recordRival(s.opt.from, score > them ? 1 : score === them ? 0 : -1, "אתגר");
  }
  showResult({ title, big: score + "%", p: score, items: s.items, vs, examPassed, examScore: score,
    sub: `${correct} נכונות מתוך ${graded.length}${timeUp ? " · הזמן נגמר ⏰" : ""} · זמן: ${fmtTime(secs)}${isExam ? " · סף מעבר 70%" : ""}`, xp: xpGained, shareText: `השיגו ${score}% ב${s.title}` });
}

function showResult({ title, big, bigLabel, p, sub, items, xp, vs, examPassed, examScore, shareText }) {
  const s = session, mode = s.mode, seed = s.seed;
  session = null; document.body.classList.remove("in-quiz");
  const wrong = items.filter(it => it.grade !== null && it.grade < 1).map(it => it.q).filter(q => BY_ID[q.id]);
  const color = p >= 75 ? "var(--accent)" : p >= 55 ? "var(--warn)" : "var(--bad)";
  const reviewHtml = items.map((it, i) => {
    const q = it.q, g = it.grade;
    const pill = g === null ? `<span class="pill mid">לא דורג</span>` : g === 1 ? `<span class="pill ok">נכון</span>` : g > 0 ? `<span class="pill mid">חלקי</span>` : `<span class="pill no">${it.ans === null ? "לא נענתה" : "שגוי"}</span>`;
    let body = "";
    if (q.t === "mc") body = `${it.ans !== null && g < 1 ? `תשובתך: ${esc(q.o[it.order[it.ans]])}<br>` : ""}התשובה הנכונה: <b>${esc(q.o[q.a])}</b>`;
    else if (q.t === "tf") body = `התשובה הנכונה: <b>${q.a ? "נכון" : "לא נכון"}</b>`;
    else body = `תשובה לדוגמה: ${esc(q.a)}`;
    return `<div class="review-item" data-ok="${g === 1 ? 1 : 0}"><div class="q">${pill}${i + 1}. ${esc(q.q)}</div><div class="small">${body}</div><div class="small muted" style="margin-top:4px">💡 ${esc(q.e)}</div></div>`;
  }).join("");
  const scoreNum = typeof big === "number" ? big : parseInt(big);

  app.innerHTML = `<div class="fade-in">
    <div class="card" style="text-align:center">
      <div class="muted small">תוצאות</div>
      <div class="ring" style="--p:${p};--c:${color}"><div><div><b>${big}</b>${bigLabel ? `<div class="muted xs">${bigLabel}</div>` : ""}</div></div></div>
      <h1 style="font-size:24px">${title}</h1>
      <p class="muted small" style="margin:4px 0 14px">${sub}</p>
      ${vs ? `<div class="vs"><div><b>${vs.me}%</b><span>${esc(S.name || "את/ה")}</span></div><div class="muted">VS</div><div><b>${vs.them}%</b><span>${esc(vs.from)}</span></div></div>` : ""}
      <div class="grid3">
        <div class="statbox"><b dir="ltr">+${Math.round(xp)}</b><span>XP</span></div>
        <div class="statbox"><b>🔥 ${currentStreak()}</b><span>רצף ימים</span></div>
        <div class="statbox"><b dir="ltr">${todayCount() >= S.goal ? "✓ " + todayCount() : todayCount() + "/" + S.goal}</b><span>מטרה יומית</span></div>
      </div>
      <div class="col" style="margin-top:16px">
        ${examPassed ? `<button class="btn primary block" id="cert">📜 קבל תעודת הצטיינות</button>` : ""}
        ${mode === "challenge" ? `<button class="btn primary block" id="sendCh">🤝 שלח את האתגר לחבר</button>` : ""}
        ${wrong.length ? `<button class="btn ${examPassed || mode === "challenge" ? "" : "primary"} block" id="retry">🔁 תרגול חוזר על ${wrong.length} הטעויות</button>` : ""}
        <div class="row"><button class="btn block" id="again" style="flex:1">שוב</button><button class="btn block" id="share" style="flex:1">שיתוף 📤</button></div>
        <button class="btn ghost block" id="home">חזרה לבית</button>
      </div>
    </div>
    ${items.length ? `<div class="section-title"><h2>סקירת תשובות</h2><button class="link-btn small" id="onlyWrong">רק טעויות</button></div>
    <div class="card" style="padding:4px 16px">${reviewHtml}</div>` : ""}
  </div>`;
  window.scrollTo(0, 0); updateHeader();
  $("#retry") && ($("#retry").onclick = () => startMode("retry", { qs: shuffle(wrong) }));
  $("#cert") && ($("#cert").onclick = () => makeCertificate(examScore, S.lastExamMode === "final" ? "על מעבר מבחן גמר מדומה למדריכי כושר גופני ובריאות" : undefined));
  $("#sendCh") && ($("#sendCh").onclick = () => sendChallenge(seed, scoreNum));
  $("#again").onclick = () => ["retry", "topic", "daily"].includes(mode) ? startMode("quick") : startMode(mode);
  $("#home").onclick = () => go("home");
  $("#share").onclick = () => share(`${S.name || "אני"} ${shareText || "תרגלו"} ב"מאמן ידע" – אפליקציית תרגול למדריכי כושר 💪`);
  let onlyWrong = false;
  $("#onlyWrong") && ($("#onlyWrong").onclick = () => {
    onlyWrong = !onlyWrong; $("#onlyWrong").textContent = onlyWrong ? "הצג הכול" : "רק טעויות";
    app.querySelectorAll(".review-item").forEach(r => r.classList.toggle("hidden", onlyWrong && r.dataset.ok === "1"));
  });
}
async function share(text, url = baseUrl()) {
  try {
    if (navigator.share) { await navigator.share({ title: "מאמן ידע", text, url }); return true; }
    await navigator.clipboard.writeText(text + "\n" + url); toast("📋", "הועתק ללוח – אפשר להדביק בוואטסאפ"); return true;
  } catch (e) { return false; }
}
async function sendChallenge(seed, score) {
  if (!S.name) { const n = await prompt2("איך לקרוא לך?", "השם יופיע לחבר שמקבל את האתגר.", "", "השם שלך"); if (n === null) return; S.name = n || "חבר"; save(); }
  const url = `${baseUrl()}?ch=${seed}&s=${score}&n=${encodeURIComponent(S.name)}`;
  const ok = await share(`🤝 ${S.name} מאתגר/ת אותך! השגתי ${score}% ב־10 שאלות על כושר באפליקציית "מאמן ידע". חושב/ת שתעשה/י יותר טוב?`, url);
  if (ok) { S.challenges++; checkAchievements(); save(); }
}

/* ───────── תעודה ───────── */
async function makeCertificate(score, what = "על מעבר סימולציית מבחן ידע למדריכי כושר", head = "תעודת הצטיינות") {
  let name = S.name;
  name = await prompt2("השם על התעודה", "איך לכתוב את השם שלך על התעודה?", name || "", "שם מלא");
  if (name === null) return;
  if (name) { S.name = name; save(); }
  const W = 1600, H = 1130, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#0b0f17"); g.addColorStop(1, "#13263a");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = "#34d399"; x.lineWidth = 10; x.strokeRect(40, 40, W - 80, H - 80);
  x.strokeStyle = "rgba(52,211,153,.35)"; x.lineWidth = 2; x.strokeRect(64, 64, W - 128, H - 128);
  x.direction = "rtl"; x.textAlign = "center"; x.fillStyle = "#eef2f7";
  const F = "system-ui,-apple-system,'Segoe UI','Noto Sans Hebrew',Arial,sans-serif";
  x.font = `800 44px ${F}`; x.fillStyle = "#34d399"; x.fillText("✦ מאמן ידע ✦", W / 2, 170);
  x.font = `900 96px ${F}`; x.fillStyle = "#eef2f7"; x.fillText(head, W / 2, 310);
  x.font = `500 40px ${F}`; x.fillStyle = "#8e9bb1"; x.fillText("מוענקת בזאת ל", W / 2, 420);
  x.font = `900 84px ${F}`; x.fillStyle = "#ffffff"; x.fillText(name || "מתאמן/ת מצטיין/ת", W / 2, 540);
  x.fillStyle = "#34d399"; x.fillRect(W / 2 - 260, 575, 520, 5);
  x.font = `500 42px ${F}`; x.fillStyle = "#eef2f7"; x.fillText(what, W / 2, 680);
  x.font = `900 120px ${F}`; x.fillStyle = "#34d399"; x.fillText(score + "%", W / 2, 840);
  x.font = `500 34px ${F}`; x.fillStyle = "#8e9bb1"; x.fillText(new Date().toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" }), W / 2, 950);
  x.font = `400 24px ${F}`; x.fillText("תעודה לימודית מתוך אפליקציית התרגול. אינה מהווה הסמכה מקצועית.", W / 2, 1020);
  const url = c.toDataURL("image/png");
  S.certs++; checkAchievements(); save();
  sheet(`<h2>📜 התעודה שלך</h2><img src="${url}" alt="תעודת הצטיינות" style="width:100%;border-radius:12px;margin:8px 0">
    <div class="row"><button class="btn" data-a="x">סגירה</button><button class="btn" data-a="share">שיתוף</button><button class="btn primary" data-a="dl">הורדה</button></div>`,
    async (e, close) => {
      const a = e.target.dataset.a; if (!a) return;
      if (a === "x") close();
      if (a === "dl") { const l = document.createElement("a"); l.href = url; l.download = `certificate-${today()}.png`; l.click(); }
      if (a === "share") {
        try {
          const blob = await (await fetch(url)).blob(); const file = new File([blob], "certificate.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: "תעודת הצטיינות – מאמן ידע" });
          else toast("💾", "שיתוף תמונות לא נתמך כאן – אפשר להוריד ולשתף");
        } catch (err) { }
      }
    });
}


/* ───────── מצב משחק: מסע, מטבעות, עזרים, קומבו, משימות ───────── */
const PLAY = () => S.mode === "play";
const BOSS_HP = 6;
const comboMult = c => c >= 5 ? 3 : c >= 3 ? 2 : 1;
function setMode(m, rerender = true) {
  S.mode = m; save(); updateHeader();
  toast(m === "play" ? "🎮" : "📚", m === "play" ? "מצב משחק – בהצלחה!" : "מצב לימוד");
  if (rerender) go(tab === "settings" ? "home" : tab);
}
$("#modeChip").onclick = () => setMode(PLAY() ? "learn" : "play");
$("#coinChip").onclick = () => shopSheet();
function modeSheet() {
  sheet(`<div style="text-align:center"><div style="font-size:40px">✨</div><h2>חדש: מצב משחק!</h2><p class="muted small">איך תרצה להשתמש באפליקציה? אפשר להחליף בכל רגע בכפתור למעלה.</p></div>
    <div class="mode-pick"><button data-k="play"><span>🎮</span><b>משחק</b><small>מסע עם שלבים ובוסים, מטבעות, עזרים ומשימות יומיות</small></button><button data-k="learn"><span>📚</span><b>לימוד</b><small>כמו שהיה – שיעורים, תרגול ומבחנים</small></button></div>`,
    (e, close) => { const b = e.target.closest("[data-k]"); if (!b) return; close(); S.mode = b.dataset.k; save(); go("home"); });
}
function addCoins(n, quiet) {
  n = Math.round(n); if (!n) return;
  S.coins += n; if (n > 0) S.coinsTotal = (S.coinsTotal || 0) + n;
  const chip = $("#coinChip span"); if (chip) chip.textContent = S.coins;
  if (!quiet && PLAY()) {
    const c = $("#coinChip"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
  }
}
function onAnswer(s, it) {
  if (it.grade === 1) {
    s.combo++; s.maxCombo = Math.max(s.maxCombo, s.combo);
    S.best.combo = Math.max(S.best.combo || 0, s.combo);
    const m = comboMult(s.combo) * (it.gold ? 3 : 1);
    addXP(10 * m);
    it.coins = 2 * m;
    setTimeout(() => floatReward(`+${it.coins} 🪙${it.gold ? " ✨" : ""}`), 60);
    if (it.gold) setTimeout(() => { toast("✨", "שאלת זהב! פרס x3"); confetti(); }, 200); s.coinsEarned += it.coins; addCoins(it.coins);
    if (s.combo >= 3) missionEvent("combo", { n: s.combo });
    if (s.combo === 3 || s.combo === 5 || s.combo === 10) setTimeout(() => toast("🔥", s.combo === 3 ? "קומבו! נקודות כפולות" : s.combo === 5 ? "קומבו x3 – אתה בוער!" : "10 ברצף – בלתי עציר!"), 150);
    if (s.mode === "boss") s.bossHp--;
  } else {
    s.combo = 0;
    if (s.mode === "survival" || s.mode === "sudden" || s.mode === "boss" || s.mode === "stage") s.lives--;
  }
}
function usePower(k) {
  const s = session; if (!s) return;
  const it = s.items[s.idx], q = it.q;
  if (k === "shop") return shopSheet();
  if (!(S.items[k] > 0)) return toast("🛒", "נגמר – אפשר לקנות בחנות");
  if (k === "fifty" && q.t === "mc" && !it.cut) {
    const wrong = it.order.map((oi, di) => ({ oi, di })).filter(x => x.oi !== q.a);
    it.cut = shuffle(wrong).slice(0, 2).map(x => x.di);
    if (it.cut.includes(it.ans)) it.ans = null;
  } else if (k === "aud" && q.t === "mc" && !it.aud) {
    const acc = { easy: .78, medium: .62, hard: .48, expert: .4 }[q.l] || .6, ok = Math.round((acc + (Math.random() - .5) * .16) * 100);
    let rest = 100 - ok; const w = it.order.map(oi => oi === q.a ? 0 : Math.random() + .2), tw = w.reduce((a, b) => a + b, 0);
    it.aud = it.order.map((oi, di) => oi === q.a ? ok : Math.round(rest * w[di] / tw));
    const diff = 100 - it.aud.reduce((a, b) => a + b, 0); it.aud[it.order.indexOf(q.a)] += diff;
  } else if (k === "skip") {
    const used = new Set(s.items.map(x => x.q.id));
    let pool = BANK.filter(x => x.t !== "open" && x.f === q.f && !used.has(x.id));
    if (!pool.length) pool = BANK.filter(x => x.t !== "open" && !used.has(x.id));
    if (!pool.length) return;
    const nq = freshSort(pool, true)[0]; markSeen([nq]);
    s.items[s.idx] = Object.assign(mkItem(nq), it.gold ? { gold: true } : {});
  } else if (k === "time" && s.timeLimit) { s.start += 10000; }
  else return;
  S.items[k]--; save(); beep(true);
  renderQuestion();
}

/* חנות */
const ITEMS = {
  fifty: { em: "✂️", n: "50:50", d: "מוחק שתי תשובות שגויות", price: 30 },
  skip: { em: "⏭️", n: "דילוג", d: "מחליף את השאלה בשאלה אחרת", price: 40 },
  time: { em: "⏱️", n: "‎+10 שניות", d: "בסיבובים עם שעון", price: 25 },
  shield: { em: "🛡️", n: "מגן רצף", d: "שומר על הרצף ביום שפספסת", price: 60 },
  aud: { em: "📊", n: "שאלת הקהל", d: "מראה מה רוב השחקנים היו עונים", price: 35 }
};
const THEMES = {
  green: { n: "ירוק", d: "#34d399", l: "#10b981", price: 0 }, blue: { n: "כחול", d: "#60a5fa", l: "#2563eb", price: 120 },
  purple: { n: "סגול", d: "#a78bfa", l: "#7c3aed", price: 120 }, orange: { n: "כתום", d: "#fb923c", l: "#ea580c", price: 120 },
  pink: { n: "ורוד", d: "#f472b6", l: "#db2777", price: 150 }, gold: { n: "זהב", d: "#facc15", l: "#ca8a04", price: 250 }
};
function applyAccent() {
  const st = document.documentElement.style, t = THEMES[S.accent];
  if (!t || S.accent === "green") { ["--accent", "--accent-soft", "--accent-ink"].forEach(v => st.removeProperty(v)); return; }
  const light = document.documentElement.dataset.theme === "light", c = light ? t.l : t.d;
  st.setProperty("--accent", c); st.setProperty("--accent-soft", `color-mix(in srgb, ${c} 14%, transparent)`); st.setProperty("--accent-ink", light ? "#ffffff" : "#0b1020");
}
function shopSheet() {
  const draw = () => `<div style="max-height:76vh;overflow:auto"><h2>🛒 החנות</h2><div class="coin-big">🪙 ${S.coins}</div>
    <div class="muted xs" style="font-weight:700;margin:12px 0 4px">עזרים</div>
    ${Object.entries(ITEMS).map(([k, it]) => `<div class="shop-row"><span class="em">${it.em}</span><div style="flex:1"><b>${it.n}</b> <span class="muted xs">· יש לך ${S.items[k] || 0}</span><div class="muted xs">${it.d}</div></div><button class="btn sm ${S.coins >= it.price ? "primary" : ""}" data-buy="${k}" ${S.coins < it.price ? "disabled" : ""}>🪙 ${it.price}</button></div>`).join("")}
    <div class="muted xs" style="font-weight:700;margin:14px 0 6px">צבע האפליקציה</div>
    <div class="theme-grid">${Object.entries(THEMES).map(([k, t]) => `<button class="theme-dot ${S.accent === k ? "on" : ""}" data-th="${k}" style="--c:${t.d}"><i></i><span>${t.n}</span><small>${S.owned.includes(k) ? (S.accent === k ? "בשימוש" : "בחירה") : "🪙 " + t.price}</small></button>`).join("")}</div>
    <p class="muted xs" style="margin-top:12px">מרוויחים מטבעות מתשובות נכונות (קומבו מכפיל!), כוכבים במסע, בוסים ומשימות יומיות.</p></div>
    <div class="row"><button class="btn primary" data-a="x">סגירה</button></div>`;
  let refresh = () => { };
  const { bg } = sheet(draw(), (e, close) => {
    if (e.target.dataset.a === "x") return close();
    const b = e.target.closest("[data-buy]");
    if (b) { const k = b.dataset.buy, it = ITEMS[k]; if (S.coins >= it.price) { addCoins(-it.price, true); S.items[k] = (S.items[k] || 0) + 1; save(); beep(true); toast(it.em, "קנית " + it.n); refresh(); } return; }
    const t = e.target.closest("[data-th]");
    if (t) {
      const k = t.dataset.th;
      if (!S.owned.includes(k)) { if (S.coins < THEMES[k].price) return toast("🪙", "אין מספיק מטבעות"); addCoins(-THEMES[k].price, true); S.owned.push(k); toast("🎨", "צבע חדש!"); }
      S.accent = k; save(); applyAccent(); refresh();
    }
  });
  refresh = () => { bg.querySelector(".modal").innerHTML = draw(); updateHeader(); if (session) renderQuestion(); };
}

/* משימות יומיות ותיבת אוצר */
const MISSION_T = [
  r => { const n = [10, 15, 20][Math.floor(r() * 3)]; return { t: "correct", n, label: `ענה נכון על ${n} שאלות` }; },
  r => { const f = TOPIC_KEYS[Math.floor(r() * TOPIC_KEYS.length)]; return { t: "topic", f, n: 5, label: `5 תשובות נכונות ב${TOPICS[f].name}` }; },
  r => { const n = [5, 7][Math.floor(r() * 2)]; return { t: "combo", n, label: `הגע לקומבו של ${n} 🔥` }; },
  r => { const n = 1 + Math.floor(r() * 2); return { t: "stage", n, label: n === 1 ? "השלם שלב במסע" : `השלם ${n} שלבים במסע` }; },
  () => ({ t: "stars3", n: 1, label: "קבל 3 כוכבים בשלב ⭐⭐⭐" }),
  () => ({ t: "speed", n: 1, label: "שחק סיבוב מבחן מהירות ⚡" })
];
function missions() {
  const d = today();
  if (!S.missions || S.missions.d !== d) {
    const r = rng(parseInt(hash("m" + d), 36));
    const idx = shuffle(MISSION_T.map((_, i) => i), r).slice(0, 3);
    S.missions = { d, list: idx.map(i => ({ ...MISSION_T[i](r), p: 0, done: false })), claimed: false };
    save();
  }
  return S.missions;
}
function missionEvent(type, data = {}) {
  const m = missions(); let changed = false;
  m.list.forEach(x => {
    if (x.done) return;
    let inc = 0;
    if (type === "correct" && (x.t === "correct" || (x.t === "topic" && data.f === x.f))) inc = 1;
    if (type === "combo" && x.t === "combo" && data.n > x.p) { x.p = Math.min(x.n, data.n); changed = true; }
    if (type === "stage" && (x.t === "stage" || (x.t === "stars3" && data.stars === 3))) inc = 1;
    if (type === "speed" && x.t === "speed") inc = 1;
    if (inc) { x.p = Math.min(x.n, x.p + inc); changed = true; }
    if (x.p >= x.n) { x.done = true; addCoins(15); setTimeout(() => toast("✅", "משימה הושלמה! ‎+15 🪙"), 700); }
  });
  if (changed) save();
}
/* גלגל המזל היומי */
const WHEEL = [
  { l: "20 🪙", c: 20, w: 22 }, { l: "✂️ 50:50", it: "fifty", w: 14 }, { l: "50 🪙", c: 50, w: 14 }, { l: "⏭️ דילוג", it: "skip", w: 12 },
  { l: "+60 XP", xp: 60, w: 14 }, { l: "⏱️ זמן", it: "time", w: 10 }, { l: "🛡️ מגן", it: "shield", w: 8 }, { l: "💎 150", c: 150, w: 6 }
];
const wheelReady = () => S.wheel !== today();
function wheelCard() {
  const r = wheelReady();
  return `<div class="card wheel-card ${r ? "ready" : ""}" id="wheelCard"><div class="em">🎡</div>
    <div style="flex:1"><b style="font-size:16px">גלגל המזל</b><div class="muted small">${r ? "סיבוב חינם מחכה לך היום!" : "סובבת היום · חוזר מחר"}</div></div>${r ? `<span class="tag gold">סובב!</span>` : `<span class="chev">‹</span>`}</div>`;
}
function wheelSheet() {
  const n = WHEEL.length, seg = 360 / n, cols = ["#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#f87171", "#22d3ee", "#fb923c", "#f472b6"];
  const pt = a => [100 + 92 * Math.cos((a - 90) * Math.PI / 180), 100 + 92 * Math.sin((a - 90) * Math.PI / 180)];
  const slices = WHEEL.map((w, i) => {
    const [x1, y1] = pt(i * seg), [x2, y2] = pt((i + 1) * seg), [tx, ty] = [100 + 60 * Math.cos(((i + .5) * seg - 90) * Math.PI / 180), 100 + 60 * Math.sin(((i + .5) * seg - 90) * Math.PI / 180)];
    return `<path d="M100 100 L${x1.toFixed(1)} ${y1.toFixed(1)} A92 92 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${cols[i]}"/>
      <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" transform="rotate(${(i + .5) * seg + ((i + .5) * seg > 90 && (i + .5) * seg < 270 ? 180 : 0)} ${tx.toFixed(1)} ${ty.toFixed(1)})" text-anchor="middle" dominant-baseline="middle" class="wl">${w.l}</text>`;
  }).join("");
  const r = wheelReady();
  const { bg, close } = sheet(`<h2 style="text-align:center">🎡 גלגל המזל</h2>
    <div class="wheel-wrap"><div class="wheel-ptr">▼</div><svg viewBox="0 0 200 200" class="wheel" id="wheel"><circle cx="100" cy="100" r="96" fill="#111827"/>${slices}<circle cx="100" cy="100" r="14" fill="#fff"/></svg></div>
    <p class="muted small" style="text-align:center" id="wheelMsg">${r ? "סיבוב אחד חינם בכל יום. בהצלחה!" : "כבר סובבת היום – נתראה מחר 😉"}</p>
    <div class="row"><button class="btn" data-close>סגירה</button><button class="btn primary" id="spinBtn" ${r ? "" : "disabled"}>סובב! 🎯</button></div>`,
    (e, close) => { if (e.target.closest("[data-close]")) { close(); if (tab === "home" && !session) go("home"); } });
  bg.querySelector("#spinBtn").onclick = () => {
    if (!wheelReady()) return;
    const tot = WHEEL.reduce((a, w) => a + w.w, 0); let x = Math.random() * tot, k = 0;
    while (x >= WHEEL[k].w) { x -= WHEEL[k].w; k++; }
    S.wheel = today(); save();
    bg.querySelector("#spinBtn").disabled = true;
    const wh = bg.querySelector("#wheel"), deg = 360 * 6 + (360 - (k + .5) * seg) + (Math.random() - .5) * seg * .6;
    let tk = 0; const tic = setInterval(() => beep(true, (tk++ % 4)), 180);
    wh.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
      clearInterval(tic);
      const w = WHEEL[k];
      if (w.c) addCoins(w.c); if (w.xp) addXP(w.xp); if (w.it) S.items[w.it] = (S.items[w.it] || 0) + 1;
      save(); confetti(); beep(true, 8);
      bg.querySelector("#wheelMsg").innerHTML = `<b style="font-size:18px">זכית: ${w.l}!</b>`;
    }, 4200);
  };
}
function missionsCard() {
  const m = missions(), all = m.list.every(x => x.done);
  return `<div class="card missions"><div class="row" style="justify-content:space-between"><b>🎯 משימות היום</b><span class="muted xs">${m.list.filter(x => x.done).length}/3 · ‎+15 🪙 למשימה</span></div>
    ${m.list.map(x => `<div class="mission ${x.done ? "done" : ""}"><span>${x.done ? "✅" : "⬜"}</span><div style="flex:1;min-width:0"><div class="small">${esc(x.label)}</div><div class="mini-bar"><i style="width:${pct(x.p, x.n)}%"></i></div></div><span class="muted xs">${x.p}/${x.n}</span></div>`).join("")}
    <button class="btn block chest-btn ${all && !m.claimed ? "primary glow" : ""}" id="chestBtn" ${all && !m.claimed ? "" : "disabled"}>${m.claimed ? "🎁 התיבה נפתחה – משימות חדשות מחר" : all ? "🎁 פתח את תיבת האוצר!" : "🔒 השלם 3 משימות כדי לפתוח תיבת אוצר"}</button></div>`;
}
function openChest() {
  const m = missions(); if (m.claimed || !m.list.every(x => x.done)) return;
  m.claimed = true; S.chests = (S.chests || 0) + 1;
  const coins = 40 + Math.floor(Math.random() * 61);
  const keys = Object.keys(ITEMS), itemK = keys[Math.floor(Math.random() * keys.length)], gotItem = Math.random() < 0.75;
  addCoins(coins, true); if (gotItem) S.items[itemK] = (S.items[itemK] || 0) + 1; addXP(30); checkAchievements(); save();
  sheet(`<div style="text-align:center;padding:10px 0"><div class="chest shake">🎁</div><div class="chest-prizes hidden"><h2>תיבת האוצר נפתחה!</h2><div class="prize">🪙 ‎+${coins} מטבעות</div>${gotItem ? `<div class="prize">${ITEMS[itemK].em} ${ITEMS[itemK].n}</div>` : ""}<div class="prize">⭐ ‎+30 XP</div></div></div>
    <div class="row"><button class="btn primary" data-a="x">יש! 🎉</button></div>`, (e, close) => { if (e.target.dataset.a) { close(); go("home"); } });
  setTimeout(() => { const c = document.querySelector(".chest"); if (!c) return; c.classList.remove("shake"); c.textContent = "✨"; document.querySelector(".chest-prizes").classList.remove("hidden"); confetti(); beep(true); }, 1200);
}

/* מסע: עולמות, שלבים ובוסים */
const stageLives = () => 3 + ((S.up && S.up.heart) ? 1 : 0);
const TIERS = [
  { k: "easy", n: "מתחיל", em: "🟢", lv: ["easy"], st: 2, q: 6 },
  { k: "mid", n: "מתקדם", em: "🟡", lv: ["medium"], st: 3, q: 8 },
  { k: "pro", n: "מומחה", em: "🔴", lv: ["hard", "expert"], st: 2, q: 10 }
];
/* בכל שלב: 3 לבבות. טעות שלישית = נפסלת. כדי לעבור צריך לפחות (מספר השאלות − 2) תשובות נכונות */
const STAGES = Object.fromEntries(TOPIC_KEYS.map(f => {
  const st = [];
  TIERS.forEach((t, ti) => { const pool = BANK.filter(q => q.f === f && q.t !== "open" && t.lv.includes(q.l)); for (let j = 0; j < t.st; j++) st.push({ tier: ti, j, pool }); });
  return [f, st];
}));
const mapOf = f => { S.jr = S.jr || {}; return (S.jr[f] = S.jr[f] || { st: [], boss: false, tiers: [] }); };
const tierDone = (f, ti) => STAGES[f].every((x, i) => x.tier !== ti || (mapOf(f).st[i] || 0) > 0);
const worldUnlocked = w => w < 2 || tierDone(TOPIC_KEYS[w - 1], 0);
const stageUnlocked = (f, i) => i === 0 || (mapOf(f).st[i - 1] || 0) > 0;
const bossUnlocked = f => STAGES[f].every((_, i) => (mapOf(f).st[i] || 0) > 0);
const worldStars = f => mapOf(f).st.reduce((a, b) => a + (b || 0), 0);
const totalStars = () => TOPIC_KEYS.reduce((a, f) => a + worldStars(f), 0);
const maxStars = () => TOPIC_KEYS.reduce((a, f) => a + STAGES[f].length * 3, 0);
function nextStage() {
  for (let w = 0; w < TOPIC_KEYS.length; w++) {
    const f = TOPIC_KEYS[w]; if (!worldUnlocked(w)) continue;
    const i = STAGES[f].findIndex((_, k) => !(mapOf(f).st[k] > 0));
    if (i >= 0) return { f, i };
    if (!mapOf(f).boss) return { f, boss: true };
  }
  let best = null;
  TOPIC_KEYS.forEach((f, w) => { if (!worldUnlocked(w)) return; STAGES[f].forEach((_, i) => { const s = mapOf(f).st[i] || 0; if (s < 3 && (!best || s < best.s)) best = { f, i, s }; }); });
  return best || { f: TOPIC_KEYS[0], i: 0 };
}
const startNext = nx => nx.boss ? bossIntro(nx.f) : stageIntro(nx.f, nx.i);
function stageIntro(f, i) {
  const st = STAGES[f][i], t = TIERS[st.tier], best = mapOf(f).st[i] || 0;
  const { bg, close } = sheet(`<div class="intro"><div class="intro-em">${TOPICS[f].icon}</div>
    <div class="muted small">${TOPICS[f].name}</div><h2>${t.em} דרגת ${t.n} · שלב ${st.j + 1}</h2>
    <div class="rules">
      <div><span>📝</span><b>${t.q} שאלות</b></div>
      <div><span>🎯</span><b>צריך לפחות ${t.q - stageLives() + 1} נכונות כדי לעבור</b></div>
      <div><span>❤️</span><b>${stageLives()} לבבות – כשנגמרים, נפסלים</b></div>
      <div><span>⭐</span><b>${t.q}/${t.q} = שלושה כוכבים</b></div>
    </div>
    ${best ? `<div class="muted small">השיא שלך: ${"★".repeat(best)}${"☆".repeat(3 - best)}</div>` : ""}
    <div class="row" style="margin-top:14px"><button class="btn" data-x>ביטול</button><button class="btn primary" data-go>יאללה! ▶</button></div></div>`,
    (e, close) => { if (e.target.closest("[data-x]")) close(); if (e.target.closest("[data-go]")) { close(); startMode("stage", { f, i }); } });
}
function bossIntro(f) {
  sheet(`<div class="intro"><div class="intro-em">👹</div><div class="muted small">${TOPICS[f].name}</div><h2>קרב הבוס</h2>
    <div class="rules"><div><span>💥</span><b>${BOSS_HP} תשובות נכונות מביסות אותו</b></div><div><span>❤️</span><b>3 לבבות בלבד</b></div><div><span>🔴</span><b>שאלות ברמה הכי קשה</b></div><div><span>👑</span><b>ניצחון = העולם הושלם</b></div></div>
    <div class="row" style="margin-top:14px"><button class="btn" data-x>ביטול</button><button class="btn primary" data-go>להילחם! ⚔️</button></div></div>`,
    (e, close) => { if (e.target.closest("[data-x]")) close(); if (e.target.closest("[data-go]")) { close(); startMode("boss", { f }); } });
}
function worldHtml(f, w, ex = true) {
  const un = worldUnlocked(w), st = STAGES[f], m = mapOf(f), nx = nextStage();
  let nodes = "";
  st.forEach((x, i) => {
    const t = TIERS[x.tier];
    if (x.j === 0) {
      const tOpen = x.tier === 0 || tierDone(f, x.tier - 1);
      nodes += `<div class="tier-h t${x.tier} ${tOpen ? "" : "locked"}">${tOpen ? t.em : "🔒"} <b>${t.n}</b><span>${tOpen ? `${t.q} שאלות · צריך ${t.q - stageLives() + 1} נכונות` : `נפתח אחרי שתסיים את דרגת ה${TIERS[x.tier - 1].n}`}</span>${tierDone(f, x.tier) ? `<em>🏅</em>` : ""}</div>`;
    }
    const s = m.st[i] || 0, open = un && stageUnlocked(f, i), cur = nx.f === f && nx.i === i && !nx.boss;
    nodes += `<button class="node t${x.tier} ${s ? "done" : ""} ${open ? "" : "locked"} ${cur ? "cur" : ""} off${i % 4}" data-stage="${f}:${i}" ${open ? "" : "disabled"}><span>${open ? x.j + 1 : "🔒"}</span><i>${s ? "★".repeat(s) + "☆".repeat(3 - s) : cur ? "התחל" : ""}</i></button>`;
  });
  const bu = un && bossUnlocked(f);
  const prev = TOPIC_KEYS[w - 1];
  return `<div class="world ${un ? "" : "locked"} ${ex ? "open" : "closed"}"><div class="world-h" data-wt="${f}"><span class="em">${TOPICS[f].icon}</span><div style="flex:1"><b>${TOPICS[f].name}</b>
    <div class="muted xs">${un ? `⭐ ${worldStars(f)}/${st.length * 3}${m.boss ? " · 👑 הבוס הובס" : ""}${ex ? "" : `<div class="mini-bar" style="margin-top:4px"><i style="width:${pct(worldStars(f), st.length * 3)}%"></i></div>`}` : `🔒 נפתח אחרי שתסיים את דרגת המתחיל ב${TOPICS[prev].name}`}</div></div></div>
    ${un && ex ? `<div class="path">${nodes}<div class="tier-h boss-h ${bu ? "" : "locked"}">${bu ? "👹" : "🔒"} <b>בוס העולם</b><span>${bu ? "מוכן לקרב!" : "נפתח אחרי כל השלבים"}</span></div><button class="node boss ${m.boss ? "done" : ""} ${bu ? "" : "locked"} ${nx.f === f && nx.boss ? "cur" : ""}" data-boss="${f}" ${bu ? "" : "disabled"}><span>${m.boss ? "👑" : "👹"}</span><i>${m.boss ? "הובס" : bu ? "בוס!" : ""}</i></button></div>` : ""}</div>`;
}
function renderPlayHome() {
  const L = levelOf(S.xp), lo = xpFor(L), hi = xpFor(L + 1), nx = nextStage();
  const nxLabel = nx.boss ? `👹 קרב בוס · ${TOPICS[nx.f].name}` : `${TOPICS[nx.f].icon} ${TOPICS[nx.f].name} · שלב ${nx.i + 1}`;
  const openW = TOPIC_KEYS.filter((f, w) => worldUnlocked(w)), lockedW = TOPIC_KEYS.filter((f, w) => !worldUnlocked(w));
  app.innerHTML = `<div class="fade-in">
  <div class="hero play-hero"><div class="level-row">
    <div class="level-badge">${L}</div>
    <div style="flex:1;min-width:0"><b style="font-size:17px">${S.name ? esc(S.name) + " · " : ""}${levelTitle(L)}</b><div class="muted xs">${S.xp - lo}/${hi - lo} XP · ⭐ ${totalStars()} כוכבים</div><div class="xpbar"><i style="width:${pct(S.xp - lo, hi - lo)}%"></i></div></div>
    ${goalRing()}</div></div>
  <div id="funTop"></div>
  <button class="play-btn" id="playNow"><span class="pb-ic">▶</span><div><b>שחק עכשיו</b><span>${nxLabel}</span></div></button>
  <div id="todayRow" class="today-row"></div>
  <div class="tiles3">
    <button class="tile t-duel" id="tDuel"><span>⚔️</span><b>דו־קרב</b><small>נגד חבר</small></button>
    <button class="tile t-games" id="tGames"><span>🎪</span><b>משחקים</b><small>מצבים מיוחדים</small></button>
    <button class="tile t-coll" id="tColl"><span>🎁</span><b>אוספים</b><small>ליגה, קלפים ועוד</small></button>
  </div>
  <div class="section-title"><h2>🗺️ המסע</h2><span class="muted xs">⭐ ${totalStars()}/${maxStars()}</span></div>
  ${openW.map(f => worldHtml(f, TOPIC_KEYS.indexOf(f), f === (S.openW || nx.f))).join("")}
  ${lockedW.length ? `<div class="card locked-worlds"><b>🔒 עוד ${lockedW.length} עולמות</b><div class="muted xs">${lockedW.map(f => TOPICS[f].icon + " " + TOPICS[f].name).join(" · ")}</div><div class="muted xs" style="margin-top:4px">כל עולם נפתח אחרי שמסיימים את דרגת המתחיל בעולם שלפניו.</div></div>` : ""}
  </div>`;
  $("#playNow").onclick = () => startNext(nx);
  $("#tDuel").onclick = () => duelMenu();
  $("#tGames").onclick = () => typeof gamesPage === "function" && gamesPage();
  $("#tColl").onclick = () => typeof collectionsPage === "function" && collectionsPage();
  app.querySelectorAll("[data-stage]").forEach(b => b.onclick = () => { const [f, i] = b.dataset.stage.split(":"); stageIntro(f, +i); });
  app.querySelectorAll("[data-boss]").forEach(b => b.onclick = () => bossIntro(b.dataset.boss));
  app.querySelectorAll("[data-wt]").forEach(h => h.onclick = () => { const f = h.dataset.wt; S.openW = (S.openW || nx.f) === f ? "__none" : f; renderHome(); const el = document.querySelector(`[data-wt="${f}"]`); el && el.scrollIntoView({ block: "start", behavior: "smooth" }); });
}
function reviewList(items) {
  return items.filter(it => it.done).map((it, i) => {
    const q = it.q, ok = it.grade === 1;
    const right = q.t === "mc" ? q.o[q.a] : q.t === "tf" ? (q.a ? "נכון" : "לא נכון") : q.a;
    return `<div class="review-item"><div class="q"><span class="pill ${ok ? "ok" : "no"}">${ok ? "נכון" : "שגוי"}</span>${esc(q.q)}</div><div class="small">התשובה: <b>${esc(right)}</b></div><div class="small muted">💡 ${linkTerms(q.e)}</div></div>`;
  }).join("");
}
function finishStage() {
  const s = session, f = s.opt.f, i = s.opt.i, st = STAGES[f][i], t = TIERS[st.tier];
  const graded = s.items.filter(x => x.grade !== null), correct = graded.filter(x => x.grade === 1).length, wrong = graded.length - correct;
  const failed = s.lives <= 0, need = t.q - (s.maxL - 1);
  const stars = failed ? 0 : wrong === 0 ? 3 : wrong === 1 ? 2 : 1;
  const m = mapOf(f), prev = m.st[i] || 0, wNow = TOPIC_KEYS.indexOf(f);
  const nextWorldWas = TOPIC_KEYS[wNow + 1] ? worldUnlocked(wNow + 1) : true, tierWas = tierDone(f, st.tier);
  let bonus = 0, banners = [];
  if (stars > prev) { bonus = (stars - prev) * 10 + (prev === 0 ? 10 : 0); m.st[i] = stars; addCoins(bonus, true); }
  if (!tierWas && tierDone(f, st.tier)) {
    const tb = 40 * (st.tier + 1); bonus += tb; addCoins(tb, true); addXP(30 * (st.tier + 1));
    banners.push(`🏅 סיימת את דרגת ה${t.n}! ‎+${tb} 🪙${TIERS[st.tier + 1] ? ` · נפתחה דרגת ${TIERS[st.tier + 1].em} ${TIERS[st.tier + 1].n}` : " · הבוס מחכה לך 👹"}`);
  }
  if (!nextWorldWas && worldUnlocked(wNow + 1)) banners.push(`🌍 עולם חדש נפתח: ${TOPICS[TOPIC_KEYS[wNow + 1]].icon} ${TOPICS[TOPIC_KEYS[wNow + 1]].name}`);
  if (stars) { missionEvent("stage", { stars }); addXP(15 * stars * (st.tier + 1)); }
  touchStreak(); logHistory({ mode: "stage", title: s.title, score: pct(correct, t.q), n: graded.length });
  checkAchievements({ perfect: stars === 3 }); save();
  if (stars === 3 || banners.length) confetti();
  const nx = stars ? (STAGES[f][i + 1] ? { f, i: i + 1 } : (bossUnlocked(f) && !m.boss ? { f, boss: true } : nextStage())) : null;
  const coins = s.coinsEarned + bonus, items = s.items, maxC = s.maxCombo, title = s.title;
  session = null; document.body.classList.remove("in-quiz");
  const head = failed ? "נפסלת הפעם 💔" : stars === 3 ? "מושלם! 🌟" : stars === 2 ? "כמעט מושלם!" : "עברת את השלב!";
  const sub = failed ? `${correct} נכונות · ${s.maxL} טעויות. כדי לעבור צריך ${need} נכונות מתוך ${t.q} – אתה יכול! 💪` : `${correct}/${t.q} נכונות${stars < 3 ? ` · ${t.q}/${t.q} = שלושה כוכבים` : ""}`;
  app.innerHTML = `<div class="fade-in"><div class="card stage-res" style="text-align:center">
    <div class="muted small">${esc(title)}</div>
    <div class="stars-big">${[0, 1, 2].map(k => `<span class="${k < stars ? "on" : ""}" style="animation-delay:${0.2 + k * 0.25}s">★</span>`).join("")}</div>
    <h1>${head}</h1>
    <p class="muted" style="margin:4px 0 14px">${sub}</p>
    ${banners.map(b => `<div class="banner-win">${b}</div>`).join("")}
    <div class="grid3"><div class="statbox"><b dir="ltr">+${coins}</b><span>🪙 מטבעות</span></div><div class="statbox"><b>🔥 ${maxC}</b><span>קומבו מרבי</span></div><div class="statbox"><b>⭐ ${totalStars()}</b><span>כוכבים במסע</span></div></div>
    <div class="col" style="margin-top:16px">
      ${nx ? `<button class="btn primary lg block" id="nextSt">${nx.boss ? "👹 לקרב הבוס!" : "▶ לשלב הבא"}</button>` : `<button class="btn primary lg block" id="againSt2">🔁 נסה שוב</button>`}
      <div class="row">${nx ? `<button class="btn" id="againSt" style="flex:1">🔁 ${stars < 3 ? "שפר כוכבים" : "שחק שוב"}</button>` : `<button class="btn" id="learnSt" style="flex:1">📘 שיעור בנושא</button>`}<button class="btn" id="toMap" style="flex:1">🗺️ למפה</button></div>
    </div></div>
    <details class="why card" ${failed ? "open" : ""}><summary>סקירת תשובות</summary>${reviewList(items)}</details></div>`;
  window.scrollTo(0, 0); updateHeader();
  $("#nextSt") && ($("#nextSt").onclick = () => startNext(nx));
  $("#againSt") && ($("#againSt").onclick = () => startMode("stage", { f, i }));
  $("#againSt2") && ($("#againSt2").onclick = () => startMode("stage", { f, i }));
  $("#learnSt") && ($("#learnSt").onclick = () => { setMode("learn", false); go("learn"); });
  $("#toMap").onclick = () => go("home");
}
function finishBoss() {
  const s = session, win = s.bossHp <= 0, f = s.opt.f, m = mapOf(f);
  let bonus = 0;
  if (win) { bonus = m.boss ? 20 : 60; m.boss = true; addCoins(bonus, true); addXP(50); confetti(); }
  touchStreak(); logHistory({ mode: "boss", title: s.title, score: win ? 100 : 0, n: s.items.filter(x => x.done).length, extra: win ? "ניצחון 👑" : "הפסד" });
  checkAchievements(); save();
  const w = TOPIC_KEYS.indexOf(f), nextW = TOPIC_KEYS[w + 1];
  const coins = s.coinsEarned + bonus, items = s.items, maxC = s.maxCombo, hits = BOSS_HP - Math.max(0, s.bossHp);
  session = null; document.body.classList.remove("in-quiz");
  app.innerHTML = `<div class="fade-in"><div class="card stage-res" style="text-align:center">
    <div style="font-size:70px" class="${win ? "pop" : ""}">${win ? "👑" : "💀"}</div>
    <h1>${win ? "הבסת את הבוס!" : "הבוס ניצח הפעם"}</h1>
    <p class="muted" style="margin:4px 0 14px">${win ? `${TOPICS[f].name} – העולם הושלם!` : `פגעת בו ${hits} מתוך ${BOSS_HP} פעמים. תתאמן בשלבים ותחזור חזק יותר 💪`}</p>
    <div class="grid3"><div class="statbox"><b dir="ltr">+${coins}</b><span>🪙 מטבעות</span></div><div class="statbox"><b>🔥 ${maxC}</b><span>קומבו מרבי</span></div><div class="statbox"><b>💥 ${hits}/${BOSS_HP}</b><span>פגיעות</span></div></div>
    <div class="col" style="margin-top:16px">
      ${win && nextW && worldUnlocked(w + 1) ? `<button class="btn primary lg block" id="nextW">${TOPICS[nextW].icon} לעולם הבא: ${TOPICS[nextW].name}</button>` : ""}
      ${!win ? `<button class="btn primary lg block" id="againB">👹 עוד ניסיון</button>` : ""}
      <button class="btn block" id="toMap">🗺️ למפה</button>
    </div></div>
    <details class="why card"><summary>סקירת תשובות</summary>${reviewList(items)}</details></div>`;
  window.scrollTo(0, 0); updateHeader();
  $("#nextW") && ($("#nextW").onclick = () => startNext(nextStage()));
  $("#againB") && ($("#againB").onclick = () => startMode("boss", { f }));
  $("#toMap").onclick = () => go("home");
}

/* ───────── כרטיסיות ───────── */
let flash = null;
function startFlash(topics) {
  const pool = BANK.filter(q => topics.includes(q.f));
  const sorted = shuffle(pool).sort((a, b) => ((S.qs[a.id]?.box ?? 0) - (S.qs[b.id]?.box ?? 0)));
  stopFactTimer();
  flash = { cards: sorted.slice(0, 20), idx: 0, known: 0, again: 0, topics };
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
    $("#fa").onclick = () => startFlash(f.topics); $("#fh").onclick = () => go("home");
    return;
  }
  const q = f.cards[f.idx];
  const ans = q.t === "mc" ? q.o[q.a] : q.t === "tf" ? (q.a ? "✓ נכון" : "✗ לא נכון") : q.a;
  app.innerHTML = `<div class="fade-in">
    <div class="qhead"><button class="x" id="fq">✕</button><div class="progress"><i style="width:${pct(f.idx, f.cards.length)}%"></i></div><span class="muted small">${f.idx + 1}/${f.cards.length}</span></div>
    <div class="flash-wrap"><div class="flash" id="card">
      <div class="face"><div class="tags"><span class="tag">${TOPICS[q.f].icon} ${TOPICS[q.f].name}</span><span class="tag lv-${q.l}">${LEVELS[q.l]}</span></div>
        <div class="qtext">${esc(q.q)}</div>${figHtml(q)}<div class="hint">👆 הקש כדי להפוך</div></div>
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


/* ───────── מונחים לחיצים ושאלות ───────── */
const TERM_ALIASES = {
  "כיווץ קונצנטרי": ["קונצנטרי"], "כיווץ אקסצנטרי": ["אקסצנטרי"], "כיווץ איזומטרי": ["איזומטרי"],
  "מישור סגיטלי": ["סגיטלי"], "מישור פרונטלי": ["פרונטלי"], "מישור טרנסברסלי": ["טרנסברסלי"],
  "מערכת ATP–CP": ["ATP–CP", "קריאטין פוספט"], "עומס מתקדם": ["Progressive overload"],
  "עקרון SAID": ["SAID"], "עקרון ההפיכות": ["הפיכות"], "רגרסיה / פרוגרסיה": ["רגרסיה", "פרוגרסיה", "רגרסיות", "פרוגרסיות"],
  "זרוע מומנט": ["זרוע המומנט"], "יחידה מוטורית": ["יחידות מוטוריות"], "נפח אימון": ["נפח האימון"],
  "שלבי השינוי": ["מודל שלבי השינוי"], "מסוגלות עצמית": ["Self-efficacy"], "מרכז כובד": ["מרכז הכובד"], "בסיס תמיכה": ["בסיס התמיכה"]
};
let TERM_INDEX = null, TERM_RE = null;
function buildTerms() {
  TERM_INDEX = {};
  GLOSSARY.forEach(([k, v, extra]) => {
    const names = [k, k.replace(/\s*\(.*?\)\s*/g, " ").trim(), ...((k.match(/\((.*?)\)/) || [])[1] ? [k.match(/\((.*?)\)/)[1]] : []), ...(TERM_ALIASES[k] || []), ...(extra || [])];
    names.forEach(n => { n = n.trim(); if (n.length >= 2 && !TERM_INDEX[n]) TERM_INDEX[n] = k; });
  });
  const alts = Object.keys(TERM_INDEX).sort((a, b) => b.length - a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  TERM_RE = new RegExp(`(^|[\\s"'(״׳–\\-/,.:;])([והבלמשכ]{0,2})(${alts.join("|")})(?=$|[\\s.,:;!?)"'״–\\-/]|ים|ות)`, "g");
}
const termDef = k => (GLOSSARY.find(g => g[0] === k) || [])[1];
function linkTerms(text, skip) {
  if (!TERM_RE) buildTerms();
  return esc(text).replace(TERM_RE, (m, pre, prefix, word) => {
    const key = TERM_INDEX[word];
    if (!key || key === skip) return m;
    return `${pre}${prefix}<button class="term-link" data-term="${esc(key)}">${word}</button>`;
  });
}
function termsIn(text) {
  if (!TERM_RE) buildTerms();
  const found = new Set(); let m; TERM_RE.lastIndex = 0;
  while ((m = TERM_RE.exec(text))) { const k = TERM_INDEX[m[3]]; if (k) found.add(k); }
  return [...found];
}
document.addEventListener("click", e => {
  const t = e.target.closest(".term-link"); if (!t) return;
  e.preventDefault(); e.stopPropagation();
  termSheet(t.dataset.term);
}, true);
function termSheet(k) {
  sheet(`<div class="muted xs" style="font-weight:700">📖 מונח</div><h2 style="margin-top:4px">${esc(k)}</h2>
    <p style="font-size:16px;line-height:1.7;margin:0 0 6px">${linkTerms(termDef(k) || "", k)}</p>
    <div class="row"><button class="btn" data-a="ask">❓ עדיין לא ברור</button><button class="btn primary" data-a="x">הבנתי 👍</button></div>`,
    (e, close) => { const a = e.target.dataset.a; if (!a) return; close(); if (a === "ask") askSheet(k + ": " + (termDef(k) || ""), k); });
}
function searchAll(query) {
  const norm = s => s.toLowerCase().replace(/[״"׳'.,:;!?()\-–]/g, " ");
  const toks = norm(query).split(/\s+/).filter(t => t.length >= 2 && !["מה","זה","איך","למה","של","את","על","עם","או","גם","כל","יש","אני","לא","הוא","היא","זו","מי","כמה","מתי","האם","בין"].includes(t));
  if (!toks.length) return [];
  const variants = t => { const v = [t]; if (t.length > 3 && "והבלמשכ".includes(t[0])) v.push(t.slice(1)); if (t.length > 4 && "והבלמשכ".includes(t[0]) && "הבלמשכ".includes(t[1])) v.push(t.slice(2)); return v; };
  const tv = toks.map(variants);
  const score = (title, body) => { const a = norm(title), b = norm(body); let s = 0; tv.forEach(v => { if (v.some(x => a.includes(x))) s += 3; else if (v.some(x => b.includes(x))) s += 1; }); return s; };
  const res = [];
  GLOSSARY.forEach(([k, v]) => res.push({ type: "📖 מונח", title: k, body: v, s: score(k, v) * 1.3 }));
  Object.entries(LESSONS).forEach(([f, secs]) => secs.forEach(([h, t]) => res.push({ type: "📘 שיעור · " + TOPICS[f].name, title: h, body: t, f, s: score(h, t) })));
  FACTS.forEach(f => res.push({ type: "💡 עובדה", title: "", body: f.t, s: score("", f.t) * .9 }));
  allFoods().forEach(f => res.push({ type: "🍽️ ערכים תזונתיים", title: f.n, body: `ל־100 גרם: ${f.k} קלוריות, חלבון ${f.p} ג׳, פחמימות ${f.c} ג׳, שומן ${f.f} ג׳. מנה רגילה (${f.sl}, ${f.sg} ג׳): ${Math.round(f.k * f.sg / 100)} קלוריות, ${Math.round(f.p * f.sg / 10) / 10} ג׳ חלבון.`, s: score(f.al.join(" "), "קלוריות חלבון פחמימות שומן ערכים תזונתיים כמה") * 1.2 }));
  BANK.forEach(q => res.push({ type: "❔ מתוך שאלה · " + TOPICS[q.f].name, title: q.q, body: q.e, s: score(q.q, q.e) * .8 }));
  return res.filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 6);
}
function askSheet(context = "", focus = "") {
  const terms = context ? termsIn(context).filter(k => k !== focus) : [];
  const { bg } = sheet(`<div style="max-height:76vh;overflow:auto">
    <h2>❓ מה לא ברור?</h2>
    ${context ? `<div class="ask-ctx">${linkTerms(context)}</div>` : ""}
    ${terms.length ? `<div class="muted xs" style="font-weight:700;margin:12px 0 4px">מונחים מהטקסט – הקש על מונח להסבר:</div><div class="chips">${terms.map(k => `<button class="chip term-link" data-term="${esc(k)}">${esc(k)}</button>`).join("")}</div>` : ""}
    <label class="lbl">כתוב מילה או שאלה</label>
    <input class="search" id="askQ" placeholder="למשל: מה זה גליקוגן?" autocomplete="off">
    <div id="askRes"></div>
    <div class="row" style="margin-top:12px"><button class="btn" data-a="google">🔎 חיפוש בגוגל</button><button class="btn" data-a="mail">✉️ שליחה למפתח</button></div>
    <p class="muted xs" style="margin:8px 0 0">החיפוש עובד גם בלי אינטרנט – במילון, בשיעורים, בעובדות ובהסברים של כל השאלות.</p>
    <div class="row"><button class="btn primary" data-a="x">סגירה</button></div></div>`,
    (e, close) => {
      const a = e.target.dataset.a; if (!a) return;
      const q = bg.querySelector("#askQ").value.trim();
      if (a === "x") close();
      if (a === "google") { const query = q || focus || context.slice(0, 80); if (!query) return toast("✍️", "כתוב קודם מה לחפש"); window.open("https://www.google.com/search?q=" + encodeURIComponent(query + " כושר"), "_blank"); }
      if (a === "mail") {
        if (!q) return toast("✍️", "כתוב קודם את השאלה");
        location.href = `mailto:${CONTACT}?subject=${encodeURIComponent("שאלה מאפליקציית מאמן ידע")}&body=${encodeURIComponent("השאלה שלי:\n" + q + (context ? "\n\nבהקשר של:\n" + context : ""))}`;
      }
      if (a === "lesson") { close(); go("learn", { lesson: e.target.dataset.f }); }
    });
  const inp = bg.querySelector("#askQ"), out = bg.querySelector("#askRes");
  const draw = () => {
    const q = inp.value.trim();
    if (q.length < 2) { out.innerHTML = ""; return; }
    const r = searchAll(q);
    out.innerHTML = r.length ? `<div class="muted xs" style="font-weight:700;margin:12px 0 4px">מה מצאתי:</div>` + r.map(x => `<div class="ask-res"><div class="muted xs">${esc(x.type)}</div>${x.title ? `<b>${esc(x.title)}</b>` : ""}<div class="small">${linkTerms(x.body)}</div>${x.f ? `<button class="link-btn xs" data-a="lesson" data-f="${x.f}">לשיעור המלא ←</button>` : ""}</div>`).join("")
      : `<div class="empty" style="padding:14px"><span class="em">🤔</span>לא מצאתי תשובה באפליקציה. אפשר לחפש בגוגל או לשלוח את השאלה למפתח.</div>`;
  };
  inp.oninput = draw;
  if (!context) setTimeout(() => inp.focus(), 60);
}

/* ───────── מסך למידה: שיעורים, מילון, עובדות ───────── */
let learnSeg = "lessons";
function renderLearn(sub) {
  if (sub && sub.lesson) return renderLesson(sub.lesson);
  if (sub && sub.seg) learnSeg = sub.seg;
  app.innerHTML = `<div class="fade-in"><h1>למידה</h1>
    <div class="seg" id="lseg" style="margin:10px 0 4px">${[["lessons", "📘 שיעורים"], ["glossary", "📖 מילון"], ["facts", "💡 עובדות"]].map(([k, v]) => `<button data-k="${k}" class="${learnSeg === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <div id="lbody"></div></div>`;
  $("#lseg").onclick = e => { const b = e.target.closest("button"); if (!b) return; learnSeg = b.dataset.k; renderLearn(); };
  const body = $("#lbody");
  if (learnSeg === "lessons") {
    body.innerHTML = `<p class="muted small">שיעור קצר לכל תחום – כדאי לקרוא לפני מבחן.</p><div class="card" style="padding:4px 16px">${TOPIC_KEYS.map(f => `<div class="topic" data-l="${f}"><div class="em">${TOPICS[f].icon}</div><div class="tx"><b>${TOPICS[f].name}</b><span class="muted xs">${(LESSONS[f] || []).length} נושאים · ${topicStats(f).total} שאלות</span></div><span class="chev">‹</span></div>`).join("")}</div>`;
    body.querySelectorAll("[data-l]").forEach(el => el.onclick = () => renderLesson(el.dataset.l));
  } else if (learnSeg === "glossary") {
    body.innerHTML = `<div class="row" style="margin:6px 0 10px"><input class="search" id="gq" type="search" placeholder="🔍 חיפוש מונח..." autocomplete="off" style="flex:1"><button class="btn" id="gquiz">מבחן</button><button class="btn" id="gask">❓</button></div><div class="card" style="padding:4px 16px" id="glist"></div>`;
    const draw = term => {
      const t = term.trim().toLowerCase();
      const list = GLOSSARY.filter(([k, v]) => !t || k.toLowerCase().includes(t) || v.toLowerCase().includes(t)).sort((a, b) => a[0].localeCompare(b[0], "he"));
      $("#glist").innerHTML = list.length ? list.map(([k, v]) => `<div class="term"><b>${esc(k)}</b><span class="muted small">${linkTerms(v, k)}</span></div>`).join("") : `<div class="empty"><span class="em">🤷</span>לא נמצא מונח מתאים</div>`;
    };
    $("#gq").oninput = e => draw(e.target.value); $("#gquiz").onclick = () => startMode("terms"); $("#gask").onclick = () => askSheet(); draw("");
  } else renderFactsList(body);
}
let factFilter = "all";
function renderFactsList(body) {
  const list = FACTS.map((f, i) => ({ ...f, i })).filter(f => factFilter === "all" || (factFilter === "fav" ? S.factFav.includes(f.i) : f.c === factFilter));
  body.innerHTML = `<div class="card fact-card" style="text-align:center">
      <div style="font-size:30px">🖥️</div><b>מצב שומר מסך</b><p class="muted small" style="margin:4px 0 10px">עובדה חדשה כל 2 דקות, במסך מלא. נפתח גם לבד כשהאפליקציה פתוחה ולא נוגעים בה.</p>
      <button class="btn primary block" id="saverNow">הפעלה עכשיו</button></div>
    <div class="tip" id="factsAsk" style="margin-top:12px"><span style="font-size:20px">❓</span><div><b>נתקלת במילה לא מוכרת?</b><div class="small muted">מילים מסומנות בקו לחיצות. אפשר גם לכתוב שאלה חופשית.</div></div></div>
    <div class="row" style="justify-content:space-between;margin:14px 2px 6px"><div class="chips" id="ff">${[["all", "הכול"], ["fit", "💪 כושר"], ["psy", "🧠 פסיכולוגיה"], ["fav", "❤️ אהובות"]].map(([k, v]) => `<button class="chip ${factFilter === k ? "on" : ""}" data-k="${k}">${v}</button>`).join("")}</div></div>
    <div class="muted xs" style="margin:0 2px 6px">קראת ${S.factSeen.length} מתוך ${FACTS.length} עובדות</div>
    <div class="card" style="padding:4px 16px">${list.length ? list.map(f => `<div class="term fact-row ${S.factSeen.includes(f.i) ? "" : "new"}"><span>${linkTerms(f.t)}</span><button class="fav-btn" data-fav="${f.i}" aria-label="אהובה">${S.factFav.includes(f.i) ? "❤️" : "🤍"}</button></div>`).join("") : `<div class="empty"><span class="em">🤍</span>עוד לא סימנת עובדות אהובות</div>`}</div>`;
  $("#saverNow").onclick = openSaver;
  $("#factsAsk").onclick = () => askSheet();
  $("#ff").onclick = e => { const b = e.target.closest(".chip"); if (!b) return; factFilter = b.dataset.k; renderFactsList(body); };
  body.querySelectorAll("[data-fav]").forEach(b => b.onclick = () => { const i = +b.dataset.fav; toggleFav(i); if (!S.factSeen.includes(i)) S.factSeen.push(i); save(); b.textContent = S.factFav.includes(i) ? "❤️" : "🤍"; });
}
function lessonSheet(f) {
  sheet(`<div style="max-height:74vh;overflow:auto"><h2>${TOPICS[f].icon} ${esc(TOPICS[f].name)}</h2><p class="muted xs">שיעור קצר – קרא ותחזור לשאלות 💪</p>${lessonBody(f)}</div>
    <div class="row"><button class="btn primary" data-a="x">חזרה לשאלה</button></div>`, (e, close) => { if (e.target.dataset.a) close(); });
}
function lessonBody(f) {
  return (LESSONS[f] || []).map(([h, t]) => `<div class="lesson-sec"><h3>${esc(h)}</h3><p>${linkTerms(t)}</p></div>`).join("");
}
function renderLesson(f) {
  learnSeg = "lessons";
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === "learn"));
  tab = "learn";
  app.innerHTML = `<div class="fade-in">
    <button class="link-btn small" id="lback">→ כל השיעורים</button>
    <div style="font-size:40px;margin-top:6px">${TOPICS[f].icon}</div><h1>${TOPICS[f].name}</h1>
    <div class="card">${lessonBody(f)}</div>
    <div class="grid2"><button class="btn primary lg" id="lq">🎯 מבחן על הנושא</button><button class="btn lg" id="lf">🃏 כרטיסיות</button></div>
  </div>`;
  window.scrollTo(0, 0);
  $("#lback").onclick = () => go("learn");
  $("#lq").onclick = () => startMode("topic", { f });
  $("#lf").onclick = () => startFlash([f]);
}
function lessonSheet(f) {
  sheet(`<div style="max-height:70vh;overflow:auto"><div style="font-size:30px">${TOPICS[f].icon}</div><h2>${TOPICS[f].name}</h2>${lessonBody(f)}</div>
    <div class="row"><button class="btn primary" data-a="x">חזרה לשאלה</button></div>`, (e, close) => { if (e.target.dataset.a) close(); });
}


/* ───────── אוכל: ערכים תזונתיים ───────── */
const FOODS = FOODS_RAW.map(([n, al, k, p, c, f, sg, sl, u, src]) => ({
  n, al: [n, ...(al ? al.split("|") : [])], k, p, c, f, sg, sl, src: src || "e",
  u: Object.fromEntries((u || "").split("|").filter(Boolean).map(x => { const [a, b] = x.split(":"); return [a, +b]; }))
}));
const allFoods = () => [
  ...FOODS.map(f => S.foodFix && S.foodFix[f.n] ? { ...f, ...S.foodFix[f.n], fixed: true } : f),
  ...(S.myFoods || []).map(m => ({ ...m, al: [m.n], u: {}, mine: true, src: "m" }))];
const SRC_LABEL = { u: "מאגר USDA", l: "תווית / נתוני יצרן", e: "הערכה לפי מתכון ממוצע", m: "מזון שהוספת", fix: "תוקן על ידך" };
// זוגות "לפני בישול" ↔ "אחרי בישול"
const RAW_PAIRS = [["אורז לבן מבושל", "אורז לא מבושל"], ["אורז מלא מבושל", "אורז לא מבושל"], ["אורז בסמטי מבושל", "אורז לא מבושל"], ["פסטה מבושלת", "פסטה לא מבושלת"], ["קינואה מבושלת", "קינואה לא מבושלת"], ["קוסקוס מבושל", "קוסקוס לא מבושל"], ["בורגול מבושל", "בורגול לא מבושל"], ["פתיתים מבושלים", "פתיתים לא מבושלים"], ["עדשים מבושלות", "עדשים יבשות"], ["חזה עוף מבושל", "חזה עוף לא מבושל"], ["פרגית מבושלת", "פרגית לא מבושלת"], ["בשר טחון מבושל", "בשר טחון לא מבושל"], ["סלמון מבושל", "סלמון לא מבושל"], ["תפוח אדמה מבושל", "תפוח אדמה לא מבושל"], ["בטטה אפויה", "בטטה לא מבושלת"]];
const pairOf = n => { const p = RAW_PAIRS.find(x => x[0] === n || x[1] === n); return p ? { other: p[0] === n ? p[1] : p[0], isCooked: p[0] === n } : null; };
const findFood = n => allFoods().find(f => f.n === n);
const fnorm = s => String(s).replace(/[״"׳'`]/g, "").replace(/[־\-–]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
const NUMW = { "חצי": .5, "רבע": .25, "שליש": 1 / 3, "אחד": 1, "אחת": 1, "שניים": 2, "שתיים": 2, "שני": 2, "שתי": 2, "שלוש": 3, "שלושה": 3, "ארבע": 4, "ארבעה": 4, "חמש": 5, "חמישה": 5, "שש": 6, "שישה": 6, "שבע": 7, "שבעה": 7, "שמונה": 8, "תשע": 9, "תשעה": 9, "עשר": 10, "עשרה": 10, "זוג": 2 };
const UNITS = {
  "גרם": "g", "גרמים": "g", "גר": "g", "ג": "g", "g": "g", "gr": "g", "מל": "g", "ml": "g", "מיליליטר": "g", "קג": "kg", "קילו": "kg", "kg": "kg", "ליטר": "kg",
  "כוס": "כוס", "כוסות": "כוס", "כף": "כף", "כפות": "כף", "כפית": "כפית", "כפיות": "כפית", "פרוסה": "פרוסה", "פרוסות": "פרוסה",
  "יחידה": "יחידה", "יחידות": "יחידה", "חתיכה": "יחידה", "חתיכות": "יחידה", "מנה": "מנה", "מנות": "מנה", "גביע": "גביע", "גביעים": "גביע",
  "פחית": "פחית", "פחיות": "פחית", "קופסה": "קופסה", "קופסא": "קופסה", "קופסאות": "קופסה", "שקית": "שקית", "שקיות": "שקית",
  "חופן": "חופן", "חופנים": "חופן", "כדור": "כדור", "כדורים": "כדור", "משולש": "משולש", "משולשים": "משולש", "סקופ": "סקופ", "סקופים": "סקופ",
  "צלחת": "צלחת", "צלחות": "צלחת", "קערה": "קערה", "קערות": "קערה", "בקבוק": "בקבוק", "בקבוקים": "בקבוק", "קובייה": "קובייה", "קוביה": "קובייה", "קוביות": "קובייה",
  "פלח": "פלח", "פלחים": "פלח", "חפיסה": "חפיסה", "חפיסות": "חפיסה"
};
const UNIT_G = { "כוס": 200, "כף": 15, "כפית": 5, "חופן": 30, "צלחת": 250, "קערה": 250, "פחית": 330, "בקבוק": 500, "שקית": 50, "קובייה": 6, "משולש": 110, "פלח": 150, "סקופ": 30, "גביע": 150, "קופסה": 150, "פרוסה": 30, "כדור": 30, "חפיסה": 100 };
function matchFood(name) {
  const q = fnorm(name).replace(/^ו(?=\S{3,})/, "");
  if (!q) return { food: null, alts: [] };
  const vars = [q, q.replace(/^ה(?=\S{3,})/, ""), q.replace(/(ים|ות)$/, ""), q.replace(/(ים|ות)$/, "ה"), q.replace(/ות$/, "ה")];
  const scored = [];
  allFoods().forEach(f => {
    let best = 0;
    f.al.forEach(a => {
      const A = fnorm(a); if (!A) return;
      if (vars.includes(A)) best = Math.max(best, 100 + A.length);
      else if (vars.some(v => (" " + v + " ").includes(" " + A + " "))) best = Math.max(best, 60 + A.length);
      else if (A.startsWith(q) && q.length >= 2) best = Math.max(best, 40 - (A.length - q.length) * .5);
      else if (A.includes(q) && q.length >= 3) best = Math.max(best, 30 - (A.length - q.length) * .5);
    });
    if (best > 0) scored.push({ f, s: best + (f.mine ? 5 : 0) });
  });
  scored.sort((a, b) => b.s - a.s);
  return { food: scored[0] ? scored[0].f : null, alts: scored.slice(0, 6).map(x => x.f) };
}
const UNIT_PL = { "כוס": "כוסות", "כף": "כפות", "כפית": "כפיות", "פרוסה": "פרוסות", "יחידה": "יחידות", "גביע": "גביעים", "פחית": "פחיות", "קופסה": "קופסאות", "שקית": "שקיות", "חופן": "חופנים", "כדור": "כדורים", "משולש": "משולשים", "סקופ": "סקופים", "צלחת": "צלחות", "קערה": "קערות", "בקבוק": "בקבוקים", "קובייה": "קוביות", "פלח": "פלחים", "חפיסה": "חפיסות" };
function unitDesc(n, key) {
  const [u, a] = key.split(" ");
  const r = Math.round(n * 100) / 100;
  if (r === 0.5) return `חצי ${u}${a ? " " + a : ""}`;
  if (r === 1) return `${u}${a ? " " + a : ""}`;
  return `${r} ${UNIT_PL[u] || u}${a ? " " + (a === "גדולה" ? "גדולות" : "קטנות") : ""}`;
}
function parseFoodLine(line) {
  let t = fnorm(line).replace(/(\d)([^\d\s.,/])/g, "$1 $2").replace(/([^\d\s.,/])(\d)/g, "$1 $2").replace(/½/g, " 0.5 ").replace(/¼/g, " 0.25 ");
  const toks = t.split(" ").filter(Boolean);
  let qty = null, unit = null, extra = 0; const name = [];
  toks.forEach(tok => {
    const tk = tok.replace(/^ו(?=חצי|רבע)/, "");
    if (/^\d+([.,]\d+)?$/.test(tk)) { qty = (qty || 0) + parseFloat(tk.replace(",", ".")); return; }
    if (/^\d+\/\d+$/.test(tk)) { const [a, b] = tk.split("/").map(Number); qty = (qty || 0) + a / b; return; }
    if (tok.startsWith("ו") && (tk === "חצי" || tk === "רבע")) { extra += NUMW[tk]; return; }
    if (NUMW[tk] !== undefined && !name.length) { qty = (qty || 0) + NUMW[tk]; return; }
    if (UNITS[tk] && !unit) { unit = UNITS[tk]; return; }
    if (tk.length > 2 && "בל".includes(tk[0]) && UNITS[tk.slice(1)] && !unit) { unit = UNITS[tk.slice(1)]; return; }
    name.push(tok);
  });
  if (extra) qty = (qty || 1) + extra;
  let adj = null;
  if (unit && name.length && /^(גדול|גדולה|קטן|קטנה)$/.test(name[0])) adj = name.shift().replace(/ה$/, "") === "גדול" ? "גדולה" : "קטנה";
  const { food, alts } = matchFood(name.join(" "));
  if (!food) return { line, name: name.join(" "), food: null, alts };
  let grams, desc;
  const n = qty == null ? 1 : qty;
  const fmt = x => (Math.round(x * 100) / 100).toString();
  if (unit === "g") { grams = n; desc = `${fmt(n)} גרם`; }
  else if (unit === "kg") { grams = n * 1000; desc = `${fmt(n)} ק״ג`; }
  else if (unit === "מנה") { grams = n * food.sg; desc = `${fmt(n)} × ${food.sl}`; }
  else if (unit) { const key = adj && food.u[unit + " " + adj] ? unit + " " + adj : unit; const g = food.u[key] || (unit === "יחידה" ? food.sg : UNIT_G[unit]); grams = n * g; desc = unitDesc(n, key); }
  else if (qty != null && qty >= 20 && !food.u["יחידה"]) { grams = qty; desc = `${fmt(qty)} גרם`; }
  else if (qty != null && (food.u["יחידה"] || food.u["פרוסה"])) { const g = food.u["יחידה"] || food.u["פרוסה"]; grams = n * g; desc = unitDesc(n, food.u["יחידה"] ? "יחידה" : "פרוסה"); }
  else { grams = n * food.sg; desc = qty == null ? food.sl : `${fmt(n)} × ${food.sl}`; }
  grams = Math.round(grams);
  const r = grams / 100;
  return { line, food, alts, grams, desc, k: food.k * r, p: food.p * r, c: food.c * r, f: food.f * r };
}
const FOOD_EXAMPLES = {
  "ארוחת בוקר": "2 ביצים\n2 פרוסות לחם מלא\nגבינת סקי\nסלט ירקות\nקפה הפוך",
  "צהריים": "חזה עוף\nכוס אורז\nסלט ירקות\n2 כפות טחינה",
  "אחרי אימון": "יוגורט פרו\nבננה\nחופן שקדים",
  "נשנושים": "מילקי\nבמבה\nתפוח"
};
let foodSeg = "food";
function renderTools(sub) {
  if (sub && sub.seg) foodSeg = sub.seg;
  app.innerHTML = `<div class="fade-in"><h1>${foodSeg === "food" ? "🍽️ כמה יש באוכל?" : "🧮 מחשבונים"}</h1>
    <div class="seg" id="tseg" style="margin:8px 0 6px">${[["food", "🍽️ ערכים תזונתיים"], ["calc", "🧮 מחשבונים"]].map(([k, v]) => `<button data-k="${k}" class="${foodSeg === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <div id="tbody"></div></div>`;
  $("#tseg").onclick = e => { const b = e.target.closest("button"); if (!b) return; foodSeg = b.dataset.k; renderTools(); };
  if (foodSeg === "food") renderFood($("#tbody")); else renderCalcs($("#tbody"));
}
function renderFood(body) {
  body.innerHTML = `
  <div class="card">
    <p class="muted small" style="margin-top:0">כתוב מאכל בכל שורה. אפשר להוסיף כמות: <b>2 ביצים</b>, <b>כוס אורז</b>, <b>150 גרם עוף</b>, <b>חצי אבוקדו</b>. בלי כמות – נחשבת מנה רגילה.</p>
    <textarea id="foodIn" class="food-in" placeholder="מילקי&#10;אורז&#10;עוף&#10;גבינת סקי">${esc(S.foodText || "")}</textarea>
    <div class="chips" style="margin-top:10px">${Object.keys(FOOD_EXAMPLES).map(k => `<button class="chip" data-ex="${esc(k)}">${esc(k)}</button>`).join("")}<button class="chip" id="foodClear">🗑️ ניקוי</button></div>
  </div>
  <div id="foodOut"></div>
  <div class="row" style="margin:6px 0"><button class="btn block" id="foodList" style="flex:1">📋 כל המזונות (${allFoods().length})</button><button class="btn block" id="foodAdd" style="flex:1">➕ הוספת מזון משלי</button></div>
  <p class="footer-note">ערכים ל־100 גרם לפי מאגר USDA, תוויות של מוצרים ישראליים, ובמאכלים מוכנים – הערכה לפי מתכון ממוצע (מסומן "משוער"). שים לב: אורז, פסטה, עוף ובשר מופיעים <b>אחרי בישול</b> כברירת מחדל. הקש על שם מזון כדי לראות פרטים או לתקן לפי התווית. אין כאן המלצה תזונתית אישית.</p>`;
  const inp = $("#foodIn");
  let tmr = null;
  inp.oninput = () => { clearTimeout(tmr); tmr = setTimeout(() => { S.foodText = inp.value; save(); drawFood(); }, 250); };
  body.querySelectorAll("[data-ex]").forEach(b => b.onclick = () => { inp.value = FOOD_EXAMPLES[b.dataset.ex]; S.foodText = inp.value; save(); drawFood(); });
  $("#foodClear").onclick = () => { inp.value = ""; S.foodText = ""; save(); drawFood(); inp.focus(); };
  $("#foodList").onclick = foodListSheet;
  $("#foodAdd").onclick = () => addFoodSheet();
  drawFood();
}
function setFoodLine(i, text) {
  const inp = $("#foodIn"); const lines = inp.value.split("\n");
  const idx = lines.map((l, j) => l.trim() ? j : -1).filter(j => j >= 0)[i];
  if (idx === undefined) return;
  lines[idx] = text.trim(); inp.value = lines.join("\n"); S.foodText = inp.value; save(); drawFood();
}
function drawFood() {
  const out = $("#foodOut"); if (!out) return;
  const lines = ($("#foodIn").value || "").split("\n").map(l => l.trim()).filter(Boolean);
  if (!lines.length) { out.innerHTML = `<div class="empty"><span class="em">🥗</span>כתוב למעלה מה אכלת – והחישוב יופיע כאן</div>`; return; }
  const rows = lines.map(parseFoodLine);
  const ok = rows.filter(r => r.food);
  const T = ok.reduce((a, r) => ({ k: a.k + r.k, p: a.p + r.p, c: a.c + r.c, f: a.f + r.f }), { k: 0, p: 0, c: 0, f: 0 });
  const kc = T.p * 4 + T.c * 4 + T.f * 9 || 1;
  const pp = Math.round(T.p * 4 / kc * 100), pc = Math.round(T.c * 4 / kc * 100), pf = Math.max(0, 100 - pp - pc);
  const r1 = x => Math.round(x * 10) / 10;
  out.innerHTML = `
  ${ok.length ? `<div class="card food-total">
    <div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="muted xs" style="font-weight:700">סה״כ ${ok.length} פריטים</div><div class="big-num">${Math.round(T.k).toLocaleString("he-IL")} <small>קלוריות</small></div></div><button class="link-btn small" id="foodCopy">📋 העתקה</button></div>
    <div class="macro-bar"><i class="mp" style="width:${pp}%"></i><i class="mc" style="width:${pc}%"></i><i class="mf" style="width:${pf}%"></i></div>
    <div class="grid3 macros">
      <div class="statbox"><b>${r1(T.p)}<small> ג׳</small></b><span><i class="dot mp"></i>חלבון · ${pp}%</span></div>
      <div class="statbox"><b>${r1(T.c)}<small> ג׳</small></b><span><i class="dot mc"></i>פחמימות · ${pc}%</span></div>
      <div class="statbox"><b>${r1(T.f)}<small> ג׳</small></b><span><i class="dot mf"></i>שומן · ${pf}%</span></div>
    </div></div>` : ""}
  <div class="card" style="padding:4px 16px">${rows.map((r, i) => r.food ? `
    <div class="food-row">
      <div class="food-main"><button class="food-name" data-info="${i}">${esc(r.food.n)}${r.food.mine ? ' <span class="pill mid">שלי</span>' : r.food.fixed ? ' <span class="pill mid">תוקן</span>' : r.food.src === "e" ? ' <span class="pill est">משוער</span>' : ""} <span class="info-i">ⓘ</span></button>
        <div class="muted xs">${esc(r.desc)}${r.desc.includes("גרם") ? "" : ` · ${r.grams} ג׳`}${r.alts.length > 1 ? ` · <button class="link-btn xs" data-alt="${i}">לא זה?</button>` : ""}${pairOf(r.food.n) ? ` · <button class="link-btn xs" data-pair="${i}">${pairOf(r.food.n).isCooked ? "⚖️ שקלתי לפני בישול" : "⚖️ שקלתי אחרי בישול"}</button>` : ""}</div></div>
      <div class="food-nums"><b>${Math.round(r.k)}</b><span>קל׳</span></div>
      <div class="food-macros"><span>ח׳ ${r1(r.p)}</span><span>פ׳ ${r1(r.c)}</span><span>ש׳ ${r1(r.f)}</span></div>
      <div class="food-edit"><button class="qty-btn" data-g="${i}" data-d="-1" aria-label="פחות">−</button><button class="qty-g" data-gi="${i}">${r.grams} ג׳</button><button class="qty-btn" data-g="${i}" data-d="1" aria-label="יותר">+</button></div>
    </div>` : `
    <div class="food-row miss"><div class="food-main"><b>❓ ${esc(r.line)}</b><div class="muted xs">לא מצאתי במאגר${r.alts.length ? " · אולי התכוונת ל:" : ""}</div>
      ${r.alts.length ? `<div class="chips" style="margin-top:6px">${r.alts.slice(0, 4).map(a => `<button class="chip" data-fix="${i}" data-name="${esc(a.n)}">${esc(a.n)}</button>`).join("")}</div>` : ""}
      <button class="link-btn xs" data-addname="${esc(r.name || r.line)}">➕ הוספת "${esc(r.name || r.line)}" למאגר שלי</button></div></div>`).join("")}</div>`;
  const step = g => g >= 200 ? 50 : g >= 60 ? 20 : g >= 20 ? 10 : 5;
  out.querySelectorAll("[data-g]").forEach(b => b.onclick = () => {
    const r = rows[+b.dataset.g]; const st = step(r.grams); const g = Math.max(st, r.grams + st * +b.dataset.d);
    setFoodLine(+b.dataset.g, `${g} גרם ${r.food.n}`);
  });
  out.querySelectorAll("[data-gi]").forEach(b => b.onclick = async () => {
    const r = rows[+b.dataset.gi];
    const v = await prompt2("כמה גרם?", `${r.food.n} – כתוב משקל בגרמים`, String(r.grams), "גרם");
    if (v && +v > 0) setFoodLine(+b.dataset.gi, `${Math.round(+v)} גרם ${r.food.n}`);
  });
  out.querySelectorAll("[data-alt]").forEach(b => b.onclick = () => {
    const r = rows[+b.dataset.alt];
    sheet(`<h2>למה התכוונת?</h2><p class="muted small">כתבת: "${esc(r.line)}"</p><div class="col">${r.alts.map(a => `<button class="btn block" data-pick="${esc(a.n)}">${esc(a.n)} <span class="muted xs">· ${a.k} קל׳ ל־100 ג׳</span></button>`).join("")}</div>`,
      (e, close) => { const t = e.target.closest("[data-pick]"); if (!t) return; close(); setFoodLine(+b.dataset.alt, r.line.replace(new RegExp(r.food.al.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((x, y) => y.length - x.length).join("|")), "").trim().replace(/\s+/g, " ") + " " + t.dataset.pick); });
  });
  out.querySelectorAll("[data-fix]").forEach(b => b.onclick = () => setFoodLine(+b.dataset.fix, b.dataset.name));
  out.querySelectorAll("[data-info]").forEach(b => b.onclick = () => foodInfoSheet(rows[+b.dataset.info].food.n, +b.dataset.info, rows[+b.dataset.info].grams));
  out.querySelectorAll("[data-pair]").forEach(b => b.onclick = () => { const r = rows[+b.dataset.pair]; setFoodLine(+b.dataset.pair, `${r.grams} גרם ${pairOf(r.food.n).other}`); toast("⚖️", pairOf(r.food.n).isCooked ? "עברתי לערכים של לפני בישול" : "עברתי לערכים של אחרי בישול"); });
  out.querySelectorAll("[data-addname]").forEach(b => b.onclick = () => addFoodSheet(b.dataset.addname));
  $("#foodCopy") && ($("#foodCopy").onclick = async () => {
    const txt = ok.map(r => `${r.food.n} (${r.grams} ג׳): ${Math.round(r.k)} קל׳, חלבון ${r1(r.p)} ג׳`).join("\n") + `\n— סה״כ: ${Math.round(T.k)} קלוריות · חלבון ${r1(T.p)} ג׳ · פחמימות ${r1(T.c)} ג׳ · שומן ${r1(T.f)} ג׳`;
    try { await navigator.clipboard.writeText(txt); toast("📋", "הועתק"); } catch (e) { }
  });
}
function foodListSheet() {
  const { bg } = sheet(`<div style="max-height:76vh;overflow:auto"><h2>📋 מאגר המזונות</h2><input class="search" id="flq" placeholder="🔍 חיפוש..." autocomplete="off"><div class="muted xs" style="margin:8px 0">הערכים ל־100 גרם · הקש על מזון כדי להוסיף לרשימה</div><div id="fll"></div></div><div class="row"><button class="btn primary" data-a="x">סגירה</button></div>`,
    (e, close) => {
      if (e.target.dataset.a === "x") return close();
      const it = e.target.closest("[data-fn]"); if (!it) return;
      const inp = $("#foodIn"); inp.value = (inp.value.trim() ? inp.value.trim() + "\n" : "") + it.dataset.fn; S.foodText = inp.value; save(); drawFood(); toast("➕", it.dataset.fn + " נוסף");
    });
  const draw = () => {
    const q = fnorm(bg.querySelector("#flq").value);
    const list = allFoods().filter(f => !q || f.al.some(a => fnorm(a).includes(q)));
    bg.querySelector("#fll").innerHTML = list.map(f => `<div class="term food-li" data-fn="${esc(f.n)}"><div><b>${esc(f.n)}</b>${f.mine ? ' <span class="pill mid">שלי</span>' : ""}<div class="muted xs">מנה: ${esc(f.sl)} (${f.sg} ג׳)${f.src === "e" ? " · משוער" : f.fixed ? " · תוקן" : ""}</div></div><div class="xs muted" style="text-align:left">${f.k} קל׳<br>ח׳ ${f.p} · פ׳ ${f.c} · ש׳ ${f.f}</div></div>`).join("") || `<div class="empty">לא נמצא</div>`;
  };
  bg.querySelector("#flq").oninput = draw; draw();
}
function foodInfoSheet(n, lineIdx, grams) {
  const f = findFood(n); if (!f) return;
  const r1 = x => Math.round(x * 10) / 10, sv = f.sg / 100, pr = pairOf(n);
  const row = (lbl, m) => `<tr><td>${lbl}</td><td><b>${Math.round(f.k * m)}</b></td><td>${r1(f.p * m)}</td><td>${r1(f.c * m)}</td><td>${r1(f.f * m)}</td></tr>`;
  sheet(`<div style="max-height:78vh;overflow:auto"><h2>${esc(f.n)}</h2>
    <div class="muted xs">מקור הנתונים: <b>${f.fixed ? SRC_LABEL.fix : SRC_LABEL[f.src] || ""}</b></div>
    <table class="ntable"><thead><tr><th></th><th>קלוריות</th><th>חלבון</th><th>פחמ׳</th><th>שומן</th></tr></thead><tbody>
      ${row("100 גרם", 1)}${row(`${esc(f.sl)} (${f.sg} ג׳)`, sv)}${grams && grams !== 100 && grams !== f.sg ? row(`הכמות שלך (${grams} ג׳)`, grams / 100) : ""}</tbody></table>
    ${pr ? `<div class="tip" style="cursor:default;margin-top:10px"><span>⚖️</span><div class="small">${pr.isCooked ? "הערכים כאן הם למשקל <b>אחרי בישול</b>. שקלת לפני הבישול? הערכים שונים מאוד." : "הערכים כאן הם למשקל <b>לפני בישול</b> (חי/יבש)."}</div></div>` : ""}
    ${f.src === "e" && !f.fixed ? `<p class="muted xs">זהו ערך משוער למנה ממוצעת. מתכונים ומוצרים שונים יכולים להיות שונים – אם יש לך תווית, עדיף לתקן לפיה.</p>` : ""}
    </div><div class="col" style="margin-top:12px">
      ${pr && lineIdx !== undefined ? `<button class="btn block" data-a="pair">⚖️ החלף ל"${esc(pr.other)}"</button>` : ""}
      ${!f.mine ? `<button class="btn block" data-a="edit">✏️ תיקון ערכים לפי התווית</button>` : ""}
      <button class="btn primary block" data-a="x">סגירה</button></div>`,
    (e, close) => {
      const a = e.target.dataset.a; if (!a) return; close();
      if (a === "pair") setFoodLine(lineIdx, `${grams} גרם ${pr.other}`);
      if (a === "edit") editFoodSheet(n);
    });
}
function editFoodSheet(n) {
  const base = FOODS.find(f => f.n === n), cur = findFood(n); if (!base) return;
  const inp = (id, l, v) => `<div><label class="lbl">${l}</label><input class="search" id="${id}" type="number" inputmode="decimal" value="${v}"></div>`;
  const { bg } = sheet(`<div style="max-height:78vh;overflow:auto"><h2>✏️ ${esc(n)}</h2><p class="muted small" style="margin-top:0">העתק מהתווית את הערכים ל־100 גרם. התיקון נשמר רק אצלך.</p>
    <div class="grid2">${inp("efK", "קלוריות", cur.k)}${inp("efP", "חלבון (ג׳)", cur.p)}${inp("efC", "פחמימות (ג׳)", cur.c)}${inp("efF", "שומן (ג׳)", cur.f)}</div>
    <div class="grid2">${inp("efS", "גרם במנה רגילה", cur.sg)}<div></div></div>
    <p class="muted xs">ערכים מקוריים: ${base.k} קל׳ · ח׳ ${base.p} · פ׳ ${base.c} · ש׳ ${base.f} · מנה ${base.sg} ג׳</p></div>
    <div class="row">${cur.fixed ? `<button class="btn" data-a="reset">↩️ ערכים מקוריים</button>` : `<button class="btn" data-a="x">ביטול</button>`}<button class="btn primary" data-a="save">שמירה</button></div>`,
    (e, close) => {
      const a = e.target.dataset.a; if (!a) return;
      S.foodFix = S.foodFix || {};
      if (a === "x") return close();
      if (a === "reset") { delete S.foodFix[n]; save(); close(); drawFood(); toast("↩️", "חזר לערכים המקוריים"); return; }
      const v = id => parseFloat(bg.querySelector("#" + id).value);
      if (!(v("efK") >= 0)) return toast("✍️", "צריך מספר קלוריות");
      S.foodFix[n] = { k: v("efK"), p: v("efP") || 0, c: v("efC") || 0, f: v("efF") || 0, sg: v("efS") || base.sg };
      save(); close(); drawFood(); toast("✅", "הערכים עודכנו");
    });
}
function addFoodSheet(name = "") {
  const f = (id, l, ph) => `<div><label class="lbl">${l}</label><input class="search" id="${id}" type="number" inputmode="decimal" placeholder="${ph}"></div>`;
  const { bg } = sheet(`<div style="max-height:78vh;overflow:auto"><h2>➕ מזון משלי</h2><p class="muted small" style="margin-top:0">את הערכים מעתיקים מהתווית שעל האריזה ("ל־100 גרם").</p>
    <label class="lbl">שם המזון</label><input class="search" id="mfN" value="${esc(name)}" placeholder="למשל: יוגורט חלבון וניל">
    <div class="grid2">${f("mfK", "קלוריות ל־100 ג׳", "120")}${f("mfP", "חלבון (ג׳)", "10")}${f("mfC", "פחמימות (ג׳)", "12")}${f("mfF", "שומן (ג׳)", "3")}</div>
    <div class="grid2">${f("mfS", "גרם במנה רגילה", "150")}<div><label class="lbl">שם המנה</label><input class="search" id="mfL" placeholder="גביע"></div></div>
    ${(S.myFoods || []).length ? `<div class="muted xs" style="font-weight:700;margin-top:14px">המזונות שלי</div>${S.myFoods.map((m, i) => `<div class="term" style="display:flex;justify-content:space-between;align-items:center"><span>${esc(m.n)} <span class="muted xs">· ${m.k} קל׳</span></span><button class="link-btn xs" data-del="${i}">מחיקה</button></div>`).join("")}` : ""}
    </div><div class="row"><button class="btn" data-a="x">ביטול</button><button class="btn primary" data-a="save">שמירה</button></div>`,
    (e, close) => {
      const del = e.target.dataset.del;
      if (del !== undefined) { S.myFoods.splice(+del, 1); save(); close(); addFoodSheet(name); drawFood(); return; }
      const a = e.target.dataset.a; if (!a) return;
      if (a === "x") return close();
      const v = id => parseFloat(bg.querySelector("#" + id).value);
      const n = bg.querySelector("#mfN").value.trim();
      if (!n || !(v("mfK") >= 0)) return toast("✍️", "צריך לפחות שם וקלוריות");
      S.myFoods = S.myFoods || [];
      S.myFoods.push({ n, k: v("mfK"), p: v("mfP") || 0, c: v("mfC") || 0, f: v("mfF") || 0, sg: v("mfS") || 100, sl: bg.querySelector("#mfL").value.trim() || "מנה" });
      save(); close(); toast("✅", n + " נוסף למאגר שלך"); drawFood();
    });
}

/* ───────── כלים ומחשבונים ───────── */
function renderCalcs(body) {
  const num = (id, label, ph, val = "") => `<div><label class="lbl" for="${id}">${label}</label><input class="search" id="${id}" type="number" inputmode="decimal" placeholder="${ph}" value="${val}"></div>`;
  body.innerHTML = `<div class="fade-in"><p class="muted" style="margin-top:0">מחשבונים שימושיים לעבודה עם מתאמנים. כל התוצאות הן הערכות.</p>

  <div class="card tool" id="t1"><h2>🏋️ מחשבון 1RM</h2>
    <div class="grid2">${num("rmW", "משקל (ק״ג)", "100")}${num("rmR", "חזרות (1–12)", "5")}</div>
    <div class="tool-out" id="rmOut"></div></div>

  <div class="card tool"><h2>❤️ דופק מטרה</h2>
    <div class="grid2">${num("hrA", "גיל", "40")}${num("hrR", "דופק מנוחה (לא חובה)", "65")}</div>
    <div class="tool-out" id="hrOut"></div></div>

  <div class="card tool"><h2>📦 נפח אימון</h2>
    <div class="grid3">${num("vS", "סטים", "4")}${num("vR", "חזרות", "10")}${num("vW", "משקל", "60")}</div>
    <div class="tool-out" id="vOut"></div></div>

  <div class="card tool"><h2>🔥 קצב חילוף חומרים (BMR / TDEE)</h2>
    <div class="seg" id="sex" style="margin-top:6px"><button data-k="m" class="on">גבר</button><button data-k="f">אישה</button></div>
    <div class="grid3">${num("bA", "גיל", "30")}${num("bW", "משקל (ק״ג)", "75")}${num("bH", "גובה (ס״מ)", "175")}</div>
    <label class="lbl">רמת פעילות</label>
    <div class="seg" id="act">${[["1.2", "יושבני"], ["1.375", "קלה"], ["1.55", "בינונית"], ["1.725", "גבוהה"], ["1.9", "גבוהה מאוד"]].map(([k, v], i) => `<button data-k="${k}" class="${i === 2 ? "on" : ""}">${v}</button>`).join("")}</div>
    <div class="tool-out" id="bOut"></div></div>

  <div class="card tool"><h2>🥩 חלבון יומי</h2>
    <div class="grid2">${num("pW", "משקל (ק״ג)", "75")}<div></div></div>
    <div class="tool-out" id="pOut"></div></div>

  <p class="footer-note">נוסחאות: Epley ו־Brzycki ל־1RM, קרבונן לדופק מטרה (כשמוזן דופק מנוחה), Mifflin–St Jeor ל־BMR. ההערכות אינן מחליפות בדיקה מקצועית, ואינן מתאימות למצבים רפואיים.</p></div>`;

  const v = id => parseFloat($("#" + id).value);
  const out = (id, html) => { $("#" + id).innerHTML = html; };
  const ph = '<span class="muted small">מלא את השדות כדי לראות תוצאה</span>';
  let sex = "m", act = 1.55;
  const calc = () => {
    const w = v("rmW"), r = v("rmR");
    if (w > 0 && r >= 1 && r <= 12) {
      const ep = r === 1 ? w : w * (1 + r / 30), br = r === 1 ? w : w * 36 / (37 - r), rm = (ep + br) / 2;
      out("rmOut", `<div class="big-num">${Math.round(rm)} <small>ק״ג</small></div><div class="muted xs">Epley ‏${Math.round(ep)} · Brzycki ‏${Math.round(br)}</div>
        <div class="pct-grid">${[95, 90, 85, 80, 75, 70, 65, 60].map(p => `<div><b>${p}%</b><span>${(Math.round(rm * p / 100 / 2.5) * 2.5).toFixed(1).replace(".0", "")}</span></div>`).join("")}</div>`);
    } else out("rmOut", ph);
    const a = v("hrA"), rest = v("hrR");
    if (a > 0 && a < 110) {
      const max = 220 - a, kv = rest > 30 && rest < 120;
      const z = (lo, hi) => kv ? `${Math.round((max - rest) * lo + rest)}–${Math.round((max - rest) * hi + rest)}` : `${Math.round(max * lo)}–${Math.round(max * hi)}`;
      out("hrOut", `<div class="muted small">דופק מרבי משוער: <b>${max}</b>${kv ? " · שיטת קרבונן" : " · אחוז מדופק מרבי"}</div>
        <div class="zones">${[["אזור 1 · קל", .5, .6], ["אזור 2 · אירובי קל", .6, .7], ["אזור 3 · אירובי", .7, .8], ["אזור 4 · סף", .8, .9], ["אזור 5 · מרבי", .9, 1]].map(([n, lo, hi], i) => `<div class="zone z${i + 1}"><span>${n}</span><b dir="ltr">${z(lo, hi)}</b></div>`).join("")}</div>`);
    } else out("hrOut", ph);
    const S_ = v("vS"), R = v("vR"), W = v("vW");
    out("vOut", S_ > 0 && R > 0 && W >= 0 ? `<div class="big-num">${(S_ * R * W).toLocaleString("he-IL")} <small>ק״ג</small></div><div class="muted xs">${S_} × ${R} × ${W}</div>` : ph);
    const bA = v("bA"), bW = v("bW"), bH = v("bH");
    if (bA > 0 && bW > 0 && bH > 0) {
      const bmr = 10 * bW + 6.25 * bH - 5 * bA + (sex === "m" ? 5 : -161);
      out("bOut", `<div class="grid2"><div class="statbox"><b>${Math.round(bmr).toLocaleString("he-IL")}</b><span>BMR – קלוריות במנוחה</span></div><div class="statbox"><b>${Math.round(bmr * act).toLocaleString("he-IL")}</b><span>TDEE – הוצאה יומית משוערת</span></div></div>`);
    } else out("bOut", ph);
    const pW = v("pW");
    out("pOut", pW > 0 ? `<div class="big-num"><span dir="ltr">${Math.round(pW * 1.6)}–${Math.round(pW * 2.2)}</span> <small>גרם ביום</small></div><div class="muted xs">לפי הטווח המקובל של 1.6–2.2 גרם לק״ג למתאמני כוח</div>` : ph);
  };
  body.querySelectorAll("input").forEach(i => i.oninput = calc);
  $("#sex").onclick = e => { const b = e.target.closest("button"); if (!b) return; sex = b.dataset.k; $("#sex").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); calc(); };
  $("#act").onclick = e => { const b = e.target.closest("button"); if (!b) return; act = +b.dataset.k; $("#act").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); calc(); };
  calc();
}

/* ───────── מסך התקדמות ───────── */
function scoreChart() {
  const pts = S.history.filter(h => !["speed", "survival"].includes(h.mode) && typeof h.score === "number").slice(0, 20).reverse();
  if (pts.length < 2) return `<div class="empty" style="padding:16px"><span class="em">📈</span>אחרי שני מבחנים יופיע כאן גרף ההתקדמות</div>`;
  const W = 320, H = 140, px = 28, py = 14, iw = W - px - 8, ih = H - py * 2;
  const X = i => px + (pts.length === 1 ? iw / 2 : i * iw / (pts.length - 1)), Y = s => py + ih - s / 100 * ih;
  const line = pts.map((p, i) => `${X(i).toFixed(1)},${Y(p.score).toFixed(1)}`).join(" ");
  const avg = Math.round(pts.reduce((a, p) => a + p.score, 0) / pts.length);
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="ציונים במבחנים האחרונים">
    ${[0, 50, 100].map(v => `<line x1="${px}" x2="${W - 8}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${px - 6}" y="${Y(v) + 4}" class="axis">${v}</text>`).join("")}
    <line x1="${px}" x2="${W - 8}" y1="${Y(70)}" y2="${Y(70)}" class="pass"/>
    <polygon points="${X(0)},${Y(0)} ${line} ${X(pts.length - 1)},${Y(0)}" class="area"/>
    <polyline points="${line}" class="line"/>
    ${pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.score)}" r="3.5" class="dot"><title>${esc(p.title)} · ${p.score}%</title></circle>`).join("")}
  </svg><div class="muted xs" style="display:flex;justify-content:space-between"><span>${pts.length} מבחנים אחרונים · ממוצע ${avg}%</span><span>קו מקווקו = סף 70%</span></div>`;
}
function weaknessReport() {
  const lv = groupAcc(q => q.l), ty = groupAcc(q => q.t), ig = groupAcc(q => q.img ? "img" : "txt");
  if (!Object.keys(lv).length) return `<div class="empty" style="padding:16px"><span class="em">🔍</span>ענה על כמה שאלות כדי לקבל ניתוח</div>`;
  const rows = [];
  Object.keys(LEVELS).forEach(k => lv[k] && rows.push({ n: "רמה: " + LEVELS[k], a: pct(lv[k].c, lv[k].s), s: lv[k].s }));
  Object.keys(TYPES).forEach(k => ty[k] && rows.push({ n: "סוג: " + TYPES[k], a: pct(ty[k].c, ty[k].s), s: ty[k].s }));
  if (ig.img) rows.push({ n: "שאלות עם איורים", a: pct(ig.img.c, ig.img.s), s: ig.img.s });
  const valid = rows.filter(r => r.s >= 3).sort((a, b) => a.a - b.a);
  const ts = TOPIC_KEYS.map(f => ({ f, ...topicStats(f) })).filter(t => t.acc !== null && t.seen >= 3).sort((a, b) => a.acc - b.acc);
  const tips = [];
  if (ts.length) tips.push(`התחום החלש ביותר: <b>${TOPICS[ts[0].f].name}</b> (${ts[0].acc}%)`);
  if (valid.length) tips.push(`הכי מאתגר אותך: <b>${valid[0].n.replace(/^.*?: /, "")}</b> (${valid[0].a}%)`);
  const hard = BANK.filter(q => S.qs[q.id]?.w).sort((a, b) => S.qs[b.id].w - S.qs[a.id].w).slice(0, 5);
  return `${tips.length ? `<div class="tip" style="cursor:default;margin-bottom:10px"><span style="font-size:20px">🔍</span><div class="small">${tips.join("<br>")}</div></div>` : ""}
    ${rows.map(r => `<div class="bar-row"><div class="top"><span>${r.n}</span><span class="muted">${r.a}% · ${r.s} תשובות</span></div><div class="track"><i style="width:${r.a}%;background:${r.a >= 75 ? "var(--accent)" : r.a >= 55 ? "var(--warn)" : "var(--bad)"}"></i></div></div>`).join("")}
    ${hard.length ? `<button class="btn block" id="hardBtn" style="margin-top:10px">🎯 תרגול ${hard.length} השאלות שהכי קשות לך</button>` : ""}`;
}
function renderStats() {
  const acc = pct(S.correct, S.answered);
  const exams = S.history.filter(h => !["speed", "survival"].includes(h.mode));
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
    <div class="statbox"><b>⚡ ${S.best.speed}</b><span>שיא מהירות</span></div>
    <div class="statbox"><b>❤️ ${S.best.survival}</b><span>שיא הישרדות</span></div>
    <div class="statbox"><b>⭐ ${totalStars()}</b><span>כוכבים במסע</span></div>
    <div class="statbox"><b>👑 ${Object.values(S.jr || {}).filter(m => m.boss).length}</b><span>בוסים שהובסו</span></div>
    <div class="statbox"><b>☄️ ${S.best.combo || 0}</b><span>קומבו שיא</span></div>
  </div>
  <div class="card"><h2>השבוע שלך</h2>
    <div class="muted xs">ירוק = תרגלת · ✓ = השלמת את המטרה היומית (${S.goal} שאלות)</div>
    <div class="week">${days.map(d => `<div><i class="${S.days.includes(d.k) ? "on" : ""}">${S.goalDays.includes(d.k) ? "✓" : ""}</i>${d.l}׳</div>`).join("")}</div></div>
  <div class="card"><h2>📈 גרף ציונים</h2>${scoreChart()}</div>
  <div class="card"><h2>🔍 דוח חולשות</h2>${weaknessReport()}</div>
  <div class="card"><h2>שליטה לפי תחום</h2><div class="muted xs">שליטה עולה כשעונים נכון שוב ושוב לאורך זמן · ראית ${seen} מתוך ${BANK.length} שאלות</div>
    ${TOPIC_KEYS.map(f => { const t = topicStats(f); return `<div class="bar-row"><div class="top"><span>${TOPICS[f].icon} ${TOPICS[f].name}</span><span class="muted">${t.mastery}%${t.acc !== null ? ` · דיוק ${t.acc}%` : ""}</span></div><div class="track"><i style="width:${t.mastery}%;background:${t.acc === null ? "var(--line)" : t.acc >= 75 ? "var(--accent)" : t.acc >= 55 ? "var(--warn)" : "var(--bad)"}"></i></div></div>`; }).join("")}</div>
  <div class="card"><h2>הישגים <span class="muted small">${Object.keys(S.ach).length}/${ACH.length}</span></h2>
    <div class="ach-grid">${ACH.map(a => `<div class="ach ${S.ach[a.id] ? "on" : ""}"><div class="em">${a.em}</div><b>${a.t}</b><span>${a.d}</span></div>`).join("")}</div></div>
  <div class="card"><h2>מבחנים אחרונים</h2>
    ${S.history.length ? S.history.slice(0, 15).map(h => `<div class="hist-row"><span>${esc(h.title || "מבחן")} <span class="muted xs">· ${esc(h.date)}${h.n ? " · " + h.n + " שאלות" : ""}</span></span><b>${h.extra ? esc(h.extra) : typeof h.score === "number" ? h.score + "%" : "—"}</b></div>`).join("")
      : `<div class="empty"><span class="em">📝</span>עדיין אין תוצאות. המבחן הראשון מחכה לך!</div>`}</div></div>`;
  $("#hardBtn") && ($("#hardBtn").onclick = () => startMode("retry", { qs: BANK.filter(q => S.qs[q.id]?.w).sort((a, b) => S.qs[b.id].w - S.qs[a.id].w).slice(0, 5) }));
}

/* ───────── הגדרות ───────── */
const REM_OPTS = [[30, "30 דק׳"], [60, "שעה"], [120, "שעתיים"], [180, "3 שעות"], [360, "6 שעות"], [1440, "פעם ביום"]];
function renderSettings() {
  document.querySelectorAll(".nav button").forEach(b => b.classList.remove("on"));
  const st = S.settings, rem = st.rem, sv = st.saver;
  const perm = "Notification" in window ? Notification.permission : "unsupported";
  app.innerHTML = `<div class="fade-in"><h1>הגדרות</h1>
  <div class="card">
    <h2>🎮 מצב האפליקציה</h2>
    <div class="mode-pick" id="setMode"><button data-k="play" class="${S.mode === "play" ? "on" : ""}"><span>🎮</span><b>משחק</b><small>מסע, בוסים, מטבעות ומשימות</small></button><button data-k="learn" class="${S.mode !== "play" ? "on" : ""}"><span>📚</span><b>לימוד</b><small>שיעורים, תרגול ומבחנים</small></button></div>
    <button class="btn block" id="setShop" style="margin-top:10px">🛒 החנות · 🪙 ${S.coins}</button>
  </div>
  <div class="card">
    <h2>👤 פרופיל</h2>
    <label class="lbl" style="margin-top:4px">השם שלך</label>
    <input class="search" id="nameIn" value="${esc(S.name)}" placeholder="יופיע בברכה, באתגרים ובתעודה" maxlength="40">
    <label class="lbl">מטרה יומית (שאלות)</label>
    <div class="seg" id="goal">${[10, 20, 30, 50].map(n => `<button data-k="${n}" class="${S.goal === n ? "on" : ""}">${n}</button>`).join("")}</div>
  </div>

  <div class="card">
    <h2>🔔 תזכורות</h2>
    <div class="switch-row"><div><b class="small">תזכורות לתרגול</b><div class="muted xs">${perm === "denied" ? "ההתראות חסומות בהגדרות הדפדפן/הטלפון" : perm === "unsupported" ? "המכשיר לא תומך בהתראות" : "התראה שמזמינה אותך לשאלון קצר"}</div></div>
      <label class="switch"><input type="checkbox" id="remOn" ${rem.on && perm === "granted" ? "checked" : ""}><i></i></label></div>
    <div id="remBox" class="${rem.on ? "" : "dim"}">
      <label class="lbl">כל כמה זמן?</label>
      <div class="seg wrap" id="remEvery">${REM_OPTS.map(([k, v]) => `<button data-k="${k}" class="${rem.every === k ? "on" : ""}">${v}</button>`).join("")}</div>
      <div id="remAtBox" class="${rem.every === 1440 ? "" : "hidden"}"><label class="lbl">באיזו שעה?</label><input type="time" class="search" id="remAt" value="${rem.at}"></div>
      <label class="lbl">🌙 שעות שקט – בלי תזכורות</label>
      <div class="row"><input type="time" class="search" id="qFrom" value="${rem.quietFrom}"><span class="muted">עד</span><input type="time" class="search" id="qTo" value="${rem.quietTo}"></div>
      <div class="switch-row"><b class="small">💡 עובדה "הידעת?" בכל תזכורת</b><label class="switch"><input type="checkbox" id="remFact" ${rem.fact ? "checked" : ""}><i></i></label></div>
      <button class="btn block" id="remTest">שליחת התראת ניסיון</button>
      <p class="muted xs" style="margin:10px 0 0">${isNative() ? "✅ התזכורות מתוזמנות במכשיר ויגיעו גם כשהאפליקציה סגורה." : "בגרסת האינטרנט התזכורות מגיעות בזמן כשהאפליקציה פתוחה או ברקע. כשהיא סגורה לגמרי – הטלפון שולח אותן לכל היותר בערך פעם ביום. בגרסת האנדרואיד המלאה הן יגיעו בדיוק בזמן."}</p>
    </div>
  </div>

  <div class="card">
    <h2>🖥️ שומר מסך</h2>
    <div class="switch-row"><div><b class="small">שומר מסך עם עובדות</b><div class="muted xs">כשהאפליקציה פתוחה ולא נוגעים בה – עובדה חדשה כל 2 דקות</div></div><label class="switch"><input type="checkbox" id="svOn" ${sv.on ? "checked" : ""}><i></i></label></div>
    <label class="lbl">להפעיל אחרי</label>
    <div class="seg" id="svIdle">${[[30, "30 שנ׳"], [60, "דקה"], [120, "2 דק׳"], [300, "5 דק׳"]].map(([k, v]) => `<button data-k="${k}" class="${sv.idle === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <div class="switch-row"><div><b class="small">להשאיר את המסך דולק</b><div class="muted xs">בזמן ששומר המסך פועל</div></div><label class="switch"><input type="checkbox" id="svWake" ${sv.wake ? "checked" : ""}><i></i></label></div>
    <button class="btn block" id="svTry">הפעלה עכשיו</button>
  </div>

  <div class="card">
    <h2>🎯 רמת קושי</h2>
    <p class="muted small">באוטומטי האפליקציה מתחילה בשאלות קלות, ומוסיפה שאלות קשות בכל נושא רק אחרי שענית נכון על מספיק שאלות בו.</p>
    <div class="seg wrap" id="diffSeg">${[["auto", "🤖 אוטומטי"], ["easy", "🟢 מתחיל"], ["medium", "🟡 בינוני"], ["hard", "🔴 מתקדם"], ["all", "🎲 הכל"]].map(([k, v]) => `<button data-k="${k}" class="${(st.diff || "auto") === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <div class="muted xs" style="margin-top:8px">${(st.diff || "auto") === "auto" ? "הרמה שלך לפי נושא: " + TOPIC_KEYS.map(f => TOPICS[f].icon + " " + DIFF_NAMES[topicStage(f)]).join(" · ") : ""}</div>
  </div>

  <div class="card">
    <h2>🎨 תצוגה וצלילים</h2>
    <div class="seg" id="theme">${[["auto", "אוטומטי"], ["dark", "כהה 🌙"], ["light", "בהיר ☀️"]].map(([k, v]) => `<button data-k="${k}" class="${st.theme === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <div style="margin-top:6px">
      <div class="switch-row"><b class="small">צלילים</b><label class="switch"><input type="checkbox" data-s="sound" ${st.sound ? "checked" : ""}><i></i></label></div>
      <div class="switch-row"><b class="small">רטט</b><label class="switch"><input type="checkbox" data-s="vib" ${st.vib ? "checked" : ""}><i></i></label></div>
      <div class="switch-row"><div><b class="small">משוב מיידי במבחן מותאם</b><div class="muted xs">אחרי כל שאלה, או רק בסוף</div></div><label class="switch"><input type="checkbox" data-s="instant" ${st.instant ? "checked" : ""}><i></i></label></div>
    </div>
  </div>

  <div class="card">
    <h2>💾 הנתונים שלך</h2>
    <p class="muted small" style="margin-top:0">כל הנתונים נשמרים רק במכשיר הזה. אפשר לגבות ולשחזר – למשל כשעוברים לטלפון חדש.</p>
    <div class="col">
      <button class="btn block" id="exp">💾 גיבוי לקובץ</button>
      <button class="btn block" id="imp">📂 שחזור מקובץ</button>
      <input type="file" id="impFile" accept="application/json,.json" class="hidden">
      <button class="btn danger block" id="reset">🗑️ איפוס כל ההתקדמות</button>
    </div>
  </div>

  <div class="card">
    <h2>ℹ️ על האפליקציה</h2>
    <p class="muted small" style="margin-top:0">מאמן ידע · גרסה ${APP_VERSION} · ${BANK.length} שאלות ב־${TOPIC_KEYS.length} תחומים · ${FACTS.length} עובדות</p>
    <div class="col">
      <button class="btn block" id="feedback">✉️ שליחת משוב או רעיון</button>
      <button class="btn block" id="installBtn">📲 התקנה למסך הבית</button>
      <button class="btn block" id="shareApp">📤 שיתוף האפליקציה</button>
      <button class="btn block" id="intro">👋 הצגת מסך הפתיחה שוב</button>
      <a class="btn ghost block" href="privacy.html" style="text-decoration:none;color:inherit">🔒 מדיניות פרטיות</a>
    </div>
    <p class="footer-note">כלי לימודי בלבד. אינו תחליף להכשרה מוסמכת, להנחיות רפואיות או לייעוץ מקצועי.</p>
  </div></div>`;

  const segBind = (sel, fn) => $(sel).onclick = e => { const b = e.target.closest("button"); if (!b) return; $(sel).querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); fn(b.dataset.k); save(); };
  $("#nameIn").onchange = e => { S.name = e.target.value.trim(); save(); };
  $("#setMode").onclick = e => { const b = e.target.closest("button"); if (!b) return; setMode(b.dataset.k, false); renderSettings(); };
  $("#setShop").onclick = shopSheet;
  segBind("#goal", k => { S.goal = +k; });
  $("#remOn").onchange = async e => {
    if (e.target.checked) {
      const ok = await enableNotifications();
      if (!ok) { e.target.checked = false; return; }
      rem.on = true; toast("🔔", "התזכורות הופעלו");
    } else rem.on = false;
    $("#remBox").classList.toggle("dim", !rem.on); save(); syncReminders();
  };
  segBind("#remEvery", k => { rem.every = +k; $("#remAtBox").classList.toggle("hidden", rem.every !== 1440); syncReminders(); });
  $("#remAt").onchange = e => { rem.at = e.target.value || "18:00"; save(); syncReminders(); };
  $("#qFrom").onchange = e => { rem.quietFrom = e.target.value; save(); syncReminders(); };
  $("#qTo").onchange = e => { rem.quietTo = e.target.value; save(); syncReminders(); };
  $("#remFact").onchange = e => { rem.fact = e.target.checked; save(); syncReminders(); };
  $("#remTest").onclick = async () => { if (await enableNotifications()) showReminder(true); };
  $("#svOn").onchange = e => { sv.on = e.target.checked; save(); resetIdle(); };
  segBind("#svIdle", k => { sv.idle = +k; resetIdle(); });
  $("#svWake").onchange = e => { sv.wake = e.target.checked; save(); };
  $("#svTry").onclick = openSaver;
  segBind("#theme", k => { st.theme = k; applyTheme(); });
  app.querySelectorAll("#diffSeg button").forEach(b => b.onclick = () => { st.diff = b.dataset.k; save(); toast("🎯", "רמת הקושי עודכנה"); renderSettings(); });
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
      const keep = S.settings; S = DEFAULT(); S.settings = keep; S.onboarded = true; save(); toast("🧹", "ההתקדמות אופסה"); go("home");
    }
  };
  $("#feedback").onclick = () => { location.href = `mailto:${CONTACT}?subject=${encodeURIComponent("משוב על מאמן ידע")}&body=${encodeURIComponent("היי,\n\n")}`; };
  $("#installBtn").onclick = install;
  $("#shareApp").onclick = () => share("מאמן ידע – אפליקציה חינמית לתרגול ומבחנים למדריכי כושר 💪");
  $("#intro").onclick = () => onboarding();
}

/* ───────── תזכורות ───────── */
const isNative = () => !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications);
const toMin = t => { const [h, m] = (t || "0:0").split(":").map(Number); return h * 60 + m; };
function inQuiet(d = new Date()) {
  const r = S.settings.rem, m = d.getHours() * 60 + d.getMinutes(), a = toMin(r.quietFrom), b = toMin(r.quietTo);
  if (a === b) return false;
  return a < b ? m >= a && m < b : m >= a || m < b;
}
function reminderText() {
  const r = S.settings.rem;
  const lines = ["5 דקות של שאלות = עוד צעד למדריך מקצועי 💪", "האתגר היומי מחכה לך 🏆", "בוא נשמור על הרצף! 🔥", "שאלון קצר? המוח שלך יגיד תודה 🧠", "כמה שאלות עכשיו – ומחר תזכור יותר 📚"];
  const st = currentStreak();
  let body = st >= 2 ? `רצף של ${st} ימים – לא לשבור אותו! 🔥` : lines[Math.floor(Math.random() * lines.length)];
  if (r.fact) { const f = nextFact(); body = "💡 הידעת? " + f.t + "\n" + body; }
  return { title: "מאמן ידע – זמן לתרגל 💪", body };
}
async function enableNotifications() {
  if (isNative()) {
    try { const p = await window.Capacitor.Plugins.LocalNotifications.requestPermissions(); return p.display === "granted"; } catch (e) { return false; }
  }
  if (!("Notification" in window)) { modal("לא נתמך", "המכשיר או הדפדפן הזה לא תומכים בהתראות.", "הבנתי", null); return false; }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") { modal("ההתראות חסומות", "כדי לקבל תזכורות, אפשר התראות לאתר הזה בהגדרות הדפדפן או בהגדרות האפליקציה בטלפון.", "הבנתי", null); return false; }
  const p = await Notification.requestPermission();
  return p === "granted";
}
async function showReminder(test = false) {
  const { title, body } = reminderText();
  try {
    if (isNative()) { await window.Capacitor.Plugins.LocalNotifications.schedule({ notifications: [{ id: 999, title, body, schedule: { at: new Date(Date.now() + 1000) } }] }); }
    else {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) await reg.showNotification(title, { body, icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "ck-reminder", renotify: true, data: { url: "./?mode=quick" } });
      else new Notification(title, { body, icon: "icons/icon-192.png" });
    }
    if (!test) { S.settings.rem.last = Date.now(); save(); syncReminders(); }
    else toast("🔔", "נשלחה התראת ניסיון");
  } catch (e) { if (test) modal("לא הצלחנו לשלוח", "נסה שוב אחרי התקנת האפליקציה למסך הבית.", "הבנתי", null); }
}
function nextDue(from = Date.now()) {
  const r = S.settings.rem;
  if (r.every === 1440) {
    const d = new Date(from); const [h, m] = r.at.split(":").map(Number); d.setHours(h, m, 0, 0);
    if (d.getTime() <= from) d.setDate(d.getDate() + 1);
    return d.getTime();
  }
  let t = Math.max(from, (r.last || 0) + r.every * 60000);
  let d = new Date(t);
  // דילוג על שעות שקט
  for (let i = 0; i < 48 && inQuiet(d); i++) { d = new Date(d.getTime() + 30 * 60000); }
  return d.getTime();
}
function checkReminder() {
  const r = S.settings.rem;
  if (!r.on || isNative() || !("Notification" in window) || Notification.permission !== "granted") return;
  const now = Date.now();
  if (r.every === 1440) {
    const d = new Date(); const [h, m] = r.at.split(":").map(Number); d.setHours(h, m, 0, 0);
    if (now >= d.getTime() && (r.last || 0) < d.getTime() && !inQuiet()) showReminder();
  } else if (now - (r.last || 0) >= r.every * 60000 && !inQuiet()) {
    if (!r.last) { r.last = now; save(); } else showReminder();
  }
}
async function syncReminders() {
  const r = S.settings.rem;
  // מידע ל־Service Worker (לתזכורות כשהאפליקציה סגורה)
  try {
    const c = await caches.open("ck-meta");
    await c.put("./__reminder.json", new Response(JSON.stringify({ on: r.on, every: r.every, at: r.at, quietFrom: r.quietFrom, quietTo: r.quietTo, fact: r.fact, last: r.last || 0, streak: currentStreak() })));
    const reg = await navigator.serviceWorker?.ready;
    if (reg && "periodicSync" in reg) {
      if (r.on) await reg.periodicSync.register("ck-reminder", { minInterval: Math.max(r.every, 60) * 60000 }).catch(() => { });
      else await reg.periodicSync.unregister("ck-reminder").catch(() => { });
    }
  } catch (e) { }
  // גרסת אנדרואיד מלאה (Capacitor): תזמון אמיתי של התראות
  if (isNative()) {
    const LN = window.Capacitor.Plugins.LocalNotifications;
    try {
      const pend = await LN.getPending(); if (pend.notifications.length) await LN.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) });
      if (!r.on) return;
      const list = [], now = Date.now();
      let t = now;
      for (let i = 0; i < 40; i++) {
        if (r.every === 1440) t = nextDue(t + 60000);
        else { let d = new Date(t + r.every * 60000); for (let k = 0; k < 48 && inQuiet(d); k++) d = new Date(d.getTime() + 30 * 60000); t = d.getTime(); }
        const { title, body } = reminderText();
        list.push({ id: 100 + i, title, body, schedule: { at: new Date(t) } });
      }
      save();
      await LN.schedule({ notifications: list });
    } catch (e) { }
  }
}
setInterval(checkReminder, 60000);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkReminder(); });

/* ───────── שומר מסך ───────── */
let idleTimer = null, saverEl = null, saverInt = null, wakeLock = null;
function resetIdle() {
  clearTimeout(idleTimer);
  const sv = S.settings.saver;
  if (!sv.on || saverEl) return;
  idleTimer = setTimeout(() => { if (!session && !flash && !document.querySelector(".modal-bg") && document.visibilityState === "visible") openSaver(); else resetIdle(); }, sv.idle * 1000);
}
["pointerdown", "keydown", "scroll", "touchstart", "wheel"].forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));
async function openSaver() {
  if (saverEl) return;
  clearTimeout(idleTimer);
  saverEl = document.createElement("div"); saverEl.className = "saver";
  saverEl.innerHTML = `<div class="saver-top"><span id="svClock"></span><span>מאמן ידע ✦</span></div>
    <div class="saver-mid"><span class="tag" id="svTag"></span><div class="saver-fact" id="svFact"></div>
      <div class="row" style="justify-content:center"><button class="saver-fav" id="svFav">🤍</button><button class="saver-fav" id="svAsk">❓ לא הבנתי</button></div></div>
    <div class="saver-bot"><div class="saver-bar"><i id="svBar"></i></div><span>הקש בכל מקום כדי לחזור</span></div>`;
  document.body.append(saverEl);
  let cur;
  const clock = () => { const el = $("#svClock"); if (el) el.textContent = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }); };
  const show = () => {
    cur = nextFact(); const el = $("#svFact"); if (!el) return;
    el.classList.remove("fade-in"); void el.offsetWidth; el.classList.add("fade-in");
    el.innerHTML = linkTerms(cur.t); $("#svTag").textContent = factTag(cur.c); $("#svFav").textContent = S.factFav.includes(cur.i) ? "❤️" : "🤍";
    const bar = $("#svBar"); bar.style.transition = "none"; bar.style.width = "0%"; void bar.offsetWidth; bar.style.transition = `width ${SAVER_ROTATE}s linear`; bar.style.width = "100%";
    clock(); checkAchievements(); save();
  };
  show();
  saverInt = setInterval(() => { show(); }, SAVER_ROTATE * 1000);
  const clockInt = setInterval(clock, 20000);
  saverEl.addEventListener("click", e => {
    if (e.target.id === "svFav") { toggleFav(cur.i); $("#svFav").textContent = S.factFav.includes(cur.i) ? "❤️" : "🤍"; return; }
    if (e.target.id === "svAsk") { askSheet(cur.t); return; }
    clearInterval(saverInt); clearInterval(clockInt); saverEl.remove(); saverEl = null;
    try { wakeLock && wakeLock.release(); } catch (err) { } wakeLock = null;
    resetIdle();
  });
  if (S.settings.saver.wake && navigator.wakeLock) { try { wakeLock = await navigator.wakeLock.request("screen"); } catch (e) { } }
}

/* ───────── מסך פתיחה ───────── */
function onboarding(after) {
  const slides = [
    { em: "💪", t: "ברוכים הבאים למאמן ידע", d: `${BANK.length} שאלות ב־${TOPIC_KEYS.length} תחומים – מאנטומיה ועד פסיכולוגיה של אימון. הכול עובד גם בלי אינטרנט.` },
    { em: "🧠", t: "לומדים חכם, לא קשה", d: "אתגר יומי, חזרה על טעויות בזמן הנכון, כרטיסיות, שיעורים קצרים ומחשבונים למדריך." },
    { em: "🔥", t: "שומרים על רצף", d: "מטרה יומית, רמות, הישגים, ואתגרים מול חברים. כמה דקות ביום – וזה מצטבר." }
  ];
  let i = 0;
  const el = document.createElement("div"); el.className = "onb";
  const draw = () => {
    const last = i === slides.length;
    el.innerHTML = `<div class="onb-in fade-in">
      <button class="link-btn small onb-skip" data-a="skip">${last ? "" : "דילוג"}</button>
      ${last ? `<div class="onb-em">👋</div><h1>בוא נכיר</h1><p class="muted">אפשר לשנות הכול אחר כך בהגדרות.</p>
        <label class="lbl">איך קוראים לך?</label><input class="search" id="onbName" placeholder="השם שלך (לא חובה)" maxlength="40" value="${esc(S.name)}">
        <label class="lbl">איך תרצה להשתמש באפליקציה?</label>
        <div class="mode-pick" id="onbMode"><button data-k="play" class="${(S.mode || "play") === "play" ? "on" : ""}"><span>🎮</span><b>משחק</b><small>מסע, שלבים, בוסים ומטבעות</small></button><button data-k="learn" class="${S.mode === "learn" ? "on" : ""}"><span>📚</span><b>לימוד</b><small>שיעורים, תרגול ומבחנים</small></button></div>
        <label class="lbl">כמה שאלות ביום?</label><div class="seg" id="onbGoal">${[10, 20, 30, 50].map(n => `<button data-k="${n}" class="${S.goal === n ? "on" : ""}">${n}</button>`).join("")}</div>`
        : `<div class="onb-em">${slides[i].em}</div><h1>${slides[i].t}</h1><p class="muted" style="font-size:16px">${slides[i].d}</p>`}
      <div class="onb-dots">${[0, 1, 2, 3].map(k => `<i class="${k === i ? "on" : ""}"></i>`).join("")}</div>
      <button class="btn primary block lg" data-a="next">${last ? "יאללה, מתחילים! 🚀" : "הבא ←"}</button></div>`;
    const mp = el.querySelector("#onbMode");
    if (mp) mp.onclick = e => { const b = e.target.closest("button"); if (!b) return; S.mode = b.dataset.k; mp.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); };
    const g = el.querySelector("#onbGoal");
    if (g) g.onclick = e => { const b = e.target.closest("button"); if (!b) return; S.goal = +b.dataset.k; g.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); };
  };
  el.addEventListener("click", e => {
    const a = e.target.dataset.a; if (!a) return;
    if (a === "next" && i < slides.length) { i++; draw(); return; }
    const n = el.querySelector("#onbName"); if (n) S.name = n.value.trim();
    if (!S.mode) S.mode = "play";
    S.onboarded = true; save(); el.remove(); go("home");
    if (typeof after === "function") after();
    if (a === "next" && i === slides.length) setTimeout(() => toast("🎯", `המטרה היומית שלך: ${S.goal} שאלות`), 300);
  });
  draw(); document.body.append(el);
}

/* ───────── מקלדת ───────── */
document.addEventListener("keydown", e => {
  if (!session || e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
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
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).then(reg => { syncReminders(); reg.update().catch(() => { }); }).catch(() => { });
  // כשגרסה חדשה נכנסת לתוקף – טוענים מחדש פעם אחת כדי שכל הקבצים יהיו מאותה גרסה
  let swReloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (swReloaded || session) return; swReloaded = true; location.reload(); });
}

/* ───────── הפעלה ───────── */
applyTheme();
const params = new URLSearchParams(location.search);
go("home");
function handleParams() {
  if (params.get("ch")) {
    const seed = parseInt(params.get("ch")), them = parseInt(params.get("s")) || 0, from = (params.get("n") || "חבר").slice(0, 40);
    history.replaceState(null, "", baseUrl());
    modal(`🤝 ${from} מאתגר/ת אותך!`, `${from} השיג/ה ${them}% ב־10 שאלות. מוכן/ה לנסות לנצח?`, "יאללה! 💪", "לא עכשיו")
      .then(ok => { if (ok) startMode("challenge", { seed, from, theirScore: them }); });
  } else {
    const m = params.get("mode");
    if (m && ["daily", "quick", "speed", "exam", "survival"].includes(m) && !(m === "daily" && S.daily[today()])) startMode(m);
  }
}
if (!S.onboarded) onboarding(handleParams);
else if (!S.mode) { modeSheet(); handleParams(); }
else handleParams();
checkReminder(); resetIdle();
