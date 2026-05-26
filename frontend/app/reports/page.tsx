'use client'
import { usePayments } from '@/hooks/usePayments'
import { useReservations } from '@/hooks/useReservations'
import { useVehicles } from '@/hooks/useVehicles'
import { useLeasingContracts } from '@/hooks/useLeasingContracts'
import StatCard from '@/components/StatCard'
import { formatKES } from '@/lib/utils'
import { useEffect, useState } from 'react'

const isLeasingPayout = (p: any) =>
  p.category === 'Leasing Payout' || p.category === 'leasing_payout'

export default function ReportsPage() {
  const { payments, loading: paymentsLoading } = usePayments()
  const { reservations, loading: reservationsLoading } = useReservations()
  const { vehicles, loading: vehiclesLoading } = useVehicles()
  const { contracts, loading: contractsLoading } = useLeasingContracts()
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalReservations: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    totalPayouts: 0,
    revenueByMonth: [] as { month: string; amount: number }[],
    revenueByService: [] as { service: string; amount: number }[],
    fleetUtilization: 0,
  })

  useEffect(() => {
    if (paymentsLoading || reservationsLoading || vehiclesLoading || contractsLoading) return
    
    const paidPayments = payments.filter(p =>
      ((p.status as string) === 'paid' || (p.status as string) === 'Paid') && !isLeasingPayout(p)
    )

    const leasingPayouts = payments.filter(p =>
      ((p.status as string) === 'paid' || (p.status as string) === 'Paid') && isLeasingPayout(p)
    )

    // Revenue excludes leasing payouts
    const totalRevenue = paidPayments.reduce((s, p) => s + (p.amount || 0), 0)
    const totalPaid = paidPayments.length
    const totalPending = payments.filter(p => (p.status as string) === 'pending' || (p.status as string) === 'pending').length
    const totalOverdue = payments.filter(p => (p.status as string) === 'overdue' || (p.status as string) === 'overdue').length
    const totalPayouts = leasingPayouts.reduce((s, p) => s + (p.amount || 0), 0)
    
    const activeVehicles = vehicles.filter(v => {
      const status = v.status?.toLowerCase()
      return status === 'available' || status === 'on_trip' || status === 'active'
    }).length
    const fleetUtilization = vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0
    
    // Revenue by month — exclude leasing payouts
    const monthMap = new Map<string, number>()
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = d.toLocaleString('default', { month: 'short' })
      monthMap.set(monthKey, 0)
    }
    
    paidPayments.forEach(p => {
      const date = new Date(p.payment_date || p.created)
      const monthKey = date.toLocaleString('default', { month: 'short' })
      if (monthMap.has(monthKey)) {
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + (p.amount || 0))
      }
    })
    
    const revenueByMonth = Array.from(monthMap.entries()).map(([month, amount]) => ({
      month,
      amount: Math.max(0, amount)
    }))
    
    // Revenue by service
    const serviceMap = new Map<string, number>()
    reservations.forEach(r => {
      const service = r.service_type || 'Other'
      serviceMap.set(service, (serviceMap.get(service) || 0) + (r.amount || 0))
    })
    
    const revenueByService = Array.from(serviceMap.entries())
      .map(([service, amount]) => ({ service, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
    
    setStats({
      totalRevenue,
      totalPaid,
      totalPending,
      totalOverdue,
      totalReservations: reservations.length,
      totalVehicles: vehicles.length,
      activeVehicles,
      totalPayouts,
      revenueByMonth,
      revenueByService,
      fleetUtilization,
    })
  }, [payments, reservations, vehicles, contracts, paymentsLoading, reservationsLoading, vehiclesLoading, contractsLoading])

  const isLoading = paymentsLoading || reservationsLoading || vehiclesLoading || contractsLoading

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading reports...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>Reports</h1>

      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          Revenue Overview
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <StatCard label='Total Revenue' value={formatKES(stats.totalRevenue)} accent='#16a34a' />
          <StatCard label='Paid Payments' value={stats.totalPaid} accent='#2563eb' />
          <StatCard label='Pending Payments' value={stats.totalPending} accent='#d97706' />
          <StatCard label='Overdue Payments' value={stats.totalOverdue} accent='#dc2626' />
        </div>
      </div>

      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          Operations Overview
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <StatCard label='Total Reservations' value={stats.totalReservations} accent='#2563eb' />
          <StatCard label='Total Vehicles' value={stats.totalVehicles} accent='#2563eb' />
          <StatCard label='Active Vehicles' value={stats.activeVehicles} accent='#16a34a' sub={`${stats.fleetUtilization}% utilization`} />
          <StatCard label='Total Leasing Payouts' value={formatKES(stats.totalPayouts)} accent='#d97706' />
        </div>
      </div>

      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          Revenue by Month
        </p>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          {stats.revenueByMonth.length === 0 || stats.revenueByMonth.every(m => m.amount === 0) ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>No revenue data available</p>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', marginBottom: '12px' }}>
                {stats.revenueByMonth.map((item, idx) => {
                  const maxAmount = Math.max(...stats.revenueByMonth.map(m => m.amount), 1)
                  const height = Math.max(30, (item.amount / maxAmount) * 160)
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '100%', backgroundColor: '#2563eb', borderRadius: '4px 4px 0 0', height: `${height}px`, minHeight: '4px', transition: 'height 0.5s ease' }} />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{item.month}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                {stats.revenueByMonth.map((item, idx) => (
                  <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a' }}>{formatKES(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          Revenue by Service Type
        </p>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          {stats.revenueByService.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>No service revenue data available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.revenueByService.map((item, idx) => {
                const maxAmount = stats.revenueByService[0]?.amount || 1
                const percentage = (item.amount / maxAmount) * 100
                const colors = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed']
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{item.service}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{formatKES(item.amount)}</span>
                    </div>
                    <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, background: colors[idx % colors.length], height: '100%', borderRadius: '99px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
