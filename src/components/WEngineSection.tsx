import { type Agent } from '@/lib/store'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddWEngineDialog } from './AddWEngineDialog'
import { useState } from 'react'

interface WEngineSectionProps {
  agentId: string | null
  loadoutId: string | null
}

export function WEngineSection({ agentId, loadoutId }: WEngineSectionProps) {
  const wEngines = useStore((state) => state.wEngines)
  const updateAgent = useStore((state) => state.updateAgent)
  // const addWEngine = useStore((state) => state.addWEngine)
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  const equippedWEngine = wEngines.find((w) => w.id === agent.equippedWEngineId)

  const handleWEngineChange = (wEngineId: string) => {
    updateAgent(agent.id, { equippedWEngineId: wEngineId === 'none' ? null : wEngineId })
  }

  // const handleAddWEngine = () => {
  //   const id = addWEngine({
  //     name: 'New W-Engine',
  //     iconUrl: '',
  //     stats: [],
  //     buffs: [],
  //   })
  //   updateAgent(agent.id, { equippedWEngineId: id })
  // }

  return (
    <Card className="bg-slate-900/50 border-cyan-300/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-300">W-Engine</CardTitle>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            variant="outline"
            className="border-cyan-300/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            {equippedWEngine ? 'Change W-Engine' : 'Add W-Engine'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* W-Engine Selector */}
        {/* <Select
          value={agent.equippedWEngineId || 'none'}
          onValueChange={handleWEngineChange}
        >
          <SelectTrigger className="w-full border-cyan-300/20 bg-slate-800/50">
            <SelectValue placeholder="Select W-Engine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {wEngines.map((wEngine) => (
              <SelectItem key={wEngine.id} value={wEngine.id}>
                {wEngine.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        {equippedWEngine && (
          <div className="space-y-4">
            {/* Placeholder for W-Engine image */}
            <div className="aspect-video bg-slate-800/50 border border-cyan-300/20 rounded-md flex items-center justify-center">
              <span className="text-xs text-cyan-300/30">W-Engine Image Placeholder</span>
            </div>

            {/* Placeholder for W-Engine stats */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-cyan-300">Stats (Placeholder)</h4>
              <div className="text-xs text-cyan-300/50">
                Stats will be displayed here once implemented
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <AddWEngineDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </Card>
  )
}
