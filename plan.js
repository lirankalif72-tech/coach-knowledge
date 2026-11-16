/* ═════════════ 🏋️ בניית תוכנית אימון (v8.5) ═════════════
   מאגר תרגילים עם הדגמה מונפשת, ציון יעילות לפי המיקוד שבחרת, סטים וחזרות, והמלצות לשיפור. */

/* ───── 1. ציור דמות מונפשת (SVG + SMIL – בלי אינטרנט ובלי JS בלולאה) ───── */
const PB_R = Math.PI / 180;
const pbV = a => [Math.sin(a * PB_R), -Math.cos(a * PB_R)];
const pbAdd = (o, v, l) => [o[0] + v[0] * l, o[1] + v[1] * l];
const pbF = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
function pbIk(r, t, l1, l2, b) {
  const dx = t[0] - r[0], dy = t[1] - r[1];
  let d = Math.hypot(dx, dy); d = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.5), l1 + l2 - 0.05);
  const a = Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))), th = Math.atan2(dy, dx) + b * a;
  const j = [r[0] + l1 * Math.cos(th), r[1] + l1 * Math.sin(th)], t2 = Math.atan2(t[1] - j[1], t[0] - j[0]);
  return [j, [j[0] + l2 * Math.cos(t2), j[1] + l2 * Math.sin(t2)]];
}
function pbLeg(p, L) {
  let k, a;
  if (L.at) [k, a] = pbIk(p, L.at, 25, 25, L.kb ?? -1); else { k = pbAdd(p, pbV(L.th ?? 180), 25); a = pbAdd(k, pbV(L.sh ?? 180), 25); }
  return [k, a, pbAdd(a, pbV(L.ft ?? (L.at ? 90 : (L.sh ?? 180) - 90)), 9)];
}
function pbArm(s, A) {
  if (A.wt) return pbIk(s, A.wt, 16, 15, A.eb ?? 1);
  const e = pbAdd(s, pbV(A.ua ?? 180), 16); return [e, pbAdd(e, pbV(A.fa ?? A.ua ?? 180), 15)];
}
/* מבט מהצד */
function pbSide(P) {
  const p = P.p, s = pbAdd(p, pbV(P.tor || 0), 30), h = pbAdd(s, pbV((P.tor || 0) + (P.nk || 0)), 10);
  const [k, a, t] = pbLeg(p, P), [e, w] = pbArm(s, P);
  let d = `M${pbF(p)} L${pbF(s)} M${pbF(p)} L${pbF(k)} L${pbF(a)} L${pbF(t)}`;
  if (P.l2) { const [k2, a2, t2] = pbLeg(p, P.l2); d += ` M${pbF(p)} L${pbF(k2)} L${pbF(a2)} L${pbF(t2)}`; }
  d += ` M${pbF(s)} L${pbF(e)} L${pbF(w)}`;
  let w2 = null;
  if (P.a2) { const [e2, ww] = pbArm(s, P.a2); w2 = ww; d += ` M${pbF(s)} L${pbF(e2)} L${pbF(ww)}`; }
  return { d, h, w, w2, s, p, a };
}
/* מבט מלפנים */
function pbFront(P) {
  const c = 60, sy = P.sy, sL = [c - 12, sy], sR = [c + 12, sy], hL = [c - 7, sy + 28], hR = [c + 7, sy + 28];
  let d = `M${pbF(sL)} L${pbF(sR)} M${pbF([c, sy])} L${pbF([c, sy + 28])} M${pbF(hL)} L${pbF(hR)}`;
  const leg = (hp, sg) => {
    const k = P.seat ? [c + sg * 11, sy + 40] : [c + sg * 8, sy + 53], a = P.seat ? [c + sg * 11, sy + 72] : [c + sg * 8, sy + 78];
    return ` M${pbF(hp)} L${pbF(k)} L${pbF(a)} L${pbF([a[0] + sg * 5, a[1]])}`;
  };
  d += leg(hL, -1) + leg(hR, 1);
  const arm = (s, sg) => {
    let e, w;
    if (P.wt) [e, w] = pbIk(s, [c + sg * P.wt[0], P.wt[1]], 16, 15, sg * (P.eb ?? 1));
    else { e = [s[0] + sg * 16 * Math.sin(P.ua * PB_R), s[1] + 16 * Math.cos(P.ua * PB_R)]; w = [e[0] + sg * 15 * Math.sin(P.fa * PB_R), e[1] + 15 * Math.cos(P.fa * PB_R)]; }
    d += ` M${pbF(s)} L${pbF(e)} L${pbF(w)}`; return w;
  };
  const w = arm(sL, -1), w2 = arm(sR, 1);
  return { d, h: [c, sy - 11], w, w2, s: [c, sy], p: [c, sy + 28] };
}
function pbAnim(attr, a, b) {
  return a === b ? "" : `<animate attributeName="${attr}" values="${a};${b};${a}" dur="2.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
}
function pbCirc(A, B, r, cls, dx = 0, dy = 0) {
  const ax = (A[0] + dx).toFixed(1), ay = (A[1] + dy).toFixed(1), bx = (B[0] + dx).toFixed(1), by = (B[1] + dy).toFixed(1);
  return `<circle cx="${ax}" cy="${ay}" r="${r}" class="${cls}">${pbAnim("cx", ax, bx)}${pbAnim("cy", ay, by)}</circle>`;
}
function pbRect(A, B, w, h, cls) {
  const ax = (A[0] - w / 2).toFixed(1), ay = (A[1] - h / 2).toFixed(1), bx = (B[0] - w / 2).toFixed(1), by = (B[1] - h / 2).toFixed(1);
  return `<rect x="${ax}" y="${ay}" width="${w}" height="${h}" rx="1.5" class="${cls}">${pbAnim("x", ax, bx)}${pbAnim("y", ay, by)}</rect>`;
}
function pbLine(P1, A, B, cls) {
  const ax = A[0].toFixed(1), ay = A[1].toFixed(1), bx = B[0].toFixed(1), by = B[1].toFixed(1);
  return `<line x1="${P1[0]}" y1="${P1[1]}" x2="${ax}" y2="${ay}" class="${cls}">${pbAnim("x2", ax, bx)}${pbAnim("y2", ay, by)}</line>`;
}
function pbFig(ex, cls = "pb-fig") {
  const F = ex.fig; if (!F) return `<div class="${cls} pb-nofig">🏋️</div>`;
  const mk = F.front ? pbFront : pbSide, A = mk(F.A), B = mk(F.B), eq = F.eq || "";
  let g = (F.st || []).map(pl => `<polyline points="${pl.map(pbF).join(" ")}" class="pb-st"/>`).join("");
  if (!F.ng) g += `<path d="M2 112 H118" class="pb-gr"/>`;
  if (F.cab) { g += pbLine(F.cab, A.w, B.w, "pb-cab"); if (A.w2 && F.front) g += pbLine(F.cab, A.w2, B.w2, "pb-cab"); }
  if (eq.includes("bar") && F.front) {
    const ax = (A.w[0] - 6).toFixed(1), ay = A.w[1].toFixed(1), bx = (B.w[0] - 6).toFixed(1), by = B.w[1].toFixed(1), ax2 = (A.w2[0] + 6).toFixed(1), bx2 = (B.w2[0] + 6).toFixed(1);
    g += `<line x1="${ax}" y1="${ay}" x2="${ax2}" y2="${ay}" class="pb-bar">${pbAnim("x1", ax, bx)}${pbAnim("y1", ay, by)}${pbAnim("x2", ax2, bx2)}${pbAnim("y2", ay, by)}</line>`;
  }
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

/* ───── 2. מאגר התרגילים ───── */
const PB_GROUPS = {
  chest: { n: "חזה", ic: "🫁", dom: { u: "חזה עליון", m: "חזה אמצעי", l: "חזה תחתון" }, def: "m" },
  back: { n: "גב", ic: "🔙", dom: { w: "רוחב (רחב גבי)", t: "עובי (גב אמצעי)", l: "גב תחתון" }, def: "w" },
  shoulders: { n: "כתפיים", ic: "🤷", dom: { f: "כתף קדמית", s: "כתף צידית", r: "כתף אחורית" }, def: "s" },
  biceps: { n: "יד קדמית", ic: "💪", dom: { lo: "ראש ארוך", sh: "ראש קצר", br: "ברכיאליס (עובי)" }, def: "lo" },
  triceps: { n: "יד אחורית", ic: "🦾", dom: { lo: "ראש ארוך", la: "ראש צידי ומדיאלי" }, def: "lo" },
  legs: { n: "רגליים", ic: "🦵", dom: { q: "ארבע־ראשי", g: "ישבן", h: "המסטרינג" }, def: "q" },
  calves: { n: "שוקיים", ic: "🦶", dom: { ga: "תאומים", so: "סולאוס" }, def: "ga" },
  core: { n: "בטן וליבה", ic: "🧱", dom: { a: "ישר הבטן", o: "אלכסוניים", s: "יציבות" }, def: "a" }
};
const SEAT = (x, y) => [[[x - 14, y], [x + 14, y]], [[x, y], [x, 112]]];
const FLAT = [[[12, 84], [86, 84]], [[18, 84], [18, 112]], [[80, 84], [80, 112]]];
const STAND = { p: [60, 62], tor: 0 };
const PB_EX = [
  /* ── חזה ── */
  { id: "bench", g: "chest", n: "לחיצת חזה במוט", al: ["בנץ׳", "בנץ'", "bench press", "לחיצת חזה", "מוט חזה"], t: "c", pat: "press", base: 92, f: { u: .55, m: 1, l: .75 },
    prim: ["pecs"], sec: ["triceps", "delts"], why: "תרגיל הבסיס לחזה – הכי קל להעמיס ולהתקדם בו לאורך זמן.", cue: "שכמות מקובצות לאחור, כפות רגליים על הרצפה, המוט יורד לאמצע החזה.", bad: "מרפקים פתוחים ל־90°, ישבן מתרומם, קפיצת המוט מהחזה.",
    fig: { st: FLAT, eq: "bb", A: { p: [42, 78], tor: 90, at: [20, 112], kb: 1, wt: [72, 47] }, B: { p: [42, 78], tor: 90, at: [20, 112], kb: 1, wt: [70, 72], eb: -1 } } },
  { id: "inclinedb", g: "chest", n: "לחיצת חזה בשיפוע עליון עם משקולות", al: ["שיפוע עליון", "incline", "אינקליין", "לחיצה בשיפוע"], t: "c", pat: "incl", base: 88, f: { u: 1, m: .6, l: .25 },
    prim: ["pecs"], sec: ["delts", "triceps"], why: "השיפוע (30°–45°) מעביר את הדגש לחזה העליון, והמשקולות מאפשרות טווח עמוק.", cue: "ספסל בשיפוע 30°, משקולות יורדות לגובה החזה העליון, מרפקים בזווית 45°–60°.", bad: "שיפוע גבוה מדי (הכתף הקדמית לוקחת את העבודה).",
    fig: { st: [[[57, 88], [24, 64]], [[57, 88], [76, 88]], [[62, 88], [62, 112]]], eq: "db", A: { p: [60, 84], tor: -55, at: [88, 112], kb: -1, wt: [36, 36] }, B: { p: [60, 84], tor: -55, at: [88, 112], kb: -1, wt: [38, 64], eb: 1 } } },
  { id: "chestmachine", g: "chest", n: "מכונת לחיצת חזה", al: ["chest press", "מכונת חזה", "לחיצה במכונה"], t: "c", pat: "press", base: 82, f: { u: .4, m: .9, l: .7 },
    prim: ["pecs"], sec: ["triceps", "delts"], why: "יציבה ובטוחה – מעולה למתחילים ולסטים קרובים לכשל בלי צורך בשומר.", cue: "ידיות בגובה אמצע החזה, גב צמוד לכרית, דחיפה בלי לנעול מרפקים בכוח.", bad: "מושב נמוך מדי, כתפיים מתרוממות לאוזניים.",
    fig: { st: [[[42, 92], [40, 50]], ...SEAT(52, 92)], A: { p: [50, 86], tor: -5, th: 90, sh: 180, wt: [80, 58] }, B: { p: [50, 86], tor: -5, th: 90, sh: 180, wt: [60, 60], eb: 1 } } },
  { id: "pushup", g: "chest", n: "שכיבות סמיכה", al: ["שכיבת סמיכה", "push up", "פושאפ"], t: "c", pat: "press", base: 74, f: { u: .45, m: .85, l: .6 },
    prim: ["pecs"], sec: ["triceps", "delts", "abs"], why: "בלי ציוד ומחזק גם את הליבה. קשה יותר להתקדם בעומס – אפשר עם גומייה או משקל על הגב.", cue: "קו ישר מהראש ועד העקבים, ידיים מעט רחבות מהכתפיים, חזה יורד כמעט לרצפה.", bad: "אגן שוקע, טווח חלקי.",
    fig: { A: { p: [56, 91], tor: 70, at: [9, 108], kb: 1, ft: 116, wt: [84, 111], eb: -1 }, B: { p: [57.5, 96], tor: 76, at: [9, 108], kb: 1, ft: 116, wt: [84, 111], eb: -1 } } },
  { id: "dips", g: "chest", n: "מקבילים בהטיה קדימה", al: ["מקבילים", "dips", "דיפס"], t: "c", pat: "dip", base: 80, f: { u: .15, m: .55, l: 1 },
    prim: ["pecs"], sec: ["triceps", "delts"], why: "התרגיל הטוב לחזה התחתון. דורש כתפיים בריאות – לא לרדת עמוק מדי.", cue: "גו נוטה מעט קדימה, ירידה עד שהזרוע מקבילה לרצפה, מרפקים מעט החוצה.", bad: "ירידה עמוקה מדי שמעמיסה על הכתף, נדנוד.",
    fig: { ng: 1, st: [[[52, 56], [86, 56]], [[82, 56], [82, 112]]], A: { p: [58, 58], tor: 15, th: 175, sh: 220, wt: [64, 56] }, B: { p: [58, 70], tor: 22, th: 175, sh: 225, wt: [64, 57], eb: -1 } } },
  { id: "cablefly", g: "chest", n: "פרפר בכבלים (קרוס אובר)", al: ["קרוס אובר", "cable fly", "crossover", "פרפר", "פרפר בכבל"], t: "i", pat: "fly", base: 72, f: { u: .35, m: .85, l: .9 },
    prim: ["pecs"], sec: ["delts"], why: "תרגיל בידוד עם מתח קבוע ומתיחה טובה – משלים, לא מחליף לחיצות.", cue: "מרפקים מעט כפופים וקבועים, מחבקים 'עץ' ומביאים ידיים למטה ולמרכז.", bad: "כיפוף ויישור מרפקים (הופך ללחיצה), משקל כבד מדי.",
    fig: { cab: [8, 14], st: [[[8, 4], [8, 112]]], A: { p: [58, 62], tor: 12, th: 165, sh: 180, l2: { th: 200, sh: 195 }, ua: 255, fa: 268 }, B: { p: [58, 62], tor: 12, th: 165, sh: 180, l2: { th: 200, sh: 195 }, ua: 128, fa: 138 } } },

  /* ── גב ── */
  { id: "pullup", g: "back", n: "מתח", al: ["עליות מתח", "pull up", "פולאפ", "chin up"], t: "c", pat: "vpull", base: 90, f: { w: 1, t: .55, l: .2 },
    prim: ["lats"], sec: ["biceps", "traps", "forearms"], why: "מהתרגילים הטובים ביותר לרוחב הגב. אם עוד אין מתח – גומייה או מכונה מסייעת.", cue: "מתחילים מתלייה מלאה, מושכים מרפקים לכיוון הצלעות, חזה אל המוט.", bad: "חצי טווח, נדנוד וקיפינג.",
    fig: { front: 1, ng: 1, st: [[[22, 8], [98, 8]]], A: { sy: 40, wt: [28, 8], eb: 1 }, B: { sy: 20, wt: [28, 8], eb: 1 } } },
  { id: "pulldown", g: "back", n: "פולי עליון", al: ["פולי", "lat pulldown", "משיכה בפולי", "פולי עליון רחב"], t: "c", pat: "vpull", base: 84, f: { w: .95, t: .5, l: .15 },
    prim: ["lats"], sec: ["biceps", "traps"], why: "אותה תנועה כמו מתח, אבל אפשר לבחור משקל – מושלם לבניית בסיס.", cue: "אחיזה מעט רחבה מהכתפיים, חזה למעלה, מושכים לחזה העליון.", bad: "משיכה מאחורי העורף, הטיה גדולה לאחור.",
    fig: { front: 1, ng: 1, eq: "bar", cab: [60, -8], st: [[[36, 70], [84, 70]]], A: { sy: 36, seat: 1, wt: [30, 2], eb: 1 }, B: { sy: 36, seat: 1, wt: [26, 40], eb: 1 } } },
  { id: "bbrow", g: "back", n: "חתירה במוט", al: ["חתירה", "barbell row", "row", "חתירה בהטיה"], t: "c", pat: "hrow", base: 88, f: { w: .65, t: 1, l: .6 },
    prim: ["lats", "traps"], sec: ["biceps", "erectors", "delts"], why: "בונה עובי לגב וגם מחזק את הגב התחתון שמחזיק את ההטיה.", cue: "הטיה מהירך, גב ניטרלי, מושכים את המוט לבטן ומקרבים שכמות.", bad: "גב מעוגל, הגו עולה בכל חזרה.",
    fig: { eq: "bb", A: { p: [52, 64], tor: 70, at: [56, 112], kb: -1, wt: [81, 84] }, B: { p: [52, 64], tor: 70, at: [56, 112], kb: -1, wt: [70, 64], eb: -1 } } },
  { id: "dbrow", g: "back", n: "חתירה ביד אחת עם משקולת", al: ["חתירה ביד אחת", "one arm row", "db row", "חתירה במשקולת"], t: "c", pat: "hrow", base: 84, f: { w: .8, t: .85, l: .25 },
    prim: ["lats"], sec: ["traps", "biceps"], why: "תמיכה בספסל משחררת את הגב התחתון, וכל צד עובד לבד – מאזן חוסר סימטריה.", cue: "גב מקביל לרצפה, מושכים את המרפק לכיוון הכיס האחורי.", bad: "סיבוב הגו כדי להרים יותר.",
    fig: { eq: "db db1", st: [[[56, 90], [104, 90]], [[60, 90], [60, 112]], [[100, 90], [100, 112]]], A: { p: [44, 70], tor: 80, at: [40, 112], kb: -1, wt: [72, 98], a2: { wt: [92, 90] } }, B: { p: [44, 70], tor: 80, at: [40, 112], kb: -1, wt: [64, 70], eb: -1, a2: { wt: [92, 90] } } } },
  { id: "cablerow", g: "back", n: "חתירה בכבל בישיבה", al: ["חתירה בישיבה", "seated row", "cable row", "חתירה בכבל"], t: "c", pat: "hrow", base: 82, f: { w: .6, t: .95, l: .3 },
    prim: ["lats", "traps"], sec: ["biceps"], why: "מתח קבוע לאורך כל התנועה ושליטה טובה בקירוב השכמות.", cue: "גו זקוף, מושכים לבטן, מחזיקים שנייה בקירוב שכמות.", bad: "נדנוד גדול של הגו קדימה ואחורה.",
    fig: { cab: [104, 96], st: [[[24, 92], [62, 92]], [[44, 92], [44, 112]], [[92, 88], [92, 110]]], A: { p: [40, 88], tor: 14, at: [88, 102], kb: -1, ft: 0, wt: [76, 68] }, B: { p: [40, 88], tor: -6, at: [88, 102], kb: -1, ft: 0, wt: [52, 74], eb: 1 } } },
  { id: "straightpd", g: "back", n: "פולאובר בכבל בידיים ישרות", al: ["straight arm pulldown", "פולאובר", "ידיים ישרות"], t: "i", pat: "pullover", base: 66, f: { w: .85, t: .2, l: .1 },
    prim: ["lats"], sec: ["triceps"], why: "בידוד לרחב הגבי בלי מעורבות של היד הקדמית – טוב לחימום או כתרגיל משלים.", cue: "ידיים כמעט ישרות, מורידים את הידית עד הירכיים בתנועת קשת.", bad: "כיפוף מרפקים (הופך ללחיצה).",
    fig: { cab: [104, 2], st: [[[104, -6], [104, 112]]], A: { p: [56, 63], tor: 22, at: [58, 112], ua: 40, fa: 40 }, B: { p: [56, 63], tor: 22, at: [58, 112], ua: 168, fa: 168 } } },
  { id: "backext", g: "back", n: "פשיטת גב (היפר אקסטנשן)", al: ["היפר", "hyperextension", "back extension", "פשיטת גב"], t: "i", pat: "ext", base: 70, f: { w: .05, t: .2, l: 1 },
    prim: ["erectors"], sec: ["glutes", "hams"], why: "מחזק את זוקפי הגו והישבן – חשוב לגב תחתון בריא.", cue: "עולים עד קו ישר עם הרגליים, בלי ליישר מעבר לקו.", bad: "קשת מוגזמת למעלה, תנועה מהירה ולא נשלטת.",
    fig: { ng: 1, eq: "pad", st: [[[22, 102], [62, 62]], [[48, 76], [48, 112]], [[30, 112], [70, 112]]], A: { p: [62, 58], tor: 150, th: 225, sh: 225, ft: 135, ua: 300, fa: 60 }, B: { p: [62, 58], tor: 45, th: 225, sh: 225, ft: 135, ua: 195, fa: 300 } } },

  /* ── כתפיים ── */
  { id: "ohp", g: "shoulders", n: "לחיצת כתפיים במוט בעמידה", al: ["לחיצת כתפיים", "ohp", "overhead press", "military press", "פרס"], t: "c", pat: "ohp", base: 88, f: { f: 1, s: .55, r: .15 },
    prim: ["delts"], sec: ["triceps", "traps", "abs"], why: "תרגיל הכוח המרכזי לכתפיים – עובד גם על יציבות כל הגוף.", cue: "ישבן ובטן מכווצים, המוט עולה בקו ישר מעל אמצע כף הרגל.", bad: "קשת גדולה בגב התחתון.",
    fig: { eq: "bb", A: { ...STAND, wt: [60, 2] }, B: { ...STAND, wt: [66, 34], eb: -1 } } },
  { id: "dbpress", g: "shoulders", n: "לחיצת כתפיים עם משקולות בישיבה", al: ["לחיצת כתפיים במשקולות", "dumbbell press", "shoulder press", "לחיצת כתפיים בישיבה"], t: "c", pat: "ohp", base: 84, f: { f: .95, s: .6, r: .15 },
    prim: ["delts"], sec: ["triceps"], why: "הגב נתמך, וכל יד עובדת לבד – פחות עומס על הגב התחתון.", cue: "מרפקים מעט לפנים, משקולות יורדות לגובה האוזניים.", bad: "גב מתנתק מהכרית, טווח קצר.",
    fig: { st: [[[44, 92], [42, 48]], ...SEAT(54, 92)], eq: "db", A: { p: [52, 86], tor: -4, th: 90, sh: 180, wt: [52, 24] }, B: { p: [52, 86], tor: -4, th: 90, sh: 180, wt: [58, 52], eb: -1 } } },
  { id: "latraise", g: "shoulders", n: "הרחקת כתפיים (הרמה צידית)", al: ["הרחקה", "lateral raise", "הרמה צידית", "הרחקת כתפיים"], t: "i", pat: "lat", base: 80, f: { f: .2, s: 1, r: .35 },
    prim: ["delts"], sec: ["traps"], why: "התרגיל הכי ממוקד לכתף הצידית – זה מה שנותן 'רוחב' לכתפיים.", cue: "מרפקים מעט כפופים, מרימים עד גובה הכתף, 'שופכים קנקן' קלות.", bad: "משקל כבד ונדנוד, כתפיים עולות לאוזניים.",
    fig: { front: 1, eq: "db", A: { sy: 34, ua: 10, fa: 8 }, B: { sy: 34, ua: 86, fa: 92 } } },
  { id: "frontraise", g: "shoulders", n: "הרמה קדמית", al: ["front raise", "הרמה לפנים"], t: "i", pat: "front", base: 58, f: { f: .85, s: .3, r: .05 },
    prim: ["delts"], sec: [], why: "הכתף הקדמית כבר עובדת חזק בכל לחיצות החזה והכתפיים – לרוב אין צורך בתרגיל הזה.", cue: "הרמה עד גובה העיניים, בלי נדנוד.", bad: "נדנוד הגו, משקל כבד.",
    fig: { eq: "db", A: { ...STAND, ua: 172, fa: 172 }, B: { ...STAND, ua: 88, fa: 86 } } },
  { id: "facepull", g: "shoulders", n: "פייס פול (משיכה לפנים)", al: ["face pull", "פייס פול", "משיכה לפנים"], t: "i", pat: "rear", base: 78, f: { f: .05, s: .35, r: 1 },
    prim: ["delts", "traps"], sec: [], why: "מחזק את הכתף האחורית ואת השרוול המסובב – מאזן את כל הלחיצות ושומר על כתפיים בריאות.", cue: "כבל בגובה הפנים, מושכים לכיוון המצח ומפרידים ידיים, מרפקים גבוהים.", bad: "משיכה לחזה עם מרפקים נמוכים.",
    fig: { cab: [106, 24], st: [[[106, -4], [106, 112]]], A: { ...STAND, wt: [90, 28] }, B: { ...STAND, wt: [66, 18], eb: 1 } } },

  /* ── יד קדמית ── */
  { id: "bbcurl", g: "biceps", n: "כפיפת מרפקים במוט", al: ["כפיפת מרפקים", "barbell curl", "curl", "בייספס במוט"], t: "i", pat: "curl", base: 85, f: { lo: .75, sh: .85, br: .5 },
    prim: ["biceps"], sec: ["forearms"], why: "התרגיל הבסיסי ליד הקדמית – מאפשר את העומס הגבוה ביותר.", cue: "מרפקים צמודים לגוף, בלי נדנוד, ירידה איטית.", bad: "נדנוד הגו, מרפקים זזים קדימה.",
    fig: { eq: "bb", A: { ...STAND, ua: 178, fa: 176 }, B: { ...STAND, ua: 172, fa: 28 } } },
  { id: "inclinecurl", g: "biceps", n: "כפיפת מרפקים בשיפוע", al: ["incline curl", "כפיפה בשיפוע"], t: "i", pat: "curl", base: 80, f: { lo: 1, sh: .5, br: .4 },
    prim: ["biceps"], sec: [], why: "הזרוע מאחורי הגוף מותחת את הראש הארוך – מעולה לפיק של היד.", cue: "ספסל ב־45°–60°, ידיים תלויות ישר למטה, מרפקים לא זזים קדימה.", bad: "הרמת המרפקים קדימה בסוף התנועה.",
    fig: { eq: "db db1", st: [[[57, 90], [28, 66]], [[57, 90], [74, 90]], [[62, 90], [62, 112]]], A: { p: [60, 86], tor: -40, at: [88, 112], ua: 186, fa: 184 }, B: { p: [60, 86], tor: -40, at: [88, 112], ua: 186, fa: 22 } } },
  { id: "preacher", g: "biceps", n: "כפיפת מרפקים בכיסא כומר", al: ["כיסא כומר", "preacher curl", "פריצ׳ר"], t: "i", pat: "curl", base: 80, f: { lo: .45, sh: 1, br: .5 },
    prim: ["biceps"], sec: [], why: "הזרוע קבועה לפני הגוף – הדגש עובר לראש הקצר ואין אפשרות 'לרמות'.", cue: "בית השחי צמוד לכרית, יורדים כמעט עד יישור מלא באיטיות.", bad: "יישור מהיר ומלא עם משקל כבד (עומס על המרפק).",
    fig: { eq: "bb", st: [[[51, 58], [66, 74]], [[62, 72], [62, 112]], ...SEAT(46, 90)], A: { p: [46, 86], tor: 12, th: 90, sh: 180, ua: 138, fa: 125 }, B: { p: [46, 86], tor: 12, th: 90, sh: 180, ua: 138, fa: 18 } } },
  { id: "hammer", g: "biceps", n: "כפיפת פטיש", al: ["פטיש", "hammer curl", "האמר"], t: "i", pat: "hammer", base: 76, f: { lo: .5, sh: .35, br: 1 },
    prim: ["biceps", "forearms"], sec: [], why: "אחיזה ניטרלית מדגישה את הברכיאליס ואת האמה – יד 'עבה' יותר.", cue: "אגודל למעלה, מרפקים צמודים, עולים עד הכתף.", bad: "נדנוד ומרפקים שבורחים קדימה.",
    fig: { eq: "db db1", A: { ...STAND, ua: 178, fa: 178 }, B: { ...STAND, ua: 174, fa: 24 } } },

  /* ── יד אחורית ── */
  { id: "ohext", g: "triceps", n: "פשיטת מרפקים מעל הראש", al: ["פשיטה מעל הראש", "overhead extension", "פרנץ׳ פרס", "french press"], t: "i", pat: "ohext", base: 84, f: { lo: 1, la: .55 },
    prim: ["triceps"], sec: [], why: "הזרוע מעל הראש מותחת את הראש הארוך – הראש הגדול ביותר של היד האחורית.", cue: "מרפקים מצביעים קדימה ולא נפתחים, יורדים עמוק מאחורי הראש.", bad: "מרפקים נפתחים לצדדים, קשת בגב.",
    fig: { eq: "db db1", A: { ...STAND, ua: 4, fa: 4 }, B: { ...STAND, ua: 6, fa: 205 } } },
  { id: "skull", g: "triceps", n: "פשיטת מרפקים בשכיבה (סקאל קראשר)", al: ["סקאל קראשר", "skull crusher", "פשיטה בשכיבה"], t: "i", pat: "skull", base: 82, f: { lo: .85, la: .7 },
    prim: ["triceps"], sec: [], why: "עומס טוב לכל ראשי היד האחורית, במיוחד כשהמוט יורד מאחורי הראש.", cue: "מרפקים קבועים ומעט לאחור, המוט יורד למצח או מאחוריו.", bad: "מרפקים נפתחים, הזרוע זזה (הופך ללחיצה).",
    fig: { st: FLAT, eq: "bb", A: { p: [42, 78], tor: 90, at: [20, 112], kb: 1, ua: 8, fa: 4 }, B: { p: [42, 78], tor: 90, at: [20, 112], kb: 1, ua: 14, fa: 168 } } },
  { id: "pushdown", g: "triceps", n: "פשיטת מרפקים בפולי", al: ["פולי עליון ליד אחורית", "pushdown", "triceps pushdown", "פשיטה בפולי"], t: "i", pat: "pushdown", base: 78, f: { lo: .45, la: 1 },
    prim: ["triceps"], sec: [], why: "קל ללמוד ומדגיש את הראש הצידי והמדיאלי.", cue: "מרפקים צמודים לצלעות, מיישרים עד הסוף ומחזיקים רגע.", bad: "מרפקים זזים קדימה ואחורה, הגו נשען על הכבל.",
    fig: { cab: [80, -6], st: [[[96, -8], [96, 112]], [[80, -6], [96, -6]]], A: { p: [60, 62], tor: 8, at: [62, 112], ua: 178, fa: 48 }, B: { p: [60, 62], tor: 8, at: [62, 112], ua: 178, fa: 176 } } },
  { id: "cgbp", g: "triceps", n: "לחיצת חזה באחיזה צרה", al: ["אחיזה צרה", "close grip", "close grip bench"], t: "c", pat: "press", base: 84, f: { lo: .5, la: .9 },
    prim: ["triceps"], sec: ["pecs", "delts"], why: "תרגיל מורכב שמאפשר הרבה משקל ליד האחורית.", cue: "אחיזה ברוחב הכתפיים, מרפקים צמודים לגוף, המוט יורד לחזה התחתון.", bad: "אחיזה צרה מדי (עומס על שורש כף היד).",
    fig: { st: FLAT, eq: "bb", A: { p: [42, 78], tor: 90, at: [20, 112], kb: 1, wt: [72, 47] }, B: { p: [42, 78], tor: 90, at: [20, 112], kb: 1, wt: [66, 72], eb: -1 } } },
  { id: "dipst", g: "triceps", n: "מקבילים בגוף זקוף", al: ["מקבילים ליד אחורית", "dips triceps"], t: "c", pat: "dip", base: 80, f: { lo: .5, la: .95 },
    prim: ["triceps"], sec: ["pecs", "delts"], why: "גוף זקוף מעביר את העבודה ליד האחורית – תרגיל משקל גוף חזק במיוחד.", cue: "גו זקוף, מרפקים לאחור, ירידה עד 90° במרפק.", bad: "ירידה עמוקה מדי, כתפיים קורסות קדימה.",
    fig: { ng: 1, st: [[[50, 56], [86, 56]], [[82, 56], [82, 112]]], A: { p: [60, 58], tor: 2, th: 172, sh: 215, wt: [61, 57] }, B: { p: [60, 72], tor: 4, th: 172, sh: 220, wt: [61, 58], eb: -1 } } },

  /* ── רגליים ── */
  { id: "squat", g: "legs", n: "סקוואט עם מוט", al: ["סקוואט", "squat", "כריעה", "back squat"], t: "c", pat: "squat", base: 95, f: { q: 1, g: .8, h: .3 },
    prim: ["quads", "glutes"], sec: ["erectors", "abs", "hams"], why: "'מלך התרגילים' – הכי הרבה שריר עובד בבת אחת, וקל להתקדם בעומס.", cue: "ירכיים לאחור, ברכיים בכיוון הבהונות, עקבים על הרצפה, יורדים לפחות עד מקביל.", bad: "ברכיים קורסות פנימה, עקבים מתרוממים, גב מתעגל.",
    fig: { eq: "bk", A: { p: [58, 62], tor: 5, at: [60, 112], ua: 222, fa: 25 }, B: { p: [40, 88], tor: 40, at: [60, 112], ua: 262, fa: 70 } } },
  { id: "frontsquat", g: "legs", n: "סקוואט קדמי", al: ["front squat", "סקוואט קדמי"], t: "c", pat: "squat", base: 88, f: { q: 1, g: .6, h: .2 },
    prim: ["quads"], sec: ["glutes", "abs", "erectors"], why: "גו זקוף יותר = יותר ארבע־ראשי ופחות עומס על הגב התחתון.", cue: "מרפקים גבוהים, חזה למעלה, יורדים עמוק בין הרגליים.", bad: "מרפקים נופלים והמוט מתגלגל קדימה.",
    fig: { eq: "fk", A: { p: [58, 62], tor: 2, at: [60, 112], ua: 78, fa: 245 }, B: { p: [44, 90], tor: 22, at: [62, 112], ua: 96, fa: 262 } } },
  { id: "legpress", g: "legs", n: "לחיצת רגליים", al: ["לחיצת רגליים", "leg press", "לג פרס"], t: "c", pat: "squat", base: 85, f: { q: .95, g: .6, h: .2 },
    prim: ["quads", "glutes"], sec: ["hams"], why: "הרבה עומס על הרגליים בלי עומס על הגב – מעולה למתחילים ולנפח.", cue: "גב ואגן צמודים לכרית, ברכיים בכיוון הבהונות, לא לנעול ברכיים.", bad: "אגן מתגלגל מהכרית בתחתית, נעילת ברכיים.",
    fig: { st: [[[12, 74], [38, 90]], [[38, 90], [38, 112]]], A: { p: [40, 84], tor: -60, at: [82, 50], kb: 1, ft: -45, ua: 150, fa: 120 }, B: { p: [40, 84], tor: -60, at: [64, 64], kb: 1, ft: -45, ua: 150, fa: 120 } } },
  { id: "bss", g: "legs", n: "סקוואט בולגרי", al: ["בולגרי", "bulgarian split squat", "ספליט סקוואט"], t: "c", pat: "lunge", base: 88, f: { q: .85, g: .9, h: .3 },
    prim: ["quads", "glutes"], sec: ["hams", "abs"], why: "רגל אחת בכל פעם – הרבה עבודה עם משקל קטן, ומאזן בין הצדדים.", cue: "רגל אחורית על ספסל, יורדים ישר למטה, הברך הקדמית מעל כף הרגל.", bad: "כף הרגל הקדמית קרובה מדי לספסל, הגו קורס.",
    fig: { eq: "db db1", st: [[[8, 90], [34, 90]], [[14, 90], [14, 112]]], A: { p: [52, 58], tor: 4, at: [68, 112], l2: { at: [24, 86], kb: -1, ft: 260 }, ua: 180, fa: 180 }, B: { p: [48, 80], tor: 14, at: [68, 112], l2: { at: [24, 86], kb: -1, ft: 260 }, ua: 186, fa: 186 } } },
  { id: "lunge", g: "legs", n: "לאנג׳ (מכרע)", al: ["לאנג", "לאנג'", "מכרע", "lunge", "מכרעים"], t: "c", pat: "lunge", base: 80, f: { q: .8, g: .8, h: .3 },
    prim: ["quads", "glutes"], sec: ["hams", "calves"], why: "עובד על כוח, יציבות ושיווי משקל – קרוב לתנועות מהחיים.", cue: "צעד ארוך, גו זקוף, הברך האחורית יורדת קרוב לרצפה.", bad: "צעד קצר והברך הקדמית בורחת רחוק קדימה.",
    fig: { eq: "db db1", A: { p: [58, 60], tor: 0, at: [72, 112], l2: { at: [40, 112], kb: -1, ft: 60 }, ua: 180, fa: 180 }, B: { p: [56, 82], tor: 4, at: [74, 112], l2: { at: [34, 110], kb: -1, ft: 60 }, ua: 182, fa: 182 } } },
  { id: "rdl", g: "legs", n: "דדליפט רומני", al: ["רומני", "rdl", "romanian deadlift", "דדליפט רגליים ישרות"], t: "c", pat: "hinge", base: 90, f: { q: .1, g: .85, h: 1 },
    prim: ["hams", "glutes"], sec: ["erectors", "forearms"], why: "התרגיל הטוב ביותר להמסטרינג – מותח אותו תחת עומס.", cue: "ברכיים מעט כפופות וקבועות, דוחפים ירכיים לאחור, המוט צמוד לרגליים.", bad: "גב מעוגל, כיפוף ברכיים שהופך את זה לסקוואט.",
    fig: { eq: "bb", A: { p: [60, 62], tor: 0, at: [60, 112], wt: [62, 63] }, B: { p: [46, 65], tor: 72, at: [60, 112], kb: -1, wt: [76, 90] } } },
  { id: "deadlift", g: "legs", n: "דדליפט", al: ["הרמת מתים", "deadlift", "דדליפט קלאסי"], t: "c", pat: "hinge", base: 92, f: { q: .5, g: .9, h: .75 },
    prim: ["glutes", "hams", "erectors"], sec: ["quads", "traps", "forearms"], why: "תרגיל לכל הגוף האחורי – מעולה לכוח, אבל מעייף מאוד, אז לא צריך הרבה סטים.", cue: "המוט מעל אמצע כף הרגל, גב ניטרלי, דוחפים את הרצפה ומיישרים ירכיים.", bad: "גב מעוגל, המוט רחוק מהגוף, משיכה בזרועות.",
    fig: { eq: "bb", A: { p: [60, 62], tor: 0, at: [60, 112], wt: [62, 63] }, B: { p: [40, 84], tor: 62, at: [60, 112], kb: -1, wt: [66, 100] } } },
  { id: "hipthrust", g: "legs", n: "היפ תראסט", al: ["היפ תרסט", "hip thrust", "גשר עם מוט", "גשר"], t: "c", pat: "bridge", base: 86, f: { q: .25, g: 1, h: .45 },
    prim: ["glutes"], sec: ["hams", "quads"], why: "הכי הרבה הפעלה של הישבן בנקודה העליונה – תרגיל מרכזי לישבן.", cue: "שכמות על הספסל, סנטר לחזה, מיישרים אגן עד קו ישר ומכווצים ישבן.", bad: "קשת בגב התחתון במקום יישור מהירך.",
    fig: { eq: "hip", st: [[[2, 92], [28, 92]], [[14, 92], [14, 112]]], A: { p: [52, 100], tor: -76, at: [82, 112], kb: -1, wt: [54, 92] }, B: { p: [54, 80], tor: -95, at: [82, 112], kb: -1, wt: [56, 72] } } },
  { id: "legcurl", g: "legs", n: "כפיפת ברכיים במכונה", al: ["כפיפת ברכיים", "leg curl", "המסטרינג במכונה"], t: "i", pat: "lcurl", base: 76, f: { q: 0, g: .05, h: 1 },
    prim: ["hams"], sec: ["calves"], why: "בידוד להמסטרינג דרך כפיפת הברך – משלים את הדדליפט הרומני.", cue: "אגן צמוד לכרית, כפיפה מלאה וירידה איטית.", bad: "אגן מתרומם, ירידה מהירה.",
    fig: { ng: 1, eq: "pad", st: [[[14, 84], [102, 84]], [[20, 84], [20, 112]], [[96, 84], [96, 112]], [[2, 112], [118, 112]]], A: { p: [64, 78], tor: 90, th: 270, sh: 270, ft: 180, ua: 135, fa: 160 }, B: { p: [64, 78], tor: 90, th: 270, sh: 12, ft: 100, ua: 135, fa: 160 } } },
  { id: "legext", g: "legs", n: "פשיטת ברכיים במכונה", al: ["פשיטת ברכיים", "leg extension", "מכונת ארבע ראשי"], t: "i", pat: "lext", base: 72, f: { q: 1, g: 0, h: 0 },
    prim: ["quads"], sec: [], why: "בידוד מלא לארבע־ראשי, כולל ישר הירך שפחות עובד בסקוואט.", cue: "ברך מול ציר המכונה, מיישרים עד הסוף ומחזיקים שנייה.", bad: "בעיטה מהירה, הרמת האגן מהמושב.",
    fig: { eq: "pad", st: [[[42, 92], [40, 50]], ...SEAT(54, 92)], A: { p: [50, 86], tor: -5, th: 90, sh: 182, ft: 90, ua: 172, fa: 172 }, B: { p: [50, 86], tor: -5, th: 90, sh: 84, ft: 0, ua: 172, fa: 172 } } },

  /* ── שוקיים ── */
  { id: "calfstand", g: "calves", n: "הרמת עקבים בעמידה", al: ["תאומים", "calf raise", "הרמת עקבים"], t: "i", pat: "calf", base: 85, f: { ga: 1, so: .6 },
    prim: ["calves"], sec: [], why: "ברך ישרה = התאומים עובדים במלואם.", cue: "ירידה עמוקה למתיחה, עלייה עד הסוף והחזקה של שנייה.", bad: "קפיצות קטנות בלי טווח.",
    fig: { st: [[[64, 112], [96, 112], [96, 108], [64, 108]]], A: { p: [60, 62], tor: 0, th: 180, sh: 180, ft: 112, ua: 180, fa: 180 }, B: { p: [60, 52], tor: 0, th: 180, sh: 180, ft: 148, ua: 180, fa: 180 } } },
  { id: "calfseat", g: "calves", n: "הרמת עקבים בישיבה", al: ["תאומים בישיבה", "seated calf", "סולאוס"], t: "i", pat: "calf", base: 78, f: { ga: .3, so: 1 },
    prim: ["calves"], sec: [], why: "ברך כפופה מנטרלת את התאומים – הדגש עובר לסולאוס שמתחת.", cue: "טווח מלא, תנועה איטית ומבוקרת.", bad: "טווח קצר ומהיר.",
    fig: { st: [...SEAT(50, 84), [[64, 76], [84, 76]]], A: { p: [50, 80], tor: 0, th: 90, sh: 182, ft: 92, ua: 135, fa: 90 }, B: { p: [50, 80], tor: 0, th: 84, sh: 176, ft: 124, ua: 135, fa: 90 } } },

  /* ── בטן וליבה ── */
  { id: "plank", g: "core", n: "פלאנק", al: ["פלאנק", "plank", "גשר אמות"], t: "i", pat: "plank", base: 70, f: { a: .6, o: .5, s: 1 },
    prim: ["abs"], sec: ["obliques", "delts"], why: "מלמד לייצב את הליבה בלי לזוז – בסיס לכל התרגילים הכבדים.", cue: "אמות מתחת לכתפיים, ישבן ובטן מכווצים, קו ישר.", bad: "אגן שוקע או מתרומם, החזקה ארוכה מדי בלי איכות.",
    fig: { A: { p: [56, 95], tor: 72, at: [10, 108], kb: 1, ft: 116, ua: 180, fa: 90 }, B: { p: [56, 93], tor: 73, at: [10, 108], kb: 1, ft: 116, ua: 180, fa: 90 } } },
  { id: "deadbug", g: "core", n: "דד באג", al: ["dead bug", "דדבאג"], t: "i", pat: "antiext", base: 74, f: { a: .7, o: .4, s: .95 },
    prim: ["abs"], sec: ["obliques"], why: "מלמד לשמור גב תחתון צמוד לרצפה כשהגפיים זזות – ליבה 'חכמה'.", cue: "גב תחתון צמוד לרצפה, מושיטים יד ורגל נגדית באיטיות.", bad: "הגב התחתון מתקמר מהרצפה.",
    fig: { A: { p: [42, 104], tor: 90, th: 10, sh: 270, ft: 0, ua: 0, fa: 0, l2: { th: 10, sh: 270, ft: 0 }, a2: { ua: 0, fa: 0 } }, B: { p: [42, 104], tor: 90, th: 262, sh: 266, ft: 0, ua: 68, fa: 76, l2: { th: 10, sh: 270, ft: 0 }, a2: { ua: 0, fa: 0 } } } },
  { id: "cablecrunch", g: "core", n: "כפיפות בטן בכבל", al: ["קראנץ׳ בכבל", "cable crunch", "כפיפות בטן בפולי"], t: "i", pat: "flex", base: 82, f: { a: 1, o: .4, s: .3 },
    prim: ["abs"], sec: ["obliques"], why: "אפשר להוסיף עומס בהדרגה – כמו כל שריר אחר.", cue: "אגן קבוע, מעגלים את הגב ומקרבים צלעות לאגן.", bad: "ישיבה על העקבים ומשיכה בידיים במקום בבטן.",
    fig: { cab: [66, -6], st: [[[60, -8], [76, -8]]], A: { p: [50, 87], tor: 8, th: 180, sh: 270, ft: 180, ua: 40, fa: 220 }, B: { p: [50, 87], tor: 72, th: 180, sh: 270, ft: 180, ua: 104, fa: 284 } } },
  { id: "hlr", g: "core", n: "הרמת רגליים בתלייה", al: ["הרמת רגליים", "hanging leg raise", "תלייה"], t: "i", pat: "flex", base: 84, f: { a: 1, o: .5, s: .5 },
    prim: ["abs"], sec: ["obliques", "forearms"], why: "מאתגר מאוד את ישר הבטן התחתון ואת השליטה באגן.", cue: "מגלגלים את האגן למעלה, בלי נדנוד. מתחילים עם ברכיים כפופות.", bad: "נדנוד והרמה מהירך בלבד בלי גלגול האגן.",
    fig: { ng: 1, st: [[[40, -4], [80, -4]]], A: { p: [60, 62], tor: 0, th: 180, sh: 182, wt: [60, -4] }, B: { p: [60, 62], tor: -6, th: 82, sh: 88, ft: 0, wt: [60, -4] } } },
  { id: "pallof", g: "core", n: "פאלוף פרס", al: ["pallof", "פאלוף"], t: "i", pat: "antirot", base: 76, f: { a: .3, o: 1, s: .9 },
    prim: ["obliques"], sec: ["abs"], why: "אנטי־סיבוב: הליבה מתנגדת למשיכה של הכבל – נהדר לבריאות הגב.", cue: "עומדים מאונך לכבל, דוחפים ידיים קדימה ומתנגדים לסיבוב.", bad: "הגוף מסתובב לכיוון הכבל.",
    fig: { cab: [6, 44], st: [[[6, 4], [6, 112]]], A: { ...STAND, at: [62, 112], l2: { at: [50, 112] }, wt: [66, 44], eb: -1 }, B: { ...STAND, at: [62, 112], l2: { at: [50, 112] }, wt: [90, 40] } } },
  { id: "sideplank", g: "core", n: "פלאנק צידי", al: ["side plank", "פלאנק צד"], t: "i", pat: "plank", base: 70, f: { a: .3, o: .95, s: .8 },
    prim: ["obliques"], sec: ["abs", "glutes"], why: "מחזק את הצד של הליבה ואת העכוז האמצעי – חשוב ליציבות האגן.", cue: "מרפק מתחת לכתף, אגן גבוה, גוף בקו ישר.", bad: "אגן נופל, כתף קורסת.",
    fig: { A: { p: [56, 96], tor: 70, at: [10, 110], kb: 1, ft: 90, ua: 180, fa: 90, a2: { ua: 30, fa: 30 } }, B: { p: [56, 90], tor: 66, at: [10, 110], kb: 1, ft: 90, ua: 182, fa: 90, a2: { ua: 0, fa: 0 } } } }
];
const PB_BY = Object.fromEntries(PB_EX.map(e => [e.id, e]));

/* ───── 3. חישובים ───── */
const PB_GOALS = { str: "💪 כוח", hyp: "📈 מסת שריר", end: "🔋 סיבולת / חיטוב", gen: "🏃 כושר כללי" };
const PB_LVLS = { beg: "מתחיל", int: "בינוני", adv: "מתקדם" };
const PB_REPS = ["3–5", "5–8", "6–10", "8–12", "10–15", "15–20"];
function pbState() {
  if (!S.plan) S.plan = { goal: "hyp", lvl: "beg", cur: 0, days: [{ n: "אימון A", g: [] }] };
  return S.plan;
}
function pbScore(ex, dom) {
  if (!ex || !ex.f) return null;
  return Math.min(98, Math.round(0.55 * ex.base + 45 * (ex.f[dom] ?? 0.4)));
}
function pbRec(ex, goal, lvl) {
  const c = !ex || ex.t === "c";
  let s, r, rest;
  if (goal === "str") { s = c ? 4 : 3; r = c ? "3–5" : "8–12"; rest = c ? "2–4 דק׳" : "90 שנ׳"; }
  else if (goal === "end") { s = c ? 3 : 2; r = c ? "10–15" : "15–20"; rest = "30–60 שנ׳"; }
  else if (goal === "gen") { s = c ? 3 : 2; r = c ? "8–12" : "10–15"; rest = "60–90 שנ׳"; }
  else { s = 3; r = c ? "6–10" : "10–15"; rest = c ? "2–3 דק׳" : "60–90 שנ׳"; if (lvl === "adv" && c) s = 4; }
  if (lvl === "beg") s = Math.min(s, 3);
  return { s, r, rest };
}
function pbFocusText(ex, gk) {
  if (!ex || !ex.f) return "תרגיל שהוספת – אין לו דירוג במאגר";
  const G = PB_GROUPS[ex.g], top = Object.entries(ex.f).sort((a, b) => b[1] - a[1])[0][0];
  const sec = (ex.sec || []).map(m => (typeof MUSCLES !== "undefined" && MUSCLES[m] ? MUSCLES[m].n.split(" (")[0] : m)).slice(0, 3);
  return `דגש: ${G.dom[top]}${sec.length ? ` · עוזרים: ${sec.join(", ")}` : ""}`;
}
function pbSearch(txt) {
  const n = s => String(s).toLowerCase().replace(/[׳'"״\-–\s]/g, "");
  const q = n(txt); if (q.length < 2) return [];
  return PB_EX.filter(e => [e.n, ...(e.al || [])].some(a => n(a).includes(q) || (q.length >= 4 && q.includes(n(a)))));
}
function pbWeekly(plan) {
  const v = {};
  const IND = { triceps: "triceps", biceps: "biceps", delts: "shoulders" };
  plan.days.forEach(d => { const x = d.x || 1; d.g.forEach(gr => { v[gr.k] = v[gr.k] || { sets: 0, days: 0, ind: 0 }; v[gr.k].days += x; gr.ex.forEach(it => v[gr.k].sets += (+it.s || 0) * x); }); });
  // עבודה עקיפה: תרגיל מורכב מפעיל גם את השרירים העוזרים (נספר כחצי סט)
  plan.days.forEach(d => d.g.forEach(gr => gr.ex.forEach(it => { const ex = PB_BY[it.id]; if (!ex || ex.t !== "c") return;
    (ex.sec || []).forEach(m => { const k = IND[m]; if (k && k !== gr.k && v[k]) v[k].ind += (+it.s || 0) * (d.x || 1) / 2; }); })));
  Object.values(v).forEach(o => o.eff = Math.round(o.sets + o.ind));
  return v;
}
function pbTarget(plan, gk) {
  const small = gk === "calves" || gk === "core";
  let r;
  if (plan.goal === "str") r = small ? [4, 8] : plan.lvl === "beg" ? [6, 12] : [8, 16];
  else if (plan.goal !== "hyp") r = small ? [3, 10] : [4, 16];
  else r = { beg: small ? [4, 8] : [6, 12], int: small ? [6, 10] : [8, 16], adv: small ? [6, 12] : [10, 20] }[plan.lvl];
  return gk === "legs" ? r.map(x => Math.round(x * 1.5)) : r;
}
function pbDayMinutes(day, plan) {
  let sec = 8 * 60;
  day.g.forEach(gr => gr.ex.forEach(it => { const ex = PB_BY[it.id], c = !ex || ex.t === "c"; const rest = plan.goal === "str" ? (c ? 180 : 90) : plan.goal === "end" ? 45 : (c ? 150 : 75); sec += (+it.s || 0) * (rest + 40); }));
  return Math.round(sec / 60);
}

/* ───── 4. ניתוח והמלצות ───── */
function pbGroupTips(gr, plan, hasSwap) {
  const G = PB_GROUPS[gr.k], tips = [], items = gr.ex.map(it => ({ it, ex: PB_BY[it.id] })).filter(x => x.ex);
  if (!gr.ex.length) return tips;
  // כיסוי של המיקוד שנבחר
  if (!hasSwap && items.length && Math.max(...items.map(x => x.ex.f[gr.dom] ?? 0)) < 0.8) {
    const best = PB_EX.filter(e => e.g === gr.k && !gr.ex.some(i => i.id === e.id)).sort((a, b) => pbScore(b, gr.dom) - pbScore(a, gr.dom))[0];
    tips.push({ t: `אף תרגיל לא מכוון באמת ל<b>${G.dom[gr.dom]}</b>.${best ? ` כדאי להוסיף: <b>${best.n}</b> (${pbScore(best, gr.dom)}%).` : ""}`, add: best && best.id });
  }
  // כפילות
  const pats = {}; items.forEach(x => (pats[x.ex.pat] = pats[x.ex.pat] || []).push(x.ex.n));
  Object.values(pats).filter(a => a.length > 1).forEach(a => tips.push({ t: `<b>${a.join("</b> ו<b>")}</b> כמעט אותה תנועה. עדיף לגוון – למשל זווית אחרת או תרגיל בידוד.` }));
  // סדר
  const firstI = items.findIndex(x => x.ex.t === "i"), lastC = items.map(x => x.ex.t).lastIndexOf("c");
  if (firstI > -1 && lastC > firstI) tips.push({ t: "כדאי להתחיל בתרגיל המורכב (הכבד) ורק אחריו בתרגיל הבידוד.", sort: 1 });
  if (gr.ex.length > 4) tips.push({ t: `${gr.ex.length} תרגילים לקבוצה אחת באימון זה הרבה – 2–3 תרגילים טובים מספיקים.` });
  return tips;
}
function pbPlanTips(plan) {
  const tips = [], W = pbWeekly(plan), sets = k => (W[k] ? W[k].sets : 0);
  const anyEx = plan.days.some(d => d.g.some(g => g.ex.length));
  if (!anyEx) return [{ i: "👋", t: "התחל בהוספת קבוצת שרירים ותרגילים, או בחר תבנית מוכנה." }];
  ["legs", "back", "chest", "shoulders"].forEach(k => { if (!sets(k)) tips.push({ i: "⚠️", t: `אין בתוכנית בכלל <b>${PB_GROUPS[k].n}</b>. תוכנית מאוזנת עובדת על כל הקבוצות הגדולות.` }); });
  Object.entries(W).forEach(([k, v]) => {
    const [lo, hi] = pbTarget(plan, k), G = PB_GROUPS[k];
    const small = k === "calves" || k === "core";
    if (v.eff < lo && !small) tips.push({ i: "📉", t: `<b>${G.n}</b>: כ־${v.eff} סטים בשבוע${v.ind ? " (כולל עבודה עקיפה)" : ""} – מעט. ליעד שלך מומלץ ${lo}–${hi}.` });
    else if (v.sets > hi) tips.push({ i: "📈", t: `<b>${G.n}</b>: ${v.sets} סטים בשבוע – יותר מהמומלץ (${lo}–${hi}). יותר לא תמיד טוב יותר – קשה להתאושש.` });
    if (v.days === 1 && v.sets >= 8 && plan.goal !== "end") tips.push({ i: "🔁", t: `<b>${G.n}</b> מאומן פעם אחת בשבוע. חלוקה ל־2 אימונים (אותם סטים) נותנת בדרך כלל תוצאות טובות יותר.` });
  });
  // דחיפה מול משיכה
  let push = sets("chest"), pull = sets("back");
  plan.days.forEach(d => d.g.forEach(g => { if (g.k === "shoulders") g.ex.forEach(it => { const e = PB_BY[it.id], n = (+it.s || 0) * (d.x || 1); if (e && e.id === "facepull") pull += n; else push += n; }); }));
  if (push > 0 && push > pull * 1.4) tips.push({ i: "⚖️", t: `יש ${push} סטי דחיפה מול ${pull} סטי משיכה. כדאי להוסיף חתירות או פייס פול – זה שומר על כתפיים ויציבה טובות.` });
  const hasRear = plan.days.some(d => d.g.some(g => g.ex.some(it => it.id === "facepull")));
  if (!hasRear && push >= 8) tips.push({ i: "🛡️", t: "אין עבודה לכתף האחורית. <b>פייס פול</b> פעם–פעמיים בשבוע מאזן את כל הלחיצות." });
  if (sets("legs") && !plan.days.some(d => d.g.some(g => g.k === "legs" && g.ex.some(it => PB_BY[it.id] && PB_BY[it.id].f.h >= .75)))) tips.push({ i: "🦵", t: "ברגליים אין תרגיל טוב להמסטרינג – כדאי <b>דדליפט רומני</b> או <b>כפיפת ברכיים</b>." });
  plan.days.forEach(d => {
    const m = pbDayMinutes(d, plan), n = d.g.reduce((a, g) => a + g.ex.length, 0);
    if (m > 90) tips.push({ i: "⏱️", t: `<b>${esc(d.n)}</b> ייקח בערך ${m} דקות – ארוך מדי. נסה לקצר ל־60–75 דקות.` });
    if (n > 8) tips.push({ i: "📋", t: `ב<b>${esc(d.n)}</b> יש ${n} תרגילים. 5–8 תרגילים מספיקים לאימון איכותי.` });
  });
  if (plan.lvl === "beg" && plan.days.length > 4) tips.push({ i: "🌱", t: "למתחילים 2–4 אימונים בשבוע מספיקים. ההתאוששות חשובה לא פחות מהאימון." });
  return tips;
}
const PB_IDEAS = [
  "📝 רשום משקל וחזרות בכל אימון – אם בפעם הבאה עשית עוד חזרה או עוד קצת משקל, אתה מתקדם (עומס הדרגתי).",
  "🎯 סיים כל סט עם 1–3 חזרות 'במיכל' (RIR). לא צריך להגיע לכשל בכל סט.",
  "🔥 לפני התרגיל הראשון: 2–3 סטי חימום קלים באותו תרגיל.",
  "📆 כל 4–8 שבועות – שבוע קל (דילואד) עם חצי מהסטים כדי להתאושש.",
  "🔄 אל תחליף תרגילים כל שבוע. השאר אותם 6–8 שבועות כדי שתוכל לראות התקדמות.",
  "😴 7–9 שעות שינה וחלבון בכל ארוחה עושים חלק גדול מהעבודה.",
  "🐢 ירידה מבוקרת (2–3 שניות) בכל חזרה מגבירה את האפקטיביות ומורידה סיכון לפציעה."
];

/* ───── 5. תבניות ───── */
function pbMkGroup(k, n, dom, plan) {
  const G = PB_GROUPS[k], pref = (dom || G.def).split(","); dom = pref[0];
  const doms = [...pref, ...Object.keys(G.dom).filter(d => !pref.includes(d))], pick = [], pats = new Set();
  for (let i = 0; pick.length < n && i < n * 3; i++) {
    const d = doms[i % doms.length], e = PB_EX.filter(e => e.g === k && !pick.includes(e) && !pats.has(e.pat)).sort((a, b) => pbScore(b, d) - pbScore(a, d))[0];
    if (!e) break; pick.push(e); pats.add(e.pat);
  }
  pick.sort((a, b) => (a.t === "c" ? 0 : 1) - (b.t === "c" ? 0 : 1));
  return { k, dom, ex: pick.map((e, i) => { const r = pbRec(e, plan.goal, plan.lvl); return { id: e.id, s: i ? Math.min(3, r.s) : r.s, r: r.r }; }) };
}
const PB_TPL = {
  fb: { n: "גוף מלא × 3 בשבוע", d: "הכי מומלץ למתחילים – A, B, A ואז B, A, B", x: [2, 1], days: [["אימון A", [["legs", 1, "q"], ["chest", 1], ["back", 1, "w"], ["shoulders", 1], ["core", 1]]], ["אימון B", [["legs", 1, "h"], ["back", 1, "t"], ["chest", 1, "u"], ["shoulders", 1, "r"], ["biceps", 1], ["triceps", 1]]]] },
  ul: { n: "עליון / תחתון × 4 בשבוע", d: "מתאים לבינוניים – כל אימון פעמיים בשבוע", x: [2, 2], days: [["עליון", [["chest", 2], ["back", 2], ["shoulders", 2, "s,r"], ["biceps", 1], ["triceps", 1]]], ["תחתון", [["legs", 3], ["calves", 1], ["core", 1]]]] },
  ppl: { n: "דחיפה / משיכה / רגליים", d: "מתאים למתקדמים – 3 או 6 אימונים בשבוע", x: [1, 1, 1], days: [["דחיפה", [["chest", 3], ["shoulders", 2, "s,r"], ["triceps", 2]]], ["משיכה", [["back", 3], ["biceps", 2]]], ["רגליים", [["legs", 4], ["calves", 1], ["core", 1]]]] }
};

/* ───── 6. מסך ───── */
function pbBody(ex) {
  if (typeof BODY_BASE === "undefined" || !ex.prim) return "";
  const mark = (svgG) => {
    let g = svgG;
    ex.prim.forEach(m => g = g.replace(new RegExp(`data-m="${m}"`, "g"), `data-m="${m}" class="on"`));
    (ex.sec || []).forEach(m => g = g.replace(new RegExp(`data-m="${m}"(?! class)`, "g"), `data-m="${m}" class="sec"`));
    return g;
  };
  return `<div class="pb-bodies"><div><svg viewBox="0 0 200 392" class="bodymap pb-bm">${BODY_BASE}<g class="mus">${mark(BODY_FRONT)}</g></svg><span>מלפנים</span></div>
    <div><svg viewBox="0 0 200 392" class="bodymap pb-bm">${BODY_BASE}<g class="mus">${mark(BODY_BACK)}</g></svg><span>מאחור</span></div></div>
    <div class="pb-legend"><span><i class="lg-on"></i>עובד בעיקר</span><span><i class="lg-sec"></i>עוזר</span></div>`;
}
function pbBadge(sc) {
  if (sc == null) return `<span class="pb-sc none">?</span>`;
  const c = sc >= 85 ? "hi" : sc >= 70 ? "mid" : "lo";
  return `<span class="pb-sc ${c}">${sc}%</span>`;
}
function pbExSheet(id, dom) {
  const ex = PB_BY[id]; if (!ex) return;
  const G = PB_GROUPS[ex.g], plan = pbState(), r = pbRec(ex, plan.goal, plan.lvl);
  const alts = PB_EX.filter(e => e.g === ex.g && e.id !== ex.id).sort((a, b) => pbScore(b, dom) - pbScore(a, dom)).slice(0, 3);
  sheet(`<div style="max-height:76vh;overflow:auto"><h2>${G.ic} ${esc(ex.n)}</h2>
    <div class="pb-big">${pbFig(ex, "pb-fig big")}</div>
    <p class="small" style="margin:6px 0">${esc(ex.why)}</p>
    <div class="help-sec"><b>🎯 יעילות לפי מיקוד</b>${Object.entries(G.dom).map(([k, v]) => { const sc = pbScore(ex, k); return `<div class="pb-bar-row ${k === dom ? "cur" : ""}"><span>${v}</span><div class="pb-bar"><i style="width:${sc}%"></i></div>${pbBadge(sc)}</div>`; }).join("")}</div>
    <div class="help-sec"><b>🧍 אילו שרירים עובדים</b>${pbBody(ex)}</div>
    <div class="help-sec"><b>✅ איך מבצעים</b>${esc(ex.cue)}<div class="muted small" style="margin-top:6px">❌ טעות נפוצה: ${esc(ex.bad)}</div></div>
    <div class="help-sec"><b>🔢 מומלץ ליעד שלך</b>${r.s} סטים × ${r.r} חזרות · מנוחה ${r.rest}</div>
    ${alts.length ? `<div class="help-sec"><b>🔄 חלופות</b>${alts.map(a => `<div class="pb-alt" data-ex="${a.id}">${pbFig(a, "pb-fig xs")}<span>${esc(a.n)}</span>${pbBadge(pbScore(a, dom))}</div>`).join("")}</div>` : ""}
    </div><div class="row"><button class="btn primary" data-x>סגור</button></div>`,
    (e, close) => { if (e.target.closest("[data-x]")) close(); const a = e.target.closest("[data-ex]"); if (a) { close(); pbExSheet(a.dataset.ex, dom); } });
}
function pbAddSheet(di, gi) {
  const plan = pbState(), day = plan.days[di], gr = day.g[gi], G = PB_GROUPS[gr.k];
  const list = () => PB_EX.filter(e => e.g === gr.k).sort((a, b) => pbScore(b, gr.dom) - pbScore(a, gr.dom));
  const row = (e, other) => `<div class="pb-pick ${gr.ex.some(i => i.id === e.id) ? "had" : ""}" data-add="${e.id}">${pbFig(e, "pb-fig sm")}<div class="pb-pick-t"><b>${esc(e.n)}</b><span class="xs muted">${other ? `שייך ל${PB_GROUPS[e.g].n} · ` : ""}${esc(pbFocusText(e))}</span></div>${pbBadge(pbScore(e, e.g === gr.k ? gr.dom : PB_GROUPS[e.g].def))}</div>`;
  const { bg, close } = sheet(`<h2>➕ תרגיל ל${G.n}</h2><p class="muted xs" style="margin-top:0">מסודר לפי יעילות ל<b>${G.dom[gr.dom]}</b>. אפשר גם לכתוב שם של תרגיל.</p>
    <input id="pbSearch" class="pb-in" placeholder="✍️ כתוב שם תרגיל, למשל: בנץ׳, פולי, סקוואט" autocomplete="off">
    <div id="pbList" style="max-height:52vh;overflow:auto">${list().map(e => row(e)).join("")}</div>
    <div class="row"><button class="btn" data-x>סגור</button></div>`, (e, cl) => {
    if (e.target.closest("[data-x]")) return cl();
    const a = e.target.closest("[data-add]"); if (!a) return;
    const id = a.dataset.add;
    if (id.startsWith("c:")) { gr.ex.push({ id, s: 3, r: "8–12", name: id.slice(2) }); }
    else {
      const ex = PB_BY[id], r = pbRec(ex, plan.goal, plan.lvl);
      let tg = gr;
      if (ex.g !== gr.k) { tg = day.g.find(g => g.k === ex.g); if (!tg) { tg = { k: ex.g, dom: PB_GROUPS[ex.g].def, ex: [] }; day.g.push(tg); } toast(PB_GROUPS[ex.g].ic, `נוסף לקבוצת ${PB_GROUPS[ex.g].n}`); }
      if (tg.ex.some(i => i.id === id)) { toast("ℹ️", "התרגיל כבר בתוכנית"); return; }
      tg.ex.push({ id, s: r.s, r: r.r });
    }
    save(); cl(); renderPlan();
  });
  const inp = bg.querySelector("#pbSearch"), L = bg.querySelector("#pbList");
  inp.oninput = () => {
    const v = inp.value.trim();
    if (!v) { L.innerHTML = list().map(e => row(e)).join(""); return; }
    const res = pbSearch(v);
    L.innerHTML = res.map(e => row(e, e.g !== gr.k)).join("") +
      `<div class="pb-pick custom" data-add="c:${esc(v)}"><div class="pb-fig sm pb-nofig">✍️</div><div class="pb-pick-t"><b>הוסף "${esc(v)}" כתרגיל משלי</b><span class="xs muted">${res.length ? "" : "לא מצאתי במאגר – "}תרגיל משלך לא מקבל דירוג יעילות</span></div></div>`;
  };
  setTimeout(() => inp.focus(), 50);
}
function pbGroupSheet(di) {
  const plan = pbState(), day = plan.days[di], have = new Set(day.g.map(g => g.k));
  sheet(`<h2>➕ איזו קבוצת שרירים?</h2><div class="pb-gpick">${Object.entries(PB_GROUPS).map(([k, G]) => `<button class="chip ${have.has(k) ? "on" : ""}" data-g="${k}" ${have.has(k) ? "disabled" : ""}>${G.ic} ${G.n}</button>`).join("")}</div>
    <div class="row"><button class="btn" data-x>סגור</button></div>`, (e, close) => {
    if (e.target.closest("[data-x]")) return close();
    const b = e.target.closest("[data-g]"); if (!b || b.disabled) return;
    day.g.push({ k: b.dataset.g, dom: PB_GROUPS[b.dataset.g].def, ex: [] }); save(); close(); renderPlan();
    setTimeout(() => pbAddSheet(di, day.g.length - 1), 80);
  });
}
function pbTplSheet() {
  const plan = pbState();
  sheet(`<h2>✨ תבנית מוכנה</h2><p class="muted small">התבנית תחליף את התוכנית הנוכחית. אחר כך אפשר לשנות כל דבר.</p>
    ${Object.entries(PB_TPL).map(([k, t]) => `<button class="pb-tpl" data-t="${k}"><b>${t.n}</b><span>${t.d} · ${t.days.map(d => d[0]).join(" / ")}</span></button>`).join("")}
    <div class="row"><button class="btn" data-x>ביטול</button></div>`, (e, close) => {
    if (e.target.closest("[data-x]")) return close();
    const b = e.target.closest("[data-t]"); if (!b) return;
    const t = PB_TPL[b.dataset.t];
    const tk = b.dataset.t, big = ["chest", "back", "legs"];
    plan.days = t.days.map(([n, gs], i) => ({ n, x: tk === "ppl" && plan.lvl === "adv" && plan.goal === "hyp" ? 2 : (t.x || [])[i] || 1,
      g: gs.map(([k, cnt, dom]) => pbMkGroup(k, cnt + (tk === "fb" && i === 0 && plan.lvl !== "beg" && plan.goal === "hyp" && big.includes(k) ? 1 : 0), dom, plan)) }));
    plan.cur = 0; plan.tpl = b.dataset.t; save(); close(); renderPlan(); toast("✨", "התבנית נטענה – עכשיו אפשר להתאים אותה");
  });
}
function pbText(plan) {
  const lines = [`🏋️ תוכנית אימון – ${PB_GOALS[plan.goal].replace(/^\S+ /, "")} (${PB_LVLS[plan.lvl]})`];
  plan.days.forEach(d => {
    lines.push("", `▪️ ${d.n} – ${d.x || 1} פעמים בשבוע (~${pbDayMinutes(d, plan)} דק׳)`);
    d.g.forEach(g => g.ex.forEach(it => { const ex = PB_BY[it.id]; lines.push(`• ${ex ? ex.n : it.name} – ${it.s}×${it.r}`); }));
  });
  lines.push("", "נבנה באפליקציית מאמן ידע");
  return lines.join("\n");
}
function pbSwaps(gr) {
  const out = {}, used = new Set(gr.ex.map(i => i.id));
  const cand = PB_EX.filter(e => e.g === gr.k && !used.has(e.id)).map(e => [e, pbScore(e, gr.dom)]).sort((a, b) => b[1] - a[1]);
  gr.ex.map((it, ei) => [ei, pbScore(PB_BY[it.id], gr.dom)]).filter(x => x[1] != null).sort((a, b) => a[1] - b[1]).forEach(([ei, sc]) => {
    const c = cand.find(([e, s2]) => !used.has(e.id) && s2 - sc >= 12);
    if (c) { out[ei] = c; used.add(c[0].id); }
  });
  return out;
}
let pbOpenTips = false;
function renderPlan() {
  const plan = pbState(); if (plan.cur >= plan.days.length) plan.cur = 0;
  const day = plan.days[plan.cur], W = pbWeekly(plan), tips = pbPlanTips(plan);
  const groupCard = (gr, gi) => {
    const G = PB_GROUPS[gr.k], swaps = pbSwaps(gr), gt = pbGroupTips(gr, plan, Object.keys(swaps).length > 0);
    return `<div class="card pb-group" data-gi="${gi}">
      <div class="pb-gh"><b>${G.ic} ${G.n}</b><button class="icon-x" data-act="delg" title="הסר קבוצה">✕</button></div>
      <div class="xs muted" style="margin:6px 0 4px">מה יהיה הדומיננטי?</div>
      <div class="seg pb-dom">${Object.entries(G.dom).map(([k, v]) => `<button data-act="dom" data-k="${k}" class="${gr.dom === k ? "on" : ""}">${v}</button>`).join("")}</div>
      ${gr.ex.map((it, ei) => {
        const ex = PB_BY[it.id], sc = pbScore(ex, gr.dom);
        const swap = swaps[ei];
        return `<div class="pb-ex" data-ei="${ei}">
          <div class="pb-ex-top"><div data-act="info" class="pb-thumb">${ex ? pbFig(ex, "pb-fig sm") : `<div class="pb-fig sm pb-nofig">✍️</div>`}</div>
            <div class="pb-ex-t" data-act="info"><b>${esc(ex ? ex.n : it.name)}</b><span class="xs muted">${esc(pbFocusText(ex))}</span></div>
            ${pbBadge(sc)}</div>
          <div class="pb-ctl"><div class="pb-step"><button data-act="s-">−</button><span><b>${it.s}</b> סטים</span><button data-act="s+">+</button></div>
            <select data-act="reps" class="pb-sel">${PB_REPS.concat(PB_REPS.includes(it.r) ? [] : [it.r]).map(r => `<option ${r === it.r ? "selected" : ""}>${r}</option>`).join("")}</select><span class="xs muted">חזרות</span>
            <span class="pb-mv"><button data-act="up" ${ei ? "" : "disabled"}>▲</button><button data-act="del">🗑️</button></span></div>
          ${swap ? `<div class="pb-swap">💡 ל${G.dom[gr.dom]} עדיף <b>${esc(swap[0].n)}</b> (${swap[1]}% מול ${sc}%) <button data-act="swap" data-to="${swap[0].id}">החלף</button></div>` : ""}
        </div>`;
      }).join("")}
      ${gt.map(t => `<div class="pb-tip">💡 ${t.t} ${t.add ? `<button data-act="addbest" data-to="${t.add}">הוסף</button>` : ""}${t.sort ? `<button data-act="sort">סדר אוטומטית</button>` : ""}</div>`).join("")}
      <button class="btn block pb-addex" data-act="add">➕ הוסף תרגיל ל${G.n}</button></div>`;
  };
  app.innerHTML = `<div class="fade-in pb">
    <h1>🏋️ בניית תוכנית אימון</h1>
    <div class="card pb-set">
      <div class="xs muted">המטרה שלי</div><div class="chips" id="pbGoal">${Object.entries(PB_GOALS).map(([k, v]) => `<button class="chip ${plan.goal === k ? "on" : ""}" data-k="${k}">${v}</button>`).join("")}</div>
      <div class="xs muted" style="margin-top:10px">הרמה שלי</div><div class="seg" id="pbLvl">${Object.entries(PB_LVLS).map(([k, v]) => `<button data-k="${k}" class="${plan.lvl === k ? "on" : ""}">${v}</button>`).join("")}</div>
      <div class="row" style="margin-top:10px"><button class="btn" id="pbTpl">✨ תבנית מוכנה</button><button class="btn" id="pbRecAll">🔢 סטים וחזרות לפי היעד</button></div>
    </div>
    <div class="card pb-daycard"><div class="pb-days" id="pbDays">${plan.days.map((d, i) => `<button class="${i === plan.cur ? "on" : ""}" data-d="${i}">${esc(d.n)}</button>`).join("")}<button data-d="new" class="pb-newday">➕ יום</button></div>
    <div class="pb-dayh"><span class="small muted">⏱️ בערך ${pbDayMinutes(day, plan)} דק׳ · ${day.g.reduce((a, g) => a + g.ex.length, 0)} תרגילים · ${day.g.reduce((a, g) => a + g.ex.reduce((b, it) => b + (+it.s || 0), 0), 0)} סטים</span>
      <span class="pb-step pb-freq"><button id="pbXm">−</button><span>🔁 <b>${day.x || 1}</b> בשבוע</span><button id="pbXp">+</button></span>
      <span><button class="link-btn" id="pbRen">✏️ שם</button>${plan.days.length > 1 ? `<button class="link-btn" id="pbDelDay">🗑️ מחק יום</button>` : ""}</span></div></div>
    <div id="pbGroups">${day.g.map(groupCard).join("")}</div>
    <button class="btn primary block" id="pbAddG">➕ הוסף קבוצת שרירים</button>
    <div class="card pb-ana">
      <h2>💡 איך לשפר את התוכנית</h2>
      ${Object.keys(W).length ? `<div class="xs muted">סטים בשבוע לכל קבוצה (הפס הירוק = הטווח המומלץ)</div>${Object.entries(W).map(([k, v]) => { const [lo, hi] = pbTarget(plan, k), val = Math.max(v.sets, v.eff), mx = Math.max(hi * 1.5, val); return `<div class="pb-vol"><span>${PB_GROUPS[k].ic} ${PB_GROUPS[k].n}</span><div class="pb-volbar"><i class="rng" style="right:${lo / mx * 100}%;width:${(hi - lo) / mx * 100}%"></i><i class="val ${v.eff < lo ? "lo" : v.sets > hi ? "hi" : "ok"}" style="width:${val / mx * 100}%"></i></div><b title="סטים ישירים${v.ind ? " + עקיפים" : ""}">${v.sets}${v.ind ? `<small>+${Math.round(v.ind)}</small>` : ""}</b></div>`; }).join("")}<p class="xs muted">לפי מספר הפעמים שכל אימון חוזר בשבוע (🔁). המספר הקטן = עבודה עקיפה מתרגילים מורכבים (חצי סט).</p>` : ""}
      ${(pbOpenTips ? tips : tips.slice(0, 4)).map(t => `<div class="pb-tip"><span>${t.i}</span> ${t.t}</div>`).join("")}
      ${tips.length > 4 ? `<button class="link-btn" id="pbMoreTips">${pbOpenTips ? "פחות" : `עוד ${tips.length - 4} המלצות`}</button>` : ""}
      ${!tips.length ? `<div class="pb-tip ok">✅ התוכנית מאוזנת – כל הכבוד!</div>` : ""}
      <h3 style="margin:14px 0 6px">🧠 רעיונות כלליים</h3>
      ${PB_IDEAS.slice(0, 3).concat(PB_IDEAS.slice(3).sort(() => Math.random() - .5).slice(0, 1)).map(t => `<div class="pb-idea">${t}</div>`).join("")}
    </div>
    <div class="row" style="margin-bottom:16px"><button class="btn" id="pbCopy">📋 העתק תוכנית</button><button class="btn danger" id="pbReset">🗑️ התחל מחדש</button></div>
  </div>`;
  $("#pbGoal").onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; plan.goal = b.dataset.k; save(); renderPlan(); };
  $("#pbLvl").onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; plan.lvl = b.dataset.k; save(); renderPlan(); };
  $("#pbTpl").onclick = pbTplSheet;
  $("#pbRecAll").onclick = () => { plan.days.forEach(d => d.g.forEach(g => g.ex.forEach(it => { const r = pbRec(PB_BY[it.id], plan.goal, plan.lvl); it.s = r.s; it.r = r.r; }))); save(); renderPlan(); toast("🔢", `עודכן לפי ${PB_GOALS[plan.goal]}`); };
  $("#pbDays").onclick = e => {
    const b = e.target.closest("[data-d]"); if (!b) return;
    if (b.dataset.d === "new") { plan.days.push({ n: `אימון ${String.fromCharCode(65 + plan.days.length)}`, g: [] }); plan.cur = plan.days.length - 1; }
    else plan.cur = +b.dataset.d;
    save(); renderPlan();
  };
  $("#pbXm").onclick = () => { day.x = Math.max(1, (day.x || 1) - 1); save(); renderPlan(); };
  $("#pbXp").onclick = () => { day.x = Math.min(3, (day.x || 1) + 1); save(); renderPlan(); };
  $("#pbRen").onclick = () => { const n = prompt("שם האימון:", day.n); if (n && n.trim()) { day.n = n.trim().slice(0, 20); save(); renderPlan(); } };
  const dd = $("#pbDelDay"); if (dd) dd.onclick = async () => { if (await modal("למחוק את " + day.n + "?", "כל התרגילים ביום הזה יימחקו.", "מחק", "ביטול", true)) { plan.days.splice(plan.cur, 1); plan.cur = 0; save(); renderPlan(); } };
  $("#pbAddG").onclick = () => pbGroupSheet(plan.cur);
  const mt = $("#pbMoreTips"); if (mt) mt.onclick = () => { pbOpenTips = !pbOpenTips; renderPlan(); };
  $("#pbCopy").onclick = async () => { const t = pbText(plan); try { if (navigator.share) await navigator.share({ text: t }); else { await navigator.clipboard.writeText(t); toast("📋", "התוכנית הועתקה"); } } catch (e) { try { await navigator.clipboard.writeText(t); toast("📋", "התוכנית הועתקה"); } catch (e2) { } } };
  $("#pbReset").onclick = async () => { if (await modal("להתחיל מחדש?", "כל התוכנית תימחק.", "מחק", "ביטול", true)) { delete S.plan; save(); renderPlan(); } };
  $("#pbGroups").onclick = e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const gi = +b.closest("[data-gi]").dataset.gi, gr = day.g[gi], exEl = b.closest("[data-ei]"), ei = exEl ? +exEl.dataset.ei : -1, it = gr.ex[ei];
    switch (b.dataset.act) {
      case "delg": day.g.splice(gi, 1); break;
      case "dom": gr.dom = b.dataset.k; break;
      case "add": return pbAddSheet(plan.cur, gi);
      case "info": if (PB_BY[it.id]) pbExSheet(it.id, gr.dom); return;
      case "s-": it.s = Math.max(1, it.s - 1); break;
      case "s+": it.s = Math.min(8, it.s + 1); break;
      case "del": gr.ex.splice(ei, 1); break;
      case "up": [gr.ex[ei - 1], gr.ex[ei]] = [gr.ex[ei], gr.ex[ei - 1]]; break;
      case "swap": { const r = pbRec(PB_BY[b.dataset.to], plan.goal, plan.lvl); gr.ex[ei] = { id: b.dataset.to, s: it.s, r: PB_BY[b.dataset.to].t === PB_BY[it.id].t ? it.r : r.r }; toast("🔄", "התרגיל הוחלף"); break; }
      case "addbest": { const r = pbRec(PB_BY[b.dataset.to], plan.goal, plan.lvl); gr.ex.push({ id: b.dataset.to, s: r.s, r: r.r }); break; }
      case "sort": gr.ex.sort((a, c) => ((PB_BY[a.id] || {}).t === "c" ? 0 : 1) - ((PB_BY[c.id] || {}).t === "c" ? 0 : 1)); break;
      default: return;
    }
    save(); renderPlan();
  };
  $("#pbGroups").onchange = e => {
    const sel = e.target.closest("[data-act=reps]"); if (!sel) return;
    const gi = +sel.closest("[data-gi]").dataset.gi, ei = +sel.closest("[data-ei]").dataset.ei;
    day.g[gi].ex[ei].r = sel.value; save();
  };
}
