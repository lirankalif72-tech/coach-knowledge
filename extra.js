/* ═════════════ הכנה למבחן: מבחן גמר, מסלול קורס, מחברת טעויות, מצב לילה, תעודות תחום, הדגמות, תרגול הדרכה ועזרה ראשונה בזמן ═════════════ */

/* ───── 1. מסלול הקורס לפי שבועות ───── */
const COURSE = [
  { em: "🦴", t: "גוף האדם – אנטומיה", f: ["anatomy"] },
  { em: "⚡", t: "פיזיולוגיה במנוחה ובמאמץ", f: ["physio"] },
  { em: "🥗", t: "תזונה ומאמץ", f: ["nutrition"] },
  { em: "📅", t: "תורת הכושר ועקרונות אימון", f: ["program"] },
  { em: "🏋️", t: "תרגילים, טכניקה ותורת התנועה", f: ["technique", "trx"] },
  { em: "❤️", t: "בריאות ואוכלוסיות מיוחדות", f: ["special"] },
  { em: "🧠", t: "פסיכולוגיה והדרכה", f: ["psych", "scenarios"] },
  { em: "🚑", t: "בטיחות, עזרה ראשונה וחוק", f: ["safety"] }
];
const COURSE_GOAL = 50;
const courseWeek = () => S.course ? Math.min(COURSE.length - 1, Math.floor((Date.now() - S.course.start) / (7 * DAY))) : 0;
const courseProg = w => (S.course && S.course.prog[w]) || { ok: 0, les: [] };
function coursePage() {
  if (!S.course) {
    funScreen(`<div class="fade-in">${funExitBtn()}<div class="story-intro"><div style="font-size:60px">📅</div><h2>מסלול הקורס – 8 שבועות</h2>
      <p>תוכנית שבועית שעוברת על כל נושאי קורס מדריכי כושר גופני ובריאות: אנטומיה, פיזיולוגיה, תזונה, תורת הכושר, טכניקה, אוכלוסיות מיוחדות, הדרכה ועזרה ראשונה.</p>
      <p class="muted small">בכל שבוע: שיעור קצר + יעד של ${COURSE_GOAL} תשובות נכונות בנושאי השבוע.</p></div>
      <button class="btn primary lg block" id="cStart">יאללה, מתחילים! 🚀</button></div>`);
    bindExit(); $("#cStart").onclick = () => { S.course = { start: weekStart().getTime(), prog: {} }; save(); confetti(); coursePage(); };
    return;
  }
  const cw = courseWeek();
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>📅 מסלול הקורס</h2><p class="muted small">שבוע ${cw + 1} מתוך ${COURSE.length} · יעד שבועי: ${COURSE_GOAL} תשובות נכונות ושיעור</p>
    <div class="col">${COURSE.map((c, w) => {
      const p = courseProg(w), lesDone = c.f.every(f => p.les.includes(f)), done = p.ok >= COURSE_GOAL && lesDone, cur = w === cw;
      return `<div class="card course-w ${cur ? "cur" : ""} ${done ? "done" : ""}"><div class="row" style="gap:10px"><span style="font-size:28px">${done ? "✅" : c.em}</span><div style="flex:1;min-width:0"><b>שבוע ${w + 1}: ${c.t}</b>
        <div class="xpbar" style="margin:6px 0 2px"><i style="width:${pct(Math.min(p.ok, COURSE_GOAL), COURSE_GOAL)}%"></i></div><span class="muted xs">${Math.min(p.ok, COURSE_GOAL)}/${COURSE_GOAL} נכונות · שיעור ${lesDone ? "✓" : "—"}${cur ? " · 👈 השבוע" : ""}</span></div></div>
        <div class="row" style="margin-top:8px"><button class="btn sm" data-les="${w}">📘 שיעור</button><button class="btn sm ${cur ? "primary" : ""}" data-prac="${w}">🎯 10 שאלות</button></div></div>`;
    }).join("")}</div>
    <p class="footer-note">אפשר לתרגל גם שבועות אחרים – אבל ההתקדמות נספרת לשבוע שבחרת לתרגל.</p></div>`);
  bindExit();
  app.querySelectorAll("[data-les]").forEach(b => b.onclick = () => {
    const w = +b.dataset.les, c = COURSE[w];
    sheet(`<div style="max-height:74vh;overflow:auto">${c.f.map(f => `<h2>${TOPICS[f].icon} ${TOPICS[f].name}</h2>${lessonBody(f)}`).join("")}</div>
      <div class="row"><button class="btn primary" data-a="ok">קראתי ✓</button></div>`, (e, close) => {
      if (!e.target.dataset.a) return; close();
      S.course.prog[w] = courseProg(w); c.f.forEach(f => { if (!S.course.prog[w].les.includes(f)) S.course.prog[w].les.push(f); }); addXP(15); save(); coursePage();
    });
  });
  app.querySelectorAll("[data-prac]").forEach(b => b.onclick = () => {
    const w = +b.dataset.prac, c = COURSE[w]; S.coursePractice = w; save();
    startMode("coach", { qs: shuffle(freshSort(BANK.filter(q => c.f.includes(q.f) && q.t !== "open"), true).slice(0, 10)), title: `📅 שבוע ${w + 1}: ${c.t}` });
  });
}

/* ───── 2. מחברת טעויות חכמה ───── */
function mistakesNotebook() {
  const wrong = BANK.filter(q => S.qs[q.id] && S.qs[q.id].w > 0);
  const byT = {}; wrong.forEach(q => byT[q.f] = (byT[q.f] || 0) + S.qs[q.id].w);
  const topT = Object.entries(byT).filter(([f]) => TOPICS[f]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const top = wrong.sort((a, b) => S.qs[b.id].w - S.qs[a.id].w || S.qs[a.id].box - S.qs[b.id].box).slice(0, 12);
  const ans = q => q.t === "mc" ? q.o[q.a] : q.t === "tf" ? (q.a ? "נכון" : "לא נכון") : q.a;
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>📒 מחברת הטעויות שלך</h2>
    ${!wrong.length ? `<div class="card" style="text-align:center"><div style="font-size:44px">🌟</div><p>עוד אין טעויות שמורות. כשתטעה – השאלות יופיעו כאן עם הסבר.</p></div>` : `
    <div class="section-title"><h2>🎯 הנושאים שהכי צריכים חיזוק</h2></div>
    <div class="col">${topT.map(([f, n]) => `<div class="card row" style="gap:10px"><span style="font-size:26px">${TOPICS[f].icon}</span><div style="flex:1"><b>${TOPICS[f].name}</b><div class="muted xs">${n} טעויות</div></div><button class="btn sm" data-les="${f}">📘 שיעור</button><button class="btn sm primary" data-tp="${f}">🎯 תרגול</button></div>`).join("")}</div>
    <button class="btn primary lg block" id="mbAll" style="margin:12px 0">🔁 תרגל את כל הטעויות (${Math.min(15, mistakes().length)})</button>
    <div class="section-title"><h2>📝 השאלות שהכי מכשילות אותך</h2></div>
    ${top.map(q => `<details class="card nb-item"><summary><span class="pill no">${S.qs[q.id].w}×</span> ${esc(q.q)}</summary><div class="small" style="margin-top:8px">✅ <b>${esc(ans(q))}</b></div><div class="small muted" style="margin-top:6px">💡 ${linkTerms(q.e)}</div></details>`).join("")}`}
  </div>`);
  bindExit();
  $("#mbAll") && ($("#mbAll").onclick = () => startMode("mistakes"));
  app.querySelectorAll("[data-les]").forEach(b => b.onclick = () => lessonSheet(b.dataset.les));
  app.querySelectorAll("[data-tp]").forEach(b => b.onclick = () => startMode("topic", { f: b.dataset.tp }));
}

