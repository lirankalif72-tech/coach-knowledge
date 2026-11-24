/* ═════════ v10 – משחקים בעיצוב כהה ונקי ═════════
   מילה יומית · קבוצות · קרב מדורג 1 על 1 · יותר או פחות
   + עיצוב אחיד ובוגר לכל משחקי החידון ולעמוד המשחקים. */

/* ───── עזרים ───── */
const GT = (he, en) => (typeof isEn === "function" && isEn()) ? en : he;
const EN_ = () => typeof isEn === "function" && isEn();
function ensureG() {
  if (S.tc) delete S.tc;
  if (S.best && "blast" in S.best) delete S.best.blast;
  if (S.arc) delete S.arc;
  const G = S.g = S.g || {};
  G.wd = G.wd || {};
  ["he", "en"].forEach(l => G.wd[l] = G.wd[l] || { d: "", guesses: [], done: false, win: false, played: 0, wins: 0, streak: 0, max: 0, dist: [0, 0, 0, 0, 0, 0], last: "" });
  G.cn = G.cn || { d: "", st: null, played: 0, wins: 0, streak: 0, last: "" };
  G.rk = G.rk || { r: 1000, best: 1000, w: 0, l: 0, dr: 0, streak: 0 };
  G.hl = G.hl || { cal: 0, pro: 0 };
}
ensureG();
const dayNo = (d = new Date()) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
function sShuffle(arr, seed) { const r = rng(seed), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function untilTomorrow() { const n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1); const m = Math.round((t - n) / 60000); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`; }

/* אייקונים בקו דק */
const IC = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  word: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 16l4-9 4 9M9.5 13h5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  updown: '<path d="M7 20V4M3 8l4-4 4 4M17 4v16M13 16l4 4 4-4"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  bksp: '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM18 9l-6 6M12 9l6 6"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  alert: '<path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  swords: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M14.5 6.5L18 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
  swipe: '<path d="M5 12h14M15 6l6 6-6 6M9 6l-6 6 6 6"/>',
  film: '<rect x="2" y="2" width="20" height="20" rx="2.5"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18M7 6h1v4"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  body: '<circle cx="12" cy="5" r="2"/><path d="M12 7v7M8 10h8M9 21l3-7 3 7"/>',
  cap: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  plus: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4z"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1"/><circle cx="15.5" cy="15.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/><circle cx="8.5" cy="15.5" r="1"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
};
const ic = (k, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ""}</svg>`;

/* צלילים עדינים */
const SFX_T = {};
function sfx(n) {
  if (!S.settings || !S.settings.sound) return;
  const now = performance.now(); if (SFX_T[n] && now - SFX_T[n] < 40) return; SFX_T[n] = now;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const t0 = actx.currentTime;
    const tone = (f, d, v = 0.05, at = 0, type = "sine") => {
      const o = actx.createOscillator(), g = actx.createGain(), t = t0 + at;
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + 0.02);
    };
    ({
      tap: () => tone(1200, 0.03, 0.02),
      ok: () => { tone(660, 0.12, 0.05); tone(990, 0.16, 0.04, 0.07); },
      no: () => tone(196, 0.18, 0.05, 0, "triangle"),
      flip: () => tone(520, 0.05, 0.025),
      tick: () => tone(1400, 0.025, 0.02),
      win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 0.045, i * 0.09)),
      lose: () => [330, 262].forEach((f, i) => tone(f, 0.25, 0.045, i * 0.14, "triangle")),
    })[n]?.();
  } catch (e) { }
}
function vib(p) { if (S.settings && S.settings.vib && navigator.vibrate) try { navigator.vibrate(p); } catch (e) { } }
function gShake(el) { if (!el) return; el.classList.remove("g-shake"); void el.offsetWidth; el.classList.add("g-shake"); }

/* מסך משחק: כהה, בלי הסרגל העליון */
function gScreen(title, right, body, cls = "") {
  funScreen(`<div class="g ${cls} fade-in" data-notr><div class="g-head"><button class="g-back" id="gBack" aria-label="${GT("חזרה", "Back")}">${ic("back", 22)}</button><b class="g-title">${title}</b><div class="g-right">${right || ""}</div></div>${body}</div>`);
  document.body.classList.add("gm");
  $("#gBack").onclick = () => go("practice");
}
function gStop() { if (RK) { clearInterval(RK.t); clearTimeout(RK.auto); RK.over = true; RK = null; } }

/* שאלות מהמאגר */
let GQ_RECENT = [];
const gqOkType = q => (q.t === "mc" || q.t === "tf") && !q.img;
function gqPick() {
  const ok = q => gqOkType(q) && !GQ_RECENT.includes(q.id);
  let pool = Math.random() < 0.25 ? mistakes().filter(ok) : [];
  if (!pool.length) pool = freshSort(BANK.filter(ok), true).slice(0, 25);
  if (!pool.length) pool = BANK.filter(gqOkType);
  const q = pool[Math.floor(Math.random() * Math.min(pool.length, 8))];
  GQ_RECENT.push(q.id); GQ_RECENT = GQ_RECENT.slice(-40);
  return q;
}
const gqOptions = q => q.t === "tf" ? [[GT("נכון", "True"), true], [GT("לא נכון", "False"), false]] : shuffle(q.o.map((o, i) => [o, i]));
const gqIs = (o, q) => q.t === "tf" ? o[1] === !!q.a : o[1] === q.a;
const gqRight = q => q.t === "tf" ? (q.a ? GT("נכון", "True") : GT("לא נכון", "False")) : q.o[q.a];

/* חזרה על טעויות */
function gReview(list, back) {
  gScreen(GT("חזרה על הטעויות", "Review mistakes"), "", `${list.map(({ q, pick }) => `<div class="g-rev"><div class="g-rev-q">${esc(q.q)}</div>
      <div class="g-rev-no">${ic("x", 15)} ${pick != null ? esc(pick) : GT("לא ענית בזמן", "No answer in time")}</div>
      <div class="g-rev-ok">${ic("check", 15)} ${esc(gqRight(q))}</div><div class="g-rev-e">${esc(q.e)}</div></div>`).join("")}
    <button class="g-btn" id="rvBack">${GT("חזרה", "Back")}</button>`);
  $("#gBack").onclick = $("#rvBack").onclick = back;
}

