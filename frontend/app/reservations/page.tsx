'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'
import { RESERVATION_STATUSES } from '@/lib/constants'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [customers, setCustomers] = useState<Record<string, string>>({})
  const [vehicles, setVehicles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ service_type: '', destination: '', amount: '', status: '', notes: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    const [res, custs, vehs] = await Promise.all([
      pb.collection('Reservations').getFullList({ sort: '-created' }),
      pb.collection('Customers').getFullList(),
      pb.collection('vehicles').getFullList(),
    ])
    const custMap: Record<string, string> = {}
    custs.forEach(c => { custMap[c.id] = c.name || c.Name || c.phone || '-' })
    const vehMap: Record<string, string> = {}
    vehs.forEach(v => { vehMap[v.id] = v.make + ' ' + v.model + ' (' + v.plate + ')' })
    setCustomers(custMap)
    setVehicles(vehMap)
    setReservations(res)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(r: any) {
    setEditingId(r.id)
    setEditForm({
      service_type: r.service_type || '',
      destination: r.destination || '',
      amount: r.amount || '',
      status: r.status || '',
      notes: r.notes || '',
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    await pb.collection('Reservations').update(editingId, { ...editForm, amount: Number(editForm.amount) })
    setSaving(false)
    setEditingId(null)
    load()
  }

  if (loading) return <p className='text-gray-400 text-sm p-10'>Loading reservations...</p>

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold text-gray-800'>Reservations</h1>
        <Link href='/reservations/new'><Button>+ New Reservation</Button></Link>
      </div>

      {editingId && (
        <div className='bg-white rounded-xl border border-blue-200 p-5 max-w-lg space-y-3'>
          <h2 className='font-semibold text-gray-700 text-sm'>Editing Reservation</h2>
          <div className='flex flex-col gap-1'>
            <label className='text-xs font-medium text-gray-500'>Service Type</label>
            <input name='service_type' value={editForm.service_type} onChange={handleChange}
              className='border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs font-medium text-gray-500'>Destination</label>
            <input name='destination' value={editForm.destination} onChange={handleChange}
              className='border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs font-medium text-gray-500'>Amount (KES)</label>
            <input name='amount' value={editForm.amount} onChange={handleChange} type='number'
              className='border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs font-medium text-gray-500'>Status</label>
            <select name='status' value={editForm.status} onChange={handleChange}
              className='border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white'>
              {RESERVATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs font-medium text-gray-500'>Notes</label>
            <input name='notes' value={editForm.notes} onChange={handleChange}
              className='border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400' />
          </div>
          <div className='flex gap-3 pt-1'>
            <Button onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            <Button variant='secondary' onClick={() => setEditingId(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm' style={{ minWidth: '800px' }}>
            <thead>
              <tr className='border-b border-gray-100 bg-gray-50'>
                {['Customer', 'Service', 'Destination', 'Vehicle', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 && (
                <tr><td colSpan={8} className='text-center text-gray-400 py-6 text-sm'>No reservations yet</td></tr>
              )}
              {reservations.map(r => (
                <tr key={r.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-3 font-medium'>{customers[r.customer] || '-'}</td>
                  <td className='px-4 py-3'>{r.service_type || '-'}</td>
                  <td className='px-4 py-3'>{r.destination || '-'}</td>
                  <td className='px-4 py-3'>{vehicles[r.vehicle] || '-'}</td>
                  <td className='px-4 py-3 font-medium'>{formatKES(r.amount)}</td>
                  <td className='px-4 py-3'><PaymentBadge status={r.status} /></td>
                  <td className='px-4 py-3'>{formatDate(r.created)}</td>
                  <td className='px-4 py-3 flex gap-3'>
                    <button onClick={() => startEdit(r)} className='text-blue-600 text-xs hover:underline'>Edit</button>
                    <Link href={'/reservations/' + r.id} className='text-gray-500 text-xs hover:underline'>View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}