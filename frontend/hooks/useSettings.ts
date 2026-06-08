import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase'

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('settings').getFullList()
      .then(records => {
        const map: Record<string, string> = {}
        records.forEach((r: any) => { map[r.key] = r.value })
        setSettings(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function setSetting(key: string, value: string) {
    try {
      const existing = await pb.collection('settings').getFirstListItem(`key="${key}"`)
      await pb.collection('settings').update(existing.id, { value })
    } catch {
      await pb.collection('settings').create({ key, value })
    }
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return { settings, loading, setSetting }
}