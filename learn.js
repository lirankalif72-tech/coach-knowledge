/* ═════════════ v9.0 – לימוד פשוט וממוקד ═════════════
   1. מסך בית נקי במצב לימוד: "האימון היומי" אחד, מסלול הקורס, ומעט קיצורים.
   2. האימון היומי החכם: חזרה מרווחת + טעויות + נושא חלש + שאלות חדשות – הכל בסבב אחד.
   3. מסלול הקורס בפרקים: שיעור → מבחן פרק → עובר ב־80%.
   4. אחרי מבחן: פירוט לפי נושאים, ו"למה טעיתי" – רמז, הסבר ובלבולים נפוצים.
   5. מצב האזנה: השאלה, הפסקה לחשוב, התשובה וההסבר – בקול.
   המשחקים, החיה, האווטאר, הגלגל והקלפים נשארים במצב משחק בלבד. */

const T = (he, en) => (typeof isEn === "function" && isEn()) ? en : he;
const tName = f => TOPICS[f] ? TOPICS[f].name : f;

/* ───────── 1. האימון היומי החכם ───────── */
const DW_N = 12;
function dailyPlan() {
  const closed = BANK.filter(q => q.t !== "open"), used = new Set(), out = [], parts = [];
  const take = (arr, n, key) => { let k = 0; for (const q of arr) { if (k >= n) break; if (used.has(q.id) || q.t === "open") continue; used.add(q.id); out.push(q); k++; } if (k) parts.push([key, k]); };
  take(shuffle(dueQuestions()), 4, "due");
  take(mistakes(), 3, "mis");
  const ts = TOPIC_KEYS.map(f => ({ f, ...topicStats(f) }));
  const tried = ts.filter(t => t.seen >= 3 && t.acc !== null).sort((a, b) => a.acc - b.acc);
  const weak = tried.length && tried[0].acc < 85 ? tried[0].f : ts.sort((a, b) => a.seen - b.seen)[0].f;
  take(freshSort(closed.filter(q => q.f === weak), true), 3, "weak");
  take(levelPool(freshSort(closed, true)), DW_N - out.length, "new");
  return { qs: shuffle(out).slice(0, DW_N), parts, weak };
}
const DW_LBL = { due: ["🔁", "לחזרה", "to review"], mis: ["✗", "טעויות", "mistakes"], weak: ["📉", "נושא לחיזוק", "weak topic"], new: ["✨", "חדשות", "new"] };
function startDailyWorkout() {
  const p = dailyPlan();
  startMode("coach", { qs: p.qs, title: T("🎯 האימון היומי", "🎯 Daily workout") });
  if (typeof session !== "undefined" && session) session.dw = true;
}

