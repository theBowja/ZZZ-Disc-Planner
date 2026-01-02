import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { resolveAssetPath } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgentDetail } from './AgentDetail'
import { AddAgentDialog } from './AddAgentDialog'
import { Plus } from 'lucide-react'
import { useDb } from '@/hooks/useDb'
import { type AgentData } from '@/lib/agents-data'

export function AgentsTab() {
  const agents = useStore((state) => state.agents)
  const selectedAgentId = useStore((state) => state.selectedAgentId)
  const selectAgent = useStore((state) => state.selectAgent)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { data: agentsData } = useDb<AgentData>('agents', agents.length > 0);

  const selectedAgent = useMemo(() => 
    agents.find((a) => a.id === selectedAgentId), 
  [agents, selectedAgentId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* Agent Sidebar */}
      <div className="lg:col-span-1 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] flex flex-col">
        <Card className="bg-slate-900/50 border-cyan-400/30 flex flex-col h-full overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-cyan-300">Your Agents</CardTitle>
              <Button
                onClick={() => setShowAddDialog(true)}
                size="icon"
                variant="outline"
                className="border-cyan-400/30 hover:bg-cyan-400/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-900/50 scrollbar-thumb-cyan-400/50 pb-6">
            <div className="space-y-2">
              {agents.length === 0 ? (
                <p className="text-sm text-cyan-400/60 text-center py-8">
                  No agents yet. Add one to get started.
                </p>
              ) : (
                agents.map((agent) => {
                  const agentData = agentsData?.[agent.id]

                  return (
                    /** Select Agent */
                    <button
                      key={agent.id}
                      onClick={() => selectAgent(agent.id)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedAgentId === agent.id
                          ? 'bg-cyan-400/20 border-cyan-400/50'
                          : 'bg-slate-800/50 border-cyan-400/20 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {agentData?.iconUrl ? (
                          <img
                            src={resolveAssetPath(agentData.iconUrl)}
                            alt={agentData.name}
                            className="w-10 h-10 object-contain flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 animate-pulse bg-slate-700/50" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-cyan-300 truncate">{agentData?.name || ''}</div>
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

      <div className="lg:col-span-4">
        {selectedAgent ? (
          <AgentDetail agent={selectedAgent} agentData={agentsData?.[selectedAgent.id]} />
        ) : (
          <Card className="bg-slate-900/50 border-cyan-400/30">
            <CardContent className="py-12 text-center">
              <p className="text-cyan-400/60">
                Select an agent to view details
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
