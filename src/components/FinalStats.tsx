import { useState } from 'react'
import { type CalculatedStats } from '@/lib/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface FinalStatsProps {
  stats: CalculatedStats
}

export function FinalStats({ stats }: FinalStatsProps) {
  const [expandedStats, setExpandedStats] = useState<Set<string>>(new Set())

  const toggleStat = (statName: string) => {
    const newExpanded = new Set(expandedStats)
    if (newExpanded.has(statName)) {
      newExpanded.delete(statName)
    } else {
      newExpanded.add(statName)
    }
    setExpandedStats(newExpanded)
  }

  const statEntries = Object.entries(stats).sort(([a], [b]) => a.localeCompare(b))

  return (
    <Card className="bg-slate-900/50 border-cyan-300/20">
      <CardHeader>
        <CardTitle className="text-cyan-300">Final Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {statEntries.map(([statName, statData]) => (
            <div
              key={statName}
              className="border border-cyan-300/20 rounded-md bg-slate-800/50"
            >
              <button
                onClick={() => toggleStat(statName)}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedStats.has(statName) ? (
                    <ChevronDown className="h-4 w-4 text-cyan-300/50" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-cyan-300/50" />
                  )}
                  <span className="font-medium text-cyan-300">{statName}</span>
                </div>
                <span className="text-cyan-300/90 font-mono">
                  {statData.total.toFixed(2)}
                </span>
              </button>
              {expandedStats.has(statName) && (
                <div className="px-3 pb-3 pt-0 border-t border-cyan-300/10 mt-2">
                  <div className="text-xs text-cyan-300/50 mb-2 mt-2">Contributors:</div>
                  <div className="space-y-1">
                    {statData.contributors.map((contributor, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-cyan-300/70"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              contributor.type === 'base'
                                ? 'bg-cyan-300'
                                : contributor.type === 'w-engine'
                                  ? 'bg-blue-400'
                                  : contributor.type === 'disc-main'
                                    ? 'bg-green-400'
                                    : contributor.type === 'disc-sub'
                                      ? 'bg-purple-400'
                                      : 'bg-orange-400'
                            }`}
                          />
                          {contributor.source}
                        </span>
                        <span className="font-mono">
                          {contributor.value > 0 ? '+' : ''}
                          {contributor.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
