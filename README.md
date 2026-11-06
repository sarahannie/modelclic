# ModelClic

Verified event staff, paid on time. A marketplace for part-time event work in Nigeria: **hosts** post shifts, **talent** apply, and **admins** approve shifts and verify members.

**Stack:** Next.js 15 (App Router) · Tailwind CSS v4 · Supabase (auth, Postgres, storage) · Cloudflare Workers (via OpenNext) · domain `modelclic.com`

**Screens:** public site, login/register (email + Google), Talent (find jobs, job details & bidding, My Gigs, My bids, messages, wallet, shift pass + SOS, ratings, identity check, profile, settings), Host (events dashboard, create/manage events, find talent, favorites, wallet, verify, rate staff), Admin console (identity checks, events, disputes, SOS, support, payments, analytics, skills & job types, members, settings).

## Design system

| Token | Hex | Use |
|---|---|---|
| Midnight ink | `#0E1A2B` | dark sections, headings, text |
| Ice blue | `#DCEBF7` (tint `#F5F9FD`) | light surfaces, cards |
| Vermilion | `#E34234` (button fill `#D63A2C`) | primary actions, accents |

- **Fonts:** Fraunces for headings and Inter for body text, both self-hosted.
- **Glass:** only over the gradients. The nav, hero preview cards, auth side panel and dashboard user card use `.glass` / `.glass-dark`.
- **Solid:** forms, tables and dashboards use `.card`, so they stay readable.
- **Buttons:** `.btn` plus one of `.btn-primary`, `.btn-secondary` (or `-dark`) and `.btn-ghost`. Sizes are `.btn-sm` and `.btn-lg`. Every button is at least 44px tall.

All tokens live in `src/app/globals.css`.

## Roles

| Role | How it's set | Can do |
|---|---|---|
| Talent | chosen at signup | browse live shifts, apply, withdraw |
| Host | chosen at signup | post shifts (go to review), book or decline applicants, close shifts |
| Admin | SQL only (see below) | approve or reject shifts, verify members, see everything |

These rules are enforced **in the database** with Row Level Security and triggers, so the UI can't bypass them.

## Demo mode

When the Supabase variables are missing and `DEMO_MODE=1` is set (it is on automatically in `npm run dev`), the app runs on built-in sample data. Go to `/demo` and pick Talent, Host or Admin. Nothing is saved. As soon as the Supabase keys are added, demo mode switches off.

## Payments (interim)

Until Paystack or Flutterwave is connected:
- Hosts fund their wallet by bank transfer, using the reference shown in the app. An admin confirms the top-up in **Admin → Payments**.
- Withdrawals work the same way: an admin pays them out and marks them paid.
- Escrow, fees and auto-release are already enforced in the database.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev                  # http://localhost:3000
```

## One-time setup

### 1. Supabase
1. Go to [supabase.com](https://supabase.com) → **New project** (name `modelclic`, region close to Nigeria, e.g. *West EU*).
2. Open **SQL Editor** → **New query**, paste all of `supabase/schema.sql` and click **Run**.
   Then go to **Database → Extensions**, enable **pg_cron**, and run `supabase/cron.sql` the same way. It releases pay automatically and tops up bid points every month.
3. Open **Authentication → URL Configuration**:
   - Site URL: `https://modelclic.com`
   - Redirect URLs: `https://modelclic.com/**`, `http://localhost:3000/**`, `https://*.workers.dev/**`
4. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
5. **Google sign-in:**
   1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), go to **Create credentials → OAuth client ID → Web application**.
   2. Under **Authorized redirect URI**, add `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.
   3. In Supabase, go to **Authentication → Providers → Google**. Turn it on and paste the Client ID and Secret.
6. Sign up on the site with your own email, then run this in the SQL Editor to make yourself admin. Admins log in at `/staff`.
   ```sql
   update public.profiles set role = 'admin', sides = '{admin}', staff_title = 'Founder'
   where id = (select id from auth.users where email = 'YOUR_EMAIL');
   ```
7. In the admin console, open **Settings** and enter the bank account that hosts should transfer top-ups to.

### 2. Cloudflare (auto-deploy from GitHub)
1. Cloudflare dashboard → **Workers & Pages → Create → Import a repository** → pick `sarahannie/modelclic`.
2. Build settings:
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
3. Under **Settings → Variables and Secrets**, add these for both the build and the runtime:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://modelclic.com`
4. Deploy, then test the `*.workers.dev` link.

### 3. Domain
1. Open the **old** Cloudflare Pages project → **Custom domains** → remove `modelclic.com` (and `www`).
2. Open the new **modelclic** Worker → **Settings → Domains & Routes → Add → Custom domain** → `modelclic.com`, then `www.modelclic.com`.
3. Once it's live, delete the old Pages project.

## Workflow

- `main` is always live. Every push to it deploys automatically.
- New work goes on a branch (`feature/…`), then a pull request, which gets a preview link. Merge it when it looks right.

## Roadmap

- [ ] Automated identity checks via a KYC provider (e.g. Smile ID). Today an admin reviews each submission.
- [ ] Card/bank payments via Paystack or Flutterwave (escrow ledger is already built)
- [ ] Lawyer-reviewed Terms and Privacy pages
