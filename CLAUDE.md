# CLAUDE.md — Halvorsen & Reyes Builders

## Clientul (fictiv)

| Câmp | Valoare |
|---|---|
| Nume | Halvorsen & Reyes Builders |
| Proprietari | Erik Halvorsen (execuție, șantier) și Camila Reyes (design, relația cu clienții) |
| Fondată | 2011 |
| Servicii | Case la cheie, renovări complete, extinderi |
| Zonă | Denver, Colorado + 50 km |
| Contact | hello@hr-builders.example · (555) 010-2411 |
| Program | Luni–Vineri 8:00–17:00 |

## Ce trebuie livrat

1. Site one-page, responsive: hero, servicii, portofoliu (5 proiecte), echipă, contact.
2. Buton „Cere o ofertă" → formular (nume, email, telefon, tip proiect, buget estimat, mesaj) → tabel Supabase `leads`.
3. Chatbot care răspunde doar despre firmă; pentru orice altceva refuză politicos și trimite spre formular.
4. Site publicat la un URL public (Netlify).
5. README.md cu plugin-urile folosite: nume, marketplace, ce a făcut concret.

## Arhitectură (obligatorie, motiv de securitate)

- **Frontend static** (HTML/CSS/JS vanilla) pe **Netlify** — Supabase Storage servește `.html` ca `text/plain`, deci nu poate găzdui pagina.
- **Supabase** ține doar backend-ul: tabelul `leads` + Edge Function `chat`.
- **Cheia Anthropic** stă doar ca secret Supabase, apelată din Edge Function — niciodată în JS client (verificabil din View Source / Network).
- **RLS pornit** pe `leads`: rolul `anon` poate doar `INSERT`, niciodată `SELECT`.
- Fără RAG/vectori pentru chatbot — knowledge base-ul (~1 pagină) intră întreg în system prompt.
- Poze convertite la WebP, max 1600px lățime, înainte de folosire pe site.

## Stack & reguli de cod

- Fără framework, fără build step. Un `index.html`, `styles.css`, `script.js`, `config.js` (URL + cheie anon Supabase).
- Animații: GSAP + ScrollTrigger (CDN cdnjs). Fără gradient-uri generice, fără font Inter ca font principal de display, fără emoji în UI.
- Design: vezi `DESIGN.md` — paletă negru/alb + roșu editorial, Playfair Display + Lora + JetBrains Mono, colțuri drepte (0 border-radius), poze de portofoliu **color**, niciodată grayscale.
- Portofoliul e un carusel cu săgeți (click), nu scroll orizontal — decizie explicită, scroll-ul paginii rămâne strict vertical peste tot.
- Respectă `prefers-reduced-motion`.

## Proces urmat pentru acest proiect

1. `CLAUDE.md` (acest fișier) — context.
2. `DESIGN.md` — adaptare Newsprint (designprompts.dev), tradusă pentru vanilla CSS.
3. Descrieri proiecte + paletă generate din pozele din `Group/` (verificate manual).
4. Build: `index.html` + `styles.css` + `script.js`, cu bucla vizuală (2 momente wow: hero shrink + portofoliu, carusel pe săgeți — schimbat ulterior din varianta inițială cu scroll orizontal, ca pagina să rămână strict scroll vertical).
5. Backend: `supabase/schema.sql` (tabel + RLS) + `supabase/functions/chat/index.ts` (Edge Function, model Haiku pentru cost minim).
6. Pași manuali rămași: vezi `SUPABASE_SETUP.md`.

## Plugin-uri Claude Code (cerință temă, min. 3, min. 2 marketplace-uri)

De completat în README.md când instalezi plugin-urile din `/plugin` (marketplace oficial `claude-plugins-official`) și dintr-un al doilea marketplace.
