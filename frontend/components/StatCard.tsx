type Props = {
  label: string
  value: string | number
  sub?: string
  accent?: string
  spark?: number[]
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const W = 72, H = 28
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * (H - 4) - 2}`)
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <polyline
        points={pts.join(' ')}
        fill='none'
        stroke={color}
        strokeWidth='1.5'
        strokeLinejoin='round'
        strokeLinecap='round'
        opacity='0.7'
      />
    </svg>
  )
}

export default function StatCard({ label, value, sub, accent = '#2563eb', spark = [] }: Props) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '0px',
    }}>

      {/* Top accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: accent,
        borderRadius: '12px 12px 0 0',
      }} />

      {/* Left accent line */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: 0,
        width: '3px',
        height: '48px',
        background: accent,
        borderRadius: '0 3px 3px 0',
        opacity: 0.25,
      }} />

      {/* Value + sparkline row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '6px' }}>
        <p style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1,
          letterSpacing: '-0.8px',
        }}>
          {value}
        </p>
        {spark.length > 1 && (
          <div style={{ paddingTop: '2px' }}>
            <Sparkline data={spark} color={accent} />
          </div>
        )}
      </div>

      {/* Label */}
      <p style={{
        fontSize: '12px',
        fontWeight: 700,
        color: '#334155',
        marginTop: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
      }}>
        {label}
      </p>

      {/* Sub */}
      {sub && (
        <p style={{
          fontSize: '11px',
          color: '#94a3b8',
          marginTop: '3px',
          fontWeight: 500,
        }}>
          {sub}
        </p>
      )}

      {/* Bottom accent strip */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: accent,
        opacity: 0.12,
      }} />

    </div>
  )
}