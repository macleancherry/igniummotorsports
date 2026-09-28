#!/usr/bin/env node
/**
 * Local Instagram sync — run this on your own machine, not in any CI/sandbox.
 *
 * Ignium Motorsport's Instagram account isn't owned/administered by whoever
 * runs this, so there's no official Graph API access available. Instead,
 * this scrapes the public profile using a real, logged-in browser session
 * (Playwright), then pushes what it finds to the site's /api/social
 * endpoint so the homepage social grid stays current.
 *
 * One-time setup:
 *   npm install
 *   cp .env.instagram-sync.example .env.instagram-sync
 *   fill in SITE_URL and ADMIN_TOKEN in that file
 *
 * First run:
 *   node scripts/instagram-sync.mjs
 *   A real Chrome window opens. If Instagram asks you to log in, do so in
 *   that window, then come back to this terminal and press Enter. Your
 *   session is saved in .instagram-session/ (gitignored) so later runs
 *   don't need you to log in again.
 *
 * Automating it (no manual runs after the first):
 *   Windows Task Scheduler → New Task → Action: run `node`, arguments:
 *   the full path to this file, "Start in": this repo's folder. Pick
 *   whatever schedule suits (daily is plenty for a hobby team's posting
 *   pace). Once the session above is saved, it needs no further input.
 *
 * NOTE: this was written and reviewed carefully, but could not be tested
 * against the real, live Instagram site (the environment that wrote it has
 * no route to instagram.com at all). It extracts each post's `og:image`
 * and `og:description` meta tags — chosen because they're a stable,
 * purpose-built surface for link previews, unlike Instagram's internal
 * DOM/API shape, which changes often. If a run comes back with 0 posts or
 * a lot of skipped posts, that's the first place to look: open a post's
 * page, view source, and check those two meta tags still look like what
 * parseOgDescription() below expects.
 */

import { chromium } from "playwright";
import readline from "node:readline/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const ENV_FILE = path.join(REPO_ROOT, ".env.instagram-sync");
const SESSION_DIR = path.join(REPO_ROOT, ".instagram-session");
const PROFILE_URL = "https://www.instagram.com/ignium_motorsport/";

try {
  process.loadEnvFile?.(ENV_FILE);
} catch {
  // No .env.instagram-sync yet — caught below by the missing-var check.
}

const SITE_URL = process.env.SITE_URL;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const POST_COUNT = Number(process.env.INSTAGRAM_SYNC_POST_COUNT ?? 12);

if (!SITE_URL || !ADMIN_TOKEN) {
  console.error(
    "Missing SITE_URL or ADMIN_TOKEN.\n" +
      "Copy .env.instagram-sync.example to .env.instagram-sync and fill both in."
  );
  process.exit(1);
}

function deriveIgPostId(permalink) {
  // https://www.instagram.com/p/<shortcode>/ -> <shortcode>
  const match = permalink.match(/\/p\/([^/]+)\//);
  return match ? match[1] : permalink;
}

function parseOgDescription(description) {
  // Typical Instagram shape:
  //   "123 likes, 4 comments - ignium_motorsport on March 3, 2026: "Caption text here""
  const match = description?.match(/on (.+?):\s*"([\s\S]*)"\s*$/);
  if (match) {
    return { postedAt: match[1], caption: match[2] };
  }
  // Didn't match the expected shape — keep the raw text rather than lose it.
  return { postedAt: null, caption: description ?? null };
}

async function waitForEnter(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await rl.question(message);
  rl.close();
}

async function collectPermalinks(page) {
  const permalinks = new Set();
  for (let attempt = 0; attempt < 8 && permalinks.size < POST_COUNT; attempt++) {
    const hrefs = await page.locator('a[href^="/p/"]').evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    for (const href of hrefs) {
      if (href) permalinks.add(new URL(href, PROFILE_URL).toString());
    }
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(1000);
  }
  return [...permalinks].slice(0, POST_COUNT);
}

async function extractPost(page, permalink) {
  await page.goto(permalink, { waitUntil: "domcontentloaded" });
  const imageUrl = await page.locator('meta[property="og:image"]').getAttribute("content");
  const description = await page.locator('meta[property="og:description"]').getAttribute("content");

  if (!imageUrl) {
    return null;
  }

  const { postedAt, caption } = parseOgDescription(description);
  return {
    igPostId: deriveIgPostId(permalink),
    imageUrl,
    caption,
    permalink,
    postedAt,
  };
}

async function main() {
  const isFirstRun = !fs.existsSync(SESSION_DIR);

  console.log(`Launching browser (session saved in ${SESSION_DIR})...`);
  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
  });
  const page = context.pages()[0] ?? (await context.newPage());

  await page.goto(PROFILE_URL, { waitUntil: "domcontentloaded" });

  if (isFirstRun) {
    console.log("\nFirst run — if Instagram is asking you to log in, do so in the browser window now.");
    await waitForEnter("Press Enter once you can see the Ignium Motorsport profile page... ");
    await page.goto(PROFILE_URL, { waitUntil: "domcontentloaded" });
  }

  console.log("Scrolling to load recent posts...");
  const permalinks = await collectPermalinks(page);
  console.log(`Found ${permalinks.length} post link(s). Visiting each for details...`);

  const posts = [];
  for (const permalink of permalinks) {
    try {
      const post = await extractPost(page, permalink);
      if (post) {
        posts.push(post);
        console.log(`  ✓ ${permalink}`);
      } else {
        console.warn(`  Skipped ${permalink} — no og:image found (page layout may have changed).`);
      }
    } catch (err) {
      console.warn(`  Skipped ${permalink} — ${err instanceof Error ? err.message : err}`);
    }
  }

  await context.close();

  if (posts.length === 0) {
    console.error("\nNo posts extracted — nothing to sync. See the warnings above.");
    process.exit(1);
  }

  console.log(`\nPushing ${posts.length} post(s) to ${SITE_URL}/api/social ...`);
  const response = await fetch(`${SITE_URL.replace(/\/$/, "")}/api/social`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ posts }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`Sync failed: HTTP ${response.status}`, body);
    process.exit(1);
  }

  console.log(`Done — ${body?.upserted ?? posts.length} post(s) synced.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
