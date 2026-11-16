/* ═════════════ 📈 מעקב משקלים: רישום, שיאים (1RM/2RM/3RM) וגרף התקדמות (v8.6) ═════════════ */

function wlState() { S.wlog = S.wlog || {}; S.wlogN = S.wlogN || {}; return S.wlog; }
function wlName(id) { return (PB_BY[id] && PB_BY[id].n) || (S.wlogN && S.wlogN[id]) || (id.startsWith("c:") ? id.slice(2) : id); }
const wlKg = w => `${+(+w).toFixed(1)}`;
const wlEst = (w, r) => (r <= 0 || w <= 0) ? 0 : r === 1 ? w : w * (1 + r / 30);   // נוסחת Epley
const wlDate = t => { const d = new Date(t); return `${d.getDate()}.${d.getMonth() + 1}`; };
const wlDateLong = t => { const d = new Date(t); return `${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}`; };

/* סיכום של אימון אחד */
function wlSess(e) {
  const sets = e.sets.filter(s => s.r > 0), bw = sets.length && sets.every(s => !s.w);
  const top = sets.reduce((b, s) => (s.w > b.w || (s.w === b.w && s.r > b.r)) ? s : b, { w: 0, r: 0 });
  return { top, bw, est: Math.max(0, ...sets.map(s => wlEst(s.w, s.r))), vol: sets.reduce((a, s) => a + s.w * s.r, 0), reps: Math.max(0, ...sets.map(s => s.r)) };
}
/* שיאים: nRM בפועל = המשקל הכבד ביותר שהורם לפחות n חזרות */
function wlPRs(list) {
  const pr = { 1: null, 2: null, 3: null, est: null, reps: null };
  list.forEach(e => e.sets.forEach(s => {
    if (!(s.r > 0)) return;
    [1, 2, 3].forEach(n => { if (s.w > 0 && s.r >= n && (!pr[n] || s.w > pr[n].w)) pr[n] = { w: s.w, r: s.r, d: e.d }; });
    const est = wlEst(s.w, s.r); if (est > 0 && (!pr.est || est > pr.est.v)) pr.est = { v: est, w: s.w, r: s.r, d: e.d };
    if (!pr.reps || s.r > pr.reps.r) pr.reps = { r: s.r, w: s.w, d: e.d };
  }));
  return pr;
}

