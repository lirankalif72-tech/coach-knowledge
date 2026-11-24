/* ═════════ v9.2 – ארקייד חדש: Fit Royale + Myth Defense ═════════
   שני משחקים בסגנון קרטוני צבעוני, במסך מלא, עם צלילים, דמויות לקנייה,
   אתגר יומי וחזרה על הטעויות בסוף כל משחק. */

/* ───── עזרים משותפים ───── */
const GT = (he, en) => (typeof isEn === "function" && isEn()) ? en : he;
const AR_SKINS = [
  { em: "🙂", p: 0 }, { em: "🦊", p: 80 }, { em: "🐼", p: 120 }, { em: "🐯", p: 150 }, { em: "🐸", p: 180 },
  { em: "🤖", p: 220 }, { em: "🦄", p: 280 }, { em: "🐲", p: 350 }, { em: "🦁", p: 450 }, { em: "👑", p: 600 }
];
function ensureArcade() {
  if (S.tc) delete S.tc;
  if (S.best && "blast" in S.best) delete S.best.blast;
  const A = S.arc = S.arc || {};
  A.skin = A.skin || "🙂";
  A.owned = A.owned || ["🙂"];
  A.towers = A.towers || ["bar", "shake"];
  A.roy = A.roy || { p: 0, w: 0, best: 0, t10: 0 };
  A.md = A.md || { stars: [0, 0, 0], wins: 0 };
  A.daily = A.daily || { d: "", done: false };
  A.seen = A.seen || [];
}
ensureArcade();

/* צלילים קצרים שנבנים בזמן אמת – בלי קבצים */
const SFX_T = {};
function sfx(n) {
  if (!S.settings || !S.settings.sound) return;
  const now = performance.now(), gap = { shoot: 90, zap: 90, hit: 60, pop: 45, elim: 50, tick: 200 }[n] || 20;
  if (SFX_T[n] && now - SFX_T[n] < gap) return;
  SFX_T[n] = now;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const t0 = actx.currentTime;
    const tone = (f1, f2, d, type = "sine", v = 0.1, at = 0) => {
      const o = actx.createOscillator(), g = actx.createGain(), t = t0 + at;
      o.type = type; o.frequency.setValueAtTime(f1, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + 0.03);
    };
    const noise = (d, v, f) => {
      const len = Math.floor(actx.sampleRate * d), b = actx.createBuffer(1, len, actx.sampleRate), ch = b.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = actx.createBufferSource(), fl = actx.createBiquadFilter(), g = actx.createGain();
      s.buffer = b; fl.type = "lowpass"; fl.frequency.value = f; g.gain.value = v;
      s.connect(fl).connect(g).connect(actx.destination); s.start(t0);
    };
    ({
      tap: () => tone(880, 0, 0.05, "sine", 0.06),
      shoot: () => tone(520, 260, 0.08, "square", 0.025),
      zap: () => tone(1400, 300, 0.1, "sawtooth", 0.03),
      hit: () => tone(180, 90, 0.06, "triangle", 0.06),
      pop: () => tone(380, 900, 0.1, "sine", 0.07),
      coin: () => { tone(990, 0, 0.07, "square", 0.035); tone(1320, 0, 0.12, "square", 0.035, 0.07); },
      ok: () => { tone(660, 0, 0.09, "sine", 0.1); tone(990, 0, 0.14, "sine", 0.1, 0.08); },
      no: () => tone(260, 170, 0.2, "triangle", 0.12),
      tick: () => tone(1500, 0, 0.03, "square", 0.03),
      boom: () => { noise(0.45, 0.3, 700); tone(120, 40, 0.4, "sine", 0.15); },
      elim: () => tone(500, 120, 0.16, "sawtooth", 0.03),
      win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0, 0.2, "triangle", 0.1, i * 0.11)),
      lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0, 0.24, "triangle", 0.1, i * 0.16)),
      build: () => tone(300, 640, 0.1, "square", 0.045),
      leak: () => tone(220, 90, 0.25, "sawtooth", 0.06),
      wave: () => [440, 554, 659].forEach((f, i) => tone(f, 0, 0.12, "square", 0.04, i * 0.08)),
      crate: () => { noise(0.15, 0.12, 2000); tone(600, 1200, 0.15, "sine", 0.06, 0.05); },
    })[n]?.();
  } catch (e) { }
}
function vib(p) { if (S.settings && S.settings.vib && navigator.vibrate) try { navigator.vibrate(p); } catch (e) { } }

/* מסך מלא: מסתיר את הסרגל העליון, ובדפדפן גם נכנס למסך מלא אמיתי */
function arcFull(on) {
  document.body.classList.toggle("arc-full", on);
  try {
    const app_ = matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches;
    if (on && !app_ && !document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => { });
    if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => { });
  } catch (e) { }
}
function arcStop() {
  if (RY) { clearInterval(RY.t); clearTimeout(RY.auto); RY.over = true; RY = null; }
  if (MD) { cancelAnimationFrame(MD.raf); MD.over = true; MD = null; }
}

/* שאלות */
let GQ_RECENT = [];
const gqOkType = q => (q.t === "mc" || q.t === "tf") && !q.img;
function gqPick(filter) {
  const ok = q => gqOkType(q) && !GQ_RECENT.includes(q.id) && (!filter || filter(q));
  let pool = [];
  if (!filter && Math.random() < 0.25) pool = mistakes().filter(ok);
  if (!pool.length) pool = freshSort(BANK.filter(ok), true).slice(0, 25);
  if (!pool.length) pool = BANK.filter(q => gqOkType(q) && (!filter || filter(q)));
  if (!pool.length) pool = BANK.filter(gqOkType);
  const q = pool[Math.floor(Math.random() * Math.min(pool.length, 8))];
  GQ_RECENT.push(q.id); GQ_RECENT = GQ_RECENT.slice(-40);
  return q;
}
function gqOptions(q) {
  return q.t === "tf" ? [[GT("נכון", "True"), true], [GT("לא נכון", "False"), false]] : shuffle(q.o.map((o, i) => [o, i]));
}
function gqRight(q) { return q.t === "tf" ? (q.a ? GT("נכון", "True") : GT("לא נכון", "False")) : q.o[q.a]; }
const gqBtns = opts => `<div class="ry-opts ${opts.length === 2 ? "two" : ""}">${opts.map(([t], i) => `<button class="ry-o c${i}" data-i="${i}"><span>${"▲◆●■"[i]}</span><b>${esc(t)}</b></button>`).join("")}</div>`;

/* שאלה בחלון קופץ. cb(ok, q, pickText) */
function gqAsk(title, cb, given) {
  const q = given || gqPick(), opts = gqOptions(q);
  const h = sheet(`<div class="gq" data-notr><div class="gq-title">${title}</div><div class="ry-q">${esc(q.q)}</div>${gqBtns(opts)}<div id="gqFb"></div></div>`, (e, close) => {
    const b = e.target.closest(".ry-o");
    if (!b || h.bg.dataset.done) return;
    h.bg.dataset.done = 1;
    const i = +b.dataset.i, ok = opts[i][1] === q.a;
    record(q, ok ? 1 : 0); save(); sfx(ok ? "ok" : "no"); vib(ok ? 20 : [40, 50, 40]);
    h.bg.querySelectorAll(".ry-o").forEach((x, j) => { x.disabled = true; x.classList.add(opts[j][1] === q.a ? "ok" : "dim"); });
    if (!ok) b.classList.replace("dim", "no");
    $("#gqFb").innerHTML = `<div class="ry-fb ${ok ? "ok" : "no"}"><div class="ry-fb-h">${ok ? GT("✓ נכון!", "✓ Correct!") : GT("✗ התשובה: ", "✗ Answer: ") + esc(gqRight(q))}</div>
      <div class="ry-e">💡 ${esc(q.e)}</div><button class="arc-btn go" id="gqGo">${GT("המשך", "Continue")}</button></div>`;
    $("#gqGo").onclick = () => { close(); cb(ok, q, opts[i][0]); };
  });
  h.bg.addEventListener("click", e => { if (e.target === h.bg) e.stopImmediatePropagation(); }, true);
}

/* אתגר יומי – מתחלף בין שני המשחקים */
const dailyKind = () => dayOfYear() % 2 ? "md" : "roy";
const dailyDone = () => S.arc.daily.d === today() && S.arc.daily.done;
function dailyWin() { if (dailyDone()) return 0; S.arc.daily = { d: today(), done: true }; addCoins(100, true); return 100; }
function dailyStart() {
  if (dailyDone()) { toast("✅", GT("כבר השלמת את האתגר היום – נתראה מחר", "You already finished today's challenge – see you tomorrow")); return; }
  dailyKind() === "roy" ? royaleStart(true) : mdStart(dayOfYear() % 3, true);
}
function dailyDesc() {
  if (dailyKind() === "roy") { const t = TOPICS[topicOfDay()]; return GT(`רויאל רק על ${t.name} ${t.icon} · סיים בטופ 10`, `Royale on ${t.name} ${t.icon} only · finish top 10`); }
  return GT("6 גלים קשים במיוחד · שרוד את כולם", "6 extra-hard waves · survive them all");
}

/* מסך תוצאות משותף */
function arcResult(o) {
  funScreen(`<div class="arc arc-res fade-in" data-notr><div class="arc-res-card ${o.gold ? "gold" : ""}">
    <div class="arc-res-em">${o.em}</div>
    ${o.big ? `<div class="arc-res-big" dir="ltr">${o.big}</div>` : ""}
    <h1>${o.title}</h1>
    ${o.banner ? `<div class="arc-banner">${o.banner}</div>` : ""}
    <div class="arc-stats">${o.stats.map(([b, s]) => `<div><b dir="ltr">${b}</b><span>${s}</span></div>`).join("")}</div>
    ${o.wrong.length ? `<button class="arc-btn warn" id="arRev">📝 ${GT("חזרה על הטעויות", "Review my mistakes")} (${o.wrong.length})</button>` : `<div class="arc-perfect">✨ ${GT("בלי אף טעות!", "Not a single mistake!")}</div>`}
    <button class="arc-btn go" id="arAgain">🔁 ${GT("עוד משחק", "Play again")}</button>
    <button class="arc-btn" id="arHub">🎮 ${GT("לארקייד", "Arcade")}</button>
  </div></div>`);
  arcFull(true);
  const me = () => arcResult(o);
  $("#arAgain").onclick = o.again; $("#arHub").onclick = arcadeHub;
  const r = $("#arRev"); if (r) r.onclick = () => arcReview(o.wrong, me);
}

