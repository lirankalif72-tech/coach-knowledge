"use strict";
/* ═════════════ v12.2 – תוכן לתרגול המעשי ═════════════
   כל טקסט הוא [עברית, English].
   LAB_FAULTS – תוויות טעויות · LAB_SPOT – מצא את הטעות · LAB_SIM – סימולטור לקוח
   LAB_ORDER – סדר את התנועה · LAB_MUS – תוספות למפת הגוף */

const LAB_FAULTS = {
  heels: ["העקבים מתרוממים מהרצפה", "The heels lift off the floor"],
  round: ["הגב מתעגל", "The back rounds"],
  barfar: ["המוט מתרחק מהגוף", "The bar drifts away from the body"],
  knees: ["הברכיים מתכופפות יותר מדי – זה הופך לסקוואט", "The knees bend too much – it turns into a squat"],
  sag: ["האגן שוקע והגב התחתון נכנס לקשת", "The hips sag and the lower back arches"],
  pike: ["האגן גבוה מדי", "The hips are too high"],
  arch: ["נשען אחורה עם קשת מוגזמת בגב התחתון", "Leaning back with an excessive lower-back arch"],
  arch2: ["הגב התחתון נכנס לקשת בחלק העליון", "The lower back arches at the top"],
  swing: ["תנופה – הגו נע קדימה ואחורה", "Swinging – the torso rocks back and forth"],
  rise: ["הגו מתרומם בכל חזרה", "The torso rises on every rep"],
  rock: ["נדנוד גדול של הגו קדימה ואחורה", "Big rocking of the torso"],
  elbows: ["המרפקים זזים קדימה", "The elbows drift forward"],
  shallow: ["טווח התנועה קצר מדי", "The range of motion is too short"],
  lean: ["הגו נוטה קדימה יותר מדי", "The torso leans too far forward"],
  ok: ["הביצוע תקין", "The form is correct"]
};

/* ex – תרגיל מתוך PB_EX · A/B – שינוי לתנוחה (cv = עיגול הגב: חיובי = גב עגול, שלילי = קשת) */
const LAB_SPOT = [
  { id: "sq_heels", ex: "squat", B: { at: [60, 105], ft: 130 }, a: "heels", o: ["heels", "round", "shallow", "ok"],
    e: ["כשהעקבים עולים, המשקל עובר לבהונות. היציבות יורדת והעומס על הברכיים עולה. הסיבה הנפוצה היא טווח קרסול מוגבל, או משקל שנוטה קדימה.", "When the heels lift, the weight shifts to the toes. Stability drops and the knees take more load. The usual cause is limited ankle range or weight drifting forward."],
    fix: ["משקל על כל כף הרגל, עבודה על טווח הקרסול. אפשר זמנית להניח צלחות דקות מתחת לעקבים או להרחיב מעט את העמידה.", "Keep the weight over the whole foot and work on ankle mobility. For now, small plates under the heels or a slightly wider stance can help."] },
  { id: "sq_round", ex: "squat", B: { tor: 58, cv: 8 }, a: "round", o: ["round", "heels", "shallow", "ok"],
    e: ["בתחתית הגב התחתון מתעגל. תחת עומס זה מעביר לחץ לעמוד השדרה במקום לשרירים.", "At the bottom the lower back rounds. Under load this shifts stress to the spine instead of the muscles."],
    fix: ["יורדים רק לעומק שבו הגב נשאר ניטרלי, נושמים ומקשיחים את הליבה לפני הירידה, ומשפרים טווח בירך ובקרסול.", "Go only as deep as the back stays neutral, breathe in and brace before descending, and improve hip and ankle range."] },
  { id: "sq_ok", ex: "squat", a: "ok", o: ["ok", "heels", "round", "lean"],
    e: ["הביצוע תקין: עקבים על הרצפה, גב ניטרלי, והגו והשוק נוטים בערך באותה זווית. נטייה מסוימת קדימה היא טבעית בסקוואט עם מוט על הגב.", "Good form: heels down, neutral back, and the torso and shins lean at about the same angle. Some forward lean is normal in a back squat."],
    fix: ["ממשיכים כך, ומוסיפים עומס בהדרגה.", "Keep it up and add load gradually."] },
  { id: "dl_round", ex: "deadlift", B: { cv: 10 }, a: "round", o: ["round", "barfar", "heels", "ok"],
    e: ["הגב מתעגל בתחתית. בעומס כבד זה מעביר את העבודה מהשרירים לרצועות ולדיסקים של עמוד השדרה.", "The back rounds at the bottom. Under heavy load this shifts the work from the muscles to the spinal ligaments and discs."],
    fix: ["חזה למעלה ורחב גבי מכווץ לפני המשיכה, נשימה וקיבוע, ומשקל שאפשר להחזיק בו גב ישר. אפשר להתחיל מגובה (בלוקים).", "Chest up and lats tight before the pull, breathe and brace, and use a weight you can keep a neutral back with. You can start from blocks."] },
  { id: "dl_far", ex: "deadlift", B: { wt: [80, 99] }, a: "barfar", o: ["barfar", "round", "heels", "ok"],
    e: ["המוט רחוק מהגוף, ולכן זרוע המומנט על הגב התחתון ארוכה. התרגיל נעשה קשה יותר ומסוכן יותר.", "The bar is far from the body, so the lever arm on the lower back is long. The lift becomes harder and riskier."],
    fix: ["מתחילים כשהמוט מעל אמצע כף הרגל, ומחליקים אותו לאורך השוקיים והירכיים. מכווצים את הרחב הגבי כדי להצמיד את המוט.", "Start with the bar over the mid-foot and slide it along the shins and thighs. Tighten the lats to keep it close."] },
  { id: "rdl_knees", ex: "rdl", B: { p: [44, 82], tor: 58, wt: [71, 93] }, a: "knees", o: ["knees", "round", "barfar", "ok"],
    e: ["דדליפט רומני הוא תנועת ציר בירך: הירך זזה אחורה והברכיים כמעט לא מתכופפות. כשהברכיים מתכופפות הרבה, העבודה עוברת מההמסטרינג לארבע־ראשי.", "A Romanian deadlift is a hip hinge: the hips move back and the knees barely bend. When the knees bend a lot, the work moves from the hamstrings to the quads."],
    fix: ["ברכיים רכות וקבועות, דוחפים את הירך אחורה עד שמרגישים מתיחה בהמסטרינג, והמוט מחליק לאורך הירכיים.", "Soft, fixed knees. Push the hips back until you feel a hamstring stretch, with the bar sliding down the thighs."] },
  { id: "pu_sag", ex: "pushup", B: { p: [56, 105], tor: 60 }, a: "sag", o: ["sag", "pike", "shallow", "ok"],
    e: ["האגן שוקע: הליבה לא מחזיקה את הגוף בקו ישר, והעומס עובר לגב התחתון.", "The hips sag: the core is not holding the body in a straight line, and the load moves to the lower back."],
    fix: ["מכווצים ישבן ובטן, והגוף בקו ישר מהראש עד העקבים. אם זה קשה, עוברים לשכיבות סמיכה בשיפוע.", "Squeeze the glutes and abs and keep a straight line from head to heels. If it is too hard, switch to incline push-ups."] },
  { id: "pl_pike", ex: "plank", A: { p: [46, 74], tor: 112 }, B: { p: [46, 73], tor: 111 }, a: "pike", o: ["pike", "sag", "round", "ok"],
    e: ["האגן גבוה מדי. המנוף מתקצר והפלאנק נעשה קל יותר – אבל הליבה כמעט לא עובדת.", "The hips are too high. The lever gets shorter and the plank gets easier – but the core barely works."],
    fix: ["קו ישר מהכתפיים עד העקבים, ישבן מכווץ וצלעות למטה.", "A straight line from shoulders to heels, glutes tight and ribs down."] },
  { id: "ohp_arch", ex: "ohp", A: { tor: -12, cv: -5, wt: [56, 2] }, B: { tor: -12, cv: -5, wt: [62, 34] }, a: "arch", o: ["arch", "shallow", "swing", "ok"],
    e: ["הגוף נשען אחורה עם קשת בגב התחתון. התרגיל הופך ללחיצה בשיפוע, והגב התחתון נדחס. בדרך כלל המשקל כבד מדי או שהליבה חלשה.", "The body leans back with an arched lower back. The lift turns into an incline press and the lower back gets compressed. Usually the weight is too heavy or the core is weak."],
    fix: ["ישבן ובטן מכווצים, צלעות למטה, המוט עולה בקו ישר מעל אמצע כף הרגל. מורידים משקל אם צריך.", "Glutes and abs tight, ribs down, and the bar travels straight up over the mid-foot. Lower the weight if needed."] },
  { id: "curl_swing", ex: "bbcurl", A: { tor: 8 }, B: { tor: -18 }, a: "swing", o: ["swing", "elbows", "shallow", "ok"],
    e: ["הגב נותן תנופה למשקל. הדו־ראשי עובד פחות, והגב התחתון מקבל עומס מיותר.", "The back swings the weight up. The biceps work less and the lower back takes extra load."],
    fix: ["גב צמוד לקיר או עמידה יציבה, משקל קל יותר, וירידה איטית של 2–3 שניות.", "Back against a wall or a solid stance, a lighter weight, and a slow 2–3 second lowering."] },
  { id: "curl_elb", ex: "bbcurl", B: { ua: 140, fa: 10 }, a: "elbows", o: ["elbows", "swing", "shallow", "ok"],
    e: ["המרפקים זזים קדימה בחלק העליון. הכתף הקדמית לוקחת חלק מהעבודה, והמתח על הדו־ראשי יורד.", "The elbows drift forward at the top. The front deltoid takes over part of the work and tension on the biceps drops."],
    fix: ["מרפקים צמודים לצדי הגוף, ועוצרים כשהאמה כמעט אנכית.", "Keep the elbows by your sides and stop when the forearm is nearly vertical."] },
  { id: "row_rise", ex: "bbrow", B: { tor: 30, wt: [64, 62] }, a: "rise", o: ["rise", "round", "shallow", "ok"],
    e: ["הגו מתרומם בכל חזרה ומייצר תנופה. התרגיל מתקרב למשיכת כתפיים, והרחב הגבי עובד פחות.", "The torso rises on every rep to create momentum. The lift becomes closer to a shrug and the lats work less."],
    fix: ["קובעים זווית גו (בערך 45° או נמוך יותר) ושומרים עליה, מקשיחים ליבה ומושכים לבטן התחתונה. משקל קל יותר.", "Set a torso angle (about 45° or lower) and hold it, brace, and pull to the lower belly. Use a lighter weight."] },
  { id: "crow_rock", ex: "cablerow", A: { tor: 40 }, B: { tor: -28 }, a: "rock", o: ["rock", "round", "shallow", "ok"],
    e: ["הגו מתנדנד הרבה קדימה ואחורה, ולכן הגב התחתון מושך את המשקל במקום שרירי הגב.", "The torso rocks a lot, so the lower back pulls the weight instead of the back muscles."],
    fix: ["גו כמעט זקוף ויציב, רק נטייה קלה. מושכים עם המרפקים ומקרבים את השכמות.", "Keep the torso nearly upright and still, with only a slight lean. Pull with the elbows and squeeze the shoulder blades."] },
  { id: "lunge_ok", ex: "lunge", a: "ok", o: ["ok", "heels", "lean", "shallow"],
    e: ["הביצוע תקין: גו זקוף, עקב הרגל הקדמית על הרצפה, והברך האחורית יורדת לכיוון הרצפה.", "Good form: upright torso, front heel down, and the back knee travels toward the floor."],
    fix: ["ממשיכים כך. להתקדמות: משקולות כבדות יותר או לאנג׳ אחורה.", "Keep it up. To progress: heavier dumbbells or reverse lunges."] },
  { id: "ht_arch", ex: "hipthrust", B: { p: [54, 74], tor: -108, cv: -5, wt: [56, 66] }, a: "arch2", o: ["arch2", "shallow", "heels", "ok"],
    e: ["בחלק העליון הגב התחתון נכנס לקשת במקום שהירך תסיים את התנועה. העכוז עובד פחות והגב התחתון נדחס.", "At the top the lower back arches instead of the hips finishing the movement. The glutes work less and the lower back gets compressed."],
    fix: ["סנטר מעט פנימה, צלעות למטה ואגן מעט מוטה אחורה. עוצרים כשהגו והירכיים בקו ישר.", "Chin slightly tucked, ribs down and pelvis slightly tucked. Stop when the torso and thighs form a straight line."] }
];

