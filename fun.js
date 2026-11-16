/* ═════════════ מרכז הכיף: אווטאר, חיית מחמד, קלפים, ליגה, עונה, משימות שבועיות, מצבי משחק וכלי למידה ═════════════ */
// DAY מוגדר ב־app.js
const pad2 = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
function weekStart(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - x.getDay()); return x; }
const weekId = () => ymd(weekStart());
const monthId = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; };
const isWeekend = () => [5, 6].includes(new Date().getDay());
const dayOfYear = () => { const d = new Date(), s = new Date(d.getFullYear(), 0, 0); return Math.floor((d - s) / DAY); };
const topicOfDay = () => TOPIC_KEYS[dayOfYear() % TOPIC_KEYS.length];
const isNight = () => { const h = new Date().getHours(); return h >= 22 || h < 5; };
const rpick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
let funTimer = null;
function funCleanup() { clearInterval(funTimer); clearTimeout(funTimer); funTimer = null; }
function funScreen(html) { funCleanup(); stopTimer(); session = null; document.body.classList.add("in-quiz"); app.innerHTML = html; window.scrollTo(0, 0); }
function funExitBtn() { return `<div class="qhead"><button class="x" id="fx">✕</button><div style="flex:1"></div></div>`; }
function bindExit() { const b = $("#fx"); b && (b.onclick = () => go("home")); }
function ensureFun() {
  S.av = S.av || { shirt: "green", hat: "none", acc: "none", bg: "none", owned: ["green", "none"] };
  S.cards = S.cards || {};
  S.up = S.up || { time: 0, heart: 0, coin: 0 };
  S.dayStats = S.dayStats || {};
  S.best.whoami = S.best.whoami || 0; S.best.swipe = S.best.swipe || 0; S.best.sudden = S.best.sudden || 0;
  S.stories = S.stories || {};
  S.wlog = S.wlog || [];
}
ensureFun();
PRAISE.push(...FUN_PRAISE);

/* ═════ עטיפות לפונקציות קיימות ═════ */
const _addXP = addXP;
addXP = function (n) {
  _addXP(n); n = Math.round(n); if (n <= 0) return;
  ensureLeague(); S.lg.xp += n;
  ensureSeason(); S.ss.xp += n;
};
const _addCoins = addCoins;
addCoins = function (n, quiet) {
  if (n > 0) n = Math.round(n * (1 + 0.1 * (S.up.coin || 0)) * (isWeekend() ? 2 : 1));
  _addCoins(n, quiet);
};
const _beep = beep;
beep = function (good, up) {
  _beep(good, up);
  if (good === false && document.body.classList.contains("in-quiz")) { const a = $("#app"); a.classList.remove("shake-x"); void a.offsetWidth; a.classList.add("shake-x"); }
};
const _onAnswer = onAnswer;
onAnswer = function (s, it) {
  _onAnswer(s, it);
  const t = today(), ds = S.dayStats[t] = S.dayStats[t] || { n: 0, ok: 0, t: {} };
  const f = TOPICS[it.q.f] ? it.q.f : null, tt = f ? (ds.t[f] = ds.t[f] || [0, 0]) : [0, 0];
  ds.n++; tt[0]++;
  if (it.grade === 1) {
    ds.ok++; tt[1]++;
    ensureWQ(); S.wq.p.correct++;
    if (f === topicOfDay()) _addXP(5);
    if (ds.ok === 10) setTimeout(() => toast(petEm(), `${petName()} אכל/ה והוא/היא מאושר/ת! 🦴`), 900);
    if (PLAY() && ["stage", "quick", "topic", "survival", "due", "mistakes"].includes(s.mode) && Math.random() < 0.05) setTimeout(mysteryBox, 700);
  }
  pruneDayStats();
};
function pruneDayStats() { const keys = Object.keys(S.dayStats).sort(); while (keys.length > 21) delete S.dayStats[keys.shift()]; }
const _finishBoss = finishBoss;
finishBoss = function () {
  const win = session && session.bossHp <= 0;
  _finishBoss();
  if (win) { boom(); ensureWQ(); S.wq.p.boss++; save(); setTimeout(() => dropCard("e", "הבסת בוס!"), 1300); }
};
const _finishStage = finishStage;
finishStage = function () {
  const s = session, wrong = s.items.filter(x => x.grade !== null && x.grade < 1).length, passed = s.lives > 0;
  _finishStage();
  if (passed) { ensureWQ(); S.wq.p.stages++; if (wrong === 0) { S.wq.p.perfect++; if (Math.random() < 0.35) setTimeout(() => dropCard("c", "שלב מושלם!"), 1200); } save(); }
};
if (typeof recordRival === "function") { const _rr = recordRival; recordRival = function (n, r, v) { _rr(n, r, v); ensureWQ(); S.wq.p.duel++; save(); }; }
const _levelUp = levelUp;
levelUp = function (L) {
  _levelUp(L);
  const box = document.querySelector(".lvup:last-of-type");
  if (box) { const b = document.createElement("button"); b.className = "btn block"; b.style.marginTop = "8px"; b.textContent = "📸 שתף בסטורי"; b.onclick = () => shareStory({ em: "🚀", title: `עליתי לרמה ${L}!`, big: levelTitle(L), sub: "במאמן ידע" }); box.append(b); }
};
const _logHistory = logHistory;
logHistory = function (e) { _logHistory(e); if (e.mode === "daily") groupPostDaily(e.score); };
const _worldHtml = worldHtml;
worldHtml = function (f, w, ex) {
  const c = CAREER[f]; let h = _worldHtml(f, w, ex);
  if (c) h = h.replace(`<b>${TOPICS[f].name}</b>`, `<b>${TOPICS[f].name}</b><div class="career">💼 שלב ${w + 1} בקריירה: ${c[0]}</div>`);
  return h;
};
const _renderPlayHome = renderPlayHome;
renderPlayHome = function () { _renderPlayHome(); fillFunTop(); fillToday(); };
const _renderHome = renderHome;
renderHome = function () { _renderHome(); if (S.mode !== "play") fillToday(); };
const _goFun = go;
go = function (t, sub) { funCleanup(); const r = _goFun(t, sub); nightCheck(); return r; };

/* ═════ אנימציות וסאונד ═════ */
function boom() {
  const o = document.createElement("div"); o.className = "boom"; o.innerHTML = "<span>💥</span>";
  document.body.append(o); setTimeout(() => o.remove(), 1200); beep(true, 10);
}
let music = null;
function toggleMusic(on) {
  S.settings.music = on; save();
  if (!on) { if (music) { clearInterval(music.t); try { music.ctx.close(); } catch (e) { } music = null; } return; }
  if (music) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)(), notes = [261.6, 329.6, 392, 440, 523.3, 440, 392, 329.6], bass = [130.8, 130.8, 174.6, 196];
    let i = 0;
    const play = (f, t, d, v, type) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d + 0.05); };
    music = { ctx, t: setInterval(() => { if (document.hidden) return; const t = ctx.currentTime; play(notes[i % 8], t, 0.25, 0.025, "triangle"); if (i % 4 === 0) play(bass[(i / 4) % 4], t, 0.9, 0.03, "sine"); i++; }, 300) };
  } catch (e) { }
}
document.addEventListener("click", function startMusicOnce() { if (S.settings.music && !music) toggleMusic(true); }, { once: true });
let nightShown = "";
function nightCheck() {
  document.body.classList.toggle("night", isNight());
  if (isNight() && nightShown !== today() && S.onboarded) { nightShown = today(); setTimeout(() => toast("🌙", "עוד שאלה אחת לפני השינה? המוח מקבע זיכרון בשינה 😴"), 1500); }
}