/* חזרה על טעויות מהמשחק + תיקון */
function arcReview(list, back) {
  funScreen(`<div class="arc fade-in" data-notr>
    <div class="arc-top"><button class="arc-x" id="fx">✕</button><b class="arc-title">📝 ${GT("הטעויות שלך", "Your mistakes")}</b></div>
    ${list.map(({ q, pick }) => `<div class="arc-rev"><div class="arc-rev-q">${esc(q.q)}</div>
      <div class="arc-rev-no">${pick != null ? "✗ " + esc(pick) : "⏱️ " + GT("נגמר הזמן", "Time ran out")}</div>
      <div class="arc-rev-ok">✓ ${esc(gqRight(q))}</div><div class="arc-rev-e">💡 ${esc(q.e)}</div></div>`).join("")}
    <button class="arc-btn go" id="rvTry">🔁 ${GT("נסה אותן שוב", "Try them again")}</button>
    <button class="arc-btn" id="rvBack">${GT("חזרה", "Back")}</button></div>`);
  arcFull(true);
  $("#fx").onclick = $("#rvBack").onclick = back;
  $("#rvTry").onclick = () => {
    let i = 0, ok = 0;
    const next = () => {
      if (i >= list.length) {
        if (ok) { addCoins(ok * 3, true); save(); }
        toast("🎯", GT(`תיקנת ${ok} מתוך ${list.length}`, `You fixed ${ok} of ${list.length}`) + (ok ? ` · +${ok * 3} 🪙` : ""));
        return back();
      }
      gqAsk(`🔁 ${GT("תיקון", "Retry")} ${i + 1}/${list.length}`, r => { if (r) ok++; i++; next(); }, list[i].q);
    };
    next();
  };
}

/* ═════════ מסך הארקייד ═════════ */
function arcadeHub() {
  ensureArcade(); arcStop();
  const A = S.arc, dd = dailyDone(), stars = A.md.stars.reduce((a, b) => a + b, 0);
  funScreen(`<div class="arc arc-hub fade-in" data-notr>
    <div class="arc-top"><button class="arc-x" id="fx">✕</button><b class="arc-title">🎮 ${GT("ארקייד", "Arcade")}</b><span class="arc-coins">🪙 <b>${S.coins}</b></span></div>
    <button class="arc-me" id="hbShop"><span class="arc-av">${A.skin}</span><div><b>${esc(S.name || GT("השחקן שלך", "Your player"))}</b><small>${GT("דמויות ומגדלים חדשים בחנות", "New characters and towers in the shop")}</small></div><span class="arc-shopbtn">🛒</span></button>
    <button class="arc-daily ${dd ? "done" : ""}" id="hbDaily"><span class="arc-daily-em">📅</span><div><b>${GT("אתגר יומי", "Daily challenge")}: ${dailyKind() === "roy" ? "Fit Royale" : "Myth Defense"}</b><small>${dd ? GT("הושלם היום – אתגר חדש מחר", "Done today – a new one tomorrow") : dailyDesc()}</small></div><i>${dd ? "✅" : "+100 🪙"}</i></button>
    <button class="arc-game arc-roy" id="hbRoy"><div class="arc-game-art">👑<span>👥 50</span></div><div class="arc-game-tx"><b>Fit Royale</b><small>${GT("50 שחקנים, שאלה בכל סיבוב. טעית – בחוץ. האחרון שנשאר מנצח!", "50 players, one question per round. Miss it – you're out. Last one standing wins!")}</small><i>🏆 ${A.roy.w} ${GT("ניצחונות", "wins")} · ${GT("שיא", "Best")} ${A.roy.best ? "#" + A.roy.best : "–"}</i></div></button>
    <button class="arc-game arc-md" id="hbMD"><div class="arc-game-art">🏰<span>👾👻</span></div><div class="arc-game-tx"><b>Myth Defense</b><small>${GT("מיתוסים על כושר תוקפים את חדר הכושר. בונים מגדלים, ותשובות נכונות נותנות זהב.", "Fitness myths attack the gym. Build towers – right answers give gold.")}</small><i>⭐ ${stars}/9</i></div></button>
  </div>`);
  arcFull(true);
  $("#fx").onclick = () => { arcFull(false); go("home"); };
  $("#hbShop").onclick = () => arcShop(arcadeHub);
  $("#hbDaily").onclick = dailyStart; $("#hbRoy").onclick = () => royaleStart(false); $("#hbMD").onclick = mdMenu;
}

/* ═════════ חנות: דמויות ומגדלים ═════════ */
function arcShop(back) {
  const A = S.arc;
  const draw = () => {
    funScreen(`<div class="arc fade-in" data-notr>
      <div class="arc-top"><button class="arc-x" id="fx">✕</button><b class="arc-title">🛒 ${GT("חנות הארקייד", "Arcade shop")}</b><span class="arc-coins">🪙 <b>${S.coins}</b></span></div>
      <div class="arc-h">${GT("הדמות שלך", "Your character")}</div>
      <p class="arc-sub">${GT("מופיעה ברויאל ושומרת על חדר הכושר במשחק המגדלים", "Shows up in Royale and guards the gym in Myth Defense")}</p>
      <div class="arc-skins">${AR_SKINS.map(s => { const own = A.owned.includes(s.em), on = A.skin === s.em;
        return `<button class="arc-skin ${on ? "on" : ""} ${own ? "own" : ""}" data-s="${s.em}"><span>${s.em}</span><i>${on ? "✓" : own ? GT("בחר", "Use") : "🪙" + s.p}</i></button>`; }).join("")}</div>
      <div class="arc-h">${GT("מגדלים", "Towers")}</div>
      ${Object.entries(MD_TW).map(([k, T]) => { const own = A.towers.includes(k);
        return `<div class="arc-trow"><span class="arc-tem" style="--c:${T.c}">${T.em}</span><div><b>${GT(T.he, T.en)}</b><small>${GT(T.dhe, T.den)}</small></div>${own ? `<i class="arc-own">✅</i>` : `<button class="arc-buy ${S.coins >= T.lock ? "" : "poor"}" data-t="${k}">🪙 ${T.lock}</button>`}</div>`; }).join("")}
      <p class="arc-sub">${GT("מטבעות מרוויחים בכל המשחקים באפליקציה.", "You earn coins in every game in the app.")}</p>
    </div>`);
    arcFull(true);
    $("#fx").onclick = back;
    app.querySelectorAll("[data-s]").forEach(b => b.onclick = () => {
      const s = AR_SKINS.find(x => x.em === b.dataset.s);
      if (!A.owned.includes(s.em)) {
        if (S.coins < s.p) { sfx("no"); return toast("🪙", GT("אין מספיק מטבעות", "Not enough coins")); }
        addCoins(-s.p, true); A.owned.push(s.em); sfx("coin"); confetti();
      } else sfx("tap");
      A.skin = s.em; save(); draw();
    });
    app.querySelectorAll("[data-t]").forEach(b => b.onclick = () => {
      const k = b.dataset.t, T = MD_TW[k];
      if (S.coins < T.lock) { sfx("no"); return toast("🪙", GT("אין מספיק מטבעות", "Not enough coins")); }
      addCoins(-T.lock, true); A.towers.push(k); save(); sfx("coin"); confetti(); toast(T.em, GT("מגדל חדש נפתח!", "New tower unlocked!")); draw();
    });
  };
  draw();
}

/* ═════════ 1. Fit Royale ═════════ */
const RY_N = 50;
const RY_BOT_EM = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐤", "🦆", "🦉", "🐺", "🐴", "🦄", "🐝", "🐢", "🐙", "🦀", "🐬", "🐳", "🦈", "🐊", "🦓", "🦒", "🐘", "🦔", "🦦", "🦩", "🦜", "🐞", "🦋"];
const RY_COL = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#34d399", "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6"];
const RY_NAMES = {
  he: ["נועה", "איתי", "מאיה", "יונתן", "תמר", "עומר", "שירה", "דניאל", "יעל", "אורי", "רוני", "אליה", "נועם", "הילה", "גיא", "ליה", "עידו", "טל", "אביב", "מיכל", "בן", "שני", "רועי", "עדי", "אלון", "קרן", "ניר", "דנה", "יובל", "מור", "אסף", "ליאור", "ענבל", "שחר", "רז", "עמית", "הדר", "ירדן", "אופיר", "סהר", "אייל", "גלי", "דור", "נגה", "יהב", "תום", "עלמה", "איתן", "רוני ש."],
  en: ["Ava", "Leo", "Mia", "Noah", "Zoe", "Max", "Lily", "Sam", "Ella", "Jake", "Ruby", "Finn", "Ivy", "Owen", "Nina", "Kai", "Luna", "Eli", "Maya", "Theo", "Aria", "Ben", "Cleo", "Dan", "Gwen", "Hugo", "Iris", "Jay", "Kira", "Liam", "Omar", "Pia", "Quinn", "Rex", "Sara", "Tom", "Uma", "Vic", "Will", "Yara", "Zack", "Amy", "Bo", "Cal", "Dex", "Eve", "Fay", "Gus", "Hana"]
};
const RY_ITEM = { shield: "🛡️", fifty: "✂️", plus: "⏱️", coins: "🪙" };
const ryItemName = k => ({ shield: GT("מגן", "Shield"), fifty: "50/50", plus: GT("+5 שניות", "+5 seconds"), coins: "+15 🪙" })[k];
let RY = null;
const ryBots = () => RY.P.filter((p, i) => i > 0 && p.alive).length;

