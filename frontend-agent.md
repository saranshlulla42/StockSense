# StockSense Frontend Agent Guide

This file is the source of truth for frontend design and component work in StockSense. Read it before creating or changing any frontend page, layout, or reusable UI component.

## 1. Work in the correct frontend

The active frontend lives at the repository root:

```text
index.html
package.json
src/
vite.config.ts
```

Do not add new work to the legacy `frontend/` directory. Do not copy components between the two applications. Run the active frontend from the repository root with `npm run dev`.

When these instructions conflict with older frontend notes, follow this file and the current components under `src/`.

## 2. Design direction

StockSense should feel calm, organized, and trustworthy. It is an inventory workspace, so information hierarchy and legibility matter more than decoration.

Use these existing pages as visual references:

- `src/pages/auth/WelcomePage.tsx` for public marketing sections, branded illustrations, and editorial headings.
- `src/pages/auth/LoginPage.tsx` and `src/pages/auth/SignupPage.tsx` for authentication layouts.
- `src/pages/DashboardPage.tsx` for authenticated page composition, data cards, and empty states.
- `src/components/layout/AppShell.tsx`, `Sidebar.tsx`, and `Topbar.tsx` for application structure and navigation.

The design language is:

- white and soft gray surfaces;
- a dark slate application sidebar;
- indigo as the primary action and brand color;
- cyan, emerald, amber, and rose only when they communicate meaning;
- rounded-xl controls and rounded-2xl cards;
- thin neutral borders and restrained shadows;
- generous whitespace, clear alignment, and short readable text;
- selective Georgia italic accents in prominent marketing headings.

Avoid loud gradients, excessive blobs, glass effects on every surface, heavy shadows, tiny text, crowded cards, and arbitrary one-off colors.

## 3. Color and typography

Use Tailwind palette classes consistently:

| Purpose | Preferred classes |
|---|---|
| Primary action and active navigation | `bg-indigo-600`, `hover:bg-indigo-700`, `text-indigo-600` |
| Main text | `text-slate-900`, `text-gray-800` |
| Supporting text | `text-gray-500`, `text-gray-400` |
| App background | `bg-[#f7f8fb]` |
| Cards and controls | `bg-white`, `border-gray-200/80` |
| Sidebar | `bg-slate-900`, `border-slate-800`, `text-slate-400` |
| Success / incoming | emerald |
| Warning / low stock | amber |
| Error / destructive | rose or red |
| Informational secondary accent | cyan |

Use Inter through the global font stack. Page titles use tight tracking and medium or semibold weight. Use `.editorial-accent` for one short phrase in a large marketing heading; do not use it in tables, form labels, or ordinary application headings.

Recommended hierarchy:

- Marketing hero: responsive `clamp()` sizing or `text-5xl` through `text-7xl`.
- Application page title: `text-2xl sm:text-[28px] tracking-tight font-semibold`.
- Section title: `text-sm` to `text-lg`, semibold.
- Body copy: `text-sm leading-6` or `leading-7`.
- Metadata: `text-xs`; reserve `text-[10px]` and `text-[11px]` for compact labels only.

## 4. Spacing and alignment

Use the existing application content frame from `AppShell`:

```tsx
className="max-w-[1440px] mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"
```

Use a 4px-based spacing rhythm. Prefer `gap-3`, `gap-4`, `gap-5`, `gap-6`, and `gap-8`. Cards usually use `p-4`, `p-5`, `p-6`, or the shared `Card` padding options.

Rules:

- Align page titles, filters, cards, and tables to the same content edges.
- Use CSS grid for repeated cards and table-like summaries.
- Keep text blocks narrow enough to read; descriptions usually use `max-w-2xl` or less.
- Let action rows wrap on small screens.
- Do not use fixed pixel widths for primary page content.
- Do not add global `margin: 0` or `padding: 0` rules outside `@layer base`; they override Tailwind spacing utilities.

## 5. Reuse components before adding markup

Check `src/components/ui/` before creating a new component:

- `Button`: all buttons and button states.
- `Card`, `CardHeader`, `CardTitle`: grouped content surfaces.
- `Input` and `Select`: labeled form controls and validation.
- `Badge`: statuses and compact metadata.
- `Table`: structured lists.
- `Modal`: dialogs and create/edit forms.
- `EmptyState`, `LoadingState`, `ErrorState`: async and no-data states.

Use `PageHeader` for authenticated page titles and actions. Add navigation items only through `src/config/navigation.ts` so the sidebar, topbar search, and page labels stay synchronized.

