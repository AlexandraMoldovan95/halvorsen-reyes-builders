# REFERENCE.md — Reference site analysis: thorsenconstruction.us

> **Process note:** this analysis was done **after** the Halvorsen & Reyes Builders site was already built, as documentation of the process, **not** as a starting point. The Halvorsen & Reyes design comes from `DESIGN.md` (a Newsprint adaptation) and the photos in `Group/`. This document serves only as a point of comparison with a real luxury home builder's site.

- **URL:** https://thorsenconstruction.us/
- **Analysis date:** 2026-09-23
- **Tool:** Playwright (MCP), Chromium
- **Viewports:** 1440×900 (desktop) and 375×812 (mobile)
- **Cookie banner:** none appeared (no cookie/consent element in the DOM), so there was nothing to dismiss.

## Screenshots (`reference-screenshots/`)

I scrolled one screen at a time, with a 1s pause before each capture. The page is short, so there are 7 section captures, under the 10-image cap, plus one hover detail capture.

| File | Content |
|---|---|
| `desktop-1440-01.png` | Header + hero video |
| `desktop-1440-02.png` | "Our Philosophy" + start of the project grid |
| `desktop-1440-03.png` | Rest of the grid, the "View all residences" button, footer |
| `desktop-1440-04-hover-card.png` | A project card in its hover state (a detail shot, not a section) |
| `mobile-375-01.png` … `mobile-375-04.png` | Same sections at 375px |

Page height: **2643px** at 1440px and **3057px** at 375px.

## Section structure

1. **Header** (`header.banner`, 112px, white background, `position: static`, so **not** sticky)
   - "THORSEN" logo (maroon, with a crest) on the left and the PROFILE / RESIDENCES / CONTACT nav on the right.
   - On mobile: centered logo, and the links are stacked vertically and always visible. No hamburger menu.
2. **Hero** (`section.page-header`, 768px on desktop and 680px on mobile, black background)
   - Background Vimeo video (`?background=1&autoplay=1&loop=1`), full-bleed.
   - Centered H1: "YOUR DREAM / OUR PASSION", with a round play button below it that opens a second Vimeo video with sound, in a Plyr player.
   - Vertical "est. 1976" text rotated 90° in the bottom-right corner.
   - "SCROLL" indicator with a chevron, centered at the bottom.
3. **Our Philosophy** (`.page-content > .container`)
   - Centered H2 with a short blue rule underneath (~48px wide).
   - A quote ("Luxury is anything that feels special" — Aerin Lauder) + 2 paragraphs, in a narrow centered column (~900px).
4. **Project grid (Residences)**: 4 `article.residence`, 2 per row (`col-md-6`) and 1 per row on mobile.
   - Projects: Chain Bridge Road (Washington, DC), Collingwood (Alexandria, VA), Country Retreat (Middleburg, VA), Belle Rive (Alexandria, VA).
   - **Color** photos, roughly 2:1 ratio, no text in the normal state.
   - **Hover:** a semi-transparent dark overlay appears, with the project name in spaced-out capitals and the location underlined with a blue line.
5. **CTA:** outline "VIEW ALL RESIDENCES" button, centered.
6. **Footer** (58px, minimal): gray logo on the left, Instagram icon in the center, and a "BECCA" (the agency) credit on the right.

The site has few sections: no services, team, testimonials, or form on the homepage. Contact is on a separate page.

## Fonts

| Role | Font | Details |
|---|---|---|
| Entire site | **Cormorant** (serif, self-hosted woff2, weights 300/400/400 italic/700) | A single font for headings, body, nav, and buttons |
| Declared fallback | `sans-serif` | Likely an oversight, since a serif's fallback would normally be `sans-serif` only as a last resort |

Type scale (desktop → mobile):

| Element | Size | Weight | Letter-spacing | Transform |
|---|---|---|---|---|
| H1 hero | 35.2px → 25.8px | 500 | 10.56px (0.3em) | uppercase |
| H2 section | 31.7px → 24.5px | 500 | 9.5px (0.3em) | uppercase |
| Nav / links | 16px | 400 | 4.8px (0.3em) | uppercase |
| Button | 17.6px | 400 | 5.28px (0.3em) | uppercase |
| Body | 17.6px (1.1rem), line-height 1.5 | 400 | normal | none |

The site's visual signature is **very wide tracking (0.3em) on everything in caps**, paired with a thin classic serif. The headings are surprisingly small. The elegance comes from spacing, not letter size.

