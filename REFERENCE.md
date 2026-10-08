# REFERENCE.md — Analiză site de referință: thorsenconstruction.us

> **Notă de proces:** această analiză s-a făcut **după** ce site-ul Halvorsen & Reyes Builders era deja construit, ca documentare a procesului, **nu** ca bază de pornire. Designul Halvorsen & Reyes vine din `DESIGN.md` (adaptare Newsprint) și din pozele din `Group/`. Documentul de față servește doar ca termen de comparație cu un site real de constructor de case de lux.

- **URL:** https://thorsenconstruction.us/
- **Data analizei:** 2026-09-23
- **Unealta:** Playwright (MCP), Chromium
- **Viewport-uri:** 1440×900 (desktop) și 375×812 (mobil)
- **Banner de cookies:** nu a apărut (nu există niciun element de tip cookie/consent în DOM), deci nu a fost nimic de închis.

## Capturi (`reference-screenshots/`)

Am derulat câte un ecran, cu o pauză de 1 s înainte de fiecare captură. Pagina e scurtă, așa că au ieșit 7 capturi de secțiune, sub limita de 10, plus o captură de detaliu la hover.

| Fișier | Conținut |
|---|---|
| `desktop-1440-01.png` | Header + hero video |
| `desktop-1440-02.png` | „Our Philosophy” + începutul grilei de proiecte |
| `desktop-1440-03.png` | Restul grilei, butonul „View all residences”, footer |
| `desktop-1440-04-hover-card.png` | Card de proiect în starea hover (detaliu, nu secțiune) |
| `mobile-375-01.png` … `mobile-375-04.png` | Aceleași secțiuni la 375px |

Înălțimea paginii: **2643px** la 1440px și **3057px** la 375px.

## Structura secțiunilor

1. **Header** (`header.banner`, 112px, fundal alb, `position: static`, deci **nu** e sticky)
   - Logo „THORSEN” (bordo, cu blazon) în stânga și nav-ul PROFILE / RESIDENCES / CONTACT în dreapta.
   - Pe mobil: logo centrat, iar linkurile sunt stivuite vertical și vizibile tot timpul. Nu există meniu hamburger.
2. **Hero** (`section.page-header`, 768px pe desktop și 680px pe mobil, fundal negru)
   - Video Vimeo pe fundal (`?background=1&autoplay=1&loop=1`), full-bleed.
   - H1 centrat: „YOUR DREAM / OUR PASSION”, cu buton rotund de play dedesubt, care deschide un al doilea video Vimeo cu sunet, în player Plyr.
   - Text vertical „est. 1976” rotit 90° în colțul din dreapta jos.
   - Indicator „SCROLL” cu chevron, centrat jos.
3. **Our Philosophy** (`.page-content > .container`)
   - H2 centrat cu un filet scurt albastru dedesubt (~48px lățime).
   - Citat („Luxury is anything that feels special” — Aerin Lauder) + 2 paragrafe, într-o coloană îngustă centrată (~900px).
4. **Grila de proiecte (Residences)**: 4 `article.residence`, câte 2 pe rând (`col-md-6`) și 1 pe rând pe mobil.
   - Proiecte: Chain Bridge Road (Washington, DC), Collingwood (Alexandria, VA), Country Retreat (Middleburg, VA), Belle Rive (Alexandria, VA).
   - Poze **color**, raport aproximativ 2:1, fără text în starea normală.
   - **Hover:** apare un overlay întunecat semi-transparent, cu numele proiectului în majuscule spațiate și locația subliniată cu o linie albastră.
5. **CTA:** buton outline „VIEW ALL RESIDENCES”, centrat.
6. **Footer** (58px, minimal): logo gri în stânga, iconiță Instagram la centru și credit „BECCA” (agenția) în dreapta.

Site-ul are puține secțiuni: nu are servicii, echipă, testimoniale sau formular pe homepage. Contactul e pe o pagină separată.

## Fonturi

| Rol | Font | Detalii |
|---|---|---|
| Tot site-ul | **Cormorant** (serif, self-hosted woff2, greutăți 300/400/400 italic/700) | Un singur font pentru titluri, body, nav și butoane |
| Fallback declarat | `sans-serif` | Probabil o scăpare, fiindcă un serif are fallback `sans-serif` |

Scala tipografică (desktop → mobil):

| Element | Mărime | Greutate | Letter-spacing | Transform |
|---|---|---|---|---|
| H1 hero | 35.2px → 25.8px | 500 | 10.56px (0.3em) | uppercase |
| H2 secțiune | 31.7px → 24.5px | 500 | 9.5px (0.3em) | uppercase |
| Nav / linkuri | 16px | 400 | 4.8px (0.3em) | uppercase |
| Buton | 17.6px | 400 | 5.28px (0.3em) | uppercase |
| Body | 17.6px (1.1rem), line-height 1.5 | 400 | normal | none |

Semnătura vizuală a site-ului e **tracking-ul foarte larg (0.3em) pe tot ce e majuscule**, combinat cu un serif clasic subțire. Titlurile sunt surprinzător de mici. Eleganța vine din spațiere, nu din mărimea literelor.

