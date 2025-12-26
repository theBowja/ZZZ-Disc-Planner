import { useState } from 'react'
import { useStore } from '@/lib/store'
import { calculateAreaUpgradeChance } from '@/lib/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

export function AreaPatrolTab() {
  const areas = useStore((state) => state.areas)
  const agents = useStore((state) => state.agents)
  const statWeights = useStore((state) => state.statWeights)
  const addArea = useStore((state) => state.addArea)
  const [newAreaName, setNewAreaName] = useState('')
  const [newSet1, setNewSet1] = useState('')
  const [newSet2, setNewSet2] = useState('')

  const handleAddArea = () => {
    if (!newAreaName.trim()) return
    addArea({
      name: newAreaName,
      discSet1: newSet1 || 'Placeholder Set 1',
      discSet2: newSet2 || 'Placeholder Set 2',
    })
    setNewAreaName('')
    setNewSet1('')
    setNewSet2('')
  }

  // Calculate which agents need farming in each area
  const getAgentsForArea = (_areaId: string) => {
    // Placeholder: In a real implementation, this would check which agents
    // have discs from the sets that drop in this area
    return agents.filter((agent) => {
      const currentLoadout = agent.loadouts.find(
        (l) => l.id === agent.currentLoadoutId
      )
      if (!currentLoadout) return false
      // For now, return all agents as potential candidates
      return currentLoadout.discs.some((d) => d !== null)
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-cyan-300/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-300">Area Patrol Locations</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Area name"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                className="w-48 border-cyan-300/20 bg-slate-800/50"
              />
              <Input
                placeholder="Set 1"
                value={newSet1}
                onChange={(e) => setNewSet1(e.target.value)}
                className="w-32 border-cyan-300/20 bg-slate-800/50"
              />
              <Input
                placeholder="Set 2"
                value={newSet2}
                onChange={(e) => setNewSet2(e.target.value)}
                className="w-32 border-cyan-300/20 bg-slate-800/50"
              />
              <Button
                onClick={handleAddArea}
                variant="outline"
                className="border-cyan-300/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Area
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {areas.length === 0 ? (
        <Card className="bg-slate-900/50 border-cyan-300/20">
          <CardContent className="py-12 text-center">
            <p className="text-cyan-300/50">
              No areas added yet. Add an area to start tracking farming locations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areas.map((area) => {
            const relevantAgents = getAgentsForArea(area.id)
            const overallChance = relevantAgents.reduce((sum, agent) => {
              return (
                sum +
                calculateAreaUpgradeChance(agent, area.id, statWeights) /
                  relevantAgents.length
              )
            }, 0)

            return (
              <Card
                key={area.id}
                className="bg-slate-900/50 border-cyan-300/20"
              >
                <CardHeader>
                  <CardTitle className="text-cyan-300">{area.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-cyan-300/70 mb-2">Drops:</div>
                    <div className="text-xs text-cyan-300/50 space-y-1">
                      <div>• {area.discSet1}</div>
                      <div>• {area.discSet2}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-cyan-300/70 mb-2">
                      Agents to Farm:
                    </div>
                    {relevantAgents.length === 0 ? (
                      <div className="text-xs text-cyan-300/50">
                        No agents need farming here
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {relevantAgents.map((agent) => (
                          <div
                            key={agent.id}
                            className="text-xs text-cyan-300/70"
                          >
                            TODO
                            {/* • {agent.name} */}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-cyan-300/10">
                    <div className="text-sm text-cyan-300/70 mb-1">
                      Overall Upgrade Chance:
                    </div>
                    <div className="text-lg font-mono font-bold text-cyan-300">
                      {(overallChance * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-cyan-300/50 mt-1">per run</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