/* ═════ אווטאר ═════ */
const AV = {
  shirt: { green: ["ירוק", 0, "#10b981"], blue: ["כחול", 60, "#3b82f6"], red: ["אדום", 60, "#ef4444"], black: ["שחור", 90, "#1f2937"], pink: ["ורוד", 90, "#ec4899"], purple: ["סגול", 120, "#8b5cf6"], gold: ["זהב 🏆", -1, "#f59e0b"] },
  hat: { none: ["בלי", 0], cap: ["כובע מצחייה", 80], band: ["סרט ראש", 60], beanie: ["כובע צמר", 100], crown: ["כתר 👑", -1] },
  acc: { none: ["בלי", 0], whistle: ["משרוקית", 120], dumbbell: ["משקולת", 150], watch: ["שעון ספורט", 100], medal: ["מדליה 🥇", -1] },
  bg: { none: ["רגיל", 0], gym: ["מכון", 120], beach: ["חוף", 150], night: ["לילה", 150], fire: ["אש 🔥", -1] }
};
const bodyStage = () => { const L = levelOf(S.xp); return L < 4 ? 0 : L < 8 ? 1 : L < 12 ? 2 : 3; };
function avatarSvg(av = S.av, size = 96) {
  const st = bodyStage(), sh = AV.shirt[av.shirt] ? AV.shirt[av.shirt][2] : "#10b981";
  const arm = [7, 9, 11, 13][st], chest = [26, 30, 34, 38][st], sk = "#f2c7a0";
  const bgs = { none: "", gym: `<rect width="120" height="120" fill="#e0e7ff"/><rect x="8" y="80" width="104" height="6" fill="#94a3b8"/><circle cx="16" cy="83" r="9" fill="#475569"/><circle cx="104" cy="83" r="9" fill="#475569"/>`, beach: `<rect width="120" height="120" fill="#bae6fd"/><rect y="88" width="120" height="32" fill="#fde68a"/><circle cx="98" cy="22" r="11" fill="#fbbf24"/>`, night: `<rect width="120" height="120" fill="#1e1b4b"/><circle cx="96" cy="22" r="9" fill="#fef3c7"/><circle cx="20" cy="30" r="1.6" fill="#fff"/><circle cx="40" cy="14" r="1.2" fill="#fff"/><circle cx="70" cy="34" r="1.4" fill="#fff"/>`, fire: `<rect width="120" height="120" fill="#7c2d12"/><path d="M0 120 Q15 70 30 100 Q45 55 60 100 Q75 50 90 100 Q105 65 120 120Z" fill="#f97316"/><path d="M10 120 Q25 90 40 110 Q60 80 80 110 Q95 90 110 120Z" fill="#fbbf24"/>` };
  const hats = { none: "", cap: `<path d="M44 30 Q60 14 76 30 Z" fill="${sh}"/><rect x="40" y="28" width="44" height="5" rx="2" fill="${sh}"/>`, band: `<rect x="44" y="27" width="32" height="5" rx="2" fill="#ef4444"/>`, beanie: `<path d="M43 33 Q60 8 77 33 Z" fill="#6366f1"/><circle cx="60" cy="13" r="4" fill="#a5b4fc"/>`, crown: `<path d="M45 28 L48 14 L54 23 L60 11 L66 23 L72 14 L75 28 Z" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>` };
  const accs = { none: "", whistle: `<line x1="60" y1="52" x2="66" y2="66" stroke="#111" stroke-width="1"/><rect x="63" y="65" width="8" height="5" rx="2" fill="#94a3b8"/>`, dumbbell: `<rect x="${92 - (3 - st)}" y="76" width="16" height="4" fill="#475569"/><rect x="${90 - (3 - st)}" y="71" width="4" height="14" rx="1" fill="#111"/><rect x="${106 - (3 - st)}" y="71" width="4" height="14" rx="1" fill="#111"/>`, watch: `<rect x="${32 - arm / 2}" y="82" width="${arm + 2}" height="5" rx="2" fill="#111"/>`, medal: `<line x1="54" y1="52" x2="60" y2="70" stroke="#ef4444" stroke-width="2"/><line x1="66" y1="52" x2="60" y2="70" stroke="#3b82f6" stroke-width="2"/><circle cx="60" cy="73" r="5" fill="#fbbf24"/>` };
  const cx = 60, top = 52;
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="avatar-svg">${bgs[av.bg] || ""}
    <rect x="${cx - chest / 2 - arm}" y="${top + 4}" width="${arm}" height="34" rx="${arm / 2}" fill="${sk}"/>
    <rect x="${cx + chest / 2}" y="${top + 4}" width="${arm}" height="34" rx="${arm / 2}" fill="${sk}"/>
    <rect x="${cx - chest / 2}" y="${top}" width="${chest}" height="40" rx="10" fill="${sh}"/>
    <rect x="${cx - 13}" y="${top + 38}" width="11" height="26" rx="4" fill="#334155"/><rect x="${cx + 2}" y="${top + 38}" width="11" height="26" rx="4" fill="#334155"/>
    <circle cx="${cx}" cy="38" r="14" fill="${sk}"/><circle cx="${cx - 5}" cy="37" r="1.6" fill="#111"/><circle cx="${cx + 5}" cy="37" r="1.6" fill="#111"/>
    <path d="M${cx - 5} 43 Q${cx} 47 ${cx + 5} 43" stroke="#111" stroke-width="1.4" fill="none"/>
    ${hats[av.hat] || ""}${accs[av.acc] || ""}</svg>`;
}
function avatarSheet() {
  const cats = [["shirt", "👕 חולצה"], ["hat", "🧢 כובע"], ["acc", "🎽 אביזר"], ["bg", "🖼️ רקע"]];
  let cat = "shirt";
  const draw = () => `<div style="max-height:78vh;overflow:auto"><h2 style="text-align:center">🧍 המאמן שלך</h2>
    <div class="av-prev">${avatarSvg(S.av, 150)}</div>
    <p class="muted xs" style="text-align:center">הגוף מתחזק כשעולים רמה (${["מתחיל", "בכושר", "אתלטי", "מקצוען"][bodyStage()]}) · 🪙 ${S.coins}</p>
    <div class="seg" style="margin:10px 0">${cats.map(([k, n]) => `<button data-cat="${k}" class="${k === cat ? "on" : ""}">${n}</button>`).join("")}</div>
    <div class="av-grid">${Object.entries(AV[cat]).map(([k, [n, price]]) => {
      const own = S.av.owned.includes(cat + ":" + k) || price === 0, on = S.av[cat] === k;
      const preview = avatarSvg({ ...S.av, [cat]: k }, 64);
      return `<button class="av-item ${on ? "on" : ""} ${!own && price < 0 ? "lock" : ""}" data-it="${k}">${preview}<b>${n}</b><small>${on ? "✓ בשימוש" : own ? "בחר" : price < 0 ? "🎟️ מסלול העונה" : `🪙 ${price}`}</small></button>`;
    }).join("")}</div></div>
    <div class="row"><button class="btn primary" data-a="x">סגירה</button></div>`;
  const { bg } = sheet(draw(), (e, close) => {
    if (e.target.dataset.a === "x") { close(); if (tab === "home" && !session) go("home"); return; }
    const c = e.target.closest("[data-cat]"); if (c) { cat = c.dataset.cat; bg.querySelector(".modal").innerHTML = draw(); return; }
    const it = e.target.closest("[data-it]"); if (!it) return;
    const k = it.dataset.it, [n, price] = AV[cat][k], key = cat + ":" + k;
    const own = S.av.owned.includes(key) || price === 0;
    if (!own) {
      if (price < 0) return toast("🎟️", "פריט בלעדי – זוכים בו במסלול העונה");
      if (S.coins < price) return toast("🪙", "אין מספיק מטבעות");
      addCoins(-price, true); S.av.owned.push(key); toast("🛍️", `קנית ${n}!`); beep(true);
    }
    S.av[cat] = k; save(); bg.querySelector(".modal").innerHTML = draw(); updateHeader();
  });
}

/* ═════ חיית מחמד ═════ */
const PETS = { dog: ["כלבלב", ["🐶", "🐕", "🦮", "🐺"]], cat: ["חתול", ["🐱", "🐈", "🐈‍⬛", "🦁"]], dragon: ["דרקון", ["🥚", "🦎", "🐉", "🐲"]], bird: ["ציפור", ["🐣", "🐥", "🦜", "🦅"]] };
const petStage = () => { const x = (S.pet && S.pet.xp) || 0; return x < 3 ? 0 : x < 10 ? 1 : x < 30 ? 2 : 3; };
const petEm = () => S.pet ? PETS[S.pet.type][1][petStage()] : "🥚";
const petName = () => S.pet ? S.pet.name : "החיה שלך";
function petTick() {
  if (!S.pet) return;
  const t = today(), ds = S.dayStats[t];
  if (ds && ds.ok >= 10 && S.pet.last !== t) { S.pet.last = t; S.pet.xp++; save(); }
}
function petMood() {
  if (!S.pet) return ["🥚", "בחר חיית מחמד!"];
  const ds = S.dayStats[today()] || { ok: 0 }, y = ymd(new Date(Date.now() - DAY));
  if (ds.ok >= 10) return ["😄", "שבע/ה ומאושר/ת!"];
  if (ds.ok > 0) return ["🙂", `עוד ${10 - ds.ok} תשובות נכונות לארוחה`];
  if (S.pet.last && S.pet.last < y) return ["😢", "מתגעגע/ת אליך..."];
  return ["🥺", "רעב/ה – ענה על 10 נכון"];
}
function petSheet() {
  if (!S.pet) {
    const { bg } = sheet(`<h2 style="text-align:center">בחר חיית מחמד</h2><p class="muted small" style="text-align:center">היא גדלה כל יום שבו אתה עונה נכון על 10 שאלות – ומתגעגעת כשאתה נעלם.</p>
      <div class="pet-pick">${Object.entries(PETS).map(([k, [n, em]]) => `<button data-p="${k}"><span>${em[0]}</span><b>${n}</b></button>`).join("")}</div>
      <input class="search" id="petN" maxlength="14" placeholder="שם לחיה (לא חובה)" style="margin-top:10px">`, (e, close) => {
      const b = e.target.closest("[data-p]"); if (!b) return;
      const nm = bg.querySelector("#petN").value.trim() || ({ dog: "באדי", cat: "מיצי", dragon: "פלאפי", bird: "ציפי" })[b.dataset.p];
      S.pet = { type: b.dataset.p, name: nm.slice(0, 14), xp: 0, last: "" }; petTick(); save(); close(); confetti(); go("home");
    });
    return;
  }
  petTick();
  const [face, txt] = petMood(), st = petStage(), next = [3, 10, 30][st];
  sheet(`<div style="text-align:center"><div class="pet-big">${petEm()}</div><h2>${esc(S.pet.name)} ${face}</h2><p class="muted">${txt}</p>
    <div class="xpbar" style="margin:10px 0"><i style="width:${next ? pct(S.pet.xp, next) : 100}%"></i></div>
    <p class="muted xs">${next ? `${S.pet.xp}/${next} ימי האכלה עד השלב הבא` : "השלב האגדי! 👑"} · ${["תינוק", "צעיר", "בוגר", "אגדי"][st]}</p>
    <button class="btn primary block" data-a="x">יאללה, להאכיל אותו! 🦴</button></div>`, (e, close) => { if (e.target.dataset.a) { close(); startMode("quick"); } });
}

/* ═════ קלפים ═════ */
function dropCard(minR = "c", reason = "") {
  const order = ["c", "r", "e", "l"], allowed = order.slice(order.indexOf(minR));
  const tot = allowed.reduce((a, r) => a + RARITY[r].w, 0); let x = Math.random() * tot, r = allowed[0];
  for (const k of allowed) { if (x < RARITY[k].w) { r = k; break; } x -= RARITY[k].w; }
  const c = rpick(CARDS.filter(k => k.r === r)), dup = !!S.cards[c.id];
  S.cards[c.id] = (S.cards[c.id] || 0) + 1;
  if (dup) addCoins(RARITY[r].dup, true);
  save();
  const { bg } = sheet(`<div class="card-reveal"><div class="muted small">${esc(reason)} 🎁 קיבלת קלף</div>
    <div class="flip"><div class="fc front">❓</div><div class="fc back" style="--rc:${RARITY[r].col}">${cardFace(c)}</div></div>
    <p class="muted small" id="crMsg">הקש על הקלף כדי לחשוף</p>
    <button class="btn primary block" data-a="x">מעולה!</button></div>`, (e, close) => {
    if (e.target.dataset.a) return close();
    const f = e.target.closest(".flip"); if (f && !f.classList.contains("on")) { f.classList.add("on"); beep(true, r === "l" ? 10 : 4); if (r === "e" || r === "l") confetti(); bg.querySelector("#crMsg").innerHTML = dup ? `כבר יש לך את הקלף – הוא הומר ל־<b dir="ltr">${RARITY[r].dup} 🪙</b>` : `<b>קלף חדש לאלבום!</b> (${Object.keys(S.cards).length}/${CARDS.length})`; }
  });
}
const cardFace = c => `<div class="cf-r">${RARITY[c.r].n}</div><div class="cf-em">${c.em}</div><b>${esc(c.n)}</b><small>${esc(c.t)}</small>`;
function albumPage() {
  const have = Object.keys(S.cards).length;
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>🃏 אלבום הקלפים</h2><p class="muted small">${have}/${CARDS.length} קלפים · זוכים בקלפים מבוסים, שלבים מושלמים, תיבות מסתוריות, משימות שבועיות ומסלול העונה.</p>
    <div class="xpbar"><i style="width:${pct(have, CARDS.length)}%"></i></div>
    ${["l", "e", "r", "c"].map(r => `<div class="section-title"><h2 style="color:${RARITY[r].col}">${RARITY[r].n}</h2></div><div class="album">${CARDS.filter(c => c.r === r).map(c => S.cards[c.id] ? `<div class="mini-card" style="--rc:${RARITY[r].col}" data-c="${c.id}">${cardFace(c)}${S.cards[c.id] > 1 ? `<i>×${S.cards[c.id]}</i>` : ""}</div>` : `<div class="mini-card locked">❔</div>`).join("")}</div>`).join("")}</div>`);
  bindExit();
}

