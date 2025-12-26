import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"

const FONT_OPTIONS = [
  { value: "inter", label: "Inter (Sans, Default)" },
  { value: "space", label: "Space Grotesk (Sans)" },
  { value: "jetbrains", label: "JetBrains Mono (Mono)" },
  { value: "system", label: "System UI" },
] as const

export function SettingsTab() {
  const fontPreset = useStore((state) => state.fontPreset)
  const setFontPreset = useStore((state) => state.setFontPreset)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 border-cyan-400/30">
        <CardHeader>
          <CardTitle className="text-cyan-300">Font Preset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-cyan-300/70">
            Choose a preset font for the entire planner UI.
          </p>
          <Select value={fontPreset} onValueChange={(val) => setFontPreset(val as typeof fontPreset)}>
            <SelectTrigger className="w-full border-cyan-400/30 bg-slate-800/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