/* ═════════ 1. מילה יומית ═════════ */
const WD_LIST = {
  he: [
    ["פלאנק", "תרגיל ליבה סטטי: מחזיקים את הגוף בקו ישר על האמות או על כפות הידיים."],
    ["מתיחה", "הארכה מבוקרת של שריר כדי לשפר או לשמור על טווח התנועה."],
    ["חלבון", "מקרו־נוטריינט שמספק חומצות אמינו לבנייה ולתיקון של רקמות, כולל שריר."],
    ["שחייה", "פעילות אירובית במים שמעמיסה מעט על המפרקים."],
    ["אימון", "מפגש פעילות מתוכנן שמטרתו לשפר יכולת גופנית."],
    ["מנוחה", "הזמן שבו הגוף מתאושש ומסתגל לעומס האימון."],
    ["תזונה", "מה שאוכלים ושותים, והדרך שבה זה מספק לגוף אנרגיה וחומרי בניין."],
    ["קרדיו", "אימון אירובי שמעלה את הדופק לאורך זמן, כמו ריצה, אופניים או חתירה."],
    ["נשימה", "הכנסת חמצן והוצאת פחמן דו־חמצני. באימון כוח נוהגים לנשוף בשלב המאמץ."],
    ["חימום", "פעילות קלה לפני אימון שמעלה דופק וטמפרטורת שריר ומכינה את הגוף."],
    ["איזון", "היכולת לשמור על מרכז הכובד מעל בסיס התמיכה."],
    ["יציבה", "האופן שבו הגוף מוחזק בעמידה ובישיבה."],
    ["עצמות", "השלד. אימון כוח ופעילות עם נשיאת משקל עוזרים לחזק אותן."],
    ["גידים", "רקמה שמחברת שריר לעצם."],
    ["רצועה", "רקמה שמחברת עצם לעצם ומייצבת את המפרק."],
    ["פציעה", "נזק לרקמה. כאב חד במהלך אימון הוא סימן לעצור."],
    ["שיקום", "התהליך של חזרה לתפקוד מלא אחרי פציעה."],
    ["מכשיר", "ציוד אימון במכון שמכוון את מסלול התנועה."],
    ["מדריך", "איש מקצוע שמתכנן את האימון ומלווה אותו."],
    ["מתאמן", "מי שמתאמן תחת הדרכה."],
    ["חזרות", "מספר הפעמים שמבצעים תנועה ברצף בסט אחד."],
    ["סדרות", "קבוצות של חזרות עם מנוחה ביניהן (סטים)."],
    ["קפיצה", "תנועה נפיצה, הבסיס לאימון פליאומטרי."],
    ["הליכה", "פעילות אירובית בעצימות נמוכה שמתאימה כמעט לכל אחד."],
    ["חגורה", "חגורת הרמה שעוזרת לייצב את הליבה בהרמות כבדות."],
    ["גומיה", "גומיית התנגדות – ההתנגדות גדלה ככל שמותחים אותה."],
    ["ריאות", "איברי הנשימה, שבהם החמצן עובר לדם."],
    ["סיבים", "סיבי שריר: איטיים (סוג I) לסיבולת, מהירים (סוג II) לכוח ולנפיצות."],
    ["עצבים", "מעבירים אותות מהמוח לשרירים ומפעילים אותם."],
    ["כפיפה", "תנועה שמקטינה את הזווית במפרק, כמו כפיפת מרפק."],
    ["יישור", "תנועה שמגדילה את הזווית במפרק (אקסטנציה)."],
    ["הרחקה", "תנועה של איבר הרחק מקו האמצע של הגוף (אבדוקציה)."],
    ["קירוב", "תנועה של איבר לכיוון קו האמצע של הגוף (אדוקציה)."],
    ["לחיצה", "תנועת דחיפה, כמו לחיצת חזה או לחיצת כתפיים."],
    ["חתירה", "תרגיל משיכה אופקי לשרירי הגב."],
    ["תגובה", "זמן תגובה: הזמן מהגירוי ועד תחילת התנועה."],
    ["תיאום", "שילוב יעיל של תנועות של כמה חלקי גוף."],
    ["תנועה", "הבסיס לכל אימון. מתארים אותה לפי מישורים וצירים."],
    ["קרסול", "המפרק שמחבר בין השוק לכף הרגל."],
    ["צוואר", "החלק העליון של עמוד השדרה – החוליות הצוואריות."],
    ["סיבוב", "תנועה סביב ציר האורך של איבר או של הגוף (רוטציה)."],
    ["תנוחה", "מיקום הגוף בזמן תרגיל. תנוחה נכונה מגינה מפציעה."],
    ["דיאטה", "תפריט אכילה. בשפת היום־יום – לרוב הגבלה קלורית."],
    ["מינרל", "רכיב תזונתי אנאורגני, כמו סידן, ברזל ומגנזיום."],
    ["ספורט", "פעילות גופנית מאורגנת, לרוב תחרותית."],
    ["מרתון", "ריצה למרחק 42.195 ק״מ."],
    ["חיזוק", "אימון שמגביר את הכוח והסיבולת של השרירים."],
  ],
  en: [
    ["SQUAT", "A lower-body exercise: bend the hips and knees, then stand back up."],
    ["PLANK", "A static core hold with the body in a straight line on the forearms or hands."],
    ["LUNGE", "A single-leg step forward or back, lowering the back knee toward the floor."],
    ["PRESS", "A pushing movement, like a bench press or an overhead press."],
    ["BENCH", "Short for bench press – a horizontal push for the chest, shoulders and triceps."],
    ["CURLS", "Elbow-flexion exercises that train the biceps."],
    ["DELTS", "The deltoids – the rounded muscles that cap the shoulder."],
    ["GLUTE", "The gluteal muscles of the hip – the largest is the gluteus maximus."],
    ["QUADS", "The quadriceps – four muscles at the front of the thigh that extend the knee."],
    ["FIBER", "Plant carbohydrate that isn't fully digested; it supports gut health and fullness."],
    ["LIPID", "The scientific name for fats."],
    ["SUGAR", "A simple carbohydrate, such as glucose or sucrose."],
    ["WATER", "About 60% of body weight; even mild dehydration can hurt performance."],
    ["HEART", "The muscle that pumps blood; cardio training makes it more efficient."],
    ["LUNGS", "The organs where oxygen passes into the blood."],
    ["JOINT", "The place where two bones meet and movement happens."],
    ["BONES", "The skeleton. Strength training and weight-bearing activity help strengthen them."],
    ["PULSE", "Heart rate you can feel at the wrist or neck, in beats per minute."],
    ["POWER", "Force times speed – producing force quickly."],
    ["SPEED", "How fast you cover a distance or complete a movement."],
    ["CHEST", "The pectoral muscles, trained with presses, push-ups and flyes."],
    ["TORSO", "The trunk of the body, without the head and limbs."],
    ["SPINE", "The vertebral column: cervical, thoracic, lumbar, sacral and coccyx."],
    ["ANKLE", "The joint that connects the lower leg to the foot."],
    ["KNEES", "Hinge-like joints between the thigh and the lower leg."],
    ["WRIST", "The joint between the forearm and the hand."],
    ["ELBOW", "The hinge joint between the upper arm and the forearm."],
    ["NERVE", "Carries signals from the brain to the muscles."],
    ["STEPS", "A simple daily activity measure; walking more adds up."],
    ["DANCE", "Rhythmic movement that can be a great aerobic workout."],
    ["CYCLE", "Riding a bike – low-impact cardio."],
    ["CARBS", "Carbohydrates – the body's main fuel for high-intensity exercise."],
    ["MACRO", "Macronutrient: protein, carbohydrate or fat."],
    ["SWEAT", "How the body cools down – not a measure of fat burned."],
    ["TRAIN", "To exercise in a planned way to improve fitness."],
    ["COACH", "A professional who plans and guides training."],
    ["CLEAN", "An Olympic lift that brings the bar from the floor to the shoulders."],
    ["HINGE", "A movement pattern that bends at the hips with a neutral spine, as in a deadlift."],
    ["PIVOT", "A joint type that allows rotation, like the top of the neck."],
    ["TIBIA", "The shin bone – the larger of the two lower-leg bones."],
    ["FEMUR", "The thigh bone – the longest bone in the body."],
  ]
};
const WD_KEYS = {
  he: [["ק", "ר", "א", "ט", "ו", "פ"], ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל"], ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת"]],
  en: [["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"], ["A", "S", "D", "F", "G", "H", "J", "K", "L"], ["Z", "X", "C", "V", "B", "N", "M"]]
};
const FIN = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" }, TOFIN = { "כ": "ך", "מ": "ם", "נ": "ן", "פ": "ף", "צ": "ץ" };
const wdNorm = w => [...w.toUpperCase()].map(c => FIN[c] || c);
const wdShow = (c, i) => (i === 4 && TOFIN[c]) || c;
let WD = null;
function wdScore(guess, ans) {
  const res = Array(5).fill("x"), left = {};
  ans.forEach((c, i) => { if (guess[i] === c) res[i] = "g"; else left[c] = (left[c] || 0) + 1; });
  guess.forEach((c, i) => { if (res[i] !== "g" && left[c]) { res[i] = "y"; left[c]--; } });
  return res;
}
function wordGame(practice) {
  ensureG(); gStop();
  const L = EN_() ? "en" : "he", list = WD_LIST[L], st = S.g.wd[L];
  let entry;
  if (practice) entry = list[Math.floor(Math.random() * list.length)];
  else {
    entry = sShuffle(list, 9137)[dayNo() % list.length];
    if (st.d !== today()) { st.d = today(); st.guesses = []; st.done = false; st.win = false; save(); }
  }
  WD = { L, practice: !!practice, ans: wdNorm(entry[0]), word: entry[0], e: entry[1], guesses: practice ? [] : st.guesses.map(g => [...g]), cur: [], done: practice ? false : st.done, busy: false };
  gScreen(practice ? GT("מילה – תרגול", "Word – practice") : GT("המילה היומית", "Daily word"),
    `<button class="g-icon" id="wdHelp" aria-label="help">${ic("help")}</button>`,
    `<div class="wd-grid" id="wdGrid" dir="${L === "he" ? "rtl" : "ltr"}"></div>
     <div class="g-msg" id="wdMsg"></div>
     <div class="wd-kb" id="wdKb" dir="${L === "he" ? "rtl" : "ltr"}">${WD_KEYS[L].map((r, i) => `<div class="wd-row">${i === 2 ? `<button class="wd-k wide" data-k="enter">${GT("אישור", "Enter")}</button>` : ""}${r.map(k => `<button class="wd-k" data-k="${k}">${k}</button>`).join("")}${i === 2 ? `<button class="wd-k wide" data-k="del" aria-label="delete">${ic("bksp", 20)}</button>` : ""}</div>`).join("")}</div>
     <div id="wdEnd"></div>`, "wd");
  $("#wdHelp").onclick = wdHelp;
  $("#wdKb").onclick = e => { const b = e.target.closest("[data-k]"); if (b) wdKey(b.dataset.k); };
  wdDraw(); wdKbPaint();
  if (WD.done) wdEnd(false);
  if (!practice && !st.seenHelp) { st.seenHelp = 1; save(); setTimeout(wdHelp, 300); }
}
function wdHelp() {
  sheet(`<div class="g-sheet" data-notr><h2>${GT("איך משחקים", "How to play")}</h2>
    <p>${GT("מנחשים מונח מעולם הכושר בן 5 אותיות, ב־6 ניסיונות. אחרי כל ניחוש הצבעים מראים כמה קרוב היית.", "Guess a 5-letter fitness word in 6 tries. After each guess, the colors show how close you were.")}</p>
    <div class="wd-ex"><span class="wd-t g">${GT("ש", "S")}</span><span>${GT("האות במילה ובמקום הנכון", "In the word, in the right spot")}</span></div>
    <div class="wd-ex"><span class="wd-t y">${GT("ר", "Q")}</span><span>${GT("האות במילה, אבל במקום אחר", "In the word, in a different spot")}</span></div>
    <div class="wd-ex"><span class="wd-t x">${GT("ל", "U")}</span><span>${GT("האות לא נמצאת במילה", "Not in the word")}</span></div>
    ${EN_() ? "" : `<p class="g-note">אותיות סופיות נחשבות כמו רגילות (ם = מ).</p>`}
    <p class="g-note">${GT("מילה חדשה בכל יום. אפשר גם לתרגל בלי הגבלה.", "A new word every day. You can also practice without limits.")}</p>
    <button class="g-btn primary" data-x>${GT("הבנתי", "Got it")}</button></div>`, (e, close) => { if (e.target.closest("[data-x]")) close(); });
}
function wdDraw(revealRow = -1) {
  const g = $("#wdGrid"); if (!g) return;
  let h = "";
  for (let r = 0; r < 6; r++) {
    const guess = WD.guesses[r], isCur = r === WD.guesses.length && !WD.done;
    const sc = guess ? wdScore(guess, WD.ans) : null;
    h += `<div class="wd-line" data-r="${r}">`;
    for (let i = 0; i < 5; i++) {
      const c = guess ? guess[i] : isCur ? WD.cur[i] : "";
      const cls = sc ? sc[i] : c ? "fill" : "";
      h += `<span class="wd-t ${cls} ${r === revealRow ? "rev" : ""}" style="${r === revealRow ? `animation-delay:${i * 0.22}s` : ""}">${c ? wdShow(c, i) : ""}</span>`;
    }
    h += `</div>`;
  }
  g.innerHTML = h;
}
function wdKbPaint() {
  const best = {}, rank = { g: 3, y: 2, x: 1 };
  WD.guesses.forEach(gs => wdScore(gs, WD.ans).forEach((s, i) => { const c = gs[i]; if (!best[c] || rank[s] > rank[best[c]]) best[c] = s; }));
  app.querySelectorAll(".wd-k[data-k]").forEach(b => { b.classList.remove("g", "y", "x"); const s = best[b.dataset.k]; if (s) b.classList.add(s); });
}
function wdMsg(t) { const m = $("#wdMsg"); if (!m) return; m.textContent = t; m.classList.remove("on"); void m.offsetWidth; m.classList.add("on"); }
function wdKey(k) {
  if (!WD || WD.done || WD.busy) return;
  if (k === "del") { WD.cur.pop(); sfx("tap"); return wdDraw(); }
  if (k === "enter") {
    if (WD.cur.length < 5) { wdMsg(GT("צריך 5 אותיות", "Not enough letters")); gShake(app.querySelector(`.wd-line[data-r="${WD.guesses.length}"]`)); sfx("no"); return; }
    const guess = WD.cur.slice(); WD.guesses.push(guess); WD.cur = []; WD.busy = true;
    const win = guess.join("") === WD.ans.join(""), lose = !win && WD.guesses.length >= 6;
    if (!WD.practice) { const st = S.g.wd[WD.L]; st.guesses = WD.guesses.map(g => g.join("")); save(); }
    wdDraw(WD.guesses.length - 1);
    for (let i = 0; i < 5; i++) setTimeout(() => sfx("flip"), i * 220 + 150);
    setTimeout(() => {
      if (!WD) return;
      WD.busy = false; wdKbPaint();
      if (win || lose) { WD.done = true; wdFinish(win); }
    }, 5 * 220 + 300);
    return;
  }
  if (WD.cur.length >= 5) return;
  const c = FIN[k] || k;
  WD.cur.push(c); sfx("tap"); wdDraw();
  const t = app.querySelectorAll(`.wd-line[data-r="${WD.guesses.length}"] .wd-t`)[WD.cur.length - 1]; t && t.classList.add("pop");
}
document.addEventListener("keydown", e => {
  if (!WD || !$("#wdGrid") || document.querySelector(".modal-bg") || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "Enter") { e.preventDefault(); wdKey("enter"); }
  else if (e.key === "Backspace") { e.preventDefault(); wdKey("del"); }
  else if (WD.L === "he" && /^[א-ת]$/.test(e.key)) wdKey(e.key);
  else if (WD.L === "en" && /^[a-zA-Z]$/.test(e.key)) wdKey(e.key.toUpperCase());
});
function wdFinish(win) {
  const tries = WD.guesses.length;
  if (!WD.practice) {
    const st = S.g.wd[WD.L];
    st.done = true; st.win = win; st.played++;
    const y = today(new Date(Date.now() - 864e5));
    if (win) { st.wins++; st.streak = st.last === y ? st.streak + 1 : 1; st.max = Math.max(st.max, st.streak); st.dist[tries - 1]++; } else st.streak = 0;
    st.last = today();
    addXP(win ? 30 + (6 - tries) * 5 : 10);
    touchStreak(); logHistory({ mode: "word", title: GT("מילה יומית", "Daily word"), score: win ? 100 : 0, n: tries }); save();
  } else if (win) { addXP(5); save(); }
  if (win) {
    sfx("win"); vib(30);
    app.querySelectorAll(`.wd-line[data-r="${tries - 1}"] .wd-t`).forEach((t, i) => { t.style.animationDelay = i * 0.08 + "s"; t.classList.add("bounce"); });
  } else sfx("lose");
  setTimeout(() => wdEnd(true), win ? 900 : 400);
}
function wdEnd(anim) {
  const st = S.g.wd[WD.L], win = WD.practice ? WD.guesses.at(-1)?.join("") === WD.ans.join("") : st.win;
  const kb = $("#wdKb"); if (kb) kb.hidden = true;
  const maxD = Math.max(1, ...st.dist);
  $("#wdEnd").innerHTML = `<div class="g-card wd-res ${anim ? "in" : ""}">
    <div class="g-kicker">${win ? GT("פתרת", "Solved") + ` · ${WD.guesses.length}/6` : GT("המילה הייתה", "The word was")}</div>
    <div class="wd-word">${WD.word}</div>
    <p class="g-p">${esc(WD.e)}</p>
    ${WD.practice ? "" : `<div class="g-stats"><div><b>${st.played}</b><span>${GT("שיחקת", "Played")}</span></div><div><b>${pct(st.wins, st.played)}%</b><span>${GT("ניצחונות", "Win %")}</span></div><div><b>${st.streak}</b><span>${GT("רצף", "Streak")}</span></div><div><b>${st.max}</b><span>${GT("שיא", "Max")}</span></div></div>
    <div class="wd-dist">${st.dist.map((n, i) => `<div class="wd-bar"><span>${i + 1}</span><i style="width:${Math.max(6, n / maxD * 100)}%" class="${win && i === WD.guesses.length - 1 ? "on" : ""}">${n}</i></div>`).join("")}</div>
    <div class="g-note">${GT("מילה חדשה בעוד", "Next word in")} <b dir="ltr">${untilTomorrow()}</b></div>`}
    <div class="g-row">${WD.practice ? "" : `<button class="g-btn" id="wdShare">${ic("share", 18)} ${GT("שיתוף", "Share")}</button>`}<button class="g-btn primary" id="wdPrac">${GT("עוד מילה לתרגול", "Practice another")}</button></div></div>`;
  $("#wdPrac").onclick = () => wordGame(true);
  const sh = $("#wdShare"); if (sh) sh.onclick = () => {
    const grid = WD.guesses.map(g => wdScore(g, WD.ans).map(s => ({ g: "🟩", y: "🟨", x: "⬛" })[s]).join("")).join("\n");
    const txt = `${GT("מאמן ידע – המילה היומית", "Coach Knowledge – Daily word")} ${win ? WD.guesses.length : "X"}/6\n${grid}`;
    if (navigator.share) navigator.share({ text: txt }).catch(() => { }); else { navigator.clipboard?.writeText(txt); toast("📋", GT("הועתק", "Copied")); }
  };
}

