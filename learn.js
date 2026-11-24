/* ═════════════ v11 – מסכים ראשיים: בית, תרגול, למידה וכלים ═════════════
   מבנה פשוט: בית (מה עושים היום) · תרגול (מבחנים, חזרה, אתגרים) · למידה (קורס, שיעורים, מילון)
   · כלים (תוכנית אימון, יומן, תזונה, טיימר) · התקדמות. */

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
const DW_LBL = { due: ["לחזרה", "to review"], mis: ["טעויות", "mistakes"], weak: ["נושא לחיזוק", "weak topic"], new: ["חדשות", "new"] };
function startDailyWorkout() {
  const p = dailyPlan();
  startMode("coach", { qs: p.qs, title: T("האימון היומי", "Daily workout") });
  if (typeof session !== "undefined" && session) session.dw = true;
}
const lvlName = L => { const t = levelTitle(L); return typeof isEn === "function" && isEn() && typeof LANG_EN !== "undefined" && LANG_EN[t] ? LANG_EN[t] : t; };
const overallMastery = () => Math.round(TOPIC_KEYS.reduce((a, f) => a + topicStats(f).mastery, 0) / TOPIC_KEYS.length);

/* ───────── 2. בית ───────── */
function learnHome() {
  const L = levelOf(S.xp), lo = xpFor(L), hi = xpFor(L + 1);
  const h = new Date().getHours();
  const greet = h < 5 ? T("לילה טוב", "Good night") : h < 12 ? T("בוקר טוב", "Good morning") : h < 17 ? T("צהריים טובים", "Good afternoon") : h < 21 ? T("ערב טוב", "Good evening") : T("לילה טוב", "Good night");
  const p = dailyPlan(), n = todayCount(), done = n >= S.goal;
  const ch = pathCurrent(), chp = pathProg(), mis = mistakes().length;
  const [term, def] = GLOSSARY[parseInt(hash("term" + today()), 36) % GLOSSARY.length];
  const games = typeof G_GAMES === "function" ? G_GAMES().filter(g => g[0] === "wd" || g[0] === "cn") : [];
  const gst = games.length ? gStatus() : {};
  app.innerHTML = `<div class="fade-in lh" data-notr>
  <div class="lh-greet">${greet}${S.name ? ", " + esc(S.name) : ""}</div>

  <div class="card lh-lvl">
    <div class="lh-lvl-top">
      <div class="level-badge">${L}</div>
      <div class="lh-lvl-tx"><b>${lvlName(L)}</b><div class="xpbar"><i style="width:${pct(S.xp - lo, hi - lo)}%"></i></div><small dir="ltr">${S.xp - lo} / ${hi - lo} XP</small></div>
    </div>
    <div class="lh-stats">
      <div><b>${currentStreak()}</b><span>${T("ימים ברצף", "day streak")}</span></div>
      <div><b>${Math.min(n, S.goal)}/${S.goal}</b><span>${T("היעד היומי", "daily goal")}</span></div>
      <div><b>${overallMastery()}%</b><span>${T("שליטה כללית", "mastery")}</span></div>
    </div>
  </div>

  <button class="card dw-card" id="dwGo">
    <div class="dw-k">${T("מומלץ להיום", "Recommended today")}</div>
    <b class="dw-t">${T("האימון היומי", "Daily workout")}</b>
    <div class="muted small">${p.qs.length} ${T("שאלות · כ־", "questions · ~")}${Math.max(3, Math.round(p.qs.length * 0.5))} ${T("דקות · מותאם לפי הטעויות והנושאים החלשים שלך", "min · built from your mistakes and weak topics")}</div>
    <div class="dw-parts">${p.parts.map(([k, c]) => `<span>${c} ${T(DW_LBL[k][0], DW_LBL[k][1])}${k === "weak" ? " · " + esc(tName(p.weak)) : ""}</span>`).join("")}</div>
    <div class="btn primary block lg dw-btn">${done ? T("עוד סבב", "Another round") : T("התחל", "Start")}</div>
    ${done ? `<div class="xs dw-done">${ui("check", 14)} ${T("השלמת את היעד היומי", "Daily goal completed")}</div>` : ""}
  </button>

  <div class="card list">
    ${lrow("path", "path", ch ? `${T("פרק", "Chapter")} ${ch.i + 1}: ${esc(T(ch.t, ch.en))}` : T("סיימת את מסלול הקורס", "Course path complete"), `${T("מסלול הקורס", "Course path")} · ${chp.done}/${COURSE.length} ${T("פרקים", "chapters")}`)}
    ${lrow("final", "cap", T("מבחן גמר מדומה", "Mock final exam"), T("40 שאלות · 50 דקות · עוברים ב־70%", "40 questions · 50 min · pass at 70%"))}
    ${lrow("mis", "repeat", T("חזרה על טעויות", "Review mistakes"), mis ? `${mis} ${T("שאלות לחיזוק", "questions to fix")}` : T("אין טעויות פתוחות", "No open mistakes"))}
  </div>

  ${games.length ? `<div class="section-title"><h2>${T("אתגר יומי", "Daily challenge")}</h2></div>
  <div class="g-home">${games.map(([k, i, t]) => `<button class="g-hc" data-g="${k}"><span class="g-fi">${ui(i, 20)}</span><div><b>${t}</b><small>${gst[k]}</small></div>${gst[k + "New"] ? "<i></i>" : ""}</button>`).join("")}</div>` : ""}

  <div class="card term-card" id="lhTerm">
    <div class="tc-k">${ui("dict", 16)} ${T("מונח היום", "Term of the day")}</div>
    <b>${esc(term)}</b><p>${linkTerms(def, term)}</p>
  </div>
  <p class="footer-note">${T("כלי לימודי בלבד. אינו תחליף להכשרה מוסמכת, להנחיות רפואיות או לייעוץ מקצועי.", "A learning tool only. Not a substitute for certified training, medical guidance or professional advice.")}</p>
  </div>`;
  $("#dwGo").onclick = startDailyWorkout;
  bindRows(app, { path: () => coursePage(), final: () => startMode("final"), mis: () => startMode("mistakes") });
  app.querySelectorAll(".g-hc").forEach(x => x.onclick = () => G_GAMES().find(g => g[0] === x.dataset.g)[4]());
}

