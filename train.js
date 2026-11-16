/* ═════════════ 🏋️ מצב אימון, התקדמות חכמה, יומן והתקדמות (v8.7) ═════════════
   1. מצב "אימון עכשיו" עם טיימר מנוחה   4. סטי חימום   5. המלצת משקל ריאלית (התקדמות כפולה)
   6. זיהוי תקיעות   7. טבלת אחוזים מה־1RM   8. RIR לכל סט   9. לוח שנה   10. סיכום שבועי
   12. כוח יחסי   15. שאלות על התוכנית שלי */

const TR_BW = ["pushup", "pullup", "dips", "dipst", "plank", "sideplank", "deadbug", "hlr"];
const trRange = r => { const m = String(r || "8–12").match(/(\d+)\D+(\d+)/); return m ? [+m[1], +m[2]] : [8, 12]; };
const trDayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function trInc(ex) {
  const eq = (ex && ex.fig && ex.fig.eq) || "";
  if (eq.includes("db")) return { inc: 2, round: 1, note: "המשקולת הבאה (בדרך כלל +2 ק״ג)" };
  return { inc: 2.5, round: 2.5, note: "+2.5 ק״ג (צלחות של 1.25 בכל צד או פלטה קטנה)" };
}
const trRound = (x, r) => Math.max(0, Math.round(x / r) * r);
function trRestSec(ex, plan) {
  const c = !ex || ex.t === "c";
  return plan.goal === "str" ? (c ? 180 : 90) : plan.goal === "end" ? 45 : plan.goal === "gen" ? 75 : (c ? 150 : 75);
}
function trSorted(id) { return ((S.wlog || {})[id] || []).slice().sort((a, b) => a.d - b.d); }
function trBest1RM(ls) {   // 1RM: הגבוה מבין שיא בפועל לבין הערכה מסטים של עד 10 חזרות
  let b = 0;
  ls.forEach(e => e.sets.forEach(s => { if (s.w > 0 && s.r > 0 && s.r <= 10) b = Math.max(b, wlEst(s.w, s.r)); }));
  return b;
}

/* ───── 6. זיהוי תקיעות ───── */
function trPlateau(id) {
  const ls = trSorted(id); if (ls.length < 4) return null;
  const span = ls[ls.length - 1].d - ls[0].d; if (span < 21 * 864e5) return null;
  const v = e => { const s = wlSess(e); return s.bw ? s.reps : s.est; };
  const recent = ls.filter(e => e.d >= ls[ls.length - 1].d - 21 * 864e5), before = ls.filter(e => e.d < ls[ls.length - 1].d - 21 * 864e5);
  if (recent.length < 3 || !before.length) return null;
  const bBefore = Math.max(...before.map(v)), bRecent = Math.max(...recent.map(v));
  if (bRecent > bBefore * 1.005) return null;
  const weeks = Math.round((ls[ls.length - 1].d - (ls.filter(e => v(e) >= bBefore)[0] || ls[0]).d) / (7 * 864e5));
  return { weeks: Math.max(3, weeks), drop: bRecent < bBefore * 0.95 };
}
function trPlateauHtml(id, gr) {
  const p = trPlateau(id); if (!p) return "";
  const ex = PB_BY[id], alt = ex ? PB_EX.filter(e => e.g === ex.g && e.id !== id && e.pat !== ex.pat && e.t === ex.t).sort((a, b) => b.base - a.base)[0] : null;
  return `<div class="help-sec tr-plat"><b>⏸️ ${p.drop ? "ירידה בביצועים" : `אין שיפור כבר כ־${p.weeks} שבועות`}</b>
    <div>זה קורה לכולם. מה אפשר לעשות (אחד בכל פעם):</div>
    <div>1. <b>שבוע קל</b> – אותו תרגיל עם כ־10% פחות משקל וחצי מהסטים, ואז חוזרים.</div>
    <div>2. <b>טווח חזרות אחר</b> ל־4–6 שבועות (למשל מ־8–12 ל־5–8).</div>
    ${alt ? `<div>3. <b>וריאציה אחרת</b> – למשל ${esc(alt.n)}.</div>` : ""}
    <div>4. לבדוק <b>שינה, אוכל וחלבון</b> – בלי התאוששות אין התקדמות.</div></div>`;
}

/* ───── 5. המלצת משקל ריאלית – "התקדמות כפולה" ─────
   קודם מוסיפים חזרות בתוך הטווח, ורק כשכל הסטים מגיעים לקצה העליון – מעלים את הקפיצה הקטנה ביותר וחוזרים לקצה התחתון. */
