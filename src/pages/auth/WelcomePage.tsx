import { Link } from 'react-router-dom'
import {
  TrendingUp,
  BarChart2,
  Layers,
  Zap,
  ShieldCheck,
  Bell,
  ArrowRight,
  ChevronRight,
  Package,
  Truck,
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
  Star,
} from 'lucide-react'

/* ─── Inline keyframe styles ────────────────────────────────────────────── */
const animationStyles = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(1deg); }
  }
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-8px) rotate(-1deg); }
  }
  @keyframes pulse-soft {
    0%, 100% { opacity: 0.05; transform: scale(1); }
    50% { opacity: 0.1; transform: scale(1.03); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes bar-grow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float-delayed 7s ease-in-out 1.5s infinite; }
  .animate-pulse-soft { animation: pulse-soft 5s ease-in-out infinite; }
  .animate-slide-up { animation: slide-up 0.6s ease-out both; }
  .animate-slide-up-d1 { animation: slide-up 0.6s ease-out 0.1s both; }
  .animate-slide-up-d2 { animation: slide-up 0.6s ease-out 0.2s both; }
  .animate-slide-up-d3 { animation: slide-up 0.6s ease-out 0.3s both; }
  .animate-slide-up-d4 { animation: slide-up 0.6s ease-out 0.4s both; }
  .animate-bar-grow { animation: bar-grow 0.8s ease-out both; transform-origin: bottom; }
  .animate-gradient { animation: gradient-shift 10s ease infinite; background-size: 200% 200%; }
  .btn-shimmer {
    background-size: 200% 100%;
    animation: shimmer 3s ease-in-out infinite;
  }
`

/* ─── Decorative blob ────────────────────────────────────────────────────── */
function Blob({
  className,
  color = '#6366f1',
  animate = false,
}: {
  className?: string
  color?: string
  animate?: boolean
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${animate ? 'animate-pulse-soft' : ''} ${className ?? ''}`}
      style={{ fill: color, opacity: 0.06 }}
    >
      <path d="M44.5,-65.8C56.2,-55.4,63.1,-40.2,67.2,-24.6C71.2,-9,72.3,6.9,67.5,21C62.6,35.1,51.8,47.4,39,57.3C26.2,67.2,11.3,74.6,-3.8,74.1C-18.9,73.6,-34.2,65.2,-47.1,54.1C-60,43.1,-70.4,29.4,-72.9,14.2C-75.4,-1,-70,-17.7,-61.4,-31.1C-52.8,-44.5,-41,-54.7,-28,-63.1C-15,-71.4,-0.8,-78,13.9,-77.3C28.6,-76.5,32.8,-76.2,44.5,-65.8Z" transform="translate(100 100)" />
    </svg>
  )
}