/* ═════ תיבה מסתורית ═════ */
function mysteryBox() {
  if (document.querySelector(".modal-bg")) return;
  const prizes = [() => { const c = 15 + Math.floor(Math.random() * 36); addCoins(c, true); return `🪙 ${c} מטבעות`; }, () => { const k = rpick(["fifty", "skip", "aud", "time"]); S.items[k] = (S.items[k] || 0) + 1; return `${ITEMS[k].em} ${ITEMS[k].n}`; }, () => { addXP(40); return "✨ ‎+40 XP"; }, () => "card"];
  sheet(`<div style="text-align:center"><div class="mbox" id="mbox">📦</div><h2>תיבה מסתורית!</h2><p class="muted small" id="mbMsg">מצאת תיבה באמצע הדרך. הקש לפתוח</p><button class="btn primary block" data-a="x">אחר כך</button></div>`, (e, close) => {
    if (e.target.dataset.a) return close();
    if (e.target.id === "mbox" && !e.target.dataset.open) {
      e.target.dataset.open = 1; e.target.classList.add("shake");
      setTimeout(() => { const p = rpick(prizes)(); save(); if (p === "card") { close(); dropCard("c", "תיבה מסתורית"); return; } e.target.textContent = "✨"; document.querySelector("#mbMsg").innerHTML = `<b>זכית: ${p}</b>`; document.querySelector("[data-a=x]").textContent = "מעולה!"; beep(true, 6); updateHeader(); }, 800);
    }
  });
}

/* ═════ ליגה שבועית ═════ */
function ensureLeague() {
  const wk = weekId();
  if (S.lg && S.lg.wk === wk) return;
  let msg = null;
  if (S.lg && S.lg.bots) {
    const rows = leagueRows(true), rank = rows.findIndex(r => r.me) + 1, tier = S.lg.tier;
    let nt = tier;
    if (rank <= 3 && tier < LEAGUES.length - 1) nt++; else if (rank >= 14 && tier > 0) nt--;
    const prize = rank === 1 ? 150 : rank <= 3 ? 90 : rank <= 10 ? 40 : 15;
    _addCoins(prize, true);
    msg = { rank, from: tier, to: nt, prize };
    S.lg.tier = nt;
  }
  const tier = S.lg ? S.lg.tier : 0, r = rng(parseInt(hash(wk + ":" + tier + ":" + uidF()), 36));
  const names = shuffle(BOT_NAMES, r).slice(0, 15);
  S.lg = { wk, xp: 0, tier, bots: names.map(n => ({ n, s: Math.round(220 * (1 + tier * 0.55) * (0.25 + r() * 1.5)), j: r() })) };
  if (msg) setTimeout(() => leagueResult(msg), 1200);
}
const uidF = () => (S.uid = S.uid || Math.random().toString(36).slice(2, 10) + Date.now().toString(36));
function botXP(b, final) {
  const frac = final ? 1 : Math.min(1, (Date.now() - weekStart().getTime()) / (7 * DAY));
  return Math.round(b.s * Math.pow(frac, 0.85 + b.j * 0.3));
}
function leagueRows(final) {
  return [...S.lg.bots.map(b => ({ n: b.n, xp: botXP(b, final) })), { n: S.name || "אתה", xp: S.lg.xp, me: true }].sort((a, b) => b.xp - a.xp || (a.me ? -1 : 1));
}
function leagueResult(m) {
  const up = m.to > m.from, down = m.to < m.from, L = LEAGUES[m.to];
  sheet(`<div style="text-align:center"><div style="font-size:64px">${up ? "🚀" : down ? "📉" : L.em}</div><h2>${up ? `עלית לליגת ${L.n}!` : down ? `ירדת לליגת ${L.n}` : `נשארת בליגת ${L.n}`}</h2>
    <p class="muted">סיימת את השבוע שעבר במקום ${m.rank} · <span dir="ltr">+${m.prize} 🪙</span></p>
    <button class="btn primary block" data-a="x">${up ? "יש!! 🎉" : "השבוע אני עולה 💪"}</button></div>`, (e, close) => { if (e.target.dataset.a) close(); });
  if (up) confetti();
}
function leaguePage() {
  ensureLeague();
  const L = LEAGUES[S.lg.tier], rows = leagueRows(), end = weekStart().getTime() + 7 * DAY, hrs = Math.max(0, Math.round((end - Date.now()) / 36e5));
  funScreen(`<div class="fade-in">${funExitBtn()}
    <div class="league-head" style="--lc:${L.col}"><div class="lg-em">${L.em}</div><div><h2>ליגת ${L.n}</h2><div class="muted small">נגמר בעוד ${hrs >= 24 ? Math.floor(hrs / 24) + " ימים" : hrs + " שעות"} · ה־3 הראשונים עולים ליגה</div></div></div>
    <div class="card lb-list">${rows.map((r, i) => `${i === 3 ? `<div class="zone up">⬆️ אזור עלייה</div>` : ""}${i === 13 && S.lg.tier > 0 ? `<div class="zone down">⬇️ אזור ירידה</div>` : ""}<div class="lb-row ${r.me ? "me" : ""}"><span class="lb-rank">${medal(i)}</span><div class="lb-n"><b>${esc(r.n)}${r.me ? " (אתה)" : ""}</b></div><b class="lb-v" dir="ltr">${r.xp} XP</b></div>`).join("")}</div>
    <p class="footer-note">צוברים XP מכל תשובה נכונה, שלב, דו־קרב ומשימה. כל יום ראשון מתחילה ליגה חדשה.</p>
    <button class="btn primary lg block" id="lgPlay">▶ לצבור XP עכשיו</button></div>`);
  bindExit(); $("#lgPlay").onclick = () => startNext(nextStage());
}

/* ═════ מסלול עונתי ═════ */
const SS_STEP = 150, SS_TIERS = 30;
function ensureSeason() { const m = monthId(); if (!S.ss || S.ss.m !== m) S.ss = { m, xp: 0, claimed: [] }; }
function ssReward(i) {
  if (i === 9) return { t: "av", k: "hat:crown", l: "👑 כתר לאווטאר" };
  if (i === 19) return { t: "av", k: "shirt:gold", l: "🏆 חולצת זהב" };
  if (i === 24) return { t: "av", k: "acc:medal", l: "🥇 מדליה לאווטאר" };
  if (i === 29) return { t: "av", k: "bg:fire", l: "🔥 רקע אש + קלף אגדי" };
  if (i % 5 === 4) return { t: "card", r: i > 15 ? "e" : "r", l: i > 15 ? "🃏 קלף אפי+" : "🃏 קלף נדיר+" };
  if (i % 3 === 2) { const k = ["fifty", "skip", "aud", "time", "shield"][i % 5]; return { t: "item", k, l: `${ITEMS[k].em} ${ITEMS[k].n}` }; }
  return { t: "coins", n: 20 + i * 3, l: `🪙 ${20 + i * 3}` };
}
function seasonPage() {
  ensureSeason();
  const tierNow = Math.min(SS_TIERS, Math.floor(S.ss.xp / SS_STEP)), d = new Date(), last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), left = last - d.getDate();
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>🎟️ מסלול העונה</h2>
    <p class="muted small">עונת ${d.toLocaleDateString("he-IL", { month: "long" })} · נגמרת בעוד ${left} ימים · כל ${SS_STEP} XP = דרגה</p>
    <div class="card"><b>דרגה ${tierNow}/${SS_TIERS}</b><div class="xpbar" style="margin-top:8px"><i style="width:${tierNow >= SS_TIERS ? 100 : pct(S.ss.xp % SS_STEP, SS_STEP)}%"></i></div><div class="muted xs">${S.ss.xp} XP החודש</div></div>
    <div class="ss-list">${Array.from({ length: SS_TIERS }, (_, i) => {
      const rw = ssReward(i), got = S.ss.claimed.includes(i), ready = i < tierNow && !got;
      return `<div class="ss-tier ${got ? "got" : ""} ${ready ? "ready" : ""} ${[9, 19, 24, 29].includes(i) ? "big" : ""}"><span class="ss-n">${i + 1}</span><span class="ss-l">${rw.l}</span>${got ? `<span>✅</span>` : ready ? `<button class="btn sm primary" data-claim="${i}">קבל</button>` : `<span class="muted xs">🔒</span>`}</div>`;
    }).join("")}</div></div>`);
  bindExit();
  app.querySelectorAll("[data-claim]").forEach(b => b.onclick = () => {
    const i = +b.dataset.claim, rw = ssReward(i); if (S.ss.claimed.includes(i)) return;
    S.ss.claimed.push(i);
    if (rw.t === "coins") _addCoins(rw.n, true);
    if (rw.t === "item") S.items[rw.k] = (S.items[rw.k] || 0) + 1;
    if (rw.t === "av") { if (!S.av.owned.includes(rw.k)) S.av.owned.push(rw.k); toast("🎁", "פריט חדש לאווטאר!"); }
    save(); beep(true, 6);
    if (rw.t === "card") dropCard(rw.r, "מסלול העונה");
    if (i === 29) { dropCard("l", "סיימת את העונה!"); confetti(); }
    if (rw.t !== "card" && i !== 29) seasonPage();
  });
}

/* ═════ משימות שבועיות ═════ */
const WQ = [["correct", 100, "ענה נכון על 100 שאלות", "✅"], ["stages", 6, "עבור 6 שלבים במסע", "🗺️"], ["perfect", 3, "3 שלבים מושלמים (בלי טעויות)", "⭐"], ["duel", 2, "2 דו־קרבות או אתגרי חבר", "⚔️"], ["boss", 1, "הבס בוס אחד", "👹"]];
function ensureWQ() { const wk = weekId(); if (!S.wq || S.wq.wk !== wk) S.wq = { wk, p: { correct: 0, stages: 0, perfect: 0, duel: 0, boss: 0 }, claimed: [] }; }
function questsPage() {
  ensureWQ();
  const done = WQ.filter(([k, n]) => S.wq.p[k] >= n).length, allClaimed = S.wq.claimed.includes("all");
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>📅 משימות השבוע</h2><p class="muted small">60 מטבעות לכל משימה · כל 5 = קלף אפי ומעלה! מתחדש ביום ראשון.</p>
    <div class="card">${WQ.map(([k, n, l, em]) => { const v = Math.min(S.wq.p[k], n), ok = v >= n, got = S.wq.claimed.includes(k);
      return `<div class="wq-row"><span class="em">${em}</span><div style="flex:1"><b class="small">${l}</b><div class="xpbar"><i style="width:${pct(v, n)}%"></i></div><span class="muted xs">${v}/${n}</span></div>${got ? "✅" : ok ? `<button class="btn sm primary" data-q="${k}">קבל</button>` : ""}</div>`; }).join("")}</div>
    <div class="card wq-all ${done === 5 && !allClaimed ? "ready" : ""}"><span style="font-size:30px">🎁</span><div style="flex:1"><b>הפרס הגדול</b><div class="muted xs">${done}/5 משימות הושלמו</div></div>${allClaimed ? "✅" : done === 5 ? `<button class="btn primary" data-q="all">פתח!</button>` : "🔒"}</div></div>`);
  bindExit();
  app.querySelectorAll("[data-q]").forEach(b => b.onclick = () => {
    const k = b.dataset.q; if (S.wq.claimed.includes(k)) return;
    S.wq.claimed.push(k); save();
    if (k === "all") dropCard("e", "כל משימות השבוע!"); else { _addCoins(60, true); beep(true, 4); questsPage(); updateHeader(); }
  });
}

