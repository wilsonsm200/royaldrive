'use client'
import { useParams, useRouter } from 'next/navigation'
import { useLeasingContract } from '@/hooks/useLeasingContracts'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'

export default function LeasingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { contract, loading } = useLeasingContract(id as string)

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading contract details...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>Contract not found</p>
        <button
          onClick={() => router.push('/leasing')}
          style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Back to Leasing
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>Leasing Contract</h1>
        <Button variant='secondary' onClick={() => router.push('/leasing')}>Back</Button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Owner</p>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{contract.expand?.owner?.name || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Phone</p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{contract.expand?.owner?.phone || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Vehicle</p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{contract.expand?.vehicle ? `${contract.expand.vehicle.make} ${contract.expand.vehicle.model}` : '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Plate</p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{contract.expand?.vehicle?.plate || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Payout Amount</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{formatKES(contract.payout_amount)}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Frequency</p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{contract.payout_frequency}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Start Date</p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{contract.start_date ? formatDate(contract.start_date) : '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Status</p>
            <PaymentBadge status={contract.status} />
          </div>
          {contract.notes && (
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Notes</p>
              <p style={{ fontSize: '14px', color: '#475569' }}>{contract.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}