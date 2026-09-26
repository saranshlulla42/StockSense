import { Link, NavLink } from 'react-router-dom'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Warehouse,
  X,
} from 'lucide-react'
import { navGroups } from '../../config/navigation'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onNavigate?: () => void
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  return (
    <aside
      className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-900 text-slate-300 transition-[width] ${collapsed ? 'w-20' : 'w-64'}`}
      aria-label="Main navigation"
    >
      <div
        className={`flex h-20 shrink-0 items-center ${collapsed ? 'justify-center' : 'gap-3 px-6'}`}
      >
        <Link
          to="/dashboard"
          onClick={onNavigate}
          aria-label="StockSense dashboard"
          className="flex items-center gap-3"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-950/30">
            <TrendingUp size={20} />
          </span>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-white">
              StockSense<span className="text-indigo-400">.</span>
            </span>
          )}
        </Link>
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="ml-auto rounded-lg p-1 text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="mx-4 mb-5 flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-800/60 p-3">
          <Warehouse size={18} className="text-slate-400" />
          <div>
            <p className="text-xs font-semibold text-slate-200">
              Inventory workspace
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              All your operations, together
            </p>
          </div>
        </div>
      )}
      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-5">
        {navGroups.map((group, index) => (
          <div key={group.groupLabel ?? index}>
            {group.groupLabel && !collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {group.groupLabel}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  className={({ isActive }) =>
                    `flex min-h-10 items-center rounded-lg text-[13px] font-medium transition-colors ${collapsed ? 'justify-center' : 'gap-3 px-3'} ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                  }
                >
                  <item.icon size={17} strokeWidth={1.7} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="shrink-0 space-y-2 border-t border-slate-800 p-3">
        <Link
          to="/profile"
          onClick={onNavigate}
          aria-label="Your profile"
          className={`flex items-center rounded-xl p-2 hover:bg-slate-800 ${collapsed ? 'justify-center' : 'gap-3'}`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-400/15 text-sm font-semibold text-indigo-200">
            U
          </span>
          {!collapsed && (
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Your account
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Profile & preferences
              </p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-white"
          >
            Back to home <ArrowUpRight size={14} />
          </Link>
        )}
        {!onNavigate && (
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} /> Collapse sidebar
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  )
}
