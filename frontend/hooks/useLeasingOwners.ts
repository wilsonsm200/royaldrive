import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase'
import { LeasingOwner } from '@/types'

export function useLeasingOwners() {
  const [owners, setOwners] = useState<LeasingOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const result = await pb.collection('leasing_owners').getFullList({ sort: '-created' })
      setOwners(result as unknown as LeasingOwner[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createOwner(data: Partial<LeasingOwner>) {
    const record = await pb.collection('leasing_owners').create(data)
    await load()
    return record
  }

  async function updateOwner(id: string, data: Partial<LeasingOwner>) {
    const record = await pb.collection('leasing_owners').update(id, data)
    await load()
    return record
  }

  async function deleteOwner(id: string) {
    await pb.collection('leasing_owners').delete(id)
    await load()
  }

  return { owners, loading, error, createOwner, updateOwner, deleteOwner, reload: load }
}

export function useLeasingOwner(id: string) {
  const [owner, setOwner] = useState<LeasingOwner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    pb.collection('leasing_owners').getOne(id)
      .then(r => setOwner(r as unknown as LeasingOwner))
      .finally(() => setLoading(false))
  }, [id])

  return { owner, loading }
}