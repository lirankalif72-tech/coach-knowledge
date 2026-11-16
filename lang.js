/* ───────── שפת שאלות: עברית / English (v8.9) ───────── */
const LANG_KEY = "ck_lang";
let LANG = (() => { try { return localStorage.getItem(LANG_KEY) || "he"; } catch (e) { return "he"; } })();
const isEn = () => LANG === "en";
function setLang(l) { LANG = l; try { localStorage.setItem(LANG_KEY, l); } catch (e) { } }

/* מחליף את השאלה בתרגום (או מחזיר לעברית) – בלי לשנות מזהה/תשובה נכונה */
function langItem(it) {
  if (!it || !it.q) return;
  if (!it.qHe) it.qHe = it.q;
  const he = it.qHe, tr = typeof QEN !== "undefined" ? QEN[he.id] : null;
  if (!isEn() || !tr) { it.q = he; return; }
  const q = Object.assign({}, he, { q: tr.q, e: tr.e });
  if (he.t === "mc" && tr.o) q.o = tr.o;
  if (he.t === "open" && tr.a) q.a = tr.a;
  it.q = q;
}
function langSession() { if (typeof session !== "undefined" && session && session.items) session.items.forEach(langItem); }

/* מילון ממשק מסך השאלה */
const UI_EN = {
  "✓ נכון": "✓ True", "✗ לא נכון": "✗ False", "נכון": "True", "לא נכון": "False",
  "בדיקת תשובה": "Check answer", "לשאלה הבאה ←": "Next question →", "לתוצאות 🏁": "To results 🏁",
  "התשובה הנכונה:": "Correct answer:", "💡 למה?": "💡 Why?", "☆ שמירת שאלה": "☆ Save question", "★ שמורה": "★ Saved",
  "⚑ דיווח על טעות": "⚑ Report a mistake", "❓ יש לי שאלה": "❓ I have a question", "📘 למד עוד על הנושא": "📘 Learn more",
  "→ הקודמת": "← Previous", "הבאה ←": "Next →", "הגשת המבחן": "Submit exam", "🏳️ סימון לבדיקה": "🏳️ Flag for review", "🚩 מסומנת": "🚩 Flagged",
  "📝 תשובה לדוגמה": "📝 Model answer", "איך ענית ביחס לתשובה לדוגמה?": "How did your answer compare to the model answer?",
  "לא ידעתי": "Didn't know", "חלקית": "Partly", "ידעתי": "Knew it", "לא מדויק": "Not quite",
  "נכון! 🎯": "Correct! 🎯", "מצוין! 💪": "Excellent! 💪", "בדיוק! ✨": "Exactly! ✨", "יפה מאוד! 👏": "Very good! 👏", "תשובה נכונה! 🔥": "Right answer! 🔥",
  "הדו־ראשי שלך גאה בך 💪": "Your biceps is proud of you 💪", "המיטוכונדריה מוחאות כפיים 🔋": "Your mitochondria are applauding 🔋",
  "זה היה נקי כמו דדליפט מושלם 🏋️": "Clean as a perfect deadlift 🏋️", "המוח שלך עושה PR 🧠": "Your brain just hit a PR 🧠",
  "אפילו הסרעפת נשמה לרווחה 🌬️": "Even your diaphragm breathed a sigh of relief 🌬️", "מדריך בהתהוות! 🧢": "Coach in the making! 🧢",
  "עומס מתקדם – על הידע 📈": "Progressive overload – for knowledge 📈", "זה נכנס ישר לזיכרון השריר 🧬": "Straight into muscle memory 🧬",
  "תשובה עם טכניקה מושלמת ✅": "An answer with perfect technique ✅", "וואו. ה־VO2max של הידע שלך עלה 🫁": "Wow. Your knowledge VO2max just went up 🫁",
  "💥 פגיעה בבוס!":"💥 Boss hit!", "👑 ניצחון! לתוצאות": "👑 Victory! To results", "💔 נגמרו הלבבות – לתוצאות": "💔 Out of hearts – to results",
  "🔊 הקראה": "🔊 Read aloud", "🛒": "🛒",
  "💡 לא בטוח? עזרה – למד על הנושא": "💡 Not sure? Help (Hebrew)", "💡 פתח שוב את העזרה": "💡 Open help again",
  "קל": "Easy", "בינוני": "Medium", "מתקדם": "Advanced", "מומחה": "Expert",
  "אמריקאית": "Multiple choice", "נכון / לא נכון": "True / False", "פתוחה": "Open",
  "אנטומיה ותנועה": "Anatomy & movement", "פיזיולוגיה ומערכות אנרגיה": "Physiology & energy systems", "טכניקת תרגילים": "Exercise technique",
  "תכנון אימונים ועומסים": "Program design & loads", "TRX וביומכניקה": "TRX & biomechanics", "סיטואציות מהשטח": "Real-world scenarios",
  "בטיחות וגבולות סמכות": "Safety & scope of practice", "תזונה בסיסית": "Basic nutrition", "אוכלוסיות מיוחדות": "Special populations",
  "פסיכולוגיה ומוטיבציה": "Psychology & motivation", "מילון מונחים": "Glossary"
};
const UI_RX = [
  [/^שאלה (\d+) מתוך (\d+)$/, "Question $1 of $2"],
  [/^· (\d+) נכונות$/, "· $1 correct"],
  [/^לא מדויק – נשארו (\d+) ❤️$/, "Not quite – $1 ❤️ left"],
  [/^😵 הבוס פגע בך – נשארו (\d+) ❤️$/, "😵 The boss hit you – $1 ❤️ left"],
  [/^ניווט מהיר · (\d+)\/(\d+) נענו$/, "Quick nav · $1/$2 answered"],
  [/^📘 שיעור על (.+)$/, "📘 Lesson (Hebrew)"],
  [/^דירגת: ידעתי ✅$/, "You rated: Knew it ✅"], [/^דירגת: חלקית 🟡$/, "You rated: Partly 🟡"], [/^דירגת: לא ידעתי ❌$/, "You rated: Didn't know ❌"],
  [/^✨ שאלת זהב · x3$/, "✨ Golden question · x3"],
  [/^🔥 (\d+) ברצף(.*)$/, "🔥 $1 in a row$2"],
  [/^(.+) (קהל|דילוג)$/, (m, a, b) => a + " " + (b === "קהל" ? "Audience" : "Skip")],
  [/^(\S+) (.+)$/, (m, ic, name) => UI_EN[name] ? ic + " " + UI_EN[name] : m]
];
function trText(t) {
  const s = t.trim(); if (!s || !/[֐-׿]/.test(s)) return null;
  if (UI_EN[s]) return t.replace(s, UI_EN[s]);
  for (const [rx, rep] of UI_RX) if (rx.test(s)) { const r = s.replace(rx, rep); if (r !== s) return t.replace(s, r); }
  return null;
}
function trTree(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n => {
    // תוכן השאלה עצמו (או שאלה בלי תרגום) – לא נוגעים, רק בתוויות ממשק
    if (n.parentElement && n.parentElement.closest(".qtext,.opt span:not(.k),figure,svg,.fig")) return;
    const r = trText(n.nodeValue); if (r !== null) n.nodeValue = r;
  });
  root.querySelectorAll("[placeholder]").forEach(el => { if (/[֐-׿]/.test(el.placeholder)) el.placeholder = "Write your answer here – short bullet points are great..."; });
  root.querySelectorAll(".opt .k").forEach(k => { const i = "אבגד".indexOf(k.textContent.trim()); if (i >= 0) k.textContent = "ABCD"[i]; });
  const q = root.querySelector("#quit"); q && q.setAttribute("aria-label", "Exit");
}

