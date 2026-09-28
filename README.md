# Ignium Motorsport

The Ignium Motorsport team website: who we are, the championships we race in, our results, our sponsors, and how to get in touch.

## Stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS v4 + a hand-rolled design system in `src/ignium-theme.css`
- React Router v7 for client-side routing
- Deployed to Cloudflare Pages, with a small set of Pages Functions in `functions/` backed by a Cloudflare D1 database (used only by the News page)

## Development

```bash
npm install
npm run dev        # start the Vite dev server
npm run build       # type-check and build for production
npm run lint         # eslint
npm run pages:dev  # run against Cloudflare Pages Functions locally (wrangler)
```

For `pages:dev`, copy `.dev.vars.example` to `.dev.vars` and fill in real values.

## Editing site content

Most content is not stored in a database — it's plain, hand-editable TypeScript files under `src/data/`:

- `src/data/roster.ts` — the driver roster shown on the About page
- `src/data/championships.ts` — the championships/ladders shown on the Championships page
- `src/data/sponsors.ts` — the sponsors/partners shown on the Sponsors page
- `src/data/results.ts` — race results shown on the Results page (fill in details directly, or just link out to an Instagram recap post)

Each file has a comment at the top describing its shape. Edit the array, commit, and redeploy.

The News page is one exception — it's backed by Cloudflare D1 (`functions/api/news.ts`), since it already worked well as a simple, editable feed of Instagram recap posts. The homepage "Follow The Team" social grid is the other — see "Instagram content sync" below.

## Garage61 "who's racing now" status

`functions/api/garage61-status.ts` is a placeholder integration with [Garage61](https://garage61.net) that will show a small "racing now" badge in the site header when a team driver is in an active session. It currently fails safe (shows nothing) until real API details are filled in:

1. Set `GARAGE61_API_BASE_URL` and `GARAGE61_API_KEY` (the latter as a Pages secret via `wrangler pages secret put GARAGE61_API_KEY`, never as a plaintext var).
2. Update the endpoint path and response mapping in `functions/api/garage61-status.ts` (marked with `TODO` comments) to match Garage61's real API.

## Instagram content sync

The team doesn't own/administer the Ignium Motorsport Instagram account, so there's no official Graph API access available — no access token to request, no app to register. Instead, `functions/api/social.ts` stores whatever a local scraper (`scripts/instagram-sync.mjs`) finds and hands it to the homepage's "Follow The Team" grid, the same D1-backed pattern News already uses.

**The scraper runs on your own machine, not on Cloudflare** — it needs a real, logged-in browser session, which only exists on a normal computer with normal Instagram access.

1. `npm install` (pulls in `playwright` as a dev dependency).
2. `cp .env.instagram-sync.example .env.instagram-sync` and fill in:
   - `SITE_URL` — the deployed site's URL
   - `ADMIN_TOKEN` — the same token already used for the News API (`wrangler pages secret put ADMIN_TOKEN` if it isn't set yet)
3. `npm run instagram:sync`. A real browser window opens; if Instagram asks you to log in, do so there, then press Enter in the terminal. The session is saved locally in `.instagram-session/` (gitignored) so you only log in once.
4. To stop doing this by hand, add a Windows Task Scheduler entry running `node scripts/instagram-sync.mjs` (working directory: this repo) on whatever schedule suits — daily is plenty. After the first successful login, it needs no further input.

This was written without the ability to test against the real, live Instagram site — if a run comes back with 0 posts or skips most of them, open a real post's page, view source, and check its `og:image`/`og:description` meta tags still look like what `scripts/instagram-sync.mjs` expects (see the comment at the top of that file).
