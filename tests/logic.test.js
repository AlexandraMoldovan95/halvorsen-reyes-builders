// Tests for logic.js: the quote form's checks, the row sent to Supabase, the config check,
// the chatbot's local fallback answers, the photo viewer's next/previous step, and the theme.
// No browser, no network, no Supabase.
// Run:  node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../logic.js");

const GOOD = { nume: "Jane Doe", telefon: "(555) 010-2411", email: "jane@example.com",
               tip_proiect: "renovare_completa", buget_estimat: "", mesaj: "Kitchen and two bathrooms." };

// ---------- the quote form ----------

test("a complete request passes", () => {
  assert.deepEqual(L.validateLeadForm(GOOD), {});
});

test("an empty form flags all five required fields, each with its own message", () => {
  const errors = L.validateLeadForm({ nume: "", telefon: "", email: "", tip_proiect: "", mesaj: "" });
  assert.deepEqual(Object.keys(errors).sort(), ["f-email", "f-mesaj", "f-nume", "f-telefon", "f-tip"]);
  assert.equal(errors["f-tip"], "Choose a project type.");
});

test("the phone number counts digits, so spaces, dashes and brackets are fine", () => {
  assert.equal(L.validateLeadForm({ ...GOOD, telefon: "+1 (555) 010-2411" })["f-telefon"], undefined);
  assert.equal(L.validateLeadForm({ ...GOOD, telefon: "555-01" })["f-telefon"], "Invalid phone number.");
});

test("an email needs a name, an @ and a domain with a dot, and no spaces", () => {
  for (const bad of ["jane", "jane@example", "@example.com", "jane doe@example.com"]) {
    assert.equal(L.validateLeadForm({ ...GOOD, email: bad })["f-email"], "Invalid email address.", bad);
  }
});

test("spaces around the name or the message don't count toward their minimum length", () => {
  assert.ok(L.validateLeadForm({ ...GOOD, nume: "  J  " })["f-nume"]);
  assert.equal(L.validateLeadForm({ ...GOOD, mesaj: "   abcdefghij   " })["f-mesaj"], undefined);   // 10: enough
  assert.ok(L.validateLeadForm({ ...GOOD, mesaj: "   abcdefghi    " })["f-mesaj"]);                // 9: too short
});

// ---------- what is sent ----------

test("the row sent to Supabase: trimmed text, no budget becomes null", () => {
  assert.deepEqual(L.buildLeadPayload({ ...GOOD, nume: "  Jane Doe ", email: " jane@example.com " }), {
    nume: "Jane Doe", email: "jane@example.com", telefon: "(555) 010-2411",
    tip_proiect: "renovare_completa", buget_estimat: null, mesaj: "Kitchen and two bathrooms.",
  });
});

test("a chosen budget is kept as is", () => {
  assert.equal(L.buildLeadPayload({ ...GOOD, buget_estimat: "50k_150k" }).buget_estimat, "50k_150k");
});

test("only the six columns are sent, whatever else the form data holds", () => {
  const sent = L.buildLeadPayload({ ...GOOD, status: "approved", is_admin: "true", id: "1" });
  assert.deepEqual(Object.keys(sent).sort(), ["buget_estimat", "email", "mesaj", "nume", "telefon", "tip_proiect"]);
});

// ---------- config ----------

test("a fresh copy with the TODO placeholders counts as not connected", () => {
  assert.equal(L.isBackendConfigured({ SUPABASE_URL: "https://TODO-your-project.supabase.co" }), false);
  assert.equal(L.isBackendConfigured({}), false);
  assert.equal(L.isBackendConfigured(undefined), false);
  assert.equal(L.isBackendConfigured({ SUPABASE_URL: "https://abc.supabase.co" }), true);
});

// ---------- the chatbot's local fallback ----------

test("cost questions never get a price, only the way to a quote", () => {
  for (const q of ["How much does a 1,600 sq ft home cost?", "What's your price for an addition?", "Can you give me an estimate?"]) {
    const a = L.localBotAnswer(q);
    assert.match(a, /quote/, q);
    assert.doesNotMatch(a, /\$|\d/, q);
  }
});

test("hours, area, services and contact get their own answers, whatever the case", () => {
  assert.match(L.localBotAnswer("WHAT ARE YOUR HOURS?"), /Monday–Friday, 8:00 AM–5:00 PM/);
  assert.match(L.localBotAnswer("Do you work in Denver?"), /50 km radius/);
  assert.match(L.localBotAnswer("Do you do renovations?"), /turnkey homes, full renovations, and additions/);
  assert.match(L.localBotAnswer("What's your phone number?"), /\(555\) 010-2411/);
});

test("anything else is pointed to the form or a call, not answered with made-up facts", () => {
  const a = L.localBotAnswer("Write me a poem about bricks");
  assert.match(a, /quote form/);
  assert.match(a, /\(555\) 010-2411/);
});

test("the first fallback answer explains that the AI is switched off", () => {
  assert.match(L.CHAT_FALLBACK_NOTICE, /switched off/);
  assert.ok(L.CHAT_FALLBACK_NOTICE.endsWith(" "));   // glued to the answer that follows
});

// ---------- the photo viewer ----------

test("next and previous move one photo inside a project's set", () => {
  assert.equal(L.stepPhoto(0, 1, 4), 1);
  assert.equal(L.stepPhoto(2, -1, 4), 1);
});

test("next on the last photo shows the first, previous on the first shows the last", () => {
  assert.equal(L.stepPhoto(3, 1, 4), 0);
  assert.equal(L.stepPhoto(0, -1, 4), 3);
});

test("with one photo or none, the viewer stays on it", () => {
  assert.equal(L.stepPhoto(0, 1, 1), 0);
  assert.equal(L.stepPhoto(0, -1, 1), 0);
  assert.equal(L.stepPhoto(0, 1, 0), 0);
});

// ---------- the theme ----------

test("a saved choice wins over the system setting", () => {
  assert.equal(L.pickTheme("light", true), "light");
  assert.equal(L.pickTheme("dark", false), "dark");
});

test("with nothing saved, the system setting decides", () => {
  assert.equal(L.pickTheme(null, true), "dark");
  assert.equal(L.pickTheme(null, false), "light");
});

test("a saved value that isn't dark or light is ignored", () => {
  assert.equal(L.pickTheme("purple", true), "dark");
  assert.equal(L.pickTheme("", false), "light");
});
