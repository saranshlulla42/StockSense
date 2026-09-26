import {
  ArrowDownToLine,
  ArrowRight,
  Layers,
  Package,
  TrendingUp,
} from 'lucide-react'

export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden rounded-3xl bg-slate-900 p-10 text-white lg:flex lg:min-h-[580px] lg:flex-col lg:justify-between">
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-indigo-200">
          <span className="size-1.5 rounded-full bg-indigo-400" />A clearer view
          of inventory
        </span>
        <h2 className="mt-9 text-[42px] font-medium leading-[1.15] tracking-tight">
          Good days start
          <br />
          with{' '}
          <span className="editorial-accent text-indigo-300">clarity.</span>
        </h2>
        <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
          One place for your products, your people, and everything moving in
          between.
        </p>
      </div>
      <div className="relative my-10 rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-slate-200">
          <TrendingUp size={16} className="text-indigo-300" />A more connected
          workflow
        </div>
        <div className="flex items-center justify-between">
          {[
            { icon: Package, label: 'Products' },
            { icon: Layers, label: 'Locations' },
            { icon: ArrowDownToLine, label: 'Operations' },
          ].map((item, index) => (
            <div key={item.label} className="contents">
              <div className="text-center">
                <span className="mx-auto flex size-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-700/50 text-indigo-200">
                  <item.icon size={19} strokeWidth={1.5} />
                </span>
                <p className="mt-2 text-[10px] text-slate-400">{item.label}</p>
              </div>
              {index < 2 && (
                <ArrowRight size={14} className="mb-5 text-slate-600" />
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="relative text-xs text-slate-500">
        Less guesswork. More getting things done.
      </p>
    </aside>
  )
}