/* ───────── 3. תרגול ───────── */
function practiceHome() {
  const mis = mistakes().length, due = dueQuestions().length;
  const ts = TOPIC_KEYS.map(f => ({ f, ...topicStats(f) }));
  const games = typeof G_GAMES === "function" ? G_GAMES() : [];
  const gst = games.length ? gStatus() : {};
  app.innerHTML = `<div class="fade-in" data-notr>
  <h1>${T("תרגול", "Practice")}</h1>

  <div class="section-title"><h2>${T("מבחנים", "Tests")}</h2></div>
  <div class="card list">
    ${lrow("exam", "clock", T("סימולציית מבחן", "Exam simulation"), T("30 שאלות · 35 דקות · משוב בסוף", "30 questions · 35 min · feedback at the end"))}
    ${lrow("final", "cap", T("מבחן גמר מדומה", "Mock final exam"), T("40 שאלות לפי נושאי הקורס · 50 דקות", "40 questions across the course · 50 min"))}
    ${lrow("custom", "sliders", T("מבחן מותאם אישית", "Custom test"), T("בוחרים תחומים, רמה ומספר שאלות", "Choose topics, level and length"))}
    ${lrow("quick", "bolt", T("תרגול מהיר", "Quick practice"), T("10 שאלות ברמה שלך", "10 questions at your level"))}
  </div>

  <div class="section-title"><h2>${T("חזרה וחיזוק", "Review")}</h2></div>
  <div class="card list">
    ${lrow("due", "repeat", T("חזרה חכמה", "Smart review"), due ? `${due} ${T("שאלות שהגיע זמנן", "questions due")}` : T("אין שאלות לחזרה היום", "Nothing due today"))}
    ${lrow("notebook", "notebook", T("מחברת טעויות", "Mistakes notebook"), mis ? `${mis} ${T("שאלות פתוחות", "open questions")}` : T("אין טעויות פתוחות", "No open mistakes"))}
    ${lrow("night", "moon", T("חזרה לפני מבחן", "Pre-exam review"), T("20 השאלות שהכי חשוב לך לחזור עליהן", "Your 20 most important questions"))}
    ${lrow("flash", "cards", T("כרטיסיות", "Flashcards"), T("הופכים, בודקים את עצמך ומדרגים", "Flip, check yourself, rate"))}
    ${lrow("terms", "dict", T("מבחן מונחים", "Terms quiz"), `${GLOSSARY.length} ${T("מונחים", "terms")}`)}
    ${lrow("listen", "headphones", T("האזנה", "Listening"), T("שאלות ותשובות בקול – לנסיעה או להליכה", "Questions read aloud – for the road"))}
    ${S.bm.length ? lrow("bookmarks", "star", T("שאלות שמורות", "Saved questions"), `${S.bm.length} ${T("שאלות", "questions")}`) : ""}
  </div>

  ${games.length ? `<div class="section-title"><h2>${T("אתגרים", "Challenges")}</h2></div>
  <div class="g-feat">${games.map(([k, i, t, sub]) => `<button class="g-fc" data-g="${k}"><span class="g-fi">${ui(i, 20)}</span><b>${t}</b><small>${sub}</small><em class="${gst[k + "New"] ? "new" : ""}">${gst[k]}</em></button>`).join("")}</div>` : ""}

  <div class="section-title"><h2>${T("לפי נושא", "By topic")}</h2><span class="muted xs">${BANK.length} ${T("שאלות", "questions")}</span></div>
  <div class="card" style="padding:4px 16px">${ts.map(t => `<div class="topic" data-topic="${t.f}"><div class="em">${TOPICS[t.f].icon}</div>
    <div class="tx"><b>${esc(tName(t.f))}</b><span class="muted xs">${t.total} ${T("שאלות · שליטה", "questions · mastery")} ${t.mastery}%${t.acc !== null ? ` · ${T("דיוק", "accuracy")} ${t.acc}%` : ""}</span>
    <div class="mini-bar"><i style="width:${t.mastery}%"></i></div></div><span class="chev">‹</span></div>`).join("")}</div>
  </div>`;
  bindRows(app, {
    exam: () => startMode("exam"), final: () => startMode("final"), custom: renderBuilder, quick: () => startMode("quick"),
    due: () => startMode("due"), notebook: mistakesNotebook, night: nightBeforeExam, flash: () => startFlash(TOPIC_KEYS),
    terms: () => startMode("terms"), listen: listenPage, bookmarks: () => startMode("bookmarks")
  });
  app.querySelectorAll(".g-fc").forEach(b => b.onclick = () => G_GAMES().find(g => g[0] === b.dataset.g)[4]());
  app.querySelectorAll("[data-topic]").forEach(b => b.onclick = () => topicSheet(b.dataset.topic));
}