/* ═════ שדרוגים קבועים ═════ */
const UPS = [["time", "⏱️", "עוד 5 שניות במבחן מהירות", [150, 300, 450]], ["heart", "❤️", "לב רביעי בשלבי המסע", [500]], ["coin", "🪙", "מטבעות ‎+10% מכל פרס", [250, 500]]];
function upgradesSheet() {
  const draw = () => `<h2>⬆️ שדרוגים קבועים</h2><p class="muted small">קונים פעם אחת – עובד לתמיד. 🪙 ${S.coins}</p>
    ${UPS.map(([k, em, n, prices]) => { const lv = S.up[k] || 0, max = lv >= prices.length;
      return `<div class="shop-row"><span class="em">${em}</span><div style="flex:1"><b>${n}</b><div class="muted xs">רמה ${lv}/${prices.length}</div></div>${max ? `<span class="muted xs">מקסימום ✅</span>` : `<button class="btn sm ${S.coins >= prices[lv] ? "primary" : ""}" data-u="${k}">🪙 ${prices[lv]}</button>`}</div>`; }).join("")}
    <div class="row"><button class="btn primary" data-a="x">סגירה</button></div>`;
  const { bg } = sheet(draw(), (e, close) => {
    if (e.target.dataset.a) return close();
    const b = e.target.closest("[data-u]"); if (!b) return;
    const [k, , n, prices] = UPS.find(u => u[0] === b.dataset.u), lv = S.up[k] || 0;
    if (S.coins < prices[lv]) return toast("🪙", "אין מספיק מטבעות");
    addCoins(-prices[lv], true); S.up[k] = lv + 1; save(); beep(true, 6); toast("⬆️", "שדרוג: " + n); updateHeader();
    bg.querySelector(".modal").innerHTML = draw();
  });
}

/* ═════ מי אני? ═════ */
function whoAmI() {
  const rounds = shuffle(WHOAMI).slice(0, 5); let i = 0, h = 0, score = 0, locked = false, opts = [];
  const draw = () => {
    const w = rounds[i]; if (h === 0 && !locked) opts = shuffle([w.a, ...w.o]);
    funScreen(`<div class="fade-in">${funExitBtn()}<div class="who-top"><span>🕵️ מי אני? · ${i + 1}/5</span><b>${score} נק׳</b></div>
      <div class="who-hints">${w.h.slice(0, h + 1).map((t, k) => `<div class="who-hint" style="animation-delay:${k === h ? 0 : 0}s"><span>רמז ${k + 1}</span>${esc(t)}</div>`).join("")}</div>
      <div class="muted xs" style="margin:6px 0">תשובה נכונה עכשיו = <b>${[300, 200, 100][h]}</b> נקודות</div>
      <div id="opts">${opts.map((o, k) => `<button class="opt ${locked ? (o === w.a ? "ok" : locked === o ? "no" : "") : ""}" data-o="${k}" ${locked ? "disabled" : ""}><span class="k">${LETTERS[k]}</span><span>${esc(o)}</span></button>`).join("")}</div>
      <div class="qactions">${locked ? `<button class="btn primary lg" id="wNext">${i < 4 ? "לחידה הבאה ←" : "לתוצאות 🏁"}</button>` : h < 2 ? `<button class="btn lg" id="wHint">💡 עוד רמז (−100)</button>` : ""}</div></div>`);
    bindExit();
    app.querySelectorAll("[data-o]").forEach(b => b.onclick = () => { const o = opts[+b.dataset.o]; locked = o; if (o === w.a) { score += [300, 200, 100][h]; beep(true, h ? 2 : 6); } else beep(false); draw(); });
    $("#wHint") && ($("#wHint").onclick = () => { h++; draw(); });
    $("#wNext") && ($("#wNext").onclick = () => { if (i >= 4) return end(); i++; h = 0; locked = false; draw(); });
  };
  const end = () => {
    const best = score > S.best.whoami; if (best) S.best.whoami = score;
    const coins = Math.round(score / 30); addCoins(coins, true); addXP(Math.round(score / 15)); touchStreak(); save();
    if (best && score) confetti();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:60px">🕵️</div><h1>${best && score ? "שיא חדש!" : "כל הכבוד!"}</h1><div class="big-num">${score}</div><p class="muted">נקודות מתוך 1500 · השיא שלך: ${S.best.whoami} · <span dir="ltr">+${coins} 🪙</span></p>
      <div class="col" style="margin-top:14px"><button class="btn primary lg block" id="wAgain">🔁 עוד סיבוב</button><button class="btn block" id="wHome">🏠 לבית</button></div></div></div>`);
    $("#wAgain").onclick = whoAmI; $("#wHome").onclick = () => go("home");
  };
  draw();
}

/* ═════ נכון / לא נכון – מהר! ═════ */
function swipeTF() {
  const pool = freshSort(BANK.filter(q => q.t === "tf"), true); let i = 0, score = 0, lives = 3, limit = 7, t0 = 0, busy = false;
  const card = () => pool[i % pool.length];
  const draw = () => {
    const q = card(); busy = false; t0 = Date.now();
    funScreen(`<div class="fade-in swipe-wrap">${funExitBtn()}<div class="who-top"><span>${"❤️".repeat(lives)}${"🖤".repeat(3 - lives)}</span><b>${score}</b></div>
      <div class="dtime"><i id="swT" style="width:100%"></i></div>
      <div class="swipe-card" id="swC"><div class="muted xs">נכון או לא נכון?</div><div class="sw-q">${esc(q.q)}</div></div>
      <div class="sw-btns"><button class="sw-no" id="swNo">✗ לא נכון</button><button class="sw-yes" id="swYes">✓ נכון</button></div>
      <p class="footer-note">אפשר גם להחליק: ימינה = נכון · שמאלה = לא נכון</p></div>`);
    bindExit();
    $("#swYes").onclick = () => ans(1); $("#swNo").onclick = () => ans(0);
    const c = $("#swC"); let sx = null;
    c.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    c.addEventListener("touchmove", e => { if (sx === null) return; const dx = e.touches[0].clientX - sx; c.style.transform = `translateX(${dx}px) rotate(${dx / 20}deg)`; }, { passive: true });
    c.addEventListener("touchend", e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; c.style.transform = ""; if (Math.abs(dx) > 70) ans(dx > 0 ? 1 : 0); });
    funCleanup();
    funTimer = setInterval(() => { const left = limit - (Date.now() - t0) / 1000, el = $("#swT"); if (el) el.style.width = Math.max(0, left / limit * 100) + "%"; if (left <= 0) ans(null); }, 60);
  };
  const ans = v => {
    if (busy) return; busy = true; funCleanup();
    const q = card(), ok = v === q.a, c = $("#swC"); if (!c) return;
    if (ok) { score++; limit = Math.max(2.6, limit - 0.25); beep(true, Math.min(8, score / 3)); }
    else { lives--; beep(false); }
    record(q, ok ? 1 : 0); save();
    c.classList.add(ok ? "fly-ok" : "fly-no");
    c.insertAdjacentHTML("beforeend", `<div class="sw-fb ${ok ? "ok" : "no"}">${ok ? "✓" : "✗"} ${q.a ? "נכון" : "לא נכון"}</div>${ok ? "" : `<div class="sw-e">${esc(q.e)}</div>`}`);
    setTimeout(() => { if (lives <= 0) return end(); i++; draw(); }, ok ? 450 : 2200);
  };
  const end = () => {
    const best = score > S.best.swipe; if (best) S.best.swipe = score;
    addCoins(score * 2, true); addXP(score * 5); touchStreak(); save(); if (best && score) confetti();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:60px">⚡</div><h1>${best && score ? "שיא חדש!" : "נגמרו הלבבות"}</h1><div class="big-num">${score}</div><p class="muted">תשובות נכונות ברצף · השיא שלך: ${S.best.swipe}</p>
      <div class="col" style="margin-top:14px"><button class="btn primary lg block" id="sAgain">🔁 עוד פעם</button><button class="btn block" id="sHome">🏠 לבית</button></div></div></div>`);
    $("#sAgain").onclick = swipeTF; $("#sHome").onclick = () => go("home");
  };
  draw();
}

/* ═════ המאמן בשטח (סיפורים) ═════ */
function storiesPage() {
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>🎬 המאמן בשטח</h2><p class="muted small">סיפורים אמיתיים מהמכון. כל החלטה משנה את התוצאה.</p>
    <div class="col">${STORIES.map((s, k) => { const st = S.stories[k] || 0; return `<button class="story-card" data-s="${k}"><span class="em">${s.em}</span><div style="flex:1"><b>${esc(s.t)}</b><small>${st ? "★".repeat(st) + "☆".repeat(3 - st) : "חדש!"}</small></div><span class="chev">‹</span></button>`; }).join("")}</div></div>`);
  bindExit();
  app.querySelectorAll("[data-s]").forEach(b => b.onclick = () => playStory(+b.dataset.s));
}
function playStory(k) {
  const st = STORIES[k]; let i = -1, pts = 0, chosen = null;
  const draw = () => {
    if (i === -1) {
      funScreen(`<div class="fade-in">${funExitBtn()}<div class="story-intro"><div style="font-size:64px">${st.em}</div><h2>${esc(st.t)}</h2><p>${esc(st.intro)}</p></div><button class="btn primary lg block" id="stGo">מתחילים ▶</button></div>`);
      bindExit(); $("#stGo").onclick = () => { i = 0; draw(); }; return;
    }
    const step = st.steps[i];
    funScreen(`<div class="fade-in">${funExitBtn()}<div class="who-top"><span>${st.em} ${esc(st.t)} · החלטה ${i + 1}/${st.steps.length}</span></div>
      <div class="qtext">${esc(step.q)}</div>
      <div id="opts">${step.o.map((o, j) => { let cls = ""; if (chosen !== null) { if (o.s === 2) cls = "ok"; else if (j === chosen) cls = o.s === 1 ? "sel" : "no"; }
        return `<button class="opt ${cls}" data-j="${j}" ${chosen !== null ? "disabled" : ""}><span class="k">${LETTERS[j]}</span><span>${esc(o.t)}</span></button>`; }).join("")}</div>
      ${chosen !== null ? `<div class="feedback ${["bad", "info", "good"][step.o[chosen].s]}"><b class="t">${["לא הכי טוב 😬", "סביר 👍", "מצוין! 🌟"][step.o[chosen].s]}</b>${esc(step.o[chosen].fb)}</div><div class="qactions"><button class="btn primary lg" id="stNext">${i < st.steps.length - 1 ? "להמשך הסיפור ←" : "לסיום 🏁"}</button></div>` : ""}</div>`);
    bindExit();
    app.querySelectorAll("[data-j]").forEach(b => b.onclick = () => { chosen = +b.dataset.j; pts += step.o[chosen].s; beep(step.o[chosen].s > 0); draw(); });
    $("#stNext") && ($("#stNext").onclick = () => { if (i >= st.steps.length - 1) return end(); i++; chosen = null; draw(); });
  };
  const end = () => {
    const max = st.steps.length * 2, stars = pts >= max ? 3 : pts >= max - 2 ? 2 : pts >= max / 2 ? 1 : 0, prev = S.stories[k] || 0;
    if (stars > prev) { S.stories[k] = stars; addCoins((stars - prev) * 20, true); }
    addXP(pts * 10); touchStreak(); save(); if (stars === 3) confetti();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:56px">${st.em}</div>
      <div class="stars-big">${[0, 1, 2].map(j => `<span class="${j < stars ? "on" : ""}" style="animation-delay:${0.2 + j * 0.25}s">★</span>`).join("")}</div>
      <h1>${["צריך עוד ניסיון", "התחלה טובה", "מדריך מצוין!", "מאמן מושלם! 🏆"][stars]}</h1><p class="muted">${pts}/${max} נקודות החלטה</p>
      <div class="col" style="margin-top:14px"><button class="btn primary lg block" id="stList">🎬 לסיפור הבא</button><button class="btn block" id="stAgain">🔁 לנסות שוב</button></div></div></div>`);
    $("#stList").onclick = storiesPage; $("#stAgain").onclick = () => playStory(k);
  };
  draw();
}