/* ═════════ 2. קבוצות ═════════ */
/* כל פריט שייך לקטגוריה אחת בלבד – כך שלכל לוח יש פתרון יחיד */
const CN_CATS = [
  { id: "cardio", lv: 1, he: "מכשירי קרדיו", en: "Cardio machines", i: [["הליכון", "Treadmill"], ["אליפטיקל", "Elliptical"], ["מכונת חתירה", "Rowing machine"], ["אופני כושר", "Exercise bike"]] },
  { id: "legbone", lv: 1, he: "עצמות הרגל", en: "Leg bones", i: [["עצם הירך", "Femur"], ["שוקה", "Tibia"], ["שוקית", "Fibula"], ["פיקה", "Patella"]] },
  { id: "mineral", lv: 1, he: "מינרלים", en: "Minerals", i: [["סידן", "Calcium"], ["ברזל", "Iron"], ["מגנזיום", "Magnesium"], ["אבץ", "Zinc"]] },
  { id: "sugar", lv: 1, he: "סוכרים", en: "Sugars", i: [["גלוקוז", "Glucose"], ["פרוקטוז", "Fructose"], ["סוכרוז", "Sucrose"], ["לקטוז", "Lactose"]] },
  { id: "heart", lv: 1, he: "חללי הלב", en: "Heart chambers", i: [["עלייה ימנית", "Right atrium"], ["עלייה שמאלית", "Left atrium"], ["חדר ימני", "Right ventricle"], ["חדר שמאלי", "Left ventricle"]] },
  { id: "push", lv: 2, he: "תרגילי דחיפה", en: "Pushing exercises", i: [["לחיצת חזה", "Bench press"], ["שכיבות סמיכה", "Push-ups"], ["לחיצת כתפיים", "Overhead press"], ["מקבילים", "Dips"]] },
  { id: "pull", lv: 2, he: "תרגילי משיכה", en: "Pulling exercises", i: [["מתח", "Pull-ups"], ["חתירה בישיבה", "Seated row"], ["פולי עליון", "Lat pulldown"], ["פייס פול", "Face pull"]] },
  { id: "legs", lv: 2, he: "תרגילי רגליים", en: "Leg exercises", i: [["סקוואט", "Squat"], ["מכרע", "Lunge"], ["לחיצת רגליים", "Leg press"], ["עלייה על ספסל", "Step-up"]] },
  { id: "spine", lv: 2, he: "אזורי עמוד השדרה", en: "Regions of the spine", i: [["צווארי", "Cervical"], ["חזי", "Thoracic"], ["מותני", "Lumbar"], ["עצה", "Sacral"]] },
  { id: "fatvit", lv: 2, he: "ויטמינים מסיסים בשומן", en: "Fat-soluble vitamins", i: [["ויטמין A", "Vitamin A"], ["ויטמין D", "Vitamin D"], ["ויטמין E", "Vitamin E"], ["ויטמין K", "Vitamin K"]] },
  { id: "watvit", lv: 2, he: "ויטמינים מסיסים במים", en: "Water-soluble vitamins", i: [["ויטמין C", "Vitamin C"], ["ויטמין B12", "Vitamin B12"], ["ויטמין B6", "Vitamin B6"], ["חומצה פולית", "Folate"]] },
  { id: "contr", lv: 3, he: "סוגי התכווצות שריר", en: "Types of muscle contraction", i: [["קונצנטרית", "Concentric"], ["אקסצנטרית", "Eccentric"], ["איזומטרית", "Isometric"], ["איזוקינטית", "Isokinetic"]] },
  { id: "princ", lv: 3, he: "עקרונות אימון", en: "Training principles", i: [["עומס יתר", "Overload"], ["ספציפיות", "Specificity"], ["הדרגתיות", "Progression"], ["הפיכות", "Reversibility"]] },
  { id: "comp", lv: 3, he: "מרכיבי כושר הקשורים לבריאות", en: "Health-related fitness components", i: [["סיבולת לב־ריאה", "Cardio endurance"], ["כוח שריר", "Muscular strength"], ["סיבולת שריר", "Muscular endurance"], ["גמישות", "Flexibility"]] },
  { id: "arm", lv: 3, he: "עצמות הגפה העליונה", en: "Upper-limb bones", i: [["עצם הזרוע", "Humerus"], ["חישור", "Radius"], ["גומד", "Ulna"], ["עצם השכמה", "Scapula"]] },
  { id: "horm", lv: 3, he: "הורמונים", en: "Hormones", i: [["אינסולין", "Insulin"], ["גלוקגון", "Glucagon"], ["קורטיזול", "Cortisol"], ["אדרנלין", "Adrenaline"]] },
  { id: "elbow", lv: 3, he: "שרירים שפועלים על המרפק", en: "Muscles that move the elbow", i: [["דו־ראשי", "Biceps"], ["תלת־ראשי", "Triceps"], ["ברכיאליס", "Brachialis"], ["ברכיורדיאליס", "Brachioradialis"]] },
  { id: "rot", lv: 4, he: "השרוול המסובב", en: "Rotator cuff", i: [["סופרספינטוס", "Supraspinatus"], ["אינפרספינטוס", "Infraspinatus"], ["טרס מינור", "Teres minor"], ["סאבסקפולריס", "Subscapularis"]] },
  { id: "abs", lv: 4, he: "שרירי הבטן", en: "Abdominal muscles", i: [["ישר הבטן", "Rectus abdominis"], ["אלכסוני חיצוני", "External oblique"], ["אלכסוני פנימי", "Internal oblique"], ["רוחבי הבטן", "Transverse abdominis"]] },
  { id: "joint", lv: 4, he: "סוגי מפרקים סינוביאליים", en: "Synovial joint types", i: [["ציר", "Hinge"], ["כדור ומכתש", "Ball and socket"], ["סיבובי", "Pivot"], ["אוכף", "Saddle"]] },
];
let CN = null;
const cnCat = id => CN_CATS.find(c => c.id === id);
const cnLabel = key => { const [id, n] = key.split(":"); return cnCat(id).i[+n][EN_() ? 1 : 0]; };
function cnNew(seed) {
  const r = rng(seed), pool = CN_CATS.slice(), cats = [], lvN = {};
  while (cats.length < 4) {
    const c = pool.splice(Math.floor(r() * pool.length), 1)[0];
    if ((lvN[c.lv] || 0) >= 2) continue;
    lvN[c.lv] = (lvN[c.lv] || 0) + 1; cats.push(c.id);
  }
  cats.sort((a, b) => cnCat(a).lv - cnCat(b).lv);
  const items = sShuffle(cats.flatMap(id => [0, 1, 2, 3].map(n => id + ":" + n)), seed + 7);
  return { cats, items, solved: [], mistakes: 4, tried: [], done: false, win: false };
}
function connGame(practice) {
  ensureG(); gStop();
  const G = S.g.cn;
  let st;
  if (practice) st = cnNew(Math.floor(Math.random() * 1e9));
  else { if (G.d !== today() || !G.st) { G.d = today(); G.st = cnNew(dayNo() * 31 + 5); save(); } st = G.st; }
  CN = { practice: !!practice, st, sel: [] };
  gScreen(practice ? GT("קבוצות – תרגול", "Connections – practice") : GT("קבוצות", "Connections"),
    `<button class="g-icon" id="cnHelp" aria-label="help">${ic("help")}</button>`,
    `<p class="g-sub">${GT("מצא 4 קבוצות של 4 מונחים שיש להם משהו משותף.", "Find four groups of four terms that share something.")}</p>
     <div id="cnSolved"></div><div class="cn-grid" id="cnGrid"></div>
     <div class="cn-mist" id="cnMist"></div><div class="g-msg" id="cnMsg"></div>
     <div class="g-row" id="cnCtl"><button class="g-btn" id="cnShuf">${ic("shuffle", 17)} ${GT("ערבוב", "Shuffle")}</button><button class="g-btn" id="cnClr">${GT("ניקוי", "Deselect")}</button><button class="g-btn primary" id="cnGo">${GT("בדיקה", "Submit")}</button></div>
     <div id="cnEnd"></div>`, "cn");
  $("#cnHelp").onclick = () => sheet(`<div class="g-sheet" data-notr><h2>${GT("איך משחקים", "How to play")}</h2>
    <p>${GT("על הלוח 16 מונחים. בוחרים 4 שלדעתך שייכים לאותה קבוצה ולוחצים \"בדיקה\".", "There are 16 terms. Pick four you think belong together and tap Submit.")}</p>
    <p>${GT("מותר לטעות 4 פעמים. שים לב למלכודות – חלק מהמונחים נראים כאילו הם שייכים ליותר מקבוצה אחת.", "You can make four mistakes. Watch for traps – some terms look like they fit more than one group.")}</p>
    <p class="g-note">${GT("לוח חדש בכל יום, ואפשר לתרגל בלי הגבלה.", "A new board every day, and unlimited practice.")}</p>
    <button class="g-btn primary" data-x>${GT("הבנתי", "Got it")}</button></div>`, (e, close) => { if (e.target.closest("[data-x]")) close(); });
  $("#cnShuf").onclick = () => { const left = st.items.filter(k => !st.solved.includes(k.split(":")[0])); const sh = shuffle(left); st.items = [...st.items.filter(k => st.solved.includes(k.split(":")[0])), ...sh]; sfx("tap"); cnDraw(); };
  $("#cnClr").onclick = () => { CN.sel = []; cnDraw(); };
  $("#cnGo").onclick = cnSubmit;
  cnDraw();
  if (st.done) cnEnd(false);
}
function cnDraw() {
  const st = CN.st;
  $("#cnSolved").innerHTML = st.solved.map(id => { const c = cnCat(id); return `<div class="cn-row c${st.cats.indexOf(id)}"><b>${GT(c.he, c.en)}</b><span>${c.i.map(x => x[EN_() ? 1 : 0]).join(" · ")}</span></div>`; }).join("");
  const left = st.items.filter(k => !st.solved.includes(k.split(":")[0]));
  $("#cnGrid").innerHTML = left.map(k => `<button class="cn-t ${CN.sel.includes(k) ? "on" : ""} ${cnLabel(k).length > 9 ? "long" : ""}" data-k="${k}">${esc(cnLabel(k))}</button>`).join("");
  $("#cnGrid").querySelectorAll(".cn-t").forEach(b => b.onclick = () => {
    if (st.done) return;
    const k = b.dataset.k;
    if (CN.sel.includes(k)) CN.sel = CN.sel.filter(x => x !== k); else if (CN.sel.length < 4) CN.sel.push(k); else return;
    sfx("tap"); b.classList.toggle("on", CN.sel.includes(k)); cnCtl();
  });
  $("#cnMist").innerHTML = `${GT("טעויות שנשארו", "Mistakes left")}: ${[0, 1, 2, 3].map(i => `<i class="${i < st.mistakes ? "on" : ""}"></i>`).join("")}`;
  cnCtl();
}
function cnCtl() { const go = $("#cnGo"); if (go) go.disabled = CN.sel.length !== 4; const c = $("#cnClr"); if (c) c.disabled = !CN.sel.length; }
function cnMsg(t) { const m = $("#cnMsg"); if (!m) return; m.textContent = t; m.classList.remove("on"); void m.offsetWidth; m.classList.add("on"); }
function cnSubmit() {
  const st = CN.st; if (CN.sel.length !== 4 || st.done) return;
  const key = CN.sel.slice().sort().join("|");
  if (st.tried.includes(key)) { cnMsg(GT("כבר ניסית את הצירוף הזה", "Already guessed")); return; }
  st.tried.push(key);
  const cats = CN.sel.map(k => k.split(":")[0]), cnt = {};
  cats.forEach(c => cnt[c] = (cnt[c] || 0) + 1);
  const top = Math.max(...Object.values(cnt));
  if (top === 4) {
    st.solved.push(cats[0]); CN.sel = []; sfx("ok"); vib(20);
    if (st.solved.length === 4) { st.done = true; st.win = true; }
    cnSave(); cnDraw();
    const rows = app.querySelectorAll(".cn-row"); rows[rows.length - 1]?.classList.add("in");
    if (st.done) cnFinish();
  } else {
    st.mistakes--; sfx("no"); vib([30, 40, 30]);
    app.querySelectorAll(".cn-t.on").forEach(b => gShake(b));
    cnMsg(top === 3 ? GT("כמעט! חסר רק אחד", "One away…") : GT("לא הפעם", "Not quite"));
    if (st.mistakes <= 0) { st.done = true; st.win = false; st.solved = st.cats.slice(); CN.sel = []; cnSave(); setTimeout(() => { cnDraw(); cnFinish(); }, 600); return; }
    cnSave(); setTimeout(cnDraw, 450);
  }
}
function cnSave() { if (!CN.practice) save(); }
function cnFinish() {
  const st = CN.st;
  if (!CN.practice) {
    const G = S.g.cn, y = today(new Date(Date.now() - 864e5));
    G.played++; if (st.win) { G.wins++; G.streak = G.last === y ? G.streak + 1 : 1; } else G.streak = 0; G.last = today();
    addXP(st.win ? 30 + st.mistakes * 5 : 10);
    touchStreak(); logHistory({ mode: "conn", title: GT("קבוצות", "Connections"), score: st.win ? 100 : 0, n: 4 - st.mistakes }); save();
  } else if (st.win) { addXP(5); save(); }
  sfx(st.win ? "win" : "lose");
  cnEnd(true);
}
function cnEnd(anim) {
  const st = CN.st, G = S.g.cn;
  $("#cnCtl").hidden = true; $("#cnMist").hidden = true;
  $("#cnEnd").innerHTML = `<div class="g-card ${anim ? "in" : ""}">
    <div class="g-kicker">${st.win ? GT("כל הכבוד", "Well done") : GT("נגמרו הניסיונות", "Out of tries")}</div>
    <h2 class="g-h">${st.win ? GT(4 - st.mistakes === 0 ? "פתרת בלי אף טעות" : 4 - st.mistakes === 1 ? "פתרת עם טעות אחת" : `פתרת עם ${4 - st.mistakes} טעויות`, `Solved with ${4 - st.mistakes} mistake${4 - st.mistakes === 1 ? "" : "s"}`) : GT("הנה הפתרון", "Here's the solution")}</h2>
    ${CN.practice ? "" : `<div class="g-stats"><div><b>${G.played}</b><span>${GT("שיחקת", "Played")}</span></div><div><b>${pct(G.wins, G.played)}%</b><span>${GT("ניצחונות", "Win %")}</span></div><div><b>${G.streak}</b><span>${GT("רצף", "Streak")}</span></div></div>
    <div class="g-note">${GT("לוח חדש בעוד", "Next board in")} <b dir="ltr">${untilTomorrow()}</b></div>`}
    <button class="g-btn primary" id="cnPrac">${GT("לוח נוסף לתרגול", "Practice another board")}</button></div>`;
  $("#cnPrac").onclick = () => connGame(true);
}

