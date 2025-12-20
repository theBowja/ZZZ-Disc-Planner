import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ImportExportTab() {
  const exportState = useStore((state) => state.exportState)
  const importState = useStore((state) => state.importState)
  const [importText, setImportText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleExport = () => {
    const state = exportState()
    const json = JSON.stringify(state, null, 2)
    setImportText(json)
    
    // Also copy to clipboard
    navigator.clipboard.writeText(json).then(() => {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    })
  }

  const handleImport = () => {
    setError(null)
    setSuccess(false)
    
    try {
      const parsed = JSON.parse(importText)
      
      // Basic validation
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid JSON structure')
      }
      
      importState(parsed)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON')
    }
  }

  const handleClear = () => {
    setImportText('')
    setError(null)
    setSuccess(false)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-cyan-300/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">Export Data</CardTitle>
          <p className="text-sm text-cyan-300/50 mt-1">
            Export your current state to JSON. Data is automatically saved to localStorage.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-cyan-300/20"
          >
            Export to JSON
          </Button>
          {success && (
            <p className="text-sm text-green-400 mt-2">
              ✓ Exported and copied to clipboard!
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-cyan-300/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">Import Data</CardTitle>
          <p className="text-sm text-cyan-300/50 mt-1">
            Import state from JSON. This will overwrite your current data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value)
              setError(null)
            }}
            placeholder="Paste JSON data here..."
            className="min-h-[300px] font-mono text-xs border-cyan-300/20 bg-slate-800/50 text-cyan-300"
          />
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-400/50 rounded text-sm text-red-400">
              Error: {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-900/20 border border-green-400/50 rounded text-sm text-green-400">
              ✓ Import successful!
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              variant="outline"
              className="border-cyan-300/20"
              disabled={!importText.trim()}
            >
              Import JSON
            </Button>
            <Button
              onClick={handleClear}
              variant="ghost"
              className="text-cyan-300/70"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