/* ═════ נחש את המספר (קלוריות / 1RM) ═════ */
function guessGame(kind) {
  const foods = allFoods().filter(f => f.sg && f.k > 20 && !f.mine);
  let i = 0, total = 0, done = false, cur;
  const mk = () => {
    if (kind === "cal") { const f = rpick(foods), kcal = Math.round(f.k * f.sg / 100); return { title: `${f.n}`, sub: `${f.sl || f.sg + " גרם"} (${f.sg} גרם)`, ans: kcal, max: Math.max(400, Math.ceil(kcal * 2.2 / 50) * 50), unit: "קלוריות", step: 5 }; }
    const w = 40 + Math.round(Math.random() * 40) * 2.5, reps = 2 + Math.floor(Math.random() * 10), ans = Math.round(w * (1 + reps / 30));
    return { title: `${w} ק״ג × ${reps} חזרות`, sub: "מהו ה־1RM המשוער? (נוסחת אפלי)", ans, max: Math.ceil(ans * 1.8 / 10) * 10, unit: "ק״ג", step: 1 };
  };
  const draw = () => {
    if (!done) cur = mk();
    const mid = Math.round(cur.max / 2 / cur.step) * cur.step;
    funScreen(`<div class="fade-in">${funExitBtn()}<div class="who-top"><span>${kind === "cal" ? "🍽️ נחש את הקלוריות" : "🏋️ נחש את ה־1RM"} · ${i + 1}/5</span><b>${total} נק׳</b></div>
      <div class="card guess-card"><div class="g-title">${esc(cur.title)}</div><div class="muted small">${esc(cur.sub)}</div>
      <div class="g-val" dir="ltr"><b id="gV">${mid}</b> <span>${cur.unit}</span></div>
      <input type="range" id="gR" min="0" max="${cur.max}" step="${cur.step}" value="${mid}" ${done ? "disabled" : ""}>
      <div id="gRes"></div></div>
      <div class="qactions"><button class="btn primary lg" id="gGo">${done ? (i < 4 ? "הבא ←" : "לתוצאות 🏁") : "זה הניחוש שלי!"}</button></div></div>`);
    bindExit();
    const r = $("#gR"); r.oninput = () => $("#gV").textContent = r.value;
    $("#gGo").onclick = () => {
      if (done) { if (i >= 4) return end(); i++; done = false; return draw(); }
      const g = +r.value, err = Math.abs(g - cur.ans) / cur.ans, p = Math.max(0, Math.round(100 - err * 200));
      total += p; done = true; beep(p >= 60, p / 15);
      r.disabled = true;
      $("#gRes").innerHTML = `<div class="feedback ${p >= 80 ? "good" : p >= 40 ? "info" : "bad"}" style="text-align:center"><b class="t">${p >= 90 ? "בול! 🎯" : p >= 70 ? "קרוב מאוד! 🔥" : p >= 40 ? "לא רע 👍" : "רחוק הפעם 😅"}</b>התשובה: <b dir="ltr">${cur.ans} ${cur.unit}</b> · ניחשת <span dir="ltr">${g}</span> · ‎+${p} נק׳</div>`;
      $("#gGo").textContent = i < 4 ? "הבא ←" : "לתוצאות 🏁";
    };
  };
  const end = () => {
    addCoins(Math.round(total / 20), true); addXP(Math.round(total / 10)); touchStreak(); save(); if (total >= 400) confetti();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:60px">${kind === "cal" ? "🍽️" : "🏋️"}</div><h1>${total >= 400 ? "עין של מקצוען!" : total >= 250 ? "יפה מאוד!" : "ממשיכים להתאמן"}</h1><div class="big-num">${total}</div><p class="muted">מתוך 500</p>
      <div class="col" style="margin-top:14px"><button class="btn primary lg block" id="gA">🔁 עוד סיבוב</button><button class="btn block" id="gO">${kind === "cal" ? "🏋️ נסה את ה־1RM" : "🍽️ נסה קלוריות"}</button><button class="btn block" id="gH">🏠 לבית</button></div></div></div>`);
    $("#gA").onclick = () => guessGame(kind); $("#gO").onclick = () => guessGame(kind === "cal" ? "rm" : "cal"); $("#gH").onclick = () => go("home");
  };
  draw();
}

/* ═════ כלי למידה ═════ */
function coachSession() {
  const ts = TOPIC_KEYS.map(f => ({ f, ...topicStats(f) }));
  const weak = ts.filter(t => t.seen >= 3 && t.acc !== null).sort((a, b) => a.acc - b.acc).slice(0, 2);
  const picks = weak.length === 2 ? weak : ts.sort((a, b) => a.seen - b.seen).slice(0, 2);
  const qs = shuffle(picks.flatMap(t => freshSort(BANK.filter(q => q.f === t.f && q.t !== "open"), true).slice(0, 4)));
  sheet(`<div class="intro"><div class="intro-em">🧑‍🏫</div><h2>האימון האישי שלך</h2><p class="muted">${weak.length === 2 ? "לפי התשובות שלך, היום מחזקים:" : "היום נכיר תחומים שעוד לא תרגלת:"}</p>
    <div class="rules">${picks.map(t => `<div><span>${TOPICS[t.f].icon}</span><b>${TOPICS[t.f].name}</b>${t.acc !== null ? `<small class="muted" style="margin-inline-start:auto">דיוק ${t.acc}%</small>` : ""}</div>`).join("")}<div><span>⏱️</span><b>8 שאלות · כ־5 דקות</b></div></div>
    <div class="row"><button class="btn" data-x>אחר כך</button><button class="btn primary" data-go>בוא נתחיל 💪</button></div></div>`,
    (e, close) => { if (e.target.closest("[data-x]")) close(); if (e.target.closest("[data-go]")) { close(); startMode("coach", { qs }); } });
}
function flashSwipe() {
  const seen = new Set(), pool = [...shuffle(dueQuestions()), ...mistakes(), ...freshSort(BANK, true)].filter(q => !seen.has(q.id) && seen.add(q.id)).slice(0, 15);
  let i = 0, flip = false, know = 0;
  const ans = q => q.t === "mc" ? q.o[q.a] : q.t === "tf" ? (q.a ? "נכון" : "לא נכון") : q.a;
  const draw = () => {
    if (i >= pool.length) return end();
    const q = pool[i];
    funScreen(`<div class="fade-in swipe-wrap">${funExitBtn()}<div class="who-top"><span>🗂️ כרטיסיות · ${i + 1}/${pool.length}</span><b>✓ ${know}</b></div>
      <div class="swipe-card fl ${flip ? "on" : ""}" id="fc">${flip ? `<div class="muted xs">התשובה</div><div class="sw-q" style="color:var(--accent)">${esc(ans(q))}</div><div class="sw-e">${linkTerms(q.e)}</div>` : `<div class="muted xs">${TOPICS[q.f] ? TOPICS[q.f].icon + " " + TOPICS[q.f].name : ""}</div><div class="sw-q">${esc(q.q)}</div>${figHtml(q)}<div class="muted xs" style="margin-top:12px">👆 הקש כדי להפוך</div>`}</div>
      ${flip ? `<div class="sw-btns"><button class="sw-no" id="fNo">✗ לא ידעתי</button><button class="sw-yes" id="fYes">✓ ידעתי</button></div>` : ""}
      <p class="footer-note">מה שלא ידעת – יחזור אליך בקרוב (חזרה מרווחת)</p></div>`);
    bindExit();
    $("#fc").onclick = e => { if (!flip && !e.target.closest(".term")) { flip = true; draw(); } };
    const go2 = ok => { record(q, ok ? 1 : 0); if (ok) know++; S.flashSeen = (S.flashSeen || 0) + 1; save(); beep(ok); i++; flip = false; draw(); };
    $("#fYes") && ($("#fYes").onclick = () => go2(true)); $("#fNo") && ($("#fNo").onclick = () => go2(false));
  };
  const end = () => { addXP(know * 4); touchStreak(); save();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:56px">🗂️</div><h1>סיימת!</h1><div class="big-num">${know}/${pool.length}</div><p class="muted">ידעת. השאר יחזרו אליך בקרוב.</p><div class="col" style="margin-top:14px"><button class="btn primary lg block" id="fA">🔁 עוד חבילה</button><button class="btn block" id="fH">🏠 לבית</button></div></div></div>`);
    $("#fA").onclick = flashSwipe; $("#fH").onclick = () => go("home"); };
  draw();
}
function whyMode() {
  const pool = freshSort(BANK.filter(q => q.t === "mc" && q.e && q.e.length > 25), true).slice(0, 8);
  let i = 0, ok = 0, chosen = null, opts = [];
  const draw = () => {
    if (i >= pool.length) return end();
    const q = pool[i];
    if (chosen === null) { const others = shuffle(BANK.filter(x => x.f === q.f && x.id !== q.id && x.e && x.e !== q.e && x.e.length > 25)).slice(0, 2).map(x => x.e); opts = shuffle([q.e, ...others]); }
    funScreen(`<div class="fade-in">${funExitBtn()}<div class="who-top"><span>🤔 למה זה נכון? · ${i + 1}/${pool.length}</span><b>✓ ${ok}</b></div>
      <div class="qtext">${esc(q.q)}</div><div class="feedback good"><b>התשובה: ${esc(q.o[q.a])}</b></div>
      <div class="muted small" style="margin:12px 0 4px">איזה הסבר מתאים לתשובה הזו?</div>
      <div id="opts">${opts.map((o, k) => { let cls = ""; if (chosen !== null) { if (o === q.e) cls = "ok"; else if (k === chosen) cls = "no"; }
        return `<button class="opt ${cls}" data-k="${k}" ${chosen !== null ? "disabled" : ""}><span class="k">${LETTERS[k]}</span><span>${esc(o)}</span></button>`; }).join("")}</div>
      ${chosen !== null ? `<div class="qactions"><button class="btn primary lg" id="yN">${i < pool.length - 1 ? "הבאה ←" : "לסיום 🏁"}</button></div>` : ""}</div>`);
    bindExit();
    app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { chosen = +b.dataset.k; const r = opts[chosen] === q.e; if (r) ok++; beep(r); draw(); });
    $("#yN") && ($("#yN").onclick = () => { i++; chosen = null; draw(); });
  };
  const end = () => { addXP(ok * 8); addCoins(ok * 2, true); touchStreak(); save();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:56px">🤔</div><h1>${ok >= 7 ? "מבין לעומק!" : ok >= 5 ? "יפה מאוד" : "שווה לחזור על ההסברים"}</h1><div class="big-num">${ok}/${pool.length}</div><div class="col" style="margin-top:14px"><button class="btn primary lg block" id="yA">🔁 עוד סיבוב</button><button class="btn block" id="yH">🏠 לבית</button></div></div></div>`);
    $("#yA").onclick = whyMode; $("#yH").onclick = () => go("home"); };
  draw();
}
const exToday = () => EXERCISES[dayOfYear() % EXERCISES.length];
function exerciseSheet() {
  const e = exToday(), done = S.exDone === today();
  sheet(`<div style="text-align:center"><div style="font-size:56px">${e.em}</div><div class="muted small">💪 תרגיל היום</div><h2>${esc(e.n)}</h2></div>
    <div class="rules"><div><span>🎯</span><b>${esc(e.m)}</b></div><div><span>📝</span><span>${esc(e.how)}</span></div><div><span>💡</span><span>${esc(e.tip)}</span></div></div>
    <p class="muted xs">3 סטים של 8–12 חזרות (או 20–40 שניות בתרגילים סטטיים). אם יש כאב – עוצרים.</p>
    <div class="row"><button class="btn" data-a="x">סגירה</button><button class="btn primary" data-a="d" ${done ? "disabled" : ""}>${done ? "✅ בוצע היום" : "עשיתי! ✓ ‎+15 🪙"}</button></div>`,
    (ev, close) => { const a = ev.target.dataset.a; if (a === "x") close(); if (a === "d" && !done) { S.exDone = today(); addCoins(15); addXP(10); save(); confetti(); close(); toast(e.em, "כל הכבוד! תרגיל היום בוצע"); if (!session) go(tab); } });
}
function programBuilder() {
  let goal = "muscle", days = 3, eq = "gym";
  const draw = () => `<h2>📋 בונה תוכנית אימון</h2>
    <label class="lbl">מטרה</label><div class="seg wrap" id="pg">${Object.entries(PROG_GOALS).map(([k, g]) => `<button data-g="${k}" class="${k === goal ? "on" : ""}">${g.em} ${g.n}</button>`).join("")}</div>
    <label class="lbl" style="margin-top:10px">ימים בשבוע</label><div class="seg" id="pd">${[2, 3, 4, 5].map(d => `<button data-d="${d}" class="${d === days ? "on" : ""}">${d}</button>`).join("")}</div>
    <label class="lbl" style="margin-top:10px">ציוד</label><div class="seg" id="pe">${[["gym", "🏋️ מכון"], ["home", "🏠 בית"], ["trx", "🎗️ TRX"]].map(([k, n]) => `<button data-e="${k}" class="${k === eq ? "on" : ""}">${n}</button>`).join("")}</div>
    <div class="row" style="margin-top:14px"><button class="btn" data-a="x">ביטול</button><button class="btn primary" data-a="go">בנה לי תוכנית ✨</button></div>`;
  const { bg } = sheet(draw(), (e, close) => {
    const t = e.target.closest("[data-g],[data-d],[data-e],[data-a]"); if (!t) return;
    if (t.dataset.g) goal = t.dataset.g; if (t.dataset.d) days = +t.dataset.d; if (t.dataset.e) eq = t.dataset.e;
    if (t.dataset.a === "x") return close();
    if (t.dataset.a === "go") { close(); return showProgram(goal, days, eq); }
    bg.querySelector(".modal").innerHTML = draw();
  });
}
function showProgram(goal, days, eq) {
  const G = PROG_GOALS[goal], lib = PROG_LIB[eq], used = {};
  const plan = PROG_SPLITS[days].map(([name, pats]) => [name, pats.map(p => { const opts = lib[p]; used[p] = (used[p] || 0); const ex = opts[used[p]++ % opts.length]; return [ex, p === "core" ? "3 × 30–45 שנ׳" : `${G.sets} × ${G.reps}`]; })]);
  const text = `תוכנית ${G.n} · ${days} ימים · ${({ gym: "מכון", home: "בית", trx: "TRX" })[eq]}\n\n` + plan.map(([n, exs], i) => `יום ${i + 1} – ${n}\n` + exs.map(([e, s]) => `• ${e}: ${s}`).join("\n")).join("\n\n") + `\n\nמנוחה בין סטים: ${G.rest}\n${G.note}\n\nנבנה באפליקציית מאמן ידע`;
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>${G.em} תוכנית ${G.n}</h2><p class="muted small">${days} ימים בשבוע · ${({ gym: "מכון כושר", home: "בבית בלי ציוד", trx: "TRX" })[eq]} · מנוחה ${G.rest}</p>
    ${plan.map(([n, exs], i) => `<div class="card prog-day"><b>יום ${i + 1} · ${n}</b>${exs.map(([e, s]) => `<div class="prog-ex"><span>${esc(e)}</span><b dir="ltr">${s}</b></div>`).join("")}</div>`).join("")}
    <div class="tip"><span style="font-size:22px">💡</span><div class="small">${G.note} מתחילים בחימום של 5–10 דקות, ומעלים עומס בהדרגה כשמגיעים לקצה העליון של טווח החזרות.</div></div>
    <div class="row" style="margin-top:12px"><button class="btn" id="pAgain" style="flex:1">🔁 תוכנית אחרת</button><button class="btn primary" id="pShare" style="flex:1">📤 שתף / העתק</button></div>
    <p class="footer-note">תוכנית כללית לצורכי לימוד. למתאמן אמיתי – מתאימים לפי הצהרת בריאות, ניסיון ומטרות.</p></div>`);
  bindExit(); $("#pAgain").onclick = programBuilder;
  $("#pShare").onclick = async () => { try { if (navigator.share) await navigator.share({ title: "תוכנית אימון", text }); else { await navigator.clipboard.writeText(text); toast("📋", "התוכנית הועתקה"); } } catch (e) { } };
}
function workoutLog() {
  const wk = weekStart().getTime(), weekMin = S.wlog.filter(w => w.t >= wk).reduce((a, w) => a + w.m, 0);
  const TYPES = [["strength", "🏋️ כוח"], ["cardio", "🏃 אירובי"], ["func", "🤸 פונקציונלי"], ["flex", "🧘 גמישות"], ["sport", "⚽ ספורט"]];
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>📓 יומן האימונים שלי</h2>
    <div class="card"><b>השבוע: ${weekMin} דקות</b><div class="xpbar" style="margin-top:8px"><i style="width:${Math.min(100, pct(weekMin, 150))}%"></i></div><div class="muted xs">היעד המומלץ: 150 דקות פעילות בשבוע</div></div>
    <div class="card"><b class="small">אימון חדש</b>
      <div class="seg wrap" id="wT" style="margin-top:8px">${TYPES.map(([k, n], i) => `<button data-t="${k}" class="${i === 0 ? "on" : ""}">${n}</button>`).join("")}</div>
      <div class="row" style="margin-top:10px"><div style="flex:1"><label class="lbl">דקות</label><input class="search" id="wM" type="number" inputmode="numeric" value="45" min="5" max="300"></div><div style="flex:1"><label class="lbl">כמה קשה (1–10)</label><input class="search" id="wR" type="number" inputmode="numeric" value="7" min="1" max="10"></div></div>
      <button class="btn primary block" id="wAdd" style="margin-top:10px">➕ הוסף אימון (+XP)</button></div>
    <div class="card lb-list">${S.wlog.length ? S.wlog.slice(0, 20).map(w => `<div class="lb-row"><span class="lb-rank">${(TYPES.find(t => t[0] === w.k) || ["", "🏋️"])[1].split(" ")[0]}</span><div class="lb-n"><b>${(TYPES.find(t => t[0] === w.k) || ["", "אימון"])[1].split(" ").slice(1).join(" ")}</b><small>${new Date(w.t).toLocaleDateString("he-IL")} · מאמץ ${w.r}/10</small></div><b class="lb-v">${w.m} דק׳</b></div>`).join("") : `<p class="muted" style="text-align:center">עוד אין אימונים. כל אימון אמיתי שווה XP!</p>`}</div></div>`);
  bindExit();
  let k = "strength"; app.querySelectorAll("#wT button").forEach(b => b.onclick = () => { k = b.dataset.t; app.querySelectorAll("#wT button").forEach(x => x.classList.toggle("on", x === b)); });
  $("#wAdd").onclick = () => {
    const m = Math.max(5, Math.min(300, +$("#wM").value || 0)), r = Math.max(1, Math.min(10, +$("#wR").value || 5));
    S.wlog.unshift({ k, m, r, t: Date.now() }); S.wlog = S.wlog.slice(0, 100);
    const t = today(), gotToday = S.wlogXp && S.wlogXp.d === t ? S.wlogXp.n : 0, xp = Math.max(0, Math.min(30 - gotToday, Math.round(m / 2)));
    S.wlogXp = { d: t, n: gotToday + xp }; if (xp) addXP(xp); addCoins(5, true); touchStreak(); save(); confetti();
    toast("💪", xp ? `אימון נרשם! ‎+${xp} XP` : "אימון נרשם! (הגעת למקסימום XP מאימונים היום)"); workoutLog();
  };
}