function trSuggest(id, reps) {
  const ex = PB_BY[id], [lo, hi] = trRange(reps), ls = trSorted(id), last = ls[ls.length - 1];
  const bw = TR_BW.includes(id);
  if (!last) return { kind: "new", w: null, r: lo, txt: bw ? `בצע כמה חזרות שאתה יכול בטכניקה טובה, ועצור כשנשארות לך 1–2 חזרות.` : `אין עדיין רישום. בחר משקל שאיתו תגיע ל־${hi} חזרות ועוד יישארו לך 2–3 חזרות (RIR 2–3). עדיף להתחיל קל ולהתקדם.` };
  const sets = last.sets.filter(s => s.r > 0), w0 = Math.max(0, ...sets.map(s => s.w)), atW = sets.filter(s => s.w === w0);
  const days = (Date.now() - last.d) / 864e5;
  if (days > 21 && w0 > 0) { const { round } = trInc(ex); const w = trRound(w0 * 0.9, round); return { kind: "down", w, r: lo, txt: `עברו ${Math.round(days / 7)} שבועות מהאימון האחרון. מתחילים ב־${wlKg(w)} ק״ג (כ־90%) וחוזרים בהדרגה.` }; }
  if (w0 === 0) {
    const mn = Math.min(...sets.map(s => s.r));
    if (sets.every(s => s.r >= hi)) return { kind: "up", w: 0, r: hi, txt: `הגעת ל־${hi} חזרות בכל הסטים – אפשר להוסיף משקל קטן (אפוד/חגורה) או לעבור לגרסה קשה יותר.` };
    return { kind: "reps", w: 0, r: Math.min(hi, mn + 1), txt: `נסה להוסיף חזרה אחת בסט החלש (${mn} → ${mn + 1}).` };
  }
  const { inc, round, note } = trInc(ex);
  const allTop = atW.length && atW.every(s => s.r >= hi), below = atW.filter(s => s.r < lo).length;
  if (allTop) {
    if (inc / w0 > 0.1 && !atW.every(s => s.r >= hi + 2)) return { kind: "reps", w: w0, r: hi + 2, txt: `הגעת ל־${hi} חזרות, אבל במשקל קל קפיצה של ${inc} ק״ג היא יותר מ־10%. קודם הגע ל־${hi + 2} חזרות בכל הסטים עם ${wlKg(w0)} ק״ג.` };
    const w = trRound(w0 + inc, round);
    return { kind: "up", w, r: lo, txt: `הגעת ל־${hi} חזרות בכל הסטים 💪 מעלים ל־${wlKg(w)} ק״ג (${note}) ומתחילים שוב מ־${lo} חזרות.` };
  }
  if (below >= Math.ceil(atW.length / 2)) {
    const prev = ls[ls.length - 2], prevBelow = prev && prev.sets.filter(s => s.w === w0 && s.r > 0 && s.r < lo).length >= 1;
    if (prevBelow) { const w = trRound(w0 * 0.92, round); return { kind: "down", w, r: lo, txt: `פעמיים ברצף לא הגעת ל־${lo} חזרות. מורידים ל־${wlKg(w)} ק״ג (כ־8%), בונים חזרה ועוקפים את המשקל הקודם.` }; }
    return { kind: "same", w: w0, r: lo, txt: `נשארים עם ${wlKg(w0)} ק״ג. המטרה: לפחות ${lo} חזרות בכל סט.` };
  }
  const mn = Math.min(...atW.map(s => s.r));
  return { kind: "reps", w: w0, r: Math.min(hi, mn + 1), txt: `נשארים עם ${wlKg(w0)} ק״ג ומנסים להוסיף חזרה אחת לפחות בסט אחד (לא חייבים בכולם). כשתגיע ל־${hi} בכל הסטים – נעלה משקל.` };
}
const TR_KIND = { up: "⬆️", same: "➡️", reps: "➕", down: "⬇️", new: "🆕" };

/* ───── 4. סטי חימום ───── */
function trWarm(ex, W, firstOfDay) {
  if (!ex || ex.t !== "c" || !W) return [];
  const bar = (ex.fig && (ex.fig.eq || "").includes("bb")) ? 20 : 0, { round } = trInc(ex);
  const plan = firstOfDay ? [[0.4, 8], [0.6, 5], [0.8, 3]] : [[0.5, 6], [0.75, 3]];
  const out = []; let prev = 0;
  if (bar && firstOfDay && W > 50) { out.push({ w: bar, r: 10 }); prev = bar; }
  plan.forEach(([p, r]) => { const w = Math.max(bar, trRound(W * p, round)); if (w >= prev + Math.max(round, W * 0.12) && w < W) { out.push({ w, r }); prev = w; } });
  return out;
}

/* ───── 7. טבלת אחוזים מה־1RM (טבלת NSCA המקובלת) ───── */
const TR_PCT = [[100, "1"], [95, "2"], [93, "3"], [90, "4"], [87, "5"], [85, "6"], [83, "7"], [80, "8"], [77, "9"], [75, "10"], [70, "11"], [67, "12"], [65, "15"], [60, "15–20"]];
function trPctHtml(id, ls) {
  const rm = trBest1RM(ls); if (!rm) return "";
  const ex = PB_BY[id], { round } = trInc(ex);
  return `<details class="help-sec tr-pct"><summary><b>📐 טבלת אחוזים מה־1RM (${wlKg(trRound(rm, 0.5))} ק״ג)</b></summary>
    <div class="xs muted">כמה חזרות בערך אפשר לעשות בכל אחוז מהמקסימום. הערכה – משתנה בין אנשים ובין תרגילים.</div>
    <table class="tr-tbl"><tr><th>%</th><th>משקל</th><th>חזרות</th><th>מתאים ל־</th></tr>${TR_PCT.map(([p, r]) => `<tr><td>${p}%</td><td><b>${wlKg(trRound(rm * p / 100, round))}</b></td><td dir="ltr">${r}</td><td class="xs muted">${p >= 85 ? "כוח מרבי" : p >= 67 ? "מסת שריר" : "סיבולת שריר"}</td></tr>`).join("")}</table></details>`;
}
function wlExtra(id, ls, reps) {
  const sg = trSuggest(id, reps);
  return `<div class="help-sec tr-sug ${sg.kind}"><b>${TR_KIND[sg.kind]} באימון הבא</b>${esc(sg.txt).replace(/💪/g, "💪")}</div>${trPlateauHtml(id)}${trPctHtml(id, ls)}`;
}