/* ───── 3. מצב לילה לפני מבחן ───── */
function nightBeforeExam() {
  const now = Date.now(), seen = BANK.filter(q => q.t !== "open" && S.qs[q.id]);
  const score = q => { const s = S.qs[q.id]; return s.w * 3 + (s.box <= 2 ? 2 : 0) + Math.max(0, (now - s.due) / DAY) * 0.5 - s.c * 0.3; };
  let qs = seen.sort((a, b) => score(b) - score(a)).slice(0, 20);
  if (qs.length < 20) {
    const weak = TOPIC_KEYS.map(f => ({ f, ...topicStats(f) })).sort((a, b) => (a.acc ?? 50) - (b.acc ?? 50)).map(t => t.f);
    const extra = freshSort(BANK.filter(q => q.t !== "open" && !S.qs[q.id] && weak.slice(0, 4).includes(q.f)), true);
    qs = qs.concat(extra.slice(0, 20 - qs.length));
  }
  sheet(`<div class="intro"><div class="intro-em">🌙</div><h2>חזרה לפני מבחן</h2><p class="muted">20 השאלות שהכי חשוב לך לחזור עליהן עכשיו – לפי הטעויות שלך, מה ששכחת ומה שעוד לא תרגלת.</p>
    <div class="rules"><div><span>❌</span><b>שאלות שטעית בהן</b></div><div><span>⏰</span><b>שאלות שהגיע זמן לחזור עליהן</b></div><div><span>🧩</span><b>השלמה מהנושאים החלשים</b></div></div>
    <p class="muted xs">💡 טיפ: אחרי החזרה – לישון טוב. השינה מקבעת את הזיכרון.</p>
    <div class="row"><button class="btn" data-x>אחר כך</button><button class="btn primary" data-go>מתחילים 🌙</button></div></div>`,
    (e, close) => { if (e.target.closest("[data-x]")) close(); if (e.target.closest("[data-go]")) { close(); startMode("coach", { qs: shuffle(qs), title: "🌙 חזרה לפני מבחן" }); } });
}

