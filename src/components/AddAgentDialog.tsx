import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { loadAgentsData, type AgentData } from '@/lib/agents-data'
import { resolveAssetPath } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

interface AddAgentDialogProps {
  open: boolean
  onClose: () => void
}

export function AddAgentDialog({ open, onClose }: AddAgentDialogProps) {
  const agents = useStore((state) => state.agents)
  const addAgent = useStore((state) => state.addAgent)
  const selectAgent = useStore((state) => state.selectAgent)
  const [agentsData, setAgentsData] = useState<Record<string, AgentData>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRank, setFilterRank] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterElement, setFilterElement] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadAgentsData()
        .then((data) => {
          setAgentsData(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [open])

  // Get unique filter values
  const uniqueRanks = useMemo(() => {
    const ranks = new Set(Object.values(agentsData).map(a => a.rank))
    return Array.from(ranks).sort((a, b) => a - b)
  }, [agentsData])

  const uniqueTypes = useMemo(() => {
    const types = new Set(Object.values(agentsData).map(a => a.type))
    return Array.from(types).sort((a, b) => a - b)
  }, [agentsData])

  const uniqueElements = useMemo(() => {
    const elements = new Set(Object.values(agentsData).map(a => a.element))
    return Array.from(elements).sort((a, b) => a - b)
  }, [agentsData])

  const filteredAgents = useMemo(() => {
    return Object.values(agentsData).filter((agent) => {
      // Search filter
      const matchesSearch = 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Rank filter
      const matchesRank = filterRank === 'all' || agent.rank.toString() === filterRank
      
      // Type filter
      const matchesType = filterType === 'all' || agent.type.toString() === filterType
      
      // Element filter
      const matchesElement = filterElement === 'all' || agent.element.toString() === filterElement

      // Isn't already added
      const alreadyAdded = agents.some(a => a.id === agent.id)
      
      return matchesSearch && matchesRank && matchesType && matchesElement && !alreadyAdded
    })
  }, [agentsData, searchTerm, filterRank, filterType, filterElement, agents])

  const getRankLabel = (rank: number) => {
    if (rank === 3) return 'A'
    if (rank === 4) return 'S'
    return `Rank ${rank}`
  }

  const getTypeLabel = (type: number) => {
    const typeMap: Record<number, string> = {
      1: 'Attack',
      2: 'Stun',
      3: 'Anomaly',
      4: 'Support',
      5: 'Defense',
      6: 'Rupture',
    }
    return typeMap[type] || `Type ${type}`
  }

  const getElementLabel = (element: number) => {
    const elementMap: Record<number, string> = {
      200: 'Physical',
      201: 'Fire',
      202: 'Ice',
      203: 'Electric',
      205: 'Ether',
    }
    return elementMap[element] || `Element ${element}`
  }

  const handleAddAgent = (agentData: AgentData) => {
    const agentId = addAgent({
      id: agentData.id,
      name: agentData.name,
      iconUrl: agentData.iconUrl,
      bodyUrl: agentData.bodyUrl,
      baseStats: [],
      equippedWEngineId: null,
      currentLoadoutId: null,
      loadouts: [],
      activeBuffIds: [],
      customBuffs: [],
    })
    selectAgent(agentId)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="bg-slate-900 border-cyan-400/30 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-300">Add Agent</CardTitle>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="text-cyan-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="space-y-3 mb-4">
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-cyan-400/30 bg-slate-800/50"
            />
            <div className="space-y-2">
              {/* Rank filter as buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-cyan-300/70 min-w-[60px]">Rank:</span>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterRank === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterRank('all')}
                    className={filterRank === 'all' ? 'bg-cyan-400/20 border-cyan-400/50' : 'border-cyan-400/30'}
                  >
                    All
                  </Button>
                  {uniqueRanks.map((rank) => (
                    <Button
                      key={rank}
                      variant={filterRank === rank.toString() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterRank(rank.toString())}
                      className={filterRank === rank.toString() ? 'bg-cyan-400/20 border-cyan-400/50' : 'border-cyan-400/30'}
                    >
                      {getRankLabel(rank)}
                    </Button>
                  ))}
                </div>
              </div>
              {/* Specialty filter as buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-cyan-300/70 min-w-[80px]">Specialty:</span>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className={filterType === 'all' ? 'bg-cyan-400/20 border-cyan-400/50' : 'border-cyan-400/30'}
                  >
                    All
                  </Button>
                  {uniqueTypes.map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type.toString() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type.toString())}
                      className={filterType === type.toString() ? 'bg-cyan-400/20 border-cyan-400/50' : 'border-cyan-400/30'}
                    >
                      {getTypeLabel(type)}
                    </Button>
                  ))}
                </div>
              </div>
              {/* Element filter as buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-cyan-300/70 min-w-[80px]">Element:</span>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterElement === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterElement('all')}
                    className={filterElement === 'all' ? 'bg-cyan-400/20 border-cyan-400/50' : 'border-cyan-400/30'}
                  >
                    All
                  </Button>
                  {uniqueElements.map((element) => (
                    <Button
                      key={element}
                      variant={filterElement === element.toString() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterElement(element.toString())}
                      className={filterElement === element.toString() ? 'bg-cyan-400/20 border-cyan-400/50' : 'border-cyan-400/30'}
                    >
                      {getElementLabel(element)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center text-cyan-400/60 py-8">Loading agents...</p>
            ) : filteredAgents.length === 0 ? (
              <p className="text-center text-cyan-400/60 py-8">No agents found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAddAgent(agent)}
                    className="p-3 bg-slate-800/50 border border-cyan-400/20 rounded-md hover:bg-slate-800/70 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      {agent.iconUrl && (
                        <img
                          src={resolveAssetPath(agent.iconUrl)}
                          alt={agent.name}
                          loading="lazy"
                          className="w-12 h-12 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-cyan-300 break-words">{agent.name}</div>
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
