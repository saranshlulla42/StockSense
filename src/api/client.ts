/**
 * StockSense API client
 *
 * All backend calls go through this module.
 * The JWT token is read from localStorage and injected automatically.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type ApiError = Error & { status: number }

export function createApiError(status: number, message: string): ApiError {
    const err = new Error(message) as ApiError
    err.name = 'ApiError'
    err.status = status
    return err
}

export function isApiError(err: unknown): err is ApiError {
    return err instanceof Error && err.name === 'ApiError'
}

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = localStorage.getItem('stocksense_token')

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

    if (!res.ok) {
        let detail = `HTTP ${res.status}`
        try {
            const body = await res.json()
            detail = body.detail ?? detail
        } catch {
            // ignore JSON parse errors
        }
        throw createApiError(res.status, detail)
    }

    // 204 No Content — return nothing
    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
}

// -------------------------------------------------------------------------
// Auth
// -------------------------------------------------------------------------

export interface SignupPayload {
    full_name: string
    email: string
    password: string
    role?: string
}

export interface SignupResponse {
    message: string
    email: string
    requires_otp: boolean
    demo_otp?: string
}

export interface LoginPayload {
    identifier: string
    password: string
}

export interface UserResponse {
    id: number
    login_id: string | null
    email: string
    full_name: string
    role: string
    is_active: boolean
    is_verified: boolean
    created_at: string | null
}

export interface TokenResponse {
    access_token: string
    token_type: string
    user: UserResponse
}

export interface VerifyOtpPayload {
    email: string
    otp: string
}

export interface ResendOtpPayload {
    email: string
}

export const authApi = {
    signup: (payload: SignupPayload) =>
        request<SignupResponse>('/api/v1/auth/signup', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    login: (payload: LoginPayload) =>
        request<TokenResponse>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    verifyOtp: (payload: VerifyOtpPayload) =>
        request<TokenResponse>('/api/v1/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    resendOtp: (payload: ResendOtpPayload) =>
        request('/api/v1/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    me: () => request<UserResponse>('/api/v1/auth/me'),
}

// -------------------------------------------------------------------------
// Products
// -------------------------------------------------------------------------

export interface Product {
    id: number
    sku: string
    name: string
    category: string
    unit_of_measure: string
    per_unit_cost: number
    reorder_level: number
    avg_daily_usage: number
    lead_time_days: number
    is_active: boolean
    on_hand: number
    free_to_use: number
    total_value: number
    created_at?: string | null
}

export interface ProductCreatePayload {
    sku: string
    name: string
    category?: string
    unit_of_measure?: string
    per_unit_cost: number
    reorder_level: number
    avg_daily_usage?: number
    lead_time_days?: number
}

export interface ProductUpdatePayload {
    name?: string
    category?: string
    unit_of_measure?: string
    per_unit_cost?: number
    reorder_level?: number
    avg_daily_usage?: number
    lead_time_days?: number
}

export const productsApi = {
    list: (params?: { search?: string; category?: string }) => {
        const q = new URLSearchParams()
        if (params?.search) q.set('search', params.search)
        if (params?.category) q.set('category', params.category)
        const qs = q.toString()
        return request<Product[]>(`/api/v1/products${qs ? `?${qs}` : ''}`)
    },
    get: (id: number) => request<Product>(`/api/v1/products/${id}`),
    create: (payload: ProductCreatePayload) =>
        request<Product>('/api/v1/products', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    update: (id: number, payload: ProductUpdatePayload) =>
        request<Product>(`/api/v1/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        }),
    delete: (id: number) =>
        request<void>(`/api/v1/products/${id}`, { method: 'DELETE' }),
}

// -------------------------------------------------------------------------
// Warehouses & Locations
// -------------------------------------------------------------------------

export interface LocationItem {
    id: number
    warehouse_id: number
    name: string
    short_code: string
    is_active: boolean
    created_at?: string | null
}

export interface Warehouse {
    id: number
    name: string
    short_code: string
    address?: string
    is_active: boolean
    locations: LocationItem[]
    created_at?: string | null
}

export interface WarehouseCreatePayload {
    name: string
    short_code: string
    address?: string
}

export interface LocationCreatePayload {
    name: string
    short_code: string
}

export const warehousesApi = {
    list: () => request<Warehouse[]>('/api/v1/warehouses'),
    create: (payload: WarehouseCreatePayload) =>
        request<Warehouse>('/api/v1/warehouses', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    createLocation: (warehouseId: number, payload: LocationCreatePayload) =>
        request<LocationItem>(`/api/v1/warehouses/${warehouseId}/locations`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    listLocations: () => request<LocationItem[]>('/api/v1/locations'),
}

// -------------------------------------------------------------------------
// Stock by Location
// -------------------------------------------------------------------------

export interface StockItem {
    product_id: number
    sku: string
    product_name: string
    category: string
    unit_of_measure: string
    per_unit_cost: number
    quantity: number
    reserved_quantity: number
    free_to_use: number
    total_value: number
}

export interface LocationStockGroup {
    location_id: number
    location_name: string
    location_code: string
    warehouse_id: number
    warehouse_name: string
    warehouse_code: string
    total_items_count: number
    total_stock_value: number
    items: StockItem[]
}

export const stockApi = {
    getByLocation: (params?: { warehouseId?: number; search?: string }) => {
        const q = new URLSearchParams()
        if (params?.warehouseId) q.set('warehouse_id', String(params.warehouseId))
        if (params?.search) q.set('search', params.search)
        const qs = q.toString()
        return request<LocationStockGroup[]>(`/api/v1/stock/by-location${qs ? `?${qs}` : ''}`)
    },
}

// -------------------------------------------------------------------------
// Operations (Receipts, Deliveries, Transfers, Adjustments)
// -------------------------------------------------------------------------

export interface OperationLineItem {
    id?: number
    product_id: number
    product_sku?: string
    product_name?: string
    unit_of_measure?: string
    quantity: number
    counted_quantity?: number | null
    is_out_of_stock?: boolean
}

export interface Operation {
    id: number
    reference: string
    type: 'receipt' | 'delivery' | 'transfer' | 'adjustment'
    status: 'draft' | 'waiting' | 'ready' | 'done' | 'cancelled'
    contact_name?: string | null
    schedule_date?: string | null
    warehouse_id?: number | null
    warehouse_name?: string | null
    responsible_id?: number | null
    responsible_name?: string | null
    source_location_id?: number | null
    source_location_name?: string | null
    destination_location_id?: number | null
    destination_location_name?: string | null
    delivery_address?: string | null
    adjustment_reason?: string | null
    created_at?: string | null
    updated_at?: string | null
    validated_at?: string | null
    lines: OperationLineItem[]
}

export interface OperationCreatePayload {
    type: 'receipt' | 'delivery' | 'transfer' | 'adjustment'
    contact_name?: string
    schedule_date?: string
    warehouse_id?: number
    source_location_id?: number
    destination_location_id?: number
    delivery_address?: string
    adjustment_reason?: string
    lines: {
        product_id: number
        quantity: number
        counted_quantity?: number
    }[]
}

export const operationsApi = {
    list: (params?: { type?: string; status?: string; search?: string }) => {
        const q = new URLSearchParams()
        if (params?.type) q.set('type', params.type)
        if (params?.status) q.set('status', params.status)
        if (params?.search) q.set('search', params.search)
        const qs = q.toString()
        return request<Operation[]>(`/api/v1/operations${qs ? `?${qs}` : ''}`)
    },
    get: (id: number) => request<Operation>(`/api/v1/operations/${id}`),
    create: (payload: OperationCreatePayload) =>
        request<Operation>('/api/v1/operations', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    validate: (id: number) =>
        request<Operation>(`/api/v1/operations/${id}/validate`, {
            method: 'POST',
        }),
    cancel: (id: number) =>
        request<Operation>(`/api/v1/operations/${id}/cancel`, {
            method: 'POST',
        }),
}

// -------------------------------------------------------------------------
// Move History
// -------------------------------------------------------------------------

export interface MoveHistoryItem {
    id: number
    reference: string
    move_type: 'in' | 'out' | 'transfer' | 'adjustment'
    product_id: number
    product_sku?: string
    product_name?: string
    quantity: number
    from_location_id?: number | null
    from_location_name?: string | null
    to_location_id?: number | null
    to_location_name?: string | null
    contact_name?: string | null
    reason?: string | null
    date: string
}

export const movesApi = {
    list: (params?: { move_type?: string; search?: string; product_id?: number }) => {
        const q = new URLSearchParams()
        if (params?.move_type) q.set('move_type', params.move_type)
        if (params?.search) q.set('search', params.search)
        if (params?.product_id) q.set('product_id', String(params.product_id))
        const qs = q.toString()
        return request<MoveHistoryItem[]>(`/api/v1/moves${qs ? `?${qs}` : ''}`)
    },
}

// -------------------------------------------------------------------------
// Dashboard
// -------------------------------------------------------------------------

export interface DashboardKpis {
    total_skus: number
    total_stock_value: number
    low_stock_count: number
    out_of_stock_count: number
    pending_receipts: number
    pending_deliveries: number
    completed_operations: number
}

export interface DashboardActivity {
    id: number
    reference: string
    type: string
    status: string
    contact_name?: string | null
    date?: string | null
    description: string
}

export interface DashboardChartPoint {
    label: string
    inbound: number
    outbound: number
}

export interface DashboardData {
    kpis: DashboardKpis
    recent_activity: DashboardActivity[]
    chart_data: DashboardChartPoint[]
}

export const dashboardApi = {
    getKpis: () => request<DashboardKpis>('/api/v1/dashboard/kpis'),
    getData: () => request<DashboardData>('/api/v1/dashboard/data'),
}

// -------------------------------------------------------------------------
// Intelligence (Health, Reorder, Actions)
// -------------------------------------------------------------------------

export interface HealthCategoryItem {
    product_id: number
    sku: string
    name: string
    category: string
    current_stock: number
    reorder_level: number
    avg_daily_usage: number
    days_of_stock: number
    stock_value: number
    health_status: 'optimal' | 'low_stock' | 'out_of_stock' | 'overstocked'
}

export interface InventoryHealthData {
    health_score: number
    optimal_count: number
    low_stock_count: number
    out_of_stock_count: number
    overstocked_count: number
    total_inventory_value: number
    items: HealthCategoryItem[]
}

export interface SmartReorderSuggestion {
    product_id: number
    sku: string
    name: string
    category: string
    current_stock: number
    reorder_level: number
    avg_daily_usage: number
    lead_time_days: number
    days_until_stockout: number
    suggested_order_qty: number
    estimated_cost: number
    urgency: 'critical' | 'high' | 'medium'
}

export interface ActionItem {
    id: string
    title: string
    description: string
    urgency: 'critical' | 'warning' | 'info'
    type: 'stockout' | 'late_delivery' | 'low_stock' | 'pending_validation'
    action_label: string
    route_target: string
    created_at?: string | null
}

export const intelligenceApi = {
    getHealth: () =>
        request<InventoryHealthData>('/api/v1/intelligence/inventory-health'),
    getReorderSuggestions: () =>
        request<SmartReorderSuggestion[]>('/api/v1/intelligence/smart-reorder'),
    getActionCenter: () =>
        request<ActionItem[]>('/api/v1/intelligence/action-center'),
}
