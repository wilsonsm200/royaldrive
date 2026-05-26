'use client'
import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reservations': 'Reservations',
  '/customers': 'Customers',
  '/fleet': 'Fleet',
  '/drivers': 'Drivers',
  '/leasing': 'Leasing',
  '/leasing/owners': 'Car Owners',
  '/leasing/payouts': 'Payouts',
  '/payments': 'Payments',
  '/reports': 'Reports',
}

export default function Navbar() {
  const pathname = usePathname()
  const title = titles[pathname] || 'RoyalDrive'

  return (
    <div
      className='flex items-center justify-between px-8'
      style={{
        height: '60px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}
    >
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{title}</h2>
      <div className='flex items-center gap-3'>
        <div
          className='flex items-center justify-center text-xs font-bold text-white rounded-full'
          style={{ width: '34px', height: '34px', background: '#2563eb' }}
        >
          WM
        </div>
      </div>
    </div>
  )
}