/* ───────── 2. מסך בית – מצב לימוד ───────── */
function learnHome() {
  const L = levelOf(S.xp), lo = xpFor(L), hi = xpFor(L + 1);
  const h = new Date().getHours();
  const greet = h < 5 ? T("לילה טוב", "Good night") : h < 12 ? T("בוקר טוב", "Good morning") : h < 17 ? T("צהריים טובים", "Good afternoon") : h < 21 ? T("ערב טוב", "Good evening") : T("לילה טוב", "Good night");
  const p = dailyPlan(), done = todayCount() >= S.goal;
  const ch = pathCurrent(), chp = pathProg();
  const termIdx = parseInt(hash("term" + today()), 36) % GLOSSARY.length;
  app.innerHTML = `<div class="fade-in lh">
  <div class="hero lh-hero">
    <div class="muted small">${greet}${S.name ? ", " + esc(S.name) : ""} 👋</div>
    <div class="level-row" style="margin-top:8px">
      <div class="level-badge">${L}</div>
      <div style="flex:1;min-width:0"><b style="font-size:16px">${levelTitle(L)}</b>
        <div class="muted xs">${S.xp - lo} / ${hi - lo} XP · 🔥 ${currentStreak()} ${T("ימים ברצף", "day streak")}</div>
        <div class="xpbar"><i style="width:${pct(S.xp - lo, hi - lo)}%"></i></div></div>
      ${goalRing()}
    </div>
  </div>

  <button class="card dw-card" id="dwGo">
    <div class="dw-top"><span class="dw-em">🎯</span><div style="flex:1;text-align:start"><b>${T("האימון היומי שלך", "Your daily workout")}</b>
      <div class="muted small">${p.qs.length} ${T("שאלות · בערך", "questions · about")} ${Math.max(3, Math.round(p.qs.length * 0.5))} ${T("דקות", "min")}</div></div></div>
    <div class="dw-parts">${p.parts.map(([k, n]) => `<span>${DW_LBL[k][0]} ${n} ${T(DW_LBL[k][1], DW_LBL[k][2])}${k === "weak" ? " · " + esc(tName(p.weak)) : ""}</span>`).join("")}</div>
    <div class="btn primary block lg dw-btn">${done ? T("עוד סבב 💪", "Another round 💪") : T("התחל ▶", "Start ▶")}</div>
    ${done ? `<div class="xs dw-done">✅ ${T("השלמת את המטרה היומית", "You completed today's goal")}</div>` : ""}
  </button>

  <button class="card path-card" id="pathGo">
    <div class="row" style="gap:12px"><span style="font-size:30px">${ch ? ch.em : "🏁"}</span><div style="flex:1;text-align:start;min-width:0">
      <div class="muted xs">📚 ${T("מסלול הקורס", "Course path")} · ${chp.done}/${COURSE.length} ${T("פרקים", "chapters")}</div>
      <b>${ch ? `${T("פרק", "Chapter")} ${ch.i + 1}: ${esc(T(ch.t, ch.en))}` : T("סיימת את כל הפרקים! 🎉", "You finished every chapter! 🎉")}</b>
      <div class="xpbar" style="margin-top:6px"><i style="width:${pct(chp.done, COURSE.length)}%"></i></div></div><span class="chev">‹</span></div>
  </button>

  <div class="grid3 lh-mini">
    <button class="mode" id="lhExam"><span class="em">🎓</span><b>${T("מבחן גמר", "Final exam")}</b><span>${T("40 שאלות · 50 דק׳", "40 Q · 50 min")}</span></button>
    <button class="mode" id="lhListen"><span class="em">🎧</span><b>${T("האזנה", "Listen")}</b><span>${T("ללמוד בקול", "learn by ear")}</span></button>
    <button class="mode" id="lhTerm"><span class="em">📖</span><b>${T("מונח היום", "Term of the day")}</b><span>${T("הקש לגלות", "tap to reveal")}</span></button>
  </div>
  <button class="btn block more-btn" id="lhMore">➕ ${T("כל דרכי התרגול", "All ways to practice")}</button>
  <p class="footer-note">${T("זהו כלי לימודי בלבד. הוא אינו תחליף להכשרה מוסמכת, להנחיות רפואיות או לייעוץ מקצועי.", "A learning tool only. It's not a substitute for certified training, medical guidance or professional advice.")}</p>
  </div>`;
  $("#dwGo").onclick = startDailyWorkout;
  $("#pathGo").onclick = coursePage;
  $("#lhExam").onclick = () => startMode("final");
  $("#lhListen").onclick = listenPage;
  $("#lhTerm").onclick = () => typeof termOfDaySheet === "function" ? termOfDaySheet() : termSheet(GLOSSARY[termIdx][0]);
  $("#lhMore").onclick = () => go("practice");
}
const _renderHomeL = renderHome;
renderHome = function () { if (S.mode === "play") return _renderHomeL(); if (typeof stopFactTimer === "function") stopFactTimer(); learnHome(); };

