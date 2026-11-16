/* ═════════════ מפת גוף, מיליונר, טיימר אימון, "מה הטעות?", הקראה בקול, סיכומים להדפסה ומפת חום ═════════════ */

/* ───── 1. מפת גוף אינטראקטיבית ───── */
const MUSCLES = {
  pecs: { n: "החזה הגדול", act: "קירוב וסיבוב פנימי של הזרוע, דחיפה קדימה", ex: ["לחיצת חזה", "שכיבות סמיכה", "פרפר"], k: ["חזה"] },
  delts: { n: "הדלתא (כתפיים)", act: "הרמת הזרוע קדימה, הצידה ואחורה", ex: ["לחיצת כתפיים", "הרמה צידית", "פרפר הפוך"], k: ["דלתא", "כתף"] },
  biceps: { n: "הדו־ראשי", act: "כפיפת המרפק וסיבוב האמה כלפי חוץ", ex: ["כפיפת מרפקים", "מתח באחיזה הפוכה", "חתירה"], k: ["דו־ראשי", "כפיפת מרפק"] },
  forearms: { n: "שרירי האמה", act: "אחיזה, כפיפה ופשיטה של שורש כף היד", ex: ["הליכת חקלאי", "כפיפת 'פטיש'", "תלייה על מתח"], k: ["אחיזה", "ברכיורדיאליס"] },
  abs: { n: "ישר הבטן", act: "כפיפת הגו ושמירה על יציבות הליבה", ex: ["Dead bug", "פלאנק", "כפיפות בטן"], k: ["ישר הבטן", "בטן", "ליבה"] },
  obliques: { n: "האלכסוניים", act: "סיבוב והטיה של הגו, יציבות צידית", ex: ["פלאנק צידי", "Pallof press", "Woodchop"], k: ["אלכסונ"] },
  quads: { n: "הארבע־ראשי", act: "פשיטת הברך (ישר הירך גם כופף את הירך)", ex: ["סקוואט", "לאנג׳", "לחיצת רגליים"], k: ["ארבע־ראשי", "פשיטת ברכיים", "סקוואט"] },
  tibialis: { n: "השוקי הקדמי", act: "הרמת כף הרגל לכיוון השוק (כפיפה גבית)", ex: ["הליכה על העקבים", "הרמת בהונות"], k: ["שוקי הקדמי", "כפיפה גבית"] },
  traps: { n: "הטרפז", act: "הרמה, קירוב והורדה של השכמות", ex: ["Face pull", "חתירה", "משיכת כתפיים"], k: ["טרפז", "שכמ"] },
  lats: { n: "הרחב הגבי", act: "משיכת הזרוע למטה ולאחור, קירוב וסיבוב פנימי", ex: ["מתח", "פולי עליון", "חתירה"], k: ["רחב הגבי", "מתח", "פולי"] },
  triceps: { n: "התלת־ראשי", act: "פשיטת המרפק", ex: ["פשיטת מרפקים בפולי", "מקבילים", "לחיצה צרה"], k: ["תלת־ראשי", "פשיטת מרפק"] },
  erectors: { n: "זוקפי הגו", act: "פשיטה ויציבות של עמוד השדרה", ex: ["Bird dog", "דדליפט רומני", "גשר"], k: ["זוקפי", "גב תחתון", "עמוד השדרה"] },
  glutes: { n: "העכוז (ישבן)", act: "פשיטת ירך (הגדול), הרחקה וייצוב אגן (האמצעי)", ex: ["היפ תראסט", "גשר", "דדליפט"], k: ["עכוז", "ישבן"] },
  hams: { n: "ההמסטרינג", act: "כפיפת הברך ופשיטת הירך", ex: ["דדליפט רומני", "כפיפת ברכיים", "גשר על רגל אחת"], k: ["המסטרינג", "ירך אחורי"] },
  calves: { n: "התאומים והסולאוס", act: "עלייה על הבהונות (כפיפה כפית)", ex: ["הרמת עקבים בעמידה", "הרמת עקבים בישיבה", "קפיצות"], k: ["תאומים", "סולאוס", "שוק"] }
};
const BODY_BASE = `<circle cx="100" cy="28" r="18" class="bb"/><rect x="92" y="44" width="16" height="10" class="bb"/>
  <path d="M62 56 Q100 48 138 56 L134 200 Q100 212 66 200 Z" class="bb"/>
  <rect x="38" y="62" width="20" height="120" rx="10" class="bb"/><rect x="142" y="62" width="20" height="120" rx="10" class="bb"/>
  <circle cx="47" cy="190" r="8" class="bb"/><circle cx="153" cy="190" r="8" class="bb"/>
  <rect x="68" y="200" width="28" height="170" rx="13" class="bb"/><rect x="104" y="200" width="28" height="170" rx="13" class="bb"/>
  <ellipse cx="80" cy="378" rx="14" ry="7" class="bb"/><ellipse cx="120" cy="378" rx="14" ry="7" class="bb"/>`;