/* ───── 1. מצב "אימון עכשיו" ───── */
let trTimer = null;
function trStopTimer() { if (trTimer) { clearInterval(trTimer.iv); trTimer = null; } const b = $("#trRest"); if (b) b.remove(); }
function trBeep() {
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { }
  try { const C = new (window.AudioContext || window.webkitAudioContext)(), o = C.createOscillator(), g = C.createGain(); o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(C.destination); o.start(); o.stop(C.currentTime + 0.35); } catch (e) { }
}
function trStartRest(sec) {
  trStopTimer();
  const end = Date.now() + sec * 1000;
  document.body.insertAdjacentHTML("beforeend", `<div class="tr-rest" id="trRest"><div class="tr-rest-in"><span>⏱️ מנוחה</span><b id="trRestT"></b>
    <div class="tr-rest-bar"><i id="trRestBar"></i></div><button data-r="-15">−15</button><button data-r="15">+15</button><button data-r="skip">דלג ✓</button></div></div>`);
  trTimer = { end, total: sec * 1000, iv: null };
  const tick = () => {
    const left = trTimer.end - Date.now(), el = $("#trRestT"); if (!el) return trStopTimer();
    if (left <= 0) { el.textContent = "0:00 – יאללה! 💪"; $("#trRestBar").style.width = "100%"; clearInterval(trTimer.iv); trBeep(); setTimeout(trStopTimer, 2500); return; }
    const s = Math.ceil(left / 1000); el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    $("#trRestBar").style.width = `${100 - left / trTimer.total * 100}%`;
  };
  trTimer.iv = setInterval(tick, 250); tick();
  $("#trRest").onclick = e => { const b = e.target.closest("[data-r]"); if (!b) return; if (b.dataset.r === "skip") return trStopTimer(); trTimer.end += +b.dataset.r * 1000; trTimer.total += +b.dataset.r * 1000; };
}
function trBuild(plan, di) {
  const day = plan.days[di], items = [], seenG = new Set();
  let firstC = true;
  day.g.forEach(gr => gr.ex.forEach(it => {
    const ex = PB_BY[it.id], sg = trSuggest(it.id, it.r), W = sg.w || 0;
    const warm = ex && ex.t === "c" && W ? trWarm(ex, W, firstC) : [];
    if (ex && ex.t === "c" && W) firstC = false;
    seenG.add(gr.k);
    items.push({ id: it.id, name: ex ? ex.n : it.name, g: gr.k, plan: `${it.s}×${it.r}`, reps: it.r, sug: sg,
      warm: warm.map(w => ({ ...w, done: false })), sets: Array.from({ length: it.s }, () => ({ w: sg.w ?? "", r: "", rir: "", done: false })) });
  }));
  return { di, name: day.n, start: Date.now(), i: 0, items };
}
function trStart(di) {
  const plan = pbState();
  if (!plan.days[di].g.some(g => g.ex.length)) { toast("📋", "אין תרגילים ביום הזה"); return; }
  S.wcur = trBuild(plan, di); save(); trRender();
}
function trRender() {
  const W = S.wcur; if (!W) return go("plan");
  const plan = pbState(), it = W.items[W.i], ex = PB_BY[it.id];
  const done = W.items.reduce((a, x) => a + x.sets.filter(s => s.done).length, 0), total = W.items.reduce((a, x) => a + x.sets.length, 0);
  const mins = Math.floor((Date.now() - W.start) / 60000);
  funScreen(`<div class="fade-in tr">
    <div class="qhead"><button class="x" id="trX">✕</button><div style="flex:1"><div class="xs muted">${esc(W.name)} · ${done}/${total} סטים</div><div class="bar"><i style="width:${total ? done / total * 100 : 0}%"></i></div></div></div>
    <div class="tr-chips">${W.items.map((x, i) => { const d = x.sets.every(s => s.done), p = x.sets.some(s => s.done); return `<button data-go="${i}" class="${i === W.i ? "on" : ""} ${d ? "done" : p ? "part" : ""}">${d ? "✓ " : ""}${esc(x.name.split(" (")[0])}</button>`; }).join("")}</div>
    <div class="card tr-card">
      <div class="tr-top">${ex ? `<div class="pb-thumb" data-info>${pbFig(ex, "pb-fig sm")}</div>` : ""}<div><h2 style="margin:0">${esc(it.name)}</h2><div class="small muted">יעד: ${it.plan} · מנוחה ${Math.round(trRestSec(ex, plan) / 60 * 10) / 10} דק׳</div></div></div>
      <div class="tr-sug ${it.sug.kind}">${TR_KIND[it.sug.kind]} ${esc(it.sug.txt)}</div>
      ${it.warm.length ? `<div class="tr-sec">🔥 חימום <span class="xs muted">(לא נרשם ביומן)</span></div>${it.warm.map((w, j) => `<div class="tr-set warm ${w.done ? "done" : ""}"><span class="tr-n">ח${j + 1}</span><span class="tr-wv">${wlKg(w.w)} ק״ג × ${w.r}</span><button class="tr-ok" data-warm="${j}">${w.done ? "✓" : "○"}</button></div>`).join("")}` : ""}
      <div class="tr-sec">💪 סטים</div>
      ${it.sets.map((s, j) => `<div class="tr-set ${s.done ? "done" : ""}" data-j="${j}"><span class="tr-n">${j + 1}</span>
        <label><input type="number" inputmode="decimal" step="0.5" class="tr-w" value="${s.w}" placeholder="ק״ג"><i>ק״ג</i></label><span class="wl-x">×</span>
        <label><input type="number" inputmode="numeric" class="tr-r" value="${s.r}" placeholder="${it.sug.r || ""}"><i>חז׳</i></label>
        <select class="wl-rir tr-rir">${WL_RIR.map(([v, t]) => `<option value="${v}" ${String(s.rir) === v ? "selected" : ""}>${t}</option>`).join("")}</select>
        <button class="tr-ok" data-ok="${j}">${s.done ? "✓" : "○"}</button></div>`).join("")}
      <div class="row tr-mini"><button class="link-btn" id="trAddSet">➕ סט</button>${ex ? `<button class="link-btn" data-info>ℹ️ איך מבצעים</button>` : ""}<button class="link-btn" id="trHist">📈 היסטוריה</button></div>
    </div>
    <div class="row"><button class="btn" id="trPrev" ${W.i ? "" : "disabled"}>→ הקודם</button>${W.i < W.items.length - 1 ? `<button class="btn primary" id="trNext">הבא ←</button>` : `<button class="btn primary" id="trFin">🏁 סיים אימון</button>`}</div>
    ${W.i < W.items.length - 1 ? `<button class="btn block" id="trFin2" style="margin-top:8px">🏁 סיים אימון עכשיו</button>` : ""}
  </div>`);
  const readRows = () => document.querySelectorAll(".tr-set[data-j]").forEach(r => { const s = it.sets[+r.dataset.j]; s.w = r.querySelector(".tr-w").value; s.r = r.querySelector(".tr-r").value; s.rir = r.querySelector(".tr-rir").value; });
  const persist = () => { readRows(); save(); };
  app.querySelectorAll(".tr-set input,.tr-set select").forEach(i => i.onchange = persist);
  app.onclick = e => {
    const g = e.target.closest("[data-go]"); if (g) { persist(); W.i = +g.dataset.go; save(); return trRender(); }
    const wm = e.target.closest("[data-warm]"); if (wm) { const w = it.warm[+wm.dataset.warm]; w.done = !w.done; save(); return trRender(); }
    const ok = e.target.closest("[data-ok]");
    if (ok) {
      readRows(); const s = it.sets[+ok.dataset.ok];
      if (!s.done) {
        if (!(+s.r > 0)) { if (it.sug.r) s.r = it.sug.r; else { toast("✍️", "כמה חזרות עשית?"); return; } }
        if (s.w === "" && it.sug.w != null) s.w = it.sug.w;
        s.done = true; save(); trRender();
        const more = it.sets.some(x => !x.done) || W.i < W.items.length - 1;
        if (more) trStartRest(trRestSec(PB_BY[it.id], plan));
      } else { s.done = false; save(); trRender(); }
      return;
    }
    if (e.target.closest("[data-info]") && ex) return pbExSheet(it.id, (PB_GROUPS[ex.g] || {}).def);
  };
  $("#trX").onclick = async () => { persist(); if (await modal("לצאת מהאימון?", "האימון נשמר – אפשר להמשיך אחר כך מעמוד התוכנית.", "יציאה", "להישאר")) { trStopTimer(); go("plan"); } };
  $("#trAddSet").onclick = () => { persist(); const l = it.sets[it.sets.length - 1] || {}; it.sets.push({ w: l.w ?? "", r: "", rir: "", done: false }); save(); trRender(); };
  $("#trHist").onclick = () => { persist(); wlSheet(it.id, it.sets.length, it.reps); };
  const pv = $("#trPrev"); if (pv) pv.onclick = () => { persist(); W.i--; save(); trRender(); };
  const nx = $("#trNext"); if (nx) nx.onclick = () => { persist(); W.i++; save(); trRender(); };
  const fin = async () => { persist(); const n = W.items.reduce((a, x) => a + x.sets.filter(s => s.done).length, 0); if (!n) { if (await modal("לא סימנת אף סט", "לבטל את האימון בלי לשמור?", "בטל אימון", "חזרה")) { delete S.wcur; save(); trStopTimer(); go("plan"); } return; } trFinish(); };
  $("#trFin") && ($("#trFin").onclick = fin); $("#trFin2") && ($("#trFin2").onclick = fin);
}
function trFinish() {
  const W = S.wcur; trStopTimer(); wlState();
  const d = Date.now(), prs = [], lines = []; let vol = 0, nsets = 0;
  W.items.forEach(it => {
    const sets = it.sets.filter(s => s.done && +s.r > 0).map(s => { const o = { w: +s.w || 0, r: +s.r }; if (s.rir !== "" && s.rir != null) o.rir = +s.rir; return o; });
    if (!sets.length) return;
    const L = S.wlog; L[it.id] = L[it.id] || [];
    if (it.id.startsWith("c:")) S.wlogN[it.id] = it.id.slice(2);
    const before = wlPRs(L[it.id]), had = L[it.id].length;
    const ex0 = L[it.id].find(e => trDayKey(e.d) === trDayKey(d));
    if (ex0) ex0.sets.push(...sets); else L[it.id].push({ d, sets });
    const after = wlPRs(L[it.id]), got = [];
    if (had) got.push(...wlPRText(before, after));
    if (got.length) { (ex0 || L[it.id][L[it.id].length - 1]).pr = 1; prs.push(`${it.name}: ${got.join(" · ")}`); }
    sets.forEach(s => { vol += s.w * s.r; nsets++; });
    lines.push(`${it.name} – ${sets.map(s => `${s.w ? wlKg(s.w) + "×" : ""}${s.r}`).join(", ")}`);
  });
  const mins = Math.max(1, Math.round((d - W.start) / 60000));
  S.wsess = S.wsess || []; S.wsess.push({ d: W.start, n: W.name, min: mins, sets: nsets, vol: Math.round(vol), prs: prs.length });
  delete S.wcur; save();
  funScreen(`<div class="fade-in tr-done"><div class="card" style="text-align:center"><div style="font-size:52px">🏁</div><h2>כל הכבוד! האימון נשמר</h2>
    <div class="tr-stats"><div><b>${nsets}</b><span>סטים</span></div><div><b>${Math.round(vol).toLocaleString("he-IL")}</b><span>ק״ג נפח</span></div><div><b>${prs.length}</b><span>שיאים 🏆</span></div></div>
    ${prs.length ? `<div class="tr-prs">🏆 שיאים חדשים:<br>${prs.map(esc).join("<br>")}</div>` : ""}
    <div class="tr-lines">${lines.map(l => `<div>${esc(l)}</div>`).join("")}</div></div>
    <button class="btn primary block" id="trBack">חזרה לתוכנית</button><button class="btn block" id="trQuiz" style="margin-top:8px">🎓 5 שאלות על התוכנית שלי</button></div>`);
  $("#trBack").onclick = () => { pbView = "prog"; go("plan"); };
  $("#trQuiz").onclick = () => trQuiz(5);
}