/* ───────── 3. מסך תרגול: כל הדרכים במקום אחד ───────── */
const _renderPracticeL = renderPractice;
renderPractice = function () {
  _renderPracticeL();
  const wrap = app.querySelector(".fade-in"); if (!wrap) return;
  const ts = TOPIC_KEYS.map(f => ({ f, ...topicStats(f) }));
  const btn = (id, em, n, s) => `<button class="mode" data-pm="${id}"><span class="em">${em}</span><b>${n}</b><span>${s}</span></button>`;
  const play = S.mode === "play";
  wrap.insertAdjacentHTML("beforeend", `
    <div class="section-title"><h2>🎓 ${T("הכנה למבחן", "Exam prep")}</h2></div>
    <div class="grid2">
      ${btn("final", "🎓", T("מבחן גמר מדומה", "Mock final exam"), T("40 שאלות · 50 דק׳ · סף 70%", "40 Q · 50 min · pass 70%"))}
      ${btn("path", "📚", T("מסלול הקורס", "Course path"), `${pathProg().done}/${COURSE.length} ${T("פרקים", "chapters")}`)}
      ${btn("night", "🌙", T("חזרה לפני מבחן", "Pre-exam review"), T("20 השאלות החשובות לך", "your 20 key questions"))}
      ${btn("notebook", "📒", T("מחברת טעויות", "Mistakes notebook"), T("מה הכי מכשיל אותך", "what trips you up"))}
    </div>
    <div class="section-title"><h2>🛠️ ${T("תרגול מעשי", "Practical training")}</h2></div>
    <div class="grid2">
      ${btn("listen", "🎧", T("מצב האזנה", "Listening mode"), T("שאלות ותשובות בקול", "questions read aloud"))}
      ${btn("demos", "📽️", T("הדגמות תנועה", "Movement demos"), T("נכון מול שגוי", "right vs wrong"))}
      ${btn("drills", "🗣️", T("תרגול הדרכה", "Coaching practice"), T("סדר את השלבים", "order the steps"))}
      ${btn("fa", "🚑", T("עזרה ראשונה", "First aid"), T("החלטות בזמן אמת", "real-time decisions"))}
      ${btn("body", "🫀", T("מפת הגוף", "Body map"), T("הקש על שריר", "tap a muscle"))}
      ${btn("why", "🤔", T("למה זה נכון?", "Why is it right?"), T("הבנה עמוקה", "deep understanding"))}
    </div>
    ${play ? "" : `<button class="btn block more-btn" data-pm="games">🎪 ${T("משחקים (במצב משחק יש עוד)", "Games (more in game mode)")}</button>`}
    <div class="section-title"><h2>📚 ${T("תחומי לימוד", "Study topics")}</h2><span class="muted xs">${BANK.length} ${T("שאלות", "questions")}</span></div>
    <div class="card" style="padding:4px 16px">${ts.map(t => `<div class="topic" data-topic="${t.f}"><div class="em">${TOPICS[t.f].icon}</div>
      <div class="tx"><b>${tName(t.f)}</b><span class="muted xs">${t.total} ${T("שאלות · שליטה", "questions · mastery")} ${t.mastery}%${t.acc !== null ? ` · ${T("דיוק", "accuracy")} ${t.acc}%` : ""}</span>
      <div class="mini-bar"><i style="width:${t.mastery}%"></i></div></div><span class="chev">‹</span></div>`).join("")}</div>`);
  const map = { final: () => startMode("final"), path: coursePage, night: nightBeforeExam, notebook: mistakesNotebook, listen: listenPage, demos: demosPage, drills: drillsPage, fa: firstAidPage,
    body: () => bodyMap(), why: whyMode,
    games: () => typeof moreModesSheet === "function" && moreModesSheet() };
  wrap.querySelectorAll("[data-pm]").forEach(b => b.onclick = () => map[b.dataset.pm] && map[b.dataset.pm]());
  wrap.querySelectorAll("[data-topic]").forEach(b => b.onclick = () => topicSheet(b.dataset.topic));
};

