'use client'
import { usePayments } from '@/hooks/usePayments'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'

export default function PayoutsPage() {
  const { payments, loading, error } = usePayments()
  
  const payoutPayments = payments.filter(p => (p.category as string) === 'Leasing Payout' || (p.category as string) === 'leasing_payout')

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading payouts...</p>
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
      <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>Leasing Payouts</h1>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
                {['Reference', 'Amount', 'Method', 'Date', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payoutPayments.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '13px' }}>No payouts recorded yet</td></tr>
              )}
              {payoutPayments.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => window.location.href = `/payments/${p.id}`}>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.reference_id || '-'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px' }}>{formatKES(p.amount)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.method || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{formatDate(p.payment_date || p.created)}</td>
                  <td style={{ padding: '12px 16px' }}><PaymentBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
