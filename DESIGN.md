# DESIGN.md — Halvorsen & Reyes Builders

Stil vizual: **"Blueprint Editorial"** — adaptare a stilului Newsprint (designprompts.dev), tradusă pentru un site static vanilla (fără React/Tailwind/shadcn) și corectată pentru un client de construcții: pozele de portofoliu rămân **color, nu grayscale** — ele vând meșteșugul, nu ilustrează un ziar.

De ce funcționează pentru firma asta: rigoarea grid-ului cu borduri vizibile și unghiurile drepte, fără rotunjiri, evocă blueprint-uri și precizie de șantier, nu doar "aspect de ziar". Autoritatea tipografică transmite încredere (o firmă serioasă, din 2011), fără să pară o agenție de media.

Nu implementa orbește tot ce scrie mai jos ca literă de lege — sunt token-uri și reguli de referință. Dacă ceva nu arată bine aplicat pe conținutul real (poze, texte), ajustează, dar păstrează logica: contrast mare, grid vizibil, tipografie dramatică, zero decor inutil.

---

## 1. Filozofie

**Precizie + încredere.** Fără gradient-uri moi, fără umbre difuze, fără colțuri rotunjite, fără emoji în UI. Structura e vizibilă și celebrată (borduri, grid), nu ascunsă. Tipografia face ierarhia, nu culoarea.

Vibe: solid, direct, de încredere — genul de firmă care predă lucrarea la timp și fără scuze. Nu "startup jucăuș", nu "agenție de modă".

---

## 2. Culori

Mod unic — light, permanent (fără dark mode).

| Token | Valoare | Rol |
|---|---|---|
| `--bg` | `#F9F9F7` | Fundal (alb cald, nu alb pur — simulează hârtie/blueprint) |
| `--ink` | `#111111` | Text principal + borduri (negru profund, nu `#000`) |
| `--muted` | `#E5E5E0` | Borduri secundare, fundaluri subtile |
| `--accent` | `#CC0000` | Roșu editorial — **folosit rar**: CTA-uri, badge-uri, hover. 95%+ din site e negru/alb |
| `--neutral-100` | `#F5F5F5` | Hover backgrounds |
| `--neutral-200` | `#E5E5E5` | Placeholder-uri imagini |
| `--neutral-500` | `#737373` | Metadata, caption-uri |
| `--neutral-600` | `#525252` | Variații text body |
| `--neutral-700` | `#404040` | Subtitluri |

Contrast: negru pe `--bg` >17:1 (AAA). Roșu pe `--bg` >5:1 (AA) — nu pune niciodată roșu pe negru.

---

## 3. Tipografie

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Playfair Display', 'Times New Roman', serif;
  --font-body: 'Lora', Georgia, serif;
  --font-ui: 'Inter', 'Helvetica Neue', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}
