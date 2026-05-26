'use client'
import { useParams, useRouter } from 'next/navigation'
import { useReservation } from '@/hooks/useReservations'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'

export default function ReservationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { reservation, loading } = useReservation(id as string)

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading reservation details...</p>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>Reservation not found</p>
        <button
          onClick={() => router.push('/reservations')}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back to Reservations
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>
          Reservation #{reservation.id.slice(-8)}
        </h1>
        <Button variant='secondary' onClick={() => router.push('/reservations')}>
          Back
        </Button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Customer
            </p>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
              {reservation.expand?.customer?.name || '-'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Service Type
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{reservation.service_type || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Pickup Location
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{reservation.pickup_location || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Destination
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{reservation.destination || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Date & Time
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>
              {reservation.date ? `${reservation.date} ${reservation.time || ''}` : formatDate(reservation.created)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Vehicle
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>
              {reservation.expand?.vehicle ? `${reservation.expand.vehicle.make} ${reservation.expand.vehicle.model} (${reservation.expand.vehicle.plate})` : '-'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Driver
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>
              {reservation.expand?.driver?.name || 'Not assigned'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Amount
            </p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{formatKES(reservation.amount)}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Status
            </p>
            <PaymentBadge status={reservation.status} />
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Created
            </p>
            <p style={{ fontSize: '14px', color: '#475569' }}>{formatDate(reservation.created)}</p>
          </div>
          {reservation.notes && (
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Notes
              </p>
              <p style={{ fontSize: '14px', color: '#475569' }}>{reservation.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}