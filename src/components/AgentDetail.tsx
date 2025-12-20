import { useStore, type Agent } from '@/lib/store'
import { calculateAgentStats, getAllBuffsForAgent } from '@/lib/stats'
import { resolveAssetPath } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DiscSlot } from './DiscSlot'
import { WEngineSection } from './WEngineSection'
import { BuffsSection } from './BuffsSection'
import { FinalStats } from './FinalStats'
import { StatWeights } from './StatWeights'
import { X } from 'lucide-react'

interface AgentDetailProps {
  agent: Agent
}

export function AgentDetail({ agent }: AgentDetailProps) {
  const deleteAgent = useStore((state) => state.deleteAgent)
  const selectAgent = useStore((state) => state.selectAgent)
  const wEngines = useStore((state) => state.wEngines)
  const addLoadout = useStore((state) => state.addLoadout)
  const setCurrentLoadout = useStore((state) => state.setCurrentLoadout)
  
  const allBuffs = getAllBuffsForAgent(agent, wEngines)
  const stats = calculateAgentStats(agent, wEngines, allBuffs)
  
  const currentLoadout = agent.loadouts.find((l) => l.id === agent.currentLoadoutId)

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${agent.name}? This action cannot be undone.`)) {
      deleteAgent(agent.id)
      selectAgent(null)
    }
  }

  const handleAddLoadout = () => {
    const id = addLoadout(agent.id, {
      name: `Loadout ${agent.loadouts.length + 1}`,
      discs: [null, null, null, null, null, null],
    })
    setCurrentLoadout(agent.id, id)
  }

  const handleLoadoutChange = (loadoutId: string) => {
    setCurrentLoadout(agent.id, loadoutId)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-cyan-300/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-cyan-300">{agent.name}</h2>
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
            >
              Delete Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side: Agent image and Final Stats */}
            <div className="flex-shrink-0 space-y-4">
              {/* Agent full body image */}
              {agent.bodyUrl ? (
                <div className="aspect-[2/3] w-64 bg-slate-800/50 border border-cyan-300/20 rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={resolveAssetPath(agent.bodyUrl)}
                    alt={`${agent.name} full body`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-cyan-300/30">Full Body Placeholder</span>'
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-[2/3] w-64 bg-slate-800/50 border border-cyan-300/20 rounded-md flex items-center justify-center">
                  <span className="text-xs text-cyan-300/30">Full Body Placeholder</span>
                </div>
              )}
              
              {/* Final Stats */}
              <FinalStats stats={stats} />
            </div>

            {/* Right side: Editable fields */}
            <div className="flex-1 space-y-6">
              {/* Loadout Selector */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-sm font-medium text-cyan-300">Loadout</label>
                  <Select
                    value={agent.currentLoadoutId || ''}
                    onValueChange={handleLoadoutChange}
                  >
                    <SelectTrigger className="w-48 border-cyan-300/20 bg-slate-800/50">
                      <SelectValue placeholder="Select loadout" />
                    </SelectTrigger>
                    <SelectContent>
                      {agent.loadouts.map((loadout) => (
                        <SelectItem key={loadout.id} value={loadout.id}>
                          {loadout.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddLoadout}
                    size="sm"
                    variant="outline"
                    className="border-cyan-300/20"
                  >
                    Add Loadout
                  </Button>
                </div>
              </div>

              {/* W-Engine Section */}
              <WEngineSection agent={agent} />

              {/* Disc Drive Section */}
              {currentLoadout && (
                <Card className="bg-slate-800/50 border-cyan-300/20">
                  <CardHeader>
                    <CardTitle className="text-cyan-300 text-lg">Disc Drive</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {([1, 2, 3, 4, 5, 6] as const).map((slot) => (
                        <DiscSlot
                          key={slot}
                          agent={agent}
                          loadout={currentLoadout}
                          slot={slot}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buffs Section */}
      <BuffsSection agent={agent} allBuffs={allBuffs} />

      {/* Stat Weights */}
      <StatWeights />
    </div>
  )
}