const BODY_FRONT = `<ellipse data-m="delts" cx="60" cy="70" rx="13" ry="12"/><ellipse data-m="delts" cx="140" cy="70" rx="13" ry="12"/>
  <ellipse data-m="pecs" cx="83" cy="86" rx="17" ry="12"/><ellipse data-m="pecs" cx="117" cy="86" rx="17" ry="12"/>
  <rect data-m="abs" x="89" y="104" width="22" height="72" rx="8"/>
  <ellipse data-m="obliques" cx="76" cy="140" rx="8" ry="26"/><ellipse data-m="obliques" cx="124" cy="140" rx="8" ry="26"/>
  <ellipse data-m="biceps" cx="48" cy="104" rx="8" ry="20"/><ellipse data-m="biceps" cx="152" cy="104" rx="8" ry="20"/>
  <ellipse data-m="forearms" cx="47" cy="155" rx="7" ry="20"/><ellipse data-m="forearms" cx="153" cy="155" rx="7" ry="20"/>
  <ellipse data-m="quads" cx="82" cy="252" rx="13" ry="40"/><ellipse data-m="quads" cx="118" cy="252" rx="13" ry="40"/>
  <ellipse data-m="tibialis" cx="83" cy="330" rx="7" ry="28"/><ellipse data-m="tibialis" cx="117" cy="330" rx="7" ry="28"/>`;
const BODY_BACK = `<path data-m="traps" d="M100 50 L130 62 L112 110 L100 118 L88 110 L70 62 Z"/>
  <ellipse data-m="delts" cx="60" cy="70" rx="13" ry="12"/><ellipse data-m="delts" cx="140" cy="70" rx="13" ry="12"/>
  <ellipse data-m="lats" cx="78" cy="128" rx="14" ry="30"/><ellipse data-m="lats" cx="122" cy="128" rx="14" ry="30"/>
  <rect data-m="erectors" x="94" y="120" width="12" height="74" rx="6"/>
  <ellipse data-m="triceps" cx="48" cy="104" rx="8" ry="20"/><ellipse data-m="triceps" cx="152" cy="104" rx="8" ry="20"/>
  <ellipse data-m="forearms" cx="47" cy="155" rx="7" ry="20"/><ellipse data-m="forearms" cx="153" cy="155" rx="7" ry="20"/>
  <ellipse data-m="glutes" cx="85" cy="214" rx="15" ry="14"/><ellipse data-m="glutes" cx="115" cy="214" rx="15" ry="14"/>
  <ellipse data-m="hams" cx="82" cy="266" rx="12" ry="34"/><ellipse data-m="hams" cx="118" cy="266" rx="12" ry="34"/>
  <ellipse data-m="calves" cx="83" cy="330" rx="9" ry="26"/><ellipse data-m="calves" cx="117" cy="330" rx="9" ry="26"/>`;
