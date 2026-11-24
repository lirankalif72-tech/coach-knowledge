/* ═════════════ v11 – ליבה: עזרים משותפים, אייקונים, וכלי הלימוד שנשארו ═════════════
   בגרסה 11 האפליקציה עברה ניקוי: בלי מצב משחק, מטבעות, חנות, הישגים, שומר מסך ומשחקים ישנים.
   הקובץ הזה מחזיק את מה שנשאר מהקבצים שהוסרו (fun / extra / more): מסלול הקורס, מחברת הטעויות,
   חזרה לפני מבחן, מפת הגוף והטיימר. */

const T = (he, en) => (typeof isEn === "function" && isEn()) ? en : he;

/* ───── ניקוי נתונים ישנים (פעם אחת) ───── */
(function cleanState() {
  ["mode", "coins", "coinsTotal", "items", "map", "missions", "accent", "owned", "av", "cards", "up", "lg", "ss", "wq", "pet", "jr", "chests", "wheel",
    "openW", "stories", "dayStats", "course", "coursePractice", "exDone", "tc", "arc", "ach", "challenges", "rivals"].forEach(k => { delete S[k]; });
  if (S.settings) delete S.settings.saver;
  save();
})();

/* ───── מסכים במסך מלא ───── */
let funTimer = null;
function funCleanup() { clearInterval(funTimer); clearTimeout(funTimer); funTimer = null; }
function funScreen(html) { funCleanup(); stopTimer(); session = null; document.body.classList.add("in-quiz"); app.innerHTML = html; window.scrollTo(0, 0); }
function funExitBtn() { return `<div class="qhead"><button class="x" id="fx" aria-label="${T("סגירה", "Close")}">✕</button><div style="flex:1"></div></div>`; }
function bindExit(to = "home") { const b = $("#fx"); b && (b.onclick = () => go(to)); }

/* ───── אייקונים בקו דק (SVG) ───── */
const UI = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5V4.5"/><path d="M8 7h8"/>',
  tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  x: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
  cards: '<rect x="3" y="6" width="14" height="15" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  notebook: '<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 3v18M12 8h5M12 12h5"/>',
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
  dict: '<path d="M4 19V5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13"/><path d="M9 8h6M9 11h4"/>',
  body: '<circle cx="12" cy="4.5" r="2"/><path d="M7 8.5h10M12 8.5V15M12 15l-3 6M12 15l3 6M7 8.5 5 13M17 8.5l2 4.5"/>',
  path: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>',
  dumbbell: '<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>',
  log: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  food: '<path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10"/><path d="M17 21V3c-2 1-3 3.5-3 7h3"/>',
  calc: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 6.5h8M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h4"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9.5 2h5M19 6l1.5-1.5"/>',
  word: '<rect x="2.5" y="7" width="5" height="10" rx="1"/><rect x="9.5" y="7" width="5" height="10" rx="1"/><rect x="16.5" y="7" width="5" height="10" rx="1"/>',
  grid: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  updown: '<path d="M8 3v18M4 7l4-4 4 4M16 21V3M12 17l4 4 4-4"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  chev: '<path d="M15 6l-6 6 6 6"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  flame: '<path d="M12 22c4 0 7-2.7 7-7 0-3.5-2.5-6.5-4.5-8.5 0 2.5-1.5 4-3 4.5C11.5 8 10 5 8.5 2.5 8 6 5 9 5 14.5 5 19 8 22 12 22z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
};
const ui = (k, s = 20) => `<svg class="ui-ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UI[k] || ""}</svg>`;

/* שורת רשימה אחידה: אייקון · כותרת · תיאור · חץ */
function lrow(id, icon, title, sub, extra = "") {
  return `<button class="lrow" data-r="${id}"><span class="lr-ic">${ui(icon, 20)}</span><span class="lr-tx"><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</span>${extra}<span class="lr-ch">${ui("chev", 18)}</span></button>`;
}
function bindRows(root, map) { root.querySelectorAll("[data-r]").forEach(b => b.onclick = () => map[b.dataset.r] && map[b.dataset.r]()); }

/* ───── מסלול הקורס – הפרקים (המסך עצמו ב־learn.js) ───── */
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
function coursePage() { }