/* ───── 4. תעודות תחום ───── */
function certsPage() {
  const ts = TOPIC_KEYS.map(f => ({ f, ...topicStats(f) }));
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>🎓 תעודות תחום</h2><p class="muted small">מגיעים ל־80% שליטה בתחום – ומקבלים תעודה לשיתוף.</p>
    <div class="col">${ts.map(t => `<div class="card row" style="gap:10px"><span style="font-size:26px">${t.mastery >= 80 ? "🎓" : TOPICS[t.f].icon}</span><div style="flex:1;min-width:0"><b>${TOPICS[t.f].name}</b><div class="mini-bar" style="margin-top:4px"><i style="width:${Math.min(100, pct(t.mastery, 80))}%"></i></div><span class="muted xs">שליטה ${t.mastery}% / 80%</span></div>
      ${t.mastery >= 80 ? `<button class="btn sm primary" data-cert="${t.f}">📜 תעודה</button>` : `<button class="btn sm" data-tp="${t.f}">🎯 תרגול</button>`}</div>`).join("")}</div></div>`);
  bindExit();
  app.querySelectorAll("[data-cert]").forEach(b => b.onclick = () => { const f = b.dataset.cert; makeCertificate(topicStats(f).mastery, `על שליטה בתחום ${TOPICS[f].name}`, "תעודת תחום"); });
  app.querySelectorAll("[data-tp]").forEach(b => b.onclick = () => startMode("topic", { f: b.dataset.tp }));
}
const _topicSheetX = topicSheet;
topicSheet = function (f) {
  _topicSheetX(f);
  const t = topicStats(f), col = document.querySelector(".modal .col");
  if (col && t.mastery >= 80) { const b = document.createElement("button"); b.className = "btn block"; b.textContent = "📜 תעודת תחום"; b.onclick = () => { document.querySelector(".modal-bg").remove(); makeCertificate(t.mastery, `על שליטה בתחום ${TOPICS[f].name}`, "תעודת תחום"); }; col.prepend(b); }
};

/* ───── מעקב תשובות (מסלול קורס + התראת תעודה) ───── */
const _onAnswerX = onAnswer;
onAnswer = function (s, it) {
  _onAnswerX(s, it);
  if (it.grade !== 1) return;
  if (S.course) {
    const w = s.mode === "coach" && S.coursePractice !== undefined && s.title.startsWith("📅") ? S.coursePractice : courseWeek();
    if (COURSE[w].f.includes(it.q.f)) { S.course.prog[w] = courseProg(w); S.course.prog[w].ok++; }
  }
  const f = it.q.f; if (!TOPICS[f]) return;
  S.certSeen = S.certSeen || [];
  if (!S.certSeen.includes(f) && topicStats(f).mastery >= 80) { S.certSeen.push(f); setTimeout(() => toast("🎓", `הגעת ל־80% ב${TOPICS[f].name} – מחכה לך תעודה!`), 1200); }
};

/* ───── 5. הדגמות תנועה (נכון מול שגוי) ───── */
const P = (o) => o;
const DEMOS = [
  { n: "סקוואט", cue: "ירכיים לאחור, גב ניטרלי, עקבים על הרצפה וברכיים בכיוון הבהונות.", bad: "גב מעוגל, עקבים מתרוממים והגו קורס קדימה.",
    A: P({ h: [62, 18], s: [60, 30], m: [60, 45], p: [60, 60], k: [61, 84], a: [60, 108], t: [72, 110], e: [70, 36], w: [82, 36] }),
    B: P({ h: [70, 40], s: [66, 51], m: [53, 64], p: [40, 78], k: [70, 82], a: [60, 108], t: [72, 110], e: [77, 56], w: [90, 56] }),
    X: P({ h: [88, 62], s: [80, 64], m: [74, 56], p: [52, 84], k: [80, 84], a: [64, 102], t: [74, 110], e: [88, 74], w: [98, 80] }) },
  { n: "דדליפט", cue: "המוט צמוד לרגליים, גב ישר וחזה פתוח – התנועה מגיעה מהירך.", bad: "גב מעוגל והמוט רחוק מהגוף.",
    A: P({ h: [60, 18], s: [60, 30], m: [60, 45], p: [60, 60], k: [61, 84], a: [60, 108], t: [72, 110], e: [60, 46], w: [61, 60], bar: 1 }),
    B: P({ h: [86, 45], s: [77, 50], m: [58, 56], p: [40, 62], k: [62, 84], a: [60, 108], t: [72, 110], e: [76, 66], w: [74, 84], bar: 1 }),
    X: P({ h: [88, 70], s: [82, 60], m: [66, 42], p: [44, 64], k: [62, 84], a: [60, 108], t: [72, 110], e: [86, 76], w: [88, 92], bar: 1 }) },
  { n: "שכיבת סמיכה", cue: "קו ישר מהראש ועד העקבים, ליבה מכווצת.", bad: "האגן שוקע והגב התחתון נכנס לקשת.",
    A: P({ h: [18, 62], s: [28, 68], m: [48, 71], p: [66, 74], k: [84, 77], a: [102, 80], t: [106, 86], e: [28, 78], w: [28, 90] }),
    B: P({ h: [18, 78], s: [28, 82], m: [48, 83], p: [66, 84], k: [84, 85], a: [102, 86], t: [106, 90], e: [40, 86], w: [28, 90] }),
    X: P({ h: [18, 74], s: [28, 79], m: [48, 90], p: [66, 92], k: [84, 89], a: [102, 86], t: [106, 90], e: [40, 85], w: [28, 90] }) },
  { n: "לאנג׳", cue: "גו זקוף, הברך הקדמית מעל הקרסול, ירידה מבוקרת.", bad: "הגו נוטה קדימה והברך הקדמית בורחת רחוק מעבר לבהונות.",
    A: P({ h: [60, 18], s: [60, 30], m: [60, 45], p: [60, 60], k: [72, 84], a: [80, 108], t: [90, 110], k2: [50, 84], a2: [40, 108], e: [60, 46], w: [60, 60] }),
    B: P({ h: [58, 38], s: [58, 50], m: [58, 64], p: [58, 78], k: [80, 82], a: [80, 108], t: [90, 110], k2: [46, 102], a2: [30, 106], e: [58, 64], w: [58, 76] }),
    X: P({ h: [84, 48], s: [76, 56], m: [68, 66], p: [58, 78], k: [94, 84], a: [80, 108], t: [90, 110], k2: [46, 100], a2: [30, 106], e: [80, 70], w: [82, 84] }) },
  { n: "לחיצת כתפיים", cue: "צלעות 'סגורות', ישבן ובטן מכווצים, המשקל עולה בקו ישר.", bad: "קשת גדולה בגב התחתון והגו נוטה לאחור.",
    A: P({ h: [60, 22], s: [60, 34], m: [60, 49], p: [60, 64], k: [60, 86], a: [60, 108], t: [72, 110], e: [70, 40], w: [64, 26] }),
    B: P({ h: [60, 22], s: [60, 34], m: [60, 49], p: [60, 64], k: [60, 86], a: [60, 108], t: [72, 110], e: [64, 16], w: [62, 2] }),
    X: P({ h: [52, 24], s: [52, 36], m: [62, 50], p: [60, 64], k: [60, 86], a: [60, 108], t: [72, 110], e: [52, 18], w: [46, 4] }) }
];
let demoRaf = null;
function drawFig(ctx, pose, color) {
  const L = (a, b) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); };
  ctx.strokeStyle = color; ctx.lineWidth = 4.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(...pose.s); ctx.quadraticCurveTo(...pose.m, ...pose.p); ctx.stroke();
  L(pose.p, pose.k); L(pose.k, pose.a); L(pose.a, pose.t);
  if (pose.k2) { L(pose.p, pose.k2); L(pose.k2, pose.a2); }
  L(pose.s, pose.e); L(pose.e, pose.w);
  ctx.beginPath(); ctx.arc(pose.h[0], pose.h[1], 7, 0, 7); ctx.fillStyle = color; ctx.fill();
  if (pose.bar) { ctx.fillStyle = "#64748b"; ctx.fillRect(pose.w[0] - 12, pose.w[1] - 2, 24, 4); ctx.beginPath(); ctx.arc(pose.w[0], pose.w[1], 9, 0, 7); ctx.strokeStyle = "#64748b"; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.strokeStyle = "rgba(148,163,184,.5)"; ctx.lineWidth = 2; L([4, 112], [116, 112]);
}
function lerpPose(A, B, t) { const o = {}; for (const k in A) o[k] = Array.isArray(A[k]) ? [A[k][0] + (B[k][0] - A[k][0]) * t, A[k][1] + (B[k][1] - A[k][1]) * t] : A[k]; return o; }
function demosPage() {
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>📽️ הדגמות תנועה</h2><p class="muted small">משמאל ✅ הביצוע הנכון · מימין ❌ הטעות הנפוצה</p>
    ${DEMOS.map((d, i) => `<div class="card demo"><b>${d.n}</b><div class="demo-pair"><div><canvas width="240" height="240" data-d="${i}" data-v="good"></canvas><span class="ok-l">✅ נכון</span></div><div><canvas width="240" height="240" data-d="${i}" data-v="bad"></canvas><span class="no-l">❌ שגוי</span></div></div>
      <div class="small">✅ ${esc(d.cue)}</div><div class="small muted">❌ ${esc(d.bad)}</div></div>`).join("")}</div>`);
  bindExit();
  const cs = [...app.querySelectorAll("canvas[data-d]")];
  cancelAnimationFrame(demoRaf);
  const loop = ts => {
    if (!cs.length || !document.body.contains(cs[0])) return;
    const t = (1 - Math.cos(ts / 900)) / 2;
    cs.forEach(c => { const d = DEMOS[+c.dataset.d], ctx = c.getContext("2d"); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, 120, 120);
      drawFig(ctx, lerpPose(d.A, c.dataset.v === "good" ? d.B : d.X, t), c.dataset.v === "good" ? "#10b981" : "#ef4444"); });
    demoRaf = requestAnimationFrame(loop);
  };
  demoRaf = requestAnimationFrame(loop);
}

