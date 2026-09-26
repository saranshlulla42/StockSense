import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { User, Mail, Shield } from 'lucide-react'

/**
 * Profile page — user account details.
 * TODO: Connect to backend Auth/User API after contract is finalised.
 *       Replace all placeholder values with real user data.
 */
export function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account details and preferences."
      />

      <div className="max-w-xl">
        <Card padding="md">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            {/* Avatar placeholder */}
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              U
            </div>
            <div>
              {/* TODO: Replace with real user name from backend. */}
              <p className="text-sm font-semibold text-gray-800">User</p>
              <p className="text-xs text-gray-500">Inventory Manager</p>
              <Badge variant="success" dot className="mt-1">
                Active
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={15} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                {/* TODO: Replace with real user data from backend. */}
                <p className="text-sm text-gray-700">—</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={15} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                {/* TODO: Replace with real user data from backend. */}
                <p className="text-sm text-gray-700">—</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={15} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                {/* TODO: Replace with real user role from backend. */}
                <p className="text-sm text-gray-700">—</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100">
            <Button variant="secondary" size="sm" id="profile-edit" disabled>
              Edit Profile
            </Button>
            <Button variant="ghost" size="sm" id="profile-change-password" disabled>
              Change Password
            </Button>
          </div>
          {/* TODO: Enable edit and change password after backend Auth API is finalised. */}
        </Card>
      </div>
    </>
  )
}
