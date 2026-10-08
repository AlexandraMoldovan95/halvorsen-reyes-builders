# Setup Supabase — pași manuali (o singură dată)

Site-ul și codul sunt gata. Astea sunt singurele lucruri pe care trebuie să le faci tu, prin cont, ca site-ul să prindă viață. Durează ~15 minute.

## 1. Creează proiectul Supabase

1. Mergi pe [supabase.com](https://supabase.com) → **New project**.
2. Nume: `halvorsen-reyes-builders` (sau ce vrei tu). Alege o parolă pentru DB și o regiune apropiată (ex. US West).
3. Așteaptă ~2 minute să se creeze proiectul.

## 2. Rulează schema SQL

1. În dashboard-ul proiectului → **SQL Editor** → **New query**.
2. Copiază tot conținutul din `supabase/schema.sql` (din acest folder) și rulează-l (**Run**).
3. Verifică în **Table Editor** că a apărut tabelul `leads` și că are RLS pornit (scrie "RLS enabled" lângă numele tabelului).

## 3. Ia URL-ul și cheia anon

1. **Project Settings** (iconița de rotiță) → **API**.
2. Copiază **Project URL** și cheia **anon public**.
3. Deschide `config.js` din acest folder și înlocuiește:
   ```js
   SUPABASE_URL: "https://TODO-proiectul-tau.supabase.co",
   SUPABASE_ANON_KEY: "TODO-anon-key-din-Supabase-Project-Settings-API"
   ```
   cu valorile tale reale.

## 4. Deploy Edge Function-ul pentru chatbot

**Varianta simplă (din dashboard, fără CLI):**
1. În dashboard → **Edge Functions** → **Deploy a new function** → nume: `chat`.
2. Șterge codul exemplu și lipește tot conținutul din `supabase/functions/chat/index.ts`.
3. Deploy.

**Varianta CLI (dacă preferi terminal):**
```bash
npm install -g supabase
supabase login
supabase link --project-ref <project-ref-din-URL>
supabase functions deploy chat
```

## 5. Pune cheia Anthropic ca secret (NICIODATĂ în cod)

1. **Project Settings** → **Edge Functions** → **Secrets** (sau **Manage secrets**).
2. Adaugă:
   - `ANTHROPIC_API_KEY` = cheia ta de pe [platform.claude.com](https://platform.claude.com) (Console, nu abonamentul Claude Max — sunt lucruri separate).
   - Opțional, `ANTHROPIC_MODEL` = numele exact al celui mai recent model Haiku, dacă cel implicit din cod (`claude-haiku-4-5-20251001`) nu mai există — verifică la [platform.claude.com/docs](https://platform.claude.com/docs).

Dacă ai deployat prin CLI, poți seta secretele și așa:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

3. După deploy-ul pe Netlify (pasul 9), adaugă și:
   - `ALLOWED_ORIGINS` = URL-ul site-ului, fără `/` la final, ex. `https://site-ul-tau.netlify.app`. Poți pune mai multe, separate prin virgulă (ex. și `http://localhost:5500` pentru test local). Cât timp nu e setat, CORS rămâne deschis (`*`).
4. Opțional: o **limită lunară de cheltuieli** în Anthropic Console (Settings → Limits). Protecția de cost din cod e la pasul 10 (limite de folosire).

## 6. Testează local, înainte de deploy pe Netlify

1. Deschide `index.html` direct în browser (sau cu un mic server local, ex. `npx serve .`).
2. Testează formularul — ar trebui să apară un rând nou în tabelul `leads` din Supabase.
3. Testează chatbot-ul — pune întrebările din testul de acceptanță:
   - "Cine sunt proprietarii?" → ar trebui să răspundă Erik Halvorsen și Camila Reyes.
   - "Cât costă o casă de 150 mp?" → nu trebuie să inventeze un preț, ci să trimită spre formular.
   - "Scrie-mi o poezie" → trebuie să refuze politicos.

## 7. Verificare de securitate (obligatorie, e în testul de acceptanță)

Cu cheia `anon`, un `SELECT` pe `leads` trebuie să întoarcă 0 rânduri. Testează în SQL Editor cu rol `anon`, sau simplu din browser console pe site-ul live:
```js
fetch(window.HR_CONFIG.SUPABASE_URL + "/rest/v1/leads", {
  headers: { apikey: window.HR_CONFIG.SUPABASE_ANON_KEY, Authorization: "Bearer " + window.HR_CONFIG.SUPABASE_ANON_KEY }
}).then(r => r.json()).then(console.log);
```
Ar trebui să întoarcă `[]` (array gol), niciodată datele reale.

## 8. Panou admin pentru Erik & Camila (opțional, în afara temei)

`admin.html` e o pagină separată (nelistată în navigație, `noindex`) unde Erik și Camila se pot loga și vedea cererile trimise prin formular. Nu e cerută de tema stepIT, dar ține de aceeași bază Supabase, deci se configurează tot aici.

1. **Creează conturile lor**: dashboard → **Authentication** → **Users** → **Add user** → **Create new user**. Faci asta o dată pentru Erik și o dată pentru Camila, cu emailul și o parolă (le poți schimba parola ei/el mai târziu din "Forgot password" pe pagina de login, dacă activezi email-uri — altfel le dai tu parola inițială).
2. **Adaugă-i în tabelul `admins`**: în `supabase/schema.sql` ai deja un `insert into public.admins` cu emailuri placeholder (`erik@hr-builders.example`, `camila@hr-builders.example`). Deschide **SQL Editor** și rulează din nou acel bloc, dar cu emailurile **reale**, exact cum le-ai pus la pasul 1:
   ```sql
   insert into public.admins (email) values
     ('email-real-erik@...'),
     ('email-real-camila@...')
   on conflict (email) do nothing;
   ```
3. **Important — securitate**: oricine se poate loga cu emailul lui în `admins` va vedea toate cererile din `leads` (politica RLS verifică exact acest lucru). Deci:
   - Nu adăuga alte emailuri în `admins` decât ale lor doi.
   - Mergi la **Authentication** → **Providers** → **Email** și dezactivează **"Allow new users to sign up"** (sau echivalentul din UI-ul curent). Așa nimeni nu-și poate crea singur un cont din formularul de login — chiar dacă ar reuși, tot n-ar vedea nimic fără să fie și în `admins` (dublă protecție), dar mai bine închizi și ușa din față.
4. **Testează**: deschide `admin.html` din acest folder în browser, loghează-te cu unul din conturi. Ar trebui să vezi tabelul cu cererile trimise. Dacă te loghezi cu un cont care nu e în `admins`, primești eroare la încărcarea listei (RLS a refuzat SELECT-ul) — e comportamentul corect, nu un bug.

## 9. Deploy pe Netlify

Drag-and-drop folderul întreg (fără `supabase/`, acela rămâne doar la tine — nu se publică, dar nu strică nici dacă rămâne, nu conține secrete) pe [app.netlify.com/drop](https://app.netlify.com/drop), sau conectează folderul ca site nou din contul tău Netlify existent. `admin.html` se publică odată cu restul site-ului static — fiind `noindex` și nelinkuit din meniu, nu apare pentru vizitatori obișnuiți, dar reține că URL-ul lui (`tau-site.netlify.app/admin.html`) nu e "secret", doar neafișat; protecția reală e login-ul + RLS, nu ascunderea URL-ului.

## 10. Limite de folosire (chatbot + formular)

Funcția `chat` și formularul pot fi apelate de oricine are cheia publică din site. Limitele de aici opresc abuzul **înainte** de orice apel plătit către Anthropic.

**Ce se limitează:**
- **Chatbot:** maximum **20 de mesaje pe oră de la același vizitator** și **300 de mesaje pe zi în total**. Peste limită, chatbot-ul răspunde politicos că e pe pauză și trimite spre formular, fără să mai apeleze Anthropic. Vizitatorul e recunoscut după o amprentă (hash) a IP-ului; IP-ul nu se salvează, iar amprentele se șterg după 2 zile.
- **Formular:** maximum **30 de cereri pe oră în total** și **3 pe zi de pe același email**.

**Cum le pornești:**
1. **SQL Editor** → **New query** → lipește tot `supabase/rate_limits.sql` → **Run**. Re-rularea e sigură; nu atinge datele din `leads`.
2. **Edge Functions** → `chat` → înlocuiește codul cu `supabase/functions/chat/index.ts` din acest folder → **Deploy**. (Sau din CLI: `supabase functions deploy chat`.)
3. Nu trebuie niciun secret nou: `SUPABASE_URL` și `SUPABASE_SERVICE_ROLE_KEY` sunt puse automat de Supabase în Edge Functions.

**Ordinea contează:** rulează întâi SQL-ul. Dacă funcția nou deployată nu găsește `chat_allow` în baza de date, refuză mesajele (răspunde cu mesajul de pauză), ca să nu rămână fără protecție de cost.

**Ca să schimbi limitele fără cod:** adaugă în **Edge Functions → Secrets** `CHAT_LIMIT_PER_HOUR` și/sau `CHAT_LIMIT_PER_DAY`. Pentru un test rapid, pune `CHAT_LIMIT_PER_HOUR=2`: al 3-lea mesaj din chat trebuie să primească mesajul de pauză. **Șterge secretul după test.**

**Nu schimbă nimic în site** (fără deploy pe Netlify): mesajul de pauză vine ca un răspuns normal de chat.

