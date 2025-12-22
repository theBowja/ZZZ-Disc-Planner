export interface WEngineData {
    id: string
    name: string
    rank: number
    type: number
    iconUrl: string
}

let wEngineData: Record<string, WEngineData> | null = null

export async function loadWEnginesData(): Promise<Record<string, WEngineData>> {
  if (wEngineData) {
    return wEngineData
  }
  
  try {
    // Get base URL from Vite (handles base path in vite.config.ts)
    const baseUrl = import.meta.env.BASE_URL || '/'
    
    // Try to load from public folder with base path
    let response = await fetch(`${baseUrl}wengine-data.json`).catch(() => null)
    
    // If not found, try without base path (for development)
    if (!response || !response.ok) {
      response = await fetch('/wengine-data.json').catch(() => null)
    }
    
    if (response && response.ok) {
      const data = await response.json()
      wEngineData = data
      return data
    }
    
    console.warn('WEngine data not found. Run `npm run fetch-wengines` to download wengine data.')
    wEngineData = {}
    return {}
  } catch (error) {
    console.error('Failed to load wengines data:', error)
    wEngineData = {}
    return {}
  }
}

export function getWEngineData(id: string): WEngineData | null {
  if (!wEngineData) return null
  return wEngineData[id] || null
}

export function getAllWEnginesData(): WEngineData[] {
  if (!wEngineData) return []
  return Object.values(wEngineData)
}