/* טקסט שיאים: אם כמה שיאים הם באותו משקל – מציגים אחד ("שיא משקל") */
function wlPRText(before, after, d) {
  const ns = [1, 2, 3].filter(n => after[n] && (d == null || after[n].d === d) && (!before[n] || after[n].w > before[n].w));
  if (!ns.length) return [];
  const ws = [...new Set(ns.map(n => after[n].w))];
  if (ws.length === 1) { const n = ns[ns.length - 1]; return [ns.length === 3 || after[n].r > n ? `שיא משקל ${wlKg(ws[0])} ק״ג × ${after[n].r}` : `${ns.map(n => n + "RM").join("/")} ${wlKg(ws[0])} ק״ג`]; }
  return ns.map(n => `${n}RM ${wlKg(after[n].w)}`);
}
/* ───── גרף ───── */
const WL_RIR = [["", "RIR"], ["0", "0 – כשל"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4+"]];
const WL_METRICS = { top: "משקל מרבי", est: "1RM משוער", vol: "נפח (ק״ג × חזרות)", reps: "חזרות מרביות" };
function wlSeries(list, m) {
  return list.map(e => { const s = wlSess(e); return { d: e.d, v: m === "top" ? s.top.w : m === "est" ? s.est : m === "vol" ? s.vol : s.reps, s }; });
}
function wlChart(list, m) {
  const pts = wlSeries(list, m);
  if (pts.length < 2) return `<div class="wl-empty">📈 הגרף יופיע אחרי שני אימונים רשומים</div>`;
  const W = 320, H = 170, L = 38, R = 12, T = 14, B = 26;
  let lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v));
  if (hi === lo) { hi += 5; lo = Math.max(0, lo - 5); }
  const pad = (hi - lo) * 0.15; lo = Math.max(0, lo - pad); hi += pad;
  const step = [1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000].find(s => (hi - lo) / s <= 4) || 10000;
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  const t0 = pts[0].d, t1 = pts[pts.length - 1].d, X = t => L + (t1 === t0 ? 0.5 : (t - t0) / (t1 - t0)) * (W - L - R), Y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  let g = "";
  for (let v = lo; v <= hi + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="wl-grid"/><text x="${L - 6}" y="${Y(v) + 3.5}" class="wl-ax" text-anchor="end" direction="ltr">${+v.toFixed(1)}</text>`;
  const lab = pts.length <= 6 ? pts : [pts[0], pts[Math.floor(pts.length / 2)], pts[pts.length - 1]];
  lab.forEach(p => g += `<text x="${X(p.d)}" y="${H - 8}" class="wl-ax" text-anchor="middle" direction="ltr">${wlDate(p.d)}</text>`);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${X(p.d).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(" ");
  const area = `${path} L${X(t1).toFixed(1)} ${Y(lo)} L${X(t0).toFixed(1)} ${Y(lo)} Z`;
  g += `<path d="${area}" class="wl-area"/><path d="${path}" class="wl-line"/>`;
  pts.forEach((p, i) => g += `<circle cx="${X(p.d)}" cy="${Y(p.v)}" r="4" class="wl-dot ${i === pts.length - 1 ? "last" : ""}"/><circle cx="${X(p.d)}" cy="${Y(p.v)}" r="14" class="wl-hit" data-i="${i}"/>`);
  g += `<line class="wl-cross" x1="0" x2="0" y1="${T}" y2="${H - B}" style="display:none"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="wl-chart" role="img" aria-label="גרף ${WL_METRICS[m]}">${g}</svg>`;
}
function wlTip(p, m) {
  const s = p.s, unit = m === "reps" ? "חזרות" : "ק״ג";
  const val = m === "reps" ? p.v : wlKg(p.v);
  return `<b>${wlDateLong(p.d)}</b> · ${WL_METRICS[m]}: <b>${val}</b> ${unit}${m !== "top" && !s.bw ? ` · סט מוביל ${wlKg(s.top.w)}×${s.top.r}` : ""}`;
}
function wlTrend(list, m) {
  const pts = wlSeries(list, m); if (pts.length < 2) return "";
  const a = pts[0].v, b = pts[pts.length - 1].v; if (!a) return "";
  const pc = Math.round((b - a) / a * 100), cls = pc > 0 ? "up" : pc < 0 ? "down" : "";
  return `<span class="wl-trend ${cls}">${pc > 0 ? "▲" : pc < 0 ? "▼" : "■"} ${pc > 0 ? "+" : ""}${pc}% מאז ${wlDateLong(pts[0].d)}</span>`;
}
function wlSpark(list) {
  const pts = wlSeries(list, wlSess(list[list.length - 1]).bw ? "reps" : "est"); if (pts.length < 2) return "";
  const lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v)) || 1, n = pts.length - 1;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${(i / n * 60).toFixed(1)} ${(18 - (hi === lo ? 0.5 : (p.v - lo) / (hi - lo)) * 16).toFixed(1)}`).join(" ");
  return `<svg viewBox="-2 0 64 20" class="wl-spark"><path d="${d}"/></svg>`;
}

