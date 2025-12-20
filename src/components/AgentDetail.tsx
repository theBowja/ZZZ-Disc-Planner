import { useStore, type Agent } from '@/lib/store'
import { calculateAgentStats, getAllBuffsForAgent } from '@/lib/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
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
  const updateAgent = useStore((state) => state.updateAgent)
  const deleteAgent = useStore((state) => state.deleteAgent)
  const selectAgent = useStore((state) => state.selectAgent)
  const wEngines = useStore((state) => state.wEngines)
  const addLoadout = useStore((state) => state.addLoadout)
  const setCurrentLoadout = useStore((state) => state.setCurrentLoadout)
  
  const allBuffs = getAllBuffsForAgent(agent, wEngines)
  const stats = calculateAgentStats(agent, wEngines, allBuffs)
  
  const currentLoadout = agent.loadouts.find((l) => l.id === agent.currentLoadoutId)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAgent(agent.id, { name: e.target.value })
  }

  const handleDelete = () => {
    deleteAgent(agent.id)
    selectAgent(null)
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
            <div className="flex-1">
              <Input
                value={agent.name}
                onChange={handleNameChange}
                className="text-xl font-bold bg-transparent border-cyan-300/20 text-cyan-300"
                placeholder="Agent Name"
              />
            </div>
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent images */}
          <div className="grid grid-cols-2 gap-4">
            {agent.iconUrl ? (
              <div className="aspect-square bg-slate-800/50 border border-cyan-300/20 rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src={agent.iconUrl}
                  alt={`${agent.name} icon`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-cyan-300/30">Icon Placeholder</span>'
                  }}
                />
              </div>
            ) : (
              <div className="aspect-square bg-slate-800/50 border border-cyan-300/20 rounded-md flex items-center justify-center">
                <span className="text-xs text-cyan-300/30">Icon Placeholder</span>
              </div>
            )}
            {agent.bodyUrl ? (
              <div className="aspect-[2/3] bg-slate-800/50 border border-cyan-300/20 rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src={agent.bodyUrl}
                  alt={`${agent.name} full body`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-cyan-300/30">Full Body Placeholder</span>'
                  }}
                />
              </div>
            ) : (
              <div className="aspect-[2/3] bg-slate-800/50 border border-cyan-300/20 rounded-md flex items-center justify-center">
                <span className="text-xs text-cyan-300/30">Full Body Placeholder</span>
              </div>
            )}
          </div>

          {/* Loadout Selector */}
          <div>
            <div className="flex items-center gap-2 mb-2">
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
        </CardContent>
      </Card>

      {/* W-Engine Section */}
      <WEngineSection agent={agent} />

      {/* Disc Drive Section */}
      {currentLoadout && (
        <Card className="bg-slate-900/50 border-cyan-300/20">
          <CardHeader>
            <CardTitle className="text-cyan-300">Disc Drive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

      {/* Buffs Section */}
      <BuffsSection agent={agent} allBuffs={allBuffs} />

      {/* Stat Weights */}
      <StatWeights />

      {/* Final Stats */}
      <FinalStats stats={stats} />
    </div>
  )
}