/* ───── 9. לוח שנה ───── */
let trCalOff = 0;
function trTrainDays() {
  const set = new Set();
  (S.wsess || []).forEach(s => set.add(trDayKey(s.d)));
  Object.values(S.wlog || {}).forEach(ls => ls.forEach(e => set.add(trDayKey(e.d))));
  return set;
}
function trWeekStart(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - d.getDay()); return d.getTime(); }
function trCalendar() {
  const days = trTrainDays(), now = new Date(), m = new Date(now.getFullYear(), now.getMonth() + trCalOff, 1);
  const first = m.getDay(), n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  let cells = "", cnt = 0;
  for (let i = 0; i < first; i++) cells += `<span></span>`;
  for (let d = 1; d <= n; d++) {
    const k = `${m.getFullYear()}-${m.getMonth() + 1}-${d}`, on = days.has(k), isT = trDayKey(Date.now()) === k; if (on) cnt++;
    cells += `<span class="${on ? "on" : ""} ${isT ? "today" : ""}">${d}</span>`;
  }
  // רצף שבועות עם לפחות אימון אחד
  const weeks = new Set([...days].map(k => { const [y, mo, d] = k.split("-").map(Number); return trWeekStart(new Date(y, mo - 1, d).getTime()); }));
  let streak = 0, w = trWeekStart(Date.now()); if (!weeks.has(w)) w -= 7 * 864e5;
  while (weeks.has(w)) { streak++; w = trWeekStart(w - 3 * 864e5); }
  const MN = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  return `<div class="card tr-cal"><div class="tr-calh"><button class="icon-x" data-cal="-1">→</button><h2>📅 ${MN[m.getMonth()]} ${m.getFullYear()}</h2><button class="icon-x" data-cal="1" ${trCalOff >= 0 ? "disabled" : ""}>←</button></div>
    <div class="tr-grid">${["א", "ב", "ג", "ד", "ה", "ו", "ש"].map(x => `<b>${x}</b>`).join("")}${cells}</div>
    <div class="tr-calf"><span>🏋️ <b>${cnt}</b> אימונים בחודש</span><span>🔥 <b>${streak}</b> ${streak === 1 ? "שבוע" : "שבועות"} ברצף</span></div></div>`;
}