/* ═════ סיכום שבועי ═════ */
function weekStats() {
  const days = Array.from({ length: 7 }, (_, k) => ymd(new Date(Date.now() - k * DAY)));
  let n = 0, ok = 0; const t = {};
  days.forEach(d => { const s = S.dayStats[d]; if (!s) return; n += s.n; ok += s.ok; Object.entries(s.t || {}).forEach(([f, [a, b]]) => { t[f] = t[f] || [0, 0]; t[f][0] += a; t[f][1] += b; }); });
  const best = Object.entries(t).filter(([, [a]]) => a >= 5).sort((a, b) => b[1][1] / b[1][0] - a[1][1] / a[1][0])[0];
  const active = days.filter(d => S.dayStats[d] && S.dayStats[d].n).length;
  return { n, ok, acc: n ? Math.round(ok / n * 100) : 0, best: best ? best[0] : null, active, workouts: S.wlog.filter(w => w.t > Date.now() - 7 * DAY).length };
}
function weeklySummary() {
  const w = weekStats();
  sheet(`<div class="wsum"><div class="muted small">📊 7 הימים האחרונים</div><h2>הסיכום השבועי שלך</h2>
    <div class="grid2" style="margin:12px 0"><div class="statbox"><b>${w.n}</b><span>שאלות</span></div><div class="statbox"><b>${w.acc}%</b><span>דיוק</span></div><div class="statbox"><b>${w.active}/7</b><span>ימים פעילים</span></div><div class="statbox"><b>${S.streak.n}🔥</b><span>רצף</span></div></div>
    ${w.best ? `<div class="banner-win">💪 הנושא החזק שלך: ${TOPICS[w.best].icon} ${TOPICS[w.best].name}</div>` : ""}
    ${w.workouts ? `<div class="banner-win">📓 רשמת ${w.workouts} אימונים אמיתיים!</div>` : ""}
    <div class="row" style="margin-top:12px"><button class="btn" data-a="x">סגירה</button><button class="btn primary" data-a="s">📸 שתף בסטורי</button></div></div>`,
    (e, close) => { const a = e.target.dataset.a; if (a === "x") close(); if (a === "s") shareStory({ em: "📊", title: "השבוע שלי במאמן ידע", big: `${w.n} שאלות · ${w.acc}%`, sub: `${w.active}/7 ימים פעילים · רצף ${S.streak.n} 🔥${w.best ? ` · חזק ב${TOPICS[w.best].name}` : ""}` }); });
}
function maybeWeeklySummary() {
  const wk = weekId();
  if (S.wsumSeen === wk || !S.onboarded) return;
  if (new Date().getDay() !== 0 && S.wsumSeen) return;
  S.wsumSeen = wk; save();
  if (weekStats().n >= 10) setTimeout(weeklySummary, 1500);
}