/* סימולטור לקוח: s – ציון (2 הכי טוב, 1 אפשרי, 0 לא נכון) */
const LAB_SIM = [
  { id: "dana", em: "🙋‍♀️", n: ["דנה, 34", "Dana, 34"], tag: ["מתחילה", "Beginner"],
    p: [["מעולם לא התאמנה בחדר כושר", "Has never trained in a gym"], ["רוצה להתחזק ולהרגיש טוב יותר", "Wants to get stronger and feel better"], ["3 ימים בשבוע, 60 דקות", "3 days a week, 60 minutes"], ["בריאה, ללא מגבלות", "Healthy, no limitations"]],
    st: [
      { q: ["מה עושים לפני האימון הראשון?", "What do you do before the first session?"], o: [
        { t: ["שאלון PAR-Q, ראיון קצר ומבדקי תנועה בסיסיים", "PAR-Q, a short interview and basic movement screening"], s: 2, fb: ["נכון. כך מזהים סיכונים ומבינים מאיפה מתחילים.", "Right. This finds risks and shows where to start."] },
        { t: ["מבחן 1RM בסקוואט ובלחיצת חזה כדי לקבוע משקלים", "A 1RM test in squat and bench to set the weights"], s: 0, fb: ["מבחן מרבי לא מתאים למתחילה בלי טכניקה. עדיף להעריך משקל לפי חזרות ומאמץ נתפס.", "A max test does not suit a beginner without technique. Estimate loads from reps and perceived effort instead."] },
        { t: ["מתחילים מיד אימון מלא כדי לשמור על המוטיבציה", "Start a full workout right away to keep her motivated"], s: 0, fb: ["מוטיבציה חשובה, אבל בלי בירור בריאותי והערכה אי אפשר להתאים את התוכנית בבטחה.", "Motivation matters, but without health screening and assessment you cannot fit the program safely."] }] },
      { q: ["כמה אימונים ואיזו חלוקה?", "How many sessions and what split?"], o: [
        { t: ["גוף מלא, 3 פעמים בשבוע", "Full body, 3 times a week"], s: 2, fb: ["מצוין. כל שריר עובד 3 פעמים בשבוע, וזה הכי יעיל ללמידת תנועה אצל מתחילים.", "Great. Each muscle works 3 times a week, which is best for learning movements as a beginner."] },
        { t: ["חלוקה לפי שריר – 5 ימים", "A body-part split – 5 days"], s: 0, fb: ["היא זמינה רק 3 ימים, וכל שריר יעבוד רק פעם בשבוע.", "She is only available 3 days, and each muscle would work just once a week."] },
        { t: ["גוף מלא פעמיים, ויום אחד קרדיו", "Full body twice, plus one cardio day"], s: 1, fb: ["אפשרי ובריא, אבל לחיזוק – 3 אימוני כוח ייתנו יותר.", "Possible and healthy, but for strength, 3 strength sessions give more."] }] },
      { q: ["סטים, חזרות ועצימות", "Sets, reps and intensity"], o: [
        { t: ["2–3 סטים × 8–12 חזרות, עם 2–3 חזרות ברזרבה", "2–3 sets × 8–12 reps, with 2–3 reps in reserve"], s: 2, fb: ["נכון. עומס בינוני שמאפשר טכניקה טובה והתקדמות.", "Right. A moderate load that allows good technique and progress."] },
        { t: ["5 סטים × 3 חזרות כבדות", "5 sets × 3 heavy reps"], s: 0, fb: ["עומס כבד מדי למתחילה. קודם בונים טכניקה ובסיס.", "Too heavy for a beginner. Build technique and a base first."] },
        { t: ["סט אחד עד כשל בכל תרגיל", "One set to failure on each exercise"], s: 1, fb: ["סט אחד יכול לעבוד בהתחלה, אבל כשל מלא מוקדם מדי פוגע בטכניקה.", "One set can work at first, but full failure too early hurts technique."] }] },
      { q: ["אילו תרגילים?", "Which exercises?"], o: [
        { t: ["תרגילי בסיס בגרסה קלה: גובלט סקוואט, ציר בירך, שכיבות סמיכה בשיפוע וחתירה", "Easier basics: goblet squat, hip hinge, incline push-ups and rows"], s: 2, fb: ["מצוין. דפוסי תנועה בסיסיים, בגרסה שמתאימה לרמה שלה.", "Great. Basic movement patterns in a version that fits her level."] },
        { t: ["בעיקר מכונות ותרגילי בידוד", "Mostly machines and isolation exercises"], s: 1, fb: ["מכונות בטוחות ונוחות, אבל חשוב ללמד גם תנועות חופשיות בסיסיות.", "Machines are safe and easy, but basic free-weight movements matter too."] },
        { t: ["הרמות אולימפיות כמו סנאץ׳", "Olympic lifts like the snatch"], s: 0, fb: ["תרגילים טכניים מאוד, לא מתאימים לשלב הראשון.", "Very technical lifts, not right for the first stage."] }] },
      { q: ["איך מתקדמים?", "How do you progress?"], o: [
        { t: ["מוסיפים חזרות ואז משקל, והערכה מחדש אחרי 4–6 שבועות", "Add reps, then weight, and reassess after 4–6 weeks"], s: 2, fb: ["נכון – התקדמות כפולה ומעקב קבוע.", "Right – double progression with regular check-ins."] },
        { t: ["מוסיפים משקל בכל אימון, בכל מצב", "Add weight every session, no matter what"], s: 0, fb: ["בסוף הטכניקה תישבר. מתקדמים רק כשהחזרות נקיות.", "Technique will break down. Progress only when the reps are clean."] },
        { t: ["אותה תוכנית בלי שינוי לחצי שנה", "The same program unchanged for six months"], s: 0, fb: ["בלי עומס מתקדם הגוף מפסיק להשתפר.", "Without progressive overload the body stops improving."] }] }
    ] },
  { id: "moshe", em: "👴", n: ["משה, 67", "Moshe, 67"], tag: ["לחץ דם גבוה", "High blood pressure"],
    p: [["פנסיונר, הולך מדי פעם", "Retired, walks now and then"], ["לחץ דם גבוה, מאוזן בתרופות", "High blood pressure, controlled with medication"], ["רוצה לשמור על כוח ועצמאות", "Wants to keep his strength and independence"], ["2–3 ימים בשבוע", "2–3 days a week"]],
    st: [
      { q: ["מה עושים לפני שמתחילים?", "What do you do before starting?"], o: [
        { t: ["PAR-Q, אישור רפואי ומדידת לחץ דם לפני האימונים", "PAR-Q, medical clearance and a blood-pressure check before sessions"], s: 2, fb: ["נכון. גיל ולחץ דם גבוה מחייבים בירור ומעקב.", "Right. Age and high blood pressure call for screening and monitoring."] },
        { t: ["מתחילים. התרופות כבר מאזנות את הלחץ", "Just start – the medication already controls it"], s: 0, fb: ["גם עם תרופות צריך בירור, כי חלק מהתרופות משפיעות על הדופק ועל התגובה למאמץ.", "Even with medication you need screening – some drugs change heart rate and the response to exercise."] },
        { t: ["מוותרים על כוח. רק הליכה", "Skip strength training – walking only"], s: 0, fb: ["אימון כוח מומלץ לגיל המבוגר ואף מוריד לחץ דם, כשעושים אותו נכון.", "Strength training is recommended for older adults and can even lower blood pressure when done right."] }] },
      { q: ["תדירות וסוג אימון", "Frequency and type"], o: [
        { t: ["2–3 אימוני כוח לכל הגוף, ואירובי מתון ברוב ימי השבוע", "2–3 full-body strength sessions, plus moderate aerobic work most days"], s: 2, fb: ["מצוין. זה השילוב המומלץ לבריאות הלב ולשמירה על כוח.", "Great. This is the recommended mix for heart health and strength."] },
        { t: ["אימוני HIIT עצימים כל יום", "Intense HIIT every day"], s: 0, fb: ["עצים ותכוף מדי להתחלה, ומעלה את לחץ הדם בחדות.", "Too intense and too frequent to start, and it spikes blood pressure."] },
        { t: ["אימון כוח אחד בשבוע", "One strength session a week"], s: 1, fb: ["עדיף מכלום, אבל 2–3 פעמים ייתנו תוצאה טובה בהרבה.", "Better than nothing, but 2–3 times gives much better results."] }] },
      { q: ["עצימות ונשימה", "Intensity and breathing"], o: [
        { t: ["עצימות מתונה, 10–15 חזרות, נשימה רציפה בלי עצירה", "Moderate intensity, 10–15 reps, steady breathing without holding"], s: 2, fb: ["נכון. עצירת נשימה (ולסלבה) מקפיצה את לחץ הדם – חשוב להימנע ממנה.", "Right. Holding the breath (Valsalva) spikes blood pressure – avoid it."] },
        { t: ["3–5 חזרות כבדות עם עצירת נשימה ליציבות", "3–5 heavy reps with a breath hold for stability"], s: 0, fb: ["שילוב מסוכן ללחץ דם גבוה: עומס מרבי ועצירת נשימה.", "A risky mix for high blood pressure: maximal load plus a breath hold."] },
        { t: ["רק משקל קל מאוד, סט אחד", "Only very light weights, one set"], s: 1, fb: ["בטוח, אבל קל מדי כדי לבנות כוח. אפשר להעלות בהדרגה.", "Safe, but too light to build strength. Increase gradually."] }] },
      { q: ["אילו תרגילים?", "Which exercises?"], o: [
        { t: ["קימה מכיסא, עלייה על מדרגה, חתירה ותרגילי שיווי משקל", "Sit-to-stand, step-ups, rows and balance work"], s: 2, fb: ["מצוין. תרגילים שמחקים פעולות יומיומיות ומונעים נפילות.", "Great. They mimic daily tasks and help prevent falls."] },
        { t: ["לחיצות כבדות מעל הראש והחזקות סטטיות ארוכות", "Heavy overhead presses and long static holds"], s: 0, fb: ["החזקות ארוכות ולחיצה כבדה מעל הראש מעלות את לחץ הדם יותר מדי.", "Long holds and heavy overhead pressing raise blood pressure too much."] },
        { t: ["רק מכונות בישיבה", "Only seated machines"], s: 1, fb: ["בטוח, אבל חסרים תרגילי עמידה ושיווי משקל שחשובים בגיל הזה.", "Safe, but it misses standing and balance work that matters at this age."] }] },
      { q: ["למה חשוב לשים לב?", "What should you watch for?"], o: [
        { t: ["מעברים איטיים משכיבה לעמידה, הימנעות משכיבה עם ראש נמוך, ועצירה בסחרחורת", "Slow changes from lying to standing, no head-down positions, and stop on dizziness"], s: 2, fb: ["נכון. חלק מהתרופות גורמות לסחרחורת בקימה מהירה.", "Right. Some medications cause dizziness when standing up fast."] },
        { t: ["מודדים לחץ דם פעם בחודש וזהו", "Check blood pressure once a month, that is all"], s: 1, fb: ["מעקב טוב, אבל צריך לשים לב גם בכל אימון – לסימנים ולתחושה.", "Good monitoring, but also watch signs and symptoms every session."] },
        { t: ["אם הוא לוקח תרופות, אין צורך לשים לב לשום דבר", "If he takes medication, nothing needs watching"], s: 0, fb: ["דווקא תרופות מחייבות תשומת לב – הן משנות את התגובה למאמץ.", "Medication calls for more attention – it changes the response to exercise."] }] }
    ] },
  { id: "noa", em: "💪", n: ["נועה, 24", "Noa, 24"], tag: ["מסת שריר", "Muscle gain"],
    p: [["מתאמנת שנה, טכניקה טובה", "Training for a year, good technique"], ["רוצה לעלות במסת שריר", "Wants to build muscle"], ["4 ימים בשבוע", "4 days a week"], ["בריאה", "Healthy"]],
    st: [
      { q: ["מה עושים לפני שבונים תוכנית?", "What do you do before writing the program?"], o: [
        { t: ["PAR-Q, היסטוריית אימונים, בדיקת טכניקה בתרגילים המרכזיים ומטרות", "PAR-Q, training history, technique check on key lifts, and goals"], s: 2, fb: ["נכון. גם למתאמנת מנוסה עושים בירור והערכה.", "Right. Even experienced trainees get screened and assessed."] },
        { t: ["מדלגים על השאלון – היא צעירה ובריאה", "Skip the questionnaire – she is young and healthy"], s: 0, fb: ["שאלון בריאות ממלאים עם כל מתאמן, בלי קשר לגיל.", "Every trainee fills in a health questionnaire, whatever their age."] },
        { t: ["מעתיקים תוכנית של מתאמנת מפורסמת", "Copy a famous athlete's program"], s: 0, fb: ["תוכנית צריכה להתאים לה – לרמה, לזמן ולמטרה שלה.", "A program has to fit her – her level, time and goal."] }] },
      { q: ["איזו חלוקה?", "What split?"], o: [
        { t: ["עליון / תחתון × 4 – כל שריר פעמיים בשבוע", "Upper / lower × 4 – each muscle twice a week"], s: 2, fb: ["מצוין. פעמיים בשבוע לכל שריר יעיל יותר לבניית מסה מפעם אחת.", "Great. Twice a week per muscle beats once a week for muscle growth."] },
        { t: ["שריר אחד בכל יום – כל שריר פעם בשבוע", "One muscle per day – each muscle once a week"], s: 1, fb: ["עובד, אבל עם 4 ימים אפשר לאמן כל שריר פעמיים ולהשיג יותר.", "It works, but with 4 days each muscle can be trained twice for more gains."] },
        { t: ["גוף מלא פעמיים בשבוע", "Full body twice a week"], s: 1, fb: ["תדירות טובה, אבל היא זמינה 4 ימים – אפשר יותר נפח.", "Good frequency, but she has 4 days – there is room for more volume."] }] },
      { q: ["טווח חזרות ועצימות", "Rep range and intensity"], o: [
        { t: ["3–4 סטים × 6–12 חזרות, 1–3 חזרות ברזרבה", "3–4 sets × 6–12 reps, 1–3 reps in reserve"], s: 2, fb: ["נכון. זה הטווח היעיל ביותר לבניית מסה.", "Right. This is the most efficient range for building muscle."] },
        { t: ["רק 20–25 חזרות עם משקל קל", "Only 20–25 reps with light weights"], s: 1, fb: ["מסה נבנית גם בחזרות גבוהות אם מגיעים קרוב לכשל, אבל זה פחות יעיל ומעייף.", "High reps also build muscle near failure, but it is less efficient and very tiring."] },
        { t: ["רק 1–3 חזרות מרביות", "Only 1–3 maximal reps"], s: 0, fb: ["זה טווח לכוח מרבי. נפח נמוך מדי לבניית מסה.", "That range is for maximal strength. Too little volume for muscle growth."] }] },
      { q: ["אילו תרגילים?", "Which exercises?"], o: [
        { t: ["תרגילים מורכבים כבסיס, ותרגילי בידוד בסוף", "Compound lifts as the base, isolation work at the end"], s: 2, fb: ["מצוין. מורכבים לעומס ולנפח, בידוד לשרירים שצריך להשלים.", "Great. Compounds for load and volume, isolation to fill the gaps."] },
        { t: ["רק תרגילי בידוד", "Isolation exercises only"], s: 0, fb: ["בלי תרגילים מורכבים קשה להעמיס ולהתקדם.", "Without compound lifts it is hard to load up and progress."] },
        { t: ["מחליפים את כל התרגילים כל שבוע", "Change every exercise every week"], s: 0, fb: ["כך אי אפשר למדוד התקדמות. עדיף לשמור תרגילים כמה שבועות.", "You cannot track progress that way. Keep exercises for a few weeks."] }] },
      { q: ["מה עוד חשוב?", "What else matters?"], o: [
        { t: ["חלבון 1.6–2.2 גרם לק״ג, עודף קלורי קטן ושינה טובה", "Protein 1.6–2.2 g/kg, a small calorie surplus and good sleep"], s: 2, fb: ["נכון. בלי חומרי בנייה ואנרגיה, השריר לא גדל.", "Right. Without building blocks and energy, muscle does not grow."] },
        { t: ["להוריד פחמימות כמה שיותר", "Cut carbs as much as possible"], s: 0, fb: ["פחמימות מזינות את האימון. הורדה חדה פוגעת בביצועים.", "Carbs fuel training. Cutting them hard hurts performance."] },
        { t: ["תוספים לפני הכול", "Supplements before anything else"], s: 0, fb: ["תוספים הם תוספת קטנה. תזונה, שינה ואימון הם הבסיס.", "Supplements are a small extra. Diet, sleep and training are the base."] }] }
    ] },
  { id: "yossi", em: "🧑‍💼", n: ["יוסי, 45", "Yossi, 45"], tag: ["כאב גב תחתון", "Low back pain"],
    p: [["עובד במשרד, יושב הרבה", "Office worker, sits a lot"], ["כאב גב תחתון כרוני, הרופא אישר פעילות", "Chronic low back pain, doctor cleared him for exercise"], ["רוצה להפחית כאב ולהתחזק", "Wants less pain and more strength"], ["3 ימים בשבוע", "3 days a week"]],
    st: [
      { q: ["מה התפקיד שלך מול הכאב?", "What is your role with the pain?"], o: [
        { t: ["לוודא אישור רפואי, לשאול על סימני אזהרה ולהפנות לרופא כשצריך", "Confirm clearance, ask about warning signs, and refer when needed"], s: 2, fb: ["נכון. מאמן לא מאבחן – הוא עובד בתוך הגבולות שהרופא נתן.", "Right. A trainer does not diagnose – they work within the limits the doctor set."] },
        { t: ["לאבחן בעצמך מה גורם לכאב", "Diagnose the cause yourself"], s: 0, fb: ["אבחון הוא מחוץ לתחום של מאמן כושר.", "Diagnosis is outside a fitness trainer's scope."] },
        { t: ["להימנע מכל תרגיל לגב", "Avoid all back exercises"], s: 0, fb: ["מנוחה מוחלטת בדרך כלל מחמירה כאב כרוני. תנועה מבוקרת עוזרת.", "Complete rest usually worsens chronic pain. Controlled movement helps."] }] },
      { q: ["תדירות ופעילות", "Frequency and activity"], o: [
        { t: ["3 אימונים בשבוע, והליכה יומית", "3 sessions a week, plus a daily walk"], s: 2, fb: ["מצוין. תנועה קבועה היא מהטיפולים היעילים לכאב גב כרוני.", "Great. Regular movement is one of the best treatments for chronic back pain."] },
        { t: ["מנוחה עד שהכאב עובר", "Rest until the pain goes away"], s: 0, fb: ["בכאב כרוני, מנוחה ממושכת מחלישה ומחמירה.", "With chronic pain, long rest weakens and worsens it."] },
        { t: ["6 אימונים כבדים בשבוע", "6 heavy sessions a week"], s: 0, fb: ["יותר מדי, מהר מדי. עולים בהדרגה.", "Too much, too fast. Build up gradually."] }] },
      { q: ["איך מתייחסים לכאב באימון?", "How do you handle pain in training?"], o: [
        { t: ["כאב קל שנרגע תוך 24 שעות מקובל; כאב חד או מחמיר – עוצרים ומשנים", "Mild pain that settles within 24 hours is okay; sharp or worsening pain – stop and adjust"], s: 2, fb: ["נכון. זה ניטור כאב – מתקדמים לפי התגובה.", "Right. This is pain monitoring – progress based on the response."] },
        { t: ["עוצרים כל תנועה שמרגישים בה משהו", "Stop any movement where you feel anything"], s: 1, fb: ["זהיר, אבל עלול ליצור פחד מתנועה. אי־נוחות קלה היא בסדר.", "Careful, but it can build fear of movement. Mild discomfort is fine."] },
        { t: ["ממשיכים גם בכאב חד – בלי כאב אין תוצאות", "Push through sharp pain – no pain, no gain"], s: 0, fb: ["כאב חד הוא סימן לעצור.", "Sharp pain is a signal to stop."] }] },
      { q: ["אילו תרגילים?", "Which exercises?"], o: [
        { t: ["סיבולת ליבה (Bird dog, פלאנק צידי, Dead bug), לימוד ציר בירך וחיזוק עכוז", "Core endurance (bird dog, side plank, dead bug), hip-hinge practice and glute work"], s: 2, fb: ["מצוין. יציבות, שליטה וחיזוק בהדרגה.", "Great. Stability, control and gradual strengthening."] },
        { t: ["100 כפיפות בטן ביום", "100 sit-ups a day"], s: 0, fb: ["כפיפות חוזרות רבות מעמיסות על עמוד השדרה ולא מלמדות יציבות.", "Many repeated sit-ups load the spine and do not teach stability."] },
        { t: ["רק מתיחות", "Stretching only"], s: 1, fb: ["מתיחות יכולות להקל, אבל בלי חיזוק אין שיפור לאורך זמן.", "Stretching can ease it, but without strengthening there is no lasting change."] }] },
      { q: ["איך מתקדמים?", "How do you progress?"], o: [
        { t: ["מעלים עומס בהדרגה ומסבירים לו שתנועה בטוחה ועוזרת", "Load up gradually and teach him that movement is safe and helpful"], s: 2, fb: ["נכון. הסבר מפחית פחד, ועומס הדרגתי מחזק.", "Right. Education reduces fear, and gradual load builds strength."] },
        { t: ["דדליפט כבד כבר מהשבוע הראשון", "Heavy deadlifts from week one"], s: 0, fb: ["אפשר להגיע לדדליפט, אבל רק אחרי בנייה הדרגתית.", "Deadlifts can come later, after a gradual build-up."] },
        { t: ["אותם תרגילים קלים לתמיד", "The same easy exercises forever"], s: 0, fb: ["בלי התקדמות הגוף לא מתחזק.", "Without progression the body does not get stronger."] }] }
    ] },
  { id: "ronit", em: "🤰", n: ["רונית, 30", "Ronit, 30"], tag: ["היריון", "Pregnancy"],
    p: [["שבוע 20, היריון תקין", "Week 20, healthy pregnancy"], ["התאמנה 3 פעמים בשבוע לפני ההיריון", "Trained 3 times a week before pregnancy"], ["רוצה להמשיך להתאמן בבטחה", "Wants to keep training safely"], ["3 ימים בשבוע", "3 days a week"]],
    st: [
      { q: ["מה עושים קודם?", "What comes first?"], o: [
        { t: ["אישור מהרופא המטפל ובירור בריאות", "Clearance from her doctor and health screening"], s: 2, fb: ["נכון. בהיריון תמיד מקבלים אישור לפני שממשיכים.", "Right. In pregnancy, always get clearance before continuing."] },
        { t: ["מפסיקים להתאמן עד הלידה", "Stop training until the birth"], s: 0, fb: ["בהיריון תקין פעילות מומלצת ומיטיבה עם האם והעובר.", "In a healthy pregnancy, exercise is recommended and benefits mother and baby."] },
        { t: ["ממשיכים בדיוק כמו קודם, כולל ספורט מגע", "Continue exactly as before, including contact sports"], s: 0, fb: ["צריך התאמות – ספורט מגע ומצבים עם סכנת נפילה אסורים.", "Adjustments are needed – contact sports and fall-risk activities are out."] }] },
      { q: ["כמה פעילות?", "How much activity?"], o: [
        { t: ["כ־150 דקות בשבוע של פעילות מתונה, כולל 2–3 אימוני כוח", "About 150 minutes a week of moderate activity, including 2–3 strength sessions"], s: 2, fb: ["מצוין. זו ההמלצה המקובלת להיריון תקין.", "Great. This is the standard advice for a healthy pregnancy."] },
        { t: ["מעט ככל האפשר", "As little as possible"], s: 0, fb: ["חוסר פעילות לא מגן עליה – להפך.", "Inactivity does not protect her – quite the opposite."] },
        { t: ["רק הליכה", "Walking only"], s: 1, fb: ["הליכה מעולה, אבל אימון כוח מתון מוסיף הרבה.", "Walking is great, but moderate strength work adds a lot."] }] },
      { q: ["עצימות", "Intensity"], o: [
        { t: ["מתונה – אפשר לדבר תוך כדי (מבחן הדיבור)", "Moderate – she can talk while exercising (the talk test)"], s: 2, fb: ["נכון. מבחן הדיבור מתאים יותר מדופק בהיריון.", "Right. The talk test works better than heart rate in pregnancy."] },
        { t: ["עצימות מרבית ועד כשל", "Maximal intensity and to failure"], s: 0, fb: ["עצימות מרבית ועצירת נשימה לא מתאימות בהיריון.", "Maximal effort and breath holding are not suitable in pregnancy."] },
        { t: ["קלה מאוד בלבד", "Very light only"], s: 1, fb: ["בטוח, אבל היא מתאמנת – אפשר עצימות מתונה.", "Safe, but she is a trained exerciser – moderate is fine."] }] },
      { q: ["אילו התאמות?", "Which adjustments?"], o: [
        { t: ["להימנע משכיבה ממושכת על הגב, ממגע ומסכנת נפילה; לשלב רצפת אגן", "Avoid long periods lying on her back, contact and fall risk; add pelvic floor work"], s: 2, fb: ["מצוין. שכיבה ממושכת על הגב עלולה ללחוץ על כלי דם גדולים.", "Great. Lying on the back for long can press on large blood vessels."] },
        { t: ["כפיפות בטן ושכיבה ארוכה על הגב", "Crunches and long periods on her back"], s: 0, fb: ["שתיהן לא מומלצות בשלב הזה של ההיריון.", "Neither is recommended at this stage of pregnancy."] },
        { t: ["רק מכונות", "Machines only"], s: 1, fb: ["בטוח יחסית, אבל אין צורך להגביל עד כדי כך.", "Fairly safe, but there is no need to limit that much."] }] },
      { q: ["מתי עוצרים מיד?", "When do you stop at once?"], o: [
        { t: ["דימום, סחרחורת, כאב בחזה, צירים או דליפת נוזלים", "Bleeding, dizziness, chest pain, contractions or fluid leakage"], s: 2, fb: ["נכון. אלה סימני אזהרה – עוצרים ופונים לרופא.", "Right. These are warning signs – stop and see a doctor."] },
        { t: ["רק אם היא מבקשת", "Only if she asks"], s: 0, fb: ["המאמן צריך להכיר את סימני האזהרה ולעצור בעצמו.", "The trainer must know the warning signs and stop the session."] },
        { t: ["כשהיא מזיעה", "When she sweats"], s: 0, fb: ["הזעה היא תגובה רגילה. חשוב לשתות ולא להתחמם יותר מדי.", "Sweating is normal. Keep her hydrated and avoid overheating."] }] }
    ] },
  { id: "avi", em: "🧔", n: ["אבי, 52", "Avi, 52"], tag: ["סוכרת סוג 2", "Type 2 diabetes"],
    p: [["סוכרת סוג 2, מטופל בתרופות", "Type 2 diabetes, on medication"], ["עודף משקל, לא פעיל", "Overweight, inactive"], ["רוצה לרדת במשקל ולשפר את הבריאות", "Wants to lose weight and get healthier"], ["4 ימים בשבוע", "4 days a week"]],
    st: [
      { q: ["מה עושים לפני שמתחילים?", "What do you do before starting?"], o: [
        { t: ["אישור רפואי, שאלה על התרופות וסיכון לסוכר נמוך, ובדיקת כפות הרגליים", "Medical clearance, ask about medication and low-blood-sugar risk, and check his feet"], s: 2, fb: ["נכון. חלק מהתרופות גורמות לירידת סוכר במאמץ, ופצעים ברגליים מחלימים לאט.", "Right. Some drugs cause low blood sugar during exercise, and foot wounds heal slowly."] },
        { t: ["מתחילים – סוכרת לא קשורה לאימון", "Just start – diabetes is unrelated to training"], s: 0, fb: ["סוכרת משפיעה ישירות על התגובה למאמץ.", "Diabetes directly affects the response to exercise."] },
        { t: ["שולחים אותו לדיאטה לפני שמתחילים להתאמן", "Send him on a diet before training"], s: 0, fb: ["אין סיבה לחכות. אימון ותזונה עובדים טוב יחד.", "No reason to wait. Training and diet work best together."] }] },
      { q: ["תדירות וסוג", "Frequency and type"], o: [
        { t: ["אירובי ברוב הימים (לפחות 150 דקות בשבוע) ו־2–3 אימוני כוח", "Aerobic most days (at least 150 minutes a week) and 2–3 strength sessions"], s: 2, fb: ["מצוין. שני הסוגים משפרים את איזון הסוכר.", "Great. Both types improve blood-sugar control."] },
        { t: ["אימון כוח אחד בשבוע", "One strength session a week"], s: 0, fb: ["מעט מדי. לא כדאי לעבור יותר מיומיים בלי פעילות.", "Too little. Avoid more than two days in a row without activity."] },
        { t: ["רק אירובי", "Aerobic only"], s: 1, fb: ["טוב, אבל אימון כוח מוסיף רגישות לאינסולין ומסת שריר.", "Good, but strength work adds insulin sensitivity and muscle."] }] },
      { q: ["אילו תרגילים?", "Which exercises?"], o: [
        { t: ["תרגילים לשרירים גדולים, והליכה או אופניים בהשפעה נמוכה", "Big-muscle exercises, plus low-impact walking or cycling"], s: 2, fb: ["נכון. שרירים גדולים צורכים הרבה סוכר, והשפעה נמוכה שומרת על המפרקים.", "Right. Big muscles use lots of sugar, and low impact protects the joints."] },
        { t: ["קפיצות ופליאומטריקה כל יום", "Jumping and plyometrics every day"], s: 0, fb: ["עומס גבוה מדי על המפרקים בעודף משקל.", "Too much joint stress for someone overweight."] },
        { t: ["רק תרגילי בטן לשריפת שומן בבטן", "Only ab exercises to burn belly fat"], s: 0, fb: ["אין שריפת שומן נקודתית. השומן יורד מכל הגוף.", "There is no spot reduction. Fat comes off the whole body."] }] },
      { q: ["מה חשוב באימון?", "What matters during sessions?"], o: [
        { t: ["סוכר זמין לידו, מדידת סוכר לפני אימון אם הוא בסיכון, ונעליים מתאימות", "Fast sugar on hand, a glucose check before training if he is at risk, and proper shoes"], s: 2, fb: ["נכון. כך מונעים ומטפלים בירידת סוכר.", "Right. This prevents and treats low blood sugar."] },
        { t: ["אימון עצים על בטן ריקה", "Hard training on an empty stomach"], s: 0, fb: ["מגביר מאוד את הסיכון לירידת סוכר.", "Greatly raises the risk of low blood sugar."] },
        { t: ["רק לשתות מים", "Just drink water"], s: 1, fb: ["שתייה חשובה, אבל צריך גם להיערך לירידת סוכר.", "Drinking matters, but he also needs a low-sugar plan."] }] },
      { q: ["סימני ירידת סוכר – מה עושים?", "Low blood sugar signs – what do you do?"], o: [
        { t: ["רעד, הזעה וחולשה: עוצרים, נותנים סוכר מהיר ובודקים שוב אחרי 15 דקות", "Shaking, sweating, weakness: stop, give fast sugar, recheck after 15 minutes"], s: 2, fb: ["נכון. זה הטיפול המקובל בירידת סוכר.", "Right. This is the standard response to low blood sugar."] },
        { t: ["ממשיכים – זו רק עייפות", "Keep going – it is just fatigue"], s: 0, fb: ["ירידת סוכר יכולה להחמיר מהר ולהיות מסוכנת.", "Low blood sugar can get worse quickly and become dangerous."] },
        { t: ["נותנים לו לשתות מים ולנוח", "Give him water and let him rest"], s: 1, fb: ["מנוחה נכונה, אבל בלי סוכר המצב לא ישתפר.", "Resting is right, but without sugar it will not improve."] }] }
    ] },
  { id: "amit", em: "🏀", n: ["עמית, 16", "Amit, 16"], tag: ["ספורטאי נוער", "Youth athlete"],
    p: [["כדורסלן נוער, מתאמן בקבוצה 3 פעמים בשבוע", "Youth basketball player, team practice 3 times a week"], ["רוצה להתחזק ולקפוץ גבוה יותר", "Wants to get stronger and jump higher"], ["אין ניסיון בחדר כושר", "No gym experience"], ["2 ימים פנויים בשבוע", "2 free days a week"]],
    st: [
      { q: ["מה צריך לפני שמתחילים?", "What do you need before starting?"], o: [
        { t: ["הסכמה בכתב מהורה, אישור רפואי ופגישת היכרות", "Written consent from a parent, medical clearance and an intro meeting"], s: 2, fb: ["נכון. קטין צריך הסכמה בכתב של הורה.", "Right. A minor needs a parent's written consent."] },
        { t: ["שום דבר מיוחד – הוא כבר ספורטאי", "Nothing special – he is already an athlete"], s: 0, fb: ["קטין מחייב הסכמת הורה, גם אם הוא ספורטאי.", "A minor needs parental consent, even an athlete."] },
        { t: ["רק לבדוק כמה הוא מרים מקסימום", "Just test his max lift"], s: 0, fb: ["בלי טכניקה, מבחן מרבי מסוכן ולא נותן מידע שימושי.", "Without technique a max test is risky and not useful."] }] },
      { q: ["האם אימון משקולות מתאים לגילו?", "Is weight training right at his age?"], o: [
        { t: ["כן, בהשגחה ועם דגש על טכניקה", "Yes, with supervision and a focus on technique"], s: 2, fb: ["נכון. אימון כוח מושגח בטוח ומועיל לבני נוער.", "Right. Supervised strength training is safe and helpful for teens."] },
        { t: ["לא – משקולות עוצרות את הגדילה", "No – weights stunt growth"], s: 0, fb: ["זה מיתוס. אין ראיות שאימון מושגח פוגע בגדילה.", "That is a myth. There is no evidence that supervised training harms growth."] },
        { t: ["רק משקל גוף עד גיל 18", "Bodyweight only until 18"], s: 1, fb: ["משקל גוף מעולה בהתחלה, אבל אין צורך לחכות עד 18.", "Bodyweight is great to start, but there is no need to wait until 18."] }] },
      { q: ["סטים, חזרות ועומס", "Sets, reps and load"], o: [
        { t: ["2–3 סטים × 8–15 חזרות, עומס מתון, והתקדמות לפי טכניקה", "2–3 sets × 8–15 reps, moderate load, progress by technique"], s: 2, fb: ["מצוין. קודם טכניקה, ואז עומס.", "Great. Technique first, then load."] },
        { t: ["חזרה אחת מרבית בכל אימון", "One maximal rep every session"], s: 0, fb: ["מסוכן ולא מתאים למתחיל.", "Risky and not suitable for a beginner."] },
        { t: ["כמה שיותר חזרות עד כשל", "As many reps as possible to failure"], s: 1, fb: ["כשל קבוע פוגע בטכניקה. עדיף לעצור לפני.", "Constant failure hurts technique. Stop a little short."] }] },
      { q: ["אילו תרגילים לקפיצה?", "Which exercises for jumping?"], o: [
        { t: ["סקוואט, ציר בירך, לאנג׳ים וקפיצות עם לימוד נחיתה", "Squats, hip hinges, lunges and jumps with landing practice"], s: 2, fb: ["נכון. כוח בסיסי ונחיתה נכונה מונעים פציעות ומשפרים קפיצה.", "Right. Basic strength and good landings prevent injury and improve jumping."] },
        { t: ["קפיצות עומק מארגז גבוה כבר מהאימון הראשון", "Depth jumps from a high box from day one"], s: 0, fb: ["פליאומטריקה עצימה דורשת בסיס כוח ונחיתה טובה.", "Intense plyometrics need a strength base and good landings."] },
        { t: ["רק מכונות בידוד לרגליים", "Only leg isolation machines"], s: 1, fb: ["מחזק, אבל לא מלמד תנועה וקפיצה.", "Builds strength, but does not teach movement and jumping."] }] },
      { q: ["מה עוד חשוב?", "What else matters?"], o: [
        { t: ["תיאום עם אימוני הקבוצה, ימי מנוחה ושינה", "Coordinate with team practice, rest days and sleep"], s: 2, fb: ["נכון. עומס כולל גבוה מדי מוביל לפציעות.", "Right. Too much total load leads to injury."] },
        { t: ["להתאמן גם בימי משחק כדי להספיק יותר", "Train on game days too, to fit more in"], s: 0, fb: ["עייפות לפני משחק פוגעת בביצוע ומעלה סיכון לפציעה.", "Fatigue before games hurts performance and raises injury risk."] },
        { t: ["תוספי חלבון ויצירה מגיל 16", "Protein and creatine supplements from 16"], s: 0, fb: ["אצל נוער מתחילים מתזונה רגילה ומאוזנת.", "For teens, start with a normal balanced diet."] }] }
    ] },
  { id: "sara", em: "👩‍🦳", n: ["שרה, 58", "Sara, 58"], tag: ["צפיפות עצם נמוכה", "Low bone density"],
    p: [["אחרי גיל המעבר", "After menopause"], ["צפיפות עצם נמוכה (אוסטאופניה)", "Low bone density (osteopenia)"], ["רוצה לשמור על העצמות ולהישאר פעילה", "Wants to protect her bones and stay active"], ["3 ימים בשבוע", "3 days a week"]],
    st: [
      { q: ["מה עושים קודם?", "What comes first?"], o: [
        { t: ["אישור רפואי, והערכת שיווי משקל וסיכון לנפילה", "Medical clearance, plus balance and fall-risk assessment"], s: 2, fb: ["נכון. נפילה היא הסיכון העיקרי לשבר.", "Right. A fall is the main risk for a fracture."] },
        { t: ["מתחילים מיד בקפיצות", "Start with jumping right away"], s: 0, fb: ["השפעה גבוהה לפני הערכה עלולה להיות מסוכנת.", "High impact before assessment can be risky."] },
        { t: ["מוותרים על משקולות – העצמות שבירות", "Skip weights – her bones are fragile"], s: 0, fb: ["להפך – עומס מתאים הוא מה שמחזק עצם.", "The opposite – the right load is what strengthens bone."] }] },
      { q: ["איזה סוג אימון מחזק עצם?", "What kind of training builds bone?"], o: [
        { t: ["אימון התנגדות ופעילות נשיאת משקל, כמו הליכה מהירה", "Resistance training and weight-bearing activity, like brisk walking"], s: 2, fb: ["נכון. עצם מתחזקת מעומס.", "Right. Bone gets stronger under load."] },
        { t: ["רק שחייה", "Swimming only"], s: 1, fb: ["מעולה ללב, אבל המים נושאים את המשקל ולכן כמעט לא מחזקים עצם.", "Great for the heart, but water carries the weight, so it barely builds bone."] },
        { t: ["רק מתיחות ויוגה", "Only stretching and yoga"], s: 1, fb: ["טוב לגמישות ולשיווי משקל, אבל לא מספיק לחיזוק עצם.", "Good for flexibility and balance, but not enough to build bone."] }] },
      { q: ["עצימות", "Intensity"], o: [
        { t: ["התנגדות מתקדמת – מתון עד גבוה לפי יכולת, 2–3 סטים × 8–12", "Progressive resistance – moderate to high as tolerated, 2–3 sets × 8–12"], s: 2, fb: ["מצוין. עצם מגיבה לעומס משמעותי שעולה בהדרגה.", "Great. Bone responds to meaningful load that rises gradually."] },
        { t: ["משקולות של 1–2 ק״ג לתמיד", "1–2 kg dumbbells forever"], s: 1, fb: ["בטוח בהתחלה, אבל בלי עלייה בעומס אין חיזוק.", "Safe at first, but without more load there is no gain."] },
        { t: ["עומס מרבי מהיום הראשון", "Maximal load from day one"], s: 0, fb: ["צריך בנייה הדרגתית וטכניקה.", "She needs a gradual build-up and technique."] }] },
      { q: ["ממה כדאי להימנע?", "What should she avoid?"], o: [
        { t: ["כפיפות גו עם עומס וסיבובים חזקים של הגב, כמו כפיפות בטן", "Loaded spinal flexion and forceful twisting, like sit-ups"], s: 2, fb: ["נכון. אלה מעמיסות על החוליות, שם הסיכון לשבר גבוה.", "Right. They load the vertebrae, where fracture risk is high."] },
        { t: ["הליכה", "Walking"], s: 0, fb: ["הליכה מומלצת – פעילות נשיאת משקל.", "Walking is recommended – it is weight-bearing."] },
        { t: ["סקוואט לכיסא", "Squats to a chair"], s: 0, fb: ["תרגיל מצוין ובטוח לחיזוק רגליים ועצם.", "A great, safe exercise for leg and bone strength."] }] },
      { q: ["מה עוד להוסיף?", "What else should you add?"], o: [
        { t: ["תרגילי שיווי משקל ויציבה בכל אימון", "Balance and posture work every session"], s: 2, fb: ["נכון. שיווי משקל מונע נפילות, ויציבה מגינה על הגב.", "Right. Balance prevents falls and posture protects the back."] },
        { t: ["ריצות ארוכות על אספלט", "Long runs on asphalt"], s: 1, fb: ["נשיאת משקל, אבל מוקדם מדי ועם סיכון לנפילה ולעומס.", "Weight-bearing, but too early with fall and overuse risk."] },
        { t: ["שום דבר – כוח מספיק", "Nothing – strength is enough"], s: 0, fb: ["בלי שיווי משקל הסיכון לנפילה נשאר.", "Without balance work the fall risk remains."] }] }
    ] }
];