/* ───────── 3ב. למידה: מסלול ומפת גוף בראש השיעורים ───────── */
const _renderLearnV = renderLearn;
renderLearn = function (sub) {
  _renderLearnV(sub);
  const seg = $("#lseg");
  if (seg) seg.querySelectorAll("button").forEach(b => { b.textContent = ({ lessons: "שיעורים", glossary: "מילון", facts: "עובדות" })[b.dataset.k] || b.textContent; });
  const body = $("#lbody"); if (!body || learnSeg !== "lessons") return;
  const chp = pathProg();
  body.insertAdjacentHTML("afterbegin", `<div class="card list" style="margin-top:8px">
    ${lrow("path", "path", T("מסלול הקורס", "Course path"), `${chp.done}/${COURSE.length} ${T("פרקים · שיעור ומבחן בכל פרק", "chapters · a lesson and a test each")}`)}
    ${lrow("body", "body", T("מפת הגוף", "Body map"), T("לוחצים על שריר: מה הוא עושה ואיך מאמנים אותו", "Tap a muscle: what it does and how to train it"))}
  </div>`);
  bindRows(body, { path: () => coursePage(), body: () => bodyMap() });
};

/* ───────── 3ג. כלים ───────── */
function toolsHub() {
  app.innerHTML = `<div class="fade-in"><h1>כלים</h1><p class="muted" style="margin-top:0">כלים מעשיים לעבודה עם מתאמנים.</p>
  <div class="section-title"><h2>אימון</h2></div>
  <div class="card list">
    ${lrow("plan", "dumbbell", "תוכנית אימון", "בונים תוכנית עם הדגמות, סטים וחזרות")}
    ${lrow("prog", "log", "יומן ומעקב משקלים", "רישום אימונים, שיאים וגרף התקדמות")}
    ${lrow("timer", "timer", "טיימר אימון", "טבטה, HIIT ו־EMOM")}
  </div>
  <div class="section-title"><h2>תזונה</h2></div>
  <div class="card list">
    ${lrow("food", "food", "ערכים תזונתיים", "כותבים מה אכלו – ומקבלים קלוריות וחלבון")}
    ${lrow("calc", "calc", "מחשבונים", "BMR, הוצאה יומית, דופק מטרה ועוד")}
  </div></div>`;
  bindRows(app, {
    plan: () => { pbView = "plan"; go("plan"); }, prog: () => go("plan", "prog"),
    timer: () => go("tools", { seg: "timer" }), food: () => go("tools", { seg: "food" }), calc: () => go("tools", { seg: "calc" })
  });
}
const toolsBack = () => {
  const root = app.firstElementChild; if (!root || root.querySelector(".back-link.tb")) return;
  root.insertAdjacentHTML("afterbegin", `<button class="back-link tb">‹ כלים</button>`);
  root.querySelector(".back-link.tb").onclick = () => go("tools");
};
const _renderToolsV = renderTools;
renderTools = function (sub) { _renderToolsV(sub); toolsBack(); };
const _renderPlanV = renderPlan;
renderPlan = function (sub) { _renderPlanV(sub); if (!document.body.classList.contains("in-quiz")) toolsBack(); };

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
  startMode("coach", { qs: shuffle(freshSort(pool, true).slice(0, PATH_N)), title: `${T("פרק", "Chapter")} ${i + 1}: ${T(c.t, c.en)}` });
  if (typeof session !== "undefined" && session) session.pathCh = i;
}
coursePage = function () {
  const st = pathState(), cur = pathCurrent();
  funScreen(`<div class="fade-in">${funExitBtn()}<h1>${T("מסלול הקורס", "Course path")}</h1>
    <p class="muted small">${T(`${COURSE.length} פרקים לפי נושאי קורס מדריכי כושר. בכל פרק: שיעור קצר ומבחן של ${PATH_N} שאלות. עוברים ב־${PATH_PASS}% ומעלה.`, `${COURSE.length} chapters following the fitness instructor course. Each chapter: a short lesson and a ${PATH_N}-question test. Pass at ${PATH_PASS}% or more.`)}</p>
    <div class="xpbar" style="margin:4px 0 14px"><i style="width:${pct(pathProg().done, COURSE.length)}%"></i></div>
    <div class="col">${COURSE.map((c, i) => {
      const best = st.best[i], passed = pathPassed(i), isCur = cur && cur.i === i, les = !!st.les[i];
      return `<div class="card course-w ${isCur ? "cur" : ""} ${passed ? "done" : ""}"><div class="row" style="gap:10px"><span style="font-size:28px">${passed ? "✅" : c.em}</span>
        <div style="flex:1;min-width:0"><b>${T("פרק", "Chapter")} ${i + 1}: ${esc(T(c.t, c.en))}</b>
        <div class="muted xs">${c.f.map(tName).join(" · ")}</div>
        <div class="muted xs" style="margin-top:2px">${les ? T("השיעור נקרא ✓", "lesson read ✓") : T("שיעור – עוד לא", "lesson – not yet")} · ${best != null ? `${T("הכי טוב", "best")}: ${best}%` : T("מבחן – עוד לא", "test – not yet")}</div></div></div>
        <div class="row" style="margin-top:8px"><button class="btn sm ${isCur && !les ? "primary" : ""}" data-les="${i}">${T("שיעור", "Lesson")}</button><button class="btn sm ${isCur && les ? "primary" : ""}" data-test="${i}">${T("מבחן פרק", "Chapter test")}</button></div></div>`;
    }).join("")}</div>
    <p class="footer-note">${T("אפשר לעבור בין פרקים בכל סדר. הפרק המודגש הוא הבא בתור.", "You can do the chapters in any order. The highlighted one is next.")}</p></div>`);
  bindExit("learn");
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
    extra += `<div class="card"><h2>${T("לפי נושאים", "By topic")}</h2>${rows.map(([f, b]) => { const p = Math.round(b.c / b.n * 100);
      return `<div class="rs-row"><span>${TOPICS[f].icon} ${esc(tName(f))}</span><div class="rs-bar"><i style="width:${p}%;background:${p >= 75 ? "var(--accent)" : p >= 55 ? "var(--warn)" : "var(--bad)"}"></i></div><b dir="ltr">${p}%</b></div>`; }).join("")}
      ${rows[0] && rows[0][1].c / rows[0][1].n < .75 ? `<button class="btn block" id="rsWeak" style="margin-top:10px">${T("תרגול על", "Practice")} ${esc(tName(rows[0][0]))}</button>` : ""}</div>`;
  }
  // למה טעיתי
  const wrong = items.filter(it => it.grade !== null && it.grade < 1 && it.q.t !== "open").slice(0, 12);
  if (wrong.length) {
    extra += `<div class="card"><h2>${T("למה טעיתי?", "Why was I wrong?")}</h2><p class="muted xs" style="margin-top:0">${T("לכל טעות: מה ענית, מה נכון, ואיך לחשוב על זה בפעם הבאה.", "For each mistake: what you answered, what's right, and how to think about it next time.")}</p>
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
  if (pathCh != null) { const b = document.createElement("button"); b.className = "btn primary block"; b.style.marginTop = "8px"; b.textContent = T("חזרה למסלול", "Back to the path"); b.onclick = coursePage; const h = $("#home"); h && h.before(b); }
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
    funScreen(`<div class="fade-in">${funExitBtn()}<h1>${T("האזנה", "Listening")}</h1>
      <p class="muted small">${T("ההקראה קוראת שאלה, עוצרת כדי שתחשוב, ואז את התשובה וההסבר. מתאים לנסיעה, להליכה או לאימון.", "It reads a question, pauses so you can think, then the answer and the explanation. Great for a drive, a walk or a workout.")}</p>
      <label class="lbl">${T("מה לשמוע", "What to hear")}</label>
      <div class="chips" id="lsSrc">${src.map(([k, em, n]) => `<button class="chip ${k === pick ? "on" : ""}" data-k="${k}">${em} ${esc(n)}</button>`).join("")}</div>
      <label class="lbl">${T("זמן לחשוב", "Thinking time")}</label>
      <div class="seg" id="lsPause">${[3, 5, 8].map(n => `<button data-k="${n}" class="${n === pause ? "on" : ""}">${n} ${T("שנ׳", "s")}</button>`).join("")}</div>
      <label class="lbl">${T("מהירות", "Speed")}</label>
      <div class="seg" id="lsRate">${[[0.85, T("איטי", "Slow")], [1, T("רגיל", "Normal")], [1.2, T("מהיר", "Fast")]].map(([k, n]) => `<button data-k="${k}" class="${k === rate ? "on" : ""}">${n}</button>`).join("")}</div>
      <button class="btn primary lg block" id="lsGo" style="margin-top:16px">▶ ${T("התחל להאזין", "Start listening")}</button>
      ${!lsVoice((typeof isEn === "function" && isEn()) ? "en" : "he") ? `<p class="muted xs" style="margin-top:8px">⚠️ ${T("לא נמצא קול בעברית במכשיר. אפשר להתקין בהגדרות הטלפון: שפה וקלט ← המרת טקסט לדיבור.", "No voice for this language was found. You can install one in the phone's text-to-speech settings.")}</p>` : ""}</div>`);
    bindExit("practice");
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
    bindExit("practice");
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
// עצירת ההקראה כשעוברים מסך
const _goL = go;
go = function (...a) { if (LS && LS.on) lsStop(); return _goL(...a); };
