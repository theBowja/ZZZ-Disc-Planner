import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { type AgentData } from '@/lib/agents-data'
import { type WEngineData } from '@/lib/wengines-data'
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
  // 1. Store Actions/State
  const updateWEngine = useStore((state) => state.updateWEngine)
  // const deleteWEngine = useStore((state) => state.deleteWEngine)
  
  // 2. Database Hooks
  const { dataList: wEnginesDataList, isLoading: loadingWEngines } = useDb<WEngineData>('wengines')
  const { data: agentsData, isLoading: loadingAgents } = useDb<AgentData>('agents')

  // Find the current agent's specialty to use as initial state
  const initialType = useMemo(() => {
    const agent = agentsData?.[agentId];
    return agent ? agent.type.toString() : 'all';
  }, [agentsData, agentId]);

  // 3. Local UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRank, setFilterRank] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>(initialType)

  // Sync filterType if agentsDataList finishes loading after initial render
  useEffect(() => {
    if (filterType === 'all' && initialType !== 'all') {
      setFilterType(initialType);
    }
  }, [initialType]);

  // // Find the current agent's specialty to pre-filter
  // const currentAgentType = useMemo(() => {
  //   return agentsData?.[agentId]?.type
  // }, [agentsData, agentId])

  // // Set default filter to agent's specialty once data loads
  // useEffect(() => {
  //   if (currentAgentType && filterType === 'all') {
  //     setFilterType(currentAgentType.toString())
  //   }
  // }, [currentAgentType])

  // Get unique filter values
  const uniqueRanks = useMemo(() => {
    const ranks = new Set(wEnginesDataList.map((w) => w.rank));
    return Array.from(ranks).sort((a, b) => (b as number) - (a as number));
  }, [wEnginesDataList]);
  
  const uniqueTypes = useMemo(() => {
    const types = new Set(wEnginesDataList.map((w) => w.type));
    return Array.from(types).sort((a, b) => (a as number) - (b as number));
  }, [wEnginesDataList]);

  // Filter Logic + Sorting (S-Rank first)
  const filteredWEngines = useMemo(() => {
    return wEnginesDataList
      .filter((engine) => {
        const matchesSearch = engine.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRank = filterRank === 'all' || engine.rank.toString() === filterRank
        const matchesType = filterType === 'all' || engine.type.toString() === filterType

        // Prefilter by agent type if no manual type filter is selected
        // const matchesType = filterType === 'all' 
        //   ? (currentAgentType ? engine.type === currentAgentType : true)
        //   : engine.type.toString() === filterType

        return matchesSearch && matchesRank && matchesType
      })
      .sort((a, b) => (b.rank as number) - (a.rank as number)) // Sort S-Rank (highest number) first
  }, [wEnginesDataList, searchTerm, filterRank, filterType])

  const handleAddWEngine = (engineData: WEngineData) => {
    updateWEngine(agentId, loadoutId, {
      id: engineData.id,
      overclock: 1,
    })
    onClose()
  }

  const isLoading = loadingWEngines || loadingAgents

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="bg-slate-900 border-amber-400/30 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
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
              <p className="text-center text-amber-400/60 py-8">No compatible W-Engines found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
