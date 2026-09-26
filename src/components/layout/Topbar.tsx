import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Menu, Search } from 'lucide-react'
import { navGroups, profileNavItem } from '../../config/navigation'

const pages = [...navGroups.flatMap((group) => group.items), profileNavItem]

export function Topbar({ onOpenNavigation }: { onOpenNavigation: () => void }) {
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')
  const page =
    pages.find((item) => pathname === item.path)?.label ?? 'Workspace'
  const matches = pages.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <header className="z-10 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-gray-200/70 bg-white/80 px-4 backdrop-blur-md sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenNavigation}
          aria-label="Open navigation"
          className="rounded-xl border border-gray-200 p-2 text-gray-600 md:hidden"
        >
          <Menu size={20} />
        </button>
        <span className="hidden text-xs text-gray-400 lg:block">Workspace</span>
        <ChevronRight size={14} className="hidden text-gray-300 lg:block" />
        <span className="truncate text-sm font-medium text-gray-700">
          {page}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <div
          className="relative hidden sm:block"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setQuery('')
          }}
        >
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-3 text-gray-400"
          />
          <input
            aria-label="Find a page"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a page…"
            className="h-10 w-44 rounded-xl border border-gray-200 bg-gray-50/70 pl-9 pr-3 text-xs focus:border-indigo-400 focus:outline-none lg:w-56"
          />
          {query && (
            <div className="absolute right-0 top-12 max-h-72 w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
              {matches.length ? (
                matches.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setQuery('')}
                    className="flex items-center gap-3 rounded-lg p-3 text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))
              ) : (
                <p className="p-3 text-xs text-gray-500">No matching pages.</p>
              )}
            </div>
          )}
        </div>
        <Link
          to="/profile"
          aria-label="Your profile"
          className="flex size-9 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
        >
          U
        </Link>
      </div>
    </header>
  )
}