function bodyMap(side = "front", sel = null) {
  const m = sel && MUSCLES[sel], qs = m ? BANK.filter(q => q.t !== "open" && m.k.some(k => (q.q + " " + (q.t === "mc" ? q.o[q.a] : "") + " " + q.e).includes(k))) : [];
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>🧍 מפת הגוף</h2><p class="muted small">הקש על שריר כדי לראות מה הוא עושה ואיך מאמנים אותו</p>
    <div class="seg" id="bmSide" style="margin:8px 0">${[["front", "מלפנים"], ["back", "מאחור"]].map(([k, v]) => `<button data-k="${k}" class="${side === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <div class="bm-wrap"><svg viewBox="0 0 200 392" class="bodymap">${BODY_BASE}<g class="mus">${side === "front" ? BODY_FRONT : BODY_BACK}</g></svg></div>
    <div id="bmInfo">${m ? `<div class="card bm-card"><h2>${esc(m.n)}</h2><div class="rules"><div><span>⚙️</span><span>${esc(m.act)}</span></div><div><span>🏋️</span><span>${m.ex.map(esc).join(" · ")}</span></div></div>
      ${qs.length >= 3 ? `<button class="btn primary block" id="bmQ">🎯 ${Math.min(8, qs.length)} שאלות על השריר</button>` : ""}</div>` : `<div class="card muted small" style="text-align:center">👆 בחר שריר באיור</div>`}</div></div>`);
  bindExit();
  app.querySelectorAll("#bmSide button").forEach(b => b.onclick = () => bodyMap(b.dataset.k, null));
  app.querySelectorAll("[data-m]").forEach(el => { if (el.dataset.m === sel) el.classList.add("on"); el.onclick = () => { beep(true, 2); bodyMap(side, el.dataset.m); setTimeout(() => $("#bmInfo") && $("#bmInfo").scrollIntoView({ behavior: "smooth", block: "nearest" }), 50); }; });
  $("#bmQ") && ($("#bmQ").onclick = () => startMode("coach", { qs: shuffle(freshSort(qs, true).slice(0, 8)), title: `🧍 ${m.n}` }));
}

/* ───── 2. מיליונר ───── */
const MIL_PRIZE = [5, 10, 15, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 500], MIL_SAFE = [4, 9];
function millionaire() {
  const mc = BANK.filter(q => q.t === "mc" && q.o.length === 4);
  const pickL = (ls, n) => freshSort(mc.filter(q => ls.includes(q.l))).slice(0, n);
  const qs = [...pickL(["easy"], 5), ...pickL(["medium"], 5), ...pickL(["hard", "expert"], 5)];
  let i = 0, order = [], cut = [], aud = null, friend = null, chosen = null, used = { fifty: 0, aud: 0, friend: 0 };
  const safeWon = () => { let w = 0; MIL_SAFE.forEach(s => { if (i > s) w = MIL_PRIZE[s]; }); return w; };
  const draw = () => {
    const q = qs[i]; if (chosen === null && !order.length) order = shuffle([0, 1, 2, 3]);
    funScreen(`<div class="fade-in mil">${funExitBtn()}<div class="who-top"><span>💰 מיליונר · שאלה ${i + 1}/15</span><b dir="ltr">🪙 ${MIL_PRIZE[i]}</b></div>
      <div class="mil-ladder">${MIL_PRIZE.map((p, k) => `<span class="${k === i ? "cur" : k < i ? "won" : ""} ${MIL_SAFE.includes(k) ? "safe" : ""}">${p}</span>`).join("")}</div>
      <div class="qtext">${esc(q.q)}</div>
      <div id="opts">${order.map((oi, d) => { let cls = ""; if (chosen !== null) { if (oi === q.a) cls = "ok"; else if (d === chosen) cls = "no"; } const hid = cut.includes(d);
        return `<button class="opt ${cls} ${hid ? "cut" : ""}" data-d="${d}" ${chosen !== null || hid ? "disabled" : ""}><span class="k">${LETTERS[d]}</span><span>${esc(q.o[oi])}</span>${aud && !hid ? `<em class="aud" style="--p:${aud[d]}%">${aud[d]}%</em>` : ""}</button>`; }).join("")}</div>
      ${friend ? `<div class="feedback info">📞 החבר שלך: "אני די בטוח שזה <b>${esc(friend)}</b>"</div>` : ""}
      ${chosen === null ? `<div class="mil-life"><button data-l="fifty" ${used.fifty ? "disabled" : ""}>✂️ 50:50</button><button data-l="aud" ${used.aud ? "disabled" : ""}>📊 קהל</button><button data-l="friend" ${used.friend ? "disabled" : ""}>📞 חבר</button><button data-l="walk" ${i === 0 ? "disabled" : ""}>🏳️ פורש (${i ? MIL_PRIZE[i - 1] : 0})</button></div>`
        : `<div class="feedback ${order[chosen] === q.a ? "good" : "bad"}"><b class="t">${order[chosen] === q.a ? (i === 14 ? "מיליונר!!! 🏆" : "נכון! 💰") : "טעות 💔"}</b>${linkTerms(q.e)}</div><div class="qactions"><button class="btn primary lg" id="milN">${order[chosen] === q.a && i < 14 ? "לשאלה הבאה ←" : "לתוצאה 🏁"}</button></div>`}</div>`);
    bindExit();
    app.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { chosen = +b.dataset.d; const ok = order[chosen] === q.a; beep(ok, ok ? i / 2 : 0); if (ok && i === 14) confetti(); draw(); });
    app.querySelectorAll("[data-l]").forEach(b => b.onclick = () => {
      const l = b.dataset.l;
      if (l === "walk") return end(i ? MIL_PRIZE[i - 1] : 0, "פרשת בזמן 🏳️");
      used[l] = 1;
      if (l === "fifty") { const wrong = order.map((oi, d) => ({ oi, d })).filter(x => x.oi !== q.a); cut = shuffle(wrong).slice(0, 2).map(x => x.d); }
      if (l === "aud") { const acc = { easy: .8, medium: .62, hard: .48, expert: .4 }[q.l] || .6, ok = Math.round((acc + (Math.random() - .5) * .16) * 100); const w = order.map((oi, d) => oi === q.a || cut.includes(d) ? 0 : Math.random() + .2), tw = w.reduce((a, b) => a + b, 0) || 1; aud = order.map((oi, d) => oi === q.a ? ok : cut.includes(d) ? 0 : Math.round((100 - ok) * w[d] / tw)); }
      if (l === "friend") { const right = Math.random() < ({ easy: .9, medium: .75, hard: .6, expert: .5 }[q.l] || .7); const opts = order.map((oi, d) => ({ oi, d })).filter(x => !cut.includes(x.d)); const pickO = right ? opts.find(x => x.oi === q.a) : rpick(opts.filter(x => x.oi !== q.a)); friend = q.o[pickO.oi]; }
      beep(true, 3); draw();
    });
    $("#milN") && ($("#milN").onclick = () => {
      if (order[chosen] !== q.a) return end(safeWon(), "נפלת לנקודת הביטחון");
      if (i === 14) return end(MIL_PRIZE[14], "ענית נכון על כל 15 השאלות!");
      i++; chosen = null; order = []; cut = []; aud = null; friend = null; draw();
    });
  };
  const end = (prize, why) => {
    addCoins(prize, true); addXP(i * 8); touchStreak(); S.best.mil = Math.max(S.best.mil || 0, prize); save(); if (prize >= 100) confetti();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:60px">💰</div><h1>${prize >= 500 ? "מיליונר! 🏆" : prize >= 100 ? "סכום יפה!" : "בפעם הבאה – יותר"}</h1>
      <div class="big-num" dir="ltr">+${prize} 🪙</div><p class="muted">${esc(why)} · השיא שלך: ${S.best.mil}</p>
      <div class="col" style="margin-top:12px"><button class="btn primary lg block" id="mA">🔁 משחק חדש</button><button class="btn block" id="mH">🏠 לבית</button></div></div></div>`);
    $("#mA").onclick = millionaire; $("#mH").onclick = () => go("home");
  };
  draw();
}

/* ───── 3. טיימר אימון ───── */
const TIMER_PRESETS = { tabata: { n: "טבטה", w: 20, r: 10, x: 8 }, hiit: { n: "HIIT", w: 40, r: 20, x: 10 }, emom: { n: "EMOM", w: 60, r: 0, x: 10 }, custom: { n: "מותאם", w: 30, r: 15, x: 6 } };
let tmr = null;
function renderTimer(body) {
  S.tmr = S.tmr || { p: "tabata", ...TIMER_PRESETS.tabata };
  const c = S.tmr;
  body.innerHTML = `<div class="card"><div class="seg wrap" id="tmP">${Object.entries(TIMER_PRESETS).map(([k, p]) => `<button data-k="${k}" class="${c.p === k ? "on" : ""}">${p.n}</button>`).join("")}</div>
    <div class="row" style="margin-top:10px;gap:8px">${[["w", "עבודה (שנ׳)"], ["r", "מנוחה (שנ׳)"], ["x", "סבבים"]].map(([k, l]) => `<div style="flex:1"><label class="lbl">${l}</label><input class="search" type="number" inputmode="numeric" data-f="${k}" value="${c[k]}" min="0" max="600"></div>`).join("")}</div>
    <p class="muted xs" style="margin:8px 0 0">${({ tabata: "20 שניות עבודה, 10 מנוחה, 8 סבבים = 4 דקות.", hiit: "40/20 – אינטרוולים קלאסיים.", emom: "משימה בתחילת כל דקה, ומנוחה בשאר הדקה.", custom: "קבע בעצמך." })[c.p]}</p></div>
    <div class="card timer-card"><div class="tm-phase" id="tmPh">מוכן?</div><div class="tm-big" id="tmT" dir="ltr">00:00</div><div class="muted" id="tmR">סבב 0/${c.x}</div>
      <div class="xpbar" style="margin:12px 0"><i id="tmBar" style="width:0%"></i></div>
      <div class="row"><button class="btn primary lg" id="tmGo" style="flex:2">▶ התחל</button><button class="btn lg" id="tmRe" style="flex:1">↺</button></div></div>`;
  body.querySelectorAll("#tmP button").forEach(b => b.onclick = () => { stopTimerX(); S.tmr = { p: b.dataset.k, ...TIMER_PRESETS[b.dataset.k] }; save(); renderTimer(body); });
  body.querySelectorAll("[data-f]").forEach(i => i.onchange = () => { c[i.dataset.f] = Math.max(i.dataset.f === "x" ? 1 : 0, Math.min(600, +i.value || 0)); c.p = "custom"; save(); });
  $("#tmGo").onclick = () => tmr && tmr.run ? pauseTimerX() : startTimerX();
  $("#tmRe").onclick = () => { stopTimerX(); renderTimer(body); };
}
function stopTimerX() { if (tmr) { clearInterval(tmr.iv); try { tmr.lock && tmr.lock.release(); } catch (e) { } } tmr = null; }
function pauseTimerX() { if (!tmr) return; tmr.run = false; tmr.left = tmr.end - Date.now(); clearInterval(tmr.iv); $("#tmGo") && ($("#tmGo").textContent = "▶ המשך"); }
async function startTimerX() {
  const c = S.tmr;
  if (!tmr) tmr = { round: 1, phase: "work", left: c.w * 1000 };
  tmr.run = true; tmr.end = Date.now() + tmr.left;
  try { tmr.lock = tmr.lock || (navigator.wakeLock && await navigator.wakeLock.request("screen")); } catch (e) { }
  $("#tmGo").textContent = "⏸ השהה"; beep(true, 6);
  let lastSec = -1;
  tmr.iv = setInterval(() => {
    if (!$("#tmT")) return stopTimerX();
    const left = Math.max(0, tmr.end - Date.now()), sec = Math.ceil(left / 1000), dur = (tmr.phase === "work" ? c.w : c.r) * 1000;
    $("#tmT").textContent = fmtTime(sec); $("#tmPh").textContent = tmr.phase === "work" ? "💪 עבודה" : "😮‍💨 מנוחה";
    $("#tmPh").className = "tm-phase " + tmr.phase; $("#tmR").textContent = `סבב ${tmr.round}/${c.x}`; $("#tmBar").style.width = (100 - left / dur * 100) + "%";
    if (sec !== lastSec && sec <= 3 && sec > 0) beep(false); lastSec = sec;
    if (left <= 0) {
      if (tmr.phase === "work" && c.r > 0) { tmr.phase = "rest"; tmr.end = Date.now() + c.r * 1000; beep(true, 2); if (navigator.vibrate) navigator.vibrate(200); }
      else if (tmr.round < c.x) { tmr.round++; tmr.phase = "work"; tmr.end = Date.now() + c.w * 1000; beep(true, 8); if (navigator.vibrate) navigator.vibrate([100, 60, 100]); }
      else { const r = c.x; stopTimerX(); $("#tmPh").textContent = "🏁 סיימת!"; $("#tmT").textContent = "00:00"; $("#tmGo").textContent = "▶ שוב"; confetti(); beep(true, 10); addXP(10); touchStreak(); save(); toast("💪", `כל הכבוד! ${r} סבבים`); }
    }
  }, 200);
}
const _renderToolsM = renderTools;
renderTools = function (sub) {
  if (sub && sub.seg) foodSeg = sub.seg;
  if (foodSeg !== "timer") { _renderToolsM(sub); }
  else {
    app.innerHTML = `<div class="fade-in"><h1>⏱️ טיימר אימון</h1><div class="seg" id="tseg" style="margin:8px 0 6px"></div><div id="tbody"></div></div>`;
    renderTimer($("#tbody"));
  }
  const seg = $("#tseg");
  if (seg) {
    seg.innerHTML = [["food", "🍽️ אוכל"], ["calc", "🧮 מחשבונים"], ["timer", "⏱️ טיימר"]].map(([k, v]) => `<button data-k="${k}" class="${foodSeg === k ? "on" : ""}">${v}</button>`).join("");
    seg.onclick = e => { const b = e.target.closest("button"); if (!b) return; stopTimerX(); foodSeg = b.dataset.k; renderTools(); };
  }
};

/* ───── 4. מה הטעות? ───── */
const SPOT = [
  { d: 0, a: "הגב מתעגל והעקבים מתרוממים", o: ["הידיים מושטות קדימה", "הרגליים ברוחב הכתפיים", "הירידה איטית מדי"] },
  { d: 1, a: "הגב התחתון מעוגל במשיכה", o: ["המוט קרוב מדי לרגליים", "הברכיים כפופות מעט", "המבט מופנה קדימה"] },
  { d: 2, a: "האגן שוקע והגב נכנס לקשת", o: ["הידיים מתחת לכתפיים", "הראש בהמשך הגב", "הירידה עד קרוב לרצפה"] },
  { d: 3, a: "הגו נוטה קדימה והברך בורחת קדימה", o: ["הברך האחורית יורדת לרצפה", "הצעד רחב מדי", "הידיים לצד הגוף"] },
  { d: 4, a: "קשת מוגזמת בגב התחתון", o: ["המשקל עולה מעל הראש", "הרגליים צמודות זו לזו", "המרפקים ישרים בסוף"] }
];
function spotMistake() {
  const items = shuffle(SPOT); let i = 0, ok = 0, chosen = null, opts = [];
  const draw = () => {
    if (i >= items.length) return end();
    const s = items[i], d = DEMOS[s.d]; if (chosen === null) opts = shuffle([s.a, ...s.o]);
    funScreen(`<div class="fade-in">${funExitBtn()}<div class="who-top"><span>📸 מה הטעות? · ${i + 1}/${items.length}</span><b>✓ ${ok}</b></div>
      <div class="card" style="text-align:center"><b>${d.n}</b><canvas id="spC" width="300" height="300" style="width:220px;max-width:70vw;display:block;margin:6px auto;background:var(--card2);border-radius:16px"></canvas></div>
      <div id="opts">${opts.map((o, k) => { let cls = ""; if (chosen !== null) { if (o === s.a) cls = "ok"; else if (k === chosen) cls = "no"; } return `<button class="opt ${cls}" data-k="${k}" ${chosen !== null ? "disabled" : ""}><span class="k">${LETTERS[k]}</span><span>${esc(o)}</span></button>`; }).join("")}</div>
      ${chosen !== null ? `<div class="feedback info"><b class="t">✅ איך עושים נכון:</b>${esc(d.cue)}</div><div class="qactions"><button class="btn primary lg" id="spN">${i < items.length - 1 ? "הבאה ←" : "לסיום 🏁"}</button></div>` : ""}</div>`);
    bindExit();
    const c = $("#spC"), ctx = c.getContext("2d"), t0 = performance.now();
    const loop = ts => { if (!document.body.contains(c)) return; const t = (1 - Math.cos((ts - t0) / 900)) / 2; ctx.setTransform(2.5, 0, 0, 2.5, 0, 0); ctx.clearRect(0, 0, 120, 120); drawFig(ctx, lerpPose(d.A, d.X, t), "#ef4444"); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { chosen = +b.dataset.k; const r = opts[chosen] === s.a; if (r) ok++; beep(r); draw(); });
    $("#spN") && ($("#spN").onclick = () => { i++; chosen = null; draw(); });
  };
  const end = () => { addXP(ok * 10); addCoins(ok * 3, true); touchStreak(); save(); if (ok === items.length) confetti();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:56px">📸</div><h1>${ok === items.length ? "עין של מדריך! 👁️" : ok >= 3 ? "יפה מאוד" : "שווה לצפות בהדגמות"}</h1><div class="big-num">${ok}/${items.length}</div>
      <div class="col" style="margin-top:12px"><button class="btn primary lg block" id="sA">🔁 שוב</button><button class="btn block" id="sD">📽️ להדגמות</button><button class="btn block" id="sH">🏠 לבית</button></div></div></div>`);
    $("#sA").onclick = spotMistake; $("#sD").onclick = demosPage; $("#sH").onclick = () => go("home"); };
  draw();
}

