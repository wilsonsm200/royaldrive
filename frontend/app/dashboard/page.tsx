'use client'
import { useEffect, useState } from 'react'
import { useReservations } from '@/hooks/useReservations'
import { useVehicles } from '@/hooks/useVehicles'
import { usePayments } from '@/hooks/usePayments'
import { useDrivers } from '@/hooks/useDrivers'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'

const SERVICE_COLORS: Record<string, string> = {
  'Airport Transfer': '#2563eb',
  'Chauffeur': '#7c3aed',
  'Self-Drive': '#d97706',
  'Wedding': '#db2777',
  'Long Distance': '#16a34a',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const isLeasingPayout = (p: any) =>
  p.category === 'Leasing Payout' || p.category === 'leasing_payout'

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div style={{ width: 64, height: 28 }} />
  const max = Math.max(...data, 1)
  const W = 64, H = 28
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * (H - 4) - 2}`)
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '90px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%',
            height: `${Math.max(3, Math.round((d.value / max) * 66))}px`,
            background: d.value > 0 ? color : '#f1f5f9',
            borderRadius: '4px 4px 0 0',
          }} />
          <span style={{ fontSize: '9px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ slices }: { slices: { value: number; color: string }[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0) || 1
  const r = 26, cx = 30, cy = 30, stroke = 9
  const circ = 2 * Math.PI * r
  let cum = 0
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {slices.map((s, i) => {
        const pct = s.value / total
        const dash = pct * circ
        const offset = -(cum * circ) + circ / 4
        cum += pct
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={offset} />
      })}
    </svg>
  )
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 5, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
    </div>
  )
}

export default function DashboardPage() {
  const { reservations, customerMap, vehicleMap, loading: rL } = useReservations()
  const { vehicles, loading: vL } = useVehicles()
  const { payments, loading: pL } = usePayments()
  const { drivers, loading: dL } = useDrivers()

  const [ready, setReady] = useState(false)
  const [stats, setStats] = useState({
    totalRes: 0, todayRes: 0, monthRev: 0, totalRev: 0,
    activeVeh: 0, totalVeh: 0, pendPay: 0, overPay: 0,
    availDrv: 0, totalDrv: 0, collectionRate: 0,
    topVehicle: '-', totalPayouts: 0,
  })
  const [recentRes, setRecentRes] = useState<any[]>([])
  const [recentPay, setRecentPay] = useState<any[]>([])
  const [nextRes, setNextRes] = useState<any>(null)
  const [serviceBreakdown, setServiceBreakdown] = useState<{ label: string; value: number; color: string }[]>([])
  const [monthlyRev, setMonthlyRev] = useState<{ label: string; value: number }[]>([])
  const [weeklyBook, setWeeklyBook] = useState<{ label: string; value: number }[]>([])
  const [sparkline, setSparkline] = useState<number[]>([])

  const isLoading = rL || vL || pL || dL

  useEffect(() => {
    if (isLoading) return
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    const revenuePayments = payments.filter(p => ['paid','Paid'].includes(p.status) && !isLeasingPayout(p))
    const leasingPayouts = payments.filter(p => ['paid','Paid'].includes(p.status) && isLeasingPayout(p))
    const totalRev = revenuePayments.reduce((s, p) => s + (p.amount || 0), 0)
    const totalPayoutsAmt = leasingPayouts.reduce((s, p) => s + (p.amount || 0), 0)

    const monthRevIncome = revenuePayments.filter(p => { const d = new Date(p.created); return d.getMonth() === thisMonth && d.getFullYear() === thisYear }).reduce((s, p) => s + (p.amount || 0), 0)
    const monthRevPayouts = leasingPayouts.filter(p => { const d = new Date(p.created); return d.getMonth() === thisMonth && d.getFullYear() === thisYear }).reduce((s, p) => s + (p.amount || 0), 0)
    const monthRev = monthRevIncome - monthRevPayouts

    const mMap: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) { const d = new Date(thisYear, thisMonth - i, 1); mMap[`${d.getFullYear()}-${d.getMonth()}`] = 0 }
    revenuePayments.forEach(p => { const d = new Date(p.created); const k = `${d.getFullYear()}-${d.getMonth()}`; if (k in mMap) mMap[k] += p.amount || 0 })
    leasingPayouts.forEach(p => { const d = new Date(p.created); const k = `${d.getFullYear()}-${d.getMonth()}`; if (k in mMap) mMap[k] -= p.amount || 0 })
    const mArr = Object.entries(mMap).map(([k, v]) => ({ label: MONTHS[parseInt(k.split('-')[1])], value: Math.max(0, v as number) }))
    setMonthlyRev(mArr)
    setSparkline(mArr.map(m => m.value))

    const wArr: { label: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0]; wArr.push({ label: DAYS[d.getDay()], value: reservations.filter(r => r.created?.startsWith(ds)).length }) }
    setWeeklyBook(wArr)

    const sMap: Record<string, number> = {}
    reservations.forEach(r => { const s = r.service_type || 'Other'; sMap[s] = (sMap[s] || 0) + (r.amount || 0) })
    setServiceBreakdown(Object.entries(sMap).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value: value as number, color: SERVICE_COLORS[label] || '#64748b' })))

    const vCount: Record<string, number> = {}
    reservations.forEach(r => { if (r.vehicle) vCount[r.vehicle] = (vCount[r.vehicle] || 0) + 1 })
    const topVehicleId = Object.entries(vCount).sort((a, b) => b[1] - a[1])[0]?.[0]
    const topVehicle = topVehicleId ? (vehicleMap[topVehicleId] || '-') : '-'

    const totalResWithAmount = reservations.filter(r => r.amount > 0).length
    const paidRes = revenuePayments.length
    const collectionRate = totalResWithAmount > 0 ? Math.round((paidRes / totalResWithAmount) * 100) : 0

    // FIXED: Use pickup_date instead of date
    const upcoming = reservations
      .filter(r => r.pickup_date && new Date(r.pickup_date) >= now)
      .sort((a, b) => new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime())
    setNextRes(upcoming[0] || null)

    setStats({
      totalRes: reservations.length,
      todayRes: reservations.filter(r => r.created?.startsWith(todayStr)).length,
      monthRev: Math.max(0, monthRev), totalRev: Math.max(0, totalRev),
      activeVeh: vehicles.filter(v => ['Available','On Trip'].includes(v.status)).length,
      totalVeh: vehicles.length,
      pendPay: payments.filter(p => ['pending','Pending'].includes(p.status)).length,
      overPay: payments.filter(p => ['overdue','Overdue'].includes(p.status)).length,
      availDrv: drivers.filter(d => ['available','Available'].includes(d.availability)).length,
      totalDrv: drivers.length,
      collectionRate, topVehicle, totalPayouts: totalPayoutsAmt,
    })

    setRecentRes([...reservations].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()).slice(0, 5))
    setRecentPay([...payments].filter(p => !isLeasingPayout(p)).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()).slice(0, 5))
    setReady(true)
  }, [reservations, vehicles, payments, drivers, isLoading])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (!ready) return (
    <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8', fontSize: '13px' }}>Loading dashboard…</p>
    </div>
  )

  const netProfit = stats.totalRev - stats.totalPayouts
  const utilizationPct = stats.totalVeh > 0 ? Math.round((stats.activeVeh / stats.totalVeh) * 100) : 0
  const collRate = stats.collectionRate
  const collColor = collRate >= 80 ? '#16a34a' : collRate >= 50 ? '#d97706' : '#dc2626'

  const S: Record<string, React.CSSProperties> = {
    root: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#f8fafc',
      minHeight: '100vh',
      padding: '28px 32px',
      color: '#0f172a',
    },
    card: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      padding: '20px 22px',
    },
    label: {
      fontSize: '11px',
      fontWeight: 600,
      color: '#94a3b8',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.07em',
      marginBottom: '10px',
    },
    bigNum: {
      fontSize: '26px',
      fontWeight: 800,
      color: '#0f172a',
      lineHeight: 1,
      letterSpacing: '-0.8px',
    },
    sub: {
      fontSize: '11px',
      color: '#94a3b8',
      marginTop: '4px',
    },
    tableWrap: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      overflow: 'hidden',
    },
    th: {
      textAlign: 'left' as const,
      padding: '9px 16px',
      fontSize: '10px',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.07em',
      background: '#f8fafc',
      borderBottom: '1px solid #f1f5f9',
    },
    td: {
      padding: '11px 16px',
      fontSize: '13px',
      borderBottom: '1px solid #f8fafc',
    },
  }

  return (
    <div style={S.root}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '3px' }}>
            {greeting} 👋
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            {now.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="/reservations/new" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '9px 18px', background: '#0f172a', color: '#fff', border: 'none',
              borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>+ New Reservation</button>
          </a>
          <a href="/payments" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '9px 18px', background: '#fff', color: '#334155',
              border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px',
              fontWeight: 500, cursor: 'pointer',
            }}>+ Record Payment</button>
          </a>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>

        <div style={{ ...S.card, borderTop: '3px solid #2563eb' }}>
          <p style={S.label}>Reservations</p>
          <p style={S.bigNum}>{stats.totalRes}</p>
          <p style={S.sub}>{stats.todayRes} added today</p>
          <div style={{ marginTop: '12px' }}>
            <Sparkline data={weeklyBook.map(d => d.value)} color="#2563eb" />
          </div>
        </div>

        <div style={{ ...S.card, borderTop: '3px solid #16a34a' }}>
          <p style={S.label}>Month Revenue</p>
          <p style={{ ...S.bigNum, fontSize: '20px', color: '#16a34a' }}>{formatKES(stats.monthRev)}</p>
          <p style={S.sub}>Net profit {formatKES(netProfit)}</p>
          <div style={{ marginTop: '12px' }}>
            <Sparkline data={sparkline} color="#16a34a" />
          </div>
        </div>

        <div style={{ ...S.card, borderTop: '3px solid #d97706' }}>
          <p style={S.label}>Fleet</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <p style={S.bigNum}>{stats.activeVeh}</p>
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>/ {stats.totalVeh}</span>
          </div>
          <p style={S.sub}>vehicles active</p>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ProgressBar value={stats.activeVeh} max={Math.max(stats.totalVeh, 1)} color="#d97706" />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#d97706', flexShrink: 0 }}>{utilizationPct}%</span>
          </div>
        </div>

        <div style={{ ...S.card, borderTop: `3px solid ${stats.overPay > 0 ? '#dc2626' : '#64748b'}` }}>
          <p style={S.label}>Payments</p>
          <p style={{ ...S.bigNum, color: stats.overPay > 0 ? '#dc2626' : '#0f172a' }}>{stats.pendPay}</p>
          <p style={S.sub}>{stats.overPay > 0 ? `${stats.overPay} overdue` : 'No overdue payments'}</p>
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: '#fef9c3', color: '#92400e', borderRadius: 6 }}>
              {stats.pendPay} pending
            </span>
            {stats.overPay > 0 && (
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: '#fee2e2', color: '#991b1b', borderRadius: 6 }}>
                {stats.overPay} overdue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Middle Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>

        <div style={S.card}>
          <p style={S.label}>Collection Rate</p>
          <p style={{ fontSize: '38px', fontWeight: 800, color: collColor, lineHeight: 1, letterSpacing: '-1.5px' }}>
            {collRate}<span style={{ fontSize: '18px' }}>%</span>
          </p>
          <div style={{ margin: '12px 0 4px' }}>
            <div style={{ background: '#f1f5f9', borderRadius: 99, height: 6, overflow: 'hidden' }}>
              <div style={{ width: `${collRate}%`, height: '100%', background: collColor, borderRadius: 99 }} />
            </div>
          </div>
          <p style={S.sub}>of invoices collected</p>
        </div>

        <div style={S.card}>
          <p style={S.label}>Next Booking</p>
          {nextRes ? (
            <>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                {customerMap[nextRes.customer] || nextRes.expand?.customer?.name || 'Unknown'}
              </p>
              {/* FIXED: Use pickup_date instead of date */}
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>{formatDate(nextRes.pickup_date)}</p>
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                background: `${SERVICE_COLORS[nextRes.service_type] || '#64748b'}18`,
                color: SERVICE_COLORS[nextRes.service_type] || '#64748b',
              }}>
                {nextRes.service_type || 'Service'}
              </span>
            </>
          ) : (
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>No upcoming bookings</p>
          )}
        </div>

        <div style={S.card}>
          <p style={S.label}>Top Vehicle</p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>{stats.topVehicle}</p>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Most booked this period</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ProgressBar value={stats.activeVeh} max={Math.max(stats.totalVeh, 1)} color="#7c3aed" />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', flexShrink: 0 }}>{utilizationPct}% utilised</span>
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr', gap: '12px', marginBottom: '12px' }}>
        <div style={S.card}>
          <p style={S.label}>Monthly Revenue</p>
          <BarChart data={monthlyRev} color="#16a34a" />
        </div>
        <div style={S.card}>
          <p style={S.label}>Weekly Bookings</p>
          <BarChart data={weeklyBook} color="#2563eb" />
        </div>
        <div style={S.card}>
          <p style={S.label}>By Service</p>
          {serviceBreakdown.length === 0
            ? <p style={{ fontSize: '12px', color: '#cbd5e1' }}>No data yet</p>
            : (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                <DonutChart slices={serviceBreakdown} />
                <div style={{ flex: 1 }}>
                  {serviceBreakdown.slice(0, 4).map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: 2, background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '10px', color: '#64748b', flex: 1, fontWeight: 600 }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>
      </div>

      {/* ── Tables Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '12px' }}>

        <div style={S.tableWrap}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Recent Reservations</p>
            <a href="/reservations" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Customer','Service','Date','Amount','Status'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentRes.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '28px', fontSize: '13px' }}>No reservations yet</td></tr>
              )}
              {recentRes.map((r, i) => (
                <tr key={r.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => window.location.href = `/reservations/${r.id}`}
                >
                  <td style={{ ...S.td, fontWeight: 600, color: '#0f172a', borderBottom: i < recentRes.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    {customerMap[r.customer] || r.expand?.customer?.name || '-'}
                  </td>
                  <td style={{ ...S.td, color: '#64748b', borderBottom: i < recentRes.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    {r.service_type || '-'}
                  </td>
                  <td style={{ ...S.td, color: '#64748b', whiteSpace: 'nowrap', borderBottom: i < recentRes.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    {r.pickup_date ? formatDate(r.pickup_date) : formatDate(r.created)}
                  </td>
                  <td style={{ ...S.td, fontWeight: 700, color: '#0f172a', borderBottom: i < recentRes.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    {formatKES(r.amount || 0)}
                  </td>
                  <td style={{ ...S.td, borderBottom: i < recentRes.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <PaymentBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={S.tableWrap}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Recent Payments</p>
            <a href="/payments" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Amount','Method','Status'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPay.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '28px', fontSize: '13px' }}>No payments yet</td></tr>
              )}
              {recentPay.map((p, i) => (
                <tr key={p.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => window.location.href = `/payments/${p.id}`}
                >
                  <td style={{ ...S.td, fontWeight: 700, color: '#16a34a', borderBottom: i < recentPay.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    {formatKES(p.amount || 0)}
                  </td>
                  <td style={{ ...S.td, color: '#64748b', borderBottom: i < recentPay.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    {p.method || '-'}
                  </td>
                  <td style={{ ...S.td, borderBottom: i < recentPay.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <PaymentBadge status={p.status} />
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
