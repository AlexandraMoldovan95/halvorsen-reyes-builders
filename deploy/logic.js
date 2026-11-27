/* Halvorsen & Reyes Builders: the pure logic (no DOM, no network), shared by the page and
   the tests. Loaded in <head>, before theme-init.js (which needs pickTheme before the page is
   drawn) and before script.js, so these are globals there; in Node (tests/logic.test.js) the
   same file is loaded with require(). */

/* The quote form's checks. Returns { fieldId: message } for each field that fails;
   an empty object means the request can be sent. */
function validateLeadForm(data) {
  var errors = {};
  if (!data.nume || data.nume.trim().length < 2) errors["f-nume"] = "Enter your full name.";
  if (!data.telefon || data.telefon.replace(/\D/g, "").length < 7) errors["f-telefon"] = "Invalid phone number.";
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRe.test(data.email)) errors["f-email"] = "Invalid email address.";
  if (!data.tip_proiect) errors["f-tip"] = "Choose a project type.";
  if (!data.mesaj || data.mesaj.trim().length < 10) errors["f-mesaj"] = "Give us a few more words (min. 10 characters).";
  return errors;
}

/* The row sent to the leads table: only these six columns, text trimmed, and the budget as
   null when none was chosen. Anything else in the form data is never sent. */
function buildLeadPayload(data) {
  return {
    nume: data.nume.trim(),
    email: data.email.trim(),
    telefon: data.telefon.trim(),
    tip_proiect: data.tip_proiect,
    buget_estimat: data.buget_estimat || null,
    mesaj: data.mesaj.trim(),
  };
}

/* Whether config.js holds real Supabase values, not the TODO placeholders of a fresh copy. */
function isBackendConfigured(cfg) {
  return !!(cfg && cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf("TODO") === -1);
}

/* The chatbot's local fallback, used only when the real chat can't answer (the AI key is
   switched off between live demos, or the database is paused). Keyword-matched, not an LLM.
   Like the real assistant, it never gives a price: cost questions go to the quote form. */
var CHAT_FALLBACK_NOTICE = "(The AI assistant is switched off between live demos to keep running costs at zero, so I'm answering from a short local script instead.) ";

function localBotAnswer(msg) {
  var m = msg.toLowerCase();
  if (/hour|open|schedule|when/.test(m)) {
    return "We're open Monday–Friday, 8:00 AM–5:00 PM.";
  } else if (/where|location|area|denver|radius/.test(m)) {
    return "We work in Denver, Colorado and within a 50 km radius.";
  } else if (/price|cost|budget|quote|estimate|much/.test(m)) {
    return "Every project gets its own quote based on scope. The fastest way is the quote form on this page, or tell me a bit more about what you're planning.";
  } else if (/service|turnkey|renovat|addition|build/.test(m)) {
    return "We do three things: turnkey homes, full renovations, and additions: from an empty lot to handing over the keys, or just the extra space you need.";
  } else if (/contact|phone|email|call|reach/.test(m)) {
    return "Call (555) 010-2411 or email hello@hr-builders.example. Camila usually replies the same business day.";
  }
  return "I don't have a specific answer for that one. The quote form on this page is the fastest way to reach Camila directly, or call (555) 010-2411.";
}

/* The photo viewer: which photo comes next. Steps by `delta` (+1 next, -1 previous) and wraps
   around, so "next" on the last photo shows the first one. With no photos it stays at 0. */
function stepPhoto(index, delta, count) {
  if (!(count > 0)) return 0;
  return (((index + delta) % count) + count) % count;
}

/* The theme to show: the visitor's saved choice ("dark" or "light", from the header
   button) wins; anything else, including nothing saved yet, follows the system setting. */
function pickTheme(saved, systemPrefersDark) {
  if (saved === "dark" || saved === "light") return saved;
  return systemPrefersDark ? "dark" : "light";
}

/* In Node (the tests) `module` exists and the functions are exported; in the browser it
   doesn't, so this is skipped and everything above stays a plain global for script.js. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validateLeadForm: validateLeadForm, buildLeadPayload: buildLeadPayload,
                     isBackendConfigured: isBackendConfigured, CHAT_FALLBACK_NOTICE: CHAT_FALLBACK_NOTICE,
                     localBotAnswer: localBotAnswer, stepPhoto: stepPhoto, pickTheme: pickTheme };
}
