# Dimar — Design System Master
## Style: Brutalism + Motion-Driven

---

## Color Palette

| Token | Hex | CSS Var | Usage |
|-------|-----|---------|-------|
| Primary | `#2563EB` | `--color-primary` | CTAs, links, highlights |
| Secondary | `#7C3AED` | `--color-secondary` | Accents, badges, secondary CTAs |
| Ink | `#0A0A0A` | `--brutalist-ink` | Borders, hard shadows, text |
| Paper | `#FAFAFA` | `--brutalist-paper` | Page background (light mode) |
| Surface | `#FFFFFF` | `--bg-surface` | Card / component background |
| Dark base | `#0A0A0A` | dark `--bg-page` | Page background (dark mode) |
| Dark surface | `#111111` | dark `--bg-surface` | Card background (dark mode) |

---

## Typography

| Role | Font | Weights | Tailwind Class |
|------|------|---------|---------------|
| Display / Headlines | Space Grotesk | 500, 600, 700 | `font-display` |
| Body / UI text | Space Grotesk | 400, 500 | `font-display` (default body) |
| Prices / Mono data | JetBrains Mono | 400, 700 | `font-mono` |

### Typographic Scale

| Name | Size | Line Height | Usage |
|------|------|------------|-------|
| Hero | `clamp(3.5rem, 10vw, 8rem)` | 0.95 | Hero section headlines |
| Display | `clamp(2rem, 5vw, 4rem)` | 1.0 | Section titles |
| Heading | `1.75rem – 2.5rem` | 1.1 | Page titles |
| Title | `1.25rem – 1.5rem` | 1.2 | Card / sub-section titles |
| Body | `1rem` | 1.6 | Body text |
| Small | `0.875rem` | 1.5 | Meta, labels |
| Micro | `0.75rem` | 1.4 | Badges, captions |

---

## Borders

| Token | Value | Usage |
|-------|-------|-------|
| Standard | `2px solid #0A0A0A` | Cards, inputs, buttons |
| Thick | `4px solid #0A0A0A` | Featured elements, CTAs |
| Dividers (dark mode) | `2px solid rgba(255,255,255,0.15)` | Dark section separators |

- **Border radius: 0 everywhere** — no rounded corners, no pill shapes

---

## Hard Shadows (NO blur, NO spread)

| Token | Value | Usage |
|-------|-------|-------|
| `brut-shadow-sm` | `3px 3px 0px #0A0A0A` | Subtle lift |
| `brut-shadow` | `5px 5px 0px #0A0A0A` | Standard card hover |
| `brut-shadow-lg` | `8px 8px 0px #0A0A0A` | Featured / hero elements |
| `brut-shadow-primary` | `5px 5px 0px #2563EB` | Primary CTA hover |
| `brut-shadow-secondary` | `5px 5px 0px #7C3AED` | Secondary CTA hover |

Dark mode variants use white shadow: `5px 5px 0px rgba(255,255,255,0.6)`

---

## Motion

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Hover lift | 150ms | ease-out | `:hover` |
| Press down | 100ms | ease-in | `:active` |
| Scroll entrance | 500ms | power2.out | ScrollTrigger `top 88%` |
| Stagger delay | 60ms between items | power2.out | ScrollTrigger |
| Marquee cycle | 25s | linear infinite | auto-play |
| Kinetic headline | 700ms | power3.out | on mount |

**prefers-reduced-motion:** All GSAP animations disabled. Marquee static. Transitions instant.

### Interactive States

- **Hover**: `translate(-3px, -3px)` + shadow appears
- **Active**: `translate(0, 0)` + shadow disappears
- **Focus**: `2px solid #2563EB` outline, `2px` offset, no border-radius

---

## Marquee Bar

- Background: `#0A0A0A` | Text: `#FAFAFA` | Font: JetBrains Mono, uppercase, `tracking-widest`
- Speed: 25s | Content repeated ×4 for seamless loop
- Separator: ` · `
- Used in: top of Navbar, home hero strip

---

## Layout

- Max content width: `1280px` (`max-w-7xl`)
- Section padding (mobile): `px-4 py-16`
- Section padding (desktop): `px-8 py-24`
- Grid gutters: `16px` mobile / `24px` tablet / `32px` desktop

### Breakpoints

| Name | Min-width |
|------|-----------|
| Mobile | 375px |
| Tablet | 768px (md) |
| Desktop | 1024px (lg) |
| Wide | 1440px (xl) |

---

## Component Reference

### Button Primary
```
bg-[#2563EB] text-white font-bold uppercase tracking-widest
border-2 border-[#0A0A0A] px-6 py-3
hover: translate(-3px,-3px) shadow(5px 5px 0 #0A0A0A)
active: translate(0,0) shadow-none
transition: 150ms ease-out
```

### Button Secondary
```
bg-transparent text-[#0A0A0A] font-bold uppercase tracking-widest
border-2 border-[#0A0A0A] px-6 py-3
hover: translate(-3px,-3px) shadow(5px 5px 0 #0A0A0A)
transition: 150ms ease-out
```

### Input Field
```
bg-white text-[#0A0A0A]
border-2 border-[#0A0A0A] px-4 py-3
focus: border-[#2563EB] outline-none
no border-radius, no box-shadow
```

### Card
```
bg-white border-2 border-[#0A0A0A]
hover: translate(-3px,-3px) shadow(5px 5px 0 #0A0A0A)
no border-radius
transition: 150ms ease-out
```

### Badge / Tag
```
inline-block border-2 border-current px-2 py-0.5
font-mono font-bold text-xs uppercase tracking-wider
no border-radius
```

---

## Dark Sections

Used for: Footer, special CTA blocks, announcement bar.

```
background: #0A0A0A
text: #FAFAFA
borders: rgba(255,255,255,0.15)
hard shadows: 5px 5px 0px rgba(255,255,255,0.5)
```

---

## Accessibility

- All text meets WCAG AA contrast (≥ 4.5:1 for body, ≥ 3:1 for large)
- Focus rings visible on all interactive elements (never `outline-none` without replacement)
- `aria-label` on all icon-only buttons
- `prefers-reduced-motion` respected in all GSAP animations and CSS transitions
- No color as sole means of conveying information