/* ═════════ 3. קרב מדורג 1 על 1 ═════════ */
const RK_DIV = [
  { he: "ברונזה", en: "Bronze", min: 0, c: "#c08a5a" }, { he: "כסף", en: "Silver", min: 1100, c: "#b8c2cf" },
  { he: "זהב", en: "Gold", min: 1250, c: "#e3b341" }, { he: "פלטינה", en: "Platinum", min: 1400, c: "#6ee7d0" },
  { he: "יהלום", en: "Diamond", min: 1550, c: "#8ab4f8" }, { he: "עילית", en: "Elite", min: 1700, c: "#c4a1ff" }
];
const rkDiv = r => RK_DIV.filter(d => r >= d.min).pop();
const rkBadge = (r, s = 18) => { const d = rkDiv(r); return `<svg class="rk-badge" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 2l8.7 5v10L12 22l-8.7-5V7z" fill="${d.c}" fill-opacity=".18" stroke="${d.c}" stroke-width="1.8"/><path d="M12 7l4.3 2.5v5L12 17l-4.3-2.5v-5z" fill="${d.c}"/></svg>`; };
const RK_NAMES = {
  he: ["נועה", "איתי", "מאיה", "יונתן", "תמר", "עומר", "שירה", "דניאל", "יעל", "אורי", "רוני", "נועם", "הילה", "גיא", "עידו", "טל", "מיכל", "רועי", "עדי", "אלון", "דנה", "יובל", "אסף", "ליאור", "שחר", "עמית", "הדר", "איתן"],
  en: ["Ava", "Leo", "Mia", "Noah", "Zoe", "Max", "Lily", "Sam", "Ella", "Jake", "Ruby", "Finn", "Ivy", "Owen", "Nina", "Kai", "Luna", "Eli", "Maya", "Theo", "Aria", "Ben", "Cleo", "Hugo", "Iris", "Liam", "Omar", "Sara"]
};
const RK_N = 7, RK_T = 12;
let RK = null;
function rankedGame() {
  ensureG(); gStop();
  const R = S.g.rk, d = rkDiv(R.r), nx = RK_DIV[RK_DIV.indexOf(d) + 1];
  gScreen(GT("קרב מדורג", "Ranked"), "", `
    <div class="g-card rk-me">
      <div class="rk-div">${rkBadge(R.r, 44)}<div><div class="g-kicker">${GT("הדרגה שלך", "Your division")}</div><b style="color:${d.c}">${GT(d.he, d.en)}</b></div><div class="rk-rating"><b dir="ltr">${R.r}</b><span>${GT("דירוג", "Rating")}</span></div></div>
      ${nx ? `<div class="g-prog"><i style="width:${Math.min(100, (R.r - d.min) / (nx.min - d.min) * 100)}%;background:${d.c}"></i></div><div class="g-note">${GT(`עוד ${nx.min - R.r} נקודות ל${nx.he}`, `${nx.min - R.r} points to ${nx.en}`)}</div>` : `<div class="g-note">${GT("הגעת לדרגה הגבוהה ביותר", "You reached the top division")}</div>`}
      <div class="g-stats"><div><b>${R.w}</b><span>${GT("ניצחונות", "Wins")}</span></div><div><b>${R.l}</b><span>${GT("הפסדים", "Losses")}</span></div><div><b>${R.streak}</b><span>${GT("רצף", "Streak")}</span></div><div><b dir="ltr">${R.best}</b><span>${GT("שיא", "Best")}</span></div></div>
    </div>
    <div class="g-card rk-how"><div>${ic("zap", 18)}<span>${GT(`${RK_N} שאלות, ${RK_T} שניות לכל אחת`, `${RK_N} questions, ${RK_T} seconds each`)}</span></div><div>${ic("target", 18)}<span>${GT("תשובה נכונה = 100 נק׳ + בונוס מהירות עד 100", "Correct = 100 pts + up to 100 speed bonus")}</span></div><div>${ic("trophy", 18)}<span>${GT("השאלה האחרונה שווה כפול", "The last question is worth double")}</span></div></div>
    <button class="g-btn primary big" id="rkGo">${GT("מצא יריב", "Find opponent")}</button>`, "rk");
  $("#rkGo").onclick = rkMatch;
}
function rkMatch() {
  const R = S.g.rk, names = RK_NAMES[EN_() ? "en" : "he"];
  const or = Math.max(800, Math.round(R.r + (Math.random() * 140 - 70)));
  const opp = { n: names[Math.floor(Math.random() * names.length)], r: or, acc: Math.min(0.92, Math.max(0.42, 0.5 + (or - 1000) / 1400)) };
  gScreen(GT("קרב מדורג", "Ranked"), "", `<div class="rk-find"><div class="rk-ring"><span></span><span></span>${ic("swords", 34)}</div><div class="g-kicker" id="rkF">${GT("מחפש יריב ברמה שלך…", "Finding an opponent at your level…")}</div></div>`, "rk");
  setTimeout(() => {
    if (!$(".rk-find")) return;
    $(".rk-find").innerHTML = `<div class="rk-vs in">
      <div class="rk-pl"><span class="rk-av me">${esc((S.name || GT("את", "Y")).slice(0, 1))}</span><b>${GT("את/ה", "You")}</b><small>${rkBadge(R.r)} <span dir="ltr">${R.r}</span></small></div>
      <div class="rk-vs-t">VS</div>
      <div class="rk-pl"><span class="rk-av">${esc(opp.n.slice(0, 1))}</span><b>${esc(opp.n)}</b><small>${rkBadge(opp.r)} <span dir="ltr">${opp.r}</span></small></div></div>`;
    sfx("ok");
    setTimeout(() => { if ($(".rk-vs")) rkStart(opp); }, 1500);
  }, 1300);
}
function rkStart(opp) {
  RK = { opp, i: -1, me: 0, op: 0, wrong: [], right: 0, times: [], over: false };
  gScreen(GT("קרב מדורג", "Ranked"), "", `
    <div class="rk-board">
      <div class="rk-side"><span class="rk-av me sm">${esc((S.name || GT("את", "Y")).slice(0, 1))}</span><div><small>${GT("את/ה", "You")}</small><b id="rkMe" dir="ltr">0</b></div><em id="rkMeSt"></em></div>
      <div class="rk-dots" id="rkDots">${Array(RK_N).fill(0).map(() => "<i></i>").join("")}</div>
      <div class="rk-side op"><span class="rk-av sm">${esc(opp.n.slice(0, 1))}</span><div><small>${esc(opp.n)}</small><b id="rkOp" dir="ltr">0</b></div><em id="rkOpSt"></em></div>
    </div>
    <div class="rk-timer"><i id="rkBar"></i></div>
    <div id="rkQ"></div>`, "rk");
  $("#gBack").onclick = () => { if (RK && !RK.over && !confirm(GT("לצאת מהקרב? זה ייחשב הפסד.", "Leave the match? It will count as a loss."))) return; if (RK && !RK.over) rkEnd(true); else { gStop(); gamesPage(); } };
  rkRound();
}
function rkRound() {
  if (!RK || RK.over) return;
  RK.i++;
  if (RK.i >= RK_N) return rkEnd(false);
  const q = gqPick(), opts = gqOptions(q), dbl = RK.i === RK_N - 1;
  Object.assign(RK, { q, opts, mine: null, mineT: null, botT: 1.6 + Math.random() * 5.5 * (1.25 - RK.opp.acc), botOk: Math.random() < RK.opp.acc, botDone: false, t0: performance.now(), lock: false, dbl });
  const dots = app.querySelectorAll("#rkDots i"); dots.forEach((d, j) => d.classList.toggle("cur", j === RK.i));
  $("#rkMeSt").innerHTML = ""; $("#rkOpSt").innerHTML = `<span class="rk-think"><i></i><i></i><i></i></span>`;
  $("#rkQ").innerHTML = `<div class="rk-qn">${GT("שאלה", "Question")} ${RK.i + 1}/${RK_N}${dbl ? ` · <b class="rk-dbl">${GT("ניקוד כפול", "Double points")}</b>` : ""}</div>
    <div class="g-q">${esc(q.q)}</div>
    <div class="g-opts ${opts.length === 2 ? "two" : ""}">${opts.map(([t], j) => `<button class="g-opt" data-i="${j}"><span class="g-key">${EN_() ? "ABCD"[j] : "אבגד"[j]}</span><span class="g-ot">${esc(t)}</span><span class="g-tags"></span></button>`).join("")}</div>
    <div id="rkFb"></div>`;
  $("#rkQ").querySelectorAll(".g-opt").forEach(b => b.onclick = () => rkPick(+b.dataset.i));
  clearInterval(RK.t); RK.t = setInterval(rkTick, 80);
}
function rkTick() {
  if (!RK || RK.over) return;
  const el = (performance.now() - RK.t0) / 1000, left = Math.max(0, RK_T - el), bar = $("#rkBar");
  if (bar) { bar.style.transform = `scaleX(${left / RK_T})`; bar.classList.toggle("low", left < 3.5); }
  if (!RK.botDone && el >= RK.botT) { RK.botDone = true; $("#rkOpSt").innerHTML = `<span class="rk-lock">${ic("check", 13)}</span>`; sfx("tick"); }
  if (left <= 0) { if (RK.mine === null) RK.mine = -1, RK.mineT = RK_T; if (!RK.botDone) { RK.botDone = true; RK.botOk = false; } }
  if (RK.mine !== null && RK.botDone && !RK.lock) rkReveal();
}
function rkPick(j) {
  if (!RK || RK.mine !== null || RK.lock) return;
  RK.mine = j; RK.mineT = (performance.now() - RK.t0) / 1000; sfx("tap");
  const b = $("#rkQ").querySelector(`.g-opt[data-i="${j}"]`); b.classList.add("sel");
  $("#rkQ").querySelectorAll(".g-opt").forEach(x => x.disabled = true);
  $("#rkMeSt").innerHTML = `<span class="rk-lock">${ic("check", 13)}</span>`;
  if (!RK.botDone) { RK.botT = Math.min(RK.botT, RK.mineT + 0.4 + Math.random() * 1.6); }
}
function rkReveal() {
  RK.lock = true; clearInterval(RK.t);
  const q = RK.q, opts = RK.opts, ri = opts.findIndex(o => gqIs(o, q)), ok = RK.mine === ri;
  const mult = RK.dbl ? 2 : 1;
  const myPts = ok ? (100 + Math.round(100 * Math.max(0, 1 - RK.mineT / RK_T))) * mult : 0;
  const opPts = RK.botOk ? (100 + Math.round(100 * Math.max(0, 1 - RK.botT / RK_T))) * mult : 0;
  const botPick = RK.botOk ? ri : (() => { const w = opts.map((o, j) => j).filter(j => j !== ri); return w[Math.floor(Math.random() * w.length)]; })();
  record(q, ok ? 1 : 0); save();
  if (ok) { RK.right++; sfx("ok"); vib(15); } else { RK.wrong.push({ q, pick: RK.mine >= 0 ? opts[RK.mine][0] : null }); sfx("no"); vib([25, 40, 25]); }
  RK.me += myPts; RK.op += opPts; if (RK.mine >= 0) RK.times.push(RK.mineT);
  const btns = $("#rkQ").querySelectorAll(".g-opt");
  btns.forEach((b, j) => { b.disabled = true; b.classList.remove("sel"); if (j === ri) b.classList.add("ok"); else if (j === RK.mine) b.classList.add("no"); else b.classList.add("dim"); });
  if (RK.mine >= 0) btns[RK.mine].querySelector(".g-tags").innerHTML += `<em class="me">${GT("את/ה", "You")}</em>`;
  btns[botPick].querySelector(".g-tags").innerHTML += `<em>${esc(RK.opp.n)}</em>`;
  rkCount($("#rkMe"), RK.me - myPts, RK.me); rkCount($("#rkOp"), RK.op - opPts, RK.op);
  $("#rkMeSt").innerHTML = myPts ? `<span class="rk-pts">+${myPts}</span>` : `<span class="rk-pts no">+0</span>`;
  $("#rkOpSt").innerHTML = opPts ? `<span class="rk-pts">+${opPts}</span>` : `<span class="rk-pts no">+0</span>`;
  const dot = app.querySelectorAll("#rkDots i")[RK.i]; dot.classList.remove("cur"); dot.classList.add(myPts > opPts ? "w" : myPts < opPts ? "l" : "d");
  const last = RK.i === RK_N - 1;
  $("#rkFb").innerHTML = ok
    ? `<button class="g-btn primary" id="rkNext"><span class="g-auto"></span><span>${last ? GT("לתוצאות", "Results") : GT("השאלה הבאה", "Next question")}</span></button>`
    : `<div class="g-exp"><b>${RK.mine >= 0 ? GT("לא נכון", "Incorrect") : GT("נגמר הזמן", "Time's up")}</b> ${GT("התשובה", "Answer")}: ${esc(gqRight(q))}<p>${esc(q.e)}</p></div><button class="g-btn primary" id="rkNext">${last ? GT("לתוצאות", "Results") : GT("השאלה הבאה", "Next question")}</button>`;
  const next = () => { clearTimeout(RK.auto); rkRound(); };
  $("#rkNext").onclick = next;
  if (ok) RK.auto = setTimeout(() => { if (RK && !RK.over) next(); }, 1800);
}
function rkCount(el, a, b) {
  if (!el) return; const t0 = performance.now();
  const f = () => { const k = Math.min(1, (performance.now() - t0) / 500); el.textContent = Math.round(a + (b - a) * k); if (k < 1) requestAnimationFrame(f); };
  f(); if (b > a) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
}
function rkEnd(forfeit) {
  if (!RK || RK.over) return;
  RK.over = true; clearInterval(RK.t); clearTimeout(RK.auto);
  const K = RK, R = S.g.rk, res = forfeit ? 0 : K.me > K.op ? 1 : K.me < K.op ? 0 : 0.5;
  const E = 1 / (1 + Math.pow(10, (K.opp.r - R.r) / 400));
  let delta = Math.round(32 * (res - E));
  if (res === 1) delta = Math.max(6, delta); if (res === 0) delta = Math.min(-6, delta);
  const old = R.r; R.r = Math.max(0, R.r + delta); R.best = Math.max(R.best, R.r);
  if (res === 1) { R.w++; R.streak++; } else if (res === 0) { R.l++; R.streak = 0; } else R.dr = (R.dr || 0) + 1;
  const xpGain = 20 + K.right * 8 + (res === 1 ? 25 : 0);
  addXP(xpGain);
  touchStreak(); logHistory({ mode: "ranked", title: GT("קרב מדורג", "Ranked"), score: pct(K.right, RK_N), n: RK_N }); save();
  sfx(res === 1 ? "win" : "lose");
  const dOld = rkDiv(old), dNew = rkDiv(R.r), avg = K.times.length ? (K.times.reduce((a, b) => a + b, 0) / K.times.length).toFixed(1) : "–";
  RK = null;
  gScreen(GT("קרב מדורג", "Ranked"), "", `<div class="g-card rk-res in">
    <div class="g-kicker">${forfeit ? GT("פרשת מהקרב", "You left the match") : `${esc(K.opp.n)} · <span dir="ltr">${K.opp.r}</span>`}</div>
    <h1 class="rk-out ${res === 1 ? "w" : res === 0 ? "l" : ""}">${res === 1 ? GT("ניצחון", "Victory") : res === 0 ? GT("הפסד", "Defeat") : GT("תיקו", "Draw")}</h1>
    <div class="rk-final" dir="ltr"><b>${K.me}</b><span>–</span><b>${K.op}</b></div>
    <div class="rk-delta"><span dir="ltr" id="rkR">${old}</span><em class="${delta >= 0 ? "up" : "down"}" dir="ltr">${delta >= 0 ? "+" : ""}${delta}</em></div>
    ${dNew !== dOld ? `<div class="rk-promo" style="--c:${dNew.c}">${rkBadge(R.r, 22)} ${R.r > old ? GT("עלית ל", "Promoted to ") : GT("ירדת ל", "Dropped to ")}${GT(dNew.he, dNew.en)}</div>` : ""}
    <div class="g-stats"><div><b>${K.right}/${RK_N}</b><span>${GT("נכונות", "Correct")}</span></div><div><b dir="ltr">${avg}s</b><span>${GT("זמן ממוצע", "Avg time")}</span></div><div><b dir="ltr">+${xpGain}</b><span>XP</span></div></div>
    <button class="g-btn primary big" id="rkAgain">${GT("קרב נוסף", "Play again")}</button>
    ${K.wrong.length ? `<button class="g-btn" id="rkRev">${GT("חזרה על הטעויות", "Review mistakes")} (${K.wrong.length})</button>` : ""}
    <button class="g-btn ghost" id="rkHome">${GT("לדף הדירוג", "Ranked home")}</button></div>`, "rk");
  setTimeout(() => rkCount($("#rkR"), old, R.r), 400);
  $("#rkAgain").onclick = rkMatch; $("#rkHome").onclick = rankedGame;
  const rv = $("#rkRev"); if (rv) rv.onclick = () => gReview(K.wrong, rankedGame);
}

