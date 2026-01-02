import { type WEngine } from '@/lib/store'
// import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddWEngineDialog } from './AddWEngineDialog'
import { useMemo, useState } from 'react'
import { useDb } from '@/hooks/useDb'
import { type WEngineData } from '@/lib/wengines-data'
import { resolveAssetPath } from '@/lib/utils'
import { calculateWeaponMaxBaseStat, calculateWeaponMaxSecondaryStat } from '@/lib/stats'
import useApi from '@/hooks/useApi'
import ColoredText from './ui/ColoredText'

interface WEngineSectionProps {
  agentId: string
  loadoutId: string
  wEngine: WEngine | null
}

export function WEngineSection({ agentId, loadoutId, wEngine }: WEngineSectionProps) {
  // Database Hooks
  const { data: wEnginesData } = useDb<WEngineData>('wengines', wEngine !== null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { data: apiData, isLoading: isApiLoading } = useApi('weapon', wEngine?.id)

  // Retrieve current W-Engine details from fetched data list
  const details = useMemo(() => {
    if (!wEnginesData || !wEngine) return null
    return wEnginesData[wEngine.id]
  }, [wEnginesData, wEngine])

  const talent =
    apiData && wEngine?.overclock ? apiData.Talents[wEngine.overclock] : null

  return (
    <Card className="bg-slate-900/50 border-cyan-300/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-300">W-Engine</CardTitle>
          <h3 className="text-lg font-bold text-cyan-100">{details?.name || ''}</h3>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            variant="outline"
            className="border-cyan-300/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            {wEngine ? 'Change W-Engine' : 'Set W-Engine'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {wEngine ? (
          <div className="flex flex-col sm:flex-row gap-6">
            {/* LEFT: W-Engine Image */}
            <div className="w-full sm:w-32 h-32 bg-slate-800/50 border border-cyan-300/10 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              {details ? (
                <img
                  src={resolveAssetPath(details.iconUrl)}
                  alt={details.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-slate-700/50" />
              )}
            </div>

            {/* RIGHT: Details, Description, and Stats */}
            <div className="flex-1 min-w-0">
              {/* <h3 className="text-lg font-bold text-cyan-100 truncate">
                {details?.name || 'Loading...'}
              </h3> */}

              {/* Stats Section */}
              <div className="pb-2 border-b border-cyan-300/10">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-cyan-300/40 font-bold">Base ATK (Lv. 60)</span>
                    <p className="text-sm font-mono text-cyan-100">{apiData && calculateWeaponMaxBaseStat(apiData.BaseProperty.Value)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-cyan-300/40 font-bold">Advanced Stat</span>
                    <p className="text-sm font-mono text-cyan-100">{apiData && apiData.RandProperty.Name} {apiData && calculateWeaponMaxSecondaryStat(apiData.RandProperty.Value)/100}%</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-cyan-300/40 font-bold">Overclock</span>
                    <p className="text-sm font-mono text-cyan-100">1</p>
                  </div>
                </div>
              </div>


              <div className="text-sm text-cyan-300/70 leading-relaxed mt-1">
                {isApiLoading || !talent ? (
                  'Loading description...'
                ) : (
                  <p>
                    <span className="font-bold text-cyan-100/90">{talent.Name}: </span>
                    <ColoredText text={talent.Desc} />
                  </p>
                )}
              </div>


            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-cyan-300/5 rounded-lg">
            <p className="text-cyan-300/30 text-sm">No W-Engine equipped to this loadout.</p>
          </div>
        )}
      </CardContent>

      {showAddDialog && (
        <AddWEngineDialog agentId={agentId} loadoutId={loadoutId} onClose={() => setShowAddDialog(false)} />
      )}
    </Card>
  )
}