/* ───── מסך רישום של תרגיל ───── */
let wlMetric = "top";
function wlSheet(id, planSets, planReps) {
  const L = wlState(); L[id] = L[id] || [];
  if (id.startsWith("c:")) S.wlogN[id] = id.slice(2);
  const list = () => L[id].slice().sort((a, b) => a.d - b.d);
  const rMin = parseInt(String(planReps || "8").split(/[–-]/)[0]) || 8;
  // מילוי מראש: הסטים מהאימון האחרון (נוח להעלות קצת משקל או חזרות)
  const preFill = () => { const last = list().slice(-1)[0]; return last ? last.sets.map(s => ({ w: s.w || "", r: s.r, rir: s.rir })) : Array.from({ length: planSets || 3 }, () => ({ w: "", r: rMin })); };
  const today = new Date(); const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const setRow = (s, i) => `<div class="wl-set" data-i="${i}"><span class="wl-n">${i + 1}</span>
    <label><input type="number" inputmode="decimal" step="0.5" min="0" class="wl-w" value="${s.w}" placeholder="0"><i>ק״ג</i></label><span class="wl-x">×</span>
    <label><input type="number" inputmode="numeric" min="0" class="wl-r" value="${s.r}" placeholder="0"><i>חזרות</i></label>
    <select class="wl-rir" title="RIR – כמה חזרות נשארו לך במיכל">${WL_RIR.map(([v, t]) => `<option value="${v}" ${String(s.rir ?? "") === v ? "selected" : ""}>${t}</option>`).join("")}</select>
    <button class="wl-del" data-act="rm" title="הסר סט">✕</button></div>`;
  const body = () => {
    const ls = list(), pr = wlPRs(ls), bw = ls.length && ls.every(e => wlSess(e).bw);
    const tile = (lab, v, sub) => `<div class="wl-pr"><span>${lab}</span><b>${v}</b><i>${sub || ""}</i></div>`;
    const met = bw ? "reps" : wlMetric === "reps" ? "top" : wlMetric;
    return `
    ${ls.length ? `<div class="wl-prs">${bw ? tile("שיא חזרות", pr.reps ? pr.reps.r : "–", pr.reps ? wlDateLong(pr.reps.d) : "") :
      [1, 2, 3].map(n => tile(`${n}RM`, pr[n] ? wlKg(pr[n].w) : "–", pr[n] ? `${pr[n].r > n ? `(${pr[n].r} חז׳) ` : ""}${wlDateLong(pr[n].d)}` : "")).join("") + tile("1RM משוער", pr.est ? wlKg(Math.round(pr.est.v * 2) / 2) : "–", pr.est ? `מ־${wlKg(pr.est.w)}×${pr.est.r}` : "")}</div>
      <div class="xs muted wl-note">nRM = המשקל הכבד ביותר שהרמת לפחות n חזרות. המשוער מחושב מנוסחת Epley.</div>
      ${!bw ? `<div class="seg wl-seg" id="wlSeg">${["top", "est", "vol"].map(k => `<button data-m="${k}" class="${met === k ? "on" : ""}">${WL_METRICS[k].split(" (")[0]}</button>`).join("")}</div>` : ""}
      <div class="wl-chartbox">${wlTrend(ls, met)}${wlChart(ls, met)}<div class="wl-tip" id="wlTip">${ls.length >= 2 ? "👆 הקש על נקודה בגרף כדי לראות פרטים" : ""}</div></div>${typeof wlExtra === "function" ? wlExtra(id, ls, planReps) : ""}` : `<p class="muted small">עוד אין רישומים לתרגיל הזה. רשום את האימון הראשון – וכאן יופיעו השיאים והגרף.</p>`}
    <div class="help-sec"><b>➕ אימון חדש</b>
      <label class="wl-date">📅 תאריך <input type="date" id="wlDate" value="${iso}" max="${iso}"></label>
      <div class="xs muted">RIR = כמה חזרות עוד היו נשארות לך (0 = כשל). לא חובה.</div>
      <div id="wlSets">${preFill().map(setRow).join("")}</div>
      <div class="row wl-add"><button class="btn" data-act="addset">➕ סט</button><button class="btn" data-act="dup">⧉ שכפל סט אחרון</button></div>
      <button class="btn primary block" data-act="save">💾 שמור אימון</button></div>
    ${ls.length ? `<div class="help-sec"><b>🗓️ היסטוריה</b>${ls.slice().reverse().map(e => { const s = wlSess(e); return `<div class="wl-hist"><span class="wl-hd">${wlDateLong(e.d)}</span><span class="wl-hs" dir="ltr">${e.sets.map(x => `${x.w ? wlKg(x.w) + "×" : ""}${x.r}${x.rir != null ? `<sub>@${x.rir}</sub>` : ""}`).join(" · ")}</span>${e.pr ? `<span title="שיא">🏆</span>` : ""}<button class="wl-del" data-act="delday" data-d="${e.d}" title="מחק">🗑️</button></div>`; }).join("")}</div>` : ""}`;
  };
  const { bg, close } = sheet(`<div class="wl" style="max-height:78vh;overflow:auto"><h2>📝 ${esc(wlName(id))}</h2><div id="wlBody"></div></div><div class="row"><button class="btn" data-x>סגור</button></div>`, (e, cl) => {
    if (e.target.closest("[data-x]")) { cl(); if (tab === "plan") renderPlan(); return; }
    const m = e.target.closest("[data-m]"); if (m) { wlMetric = m.dataset.m; draw(); return; }
    const hit = e.target.closest(".wl-hit"); if (hit) return showTip(+hit.dataset.i);
    const b = e.target.closest("[data-act]"); if (!b) return;
    const box = bg.querySelector("#wlSets");
    const read = () => [...box.querySelectorAll(".wl-set")].map(r => { const o = { w: +r.querySelector(".wl-w").value || 0, r: +r.querySelector(".wl-r").value || 0 }, v = r.querySelector(".wl-rir").value; if (v !== "") o.rir = +v; return o; });
    const rows = read();
    if (b.dataset.act === "addset") { rows.push({ w: "", r: rMin }); box.innerHTML = rows.map(setRow).join(""); }
    else if (b.dataset.act === "dup") { rows.push({ ...(rows[rows.length - 1] || { w: "", r: rMin }) }); box.innerHTML = rows.map(setRow).join(""); }
    else if (b.dataset.act === "rm") { const i = +b.closest(".wl-set").dataset.i; rows.splice(i, 1); box.innerHTML = rows.map(setRow).join(""); }
    else if (b.dataset.act === "delday") { L[id] = L[id].filter(x => x.d !== +b.dataset.d); save(); draw(); }
    else if (b.dataset.act === "save") {
      const sets = rows.filter(s => s.r > 0);
      if (!sets.length) { toast("✍️", "רשום לפחות סט אחד עם חזרות"); return; }
      const dv = bg.querySelector("#wlDate").value, d = dv ? new Date(dv + "T12:00:00").getTime() : Date.now();
      const before = wlPRs(L[id]);
      L[id] = L[id].filter(x => wlDateLong(x.d) !== wlDateLong(d));          // אימון אחד ביום לכל תרגיל
      const entry = { d, sets }; L[id].push(entry);
      const after = wlPRs(L[id]), got = [];
      got.push(...wlPRText(before, after, d));
      if (!got.length && after.est && after.est.d === d && before.est && after.est.v > before.est.v + 0.01) got.push(`1RM משוער ${wlKg(Math.round(after.est.v * 2) / 2)}`);
      if (got.length && before[1]) { entry.pr = 1; toast("🏆", `שיא חדש! ${got.join(" · ")}`); } else toast("💾", "האימון נשמר");
      S.wlogLast = d; save(); draw();
    }
  });
  function showTip(i) {
    const ls = list(), met = ls.every(e => wlSess(e).bw) ? "reps" : wlMetric, p = wlSeries(ls, met)[i]; if (!p) return;
    bg.querySelector("#wlTip").innerHTML = wlTip(p, met);
    bg.querySelectorAll(".wl-dot").forEach((c, j) => c.classList.toggle("sel", j === i));
    const hit = bg.querySelectorAll(".wl-hit")[i], cr = bg.querySelector(".wl-cross");
    if (hit && cr) { cr.setAttribute("x1", hit.getAttribute("cx")); cr.setAttribute("x2", hit.getAttribute("cx")); cr.style.display = ""; }
  }
  function draw() {
    bg.querySelector("#wlBody").innerHTML = body();
    bg.querySelectorAll(".wl-hit").forEach(h => h.addEventListener("pointerenter", () => showTip(+h.dataset.i)));
  }
  draw();
}