function royaleStart(daily) {
  ensureArcade(); arcStop();
  const names = shuffle(RY_NAMES[GT("he", "en")]), em = shuffle(RY_BOT_EM);
  const P = [{ me: 1, n: GT("אתה", "You"), em: S.arc.skin, c: "#fde047", alive: true }];
  for (let i = 1; i < RY_N; i++) P.push({ n: names[(i - 1) % names.length], em: em[(i - 1) % em.length], c: RY_COL[i % RY_COL.length], alive: true });
  RY = { P, daily: !!daily, topic: daily ? topicOfDay() : null, round: 0, shield: 1, fifty: 1, plus: 0, right: 0, streak: 0, best: 0, wrong: [], bonus: 0, over: false };
  funScreen(`<div class="arc ry" data-notr>
    <div class="arc-top"><button class="arc-x" id="fx">✕</button>
      <div class="ry-alive"><b id="ryAlive">${RY_N}</b><small>${GT("שחקנים", "players")}</small></div>
      ${daily ? `<span class="ry-tag">📅 ${TOPICS[RY.topic].icon}</span>` : ""}
      <div class="ry-round" id="ryRound">${GT("מתחילים...", "Starting...")}</div></div>
    <div class="ry-arena" id="ryArena"><div class="ry-storm" id="ryStorm"></div>
      ${P.map((p, i) => `<span class="ry-p ${p.me ? "me" : ""}" data-i="${i}" style="--c:${p.c};animation-delay:${(i * 0.018).toFixed(3)}s">${p.em}</span>`).join("")}</div>
    <div class="ry-feed" id="ryFeed">${GT("👥 50 שחקנים נכנסו לזירה!", "👥 50 players entered the arena!")}</div>
    <div class="ry-card ry-wait" id="ryCard"><div class="ry-count" id="ryCount">3</div></div>
  </div>`);
  arcFull(true);
  $("#fx").onclick = () => { if (RY && RY.round && !RY.over) { if (!confirm(GT("לצאת מהמשחק? תפסיד את הסיבוב.", "Leave the match? You'll lose this run."))) return; } arcStop(); arcadeHub(); };
  sfx("wave");
  let n = 3; const me = RY;
  const cd = setInterval(() => {
    if (RY !== me) return clearInterval(cd);
    n--; sfx("tick");
    if (n > 0) { $("#ryCount").textContent = n; $("#ryCount").style.animation = "none"; void $("#ryCount").offsetWidth; $("#ryCount").style.animation = ""; }
    else { clearInterval(cd); ryRound(); }
  }, 700);
}

function ryStorm() {
  const r = (ryBots() + 1) / RY_N;
  $("#ryStorm").style.setProperty("--s", (40 + 110 * r).toFixed(0) + "%");
  $("#ryAlive").textContent = ryBots() + (RY.P[0].alive ? 1 : 0);
}

function ryRound() {
  if (!RY || RY.over) return;
  RY.round++; RY.lock = false;
  const q = gqPick(RY.topic ? (x => x.f === RY.topic) : null), opts = gqOptions(q);
  RY.q = q; RY.opts = opts;
  RY.time = RY.daily ? 11 : Math.max(9, 16 - RY.round * 0.6);
  RY.end = performance.now() + RY.time * 1000; RY.lastTick = 99;
  $("#ryRound").textContent = GT("סיבוב ", "Round ") + RY.round;
  ryStorm();
  const card = $("#ryCard"); card.className = "ry-card"; void card.offsetWidth;
  card.innerHTML = `<div class="ry-timer" dir="ltr"><i id="ryBar"></i><b id="ryT">${Math.ceil(RY.time)}</b></div>
    <div class="ry-q">${esc(q.q)}</div>${gqBtns(opts)}
    <div class="ry-pw" id="ryPw">
      <button class="ry-pb" id="ryFifty" ${RY.fifty && q.t === "mc" ? "" : "disabled"}>✂️ 50/50 <i>${RY.fifty}</i></button>
      <button class="ry-pb" id="ryPlus" ${RY.plus ? "" : "disabled"}>⏱️ +5 <i>${RY.plus}</i></button>
      <span class="ry-sh ${RY.shield ? "on" : ""}">🛡️ <i>${RY.shield}</i></span></div>`;
  card.querySelectorAll(".ry-o").forEach(b => b.onclick = () => ryAnswer(+b.dataset.i));
  $("#ryFifty").onclick = () => {
    if (!RY.fifty || RY.lock) return;
    RY.fifty--; sfx("tap");
    const wrongIdx = shuffle(opts.map((o, i) => i).filter(i => opts[i][1] !== q.a)).slice(0, 2);
    wrongIdx.forEach(i => card.querySelector(`.ry-o[data-i="${i}"]`).classList.add("gone"));
    $("#ryFifty").disabled = true;
  };
  $("#ryPlus").onclick = () => { if (!RY.plus || RY.lock) return; RY.plus--; RY.end += 5000; sfx("tap"); $("#ryPlus").disabled = !RY.plus; $("#ryPlus i").textContent = RY.plus; };
  clearInterval(RY.t); RY.t = setInterval(ryTick, 100); ryTick();
}
function ryTick() {
  if (!RY || RY.lock) return;
  const left = Math.max(0, (RY.end - performance.now()) / 1000), bar = $("#ryBar");
  if (!bar) return;
  bar.style.transform = `scaleX(${Math.min(1, left / RY.time)})`;
  bar.classList.toggle("low", left < 4);
  $("#ryT").textContent = Math.ceil(left);
  if (left < 4 && Math.ceil(left) !== RY.lastTick) { RY.lastTick = Math.ceil(left); sfx("tick"); }
  if (left <= 0) ryAnswer(-1);
}
function ryElims() {
  const alive = RY.P.map((p, i) => i).filter(i => i > 0 && RY.P[i].alive);
  let p = Math.max(0.42, 0.8 - 0.035 * (RY.round - 1)) - (RY.daily ? 0.03 : 0);
  if (RY.round >= 12) p = 0.4;
  let out = alive.filter(() => Math.random() > p);
  if (!out.length && alive.length > 1) out = [alive[Math.floor(Math.random() * alive.length)]];
  return { out, alive: alive.length };
}
function ryAnswer(i) {
  if (!RY || RY.lock) return;
  RY.lock = true; clearInterval(RY.t);
  const q = RY.q, ok = i >= 0 && RY.opts[i][1] === q.a, card = $("#ryCard");
  record(q, ok ? 1 : 0); save();
  card.querySelectorAll(".ry-o").forEach((b, j) => { b.disabled = true; b.classList.add(RY.opts[j][1] === q.a ? "ok" : (j === i ? "no" : "dim")); });
  let { out, alive } = ryElims(), meOut = false, saved = false, revive = false;
  if (ok) { RY.right++; RY.streak++; RY.best = Math.max(RY.best, RY.streak); sfx("ok"); vib(20); }
  else {
    RY.streak = 0; RY.wrong.push({ q, pick: i >= 0 ? RY.opts[i][0] : null }); sfx("no"); vib([40, 50, 40]);
    if (RY.shield > 0) { RY.shield--; saved = true; }
    else if (out.length >= alive) { revive = true; out = []; }
    else meOut = true;
  }
  const arena = $("#ryArena");
  out.forEach((k, j) => setTimeout(() => {
    if (!RY) return;
    RY.P[k].alive = false;
    const el = arena.querySelector(`[data-i="${k}"]`); el && el.classList.add("dying");
    if (j < 10) sfx("elim");
  }, 200 + j * 55));
  if (meOut) setTimeout(() => { if (!RY) return; RY.P[0].alive = false; arena.querySelector(`[data-i="0"]`).classList.add("dying"); }, 250);
  const feed = out.slice(0, 3).map(k => `${RY.P[k].em} ${esc(RY.P[k].n)}`).join(" · ");
  $("#ryFeed").innerHTML = out.length ? `💥 ${feed}${out.length > 3 ? ` <b>+${out.length - 3}</b>` : ""} ${GT("הודחו", "out")}` : revive ? GT("😅 כולם טעו – אף אחד לא הודח", "😅 Everyone missed – nobody is out") : GT("😮 אף אחד לא הודח", "😮 Nobody got knocked out");
  setTimeout(() => { if (RY) { ryStorm(); ryAfter(ok, saved, revive, meOut, out.length); } }, 300 + Math.min(out.length, 20) * 55);
}
function ryAfter(ok, saved, revive, meOut, nOut) {
  const q = RY.q, left = ryBots(), win = !meOut && left === 0;
  const head = meOut ? `💥 ${GT("הודחת! מקום", "Eliminated! Place")} #${left + 1}`
    : win ? "👑 Victory Royale!"
    : revive ? GT("😅 כולם טעו – הסיבוב נשמר!", "😅 Everyone missed – you're safe!")
    : saved ? GT("🛡️ המגן הציל אותך!", "🛡️ Your shield saved you!")
    : `✓ ${GT("נכון!", "Correct!")}${RY.streak >= 3 ? ` 🔥×${RY.streak}` : ""}`;
  const drop = !meOut && !win && RY.round % 3 === 2;
  const label = meOut ? GT("לתוצאות", "See results") : win ? GT("קח את הניצחון 👑", "Claim your win 👑") : drop ? GT("📦 אספקה!", "📦 Supply drop!") : GT("לסיבוב הבא ▶", "Next round ▶");
  $("#ryPw").outerHTML = `<div class="ry-fb ${ok ? "ok" : "no"}"><div class="ry-fb-h">${head}</div>
    <div class="ry-fb-s">${GT(`${nOut} הודחו · נשארו ${left + (meOut ? 0 : 1)}`, `${nOut} knocked out · ${left + (meOut ? 0 : 1)} left`)}</div>
    ${ok ? `<button class="ry-why" id="ryWhy">💡 ${GT("למה?", "Why?")}</button><div class="ry-e" id="ryE" hidden>${esc(q.e)}</div>` : `<div class="ry-e">${GT("התשובה", "Answer")}: <b>${esc(gqRight(q))}</b><br>💡 ${esc(q.e)}</div>`}
    <button class="arc-btn go" id="ryNext">${ok && !win ? `<span class="auto" style="--d:2.6s"></span>` : ""}<span class="lbl">${label}</span></button></div>`;
  const next = () => {
    clearTimeout(RY.auto);
    if (meOut) return ryEnd(left + 1);
    if (win) return ryEnd(1);
    drop ? ryDrop() : ryRound();
  };
  $("#ryNext").onclick = next;
  const why = $("#ryWhy"); if (why) why.onclick = () => { clearTimeout(RY.auto); $("#ryNext .auto")?.remove(); $("#ryE").hidden = false; why.remove(); };
  if (ok && !win) RY.auto = setTimeout(() => { if (RY && !RY.over) next(); }, 2600);
  if (win) { sfx("win"); confetti(); }
}
function ryDrop() {
  const w = [["shield", 30], ["fifty", 30], ["plus", 25], ["coins", 15]];
  const roll = () => { let r = Math.random() * 100; for (const [k, p] of w) { if ((r -= p) < 0) return k; } return "coins"; };
  const items = [roll(), roll(), roll()];
  const card = $("#ryCard"); card.className = "ry-card"; void card.offsetWidth;
  card.innerHTML = `<div class="ry-drop"><b>📦 ${GT("אספקה הוצנחה! בחר ארגז אחד", "Supply drop! Pick one crate")}</b>
    <div class="ry-crates">${items.map((_, i) => `<button class="ry-crate" data-i="${i}">📦</button>`).join("")}</div><div id="ryDropFb"></div></div>`;
  sfx("crate");
  card.querySelectorAll(".ry-crate").forEach(b => b.onclick = () => {
    if (card.dataset.done === "1") return; card.dataset.done = "1";
    const pick = +b.dataset.i, k = items[pick];
    card.querySelectorAll(".ry-crate").forEach((c, j) => { c.textContent = RY_ITEM[items[j]]; c.classList.add(j === pick ? "pick" : "rev"); c.disabled = true; });
    if (k === "coins") RY.bonus += 15; else RY[k]++;
    sfx("coin"); vib(25);
    $("#ryDropFb").innerHTML = `<div class="ry-fb-h ok-c">${GT("קיבלת", "You got")}: ${RY_ITEM[k]} ${ryItemName(k)}</div><button class="arc-btn go" id="ryNext">${GT("לסיבוב הבא ▶", "Next round ▶")}</button>`;
    $("#ryNext").onclick = () => { delete card.dataset.done; ryRound(); };
  });
}
function ryEnd(place) {
  if (!RY || RY.over) return;
  RY.over = true; clearInterval(RY.t); clearTimeout(RY.auto);
  const R = RY, A = S.arc.roy;
  A.p++; if (place === 1) A.w++; if (place <= 10) A.t10++; if (!A.best || place < A.best) A.best = place;
  const coins = (place === 1 ? 60 : place <= 3 ? 40 : place <= 10 ? 25 : 10) + R.right * 2 + R.bonus;
  const daily = R.daily && place <= 10 ? dailyWin() : 0;
  addCoins(coins, true); addXP(15 + R.right * 5 + (place === 1 ? 25 : 0));
  touchStreak(); logHistory({ mode: "royale", title: "👑 Fit Royale", score: pct(R.right, R.round), n: R.round }); save();
  if (place <= 10) sfx("win"); else sfx("lose");
  if (place === 1) confetti();
  setTimeout(() => {
    RY = null;
    arcResult({
      em: place === 1 ? "👑" : place <= 10 ? "🏅" : "💫", big: "#" + place, gold: place === 1,
      title: place === 1 ? "Victory Royale!" : place <= 3 ? GT("כמעט! בפודיום", "So close – on the podium!") : place <= 10 ? GT("טופ 10!", "Top 10!") : GT("הודחת הפעם", "Knocked out this time"),
      banner: daily ? `📅 ${GT("אתגר יומי הושלם", "Daily challenge complete")} · +100 🪙` : (R.daily && !daily && place > 10 ? `📅 ${GT("צריך טופ 10 לאתגר היומי – נסה שוב", "Daily challenge needs top 10 – try again")}` : ""),
      stats: [[`${R.right}/${R.round}`, GT("נכונות", "Correct")], [`🔥${R.best}`, GT("רצף", "Streak")], [`+${coins}`, "🪙"]],
      wrong: R.wrong, again: () => royaleStart(R.daily && !daily)
    });
  }, place === 1 ? 1200 : 700);
}