/* ───── 10. סיכום שבועי ───── */
function trWeekStats(ws) {
  const we = ws + 7 * 864e5, o = { days: new Set(), sets: 0, vol: 0, prs: 0, ex: {} };
  Object.entries(S.wlog || {}).forEach(([id, ls]) => ls.forEach(e => {
    if (e.d < ws || e.d >= we) return;
    o.days.add(trDayKey(e.d)); if (e.pr) o.prs++;
    e.sets.forEach(s => { if (s.r > 0) { o.sets++; o.vol += s.w * s.r; } });
    o.ex[id] = Math.max(o.ex[id] || 0, wlSess(e).est);
  }));
  (S.wsess || []).forEach(x => { if (x.d >= ws && x.d < we) o.days.add(trDayKey(x.d)); });
  return o;
}
function trWeekly() {
  const ws = trWeekStart(Date.now()), a = trWeekStats(ws), b = trWeekStats(ws - 7 * 864e5);
  const cmp = (x, y) => { if (!y) return ""; const p = Math.round((x - y) / y * 100); return `<i class="${p > 0 ? "up" : p < 0 ? "down" : ""}">${p > 0 ? "▲" : p < 0 ? "▼" : "■"}${Math.abs(p)}%</i>`; };
  const imp = Object.keys(a.ex).filter(id => b.ex[id] && a.ex[id] > b.ex[id] * 1.005).map(id => wlName(id));
  const plan = S.plan, planned = plan ? Math.round(pbWk(plan)) : 0;
  return `<div class="card tr-week"><h2>🗓️ השבוע שלך</h2>
    <div class="tr-stats"><div><b>${a.days.size}${planned ? `<small>/${planned}</small>` : ""}</b><span>אימונים</span></div><div><b>${a.sets}</b><span>סטים ${cmp(a.sets, b.sets)}</span></div><div><b>${Math.round(a.vol).toLocaleString("he-IL")}</b><span>ק״ג נפח ${cmp(a.vol, b.vol)}</span></div><div><b>${a.prs}</b><span>שיאים 🏆</span></div></div>
    ${imp.length ? `<div class="small">📈 השתפרת לעומת שבוע שעבר ב: <b>${imp.map(esc).join(", ")}</b></div>` : ""}
    ${!a.days.size ? `<div class="small muted">עוד לא נרשם אימון השבוע (השבוע מתחיל ביום ראשון).${b.days.size ? ` בשבוע שעבר: ${b.days.size} אימונים.` : ""}</div>` : planned && a.days.size >= planned ? `<div class="small">✅ השלמת את כל האימונים המתוכננים השבוע!</div>` : ""}</div>`;
}

