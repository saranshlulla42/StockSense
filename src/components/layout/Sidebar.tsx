import { NavLink, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
} from 'lucide-react'
import { navGroups, profileNavItem } from '../../config/navigation'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    // TODO: Connect to backend auth/logout after API contract is finalised.
    navigate('/dashboard')
  }

  const sidebarWidth = collapsed ? 'w-16' : 'w-60'

  return (
    <aside
      className={[
        'flex flex-col flex-shrink-0 h-full',
        'bg-slate-900 text-slate-400',
        'border-r border-slate-800',
        'transition-[width] duration-200 ease-in-out',
        'overflow-hidden',
        sidebarWidth,
      ].join(' ')}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div
        className={[
          'flex items-center flex-shrink-0 h-[60px] border-b border-slate-800',
          collapsed ? 'justify-center px-0' : 'px-4 gap-2.5',
        ].join(' ')}
      >
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <BarChart3 size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-white tracking-tight">
              StockSense
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">
              Inventory Intelligence
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-1' : ''}>
            {/* Group label */}
            {group.groupLabel && !collapsed && (
              <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {group.groupLabel}
              </p>
            )}
            {group.groupLabel && collapsed && (
              <div className="mx-3 my-1 h-px bg-slate-800" />
            )}

            {/* Items */}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    'flex items-center rounded-md mx-2 transition-colors duration-150',
                    collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2.5 px-3 py-2',
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={16}
                      className={isActive ? 'text-white' : 'text-slate-400'}
                      aria-hidden="true"
                    />
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom area: profile + logout */}
      <div className="flex-shrink-0 border-t border-slate-800 py-2 space-y-0.5">
        {/* Profile link */}
        <NavLink
          to={profileNavItem.path}
          title={collapsed ? profileNavItem.label : undefined}
          className={({ isActive }) =>
            [
              'flex items-center rounded-md mx-2 transition-colors duration-150',
              collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2.5 px-3 py-2',
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              {/* Avatar placeholder */}
              <div
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300',
                ].join(' ')}
              >
                U
              </div>
              {!collapsed && (
                <span className="text-sm font-medium truncate">Profile</span>
              )}
            </>
          )}
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={[
            'flex items-center rounded-md mx-2 w-[calc(100%-16px)] transition-colors duration-150',
            'text-slate-400 hover:bg-slate-800 hover:text-red-400',
            collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2.5 px-3 py-2',
          ].join(' ')}
        >
          <LogOut size={16} aria-hidden="true" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className={[
          'flex items-center justify-center h-8 border-t border-slate-800',
          'text-slate-500 hover:text-slate-300 hover:bg-slate-800',
          'transition-colors duration-150 flex-shrink-0',
        ].join(' ')}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        id="sidebar-toggle"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}
