import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { loadWEnginesData, type WEngineData } from '@/lib/wengines-data'
import { getRankLabel, getTypeLabel } from '@/lib/game-constants'
import { resolveAssetPath } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

interface AddWEngineDialogProps {
  open: boolean
  onClose: () => void
}

export function AddWEngineDialog({ open, onClose }: AddWEngineDialogProps) {
  const [wEnginesData, setWEnginesData] = useState<Record<string, WEngineData>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRank, setFilterRank] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterElement, setFilterElement] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadWEnginesData()
        .then((data) => {
          setWEnginesData(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [open])

  // Get unique filter values
  const uniqueRanks = useMemo(() => {
    const ranks = new Set(Object.values(wEnginesData).map(a => a.rank))
    return Array.from(ranks).sort((a, b) => a - b)
  }, [wEnginesData])

  const uniqueTypes = useMemo(() => {
    const types = new Set(Object.values(wEnginesData).map(a => a.type))
    return Array.from(types).sort((a, b) => a - b)
  }, [wEnginesData])

  const filteredWEngines = useMemo(() => {
    return Object.values(wEnginesData).filter((wEngine) => {
      // Search filter
      const matchesSearch = 
        wEngine.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Rank filter
      const matchesRank = filterRank === 'all' || wEngine.rank.toString() === filterRank
      
      // Type filter
      const matchesType = filterType === 'all' || wEngine.type.toString() === filterType
      
      return matchesSearch && matchesRank && matchesType
    })
  }, [wEnginesData, searchTerm, filterRank, filterType, filterElement])

  if (!open) return null
}