/* ─── Mini app screenshot mockup ─────────────────────────────────────────── */
function AppMockup() {
  const barHeights = [35, 60, 42, 78, 50, 68, 90, 55, 72, 48]
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow behind mockup */}
      <div
        className="absolute inset-0 -m-12 rounded-[2rem] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, transparent 65%)',
        }}
      />

      {/* Shadow frame */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/60 bg-white ring-1 ring-black/[0.02]">
        {/* Topbar strip */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-3">
            <div className="bg-white rounded-md h-5 w-48 mx-auto border border-gray-200/80 flex items-center justify-center">
              <span className="text-[8px] text-gray-400 font-medium tracking-wide">app.stocksense.io/dashboard</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex h-64">
          {/* Sidebar */}
          <div className="w-40 bg-slate-900 flex flex-col gap-0.5 p-2.5 shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1 pt-0.5">
              <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center">
                <TrendingUp size={11} className="text-white" />
              </div>
              <span className="text-white text-[10px] font-bold tracking-tight">StockSense</span>
            </div>
            {[
              { label: 'Dashboard', icon: BarChart2, active: true },
              { label: 'Products', icon: Package, active: false },
              { label: 'Locations', icon: Layers, active: false },
              { label: 'Receipts', icon: ClipboardCheck, active: false },
              { label: 'Deliveries', icon: Truck, active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium ${
                  item.active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400'
                }`}
              >
                <item.icon size={12} className={item.active ? 'text-white' : 'text-slate-500'} />
                {item.label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 flex flex-col gap-2.5 bg-gray-50/40">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-700">Dashboard</p>
              <div className="flex items-center gap-1 bg-green-50 text-green-600 text-[8px] font-semibold px-1.5 py-0.5 rounded-full border border-green-100">
                <span className="w-1 h-1 rounded-full bg-green-500" />
                Live
              </div>
            </div>
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Total SKUs', value: '2,481', color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Low Stock', value: '34', color: 'bg-amber-50 text-amber-600' },
                { label: 'Pending', value: '12', color: 'bg-green-50 text-green-600' },
              ].map((s) => (
                <div key={s.label} className={`rounded-lg p-2 ${s.color}`}>
                  <p className="text-[8px] opacity-70 font-medium leading-tight">{s.label}</p>
                  <p className="font-bold text-xs leading-snug mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
            {/* Bar chart */}
            <div className="flex-1 bg-white rounded-lg border border-gray-100 flex flex-col px-3 pb-2 pt-2">
              <p className="text-[8px] font-semibold text-gray-400 mb-1.5">Weekly Movement</p>
              <div className="flex-1 flex items-end gap-1">
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm animate-bar-grow"
                    style={{
                      height: `${h}%`,
                      background: i === 6 ? '#4f46e5' : `rgba(99,102,241,${0.2 + i * 0.06})`,
                      animationDelay: `${0.4 + i * 0.06}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge – top right */}
      <div className="absolute -top-4 -right-4 bg-white shadow-lg shadow-gray-200/50 border border-gray-100 rounded-xl px-3 py-2.5 flex items-center gap-2.5 animate-float-slow">
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
          <ShieldCheck size={15} className="text-green-600" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-800 leading-tight">Reorder Alert</p>
          <p className="text-[9px] text-gray-400 font-medium leading-tight mt-0.5">3 items need restocking</p>
        </div>
      </div>

      {/* Floating badge – bottom left */}
      <div className="absolute -bottom-4 -left-4 bg-white shadow-lg shadow-gray-200/50 border border-gray-100 rounded-xl px-3 py-2.5 flex items-center gap-2.5 animate-float-delayed">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
          <Zap size={15} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-800 leading-tight">AI Forecast</p>
          <p className="text-[9px] text-gray-400 font-medium leading-tight mt-0.5">Demand up 18% this week</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Feature card ───────────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: React.ElementType
  title: string
  desc: string
  color: string
}) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color} group-hover:scale-105 transition-transform duration-300`}>
        <Icon size={20} />
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

/* ─── Step card for "How it works" ───────────────────────────────────────── */
function StepCard({
  step,
  icon: Icon,
  title,
  desc,
}: {
  step: number
  icon: React.ElementType
  title: string
  desc: string
}) {
  return (
    <div className="relative flex flex-col items-center text-center px-4">
      {/* Step icon */}
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Icon size={24} className="text-white" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-sm">
          <span className="text-[10px] font-black text-indigo-600">{step}</span>
        </div>
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-[240px] mx-auto">{desc}</p>
    </div>
  )
}

/* ─── Welcome Page ───────────────────────────────────────────────────────── */
export function WelcomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans">
      {/* Inject animation styles */}
      <style>{animationStyles}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">StockSense</span>
          </Link>

          {/* Nav links – desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 font-medium">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 active:scale-[0.97] transition-all shadow-md shadow-indigo-200"
            >
              Get started
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-36 overflow-hidden">
        {/* Gradient mesh background */}
        <div
          className="absolute inset-0 pointer-events-none animate-gradient"
          style={{
            background: 'linear-gradient(120deg, rgba(99,102,241,0.04) 0%, rgba(6,182,212,0.02) 30%, rgba(139,92,246,0.03) 60%, transparent 100%)',
            backgroundSize: '200% 200%',
          }}
        />

        {/* Background blobs */}
        <Blob className="absolute -top-40 -left-40 w-[550px] h-[550px]" color="#6366f1" animate />
        <Blob className="absolute top-20 -right-32 w-[420px] h-[420px]" color="#06b6d4" animate />
        <Blob className="absolute -bottom-20 left-1/3 w-[500px] h-[300px]" color="#8b5cf6" animate />

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.025) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          {/* Left – copy */}
          <div className="max-w-lg">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 animate-slide-up ring-1 ring-indigo-100/60">
              <Sparkles size={12} />
              AI-powered inventory intelligence
            </span>

            {/* Headline */}
            <h1 className="text-5xl lg:text-[3.5rem] font-black text-gray-900 leading-[1.1] mb-5 tracking-tight animate-slide-up-d1">
              <span
                className="text-indigo-600 italic"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Smart
              </span>{' '}
              Inventory,
              <br />
              Zero{' '}
              <span
                className="relative inline-block"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  color: '#0891b2',
                }}
              >
                Surprises
                {/* Underline squiggle */}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 5 Q25 1 50 5 Q75 9 100 5 Q125 1 150 5 Q175 9 200 5"
                    stroke="#0891b2"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-8 animate-slide-up-d2">
              Track stock levels, predict demand, and automate reorders — all in one clean,
              collaborative workspace built for modern warehouses.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-8 animate-slide-up-d3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.97] transition-all shadow-md shadow-indigo-200"
              >
                Start for free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.97] transition-all"
              >
                Sign in
              </Link>
            </div>

            {/* Trust line */}
            <div className="flex items-center gap-3 animate-slide-up-d4">
              <div className="flex -space-x-1.5">
                {['bg-indigo-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500'].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full ${bg} border-2 border-white flex items-center justify-center`}
                  >
                    <span className="text-[9px] font-bold text-white">
                      {['AK', 'SL', 'MR', 'JP'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-l border-gray-200 pl-3">
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-400 leading-tight">Loved by 500+ warehouse teams</p>
              </div>
            </div>
          </div>

          {/* Right – app mockup */}
          <div className="hidden lg:flex justify-center animate-slide-up-d2">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <div className="relative -mt-16 z-10 mb-4">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/40 py-5 px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap shrink-0">
                Trusted by
              </p>
              <div className="flex items-center gap-8 flex-wrap justify-center">
                {['Acme Corp', 'Globex Inc', 'Initech', 'Umbrella Co', 'Wayne Ent.'].map((name) => (
                  <span
                    key={name}
                    className="text-gray-300 font-bold text-base tracking-tight whitespace-nowrap"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subtle divider curve ── */}
      <div className="relative mt-4 overflow-hidden">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f9fafb" />
        </svg>
      </div>

      {/* ── Features ── */}
      <section id="features" className="bg-gray-50 pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Zap size={11} />
              Powerful features
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 tracking-tight">
              Everything your warehouse needs,{' '}
              <span className="text-indigo-600 italic" style={{ fontFamily: 'Georgia, serif' }}>
                nothing it doesn&apos;t
              </span>
            </h2>
            <p className="text-gray-500 leading-relaxed">
              StockSense brings real-time visibility, predictive analytics, and seamless
              operations into one elegant platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={BarChart2}
              title="Real-time Analytics"
              desc="Live dashboards with stock levels, turnover rates, and inventory health scores updated every minute."
              color="bg-indigo-100 text-indigo-600"
            />
            <FeatureCard
              icon={Zap}
              title="AI-powered Reorder"
              desc="Machine-learning demand forecasts automatically create purchase orders before you run out."
              color="bg-amber-100 text-amber-600"
            />
            <FeatureCard
              icon={Layers}
              title="Multi-warehouse"
              desc="Manage stock across unlimited locations, warehouses, and zones from a single view."
              color="bg-cyan-100 text-cyan-600"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Audit & Compliance"
              desc="Full movement history, adjustment logs, and exportable reports for every SKU you carry."
              color="bg-green-100 text-green-600"
            />
            <FeatureCard
              icon={Bell}
              title="Smart Alerts"
              desc="Get notified about low stock, expiring lots, and delivery delays before they become problems."
              color="bg-rose-100 text-rose-600"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Inventory Health Score"
              desc="Instant grade for each product — identify dead stock, overstock, and fast-movers at a glance."
              color="bg-violet-100 text-violet-600"
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background radial */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.025) 0%, transparent 55%)' }}
        />

        <div className="relative max-w-4xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-16 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <CheckCircle2 size={11} />
              Simple setup
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 tracking-tight">
              Up and running in{' '}
              <span className="text-indigo-600 italic" style={{ fontFamily: 'Georgia, serif' }}>
                minutes
              </span>
            </h2>
            <p className="text-gray-500 leading-relaxed">
              No complex setup. No migration headaches. Start managing your inventory smarter today.
            </p>
          </div>

          {/* Steps grid */}
          <div className="relative">
            {/* Connecting dashed line – desktop only */}
            <div className="hidden sm:block absolute top-7 left-[20%] right-[20%] h-0">
              <div className="border-t-2 border-dashed border-indigo-200/60" />
            </div>

            <div className="relative grid sm:grid-cols-3 gap-10 sm:gap-8">
              <StepCard
                step={1}
                icon={ClipboardCheck}
                title="Create your account"
                desc="Sign up in seconds with just your email. No credit card needed to get started."
              />
              <StepCard
                step={2}
                icon={Package}
                title="Add your products"
                desc="Import your catalog via CSV or add products manually. We handle the rest."
              />
              <StepCard
                step={3}
                icon={Sparkles}
                title="Let AI optimize"
                desc="Our algorithms learn your patterns and start forecasting demand and suggesting reorders."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-24 relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 50%, #faf5ff 100%)',
          }}
        />
        <Blob className="absolute -bottom-24 -left-24 w-[350px] h-[350px]" color="#6366f1" />
        <Blob className="absolute -top-24 -right-24 w-[300px] h-[300px]" color="#06b6d4" />

        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/80 shadow-xl shadow-indigo-100/20 px-8 py-14 md:px-14 md:py-16">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
              <TrendingUp size={22} className="text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">
              Ready to take control of{' '}
              <span className="text-indigo-600 italic" style={{ fontFamily: 'Georgia, serif' }}>
                your inventory?
              </span>
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed max-w-md mx-auto">
              Join hundreds of warehouse managers who&apos;ve eliminated stockouts and over-ordering with StockSense.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.97] transition-all shadow-md shadow-indigo-200"
              >
                Create a free account
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.97] transition-all"
              >
                Sign in instead
              </Link>
            </div>

            <p className="text-xs text-gray-400">
              No credit card required · Free forever plan · Setup in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
                <TrendingUp size={11} className="text-white" />
              </div>
              <span className="font-semibold text-gray-600">StockSense</span>
            </Link>
            <p>© {new Date().getFullYear()} StockSense. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
