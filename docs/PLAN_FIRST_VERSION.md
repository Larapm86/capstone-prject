# Becom — First version plan

**Goal:** Users can log in and log a craving by typing what they’re craving. Nothing else. Minimal design. **Mobile-first and installable as a PWA.**

---

## What you already have

- **SvelteKit** with root layout and favicon
- **Better Auth** (email/password) with Drizzle adapter; session and user on `event.locals`
- **Auth API** handled in `hooks.server.ts` via `svelteKitHandler` (no extra route needed)
- **DB:** Neon + Drizzle; auth tables (user, session, account, verification) and a `task` table (can ignore for now)

---

## 1. Data: cravings table

Add a table so each craving is stored with the user who created it.

**In `src/lib/server/db/schema.ts`:**

- Add a `craving` table, for example:
  - `id` — primary key (e.g. `serial` or `text` uuid)
  - `userId` — `text`, not null, references `user.id` (from auth schema) with `onDelete: 'cascade'`
  - `text` — `text`, not null (what they’re craving)
  - `createdAt` — `timestamp`, default `now()`

- Export it from `schema.ts` (and keep re-exporting auth schema if you use it in one place).

**Migrations:**

- Run `pnpm db:generate` to create a new migration for `craving`.
- Run `pnpm db:push` (or `db:migrate`) so the DB has the new table.

---

## 2. Routes and auth flow

Keep a single “app” area for logged-in users and a single login/register page.

**Route layout:**

| Route       | Who can see it        | Purpose                                      |
|------------|------------------------|----------------------------------------------|
| `/`        | Everyone               | Redirect: not logged in → `/login`, else → `/cravings` (or show cravings here) |
| `/login`   | Not logged in (else redirect away) | Email/password login + register              |
| `/cravings`| Logged in only         | Log a craving (form) + list of their cravings |

**Auth behavior:**

- **`/`**  
  - In `+page.server.ts` `load`: if no `event.locals.user`, `redirect(302, '/login')`; else `redirect(302, '/cravings')` (or return data and render the cravings UI on `/` if you prefer).
- **`/login`**  
  - In `load`: if `event.locals.user`, `redirect(302, '/cravings')`.  
  - Reuse the same pattern as `demo/better-auth/login`: form with email, password, name; actions `signInEmail` and `signUpEmail` calling `auth.api.signInEmail` / `auth.api.signUpEmail`, then `redirect(302, '/cravings')`. Use `fail()` and show `form?.message` for errors.
- **`/cravings`**  
  - In `load`: if no `event.locals.user`, `redirect(302, '/login')`. Otherwise fetch the current user’s cravings from the DB (e.g. `db.query.craving.findMany({ where: eq(craving.userId, event.locals.user.id), orderBy: desc(craving.createdAt) })`) and return them.

No need to change `hooks.server.ts`; session is already on `event.locals`.

---

## 3. Log a craving (form + action)

**Page: `/cravings`**

- **Form:** One text field (input or textarea) for “What are you craving?” and a submit button (e.g. “Log craving”).
- **Action:** In `/cravings/+page.server.ts`, add a form action (e.g. `logCraving`):
  - Get the text from `formData`, trim and validate (e.g. non-empty, max length if you want).
  - If invalid, `return fail(400, { message: '…' })`.
  - Insert into `craving` with `userId: event.locals.user.id`, `text`, and let `createdAt` default.
  - Then `redirect(302, '/cravings')` or re-run load so the list updates (SvelteKit will re-apply load after a successful action).

**List:** In the same page, render the list from `data.cravings` (e.g. newest first). Minimal markup: e.g. each item is the text and maybe the date. No edit/delete needed for v1.

---

## 4. Sign out

On the cravings page (or in a minimal header), add a “Sign out” button that posts to an action which calls `auth.api.signOut({ headers: event.request.headers })` and then `redirect(302, '/login')` — same as in `demo/better-auth/+page.server.ts`.

---

## 5. Root and navigation