/* ═════════ 2. Myth Defense ═════════ */
const MD_C = 9, MD_R = 12, MD_W = MD_C * 40, MD_H = MD_R * 40;
const MD_MAPS = [
  { em: "🏋️", he: "חדר הכושר", en: "The Gym", bg: ["#86efac", "#22c55e"], deco: ["🌿", "🌼", "🏀"], hp: 1, path: [[-1, 1], [7, 1], [7, 4], [1, 4], [1, 7], [7, 7], [7, 10], [4, 10], [4, 12]] },
  { em: "🌳", he: "הפארק", en: "The Park", bg: ["#d9f99d", "#65a30d"], deco: ["🌳", "🌷", "🍄"], hp: 1.3, path: [[4, -1], [4, 2], [1, 2], [1, 5], [7, 5], [7, 8], [2, 8], [2, 10], [9, 10]] },
  { em: "🏟️", he: "האצטדיון", en: "The Stadium", bg: ["#a7f3d0", "#059669"], deco: ["⚽", "🚩", "🌿"], hp: 1.6, path: [[-1, 10], [2, 10], [2, 2], [5, 2], [5, 9], [7, 9], [7, 4], [9, 4]] }
];
/* כל מפלצת היא מיתוס נפוץ – והעובדה שמפריכה אותו */
const MD_MON = {
  donut: { em: "🍩", hp: 60, sp: 1.0, g: 5, sz: 26, he: "אכילה בלילה משמינה", en: "Eating at night makes you fat", fhe: "מה שקובע הוא סך הקלוריות לאורך היום, לא השעה שבה אוכלים.", fen: "What matters most is total calories over the day, not the time you eat." },
  drop: { em: "💦", hp: 38, sp: 1.7, g: 4, sz: 24, he: "יותר זיעה = יותר שריפת שומן", en: "More sweat = more fat burned", fhe: "זיעה היא הדרך של הגוף להתקרר. היא לא מודדת כמה שומן נשרף.", fen: "Sweat is how your body cools down. It doesn't measure how much fat you burn." },
  ghost: { em: "👻", hp: 22, sp: 1.35, g: 2, sz: 21, he: "כפיפות בטן שורפות את שומן הבטן", en: "Crunches burn belly fat", fhe: "אי אפשר לבחור מאיפה יורד שומן. הירידה בשומן היא בכל הגוף.", fen: "You can't pick where fat comes off. Fat loss happens across the whole body." },
  zombie: { em: "🧟", hp: 110, sp: 0.85, g: 8, sz: 28, he: "שריר הופך לשומן כשמפסיקים להתאמן", en: "Muscle turns into fat when you stop", fhe: "שריר ושומן הם רקמות שונות – אחת לא יכולה להפוך לשנייה.", fen: "Muscle and fat are different tissues – one can't turn into the other." },
  bulk: { em: "🦍", hp: 160, sp: 0.9, g: 10, sz: 30, he: "משקולות יהפכו נשים למסיביות", en: "Lifting weights makes women bulky", fhe: "בניית מסת שריר גדולה דורשת שנים של אימון ותזונה מכוונים.", fen: "Building large muscle mass takes years of targeted training and eating." },
  rock: { em: "🗿", hp: 230, sp: 0.6, g: 12, sz: 30, he: "בלי כאב אין תוצאות", en: "No pain, no gain", fhe: "התקדמות לא דורשת כאב. כאב חד הוא סימן אזהרה לעצור.", fen: "Progress doesn't require pain. Sharp pain is a warning sign to stop." },
  boss: { em: "🐉", hp: 1100, sp: 0.42, g: 60, sz: 46, boss: 1, he: "מגה־מיתוס: חייבים להתאמן כל יום", en: "Mega myth: you must train every day", fhe: "השיפור קורה גם במנוחה – התאוששות היא חלק מהאימון.", fen: "Improvement happens during rest too – recovery is part of training." }
};
const MD_WAVES = [
  [["donut", 8, 1.0]],
  [["donut", 6, 0.9], ["drop", 6, 0.6]],
  [["ghost", 14, 0.33], ["donut", 5, 0.8]],
  [["zombie", 6, 1.0], ["drop", 8, 0.5]],
  [["donut", 6, 0.8], ["boss", 1, 2.0], ["ghost", 10, 0.33]],
  [["bulk", 5, 1.0], ["drop", 8, 0.5], ["donut", 6, 0.7]],
  [["rock", 4, 1.4], ["ghost", 14, 0.3], ["zombie", 5, 0.9]],
  [["bulk", 6, 0.9], ["rock", 3, 1.3], ["drop", 10, 0.45]],
  [["zombie", 8, 0.8], ["rock", 5, 1.2], ["ghost", 18, 0.28], ["bulk", 4, 0.9]],
  [["boss", 1, 2.5], ["rock", 4, 1.1], ["bulk", 6, 0.8], ["drop", 12, 0.4], ["boss", 1, 1.0]]
];
const MD_TW = {
  bar: { em: "🏋️", c: "#ef4444", cost: 50, lock: 0, he: "תותח משקולות", en: "Barbell Cannon", dhe: "מכה חזקה במטרה אחת", den: "Strong single-target hits", dmg: [24, 40, 64], rate: [0.85, 0.75, 0.65], rg: [2.3, 2.5, 2.8], up: [45, 80] },
  shake: { em: "🥤", c: "#ec4899", cost: 70, lock: 0, he: "שייק חלבון", en: "Protein Splash", dhe: "התזה שפוגעת בקבוצה", den: "Splash damage that hits groups", dmg: [14, 22, 34], rate: [1.3, 1.15, 1.0], rg: [2.0, 2.2, 2.4], splash: 0.95, up: [60, 95] },
  zap: { em: "⚡", c: "#eab308", cost: 90, lock: 250, he: "זאפ קרדיו", en: "Cardio Zap", dhe: "ברק שקופץ בין 3 מטרות", den: "Lightning that chains 3 targets", dmg: [16, 26, 40], rate: [0.75, 0.65, 0.55], rg: [2.4, 2.6, 2.9], chain: 3, up: [80, 120] },
  zen: { em: "🧘", c: "#06b6d4", cost: 60, lock: 400, he: "הקפאת זן", en: "Zen Freeze", dhe: "מאט את כל מי שבטווח", den: "Slows everything in range", dmg: [5, 8, 12], rate: [1, 0.9, 0.8], rg: [1.8, 2.1, 2.4], slow: [0.45, 0.55, 0.65], up: [55, 90] }
};
let MD = null;
const mdStars = lives => lives >= 13 ? 3 : lives >= 7 ? 2 : 1;

