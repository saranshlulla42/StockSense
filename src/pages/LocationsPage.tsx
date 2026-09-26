import { useEffect, useState } from 'react'
import { MapPin, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { stockApi, warehousesApi, type LocationStockGroup, type Warehouse } from '../api/client'

export function LocationsPage() {
  const [stockGroups, setStockGroups] = useState<LocationStockGroup[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWh, setSelectedWh] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [expandedLocs, setExpandedLocs] = useState<Record<number, boolean>>({})

  function fetchData() {
    setLoading(true)
    const whId = selectedWh !== 'All' ? parseInt(selectedWh) : undefined
    Promise.all([
      stockApi.getByLocation({ warehouseId: whId, search: search || undefined }),
      warehousesApi.list(),
    ])
      .then(([stock, whs]) => {
        setStockGroups(stock)
        setWarehouses(whs)
        // Auto-expand all locations initially
        const exp: Record<number, boolean> = {}
        stock.forEach((s) => {
          exp[s.location_id] = true
        })
        setExpandedLocs(exp)
      })
      .catch((err) => console.error('Failed to fetch location stock', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [selectedWh])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchData()
  }

  function toggleLocation(id: number) {
    setExpandedLocs((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const totalValue = stockGroups.reduce((acc, g) => acc + g.total_stock_value, 0)
  const totalUnits = stockGroups.reduce(
    (acc, g) => acc + g.items.reduce((iAcc, item) => iAcc + item.quantity, 0),
    0
  )

  return (
    <>
      <PageHeader
        title="Stock by Location"
        description="Granular view of inventory items and on-hand counts across warehouses and bins."
      />

      {/* Overview Cards */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card padding="sm">
          <p className="text-xs text-gray-500 font-medium">Locations Active</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {stockGroups.length}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-gray-500 font-medium">Total Physical Units</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600 mt-1">
            {totalUnits}
          </p>
        </Card>
        <Card padding="sm" className="col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 font-medium">Total Stored Value</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, product or category…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Warehouse:</span>
          <select
            value={selectedWh}
            onChange={(e) => setSelectedWh(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.short_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location Stock Groups */}
      {stockGroups.length === 0 && !loading ? (
        <Card padding="none">
          <EmptyState
            icon={MapPin}
            title="No inventory locations found"
            description="No stock has been recorded for the selected search or warehouse."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {stockGroups.map((group) => {
            const isExpanded = expandedLocs[group.location_id] !== false
            return (
              <Card key={group.location_id} padding="none" className="overflow-hidden">
                {/* Location Header Row */}
                <div
                  onClick={() => toggleLocation(group.location_id)}
                  className="flex items-center justify-between px-5 py-4 bg-gray-50/70 border-b border-gray-100 cursor-pointer hover:bg-gray-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <MapPin size={16} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {group.location_name}
                        </h3>
                        <Badge variant="neutral" className="font-mono text-[10px]">
                          {group.warehouse_code}/{group.location_code}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {group.warehouse_name} · {group.total_items_count} SKU{group.total_items_count !== 1 ? 's' : ''} stored
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-semibold text-slate-800">
                        ${group.total_stock_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-gray-400">Total Location Value</p>
                    </div>
                    <button
                      className="p-1 rounded text-gray-400 hover:text-gray-600"
                      aria-label="Toggle location items"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Items breakdown table */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    {group.items.length === 0 ? (
                      <p className="py-6 text-center text-xs text-gray-400">
                        No product units currently stored in this location.
                      </p>
                    ) : (
                      <table className="w-full text-xs text-left">
                        <thead className="border-b border-gray-100 text-gray-400 uppercase font-semibold text-[10px] bg-white">
                          <tr>
                            <th className="px-5 py-2.5">Product SKU & Name</th>
                            <th className="px-4 py-2.5">Category</th>
                            <th className="px-4 py-2.5 text-right">Unit Cost</th>
                            <th className="px-4 py-2.5 text-right">On Hand</th>
                            <th className="px-4 py-2.5 text-right">Reserved</th>
                            <th className="px-4 py-2.5 text-right">Free to Use</th>
                            <th className="px-5 py-2.5 text-right">Total Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {group.items.map((item) => (
                            <tr key={item.product_id} className="hover:bg-gray-50/70 transition-colors">
                              <td className="px-5 py-3 font-medium text-slate-800">
                                <span>{item.product_name}</span>
                                <span className="block font-mono text-[11px] text-gray-400">
                                  {item.sku}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {item.category}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-gray-600">
                                ${item.per_unit_cost.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                {item.quantity} {item.unit_of_measure}
                              </td>
                              <td className="px-4 py-3 text-right text-amber-600">
                                {item.reserved_quantity} {item.unit_of_measure}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                                {item.free_to_use} {item.unit_of_measure}
                              </td>
                              <td className="px-5 py-3 text-right font-mono font-semibold text-slate-800">
                                ${item.total_value.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