/* סדר את התנועה – s לפי הסדר הנכון */
const LAB_ORDER = [
  { id: "squat", em: "🏋️", t: ["חזרה אחת בסקוואט", "One squat rep"],
    s: [["נושמים עמוק ומקשיחים את הליבה", "Breathe in and brace the core"], ["מתחילים לרדת: ירך אחורה וברכיים קדימה יחד", "Start down: hips back and knees forward together"], ["מגיעים לעומק עם גב ניטרלי ועקבים על הרצפה", "Reach depth with a neutral back and heels down"], ["דוחפים את הרצפה ועולים", "Drive through the floor and stand up"], ["נושפים בסוף העלייה ונעמדים זקוף", "Breathe out at the top and stand tall"]],
    e: ["קודם נשימה וקיבוע, אחר כך ירידה מבוקרת, ועלייה בדחיפה מהרצפה.", "Breathe and brace first, then a controlled descent, then drive up from the floor."] },
  { id: "deadlift", em: "🏋️", t: ["עמידת מוצא ומשיכה בדדליפט", "Deadlift setup and pull"],
    s: [["עומדים כשהמוט מעל אמצע כף הרגל", "Stand with the bar over the mid-foot"], ["מתכופפים מהירך ואוחזים במוט", "Hinge at the hips and grip the bar"], ["מורידים את האגן עד שהשוקיים נוגעות במוט", "Lower the hips until the shins touch the bar"], ["חזה למעלה, גב ישר ונשימה עמוקה", "Chest up, flat back and a big breath"], ["דוחפים את הרצפה כשהמוט צמוד לגוף", "Push the floor away with the bar close"], ["ננעלים בעמידה זקופה – בלי להישען אחורה", "Lock out standing tall – without leaning back"]],
    e: ["המוט מתחיל מעל אמצע כף הרגל ונשאר צמוד לגוף לכל אורך התנועה.", "The bar starts over the mid-foot and stays close to the body throughout."] },
  { id: "bench", em: "🏋️", t: ["לחיצת חזה במוט", "Barbell bench press"],
    s: [["שוכבים כשהעיניים מתחת למוט", "Lie down with your eyes under the bar"], ["אוחזים, מקבצים שכמות ומקבעים רגליים", "Grip, pull the shoulder blades back and set the feet"], ["מורידים את המוט מהמתקן עם ידיים ישרות", "Unrack the bar with straight arms"], ["מורידים לאמצע החזה בשליטה", "Lower to mid-chest with control"], ["לוחצים למעלה עד יישור הידיים", "Press up until the arms are straight"], ["מחזירים את המוט למתקן", "Return the bar to the rack"]],
    e: ["קודם מתייצבים על הספסל, ורק אז מורידים את המוט מהמתקן.", "Get set on the bench first, and only then unrack the bar."] },
  { id: "session", em: "📋", t: ["סדר נכון של אימון כוח", "The right order of a strength session"],
    s: [["חימום כללי – 5–10 דקות קרדיו קל", "General warm-up – 5–10 minutes of easy cardio"], ["חימום ספציפי – סטים קלים של התרגיל הראשון", "Specific warm-up – light sets of the first exercise"], ["תרגילים מורכבים (רב־מפרקיים)", "Compound (multi-joint) exercises"], ["תרגילי בידוד", "Isolation exercises"], ["ליבה או תרגיל משלים", "Core or an accessory exercise"], ["שחרור והרגעה", "Cool-down"]],
    e: ["תרגילים מורכבים וכבדים באים כשהגוף רענן. ליבה בסוף, כדי לא לעייף את המייצבים לפני העבודה הכבדה.", "Heavy compound lifts come while you are fresh. Core comes last so the stabilisers are not tired before the heavy work."] },
  { id: "ramp", em: "🔥", t: ["חימום לפי שיטת RAMP", "A RAMP warm-up"],
    s: [["העלאת דופק וטמפרטורה – קרדיו קל", "Raise heart rate and temperature – easy cardio"], ["שפעול שרירים – גומיות ותרגילי הפעלה", "Activate muscles – bands and activation drills"], ["מוביליטי – תנועה בטווח מלא", "Mobilise – full range of motion"], ["תרגילים מהירים ונפיצים לקראת המאמץ", "Potentiate – fast, explosive drills before the effort"]],
    e: ["RAMP: Raise, Activate, Mobilise, Potentiate – מהכללי והקל אל הספציפי והעצים.", "RAMP: Raise, Activate, Mobilise, Potentiate – from general and easy to specific and intense."] },
  { id: "client", em: "🤝", t: ["פגישה ראשונה עם מתאמן", "A first meeting with a trainee"],
    s: [["היכרות וראיון: מטרות, היסטוריה ואורח חיים", "Intro and interview: goals, history and lifestyle"], ["שאלון הצהרת בריאות (PAR-Q)", "Health questionnaire (PAR-Q)"], ["מבדקים והערכה ראשונית", "Tests and an initial assessment"], ["הצבת מטרות SMART", "Set SMART goals"], ["בניית תוכנית אימון", "Write the training program"], ["מעקב והערכה מחדש אחרי כמה שבועות", "Follow up and reassess after a few weeks"]],
    e: ["קודם מכירים ובודקים בטיחות, אחר כך מודדים, ורק אז מציבים מטרות ובונים תוכנית.", "First get to know them and check safety, then measure, and only then set goals and build the program."] },
  { id: "pushup", em: "📈", t: ["התקדמות בשכיבות סמיכה – מהקל לקשה", "Push-up progression – easiest to hardest"],
    s: [["שכיבות סמיכה מול קיר", "Wall push-ups"], ["שכיבות סמיכה עם ידיים על שולחן", "Push-ups with hands on a table"], ["שכיבות סמיכה עם ידיים על ספסל נמוך", "Push-ups with hands on a low bench"], ["שכיבות סמיכה מלאות", "Full push-ups"], ["שכיבות סמיכה עם רגליים מוגבהות", "Feet-elevated push-ups"]],
    e: ["ככל שהגוף אופקי יותר, יותר ממשקל הגוף נופל על הידיים. רגליים מוגבהות מעבירות עוד משקל קדימה.", "The more horizontal the body, the more bodyweight goes onto the hands. Raised feet shift even more weight forward."] },
  { id: "energy", em: "⚡", t: ["מערכות אנרגיה – מהמאמץ הקצר לארוך", "Energy systems – shortest to longest effort"],
    s: [["ספרינט של 5 שניות – מערכת ATP-CP", "A 5-second sprint – ATP-CP system"], ["ריצת 400 מטר (כדקה) – מערכת גליקוליטית", "A 400 m run (about a minute) – glycolytic system"], ["ריצת 5 ק״מ – מערכת אירובית", "A 5 km run – aerobic system"], ["מרתון – אירובית, עם יותר שימוש בשומן", "A marathon – aerobic, using more fat"]],
    e: ["כל המערכות פועלות יחד, אבל ככל שהמאמץ ארוך יותר – החלק של המערכת האירובית גדל.", "All systems work together, but the longer the effort, the bigger the aerobic share."] },
  { id: "heart", em: "❤️", t: ["מסלול הדם בלב", "The path of blood through the heart"],
    s: [["עלייה ימנית", "Right atrium"], ["חדר ימני", "Right ventricle"], ["ריאות", "Lungs"], ["עלייה שמאלית", "Left atrium"], ["חדר שמאלי", "Left ventricle"], ["אבי העורקים (אאורטה)", "Aorta"]],
    e: ["דם דל בחמצן נכנס לצד הימני ונשלח לריאות. דם עשיר בחמצן חוזר לצד השמאלי ויוצא לגוף דרך אבי העורקים.", "Oxygen-poor blood enters the right side and goes to the lungs. Oxygen-rich blood returns to the left side and leaves through the aorta."] },
  { id: "contract", em: "🧬", t: ["כיווץ שריר", "Muscle contraction"],
    s: [["אות עצבי מגיע לצומת העצב־שריר", "A nerve signal reaches the neuromuscular junction"], ["סידן משתחרר בתוך תא השריר", "Calcium is released inside the muscle cell"], ["ראשי המיוזין נקשרים לאקטין", "Myosin heads bind to actin"], ["החוטים מחליקים והשריר מתקצר", "The filaments slide and the muscle shortens"]],
    e: ["הסידן חושף את אתרי הקישור על האקטין, והמיוזין מושך אותו בעזרת אנרגיה מ־ATP.", "Calcium exposes the binding sites on actin, and myosin pulls on it using energy from ATP."] },
  { id: "cpr", em: "🚑", t: ["החייאה בסיסית", "Basic CPR"],
    s: [["מוודאים שהזירה בטוחה", "Make sure the scene is safe"], ["בודקים הכרה ונשימה", "Check for response and breathing"], ["מזעיקים עזרה – 101 – ומבקשים דפיברילטור", "Call for help – 101 – and ask for a defibrillator"], ["מתחילים עיסויי חזה", "Start chest compressions"], ["מחברים דפיברילטור ופועלים לפי ההוראות", "Attach the defibrillator and follow its prompts"]],
    e: ["בטיחות קודם, אחר כך הערכה, הזעקה ועיסויים מהר ככל האפשר. 101 הוא מספר מד״א בישראל.", "Safety first, then assessment, calling for help and compressions as fast as possible. 101 is the emergency number in Israel."] },
  { id: "period", em: "🗓️", t: ["מחזורי אימון – מהגדול לקטן", "Training cycles – largest to smallest"],
    s: [["מאקרו־מחזור – שנה או עונה", "Macrocycle – a year or season"], ["מזו־מחזור – כמה שבועות", "Mesocycle – a few weeks"], ["מיקרו־מחזור – שבוע", "Microcycle – a week"], ["יחידת אימון – אימון אחד", "Training session – a single workout"]],
    e: ["תכנון תקופתי מחלק את השנה לשלבים, כל שלב לשבועות, וכל שבוע לאימונים.", "Periodisation splits the year into phases, each phase into weeks, and each week into sessions."] }
];

