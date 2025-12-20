import { type Agent, type Loadout, type Disc, type StatName } from '@/lib/store'
import { useStore } from '@/lib/store'
import { calculateUpgradeChance } from '@/lib/stats'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'

interface DiscSlotProps {
  agent: Agent
  loadout: Loadout
  slot: 1 | 2 | 3 | 4 | 5 | 6
}

const STAT_NAMES: StatName[] = [
  'ATK',
  'DEF',
  'HP',
  'Crit Rate',
  'Crit DMG',
  'Energy Regen',
  'Impact',
  'Anomaly Proficiency',
  'Anomaly Mastery',
  'DEF PEN',
  'PEN Ratio',
]

export function DiscSlot({ agent, loadout, slot }: DiscSlotProps) {
  const setDisc = useStore((state) => state.setDisc)
  const statWeights = useStore((state) => state.statWeights)
  
  const disc = loadout.discs[slot - 1]
  const upgradeChance = disc ? calculateUpgradeChance(disc, statWeights) : 0

  const handleAddDisc = () => {
    const newDisc: Disc = {
      id: Math.random().toString(36).substring(2, 9),
      slot,
      setName: 'Placeholder Set',
      mainStat: { stat: 'ATK', value: 0 },
      substats: [],
      upgradeChance: 0.1, // placeholder
    }
    setDisc(agent.id, loadout.id, slot, newDisc)
  }

  const handleRemoveDisc = () => {
    setDisc(agent.id, loadout.id, slot, null)
  }

  const handleMainStatChange = (stat: StatName) => {
    if (!disc) return
    setDisc(agent.id, loadout.id, slot, {
      ...disc,
      mainStat: { ...disc.mainStat, stat },
    })
  }

  const handleMainStatValueChange = (value: string) => {
    if (!disc) return
    setDisc(agent.id, loadout.id, slot, {
      ...disc,
      mainStat: { ...disc.mainStat, value: parseFloat(value) || 0 },
    })
  }

  const handleUpgradeChanceChange = (value: string) => {
    if (!disc) return
    setDisc(agent.id, loadout.id, slot, {
      ...disc,
      upgradeChance: parseFloat(value) || 0,
    })
  }

  return (
    <Card className="bg-slate-800/50 border-cyan-300/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-cyan-300">Slot {slot}</span>
          {disc && (
            <Button
              onClick={handleRemoveDisc}
              size="icon"
              variant="ghost"
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {disc ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs text-cyan-300/50 mb-1">Set</div>
              <div className="text-xs text-cyan-300/70">{disc.setName}</div>
            </div>

            <div>
              <div className="text-xs text-cyan-300/50 mb-1">Main Stat</div>
              <div className="flex gap-1">
                <Select
                  value={disc.mainStat.stat}
                  onValueChange={(value) => handleMainStatChange(value as StatName)}
                >
                  <SelectTrigger className="h-7 text-xs border-cyan-300/20 bg-slate-900/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAT_NAMES.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        {stat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={disc.mainStat.value}
                  onChange={(e) => handleMainStatValueChange(e.target.value)}
                  className="h-7 text-xs w-20 border-cyan-300/20 bg-slate-900/50"
                />
              </div>
            </div>

            <div>
              <div className="text-xs text-cyan-300/50 mb-1">Substats</div>
              <div className="text-xs text-cyan-300/70">
                {disc.substats.length > 0
                  ? disc.substats.map((s, i) => (
                      <div key={i}>
                        {s.stat}: {s.value}
                      </div>
                    ))
                  : 'None (placeholder)'}
              </div>
            </div>

            <div>
              <div className="text-xs text-cyan-300/50 mb-1">Upgrade Chance</div>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={disc.upgradeChance}
                onChange={(e) => handleUpgradeChanceChange(e.target.value)}
                className="h-7 text-xs border-cyan-300/20 bg-slate-900/50"
              />
              <div className="text-xs text-cyan-300/50 mt-1">
                {(upgradeChance * 100).toFixed(1)}% per run
              </div>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleAddDisc}
            variant="outline"
            className="w-full border-cyan-300/20 hover:bg-cyan-300/10"
            size="sm"
          >
            Add Disc
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
