import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgentDetail } from './AgentDetail'
import { AddAgentDialog } from './AddAgentDialog'
import { Plus } from 'lucide-react'

export function AgentsTab() {
  const agents = useStore((state) => state.agents)
  const selectedAgentId = useStore((state) => state.selectedAgentId)
  const selectAgent = useStore((state) => state.selectAgent)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="bg-slate-900/50 border-cyan-400/30">
          <CardHeader>
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
          <CardContent>
            <div className="space-y-2">
              {agents.length === 0 ? (
                <p className="text-sm text-cyan-400/60 text-center py-8">
                  No agents yet. Add one to get started.
                </p>
              ) : (
                agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => selectAgent(agent.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedAgentId === agent.id
                        ? 'bg-cyan-400/20 border-cyan-400/50'
                        : 'bg-slate-800/50 border-cyan-400/20 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="font-medium text-cyan-300">{agent.name}</div>
                    <div className="text-xs text-cyan-400/60 mt-1">
                      {agent.loadouts.length} loadout{agent.loadouts.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {selectedAgent ? (
          <AgentDetail agent={selectedAgent} />
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

      <AddAgentDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  )
}
