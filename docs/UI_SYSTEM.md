# 🌟 ElevateCV UI System

**High-Performance, Modern, and Beautiful**

---

## Design System

ElevateCV is built on a lightweight, modern design foundation that focuses on **clarity, speed, and consistency**.

### 🎨 Colors — Precision via OKLCH

We use **OKLCH** for a more accurate, stable, and accessible color palette.

**Light Mode**
```css
--background: oklch(1 0 0);
--foreground: oklch(0.18 0 0);
--primary: oklch(0.18 0 0);
```

**Dark Mode**
```css
--background: oklch(0.12 0 0);
--foreground: oklch(0.96 0 0);
```

**Why it matters:**  
Colors stay consistent across devices, gradients look cleaner, and contrast is predictable.

---

## Typography

Clean, modern typography using **Geist Sans** and **Geist Mono**.

- Tight heading letter-spacing for a sharp look
- Responsive scaling for mobile → desktop
- Ligatures and advanced OpenType features enabled

**Result:** everything feels crisp, intentional, and professional.

---

## Component System

A full suite of **57 shadcn/ui components**, fully accessible and theme-ready.

### Categories

- **Layout**: card, sidebar, tabs, accordion
- **Forms**: input, select, checkbox, slider
- **Navigation**: dropdown-menu, menubar, breadcrumb
- **Feedback**: dialog, toast, alert-dialog
- **Data Display**: table, avatar, chart, badge
- **Utilities**: scroll-area, command palette, carousel

---

## Interaction & Accessibility

Built on **Radix UI primitives**:

- WCAG-compliant
- Keyboard navigation everywhere
- ARIA roles built-in
- Composable logic & behaviors

---

## Themes

Full light/dark theming powered by **next-themes** with smooth transitions.

Your theme provider lives in:
```
components/theme-provider.tsx
```

---

## Animation

Lightweight animation system using:

- `tw-animate-css`
- `tailwindcss-animate` plugin

Includes fades, slides, scale animations, and subtle micro-interactions.

---

## Architecture & Utilities

### Variant System (CVA)

Every component has type-safe variants.

```ts
variant: {
  default: "bg-primary text-primary-foreground",
  outline: "border bg-background",
  gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
}
```

### `cn()` Utility

Smart class merging for cleaner components.

```ts
cn("px-4 py-2", "px-6") // → 'py-2 px-6'
```

---

## Structure

```
components/
  ui/                  // Core UI primitives
  auth/                // Auth flows
  billing/             // Billing & payments
  resume-builder/      // Resume modules
  navbar.tsx
  theme-provider.tsx
```

---

## Built-in Enhancements

- Charting with Recharts
- Toasts via Sonner
- Forms with React Hook Form
- Embla Carousel for galleries
- CmdK command palette

---

## 💎 Why This UI System Works

- Lightning-fast
- Scales elegantly
- Fully type-safe
- Accessible by default
- Pixel-consistent
- Modern visual language
- Production-ready from day one

---

## 🔥 Premium Enhancements Applied

### 1. Consistent Shadow System
Two shadow tiers only:
- **Subtle**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **Elevated**: `0 4px 6px -1px rgb(0 0 0 / 0.1)`

### 2. Micro-interactions
- Buttons: 3% scale up on hover
- Cards: subtle border glow on focus
- Inputs: animated border on active

### 3. Stronger Spacing Hierarchy
- Sections breathe with `clamp(3rem, 8vw, 6rem)` padding
- Consistent vertical rhythm

### 4. Signature Gradient
Amber → Orange gradient as brand accent:
```css
background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
```

### 5. Unified Border Radius
Consistent `0.625rem` (10px) across all components

---

## Implementation Details

All enhancements are in `app/globals.css`:

- ✅ Shadow system defined
- ✅ Micro-interactions for buttons, cards, inputs
- ✅ Smooth theme transitions
- ✅ Consistent focus states
- ✅ Disabled state styling
- ✅ Link hover effects
- ✅ Section spacing hierarchy

---

**Built for production. Designed for delight.** 🚀
