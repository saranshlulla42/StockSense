import { useRef, useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigation = useRef<HTMLDialogElement>(null)

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f7f8fb]">
      {/* Sidebar */}
      <div className="hidden h-full shrink-0 md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
      </div>
      <dialog
        ref={navigation}
        aria-label="Navigation menu"
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none border-0 bg-transparent p-0 backdrop:bg-slate-950/50"
        onClick={(event) => {
          if (event.target === event.currentTarget) navigation.current?.close()
        }}
      >
        <Sidebar
          collapsed={false}
          onToggleCollapse={() => {}}
          onNavigate={() => navigation.current?.close()}
        />
      </dialog>

      {/* Main area: topbar + content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onOpenNavigation={() => navigation.current?.showModal()} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="page-enter max-w-[1440px] mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