Create a new shared component when the same visual or behavioral pattern appears on two or more pages. Keep page-specific compositions in `src/pages/`.

Do not duplicate button, input, card, modal, status badge, or empty-state styles inline. Extend the shared component with a clear prop or variant when necessary.

## 6. Component contracts and states

Every interactive or data-driven component must account for:

- default;
- hover and keyboard focus;
- disabled, when the action is unavailable;
- loading;
- empty data;
- validation or request error;
- success feedback when an action completes.

Do not show fake production metrics as real data. Use an em dash, skeleton, explicit sample label, or empty state until the API returns a value. Disable unfinished actions and explain their state with nearby text or a `title` where appropriate.

Status colors must be consistent:

- Draft: neutral gray.
- Waiting: amber.
- Ready: indigo or blue.
- Done: emerald.
- Cancelled or failed: rose/red.
- Receipt/incoming: emerald or cyan.
- Delivery/outgoing: amber or rose where urgency is intended.

Stock quantities are read-only views. Quantity-changing interfaces must use receipt, delivery, transfer, or adjustment workflows rather than editing product totals directly.

## 7. Responsive behavior

Design mobile-first and verify at approximately 375px, 768px, and 1440px.

- Below `md`, use the existing dialog-based mobile navigation.
- At `md` and above, use the persistent sidebar.
- Start repeated content at one column, then expand deliberately with `sm:`, `lg:`, or `xl:`.
- Tables need either a purposeful compact mobile presentation or horizontal scrolling inside their own container.
- Do not allow the document itself to overflow horizontally.
- Keep touch targets at least 40px tall when practical.
- Preserve useful content order when grids collapse.

## 8. Accessibility

- Use semantic elements: `header`, `nav`, `main`, `section`, `form`, `table`, and real buttons/links.
- Every input needs a visible label or an accurate `aria-label`.
- Icon-only buttons need an accessible name.
- Decorative icons and backgrounds use `aria-hidden="true"`.
- Preserve the global `:focus-visible` treatment.
- Do not remove keyboard focus outlines without replacing them.
- Modals must close with Escape, identify themselves as dialogs, and have a labeled close button.
- Do not use color as the only indicator of status.
- Respect `prefers-reduced-motion`; global handling already exists in `src/index.css`.
- Maintain readable contrast for text, controls, and disabled states.

## 9. Icons, imagery, and motion

Use `lucide-react` icons. Default application icons are usually 15–20px with a stroke width around 1.5–1.8. Use the `TrendingUp` icon in an indigo rounded square for the StockSense mark.

Prefer CSS and existing assets over new external image dependencies. Illustrative dashboards must be clearly presented as previews or samples.

Motion should clarify interaction. Use short color, opacity, or transform transitions around 150–400ms. Avoid continuous animation in authenticated product screens. Ensure the interface remains understandable with reduced motion enabled.

## 10. Content style

Write concise, human interface copy:

- use sentence case;
- use concrete verbs;
- keep page descriptions to one short sentence;
- explain empty states and offer one useful next action;
- avoid technical implementation language in the UI;
- avoid claims about AI, live data, automation, or integrations unless the feature exists.

Use StockSense's calm brand voice: “A clearer view of inventory,” “Everything in its place,” and similarly direct language. Do not fill application pages with marketing copy.

## 11. Page implementation checklist

Before editing:

1. Read this file and inspect the closest existing reference page.
2. Inspect shared UI components and navigation configuration.
3. Confirm whether the screen is functional, partially implemented, or a placeholder.
4. Check the actual API contract; do not invent fields from a planning document.

While implementing:

1. Compose shared components first.
2. Keep API calls outside purely presentational components.
3. Include loading, empty, error, and success states.
4. Preserve stock and audit rules in the user flow.
5. Check alignment and wrapping at mobile width while working.

Before handing off:

```bash
npm run lint
npm run build
```

Also verify:

- every changed route renders;
- no browser console errors occur;
- there is no page-level horizontal overflow at 375px, 768px, or 1440px;
- keyboard navigation and focus are visible;
- mobile navigation and dialogs open and close correctly;
- loading, empty, and error states are understandable;
- unrelated frontend or backend files were not changed.

## 12. Definition of consistent frontend work

A frontend change is complete when it follows the shared visual system, works at all supported widths, uses existing components, represents real backend behavior accurately, covers relevant interface states, passes lint and build checks, and can be understood without reading implementation comments.
