'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase'
import Table from '@/components/Table'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES } from '@/lib/utils'

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('vehicles').getFullList({ sort: '-created' })
      .then(data => {
        setVehicles(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className='text-gray-400 text-sm p-10'>Loading vehicles...</p>

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold text-gray-800'>Fleet</h1>
        <Link href='/fleet/new'><Button>+ Add Vehicle</Button></Link>
      </div>
      <Table headers={['Make & Model', 'Plate', 'Year', 'Daily Rate', 'Status', 'Action']}>
        {vehicles.length === 0 && (
          <tr><td colSpan={6} className='text-center text-gray-400 py-6 text-sm'>No vehicles yet</td></tr>
        )}
        {vehicles.map(v => (
          <tr key={v.id} className='border-t border-gray-100 hover:bg-gray-50'>
            <td className='px-4 py-3 font-medium'>{v.make} {v.model}</td>
            <td className='px-4 py-3'>{v.plate}</td>
            <td className='px-4 py-3'>{v.year}</td>
            <td className='px-4 py-3'>{v.daily_rate ? formatKES(Number(v.daily_rate)) : '-'}</td>
            <td className='px-4 py-3'><PaymentBadge status={v.status} /></td>
            <td className='px-4 py-3'>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link href={'/fleet/' + v.id} className='text-blue-600 text-xs hover:underline'>View →</Link>
                <Link href={'/fleet/' + v.id}
                  style={{ fontSize: '12px', padding: '3px 10px', background: '#f1f5f9', color: '#334155', borderRadius: '6px', textDecoration: 'none', border: '1px solid #e2e8f0' }}
                  onClick={(e) => { e.stopPropagation() }}>
                  Edit
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
