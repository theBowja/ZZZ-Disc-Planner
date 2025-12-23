import { useState } from 'react'
import { useStore, type Buff, type Loadout, type StatName } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X } from 'lucide-react'

interface BuffsSectionProps {
  loadout: Loadout
  allBuffs: Buff[]
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

export function BuffsSection({ loadout, allBuffs }: BuffsSectionProps) {
  const toggleBuff = useStore((state) => state.toggleBuff)
  const addCustomBuff = useStore((state) => state.addCustomBuff)
  const deleteCustomBuff = useStore((state) => state.deleteCustomBuff)
  const [newBuffLabel, setNewBuffLabel] = useState('')
  const [newBuffStat, setNewBuffStat] = useState<StatName>('ATK')
  const [newBuffValue, setNewBuffValue] = useState('')

  const handleToggleBuff = (buffId: string) => {
    toggleBuff(loadout.id, buffId)
  }

  const handleAddCustomBuff = () => {
    if (!newBuffLabel.trim()) return
    addCustomBuff(loadout.id, {
      label: newBuffLabel,
      stats: [{ stat: newBuffStat, value: parseFloat(newBuffValue) || 0 }],
      active: false,
    })
    setNewBuffLabel('')
    setNewBuffStat('ATK')
    setNewBuffValue('')
  }

  const handleDeleteCustomBuff = (buffId: string) => {
    deleteCustomBuff(loadout.id, buffId)
  }

  // Group buffs by source
  const buffsBySource = {
    self: allBuffs.filter((b) => b.source === 'self'),
    'w-engine': allBuffs.filter((b) => b.source === 'w-engine'),
    disc: allBuffs.filter((b) => b.source === 'disc'),
    custom: loadout.customBuffs,
  }

  return (
    <Card className="bg-slate-900/50 border-cyan-300/20">
      <CardHeader>
        <CardTitle className="text-cyan-300">Buffs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Self Buffs */}
        {buffsBySource.self.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-cyan-300 mb-2">Self Buffs</h4>
            <div className="space-y-2">
              {buffsBySource.self.map((buff) => (
                <div
                  key={buff.id}
                  className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-cyan-300/10"
                >
                  <Checkbox
                    checked={loadout.activeBuffIds.includes(buff.id)}
                    onCheckedChange={() => handleToggleBuff(buff.id)}
                  />
                  <span className="text-sm text-cyan-300/70 flex-1">{buff.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* W-Engine Buffs */}
        {buffsBySource['w-engine'].length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-cyan-300 mb-2">W-Engine Buffs</h4>
            <div className="space-y-2">
              {buffsBySource['w-engine'].map((buff) => (
                <div
                  key={buff.id}
                  className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-cyan-300/10"
                >
                  <Checkbox
                    checked={loadout.activeBuffIds.includes(buff.id)}
                    onCheckedChange={() => handleToggleBuff(buff.id)}
                  />
                  <span className="text-sm text-cyan-300/70 flex-1">{buff.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disc Buffs */}
        {buffsBySource.disc.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-cyan-300 mb-2">Disc Buffs</h4>
            <div className="space-y-2">
              {buffsBySource.disc.map((buff) => (
                <div
                  key={buff.id}
                  className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-cyan-300/10"
                >
                  <Checkbox
                    checked={loadout.activeBuffIds.includes(buff.id)}
                    onCheckedChange={() => handleToggleBuff(buff.id)}
                  />
                  <span className="text-sm text-cyan-300/70 flex-1">{buff.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Buffs */}
        <div>
          <h4 className="text-sm font-medium text-cyan-300 mb-2">Custom Buffs</h4>
          <div className="space-y-2">
            {buffsBySource.custom.map((buff) => (
              <div
                key={buff.id}
                className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-cyan-300/10"
              >
                <Checkbox
                  checked={loadout.activeBuffIds.includes(buff.id)}
                  onCheckedChange={() => handleToggleBuff(buff.id)}
                />
                <span className="text-sm text-cyan-300/70 flex-1">{buff.label}</span>
                <Button
                  onClick={() => handleDeleteCustomBuff(buff.id)}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Custom Buff */}
          <div className="mt-4 p-3 bg-slate-800/50 rounded border border-cyan-300/10 space-y-2">
            <Input
              placeholder="Buff name"
              value={newBuffLabel}
              onChange={(e) => setNewBuffLabel(e.target.value)}
              className="border-cyan-300/20 bg-slate-900/50"
            />
            <div className="flex gap-2">
              <Select
                value={newBuffStat}
                onValueChange={(value) => setNewBuffStat(value as StatName)}
              >
                <SelectTrigger className="flex-1 border-cyan-300/20 bg-slate-900/50">
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
                placeholder="Value"
                value={newBuffValue}
                onChange={(e) => setNewBuffValue(e.target.value)}
                className="w-24 border-cyan-300/20 bg-slate-900/50"
              />
              <Button
                onClick={handleAddCustomBuff}
                size="sm"
                variant="outline"
                className="border-cyan-300/20"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