## Paletă

| Rol | Culoare | Unde |
|---|---|---|
| Fundal | `#FFFFFF` | Pagină, header |
| Text principal | `#212529` | Titluri, body (default Bootstrap) |
| Text secundar | `#4A5464` | Texte gri-albăstrui |
| Accent | `#3990C3` (`--bs-primary`) | Filet sub H2, buton outline, sublinierea locației, link „BECCA” |
| Accent hover | `#00B2FF` | Stări hover ale linkurilor |
| Brand | bordo (~`#7A1F3D`, în logo-ul imagine) | Doar în logo |
| Hero | `#000000` + video | Fundalul hero-ului |
| Overlay | `rgba(0,0,0,0.55)` | Hover pe cardurile de proiect |

Paleta e aproape monocromă (alb, negru și gri-cărbune), cu un singur accent albastru rece. Poza/videoul duce toată culoarea.

## Spațiere și grid

- **Framework:** Bootstrap 5 (`.container`, `.row`, `col-md-6`, `--bs-gutter-x: 1.5rem`).
- **Container:** practic full-width (~1425px la 1440), cu padding lateral de doar 12px. Grila de poze ajunge aproape de marginile ecranului.
- **Ritm vertical:** `margin: 96px 0` între blocurile `.layout-section`. Secțiunea Philosophy are aproximativ 150px de aer deasupra titlului.
- **Gutter între carduri:** ~24px orizontal și ~40px vertical.
- **Buton:** `padding: 15px 20px`, bordură 2.67px, **`border-radius: 0`** (colțuri drepte, ca la noi).
- Textul din Philosophy e limitat la aproximativ 900px lățime pentru lizibilitate. Contrastează cu pozele aproape full-bleed.

## Biblioteci de animație și scripturi

Verificate în `window` și în bundle-ul `app-Hy05wa7x.js` (~170 KB):

| Verificare | Rezultat |
|---|---|
| `window.gsap` / ScrollTrigger | **Absent** (niciun string „gsap” în bundle) |
| Lenis (`window.Lenis`, clasa `lenis` pe `<html>`) | **Absent** |
| Locomotive Scroll, AOS, anime.js, Barba, Swiper, Splide, Three.js | **Absente** |
| jQuery | **Absent** |
| `IntersectionObserver` în bundle | **Absent** |

Scripturile încărcate efectiv:

- `app-Hy05wa7x.js`: bundle Vite al temei WordPress (stack Roots Bedrock/Sage: `/wp/`, `/app/themes/thorsen/`). Conține Bootstrap JS, Font Awesome (SVG) și **Plyr** (player video).
- `player.vimeo.com/api/player.js`: controlul videoului din hero.
- Google Analytics (`analytics.js` + `gtag`, UA și GA4).
- `wp-emoji-release.min.js` (default WordPress) și speculation rules pentru prefetch.
- CSS: Bootstrap 5 compilat + Plyr, fără Tailwind. Singurele `@keyframes` sunt cele din Bootstrap și Plyr (spinner, progress, `plyr-fade-in`).

## Efecte la scroll

**Niciunul.** Am comparat `opacity`, `transform`, `position` și `background-position` pentru ~1500 de elemente înainte și după derularea completă a paginii, iar diferențele au fost **zero**. Nu există reveal-uri, parallax, header sticky sau smooth scroll. Scroll-ul este cel nativ al browserului.

Mișcarea din pagină vine doar din:
- **videoul de fundal din hero**, care rulează în buclă;
- **hover-ul pe carduri**, cu overlay întunecat și titlu (tranziții CSS, `transition: all`);
- tranzițiile CSS standard Bootstrap pe butoane și linkuri (0.15s ease-in-out).

## Comparație cu Halvorsen & Reyes (doar observații, fără cod)

| Aspect | Thorsen | Halvorsen & Reyes |
|---|---|---|
| Stack | WordPress + Bootstrap + Vite | HTML/CSS/JS vanilla, fără build |
| Fonturi | Un singur serif (Cormorant), tracking 0.3em | Playfair Display + Lora + JetBrains Mono |
| Paletă | Alb/cărbune + albastru rece | Negru/alb + roșu editorial |
| Colțuri | Drepte (0 radius) | Drepte (0 radius) |
| Poze portofoliu | Color, grilă 2×2 statică, overlay la hover | Color, carusel cu săgeți |
| Hero | Video Vimeo full-bleed | Hero cu efect shrink (GSAP ScrollTrigger) |
| Animații scroll | Niciuna | GSAP + ScrollTrigger, cu `prefers-reduced-motion` |
| Header | Static, nav vizibil și pe mobil | Vezi `index.html` |

Concluzie: Thorsen mizează pe un aer „liniștit” de lux, cu fotografie și video mari, tipografie mică foarte spațiată și zero animații de scroll. Halvorsen & Reyes a ales o direcție editorială mai expresivă, cu mișcare controlată. Cele două abordări se întâlnesc la colțurile drepte și la pozele color lăsate să domine.
