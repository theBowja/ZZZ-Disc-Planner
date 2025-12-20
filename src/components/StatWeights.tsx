import { useStore, type StatName } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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

export function StatWeights() {
  const statWeights = useStore((state) => state.statWeights)
  const setStatWeight = useStore((state) => state.setStatWeight)

  const handleWeightChange = (stat: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setStatWeight(stat, numValue)
  }

  return (
    <Card className="bg-slate-900/50 border-cyan-300/20">
      <CardHeader>
        <CardTitle className="text-cyan-300">Stat Weights</CardTitle>
        <p className="text-xs text-cyan-300/50 mt-1">
          Set weights for probability calculations
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {STAT_NAMES.map((stat) => (
            <div key={stat} className="space-y-1">
              <label className="text-xs text-cyan-300/70">{stat}</label>
              <Input
                type="number"
                value={statWeights[stat] || 0}
                onChange={(e) => handleWeightChange(stat, e.target.value)}
                className="border-cyan-300/20 bg-slate-800/50"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