/* ═════════ 4. יותר או פחות ═════════ */
let HL = null;
function hlPool() {
  if (typeof FOODS_RAW === "undefined") return [];
  const en = EN_(), seen = new Set();
  return FOODS_RAW.map(f => ({ n: en ? (typeof LANG_EN !== "undefined" && LANG_EN[f[0]]) : f[0], cal: f[2], pro: f[3] }))
    .filter(f => f.n && !seen.has(f.n) && seen.add(f.n));
}
function hlGame() {
  ensureG(); gStop();
  const B = S.g.hl;
  gScreen(GT("יותר או פחות", "Higher or lower"), "", `
    <p class="g-sub">${GT("שני מזונות, ערכים ל־100 גרם. בשני יש יותר או פחות? כל תשובה נכונה מאריכה את הרצף – טעות אחת ונגמר.", "Two foods, values per 100 g. Does the second have more or less? Every right answer extends your streak – one miss and it's over.")}</p>
    <button class="g-card hl-pick" data-m="cal"><span class="hl-pi">${ic("zap", 22)}</span><div><b>${GT("קלוריות", "Calories")}</b><small>${GT("שיא", "Best")}: ${B.cal}</small></div></button>
    <button class="g-card hl-pick" data-m="pro"><span class="hl-pi">${ic("target", 22)}</span><div><b>${GT("חלבון", "Protein")}</b><small>${GT("שיא", "Best")}: ${B.pro}</small></div></button>
    <p class="g-note">${GT("הנתונים ממאגר המזונות של האפליקציה (USDA ותוויות יצרן).", "Data comes from the app's food database (USDA and product labels).")}</p>`, "hl");
  app.querySelectorAll(".hl-pick").forEach(b => b.onclick = () => hlStart(b.dataset.m));
}
function hlNext(prev) {
  const P = HL.pool, m = HL.m;
  for (let t = 0; t < 200; t++) {
    const f = P[Math.floor(Math.random() * P.length)];
    if (f === prev || HL.used.has(f.n)) continue;
    const a = prev[m], b = f[m];
    if (Math.abs(a - b) / Math.max(a, b, 1) < 0.15 || Math.abs(a - b) < (m === "pro" ? 1 : 15)) continue;
    HL.used.add(f.n); return f;
  }
  return P.find(f => f !== prev && f[m] !== prev[m]);
}
const hlFmt = (m, v) => m === "cal" ? `${Math.round(v)}` : `${Math.round(v * 10) / 10}`;
const hlUnit = m => m === "cal" ? GT("קלוריות", "calories") : GT("גרם חלבון", "g protein");
function hlStart(m) {
  const pool = hlPool(); if (pool.length < 10) { toast("⚠️", GT("מאגר המזונות לא זמין", "Food database unavailable")); return; }
  HL = { m, pool, streak: 0, used: new Set(), busy: false };
  HL.a = pool[Math.floor(Math.random() * pool.length)]; HL.used.add(HL.a.n); HL.b = hlNext(HL.a);
  gScreen(GT("יותר או פחות", "Higher or lower"), `<span class="g-pill" id="hlS">${GT("רצף", "Streak")} <b>0</b></span>`, `<div class="hl-wrap" id="hlW"></div><div id="hlEnd"></div>`, "hl");
  $("#gBack").onclick = hlGame;
  hlDraw();
}
function hlDraw() {
  const m = HL.m;
  $("#hlW").innerHTML = `
    <div class="hl-card known"><div class="g-kicker">${GT("ל־100 גרם", "Per 100 g")}</div><b class="hl-name">${esc(HL.a.n)}</b><div class="hl-val"><span dir="ltr">${hlFmt(m, HL.a[m])}</span><small>${hlUnit(m)}</small></div></div>
    <div class="hl-vs">${GT("מול", "vs")}</div>
    <div class="hl-card" id="hlB"><div class="g-kicker">${GT("ל־100 גרם", "Per 100 g")}</div><b class="hl-name">${esc(HL.b.n)}</b>
      <div class="hl-val" id="hlBV"><span>?</span><small>${hlUnit(m)}</small></div>
      <div class="g-row hl-btns"><button class="g-btn" data-g="1">${ic("up", 18)} ${GT("יותר", "Higher")}</button><button class="g-btn" data-g="-1">${ic("down", 18)} ${GT("פחות", "Lower")}</button></div></div>`;
  app.querySelectorAll("[data-g]").forEach(b => b.onclick = () => hlGuess(+b.dataset.g));
}
function hlGuess(dir) {
  if (HL.busy) return; HL.busy = true;
  const m = HL.m, a = HL.a[m], b = HL.b[m], ok = dir > 0 ? b > a : b < a;
  app.querySelectorAll("[data-g]").forEach(x => x.disabled = true);
  const v = $("#hlBV span"); v.setAttribute("dir", "ltr");
  const t0 = performance.now();
  const f = () => { const k = Math.min(1, (performance.now() - t0) / 650), e = 1 - Math.pow(1 - k, 3); v.textContent = hlFmt(m, b * e); if (k < 1) requestAnimationFrame(f); else done(); };
  const done = () => {
    v.textContent = hlFmt(m, b);
    $("#hlB").classList.add(ok ? "ok" : "no");
    if (ok) {
      HL.streak++; sfx("ok"); vib(15);
      $("#hlS b").textContent = HL.streak;
      setTimeout(() => { HL.a = HL.b; HL.b = hlNext(HL.a); HL.busy = false; hlDraw(); $("#hlB").classList.add("in"); }, 700);
    } else { sfx("no"); vib([30, 40, 30]); setTimeout(hlOver, 600); }
  };
  f();
}
function hlOver() {
  const B = S.g.hl, rec = HL.streak > B[HL.m];
  if (rec) B[HL.m] = HL.streak;
  addXP(5 + HL.streak * 4);
  if (HL.streak >= 3) touchStreak();
  logHistory({ mode: "hl", title: GT("יותר או פחות", "Higher or lower"), score: 100, n: HL.streak }); save();
  if (rec && HL.streak > 0) sfx("win");
  $("#hlW").querySelector(".hl-btns")?.remove();
  $("#hlEnd").innerHTML = `<div class="g-card in hl-end"><div class="g-kicker">${rec && HL.streak ? GT("שיא חדש", "New best") : GT("הרצף נגמר", "Streak over")}</div>
    <h1 class="rk-out">${HL.streak}</h1><div class="g-note">${GT("שיא", "Best")}: ${B[HL.m]}</div>
    <button class="g-btn primary big" id="hlAgain">${GT("שוב", "Play again")}</button><button class="g-btn ghost" id="hlMenu">${GT("החלפת מדד", "Change metric")}</button></div>`;
  $("#hlAgain").onclick = () => hlStart(HL.m); $("#hlMenu").onclick = hlGame;
}

