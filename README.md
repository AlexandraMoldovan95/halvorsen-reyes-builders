# Halvorsen & Reyes Builders — site

Site public, one-page, pentru firma fictivă de construcții Halvorsen & Reyes Builders (Denver, CO). Temă „Vibe Coding" — stepIT.

**Live:** https://halvorsen-reyes-builders-655f70.netlify.app/

> Codul din acest folder e cu un pas înaintea site-ului live (optimizări de performanță care nu au mai putut fi publicate în producție) — vezi secțiunea [Performanță (Lighthouse)](#performanță-lighthouse).

## Stack

- **Frontend**: HTML/CSS/JS vanilla (fără framework, fără build step), animații GSAP + ScrollTrigger, hostat static pe **Netlify**.
- **Backend**: **Supabase** — tabel `leads` (RLS: doar INSERT public) + Edge Function `chat` (Deno) care apelează Anthropic API cu cheia ținută secretă în Supabase. Chatbot-ul și formularul au **limite de folosire** (vezi [mai jos](#limite-de-folosire-adăugate-după-predare)).
- **Design**: `DESIGN.md` — adaptare a stilului Newsprint (designprompts.dev) pentru un vanilla stack, cu paletă negru/alb + roșu editorial, tipografie Playfair Display + Lora + Inter + JetBrains Mono, găzduite local în `fonts/` (vezi `fonts/README.md`).
- **Imagini**: WebP, max 1600px lățime pentru pozele mari (proiecte + echipă); miniaturile din portofoliu au variante proprii de 480px (`*-thumb.webp`), generate separat, ca să nu se descarce fișierul de 1600px pentru o poză afișată la ~150px. Toate imaginile de sub primul ecran au `loading="lazy"`. În carusel, pozele proiectelor 2–5 se încarcă abia când ajungi la ele (plus proiectul următor, după încărcarea paginii).

## Structură

```
index.html              site-ul (o pagină)
styles.css               stiluri, token-uri din DESIGN.md
script.js                nav mobil, animații GSAP, formular, chatbot
config.js                URL + cheie anon Supabase (completează după setup)
images/                  poze optimizate (proiecte + echipă)
fonts/                   fonturile site-ului (subset latin + diacritice), licență OFL
admin.html, admin.js     panou admin (Erik & Camila) — login + listă cereri, în afara temei
supabase/schema.sql       tabelul leads + RLS, tabelul admins + RLS pt. panoul admin
supabase/functions/chat/  Edge Function pentru chatbot (cu limită de mesaje)
supabase/rate_limits.sql  limite de folosire: chatbot 20/oră/vizitator + 300/zi, formular 30/oră + 3/zi/email
SUPABASE_SETUP.md         pași manuali de configurare (o singură dată)
deploy/                   copie DOAR cu fișierele site-ului, pentru Netlify: `netlify deploy --prod --dir deploy`
CLAUDE.md, DESIGN.md      context și decizii de design pentru Claude Code
```

## Setup rapid

Vezi `SUPABASE_SETUP.md` — creezi proiectul Supabase, rulezi `schema.sql`, deployezi funcția `chat`, pui cheia Anthropic ca secret, completezi `config.js`, apoi faci deploy pe Netlify.

## Plugin-uri Claude Code folosite

*(completat după pasul de instalare plugin-uri în Claude Code — minim 3 plugin-uri, minim 2 marketplace-uri)*

| Plugin | Marketplace | Ce a făcut concret pentru acest site |
|---|---|---|
| `frontend-design` | `claude-plugins-official` | Review al `index.html` + `styles.css` față de `DESIGN.md`. A găsit și reparat: focus invizibil pe câmpurile formularului (`#F0F0F0` pe `#F9F9F7`, ~1.05:1) și pe fundalurile negre (hero, contact, header chat); skip link care nu devenea niciodată vizibil; ținte tactile sub 44px (butonul de închidere chat, punctele carusel-ului); `border-radius: 50%` pe avatarul chatbot-ului (contrar regulii „0 peste tot"); greutatea 800 a Playfair Display cerută în CSS, dar neîncărcată din Google Fonts; token `--neutral-400` folosit, dar nedefinit; focusul nereturnat la închiderea formularului. |
| `security-guidance` | `claude-plugins-official` | Plugin pe bază de hook-uri: verifică automat fiecare fișier editat de Claude după ~25 de pattern-uri periculoase (XSS, secrete hardcodate, deserializare nesigură etc.). Am rulat verificatorul lui de pattern-uri pe tot codul (`config.js`, `script.js`, `admin.js`, `index.html`, `admin.html`, `supabase/schema.sql`, `supabase/functions/chat/index.ts`). **Nu a găsit nicio cheie secretă** în cod. A semnalat 3 lucruri: (1) scripturile GSAP de pe cdnjs fără Subresource Integrity → reparat, am adăugat `integrity` + `crossorigin`; (2) `innerHTML` în `script.js` la titlul din hero → reparat, reconstruit cu noduri DOM; (3) `innerHTML` în `admin.js` → verificat manual, fals pozitiv (toate câmpurile trec prin `escapeHtml`). Review-ul LLM al diff-urilor și cel al commit-urilor au nevoie de un repo git, iar proiectul nu e încă repo git. |
| `commit-commands` | `claude-plugins-official` | Instalat și disponibil pentru commit-uri locale (`/commit`, `/commit-push-pr`), dar nu a fost folosit încă — proiectul nu e încă repo git. |
| `impeccable` | `pbakaus/impeccable` (marketplace separat, nu `claude-plugins-official`) | Audit de design/calitate cu `/impeccable audit`: a rulat un detector determinist (61 de reguli) plus verificare directă în browser, la 1440px și 375px, repetat de 5 ori pe măsură ce am reparat ce a găsit. Scor: 14 → 17 → 18 → 19 → **20/20**. A găsit real, în ordine: (1) Tab ieșea din formularul de ofertă către elemente ascunse din fundal; câmp de chat fără `aria-label`; răspunsurile chatbot-ului nu erau anunțate de screen reader; contrast insuficient pe textul din hero; toate imaginile serveau varianta de 1600px inclusiv miniaturile afișate la 54–152px, fără `loading="lazy"`; (2)-(3) probleme mai mici de focus/contrast/dimensiune text rămase după runda 1; drop cap-ul se scurgea peste numele fondatorilor; (4)-(5) poza echipei nedeliniată cu restul secțiunii (`<figure>` fără `margin:0`), săriturile din meniu aterizau sub header-ul fix (fără `scroll-padding-top`), și o problemă de conținut pe care audit-ul a semnalat-o explicit ca decizie a mea, nu bug de cod: legenda pozei numea „Erik & Camila", dar poza stock arată trei bărbați neidentificați — am rescris legenda generic (nu mai promite identități anume) și am corectat separat o distorsiune de lentilă vizibilă în poza stock (`cv2.undistort`, coeficient -0.15, apoi recadrare pentru eliminarea marginilor negre rezultate). Am verificat fiecare semnal manual (contrast real măsurat, nu doar citit din raport) și am aplicat toate reparațiile reale; câteva semnale P3 finale (linie dublă de 1-3px sub header la scroll — `scroll-padding-top` era cu ~1px mai mare decât header-ul real) au fost reparate direct, măsurând înălțimea reală a header-ului cu Playwright în loc să ghicesc valoarea. Verificat cu Playwright după fiecare modificare, nu doar rulat orbește. |

## Performanță (Lighthouse)

Cerința din temă: Performance ≥ 85, Accessibility ≥ 90. Măsurat cu PageSpeed Insights (Lighthouse), pe 24.09.2026:

| Versiune | Mobil — Performance | Desktop — Performance | Accessibility | Best Practices |
|---|---|---|---|---|
| **Live** (link-ul de mai sus) | 69 | 96 | 100 | 96 |
| **Codul din acest folder** (verificat pe un deploy draft Netlify, 2 rulări) | **93** | **100** | 100 | 100 |

Draft-ul verificat: https://6ab52dcb5fd9a02f6634399b--halvorsen-reyes-builders-655f70.netlify.app/ — același cod ca în folder. SEO iese 63 doar pe draft, pentru că Netlify marchează automat deploy-urile draft cu `noindex`; pe live e 100. Draft-ul servește doar ca dovadă pentru Lighthouse: chatbot-ul răspunde numai pe link-ul live (funcția `chat` acceptă doar originile din `ALLOWED_ORIGINS`).

**De ce nu e codul optimizat și pe live:** pe planul Free, Netlify a blocat deploy-urile de producție după epuizarea creditelor lunare (`netlify deploy --prod` → `Forbidden`; rămân doar „operational credits”, care țin site-ul online). Draft-urile nu consumă credite, de aceea optimizările au putut fi verificate acolo. Codul intră pe live la primul deploy de producție după resetarea creditelor, fără alte modificări.

**Ce s-a schimbat față de live** (și cât a contat, pe mobil):

1. **Pozele din carusel** — înainte, la deschiderea paginii se descărcau pozele tuturor celor 5 proiecte (22 de imagini, ~559 KB) și concurau cu poza din hero. Acum doar proiectul 1 (7 imagini, ~245 KB); restul se încarcă la navigare. LCP: 5,5 s → 4,3 s.
2. **Fonturi găzduite local** — Google Fonts aducea 8 fișiere (~296 KB) de pe 2 domenii în plus. Acum 7 fișiere (~145 KB), generate din sursele oficiale doar cu grosimile folosite. FCP: 3,8 s → 2,0 s, LCP: 4,3 s → 2,5 s.
3. **Fără layout shift la schimbarea fontului** — titlul din hero avea lățimea în `ch` (unitate care depinde de fontul curent), așa că sărea de pe 3 rânduri pe 2 când se încărca Playfair (CLS 0,32 pe desktop). Lățimile sunt acum în `em`, iar fonturile de rezervă au metrici ajustate (`size-adjust`). CLS desktop: 0,32 → 0,002.
4. Scripturile cu `defer`, `preconnect` spre cdnjs.
5. Două bug-uri vizuale găsite pe parcurs: poza echipei și miniaturile din portofoliu ieșeau deformate/înalte pe ecrane înguste (atributul `height` din HTML bătea `aspect-ratio`) — reparate cu `height: auto`.

## Limite de folosire (adăugate după predare)

Adăugate pe 24.09.2026, după predarea temei. Funcția `chat` și formularul pot fi apelate de oricine are cheia publică din site (`config.js`), deci fără limite cineva ar putea trimite mesaje în buclă pe cheia Anthropic sau umple `leads` cu spam. Limitele stau în **Supabase**, deci n-a fost nevoie de deploy pe Netlify.

| Ce | Limita | Unde |
|---|---|---|
| **Chatbot, per vizitator** | **20 de mesaje pe oră** | `chat_allow()` în `supabase/rate_limits.sql`, apelată din funcția `chat` **înainte** de Anthropic |
| **Chatbot, total** | **300 de mesaje pe zi** | la fel |
| **Formular, total** | **30 de cereri pe oră** | trigger `leads_rate_limit` pe tabelul `leads` |
| **Formular, per email** | **3 cereri pe zi** | la fel |

- **Peste limita chatbot-ului**, vizitatorul primește un răspuns normal de chat („am pus chat-ul pe pauză…”) care îl trimite la formular, iar **Anthropic nu mai e apelat**. Site-ul existent îl afișează fără nicio modificare.
- **Confidențialitate:** vizitatorul e recunoscut după o **amprentă (hash SHA-256) a IP-ului**, nu după IP. Amprentele stau în tabelul `chat_usage` (RLS pornit, fără politici: inaccesibil din site) și se șterg după 2 zile.
- **Dacă verificarea nu se poate face** (ex. baza de date nu răspunde), chatbot-ul **refuză** mesajul în loc să-l trimită mai departe. Nu există limită de cheltuieli în Anthropic Console, deci limita din cod e singura protecție de cost.
- **Limitele se pot schimba fără cod**, din secretele funcției: `CHAT_LIMIT_PER_HOUR`, `CHAT_LIMIT_PER_DAY`.
- **Verificare:** SQL-ul testat pe Postgres local (rulat de 2 ori, limitele pe oră/zi/email, cheia `anon` nu poate apela funcția și nu poate citi tabelul). Live: primul mesaj a apărut în `chat_usage`, iar cu `CHAT_LIMIT_PER_HOUR=2` chatbot-ul a răspuns cu mesajul de pauză la limită; secretul a fost șters după test.
- Pașii de instalare: `SUPABASE_SETUP.md`, pasul 10.

## Abateri de la ghid (documentate)

Ce nu s-a făcut exact ca în PDF-ul temei / ghidul „Referințe și animații”, și de ce:

1. **Serverul MCP Supabase a fost adăugat abia la final.** Tabelele, RLS și funcția `chat` au fost create manual: `supabase/schema.sql` rulat în SQL Editor (fișier versionat în proiect), codul funcției pus din dashboard. De aceea lista de migrări din Supabase e goală. La final am adăugat MCP-ul oficial Supabase în mod **read-only** (`.mcp.json`) și l-am folosit pentru verificare:
   - `leads`: RLS pornit, politică INSERT doar pentru `anon`, SELECT doar pentru adminii autentificați (`is_admin()`); constrângeri CHECK pe toate câmpurile.
   - `admins`: RLS pornit, fără politici — intenționat, nu e accesibil prin API, e citit doar de `is_admin()`.
   - Security advisors: **0 erori**, 2 avertismente minore, lăsate intenționat: `is_admin()` e `SECURITY DEFINER` apelabilă de utilizatorii logați (le spune doar dacă ei înșiși sunt admini; funcția trebuie să rămână executabilă, altfel politica de citire pentru admini nu mai funcționează), și protecția împotriva parolelor compromise e oprită (contează doar pentru conturile de admin).
2. **`REFERENCE.md` a fost scris după build, nu înainte.** Designul pornește din `DESIGN.md` și din poze; analiza site-ului model (thorsenconstruction.us, cu Playwright MCP) a fost făcută ulterior, ca documentare. Nu s-a copiat text, poze sau cod.
3. **Animația titlului din hero rulează la încărcarea paginii, nu cu scrub.** Celelalte animații sunt legate de scroll (micșorarea hero-ului și parallax-ul pozelor cu `scrub`, apariția portofoliului la scroll). Un titlu ascuns până la primul scroll ar fi lăsat hero-ul fără titlu la deschidere.
4. **Portofoliul e un carusel cu săgeți, nu o secțiune pinned cu scroll orizontal**, fără Lenis și fără colțuri rotunjite la hero — decizii de design (scroll-ul paginii rămâne strict vertical; `DESIGN.md` cere colțuri drepte). `prefers-reduced-motion` e respectat: cu opțiunea activă, animațiile GSAP nu pornesc și conținutul e vizibil direct.
5. **Pozele sunt servite de pe Netlify**, nu din Supabase Storage (cum apare în schema de arhitectură) — sunt fișiere statice ale site-ului, deja optimizate WebP.
6. **Proiectul nu e un repo git**, deci nu există istoric de commit-uri.

## Test de acceptanță

Verificat pe site-ul live, 24.09.2026.

- [x] URL public se încarcă; la 375px lățime nu există scroll orizontal
- [x] Toate cele 5 proiecte apar cu poze proprii și descriere; echipa apare cu poza
- [x] Chat: „Cine sunt proprietarii?" → Erik Halvorsen și Camila Reyes
- [x] Chat: „Ce proiecte ați făcut?" → cele 5, cu nume corecte
- [x] Chat: „Cât costă o casă de 150 mp?" → nu inventează preț, trimite la formular
- [x] Chat: „Scrie-mi o poezie" → refuză politicos
- [x] View Source / Network: cheia Anthropic nu apare nicăieri
- [x] Formular trimis → rândul apare în tabelul `leads`
- [x] Formular cu email gol sau invalid → respins, cu mesaj clar
- [x] Cu cheia `anon`, SELECT pe `leads` întoarce 0 rânduri
- [x] Lighthouse: Accessibility ≥ 90 — 100 (mobil)
- [ ] Lighthouse: Performance ≥ 85 — pe live: desktop 96 ✅, mobil 69 ❌; pe codul din folder (draft): mobil 93 ✅, desktop 100 ✅ — vezi [Performanță (Lighthouse)](#performanță-lighthouse)
- [x] README.md: ≥ 3 plugin-uri, ≥ 2 marketplace-uri, rolul fiecăruia
