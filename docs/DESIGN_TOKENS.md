# Design tokens (Becom)

CSS custom properties live in **`src/styles/design-tokens.css`**. They load globally via `app.css`.

## How to use

```css
.my-component {
  background: var(--surface-frosted);
  color: var(--color-text-on-frosted);
  border: 1px solid var(--border-frosted);
  box-shadow: var(--shadow-frosted);
  backdrop-filter: var(--blur-frosted);
}
```

Prefer **semantic** tokens (`--surface-frosted`, `--color-brand-navy`) over duplicating hex/rgba in Svelte `<style>` blocks.

## Categories

| Group | Examples | Use |
|--------|-----------|-----|
| **Sky** | `--color-sky-950` … `--color-sky-600`, `--gradient-sky-app` | App shell, login, transition underlay |
| **Land / horizon** | `--gradient-horizon-land`, `--gradient-horizon-glow` | Reflect + auth ground slice, atmosphere |
| **Milky band** | `--gradient-milky-band` | Star-field highlight |
| **Silhouette** | `--color-silhouette-1` … `--color-silhouette-base` | Tree/hill SVG fills (prefer tokens when styling via CSS) |
| **Brand** | `--color-brand-navy`, `--color-brand-navy-muted` / `subtle` / `border` / `divider`, `--color-brand-lime` | Light sheets, craving UI, active skill accent |
| **Filters** | `--filter-drop-accent`, `--filter-island-glow` | Progress fill glow, current island glow |
| **Frosted UI** | `--surface-frosted`, `--border-frosted`, `--shadow-frosted`, `--blur-frosted` | Progress pill, insight cards, skill cards |
| **On-dark text** | `--color-text-on-frosted`, `--color-text-on-frosted-muted` | Labels on glass panels |
| **Legacy app** | `--bg`, `--text`, `--text-muted`, `--island-*`, `--input-*` | Existing screens; map to primitives where noted in file |

## Theme color

`<meta name="theme-color">` should match the top of the sky ramp: **`#010810`** (`--color-sky-950`).

## Reflect hold button

The main Reflect page still uses **many layered gradients and drop-shadows** for the hold control and fireflies. Shared inks (`--color-brand-navy`, paper white) are tokenized where touched; full extraction would be a follow-up.
