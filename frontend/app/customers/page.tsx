'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase'
import Table from '@/components/Table'
import Button from '@/components/Button'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', location: '', notes: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    pb.collection('Customers').getFullList({ sort: '-created' })
      .then(data => { setCustomers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function startEdit(c: any) {
    setEditingId(c.id)
    setEditForm({
      name: c.name || c.Name || '',
      phone: c.phone || '',
      email: c.email || '',
      location: c.location || '',
      notes: c.notes || ''
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    await pb.collection('Customers').update(editingId, editForm)
    setSaving(false)
    setEditingId(null)
    load()
  }

  if (loading) return <p className='text-gray-400 text-sm p-10'>Loading customers...</p>

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold text-gray-800'>Customers</h1>
        <Link href='/customers/new'><Button>+ New Customer</Button></Link>
      </div>

      {editingId && (
        <div className='bg-white rounded-xl border border-blue-200 p-5 max-w-lg space-y-3'>
          <h2 className='font-semibold text-gray-700 text-sm'>Editing Customer</h2>
          {[
            { label: 'Full Name', name: 'name' },
            { label: 'Phone', name: 'phone' },
            { label: 'Email', name: 'email' },
            { label: 'Location', name: 'location' },
            { label: 'Notes', name: 'notes' },
          ].map(f => (
            <div key={f.name} className='flex flex-col gap-1'>
              <label className='text-xs font-medium text-gray-500'>{f.label}</label>
              <input
                name={f.name}
                value={(editForm as any)[f.name]}
                onChange={handleChange}
                className='border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400'
              />
            </div>
          ))}
          <div className='flex gap-3 pt-1'>
            <Button onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            <Button variant='secondary' onClick={() => setEditingId(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <Table headers={['Name', 'Phone', 'Email', 'Location', 'Actions']}>
        {customers.length === 0 && (
          <tr><td colSpan={5} className='text-center text-gray-400 py-6 text-sm'>No customers yet</td></tr>
        )}
        {customers.map(c => (
          <tr key={c.id} className='border-t border-gray-100 hover:bg-gray-50'>
            <td className='px-4 py-3 font-medium'>{c.name || c.Name || '-'}</td>
            <td className='px-4 py-3'>{c.phone || '-'}</td>
            <td className='px-4 py-3'>{c.email || '-'}</td>
            <td className='px-4 py-3'>{c.location || '-'}</td>
            <td className='px-4 py-3 flex gap-3'>
              <button onClick={() => startEdit(c)} className='text-blue-600 text-xs hover:underline'>Edit</button>
              <Link href={'/customers/' + c.id} className='text-gray-500 text-xs hover:underline'>View →</Link>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}