/* ───── סיכום בעמוד התוכנית ───── */
function wlOverview() {
  const L = wlState(), ids = Object.keys(L).filter(id => L[id] && L[id].length);
  if (!ids.length) return `<div class="card wl-ov"><h2>📈 מעקב משקלים</h2><p class="muted small" style="margin:0">לחץ על <b>📝 משקלים</b> ליד תרגיל כדי לרשום כמה הרמת. כאן יופיעו השיאים (1RM, 2RM, 3RM) והגרף של ההתקדמות.</p></div>`;
  ids.sort((a, b) => Math.max(...L[b].map(e => e.d)) - Math.max(...L[a].map(e => e.d)));
  return `<div class="card wl-ov"><h2>📈 מעקב משקלים</h2>${ids.map(id => {
    const ls = L[id].slice().sort((a, b) => a.d - b.d), s = wlSess(ls[ls.length - 1]), pr = wlPRs(ls), bw = s.bw;
    return `<button class="wl-row" data-wl="${esc(id)}"><div class="wl-rt"><b>${esc(wlName(id))}</b><span class="xs muted">${bw ? `אחרון: ${s.reps} חזרות` : `אחרון: ${wlKg(s.top.w)} ק״ג × ${s.top.r}`} · ${wlDateLong(ls[ls.length - 1].d)}</span></div>
      ${wlSpark(ls)}<div class="wl-rp">${bw ? `<b>${pr.reps.r}</b><i>שיא חז׳</i>` : `<b>${pr[1] ? wlKg(pr[1].w) : wlKg(Math.round(pr.est.v * 2) / 2)}</b><i>${pr[1] ? "שיא ק״ג" : "1RM משוער"}</i>`}</div></button>`;
  }).join("")}</div>`;
}
function wlRowInfo(id) {
  const L = wlState(), ls = (L[id] || []).slice().sort((a, b) => a.d - b.d);
  if (!ls.length) return "";
  const s = wlSess(ls[ls.length - 1]);
  return `<span class="wl-last">אחרון: ${s.bw ? `${s.reps} חזרות` : `${wlKg(s.top.w)}×${s.top.r}`}</span>`;
}