/* ───── 12. כוח יחסי ───── */
const TR_STD = {   // יחס 1RM / משקל גוף: גבולות "בסיסי", "בינוני", "מתקדם" – לפי סימני דרך מקובלים בקהילת אימוני הכוח (הערכה בלבד)
  m: { bench: [0.75, 1.0, 1.5], squat: [1.0, 1.5, 2.0], deadlift: [1.25, 1.75, 2.25], ohp: [0.45, 0.65, 0.9] },
  f: { bench: [0.45, 0.7, 1.0], squat: [0.75, 1.15, 1.5], deadlift: [1.0, 1.4, 1.9], ohp: [0.3, 0.45, 0.65] }
};
const TR_LV = ["מתחיל", "בסיסי", "בינוני", "מתקדם"];
function trRel() {
  const B = S.body || {}, sx = B.sex || (S.plan && S.plan.sex) || "m";
  const rows = Object.keys(TR_STD.m).map(id => {
    const rm = trBest1RM(trSorted(id)); if (!rm || !B.w) return { id, rm };
    const ratio = rm / B.w, th = TR_STD[sx][id], lv = th.filter(t => ratio >= t).length;
    return { id, rm, ratio, lv, th };
  });
  return `<div class="card tr-relc"><h2>💪 כוח יחסי</h2><p class="small muted" style="margin-top:0">ה־1RM שלך ביחס למשקל הגוף – מאפשר להשוות בין אנשים במשקלים שונים.</p>
    <div class="tr-body"><label>משקל גוף <input type="number" inputmode="decimal" id="trBW" value="${B.w || ""}" placeholder="ק״ג"></label>
      <div class="seg" id="trSex">${[["m", "גבר"], ["f", "אישה"]].map(([k, v]) => `<button data-k="${k}" class="${sx === k ? "on" : ""}">${v}</button>`).join("")}</div></div>
    ${rows.map(r => `<div class="tr-rel"><span>${esc(wlName(r.id))}</span>${r.ratio ? `<div class="tr-relbar">${[0, 1, 2, 3].map(i => `<i class="${i <= r.lv ? "on" : ""}"></i>`).join("")}</div><b>${r.ratio.toFixed(2)}×</b><em>${TR_LV[r.lv]}</em>` : `<span class="xs muted">${r.rm ? "הכנס משקל גוף" : "עוד אין רישום"}</span>`}</div>`).join("")}
    <p class="xs muted">1RM = הגבוה מבין השיא בפועל וההערכה מסטים של עד 10 חזרות. הרמות הן הערכה כללית בלבד – גיל, ותק ומבנה גוף משפיעים מאוד.</p></div>`;
}

