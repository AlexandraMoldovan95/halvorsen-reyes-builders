# CLAUDE.md — Halvorsen & Reyes Builders

## The client (fictional)

| Field | Value |
|---|---|
| Name | Halvorsen & Reyes Builders |
| Owners | Erik Halvorsen (execution, job site) and Camila Reyes (design, client relations) |
| Founded | 2011 |
| Services | Turnkey homes, full renovations, additions |
| Area | Denver, Colorado + 50 km |
| Contact | hello@hr-builders.example · (555) 010-2411 |
| Hours | Monday–Friday 8:00 AM–5:00 PM |

## What needs to be delivered

1. A responsive one-page site: hero, services, portfolio (5 projects), team, contact.
2. A "Request a quote" button → form (name, email, phone, project type, estimated budget, message) → Supabase `leads` table.
3. A chatbot that only answers questions about the company; for anything else it politely declines and points to the form.
4. The site published at a public URL (Netlify).
5. A README.md listing the plugins used: name, marketplace, what it concretely did.

## Architecture (mandatory, for security reasons)

- **Static frontend** (vanilla HTML/CSS/JS) on **Netlify** — Supabase Storage serves `.html` as `text/plain`, so it can't host the page.
- **Supabase** holds only the backend: the `leads` table + the `chat` Edge Function.
- **The Anthropic key** lives only as a Supabase secret, called from the Edge Function — never in client-side JS (verifiable via View Source / Network).
- **RLS on** for `leads`: the `anon` role can only `INSERT`, never `SELECT`.
- No RAG/vectors for the chatbot — the knowledge base (~1 page) goes entirely into the system prompt.
- Photos converted to WebP, max 1600px width, before use on the site.

## Stack & code rules

- No framework, no build step. One `index.html`, `styles.css`, `script.js`, `config.js` (Supabase URL + anon key).
- Animations: GSAP + ScrollTrigger (cdnjs CDN). No generic gradients, no Inter as the main display font, no emoji in the UI.
- Design: see `DESIGN.md` — black/white + editorial red palette, Playfair Display + Lora + JetBrains Mono, square corners (0 border-radius), portfolio photos **in color**, never grayscale.
- The portfolio is an arrow-driven (click) carousel, not horizontal scroll — an explicit decision; page scroll stays strictly vertical everywhere.
- Respects `prefers-reduced-motion`.

## Process followed for this project

1. `CLAUDE.md` (this file) — context.
2. `DESIGN.md` — a Newsprint adaptation (designprompts.dev), adapted for vanilla CSS.
3. Project descriptions + palette generated from the photos in `Group/` (checked by hand).
4. Build: `index.html` + `styles.css` + `script.js`, with the visual arc (2 "wow" moments: hero shrink + portfolio, arrow-driven carousel — changed later from the original horizontal-scroll version, so the page stays strictly vertical-scroll).
5. Backend: `supabase/schema.sql` (table + RLS) + `supabase/functions/chat/index.ts` (Edge Function, Haiku model for minimal cost).
6. Remaining manual steps: see `SUPABASE_SETUP.md`.

## Claude Code plugins (assignment requirement, min. 3, min. 2 marketplaces)

To be filled in in README.md once the plugins are installed via `/plugin` (official marketplace `claude-plugins-official`) and from a second marketplace.
