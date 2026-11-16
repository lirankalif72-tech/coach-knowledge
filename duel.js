/* ═════════════ דו־קרב (אותו טלפון / אונליין) ולוח מובילים ═════════════ */
const DUEL_N = 10, DUEL_T = 15, LOCAL_T = 20;
let duel = null, lduel = null;

/* ── עזרים ── */
function duelQuestions(seed) {
  const r = rng(seed);
  const pool = BANK.filter(q => q.t !== "open" && !q.img);
  return pickBalanced(pool, DUEL_N, r).map(q => ({ q, order: q.t === "mc" ? shuffle(q.o.map((_, i) => i), r) : [1, 0] }));
}
const optLabel = (q, v) => q.t === "mc" ? q.o[v] : (v ? "נכון" : "לא נכון");
const isRight = (q, v) => v === q.a;
const LETTERS = ["א", "ב", "ג", "ד"];
function recordRival(name, res, via) {
  if (!name) return;
  name = String(name).slice(0, 24);
  S.rivals = S.rivals || {};
  const r = S.rivals[name] = S.rivals[name] || { w: 0, l: 0, d: 0 };
  if (res > 0) r.w++; else if (res < 0) r.l++; else r.d++;
  r.t = Date.now(); r.via = via || r.via; save();
}
function needName() {
  if (S.name) return Promise.resolve(true);
  return new Promise(res => {
    const { bg } = sheet(`<h2>איך קוראים לך?</h2><p class="muted small">השם יוצג ליריבים ובלוח המובילים.</p>
      <input class="search" id="nmIn" maxlength="24" placeholder="השם שלך" autocomplete="nickname">
      <div class="row" style="margin-top:12px"><button class="btn" data-r="0">ביטול</button><button class="btn primary" data-r="1">שמירה</button></div>`,
      (e, close) => {
        const r = e.target.dataset.r; if (r === undefined) return;
        const v = bg.querySelector("#nmIn").value.trim();
        if (r === "1" && !v) return bg.querySelector("#nmIn").focus();
        if (r === "1") { S.name = v.slice(0, 24); save(); }
        close(); res(r === "1");
      });
    setTimeout(() => bg.querySelector("#nmIn").focus(), 50);
  });
}
function duelCleanup() {
  if (lduel) { clearTimeout(lduel.tm); lduel = null; }
  if (duel) {
    clearInterval(duel.ti); clearTimeout(duel.to); clearTimeout(duel.nx);
    try { duel.conn && duel.conn.open && duel.conn.send({ t: "bye" }); } catch (e) { }
    try { duel.peer && duel.peer.destroy(); } catch (e) { }
    duel = null;
  }
}
const _goOrig = go;
go = function (t, sub) { duelCleanup(); const r = _goOrig(t, sub); lbSync(); return r; };

/* ── תפריט ── */
function duelMenu() {
  sheet(`<h2>⚔️ דו־קרב</h2><p class="muted small">10 שאלות. מי שעונה נכון ומהר יותר – מנצח.</p>
    <div class="duel-opts">
      <button class="duel-opt" data-d="local"><span>📱</span><div><b>על אותו טלפון</b><small>שניים מול שניים – כל אחד בצד שלו של המסך</small></div></button>
      <button class="duel-opt" data-d="host"><span>🌐</span><div><b>פתח חדר אונליין</b><small>מקבלים קוד ושולחים לחבר</small></div></button>
      <button class="duel-opt" data-d="join"><span>🔑</span><div><b>הצטרף עם קוד</b><small>חבר פתח חדר? הכנס את הקוד שלו</small></div></button>
      <button class="duel-opt" data-d="lb"><span>🏆</span><div><b>לוח מובילים</b><small>חברים, יריבים והשיאים שלך</small></div></button>
    </div>`, (e, close) => {
    const b = e.target.closest("[data-d]"); if (!b) return; close();
    ({ local: localSetup, host: hostDuel, join: joinSheet, lb: () => renderLeaderboard() })[b.dataset.d]();
  });
}