/* ───── 6. תרגול הדרכה – סדר את ההנחיות ───── */
const DRILLS = [
  { em: "🏋️", t: "הדרכת סקוואט", steps: ["עמידה ברוחב הכתפיים, כפות רגליים מעט החוצה", "שאיפה וייצוב הליבה", "ירידה עם ירכיים לאחור וברכיים בכיוון הבהונות", "ירידה לעומק שמאפשר גב ניטרלי", "דחיפה ברצפה ועלייה, עם נשיפה"] },
  { em: "🏗️", t: "הדרכת דדליפט", steps: ["המוט מעל אמצע כף הרגל", "כפיפה בירך ואחיזה ברוחב הכתפיים", "גב ניטרלי ו'הוצאת רפיון' מהמוט", "דחיפה ברצפה כשהמוט צמוד לרגליים", "נעילה למעלה בלי להקשית את הגב", "הורדה מבוקרת באותו מסלול"] },
  { em: "🛋️", t: "הדרכת לחיצת חזה", steps: ["שכיבה עם העיניים מתחת למוט וכפות רגליים יציבות", "כינוס השכמות ומטה", "הורדה מבוקרת לאמצע החזה, מרפקים בזווית בינונית", "לחיצה למעלה עם נשיפה", "החזרה למתלה בסוף הסט, עם שומר"] },
  { em: "🤝", t: "אימון ראשון למתאמן חדש", steps: ["היכרות ושיחה על המטרות", "מילוי הצהרת בריאות", "סיור במכון והסבר על כללי הבטיחות", "חימום הדרגתי", "תרגילים בסיסיים בעומס קל", "סיכום ותכנון האימון הבא"] },
  { em: "👥", t: "העברת שיעור קבוצתי", steps: ["קבלת פנים ובירור מי חדש ומי פצוע", "הסבר קצר על מטרת השיעור", "חימום הדרגתי", "חלק עיקרי עם גרסה קלה וגרסה קשה", "שחרור ומתיחות", "סיכום ומשוב"] },
  { em: "❤️", t: "החייאה במבוגר", steps: ["לוודא שהמקום בטוח", "לבדוק תגובה ונשימה", "להזעיק עזרה (101) ולבקש דפיברילטור", "עיסויי חזה בקצב 100–120 בדקה", "להפעיל את הדפיברילטור כשמגיע ולפעול לפי ההנחיות"] }
];
function drillsPage() {
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>🗣️ תרגול הדרכה</h2><p class="muted small">סדר את שלבי ההדרכה לפי הסדר הנכון – כמו במבחן המעשי.</p>
    <div class="col">${DRILLS.map((d, i) => { const st = (S.drills || {})[i] || 0; return `<button class="story-card" data-dr="${i}"><span class="em">${d.em}</span><div style="flex:1"><b>${esc(d.t)}</b><small>${st ? "★".repeat(st) + "☆".repeat(3 - st) : "חדש!"}</small></div><span class="chev">‹</span></button>`; }).join("")}</div></div>`);
  bindExit(); app.querySelectorAll("[data-dr]").forEach(b => b.onclick = () => playDrill(+b.dataset.dr));
}
function playDrill(i) {
  const d = DRILLS[i], order = shuffle(d.steps.map((_, k) => k)); let next = 0, errs = 0;
  const draw = (flash) => {
    funScreen(`<div class="fade-in">${funExitBtn()}<div class="who-top"><span>${d.em} ${esc(d.t)}</span><b>${next}/${d.steps.length}</b></div>
      <p class="muted small">הקש על השלבים לפי הסדר הנכון:</p>
      <div class="drill-done">${d.steps.slice(0, next).map((s, k) => `<div class="drill-step ok"><span>${k + 1}</span>${esc(s)}</div>`).join("")}</div>
      <div class="col">${order.filter(k => k >= next).map(k => `<button class="drill-opt ${flash === k ? "shake-x bad" : ""}" data-k="${k}">${esc(d.steps[k])}</button>`).join("")}</div>
      <p class="muted xs" style="margin-top:10px">טעויות: ${errs}</p></div>`);
    bindExit();
    app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { const k = +b.dataset.k; if (k === next) { next++; beep(true, next); if (next >= d.steps.length) return end(); draw(); } else { errs++; beep(false); draw(k); } });
  };
  const end = () => {
    const stars = errs === 0 ? 3 : errs <= 2 ? 2 : 1; S.drills = S.drills || {}; const prev = S.drills[i] || 0;
    if (stars > prev) { S.drills[i] = stars; addCoins((stars - prev) * 15, true); }
    addXP(20 + (3 - Math.min(3, errs)) * 5); touchStreak(); save(); if (stars === 3) confetti();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:52px">${d.em}</div>
      <div class="stars-big">${[0, 1, 2].map(j => `<span class="${j < stars ? "on" : ""}" style="animation-delay:${0.2 + j * 0.25}s">★</span>`).join("")}</div>
      <h1>${stars === 3 ? "הדרכה מושלמת!" : stars === 2 ? "כמעט מושלם" : "שווה לתרגל שוב"}</h1><p class="muted">${errs} טעויות בסדר השלבים</p>
      <div class="card flat" style="text-align:start">${d.steps.map((s, k) => `<div class="small" style="padding:4px 0">${k + 1}. ${esc(s)}</div>`).join("")}</div>
      <div class="col" style="margin-top:12px"><button class="btn primary lg block" id="drL">🗣️ לתרגיל הבא</button><button class="btn block" id="drA">🔁 שוב</button></div></div></div>`);
    $("#drL").onclick = drillsPage; $("#drA").onclick = () => playDrill(i);
  };
  draw();
}

