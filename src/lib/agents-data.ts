export interface AgentData {
  id: string
  name: string
  rank: number
  type: number
  element: number
  icon: string
  iconUrl: string
  bodyUrl: string
}

let agentsData: Record<string, AgentData> | null = null

export async function loadAgentsData(): Promise<Record<string, AgentData>> {
  if (agentsData) {
    return agentsData
  }
  
  try {
    // Get base URL from Vite (handles base path in vite.config.ts)
    const baseUrl = import.meta.env.BASE_URL || '/'
    
    // Try to load from public folder with base path
    let response = await fetch(`${baseUrl}agents-data.json`).catch(() => null)
    
    // If not found, try without base path (for development)
    if (!response || !response.ok) {
      response = await fetch('/agents-data.json').catch(() => null)
    }
    
    if (response && response.ok) {
      const data = await response.json()
      agentsData = data
      return data
    }
    
    console.warn('Agents data not found. Run `npm run fetch-agents` to download agent data.')
    agentsData = {}
    return {}
  } catch (error) {
    console.error('Failed to load agents data:', error)
    agentsData = {}
    return {}
  }
}

export function getAgentData(id: string): AgentData | null {
  if (!agentsData) return null
  return agentsData[id] || null
}

export function getAllAgentsData(): AgentData[] {
  if (!agentsData) return []
  return Object.values(agentsData)
}
