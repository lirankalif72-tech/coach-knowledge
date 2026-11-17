/* ═════════════ אנימציות תנועה (v8.9.9) ═════════════
   איורים מונפשים (SVG) למונחי תנועה: סופינציה/פרונציה, כפיפה/פשיטה, הרחקה/קירוב,
   כפיפה גבית/כפית, סיבוב פנימי/חיצוני, תנועות שכמה, היפ־הינג׳, ולגוס ועוד.
   מוצגים בעזרה לשאלה (💡), בחלון המונח (📖) ובשיעור. עובד בלי אינטרנט. */

const AN_EN = () => typeof isEn === "function" && isEn();
const AL = (he, en) => AN_EN() ? en : he;
const AN_DUR = 4.2;
const AN_KT = "0;.1;.4;.6;.9;1", AN_KS = "0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1";
/* תנועה בין מצב A למצב B ובחזרה */
const anRot = (a, b, cx, cy) => `<animateTransform attributeName="transform" type="rotate" values="${a} ${cx} ${cy};${a} ${cx} ${cy};${b} ${cx} ${cy};${b} ${cx} ${cy};${a} ${cx} ${cy};${a} ${cx} ${cy}" keyTimes="${AN_KT}" calcMode="spline" keySplines="${AN_KS}" dur="${AN_DUR}s" repeatCount="indefinite"/>`;
const anMove = (a, b) => `<animateTransform attributeName="transform" type="translate" values="${a};${a};${b};${b};${a};${a}" keyTimes="${AN_KT}" calcMode="spline" keySplines="${AN_KS}" dur="${AN_DUR}s" repeatCount="indefinite"/>`;
const anAttr = (attr, a, b) => `<animate attributeName="${attr}" values="${a};${a};${b};${b};${a};${a}" keyTimes="${AN_KT}" calcMode="spline" keySplines="${AN_KS}" dur="${AN_DUR}s" repeatCount="indefinite"/>`;
/* שתי כותרות שמתחלפות לפי המצב */
const anTxt = (s, y, cls, sz, show) => `<text x="160" y="${y}" class="${cls}" font-size="${sz}" text-anchor="middle"${/[֐-׿]/.test(s) ? "" : ' direction="ltr"'} opacity="${show ? 1 : 0}">${s}<animate attributeName="opacity" values="${show ? "1;1;0;0;1;1" : "0;0;1;1;0;0"}" keyTimes="0;.25;.27;.73;.75;1" dur="${AN_DUR}s" repeatCount="indefinite"/></text>`;
const anLabels = (a, b, a2 = "", b2 = "", y = 150) => anTxt(a, y, "vz-b", 13, 1) + anTxt(b, y, "vz-b", 13, 0) + (a2 ? anTxt(a2, y + 15, "vz-m", 10.5, 1) : "") + (b2 ? anTxt(b2, y + 15, "vz-m", 10.5, 0) : "");
const anSvg = (inner, h = 172) => `<svg viewBox="0 0 320 ${h}" class="vz vz-anim">${VZ_ARW}${inner}</svg>`;
/* דמות מלפנים (ראש, גו, רגליים) */
const anFront = (arms = true, legs = true) => `<circle cx="160" cy="20" r="10" class="vz-fill"/><path d="M160 31 V95 M146 40 H174" class="vz-limb"/>` +
  (arms ? `<path d="M146 40 V88 M174 40 V88" class="vz-limb"/>` : "") + (legs ? `<path d="M160 95 L150 140 M160 95 L170 140" class="vz-limb"/>` : "");