/* ───── 5. הקראה בקול ───── */
function speak(text) {
  if (!("speechSynthesis" in window)) return toast("🔇", "המכשיר לא תומך בהקראה");
  const synth = speechSynthesis;
  if (synth.speaking) { synth.cancel(); return; }
  const u = new SpeechSynthesisUtterance(String(text).replace(/[⁠‎‏]/g, ""));
  u.lang = "he-IL"; u.rate = 0.95;
  const v = synth.getVoices().find(v => /^he|^iw/i.test(v.lang)); if (v) u.voice = v;
  else if (synth.getVoices().length) toast("🔊", "לא נמצא קול עברי במכשיר – אפשר להתקין ב'הגדרות > הקראת טקסט'");
  synth.speak(u);
}
const _renderQuestionM = renderQuestion;
renderQuestion = function () {
  try { speechSynthesis && speechSynthesis.cancel(); } catch (e) { }
  _renderQuestionM();
  const tools = document.querySelector(".qtools"); if (!tools || !session) return;
  const b = document.createElement("button"); b.className = "bm-btn"; b.textContent = "🔊 הקראה";
  b.onclick = () => { const it = session.items[session.idx], q = it.q; speak(q.q + ". " + (q.t === "mc" ? it.order.map((oi, d) => LETTERS[d] + ". " + q.o[oi]).join(". ") : q.t === "tf" ? "נכון או לא נכון?" : "") + (it.done ? ". ההסבר: " + q.e : "")); };
  tools.insertBefore(b, tools.children[1] || null);
};
const _lessonSheetM = lessonSheet;
lessonSheet = function (f) {
  _lessonSheetM(f);
  const row = document.querySelector(".modal .row"); if (!row) return;
  const b = document.createElement("button"); b.className = "btn"; b.textContent = "🔊 הקראה";
  b.onclick = () => speak((LESSONS[f] || []).map(([h, t]) => h + ". " + t).join(" "));
  row.prepend(b);
};