function mdMenu() {
  ensureArcade(); arcStop();
  const A = S.arc;
  funScreen(`<div class="arc fade-in" data-notr>
    <div class="arc-top"><button class="arc-x" id="fx">✕</button><b class="arc-title">🏰 Myth Defense</b><span class="arc-coins">🪙 <b>${S.coins}</b></span></div>
    <div class="arc-h">${GT("בחר מפה", "Choose a map")}</div>
    <div class="md-maps">${MD_MAPS.map((m, i) => { const lock = i > 0 && !A.md.stars[i - 1], st = A.md.stars[i];
      return `<button class="md-map m${i} ${lock ? "lock" : ""}" data-m="${i}"><span class="md-map-em">${lock ? "🔒" : m.em}</span><b>${GT(m.he, m.en)}</b><small>${lock ? GT("נצח במפה הקודמת", "Win the previous map") : `10 ${GT("גלים", "waves")}`}</small><i>${"⭐".repeat(st)}${"☆".repeat(3 - st)}</i></button>`; }).join("")}</div>
    <div class="arc-h">${GT("איך משחקים", "How to play")}</div>
    <div class="md-how">
      <div>🏗️ ${GT("בוחרים מגדל למטה ומקישים על הדשא כדי לבנות", "Pick a tower below and tap the grass to build")}</div>
      <div>👾 ${GT("כל מפלצת היא מיתוס על כושר – אל תיתן לה להגיע לחדר הכושר", "Every monster is a fitness myth – don't let it reach the gym")}</div>
      <div>🧠 ${GT("בין הגלים: 2 שאלות מאמן. תשובה נכונה = זהב + טעינת 💥", "Between waves: 2 coach questions. Right answer = gold + 💥 charge")}</div>
      <div>❓ ${GT("בועת שאלה צצה באמצע גל? הקש עליה לבונוס", "A question bubble pops up mid-wave? Tap it for a bonus")}</div>
      <div>💥 ${GT("מכת מיתוסים פוגעת בכל המפלצות על המסך", "Myth Buster hits every monster on screen")}</div>
    </div>
    <button class="arc-btn" id="mdShop">🛒 ${GT("מגדלים חדשים בחנות", "New towers in the shop")}</button>
  </div>`);
  arcFull(true);
  $("#fx").onclick = arcadeHub; $("#mdShop").onclick = () => arcShop(mdMenu);
  app.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
    if (b.classList.contains("lock")) { sfx("no"); return toast("🔒", GT("נצח במפה הקודמת כדי לפתוח", "Win the previous map to unlock")); }
    mdStart(+b.dataset.m, false);
  });
}

function mdGeom(map) {
  const pts = map.path.map(([x, y]) => [x + 0.5, y + 0.5]), seg = [];
  let tot = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], l = Math.hypot(bx - ax, by - ay);
    seg.push({ ax, ay, bx, by, l, s: tot }); tot += l;
  }
  const cells = new Set();
  for (const s of seg) {
    const n = Math.ceil(s.l * 4);
    for (let j = 0; j <= n; j++) {
      const x = Math.floor(s.ax + (s.bx - s.ax) * j / n), y = Math.floor(s.ay + (s.by - s.ay) * j / n);
      if (x >= 0 && y >= 0 && x < MD_C && y < MD_R) cells.add(x + "," + y);
    }
  }
  return { pts, seg, tot, cells };
}
function mdPos(d) {
  for (const s of MD.G.seg) if (d <= s.s + s.l) { const t = (d - s.s) / s.l; return [s.ax + (s.bx - s.ax) * t, s.ay + (s.by - s.ay) * t]; }
  const s = MD.G.seg[MD.G.seg.length - 1]; return [s.bx, s.by];
}
function mdWaveList(w) {
  const L = [];
  MD_WAVES[w - 1].forEach(([k, n, gap]) => { for (let i = 0; i < n; i++) L.push([k, gap]); });
  return L;
}

function mdStart(mapI, daily) {
  ensureArcade(); arcStop();
  const map = MD_MAPS[mapI], own = S.arc.towers;
  MD = {
    mapI, map, daily: !!daily, G: null, w: 0, waves: daily ? 6 : 10, hpM: map.hp * (daily ? 1.6 : 1),
    lives: 15, gold: daily ? 100 : 120, charge: 1, phase: "build", queue: [], spT: 0, bub: null, bubT: 15,
    mon: [], tw: [], shots: [], parts: [], floats: [], rings: [], bolts: [], sel: "bar", insp: null,
    fast: false, paused: false, over: false, time: 0, shake: 0, flash: 0, right: 0, asked: 0, wrong: [], streak: 0, kills: 0, uid: 0
  };
  MD.G = mdGeom(map);
  funScreen(`<div class="arc md" data-notr>
    <div class="md-hud">
      <button class="arc-x" id="fx">✕</button>
      <span class="md-pill">❤️ <b id="mdL">15</b></span>
      <span class="md-pill gold">🪙 <b id="mdG">0</b></span>
      <span class="md-pill">🌊 <b id="mdWv">0/${MD.waves}</b></span>
      <button class="md-fast" id="mdFast">⏩</button>
    </div>
    <div class="md-stage" id="mdStage"><canvas id="mdC"></canvas><div class="md-ban" id="mdBan"></div><div class="md-panel" id="mdPanel"></div></div>
    <div class="md-bar">
      <div class="md-towers">${Object.entries(MD_TW).map(([k, T]) => `<button class="md-tw ${own.includes(k) ? "" : "lock"}" data-k="${k}" style="--c:${T.c}"><span>${own.includes(k) ? T.em : "🔒"}</span><i>🪙${T.cost}</i></button>`).join("")}</div>
      <button class="md-go" id="mdGo">▶<small>${GT("גל", "Wave")}</small></button>
      <button class="md-buster" id="mdBust" hidden>💥<i id="mdCh">1</i></button>
    </div>
  </div>`);
  arcFull(true);
  const M = MD;
  M.cv = $("#mdC"); M.ctx = M.cv.getContext("2d");
  mdSize();
  $("#fx").onclick = () => { if (!M.over && M.w > 0) { if (!confirm(GT("לצאת מהמשחק? ההתקדמות במפה תאבד.", "Leave the game? Your progress on this map will be lost."))) return; } arcStop(); mdMenu(); };
  $("#mdFast").onclick = () => { M.fast = !M.fast; $("#mdFast").classList.toggle("on", M.fast); sfx("tap"); };
  $("#mdGo").onclick = mdStartWave;
  $("#mdBust").onclick = mdBuster;
  app.querySelectorAll(".md-tw").forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    if (!S.arc.towers.includes(k)) { sfx("no"); return toast("🔒", GT(`נפתח בחנות ב־${MD_TW[k].lock} מטבעות`, `Unlock it in the shop for ${MD_TW[k].lock} coins`)); }
    M.sel = k; sfx("tap"); mdHud();
  });
  M.cv.addEventListener("pointerdown", e => {
    const r = M.cv.getBoundingClientRect();
    mdTap((e.clientX - r.left) / r.width * MD_C, (e.clientY - r.top) / r.height * MD_R);
  });
  $("#mdPanel").innerHTML = `<div class="md-tip"><b>${map.em} ${GT(map.he, map.en)}${daily ? " · 📅 " + GT("אתגר יומי", "Daily challenge") : ""}</b>
    <div>🏗️ ${GT("בחר מגדל למטה והקש על הדשא כדי לבנות.", "Pick a tower below and tap the grass to build.")}</div>
    <div>▶ ${GT("כשאתה מוכן – התחל את הגל הראשון.", "When you're ready – start the first wave.")}</div></div>`;
  mdHud();
  M.last = performance.now();
  M.raf = requestAnimationFrame(mdLoop);
}

function mdSize() {
  const M = MD; if (!M || !M.cv) return;
  const aw = Math.min(innerWidth - 20, 560), ah = innerHeight - 160;
  const sc = Math.max(0.5, Math.min(aw / MD_W, ah / MD_H)), dpr = Math.min(3, window.devicePixelRatio || 1);
  M.cv.style.width = Math.round(MD_W * sc) + "px"; M.cv.style.height = Math.round(MD_H * sc) + "px";
  M.cv.width = Math.round(MD_W * sc * dpr); M.cv.height = Math.round(MD_H * sc * dpr);
  M.k = sc * dpr; M.ctx.setTransform(M.k, 0, 0, M.k, 0, 0);
  mdBg();
}
window.addEventListener("resize", () => { if (MD) mdSize(); });