```

- **H1 (Hero)** — `--font-display`, `clamp(2.75rem, 6vw, 7rem)`, `line-height: 0.95`, `letter-spacing: -0.02em`. Un singur H1 pe pagină, în hero.
- **H2 (secțiuni)** — `--font-display`, `clamp(2rem, 4vw, 3rem)`, `font-weight: 800`.
- **H3 (titluri carduri/proiecte)** — `--font-display`, `clamp(1.4rem, 2.5vw, 1.75rem)`, `font-weight: 700`.
- **Body** — `--font-body`, `1rem–1.125rem`, `line-height: 1.65`.
- **Metadata/labels** (ex: "Est. 2011", telefon, program) — `--font-mono`, `0.75rem`, uppercase, `letter-spacing: 0.15em`.
- Navigație, butoane, etichete de UI → `--font-ui`, uppercase, `letter-spacing: 0.1em`.
- Titluri/body → sentence case, niciodată ALL CAPS pe propoziții întregi.

---

## 4. Formă: colțuri, borduri, umbre

- **Border-radius: 0 peste tot.** Fără excepții — nici la butoane, nici la input-uri, nici la carduri.
- **Borduri:** `1px solid var(--ink)` standard; `3px–4px solid` pentru separatoare majore de secțiune. La grid-uri alăturate (ex. cele 5 proiecte), cotele partajează bordura — nu bordură dublă.
- **Umbre:** fără blur, fără drop-shadow moale. Un singur efect, la hover:
```css
.hard-shadow:hover {
  box-shadow: 4px 4px 0 0 var(--ink);
  transform: translate(-2px, -2px);
}
```
(animă doar `transform`, niciodată `box-shadow` direct — cere Lighthouse Performance ≥85)

---

## 5. Textură de fundal (opțional, discret)

Punct-grid foarte subtil pe `body`, simulează hârtie/blueprint fără să distragă:

```css
body {
  background-color: var(--bg);
  background-image: radial-gradient(var(--ink) 0.5px, transparent 0.5px);
  background-size: 16px 16px;
  background-position: 0 0;
  opacity: 1; /* densitatea reală vine din alpha-ul culorii, nu din opacity pe body */
}
```
Folosește o variantă cu alpha mic (`rgba(17,17,17,0.04)`) în loc de `var(--ink)` plin, ca să rămână discret.

---

## 6. Poze — regula cea mai importantă

**Toate cele 5 proiecte de portofoliu: color, netratate, calitate maximă.** Sunt dovada muncii firmei — nu le trata vizual (fără grayscale, fără sepia, fără filtre). Optimizează tehnic (WebP, max 1600px lățime, lazy-load sub fold), dar păstrează culoarea reală.

Poza de echipă (cea foto, nu cartoon) poate primi un tratament editorial discret — un cadru cu bordură groasă `--ink` și un caption tip `--font-mono` sub ea ("Erik & Camila — din 2011"). Poza cartoon rămâne curată, fără filtre, ca avatar pentru chatbot.

Placeholder-uri (dacă o poză lipsește temporar): pattern radial de puncte, nu gri plat.

---

## 7. Butoane

```css
.btn-primary {
  background: var(--ink);
  color: var(--bg);
  border: 1px solid var(--ink);
  font-family: var(--font-ui);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.9rem 1.75rem;
  min-height: 44px;
  transition: background 0.2s ease-out, color 0.2s ease-out;
}
.btn-primary:hover { background: var(--bg); color: var(--ink); }