- **`/`**  
  - Implement as above: redirect to `/login` or `/cravings` so the app always lands in the right place.
- **Navigation**  
  - Optional: on `/cravings`, a single “Sign out” link/button. No need for a full nav bar in v1.

---

## 6. Design (minimal)

- Use the existing root layout; no new layout needed unless you want a shared “Sign out” on multiple pages.
- No design system or extra CSS for now: simple form, list, and buttons. You can add a single global style or use default browser styles.
- Optional: set a title in `<svelte:head>` for `/cravings` and `/login` (e.g. “Becom — Cravings”, “Becom — Log in”).

---

## 7. PWA & mobile-friendly

The app should work well on phones and be installable (Add to Home Screen / standalone). Keep PWA setup minimal for v1.

### Mobile-first layout & UX

- **Viewport:** In the root layout `<svelte:head>`, include `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` so layout scales correctly and safe areas (notches) are respected.
- **Touch targets:** Buttons and links at least ~44×44px so they’re easy to tap; avoid tiny controls.
- **Layout:** Single column, form and list full-width on small screens; no horizontal scroll. Use simple stacking (e.g. form on top, list below).
- **Inputs:** Use appropriate `inputmode` / `type` (e.g. `type="email"`, `inputmode="text"` for the craving field) so mobile keyboards behave well.

### PWA: installable app

- **Web app manifest** (`static/manifest.webmanifest` or similar):
  - `name`: "Becom"
  - `short_name`: "Becom"
  - `start_url`: "/" (or "/cravings")
  - `display`: "standalone" (or "minimal-ui") so it opens like an app when installed.
  - `theme_color` and `background_color` for splash/status bar.
  - `icons`: at least 192×192 and 512×512 (can reuse or derive from existing favicon for v1).
- **Link manifest** in root layout: `<link rel="manifest" href="/manifest.webmanifest">`.
- **Meta tags** in root layout:
  - `theme-color` (same as manifest).
  - `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, and optionally `apple-mobile-web-app-title` for iOS “Add to Home Screen”.
- **HTTPS** required for installability (you’ll have this in production).

### Service worker (v1: optional / minimal)

- For “installable” PWA, a manifest + meta is enough; many browsers will allow Add to Home Screen without a service worker.
- For v1 you can **skip** a service worker, or add a **minimal** one later (e.g. via `vite-plugin-pwa` with SvelteKit) to cache the app shell so the first load feels snappy. Full offline support can wait.

### Summary

- Mobile: viewport meta, touch-friendly, single-column, sensible inputs.
- PWA: manifest + icons, link + meta in layout; optional minimal SW later.

---

## Implementation order (checklist)

1. [ ] **PWA & mobile baseline** — Add viewport and PWA meta tags to root layout; add `static/manifest.webmanifest` (name, start_url, display, theme_color, background_color, icons) and link it; ensure touch-friendly targets and single-column layout in CSS. (Icons: 192×192 and 512×512; can use a simple generated icon or favicon-derived for v1.)
2. [ ] Add `craving` table to `src/lib/server/db/schema.ts` and run `db:generate` + `db:push` (or migrate).
3. [ ] Create `/login`: `+page.svelte` (form) and `+page.server.ts` (load redirect if logged in; actions for sign in / sign up). Use mobile-friendly inputs and button size.
4. [ ] Create `/cravings`: `+page.server.ts` (load: redirect if not logged in, fetch cravings; action: log craving; action: sign out) and `+page.svelte` (form + list + sign out). Single-column, full-width, touch-friendly.
5. [ ] Update `/`: `+page.server.ts` load only — redirect to `/login` or `/cravings`; optional minimal `+page.svelte` (e.g. a loading state or immediate redirect so it’s never really visible).

After this, a user can: open the app on mobile or desktop → (optionally install as PWA) → get sent to login or cravings → register/login → type a craving and submit → see it in the list → sign out. No other features or UI for v1. Service worker can be added later for caching/offline if needed.
