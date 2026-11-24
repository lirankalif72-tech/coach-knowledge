"use strict";
/* ═════════════ v12.2 – תרגול מעשי ═════════════
   1. מצא את הטעות   2. סימולטור לקוח   3. מפת גוף לחיצה (משודרגת)
   4. איזה שריר זה?   5. סדר את התנועה   6. התאמה מהירה
   התוכן ב־lab_data.js. נטען אחרי v12b.js. */

Object.assign(UI, {
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  order: '<path d="M11 6h9M11 12h9M11 18h9"/><circle cx="5" cy="6" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="5" cy="18" r="1.6"/>',
  match: '<rect x="3" y="3" width="8" height="7" rx="2"/><rect x="13" y="14" width="8" height="7" rx="2"/><path d="M11 6.5h3a2 2 0 0 1 2 2V14"/>'
});

function labS() {
  const L = S.lab = S.lab || {};
  L.spot = L.spot || { best: 0, seen: [] };
  L.sim = L.sim || {};
  L.ord = L.ord || {};
  L.wm = L.wm || { best: 0 };
  L.mt = L.mt || {};
  return L;
}
const fmtSec = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const labHead = (title, i, n) => `${funExitBtn()}<div class="lab-top"><h1>${title}</h1>${n ? `<span class="lab-n" dir="ltr">${i + 1}/${n}</span>` : ""}</div>
  ${n ? `<div class="lab-prog"><i style="width:${Math.round(i / n * 100)}%"></i></div>` : ""}`;
const KEYS = ["א", "ב", "ג", "ד"], KEYS_EN = ["A", "B", "C", "D"];
const optKey = i => (isEn() ? KEYS_EN : KEYS)[i];

/* מסך סיום אחיד */
function labDone(title, big, sub, isBest, again, more) {
  funScreen(`<div class="fade-in" data-notr="1">${funExitBtn()}<div class="card lab-end">
    <div class="lab-end-k">${title}</div><div class="lab-end-v" dir="ltr">${big}</div><p class="muted">${sub}</p>
    ${isBest ? `<div class="lab-best">${ui("trophy", 16)} ${T("שיא חדש", "New best")}</div>` : ""}
    <button class="btn primary block lg" id="labAgain">${T("שוב", "Play again")}</button>
    ${more ? `<button class="btn block" id="labMore" style="margin-top:8px">${more[0]}</button>` : ""}
    <button class="btn ghost block" id="labBack" style="margin-top:8px">${T("חזרה לתרגול", "Back to practice")}</button></div></div>`);
  bindExit("practice");
  $("#labAgain").onclick = again;
  $("#labBack").onclick = () => go("practice");
  if (more) $("#labMore").onclick = more[1];
}

/* ───────── דמות עם שינוי בתנוחה (לטעויות) ───────── */
function labCurve(R, cv) {
  const pre = `M${pbF(R.p)} L${pbF(R.s)}`;
  if (!R.d.startsWith(pre)) return R.d;
  const v = [R.s[0] - R.p[0], R.s[1] - R.p[1]], len = Math.hypot(v[0], v[1]) || 1, n = [-v[1] / len, v[0] / len];
  const c = [(R.p[0] + R.s[0]) / 2 - n[0] * cv, (R.p[1] + R.s[1]) / 2 - n[1] * cv];
  return `M${pbF(R.p)} Q${pbF(c)} ${pbF(R.s)}` + R.d.slice(pre.length);
}
function labFig(exId, ov = {}, cls = "pb-fig big") {
  const ex = PB_BY[exId]; if (!ex || !ex.fig) return "";
  const F = JSON.parse(JSON.stringify(ex.fig));
  if (ov.A) Object.assign(F.A, ov.A);
  if (ov.B) Object.assign(F.B, ov.B);
  const mk = F.front ? pbFront : pbSide, A = mk(F.A), B = mk(F.B), eq = F.eq || "";
  if (!F.front && (F.A.cv || F.B.cv)) { A.d = labCurve(A, F.A.cv || 0); B.d = labCurve(B, F.B.cv || 0); }
  let g = (F.st || []).map(pl => `<polyline points="${pl.map(pbF).join(" ")}" class="pb-st"/>`).join("");
  if (!F.ng) g += `<path d="M2 112 H118" class="pb-gr"/>`;
  if (F.cab) { g += pbLine(F.cab, A.w, B.w, "pb-cab"); if (A.w2 && F.front) g += pbLine(F.cab, A.w2, B.w2, "pb-cab"); }
  g += `<path d="${A.d}" class="pb-body">${pbAnim("d", A.d, B.d)}</path>`;
  g += pbCirc(A.h, B.h, 6.5, "pb-head");
  if (eq.includes("bb")) g += pbCirc(A.w, B.w, 8, "pb-plate");
  if (eq.includes("bk")) g += pbCirc(A.s, B.s, 8, "pb-plate", -7, 2);
  if (eq.includes("fk")) g += pbCirc(A.s, B.s, 7, "pb-plate", 5, 1);
  if (eq.includes("hip")) g += pbCirc(A.p, B.p, 8, "pb-plate", 2, -9);
  if (eq.includes("db")) { g += pbRect(A.w, B.w, 11, 5, "pb-db"); if (A.w2 && !eq.includes("db1")) g += pbRect(A.w2, B.w2, 11, 5, "pb-db"); }
  if (eq.includes("pad")) g += pbCirc(A.a, B.a, 4.5, "pb-pad");
  return `<svg viewBox="0 -10 120 128" class="${cls}" aria-hidden="true">${g}</svg>`;
}

