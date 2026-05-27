# Footer Redesign - Specification

## Overview
Improve the blog footer with school/trip info and a contact page. Make it visually complete on desktop and non-obnoxious on mobile.

## Footer Design

### Layout
- **Desktop (≥640px):** 3-column flex layout
  - Left: Collège Albert Camus (school name)
  - Center: Voyage à Londres — 2026 / Journal du séjour des 4e
  - Right: "Contact / Mentions" link
- **Mobile (<640px):** Vertical stack, centered, compact spacing

### Content
- School name: "Collège Albert Camus"
- Trip info: "Voyage à Londres — 2026" (line 1), "Journal du séjour des 4e" (line 2)
- Contact link: "Contact / Mentions" → `/contact`

### Styling
- Match existing theme: zinc color palette, subtle borders
- Use existing Link component
- Maintain current background colors (light: #fbfaf7, dark: zinc-950)
- Font size: text-sm (14px) for all content
- Mobile: py-6, desktop: py-8

## Contact Page

### Route
- `/contact` — new page via `src/app/contact/page.tsx`

### Form Fields
- Name (text input)
- Email (email input)
- Message (textarea)
- Submit button

### Behavior
- Form submission just logs to console (no backend)
- Basic client-side validation (required fields)
- Success state after "submit"

### Styling
- Centered card layout, max-width ~500px
- Match site typography and colors
- Dark mode support