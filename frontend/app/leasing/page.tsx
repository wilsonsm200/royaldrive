'use client'
import Link from 'next/link'
import { useLeasingContracts } from '@/hooks/useLeasingContracts'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES } from '@/lib/utils'

export default function LeasingPage() {
  const { contracts, ownerMap, vehicleMap, loading, error } = useLeasingContracts()

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading leasing contracts...</p>
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
        <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>Leasing</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href='/leasing/payouts'>
            <Button variant='secondary'>Payouts</Button>
          </Link>
          <Link href='/leasing/new'>
            <Button>+ New Contract</Button>
          </Link>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
                {['Owner', 'Vehicle', 'Payout', 'Frequency', 'Status', 'Action'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '13px' }}>
                    No leasing contracts yet
                  </td>
                </tr>
              )}
              {contracts.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer' }}
                  onClick={() => window.location.href = `/leasing/${c.id}`}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px' }}>
                    {ownerMap[c.owner] || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    {vehicleMap[c.vehicle] || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px' }}>{formatKES(c.payout_amount)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{c.payout_frequency}</td>
                  <td style={{ padding: '12px 16px' }}><PaymentBadge status={c.status} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/leasing/${c.id}`} style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'none' }}>
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