import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'

// Auth / public pages
import { WelcomePage } from './pages/auth/WelcomePage'
import { LoginPage }   from './pages/auth/LoginPage'
import { SignupPage }  from './pages/auth/SignupPage'

// Pages
import { DashboardPage }      from './pages/DashboardPage'
import { ProductsPage }       from './pages/ProductsPage'
import { LocationsPage }      from './pages/LocationsPage'
import { ReceiptsPage }       from './pages/ReceiptsPage'
import { DeliveriesPage }     from './pages/DeliveriesPage'
import { TransfersPage }      from './pages/TransfersPage'
import { AdjustmentsPage }    from './pages/AdjustmentsPage'
import { MoveHistoryPage }    from './pages/MoveHistoryPage'
import { InventoryHealthPage } from './pages/InventoryHealthPage'
import { SmartReorderPage }   from './pages/SmartReorderPage'
import { ActionCenterPage }   from './pages/ActionCenterPage'
import { WarehousesPage }     from './pages/WarehousesPage'
import { ProfilePage }        from './pages/ProfilePage'
import { NotFoundPage }       from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / auth routes (no app shell) */}
        <Route path="/"       element={<WelcomePage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* App shell wraps all authenticated pages */}
        <Route
          path="/*"
          element={
            <AppShell>
              <Routes>
                {/* Dashboard */}
                <Route path="/dashboard"        element={<DashboardPage />} />

                {/* Inventory */}
                <Route path="/products"         element={<ProductsPage />} />
                <Route path="/locations"        element={<LocationsPage />} />

                {/* Operations */}
                <Route path="/receipts"         element={<ReceiptsPage />} />
                <Route path="/deliveries"       element={<DeliveriesPage />} />
                <Route path="/transfers"        element={<TransfersPage />} />
                <Route path="/adjustments"      element={<AdjustmentsPage />} />
                <Route path="/move-history"     element={<MoveHistoryPage />} />

                {/* Intelligence */}
                <Route path="/inventory-health" element={<InventoryHealthPage />} />
                <Route path="/smart-reorder"    element={<SmartReorderPage />} />
                <Route path="/action-center"    element={<ActionCenterPage />} />

                {/* Settings */}
                <Route path="/warehouses"       element={<WarehousesPage />} />

                {/* Profile */}
                <Route path="/profile"          element={<ProfilePage />} />

                {/* 404 */}
                <Route path="*"                 element={<NotFoundPage />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
