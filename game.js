/* ═════════ v9.1 – ארקייד: בלוק בלאסט + קרב מגדלים ═════════
   שני משחקים בהשראת Block Blast ו־Clash Royale – עם שאלות מהמאגר כחלק מהמשחק. */

/* ───── עזרים משותפים ───── */
const GT = (he, en) => (typeof isEn === "function" && isEn()) ? en : he;
function ensureArcade() {
  S.best = S.best || {};
  S.best.blast = S.best.blast || 0;
  S.tc = S.tc || { tr: 0, best: 0, w: 0, l: 0 };
}
ensureArcade();

let GQ_RECENT = [];
function gqPick() {
  const ok = q => (q.t === "mc" || q.t === "tf") && !q.img && !GQ_RECENT.includes(q.id);
  let pool = [];
  if (Math.random() < 0.3) pool = mistakes().filter(ok);
  if (!pool.length) pool = freshSort(BANK.filter(ok), true).slice(0, 25);
  if (!pool.length) pool = BANK.filter(q => q.t === "mc" || q.t === "tf");
  const q = pool[Math.floor(Math.random() * Math.min(pool.length, 8))];
  GQ_RECENT.push(q.id); GQ_RECENT = GQ_RECENT.slice(-30);
  return q;
}
function gqOptions(q) {
  return q.t === "tf" ? [[GT("נכון", "True"), true], [GT("לא נכון", "False"), false]] : q.o.map((o, i) => [o, i]);
}
function gqRight(q) { return q.t === "tf" ? (q.a ? GT("נכון", "True") : GT("לא נכון", "False")) : q.o[q.a]; }

/* שאלה בחלון קופץ – מחזירה ok דרך cb */
function gqAsk(title, cb) {
  const q = gqPick(), opts = gqOptions(q);
  const h = sheet(`<div class="gq" data-notr><div class="gq-title">${title}</div>
    <div class="gq-q">${esc(q.q)}</div>
    <div class="gq-opts">${opts.map(([t], i) => `<button class="gq-o" data-i="${i}">${esc(t)}</button>`).join("")}</div>
    <div id="gqFb"></div></div>`, (e, close) => {
    const b = e.target.closest(".gq-o");
    if (b && !h.bg.dataset.done) {
      h.bg.dataset.done = 1;
      const ok = opts[+b.dataset.i][1] === q.a;
      record(q, ok ? 1 : 0); save(); beep(ok, ok ? 4 : 0);
      h.bg.querySelectorAll(".gq-o").forEach((x, i) => { x.disabled = true; if (opts[i][1] === q.a) x.classList.add("ok"); });
      if (!ok) b.classList.add("no");
      $("#gqFb").innerHTML = `<div class="gq-fb ${ok ? "ok" : "no"}">${ok ? GT("✓ נכון!", "✓ Correct!") : GT("✗ התשובה: ", "✗ Answer: ") + `<b>${esc(gqRight(q))}</b>`}</div>
        <div class="gq-e">💡 ${esc(q.e)}</div><button class="btn primary block" id="gqGo">${GT("המשך", "Continue")}</button>`;
      $("#gqGo").onclick = () => { close(); cb(ok); };
      return;
    }
  });
  // לא לסגור בלחיצה על הרקע – רק דרך "המשך"
  h.bg.addEventListener("click", e => { if (e.target === h.bg) e.stopImmediatePropagation(); }, true);
}

