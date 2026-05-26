'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import pb from '@/lib/pocketbase'

const links = [
  {
    group: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Reservations', href: '/reservations' },
      { label: 'Customers', href: '/customers' },
      { label: 'Fleet', href: '/fleet' },
      { label: 'Drivers', href: '/drivers' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { label: 'Leasing', href: '/leasing' },
      { label: 'Car Owners', href: '/leasing/owners' },
      { label: 'Payouts', href: '/leasing/payouts' },
      { label: 'Payments', href: '/payments' },
    ],
  },
  {
    group: 'Insights',
    items: [
      { label: 'Reports', href: '/reports' },
    ],
  },
]

const ICONS: Record<string, string> = {
  '/dashboard': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  '/reservations': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  '/customers': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  '/fleet': 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM15 7h2l3 5v4h-2',
  '/drivers': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  '/leasing': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  '/leasing/owners': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  '/leasing/payouts': 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z',
  '/payments': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  '/reports': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    pb.authStore.clear()
    router.push('/login')
  }

  const user = pb.authStore.model

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z' />
              <path d='M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM15 7h2l3 5v4h-2' />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1 }}>RoyalDrive</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>Mobility Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 14px 0' }}>
        {links.map((group) => (
          <div key={group.group} style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.22)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '0 10px',
              marginBottom: '6px',
            }}>
              {group.group}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const iconPath = ICONS[item.href]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    padding: '10px 12px',
                    borderRadius: '9px',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                    background: isActive ? 'rgba(37,99,235,0.25)' : 'transparent',
                    textDecoration: 'none',
                    marginBottom: '2px',
                    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                  }}
                >
                  {iconPath && (
                    <svg
                      width='17'
                      height='17'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55 }}
                    >
                      <path d={iconPath} />
                    </svg>
                  )}
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Company Info + Logout */}
      <div style={{ padding: '14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Company card - not user */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.06)',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <rect x='2' y='7' width='20' height='14' rx='2' ry='2' />
              <path d='M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16' />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}>
              RoyalDrive
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
              {user?.email || 'admin@royaldrive.com'}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '9px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(220,38,38,0.15)'
            e.currentTarget.style.color = '#fca5a5'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
          }}
        >
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' />
            <polyline points='16 17 21 12 16 7' />
            <line x1='21' y1='12' x2='9' y2='12' />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}