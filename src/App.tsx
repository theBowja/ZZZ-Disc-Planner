import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentsTab } from "@/components/AgentsTab"
import { AreaPatrolTab } from "@/components/AreaPatrolTab"
import { ImportExportTab } from "@/components/ImportExportTab"
import { SettingsTab } from "@/components/SettingsTab"
import { useStore } from "@/lib/store"

function App() {
  const fontPreset = useStore((state) => state.fontPreset)

  const fontMap: Record<typeof fontPreset, string> = {
    inter: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    jetbrains: "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', monospace",
    space: "'Space Grotesk', 'Segoe UI', system-ui, -apple-system, sans-serif",
    system: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  }

  return (
    <div
      className="min-h-screen bg-slate-950 text-cyan-300"
      style={{ fontFamily: fontMap[fontPreset] }}
    >
      <div className="container mx-auto p-6">
        <header className="mb-8 border-b border-cyan-400/30 pb-4">
          <h1 className="text-4xl font-bold tracking-wider text-cyan-300">
            ZZZ DISC UPGRADE PLANNER
          </h1>
          <p className="mt-2 text-sm text-cyan-400/80">
            Optimize your Agent builds and track upgrade probabilities
          </p>
        </header>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="bg-slate-900/50 border border-cyan-400/30">
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-300"
            >
              Agents
            </TabsTrigger>
            <TabsTrigger 
              value="area-patrol"
              className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-300"
            >
              Area Patrol
            </TabsTrigger>
            <TabsTrigger 
              value="import-export"
              className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-300"
            >
              Import/Export
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-300"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-6">
            <AgentsTab />
          </TabsContent>

          <TabsContent value="area-patrol" className="mt-6">
            <AreaPatrolTab />
          </TabsContent>

          <TabsContent value="import-export" className="mt-6">
            <ImportExportTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
