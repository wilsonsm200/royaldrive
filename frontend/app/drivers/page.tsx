'use client'
import Link from 'next/link'
import { useDrivers } from '@/hooks/useDrivers'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'

export default function DriversPage() {
  const { drivers, loading, error } = useDrivers()

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading drivers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>Error: {error}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>Drivers</h1>
        <Link href='/drivers/new'>
          <Button>+ Add Driver</Button>
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
                {['Name', 'Phone', 'License No', 'Availability', 'Action'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '13px' }}>
                    No drivers yet
                  </td>
                </tr>
              )}
              {drivers.map((d) => (
                <tr 
                  key={d.id} 
                  style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer' }} 
                  onClick={() => window.location.href = `/drivers/${d.id}`}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px' }}>{d.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{d.phone}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{d.license_number || '-'}</td>
                  <td style={{ padding: '12px 16px' }}><PaymentBadge status={d.availability} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/drivers/${d.id}`} style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'none' }}>
                      View →
                    </Link>
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