/* ═════════ חיבור למסכים (הכרטיסים עצמם מצוירים ב־learn.js) ═════════ */
function gStatus() {
  ensureG();
  const L = EN_() ? "en" : "he", w = S.g.wd[L], c = S.g.cn, R = S.g.rk, d = rkDiv(R.r);
  return {
    wd: w.d === today() && w.done ? (w.win ? GT("✓ נפתר היום", "✓ Solved today") : GT("נסה שוב מחר", "Try again tomorrow")) : GT("מילה חדשה היום", "New word today"),
    cn: c.d === today() && c.st && c.st.done ? (c.st.win ? GT("✓ נפתר היום", "✓ Solved today") : GT("נסה שוב מחר", "Try again tomorrow")) : GT("לוח חדש היום", "New board today"),
    rk: `${GT(d.he, d.en)} · ${R.r}`,
    hl: `${GT("שיא", "Best")} ${Math.max(S.g.hl.cal, S.g.hl.pro)}`,
    wdNew: !(w.d === today() && w.done), cnNew: !(c.d === today() && c.st && c.st.done)
  };
}
const G_GAMES = () => [
  ["wd", "word", GT("המילה היומית", "Daily word"), GT("נחש מונח כושר ב־6 ניסיונות", "Guess a fitness word in 6 tries"), wordGame],
  ["cn", "grid", GT("קבוצות", "Connections"), GT("מצא 4 קבוצות של 4", "Find four groups of four"), connGame],
  ["rk", "trophy", GT("קרב מדורג", "Ranked"), GT("1 על 1 · דירוג ודרגות", "1v1 · rating and divisions"), rankedGame],
  ["hl", "updown", GT("יותר או פחות", "Higher or lower"), GT("קלוריות וחלבון במזון", "Calories and protein in food"), hlGame],
];
function gamesPage() { go("practice"); }
const _goA = go;
go = function (...a) { gStop(); WD = null; document.body.classList.remove("gm"); return _goA(...a); };
if (typeof tab !== "undefined" && (tab === "home" || tab === "practice") && !session && !document.querySelector(".modal-bg")) { try { go(tab); } catch (e) { } }