/* ═════════ 1. בלוק בלאסט ═════════ */
const BB_N = 8;
const BB_SHAPES = [
  [[0, 0]], [[0, 0], [1, 0]], [[0, 0], [0, 1]], [[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
  [[0, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2]], [[1, 0], [1, 1], [1, 2], [0, 2]], [[0, 0], [1, 0], [2, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [0, 2], [1, 1]], [[1, 0], [1, 1], [1, 2], [0, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]]
];
const BB_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6"];
let BB = null;

function bbFits(g, sh, x, y) {
  return sh.every(([dx, dy]) => { const cx = x + dx, cy = y + dy; return cx >= 0 && cy >= 0 && cx < BB_N && cy < BB_N && !g[cy][cx]; });
}
function bbCanPlace(g, sh) { for (let y = 0; y < BB_N; y++) for (let x = 0; x < BB_N; x++) if (bbFits(g, sh, x, y)) return true; return false; }
function bbNewTray(small) {
  const mk = () => {
    let sh;
    if (small) sh = BB_SHAPES[[0, 1, 2, 3, 4, 9, 13, 14, 15, 16][Math.floor(Math.random() * 10)]];
    else sh = BB_SHAPES[Math.floor(Math.random() * BB_SHAPES.length)];
    return { sh, c: BB_COLORS[Math.floor(Math.random() * BB_COLORS.length)] };
  };
  for (let k = 0; k < 12; k++) {
    const t = [mk(), mk(), mk()];
    if (!BB || t.some(p => bbCanPlace(BB.g, p.sh))) return t;
  }
  return [mk(), mk(), mk()];
}

function blastStart() {
  BB = { g: Array.from({ length: BB_N }, () => Array(BB_N).fill(null)), score: 0, combo: 0, miss: 0, meter: 0, lines: 0,
    pw: { bomb: 0, swap: 0 }, lives: 2, mode: null, asked: 0, right: 0, over: false };
  BB.tray = bbNewTray();
  funScreen(`<div class="bb fade-in" data-notr>
    <div class="qhead"><button class="x" id="fx">✕</button><div class="bb-score"><b id="bbS">0</b><small>${GT("שיא", "Best")} ${S.best.blast}</small></div><div class="bb-combo" id="bbC"></div></div>
    <div class="bb-board" id="bbB" dir="ltr">${Array.from({ length: BB_N * BB_N }, (_, i) => `<i data-i="${i}"></i>`).join("")}</div>
    <div class="bb-tray" id="bbT" dir="ltr"></div>
    <div class="bb-bar">
      <button class="bb-pq" id="bbQ"><span>❓</span><div><b>${GT("שאלת כוח", "Power question")}</b><div class="bb-meter"><i id="bbM"></i></div></div></button>
      <button class="bb-pw" id="bbBomb">💣 <b id="bbBn">0</b></button>
      <button class="bb-pw" id="bbSwap">🔄 <b id="bbSn">0</b></button>
    </div>
    <p class="footer-note">${GT("גרור צורה ללוח · מלא שורה או עמודה כדי לפוצץ · כל 3 פיצוצים = שאלת כוח 💣🔄", "Drag a shape onto the board · fill a row or column to blast it · every 3 blasts = a power question 💣🔄")}</p>
  </div>`);
  $("#fx").onclick = () => { BB = null; go("home"); };
  $("#bbQ").onclick = bbPowerQ;
  $("#bbBomb").onclick = () => { if (!BB.pw.bomb) return toast("💣", GT("ענה על שאלת כוח כדי לקבל פצצה", "Answer a power question to earn a bomb")); BB.mode = BB.mode === "bomb" ? null : "bomb"; bbDraw(); };
  $("#bbSwap").onclick = () => { if (!BB.pw.swap) return toast("🔄", GT("ענה על שאלת כוח כדי לקבל החלפה", "Answer a power question to earn a swap")); BB.pw.swap--; BB.tray = bbNewTray(); bbDraw(); bbCheckOver(); };
  $("#bbB").addEventListener("click", e => {
    if (BB.mode !== "bomb") return;
    const c = e.target.closest("[data-i]"); if (!c) return;
    const i = +c.dataset.i, x = i % BB_N, y = Math.floor(i / BB_N);
    let n = 0;
    for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++) if (yy >= 0 && xx >= 0 && yy < BB_N && xx < BB_N && BB.g[yy][xx]) { BB.g[yy][xx] = null; n++; }
    BB.pw.bomb--; BB.mode = null; BB.score += n * 2; beep(true, 3);
    bbBoom([...Array(9)].map((_, k) => [x - 1 + k % 3, y - 1 + Math.floor(k / 3)]));
    bbDraw();
  });
  bbDraw();
}

function bbDraw() {
  if (!BB) return;
  const cells = $("#bbB").children;
  for (let y = 0; y < BB_N; y++) for (let x = 0; x < BB_N; x++) {
    const el = cells[y * BB_N + x], c = BB.g[y][x];
    el.className = c ? "on" : ""; el.style.background = c || "";
  }
  $("#bbB").classList.toggle("bomb-mode", BB.mode === "bomb");
  $("#bbS").textContent = BB.score;
  $("#bbM").style.width = Math.min(100, BB.meter / 3 * 100) + "%";
  $("#bbQ").classList.toggle("ready", BB.meter >= 3);
  $("#bbBn").textContent = BB.pw.bomb; $("#bbSn").textContent = BB.pw.swap;
  $("#bbBomb").classList.toggle("on", BB.mode === "bomb");
  $("#bbBomb").classList.toggle("has", BB.pw.bomb > 0); $("#bbSwap").classList.toggle("has", BB.pw.swap > 0);
  const tr = $("#bbT");
  tr.innerHTML = BB.tray.map((p, k) => {
    if (!p) return `<div class="bb-slot"></div>`;
    const w = Math.max(...p.sh.map(c => c[0])) + 1, h = Math.max(...p.sh.map(c => c[1])) + 1;
    const fits = bbCanPlace(BB.g, p.sh);
    return `<div class="bb-slot"><div class="bb-piece ${fits ? "" : "dead"}" data-k="${k}" style="--w:${w};--h:${h}">${p.sh.map(([x, y]) => `<i style="grid-column:${x + 1};grid-row:${y + 1};background:${p.c}"></i>`).join("")}</div></div>`;
  }).join("");
  tr.querySelectorAll(".bb-piece").forEach(el => el.addEventListener("pointerdown", bbDrag));
}

function bbDrag(ev) {
  if (!BB || BB.over) return;
  ev.preventDefault();
  if (BB.mode === "bomb") { BB.mode = null; bbDraw(); }
  const k = +ev.currentTarget.dataset.k, p = BB.tray[k]; if (!p) return;
  const board = $("#bbB"), r = board.getBoundingClientRect(), cs = r.width / BB_N;
  const w = Math.max(...p.sh.map(c => c[0])) + 1, h = Math.max(...p.sh.map(c => c[1])) + 1;
  const ghost = document.createElement("div");
  ghost.className = "bb-ghost"; ghost.setAttribute("dir", "ltr");
  ghost.style.cssText = `width:${w * cs}px;height:${h * cs}px;grid-template-columns:repeat(${w},1fr);grid-template-rows:repeat(${h},1fr)`;
  ghost.innerHTML = p.sh.map(([x, y]) => `<i style="grid-column:${x + 1};grid-row:${y + 1};background:${p.c}"></i>`).join("");
  document.body.append(ghost);
  ev.currentTarget.classList.add("lifted");
  const lift = Math.max(70, h * cs * 0.6 + 40);
  let tgt = null;
  const move = e => {
    const gx = e.clientX - (w * cs) / 2, gy = e.clientY - h * cs - lift + cs;
    ghost.style.transform = `translate(${gx}px,${gy}px)`;
    const x = Math.round((gx - r.left) / cs), y = Math.round((gy - r.top) / cs);
    tgt = bbFits(BB.g, p.sh, x, y) ? [x, y] : null;
    bbPreview(p, tgt);
  };
  const up = () => {
    window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
    ghost.remove(); bbPreview(null, null);
    if (tgt) bbPlace(k, tgt[0], tgt[1]); else bbDraw();
  };
  window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  move(ev);
}
function bbPreview(p, t) {
  const cells = $("#bbB")?.children; if (!cells) return;
  for (const c of cells) c.classList.remove("pv", "pvl"), c.style.removeProperty("--pv");
  if (!p || !t) return;
  const g = BB.g.map(r => [...r]);
  p.sh.forEach(([dx, dy]) => { g[t[1] + dy][t[0] + dx] = p.c; const el = cells[(t[1] + dy) * BB_N + t[0] + dx]; el.classList.add("pv"); el.style.setProperty("--pv", p.c); });
  const { rows, cols } = bbFull(g);
  rows.forEach(y => { for (let x = 0; x < BB_N; x++) cells[y * BB_N + x].classList.add("pvl"); });
  cols.forEach(x => { for (let y = 0; y < BB_N; y++) cells[y * BB_N + x].classList.add("pvl"); });
}
function bbFull(g) {
  const rows = [], cols = [];
  for (let i = 0; i < BB_N; i++) { if (g[i].every(Boolean)) rows.push(i); if (g.every(r => r[i])) cols.push(i); }
  return { rows, cols };
}
function bbBoom(list) {
  const cells = $("#bbB").children;
  list.forEach(([x, y]) => { if (x < 0 || y < 0 || x >= BB_N || y >= BB_N) return; const el = cells[y * BB_N + x]; el.classList.remove("boom"); void el.offsetWidth; el.classList.add("boom"); });
}
function bbPlace(k, x, y) {
  const p = BB.tray[k];
  p.sh.forEach(([dx, dy]) => BB.g[y + dy][x + dx] = p.c);
  BB.tray[k] = null; BB.score += p.sh.length;
  const { rows, cols } = bbFull(BB.g), n = rows.length + cols.length;
  if (n) {
    const hit = [];
    rows.forEach(r => { for (let i = 0; i < BB_N; i++) hit.push([i, r]); });
    cols.forEach(c => { for (let i = 0; i < BB_N; i++) hit.push([c, i]); });
    hit.forEach(([cx, cy]) => BB.g[cy][cx] = null);
    BB.combo++; BB.miss = 0; BB.lines += n; BB.meter += n;
    const gain = n * 10 * n * BB.combo;
    BB.score += gain; beep(true, Math.min(8, BB.combo + n));
    const msg = n >= 3 ? GT("מטורף!", "Insane!") : n === 2 ? GT("כפול!", "Double!") : GT("פיצוץ!", "Blast!");
    $("#bbC").innerHTML = `<span class="bb-pop">${msg} ${BB.combo > 1 ? `🔥x${BB.combo}` : ""} <b dir="ltr">+${gain}</b></span>`;
    if (BB.g.every(r => r.every(c => !c))) { BB.score += 300; $("#bbC").innerHTML = `<span class="bb-pop">✨ ${GT("לוח נקי!", "Clear board!")} <b dir="ltr">+300</b></span>`; confetti(); }
    bbDraw(); bbBoom(hit);
  } else {
    BB.miss++; if (BB.miss >= 3) BB.combo = 0;
    if (S.settings.vib && navigator.vibrate) navigator.vibrate(8);
    bbDraw();
  }
  if (BB.tray.every(t => !t)) { BB.tray = bbNewTray(); bbDraw(); }
  bbCheckOver();
}
function bbPowerQ() {
  if (BB.meter < 3) return toast("❓", GT(`פוצץ עוד ${3 - BB.meter} שורות כדי לפתוח שאלת כוח`, `Blast ${3 - BB.meter} more lines to unlock a power question`));
  BB.meter -= 3; BB.asked++;
  gqAsk(GT("❓ שאלת כוח – ענה נכון וקבל עזר", "❓ Power question – answer right to earn a power-up"), ok => {
    if (!BB) return;
    if (ok) {
      BB.right++;
      const pw = Math.random() < 0.55 ? "bomb" : "swap"; BB.pw[pw]++; BB.score += 25;
      toast(pw === "bomb" ? "💣" : "🔄", pw === "bomb" ? GT("קיבלת פצצה! לחץ עליה ואז על הלוח", "You got a bomb! Tap it, then tap the board") : GT("קיבלת החלפת צורות!", "You got a shape swap!"));
    }
    bbDraw(); bbCheckOver();
  });
}
function bbCheckOver() {
  if (!BB || BB.over) return;
  const alive = BB.tray.filter(Boolean);
  if (alive.some(p => bbCanPlace(BB.g, p.sh))) return;
  if (BB.pw.swap || BB.pw.bomb) return toast("💡", GT("אין מקום! השתמש בעזר 💣 או 🔄", "No room! Use a power-up 💣 or 🔄"));
  if (BB.meter >= 3) return toast("💡", GT("אין מקום! נסה שאלת כוח ❓", "No room! Try a power question ❓"));
  if (BB.lives > 0) {
    BB.lives--; BB.asked++;
    return gqAsk(GT(`❤️ הזדמנות שנייה (נשארו ${BB.lives + 1}) – ענה נכון כדי לנקות את מרכז הלוח`, `❤️ Second chance (${BB.lives + 1} left) – answer right to clear the middle of the board`), ok => {
      if (!BB) return;
      if (ok) {
        BB.right++;
        const hit = [];
        for (let y = 2; y < 6; y++) for (let x = 2; x < 6; x++) { BB.g[y][x] = null; hit.push([x, y]); }
        BB.tray = bbNewTray(true); bbDraw(); bbBoom(hit); bbCheckOver();
      } else bbEnd();
    });
  }
  bbEnd();
}
function bbEnd() {
  if (!BB || BB.over) return;
  BB.over = true;
  const sc = BB.score, best = sc > S.best.blast; if (best) S.best.blast = sc;
  const coins = Math.min(80, Math.floor(sc / 40) + BB.right * 3);
  addCoins(coins, true); addXP(10 + Math.min(40, Math.floor(sc / 60)) + BB.right * 5);
  touchStreak(); logHistory({ mode: "blast", title: "🧱 Fit Blast", score: sc, n: BB.asked }); save();
  if (best) confetti();
  setTimeout(() => {
    if (!BB) return;
    funScreen(`<div class="fade-in" data-notr><div class="card" style="text-align:center">
      <div style="font-size:52px">${best ? "🏆" : "🧱"}</div>
      <h1>${best ? GT("שיא חדש!", "New record!") : GT("נגמר המקום!", "Out of room!")}</h1>
      <div class="bb-final" dir="ltr">${sc}</div>
      <div class="grid3"><div class="statbox"><b>${BB.lines}</b><span>${GT("שורות", "Lines")}</span></div><div class="statbox"><b>${BB.right}/${BB.asked}</b><span>${GT("שאלות", "Questions")}</span></div><div class="statbox"><b dir="ltr">+${coins}</b><span>🪙</span></div></div>
      <p class="muted small">${GT("שיא", "Best")}: ${S.best.blast}</p>
      <button class="btn primary lg block" id="bbAgain">${GT("🔁 עוד משחק", "🔁 Play again")}</button>
      <button class="btn block" id="bbHome" style="margin-top:8px">${GT("למשחקים", "Back to games")}</button></div></div>`);
    $("#bbAgain").onclick = blastStart; $("#bbHome").onclick = () => { BB = null; gamesPage(); };
  }, 700);
}

/* ═════════ 2. קרב מגדלים ═════════ */
const TC_ARENAS = [
  { t: 0, em: "🏠", he: "חדר כושר ביתי", en: "Home Gym", bot: 0.75 },
  { t: 150, em: "🏋️", he: "מכון שכונתי", en: "Local Gym", bot: 0.88 },
  { t: 400, em: "🏟️", he: "אולם ספורט", en: "Sports Hall", bot: 0.98 },
  { t: 800, em: "🏆", he: "מרכז אולימפי", en: "Olympic Center", bot: 1.07 },
  { t: 1300, em: "👑", he: "היכל האלופים", en: "Hall of Champions", bot: 1.15 }
];
const TC_CARDS = [
  { k: "run", em: "🏃", he: "ספרינטר", en: "Sprinter", cost: 2, hp: 70, dps: 16, sp: 15, rg: 6 },
  { k: "box", em: "🥊", he: "מתאגרף", en: "Boxer", cost: 3, hp: 130, dps: 30, sp: 9, rg: 6 },
  { k: "lift", em: "🏋️", he: "מרים משקולות", en: "Lifter", cost: 5, hp: 380, dps: 26, sp: 5, rg: 6 },
  { k: "ball", em: "🏐", he: "זורק כדור", en: "Ball Thrower", cost: 4, hp: 80, dps: 28, sp: 7, rg: 24 },
  { k: "bike", em: "🚴", he: "רוכב", en: "Cyclist", cost: 3, hp: 100, dps: 18, sp: 17, rg: 6 },
  { k: "gym", em: "🤸", he: "זוג מתעמלים", en: "Gymnast Duo", cost: 2, hp: 45, dps: 12, sp: 12, rg: 6, n: 2 }
];
const TC_TOWER = 1000, TC_TIME = 150, TC_TOWER_DPS = 34, TC_TOWER_RG = 22;
let TC = null;
const tcArena = tr => { let a = 0; TC_ARENAS.forEach((x, i) => { if (tr >= x.t) a = i; }); return a; };
const tcName = o => GT(o.he, o.en);

function towerMenu() {
  ensureArcade();
  const a = tcArena(S.tc.tr), A = TC_ARENAS[a], N = TC_ARENAS[a + 1];
  funScreen(`<div class="fade-in" data-notr>${funExitBtn()}
    <div class="tc-hero"><div class="tc-aem">${A.em}</div><div class="muted xs">${GT("זירה", "Arena")} ${a + 1}</div><h2>${tcName(A)}</h2>
      <div class="tc-tr">🏆 <b>${S.tc.tr}</b></div>
      ${N ? `<div class="xpbar"><i style="width:${Math.round((S.tc.tr - A.t) / (N.t - A.t) * 100)}%"></i></div><div class="muted xs">${GT("הזירה הבאה", "Next arena")}: ${N.em} ${tcName(N)} · ${N.t} 🏆</div>` : `<div class="muted xs">${GT("הגעת לזירה העליונה!", "You reached the top arena!")}</div>`}
    </div>
    <button class="play-btn" id="tcGo"><span class="pb-ic">⚔️</span><div><b>${GT("לקרב!", "Battle!")}</b><span>${GT("ניצחון", "Win")} +30 🏆 · ${GT("הפסד", "Loss")} −20 🏆</span></div></button>
    <div class="card"><b>${GT("איך משחקים", "How to play")}</b>
      <ol class="tc-how">
        <li>${GT("לוחצים על קלף כדי לשלוח לוחם. כל קלף עולה אליקסיר 💧", "Tap a card to send a fighter. Each card costs elixir 💧")}</li>
        <li>${GT("ענה נכון על שאלות כדי לקבל +2 💧 מיד", "Answer questions correctly to get +2 💧 instantly")}</li>
        <li>${GT("טעות נותנת אליקסיר ליריב – תחשוב לפני שאתה עונה", "A wrong answer gives the enemy elixir – think first")}</li>
        <li>${GT("הורס את המגדל של היריב = 3 כתרים 👑👑👑", "Destroy the enemy tower = 3 crowns 👑👑👑")}</li>
      </ol></div>
    <div class="section-title"><h2>🃏 ${GT("החפיסה שלך", "Your deck")}</h2></div>
    <div class="tc-deck">${TC_CARDS.map(c => `<div class="tc-dc"><span>${c.em}</span><b>${tcName(c)}</b><small>💧${c.cost}</small></div>`).join("")}</div>
    <p class="muted xs" style="text-align:center">${GT("ניצחונות", "Wins")} ${S.tc.w} · ${GT("הפסדים", "Losses")} ${S.tc.l} · ${GT("שיא", "Best")} ${S.tc.best} 🏆</p>
  </div>`);
  bindExit(); $("#tcGo").onclick = towerStart;
}

function towerStart() {
  const a = tcArena(S.tc.tr);
  const deck = shuffle(TC_CARDS.map(c => c.k));
  TC = { a, bot: TC_ARENAS[a].bot, me: { hp: TC_TOWER, el: 5 }, en: { hp: TC_TOWER, el: 5, deck: shuffle(TC_CARDS.map(c => c.k)), cd: 4 },
    hand: deck.slice(0, 4), queue: deck.slice(4), units: [], id: 0, t: TC_TIME, last: 0, raf: 0, paused: false, over: false,
    q: null, qBusy: false, asked: 0, right: 0, streak: 0, fx: [] };
  funScreen(`<div class="tc fade-in" data-notr>
    <div class="tc-top"><button class="x" id="fx">✕</button><div class="tc-hpwrap"><span>🤖</span><div class="tc-hp en"><i id="tcEh"></i></div></div><b class="tc-time" id="tcT" dir="ltr">2:30</b></div>
    <div class="tc-field" id="tcF">
      <div class="tc-tower en" id="tcEt">🏰</div>
      <div class="tc-river"></div>
      <div class="tc-tower me" id="tcMt">🏯</div>
      <div class="tc-banner" id="tcBan"></div>
    </div>
    <div class="tc-hpwrap me"><span>🧑</span><div class="tc-hp me"><i id="tcMh"></i></div></div>
    <div class="tc-hand" id="tcH"></div>
    <div class="tc-elix"><i id="tcEl"></i><b id="tcEn">5</b></div>
    <div class="tc-q" id="tcQ"></div>
  </div>`);
  $("#fx").onclick = () => { towerStop(); go("home"); };
  tcHand(); tcNextQ();
  tcBanner(GT("⚔️ קרב!", "⚔️ Fight!"));
  TC.last = performance.now(); TC.raf = requestAnimationFrame(tcLoop);
}
function towerStop() { if (TC) { cancelAnimationFrame(TC.raf); TC.over = true; } TC = null; }

function tcHand() {
  const h = $("#tcH"); if (!h || !TC) return;
  const nx = TC_CARDS.find(c => c.k === TC.queue[0]);
  h.innerHTML = TC.hand.map((k, i) => { const c = TC_CARDS.find(x => x.k === k); return `<button class="tc-card ${TC.me.el >= c.cost ? "" : "low"}" data-i="${i}"><span>${c.em}</span><small>${tcName(c)}</small><b>💧${c.cost}</b></button>`; }).join("")
    + `<div class="tc-next"><small>${GT("הבא", "Next")}</small><span>${nx ? nx.em : ""}</span></div>`;
  h.querySelectorAll(".tc-card").forEach(b => b.onclick = () => tcPlay(+b.dataset.i));
}
function tcPlay(i) {
  if (!TC || TC.over) return;
  const k = TC.hand[i], c = TC_CARDS.find(x => x.k === k);
  if (TC.me.el < c.cost) { const b = $(`.tc-card[data-i="${i}"]`); b && (b.classList.remove("shake"), void b.offsetWidth, b.classList.add("shake")); return; }
  TC.me.el -= c.cost; tcSpawn("me", c);
  TC.hand[i] = TC.queue.shift(); TC.queue.push(k);
  beep(true, 1); tcHand();
}
function tcSpawn(side, c) {
  for (let j = 0; j < (c.n || 1); j++) {
    const mult = side === "en" ? (0.85 + TC.bot * 0.15) : 1;
    TC.units.push({ id: ++TC.id, side, c, hp: c.hp * mult, max: c.hp * mult, dps: c.dps * mult, p: side === "me" ? 10 + j * 3 : 90 - j * 3, lane: 28 + Math.random() * 44, el: null, hitT: 0 });
  }
}
function tcBanner(t) { const b = $("#tcBan"); if (!b) return; b.textContent = t; b.classList.remove("on"); void b.offsetWidth; b.classList.add("on"); }

function tcLoop(now) {
  if (!TC || TC.over) return;
  const dt = Math.min(0.1, (now - TC.last) / 1000); TC.last = now;
  if (!TC.paused && !document.hidden) tcStep(dt);
  tcRender();
  if (TC && !TC.over) TC.raf = requestAnimationFrame(tcLoop);
}
function tcStep(dt) {
  const T_ = TC, dbl = T_.t <= 60;
  T_.t -= dt;
  if (dbl && !T_.dblShown) { T_.dblShown = true; tcBanner(GT("💧💧 אליקסיר כפול!", "💧💧 Double elixir!")); }
  const reg = dt / 2.8 * (dbl ? 2 : 1);
  T_.me.el = Math.min(10, T_.me.el + reg);
  T_.en.el = Math.min(10, T_.en.el + reg * T_.bot);
  // בוט
  T_.en.cd -= dt;
  if (T_.en.cd <= 0) {
    const threat = T_.units.some(u => u.side === "me" && u.p > 55);
    const opts = T_.en.deck.slice(0, 4).map(k => TC_CARDS.find(c => c.k === k)).filter(c => c.cost <= T_.en.el);
    if (opts.length && (threat || T_.en.el >= 7 || Math.random() < 0.35)) {
      const c = threat ? opts.sort((a, b) => b.dps - a.dps)[0] : opts[Math.floor(Math.random() * opts.length)];
      T_.en.el -= c.cost; tcSpawn("en", c);
      T_.en.deck = T_.en.deck.filter(k => k !== c.k).concat(c.k);
    }
    T_.en.cd = 1.2 + Math.random() * 1.8 / T_.bot;
  }
  // תנועה וקרב
  for (const u of T_.units) {
    if (u.hp <= 0) continue;
    const dir = u.side === "me" ? 1 : -1;
    let tgt = null, best = 1e9;
    for (const v of T_.units) {
      if (v.side === u.side || v.hp <= 0) continue;
      const d = (v.p - u.p) * dir;
      if (d >= -2 && d <= u.c.rg && d < best) { best = d; tgt = v; }
    }
    const atTower = u.side === "me" ? u.p >= 88 : u.p <= 12;
    if (tgt) { tgt.hp -= u.dps * dt; tgt.hitT = 0.15; }
    else if (atTower || (u.c.rg > 10 && (u.side === "me" ? u.p >= 88 - u.c.rg + 6 : u.p <= 12 + u.c.rg - 6))) {
      const tw = u.side === "me" ? T_.en : T_.me; tw.hp -= u.dps * dt; tw.hitT = 0.15;
    } else u.p += dir * u.c.sp * dt;
    u.hitT = Math.max(0, u.hitT - dt);
  }
  // המגדלים יורים
  [["me", T_.me, 4], ["en", T_.en, 96]].forEach(([side, tw, pos]) => {
    let tgt = null, best = 1e9;
    for (const v of T_.units) { if (v.side === side || v.hp <= 0) continue; const d = Math.abs(v.p - pos); if (d <= TC_TOWER_RG && d < best) { best = d; tgt = v; } }
    if (tgt) { tgt.hp -= TC_TOWER_DPS * (side === "en" ? T_.bot : 1) * dt; tgt.hitT = 0.15; }
    tw.hitT = Math.max(0, (tw.hitT || 0) - dt);
  });
  // ניקוי מתים
  T_.units = T_.units.filter(u => { if (u.hp > 0) return true; if (u.el) { u.el.classList.add("dead"); const e = u.el; setTimeout(() => e.remove(), 350); } return false; });
  if (T_.me.hp <= 0 || T_.en.hp <= 0 || T_.t <= 0) tcEnd();
}
function tcRender() {
  if (!TC) return;
  const F = $("#tcF"); if (!F) return;
  for (const u of TC.units) {
    if (!u.el) { u.el = document.createElement("div"); u.el.className = "tc-u " + u.side; u.el.innerHTML = `<span>${u.c.em}</span><i><b></b></i>`; F.append(u.el); }
    u.el.style.bottom = `calc(${u.p}% - 16px)`; u.el.style.left = u.lane + "%";
    u.el.querySelector("b").style.width = Math.max(0, u.hp / u.max * 100) + "%";
    u.el.classList.toggle("hit", u.hitT > 0);
  }
  $("#tcEh").style.width = Math.max(0, TC.en.hp / TC_TOWER * 100) + "%";
  $("#tcMh").style.width = Math.max(0, TC.me.hp / TC_TOWER * 100) + "%";
  $("#tcEt").classList.toggle("hit", TC.en.hitT > 0); $("#tcMt").classList.toggle("hit", TC.me.hitT > 0);
  const s = Math.max(0, Math.ceil(TC.t));
  $("#tcT").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  $("#tcT").classList.toggle("dbl", TC.t <= 60);
  $("#tcEl").style.width = TC.me.el * 10 + "%"; $("#tcEn").textContent = Math.floor(TC.me.el);
  const fl = Math.floor(TC.me.el);
  if (fl !== TC.lastEl) { TC.lastEl = fl; document.querySelectorAll(".tc-card").forEach(b => { const c = TC_CARDS.find(x => x.k === TC.hand[+b.dataset.i]); b.classList.toggle("low", TC.me.el < c.cost); }); }
}

function tcNextQ() {
  if (!TC || TC.over) return;
  const q = gqPick(), opts = gqOptions(q); TC.q = q; TC.qBusy = false;
  const box = $("#tcQ");
  box.innerHTML = `<div class="tc-qhead"><span>❓ ${GT("ענה נכון = +2 💧", "Answer right = +2 💧")}</span>${TC.streak >= 2 ? `<span class="tc-st">🔥 ${TC.streak}</span>` : ""}</div>
    <div class="tc-qq">${esc(q.q)}</div>
    <div class="tc-qo ${q.t === "tf" ? "tf" : ""}">${opts.map(([t], i) => `<button data-i="${i}">${esc(t)}</button>`).join("")}</div>`;
  box.querySelectorAll("button").forEach(b => b.onclick = () => {
    if (!TC || TC.qBusy) return; TC.qBusy = true;
    const ok = opts[+b.dataset.i][1] === q.a; TC.asked++;
    record(q, ok ? 1 : 0); save();
    box.querySelectorAll("button").forEach((x, i) => { x.disabled = true; if (opts[i][1] === q.a) x.classList.add("ok"); });
    if (ok) {
      TC.right++; TC.streak++;
      const bonus = 2 + (TC.streak % 3 === 0 ? 1 : 0);
      TC.me.el = Math.min(10, TC.me.el + bonus); beep(true, Math.min(6, TC.streak));
      box.insertAdjacentHTML("beforeend", `<div class="tc-fb ok">✓ +${bonus} 💧${bonus > 2 ? " 🔥" : ""}</div>`);
      setTimeout(tcNextQ, 900);
    } else {
      b.classList.add("no"); TC.streak = 0; TC.en.el = Math.min(10, TC.en.el + 2); beep(false);
      box.insertAdjacentHTML("beforeend", `<div class="tc-fb no">✗ ${GT("היריב קיבל +2 💧", "Enemy got +2 💧")}</div><div class="tc-e">💡 ${esc(q.e)}</div><button class="btn sm block" id="tcQn">${GT("הבנתי ➜", "Got it ➜")}</button>`);
      $("#tcQn").onclick = tcNextQ;
    }
  });
}

function tcEnd() {
  if (!TC || TC.over) return;
  TC.over = true; cancelAnimationFrame(TC.raf);
  const me = Math.max(0, TC.me.hp), en = Math.max(0, TC.en.hp);
  const res = en <= 0 && me > 0 ? "win" : me <= 0 && en > 0 ? "lose" : me > en ? "win" : en > me ? "lose" : "draw";
  const crowns = res === "win" ? (en <= 0 ? 3 : en < TC_TOWER * 0.5 ? 2 : 1) : 0;
  const aBefore = TC.a, d = res === "win" ? 30 : res === "lose" ? -20 : 0;
  S.tc.tr = Math.max(0, S.tc.tr + d); S.tc.best = Math.max(S.tc.best, S.tc.tr);
  if (res === "win") S.tc.w++; else if (res === "lose") S.tc.l++;
  const aAfter = tcArena(S.tc.tr);
  const coins = res === "win" ? 20 + aAfter * 10 + crowns * 5 : 5 + TC.right;
  addCoins(coins, true); addXP(15 + TC.right * 4 + (res === "win" ? 20 : 0));
  touchStreak(); logHistory({ mode: "tower", title: "⚔️ Tower Clash", score: pct(TC.right, TC.asked || 1), n: TC.asked }); save();
  const right = TC.right, asked = TC.asked;
  if (res === "win") confetti();
  setTimeout(() => {
    towerStop();
    const up = aAfter > aBefore, A = TC_ARENAS[aAfter];
    funScreen(`<div class="fade-in" data-notr><div class="card tc-res" style="text-align:center">
      <div class="tc-crowns">${[0, 1, 2].map(i => `<span class="${i < crowns ? "on" : ""}" style="animation-delay:${0.2 + i * 0.25}s">👑</span>`).join("")}</div>
      <h1>${res === "win" ? GT("ניצחון!", "Victory!") : res === "lose" ? GT("הפסד", "Defeat") : GT("תיקו", "Draw")}</h1>
      <div class="tc-trd ${d >= 0 ? "up" : "down"}" dir="ltr">${d >= 0 ? "+" : ""}${d} 🏆</div>
      ${up ? `<div class="banner-win">${A.em} ${GT("זירה חדשה נפתחה", "New arena unlocked")}: ${tcName(A)}!</div>` : ""}
      ${res === "win" ? `<div class="tc-chest">🎁<div><b>${GT("תיבת ניצחון", "Victory chest")}</b><div dir="ltr">+${coins} 🪙</div></div></div>` : `<p class="muted small">${GT("טיפ: כל תשובה נכונה = עוד 2 💧. עונים מהר, שולחים יותר לוחמים.", "Tip: each right answer = 2 more 💧. Answer fast, send more fighters.")}</p>`}
      <div class="grid3"><div class="statbox"><b>${right}/${asked}</b><span>${GT("תשובות נכונות", "Correct")}</span></div><div class="statbox"><b>${S.tc.tr}</b><span>🏆</span></div><div class="statbox"><b dir="ltr">+${coins}</b><span>🪙</span></div></div>
      <button class="btn primary lg block" id="tcAgain">${GT("⚔️ עוד קרב", "⚔️ Battle again")}</button>
      <button class="btn block" id="tcMenu" style="margin-top:8px">${GT("לזירה", "Arena")}</button></div></div>`);
    $("#tcAgain").onclick = towerStart; $("#tcMenu").onclick = towerMenu;
  }, 900);
}

/* ───── חיבור לאפליקציה ───── */
const _gamesPageA = gamesPage;
gamesPage = function () {
  _gamesPageA();
  const h = app.querySelector("h2"); if (!h) return;
  h.insertAdjacentHTML("afterend", `<div class="section-title"><h2>🔥 ${GT("ארקייד", "Arcade")}</h2><span class="pill">${GT("חדש", "New")}</span></div>
    <div class="arc-row" data-notr>
      <button class="arc-card arc-bb" id="arcBB"><span class="arc-em">🧱</span><b>Fit Blast</b><small>${GT("פוצץ שורות · שאלות = עזרים", "Blast lines · questions = power-ups")}</small><i>${GT("שיא", "Best")} ${S.best.blast}</i></button>
      <button class="arc-card arc-tc" id="arcTC"><span class="arc-em">⚔️</span><b>Tower Clash</b><small>${GT("קלפים, אליקסיר ומגדלים", "Cards, elixir and towers")}</small><i>🏆 ${S.tc.tr} · ${TC_ARENAS[tcArena(S.tc.tr)].em}</i></button>
    </div>`);
  $("#arcBB").onclick = blastStart; $("#arcTC").onclick = towerMenu;
};
const _goA = go;
go = function (...a) { if (TC) towerStop(); BB = null; return _goA(...a); };
document.addEventListener("visibilitychange", () => { if (TC && !TC.over) TC.last = performance.now(); });
const arcRow = () => `<div class="arc-row arc-home" data-notr>
  <button class="arc-card arc-bb" data-arc="bb"><span class="arc-em">🧱</span><b>Fit Blast</b><small>${GT("שיא", "Best")} ${S.best.blast}</small></button>
  <button class="arc-card arc-tc" data-arc="tc"><span class="arc-em">⚔️</span><b>Tower Clash</b><small>🏆 ${S.tc.tr} · ${TC_ARENAS[tcArena(S.tc.tr)].em}</small></button></div>`;
const _renderHomeA = renderHome;
renderHome = function () {
  _renderHomeA();
  if (!app.querySelector(".arc-home")) {
    const a = $("#lhMore"), b = app.querySelector(".tiles3");
    if (a) a.insertAdjacentHTML("beforebegin", arcRow()); else if (b) b.insertAdjacentHTML("afterend", arcRow());
  }
  app.querySelectorAll("[data-arc]").forEach(x => x.onclick = () => x.dataset.arc === "bb" ? blastStart() : towerMenu());
};
if (typeof tab !== "undefined" && tab === "home" && !session && !document.querySelector(".modal-bg")) { try { renderHome(); } catch (e) { } }