/* ───────── 1. מצא את הטעות ───────── */
let SP = null;
function spotStart() {
  const L = labS(), fresh = shuffle(LAB_SPOT.filter(x => !L.spot.seen.includes(x.id))), old = shuffle(LAB_SPOT.filter(x => L.spot.seen.includes(x.id)));
  SP = { items: [...fresh, ...old].slice(0, 6), i: 0, ok: 0 };
  spotQ();
}
function spotQ() {
  const it = SP.items[SP.i], ex = PB_BY[it.ex], opts = shuffle(it.o);
  funScreen(`<div class="fade-in" data-notr="1">${labHead(T("מצא את הטעות", "Spot the mistake"), SP.i, SP.items.length)}
    <div class="card lab-fig-card"><div class="lab-ex">${esc(ex.n)}</div>${labFig(it.ex, it)}
    <p class="muted small" style="margin:6px 0 0;text-align:center">${T("צפה בתנועה. מה לא תקין?", "Watch the movement. What is wrong?")}</p></div>
    <div id="spOpts">${opts.map((k, i) => `<button class="opt" data-k="${k}"><span class="k">${optKey(i)}</span><span>${esc(L2(LAB_FAULTS[k]))}</span></button>`).join("")}</div>
    <div id="spFb"></div></div>`);
  bindExit("practice");
  app.querySelectorAll("#spOpts .opt").forEach(b => b.onclick = () => spotAnswer(b.dataset.k));
}
function spotAnswer(k) {
  const it = SP.items[SP.i], good = k === it.a, ex = PB_BY[it.ex];
  if (good) SP.ok++;
  beep(good);
  const L = labS(); if (!L.spot.seen.includes(it.id)) L.spot.seen.push(it.id); save();
  app.querySelectorAll("#spOpts .opt").forEach(b => { b.disabled = true; if (b.dataset.k === it.a) b.classList.add("ok"); else if (b.dataset.k === k) b.classList.add("no"); });
  const last = SP.i === SP.items.length - 1;
  $("#spFb").innerHTML = `<div class="feedback ${good ? "good" : "bad"}"><b class="t">${good ? T("נכון!", "Correct!") : T("לא בדיוק", "Not quite")}</b>
    <div>${esc(L2(it.e))}</div>
    <div class="lab-fix"><b>${it.a === "ok" ? T("להמשך", "Next step") : T("איך מתקנים", "How to fix it")}</b>${esc(L2(it.fix))}</div>
    ${it.a !== "ok" ? `<div class="lab-cmp"><div>${labFig(it.ex, it, "pb-fig")}<span class="no">${T("כך זה נראה עכשיו", "As performed")}</span></div><div>${pbFig(ex, "pb-fig")}<span class="ok">${T("כך זה צריך להיראות", "How it should look")}</span></div></div>` : ""}
    </div><button class="btn primary block lg" id="spNext" style="margin-top:12px">${last ? T("לתוצאה", "See result") : T("הבא", "Next")}</button>`;
  $("#spNext").onclick = () => { if (last) spotEnd(); else { SP.i++; spotQ(); } };
  $("#spFb").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function spotEnd() {
  const L = labS(), n = SP.items.length, isBest = SP.ok > L.spot.best;
  if (isBest) L.spot.best = SP.ok; touchStreak(); save();
  labDone(T("זיהית נכון", "You spotted"), `${SP.ok}/${n}`, SP.ok === n ? T("עין של מאמן מקצועי.", "A pro coach's eye.") : SP.ok >= n - 2 ? T("טוב מאוד. כדאי לעבור על ההסברים של הטעויות.", "Very good. Review the explanations for the ones you missed.") : T("כדאי לתרגל שוב – עם הזמן העין מתחדדת.", "Practice again – your eye gets sharper with time."), isBest, spotStart, [T("ספריית תרגילים", "Exercise library"), () => exLibrary()]);
}

/* ───────── 2. סימולטור לקוח ───────── */
let SM = null;
function simHome() {
  const L = labS();
  funScreen(`<div class="fade-in" data-notr="1">${labHead(T("סימולטור לקוח", "Client simulator"))}
    <p class="muted small" style="margin-top:0">${T("בחר מתאמן, קבל 5 החלטות ובנה לו תוכנית. בכל החלטה תקבל משוב.", "Pick a trainee, make 5 decisions and build their program. You get feedback on each one.")}</p>
    <div class="card list">${LAB_SIM.map(c => { const b = L.sim[c.id]; return `<button class="lrow" data-c="${c.id}"><span class="lab-em">${c.em}</span><span class="lr-tx"><b>${esc(L2(c.n))}</b><small>${esc(L2(c.tag))} · ${esc(L2(c.p[1]))}</small></span>${b != null ? `<span class="lab-sc ${b >= 9 ? "hi" : b >= 6 ? "mid" : "lo"}" dir="ltr">${b}/10</span>` : ""}<span class="lr-ch">${ui("chev", 18)}</span></button>`; }).join("")}</div></div>`);
  bindExit("practice");
  app.querySelectorAll("[data-c]").forEach(b => b.onclick = () => simStart(b.dataset.c));
}
function simStart(id) { SM = { c: LAB_SIM.find(c => c.id === id), i: 0, pts: 0, picks: [] }; simStep(); }
function simProfile(c, open) {
  return `<div class="card lab-client"><div class="lab-ch"><span class="lab-em big">${c.em}</span><div><b>${esc(L2(c.n))}</b><small>${esc(L2(c.tag))}</small></div></div>
    ${open ? `<ul class="lab-pl">${c.p.map(x => `<li>${esc(L2(x))}</li>`).join("")}</ul>` : ""}</div>`;
}
function simStep() {
  const c = SM.c, st = c.st[SM.i], order = shuffle(st.o.map((_, i) => i));
  funScreen(`<div class="fade-in" data-notr="1">${labHead(T("סימולטור לקוח", "Client simulator"), SM.i, c.st.length)}
    ${simProfile(c, true)}
    <div class="lab-q">${esc(L2(st.q))}</div>
    <div id="smOpts">${order.map((k, i) => `<button class="opt" data-i="${k}"><span class="k">${optKey(i)}</span><span>${esc(L2(st.o[k].t))}</span></button>`).join("")}</div>
    <div id="smFb"></div></div>`);
  bindExit("practice");
  app.querySelectorAll("#smOpts .opt").forEach(b => b.onclick = () => simPick(+b.dataset.i));
}
function simPick(k) {
  const st = SM.c.st[SM.i], o = st.o[k], best = st.o.findIndex(x => x.s === 2);
  SM.pts += o.s; SM.picks.push(k); beep(o.s === 2);
  app.querySelectorAll("#smOpts .opt").forEach(b => { b.disabled = true; const i = +b.dataset.i; if (i === best) b.classList.add("ok"); else if (i === k) b.classList.add(o.s === 1 ? "mid" : "no"); });
  const last = SM.i === SM.c.st.length - 1, cls = o.s === 2 ? "good" : o.s === 1 ? "info" : "bad";
  $("#smFb").innerHTML = `<div class="feedback ${cls}"><b class="t">${o.s === 2 ? T("החלטה מצוינת", "Great decision") : o.s === 1 ? T("אפשרי, אבל יש טוב יותר", "Possible, but there is better") : T("לא מומלץ", "Not recommended")}</b>
    <div>${esc(L2(o.fb))}</div>${o.s < 2 ? `<div class="lab-fix"><b>${T("ההחלטה הטובה", "The best call")}</b>${esc(L2(st.o[best].t))} – ${esc(L2(st.o[best].fb))}</div>` : ""}</div>
    <button class="btn primary block lg" id="smNext" style="margin-top:12px">${last ? T("לתוכנית שבנית", "See your program") : T("ההחלטה הבאה", "Next decision")}</button>`;
  $("#smNext").onclick = () => { if (last) simEnd(); else { SM.i++; simStep(); } };
  $("#smFb").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function simEnd() {
  const c = SM.c, L = labS(), prev = L.sim[c.id], isBest = prev == null || SM.pts > prev;
  if (isBest) L.sim[c.id] = SM.pts; touchStreak(); save();
  const grade = SM.pts >= 9 ? T("מאמן מעולה – תוכנית בטוחה ומדויקת", "Excellent coach – a safe, precise program") : SM.pts >= 6 ? T("טוב – כמה החלטות אפשר לשפר", "Good – a few calls could be better") : T("כדאי לחזור על החומר ולנסות שוב", "Review the material and try again");
  funScreen(`<div class="fade-in" data-notr="1">${funExitBtn()}
    <div class="card lab-end"><div class="lab-end-k">${esc(L2(c.n))} · ${esc(L2(c.tag))}</div><div class="lab-end-v" dir="ltr">${SM.pts}/10</div><p class="muted">${grade}</p>
    ${isBest && prev != null ? `<div class="lab-best">${ui("trophy", 16)} ${T("שיא חדש", "New best")}</div>` : ""}</div>
    <div class="section-title"><h2>${T("התוכנית שבנית", "The program you built")}</h2></div>
    <div class="card lab-plan">${c.st.map((st, i) => { const o = st.o[SM.picks[i]], b = st.o.find(x => x.s === 2);
      return `<div class="lab-pr"><span class="lab-pi ${o.s === 2 ? "ok" : o.s === 1 ? "mid" : "no"}">${o.s === 2 ? "✓" : o.s === 1 ? "~" : "✗"}</span><div><small>${esc(L2(st.q))}</small><b>${esc(L2(o.t))}</b>
        ${o.s < 2 ? `<em>${T("עדיף", "Better")}: ${esc(L2(b.t))}</em>` : ""}</div></div>`; }).join("")}</div>
    <button class="btn primary block lg" id="smAgain">${T("נסה שוב", "Try again")}</button>
    <button class="btn block" id="smOther" style="margin-top:8px">${T("מתאמן אחר", "Another trainee")}</button></div>`);
  bindExit("practice");
  $("#smAgain").onclick = () => simStart(c.id);
  $("#smOther").onclick = simHome;
}

/* ───────── 3. מפת גוף לחיצה (מחליפה את הישנה) ───────── */
let BM_BACK = "learn";
const musSide = m => BODY_FRONT.includes(`data-m="${m}"`) ? "front" : "back";
function musQuestions(m) {
  const ks = !isEn() && MUSCLES[m] && MUSCLES[m].k || [];
  return BANK.filter(q => { if (q.t === "open") return false; const t = q.q + " " + (q.t === "mc" ? q.o[q.a] : "") + " " + q.e; return musclesIn(t).includes(m) || ks.some(k => t.includes(k)); });
}
bodyMap = function (side = "front", sel = null, back) {
  if (arguments.length === 0) BM_BACK = "learn";
  if (back) BM_BACK = back;
  const m = sel && MUSCLES[sel], x = sel && LAB_MUS[sel];
  const exs = sel ? PB_EX.filter(e => (e.prim || []).includes(sel)).slice(0, 6) : [];
  const qs = sel ? musQuestions(sel) : [];
  funScreen(`<div class="fade-in" data-notr="1">${funExitBtn()}<h1>${T("מפת הגוף", "Body map")}</h1>
    <p class="muted small" style="margin-top:0">${T("הקש על שריר כדי לראות מה הוא עושה ואיך מאמנים אותו", "Tap a muscle to see what it does and how to train it")}</p>
    <div class="seg" id="bmSide" style="margin:8px 0">${[["front", T("מלפנים", "Front")], ["back", T("מאחור", "Back")]].map(([k, v]) => `<button data-k="${k}" class="${side === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <div class="bm-wrap"><svg viewBox="0 0 200 392" class="bodymap bm-big">${BODY_BASE}<g class="mus">${side === "front" ? BODY_FRONT : BODY_BACK}</g></svg></div>
    <div id="bmInfo">${m ? `<div class="card bm-card"><h2>${esc(m.n)}</h2>
      <div class="bm-grid"><div><span>${T("תפקיד", "Action")}</span>${esc(m.act)}</div>${x ? `<div><span>${T("מפרקים", "Joints")}</span>${esc(L2(x.j))}</div>` : ""}</div>
      ${x ? `<div class="help-sec tip" style="margin:10px 0 0"><b>${T("חשוב לדעת", "Good to know")}</b>${esc(L2(x.tip))}</div>` : ""}
      ${exs.length ? `<div class="bm-l"><span class="muted xs">${T("תרגילים שמאמנים אותו", "Exercises that train it")}</span><div class="ex-grid bm-ex">${exs.map(e => `<button class="ex-tile" data-ex="${e.id}">${pbFig(e, "pb-fig xs")}<span>${esc(e.n)}</span></button>`).join("")}</div></div>` : ""}
      ${qs.length >= 3 ? `<button class="btn primary block" id="bmQ" style="margin-top:12px">${Math.min(8, qs.length)} ${T("שאלות על השריר", "questions on this muscle")}</button>` : ""}</div>`
      : `<div class="card muted small" style="text-align:center">${T("בחר שריר באיור", "Choose a muscle in the figure")}</div>`}</div>
    <button class="btn block" id="bmGame" style="margin-top:4px">${ui("target", 18)} ${T("איזה שריר זה? – בחן את עצמך", "Which muscle is this? – test yourself")}</button></div>`);
  bindExit(BM_BACK);
  app.querySelectorAll("#bmSide button").forEach(b => b.onclick = () => bodyMap(b.dataset.k, null, BM_BACK));
  app.querySelectorAll(".bodymap [data-m]").forEach(el => {
    if (el.dataset.m === sel) el.classList.add("on");
    el.onclick = () => { bodyMap(side, el.dataset.m, BM_BACK); setTimeout(() => $("#bmInfo") && $("#bmInfo").scrollIntoView({ behavior: "smooth", block: "nearest" }), 60); };
  });
  app.querySelectorAll("#bmInfo [data-ex]").forEach(b => b.onclick = () => exSheet(b.dataset.ex));
  $("#bmQ") && ($("#bmQ").onclick = () => startMode("coach", { qs: shuffle(qs).slice(0, 8), title: m.n }));
  $("#bmGame").onclick = wmStart;
};

/* ───────── 4. איזה שריר זה? ───────── */
let WM = null;
function wmStart() {
  const ks = shuffle(Object.keys(MUSCLES)).slice(0, 10);
  WM = { items: ks.map((m, i) => ({ m, type: i % 2 ? "find" : "name" })), i: 0, ok: 0 };
  wmQ();
}
function wmSvg(side, hi) {
  let g = side === "front" ? BODY_FRONT : BODY_BACK;
  if (hi) g = g.replace(new RegExp(`data-m="${hi}"`, "g"), `data-m="${hi}" class="on"`);
  return `<svg viewBox="0 0 200 392" class="bodymap bm-big${hi ? " bm-static" : ""}">${BODY_BASE}<g class="mus">${g}</g></svg>`;
}
function wmQ() {
  const it = WM.items[WM.i], side = musSide(it.m);
  let body;
  if (it.type === "name") {
    const opts = shuffle([it.m, ...shuffle(Object.keys(MUSCLES).filter(k => k !== it.m)).slice(0, 3)]);
    body = `<p class="lab-q" style="text-align:center">${T("איזה שריר מסומן?", "Which muscle is highlighted?")}</p><div class="bm-wrap">${wmSvg(side, it.m)}</div>
      <div id="wmOpts" class="lab-opts2">${opts.map(k => `<button class="opt" data-k="${k}"><span>${esc(MUSCLES[k].n)}</span></button>`).join("")}</div>`;
  } else {
    body = `<p class="lab-q" style="text-align:center">${T("הקש על", "Tap the")}: <b class="lab-target">${esc(MUSCLES[it.m].n)}</b></p><div class="bm-wrap" id="wmMap">${wmSvg(side)}</div>`;
  }
  funScreen(`<div class="fade-in" data-notr="1">${labHead(T("איזה שריר זה?", "Which muscle is this?"), WM.i, WM.items.length)}${body}<div id="wmFb"></div></div>`);
  bindExit("practice");
  if (it.type === "name") app.querySelectorAll("#wmOpts .opt").forEach(b => b.onclick = () => wmAnswer(b.dataset.k, b));
  else app.querySelectorAll("#wmMap [data-m]").forEach(el => el.onclick = () => wmAnswer(el.dataset.m, el));
}
function wmAnswer(k, el) {
  const it = WM.items[WM.i], good = k === it.m;
  if (good) WM.ok++;
  beep(good);
  if (it.type === "name") app.querySelectorAll("#wmOpts .opt").forEach(b => { b.disabled = true; if (b.dataset.k === it.m) b.classList.add("ok"); else if (b === el) b.classList.add("no"); });
  else {
    const map = $("#wmMap");
    map.querySelectorAll("[data-m]").forEach(e => { e.onclick = null; if (e.dataset.m === it.m) e.classList.add("ok"); else if (e.dataset.m === k && !good) e.classList.add("no"); });
    map.querySelector("svg").classList.add("bm-static");
  }
  const last = WM.i === WM.items.length - 1, M = MUSCLES[it.m];
  $("#wmFb").innerHTML = `<div class="feedback ${good ? "good" : "bad"}"><b class="t">${good ? T("נכון!", "Correct!") : T("לא בדיוק", "Not quite")}</b>
    ${!good && it.type === "find" ? `<div>${T("זה", "That is")}: ${esc(MUSCLES[k].n)}. ${T("השריר הנכון מסומן בירוק.", "The right muscle is marked in green.")}</div>` : ""}
    <div><b>${esc(M.n)}</b> – ${esc(M.act)}</div></div>
    <button class="btn primary block lg" id="wmNext" style="margin-top:12px">${last ? T("לתוצאה", "See result") : T("הבא", "Next")}</button>`;
  $("#wmNext").onclick = () => { if (last) wmEnd(); else { WM.i++; wmQ(); } };
  $("#wmFb").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function wmEnd() {
  const L = labS(), n = WM.items.length, isBest = WM.ok > L.wm.best;
  if (isBest) L.wm.best = WM.ok; touchStreak(); save();
  labDone(T("זיהית נכון", "You got"), `${WM.ok}/${n}`, WM.ok >= 9 ? T("מכיר את הגוף מצוין.", "You know the body very well.") : T("נסה שוב, או עבור על מפת הגוף.", "Try again, or explore the body map."), isBest, wmStart, [T("מפת הגוף", "Body map"), () => bodyMap("front", null, "practice")]);
}

/* ───────── 5. סדר את התנועה ───────── */
let OR = null;
function ordHome() {
  const L = labS(), done = LAB_ORDER.filter(s => L.ord[s.id]).length;
  funScreen(`<div class="fade-in" data-notr="1">${labHead(T("סדר את התנועה", "Put it in order"))}
    <p class="muted small" style="margin-top:0">${T("מקישים על השלבים לפי הסדר הנכון ובודקים.", "Tap the steps in the right order, then check.")} · ${done}/${LAB_ORDER.length} ${T("הושלמו", "done")}</p>
    <div class="card list">${LAB_ORDER.map(s => `<button class="lrow" data-o="${s.id}"><span class="lab-em">${s.em}</span><span class="lr-tx"><b>${esc(L2(s.t))}</b><small>${s.s.length} ${T("שלבים", "steps")}</small></span>${L.ord[s.id] ? `<span class="lab-chk">${ui("check", 16)}</span>` : ""}<span class="lr-ch">${ui("chev", 18)}</span></button>`).join("")}</div></div>`);
  bindExit("practice");
  app.querySelectorAll("[data-o]").forEach(b => b.onclick = () => ordStart(b.dataset.o));
}
function ordStart(id) {
  const set = LAB_ORDER.find(s => s.id === id), idx = set.s.map((_, i) => i);
  let mix = shuffle(idx); for (let t = 0; t < 6 && mix.every((v, i) => v === i); t++) mix = shuffle(idx);
  OR = { set, mix, picked: [], tries: 0 };
  ordDraw();
}
function ordDraw() {
  const { set, mix } = OR;
  funScreen(`<div class="fade-in" data-notr="1">${labHead(T("סדר את התנועה", "Put it in order"))}
    <div class="lab-q">${set.em} ${esc(L2(set.t))}</div>
    <p class="muted small" style="margin:0 0 6px">${T("הקש על השלבים לפי הסדר. הקשה נוספת מבטלת.", "Tap the steps in order. Tap again to undo.")}</p>
    <div id="orList">${mix.map(k => `<button class="opt or-it" data-k="${k}"><span class="k"></span><span>${esc(L2(set.s[k]))}</span></button>`).join("")}</div>
    <div id="orFb"></div>
    <div class="row" id="orCtl" style="margin-top:12px"><button class="btn" id="orReset" style="flex:1">${T("איפוס", "Reset")}</button><button class="btn primary" id="orCheck" style="flex:2" disabled>${T("בדיקה", "Check")}</button></div></div>`);
  bindExit("practice");
  app.querySelectorAll("#orList .or-it").forEach(b => b.onclick = () => { const k = +b.dataset.k, p = OR.picked.indexOf(k); if (p >= 0) OR.picked.splice(p, 1); else OR.picked.push(k); ordMark(); });
  $("#orReset").onclick = () => { OR.picked = []; ordMark(); };
  $("#orCheck").onclick = ordCheck;
}
function ordMark(result) {
  app.querySelectorAll("#orList .or-it").forEach(b => {
    const k = +b.dataset.k, pos = OR.picked.indexOf(k);
    b.querySelector(".k").textContent = pos >= 0 ? pos + 1 : "";
    b.classList.toggle("sel", !result && pos >= 0);
    if (result) { b.disabled = true; b.classList.add(pos === k ? "ok" : "no"); }
  });
  const c = $("#orCheck"); if (c) c.disabled = OR.picked.length !== OR.set.s.length;
}
function ordCheck() {
  const { set, picked } = OR, good = picked.every((k, i) => k === i);
  OR.tries++; beep(good);
  const L = labS(); if (good) { L.ord[set.id] = 1; touchStreak(); save(); }
  ordMark(true); $("#orCtl").remove();
  const next = LAB_ORDER.find(s => !L.ord[s.id] && s.id !== set.id);
  $("#orFb").innerHTML = `<div class="feedback ${good ? "good" : "bad"}"><b class="t">${good ? T("מושלם!", "Perfect!") : T("עוד לא", "Not yet")}</b>
    ${good ? "" : `<ol class="or-right">${set.s.map(x => `<li>${esc(L2(x))}</li>`).join("")}</ol>`}<div>${esc(L2(set.e))}</div></div>
    <div class="row" style="margin-top:12px">${good ? "" : `<button class="btn" id="orRetry" style="flex:1">${T("נסה שוב", "Try again")}</button>`}
    <button class="btn primary" id="orNext" style="flex:2">${next ? T("הסדר הבא", "Next one") : T("לכל הנושאים", "All sets")}</button></div>`;
  $("#orRetry") && ($("#orRetry").onclick = () => ordStart(set.id));
  $("#orNext").onclick = () => next ? ordStart(next.id) : ordHome();
  $("#orFb").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ───────── 6. התאמה מהירה ───────── */
let MT = null;
const MT_CATS = {
  mus: { n: () => T("שרירים ופעולות", "Muscles and actions"), ic: "body" },
  ex: { n: () => T("תרגילים ושרירים", "Exercises and muscles"), ic: "dumbbell" },
  terms: { n: () => T("מונחים והגדרות", "Terms and definitions"), ic: "dict" }
};
function mtPairs(cat) {
  if (cat === "mus") return shuffle(Object.keys(MUSCLES)).map(k => ({ id: k, a: MUSCLES[k].n, b: MUSCLES[k].act, g: k }));
  if (cat === "ex") return shuffle(PB_EX.filter(e => e.prim && e.prim.length && MUSCLES[e.prim[0]])).map(e => ({ id: e.id, a: e.n, b: MUSCLES[e.prim[0]].n, g: e.prim[0] }));
  return shuffle(GLOSSARY.filter(([k, v]) => k.length <= 26 && v.length >= 12 && v.length <= 70)).map(([k, v]) => ({ id: k, a: k, b: v, g: v }));
}
function mtBoards(cat) {
  const all = mtPairs(cat), boards = [];
  for (let b = 0; b < 3; b++) {
    const used = new Set(boards.flat().map(p => p.id)), board = [], gs = new Set();
    for (const p of all) { if (board.length === 5) break; if (used.has(p.id) || gs.has(p.g)) continue; board.push(p); gs.add(p.g); }
    boards.push(board);
  }
  return boards.filter(b => b.length === 5);
}
function mtHome() {
  const L = labS();
  funScreen(`<div class="fade-in" data-notr="1">${labHead(T("התאמה מהירה", "Quick match"))}
    <p class="muted small" style="margin-top:0">${T("3 לוחות של 5 זוגות. מקישים על פריט ועל ההתאמה שלו. כל טעות מוסיפה 3 שניות.", "3 boards of 5 pairs. Tap an item and its match. Each mistake adds 3 seconds.")}</p>
    <div class="card list">${Object.entries(MT_CATS).map(([k, c]) => `<button class="lrow" data-m="${k}"><span class="lr-ic">${ui(c.ic, 20)}</span><span class="lr-tx"><b>${c.n()}</b><small>${L.mt[k] ? `${T("שיא", "Best")} ${fmtSec(L.mt[k])}` : T("עוד לא שיחקת", "Not played yet")}</small></span><span class="lr-ch">${ui("chev", 18)}</span></button>`).join("")}</div></div>`);
  bindExit("practice");
  app.querySelectorAll("[data-m]").forEach(b => b.onclick = () => mtStart(b.dataset.m));
}
function mtStart(cat) {
  MT = { cat, boards: mtBoards(cat), b: 0, t0: Date.now(), pen: 0, miss: 0, sel: null };
  mtDraw();
}
const mtTime = () => (Date.now() - MT.t0) / 1000 + MT.pen;
function mtDraw() {
  const board = MT.boards[MT.b], left = shuffle(board), right = shuffle(board);
  funScreen(`<div class="fade-in" data-notr="1">${labHead(MT_CATS[MT.cat].n(), MT.b, MT.boards.length)}
    <div class="mt-bar"><span>${ui("clock", 16)} <b id="mtT" dir="ltr">${fmtSec(mtTime())}</b></span><span>${T("טעויות", "Mistakes")}: <b id="mtM">${MT.miss}</b></span></div>
    <div class="mt-grid"><div class="mt-col">${left.map(p => `<button class="mt-it a" data-id="${esc(p.id)}" data-s="a">${esc(p.a)}</button>`).join("")}</div>
    <div class="mt-col">${right.map(p => `<button class="mt-it b" data-id="${esc(p.id)}" data-s="b">${esc(p.b)}</button>`).join("")}</div></div></div>`);
  bindExit("practice");
  funTimer = setInterval(() => { const t = $("#mtT"); if (!t) return funCleanup(); t.textContent = fmtSec(mtTime()); }, 250);
  app.querySelectorAll(".mt-it").forEach(b => b.onclick = () => mtTap(b));
}
function mtTap(b) {
  if (b.classList.contains("done")) return;
  const s = MT.sel;
  if (!s || s.dataset.s === b.dataset.s) { if (s) s.classList.remove("sel"); if (s === b) { MT.sel = null; return; } b.classList.add("sel"); MT.sel = b; return; }
  MT.sel = null; s.classList.remove("sel");
  if (s.dataset.id === b.dataset.id) {
    [s, b].forEach(x => { x.classList.add("done"); x.disabled = true; }); beep(true);
    if (!app.querySelector(".mt-it:not(.done)")) {
      if (MT.b < MT.boards.length - 1) { MT.b++; setTimeout(() => { if (MT && $("#mtT")) mtDraw(); }, 450); }
      else setTimeout(() => { if (MT && $("#mtT")) mtEnd(); }, 450);
    }
  } else {
    MT.pen += 3; MT.miss++; beep(false);
    [s, b].forEach(x => { x.classList.add("bad"); setTimeout(() => x.classList.remove("bad"), 450); });
    const m = $("#mtM"); if (m) m.textContent = MT.miss;
  }
}
function mtEnd() {
  funCleanup();
  const L = labS(), t = Math.round(mtTime()), cat = MT.cat, isBest = !L.mt[cat] || t < L.mt[cat];
  if (isBest) L.mt[cat] = t; touchStreak(); save();
  labDone(T("הזמן שלך", "Your time"), fmtSec(t), `${MT.miss} ${T("טעויות", "mistakes")} · ${MT.boards.length * 5} ${T("זוגות", "pairs")}`, isBest, () => mtStart(cat), [T("קטגוריה אחרת", "Another category"), mtHome]);
}

/* ───────── כניסה: תרגול מעשי בעמוד התרגול ───────── */
function labTiles() {
  const L = labS(), simDone = LAB_SIM.filter(c => L.sim[c.id] != null).length, ordDone = LAB_ORDER.filter(s => L.ord[s.id]).length;
  const mtBest = Object.values(L.mt).length ? Math.min(...Object.values(L.mt)) : 0;
  const tiles = [
    ["spot", "eye", T("מצא את הטעות", "Spot the mistake"), L.spot.best ? `${T("שיא", "Best")} ${L.spot.best}/6` : T("חדש", "New")],
    ["sim", "user", T("סימולטור לקוח", "Client simulator"), simDone ? `${simDone}/${LAB_SIM.length} ${T("מתאמנים", "trainees")}` : T("חדש", "New")],
    ["body", "body", T("מפת הגוף", "Body map"), `${Object.keys(MUSCLES).length} ${T("שרירים", "muscles")}`],
    ["wm", "target", T("איזה שריר זה?", "Which muscle?"), L.wm.best ? `${T("שיא", "Best")} ${L.wm.best}/10` : T("חדש", "New")],
    ["ord", "order", T("סדר את התנועה", "Put it in order"), ordDone ? `${ordDone}/${LAB_ORDER.length}` : T("חדש", "New")],
    ["mt", "match", T("התאמה מהירה", "Quick match"), mtBest ? `${T("שיא", "Best")} ${fmtSec(mtBest)}` : T("חדש", "New")]
  ];
  return `<div class="section-title"><h2>${T("תרגול מעשי", "Hands-on practice")}</h2></div>
    <div class="lab-grid" id="labGrid" data-notr="1">${tiles.map(([k, ic, t, s]) => `<button class="lab-t" data-lab="${k}"><span class="lab-ic">${ui(ic, 21)}</span><b>${t}</b><small class="${s === T("חדש", "New") ? "new" : ""}">${s}</small></button>`).join("")}</div>`;
}
const LAB_GO = { spot: spotStart, sim: simHome, body: () => bodyMap("front", null, "practice"), wm: wmStart, ord: ordHome, mt: mtHome };
const _practiceHome122 = practiceHome;
practiceHome = function () {
  _practiceHome122();
  const deep = $("#deepRows"), anchor = deep ? deep.previousElementSibling : app.querySelector(".section-title");
  if (!anchor) return;
  anchor.insertAdjacentHTML("beforebegin", labTiles());
  app.querySelectorAll("#labGrid [data-lab]").forEach(b => b.onclick = () => LAB_GO[b.dataset.lab]());
};
const _goLab = go;
go = function (...a) { MT = null; return _goLab(...a); };
