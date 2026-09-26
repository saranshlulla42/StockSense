# StockSense Frontend Route & API Integration Guide

This document maps all frontend routes in the StockSense application to help the backend team design and integrate APIs seamlessly.

---

## 1. Architecture Overview

- **Router**: React Router v7 (`BrowserRouter`)
- **Route Layout Structure**:
  - **Public Routes**: Rendered standalone without navigation shell (Welcome, Login, Signup).
  - **Protected Application Routes**: Wrapped in `AppShell` (Sidebar navigation, Topbar, User profile toggle).
  - **Wildcard / 404**: Catch-all for undefined routes.

---

## 2. Route Summary Table

| Frontend Route | Component | Layout | Auth Required | Suggested Backend API Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| `/` | [`WelcomePage`](file:///home/abhijay/python/StockSense/src/pages/auth/WelcomePage.tsx) | Standalone | No | Static / Public CMS or Marketing content (optional) |
| `/login` | [`LoginPage`](file:///home/abhijay/python/StockSense/src/pages/auth/LoginPage.tsx) | Standalone | No | `POST /api/v1/auth/login` |
| `/signup` | [`SignupPage`](file:///home/abhijay/python/StockSense/src/pages/auth/SignupPage.tsx) | Standalone | No | `POST /api/v1/auth/register` |
| `/dashboard` | [`DashboardPage`](file:///home/abhijay/python/StockSense/src/pages/DashboardPage.tsx) | `AppShell` | Yes | `GET /api/v1/dashboard/kpis`, `GET /api/v1/dashboard/activities` |
| `/products` | [`ProductsPage`](file:///home/abhijay/python/StockSense/src/pages/ProductsPage.tsx) | `AppShell` | Yes | `GET /api/v1/products`, `POST /api/v1/products`, `PUT /api/v1/products/:id`, `DELETE /api/v1/products/:id` |
| `/locations` | [`LocationsPage`](file:///home/abhijay/python/StockSense/src/pages/LocationsPage.tsx) | `AppShell` | Yes | `GET /api/v1/stock/by-location`, `GET /api/v1/locations` |
| `/receipts` | [`ReceiptsPage`](file:///home/abhijay/python/StockSense/src/pages/ReceiptsPage.tsx) | `AppShell` | Yes | `GET /api/v1/receipts`, `POST /api/v1/receipts`, `PATCH /api/v1/receipts/:id/status` |
| `/deliveries` | [`DeliveriesPage`](file:///home/abhijay/python/StockSense/src/pages/DeliveriesPage.tsx) | `AppShell` | Yes | `GET /api/v1/deliveries`, `POST /api/v1/deliveries`, `PATCH /api/v1/deliveries/:id/status` |
| `/transfers` | [`TransfersPage`](file:///home/abhijay/python/StockSense/src/pages/TransfersPage.tsx) | `AppShell` | Yes | `GET /api/v1/transfers`, `POST /api/v1/transfers`, `PATCH /api/v1/transfers/:id/execute` |
| `/adjustments` | [`AdjustmentsPage`](file:///home/abhijay/python/StockSense/src/pages/AdjustmentsPage.tsx) | `AppShell` | Yes | `GET /api/v1/adjustments`, `POST /api/v1/adjustments` |
| `/move-history` | [`MoveHistoryPage`](file:///home/abhijay/python/StockSense/src/pages/MoveHistoryPage.tsx) | `AppShell` | Yes | `GET /api/v1/stock-moves` |
| `/inventory-health` | [`InventoryHealthPage`](file:///home/abhijay/python/StockSense/src/pages/InventoryHealthPage.tsx) | `AppShell` | Yes | `GET /api/v1/analytics/inventory-health` |
| `/smart-reorder` | [`SmartReorderPage`](file:///home/abhijay/python/StockSense/src/pages/SmartReorderPage.tsx) | `AppShell` | Yes | `GET /api/v1/reorder/suggestions`, `POST /api/v1/reorder/create-po` |
| `/action-center` | [`ActionCenterPage`](file:///home/abhijay/python/StockSense/src/pages/ActionCenterPage.tsx) | `AppShell` | Yes | `GET /api/v1/actions/pending`, `POST /api/v1/actions/:id/resolve` |
| `/warehouses` | [`WarehousesPage`](file:///home/abhijay/python/StockSense/src/pages/WarehousesPage.tsx) | `AppShell` | Yes | `GET /api/v1/warehouses`, `POST /api/v1/warehouses`, `PUT /api/v1/warehouses/:id` |
| `/profile` | [`ProfilePage`](file:///home/abhijay/python/StockSense/src/pages/ProfilePage.tsx) | `AppShell` | Yes | `GET /api/v1/users/me`, `PUT /api/v1/users/me`, `PUT /api/v1/users/me/password` |
| `*` (Any unmatched) | [`NotFoundPage`](file:///home/abhijay/python/StockSense/src/pages/NotFoundPage.tsx) | `AppShell` | No / Mixed | N/A (Client-side 404 display) |

---

## 3. Route Details & Backend Integration Contracts

### 3.1 Public & Authentication Routes

#### 1. Welcome / Landing Page (`/`)
- **Component**: [`WelcomePage.tsx`](file:///home/abhijay/python/StockSense/src/pages/auth/WelcomePage.tsx)
- **Role**: Public landing page introducing StockSense with features and CTA links to login and signup.
- **Backend Dependency**: Mostly static frontend; optional public endpoints for live statistics or announcement banners.

#### 2. Sign In (`/login`)
- **Component**: [`LoginPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/auth/LoginPage.tsx)
- **Form Fields**:
  - `email` (string, required)
  - `password` (string, required)
- **Integration API**:
  - **`POST /api/v1/auth/login`**
  - **Request Body**:
    ```json
    {
      "email": "user@company.com",
      "password": "user_password"
    }
    ```
  - **Expected Response (200 OK)**:
    ```json
    {
      "token": "jwt_access_token_here",
      "refreshToken": "optional_refresh_token",
      "user": {
        "id": "usr_123",
        "name": "Jane Doe",
        "email": "user@company.com",
        "role": "admin"
      }
    }
    ```

#### 3. Sign Up (`/signup`)
- **Component**: [`SignupPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/auth/SignupPage.tsx)
- **Form Fields**:
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required, min 8 characters)
- **Integration API**:
  - **`POST /api/v1/auth/register`**
  - **Request Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "user@company.com",
      "password": "secure_password"
    }
    ```
  - **Expected Response (201 Created)**:
    ```json
    {
      "token": "jwt_access_token_here",
      "user": {
        "id": "usr_123",
        "name": "Jane Doe",
        "email": "user@company.com",
        "role": "manager"
      }
    }
    ```

---

### 3.2 Inventory Management Routes

#### 4. Dashboard (`/dashboard`)
- **Component**: [`DashboardPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/DashboardPage.tsx)
- **Purpose**: High-level inventory KPIs, stock alerts, and quick actions.
- **Integration APIs**:
  - **`GET /api/v1/dashboard/kpis`**
    - Returns summary cards:
      ```json
      {
        "totalSkus": 2481,
        "totalStockValue": 142500.00,
        "lowStockCount": 34,
        "outOfStockCount": 5,
        "pendingReceipts": 12,
        "pendingDeliveries": 8
      }
      ```
  - **`GET /api/v1/dashboard/activities`**
    - Returns recent movements and critical notifications.

#### 5. Products (`/products`)
- **Component**: [`ProductsPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/ProductsPage.tsx)
- **Purpose**: Catalogue listing, search, filtering, and SKU creation.
- **Integration APIs**:
  - **`GET /api/v1/products?page=1&limit=20&search=&category=&status=`**
  - **`POST /api/v1/products`**: Create a new SKU / product.
  - **`GET /api/v1/products/:id`**: Product details, on-hand counts across warehouses.
  - **`PUT /api/v1/products/:id`**: Update product metadata and reorder thresholds.
  - **`DELETE /api/v1/products/:id`**: Archive/delete product.

#### 6. Stock by Location (`/locations`)
- **Component**: [`LocationsPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/LocationsPage.tsx)
- **Purpose**: Granular breakdown of on-hand inventory by warehouse, aisle, shelf, or bin.
- **Integration APIs**:
  - **`GET /api/v1/stock/by-location?warehouseId=&search=`**
  - Returns hierarchical location stock mapping.

---

### 3.3 Operations Routes

#### 7. Receipts (`/receipts`)
- **Component**: [`ReceiptsPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/ReceiptsPage.tsx)
- **Purpose**: Inbound purchase order shipments and supplier stock intake.
- **Integration APIs**:
  - **`GET /api/v1/receipts?status=draft,ready,done`**
  - **`POST /api/v1/receipts`**: Create inbound receipt manifest.
  - **`POST /api/v1/receipts/:id/validate`**: Validate and increase inventory stock.

#### 8. Deliveries (`/deliveries`)
- **Component**: [`DeliveriesPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/DeliveriesPage.tsx)
- **Purpose**: Outbound customer orders and stock dispatches.
- **Integration APIs**:
  - **`GET /api/v1/deliveries?status=waiting,ready,done`**
  - **`POST /api/v1/deliveries`**: Create delivery order.
  - **`POST /api/v1/deliveries/:id/validate`**: Deduct on-hand stock and mark dispatched.

#### 9. Internal Transfers (`/transfers`)
- **Component**: [`TransfersPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/TransfersPage.tsx)
- **Purpose**: Relocate items between warehouses or internal zones.
- **Integration APIs**:
  - **`GET /api/v1/transfers`**
  - **`POST /api/v1/transfers`**: Create inter-warehouse transfer.
  - **`PATCH /api/v1/transfers/:id/complete`**: Confirm transfer completion.

#### 10. Adjustments (`/adjustments`)
- **Component**: [`AdjustmentsPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/AdjustmentsPage.tsx)
- **Purpose**: Manual stock corrections (inventory audit, scrap, damaged goods, found items).
- **Integration APIs**:
  - **`GET /api/v1/adjustments`**
  - **`POST /api/v1/adjustments`**: Submit inventory adjustment with reason codes.

#### 11. Move History (`/move-history`)
- **Component**: [`MoveHistoryPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/MoveHistoryPage.tsx)
- **Purpose**: Immutable audit log of every stock movement (Receipt, Delivery, Transfer, Adjustment).
- **Integration APIs**:
  - **`GET /api/v1/stock-moves?productId=&locationId=&startDate=&endDate=&page=1&limit=50`**

---

### 3.4 Intelligence & Automation Routes

#### 12. Inventory Health (`/inventory-health`)
- **Component**: [`InventoryHealthPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/InventoryHealthPage.tsx)
- **Purpose**: Turnover rates, dead-stock analysis, and stock health grades.
- **Integration APIs**:
  - **`GET /api/v1/analytics/inventory-health`**
    - Returns health score, slow-moving items, overstocked SKUs.

#### 13. Smart Reorder (`/smart-reorder`)
- **Component**: [`SmartReorderPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/SmartReorderPage.tsx)
- **Purpose**: Predictive automated reordering recommendations based on run rate and lead time.
- **Integration APIs**:
  - **`GET /api/v1/reorder/suggestions`**
  - **`POST /api/v1/reorder/create-po`**: Convert suggestion into vendor purchase order.

#### 14. Action Center (`/action-center`)
- **Component**: [`ActionCenterPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/ActionCenterPage.tsx)
- **Purpose**: Centralized queue of critical warehouse alerts requiring human action.
- **Integration APIs**:
  - **`GET /api/v1/actions/pending`**
  - **`POST /api/v1/actions/:id/resolve`**

---

### 3.5 Settings & User Profile

#### 15. Warehouses & Locations (`/warehouses`)
- **Component**: [`WarehousesPage.tsx`](file:///home/abhijay/python/StockSense/src/pages/WarehousesPage.tsx)
- **Purpose**: Warehouse facility and location hierarchy management.
- **Integration APIs**:
  - **`GET /api/v1/warehouses`**
  - **`POST /api/v1/warehouses`**
  - **`PUT /api/v1/warehouses/:id`**

#### 16. Profile (`/profile`)
- **Component**: [`ProfilePage.tsx`](file:///home/abhijay/python/StockSense/src/pages/ProfilePage.tsx)
- **Purpose**: Current user settings, avatar, email, notification preferences, password updates.
- **Integration APIs**:
  - **`GET /api/v1/users/me`**
  - **`PUT /api/v1/users/me`**
  - **`PUT /api/v1/users/me/password`**

---

## 4. Standard Backend API Response Formats

To ensure smooth integration, the frontend expects uniform API responses:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid SKU format",
    "details": [
      { "field": "sku", "issue": "SKU already exists" }
    ]
  }
}
```

### Authentication Header
Protected endpoints expect an Authorization header:
```http
Authorization: Bearer <jwt_token>
```