/* ───────── 4. מסלול הקורס בפרקים ───────── */
const COURSE_EN = ["The human body – anatomy", "Physiology at rest and during exercise", "Nutrition and exercise", "Fitness theory and training principles", "Exercises, technique and movement science", "Health and special populations", "Psychology and coaching", "Safety, first aid and law"];
COURSE.forEach((c, i) => { c.en = COURSE_EN[i]; });
const PATH_N = 15, PATH_PASS = 80;
function pathState() { if (!S.path) S.path = { les: {}, best: {} }; return S.path; }
function pathPassed(i) { return (pathState().best[i] || 0) >= PATH_PASS; }
function pathProg() { return { done: COURSE.filter((c, i) => pathPassed(i)).length }; }
function pathCurrent() { const i = COURSE.findIndex((c, j) => !pathPassed(j)); return i < 0 ? null : { ...COURSE[i], i }; }
function pathLesson(i) {
  const c = COURSE[i];
  sheet(`<div style="max-height:72vh;overflow:auto">${c.f.map(f => `<h2>${TOPICS[f].icon} ${tName(f)}</h2>${lessonBody(f)}`).join("")}</div>
    <div class="row"><button class="btn primary" data-a="ok">${T("קראתי ✓", "I've read it ✓")}</button></div>`, (e, close) => {
    if (!e.target.dataset.a) return; close();
    const st = pathState(); if (!st.les[i]) { st.les[i] = Date.now(); addXP(15); } save(); coursePage();
  });
  if (typeof anDecorate === "function") { const bgs = document.querySelectorAll(".modal-bg"); anDecorate(bgs[bgs.length - 1]); }
}
function pathTest(i) {
  const c = COURSE[i], pool = BANK.filter(q => c.f.includes(q.f) && q.t !== "open");
  startMode("coach", { qs: shuffle(freshSort(pool, true).slice(0, PATH_N)), title: `📚 ${T("פרק", "Chapter")} ${i + 1}: ${T(c.t, c.en)}` });
  if (typeof session !== "undefined" && session) session.pathCh = i;
}
coursePage = function () {
  const st = pathState(), cur = pathCurrent();
  funScreen(`<div class="fade-in">${funExitBtn()}<h2>📚 ${T("מסלול הקורס", "Course path")}</h2>
    <p class="muted small">${T(`${COURSE.length} פרקים לפי נושאי קורס מדריכי כושר. בכל פרק: שיעור קצר ומבחן של ${PATH_N} שאלות. עוברים ב־${PATH_PASS}% ומעלה.`, `${COURSE.length} chapters following the fitness instructor course. Each chapter: a short lesson and a ${PATH_N}-question test. Pass at ${PATH_PASS}% or more.`)}</p>
    <div class="xpbar" style="margin:4px 0 14px"><i style="width:${pct(pathProg().done, COURSE.length)}%"></i></div>
    <div class="col">${COURSE.map((c, i) => {
      const best = st.best[i], passed = pathPassed(i), isCur = cur && cur.i === i, les = !!st.les[i];
      return `<div class="card course-w ${isCur ? "cur" : ""} ${passed ? "done" : ""}"><div class="row" style="gap:10px"><span style="font-size:28px">${passed ? "✅" : c.em}</span>
        <div style="flex:1;min-width:0"><b>${T("פרק", "Chapter")} ${i + 1}: ${esc(T(c.t, c.en))}</b>
        <div class="muted xs">${c.f.map(tName).join(" · ")}</div>
        <div class="muted xs" style="margin-top:2px">📘 ${les ? T("השיעור נקרא ✓", "lesson read ✓") : T("שיעור – עוד לא", "lesson – not yet")} · 🎯 ${best != null ? `${T("הכי טוב", "best")}: ${best}%` : T("מבחן – עוד לא", "test – not yet")}</div></div></div>
        <div class="row" style="margin-top:8px"><button class="btn sm ${isCur && !les ? "primary" : ""}" data-les="${i}">📘 ${T("שיעור", "Lesson")}</button><button class="btn sm ${isCur && les ? "primary" : ""}" data-test="${i}">🎯 ${T("מבחן פרק", "Chapter test")}</button></div></div>`;
    }).join("")}</div>
    <p class="footer-note">${T("אפשר לעבור בין פרקים בכל סדר. הפרק המודגש הוא הבא בתור.", "You can do the chapters in any order. The highlighted one is next.")}</p></div>`);
  bindExit();
  app.querySelectorAll("[data-les]").forEach(b => b.onclick = () => pathLesson(+b.dataset.les));
  app.querySelectorAll("[data-test]").forEach(b => b.onclick = () => pathTest(+b.dataset.test));
};

