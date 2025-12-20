import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { loadAgentsData, type AgentData } from '@/lib/agents-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'

interface AddAgentDialogProps {
  open: boolean
  onClose: () => void
}

export function AddAgentDialog({ open, onClose }: AddAgentDialogProps) {
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
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.code.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Rank filter
      const matchesRank = filterRank === 'all' || agent.rank.toString() === filterRank
      
      // Type filter
      const matchesType = filterType === 'all' || agent.type.toString() === filterType
      
      // Element filter
      const matchesElement = filterElement === 'all' || agent.element.toString() === filterElement
      
      return matchesSearch && matchesRank && matchesType && matchesElement
    })
  }, [agentsData, searchTerm, filterRank, filterType, filterElement])

  const handleAddAgent = (agentData: AgentData) => {
    const id = addAgent({
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
    selectAgent(id)
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
            <div className="grid grid-cols-3 gap-2">
              <Select value={filterRank} onValueChange={setFilterRank}>
                <SelectTrigger className="border-cyan-400/30 bg-slate-800/50">
                  <SelectValue placeholder="Rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranks</SelectItem>
                  {uniqueRanks.map((rank) => (
                    <SelectItem key={rank} value={rank.toString()}>
                      Rank {rank} (Placeholder)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="border-cyan-400/30 bg-slate-800/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type.toString()}>
                      Type {type} (Placeholder)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterElement} onValueChange={setFilterElement}>
                <SelectTrigger className="border-cyan-400/30 bg-slate-800/50">
                  <SelectValue placeholder="Element" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Elements</SelectItem>
                  {uniqueElements.map((element) => (
                    <SelectItem key={element} value={element.toString()}>
                      Element {element} (Placeholder)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center text-cyan-400/60 py-8">Loading agents...</p>
            ) : filteredAgents.length === 0 ? (
              <p className="text-center text-cyan-400/60 py-8">No agents found</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAddAgent(agent)}
                    className="p-3 bg-slate-800/50 border border-cyan-400/20 rounded-md hover:bg-slate-800/70 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {agent.iconUrl && (
                        <img
                          src={agent.iconUrl}
                          alt={agent.name}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-cyan-300 truncate">{agent.name}</div>
                        <div className="text-xs text-cyan-400/60 truncate">{agent.code}</div>
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
