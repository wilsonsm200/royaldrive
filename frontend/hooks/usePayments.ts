import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase'
import { Payment } from '@/types'

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const result = await pb.collection('payments').getFullList({
        sort: '-created',
        expand: 'reservation',
      })
      setPayments(result as unknown as Payment[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createPayment(data: Partial<Payment>) {
    const record = await pb.collection('payments').create(data)
    await load()
    return record
  }

  async function updatePayment(id: string, data: Partial<Payment>) {
    const record = await pb.collection('payments').update(id, data)
    await load()
    return record
  }

  async function deletePayment(id: string) {
    await pb.collection('payments').delete(id)
    await load()
  }

  return { payments, loading, error, createPayment, updatePayment, deletePayment, reload: load }
}

export function usePayment(id: string) {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    pb.collection('payments').getOne(id, { expand: 'reservation' })
      .then(r => setPayment(r as unknown as Payment))
      .finally(() => setLoading(false))
  }, [id])

  return { payment, loading }
}