/* ───── 7. עזרה ראשונה – החלטות בזמן אמת ───── */
const FA_T = 10;
const FIRSTAID = [
  { em: "💔", t: "מתאמן התמוטט ליד ההליכון", steps: [
    { q: "מה הדבר הראשון שעושים?", o: ["לוודא שהמקום בטוח ולבדוק תגובה", "לתת לו מים ולהרים את הראש", "להושיב אותו ולחכות שיתעורר", "לחפש את הטלפון שלו כדי לקרוא למשפחה"] },
    { q: "הוא לא מגיב ולא נושם כרגיל. מה עכשיו?", o: ["להזעיק 101, לבקש דפיברילטור ולהתחיל עיסויים", "לבדוק דופק במשך דקה שלמה", "לשפוך עליו מים קרים", "להשכיב אותו על הצד ולחכות"] },
    { q: "באיזה קצב מבצעים עיסויי חזה?", o: ["100–120 לחיצות בדקה", "30–40 לחיצות בדקה", "200 לחיצות בדקה", "לחיצה אחת כל 5 שניות"] }] },
  { em: "😮", t: "מתאמן נחנק מאוכל במזנון", steps: [
    { q: "הוא משתעל חזק ויכול לדבר. מה עושים?", o: ["מעודדים אותו להמשיך להשתעל", "מבצעים מיד לחיצות בטן", "נותנים לו לשתות מים", "מכים חזק בגב שוב ושוב"] },
    { q: "עכשיו הוא לא מצליח לדבר, לנשום או להשתעל. מה עושים?", o: ["טפיחות גב ולחיצות בטן, ומזעיקים עזרה", "מחכים שיעבור לבד", "נותנים לו לחם כדי 'לדחוף' את האוכל", "משכיבים אותו על הגב ומחכים"] },
    { q: "הוא איבד הכרה. מה עכשיו?", o: ["משכיבים, מזעיקים עזרה ומתחילים החייאה", "ממשיכים לחיצות בטן בעמידה", "מושיבים אותו ומחכים", "שופכים עליו מים"] }] },
  { em: "🥵", t: "רץ באימון בחוץ ביום חם", steps: [
    { q: "הוא מבולבל, עורו חם מאוד והוא מדבר לא ברור. מה החשד?", o: ["מכת חום – מצב חירום", "עייפות רגילה אחרי ריצה", "רעב – צריך לאכול משהו", "כאבי שרירים אחרי מאמץ"] },
    { q: "מה הפעולה החשובה ביותר עד שמגיעה עזרה?", o: ["קירור מהיר: צל, מים, קרח ואוורור", "לכסות אותו כדי שלא יקבל הלם", "לתת לו לרוץ לאט כדי להתאושש", "לתת לו משקה חם"] },
    { q: "בזמן הקירור – מה עוד חשוב?", o: ["לעקוב אחרי ההכרה והנשימה עד שמגיעה עזרה", "לתת לו לנהוג הביתה", "להשאיר אותו לבד כדי שינוח", "להחזיר אותו לאימון בעצימות נמוכה"] }] },
  { em: "🩸", t: "מתאמן נחתך עמוק ביד מציוד שבור", steps: [
    { q: "יש דימום חזק. מה עושים קודם?", o: ["לחץ ישיר על הפצע עם חבישה", "שוטפים במים חמים בלי ללחוץ", "מורחים משחה ומחכים", "מרימים את היד ומחכים שיעבור"] },
    { q: "החבישה נספגה בדם. מה עכשיו?", o: ["מוסיפים חבישה מעל וממשיכים ללחוץ", "מסירים את החבישה ובודקים את הפצע", "מפסיקים ללחוץ כדי לא להכאיב", "שמים קרח ישירות על הפצע"] },
    { q: "הדימום מסכן חיים ולא נעצר. מה עושים?", o: ["חוסם עורקים לפי ההכשרה והזעקת עזרה", "ממתינים עוד 20 דקות", "שולחים אותו לבד למרפאה", "נותנים לו משכך כאבים"] }] },
  { em: "⚡", t: "מתאמנת מפרכסת על הרצפה", steps: [
    { q: "מה עושים בזמן הפרכוסים?", o: ["מפנים חפצים ומגינים על הראש", "מחזיקים אותה חזק כדי לעצור את הפרכוסים", "מכניסים חפץ לפה", "שופכים עליה מים"] },
    { q: "מה אסור לעשות?", o: ["להכניס דבר לפה או לרסן אותה", "למדוד כמה זמן נמשך ההתקף", "לשים משהו רך מתחת לראש", "לפנות את הקהל מסביב"] },
    { q: "הפרכוסים נפסקו והיא נושמת. מה עכשיו?", o: ["תנוחת התאוששות על הצד ומעקב", "להושיב אותה ולתת לה לאכול", "להחזיר אותה מיד לאימון", "להשאיר אותה לבד כדי שתנוח"] }] },
  { em: "😵", t: "מתאמן התעלף אחרי סט כבד", steps: [
    { q: "הוא שוכב, נושם, אבל לא ממש מגיב. מה עושים?", o: ["משכיבים ומרימים את הרגליים", "מושיבים אותו מיד", "מעמידים אותו כדי שיתאושש", "נותנים לו לשתות בזמן שהוא שוכב"] },
    { q: "הוא חזר להכרה ומרגיש טוב. מה נכון?", o: ["לא להחזיר אותו לאימון ולהפנות לבירור", "להחזיר אותו לסט הבא", "לתת לו משקה אנרגיה ולהמשיך", "לבקש ממנו לנהוג מיד הביתה"] },
    { q: "מה עשוי לגרום להתעלפות במאמץ כבד?", o: ["עצירת נשימה ממושכת במאמץ", "חימום טוב לפני האימון", "שתייה מספקת במהלך היום", "נשימה רציפה בכל חזרה"] }] }
];
function firstAidPage() {
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>🚑 עזרה ראשונה בזמן אמת</h2><p class="muted small">יש לך ${FA_T} שניות לכל החלטה – כמו במצב אמיתי. התוכן לתרגול בלבד ואינו מחליף קורס עזרה ראשונה.</p>
    <div class="col">${FIRSTAID.map((s, k) => { const st = (S.fa || {})[k] || 0; return `<button class="story-card" data-fa="${k}"><span class="em">${s.em}</span><div style="flex:1"><b>${esc(s.t)}</b><small>${st ? "★".repeat(st) + "☆".repeat(3 - st) : "חדש!"}</small></div><span class="chev">‹</span></button>`; }).join("")}</div></div>`);
  bindExit(); app.querySelectorAll("[data-fa]").forEach(b => b.onclick = () => playFA(+b.dataset.fa));
}
function playFA(k) {
  const sc = FIRSTAID[k]; let i = 0, ok = 0, chosen = null, order = [], t0 = 0;
  const draw = () => {
    const st = sc.steps[i]; if (chosen === null) { order = shuffle(st.o.map((_, j) => j)); t0 = Date.now(); }
    funScreen(`<div class="fade-in">${funExitBtn()}<div class="who-top"><span>${sc.em} ${esc(sc.t)} · ${i + 1}/${sc.steps.length}</span><b>✓ ${ok}</b></div>
      <div class="dtime"><i id="faT" style="width:${chosen === null ? 100 : 0}%"></i></div>
      <div class="qtext">${esc(st.q)}</div>
      <div id="opts">${order.map((j, d) => { let cls = ""; if (chosen !== null) { if (j === 0) cls = "ok"; else if (chosen === j) cls = "no"; } return `<button class="opt ${cls}" data-j="${j}" ${chosen !== null ? "disabled" : ""}><span class="k">${LETTERS[d]}</span><span>${esc(st.o[j])}</span></button>`; }).join("")}</div>
      ${chosen !== null ? `<div class="feedback ${chosen === 0 ? "good" : "bad"}"><b class="t">${chosen === 0 ? "נכון! ✅" : chosen === -1 ? "⏰ הזמן נגמר" : "לא נכון"}</b>התשובה: <b>${esc(st.o[0])}</b></div><div class="qactions"><button class="btn primary lg" id="faN">${i < sc.steps.length - 1 ? "הבא ←" : "לסיום 🏁"}</button></div>` : ""}</div>`);
    bindExit();
    if (chosen === null) {
      funCleanup();
      funTimer = setInterval(() => { const left = FA_T - (Date.now() - t0) / 1000, el = $("#faT"); if (el) el.style.width = Math.max(0, left / FA_T * 100) + "%"; if (left <= 0) { funCleanup(); chosen = -1; beep(false); draw(); } }, 80);
      app.querySelectorAll("[data-j]").forEach(b => b.onclick = () => { funCleanup(); chosen = +b.dataset.j; if (chosen === 0) ok++; beep(chosen === 0); draw(); });
    }
    $("#faN") && ($("#faN").onclick = () => { if (i >= sc.steps.length - 1) return end(); i++; chosen = null; draw(); });
  };
  const end = () => {
    const stars = ok; S.fa = S.fa || {}; const prev = S.fa[k] || 0;
    if (stars > prev) { S.fa[k] = stars; addCoins((stars - prev) * 15, true); }
    addXP(ok * 10); touchStreak(); save(); if (stars === 3) confetti();
    funScreen(`<div class="fade-in"><div class="card stage-res" style="text-align:center"><div style="font-size:52px">${sc.em}</div>
      <div class="stars-big">${[0, 1, 2].map(j => `<span class="${j < stars ? "on" : ""}" style="animation-delay:${0.2 + j * 0.25}s">★</span>`).join("")}</div>
      <h1>${stars === 3 ? "פעלת מושלם! 🚑" : stars === 2 ? "כמעט – עוד קצת דיוק" : "שווה לתרגל שוב"}</h1><p class="muted">${ok}/3 החלטות נכונות</p>
      <div class="col" style="margin-top:12px"><button class="btn primary lg block" id="faL">🚑 לתרחיש הבא</button><button class="btn block" id="faA">🔁 שוב</button></div></div></div>`);
    $("#faL").onclick = firstAidPage; $("#faA").onclick = () => playFA(k);
  };
  draw();
}

/* ───── מרכז "הכנה למבחן" ───── */
function examPrepSheet() {
  const cw = courseWeek(), p = courseProg(cw);
  const { bg } = sheet(`<h2>🎓 הכנה למבחן</h2><div class="duel-opts">
    <button class="duel-opt" data-x="final"><span>🎓</span><div><b>מבחן גמר מדומה</b><small>40 שאלות לפי נושאי הקורס · 50 דק׳ · סף 70% · תעודה</small></div></button>
    <button class="duel-opt" data-x="course"><span>📅</span><div><b>מסלול הקורס – 8 שבועות</b><small>${S.course ? `שבוע ${cw + 1}: ${COURSE[cw].t} · ${Math.min(p.ok, COURSE_GOAL)}/${COURSE_GOAL}` : "תוכנית שבועית לפי נושאי הקורס"}</small></div></button>
    <button class="duel-opt" data-x="night"><span>🌙</span><div><b>חזרה לפני מבחן</b><small>20 השאלות הכי חשובות בשבילך עכשיו</small></div></button>
    <button class="duel-opt" data-x="notebook"><span>📒</span><div><b>מחברת טעויות</b><small>הנושאים והשאלות שהכי מכשילים אותך</small></div></button>
    <button class="duel-opt" data-x="certs"><span>📜</span><div><b>תעודות תחום</b><small>80% שליטה בתחום = תעודה</small></div></button>
    </div><div class="row" style="margin-top:10px"><button class="btn" data-a="x">סגירה</button></div>`, (e, close) => {
    if (e.target.dataset.a) return close();
    const b = e.target.closest("[data-x]"); if (!b) return; close();
    ({ final: () => startMode("final"), course: coursePage, night: nightBeforeExam, notebook: mistakesNotebook, certs: certsPage })[b.dataset.x]();
  });
}
function practicalSheet() {
  sheet(`<h2>🛠️ תרגול מעשי</h2><div class="duel-opts">
    <button class="duel-opt" data-x="demos"><span>📽️</span><div><b>הדגמות תנועה</b><small>נכון מול שגוי באנימציה</small></div></button>
    <button class="duel-opt" data-x="drills"><span>🗣️</span><div><b>תרגול הדרכה</b><small>סדר את שלבי ההדרכה</small></div></button>
    <button class="duel-opt" data-x="fa"><span>🚑</span><div><b>עזרה ראשונה בזמן אמת</b><small>10 שניות לכל החלטה</small></div></button>
    </div><div class="row" style="margin-top:10px"><button class="btn" data-a="x">סגירה</button></div>`, (e, close) => {
    if (e.target.dataset.a) return close();
    const b = e.target.closest("[data-x]"); if (!b) return; close();
    ({ demos: demosPage, drills: drillsPage, fa: firstAidPage })[b.dataset.x]();
  });
}

/* ───── חיבור למסכים ───── */
const _renderHomeX = renderHome;
renderHome = function () {
  _renderHomeX();
  if (S.mode === "play") return;
  const coach = $("#coachCard"); if (!coach) return;
  const cw = courseWeek();
  coach.insertAdjacentHTML("afterend", `<div class="prep-row"><button class="prep-card" id="prepBtn"><span>🎓</span><div><b>הכנה למבחן</b><small>${S.course ? `שבוע ${cw + 1} · ${COURSE[cw].t}` : "מבחן גמר, מסלול קורס ועוד"}</small></div></button><button class="prep-card" id="pracBtn"><span>🛠️</span><div><b>תרגול מעשי</b><small>הדגמות, הדרכה ועזרה ראשונה</small></div></button></div>`);
  $("#prepBtn").onclick = examPrepSheet; $("#pracBtn").onclick = practicalSheet;
};
const _gamesPageX = gamesPage;
gamesPage = function () {
  _gamesPageX();
  const wrap = app.querySelector(".fade-in");
  wrap.insertAdjacentHTML("beforeend", `<div class="section-title"><h2>🎓 הכנה ותרגול מעשי</h2></div><div class="grid2">
    <button class="mode" data-xx="prep"><span class="em">🎓</span><b>הכנה למבחן</b><span>מבחן גמר ועוד</span></button>
    <button class="mode" data-xx="fa"><span class="em">🚑</span><b>עזרה ראשונה</b><span>החלטות בזמן אמת</span></button>
    <button class="mode" data-xx="drills"><span class="em">🗣️</span><b>תרגול הדרכה</b><span>סדר את השלבים</span></button>
    <button class="mode" data-xx="demos"><span class="em">📽️</span><b>הדגמות תנועה</b><span>נכון מול שגוי</span></button></div>`);
  app.querySelectorAll("[data-xx]").forEach(b => b.onclick = () => ({ prep: examPrepSheet, fa: firstAidPage, drills: drillsPage, demos: demosPage })[b.dataset.xx]());
};
const _collX = collectionsPage;
collectionsPage = function () {
  _collX();
  const grid = app.querySelector(".grid2");
  grid && grid.insertAdjacentHTML("beforeend", `<button class="mode" data-xx="certs"><span class="em">📜</span><b>תעודות תחום</b><span>80% שליטה = תעודה</span></button><button class="mode" data-xx="notebook"><span class="em">📒</span><b>מחברת טעויות</b><span>מה הכי מכשיל</span></button>`);
  app.querySelectorAll("[data-xx]").forEach(b => b.onclick = () => ({ certs: certsPage, notebook: mistakesNotebook })[b.dataset.xx]());
};
if (tab === "home" && !session && !document.querySelector(".modal-bg")) { try { renderHome(); } catch (e) { } }
