# Supabase setup — manual steps (one time)

The site and the code are ready. These are the only things you need to do yourself, through your account, to bring the site to life. Takes ~15 minutes.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Name: `halvorsen-reyes-builders` (or whatever you like). Choose a DB password and a region close to you (e.g. US West).
3. Wait ~2 minutes for the project to be created.

## 2. Run the SQL schema

1. In the project dashboard → **SQL Editor** → **New query**.
2. Copy the entire contents of `supabase/schema.sql` (from this folder) and run it (**Run**).
3. Check in **Table Editor** that the `leads` table showed up and has RLS on ("RLS enabled" appears next to the table name).

## 3. Grab the URL and the anon key

1. **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open `config.js` in this folder and replace:
   ```js
   SUPABASE_URL: "https://TODO-your-project.supabase.co",
   SUPABASE_ANON_KEY: "TODO-anon-key-from-Supabase-Project-Settings-API"
   ```
   with your real values.

## 4. Deploy the chatbot Edge Function

**Easy route (from the dashboard, no CLI):**
1. In the dashboard → **Edge Functions** → **Deploy a new function** → name: `chat`.
2. Delete the example code and paste in the entire contents of `supabase/functions/chat/index.ts`.
3. Deploy.

**CLI route (if you prefer the terminal):**
```bash
npm install -g supabase
supabase login
supabase link --project-ref <project-ref-from-the-URL>
supabase functions deploy chat
```

## 5. Set the Anthropic key as a secret (NEVER in code)

1. **Project Settings** → **Edge Functions** → **Secrets** (or **Manage secrets**).
2. Add:
   - `ANTHROPIC_API_KEY` = your key from [platform.claude.com](https://platform.claude.com) (the Console, not a Claude Max subscription — those are separate).
   - Optionally, `ANTHROPIC_MODEL` = the exact name of the latest Haiku model, if the default in the code (`claude-haiku-4-5-20251001`) no longer exists — check [platform.claude.com/docs](https://platform.claude.com/docs).

If you deployed via the CLI, you can also set secrets this way:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

3. After deploying to Netlify (step 9), also add:
   - `ALLOWED_ORIGINS` = the site's URL, no trailing `/`, e.g. `https://your-site.netlify.app`. You can list several, comma-separated (e.g. also `http://localhost:5500` for local testing). As long as it's not set, CORS stays open (`*`).
4. Optional: a **monthly spending limit** in the Anthropic Console (Settings → Limits). The in-code cost protection is covered in step 10 (rate limits).

## 6. Test locally, before deploying to Netlify

1. Open `index.html` directly in a browser (or with a small local server, e.g. `npx serve .`).
2. Test the form — a new row should appear in the `leads` table in Supabase.
3. Test the chatbot — try the questions from the acceptance test:
   - "Who are the owners?" → should answer Erik Halvorsen and Camila Reyes.
   - "How much does a 1,600 sq ft home cost?" → must not make up a price, should point to the form instead.
   - "Write me a poem" → must politely decline.

## 7. Security check (required, it's in the acceptance test)

With the `anon` key, a `SELECT` on `leads` must return 0 rows. Test it in the SQL Editor with the `anon` role, or simply from the browser console on the live site:
```js
fetch(window.HR_CONFIG.SUPABASE_URL + "/rest/v1/leads", {
  headers: { apikey: window.HR_CONFIG.SUPABASE_ANON_KEY, Authorization: "Bearer " + window.HR_CONFIG.SUPABASE_ANON_KEY }
}).then(r => r.json()).then(console.log);
```
Should return `[]` (empty array), never the real data.

## 8. Admin panel for Erik & Camila (optional, outside the brief)

`admin.html` is a separate page (not listed in navigation, `noindex`) where Erik and Camila can log in and see the requests submitted through the form. It's not required by the stepIT brief, but it uses the same Supabase backend, so it's configured here too.

1. **Create their accounts**: dashboard → **Authentication** → **Users** → **Add user** → **Create new user**. Do this once for Erik and once for Camila, with their email and a password (they can change their own password later via "Forgot password" on the login page, if you enable emails — otherwise you give them the initial password yourself).
2. **Add them to the `admins` table**: `supabase/schema.sql` already has an `insert into public.admins` with placeholder emails (`erik@hr-builders.example`, `camila@hr-builders.example`). Open the **SQL Editor** and run that block again, but with the **real** emails, exactly as you entered them in step 1:
   ```sql
   insert into public.admins (email) values
     ('erik-real-email@...'),
     ('camila-real-email@...')
   on conflict (email) do nothing;
   ```
3. **Important — security**: anyone who can log in with an email that's in `admins` will see every request in `leads` (the RLS policy checks exactly that). So:
   - Don't add any emails to `admins` other than theirs.
   - Go to **Authentication** → **Providers** → **Email** and turn off **"Allow new users to sign up"** (or the equivalent in the current UI). That way nobody can create their own account from the login form — even if they somehow did, they still wouldn't see anything without also being in `admins` (double protection), but it's better to close the front door too.
4. **Test it**: open `admin.html` from this folder in a browser, log in with one of the accounts. You should see the table of submitted requests. If you log in with an account that's not in `admins`, you'll get an error loading the list (RLS rejected the SELECT) — that's the correct behavior, not a bug.

## 9. Deploy to Netlify

Drag-and-drop the whole folder (except `supabase/`, which stays local only — it's never published, though it wouldn't hurt anything if it was, since it contains no secrets) onto [app.netlify.com/drop](https://app.netlify.com/drop), or connect the folder as a new site from your existing Netlify account. `admin.html` gets published along with the rest of the static site — being `noindex` and not linked from the menu, it won't show up for regular visitors, but keep in mind its URL (`your-site.netlify.app/admin.html`) isn't "secret," just unlisted; the real protection is the login + RLS, not hiding the URL.

## 10. Rate limits (chatbot + form)

The `chat` function and the form can be called by anyone who has the public key from the site. The limits here stop abuse **before** any paid call to Anthropic.

**What's limited:**
- **Chatbot:** max **20 messages per hour from the same visitor** and **300 messages per day total**. Over the limit, the chatbot politely replies that it's paused and points to the form, without calling Anthropic at all. The visitor is recognized by a fingerprint (hash) of their IP; the IP itself is never saved, and fingerprints are deleted after 2 days.
- **Form:** max **30 requests per hour total** and **3 per day from the same email**.

**How to turn them on:**
1. **SQL Editor** → **New query** → paste in all of `supabase/rate_limits.sql` → **Run**. Re-running is safe; it doesn't touch the data in `leads`.
2. **Edge Functions** → `chat` → replace the code with `supabase/functions/chat/index.ts` from this folder → **Deploy**. (Or from the CLI: `supabase functions deploy chat`.)
3. No new secret is needed: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set automatically by Supabase in Edge Functions.

**Order matters:** run the SQL first. If the newly deployed function can't find `chat_allow` in the database, it declines messages (replies with the pause message), so it's never left without cost protection.

**To change the limits without touching code:** add `CHAT_LIMIT_PER_HOUR` and/or `CHAT_LIMIT_PER_DAY` under **Edge Functions → Secrets**. For a quick test, set `CHAT_LIMIT_PER_HOUR=2`: the 3rd chat message should get the pause reply. **Delete the secret after testing.**

**Changes nothing on the site itself** (no Netlify deploy needed): the pause message comes back as a normal chat reply.