const ANIMS = [
  { id: "a_sup", re: /סופינצי|פרונצי|supinat|pronat/i,
    cap: () => AL("סופינציה ופרונציה – סיבוב האמה. טיפ לזכירה: סופינציה = מחזיקים קערת מרק (Soup)", "Supination and pronation – rotating the forearm. Memory tip: supination = holding a bowl of soup"),
    svg: () => anSvg(`<path d="M110 22 V90 H205" class="vz-limb"/>
      <ellipse cx="232" cy="90" rx="28" ry="12" stroke-width="2"><animate attributeName="ry" values="12;12;2;12;12;2;12;12" keyTimes="0;.1;.25;.4;.6;.75;.9;1" dur="${AN_DUR}s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#34d399;#94a3b8;#34d399" keyTimes="0;.25;.75" calcMode="discrete" dur="${AN_DUR}s" repeatCount="indefinite"/></ellipse>
      <text x="232" y="70" font-size="20" text-anchor="middle">🥣<animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes="0;.2;.22;.78;.8;1" dur="${AN_DUR}s" repeatCount="indefinite"/></text>
      <path d="M180 70 A22 22 0 0 1 180 112" class="vz-ar" marker-end="url(#vzA)"/>
      ${VZ_T(110, 16, AL("כתף", "shoulder"), "vz-m", 10)}${VZ_T(122, 104, AL("מרפק", "elbow"), "vz-m", 10)}
      ${anLabels(AL("סופינציה – כף היד פונה למעלה", "Supination – palm faces up"), AL("פרונציה – כף היד פונה למטה", "Pronation – palm faces down"), AL("(בירוק: כף היד)", "(green: the palm)"), AL("(באפור: גב היד)", "(grey: back of the hand)"), 140)}`, 172) },
  { id: "a_elbow", re: /כפיפת (ה)?מרפק|פשיטת (ה)?מרפק|כפיפות מרפקים|elbow (flexion|extension)|bends? the elbow|straightens? the elbow|curl/i,
    cap: () => AL("כפיפה = הזווית במפרק קטנה. פשיטה = הזווית גדלה (יישור)", "Flexion = the joint angle gets smaller. Extension = the angle gets bigger (straightening)"),
    svg: () => anSvg(`<path d="M130 18 V78" class="vz-limb"/>
      <ellipse cx="139" cy="48" rx="6" ry="15" class="vz-mus">${anAttr("rx", 6, 9)}${anAttr("ry", 15, 11)}</ellipse>
      <g>${anRot(0, -140, 130, 78)}<path d="M130 78 V128" class="vz-limb"/><rect x="121" y="126" width="18" height="10" rx="3" class="vz-w"/></g>
      ${anLabels(AL("פשיטת מרפק – היד מתיישרת", "Elbow extension – the arm straightens"), AL("כפיפת מרפק – היד מתקפלת", "Elbow flexion – the arm bends"), AL("התלת־ראשי מבצע", "done by the triceps"), AL("הדו־ראשי מבצע", "done by the biceps"))}`) },
  { id: "a_conc", re: /קונצנטרי|אקסצנטרי|concentric|eccentric/i,
    cap: () => AL("קונצנטרי – השריר מתקצר תחת עומס (עלייה). אקסצנטרי – השריר מתארך תחת עומס (ירידה)", "Concentric – the muscle shortens under load (lifting). Eccentric – it lengthens under load (lowering)"),
    svg: () => anSvg(`<path d="M130 18 V78" class="vz-limb"/>
      <ellipse cx="139" cy="48" rx="6" ry="15" class="vz-mus">${anAttr("rx", 6, 9)}${anAttr("ry", 15, 11)}</ellipse>
      <g>${anRot(0, -140, 130, 78)}<path d="M130 78 V128" class="vz-limb"/><rect x="121" y="126" width="18" height="10" rx="3" class="vz-w"/></g>
      ${anLabels(AL("אקסצנטרי – יורד, השריר מתארך", "Eccentric – lowering, the muscle lengthens"), AL("קונצנטרי – עולה, השריר מתקצר", "Concentric – lifting, the muscle shortens"))}`) },
  { id: "a_abd", re: /הרחקה|קירוב|אבדוקצי|אדוקצי|abduct|adduct|lateral raise|הרמה צידית/i, skipRe: /ירך|hip|עכוז|glute|שכמ|scapul/i,
    cap: () => AL("הרחקה – הגפה מתרחקת מקו האמצע של הגוף. קירוב – חוזרת אליו", "Abduction – the limb moves away from the body's midline. Adduction – it comes back"),
    svg: () => anSvg(`<path d="M160 4 V150" class="vz-pl1"/>${anFront(false)}
      <g>${anRot(0, 90, 146, 40)}<path d="M146 40 V88" class="vz-limb"/></g><g>${anRot(0, -90, 174, 40)}<path d="M174 40 V88" class="vz-limb"/></g>
      ${anLabels(AL("קירוב (אדוקציה) – חזרה לקו האמצע", "Adduction – back to the midline"), AL("הרחקה (אבדוקציה) – התרחקות מקו האמצע", "Abduction – away from the midline"), AL("הקו המקווקו = קו האמצע", "dotted line = the midline"), AL("במישור הפרונטלי", "in the frontal plane"), 155)}`, 180) },
  { id: "a_hipabd", re: /(הרחק|קירוב|מקרבי|אבדוקצי|אדוקצי|abduct|adduct)[^.]{0,25}(ירך|הירך|hip)|(ירך|hip)[^.]{0,25}(הרחק|קירוב|abduct|adduct)|עכוז (ה)?אמצעי|gluteus medius|המקרבים|adductors/i,
    cap: () => AL("הרחקת ירך – הרגל זזה הצידה (העכוז האמצעי). קירוב – חוזרת פנימה (המקרבים)", "Hip abduction – the leg moves out to the side (gluteus medius). Adduction – it comes back in (adductors)"),
    svg: () => anSvg(`<path d="M160 4 V150" class="vz-pl1"/>${anFront(true, false)}<path d="M160 95 L150 140" class="vz-limb"/>
      <g>${anRot(-5, -38, 162, 95)}<path d="M162 95 L170 140" class="vz-limb"/></g>
      ${anLabels(AL("קירוב ירך – הרגל חוזרת פנימה", "Hip adduction – the leg comes back in"), AL("הרחקת ירך – הרגל זזה הצידה", "Hip abduction – the leg moves out"), "", "", 160)}`, 172) },
  { id: "a_ankle", re: /כפיפה גבית|כפיפה כפית|דורסי.?פלקס|פלנטר|dorsiflex|plantar.?flex|tibialis|השוקי הקדמי|calf raise|הרמת עקבים/i,
    cap: () => AL("כפיפה גבית – כף הרגל עולה לכיוון השוק. כפיפה כפית – הבהונות יורדות, כמו עלייה על הבהונות", "Dorsiflexion – the foot lifts toward the shin. Plantar flexion – toes point down, like rising onto your toes"),
    svg: () => anSvg(`<path d="M150 14 V108" class="vz-limb"/>
      <ellipse cx="157" cy="55" rx="4" ry="18" fill="#60a5fa">${anAttr("opacity", 1, .15)}</ellipse>
      <ellipse cx="142" cy="50" rx="7" ry="20" class="vz-mus">${anAttr("opacity", .25, 1)}</ellipse>
      <g>${anRot(-22, 32, 150, 110)}<path d="M150 110 L140 120 L208 120 Z" class="vz-limb"/></g>
      ${VZ_T(190, 58, AL("שוקי קדמי", "tibialis"), "vz-m", 10)}${VZ_T(118, 46, AL("שוק", "calf"), "vz-m", 10)}
      ${anLabels(AL("כפיפה גבית – כף הרגל עולה", "Dorsiflexion – the foot lifts"), AL("כפיפה כפית – הבהונות למטה", "Plantar flexion – toes point down"), AL("השוקי הקדמי עובד (כחול)", "tibialis anterior works (blue)"), AL("שרירי השוק עובדים (כתום)", "the calf muscles work (orange)"), 150)}`, 172) },
  { id: "a_shflex", re: /כפיפת (ה)?כתף|פשיטת (ה)?כתף|הרמה קדמית|הרמה קדימה|דלתא (ה)?קדמי|shoulder (flexion|extension)|front raise|front delt/i,
    cap: () => AL("כפיפת כתף – הזרוע עולה קדימה ומעלה. פשיטת כתף – חוזרת למטה ולאחור (מבט מהצד)", "Shoulder flexion – the arm rises forward and up. Shoulder extension – it goes back down and behind (side view)"),
    svg: () => anSvg(`<circle cx="150" cy="20" r="10" class="vz-fill"/><path d="M150 31 V98 L146 145 M150 98 L156 145" class="vz-limb"/>
      <g>${anRot(25, -165, 150, 40)}<path d="M150 40 V88" class="vz-limb"/></g>${VZ_T(205, 24, AL("קדימה ←", "forward →"), "vz-m", 10)}
      ${anLabels(AL("פשיטת כתף – הזרוע למטה ולאחור", "Shoulder extension – arm down and back"), AL("כפיפת כתף – הזרוע קדימה ומעלה", "Shoulder flexion – arm forward and up"), "", "", 160)}`, 172) },
  { id: "a_hipflex", re: /כפיפת (ה)?ירך|כופף(י)? (ה)?ירך|איליופסואס|פסואס|hip flex|iliopsoas|psoas|knee raise|הרמות? ברכיים/i,
    cap: () => AL("כפיפת ירך – הברך עולה לכיוון החזה (האיליופסואס). פשיטת ירך – הרגל חוזרת למטה (העכוז)", "Hip flexion – the knee rises toward the chest (iliopsoas). Hip extension – the leg goes back down (glutes)"),
    svg: () => anSvg(`<circle cx="150" cy="18" r="10" class="vz-fill"/><path d="M150 29 V92 M150 40 L156 84 M150 92 L150 145" class="vz-limb"/>
      <g>${anRot(0, -95, 152, 92)}<path d="M152 92 V120" class="vz-limb"/><g>${anRot(0, 95, 152, 120)}<path d="M152 120 V146" class="vz-limb"/></g></g>
      ${anLabels(AL("פשיטת ירך – הרגל למטה", "Hip extension – leg down"), AL("כפיפת ירך – הברך עולה", "Hip flexion – the knee rises"), "", "", 162)}`, 172) },
  { id: "a_hinge", re: /היפ.?הינג|hip.?hinge|RDL|רומני|romanian|good morning|גוד מורנינג|סווינג|swing/i,
    cap: () => AL("היפ־הינג׳: התנועה באה מהירכיים, שזזות אחורה – והגב נשאר ארוך וישר", "Hip hinge: the movement comes from the hips, which move back – and the back stays long and straight"),
    svg: () => anSvg(`<path d="M150 92 L156 120 L150 148" class="vz-limb"/>
      <g>${anRot(0, 62, 150, 92)}<path d="M150 92 V36" class="vz-limb"/><circle cx="150" cy="24" r="10" class="vz-fill"/><path d="M142 92 V30" class="vz-pl1"/></g>
      ${anLabels(AL("עמידה – הירך פשוטה", "Standing – hip extended"), AL("היפ־הינג׳ – כפיפה בירך, גב ישר", "Hip hinge – bending at the hip, back straight"), "", AL("(הקו המקווקו: הגב לא מתעגל)", "(dotted line: the back doesn't round)"), 162)}`, 182) },
  { id: "a_valgus", re: /ולגוס|valgus|קורסות? פנימה|כיוון הברכיים|cave in|caving in|knees? (collapse|cave)|direction of the knees/i,
    cap: () => AL("ולגוס = הברכיים קורסות פנימה. נכון: הברך נעה בקו אחד עם כף הרגל", "Valgus = the knees cave inward. Correct: the knee tracks in line with the foot"),
    svg: () => anSvg(`<path d="M132 22 H188" class="vz-limb"/>
      <path class="vz-limb" d="M132 22 L130 80 L126 136">${`<animate attributeName="d" values="M132 22 L130 80 L126 136;M132 22 L130 80 L126 136;M132 22 L150 80 L126 136;M132 22 L150 80 L126 136;M132 22 L130 80 L126 136;M132 22 L130 80 L126 136" keyTimes="${AN_KT}" calcMode="spline" keySplines="${AN_KS}" dur="${AN_DUR}s" repeatCount="indefinite"/>`}</path>
      <path class="vz-limb" d="M188 22 L190 80 L194 136">${`<animate attributeName="d" values="M188 22 L190 80 L194 136;M188 22 L190 80 L194 136;M188 22 L170 80 L194 136;M188 22 L170 80 L194 136;M188 22 L190 80 L194 136;M188 22 L190 80 L194 136" keyTimes="${AN_KT}" calcMode="spline" keySplines="${AN_KS}" dur="${AN_DUR}s" repeatCount="indefinite"/>`}</path>
      <path d="M112 140 H140 M180 140 H208" class="vz-limb"/>
      ${anTxt(AL("✓ הברכיים בקו כפות הרגליים", "✓ Knees in line with the feet"), 162, "vz-t3", 13, 1)}${anTxt(AL("✗ ולגוס – הברכיים קורסות פנימה", "✗ Valgus – knees cave inward"), 162, "vz-t1", 13, 0)}`, 172) },
  { id: "a_scapret", re: /קירוב (ה)?שכמות|סגירת (ה)?שכמות|רטרקצי|פרוטרקצי|retract|protract|מעו?יינ|rhomboid|שכמות (לאחור|מכונסות)|squeez(e|ing) the shoulder blades/i,
    cap: () => AL("מבט מאחור: קירוב שכמות (רטרקציה) – השכמות מתקרבות לעמוד השדרה. הרחקה (פרוטרקציה) – הן נפתחות הצידה", "Back view: scapular retraction – the shoulder blades move toward the spine. Protraction – they spread out to the sides"),
    svg: () => anSvg(`<path d="M160 10 V138" class="vz-pl1"/><path d="M100 30 H220" class="vz-limb"/>
      <g>${anMove("0 0", "16 0")}<path d="M118 36 L148 40 L136 100 Z" class="vz-b1" stroke-width="2"/></g>
      <g>${anMove("0 0", "-16 0")}<path d="M202 36 L172 40 L184 100 Z" class="vz-b1" stroke-width="2"/></g>
      ${VZ_T(160, 8, AL("עמוד השדרה", "spine"), "vz-m", 9)}
      ${anLabels(AL("הרחקת שכמות (פרוטרקציה)", "Scapular protraction"), AL("קירוב שכמות (רטרקציה)", "Scapular retraction"), AL("השכמות נפתחות הצידה וקדימה", "the blades spread to the sides and forward"), AL("המעוינים והטרפז האמצעי עובדים", "the rhomboids and middle trapezius work"), 150)}`, 172) },
  { id: "a_scapelev", re: /הרמת (ה)?(שכמות|כתפיים)|הורדת (ה)?(שכמות|כתפיים)|אלבציה|דפרסיה|elevat(e|ion)|depress(ion)?|shrug|שראג|טרפז (ה)?(עליון|תחתון)|upper trap|lower trap|levator/i,
    cap: () => AL("מבט מאחור: הרמת שכמות (אלבציה) – כמו משיכת כתפיים לאוזניים. הורדה (דפרסיה) – הכתפיים למטה", "Back view: scapular elevation – like shrugging toward the ears. Depression – shoulders down"),
    svg: () => anSvg(`<path d="M160 10 V138" class="vz-pl1"/><circle cx="160" cy="16" r="10" class="vz-fill"/>
      <g>${anMove("0 6", "0 -14")}<path d="M100 40 H220" class="vz-limb"/><path d="M122 44 L150 48 L138 104 Z" class="vz-b1" stroke-width="2"/><path d="M198 44 L170 48 L182 104 Z" class="vz-b1" stroke-width="2"/></g>
      ${anLabels(AL("הורדת שכמות (דפרסיה)", "Scapular depression"), AL("הרמת שכמות (אלבציה)", "Scapular elevation"), AL("הטרפז התחתון מוריד", "the lower trapezius pulls down"), AL("הטרפז העליון מרים – כמו בשראגס", "the upper trapezius lifts – like in shrugs"), 150)}`, 172) },
  { id: "a_rot", re: /סיבוב (ה)?(פנימי|חיצוני)|internal rotation|external rotation|internally rotat|externally rotat|שרוול (ה)?מסובב|rotator cuff|סבסקפולר|אינפרספינ|subscapular|infraspin/i,
    cap: () => AL("מבט מלמעלה, מרפק צמוד לגוף: סיבוב חיצוני – האמה זזה החוצה. סיבוב פנימי – האמה זזה פנימה לבטן", "Top view, elbow at the side: external rotation – the forearm moves out. Internal rotation – it moves in toward the belly"),
    svg: () => anSvg(`<ellipse cx="160" cy="62" rx="72" ry="26" class="vz-b2" stroke-width="2"/><circle cx="160" cy="62" r="13" class="vz-fill"/>
      <circle cx="218" cy="74" r="5" class="vz-fill"/>
      <g>${anRot(-75, 62, 218, 74)}<path d="M218 74 V126" class="vz-limb"/><circle cx="218" cy="130" r="5" class="vz-fill"/></g>
      ${VZ_T(160, 16, AL("מבט מלמעלה · קדימה = למטה", "top view · forward = down"), "vz-m", 10)}
      ${anLabels(AL("סיבוב חיצוני – האמה החוצה", "External rotation – forearm out"), AL("סיבוב פנימי – האמה פנימה", "Internal rotation – forearm in"), AL("אינפרספינטוס וטרס מינור", "infraspinatus and teres minor"), AL("סבסקפולריס", "subscapularis"), 155)}`, 180) },
  { id: "a_knee", re: /כפיפת (ה)?ברכ|פשיטת (ה)?ברכ|knee (flexion|extension)|leg (curl|extension)|פשיטת ברכיים|כפיפת ברכיים/i,
    cap: () => AL("פשיטת ברך – השוק מתיישרת (הארבע־ראשי). כפיפת ברך – העקב עולה לישבן (ההמסטרינג)", "Knee extension – the shin straightens (quadriceps). Knee flexion – the heel comes up toward the buttocks (hamstrings)"),
    svg: () => anSvg(`<path d="M110 70 H170" class="vz-limb"/><path d="M110 70 V30" class="vz-limb"/><circle cx="110" cy="20" r="9" class="vz-fill"/>
      <g>${anRot(0, -85, 170, 70)}<path d="M170 70 V124 H182" class="vz-limb"/></g>
      ${anLabels(AL("כפיפת ברך (ההמסטרינג)", "Knee flexion (hamstrings)"), AL("פשיטת ברך (הארבע־ראשי)", "Knee extension (quadriceps)"), AL("מבט מהצד, בישיבה", "side view, seated"), AL("מבט מהצד, בישיבה", "side view, seated"), 150)}`, 172) }
];
/* בשאלות 'מה זה X' לא מציגים את האנימציה של X – זה כמעט התשובה */
const AN_DEFQ = /^(מה(ו|י)?\s|מה פירוש|איזו תנועה|איזה תנועה|What is|What's|What does|Which movement)/i;

/* שילוב בתוך מנגנון האיורים הקיים */
if (typeof VISUALS !== "undefined") {
  // התאמה גם לנוסח באנגלית של האיורים הקיימים
  const EN = { contr: "concentric|eccentric|isometric|contraction", energy: "ATP|creatine|phosphagen|glycoly|anaerobic|aerobic|energy system", planes: "plane|sagittal|frontal|transverse",
    levers: "lever|fulcrum|moment arm", supercomp: "supercompensation|overtraining", period: "periodization|macrocycle|mesocycle|microcycle", hr: "heart rate|karvonen|VO2",
    fibers: "type I|type II|muscle fibers|slow.?twitch|fast.?twitch", sarc: "actin|myosin|sarcomere", arousal: "arousal|inverted.?U|yerkes", spine: "lordosis|kyphosis|scoliosis|spine|posture",
    macros: "calorie|carbohydrate|protein|fat|macronutrient", reps: "rep range|hypertrophy|max strength|muscular endurance", rpe: "RPE|borg|perceived exertion|RIR|reps in reserve", bmi: "BMI|body mass index" };
  VISUALS.forEach(v => { if (EN[v.id]) v.re = new RegExp(v.re.source + "|" + EN[v.id], "i"); });
  // האנימציות לפני האיורים הסטטיים (בעדיפות)
  const conv = ANIMS.map(a => ({ id: a.id, re: a.re, skipRe: a.skipRe, anim: true, get cap() { return a.cap(); }, svg: a.svg }));
  VISUALS.unshift(...conv);
}
if (typeof visualsFor === "function") {
  const _vfA = visualsFor;
  visualsFor = function (q) {
    // מסננים אנימציות שעונות על שאלת הגדרה, או שמתאימות לנושא אחר (למשל הרחקה של הירך ולא של הכתף)
    const hide = [];
    if (q && q.q) VISUALS.forEach(v => { if (v.anim && v.re.test(q.q) && (AN_DEFQ.test(q.q) || (v.skipRe && v.skipRe.test(q.q)))) hide.push(v); });
    const saved = hide.map(v => [v, v.re]); hide.forEach(v => { v.re = /$^/; });
    try { return _vfA(q); } finally { saved.forEach(([v, r]) => { v.re = r; }); }
  };
}

/* איור מתאים לפי טקסט חופשי (שם מונח וכו׳) */
function anFor(text, max = 1) {
  const out = [];
  for (const v of (typeof VISUALS !== "undefined" ? VISUALS : [])) {
    if (out.length >= max) break;
    if (v.re.test(text) && !(v.skipRe && v.skipRe.test(text) && v.id === "a_abd")) out.push(v);
  }
  return out;
}
const anFig = v => `<figure class="vz-fig">${v.svg()}<figcaption>${esc(v.cap)}</figcaption></figure>`;

/* חלון מונח: מציגים איור/אנימציה מתחת לכותרת */
if (typeof termSheet === "function") {
  const _termSheetA = termSheet;
  termSheet = function (k) {
    _termSheetA(k);
    const v = anFor(String(k))[0]; if (!v) return;
    const bgs = document.querySelectorAll(".modal-bg"), h2 = bgs.length ? bgs[bgs.length - 1].querySelector(".modal h2") : null;
    if (h2) h2.insertAdjacentHTML("afterend", anFig(v));
  };
}

/* שיעור: איור ליד כל קטע שיש לו איור מתאים (בחלון השיעור ובמסך השיעורים) */
function anDecorate(root) {
  if (!root) return;
  const used = new Set();
  root.querySelectorAll(".lesson-sec").forEach(sec => {
    if (sec.querySelector(".vz-fig")) return;
    const v = anFor(sec.textContent || "", 4).find(x => !used.has(x.id)); if (!v) return;
    used.add(v.id); sec.insertAdjacentHTML("beforeend", anFig(v));
  });
}
if (typeof lessonSheet === "function") {
  const _lessonSheetA = lessonSheet;
  lessonSheet = function (f) {
    _lessonSheetA(f);
    const bgs = document.querySelectorAll(".modal-bg");
    anDecorate(bgs.length ? bgs[bgs.length - 1].querySelector(".modal") : null);
  };
}
if (typeof renderLesson === "function") {
  const _renderLessonA = renderLesson;
  renderLesson = function (f) { const r = _renderLessonA(f); anDecorate(document.getElementById("app")); return r; };
}
