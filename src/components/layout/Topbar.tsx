import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { navGroups, profileNavItem } from '../../config/navigation'

interface TopbarProps {
  sidebarCollapsed: boolean
}

/** Derive a human-readable page title from the current pathname. */
function usePageTitle(): string {
  const { pathname } = useLocation()

  // Check all nav groups
  for (const group of navGroups) {
    for (const item of group.items) {
      if (pathname === item.path || pathname.startsWith(item.path + '/')) {
        return item.label
      }
    }
  }
  if (pathname === profileNavItem.path) return profileNavItem.label

  // Fallback: capitalise the last path segment
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'Dashboard'
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}

export function Topbar({ sidebarCollapsed: _sidebarCollapsed }: TopbarProps) {
  const pageTitle = usePageTitle()

  return (
    <header
      className={[
        'flex items-center justify-between flex-shrink-0',
        'h-[60px] px-6',
        'bg-white border-b border-gray-200',
        'z-10',
      ].join(' ')}
    >
      {/* Left: page context */}
      <div className="flex items-center min-w-0">
        <h1 className="text-[15px] font-semibold text-gray-800 truncate">{pageTitle}</h1>
      </div>

      {/* Right: search + notifications + user avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search placeholder */}
        <div className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-pointer hover:border-gray-300 transition-colors duration-150 select-none">
          <Search size={14} aria-hidden="true" />
          <span className="text-xs">Search…</span>
          {/* TODO: Implement global search after backend API contract is finalised. */}
        </div>

        {/* Notifications */}
        <button
          id="topbar-notifications"
          aria-label="Notifications"
          className="relative w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150"
        >
          <Bell size={16} />
          {/* Notification dot — placeholder */}
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600"
            aria-hidden="true"
          />
          {/* TODO: Connect to backend notification system after API contract is finalised. */}
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200" aria-hidden="true" />

        {/* User avatar */}
        <div
          id="topbar-user-menu"
          className="flex items-center gap-2 cursor-pointer select-none"
          role="button"
          tabIndex={0}
          aria-label="User menu"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            U
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700 truncate max-w-[120px]">
            {/* TODO: Replace with authenticated user's name from backend. */}
            User
          </span>
        </div>
      </div>
    </header>
  )
}
