/* ───────── שפה: עברית / English (v8.9.2) ─────────
   - השאלות מתורגמות מ־QEN (questions_en.js)
   - כל שאר הטקסטים מתורגמים מהמילון LANG_EN (lang_en.js):
     * נתונים (שיעורים, עובדות, מילון, תרגילים...) מוחלפים במקום, ונשמר עותק לשחזור
     * טקסט שמופיע על המסך מתורגם אוטומטית (MutationObserver) */
const LANG_KEY = "ck_lang";
let LANG = (() => { try { return localStorage.getItem(LANG_KEY) || "he"; } catch (e) { return "he"; } })();
const isEn = () => LANG === "en";
const HEB = /[֐-׿]/;
const LD = typeof LANG_EN !== "undefined" ? LANG_EN : {};

/* ───── תרגום מחרוזת ───── */
const RUN_RX = /[֐-׿][֐-׿0-9 ׳״'־\-–—,.?!:;()%\/]*/g;
const PFX = { "ו": "and ", "ב": "in ", "ל": "to ", "מ": "from ", "ה": "the ", "ש": "that ", "כ": "as " };
function lCore(t) {
  t = t.trim();
  for (let k = 0; k < 3; k++) {
    t = t.replace(/[\s,:;\-–—(]+$/, "").trim();
    if ((t.match(/\)/g) || []).length > (t.match(/\(/g) || []).length) t = t.replace(/\)+$/, "").trim();
    t = t.replace(/^'+|'+$/g, "").trim();
  }
  return t;
}
function lLook(p) {
  if (LD[p]) return LD[p];
  const m = p.match(/^(.*?)([.!?:]+)$/); if (m && LD[m[1]]) return LD[m[1]] + m[2];
  return null;
}
function lWord(w) {
  let r = lLook(w); if (r) return r;
  const pm = w.match(/^([("'\u05F4]*)(.*?)([)"'\u05F4,.:;!?]*)$/);
  if (pm && (pm[1] || pm[3]) && pm[2] && (r = lWord(pm[2]))) return pm[1] + r + pm[3];
  let m = w.match(/^([ובלמהשכ]{1,2})־(.+)$/); // ב־10
  if (m) { const rest = HEB.test(m[2]) ? lLook(m[2]) : m[2]; if (rest) return m[1].split("").map(c => PFX[c] || "").join("") + rest; }
  m = w.match(/^([ובלמה])(.{2,})$/);
  if (m && (r = lLook(m[2]))) return (PFX[m[1]] || "") + r;
  return null;
}
function lRun(run) {
  const core = lCore(run); if (!core) return run;
  const i = run.indexOf(core), pre = run.slice(0, i), post = run.slice(i + core.length);
  const d = lLook(core); if (d) return pre + d + post;
  const tk = core.split(/\s+/), out = []; let heb = 0, miss = 0;
  for (let a = 0; a < tk.length;) {
    let hit = null, b = tk.length;
    for (; b > a; b--) { const ph = tk.slice(a, b).join(" "); hit = b - a === 1 ? lWord(ph) : lLook(ph); if (hit) break; }
    if (hit) { out.push(hit); tk.slice(a, b).forEach(w => { if (HEB.test(w)) heb++; }); a = b; }
    else { if (HEB.test(tk[a])) { heb++; miss++; } out.push(tk[a]); a++; }
  }
  if (!heb || miss * 2 > heb) return run;
  return pre + out.join(" ") + post;
}
function trStr(s) {
  if (!s || !HEB.test(s)) return s;
  const t = s.trim(); const d = LD[t]; if (d) return s.replace(t, d);
  return s.replace(RUN_RX, lRun);
}
/* מחרוזת עם תגיות (SVG/HTML) – מתרגמים רק את הטקסט שבין התגיות */
const trMarkup = s => s.replace(/>([^<]+)</g, (m, t) => ">" + trStr(t) + "<");

/* ───── החלפת נתונים במקום (עם שחזור) ───── */
const L_DATA = "TOPICS GLOSSARY FIGS LESSONS FACTS CARDS RARITY WHOAMI STORIES EXERCISES PROG_LIB PROG_GOALS PROG_SPLITS CAREER LEAGUES FUN_PRAISE AV PETS WQ UPS COURSE DEMOS DRILLS FIRSTAID MUSCLES TIMER_PRESETS SPOT VISUALS VZ_EX VZ_GENERIC PB_GROUPS PB_EX PB_GOALS PB_LVLS PB_IDEAS PB_TPL PB_TPLS WL_RIR WL_METRICS TR_KIND TR_LV TR_PCT LEVELS TYPES ACH DIFF_NAMES ITEMS THEMES WHEEL TIERS STAGES SRC_LABEL REM_OPTS BOT_NAMES PRAISE LETTERS".split(" ");
let L_UNDO = [];
function lSwapData() {
  const seen = new WeakSet();
  const walk = o => {
    if (!o || typeof o !== "object" || seen.has(o) || (o.q && o.f && o.t)) return; seen.add(o);
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === "string") {
        if (!HEB.test(v)) continue;
        let n = LD[v.trim()] || (v.includes("<") ? trMarkup(v) : trStr(v));
        if (o === LETTERS_REF) n = "ABCD"["אבגד".indexOf(v)] || v;
        if (n !== v) { L_UNDO.push([o, k, v]); try { o[k] = n; } catch (e) { } }
      } else if (v && typeof v === "object") walk(v);
    }
  };
  L_DATA.forEach(g => { let v; try { v = eval(g); } catch (e) { return; } walk(v); });
  // מאגר השאלות עצמו – כדי שכל המצבים (דו־קרב, מיליונר, משחקים, חזרה...) יהיו באנגלית
  if (typeof BANK !== "undefined" && typeof QEN !== "undefined") BANK.forEach(q => {
    const tr = QEN[q.id]; if (!tr) return;
    const set = (k, v) => { if (v == null || q[k] === v) return; L_UNDO.push([q, k, q[k]]); q[k] = v; };
    set("q", tr.q); set("e", tr.e);
    if (q.t === "mc" && tr.o) set("o", tr.o);
    if (q.t === "open" && tr.a) set("a", tr.a);
  });
  if (typeof TERM_RE !== "undefined") { try { TERM_RE = null; } catch (e) { } }
}
const LETTERS_REF = (() => { try { return LETTERS; } catch (e) { return null; } })();
function lRestoreData() { for (let i = L_UNDO.length - 1; i >= 0; i--) { const [o, k, v] = L_UNDO[i]; try { o[k] = v; } catch (e) { } } L_UNDO = []; try { TERM_RE = null; } catch (e) { } }

/* מונחים באנגלית: לזהות גם באותיות קטנות */
if (typeof buildTerms === "function") {
  const _bt = buildTerms;
  buildTerms = function () {
    _bt();
    if (!isEn()) return;
    Object.keys(TERM_INDEX).forEach(n => { const l = n.toLowerCase(); if (l !== n && !TERM_INDEX[l]) TERM_INDEX[l] = TERM_INDEX[n]; });
    const alts = Object.keys(TERM_INDEX).filter(n => !HEB.test(n)).sort((a, b) => b.length - a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    TERM_RE = new RegExp(`(^|[\\s"'(–\\-/,.:;])()(${alts.join("|")})(?=$|[\\s.,:;!?)"'–\\-/])`, "g");
  };
}

/* ───── תרגום המסך ───── */
const L_ORIG = new WeakMap(), L_OUT = new WeakMap();
const L_DAYS = { "א": "S", "ב": "M", "ג": "T", "ד": "W", "ה": "T", "ו": "F", "ש": "S" };
const swapArrows = s => s.replace(/[←→]/g, c => c === "←" ? "→" : "←");
function lNode(n) {
  const v = n.nodeValue; if (!v) return;
  if (L_OUT.get(n) === v) return;
  if (!HEB.test(v)) {
    if (/^[\s←→]+$/.test(v) && /[←→]/.test(v)) { const p0 = n.parentElement; if (p0 && !p0.closest("[data-notr]")) { const r0 = swapArrows(v); if (!L_ORIG.has(n)) L_ORIG.set(n, v); n.nodeValue = r0; L_OUT.set(n, r0); } }
    return;
  }
  const p = n.parentElement; if (!p || p.closest("script,style,textarea,[data-notr],[contenteditable]")) return;
  let r;
  const t = v.trim();
  const t1 = t.replace(/[\u05F3']$/, "");
  if (t1.length === 1 && "אבגדהוש".includes(t1)) {
    r = p.closest(".k,.lopt") ? v.replace(t, "ABCD"["אבגד".indexOf(t1)] || t) : v.replace(t, L_DAYS[t1] || t);
  } else r = trStr(swapArrows(v));
  if (r !== v) { if (!L_ORIG.has(n)) L_ORIG.set(n, v); n.nodeValue = r; L_OUT.set(n, r); }
}
const L_ATTR = ["placeholder", "title", "aria-label"];
function lAttrs(el) {
  if (!el || el.id === "foodIn") return;
  L_ATTR.forEach(a => { const v = el.getAttribute && el.getAttribute(a); if (v && HEB.test(v)) { const r = trStr(v); if (r !== v) { el.dataset["lo" + a.replace("-", "")] = v; el.setAttribute(a, r); } } });
}
function lTree(root) {
  if (!root) return;
  if (root.nodeType === 3) return lNode(root);
  if (root.nodeType !== 1) return;
  if (root.closest && root.closest("script,style,textarea,[data-notr]")) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const a = []; while (w.nextNode()) a.push(w.currentNode); a.forEach(lNode);
  lAttrs(root); root.querySelectorAll("[placeholder],[title],[aria-label]").forEach(lAttrs);
}
let L_OBS = null;
function lObserve(on) {
  if (L_OBS) { L_OBS.disconnect(); L_OBS = null; }
  if (!on) return;
  L_OBS = new MutationObserver(ms => {
    for (const m of ms) {
      if (m.type === "characterData") lNode(m.target);
      else if (m.type === "attributes") lAttrs(m.target);
      else m.addedNodes.forEach(lTree);
    }
  });
  L_OBS.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: L_ATTR });
}
function lRestoreScreen() {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const a = []; while (w.nextNode()) a.push(w.currentNode);
  a.forEach(n => { const o = L_ORIG.get(n); if (o !== undefined && L_OUT.get(n) === n.nodeValue) n.nodeValue = o; });
  document.querySelectorAll("*").forEach(el => L_ATTR.forEach(at => { const k = "lo" + at.replace("-", ""); if (el.dataset && el.dataset[k]) { el.setAttribute(at, el.dataset[k]); delete el.dataset[k]; } }));
}

/* דיאלוגים מובנים של הדפדפן */
["alert", "confirm", "prompt"].forEach(f => { const o = window[f]; if (typeof o !== "function") return; window[f] = function (m, ...r) { return o.call(window, isEn() ? trStr(String(m ?? "")) : m, ...r); }; });

/* ───── הפעלה / כיבוי ───── */
const L_TITLE = document.title;
function lApply() {
  const en = isEn();
  document.documentElement.setAttribute("dir", en ? "ltr" : "rtl");
  document.documentElement.setAttribute("lang", en ? "en" : "he");
  document.body.classList.toggle("lang-en", en);
  if (en) { if (!L_UNDO.length) lSwapData(); document.title = trStr(L_TITLE); lObserve(true); lTree(document.body); }
  else { lObserve(false); lRestoreData(); lRestoreScreen(); document.title = L_TITLE; }
}
function setLang(l) { LANG = l; try { localStorage.setItem(LANG_KEY, l); } catch (e) { } lApply(); }

/* ───── שאלות: החלפה ל־QEN ───── */
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

/* איורים נבחרים לפי נוסח השאלה המקורי (עברית) */
if (typeof figHtml === "function") {
  const _fh = figHtml;
  figHtml = function (q) { const o = q && q.id && typeof BY_ID !== "undefined" ? BY_ID[q.id] : null; return _fh(o && o !== q ? Object.assign({}, o, { img: q.img || o.img }) : q); };
}

const _renderQuestionL = renderQuestion;
renderQuestion = function () {
  langSession();
  _renderQuestionL();
  if (!session) return;
  const root = app.querySelector(".fade-in"); if (!root) return;
  const head = root.querySelector(".qhead");
  if (head && !head.querySelector("#langBtn")) {
    const b = document.createElement("button");
    b.id = "langBtn"; b.className = "lang-btn"; b.type = "button"; b.dataset.notr = "1";
    b.title = isEn() ? "החלפה לעברית" : "Switch to English";
    b.textContent = isEn() ? "🌐 עב" : "🌐 EN";
    b.onclick = () => { setLang(isEn() ? "he" : "en"); renderQuestion(); };
    head.appendChild(b);
  }
};

/* הקראה באנגלית */
if (typeof speak === "function") {
  const _speakL = speak;
  speak = function (text) {
    if (!isEn() || !("speechSynthesis" in window)) return _speakL(text);
    const t = trStr(String(text));
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; u.rate = 1; speechSynthesis.speak(u); } catch (e) { }
  };
}

/* הגדרות: בחירת שפה */
const _renderSettingsL = renderSettings;
renderSettings = function () {
  _renderSettingsL();
  const first = app.querySelector(".fade-in .card"); if (!first) return;
  const c = document.createElement("div"); c.className = "card"; c.dataset.notr = "1";
  c.innerHTML = `<h2>🌐 שפה · Language</h2>
    <div class="seg" id="langSeg"><button data-k="he" class="${!isEn() ? "on" : ""}">🇮🇱 עברית</button><button data-k="en" class="${isEn() ? "on" : ""}" dir="ltr">🇬🇧 English</button></div>
    <p class="muted small" style="margin-top:8px">${isEn() ? "The whole app – questions, lessons, glossary, plan and tools – appears in English. You can also switch during a quiz with the 🌐 button. The food database stays in Hebrew." : "כל האפליקציה – שאלות, שיעורים, מילון, תוכנית וכלים – תוצג בשפה שנבחרה. אפשר להחליף גם תוך כדי שאלון בכפתור 🌐."}</p>`;
  first.before(c);
  c.querySelectorAll("#langSeg button").forEach(b => b.onclick = () => {
    if (b.dataset.k === LANG) return;
    setLang(b.dataset.k); go("settings");
    toast("🌐", isEn() ? "The app is now in English" : "האפליקציה בעברית");
  });
};

lApply();
if (isEn()) { try { go(typeof tab !== "undefined" ? tab : "home"); } catch (e) { } }