const EMO = {};
function emo(e, px) {
  const K = MD.k, key = e + "|" + px + "|" + K.toFixed(2);
  if (EMO[key]) return EMO[key];
  const s = Math.ceil(px * 1.35 * K), c = document.createElement("canvas"), x = c.getContext("2d");
  c.width = c.height = s;
  x.font = `${Math.round(px * K)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(e, s / 2, s / 2 + px * K * 0.07);
  return EMO[key] = { c, s: s / K };
}
function drawEmo(ctx, e, px, x, y, a) {
  const E = emo(e, px);
  if (a != null) ctx.globalAlpha = a;
  ctx.drawImage(E.c, x - E.s / 2, y - E.s / 2, E.s, E.s);
  if (a != null) ctx.globalAlpha = 1;
}

/* רקע סטטי: דשא, שביל וקישוטים – נצייר פעם אחת */
function mdBg() {
  const M = MD, K = M.k, b = document.createElement("canvas");
  b.width = Math.round(MD_W * K); b.height = Math.round(MD_H * K);
  const c = b.getContext("2d"); c.scale(K, K);
  const g = c.createLinearGradient(0, 0, 0, MD_H); g.addColorStop(0, M.map.bg[0]); g.addColorStop(1, M.map.bg[1]);
  c.fillStyle = g; c.fillRect(0, 0, MD_W, MD_H);
  for (let y = 0; y < MD_R; y++) for (let x = 0; x < MD_C; x++) if ((x + y) % 2) { c.fillStyle = "rgba(255,255,255,.10)"; c.fillRect(x * 40, y * 40, 40, 40); }
  const line = (w, col, dash) => {
    c.beginPath(); M.G.pts.forEach(([x, y], i) => i ? c.lineTo(x * 40, y * 40) : c.moveTo(x * 40, y * 40));
    c.lineWidth = w; c.strokeStyle = col; c.lineJoin = "round"; c.lineCap = "round"; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
  };
  line(38, "rgba(0,0,0,.18)"); line(34, "#b45309"); line(28, "#fde68a"); line(2, "rgba(180,83,9,.35)", [6, 10]);
  let seed = 7 + M.mapI * 13; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(rnd() * MD_C), y = Math.floor(rnd() * MD_R);
    if (M.G.cells.has(x + "," + y)) continue;
    const E = emo(M.map.deco[i % 3], 13);
    c.globalAlpha = 0.85; c.drawImage(E.c, x * 40 + 4 + rnd() * 18, y * 40 + 4 + rnd() * 18, E.s, E.s); c.globalAlpha = 1;
  }
  M.bg = b;
}

function mdHud() {
  const M = MD; if (!M) return;
  $("#mdL").textContent = M.lives; $("#mdG").textContent = M.gold; $("#mdWv").textContent = `${M.w}/${M.waves}`;
  $("#mdCh").textContent = M.charge;
  app.querySelectorAll(".md-tw").forEach(b => {
    const T = MD_TW[b.dataset.k];
    b.classList.toggle("sel", b.dataset.k === M.sel); b.classList.toggle("poor", M.gold < T.cost);
  });
  const wave = M.phase === "wave";
  $("#mdGo").hidden = wave; $("#mdBust").hidden = !wave;
  $("#mdBust").disabled = !M.charge;
  $("#mdGo").classList.toggle("pulse", !wave && !$("#mdPanel .md-q"));
}
function mdBanner(t) { const b = $("#mdBan"); if (!b) return; b.innerHTML = t; b.classList.remove("on"); void b.offsetWidth; b.classList.add("on"); }
function mdFloat(x, y, t, c) { MD.floats.push({ x, y, t, c: c || "#fff", life: 1 }); }
function mdBurst(x, y, c, n) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 1 + Math.random() * 2.5; MD.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.3, c, r: 2 + Math.random() * 2.5 }); }
}

function mdTap(x, y) {
  const M = MD; if (!M || M.over || M.paused) return;
  if (M.bub && Math.hypot(x - M.bub.x, y - M.bub.y) < 0.85) return mdBubbleQ();
  const cx = Math.floor(x), cy = Math.floor(y);
  if (cx < 0 || cy < 0 || cx >= MD_C || cy >= MD_R) return;
  const t = M.tw.find(t => t.cx === cx && t.cy === cy);
  if (t) return mdTowerPop(t);
  if (M.G.cells.has(cx + "," + cy)) { mdFloat(cx + 0.5, cy + 0.5, "🚫", "#fff"); sfx("no"); return; }
  const T = MD_TW[M.sel];
  if (M.gold < T.cost) { mdFloat(cx + 0.5, cy + 0.5, GT("חסר זהב", "Need gold"), "#fecaca"); sfx("no"); return; }
  M.gold -= T.cost;
  M.tw.push({ k: M.sel, cx, cy, x: cx + 0.5, y: cy + 0.5, lv: 0, cd: 0, spent: T.cost, kick: 0, pop: 0.3 });
  sfx("build"); vib(15); mdBurst(cx + 0.5, cy + 0.5, "#fff", 8);
  if (M.phase === "build" && $("#mdPanel .md-tip")) $("#mdPanel").innerHTML = "";
  mdHud();
}
function mdTowerPop(t) {
  const M = MD, T = MD_TW[t.k], max = t.lv >= 2, up = max ? 0 : T.up[t.lv], sell = Math.floor(t.spent * 0.6);
  M.paused = true; M.insp = t; sfx("tap");
  const done = () => { if (MD === M) { M.paused = false; M.insp = null; M.last = performance.now(); mdHud(); } };
  const h = sheet(`<div class="md-pop" data-notr><div class="md-pop-h"><span class="arc-tem" style="--c:${T.c}">${T.em}</span><div><b>${GT(T.he, T.en)}</b><small>${GT("רמה", "Level")} ${t.lv + 1}/3 · ${GT(T.dhe, T.den)}</small></div></div>
    <div class="md-pop-st"><span>💪 ${T.dmg[t.lv]}${max ? "" : ` → <b>${T.dmg[t.lv + 1]}</b>`}</span><span>🎯 ${T.rg[t.lv]}${max ? "" : ` → <b>${T.rg[t.lv + 1]}</b>`}</span></div>
    ${max ? `<div class="arc-perfect">⭐ ${GT("רמה מקסימלית", "Max level")}</div>` : `<button class="arc-btn go" data-a="up" ${M.gold < up ? "disabled" : ""}>⬆️ ${GT("שדרוג", "Upgrade")} · 🪙 ${up}</button>`}
    <button class="arc-btn warn" data-a="sell">💰 ${GT("מכירה", "Sell")} · +${sell} 🪙</button>
    <button class="arc-btn" data-a="x">${GT("סגירה", "Close")}</button></div>`, (e, close) => {
    const a = e.target.closest("[data-a]")?.dataset.a; if (!a) return;
    if (a === "up" && M.gold >= up && !max) { M.gold -= up; t.spent += up; t.lv++; t.pop = 0.35; sfx("build"); mdBurst(t.x, t.y, "#fde047", 14); }
    if (a === "sell") { M.gold += sell; M.tw = M.tw.filter(x => x !== t); sfx("coin"); mdFloat(t.x, t.y, "+" + sell, "#fde047"); }
    close(); done();
  });
  h.bg.addEventListener("click", e => { if (e.target === h.bg) done(); });
}
function mdBubbleQ() {
  const M = MD; M.bub = null; M.paused = true; sfx("tap");
  gqAsk(`❓ ${GT("שאלת בונוס · +40 🪙 +1 💥", "Bonus question · +40 🪙 +1 💥")}`, (ok, q, pick) => {
    if (MD !== M) return;
    M.asked++;
    if (ok) { M.right++; M.gold += 40; M.charge = Math.min(3, M.charge + 1); sfx("coin"); }
    else M.wrong.push({ q, pick });
    M.paused = false; M.last = performance.now(); mdHud();
  });
}
function mdBuster() {
  const M = MD; if (!M || !M.charge || M.phase !== "wave" || M.paused) return;
  M.charge--; M.flash = 0.35; M.shake = 0.5; sfx("boom"); vib([60, 40, 90]);
  M.mon.forEach(m => { if (!m.dead) { mdHit(m, m.boss ? 300 : 150); m.stun = 1.2; mdBurst(m.x, m.y, "#f97316", 8); } });
  mdBanner(`💥 ${GT("מכת מיתוסים!", "Myth Buster!")}`); mdHud();
}

function mdStartWave() {
  const M = MD; if (!M || M.phase === "wave" || M.over || M.paused) return;
  const w = M.w + 1, list = mdWaveList(w);
  const nu = [...new Set(list.map(x => x[0]))].find(k => !S.arc.seen.includes(k));
  if (nu) { S.arc.seen.push(nu); save(); return mdMyth(nu, mdStartWave); }
  M.w = w; M.queue = list; M.spT = 0.4; M.phase = "wave"; M.bubT = 9 + Math.random() * 6; M.bub = null;
  $("#mdPanel").innerHTML = "";
  mdBanner(`🌊 ${GT("גל", "Wave")} ${w}${MD_WAVES[w - 1].some(x => x[0] === "boss") ? " · 🐉 " + GT("בוס!", "Boss!") : ""}`);
  sfx("wave"); mdHud();
}
function mdMyth(k, then) {
  const m = MD_MON[k], M = MD; M.paused = true; sfx("crate");
  const h = sheet(`<div class="md-myth" data-notr><div class="md-myth-tag">🆕 ${GT("מיתוס חדש בדרך!", "A new myth is coming!")}</div>
    <div class="md-myth-em">${m.em}</div><div class="md-myth-q">"${GT(m.he, m.en)}"</div>
    <div class="md-myth-x">❌ ${GT("מיתוס", "Myth")}</div><div class="md-myth-f">✅ ${GT(m.fhe, m.fen)}</div>
    <button class="arc-btn go" data-go>💥 ${GT("בוא נפריך אותו!", "Let's bust it!")}</button></div>`, (e, close) => {
    if (e.target.closest("[data-go]")) { close(); if (MD === M) { M.paused = false; M.last = performance.now(); then(); } }
  });
  h.bg.addEventListener("click", e => { if (e.target === h.bg) e.stopImmediatePropagation(); }, true);
}
function mdSpawn(k) {
  const T = MD_MON[k], M = MD, hp = Math.round(T.hp * (1 + 0.16 * (M.w - 1)) * M.hpM);
  const [x, y] = mdPos(0);
  M.mon.push({ k, em: T.em, sz: T.sz, hp, max: hp, sp: T.sp, g: T.g, boss: !!T.boss, d: 0, x, y, slowT: 0, slowF: 0, stun: 0, hitT: 0, id: M.uid++ });
}
function mdHit(m, d) {
  if (m.dead) return;
  const M = MD; m.hp -= d; m.hitT = 0.1;
  if (m.hp <= 0) {
    m.dead = true; M.gold += m.g; M.kills++;
    mdFloat(m.x, m.y - 0.3, "+" + m.g, "#fde047"); mdBurst(m.x, m.y, m.boss ? "#a855f7" : "#fff", m.boss ? 34 : 9);
    if (m.boss) { M.shake = 0.45; vib(80); sfx("boom"); mdBanner(`🐉 ${GT("הבוס הובס!", "Boss busted!")}`); } else sfx("pop");
    mdHud();
  }
}
function mdStep(dt) {
  const M = MD; M.time += dt;
  if (M.phase === "wave") {
    M.spT -= dt;
    if (M.queue.length && M.spT <= 0) { const [k, gap] = M.queue.shift(); mdSpawn(k); M.spT = gap; }
    if (!M.bub) {
      M.bubT -= dt;
      if (M.bubT <= 0) {
        const free = [];
        for (let y = 1; y < MD_R - 1; y++) for (let x = 0; x < MD_C; x++) if (!M.G.cells.has(x + "," + y) && !M.tw.some(t => t.cx === x && t.cy === y)) free.push([x, y]);
        if (free.length) { const [x, y] = free[Math.floor(Math.random() * free.length)]; M.bub = { x: x + 0.5, y: y + 0.5, life: 7 }; sfx("crate"); }
        M.bubT = 16 + Math.random() * 8;
      }
    } else if ((M.bub.life -= dt) <= 0) M.bub = null;
  }
  for (const m of M.mon) {
    if (m.dead) continue;
    let sp = m.sp;
    if (m.slowT > 0) { m.slowT -= dt; sp *= 1 - m.slowF; }
    if (m.stun > 0) { m.stun -= dt; sp = 0; }
    m.d += sp * dt; [m.x, m.y] = mdPos(m.d); m.hitT = Math.max(0, m.hitT - dt);
    if (m.d >= M.G.tot) {
      m.dead = true; M.lives = Math.max(0, M.lives - (m.boss ? 5 : 1)); M.shake = 0.3; sfx("leak"); vib(70);
      const [ex, ey] = mdExit(); mdFloat(ex, ey - 0.5, m.boss ? "-5 ❤️" : "-1 ❤️", "#fecaca");
      mdHud();
      if (M.lives <= 0) return mdEnd(false);
    }
  }
  for (const t of M.tw) {
    t.kick = Math.max(0, t.kick - dt); t.pop = Math.max(0, t.pop - dt);
    t.cd -= dt; if (t.cd > 0) continue;
    const T = MD_TW[t.k], L = t.lv, rg = T.rg[L];
    const inR = M.mon.filter(m => !m.dead && Math.hypot(m.x - t.x, m.y - t.y) <= rg).sort((a, b) => b.d - a.d);
    if (!inR.length) continue;
    if (t.k === "zen") {
      inR.forEach(m => { mdHit(m, T.dmg[L]); m.slowF = Math.max(m.slowT > 0 ? m.slowF : 0, m.boss ? T.slow[L] * 0.5 : T.slow[L]); m.slowT = 1.3; });
      M.rings.push({ x: t.x, y: t.y, r: 0.3, R: rg, life: 0.5, c: "#67e8f9" });
    } else if (t.k === "zap") {
      const chain = [inR[0]];
      for (let c = 1; c < T.chain; c++) {
        const cur = chain[chain.length - 1];
        const nx = M.mon.filter(m => !m.dead && !chain.includes(m) && Math.hypot(m.x - cur.x, m.y - cur.y) < 1.8).sort((a, b) => Math.hypot(a.x - cur.x, a.y - cur.y) - Math.hypot(b.x - cur.x, b.y - cur.y))[0];
        if (!nx) break; chain.push(nx);
      }
      M.bolts.push({ pts: [[t.x, t.y], ...chain.map(m => [m.x, m.y])], life: 0.15 });
      chain.forEach(m => mdHit(m, T.dmg[L])); sfx("zap");
    } else { M.shots.push({ x: t.x, y: t.y, m: inR[0], k: t.k, dmg: T.dmg[L], c: T.c }); sfx("shoot"); }
    t.cd = T.rate[L]; t.kick = 0.12;
  }
  for (const s of M.shots) {
    const m = s.m; if (m.dead) { s.done = true; continue; }
    const dx = m.x - s.x, dy = m.y - s.y, dist = Math.hypot(dx, dy), v = 9 * dt;
    if (dist <= v) {
      s.done = true;
      if (s.k === "shake") {
        M.mon.forEach(o => { if (!o.dead && Math.hypot(o.x - m.x, o.y - m.y) <= MD_TW.shake.splash) mdHit(o, s.dmg); });
        M.rings.push({ x: m.x, y: m.y, r: 0.2, R: MD_TW.shake.splash, life: 0.35, c: "#f9a8d4" });
      } else mdHit(m, s.dmg);
      mdBurst(m.x, m.y, s.c, 4); sfx("hit");
    } else { s.x += dx / dist * v; s.y += dy / dist * v; }
  }
  M.shots = M.shots.filter(s => !s.done);
  M.mon = M.mon.filter(m => !m.dead);
  M.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; p.life -= dt; }); M.parts = M.parts.filter(p => p.life > 0);
  M.floats.forEach(f => { f.y -= dt * 0.9; f.life -= dt; }); M.floats = M.floats.filter(f => f.life > 0);
  M.rings.forEach(r => r.life -= dt); M.rings = M.rings.filter(r => r.life > 0);
  M.bolts.forEach(b => b.life -= dt); M.bolts = M.bolts.filter(b => b.life > 0);
  if (M.phase === "wave" && !M.queue.length && !M.mon.length) mdWaveClear();
}
function mdExit() { const [x, y] = mdPos(MD.G.tot - 0.9); return [Math.min(MD_C - 0.5, Math.max(0.5, x)), Math.min(MD_R - 0.5, Math.max(0.5, y))]; }

function mdDraw() {
  const M = MD, c = M.ctx;
  c.save();
  if (M.shake > 0) c.translate((Math.random() - 0.5) * 14 * M.shake, (Math.random() - 0.5) * 14 * M.shake);
  c.drawImage(M.bg, 0, 0, MD_W, MD_H);
  const P = v => v * 40, T_ = M.time;
  // שער כניסה ובית
  const [sx, sy] = mdPos(0.9); drawEmo(c, "🌀", 26, P(Math.min(MD_C - 0.4, Math.max(0.4, sx))), P(Math.min(MD_R - 0.4, Math.max(0.4, sy))));
  const [ex, ey] = mdExit();
  c.fillStyle = "rgba(0,0,0,.2)"; c.beginPath(); c.ellipse(P(ex), P(ey) + 14, 20, 7, 0, 0, 6.28); c.fill();
  c.fillStyle = "#fff"; c.strokeStyle = "#f59e0b"; c.lineWidth = 4; c.beginPath(); c.arc(P(ex), P(ey), 18, 0, 6.28); c.fill(); c.stroke();
  drawEmo(c, S.arc.skin, 24, P(ex), P(ey));
  // טווח של מגדל נבחר
  if (M.insp) { c.fillStyle = "rgba(255,255,255,.18)"; c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 2; c.setLineDash([6, 6]); c.beginPath(); c.arc(P(M.insp.x), P(M.insp.y), P(MD_TW[M.insp.k].rg[M.insp.lv]), 0, 6.28); c.fill(); c.stroke(); c.setLineDash([]); }
  // מגדלים
  for (const t of M.tw) {
    const T = MD_TW[t.k], s = 1 + t.kick * 0.9 + t.pop * 0.8, x = P(t.x), y = P(t.y);
    c.fillStyle = "rgba(0,0,0,.22)"; c.beginPath(); c.ellipse(x, y + 14, 16, 6, 0, 0, 6.28); c.fill();
    c.fillStyle = "#fff"; c.strokeStyle = T.c; c.lineWidth = 4 + t.lv; c.beginPath(); c.arc(x, y, 16 * s, 0, 6.28); c.fill(); c.stroke();
    drawEmo(c, T.em, 21 * s, x, y);
    for (let i = 0; i <= t.lv; i++) { c.fillStyle = "#fde047"; c.strokeStyle = "#92400e"; c.lineWidth = 1.5; c.beginPath(); c.arc(x - (t.lv * 5) + i * 10, y + 19, 3.5, 0, 6.28); c.fill(); c.stroke(); }
  }
  // טבעות והתזות
  for (const r of M.rings) { const k = 1 - r.life / (r.c === "#67e8f9" ? 0.5 : 0.35); c.globalAlpha = Math.max(0, 1 - k); c.strokeStyle = r.c; c.lineWidth = 4; c.beginPath(); c.arc(P(r.x), P(r.y), P(r.r + (r.R - r.r) * k), 0, 6.28); c.stroke(); c.globalAlpha = 1; }
  // מפלצות
  for (const m of M.mon) {
    const bob = Math.sin(T_ * 9 + m.id) * 2, x = P(m.x), y = P(m.y);
    c.fillStyle = "rgba(0,0,0,.22)"; c.beginPath(); c.ellipse(x, y + m.sz * 0.45, m.sz * 0.42, m.sz * 0.15, 0, 0, 6.28); c.fill();
    if (m.slowT > 0) { c.strokeStyle = "#67e8f9"; c.lineWidth = 3; c.beginPath(); c.arc(x, y + bob, m.sz * 0.55, 0, 6.28); c.stroke(); }
    if (m.hitT > 0) { c.fillStyle = "rgba(255,255,255,.75)"; c.beginPath(); c.arc(x, y + bob, m.sz * 0.5, 0, 6.28); c.fill(); }
    drawEmo(c, m.em, m.sz, x, y + bob);
    if (m.stun > 0) drawEmo(c, "💫", 14, x, y - m.sz * 0.62 + bob);
    if (m.hp < m.max) {
      const w = m.boss ? 46 : 26, yy = y - m.sz * 0.7;
      c.fillStyle = "rgba(0,0,0,.45)"; c.fillRect(x - w / 2 - 1, yy - 1, w + 2, 6);
      c.fillStyle = m.hp / m.max > 0.4 ? "#22c55e" : "#ef4444"; c.fillRect(x - w / 2, yy, w * Math.max(0, m.hp / m.max), 4);
    }
  }
  // יריות
  for (const s of M.shots) { c.fillStyle = s.c; c.strokeStyle = "#fff"; c.lineWidth = 2; c.beginPath(); c.arc(P(s.x), P(s.y), s.k === "shake" ? 6 : 5, 0, 6.28); c.fill(); c.stroke(); }
  for (const b of M.bolts) {
    [["#fde047", 5], ["#fff", 2]].forEach(([col, w]) => {
      c.strokeStyle = col; c.lineWidth = w; c.beginPath();
      b.pts.forEach(([x, y], i) => { const jx = i ? (Math.random() - 0.5) * 8 : 0, jy = i ? (Math.random() - 0.5) * 8 : 0; i ? c.lineTo(P(x) + jx, P(y) + jy) : c.moveTo(P(x), P(y)); });
      c.stroke();
    });
  }
  for (const p of M.parts) { c.globalAlpha = Math.min(1, p.life * 2); c.fillStyle = p.c; c.beginPath(); c.arc(P(p.x), P(p.y), p.r, 0, 6.28); c.fill(); }
  c.globalAlpha = 1;
  // בועת שאלה
  if (M.bub) {
    const b = M.bub, x = P(b.x), y = P(b.y), s = 1 + Math.sin(T_ * 6) * 0.08;
    c.fillStyle = "#fde047"; c.strokeStyle = "#fff"; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 17 * s, 0, 6.28); c.fill(); c.stroke();
    c.strokeStyle = "#7c3aed"; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 21, -1.57, -1.57 + 6.28 * (b.life / 7)); c.stroke();
    drawEmo(c, "❓", 20 * s, x, y);
  }
  // טקסט צף
  c.textAlign = "center"; c.font = "900 15px system-ui,sans-serif";
  for (const f of M.floats) { c.globalAlpha = Math.min(1, f.life * 1.6); c.lineWidth = 4; c.strokeStyle = "rgba(0,0,0,.6)"; c.strokeText(f.t, P(f.x), P(f.y)); c.fillStyle = f.c; c.fillText(f.t, P(f.x), P(f.y)); }
  c.globalAlpha = 1;
  if (M.flash > 0) { c.fillStyle = `rgba(255,255,255,${M.flash * 2})`; c.fillRect(-20, -20, MD_W + 40, MD_H + 40); }
  if (M.paused && !document.querySelector(".modal-bg")) { c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(0, 0, MD_W, MD_H); }
  c.restore();
}
function mdLoop(ts) {
  const M = MD; if (!M || M.over) return;
  let dt = Math.min(0.05, (ts - M.last) / 1000); M.last = ts;
  M.shake = Math.max(0, M.shake - dt); M.flash = Math.max(0, M.flash - dt);
  if (!M.paused) { if (M.fast) dt *= 2; mdStep(dt); }
  if (MD === M && !M.over) { mdDraw(); M.raf = requestAnimationFrame(mdLoop); }
}

function mdWaveClear() {
  const M = MD; M.phase = "build"; M.bub = null;
  const bonus = 15 + M.w * 3; M.gold += bonus;
  mdBanner(`✅ ${GT("גל", "Wave")} ${M.w} · <span dir="ltr">+${bonus} 🪙</span>`); sfx("coin"); mdHud();
  if (M.w >= M.waves) { setTimeout(() => { if (MD === M) mdEnd(true); }, 900); return; }
  M.qn = 0;
  setTimeout(() => { if (MD === M && !M.over) mdQuiz(); }, 800);
}
/* הפסקת מאמן: 2 שאלות בין גלים. נכון = זהב ממשיך אוטומטית; טעות = הסבר */
function mdQuiz() {
  const M = MD; if (!M || M.over) return;
  if (M.qn >= 2) { $("#mdPanel").innerHTML = ""; mdHud(); return; }
  const q = gqPick(), opts = gqOptions(q), rew = 25 + 10 * Math.min(M.streak, 3);
  const P = $("#mdPanel");
  P.innerHTML = `<div class="md-q"><div class="md-q-h"><b>🧠 ${GT("הפסקת מאמן", "Coach break")} ${M.qn + 1}/2</b><span class="md-rew" dir="ltr">+${rew} 🪙 +1 💥</span><button class="md-skip" id="mdSkip">${GT("דלג", "Skip")} ⏭</button></div>
    <div class="ry-q">${esc(q.q)}</div>${gqBtns(opts)}<div id="mdFb"></div></div>`;
  mdHud();
  $("#mdSkip").onclick = () => { M.qn = 2; sfx("tap"); mdQuiz(); };
  P.querySelectorAll(".ry-o").forEach(b => b.onclick = () => {
    if (P.dataset.lock === "1") return; P.dataset.lock = "1";
    const i = +b.dataset.i, ok = opts[i][1] === q.a;
    record(q, ok ? 1 : 0); M.asked++; save();
    P.querySelectorAll(".ry-o").forEach((x, j) => { x.disabled = true; x.classList.add(opts[j][1] === q.a ? "ok" : j === i ? "no" : "dim"); });
    $("#mdSkip").remove();
    const fin = () => { P.dataset.lock = ""; M.qn++; mdQuiz(); };
    if (ok) {
      M.right++; M.streak++; M.gold += rew; M.charge = Math.min(3, M.charge + 1); sfx("coin"); vib(20); mdHud();
      $("#mdFb").innerHTML = `<div class="ry-fb ok"><div class="ry-fb-h">✓ <span dir="ltr">+${rew} 🪙 +1 💥</span></div></div>`;
      setTimeout(() => { if (MD === M) fin(); }, 1100);
    } else {
      M.streak = 0; M.wrong.push({ q, pick: opts[i][0] }); sfx("no"); vib([40, 50, 40]);
      $("#mdFb").innerHTML = `<div class="ry-fb no"><div class="ry-e">${GT("התשובה", "Answer")}: <b>${esc(gqRight(q))}</b><br>💡 ${esc(q.e)}</div><button class="arc-btn go" id="mdCont">${GT("המשך", "Continue")}</button></div>`;
      $("#mdCont").onclick = fin;
    }
  });
}
function mdEnd(win) {
  const M = MD; if (!M || M.over) return;
  M.over = true; cancelAnimationFrame(M.raf);
  const A = S.arc.md, stars = win ? mdStars(M.lives) : 0;
  if (win) { A.wins++; if (!M.daily) A.stars[M.mapI] = Math.max(A.stars[M.mapI], stars); }
  const daily = M.daily && win ? dailyWin() : 0;
  const coins = (win ? 40 + M.mapI * 20 + stars * 10 : 8 + M.w * 3) + M.right * 2;
  addCoins(coins, true); addXP(15 + M.right * 5 + (win ? 25 : 0));
  touchStreak(); logHistory({ mode: "myth", title: "🏰 Myth Defense", score: pct(M.right, M.asked), n: M.asked }); save();
  sfx(win ? "win" : "lose"); if (win) confetti();
  const unlocked = win && !M.daily && M.mapI < 2 && stars && MD_MAPS[M.mapI + 1];
  setTimeout(() => {
    MD = null;
    arcResult({
      em: win ? "🏆" : "💔", big: win ? "⭐".repeat(stars) + "☆".repeat(3 - stars) : `🌊 ${M.w}/${M.waves}`, gold: win && stars === 3,
      title: win ? GT("חדר הכושר ניצל!", "The gym is safe!") : GT("המיתוסים פרצו פנימה", "The myths broke in"),
      banner: daily ? `📅 ${GT("אתגר יומי הושלם", "Daily challenge complete")} · +100 🪙` : unlocked ? `🔓 ${GT("מפה חדשה נפתחה", "New map unlocked")}: ${unlocked.em} ${GT(unlocked.he, unlocked.en)}` : "",
      stats: [[`${M.right}/${M.asked}`, GT("נכונות", "Correct")], [`👾 ${M.kills}`, GT("מיתוסים הופרכו", "Myths busted")], [`+${coins}`, "🪙"]],
      wrong: M.wrong, again: () => mdStart(M.mapI, M.daily && !daily)
    });
  }, 900);
}

/* ───── חיבור לאפליקציה ───── */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { if (RY && !RY.lock) RY.hid = performance.now(); }
  else {
    if (RY && RY.hid) { RY.end += performance.now() - RY.hid; RY.hid = 0; }
    if (MD) MD.last = performance.now();
  }
});
const arcCards = (home) => `<div class="arc-row ${home ? "arc-home" : ""}" data-notr>
  <button class="arc-card arc-roy" data-arc="roy"><span class="arc-em">👑</span><b>Fit Royale</b><small>${home ? `🏆 ${S.arc.roy.w}` : GT("50 שחקנים · האחרון מנצח", "50 players · last one wins")}</small></button>
  <button class="arc-card arc-md" data-arc="md"><span class="arc-em">🏰</span><b>Myth Defense</b><small>${home ? `⭐ ${S.arc.md.stars.reduce((a, b) => a + b, 0)}/9` : GT("מגדלים נגד מיתוסים", "Towers vs myths")}</small></button></div>`;
const arcBind = root => root.querySelectorAll("[data-arc]").forEach(x => x.onclick = () => ({ roy: () => royaleStart(false), md: mdMenu, daily: dailyStart, shop: () => arcShop(gamesPage), hub: arcadeHub })[x.dataset.arc]());

const _gamesPageA = gamesPage;
gamesPage = function () {
  arcStop(); arcFull(false); ensureArcade();
  _gamesPageA();
  const h = app.querySelector("h2"); if (!h) return;
  h.insertAdjacentHTML("afterend", `<div class="section-title"><h2>🎮 ${GT("ארקייד", "Arcade")}</h2><span class="pill">${GT("חדש", "New")}</span></div>
    ${arcCards(false)}
    <div class="arc-row2" data-notr>
      <button class="arc-mini ${dailyDone() ? "done" : ""}" data-arc="daily">📅 ${GT("אתגר יומי", "Daily")} <i>${dailyDone() ? "✅" : "+100🪙"}</i></button>
      <button class="arc-mini" data-arc="shop">🛒 ${GT("דמויות ומגדלים", "Skins & towers")}</button></div>`);
  arcBind(app);
};
const _goA = go;
go = function (...a) { arcStop(); arcFull(false); return _goA(...a); };
const _renderHomeA = renderHome;
renderHome = function () {
  _renderHomeA();
  if (!app.querySelector(".arc-home")) {
    const a = $("#lhMore"), b = app.querySelector(".tiles3");
    if (a) a.insertAdjacentHTML("beforebegin", arcCards(true)); else if (b) b.insertAdjacentHTML("afterend", arcCards(true));
  }
  arcBind(app);
};
if (typeof tab !== "undefined" && tab === "home" && !session && !document.querySelector(".modal-bg")) { try { renderHome(); } catch (e) { } }