/* ═════ שיתוף בסטורי (תמונה 1080×1920) ═════ */
async function shareStory({ em, title, big, sub }) {
  const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"), g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0f172a"); g.addColorStop(.55, "#4c1d95"); g.addColorStop(1, "#be185d");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .12})`; x.beginPath(); x.arc(Math.random() * W, Math.random() * H, Math.random() * 40 + 5, 0, 7); x.fill(); }
  x.textAlign = "center"; x.direction = "rtl"; x.fillStyle = "#fff";
  x.font = "260px sans-serif"; x.fillText(em, W / 2, 640);
  x.font = "bold 84px sans-serif"; wrapText(x, title, W / 2, 840, 920, 100);
  x.font = "900 110px sans-serif"; x.fillStyle = "#fbbf24"; wrapText(x, big, W / 2, 1100, 960, 120);
  x.font = "52px sans-serif"; x.fillStyle = "rgba(255,255,255,.88)"; wrapText(x, sub, W / 2, 1300, 900, 70);
  x.font = "bold 58px sans-serif"; x.fillStyle = "#fff"; x.fillText("💪 מאמן ידע", W / 2, 1720);
  x.font = "38px sans-serif"; x.fillStyle = "rgba(255,255,255,.7)"; x.fillText(S.name ? S.name : "", W / 2, 1790);
  const blob = await new Promise(r => c.toBlob(r, "image/png")), file = new File([blob], "coach-knowledge.png", { type: "image/png" });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file], title }); } catch (e) { return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "coach-knowledge.png"; a.click(); toast("📸", "התמונה נשמרה – אפשר להעלות לסטורי");
}
function wrapText(x, text, cx, y, maxW, lh) {
  const words = String(text).split(" "); let line = "", lines = [];
  words.forEach(w => { const t = line ? line + " " + w : w; if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
  lines.push(line); lines.forEach((l, i) => x.fillText(l, cx, y + i * lh));
}

/* ═════ קבוצות (דורש לוח עולמי) ═════ */
function groupsSheet() {
  if (!lbOn()) return modal("👥 קבוצות", "קבוצות ולוח 'הכי מהיר היום' יופעלו אחרי חיבור הלוח העולמי (Firebase). ההוראות נמצאות בקובץ README.", "הבנתי", null);
  const { bg } = sheet(`<h2>👥 הקבוצה שלי</h2>${S.group ? `<div class="room-code" dir="ltr">${S.group.split("").map(c => `<span style="width:44px;font-size:26px">${c}</span>`).join("")}</div><p class="muted small" style="text-align:center">שלח את הקוד לחברים מהקורס כדי שיצטרפו</p>
    <div class="col"><button class="btn primary block" data-a="lb">🏆 לוח הקבוצה</button><button class="btn block" data-a="share">📤 הזמן חברים</button><button class="btn block" data-a="leave">🚪 עזוב קבוצה</button></div>` :
    `<p class="muted small">קבוצה = לוח מובילים פרטי לחברים מהקורס, כולל דירוג "הכי מהיר היום" באתגר היומי.</p>
    <div class="col"><button class="btn primary block" data-a="new">✨ צור קבוצה חדשה</button><input class="search code-in" id="gIn" maxlength="5" dir="ltr" placeholder="קוד" style="letter-spacing:6px;text-transform:uppercase"><button class="btn block" data-a="join">הצטרף עם קוד</button></div>`}
    <div class="row" style="margin-top:10px"><button class="btn" data-a="x">סגירה</button></div>`, async (e, close) => {
    const a = e.target.dataset.a; if (!a) return;
    if (a === "x") return close();
    if (a === "new" || a === "join") {
      if (!(await needName())) return;
      const code = a === "new" ? Math.random().toString(36).slice(2, 7).toUpperCase() : (bg.querySelector("#gIn").value || "").trim().toUpperCase();
      if (!/^[A-Z0-9]{5}$/.test(code)) return toast("🔢", "הקוד הוא 5 תווים");
      S.group = code; save(); lbSync(true); close(); toast("👥", a === "new" ? "הקבוצה נוצרה!" : "הצטרפת לקבוצה!"); groupsSheet(); return;
    }
    if (a === "leave") { S.group = ""; save(); lbSync(true); close(); return; }
    if (a === "lb") { close(); renderLeaderboard("group"); return; }
    if (a === "share") { const t = `👥 הצטרפו לקבוצה שלי במאמן ידע! קוד: ${S.group}\n${baseUrl()}?group=${S.group}`; try { if (navigator.share) await navigator.share({ text: t }); else { await navigator.clipboard.writeText(t); toast("📋", "הועתק"); } } catch (x) { } }
  });
}
function groupPostDaily(score) {
  if (!lbOn() || !S.name) return;
  fetch(`${LB_URL.replace(/\/$/, "")}/daily/${today()}/${uidF()}.json`, { method: "PUT", body: JSON.stringify({ n: S.name.slice(0, 24), g: S.group || "", s: score | 0, t: Date.now() }) }).catch(() => { });
}
const _lbSync = lbSync;
lbSync = function (force) {
  if (!lbOn() || !S.name || S.settings.lbHide) return;
  if (!force && Date.now() - lbLast < 90000) return;
  lbLast = Date.now(); ensureLeague();
  const body = { n: S.name.slice(0, 24), xp: S.xp | 0, lv: levelOf(S.xp), st: totalStars(), sp: S.best.speed | 0, sv: S.best.survival | 0, w: (S.duels && S.duels.w) | 0, g: S.group || "", wk: S.lg.wk, wx: S.lg.xp | 0, t: Date.now() };
  fetch(`${LB_URL.replace(/\/$/, "")}/lb/${uidF()}.json`, { method: "PUT", body: JSON.stringify(body) }).catch(() => { });
};
async function lbGroup(body) {
  if (!S.group) { body.innerHTML = `<div class="card" style="text-align:center"><div style="font-size:40px">👥</div><p class="muted">עוד לא הצטרפת לקבוצה.</p><button class="btn primary" id="gOpen">יצירה / הצטרפות</button></div>`; $("#gOpen").onclick = groupsSheet; return; }
  body.innerHTML = `<div class="card"><div class="waiting"><i></i><i></i><i></i><span>טוען את הקבוצה...</span></div></div>`;
  lbSync(true); await new Promise(r => setTimeout(r, 400));
  const base = LB_URL.replace(/\/$/, ""), q = `orderBy=%22g%22&equalTo=%22${S.group}%22`;
  try {
    const [m, d] = await Promise.all([fetch(`${base}/lb.json?${q}`).then(r => r.json()), fetch(`${base}/daily/${today()}.json?${q}`).then(r => r.json())]);
    const wk = weekId(), members = Object.entries(m || {}).map(([id, v]) => ({ id, ...v, wx: v.wk === wk ? v.wx || 0 : 0 })).sort((a, b) => b.wx - a.wx);
    const daily = Object.entries(d || {}).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.s - a.s || a.t - b.t);
    body.innerHTML = `<div class="muted xs" style="font-weight:700;margin:4px 0">⚡ האתגר היומי – היום</div>
      <div class="card lb-list">${daily.length ? daily.map((r, i) => `<div class="lb-row ${r.id === S.uid ? "me" : ""}"><span class="lb-rank">${medal(i)}</span><div class="lb-n"><b>${esc(r.n)}</b><small>${new Date(r.t).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</small></div><b class="lb-v">${r.s}%</b></div>`).join("") : `<p class="muted">עוד אף אחד מהקבוצה לא עשה את האתגר היומי. תהיה הראשון!</p>`}</div>
      <div class="muted xs" style="font-weight:700;margin:12px 0 4px">🏆 XP השבוע · קוד <span dir="ltr">${S.group}</span></div>
      <div class="card lb-list">${members.map((r, i) => `<div class="lb-row ${r.id === S.uid ? "me" : ""}"><span class="lb-rank">${medal(i)}</span><div class="lb-n"><b>${esc(r.n)}</b><small>רמה ${r.lv || 1} · ⭐ ${r.st || 0}</small></div><b class="lb-v" dir="ltr">${r.wx} XP</b></div>`).join("")}</div>
      <button class="btn block" id="gMng" style="margin-top:10px">👥 ניהול קבוצה / הזמנת חברים</button>`;
    $("#gMng").onclick = groupsSheet;
  } catch (e) { body.innerHTML = `<div class="card"><p>לא הצלחנו לטעון את הקבוצה. בדוק את החיבור.</p></div>`; }
}
const _renderLB = renderLeaderboard;
renderLeaderboard = function (k) {
  _renderLB(k === "group" ? "friends" : k);
  if (!lbOn()) return;
  const tabs = $("#lbTabs"); if (!tabs) return;
  tabs.insertAdjacentHTML("afterbegin", `<button data-k="group">👥 קבוצה</button>`);
  tabs.querySelector('[data-k="group"]').onclick = () => renderLeaderboard("group");
  if (k === "group") { tabs.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.k === "group")); lbGroup($("#lbBody")); }
};
(function () { const g = new URLSearchParams(location.search).get("group"); if (g && /^[A-Za-z0-9]{5}$/.test(g)) { history.replaceState(null, "", baseUrl()); setTimeout(() => { if (!lbOn()) return; modal("👥 הוזמנת לקבוצה!", `להצטרף לקבוצה ${g.toUpperCase()}?`, "הצטרף", "לא עכשיו").then(async ok => { if (ok && await needName()) { S.group = g.toUpperCase(); save(); lbSync(true); toast("👥", "הצטרפת לקבוצה!"); } }); }, 1200); } })();

/* ═════ מסכי הבית (מסודרים) ═════ */
function fillFunTop() {
  const el = $("#funTop"); if (!el) return;
  ensureLeague(); ensureSeason(); petTick();
  const L = LEAGUES[S.lg.tier], rows = leagueRows(), rank = rows.findIndex(r => r.me) + 1, sTier = Math.min(SS_TIERS, Math.floor(S.ss.xp / SS_STEP));
  const [face] = petMood();
  el.innerHTML = `${isWeekend() ? `<div class="event-banner">🎉 סוף שבוע: כל המטבעות כפולים!</div>` : ""}
    <div class="status-row">
      <button class="st-av" id="ftAv" title="המאמן שלי">${avatarSvg(S.av, 44)}</button>
      <button class="st-pet" id="ftPet" title="חיית המחמד"><span>${petEm()}</span>${S.pet ? `<i>${face}</i>` : `<i>➕</i>`}</button>
      <button class="ft-chip" id="ftLg" style="--lc:${L.col}">${L.em} ${L.n} · #${rank}</button>
      <button class="ft-chip" id="ftSs">🎟️ ${sTier}/${SS_TIERS}</button>
    </div>`;
  $("#ftAv").onclick = avatarSheet; $("#ftPet").onclick = petSheet; $("#ftLg").onclick = leaguePage; $("#ftSs").onclick = seasonPage;
  maybeWeeklySummary();
}
function chip(id, em, label, sub, hot) { return `<button class="t-chip ${hot ? "hot" : ""}" data-chip="${id}"><span class="em">${em}</span><b>${label}</b><small>${sub}</small></button>`; }
function fillToday() {
  const el = $("#todayRow"); if (!el) return;
  const d = S.daily[today()], ex = exToday(), tod = topicOfDay();
  let html = chip("daily", d ? "✅" : "🏆", "אתגר יומי", d ? d.score + "%" : "5 שאלות", !d);
  if (PLAY()) {
    const m = missions(), done = m.list.filter(x => x.done).length;
    html += chip("wheel", "🎡", "גלגל מזל", wheelReady() ? "סיבוב חינם!" : "מחר", wheelReady());
    html += chip("missions", "🎯", "משימות", m.claimed ? "הושלמו ✓" : `${done}/3`, done === 3 && !m.claimed);
    html += chip("tod", TOPICS[tod].icon, "נושא היום", "‎+5 XP", false);
  } else {
    const due = dueQuestions().length;
    html += chip("term", "📖", "מונח היום", "הקש לגלות", false);
    html += chip("due", "🔁", "חזרה חכמה", due ? due + " מחכות" : "הכל מעודכן", due > 0);
    html += chip("food", "🍽️", "כמה יש באוכל?", "קלוריות וחלבון", false);
  }
  html += chip("ex", ex.em, "תרגיל היום", S.exDone === today() ? "בוצע ✓" : "‎+15 🪙", S.exDone !== today());
  el.innerHTML = html;
  const act = { daily: () => d ? toast("✅", "כבר השלמת את האתגר היום") : startMode("daily"), wheel: wheelSheet, missions: missionsSheet, tod: () => startMode("topic", { f: tod }),
    term: termOfDaySheet, due: () => startMode("due"), food: () => go("tools", { seg: "food" }), ex: exerciseSheet };
  el.querySelectorAll("[data-chip]").forEach(b => b.onclick = () => act[b.dataset.chip]());
}
function missionsSheet() {
  const { bg } = sheet(`${missionsCard()}<div class="row" style="margin-top:8px"><button class="btn" data-a="x">סגירה</button></div>`, (e, close) => { if (e.target.dataset.a) close(); });
  const c = bg.querySelector("#chestBtn"); c && (c.onclick = () => { bg.remove(); openChest(); });
}
function termOfDaySheet() {
  const [term, def] = GLOSSARY[parseInt(hash("term" + today()), 36) % GLOSSARY.length];
  sheet(`<div style="text-align:center"><div class="muted small">📖 מונח היום</div><h2>${esc(term)}</h2></div><p style="font-size:16px;line-height:1.7">${linkTerms(def)}</p>
    <div class="row"><button class="btn" data-a="x">סגירה</button><button class="btn primary" data-a="q">מבחן מונחים ←</button></div>`, (e, close) => { const a = e.target.dataset.a; if (a === "x") close(); if (a === "q") { close(); startMode("terms"); } });
}
function hubBtn(id, em, n, sub, lock) { return `<button class="mode fun-mode ${lock ? "locked" : ""}" data-fun="${id}"><span class="em">${lock ? "🔒" : em}</span><b>${n}</b><span>${lock || sub}</span></button>`; }
function gamesPage() {
  const L = levelOf(S.xp);
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>🎪 משחקים</h2>
    <div class="section-title"><h2>⚔️ זירה</h2></div>
    <div class="grid2">
      ${hubBtn("quick", "🎲", "סיבוב אקראי", "10 שאלות ברמה שלך")}
      ${hubBtn("speed", "⚡", "מבחן מהירות", `60 שניות · שיא ${S.best.speed}`)}
      ${hubBtn("survival", "❤️", "הישרדות", `3 טעויות · שיא ${S.best.survival}`)}
      ${hubBtn("sudden", "💀", "מוות פתאומי", `טעות אחת · שיא ${S.best.sudden}`, L < 8 ? `נפתח ברמה 8 (אתה ${L})` : "")}
      ${hubBtn("challenge", "🤝", "אתגר חבר", "שולחים קישור")}
      ${hubBtn("duel", "⚔️", "דו־קרב", "אונליין או טלפון")}
    </div>
    <div class="section-title"><h2>🧩 מצבים מיוחדים</h2></div>
    <div class="grid2">
      ${hubBtn("who", "🕵️", "מי אני?", `3 רמזים · שיא ${S.best.whoami}`)}
      ${hubBtn("swipe", "👆", "נכון/לא נכון מהיר", `שיא ${S.best.swipe}`)}
      ${hubBtn("story", "🎬", "המאמן בשטח", "סיפורים עם החלטות")}
      ${hubBtn("img", "🖼️", "אתגר תמונה", "זהה מה באיור")}
      ${hubBtn("guess", "🎯", "נחש את המספר", "קלוריות ו־1RM")}
      ${hubBtn("terms", "📖", "מבחן מונחים", "10 מושגים")}
    </div></div>`);
  bindExit(); bindFun(app);
}
function collectionsPage() {
  ensureWQ(); ensureLeague();
  const wqDone = WQ.filter(([k, n]) => S.wq.p[k] >= n && !S.wq.claimed.includes(k)).length, Lg = LEAGUES[S.lg.tier];
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>🎁 אוספים והתקדמות</h2>
    <div class="grid2" style="margin-top:12px">
      ${hubBtn("league", Lg.em, "ליגה שבועית", `ליגת ${Lg.n}`)}
      ${hubBtn("season", "🎟️", "מסלול העונה", "30 דרגות בחודש")}
      ${hubBtn("quests", "📅", "משימות השבוע", wqDone ? `${wqDone} פרסים מחכים! 🎁` : "פרס גדול כל שבוע")}
      ${hubBtn("album", "🃏", "אלבום קלפים", `${Object.keys(S.cards).length}/${CARDS.length}`)}
      ${hubBtn("avatar", "🧍", "אווטאר", "בגדים וציוד")}
      ${hubBtn("pet", petEm(), "חיית מחמד", S.pet ? esc(S.pet.name) : "בחר אחת")}
      ${hubBtn("upgrades", "⬆️", "שדרוגים", "לב רביעי, זמן, מטבעות")}
      ${hubBtn("shop", "🛒", "חנות עזרים", `🪙 ${S.coins}`)}
      ${hubBtn("lb", "🏆", "לוח מובילים", "חברים ושיאים")}
      ${hubBtn("summary", "📊", "סיכום שבועי", "ושיתוף בסטורי")}
      ${lbOn() ? hubBtn("groups", "👥", "קבוצות", S.group ? "קבוצה " + S.group : "לוח לחברים") : ""}
    </div>
    <div class="music-row"><span>🎵 מוזיקת רקע</span><label class="switch"><input type="checkbox" id="musicSw" ${S.settings.music ? "checked" : ""}><i></i></label></div></div>`);
  bindExit(); bindFun(app);
  $("#musicSw").onchange = e => toggleMusic(e.target.checked);
}
function moreModesSheet() {
  const L = levelOf(S.xp);
  const items = [["speed", "⚡", "מבחן מהירות"], ["survival", "❤️", "הישרדות"], ["challenge", "🤝", "אתגר חבר"], ["duel", "⚔️", "דו־קרב"], ["terms", "📖", "מבחן מונחים"], ["why", "🤔", "למה זה נכון?"],
    ["img", "🖼️", "אתגר תמונה"], ["story", "🎬", "המאמן בשטח"], ["guess", "🎯", "נחש את המספר"], ["custom", "🛠️", "מבחן מותאם אישית"], ["program", "📋", "בונה תוכנית"], ["log", "📓", "יומן אימונים"], ["lb", "🏆", "לוח מובילים"]];
  const { bg } = sheet(`<div style="max-height:74vh;overflow:auto"><h2>➕ עוד דרכים לתרגל</h2><div class="more-grid">${items.map(([k, em, n]) => `<button data-fun="${k}"><span>${em}</span>${n}</button>`).join("")}</div></div>
    <div class="row"><button class="btn" data-a="x">סגירה</button></div>`, (e, close) => { if (e.target.dataset.a) close(); else if (e.target.closest("[data-fun]")) close(); });
  bindFun(bg);
}
function fillFunHub() { }
function fillFunLearn() { }
function bindFun(el) {
  const map = { who: whoAmI, swipe: swipeTF, story: storiesPage, sudden: () => startMode("sudden"), img: () => startMode("img"), guess: () => sheet(`<h2>🎯 נחש את המספר</h2><div class="duel-opts"><button class="duel-opt" data-g="cal"><span>🍽️</span><div><b>נחש את הקלוריות</b><small>כמה קלוריות יש במנה?</small></div></button><button class="duel-opt" data-g="rm"><span>🏋️</span><div><b>נחש את ה־1RM</b><small>משקל × חזרות → מקסימום</small></div></button></div>`, (e, close) => { const b = e.target.closest("[data-g]"); if (b) { close(); guessGame(b.dataset.g); } }),
    quests: questsPage, album: albumPage, upgrades: upgradesSheet, avatar: avatarSheet, summary: weeklySummary, groups: groupsSheet, ex: exerciseSheet,
    coach: coachSession, flash: flashSwipe, why: whyMode, program: programBuilder, log: workoutLog,
    quick: () => startMode("quick"), speed: () => startMode("speed"), survival: () => startMode("survival"), challenge: () => startMode("challenge"), terms: () => startMode("terms"),
    duel: () => duelMenu(), league: leaguePage, season: seasonPage, pet: petSheet, shop: shopSheet, lb: () => renderLeaderboard(), custom: () => go("practice") };
  el.querySelectorAll("[data-fun]").forEach(b => b.onclick = () => { if (b.classList.contains("locked")) return toast("🔒", "עלה עוד כמה רמות כדי לפתוח"); map[b.dataset.fun] && map[b.dataset.fun](); });
}

/* הפעלה ראשונה */
nightCheck();
if (S.settings.music === undefined) S.settings.music = false;
if (tab === "home" && !session && document.querySelector("#app") && !document.querySelector(".modal-bg")) { try { renderHome(); } catch (e) { } }