/* ═════ דו־קרב על אותו טלפון ═════ */
function localSetup() {
  const { bg } = sheet(`<h2>📱 דו־קרב על אותו טלפון</h2>
    <p class="muted small">מניחים את הטלפון על השולחן, כל שחקן יושב מצד אחר. מי שלוחץ ראשון על התשובה הנכונה – מקבל נקודה. טעות = אתה בחוץ לשאלה הזאת.</p>
    <label class="small">שחקן 1 (למטה)</label><input class="search" id="p1" maxlength="20" value="${esc(S.name || "שחקן 1")}">
    <label class="small" style="margin-top:8px;display:block">שחקן 2 (למעלה)</label><input class="search" id="p2" maxlength="20" placeholder="שחקן 2">
    <div class="row" style="margin-top:14px"><button class="btn" data-r="0">ביטול</button><button class="btn primary" data-r="1">התחל! ⚔️</button></div>`,
    (e, close) => {
      const r = e.target.dataset.r; if (r === undefined) return; close();
      if (r === "1") startLocal([bg.querySelector("#p1").value.trim() || "שחקן 1", bg.querySelector("#p2").value.trim() || "שחקן 2"]);
    });
}
function startLocal(names) {
  duelCleanup(); stopTimer(); session = null;
  lduel = { names, qs: duelQuestions(Math.floor(Math.random() * 2e9)), i: 0, sc: [0, 0], lock: [false, false], done: false, win: -1, pick: [null, null] };
  document.body.classList.add("in-quiz");
  renderLocal();
}
function localHalf(p) {
  const L = lduel, { q, order } = L.qs[L.i];
  const btns = order.map((v, k) => {
    let cls = "";
    if (L.done && isRight(q, v)) cls = "ok";
    else if (L.pick[p] === k) cls = "no";
    return `<button class="lopt ${cls}" data-p="${p}" data-k="${k}" ${L.lock[p] || L.done ? "disabled" : ""}><span>${LETTERS[k]}</span>${esc(optLabel(q, v))}</button>`;
  }).join("");
  const st = L.done ? (L.win === p ? `<div class="lmsg win">✅ נקודה ל${esc(L.names[p])}!</div>` : L.win === -1 ? `<div class="lmsg">אף אחד לא צדק</div>` : `<div class="lmsg">${esc(L.names[1 - p])} היה מהיר יותר</div>`)
    : L.lock[p] ? `<div class="lmsg lose">❌ טעות – מחכים ליריב</div>` : "";
  return `<div class="lhalf p${p}"><div class="lname">${esc(L.names[p])} · <b>${L.sc[p]}</b></div><div class="lq">${esc(q.q)}</div><div class="lopts">${btns}</div>${st}</div>`;
}
function renderLocal() {
  const L = lduel; if (!L) return;
  app.innerHTML = `<div class="local-duel">${localHalf(1)}
    <div class="lmid"><button class="x" id="lquit">✕</button><span>שאלה ${L.i + 1}/${L.qs.length}</span><span class="lscore">${L.sc[0]} : ${L.sc[1]}</span></div>
    ${localHalf(0)}</div>`;
  $("#lquit").onclick = async () => { if (await modal("לצאת מהדו־קרב?", "התוצאה לא תישמר.", "יציאה", "המשך")) go("home"); };
  app.querySelectorAll(".lopt").forEach(b => b.onclick = () => localTap(+b.dataset.p, +b.dataset.k));
  clearTimeout(L.tm);
  if (!L.done) L.tm = setTimeout(() => { if (lduel === L && !L.done) { L.done = true; L.win = -1; beep(false); renderLocal(); localNext(); } }, LOCAL_T * 1000);
}
function localTap(p, k) {
  const L = lduel; if (!L || L.done || L.lock[p]) return;
  const { q, order } = L.qs[L.i];
  L.pick[p] = k;
  if (isRight(q, order[k])) { L.sc[p]++; L.done = true; L.win = p; beep(true); }
  else { L.lock[p] = true; beep(false); if (L.lock[1 - p]) { L.done = true; L.win = -1; } }
  renderLocal();
  if (L.done) localNext();
}
function localNext() {
  const L = lduel; clearTimeout(L.tm);
  L.tm = setTimeout(() => {
    if (lduel !== L) return;
    if (L.i >= L.qs.length - 1) return finishLocal();
    L.i++; L.lock = [false, false]; L.pick = [null, null]; L.done = false; L.win = -1; renderLocal();
  }, 1900);
}
function finishLocal() {
  const L = lduel, [a, b] = L.sc, w = a > b ? 0 : b > a ? 1 : -1;
  if (S.name && L.names[0] === S.name) recordRival(L.names[1], w === 0 ? 1 : w === 1 ? -1 : 0, "טלפון");
  addXP(20); touchStreak(); logHistory({ mode: "duel", title: "דו־קרב על אותו טלפון", score: pct(a, L.qs.length), n: L.qs.length, extra: `${a}:${b}` }); save();
  confetti(); beep(true, 6);
  app.innerHTML = `<div class="fade-in"><div class="card stage-res" style="text-align:center">
    <div style="font-size:64px" class="pop">${w === -1 ? "🤝" : "🏆"}</div>
    <h1>${w === -1 ? "תיקו!" : `${esc(L.names[w])} ניצח/ה!`}</h1>
    <div class="vs-big"><div><b>${a}</b><span>${esc(L.names[0])}</span></div><em>:</em><div><b>${b}</b><span>${esc(L.names[1])}</span></div></div>
    <div class="col" style="margin-top:16px"><button class="btn primary lg block" id="lAgain">🔁 עוד סיבוב</button><button class="btn block" id="lHome">🏠 לבית</button></div></div></div>`;
  $("#lAgain").onclick = () => startLocal(L.names);
  $("#lHome").onclick = () => go("home");
}

