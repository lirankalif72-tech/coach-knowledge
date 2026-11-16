/* ═════════════ איורים להמחשה בתוך העזרה (v8.4) ═════════════
   כל איור הוא SVG שמצויר בקוד – עובד גם בלי אינטרנט ומתאים לערכת הצבעים (כהה/בהיר).
   איור מוצג רק אם הוא קשור לשאלה, ולא מוצג אם הטקסט שבו מגלה את התשובה. */

const VZ_T = (x, y, s, c = "", sz = 11) => `<text x="${x}" y="${y}" class="${c}" font-size="${sz}" text-anchor="middle"${/[\u0590-\u05FF]/.test(String(s)) ? "" : ' direction="ltr"'}>${s}</text>`;
const VZ_ARW = `<defs><linearGradient id="vzG"><stop offset="0" stop-color="#f87171"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#60a5fa"/></linearGradient><marker id="vzA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="vz-fill"/></marker></defs>`;
const vzSvg = (inner, h = 170) => `<svg viewBox="0 0 320 ${h}" class="vz">${VZ_ARW}${inner}</svg>`;

/* קפיץ – משמש למחזור מתיחה־קיצור */
function vzSpring(x, top, len, coils, cls) {
  let d = `M${x} ${top}`; const st = len / (coils * 2);
  for (let i = 0; i < coils * 2; i++) d += ` L${x + (i % 2 ? -12 : 12)} ${top + st * (i + 0.5)}`;
  return `<path d="${d} L${x} ${top + len}" class="${cls}" fill="none" stroke-width="2.5"/>`;
}
/* זרוע (כתף-מרפק-כף יד) עם משקולת – לסוגי כיווץ */
function vzArm(cx, ang, label, arrow, sub) {
  const sx = cx - 18, sy = 40, ex = cx - 18, ey = 100, r = ang * Math.PI / 180, wx = ex + 52 * Math.sin(r), wy = ey - 52 * Math.cos(r);
  const ar = arrow === "up" ? `<path d="M${wx + 16} ${wy + 14} L${wx + 16} ${wy - 12}" class="vz-ar" marker-end="url(#vzA)"/>` :
    arrow === "down" ? `<path d="M${wx + 16} ${wy - 12} L${wx + 16} ${wy + 14}" class="vz-ar" marker-end="url(#vzA)"/>` :
      `<path d="M${wx + 10} ${wy - 6} h12 M${wx + 10} ${wy + 6} h12" class="vz-ar"/>`;
  return `<path d="M${sx} ${sy} L${ex} ${ey} L${wx} ${wy}" class="vz-limb"/><ellipse cx="${sx - 6}" cy="${(sy + ey) / 2}" rx="7" ry="${arrow === "up" ? 16 : arrow === "down" ? 24 : 19}" class="vz-mus"/>
    <rect x="${wx - 9}" y="${wy - 6}" width="18" height="12" rx="3" class="vz-w"/>${ar}${VZ_T(cx, 146, label, "vz-b", 12)}${VZ_T(cx, 162, sub, "vz-m", 10)}`;
}
/* דמות מקלות (SVG) מתוך ההדגמות של extra.js */
function vzFig(p, ox, sc) {
  const P = a => `${ox + a[0] * sc} ${a[1] * sc}`, L = (a, b) => `M${P(a)} L${P(b)}`;
  let d = `M${P(p.s)} Q${P(p.m)} ${P(p.p)} ` + L(p.p, p.k) + L(p.k, p.a) + L(p.a, p.t) + L(p.s, p.e) + L(p.e, p.w);
  if (p.k2) d += L(p.p, p.k2) + L(p.k2, p.a2);
  return `<path d="${d}" class="vz-limb" fill="none"/><circle cx="${ox + p.h[0] * sc}" cy="${p.h[1] * sc}" r="${7 * sc}" class="vz-fill"/>` +
    (p.bar ? `<circle cx="${ox + p.w[0] * sc}" cy="${p.w[1] * sc}" r="${9 * sc}" class="vz-w" fill="none"/>` : "") +
    `<path d="M${ox + 4 * sc} ${112 * sc} H${ox + 116 * sc}" class="vz-gl"/>`;
}

