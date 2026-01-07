import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { resolveAssetPath } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AgentDetail } from './AgentDetail'
import { AddAgentDialog } from './AddAgentDialog'
import { Plus, Search, Users } from 'lucide-react'
import { useDb } from '@/hooks/useDb'
import { type AgentData } from '@/lib/agents-data'

export function AgentsTab() {
  const agents = useStore((state) => state.agents)
  const selectedAgentId = useStore((state) => state.selectedAgentId)
  const selectAgent = useStore((state) => state.selectAgent)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: agentsData } = useDb<AgentData>('agents', agents.length > 0);

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const name = agentsData?.[agent.id]?.name?.toLowerCase() || ''
      return name.includes(searchQuery.toLowerCase())
    })
  }, [agents, agentsData, searchQuery])

  const selectedAgent = useMemo(() => 
    agents.find((a) => a.id === selectedAgentId), 
  [agents, selectedAgentId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full items-start ">
      
      {/* AGENT SELECTION SIDEBAR */}
      <div className="lg:col-span-1 lg:sticky lg:top-0">
        <Card className="bg-slate-900/50 border-cyan-400/30 flex flex-col max-h-[calc(100vh-120px)] overflow-hidden shadow-xl shadow-cyan-950/20 gap-0 py-0">
          <CardHeader className="p-4 space-y-4 flex-shrink-0 border-b border-cyan-500/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                  Roster
                </CardTitle>
              </div>
              <Button
                onClick={() => setShowAddDialog(true)}
                size="icon"
                variant="outline"
                className="h-8 w-8 border-cyan-400/30 hover:bg-cyan-400/20 transition-all"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 bg-slate-950/50 border-cyan-500/10 text-xs focus-visible:ring-cyan-500/30"
              />
            </div>
          </CardHeader>

          <CardContent className="p-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-900/50 scrollbar-thumb-cyan-400/50">
            <div className="space-y-1.5">
              {filteredAgents.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-xs text-cyan-400/40 italic">
                    Empty
                  </p>
                </div>
              ) : (
                filteredAgents.map((agent) => {
                  const agentData = agentsData?.[agent.id]
                  const isActive = selectedAgentId === agent.id

                  return (
                    <button
                      key={agent.id}
                      onClick={() => selectAgent(agent.id)}
                      className={`w-full group flex items-center gap-3 p-2 rounded-md border transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-400/60 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]'
                          : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-cyan-500/30'
                      }`}
                    >
                      <div className={`relative w-10 h-10 rounded overflow-hidden border transition-colors ${
                        isActive ? 'border-cyan-400' : 'border-slate-700 group-hover:border-slate-500'
                      }`}>
                        {agentData?.iconUrl ? (
                          <img
                            src={resolveAssetPath(agentData.iconUrl)}
                            alt={agentData.name}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className={`text-sm font-bold truncate transition-colors ${
                          isActive 
                            ? 'text-cyan-300' 
                            : 'text-slate-300 group-hover:text-cyan-200'
                        }`}>
                          {agentData?.name || ''}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN DETAIL VIEW */}
      <div className="lg:col-span-4">
        {selectedAgent ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AgentDetail 
              agent={selectedAgent} 
              agentData={agentsData?.[selectedAgent.id]} 
            />
          </div>
        ) : (
          <Card className="bg-slate-900/30 border-dashed border-cyan-500/10 h-[400px] flex items-center justify-center">
            <CardContent className="text-center">
              <Users className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-cyan-400/40 font-medium">
                Select an agent to view profile
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {showAddDialog && (
        <AddAgentDialog onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  )
}