/* ───── מחברת טעויות ───── */
function mistakesNotebook() {
  const wrong = BANK.filter(q => S.qs[q.id] && S.qs[q.id].w > 0);
  const byT = {}; wrong.forEach(q => byT[q.f] = (byT[q.f] || 0) + S.qs[q.id].w);
  const topT = Object.entries(byT).filter(([f]) => TOPICS[f]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const top = wrong.sort((a, b) => S.qs[b.id].w - S.qs[a.id].w || S.qs[a.id].box - S.qs[b.id].box).slice(0, 15);
  const ans = q => q.t === "mc" ? q.o[q.a] : q.t === "tf" ? (q.a ? T("נכון", "True") : T("לא נכון", "False")) : q.a;
  const open = mistakes().length;
  funScreen(`<div class="fade-in" data-notr>${funExitBtn()}<h1>${T("מחברת הטעויות", "Mistakes notebook")}</h1>
    <p class="muted small" style="margin-top:0">${T("השאלות שהכי מכשילות אותך, עם התשובה וההסבר. שאלה יוצאת מכאן אחרי שעונים עליה נכון כמה פעמים.", "The questions that trip you up most, with the answer and explanation. A question leaves after you answer it right a few times.")}</p>
    ${!wrong.length ? `<div class="card empty">${T("עוד אין טעויות שמורות. כשתטעה – השאלות יופיעו כאן עם הסבר.", "No saved mistakes yet. When you get one wrong it will appear here with an explanation.")}</div>` : `
    <button class="btn primary lg block" id="mbAll" ${open ? "" : "disabled"}>${open ? `${T("תרגול הטעויות", "Practice mistakes")} (${Math.min(15, open)})` : T("אין טעויות פתוחות", "No open mistakes")}</button>
    <div class="section-title"><h2>${T("נושאים לחיזוק", "Topics to strengthen")}</h2></div>
    <div class="card list">${topT.map(([f, n]) => `<button class="lrow" data-tp="${f}"><span class="lr-ic em">${TOPICS[f].icon}</span><span class="lr-tx"><b>${esc(TOPICS[f].name)}</b><small>${n} ${T("טעויות", "mistakes")}</small></span><span class="lr-ch">${ui("chev", 18)}</span></button>`).join("")}</div>
    <div class="section-title"><h2>${T("השאלות", "The questions")}</h2></div>
    ${top.map(q => `<details class="card nb-item"><summary><span class="pill no" dir="ltr">${S.qs[q.id].w}×</span> ${esc(q.q)}</summary><div class="small" style="margin-top:8px">${T("התשובה", "Answer")}: <b>${esc(ans(q))}</b></div><div class="small muted" style="margin-top:6px">${linkTerms(q.e)}</div></details>`).join("")}`}
  </div>`);
  bindExit("practice");
  $("#mbAll") && ($("#mbAll").onclick = () => startMode("mistakes"));
  app.querySelectorAll("[data-tp]").forEach(b => b.onclick = () => startMode("topic", { f: b.dataset.tp }));
}

/* ───── חזרה לפני מבחן ───── */
function nightBeforeExam() {
  const now = Date.now(), seen = BANK.filter(q => q.t !== "open" && S.qs[q.id]);
  const score = q => { const s = S.qs[q.id]; return s.w * 3 + (s.box <= 2 ? 2 : 0) + Math.max(0, (now - s.due) / DAY) * 0.5 - s.c * 0.3; };
  let qs = seen.sort((a, b) => score(b) - score(a)).slice(0, 20);
  if (qs.length < 20) {
    const weak = TOPIC_KEYS.map(f => ({ f, ...topicStats(f) })).sort((a, b) => (a.acc ?? 50) - (b.acc ?? 50)).map(t => t.f);
    qs = qs.concat(freshSort(BANK.filter(q => q.t !== "open" && !S.qs[q.id] && weak.slice(0, 4).includes(q.f)), true).slice(0, 20 - qs.length));
  }
  startMode("coach", { qs: shuffle(qs), title: T("חזרה לפני מבחן", "Pre-exam review") });
}

/* ───── מפת הגוף ───── */
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
  funScreen(`<div class="fade-in">${funExitBtn()}<h1>מפת הגוף</h1><p class="muted small" style="margin-top:0">הקש על שריר כדי לראות מה הוא עושה ואיך מאמנים אותו</p>
    <div class="seg" id="bmSide" style="margin:8px 0">${[["front", "מלפנים"], ["back", "מאחור"]].map(([k, v]) => `<button data-k="${k}" class="${side === k ? "on" : ""}">${v}</button>`).join("")}</div>
    <div class="bm-wrap"><svg viewBox="0 0 200 392" class="bodymap">${BODY_BASE}<g class="mus">${side === "front" ? BODY_FRONT : BODY_BACK}</g></svg></div>
    <div id="bmInfo">${m ? `<div class="card bm-card"><h2>${esc(m.n)}</h2><div class="bm-l"><span class="muted xs">תפקיד</span><div>${esc(m.act)}</div></div><div class="bm-l"><span class="muted xs">תרגילים</span><div>${m.ex.map(esc).join(" · ")}</div></div>
      ${qs.length >= 3 ? `<button class="btn primary block" id="bmQ" style="margin-top:12px">${Math.min(8, qs.length)} שאלות על השריר</button>` : ""}</div>` : `<div class="card muted small" style="text-align:center">בחר שריר באיור</div>`}</div></div>`);
  bindExit("learn");
  app.querySelectorAll("#bmSide button").forEach(b => b.onclick = () => bodyMap(b.dataset.k, null));
  app.querySelectorAll("[data-m]").forEach(el => { if (el.dataset.m === sel) el.classList.add("on"); el.onclick = () => { bodyMap(side, el.dataset.m); setTimeout(() => $("#bmInfo") && $("#bmInfo").scrollIntoView({ behavior: "smooth", block: "nearest" }), 50); }; });
  $("#bmQ") && ($("#bmQ").onclick = () => startMode("coach", { qs: shuffle(freshSort(qs, true).slice(0, 8)), title: m.n }));
}