## Palette

| Role | Color | Where |
|---|---|---|
| Background | `#FFFFFF` | Page, header |
| Primary text | `#212529` | Headings, body (Bootstrap default) |
| Secondary text | `#4A5464` | Blue-gray text |
| Accent | `#3990C3` (`--bs-primary`) | Rule under H2, outline button, location underline, "BECCA" link |
| Accent hover | `#00B2FF` | Link hover states |
| Brand | maroon (~`#7A1F3D`, in the logo image) | Logo only |
| Hero | `#000000` + video | Hero background |
| Overlay | `rgba(0,0,0,0.55)` | Hover on project cards |

The palette is nearly monochrome (white, black, and charcoal gray), with a single cool blue accent. The photos/video carry all the color.

## Spacing and grid

- **Framework:** Bootstrap 5 (`.container`, `.row`, `col-md-6`, `--bs-gutter-x: 1.5rem`).
- **Container:** practically full-width (~1425px at 1440), with only 12px of side padding. The photo grid reaches almost to the screen edges.
- **Vertical rhythm:** `margin: 96px 0` between `.layout-section` blocks. The Philosophy section has roughly 150px of breathing room above the heading.
- **Gutter between cards:** ~24px horizontal and ~40px vertical.
- **Button:** `padding: 15px 20px`, 2.67px border, **`border-radius: 0`** (square corners, same as ours).
- The Philosophy text is capped at roughly 900px wide for readability. It contrasts with the nearly full-bleed photos.

## Animation libraries and scripts

Checked in `window` and in the `app-Hy05wa7x.js` bundle (~170 KB):

| Check | Result |
|---|---|
| `window.gsap` / ScrollTrigger | **Absent** (no "gsap" string in the bundle) |
| Lenis (`window.Lenis`, `lenis` class on `<html>`) | **Absent** |
| Locomotive Scroll, AOS, anime.js, Barba, Swiper, Splide, Three.js | **Absent** |
| jQuery | **Absent** |
| `IntersectionObserver` in the bundle | **Absent** |

Scripts actually loaded:

- `app-Hy05wa7x.js`: the WordPress theme's Vite bundle (Roots Bedrock/Sage stack: `/wp/`, `/app/themes/thorsen/`). Contains Bootstrap JS, Font Awesome (SVG), and **Plyr** (video player).
- `player.vimeo.com/api/player.js`: controls the hero video.
- Google Analytics (`analytics.js` + `gtag`, UA and GA4).
- `wp-emoji-release.min.js` (WordPress default) and speculation rules for prefetching.
- CSS: compiled Bootstrap 5 + Plyr, no Tailwind. The only `@keyframes` are the ones from Bootstrap and Plyr (spinner, progress, `plyr-fade-in`).

## Scroll effects

**None.** I compared `opacity`, `transform`, `position`, and `background-position` for ~1500 elements before and after scrolling through the entire page, and the differences were **zero**. There are no reveals, no parallax, no sticky header, no smooth scroll. Scrolling is the browser's native scroll.

The only motion on the page comes from:
- the **hero's background video**, playing on loop;
- **card hover**, with a dark overlay and title (CSS transitions, `transition: all`);
- standard Bootstrap CSS transitions on buttons and links (0.15s ease-in-out).

## Comparison with Halvorsen & Reyes (observations only, no code)

| Aspect | Thorsen | Halvorsen & Reyes |
|---|---|---|
| Stack | WordPress + Bootstrap + Vite | Vanilla HTML/CSS/JS, no build |
| Fonts | A single serif (Cormorant), 0.3em tracking | Playfair Display + Lora + JetBrains Mono |
| Palette | White/charcoal + cool blue | Black/white + editorial red |
| Corners | Square (0 radius) | Square (0 radius) |
| Portfolio photos | Color, static 2×2 grid, hover overlay | Color, arrow-driven carousel |
| Hero | Full-bleed Vimeo video | Hero with a shrink effect (GSAP ScrollTrigger) |
| Scroll animations | None | GSAP + ScrollTrigger, respecting `prefers-reduced-motion` |
| Header | Static, nav visible on mobile too | See `index.html` |

Conclusion: Thorsen leans on a "quiet" luxury feel, with large photography and video, small and heavily spaced type, and zero scroll animations. Halvorsen & Reyes chose a more expressive editorial direction, with controlled motion. The two approaches meet at the square corners and at letting color photography dominate.