/* עוטף את מסך השאלה */
const _renderQuestionL = renderQuestion;
renderQuestion = function () {
  langSession();
  _renderQuestionL();
  if (!session) return;
  const root = app.querySelector(".fade-in"); if (!root) return;
  const head = root.querySelector(".qhead");
  if (head && !head.querySelector("#langBtn")) {
    const b = document.createElement("button");
    b.id = "langBtn"; b.className = "lang-btn"; b.type = "button";
    b.title = isEn() ? "החלפה לעברית" : "Switch to English";
    b.textContent = isEn() ? "🌐 עב" : "🌐 EN";
    b.onclick = () => { setLang(isEn() ? "he" : "en"); renderQuestion(); };
    head.appendChild(b);
  }
  if (isEn()) {
    root.setAttribute("dir", "ltr"); root.setAttribute("lang", "en"); root.classList.add("lang-en");
    trTree(root);
    const bm = root.querySelector("#bm");
    if (bm) bm.addEventListener("click", () => setTimeout(() => { bm.textContent = bm.classList.contains("on") ? "★ Saved" : "☆ Save question"; }, 0));
  }
};

/* תוצאות/סקירה אחרי מבחן – מציגים בשפה שנבחרה (התוכן כבר הוחלף) */

/* הקראה באנגלית */
if (typeof speak === "function") {
  const _speakL = speak;
  speak = function (text) {
    if (!isEn() || !("speechSynthesis" in window)) return _speakL(text);
    const t = String(text).replace(/ההסבר:/g, "Explanation:").replace(/נכון או לא נכון\?/g, "True or false?")
      .replace(/(^|\. )([אבגד])\. /g, (m, p, l) => p + "ABCD"["אבגד".indexOf(l)] + ". ");
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; u.rate = 1; speechSynthesis.speak(u); } catch (e) { }
  };
}

/* הגדרות: בחירת שפה */
const _renderSettingsL = renderSettings;
renderSettings = function () {
  _renderSettingsL();
  const first = app.querySelector(".fade-in .card"); if (!first) return;
  const c = document.createElement("div"); c.className = "card";
  c.innerHTML = `<h2>🌐 שפת השאלות · Question language</h2>
    <div class="seg" id="langSeg"><button data-k="he" class="${!isEn() ? "on" : ""}">🇮🇱 עברית</button><button data-k="en" class="${isEn() ? "on" : ""}" dir="ltr">🇬🇧 English</button></div>
    <p class="muted small" style="margin-top:8px">השאלות, התשובות וההסברים יוצגו בשפה שנבחרה. אפשר להחליף גם תוך כדי שאלון בכפתור 🌐 שבראש המסך. שאר המסכים יתורגמו בעדכונים הבאים.</p>`;
  first.after(c);
  c.querySelectorAll("#langSeg button").forEach(b => b.onclick = () => {
    setLang(b.dataset.k); toast("🌐", isEn() ? "Questions will appear in English" : "השאלות יוצגו בעברית"); renderSettings();
  });
};
