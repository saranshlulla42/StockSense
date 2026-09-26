# StockSense Agent Guidelines & Design System

All agents operating in this repository must adhere to the design system established for StockSense, as exemplified in [`WelcomePage.tsx`](file:///home/abhijay/python/StockSense/src/pages/auth/WelcomePage.tsx), [`LoginPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/auth/LoginPage.tsx), and [`SignupPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/auth/SignupPage.tsx).

---

## 1. Visual Identity & Brand Styling

### Primary & Accent Colors
- **Primary Brand**: Indigo (`indigo-600` / `#4f46e5` for primary buttons & highlights, `#6366f1` for badges/blobs, `indigo-50` for chips/pills).
- **Secondary Accents**:
  - Cyan (`#0891b2`, `cyan-500`) for underlines and lively accents.
  - Emerald / Green (`green-600`, `emerald-500`, `bg-green-50`) for success/active statuses.
  - Amber (`amber-500`, `amber-600`, `bg-amber-50`) for warnings, reorders, low stock.
  - Rose / Danger (`rose-600`, `red-500`) for errors and urgent alerts.
  - Slate (`#0f172a` / `slate-900`) for dark surfaces, mockup sidebars, and high-contrast elements.
- **Backgrounds**:
  - Crisp clean white (`bg-white`) as the primary base.
  - Ultra-light neutral gray (`bg-gray-50`) for section contrast.
  - Frosted glass effect for sticky navigation bars: `bg-white/80 backdrop-blur-md border-b border-gray-100`.

### Typography Hierarchy
- **Base UI Font**: Modern sans-serif (`Inter`, `-apple-system`, `sans-serif`), clean tracking (`tracking-tight` for titles).
- **Editorial Accent Font**: Serif italic (Georgia or `font-serif italic` / `style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}`) applied selectively to key emotional/hook words in large headings (e.g., *Smart* Inventory, *Zero Surprises*).
- **Hand-drawn Underline Squiggle**: When emphasizing italic keywords in major headings, attach a subtle curved SVG underline (in cyan `#0891b2` or indigo).
- **Pill Badges**: Pill-shaped eyebrow tags (`rounded-full px-3 py-1 text-xs font-semibold`) pairing an icon and subtle tinted background (e.g. `bg-indigo-50 text-indigo-700`).

---

## 2. Layouts, Cards, and Decorative Motifs

### Organic Blobs
- In landing, auth, or hero sections, use soft organic SVG blobs in the background with low opacity (`opacity: 0.05` to `0.08`) or CSS blur (`filter: blur(60px)`).

### App Mockups & UI Previews
- When presenting previews, encapsulate them in rounded browser/window frames (`rounded-2xl border border-gray-200 shadow-2xl bg-white`).
- Include standard window control dots (red, yellow, green) and floating card badges with status icons (`ShieldCheck`, `Zap`, `TrendingUp`).

### Card Surfaces
- Structure data and features using card components:
  - Container: `bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow`.
  - Icon container: `w-10 h-10 rounded-xl flex items-center justify-center mb-4` with matching tinted background (`bg-indigo-100 text-indigo-600`).

### Placeholder Brand Logo
- Consistent placeholder icon across public and authenticated screens:
  - An indigo rounded square (`rounded-lg` or `rounded-2xl bg-indigo-600`) enclosing a white Lucide `TrendingUp` icon.
  - Accompany with bold brand wordmark: **StockSense**.

---

## 3. Forms & Component Conventions

### Input Fields
- Prefix with relevant Lucide icon (e.g., `Mail`, `Lock`, `User`, `Search`) positioned at `left-3 top-1/2 -translate-y-1/2 text-gray-400`.
- Padding: `pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm`.
- Focus state: `focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`.
- Password fields include visibility toggle button (`Eye` / `EyeOff`) with `tabIndex={-1}`.

### Buttons
- **Primary CTA**:
  ```tsx
  className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200"
  ```
- **Secondary / Outline**:
  ```tsx
  className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
  ```

---

## 4. Subagent Availability

The specialized subagent `frontend-designer` is available to invoke whenever building or redesigning pages to guarantee strict alignment with this design aesthetic.
