import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase'
import { Driver } from '@/types'

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const result = await pb.collection('drivers').getFullList({ sort: '-created' })
      setDrivers(result as unknown as Driver[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createDriver(data: Partial<Driver>) {
    const record = await pb.collection('drivers').create(data)
    await load()
    return record
  }

  async function updateDriver(id: string, data: Partial<Driver>) {
    const record = await pb.collection('drivers').update(id, data)
    await load()
    return record
  }

  async function deleteDriver(id: string) {
    await pb.collection('drivers').delete(id)
    await load()
  }

  return { drivers, loading, error, createDriver, updateDriver, deleteDriver, reload: load }
}

export function useDriver(id: string) {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    pb.collection('drivers').getOne(id)
      .then(r => setDriver(r as unknown as Driver))
      .finally(() => setLoading(false))
  }, [id])

  return { driver, loading }
}