const VISUALS = [
  { id: "ssc", re: /מתיחה.?קיצור|stretch.?shortening|SSC|פליומטרי|קפיצ/i, cap: "מחזור מתיחה־קיצור: השריר נמתח כמו קפיץ, ומיד משחרר את האנרגיה",
    svg: () => vzSvg(`${vzSpring(55, 30, 70, 5, "vz-s1")}${vzSpring(160, 50, 50, 5, "vz-s2")}${vzSpring(265, 20, 85, 5, "vz-s3")}
      <path d="M95 70 H125" class="vz-ar" marker-end="url(#vzA)"/><path d="M200 70 H230" class="vz-ar" marker-end="url(#vzA)"/>
      ${VZ_T(55, 128, "1. נמתח", "vz-b", 12)}${VZ_T(55, 144, "שלב אקסצנטרי", "vz-m", 10)}${VZ_T(55, 158, "אוגר אנרגיה", "vz-m", 10)}
      ${VZ_T(160, 128, "2. מעבר קצר", "vz-b", 12)}${VZ_T(160, 144, "אמורטיזציה", "vz-m", 10)}${VZ_T(160, 158, "כמה שיותר מהר", "vz-m", 10)}
      ${VZ_T(265, 128, "3. משתחרר", "vz-b", 12)}${VZ_T(265, 144, "שלב קונצנטרי", "vz-m", 10)}${VZ_T(265, 158, "כוח מוגבר", "vz-m", 10)}`) },
  { id: "contr", re: /קונצנטרי|אקסצנטרי|איזומטרי|סוגי כיווץ|כיווץ (ה)?שריר/, cap: "שלושה סוגי כיווץ – מה קורה לאורך השריר",
    svg: () => vzSvg(vzArm(60, 35, "קונצנטרי", "up", "השריר מתקצר") + vzArm(165, 115, "אקסצנטרי", "down", "מתארך תחת עומס") + vzArm(270, 90, "איזומטרי", "hold", "האורך לא משתנה")) },
  { id: "energy", re: /ATP|קריאטין|פוספגן|גליקוליט|אנאירובי|אירובי|מערכות? (ה)?אנרגיה|חומצת חלב|לקטט|חמצוני/i, cap: "איזו מערכת אנרגיה מובילה – לפי משך המאמץ",
    svg: () => vzSvg(`<path d="M30 20 V135 H305" class="vz-ax"/>
      <path d="M32 30 C55 30 70 120 110 130" class="vz-c1" fill="none"/><path d="M32 120 C70 40 120 35 160 70 S230 128 300 130" class="vz-c2" fill="none"/><path d="M32 132 C120 125 170 50 300 32" class="vz-c3" fill="none"/>
      ${VZ_T(75, 52, "ATP-CP", "vz-t1", 11)}${VZ_T(140, 34, "גליקוליטית", "vz-t2", 11)}${VZ_T(262, 26, "אירובית", "vz-t3", 11)}
      ${VZ_T(60, 150, "כ־10 שניות", "vz-m", 10)}${VZ_T(150, 150, "דקה–שתיים", "vz-m", 10)}${VZ_T(270, 150, "דקות ארוכות", "vz-m", 10)}
      ${VZ_T(168, 166, "משך המאמץ →", "vz-m", 10)}<text x="18" y="80" class="vz-m" font-size="10" text-anchor="middle" transform="rotate(-90 18 80)">חלק באספקה</text>`, 172) },
  { id: "planes", re: /מישור|סגיטלי|פרונטלי|רוחבי|טרנסברס|הרחקה|קירוב|סיבוב (פנימי|חיצוני)/, cap: "מישורי התנועה – ואיזו תנועה קורית בכל אחד",
    svg: () => {
      const fig = (x) => `<circle cx="${x}" cy="30" r="9" class="vz-fill"/><path d="M${x} 40 V85 M${x} 85 L${x - 10} 120 M${x} 85 L${x + 10} 120 M${x} 50 L${x - 16} 72 M${x} 50 L${x + 16} 72" class="vz-limb"/>`;
      return vzSvg(`${fig(55)}<path d="M80 60 A30 30 0 0 0 80 100" class="vz-ar" fill="none" marker-end="url(#vzA)"/><path d="M78 40 V118" class="vz-pl1"/>
        ${fig(160)}<path d="M130 52 Q160 28 190 52" class="vz-ar" fill="none" marker-end="url(#vzA)"/><path d="M128 78 H192" class="vz-pl2"/>
        ${fig(265)}<ellipse cx="265" cy="62" rx="32" ry="9" class="vz-ar" fill="none"/><path d="M297 62 l-3 -6 m3 6 l-6 2" class="vz-ar"/>
        ${VZ_T(55, 140, "סגיטלי", "vz-b", 12)}${VZ_T(55, 156, "כפיפה ופשיטה", "vz-m", 10)}
        ${VZ_T(160, 140, "פרונטלי", "vz-b", 12)}${VZ_T(160, 156, "הרחקה וקירוב", "vz-m", 10)}
        ${VZ_T(265, 140, "רוחבי", "vz-b", 12)}${VZ_T(265, 156, "סיבובים", "vz-m", 10)}`);
    } },
  { id: "levers", re: /מנוף|זרוע (ה)?כוח|זרוע (ה)?התנגדות|נקודת משען/, cap: "שלושה סוגי מנופים – לפי מה נמצא באמצע",
    svg: () => {
      const lv = (x, order, name, ex) => {
        const pos = { F: 0, R: 0, A: 0 }, xs = [x - 40, x, x + 40]; order.split("").forEach((k, i) => pos[k] = xs[i]);
        return `<path d="M${x - 46} 70 H${x + 46}" class="vz-limb"/><path d="M${pos.A - 9} 92 L${pos.A} 72 L${pos.A + 9} 92 Z" class="vz-fill"/>
          <path d="M${pos.F} 30 V64" class="vz-ar" marker-end="url(#vzA)"/><rect x="${pos.R - 8}" y="52" width="16" height="16" rx="3" class="vz-w"/>
          ${VZ_T(pos.F, 24, "כוח", "vz-t2", 10)}${VZ_T(pos.R, 46, "עומס", "vz-t1", 10)}${VZ_T(pos.A, 106, "משען", "vz-m", 10)}
          ${VZ_T(x, 136, name, "vz-b", 12)}${VZ_T(x, 154, ex, "vz-m", 10)}`;
      };
      return vzSvg(lv(55, "FAR", "סוג 1", "משען באמצע") + lv(160, "ARF", "סוג 2", "עומס באמצע") + lv(265, "AFR", "סוג 3", "כוח באמצע – הנפוץ בגוף"));
    } },
  { id: "supercomp", re: /פיצוי.?יתר|סופר.?קומפנסציה|התאוששות|אימון יתר|מנוחה בין אימונים/, cap: "פיצוי־יתר: אחרי אימון יורדים, מתאוששים – ועולים מעל נקודת ההתחלה",
    svg: () => vzSvg(`<path d="M20 80 H305" class="vz-gl" stroke-dasharray="4 4"/><path d="M20 80 H60 C80 80 85 125 110 125 S150 80 170 55 S220 45 240 62 S280 80 305 80" class="vz-c2" fill="none"/>
      <path d="M60 30 V140" class="vz-gl"/>${VZ_T(60, 24, "אימון", "vz-b", 11)}${VZ_T(110, 146, "עייפות", "vz-t1", 11)}${VZ_T(140, 108, "התאוששות", "vz-m", 10)}
      ${VZ_T(200, 38, "פיצוי־יתר ✨", "vz-t3", 11)}${VZ_T(275, 100, "בלי אימון חוזר –", "vz-m", 10)}${VZ_T(275, 113, "חוזרים לבסיס", "vz-m", 10)}${VZ_T(40, 74, "בסיס", "vz-m", 10)}
      ${VZ_T(160, 165, "הזמן הנכון לאימון הבא: בשיא", "vz-m", 10)}`, 172) },
  { id: "period", re: /מחזור(י)?[ -]?(מאקרו|מקרו|מזו|מיקרו)|מאקרו|מזו.?ציקל|מיקרו.?ציקל|פריודיזציה|תקופתיות|תכנון עונתי/, cap: "תכנון לטווח ארוך: מחזורים בתוך מחזורים",
    svg: () => vzSvg(`<rect x="20" y="20" width="280" height="28" rx="8" class="vz-b1"/>${VZ_T(160, 39, "מאקרו – עונה / שנה", "vz-b", 12)}
      ${[0, 1, 2, 3].map(i => `<rect x="${20 + i * 71}" y="58" width="67" height="26" rx="7" class="vz-b2"/>${VZ_T(53 + i * 71, 75, "מזו", "vz-b", 11)}`).join("")}
      ${[0, 1, 2, 3].map(i => `<rect x="${20 + i * 17}" y="94" width="14" height="22" rx="4" class="vz-b3"/>`).join("")}${VZ_T(55, 132, "מיקרו = שבוע", "vz-m", 10)}
      ${VZ_T(200, 108, "מזו = כמה שבועות", "vz-m", 10)}${VZ_T(200, 122, "עם מטרה אחת", "vz-m", 10)}`, 140) },
  { id: "hr", re: /דופק|אזור(י)? אימון|220|קרבונן|VO2|סף (ה)?(אנאירובי|לקטט)/i, cap: "אזורי דופק – באחוזים מהדופק המרבי (בערך 220 פחות הגיל)",
    svg: () => vzSvg(`${[["50–60%", "קל מאוד", "vz-z1"], ["60–70%", "שריפת שומן/בסיס", "vz-z2"], ["70–80%", "אירובי", "vz-z3"], ["80–90%", "סף", "vz-z4"], ["90–100%", "מרבי", "vz-z5"]]
      .map(([p, n, c], i) => `<rect x="${20 + i * 57}" y="${110 - i * 18}" width="53" height="${20 + i * 18}" rx="6" class="${c}"/>${VZ_T(46 + i * 57, 146, p, "vz-b", 10)}${VZ_T(46 + i * 57, 160, n, "vz-m", 9)}`).join("")}
      ${VZ_T(160, 22, "↑ עצימות", "vz-m", 10)}`) },
  { id: "fibers", re: /סיבי(ם)? (שריר|איטי|מהיר)|סיבים (איטיים|מהירים)|סוג I|סוג II|Type I|Type II/i, cap: "סיבי שריר: איטיים מול מהירים",
    svg: () => vzSvg(`<rect x="15" y="15" width="140" height="140" rx="12" class="vz-b1"/><rect x="165" y="15" width="140" height="140" rx="12" class="vz-b2"/>
      ${VZ_T(85, 38, "🐢 איטיים (סוג I)", "vz-b", 12)}${VZ_T(235, 38, "🐇 מהירים (סוג II)", "vz-b", 12)}
      ${["אדומים – הרבה מיטוכונדריה", "כוח נמוך", "עמידים לעייפות", "מרתון, יציבה"].map((t, i) => VZ_T(85, 64 + i * 22, t, "vz-m", 10)).join("")}
      ${["לבנים – פחות דם", "כוח ומהירות גבוהים", "מתעייפים מהר", "ספרינט, הרמות"].map((t, i) => VZ_T(235, 64 + i * 22, t, "vz-m", 10)).join("")}`) },
  { id: "sarc", re: /אקטין|מיוזין|סרקומר|גשרי(ם)? (צולבים|רוחב)|החלקת (ה)?סיבים/, cap: "החלקת הסיבים: המיוזין מושך את האקטין, והסרקומר מתקצר",
    svg: () => {
      const s = (y, gap, lab) => `<path d="M20 ${y - 22} V${y + 22} M300 ${y - 22} V${y + 22}" class="vz-limb"/>
        ${[-14, 0, 14].map(o => `<path d="M20 ${y + o} H${160 - gap}" class="vz-c1" stroke-width="3"/><path d="M300 ${y + o} H${160 + gap}" class="vz-c1" stroke-width="3"/>`).join("")}
        ${[-7, 7].map(o => `<path d="M${105 - (gap < 30 ? 15 : 0)} ${y + o} H${215 + (gap < 30 ? 15 : 0)}" class="vz-c3" stroke-width="5"/>`).join("")}${VZ_T(160, y + 38, lab, "vz-b", 11)}`;
      return vzSvg(s(35, 45, "רפוי") + s(110, 8, "מכווץ – הקווים מתקרבים") + `${VZ_T(60, 160, "אקטין (דק)", "vz-t1", 10)}${VZ_T(260, 160, "מיוזין (עבה)", "vz-t3", 10)}`, 168);
    } },
  { id: "arousal", re: /עוררות|U הפוך|יו הפוך|חרדת ביצוע|ירקס|דודסון/, cap: "U הפוך: ביצוע מיטבי ברמת עוררות בינונית",
    svg: () => vzSvg(`<path d="M30 20 V135 H305" class="vz-ax"/><path d="M35 128 Q165 -40 300 128" class="vz-c2" fill="none"/>
      ${VZ_T(70, 120, "משעמם", "vz-m", 10)}${VZ_T(167, 32, "אזור מיטבי", "vz-t3", 11)}${VZ_T(270, 120, "לחוץ מדי", "vz-m", 10)}
      ${VZ_T(168, 152, "רמת עוררות →", "vz-m", 10)}<text x="18" y="80" class="vz-m" font-size="10" text-anchor="middle" transform="rotate(-90 18 80)">ביצוע</text>`, 160) },
  { id: "spine", re: /לורדוז|קיפוז|סקוליוז|עקמת|גבנת|עמוד (ה)?שדרה|יציבת (ה)?גוף|יציבה לקויה|חוליות/, cap: "עמוד השדרה מהצד – שלוש קשתות טבעיות",
    svg: () => vzSvg(`<path d="M150 15 C135 35 135 45 150 60 C175 85 175 110 150 130 C135 142 140 150 150 160" class="vz-sp" fill="none"/>
      ${VZ_T(95, 40, "צווארי", "vz-b", 11)}${VZ_T(95, 54, "לורדוזיס", "vz-m", 10)}${VZ_T(230, 95, "חזי", "vz-b", 11)}${VZ_T(230, 109, "קיפוזיס", "vz-m", 10)}
      ${VZ_T(95, 140, "מותני", "vz-b", 11)}${VZ_T(95, 154, "לורדוזיס", "vz-m", 10)}${VZ_T(262, 30, "בעיה = הקשת", "vz-m", 9)}${VZ_T(262, 42, "מוגזמת או חסרה", "vz-m", 9)}`) },
  { id: "macros", re: /קלורי|קק״ל|קק"ל|פחמימ|חלבו|שומנ|אבות (ה)?מזון|מאקרו.?נוטר/, cap: "כמה אנרגיה בכל גרם",
    svg: () => vzSvg(`${[["פחמימה", 4, "vz-z2"], ["חלבון", 4, "vz-z3"], ["שומן", 9, "vz-z5"], ["אלכוהול", 7, "vz-z4"]].map(([n, k, c], i) =>
      `<rect x="${30 + i * 72}" y="${130 - k * 12}" width="52" height="${k * 12}" rx="6" class="${c}"/>${VZ_T(56 + i * 72, 124 - k * 12, k + " קק״ל", "vz-b", 11)}${VZ_T(56 + i * 72, 148, n, "vz-m", 11)}`).join("")}`, 160) },
  { id: "reps", re: /טווח (ה)?חזרות|מספר חזרות|היפרטרופיה|סיבולת שריר|כוח מרבי|1RM|RM/i, cap: "רצף החזרות: מה כל טווח מפתח בעיקר",
    svg: () => vzSvg(`<rect x="20" y="40" width="280" height="22" rx="11" class="vz-grad"/>
      ${[["1–5", "כוח מרבי", 55], ["6–12", "היפרטרופיה", 160], ["15+", "סיבולת שריר", 265]].map(([r, n, x]) => `${VZ_T(x, 88, r, "vz-b", 13)}${VZ_T(x, 103, "חזרות", "vz-m", 10)}${VZ_T(x, 118, n, "vz-b", 11)}`).join("")}
      ${VZ_T(55, 30, "משקל כבד", "vz-m", 10)}${VZ_T(265, 30, "משקל קל", "vz-m", 10)}${VZ_T(160, 136, "הטווחים חופפים – זה רצף, לא קירות", "vz-m", 10)}`, 142) },
  { id: "rpe", re: /RPE|בורג|Borg|מאמץ נתפס|RIR|חזרות ברזרבה/i, cap: "סולם מאמץ נתפס (RPE 1–10)",
    svg: () => vzSvg(`${Array.from({ length: 10 }, (_, i) => `<rect x="${18 + i * 29}" y="${100 - i * 7}" width="25" height="${20 + i * 7}" rx="4" class="vz-z${1 + Math.floor(i / 2)}"/>${VZ_T(30 + i * 29, 136, i + 1, "vz-b", 11)}`).join("")}
      ${VZ_T(45, 156, "קל מאוד", "vz-m", 10)}${VZ_T(160, 156, "בדרגה 8 נשארו עוד כ־2 חזרות", "vz-m", 10)}${VZ_T(290, 156, "מרבי", "vz-m", 10)}`) },
  { id: "bmi", re: /BMI|מדד מסת (ה)?גוף/i, cap: "BMI = משקל (ק״ג) ÷ גובה² (מטר)",
    svg: () => vzSvg(`${[["<18.5", "תת־משקל", "vz-z2"], ["18.5–24.9", "תקין", "vz-z3"], ["25–29.9", "עודף", "vz-z4"], ["30+", "השמנה", "vz-z5"]].map(([r, n, c], i) =>
      `<rect x="${20 + i * 71}" y="40" width="67" height="30" rx="8" class="${c}"/>${VZ_T(53 + i * 71, 92, r, "vz-b", 11)}${VZ_T(53 + i * 71, 108, n, "vz-m", 10)}`).join("")}
      ${VZ_T(160, 134, "לא מבדיל בין שריר לשומן!", "vz-t1", 11)}`, 145) }
];