/* ═════ דו־קרב אונליין (PeerJS) ═════ */
const PEER_PREFIX = "ck-duel-v1-";
function peerReady() {
  if (window.Peer) return true;
  modal("אין חיבור", "דו־קרב אונליין דורש חיבור לאינטרנט. נסה שוב כשאתה מחובר.", "הבנתי", null);
  return false;
}
async function hostDuel(code) {
  if (!(await needName()) || !peerReady()) return;
  duelCleanup(); session = null; stopTimer();
  code = code || String(1000 + Math.floor(Math.random() * 9000));
  duel = { role: "host", code, peer: new Peer(PEER_PREFIX + code, { debug: 0 }), my: 0, opp: 0 };
  document.body.classList.add("in-quiz");
  renderLobby("מתחבר לשרת...");
  const d = duel;
  d.peer.on("open", () => { if (duel === d) renderLobby(); });
  d.peer.on("connection", c => { if (duel !== d) return; if (d.conn) { c.on("open", () => { c.send({ t: "full" }); setTimeout(() => c.close(), 300); }); return; } setupConn(c); });
  d.peer.on("error", e => { if (duel !== d) return; if (e.type === "unavailable-id") { duel = null; try { d.peer.destroy(); } catch (x) { } hostDuel(); } else duelError(e); });
}
function renderLobby(status) {
  const d = duel; if (!d) return;
  const link = `${baseUrl()}?duel=${d.code}`;
  app.innerHTML = `<div class="fade-in lobby">
    <div class="qhead"><button class="x" id="dquit">✕</button><div style="flex:1"></div></div>
    <div class="card" style="text-align:center">
      <div style="font-size:46px">🌐</div><h2>החדר שלך מוכן</h2>
      <p class="muted small">שלח לחבר את הקוד או את הקישור:</p>
      <div class="room-code" dir="ltr">${d.code.split("").map(c => `<span>${c}</span>`).join("")}</div>
      <button class="btn primary lg block" id="shareRoom">📤 שלח לחבר</button>
      <div class="waiting"><i></i><i></i><i></i><span>${status || "מחכה שהחבר יצטרף..."}</span></div>
    </div>
    <p class="footer-note">המשחק מתחיל אוטומטית כשהחבר מצטרף. השאר את המסך פתוח.</p></div>`;
  $("#dquit").onclick = () => go("home");
  $("#shareRoom").onclick = async () => {
    const text = `⚔️ ${S.name} מזמין/ה אותך לדו־קרב במאמן ידע! קוד החדר: ${d.code}\n${link}`;
    try { if (navigator.share) await navigator.share({ title: "דו־קרב – מאמן ידע", text }); else { await navigator.clipboard.writeText(text); toast("📋", "הקישור הועתק – הדבק אותו לחבר"); } } catch (e) { }
  };
}
function joinSheet(prefill) {
  const { bg } = sheet(`<h2>🔑 הצטרפות לחדר</h2><p class="muted small">הכנס את 4 הספרות שהחבר שלח לך.</p>
    <input class="search code-in" id="codeIn" inputmode="numeric" maxlength="4" dir="ltr" placeholder="0000" value="${prefill || ""}">
    <div class="row" style="margin-top:12px"><button class="btn" data-r="0">ביטול</button><button class="btn primary" data-r="1">הצטרף ⚔️</button></div>`,
    (e, close) => {
      const r = e.target.dataset.r; if (r === undefined) return;
      const v = bg.querySelector("#codeIn").value.replace(/\D/g, "");
      if (r === "1" && v.length !== 4) { toast("🔢", "הקוד הוא 4 ספרות"); return; }
      close(); if (r === "1") joinDuel(v);
    });
  setTimeout(() => bg.querySelector("#codeIn").focus(), 50);
}
async function joinDuel(code) {
  if (!(await needName()) || !peerReady()) return;
  duelCleanup(); session = null; stopTimer();
  duel = { role: "guest", code, peer: new Peer({ debug: 0 }), my: 0, opp: 0 };
  const d = duel;
  document.body.classList.add("in-quiz");
  app.innerHTML = `<div class="fade-in lobby"><div class="qhead"><button class="x" id="dquit">✕</button><div style="flex:1"></div></div>
    <div class="card" style="text-align:center"><div style="font-size:46px">🔑</div><h2>מתחבר לחדר ${esc(code)}</h2><div class="waiting"><i></i><i></i><i></i><span>רגע...</span></div></div></div>`;
  $("#dquit").onclick = () => go("home");
  d.peer.on("open", () => { if (duel !== d) return; setupConn(d.peer.connect(PEER_PREFIX + code, { reliable: true })); });
  d.peer.on("error", e => { if (duel === d) duelError(e); });
  d.to = setTimeout(() => { if (duel === d && !d.started) duelError({ type: "peer-unavailable" }); }, 15000);
}
function duelError(e) {
  const msg = e && e.type === "peer-unavailable" ? "לא מצאנו חדר עם הקוד הזה. בדוק שהקוד נכון ושהחבר עדיין במסך ההמתנה."
    : e && e.type === "network" ? "בעיית רשת. בדוק את החיבור לאינטרנט ונסה שוב."
    : "החיבור נכשל. נסו שוב – ואם זה חוזר, נסו רשת אחרת (למשל נתונים סלולריים במקום Wi‑Fi).";
  go("home");
  modal("לא הצלחנו להתחבר 😕", msg, "הבנתי", null);
}
function setupConn(c) {
  const d = duel; d.conn = c;
  c.on("open", () => { if (duel !== d) return; c.send({ t: "hello", n: S.name, v: APP_VERSION, b: BANK.length }); });
  c.on("data", m => { if (duel === d) onDuelMsg(m); });
  c.on("close", () => { if (duel === d) oppLeft(); });
  c.on("error", () => { if (duel === d) oppLeft(); });
}
function onDuelMsg(m) {
  const d = duel; if (!m || !m.t) return;
  if (m.t === "full") { go("home"); modal("החדר מלא", "מישהו אחר כבר משחק בחדר הזה.", "הבנתי", null); return; }
  if (m.t === "hello") {
    d.oppName = String(m.n || "יריב").slice(0, 24);
    if (m.b !== BANK.length) toast("🔄", "לאחד מכם יש גרסה ישנה – כדאי לעדכן את האפליקציה");
    if (d.role === "host") hostStart();
  } else if (m.t === "start") startOnline(m.seed);
  else if (m.t === "ans") { d.oppAns[m.i] = { k: m.k, ok: !!m.ok, pts: +m.pts || 0 }; if (m.i === d.i) renderOnline(); checkAdvance(); }
  else if (m.t === "rematch") { if (d.role === "host") { toast("⚔️", `${d.oppName} רוצה נקמה!`); setTimeout(() => duel === d && hostStart(), 900); } }
  else if (m.t === "bye") oppLeft();
}
function hostStart() {
  const seed = Math.floor(Math.random() * 2e9);
  duel.conn.send({ t: "start", seed }); startOnline(seed);
}
function startOnline(seed) {
  const d = duel; clearTimeout(d.to); clearTimeout(d.nx); clearInterval(d.ti);
  Object.assign(d, { started: true, over: false, qs: duelQuestions(seed), i: 0, my: 0, opp: 0, myAns: {}, oppAns: {} });
  showOnlineQ();
}
function showOnlineQ() {
  const d = duel; d.qStart = Date.now(); d.reveal = false;
  renderOnline();
  clearInterval(d.ti);
  d.ti = setInterval(() => {
    if (duel !== d) return clearInterval(d.ti);
    const left = DUEL_T - (Date.now() - d.qStart) / 1000, bar = $("#dTime");
    if (bar) bar.style.width = Math.max(0, left / DUEL_T * 100) + "%";
    if (left <= 0 && !d.myAns[d.i]) myAnswer(null);
  }, 100);
}
function myAnswer(k) {
  const d = duel; if (!d || d.myAns[d.i] || d.over) return;
  const { q, order } = d.qs[d.i];
  const ok = k !== null && isRight(q, order[k]);
  const left = Math.max(0, DUEL_T - (Date.now() - d.qStart) / 1000);
  const pts = ok ? 100 + Math.round(50 * left / DUEL_T) : 0;
  d.myAns[d.i] = { k, ok, pts }; d.my += pts;
  beep(ok);
  try { d.conn.send({ t: "ans", i: d.i, k, ok, pts }); } catch (e) { }
  renderOnline(); checkAdvance();
}
function checkAdvance() {
  const d = duel; if (!d || d.reveal || !d.myAns[d.i] || !d.oppAns[d.i]) return;
  d.reveal = true; d.opp = Object.values(d.oppAns).reduce((a, x) => a + x.pts, 0);
  clearInterval(d.ti); renderOnline();
  d.nx = setTimeout(() => {
    if (duel !== d) return;
    if (d.i >= d.qs.length - 1) return finishOnline();
    d.i++; showOnlineQ();
  }, 2300);
}
function renderOnline() {
  const d = duel; if (!d || !d.qs) return;
  const { q, order } = d.qs[d.i], mine = d.myAns[d.i], theirs = d.oppAns[d.i];
  const oppScore = Object.entries(d.oppAns).reduce((a, [i, x]) => a + (+i < d.i || d.reveal ? x.pts : 0), 0);
  const opts = order.map((v, k) => {
    let cls = "";
    if (d.reveal && isRight(q, v)) cls = "ok";
    else if (mine && mine.k === k) cls = d.reveal ? (mine.ok ? "ok" : "no") : "sel";
    const oppMark = d.reveal && theirs && theirs.k === k ? `<em class="opp-mark">${esc(d.oppName.slice(0, 1))}</em>` : "";
    return `<button class="opt ${cls}" data-k="${k}" ${mine ? "disabled" : ""}><span class="k">${LETTERS[k]}</span><span>${esc(optLabel(q, v))}</span>${oppMark}</button>`;
  }).join("");
  const oppStatus = d.reveal ? (theirs.ok ? `✅ ${esc(d.oppName)} צדק/ה (+${theirs.pts})` : `❌ ${esc(d.oppName)} טעה/תה`) : theirs ? `⚡ ${esc(d.oppName)} כבר ענה/תה!` : `⏳ ${esc(d.oppName)} חושב/ת...`;
  const myStatus = d.reveal ? (mine.ok ? `✅ צדקת! ‎+${mine.pts}` : mine.k === null ? "⏰ הזמן נגמר" : "❌ טעות") : mine ? "מחכים ליריב..." : "";
  app.innerHTML = `<div class="online-duel">
    <div class="duel-score"><div class="me"><b>${d.my}</b><span>${esc(S.name)}</span></div><div class="vsx">VS<small>${d.i + 1}/${d.qs.length}</small></div><div class="op"><b>${oppScore}</b><span>${esc(d.oppName)}</span></div></div>
    <div class="dtime"><i id="dTime" style="width:${d.reveal || mine ? 0 : 100}%"></i></div>
    <div class="qtext">${esc(q.q)}</div>
    <div id="opts">${opts}</div>
    <div class="duel-status"><span>${myStatus}</span><span>${oppStatus}</span></div>
    <button class="link-btn xs" id="dquit" style="margin-top:14px">יציאה מהדו־קרב</button></div>`;
  app.querySelectorAll("#opts .opt").forEach(b => b.onclick = () => myAnswer(+b.dataset.k));
  $("#dquit").onclick = async () => { if (await modal("לצאת מהדו־קרב?", "היריב ינצח ניצחון טכני.", "יציאה", "המשך")) go("home"); };
}
function oppLeft() {
  const d = duel; if (!d || d.over) return;
  if (!d.started) { go("home"); modal("החבר התנתק", "החיבור נסגר לפני שהמשחק התחיל.", "הבנתי", null); return; }
  d.left = true; finishOnline();
}
function finishOnline() {
  const d = duel; if (!d || d.over) return;
  d.over = true; clearInterval(d.ti); clearTimeout(d.nx);
  d.opp = Object.values(d.oppAns).reduce((a, x) => a + x.pts, 0);
  const res = d.left ? 1 : d.my > d.opp ? 1 : d.my < d.opp ? -1 : 0;
  const coins = res > 0 ? 40 : res === 0 ? 20 : 10;
  addCoins(coins, true); addXP(res > 0 ? 40 : 20);
  recordRival(d.oppName, res, "אונליין");
  S.duels = S.duels || { w: 0, l: 0, d: 0 }; S.duels[res > 0 ? "w" : res < 0 ? "l" : "d"]++;
  touchStreak(); logHistory({ mode: "duel", title: `דו־קרב מול ${d.oppName}`, score: pct(Object.values(d.myAns).filter(x => x.ok).length, d.qs.length), n: d.qs.length, extra: `${d.my}:${d.opp}` });
  save(); lbSync(true);
  if (res > 0) confetti();
  beep(res >= 0, res > 0 ? 8 : 0);
  const r = S.rivals[d.oppName] || { w: 0, l: 0, d: 0 };
  app.innerHTML = `<div class="fade-in"><div class="card stage-res" style="text-align:center">
    <div style="font-size:64px" class="pop">${res > 0 ? "🏆" : res === 0 ? "🤝" : "💪"}</div>
    <h1>${d.left ? "היריב יצא – ניצחת!" : res > 0 ? "ניצחת!" : res === 0 ? "תיקו!" : `${esc(d.oppName)} ניצח/ה הפעם`}</h1>
    <div class="vs-big"><div><b>${d.my}</b><span>${esc(S.name)}</span></div><em>:</em><div><b>${d.opp}</b><span>${esc(d.oppName)}</span></div></div>
    <p class="muted small">המאזן שלכם: ${r.w} ניצחונות · ${r.l} הפסדים${r.d ? ` · ${r.d} תיקו` : ""} · <span dir="ltr">+${coins} 🪙</span></p>
    <div class="col" style="margin-top:14px">
      ${d.left ? "" : `<button class="btn primary lg block" id="dRe">⚔️ ${d.role === "host" ? "נקמה!" : "בקש נקמה"}</button>`}
      <div class="row"><button class="btn" id="dLb" style="flex:1">🏆 לוח מובילים</button><button class="btn" id="dHome" style="flex:1">🏠 לבית</button></div>
    </div></div></div>`;
  $("#dRe") && ($("#dRe").onclick = () => {
    if (d.role === "host") hostStart();
    else { try { d.conn.send({ t: "rematch" }); } catch (e) { } $("#dRe").disabled = true; $("#dRe").textContent = "⏳ מחכה לאישור..."; }
  });
  $("#dLb").onclick = () => renderLeaderboard("friends");
  $("#dHome").onclick = () => go("home");
}

