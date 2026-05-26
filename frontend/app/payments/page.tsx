'use client'
import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/lib/constants'

export default function PaymentsPage() {
  const { payments, loading, error, createPayment, reload } = usePayments()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    category: 'Reservation',
    reference_id: '',
    amount: '',
    method: 'Mpesa',
    status: 'paid',
    payment_date: '',
    notes: ''
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await createPayment({
        category: form.category as 'Reservation' | 'Leasing Payout' | 'Car Sale' | 'Other',
        reference_id: form.reference_id || undefined,
        amount: Number(form.amount),
        method: form.method as 'Mpesa' | 'Cash' | 'Bank Transfer',
        status: form.status as 'Pending' | 'Paid' | 'Partial' | 'Overdue',
        payment_date: form.payment_date || undefined,
        notes: form.notes || undefined,
      })
      setShowForm(false)
      setForm({ category: 'Reservation', reference_id: '', amount: '', method: 'Mpesa', status: 'paid', payment_date: '', notes: '' })
    } catch (err) {
      console.error('Failed to create payment:', err)
      alert('Failed to create payment. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading && payments.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading payments...</p>
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
        <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>Payments</h1>
        <Button onClick={() => setShowForm(true)}>+ Record Payment</Button>
      </div>

      {/* New Payment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>New Payment</h2>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Category *</label>
            <select
              name='category'
              value={form.category}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              {['Reservation', 'Leasing Payout', 'Car Hire', 'Chauffeur', 'Airport Transfer', 'Wedding', 'Long Distance', 'Self Drive', 'Car Sale', 'Fuel', 'Maintenance', 'Driver Payment', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
              Reference (e.g reservation ID or owner name)
            </label>
            <input
              type='text'
              name='reference_id'
              value={form.reference_id}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Amount (KES) *</label>
            <input
              type='number'
              name='amount'
              value={form.amount}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Method *</label>
            <select
              name='method'
              value={form.method}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Status *</label>
            <select
              name='status'
              value={form.status}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              {PAYMENT_STATUSES.map(s => (
                <option key={s} value={s.toLowerCase()}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Payment Date</label>
            <input
              type='date'
              name='payment_date'
              value={form.payment_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Notes</label>
            <textarea
              name='notes'
              value={form.notes}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type='submit'
              disabled={saving}
              style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
            <button
              type='button'
              onClick={() => setShowForm(false)}
              style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Payments Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
                {['Category', 'Reference', 'Amount', 'Method', 'Date', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '13px' }}>No payments yet</td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => window.location.href = `/payments/${p.id}`}>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.category}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.reference_id || '-'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px' }}>{formatKES(p.amount)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.method}</td>
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
