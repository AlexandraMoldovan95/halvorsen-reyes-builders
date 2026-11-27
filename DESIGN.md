# DESIGN.md — Halvorsen & Reyes Builders

Visual style: **"Blueprint Editorial"** — an adaptation of the Newsprint style (designprompts.dev), translated for a vanilla static site (no React/Tailwind/shadcn) and adjusted for a construction client: the portfolio photos stay **color, not grayscale** — they sell the craftsmanship, they're not illustrating a newspaper.

Why it works for this company: the rigor of a grid with visible borders and square corners, no rounding, evokes blueprints and job-site precision, not just a "newspaper look". The typographic authority conveys trust (a serious company, since 2011), without looking like a media agency.

Don't blindly implement everything below as gospel — these are reference tokens and rules. If something doesn't look good applied to the real content (photos, copy), adjust it, but keep the logic: high contrast, visible grid, dramatic typography, zero unnecessary decoration.

---

## 1. Philosophy

**Precision + trust.** No soft gradients, no diffuse shadows, no rounded corners, no emoji in the UI. Structure is visible and celebrated (borders, grid), not hidden. Typography carries the hierarchy, not color.

Vibe: solid, direct, trustworthy — the kind of company that hands over the job on time and without excuses. Not "playful startup", not "fashion agency".

---

## 2. Colors

Single mode — light, permanent (no dark mode).

| Token | Value | Role |
|---|---|---|
| `--bg` | `#F9F9F7` | Background (warm white, not pure white — simulates paper/blueprint) |
| `--ink` | `#111111` | Main text + borders (deep black, not `#000`) |
| `--muted` | `#E5E5E0` | Secondary borders, subtle backgrounds |
| `--accent` | `#CC0000` | Editorial red — **used sparingly**: CTAs, badges, hover. 95%+ of the site is black/white |
| `--neutral-100` | `#F5F5F5` | Hover backgrounds |
| `--neutral-200` | `#E5E5E5` | Image placeholders |
| `--neutral-500` | `#737373` | Metadata, captions |
| `--neutral-600` | `#525252` | Body text variations |
| `--neutral-700` | `#404040` | Subtitles |

Contrast: black on `--bg` >17:1 (AAA). Red on `--bg` >5:1 (AA) — never put red on black.

---

## 3. Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Playfair Display', 'Times New Roman', serif;
  --font-body: 'Lora', Georgia, serif;
  --font-ui: 'Inter', 'Helvetica Neue', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}
