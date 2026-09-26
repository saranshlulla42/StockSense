---
name: frontend-design
description: >-
  Use this skill whenever creating, styling, or updating UI pages, layouts, and components
  in the StockSense repository. Enforces the modern Odoo-inspired aesthetic with the indigo
  palette, serif italic accents, organic blobs, and polished card surfaces.
---

# StockSense Frontend Design Skill

This skill guides the design and implementation of user interfaces matching the StockSense aesthetic found in the Welcome, Login, and Signup pages.

## Design Checklist

When implementing or restyling any page:

1. **Brand Identity**:
   - Use the StockSense placeholder logo: indigo rounded box (`bg-indigo-600 rounded-lg` or `rounded-2xl`) with white `TrendingUp` icon + bold "StockSense" text.
   - Primary color: Indigo (`indigo-600` for actions, `indigo-50` for badges/chips).
   - Accent colors: Cyan (`#0891b2`) for squiggle underlines, Emerald for success, Amber for alerts.

2. **Typography**:
   - Modern clean sans-serif base.
   - Distinctive serif italic accent (`fontFamily: 'Georgia, serif', fontStyle: 'italic'`) on key highlight words in major headings.
   - Hand-drawn SVG squiggle underline for emphasized words.

3. **Background & Atmosphere**:
   - Pure white (`bg-white`) and light gray (`bg-gray-50`).
   - Sticky navbar: `bg-white/80 backdrop-blur-md border-b border-gray-100`.
   - Subtle background organic SVG blobs with 0.05 - 0.08 opacity or 60px blur.

4. **Component Patterns**:
   - Cards: `bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow`.
   - Primary buttons: `bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200`.
   - Inputs: Icon on the left (`absolute left-3 top-1/2 -translate-y-1/2`), `pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm`.
   - Micro-badges: `rounded-full px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700`.

5. **Verification**:
   - Run `npm run build` after changes to verify TypeScript and Vite compilation.
