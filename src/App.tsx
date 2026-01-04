import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentsTab } from "@/components/AgentsTab"
import { AreaPatrolTab } from "@/components/AreaPatrolTab"
import { ImportExportTab } from "@/components/ImportExportTab"
import { SettingsTab } from "@/components/SettingsTab"
import { useStore } from "@/lib/store"
import { 
  Users, 
  Map, 
  Database, 
  Settings,
  ShieldCheck
} from "lucide-react"

function App() {
  const fontPreset = useStore((state) => state.fontPreset)

  const fontMap: Record<typeof fontPreset, string> = {
    inter: "'Inter', sans-serif",
    jetbrains: "'JetBrains Mono', monospace",
    space: "'Space Grotesk', sans-serif",
    system: "system-ui, sans-serif",
  }

  return (
    <div
      className="h-screen flex bg-slate-950 text-slate-200 overflow-hidden"
      style={{ fontFamily: fontMap[fontPreset] }}
    >
      <Tabs defaultValue="agents" className="flex flex-row w-full h-full gap-0">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 flex-shrink-0 border-r border-cyan-500/10 bg-slate-900/40 flex flex-col">
          {/* Logo Area */}
          <div className="p-6 border-b border-cyan-500/10">
            <div className="flex items-center gap-3 text-cyan-400">
              <ShieldCheck className="w-8 h-8" />
              <h1 className="text-xl font-bold tracking-tighter leading-tight">
                ZZZ DISC<br/><span className="text-cyan-100">PLANNER</span>
              </h1>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">
              Management
            </p>
            <TabsList className="flex flex-col w-full h-auto bg-transparent gap-1 p-0">
              <NavTrigger value="agents" icon={<Users className="w-4 h-4" />} label="Agents" />
              <NavTrigger value="area-patrol" icon={<Map className="w-4 h-4" />} label="Area Patrol" />
              <NavTrigger value="import-export" icon={<Database className="w-4 h-4" />} label="Data Transfer" />
              <NavTrigger value="settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
            </TabsList>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 mt-auto border-t border-cyan-500/10">
            <div className="bg-cyan-500/5 rounded-lg p-3 border border-cyan-500/10">
              <p className="text-xs text-cyan-400/70 font-medium">System Status</p>
              <p className="text-[10px] text-slate-400">Optimization Engine Active</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">

          {/* Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto h-full">
              <TabsContent value="agents" className="m-0 focus-visible:outline-none">
                <ContentHeader title="Agent Database" description="Manage your proxy builds and disc sets." />
                <AgentsTab />
              </TabsContent>

              <TabsContent value="area-patrol" className="m-0">
                <ContentHeader title="Area Patrol" description="Track resources and farm efficiency." />
                <AreaPatrolTab />
              </TabsContent>

              <TabsContent value="import-export" className="m-0">
                <ContentHeader title="Data Transfer" description="Sync your progress across devices." />
                <ImportExportTab />
              </TabsContent>

              <TabsContent value="settings" className="m-0">
                <ContentHeader title="System Settings" description="Configure UI preferences and API keys." />
                <SettingsTab />
              </TabsContent>
            </div>
          </div>
        </main>
      </Tabs>
    </div>
  )
}

/** * UI SUB-COMPONENTS 
 */

function NavTrigger({ value, icon, label }: { value: string, icon: React.ReactNode, label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-md transition-all
        text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-500/10 
        hover:bg-slate-800 hover:text-slate-200"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </TabsTrigger>
  )
}

function ContentHeader({ title, description }: { title: string, description: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
      <p className="text-slate-400 mt-1">{description}</p>
    </div>
  )
}

export default App