/* ───── 15. שאלות על התוכנית שלי ───── */
function trQuiz(n = 8) {
  const plan = pbState(), mine = [];
  plan.days.forEach(d => d.g.forEach(g => g.ex.forEach(it => { if (PB_BY[it.id] && !mine.some(m => m.ex.id === it.id)) mine.push({ ex: PB_BY[it.id], g, it }); })));
  if (mine.length < 2) { toast("📋", "הוסף לפחות 2 תרגילים לתוכנית כדי לקבל שאלות"); return; }
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const mk = (q, right, wrong, e, f = "program") => { const o = [right, ...shuffle([...new Set(wrong)].filter(w => w !== right)).slice(0, 3)]; return o.length >= 2 ? { f, l: "medium", t: "mc", q, o, a: 0, e, id: "plan-" + hash(q + right) } : null; };
  const musc = k => (MUSCLES[k] ? MUSCLES[k].n.split(" (")[0] : k), qs = [];
  shuffle(mine).forEach(({ ex, g, it }) => {
    const G = PB_GROUPS[ex.g], top = Object.entries(ex.f).sort((a, b) => b[1] - a[1])[0][0];
    if (Object.keys(G.dom).length > 1) qs.push(mk(`על איזה חלק ב${G.n} התרגיל "${ex.n}" שם את הדגש הגדול ביותר?`, G.dom[top], Object.values(G.dom), ex.why, "anatomy"));
    qs.push(mk(`מה השריר העיקרי שעובד בתרגיל "${ex.n}"?`, musc(ex.prim[0]), Object.keys(MUSCLES).filter(k => !ex.prim.includes(k) && !(ex.sec || []).includes(k)).map(musc), `${ex.n}: ${pbFocusText(ex)}.`, "anatomy"));
    const others = PB_EX.filter(e => e.id !== ex.id && e.bad !== ex.bad);
    qs.push(mk(`מהי טעות נפוצה בביצוע "${ex.n}"?`, ex.bad, shuffle(others).slice(0, 3).map(e => e.bad), `נכון לבצע כך: ${ex.cue}`, "technique"));
    const best = PB_EX.filter(e => e.g === ex.g).sort((a, b) => pbScore(b, g.dom) - pbScore(a, g.dom));
    if (best.length >= 3) qs.push(mk(`בחרת ש${G.dom[g.dom]} יהיה דומיננטי. איזה מהתרגילים הבאים הכי מכוון לזה?`, best[0].n, best.slice(-3).map(e => e.n), `${best[0].n}: ${best[0].why}`, "program"));
  });
  const R = { str: "3–6 חזרות, משקל כבד", hyp: "6–12 חזרות (ואפשר גם יותר) קרוב לכשל", end: "15 חזרות ומעלה, משקל קל", gen: "8–15 חזרות, משקל בינוני" };
  qs.push(mk(`המטרה בתוכנית שלך היא ${PB_GOALS[plan.goal].replace(/^\S+ /, "")}. איזה טווח מתאים בעיקר לתרגילים המורכבים?`, R[plan.goal], Object.values(R), "המטרה קובעת את טווח החזרות והמנוחה. היפרטרופיה אפשרית בטווח רחב, כל עוד הסטים קרובים לכשל.", "program"));
  qs.push(mk("למה כדאי לבצע תרגיל מורכב (כמו סקוואט) לפני תרגיל בידוד (כמו פשיטת ברכיים)?", "כי הוא דורש הכי הרבה כוח וקואורדינציה – עדיף לבצע אותו כשהשרירים רעננים", ["כי תרגיל בידוד מחמם טוב יותר את המפרקים", "כי אין הבדל – הסדר לא משפיע", "כי תרגיל מורכב מעייף פחות"], "תרגילים מורכבים כבדים ומורכבים טכנית – עייפות מוקדמת פוגעת בעומס ובבטיחות.", "program"));
  qs.push(mk("במודל 'התקדמות כפולה', מתי מעלים משקל?", "כשמגיעים לקצה העליון של טווח החזרות בכל הסטים", ["בכל אימון, גם אם החזרות ירדו", "רק אחרי שמגיעים לכשל בכל סט", "כל 3 חודשים באופן קבוע"], "קודם מוסיפים חזרות בתוך הטווח, וכשכל הסטים מגיעים לקצה העליון – מעלים את הקפיצה הקטנה ביותר וחוזרים לקצה התחתון.", "program"));
  const lg = Object.entries(S.wlog || {}).map(([id, ls]) => ls.flatMap(e => e.sets.filter(s => s.w > 0 && s.r > 1 && s.r <= 10).map(s => ({ id, ...s })))).flat();
  if (lg.length) {
    const s = lg[Math.floor(Math.random() * lg.length)], est = Math.round(wlEst(s.w, s.r)), opts = [est, Math.round(s.w * 1.0), Math.round(est * 1.25), Math.round(s.w * (1 + s.r / 10))].map(x => `${x} ק״ג`);
    qs.push(mk(`ביצעת ${wlKg(s.w)} ק״ג × ${s.r} ב"${wlName(s.id)}". מה ה־1RM המשוער לפי נוסחת Epley (משקל × (1 + חזרות÷30))?`, opts[0], opts.slice(1), `${wlKg(s.w)} × (1 + ${s.r}/30) ≈ ${est} ק״ג. זו הערכה – בפועל זה משתנה בין אנשים.`, "program"));
  }
  const pick = shuffle(qs.filter(Boolean)).slice(0, n);
  startMode("coach", { qs: pick, title: "🎓 שאלות על התוכנית שלי" });
}