/* ───── 6. סיכומים להדפסה ───── */
function printSummary(f) {
  const qs = BANK.filter(q => q.f === f && q.t !== "open").sort((a, b) => ({ easy: 0, medium: 1, hard: 2, expert: 3 }[a.l] - { easy: 0, medium: 1, hard: 2, expert: 3 }[b.l])).slice(0, 25);
  const ans = q => q.t === "mc" ? q.o[q.a] : q.a ? "נכון" : "לא נכון";
  const html = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>סיכום – ${TOPICS[f].name}</title>
    <style>body{font-family:system-ui,Arial,sans-serif;margin:28px;line-height:1.6;color:#111}h1{margin:0 0 4px}h2{border-bottom:2px solid #10b981;padding-bottom:4px;margin-top:22px}.l{margin:8px 0}.l b{color:#047857}ol li{margin:6px 0}.a{color:#047857;font-weight:700}.e{color:#555;font-size:13px}.f{color:#888;font-size:12px;margin-top:24px}@media print{button{display:none}}</style></head>
    <body><button onclick="print()" style="float:left;padding:8px 14px">🖨️ הדפסה / שמירה כ־PDF</button><h1>${TOPICS[f].icon} ${TOPICS[f].name}</h1><div class="e">דף סיכום · מאמן ידע · ${new Date().toLocaleDateString("he-IL")}</div>
    <h2>📘 עיקרי השיעור</h2>${(LESSONS[f] || []).map(([h, t]) => `<div class="l"><b>${esc(h)}:</b> ${esc(t)}</div>`).join("")}
    <h2>❓ שאלות חשובות ותשובות</h2><ol>${qs.map(q => `<li>${esc(q.q)}<br><span class="a">✓ ${esc(ans(q))}</span><div class="e">${esc(q.e)}</div></li>`).join("")}</ol>
    <div class="f">כלי לימודי בלבד – אינו תחליף להכשרה מוסמכת.</div></body></html>`;
  const blob = new Blob([html], { type: "text/html" }), url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) { const a = document.createElement("a"); a.href = url; a.download = `summary-${f}.html`; a.click(); toast("📄", "הסיכום הורד – פתח אותו והדפס"); }
}
const _topicSheetM = topicSheet;
topicSheet = function (f) {
  _topicSheetM(f);
  const col = document.querySelector(".modal .col"); if (!col) return;
  const b = document.createElement("button"); b.className = "btn block"; b.textContent = "🖨️ סיכום להדפסה";
  b.onclick = () => { document.querySelector(".modal-bg").remove(); printSummary(f); };
  col.insertBefore(b, col.querySelector(".ghost"));
};

/* ───── 7. מפת חום של ימי למידה ───── */
function heatmapHtml() {
  const days = new Set(S.days || []), weeks = 14, end = new Date(); end.setHours(0, 0, 0, 0);
  const start = new Date(end); start.setDate(start.getDate() - end.getDay() - (weeks - 1) * 7);
  let cells = "", active = 0;
  for (let w = 0; w < weeks; w++) {
    cells += `<div class="hm-col">`;
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d); const k = ymd(dt), fut = dt > end;
      const n = (S.dayStats && S.dayStats[k] && S.dayStats[k].n) || (days.has(k) ? 8 : 0); if (n) active++;
      const lv = fut ? -1 : n === 0 ? 0 : n < 10 ? 1 : n < 25 ? 2 : n < 50 ? 3 : 4;
      cells += `<i class="hm l${lv}" title="${dt.toLocaleDateString("he-IL")}${n ? " · " + n + " שאלות" : ""}"></i>`;
    }
    cells += `</div>`;
  }
  return `<div class="card"><div class="row" style="justify-content:space-between"><b>🗓️ ימי הלמידה שלך</b><span class="muted xs">${active} ימים ב־${weeks} שבועות</span></div>
    <div class="hm-grid" dir="ltr">${cells}</div><div class="hm-leg muted xs" dir="ltr">פחות <i class="hm l0"></i><i class="hm l1"></i><i class="hm l2"></i><i class="hm l3"></i><i class="hm l4"></i> יותר</div></div>`;
}
const _renderStatsM = renderStats;
renderStats = function () {
  _renderStatsM();
  const first = app.querySelector(".fade-in > .card, .fade-in > .grid3, .fade-in > .grid2");
  if (first) first.insertAdjacentHTML("beforebegin", heatmapHtml());
};

/* ───── חיבור לתפריטים ───── */
function practicalSheet() {
  sheet(`<h2>🛠️ תרגול מעשי</h2><div class="duel-opts">
    <button class="duel-opt" data-x="body"><span>🧍</span><div><b>מפת הגוף</b><small>לוחצים על שריר ולומדים עליו</small></div></button>
    <button class="duel-opt" data-x="demos"><span>📽️</span><div><b>הדגמות תנועה</b><small>נכון מול שגוי באנימציה</small></div></button>
    <button class="duel-opt" data-x="spot"><span>📸</span><div><b>מה הטעות?</b><small>זהה את הטעות בתנועה</small></div></button>
    <button class="duel-opt" data-x="drills"><span>🗣️</span><div><b>תרגול הדרכה</b><small>סדר את שלבי ההדרכה</small></div></button>
    <button class="duel-opt" data-x="fa"><span>🚑</span><div><b>עזרה ראשונה בזמן אמת</b><small>10 שניות לכל החלטה</small></div></button>
    <button class="duel-opt" data-x="timer"><span>⏱️</span><div><b>טיימר אימון</b><small>טבטה, HIIT ו־EMOM</small></div></button>
    </div><div class="row" style="margin-top:10px"><button class="btn" data-a="x">סגירה</button></div>`, (e, close) => {
    if (e.target.dataset.a) return close();
    const b = e.target.closest("[data-x]"); if (!b) return; close();
    ({ body: () => bodyMap(), demos: demosPage, spot: spotMistake, drills: drillsPage, fa: firstAidPage, timer: () => go("tools", { seg: "timer" }) })[b.dataset.x]();
  });
}
const _gamesPageM = gamesPage;
gamesPage = function () {
  _gamesPageM();
  const first = app.querySelector(".grid2");
  first && first.insertAdjacentHTML("afterbegin", `<button class="mode" data-mm="mil"><span class="em">💰</span><b>מיליונר</b><span>15 שאלות · שיא ${S.best.mil || 0} 🪙</span></button>`);
  const last = [...app.querySelectorAll(".grid2")].pop();
  last && last.insertAdjacentHTML("beforeend", `<button class="mode" data-mm="spot"><span class="em">📸</span><b>מה הטעות?</b><span>זהה בתנועה</span></button><button class="mode" data-mm="body"><span class="em">🧍</span><b>מפת הגוף</b><span>לומדים שרירים</span></button>`);
  app.querySelectorAll("[data-mm]").forEach(b => b.onclick = () => ({ mil: millionaire, spot: spotMistake, body: () => bodyMap() })[b.dataset.mm]());
};
const _moreModesM = moreModesSheet;
moreModesSheet = function () {
  _moreModesM();
  const g = document.querySelector(".modal .more-grid"); if (!g) return;
  g.insertAdjacentHTML("afterbegin", `<button data-mm="mil"><span>💰</span>מיליונר</button><button data-mm="body"><span>🧍</span>מפת הגוף</button><button data-mm="spot"><span>📸</span>מה הטעות?</button><button data-mm="timer"><span>⏱️</span>טיימר אימון</button>`);
  g.querySelectorAll("[data-mm]").forEach(b => b.onclick = () => { document.querySelector(".modal-bg").remove(); ({ mil: millionaire, body: () => bodyMap(), spot: spotMistake, timer: () => go("tools", { seg: "timer" }) })[b.dataset.mm](); });
};
const _goM = go;
go = function (t, sub) { if (t !== "tools") stopTimerX(); try { speechSynthesis && speechSynthesis.cancel(); } catch (e) { } return _goM(t, sub); };
