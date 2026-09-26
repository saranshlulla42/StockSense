// Route and navigation configuration for StockSense.
// Update this file to add/remove routes — all nav is driven from here.

import {
  LayoutDashboard,
  Package,
  MapPin,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardList,
  History,
  HeartPulse,
  RefreshCw,
  Zap,
  Warehouse,
  User,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  end?: boolean // match exact path for active state
}

export interface NavGroup {
  groupLabel?: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    groupLabel: 'Inventory',
    items: [
      { label: 'Products',          path: '/products',   icon: Package },
      { label: 'Stock by Location', path: '/locations',  icon: MapPin },
    ],
  },
  {
    groupLabel: 'Operations',
    items: [
      { label: 'Receipts',            path: '/receipts',      icon: ArrowDownToLine },
      { label: 'Deliveries',          path: '/deliveries',    icon: ArrowUpFromLine },
      { label: 'Internal Transfers',  path: '/transfers',     icon: ArrowLeftRight },
      { label: 'Adjustments',         path: '/adjustments',   icon: ClipboardList },
      { label: 'Move History',        path: '/move-history',  icon: History },
    ],
  },
  {
    groupLabel: 'Intelligence',
    items: [
      { label: 'Inventory Health', path: '/inventory-health', icon: HeartPulse },
      { label: 'Smart Reorder',    path: '/smart-reorder',    icon: RefreshCw },
      { label: 'Action Center',    path: '/action-center',    icon: Zap },
    ],
  },
  {
    groupLabel: 'Settings',
    items: [
      { label: 'Warehouses & Locations', path: '/warehouses', icon: Warehouse },
    ],
  },
]

export const profileNavItem: NavItem = {
  label: 'Profile',
  path: '/profile',
  icon: User,
}
