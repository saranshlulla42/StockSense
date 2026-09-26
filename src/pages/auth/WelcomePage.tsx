import { Link } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardCheck,
  Layers,
  LayoutDashboard,
  Package,
  ShieldCheck,
  TrendingUp,
  Truck,
} from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'A clear view of your stock',
    description:
      'Keep products, quantities, and warehouse locations together in one organized workspace.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Layers,
    title: 'Every location, connected',
    description:
      'Follow inventory across warehouses and track transfers from one shelf to the next.',
    color: 'bg-cyan-50 text-cyan-700',
  },
  {
    icon: ShieldCheck,
    title: 'A history you can follow',
    description:
      'Trace receipts, deliveries, and adjustments with a clear record of every stock movement.',
    color: 'bg-emerald-50 text-emerald-600',
  },
]

/** Illustrative product preview, intentionally separate from live inventory. */
function InventoryPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        className="absolute -inset-8 rounded-full bg-indigo-400/[0.06] blur-3xl"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_-24px_rgba(49,46,129,0.25)]">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-rose-300" />
            <span className="size-2 rounded-full bg-amber-300" />
            <span className="size-2 rounded-full bg-emerald-300" />
          </div>
          <span className="text-[10px] font-medium text-gray-400">
            StockSense / Overview
          </span>
          <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-600">
            Sample workspace
          </span>
        </div>
        <div className="flex">
          <div
            className="hidden w-14 shrink-0 flex-col items-center gap-6 bg-slate-900 py-5 sm:flex"
            aria-hidden="true"
          >
            <span className="rounded-lg bg-indigo-600 p-2 text-white">
              <TrendingUp size={15} />
            </span>
            {[LayoutDashboard, Package, Layers, Truck, ClipboardCheck].map(
              (Icon, index) => (
                <Icon
                  key={index}
                  size={16}
                  className={index === 0 ? 'text-indigo-300' : 'text-slate-500'}
                />
              ),
            )}
          </div>
          <div className="min-w-0 flex-1 bg-[#fafbfe] p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400">
                  Your inventory, at a glance
                </p>
                <p className="mt-1 text-base font-semibold tracking-tight text-slate-900">
                  Warehouse overview
                </p>
              </div>
              <span className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[9px] text-gray-500">
                This week
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['Products', '248', 'Across 3 locations'],
                ['To receive', '12', 'Incoming shipments'],
                ['To deliver', '8', 'Ready to dispatch'],
              ].map(([label, value, caption]) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-100 bg-white p-3"
                >
                  <p className="text-[10px] text-gray-500">{label}</p>
                  <p className="my-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {value}
                  </p>
                  <p className="text-[8px] leading-3 text-gray-400">
                    {caption}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">
                  Stock movement
                </p>
                <div className="flex gap-3 text-[8px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <i className="size-1.5 rounded-full bg-indigo-500" />
                    Incoming
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="size-1.5 rounded-full bg-cyan-300" />
                    Outgoing
                  </span>
                </div>
              </div>
              <div
                className="flex h-28 items-end justify-between gap-3 border-b border-gray-100 bg-[repeating-linear-gradient(to_top,transparent,transparent_27px,#f3f4f6_28px)] px-2"
                aria-label="Illustrative weekly stock movement chart"
              >
                {[42, 62, 48, 78, 59, 90, 70].map((height, index) => (
                  <div
                    key={index}
                    className="flex h-full flex-1 items-end justify-center gap-1"
                  >
                    <div
                      className="w-3 rounded-t-sm bg-indigo-500"
                      style={{ height: `${height}%` }}
                    />
                    <div
                      className="w-3 rounded-t-sm bg-cyan-200"
                      style={{ height: `${height * 0.66}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-around text-[8px] text-gray-400">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <span key={index}>{day}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                {
                  icon: ArrowDownLeft,
                  title: 'WH/IN/0012',
                  label: 'Receipt completed',
                  color: 'bg-emerald-50 text-emerald-600',
                },
                {
                  icon: ArrowUpRight,
                  title: 'WH/OUT/0008',
                  label: 'Ready for dispatch',
                  color: 'bg-indigo-50 text-indigo-600',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white p-2.5"
                >
                  <span className={`rounded-md p-1.5 ${item.color}`}>
                    <item.icon size={12} />
                  </span>
                  <span className="text-[10px] font-medium text-gray-700">
                    {item.title}
                  </span>
                  <span className="ml-auto text-[9px] text-gray-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg shadow-slate-200/50 lg:flex">
        <span className="rounded-full bg-emerald-50 p-2 text-emerald-600">
          <Check size={16} />
        </span>
        <div>
          <p className="text-xs font-semibold text-gray-800">
            Everything in its place.
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            Clear stock. Confident decisions.
          </p>
        </div>
      </div>
    </div>
  )
}

export function WelcomePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <nav
        aria-label="Public navigation"
        className="sticky top-0 z-30 border-b border-gray-100 bg-white/85 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <TrendingUp size={21} />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              StockSense<span className="text-indigo-600">.</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-gray-500 md:flex">
            <a href="#features" className="hover:text-indigo-600">
              Why StockSense
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600">
              How it works
            </a>
            <Link to="/dashboard" className="hover:text-indigo-600">
              Explore workspace
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-gray-600 hover:text-indigo-600 sm:block"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 sm:text-sm"
            >
              Get started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-[#fafaff] to-white">
          <div
            className="hero-grid pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-32 top-12 size-96 rounded-full bg-indigo-400/[0.06] blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-28">
            <div className="page-enter max-w-xl">
              <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700">
                <span className="size-1.5 rounded-full bg-indigo-500" />A little
                clarity. A lot more control.
              </span>
              <h1 className="text-[clamp(2.75rem,5vw,4.4rem)] font-semibold leading-[1.09] tracking-[-0.045em] text-slate-900">
                Your inventory.
                <br />
                Finally, in{' '}
                <span className="editorial-accent relative inline-block text-indigo-600">
                  harmony.
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-cyan-600"
                    viewBox="0 0 220 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8Q98 -1 217 6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="mt-7 max-w-md text-base leading-7 text-gray-500 sm:text-lg sm:leading-8">
                Less guesswork. More getting things done. Bring your products,
                warehouses, and everyday operations into one clear workspace.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/signup"
                  className="inline-flex h-12 items-center gap-3 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200/60 transition hover:bg-indigo-700"
                >
                  Get started <ArrowRight size={16} />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  Explore the workspace <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                {['One shared workspace', 'Every movement accounted for'].map(
                  (text) => (
                    <span key={text} className="flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-600" />
                      {text}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="page-enter min-w-0">
              <InventoryPreview />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Built for your day-to-day
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                A place for{' '}
                <span className="editorial-accent">everything.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-gray-500">
              From the first delivery to the last dispatch.
              <br />
              Keep the whole picture in view.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-7 flex items-center justify-between">
                  <span
                    className={`flex size-11 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <feature.icon size={22} strokeWidth={1.6} />
                  </span>
                  <span className="text-xs text-gray-300">0{index + 1}</span>
                </div>
                <h3 className="mb-3 text-lg font-semibold tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-7 text-gray-500">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-gray-100 bg-gray-50/70"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                A simpler workflow
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                From scattered stock
                <br />
                to{' '}
                <span className="editorial-accent text-indigo-600">
                  a clear picture.
                </span>
              </h2>
              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Take a look inside <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                [
                  '01',
                  'Make it yours',
                  'Organize your products and the locations where they belong.',
                ],
                [
                  '02',
                  'Keep things moving',
                  'Receive, deliver, and transfer stock with a consistent workflow.',
                ],
                [
                  '03',
                  'Stay in the know',
                  'Review stock levels and follow the history behind every change.',
                ],
              ].map(([step, title, description]) => (
                <div key={step}>
                  <span className="mb-5 flex size-10 items-center justify-center rounded-full border border-indigo-100 bg-white text-xs font-semibold text-indigo-600">
                    {step}
                  </span>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="text-sm leading-6 text-gray-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute -right-20 -top-32 size-96 rounded-full bg-indigo-500/10 blur-3xl"
              aria-hidden="true"
            />
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
              Less chaos. More clarity.
            </p>
            <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Make room for{' '}
              <span className="editorial-accent text-indigo-300">
                better days.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400">
              Give your inventory a home. Give your team a shared view of what
              comes next.
            </p>
            <Link
              to="/signup"
              className="relative mt-7 inline-flex items-center gap-3 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Get started with StockSense <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 text-xs text-gray-400 sm:flex-row sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-gray-700"
          >
            <TrendingUp size={17} className="text-indigo-600" />
            StockSense
          </Link>
          <p>
            © {new Date().getFullYear()} StockSense. A clearer view of
            inventory.
          </p>
          <div className="flex gap-5">
            <a href="#features" className="hover:text-indigo-600">
              Features
            </a>
            <Link to="/login" className="hover:text-indigo-600">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