/* תרגילים – דמות בביצוע נכון */
const VZ_EX = [["סקוואט", 0], ["כריעה", 0], ["דדליפט", 1], ["הרמת מתים", 1], ["שכיבת סמיכה", 2], ["שכיבות סמיכה", 2], ["לאנג׳", 3], ["מכרע", 3], ["לחיצת כתפיים", 4]];

const VZ_GENERIC = ["מתח", "פולי", "שוק", "סקוואט", "ליבה", "בטן"];
/* איסוף איורים לשאלה */
function vzLeak(right, txt) {
  if (!right) return false;
  const tk = s => String(s).replace(/<[^>]+>/g, " ").replace(/[^֐-׿a-zA-Z0-9.]/g, " ").split(/\s+/).filter(w => w && !STOP.has(w)).map(w => w.replace(/^[והבלמש](?=[֐-׿]{3})/, ""));
  const N = x => String(x).replace(/<[^>]+>/g, " ").replace(/[^\u0590-\u05FFa-zA-Z0-9]/g, "");
  if (N(right).length >= 3 && N(txt).includes(N(right))) return true;
  const R = tk(right), T = new Set(tk(txt));
  if (!R.length || R.length > 4) return false;
  return R.every(w => T.has(w));
}
function visualsFor(q) {
  if (typeof q !== "object" || !q) return [];
  const right = q.t === "mc" ? q.o[q.a] : "", text = q.q, out = [];
  // 1. שריר במפת הגוף
  if (typeof MUSCLES !== "undefined") {
    for (const [key, m] of Object.entries(MUSCLES)) {
      if (!m.k.some(k => k.length > 2 && !VZ_GENERIC.includes(k) && new RegExp(`(^|[\\s"'(־])[והבלמש]?${k}`).test(text))) continue;
      if (right && (m.k.some(k => right.includes(k)) || right.includes(m.n.split(" ")[0]))) continue;
      const back = BODY_BACK.includes(`"${key}"`) && !BODY_FRONT.includes(`"${key}"`);
      const g = (back ? BODY_BACK : BODY_FRONT).replace(new RegExp(`data-m="${key}"`, "g"), `data-m="${key}" class="on"`);
      const cap = `${m.n} – ${m.act}`;
      if (vzLeak(right, cap)) continue;
      out.push({ cap, html: `<svg viewBox="0 0 200 392" class="bodymap vz-body">${BODY_BASE}<g class="mus">${g}</g></svg>` });
      break;
    }
  }
  // 2. תרגיל – דמות בביצוע נכון
  if (typeof DEMOS !== "undefined" && out.length < 2) {
    const hit = VZ_EX.find(([n]) => text.includes(n));
    if (hit) {
      const d = DEMOS[hit[1]];
      if (!vzLeak(right, d.cue)) out.push({ cap: `${d.n} – ביצוע נכון: ${d.cue}`, html: `<svg viewBox="0 0 320 130" class="vz">${vzFig(d.A, 30, 1.1)}${vzFig(d.B, 170, 1.1)}<path d="M150 60 h20" class="vz-ar" marker-end="url(#vzA2)"/><defs><marker id="vzA2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="vz-fill"/></marker></defs></svg>` });
    }
  }
  // 3. איורי מושגים
  for (const v of VISUALS) {
    if (out.length >= 2) break;
    if (!v.re.test(text)) continue;
    const html = v.svg();
    if (vzLeak(right, html + " " + v.cap)) continue;
    out.push({ cap: v.cap, html });
  }
  return out;
}
function visualsHtml(q) {
  const vs = visualsFor(q);
  return vs.length ? `<div class="help-sec vz-sec"><b>🖼️ להמחשה</b>${vs.map(v => `<figure class="vz-fig">${v.html}<figcaption>${esc(v.cap)}</figcaption></figure>`).join("")}</div>` : "";
}

/* חיבור לעזרה – האיור מופיע ראשון, לפני ההסברים */
const _helpForV = helpFor;
helpFor = function (q) { return visualsHtml(q) + _helpForV(q); };