/* ═════ לוח מובילים ═════ */
const lbOn = () => typeof LB_URL === "string" && /^https:\/\//.test(LB_URL);
const uid = () => (S.uid = S.uid || Math.random().toString(36).slice(2, 10) + Date.now().toString(36));
let lbLast = 0;
function lbSync(force) {
  if (!lbOn() || !S.name || (S.settings.lbHide)) return;
  if (!force && Date.now() - lbLast < 90000) return;
  lbLast = Date.now();
  const body = { n: S.name.slice(0, 24), xp: S.xp | 0, lv: levelOf(S.xp), st: totalStars(), sp: S.best.speed | 0, sv: S.best.survival | 0, w: (S.duels && S.duels.w) | 0, t: Date.now() };
  fetch(`${LB_URL.replace(/\/$/, "")}/lb/${uid()}.json`, { method: "PUT", body: JSON.stringify(body) }).catch(() => { });
}
function lbRemove() { if (lbOn() && S.uid) fetch(`${LB_URL.replace(/\/$/, "")}/lb/${S.uid}.json`, { method: "DELETE" }).catch(() => { }); }
function renderLeaderboard(tabK) {
  duelCleanup(); stopTimer(); session = null; document.body.classList.remove("in-quiz");
  const tabsList = [...(lbOn() ? [["world", "🌍 עולמי"]] : []), ["friends", "🤝 חברים"], ["me", "🏅 השיאים שלי"]];
  tabK = tabK && tabsList.some(t => t[0] === tabK) ? tabK : tabsList[0][0];
  app.innerHTML = `<div class="fade-in">
    <div class="section-title" style="margin-top:4px"><h2>🏆 לוח מובילים</h2><button class="btn sm" id="lbBack">חזרה</button></div>
    <div class="seg" id="lbTabs">${tabsList.map(([k, n]) => `<button data-k="${k}" class="${k === tabK ? "on" : ""}">${n}</button>`).join("")}</div>
    <div id="lbBody" style="margin-top:12px"></div></div>`;
  $("#lbBack").onclick = () => go("home");
  app.querySelectorAll("#lbTabs button").forEach(b => b.onclick = () => renderLeaderboard(b.dataset.k));
  const body = $("#lbBody");
  if (tabK === "world") lbWorld(body);
  else if (tabK === "friends") lbFriends(body);
  else lbMe(body);
  window.scrollTo(0, 0);
}
const medal = i => ["🥇", "🥈", "🥉"][i] || `<span class="rk">${i + 1}</span>`;
async function lbWorld(body) {
  if (!S.name) { body.innerHTML = `<div class="card" style="text-align:center"><p>כדי להופיע בלוח צריך שם.</p><button class="btn primary" id="lbName">בחירת שם</button></div>`; $("#lbName").onclick = async () => { if (await needName()) { lbSync(true); setTimeout(() => renderLeaderboard("world"), 700); } }; return; }
  body.innerHTML = `<div class="card"><div class="waiting"><i></i><i></i><i></i><span>טוען את הלוח...</span></div></div>`;
  lbSync(true);
  await new Promise(r => setTimeout(r, 400));
  try {
    const res = await fetch(`${LB_URL.replace(/\/$/, "")}/lb.json?orderBy=%22xp%22&limitToLast=50`);
    if (!res.ok) throw 0;
    const data = await res.json() || {};
    const rows = Object.entries(data).map(([id, v]) => ({ id, ...v })).filter(r => r && typeof r.n === "string").sort((a, b) => b.xp - a.xp);
    const meIdx = rows.findIndex(r => r.id === S.uid);
    body.innerHTML = `<div class="card lb-list">${rows.length ? rows.map((r, i) => `<div class="lb-row ${r.id === S.uid ? "me" : ""}"><span class="lb-rank">${medal(i)}</span><div class="lb-n"><b>${esc(r.n)}</b><small>רמה ${r.lv || 1} · ⭐ ${r.st || 0}${r.w ? ` · ⚔️ ${r.w}` : ""}</small></div><b class="lb-v" dir="ltr">${(r.xp || 0).toLocaleString()} XP</b></div>`).join("") : `<p class="muted">עוד אין שחקנים בלוח – תהיה הראשון!</p>`}</div>
      <p class="footer-note">${meIdx >= 0 ? `אתה במקום ${meIdx + 1} 🎉` : "עוד לא בטופ 50 – כל תשובה נכונה מקרבת אותך!"}</p>
      <div class="card flat"><div class="switch-row" style="border:0"><div><b class="small">להופיע בלוח העולמי</b><div class="muted xs">מוצגים רק השם וההישגים</div></div><label class="switch"><input type="checkbox" id="lbShow" ${S.settings.lbHide ? "" : "checked"}><i></i></label></div></div>`;
  } catch (e) {
    body.innerHTML = `<div class="card"><p>לא הצלחנו לטעון את הלוח העולמי. בדוק את החיבור לאינטרנט.</p></div>`;
  }
  const sw = $("#lbShow");
  sw && (sw.onchange = () => { S.settings.lbHide = !sw.checked; save(); if (S.settings.lbHide) { lbRemove(); toast("🙈", "הוסרת מהלוח העולמי"); } else { lbSync(true); toast("🌍", "חזרת ללוח העולמי"); } setTimeout(() => renderLeaderboard("world"), 800); });
}
function lbFriends(body) {
  const list = Object.entries(S.rivals || {}).map(([n, r]) => ({ n, ...r })).sort((a, b) => (b.w - b.l) - (a.w - a.l) || b.t - a.t);
  const d = S.duels || { w: 0, l: 0, d: 0 };
  body.innerHTML = `<div class="grid3"><div class="statbox"><b>${d.w}</b><span>ניצחונות אונליין</span></div><div class="statbox"><b>${d.l}</b><span>הפסדים</span></div><div class="statbox"><b>${Object.keys(S.rivals || {}).length}</b><span>יריבים</span></div></div>
    <div class="card lb-list" style="margin-top:12px">${list.length ? list.map((r, i) => {
      const lead = r.w > r.l ? "lead" : r.w < r.l ? "trail" : "";
      return `<div class="lb-row"><span class="lb-rank">${medal(i)}</span><div class="lb-n"><b>${esc(r.n)}</b><small>${r.via ? esc(r.via) + " · " : ""}${r.t ? new Date(r.t).toLocaleDateString("he-IL") : ""}</small></div><span class="lb-v h2h ${lead}"><span class="hw">✅ ${r.w}</span><span class="hl">❌ ${r.l}</span>${r.d ? `<span class="hd">🤝 ${r.d}</span>` : ""}</span></div>`;
    }).join("") : `<div style="text-align:center"><div style="font-size:40px">🤝</div><p class="muted">עוד לא שיחקת נגד חברים. כל דו־קרב ואתגר חבר יופיעו כאן עם המאזן ביניכם.</p></div>`}</div>
    <p class="footer-note">✅ ניצחונות שלך · ❌ הפסדים · 🤝 תיקו</p>
    <button class="btn primary lg block" id="lbDuel">⚔️ לדו־קרב חדש</button>`;
  $("#lbDuel").onclick = duelMenu;
}
function lbMe(body) {
  const d = S.duels || { w: 0 }, L = levelOf(S.xp);
  const rows = [["🎓", "רמה", `${L} · ${levelTitle(L)}`], ["✨", "XP", S.xp.toLocaleString()], ["⭐", "כוכבים במסע", `${totalStars()}/${maxStars()}`], ["👑", "בוסים שהובסו", Object.values(S.jr || {}).filter(m => m.boss).length],
    ["⚡", "שיא מהירות", S.best.speed], ["❤️", "שיא הישרדות", S.best.survival], ["🔥", "קומבו מרבי", S.best.combo || 0], ["📅", "רצף ימים שיא", S.streak.best || 0], ["⚔️", "ניצחונות בדו־קרב", d.w || 0], ["✅", "תשובות נכונות", S.correct || 0]];
  body.innerHTML = `<div class="card lb-list">${rows.map(([em, n, v]) => `<div class="lb-row"><span class="lb-rank">${em}</span><div class="lb-n"><b>${n}</b></div><b class="lb-v">${v}</b></div>`).join("")}</div>`;
}

/* ── הזמנה בקישור: ?duel=1234 ── */
(function () {
  const c = new URLSearchParams(location.search).get("duel");
  if (!c || !/^\d{4}$/.test(c)) return;
  history.replaceState(null, "", baseUrl());
  const ask = () => modal("⚔️ הוזמנת לדו־קרב!", `חבר מחכה לך בחדר ${c}. להצטרף?`, "יאללה! ⚔️", "לא עכשיו").then(ok => ok && joinDuel(c));
  S.onboarded ? setTimeout(ask, 400) : setTimeout(function wait() { S.onboarded ? ask() : setTimeout(wait, 1000); }, 1000);
})();
