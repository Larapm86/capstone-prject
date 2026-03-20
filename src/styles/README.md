# Becom styles

## Import chain

| File | Role |
|------|------|
| `design-tokens.css` | **Single source of truth** for colors, radii, motion, and component recipes. |
| `app.css` | Imports tokens, then global reset, layout, forms, and **`.cta-3d-primary`**. |
| `+layout.svelte` (root) | Should import `app.css` once for the whole app. |
| `*.svelte` `<style>` | Scoped UI; **prefer `var(--token)`** instead of copying hex/rgba. |

Do **not** import `design-tokens.css` from individual components (avoids duplicate layers and order bugs).

---

## Token layers (use the shallowest that fits)

1. **Primitives** — e.g. `--color-sky-700`, `--color-brand-navy`. Use when building something without a named recipe yet.
2. **Semantic** — e.g. `--bg`, `--text`, `--color-text-on-paper`, `--color-text-on-frosted`. Meaning on a surface type.
3. **Component** — reusable patterns:
   - **`--cta-3d-*`** — main actions (login, onboarding Next, CravingForm Next/Reflect). Markup: `class="cta-3d-primary"` (+ `cta-3d-primary--on-dark` on sky).
   - **`--glass-on-sky-*`** — selectable rows on the night gradient (onboarding options, preparing checklist).
   - **`--ring-on-sky-*`** — circular progress on sky.
   - **`--focus-ring-*`** — keyboard focus; `--focus-ring-on-dark` vs `--focus-ring-on-light`.
4. **Layout** — `--min-touch`, `--radius-sm|md|lg`, `--page-padding`, `--max-width`, `--font-sans`.

---

## When to add a token

| Situation | Action |
|-----------|--------|
| Same color/shadow used in **2+ places** or **2+ files** | Add a named token under the right layer in `design-tokens.css`. |
| One-off in a single component | Local value is OK; promote to token if copied again. |
| New “kind” of control (e.g. second CTA tier) | Add a **component** group with a short comment block (like `--cta-3d-*`). |

---

## Radii (use these instead of raw `rem`)

- **`--radius-sm`** (0.5rem) — chips, small controls, nav pills.
- **`--radius-md`** (0.75rem) — default buttons, inputs, primary CTA.
- **`--radius-lg`** — large cards / shells where already in use.

---

## Motion

- **`--duration-press`** + **`--ease-press`** — quick press/hover feedback (buttons, glass chips).

---

## Legacy names

`--bg`, `--text`, `--input-*` are **semantic legacy** names kept for existing app chrome and forms. Prefer new primitives/semantic tokens for new features when there is a clear mapping.