/* ───── חיבור למסך התוכנית ───── */
const _renderPlanW = renderPlan;
renderPlan = function (sub) {
  _renderPlanW(sub);
  const plan = pbState(), day = plan.days[plan.cur];
  document.querySelectorAll(".pb-group").forEach(gEl => {
    const gr = day.g[+gEl.dataset.gi]; if (!gr) return;
    gEl.querySelectorAll(".pb-ex").forEach(xEl => {
      const it = gr.ex[+xEl.dataset.ei]; if (!it) return;
      const ctl = xEl.querySelector(".pb-ctl");
      ctl.insertAdjacentHTML("afterend", `<div class="wl-bar"><button class="wl-btn" data-wlid="${esc(it.id)}">📝 משקלים</button>${wlRowInfo(it.id)}</div>`);
      xEl.querySelector("[data-wlid]").onclick = () => wlSheet(it.id, it.s, it.r);
    });
  });
  const ana = document.querySelector(".pb-ana");
  if (ana) {
    ana.insertAdjacentHTML("beforebegin", wlOverview());
    document.querySelectorAll("[data-wl]").forEach(b => b.onclick = () => {
      const id = b.dataset.wl; let it = null;
      plan.days.forEach(d => d.g.forEach(g => g.ex.forEach(x => { if (x.id === id) it = x; })));
      wlSheet(id, it && it.s, it && it.r);
    });
  }
};