/* ───────── 5. אחרי מבחן: פירוט נושאים + "למה טעיתי" ───────── */
const CONFUSIONS = [
  [/גיד|tendon/i, /רצוע|ligament/i, "גיד מחבר שריר לעצם; רצועה מחברת עצם לעצם ומייצבת מפרק.", "A tendon connects muscle to bone; a ligament connects bone to bone and stabilizes a joint."],
  [/קונצנטרי|concentric/i, /אקסצנטרי|eccentric/i, "קונצנטרי – השריר מתקצר (עלייה). אקסצנטרי – השריר מתארך תחת עומס (ירידה).", "Concentric – the muscle shortens (lifting). Eccentric – it lengthens under load (lowering)."],
  [/סופינצי|supinat/i, /פרונצי|pronat/i, "סופינציה – כף היד למעלה (קערת מרק). פרונציה – כף היד למטה.", "Supination – palm up (a bowl of soup). Pronation – palm down."],
  [/הרחקה|abduct/i, /קירוב|adduct/i, "הרחקה – מתרחקים מקו האמצע. קירוב – חוזרים אליו.", "Abduction – moving away from the midline. Adduction – moving back to it."],
  [/סגיטלי|sagittal/i, /פרונטלי|frontal|טרנסברס|transverse|רוחבי/i, "סגיטלי – קדימה/אחורה. פרונטלי – לצדדים. טרנסברסלי – סיבובים.", "Sagittal – forward/back. Frontal – to the sides. Transverse – rotations."],
  [/אגוניסט|agonist|prime mover/i, /אנטגוניסט|antagonist|סינרגיסט|synergist|מייצב|stabilizer/i, "אגוניסט מבצע, אנטגוניסט עושה את ההפך, סינרגיסט עוזר, מייצב מחזיק יציב.", "The agonist does the movement, the antagonist does the opposite, the synergist helps, the stabilizer holds steady."],
  [/ATP.?CP|פוספגן|phosphagen/i, /גליקוליז|glycoly|אירובי|aerobic/i, "עד ~10 שניות – ATP–CP. עשרות שניות עד 1–2 דקות – גליקוליזה. מאמץ ארוך – אירובי.", "Up to ~10 s – ATP–CP. Tens of seconds to 1–2 min – glycolysis. Long efforts – aerobic."],
  [/סיבים איטיים|type I\b|slow/i, /סיבים מהירים|type II|fast/i, "סוג I – איטיים ועמידים. סוג II – חזקים ומהירים, מתעייפים מהר.", "Type I – slow and resistant. Type II – strong and fast, tire quickly."],
  [/פרוקסימלי|proximal/i, /דיסטלי|distal/i, "פרוקסימלי – קרוב למרכז הגוף. דיסטלי – רחוק ממנו.", "Proximal – closer to the body's center. Distal – farther from it."],
  [/מדיאלי|medial/i, /לטרלי|lateral/i, "מדיאלי – קרוב לקו האמצע. לטרלי – רחוק ממנו.", "Medial – close to the midline. Lateral – away from it."],
  [/כפיפה גבית|dorsiflex/i, /כפיפה כפית|plantar/i, "כפיפה גבית – כף הרגל עולה לשוק. כפיפה כפית – הבהונות למטה.", "Dorsiflexion – the foot lifts toward the shin. Plantar flexion – toes point down."],
  [/BMR/i, /TDEE/i, "BMR – הוצאה במנוחה מוחלטת. TDEE – כל ההוצאה ביום, כולל פעילות.", "BMR – expenditure at complete rest. TDEE – the whole day's expenditure, including activity."],
  [/קיפוז|kyphosis/i, /לורדוז|lordosis|סקוליוז|scoliosis/i, "קיפוזיס – גב עליון עגול. לורדוזיס מוגברת – קשת גדולה בגב התחתון. סקוליוזיס – עקמת לצד.", "Kyphosis – rounded upper back. Increased lordosis – a big lower-back arch. Scoliosis – a sideways curve."],
  [/נקע|sprain/i, /מתיחת שריר|strain/i, "נקע – פגיעה ברצועה. מתיחת שריר – פגיעה בשריר או בגיד.", "Sprain – a ligament injury. Strain – a muscle or tendon injury."],
  [/תשישות חום|heat exhaustion/i, /מכת חום|heat stroke/i, "תשישות חום – בהכרה, מזיע, חלש. מכת חום – בלבול וחום גבוה מאוד: חירום.", "Heat exhaustion – conscious, sweating, weak. Heat stroke – confusion and very high temperature: an emergency."],
  [/סטטי|static/i, /דינמי|dynamic|בליסטי|ballistic/i, "סטטית – החזקה בלי תנועה (בסוף אימון). דינמית – תנועה מבוקרת (בחימום). בליסטית – קפיצית, מסוכנת.", "Static – a hold without movement (end of training). Dynamic – controlled movement (warm-up). Ballistic – bouncy, risky."],
  [/פנימית|intrinsic/i, /חיצונית|extrinsic/i, "פנימית – הנאה ועניין. חיצונית – פרסים, לחץ, הכרה.", "Intrinsic – enjoyment and interest. Extrinsic – rewards, pressure, recognition."],
  [/מטרת תהליך|process goal/i, /מטרת תוצאה|outcome goal/i, "מטרת תהליך – מה שאני עושה ובשליטתי. מטרת תוצאה – מה שיוצא בסוף.", "Process goal – what I do, within my control. Outcome goal – the end result."],
  [/עורק|arter/i, /וריד|vein/i, "עורקים – מהלב לגוף. ורידים – בחזרה ללב.", "Arteries – from the heart to the body. Veins – back to the heart."],
  [/פוטנציה|power/i, /כוח מרבי|max(imal)? strength/i, "כוח מרבי – כמה כוח. פוטנציה – כמה כוח מהר (כוח × מהירות).", "Max strength – how much force. Power – how much force, fast (force × speed)."],
  [/מישור|plane/i, /ציר|axis/i, "מישור – המשטח שבו התנועה קורית. ציר – הקו שסביבו מסתובבים.", "Plane – the surface the movement happens in. Axis – the line you rotate around."]
];
function confusionFor(q) {
  const txt = [q.q, q.e, ...(q.o || []), typeof q.a === "string" ? q.a : ""].join(" ");
  const c = CONFUSIONS.find(([a, b]) => a.test(txt) && b.test(txt));
  return c ? T(c[2], c[3]) : "";
}
const _showResultL = showResult;
showResult = function (o) {
  const s = typeof session !== "undefined" ? session : null;
  const pathCh = s && s.pathCh != null ? s.pathCh : null;
  if (pathCh != null && o && typeof o.p === "number") {
    const st = pathState(), was = pathPassed(pathCh);
    st.best[pathCh] = Math.max(st.best[pathCh] || 0, o.p); save();
    if (!was && pathPassed(pathCh)) { o.title = `✅ ${T("עברת את הפרק!", "Chapter passed!")}`; addXP(50); }
    else if (!pathPassed(pathCh)) o.title = T(`צריך ${PATH_PASS}% כדי לעבור – כמעט שם 💪`, `You need ${PATH_PASS}% to pass – almost there 💪`);
  }
  _showResultL(o);
  const items = (o && o.items) || [];
  const card = app.querySelector(".fade-in > .card"); if (!card || !items.length) return;
  // פירוט לפי נושאים (כשיש 8+ שאלות)
  const by = {};
  items.forEach(it => { if (it.grade === null || !TOPICS[it.q.f]) return; const b = by[it.q.f] = by[it.q.f] || { n: 0, c: 0 }; b.n++; b.c += it.grade; });
  const rows = Object.entries(by).sort((a, b) => a[1].c / a[1].n - b[1].c / b[1].n);
  let extra = "";
  if (items.length >= 8 && rows.length > 1) {
    extra += `<div class="card"><h2>📊 ${T("לפי נושאים", "By topic")}</h2>${rows.map(([f, b]) => { const p = Math.round(b.c / b.n * 100);
      return `<div class="rs-row"><span>${TOPICS[f].icon} ${esc(tName(f))}</span><div class="rs-bar"><i style="width:${p}%;background:${p >= 75 ? "var(--accent)" : p >= 55 ? "var(--warn)" : "var(--bad)"}"></i></div><b dir="ltr">${p}%</b></div>`; }).join("")}
      ${rows[0] && rows[0][1].c / rows[0][1].n < .75 ? `<button class="btn block" id="rsWeak" style="margin-top:10px">📉 ${T("תרגול על", "Practice")} ${esc(tName(rows[0][0]))}</button>` : ""}</div>`;
  }
  // למה טעיתי
  const wrong = items.filter(it => it.grade !== null && it.grade < 1 && it.q.t !== "open").slice(0, 12);
  if (wrong.length) {
    extra += `<div class="card"><h2>🧐 ${T("למה טעיתי?", "Why was I wrong?")}</h2><p class="muted xs" style="margin-top:0">${T("לכל טעות: מה ענית, מה נכון, ואיך לחשוב על זה בפעם הבאה.", "For each mistake: what you answered, what's right, and how to think about it next time.")}</p>
      ${wrong.map(it => { const q = it.q, mine = q.t === "mc" && it.ans != null ? q.o[it.order[it.ans]] : q.t === "tf" && it.ans != null ? (it.ans === 1 ? T("נכון", "True") : T("לא נכון", "False")) : "";
        const right = q.t === "mc" ? q.o[q.a] : (q.a ? T("נכון", "True") : T("לא נכון", "False"));
        const hint = typeof hintFor === "function" ? hintFor(q) : "", conf = confusionFor(q);
        return `<div class="ww"><div class="ww-q">${esc(q.q)}</div>
          ${mine ? `<div class="ww-l no">✗ ${T("ענית", "You answered")}: ${esc(mine)}</div>` : `<div class="ww-l no">✗ ${T("לא ענית", "Not answered")}</div>`}
          <div class="ww-l ok">✓ ${T("נכון", "Correct")}: ${esc(right)}</div>
          <div class="ww-l">💡 ${linkTerms(q.e)}</div>
          ${hint ? `<div class="ww-l muted">🧭 ${esc(hint)}</div>` : ""}
          ${conf ? `<div class="ww-conf">⚠️ ${T("בלבול נפוץ", "Common mix-up")}: ${esc(conf)}</div>` : ""}</div>`; }).join("")}</div>`;
  }
  if (extra) { card.insertAdjacentHTML("afterend", `<div data-notr="1">${extra}</div>`); const w = $("#rsWeak"); if (w) w.onclick = () => startMode("topic", { f: rows[0][0] }); }
  if (pathCh != null) { const b = document.createElement("button"); b.className = "btn primary block"; b.style.marginTop = "8px"; b.textContent = `📚 ${T("חזרה למסלול", "Back to the path")}`; b.onclick = coursePage; const h = $("#home"); h && h.before(b); }
};