.btn-secondary {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--ink);
}
.btn-secondary:hover { background: var(--ink); color: var(--bg); }
```

Butonul „Cere o ofertă" e `.btn-primary`. Toate țintele tactile ≥44×44px (obligatoriu pentru mobil).

---

## 8. Carduri / containere (proiecte, servicii)

```css
.card {
  border: 1px solid var(--ink);
  background: var(--bg);
  padding: 1.5rem;
}
```

Grid de portofoliu: coloanele adiacente partajează bordura dreaptă (`border-right` pe toate mai puțin ultima), toate au `border-bottom` pe mobil când se prăbușesc într-o coloană.

---

## 9. Input-uri (formularul de ofertă)

```css
.field {
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--ink);
  font-family: var(--font-mono);
  font-size: 0.95rem;
  padding: 0.6rem 0.25rem;
  border-radius: 0;
}
.field:focus-visible {
  outline: none;
  background: #F0F0F0;
}
```

Validare vizuală: câmp invalid → `border-bottom-color: var(--accent)` + mesaj text sub câmp (nu doar culoare — pentru accesibilitate).

---

## 10. Iconițe

Fără librărie externă (evită dependință suplimentară pe un site static fără build step). SVG inline, `stroke-width: 1.5`, `stroke: var(--ink)`, `fill: none`, dimensiune `24×24` standard / `16×16` mic. În secțiuni inversate (fundal negru), `stroke: var(--bg)`.

Container opțional pentru iconițe de servicii: cutie cu bordură `1px solid var(--ink)`, `48×48px`, hover → fundal negru + iconiță albă.

---

## 11. Layout

- Container: `max-width: 1280px`, centrat, `padding-inline: 1rem` (mobil) → `2rem` (desktop).
- Grid: CSS Grid nativ, `grid-template-columns: repeat(12, 1fr)`, fără framework.
- Split-uri editoriale, nu 50/50: hero `8/4`, servicii `5/7`, footer `2 / 1 / 1 / 1`.
- Spațiere pe scară de 8px: `0.5rem / 1rem / 2rem / 4rem`. Mobil: un pas mai mic decât desktop.

---

## 12. Momente "wow" (maxim 2, cum cere tema)

Nu toate elementele "non-generice" din Newsprint original — doar astea două, bine executate:

1. **Hero → card la scroll.** Poza de la Rancho Del Monico full-screen; la scroll se micșorează într-un card cu bordură groasă, titlul apare cuvânt-cu-cuvânt (GSAP SplitText + ScrollTrigger scrub).
2. **Portofoliu — carusel pe săgeți, nu scroll orizontal.** Decizie schimbată față de planul inițial: scroll-ul pe pagină rămâne strict vertical peste tot, inclusiv în secțiunea portofoliu — niciun element nu deturnează scroll-ul utilizatorului. Trecerea între cele 5 proiecte se face explicit, cu butoane săgeată stânga/dreapta și puncte de progres (click, nu scroll). Rămâne al doilea moment "wow" — tranziție `transform` animată, nu o listă statică — dar fără hijacking de scroll.

Restul (marquee ticker, "Vol. 1 Edition", drop caps peste tot) — **eliminat**. Nu servesc unei firme de construcții și riscă să pară un experiment de design, nu un site profesional. Un singur drop-cap discret e acceptabil, opțional, pe primul paragraf din secțiunea "Despre noi" — nimic altundeva.

Metadata stil masthead, adaptată pe brand, dacă vrei un ecou al stilului editorial fără tonul de "breaking news":
```
EST. 2011 · DENVER, CO · CASE LA CHEIE · RENOVĂRI · EXTINDERI
```
în `--font-mono`, uppercase, sub logo sau în footer — nu "Vol. 1 Edition".

---

## 13. Mișcare

Rapidă, mecanică, fără easing organic/bouncy: `transition: all 0.2s ease-out`. Inversare instant de culoare la hover pe butoane. Respectă `prefers-reduced-motion`: dacă e activ, toate animațiile GSAP se opresc, conținutul e vizibil direct (fără cerință ca utilizatorul să aștepte un scroll).

---

## 14. Responsive

Breakpoints: mobil `<768px` (default) · tabletă `768px+` · desktop `1024px+`.

Pe mobil: grid-urile devin `grid-template-columns: 1fr`, `border-right` dispare (rămâne `border-bottom`), H1 scade la `clamp` minim, padding-urile scad cu un pas, CTA-urile devin `width: 100%`, navigația devine hamburger (țintă ≥44px). **Obligatoriu: la 375px lățime, zero scroll orizontal** — verifică explicit, e în testul de acceptanță.

---

## 15. Accesibilitate

- Focus vizibil doar la navigare cu tastatura: `:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }`.
- HTML semantic: `header`, `nav`, `section`, `footer`, ierarhie corectă `h1`→`h3`.
- `alt` pe toate imaginile (inclusiv cele decorative — text gol `alt=""` dacă chiar sunt decorative).
- Butoane reale (`<button>`), nu `<div onclick>`. Formularul are `<label>` pentru fiecare câmp.
- Țintă: Lighthouse Accessibility ≥90.

---

## 16. Implementare — constrângeri

- **Vanilla CSS + custom properties**, fără Tailwind, fără shadcn, fără React. Un singur fișier `styles.css` sau `<style>` inline, consistent cu restul site-ului static.
- Fonturi: `@import` Google Fonts (singurul host extern acceptat), `display=swap` pentru performanță.
- Animații: doar `transform` și `opacity` (accelerate GPU), niciodată `box-shadow`/`width`/`height` direct.
- Imagini sub fold: `loading="lazy"`.
- Nicio librărie de iconițe externă — SVG inline.