```

- **H1 (Hero)** — `--font-display`, `clamp(2.75rem, 6vw, 7rem)`, `line-height: 0.95`, `letter-spacing: -0.02em`. One H1 per page, in the hero.
- **H2 (sections)** — `--font-display`, `clamp(2rem, 4vw, 3rem)`, `font-weight: 800`.
- **H3 (card/project titles)** — `--font-display`, `clamp(1.4rem, 2.5vw, 1.75rem)`, `font-weight: 700`.
- **Body** — `--font-body`, `1rem–1.125rem`, `line-height: 1.65`. As built: the longer texts (the team story, the project descriptions) use Lora; the short supporting texts (hero subtitle, section ledes, service card texts, founder bios, contact text) use `--font-ui` (Inter), as do the form and the chat. Body paragraphs stay under ~75 characters per line.
- **Metadata/labels** (e.g. "Est. 2011", phone, hours) — `--font-mono`, `0.75rem`, uppercase, `letter-spacing: 0.15em`.
- Navigation, buttons, UI labels → `--font-ui`, uppercase, `letter-spacing: 0.1em`.
- Titles/body → sentence case, never ALL CAPS on full sentences.

---

## 4. Shape: corners, borders, shadows

- **Border-radius: 0 everywhere.** No exceptions — not on buttons, not on inputs, not on cards.
- **Borders:** `1px solid var(--ink)` standard; `3px–4px solid` for major section separators. On adjacent grids (e.g. the 5 projects), neighboring cells share a border — never a doubled-up border.
- **Shadows:** no blur, no soft drop-shadow. One single effect, on hover:
```css
.hard-shadow:hover {
  box-shadow: 4px 4px 0 0 var(--ink);
  transform: translate(-2px, -2px);
}
```
(animate only `transform`, never `box-shadow` directly — Lighthouse Performance ≥85 is required)

---

## 5. Background texture (optional, subtle)

A very subtle dot grid on `body`, simulating paper/blueprint without being distracting:

```css
body {
  background-color: var(--bg);
  background-image: radial-gradient(var(--ink) 0.5px, transparent 0.5px);
  background-size: 16px 16px;
  background-position: 0 0;
  opacity: 1; /* the real density comes from the color's alpha, not from opacity on body */
}
```
Use a low-alpha variant (`rgba(17,17,17,0.04)`) instead of solid `var(--ink)`, to keep it subtle.

---

## 6. Photos — the single most important rule

**All 5 portfolio projects: color, untreated, highest quality.** They're the proof of the company's work — don't visually treat them (no grayscale, no sepia, no filters). Optimize technically (WebP, max 1600px width, lazy-load below the fold), but keep the real color.

The team photo (the actual photo, not the cartoon) can get a subtle editorial treatment — a frame with a thick `--ink` border and a `--font-mono` caption underneath ("Erik & Camila — since 2011"). The cartoon photo stays clean, no filters, as the chatbot avatar.

Placeholders (if a photo is temporarily missing): a radial dot pattern, not flat gray.

---

## 7. Buttons

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

The "Request a quote" button is `.btn-primary`. All tap targets ≥44×44px (required for mobile).

---

## 8. Cards / containers (projects, services)

```css
.card {
  border: 1px solid var(--ink);
  background: var(--bg);
  padding: 1.5rem;
}
```

Portfolio grid: adjacent columns share the right border (`border-right` on all but the last), all get `border-bottom` on mobile when they collapse into one column.

---

## 9. Inputs (the quote form)

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

Visual validation: an invalid field → `border-bottom-color: var(--accent)` + a text message under the field (not color alone — for accessibility).

---

## 10. Icons

No external library (avoids an extra dependency on a static site with no build step). Inline SVG, `stroke-width: 1.5`, `stroke: var(--ink)`, `fill: none`, standard `24×24` size / small `16×16`. In reversed sections (black background), `stroke: var(--bg)`.

Service icons: no container. The icon sits on the title's line, `28×28px`, `stroke: var(--accent)`, with the text under both (until 27 Nov 2026 it was a `48×48px` box with a `1px solid var(--ink)` border above the title, a shape AI site generators use everywhere).

---

## 11. Layout

- Container: `max-width: 1280px`, centered, `padding-inline: 1rem` (mobile) → `2rem` (desktop).
- Grid: native CSS Grid, `grid-template-columns: repeat(12, 1fr)`, no framework.
- Editorial splits, not 50/50: hero `8/4`, services `5/7`, footer `2 / 1 / 1 / 1`.
- Spacing on an 8px scale: `0.5rem / 1rem / 2rem / 4rem`. Mobile: one step smaller than desktop.

---

## 12. "Wow" moments (max 2, as the brief requires)

Not every "non-generic" element from the original Newsprint — only these two, well executed:

1. **Hero → card on scroll.** The Rancho Del Monico photo full-screen; on scroll it shrinks into a card with a thick border, the title appears word-by-word (GSAP SplitText + ScrollTrigger scrub).
2. **Portfolio — arrow-driven carousel, not horizontal scroll.** Changed from the original plan: page scroll stays strictly vertical everywhere, including in the portfolio section — no element hijacks the user's scroll. Moving between the 5 projects is explicit, with left/right arrow buttons and progress dots (click, not scroll). Still counts as the second "wow" moment — an animated `transform` transition, not a static list — but without scroll hijacking. Each project shows its large photo with a row of three small ones under it; any of the four opens a full-screen photo viewer (a `<dialog>`: the photo at 1600px, its description, "2 / 4", arrows and arrow keys, Escape or a click outside to close; on phones the arrows sit under the photo, and the carousel's arrows under the card).

Everything else (marquee ticker, "Vol. 1 Edition", drop caps everywhere) — **removed**. They don't serve a construction company and risk looking like a design experiment, not a professional site. One subtle drop-cap is acceptable, optional, on the first paragraph of the "About us" section — nowhere else.

Masthead-style metadata, adapted to the brand, if you want an echo of the editorial style without the "breaking news" tone:
```
EST. 2011 · DENVER, CO · TURNKEY HOMES · RENOVATIONS · ADDITIONS
```
in `--font-mono`, uppercase, under the logo or in the footer — not "Vol. 1 Edition".

---

## 13. Motion

Fast, mechanical, no organic/bouncy easing: `transition: all 0.2s ease-out`. Instant color inversion on button hover. Respects `prefers-reduced-motion`: when it's on, all GSAP animations stop and content is visible immediately (no requirement for the user to wait through a scroll).

---

## 14. Responsive

Breakpoints: mobile `<768px` (default) · tablet `768px+` · desktop `1024px+`.

On mobile: grids become `grid-template-columns: 1fr`, `border-right` disappears (keeps `border-bottom`), H1 drops to its minimum `clamp`, padding drops one step, CTAs become `width: 100%`, navigation becomes a hamburger (target ≥44px). **Required: at 375px width, zero horizontal scroll** — check this explicitly, it's in the acceptance test.

---

## 15. Accessibility

- Focus visible only on keyboard navigation: `:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }`.
- Semantic HTML: `header`, `nav`, `section`, `footer`, correct `h1`→`h3` hierarchy.
- `alt` on every image (including decorative ones — empty `alt=""` if they're truly decorative).
- Real buttons (`<button>`), not `<div onclick>`. The form has a `<label>` for every field.
- Target: Lighthouse Accessibility ≥90.

---

## 16. Implementation — constraints

- **Vanilla CSS + custom properties**, no Tailwind, no shadcn, no React. A single `styles.css` file or inline `<style>`, consistent with the rest of the static site.
- Fonts: `@import` Google Fonts (the only external host allowed), `display=swap` for performance.
- Animations: only `transform` and `opacity` (GPU-accelerated), never `box-shadow`/`width`/`height` directly.
- Below-the-fold images: `loading="lazy"`.
- No external icon library — inline SVG.
