import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { type WEngineData } from '@/lib/agents-data' // Assuming WEngineData is in the same file
import { getRankLabel, getTypeLabel } from '@/lib/game-constants'
import { resolveAssetPath } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useDb } from '@/hooks/useDb'

interface AddWEngineDialogProps {
  agentId: string
  loadoutId: string
  onClose: () => void
}

export function AddWEngineDialog({ agentId, loadoutId, onClose }: AddWEngineDialogProps) {
  // 1. Store Actions/State - Pointed to W-Engine specific store logic
  const updateWEngine = useStore((state) => state.updateWEngine)
  const deleteWEngine = useStore((state) => state.deleteWEngine)
  
  // 2. Database Hook for W-Engines
  const { dataList: wEnginesDataList, isLoading } = useDb<WEngineData>('wengines')

  // 3. Local UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRank, setFilterRank] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  // Get unique filter values
  const uniqueRanks = useMemo(() => {
    const ranks = new Set(wEnginesDataList.map((w) => w.rank));
    return Array.from(ranks).sort((a, b) => (b as number) - (a as number));
  }, [wEnginesDataList]);
  
  const uniqueTypes = useMemo(() => {
    const types = new Set(wEnginesDataList.map((w) => w.type));
    return Array.from(types).sort((a, b) => (a as number) - (b as number));
  }, [wEnginesDataList]);

  // Filter Logic
  const filteredWEngines = useMemo(() => {
    return wEnginesDataList.filter((engine) => {
      const matchesSearch = engine.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRank = filterRank === 'all' || engine.rank.toString() === filterRank
      const matchesType = filterType === 'all' || engine.type.toString() === filterType

      return matchesSearch && matchesRank && matchesType
    })
  }, [wEnginesDataList, searchTerm, filterRank, filterType])

  const handleAddWEngine = (engineData: WEngineData) => {
    // addWEngine(engineData.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="bg-slate-900 border-amber-400/30 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber-400">Equip W-Engine</CardTitle>
            <Button onClick={onClose} size="icon" variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="space-y-3 mb-4">
            <Input
              placeholder="Search W-Engines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-amber-400/30 bg-slate-800/50 text-white placeholder:text-slate-500 focus-visible:ring-amber-400/50"
            />
            
            <div className="space-y-2">
              {/* Rank Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-400/70 min-w-[60px]">Rank:</span>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterRank === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterRank('all')}
                    className={filterRank === 'all' ? 'bg-amber-400/20 border-amber-400/50 text-amber-100' : 'border-amber-400/30 text-amber-400/70'}
                  >
                    All
                  </Button>
                  {uniqueRanks.map((rank) => (
                    <Button
                      key={rank}
                      variant={filterRank === rank.toString() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterRank(rank.toString())}
                      className={filterRank === rank.toString() ? 'bg-amber-400/20 border-amber-400/50 text-amber-100' : 'border-amber-400/30 text-amber-400/70'}
                    >
                      {getRankLabel(rank)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Specialty/Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-400/70 min-w-[60px]">Type:</span>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className={filterType === 'all' ? 'bg-amber-400/20 border-amber-400/50 text-amber-100' : 'border-amber-400/30 text-amber-400/70'}
                  >
                    All
                  </Button>
                  {uniqueTypes.map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type.toString() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type.toString())}
                      className={filterType === type.toString() ? 'bg-amber-400/20 border-amber-400/50 text-amber-100' : 'border-amber-400/30 text-amber-400/70'}
                    >
                      {getTypeLabel(type)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <p className="text-center text-amber-400/60 py-8">Loading W-Engines...</p>
            ) : filteredWEngines.length === 0 ? (
              <p className="text-center text-amber-400/60 py-8">No W-Engines found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredWEngines.map((engine) => (
                  <button
                    key={engine.id}
                    onClick={() => handleAddWEngine(engine)}
                    className="p-3 bg-slate-800/50 border border-amber-400/20 rounded-md hover:bg-slate-800/80 hover:border-amber-400/50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      {engine.iconUrl && (
                        <div className="relative">
                          <img
                            src={resolveAssetPath(engine.iconUrl)}
                            alt={engine.name}
                            className="w-14 h-14 object-contain flex-shrink-0 group-hover:scale-110 transition-transform"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-amber-100 group-hover:text-amber-400 transition-colors truncate">
                          {engine.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {getRankLabel(engine.rank)} • {getTypeLabel(engine.type)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}