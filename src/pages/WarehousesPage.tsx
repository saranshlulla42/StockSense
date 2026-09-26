import { useEffect, useState } from 'react'
import { Warehouse as WarehouseIcon, Plus, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import {
  warehousesApi,
  type Warehouse,
  isApiError,
} from '../api/client'

export function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)

  const [isWhModalOpen, setIsWhModalOpen] = useState(false)
  const [isLocModalOpen, setIsLocModalOpen] = useState(false)
  const [selectedWhId, setSelectedWhId] = useState<number | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [whForm, setWhForm] = useState({
    name: '',
    short_code: '',
    address: '',
  })

  const [locForm, setLocForm] = useState({
    name: '',
    short_code: '',
  })

  function fetchWarehouses() {
    setLoading(true)
    warehousesApi
      .list()
      .then(setWarehouses)
      .catch((err) => console.error('Failed to fetch warehouses', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  function handleOpenWhModal() {
    setWhForm({ name: '', short_code: '', address: '' })
    setErrorMsg(null)
    setIsWhModalOpen(true)
  }

  function handleOpenLocModal(whId: number) {
    setSelectedWhId(whId)
    setLocForm({ name: '', short_code: '' })
    setErrorMsg(null)
    setIsLocModalOpen(true)
  }

  async function handleCreateWarehouse(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSubmitting(true)
    try {
      await warehousesApi.create({
        name: whForm.name,
        short_code: whForm.short_code.toUpperCase(),
        address: whForm.address,
      })
      setIsWhModalOpen(false)
      setSuccessMsg(`Warehouse '${whForm.name}' created!`)
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchWarehouses()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Failed to create warehouse.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreateLocation(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedWhId) return
    setErrorMsg(null)
    setSubmitting(true)
    try {
      await warehousesApi.createLocation(selectedWhId, {
        name: locForm.name,
        short_code: locForm.short_code,
      })
      setIsLocModalOpen(false)
      setSuccessMsg(`Location '${locForm.name}' added!`)
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchWarehouses()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Failed to add location.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Warehouses & Locations"
        description="Configure your physical logistics hubs, regional depots, and storage bin hierarchies."
        actions={
          <Button size="sm" onClick={handleOpenWhModal}>
            <Plus size={14} className="mr-1.5" />
            Add Warehouse
          </Button>
        }
      />

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {warehouses.length === 0 && !loading ? (
        <Card padding="none">
          <EmptyState
            icon={WarehouseIcon}
            title="No warehouses configured"
            description="Add your first warehouse facility to start organizing storage locations."
            action={
              <Button size="sm" onClick={handleOpenWhModal}>
                <Plus size={14} className="mr-1" /> Add Warehouse
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {warehouses.map((wh) => (
            <Card key={wh.id} padding="none" className="overflow-hidden">
              {/* Warehouse Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 bg-gray-50/70 border-b border-gray-100">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <WarehouseIcon size={19} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-900">
                        {wh.name}
                      </h2>
                      <Badge variant="default" className="font-mono text-xs">
                        {wh.short_code}
                      </Badge>
                      <Badge variant="success" dot className="text-xs">
                        Active
                      </Badge>
                    </div>
                    {wh.address && (
                      <p className="text-xs text-gray-500 mt-1">{wh.address}</p>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenLocModal(wh.id)}
                >
                  <Plus size={13} className="mr-1" /> Add Location
                </Button>
              </div>

              {/* Sub-locations grid */}
              <div className="p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Configured Storage Locations ({wh.locations.length})
                </p>

                {wh.locations.length === 0 ? (
                  <p className="text-xs text-gray-400 py-3">
                    No sub-locations configured for this warehouse yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {wh.locations.map((loc) => (
                      <div
                        key={loc.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <MapPin size={14} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {loc.name}
                            </p>
                            <p className="text-[10px] font-mono text-gray-400">
                              {wh.short_code}/{loc.short_code}
                            </p>
                          </div>
                        </div>
                        <Badge variant="neutral" className="text-[10px]">
                          Zone
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Warehouse Modal */}
      <Modal
        open={isWhModalOpen}
        onClose={() => setIsWhModalOpen(false)}
        title="Add Warehouse Facility"
        size="md"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <Input
            label="Warehouse Name"
            id="wh-name"
            required
            placeholder="e.g. West Coast Distribution Hub"
            value={whForm.name}
            onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
          />

          <Input
            label="Short Code Prefix"
            id="wh-code"
            required
            maxLength={6}
            placeholder="e.g. WCD, WH3"
            value={whForm.short_code}
            onChange={(e) => setWhForm({ ...whForm, short_code: e.target.value.toUpperCase() })}
            hint="Used in operation references (e.g. WCD/IN/0001)"
          />

          <Input
            label="Physical Address"
            id="wh-addr"
            placeholder="e.g. 500 Pacific Blvd, Los Angeles CA"
            value={whForm.address}
            onChange={(e) => setWhForm({ ...whForm, address: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsWhModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Save Warehouse
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Location Modal */}
      <Modal
        open={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        title="Add Storage Location"
        size="sm"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <Input
            label="Location Name"
            id="loc-name"
            required
            placeholder="e.g. Aisle 3 - Shelf B"
            value={locForm.name}
            onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
          />

          <Input
            label="Location Short Code"
            id="loc-code"
            required
            placeholder="e.g. A3-B, RackC"
            value={locForm.short_code}
            onChange={(e) => setLocForm({ ...locForm, short_code: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsLocModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Add Location
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