/* ───────── 6. מצב האזנה ───────── */
let LS = null;
function lsVoice(lang) {
  const vs = speechSynthesis.getVoices(); return vs.find(v => v.lang && v.lang.toLowerCase().startsWith(lang)) || null;
}
function lsSay(text, cb) {
  if (!LS || !LS.on) return;
  const en = typeof isEn === "function" && isEn();
  const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, " "));
  u.lang = en ? "en-US" : "he-IL"; const v = lsVoice(en ? "en" : "he"); if (v) u.voice = v;
  u.rate = LS.rate; u.onend = () => { if (LS && LS.on) cb && cb(); }; u.onerror = () => { if (LS && LS.on) cb && cb(); };
  speechSynthesis.speak(u);
}
function lsWait(ms, cb) { LS.t = setTimeout(() => { if (LS && LS.on) cb(); }, ms); }
function lsStop() { if (LS) { LS.on = false; clearTimeout(LS.t); } try { speechSynthesis.cancel(); } catch (e) { } }
function listenPage() {
  if (!("speechSynthesis" in window)) return toast("🔇", T("המכשיר לא תומך בהקראה", "This device doesn't support read-aloud"));
  const src = [["mix", "🎲", T("מעורב", "Mixed")], ["mis", "✗", T("הטעויות שלי", "My mistakes")], ...TOPIC_KEYS.map(f => [f, TOPICS[f].icon, tName(f)])];
  let pick = "mix", rate = 1, pause = 5;
  const draw = () => {
    funScreen(`<div class="fade-in">${funExitBtn()}<h2>🎧 ${T("מצב האזנה", "Listening mode")}</h2>
      <p class="muted small">${T("ההקראה קוראת שאלה, עוצרת כדי שתחשוב, ואז את התשובה וההסבר. מתאים לנסיעה, להליכה או לאימון.", "It reads a question, pauses so you can think, then the answer and the explanation. Great for a drive, a walk or a workout.")}</p>
      <label class="lbl">${T("מה לשמוע", "What to hear")}</label>
      <div class="chips" id="lsSrc">${src.map(([k, em, n]) => `<button class="chip ${k === pick ? "on" : ""}" data-k="${k}">${em} ${esc(n)}</button>`).join("")}</div>
      <label class="lbl">${T("זמן לחשוב", "Thinking time")}</label>
      <div class="seg" id="lsPause">${[3, 5, 8].map(n => `<button data-k="${n}" class="${n === pause ? "on" : ""}">${n} ${T("שנ׳", "s")}</button>`).join("")}</div>
      <label class="lbl">${T("מהירות", "Speed")}</label>
      <div class="seg" id="lsRate">${[[0.85, T("איטי", "Slow")], [1, T("רגיל", "Normal")], [1.2, T("מהיר", "Fast")]].map(([k, n]) => `<button data-k="${k}" class="${k === rate ? "on" : ""}">${n}</button>`).join("")}</div>
      <button class="btn primary lg block" id="lsGo" style="margin-top:16px">▶ ${T("התחל להאזין", "Start listening")}</button>
      ${!lsVoice((typeof isEn === "function" && isEn()) ? "en" : "he") ? `<p class="muted xs" style="margin-top:8px">⚠️ ${T("לא נמצא קול בעברית במכשיר. אפשר להתקין בהגדרות הטלפון: שפה וקלט ← המרת טקסט לדיבור.", "No voice for this language was found. You can install one in the phone's text-to-speech settings.")}</p>` : ""}</div>`);
    bindExit();
    $("#lsSrc").onclick = e => { const b = e.target.closest(".chip"); if (b) { pick = b.dataset.k; draw(); } };
    $("#lsPause").onclick = e => { const b = e.target.closest("button"); if (b) { pause = +b.dataset.k; draw(); } };
    $("#lsRate").onclick = e => { const b = e.target.closest("button"); if (b) { rate = +b.dataset.k; draw(); } };
    $("#lsGo").onclick = () => {
      const pool = pick === "mis" ? mistakes() : pick === "mix" ? freshSort(BANK.filter(q => q.t !== "open"), true) : freshSort(BANK.filter(q => q.f === pick && q.t !== "open"), true);
      if (!pool.length) return toast("🎧", T("אין שאלות כאן עדיין", "No questions here yet"));
      lsPlay(shuffle(pool.slice(0, 30)).slice(0, 20), rate, pause);
    };
  };
  draw();
}
function lsPlay(qs, rate, pause) {
  lsStop(); LS = { on: true, i: 0, rate, qs, paused: false };
  const keys = T("אבגד", "ABCD");
  const screen = (q, phase) => {
    funScreen(`<div class="fade-in ls-play">${funExitBtn()}<div class="muted xs">🎧 ${LS.i + 1}/${qs.length} · ${TOPICS[q.f].icon} ${esc(tName(q.f))}</div>
      <div class="ls-q">${esc(q.q)}</div>
      ${q.t === "mc" ? `<div class="ls-opts">${q.o.map((o, j) => `<div class="${phase === "ans" && j === q.a ? "ok" : ""}"><b>${keys[j]}</b> ${esc(o)}</div>`).join("")}</div>` : `<div class="ls-opts"><div>${T("נכון או לא נכון?", "True or false?")}</div></div>`}
      ${phase === "think" ? `<div class="ls-think">🤔 ${T("חשוב על התשובה...", "Think about the answer...")}</div>` : ""}
      ${phase === "ans" ? `<div class="ls-ans">✓ ${esc(q.t === "mc" ? q.o[q.a] : q.a ? T("נכון", "True") : T("לא נכון", "False"))}<div class="muted small" style="margin-top:6px">${esc(q.e)}</div></div>` : ""}
      <div class="row" style="margin-top:16px"><button class="btn" id="lsPrev">⏮</button><button class="btn primary" id="lsPause2" style="flex:1">${LS.paused ? "▶ " + T("המשך", "Resume") : "⏸ " + T("השהה", "Pause")}</button><button class="btn" id="lsNext">⏭</button></div>
      <button class="btn ghost block" id="lsEnd" style="margin-top:8px">⏹ ${T("סיום", "Stop")}</button></div>`);
    const ex = $(".fun-exit") || $("#funExit"); bindExit();
    document.querySelectorAll(".fun-exit,#funExit,[data-exit]").forEach(b => b.addEventListener("click", lsStop));
    $("#lsEnd").onclick = () => { lsStop(); listenPage(); };
    $("#lsNext").onclick = () => { lsStop(); LS.on = true; LS.paused = false; LS.i = Math.min(qs.length, LS.i + 1); step(); };
    $("#lsPrev").onclick = () => { lsStop(); LS.on = true; LS.paused = false; LS.i = Math.max(0, LS.i - 1); step(); };
    $("#lsPause2").onclick = () => { if (LS.paused) { LS.paused = false; LS.on = true; step(); } else { lsStop(); LS.paused = true; screen(q, phase); } };
  };
  const step = () => {
    if (!LS || !LS.on) return;
    if (LS.i >= qs.length) { lsStop(); toast("🎧", T("סיימת את ההאזנה!", "Listening session done!")); return listenPage(); }
    const q = qs[LS.i];
    screen(q, "q");
    const opts = q.t === "mc" ? q.o.map((o, j) => `${keys[j]}. ${o}`).join(". ") : T("נכון או לא נכון?", "True or false?");
    lsSay(q.q + ". " + opts, () => {
      screen(q, "think");
      lsWait(pause * 1000, () => {
        screen(q, "ans");
        const right = q.t === "mc" ? q.o[q.a] : q.a ? T("נכון", "True") : T("לא נכון", "False");
        lsSay(T("התשובה: ", "The answer: ") + right + ". " + q.e, () => lsWait(1500, () => { LS.i++; step(); }));
      });
    });
  };
  step();
}
if (typeof tab !== "undefined" && !session && !document.querySelector(".modal-bg")) { try { if (tab === "home") renderHome(); else if (tab === "practice") renderPractice(); } catch (e) { } }
// עצירת ההקראה כשעוברים מסך
const _goL = go;
go = function (...a) { if (LS && LS.on) lsStop(); return _goL(...a); };