/* ───── טיימר אימון (בתוך "כלים") ───── */
const TIMER_PRESETS = { tabata: { n: "טבטה", w: 20, r: 10, x: 8 }, hiit: { n: "HIIT", w: 40, r: 20, x: 10 }, emom: { n: "EMOM", w: 60, r: 0, x: 10 }, custom: { n: "מותאם", w: 30, r: 15, x: 6 } };
let tmr = null;
function renderTimer(body) {
  S.tmr = S.tmr || { p: "tabata", ...TIMER_PRESETS.tabata };
  const c = S.tmr;
  body.innerHTML = `<div class="card"><div class="seg wrap" id="tmP">${Object.entries(TIMER_PRESETS).map(([k, p]) => `<button data-k="${k}" class="${c.p === k ? "on" : ""}">${p.n}</button>`).join("")}</div>
    <div class="row" style="margin-top:10px;gap:8px">${[["w", "עבודה (שנ׳)"], ["r", "מנוחה (שנ׳)"], ["x", "סבבים"]].map(([k, l]) => `<div style="flex:1"><label class="lbl">${l}</label><input class="search" type="number" inputmode="numeric" data-f="${k}" value="${c[k]}" min="0" max="600"></div>`).join("")}</div>
    <p class="muted xs" style="margin:8px 0 0">${({ tabata: "20 שניות עבודה, 10 מנוחה, 8 סבבים = 4 דקות.", hiit: "40/20 – אינטרוולים קלאסיים.", emom: "משימה בתחילת כל דקה, ומנוחה בשאר הדקה.", custom: "קבע בעצמך." })[c.p] || ""}</p></div>
    <div class="card timer-card"><div class="tm-phase" id="tmPh">מוכן?</div><div class="tm-big" id="tmT" dir="ltr">00:00</div><div class="muted" id="tmR">סבב 0/${c.x}</div>
      <div class="xpbar" style="margin:12px 0"><i id="tmBar" style="width:0%"></i></div>
      <div class="row"><button class="btn primary lg" id="tmGo" style="flex:2">התחל</button><button class="btn lg" id="tmRe" style="flex:1">איפוס</button></div></div>`;
  body.querySelectorAll("#tmP button").forEach(b => b.onclick = () => { stopTimerX(); S.tmr = { p: b.dataset.k, ...TIMER_PRESETS[b.dataset.k] }; save(); renderTimer(body); });
  body.querySelectorAll("[data-f]").forEach(i => i.onchange = () => { c[i.dataset.f] = Math.max(i.dataset.f === "x" ? 1 : 0, Math.min(600, +i.value || 0)); c.p = "custom"; save(); });
  $("#tmGo").onclick = () => tmr && tmr.run ? pauseTimerX() : startTimerX();
  $("#tmRe").onclick = () => { stopTimerX(); renderTimer(body); };
}
function stopTimerX() { if (tmr) { clearInterval(tmr.iv); try { tmr.lock && tmr.lock.release(); } catch (e) { } } tmr = null; }
function pauseTimerX() { if (!tmr) return; tmr.run = false; tmr.left = tmr.end - Date.now(); clearInterval(tmr.iv); $("#tmGo") && ($("#tmGo").textContent = "המשך"); }
async function startTimerX() {
  const c = S.tmr;
  if (!tmr) tmr = { round: 1, phase: "work", left: c.w * 1000 };
  tmr.run = true; tmr.end = Date.now() + tmr.left;
  try { tmr.lock = tmr.lock || (navigator.wakeLock && await navigator.wakeLock.request("screen")); } catch (e) { }
  $("#tmGo").textContent = "השהה"; beep(true, 6);
  let lastSec = -1;
  tmr.iv = setInterval(() => {
    if (!$("#tmT")) return stopTimerX();
    const left = Math.max(0, tmr.end - Date.now()), sec = Math.ceil(left / 1000), dur = (tmr.phase === "work" ? c.w : c.r) * 1000;
    $("#tmT").textContent = fmtTime(sec); $("#tmPh").textContent = tmr.phase === "work" ? "עבודה" : "מנוחה";
    $("#tmPh").className = "tm-phase " + tmr.phase; $("#tmR").textContent = `סבב ${tmr.round}/${c.x}`; $("#tmBar").style.width = (100 - left / dur * 100) + "%";
    if (sec !== lastSec && sec <= 3 && sec > 0) beep(false); lastSec = sec;
    if (left <= 0) {
      if (tmr.phase === "work" && c.r > 0) { tmr.phase = "rest"; tmr.end = Date.now() + c.r * 1000; beep(true, 2); if (navigator.vibrate) navigator.vibrate(200); }
      else if (tmr.round < c.x) { tmr.round++; tmr.phase = "work"; tmr.end = Date.now() + c.w * 1000; beep(true, 8); if (navigator.vibrate) navigator.vibrate([100, 60, 100]); }
      else { const r = c.x; stopTimerX(); $("#tmPh").textContent = "סיימת"; $("#tmT").textContent = "00:00"; $("#tmGo").textContent = "שוב"; beep(true, 10); touchStreak(); save(); toast("✓", `${r} סבבים הושלמו`); }
    }
  }, 200);
}
const _renderToolsC = renderTools;
renderTools = function (sub) {
  if (sub && sub.seg) foodSeg = sub.seg;
  if (foodSeg !== "timer") _renderToolsC(sub);
  else { app.innerHTML = `<div class="fade-in"><h1>טיימר אימון</h1><div class="seg" id="tseg" style="margin:8px 0 6px"></div><div id="tbody"></div></div>`; renderTimer($("#tbody")); }
  const h1 = app.querySelector(".fade-in > h1"); if (h1) h1.textContent = ({ food: "ערכים תזונתיים", calc: "מחשבונים", timer: "טיימר אימון" })[foodSeg] || h1.textContent;
  const seg = $("#tseg");
  if (seg) {
    seg.innerHTML = [["food", "תזונה"], ["calc", "מחשבונים"], ["timer", "טיימר"]].map(([k, v]) => `<button data-k="${k}" class="${foodSeg === k ? "on" : ""}">${v}</button>`).join("");
    seg.onclick = e => { const b = e.target.closest("button"); if (!b) return; stopTimerX(); foodSeg = b.dataset.k; renderTools(); };
  }
};
const _goC = go;
go = function (t, sub) { funCleanup(); if (t !== "tools") stopTimerX(); try { speechSynthesis && speechSynthesis.cancel(); } catch (e) { } return _goC(t, sub); };
