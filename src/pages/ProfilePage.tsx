import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { User, Mail, Shield, AtSign, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS: Record<string, string> = {
  inventory_manager: 'Inventory Manager',
  warehouse_manager: 'Warehouse Manager',
  staff: 'Staff',
}

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initial = user?.full_name?.charAt(0).toUpperCase() ?? 'U'
  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '—'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account details and preferences."
      />

      <div className="max-w-xl">
        <Card padding="md">
          {/* Avatar + name row */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user?.full_name ?? '—'}
              </p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
              {user?.is_verified && (
                <Badge variant="success" dot className="mt-1">
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Field list */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Full name</p>
                <p className="text-sm text-gray-700">{user?.full_name ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-700">{user?.email ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AtSign size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Login ID</p>
                <p className="text-sm text-gray-700">{user?.login_id ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm text-gray-700">{roleLabel}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
            <Button variant="secondary" size="sm" disabled title="Coming soon">
              Edit profile
            </Button>
            <Button variant="ghost" size="sm" disabled title="Coming soon">
              Change password
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="ml-auto text-rose-600 hover:text-rose-700"
            >
              <LogOut size={14} className="mr-1.5" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