/* מפת הגוף – מפרקים ונקודה חשובה לכל שריר */
const LAB_MUS = {
  pecs: { j: ["כתף", "Shoulder"], tip: ["לחיצה בשיפוע עליון מדגישה את החלק העליון (הבריחי) של החזה.", "An incline press puts more emphasis on the upper (clavicular) chest."] },
  delts: { j: ["כתף", "Shoulder"], tip: ["שלושה ראשים: הקדמי עובד בכל לחיצה, האמצעי בהרמה צידית, והאחורי נשכח לרוב – כדאי לאמן אותו בנפרד.", "Three heads: the front works in every press, the middle in lateral raises, and the rear is often neglected – train it on purpose."] },
  biceps: { j: ["מרפק וכתף", "Elbow and shoulder"], tip: ["הדו־ראשי גם מסובב את האמה החוצה (סופינציה). הברכיאליס שמתחתיו הוא הכופף החזק של המרפק.", "The biceps also turns the forearm up (supination). The brachialis beneath it is the strongest elbow flexor."] },
  forearms: { j: ["מרפק ושורש כף היד", "Elbow and wrist"], tip: ["אחיזה חלשה מגבילה הרבה פעמים תרגילי משיכה כבדים לפני שהגב מתעייף.", "A weak grip often limits heavy pulls before the back tires out."] },
  abs: { j: ["עמוד השדרה", "Spine"], tip: ["ישר הבטן מכופף את הגו. ליציבות הוא עובד יחד עם הרוחבי, האלכסוניים וזוקפי הגו.", "The rectus abdominis flexes the trunk. For stability it works together with the transverse, obliques and erectors."] },
  obliques: { j: ["עמוד השדרה", "Spine"], tip: ["בסיבוב, האלכסוני החיצוני בצד אחד עובד יחד עם הפנימי בצד השני.", "In rotation, the external oblique on one side works with the internal oblique on the other."] },
  quads: { j: ["ברך וירך", "Knee and hip"], tip: ["ישר הירך הוא היחיד מבין הארבעה שחוצה גם את מפרק הירך.", "The rectus femoris is the only one of the four that also crosses the hip."] },
  tibialis: { j: ["קרסול", "Ankle"], tip: ["חשוב לרצים ולשיווי משקל – הוא שולט בנחיתה של כף הרגל.", "Important for runners and balance – it controls how the foot lands."] },
  traps: { j: ["שכמה וצוואר", "Shoulder blade and neck"], tip: ["העליון מרים את השכמות, האמצעי מקרב אותן והתחתון מוריד אותן – כולם חשובים ליציבה.", "The upper part lifts the shoulder blades, the middle pulls them together and the lower pulls them down – all matter for posture."] },
  lats: { j: ["כתף", "Shoulder"], tip: ["הרחב הגבי מתחבר גם לגב התחתון ולאגן, ולכן עוזר לייצב את הגו בדדליפט.", "The lats also attach to the lower back and pelvis, so they help stabilise the trunk in a deadlift."] },
  triceps: { j: ["מרפק וכתף", "Elbow and shoulder"], tip: ["הראש הארוך חוצה את הכתף, ולכן פשיטה מעל הראש מותחת ומאמנת אותו במיוחד.", "The long head crosses the shoulder, so overhead extensions stretch and train it the most."] },
  erectors: { j: ["עמוד השדרה", "Spine"], tip: ["בדדליפט ובסקוואט הם עובדים בעיקר סטטית – שומרים על הגב ישר.", "In deadlifts and squats they mostly work statically – keeping the back neutral."] },
  glutes: { j: ["ירך ואגן", "Hip and pelvis"], tip: ["העכוז האמצעי מייצב את האגן בעמידה על רגל אחת. חולשה בו קשורה לברך שנכנסת פנימה.", "The gluteus medius stabilises the pelvis on one leg. Weakness is linked to the knee caving in."] },
  hams: { j: ["ברך וירך", "Knee and hip"], tip: ["דו־מפרקי: דדליפט רומני מאמן אותו דרך הירך, וכפיפת ברכיים – דרך הברך. כדאי את שניהם.", "Two-joint muscle: the RDL trains it at the hip and the leg curl at the knee. Do both."] },
  calves: { j: ["קרסול (התאומים גם ברך)", "Ankle (gastrocnemius also the knee)"], tip: ["התאומים עובדים חזק בברך ישרה. בישיבה, עם ברך כפופה, עובד בעיקר הסולאוס.", "The gastrocnemius works hard with a straight knee. Seated, with a bent knee, the soleus does most of the work."] }
};