/* ───── מסך התקדמות + חיבור לעמוד התוכנית ───── */
let pbView = "plan";
function trProgress() {
  app.innerHTML = `<div class="fade-in pb"><h1>🏋️ בניית תוכנית אימון</h1>${trSeg()}
    ${S.wcur ? trResumeCard() : ""}${trWeekly()}${trCalendar()}<div id="trWl"></div>${trRel()}
    <div class="card"><h2>🎓 מבחן על התוכנית שלי</h2><p class="small muted" style="margin-top:0">שאלות שנבנות מהתרגילים, המטרה והמשקלים שלך – ללמוד מהאימון עצמו.</p><button class="btn primary block" id="trQ">התחל (8 שאלות)</button></div>
    ${(S.wsess || []).length ? `<div class="card"><h2>🧾 אימונים אחרונים</h2>${S.wsess.slice(-8).reverse().map(s => `<div class="tr-log"><b>${wlDateLong(s.d)}</b><span>${esc(s.n)} · ${s.sets} סטים${s.prs ? ` · 🏆${s.prs}` : ""}</span></div>`).join("")}</div>` : ""}
  </div>`;
  $("#trWl").outerHTML = wlOverview();
  document.querySelectorAll("[data-wl]").forEach(b => b.onclick = () => { const id = b.dataset.wl; let it = null; pbState().days.forEach(d => d.g.forEach(g => g.ex.forEach(x => { if (x.id === id) it = x; }))); wlSheet(id, it && it.s, it && it.r); });
  trBindSeg(); trBindResume();
  app.querySelectorAll("[data-cal]").forEach(b => b.onclick = () => { trCalOff = Math.min(0, trCalOff + +b.dataset.cal); trProgress(); });
  const bw = $("#trBW"); bw.onchange = () => { S.body = S.body || {}; S.body.w = +bw.value || 0; save(); trProgress(); };
  $("#trSex").onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; S.body = S.body || {}; S.body.sex = b.dataset.k; if (S.plan) S.plan.sex = b.dataset.k; save(); trProgress(); };
  $("#trQ").onclick = () => trQuiz(8);
}
function trSeg() { return `<div class="seg pb-view" id="pbView">${[["plan", "📋 התוכנית"], ["prog", "📊 יומן והתקדמות"]].map(([k, v]) => `<button data-k="${k}" class="${pbView === k ? "on" : ""}">${v}</button>`).join("")}</div>`; }
function trBindSeg() { $("#pbView").onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; pbView = b.dataset.k; renderPlan(); }; }
function trResumeCard() { const W = S.wcur, n = W.items.reduce((a, x) => a + x.sets.filter(s => s.done).length, 0); return `<div class="card tr-resume"><b>⏯️ יש אימון פתוח: ${esc(W.name)}</b><span class="small muted">${n} סטים בוצעו · התחיל ב־${new Date(W.start).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</span><div class="row"><button class="btn primary" id="trRes">המשך</button><button class="btn" id="trDrop">בטל</button></div></div>`; }
function trBindResume() {
  const r = $("#trRes"); if (r) r.onclick = trRender;
  const d = $("#trDrop"); if (d) d.onclick = async () => { if (await modal("לבטל את האימון הפתוח?", "הסטים שסימנת לא יישמרו.", "בטל", "חזרה", true)) { delete S.wcur; save(); renderPlan(); } };
}
const _renderPlanT = renderPlan;
renderPlan = function (sub) {
  if (sub === "prog") pbView = "prog";
  if (pbView === "prog") return trProgress();
  _renderPlanT(sub);
  const h1 = app.querySelector(".pb h1"); if (h1) h1.insertAdjacentHTML("afterend", trSeg() + (S.wcur ? trResumeCard() : ""));
  const ov = app.querySelector(".wl-ov"); if (ov) ov.remove();
  const plan = pbState(), dc = app.querySelector(".pb-daycard");
  const last = (S.wsess || []).slice(-1)[0], li = last ? plan.days.findIndex(d => d.n === last.n) : -1;
  if (dc && li > -1 && plan.days.length > 1) { const nx = plan.days[(li + 1) % plan.days.length]; dc.insertAdjacentHTML("beforeend", `<div class="small tr-next">⏭️ הבא בסבב: <b>${esc(nx.n)}</b> <span class="muted xs">(האחרון: ${esc(last.n)}, ${wlDateLong(last.d)})</span></div>`); }
  if (dc && plan.days[plan.cur].g.some(g => g.ex.length)) dc.insertAdjacentHTML("beforeend", `<button class="btn primary block tr-go" id="trGo">▶️ התחל את ${esc(plan.days[plan.cur].n)} עכשיו</button>`);
  const ana = app.querySelector(".pb-ana"); if (ana) ana.insertAdjacentHTML("afterend", `<button class="btn block" id="trQ2" style="margin-bottom:12px">🎓 שאלות על התוכנית שלי</button>`);
  trBindSeg(); trBindResume();
  const g = $("#trGo"); if (g) g.onclick = () => { if (S.wcur) { toast("⏯️", "יש אימון פתוח – המשך אותו או בטל"); return; } trStart(plan.cur); };
  const q = $("#trQ2"); if (q) q.onclick = () => trQuiz(8);
};
const _goT = go;
go = function (t, sub) { trStopTimer(); app.onclick = null; return _goT(t, sub); };
