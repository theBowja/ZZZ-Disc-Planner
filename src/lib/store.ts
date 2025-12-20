import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StatName = 
  | 'ATK' 
  | 'DEF' 
  | 'HP' 
  | 'Crit Rate' 
  | 'Crit DMG' 
  | 'Energy Regen' 
  | 'Impact' 
  | 'Anomaly Proficiency' 
  | 'Anomaly Mastery' 
  | 'DEF PEN' 
  | 'PEN Ratio'

export type BuffSource = 'self' | 'w-engine' | 'disc' | 'custom'

export interface StatValue {
  stat: StatName
  value: number
}

export interface Buff {
  id: string
  label: string
  source: BuffSource
  stats: StatValue[]
  active: boolean
}

export interface Disc {
  id: string
  slot: 1 | 2 | 3 | 4 | 5 | 6
  setName: string // placeholder
  mainStat: StatValue
  substats: StatValue[]
  upgradeChance: number // placeholder probability (0-1)
}

export interface Loadout {
  id: string
  name: string
  discs: (Disc | null)[] // 6 slots
}

export interface WEngine {
  id: string
  name: string
  iconUrl: string // placeholder
  stats: StatValue[] // placeholder
  buffs: Buff[] // buffs from this w-engine
}

export interface Agent {
  id: string
  name: string
  iconUrl: string // placeholder
  bodyUrl: string // placeholder
  baseStats: StatValue[] // placeholder
  equippedWEngineId: string | null
  currentLoadoutId: string | null
  loadouts: Loadout[]
  activeBuffIds: string[] // buff IDs that are active
  customBuffs: Buff[] // custom buffs added by user
}

export interface Area {
  id: string
  name: string
  discSet1: string // placeholder set name
  discSet2: string // placeholder set name
}

export interface StatWeights {
  [key: string]: number // stat name -> weight
}

interface AppState {
  fontPreset: 'inter' | 'jetbrains' | 'space' | 'system'
  agents: Agent[]
  wEngines: WEngine[]
  areas: Area[]
  statWeights: StatWeights
  selectedAgentId: string | null
  
  // Agent actions
  addAgent: (agent: Omit<Agent, 'id'>) => string
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  selectAgent: (id: string | null) => void
  
  // W-Engine actions
  addWEngine: (wEngine: Omit<WEngine, 'id'>) => string
  updateWEngine: (id: string, updates: Partial<WEngine>) => void
  deleteWEngine: (id: string) => void
  
  // Loadout actions
  addLoadout: (agentId: string, loadout: Omit<Loadout, 'id'>) => string
  updateLoadout: (agentId: string, loadoutId: string, updates: Partial<Loadout>) => void
  deleteLoadout: (agentId: string, loadoutId: string) => void
  setCurrentLoadout: (agentId: string, loadoutId: string) => void
  
  // Disc actions
  setDisc: (agentId: string, loadoutId: string, slot: number, disc: Disc | null) => void
  
  // Buff actions
  toggleBuff: (agentId: string, buffId: string) => void
  addCustomBuff: (agentId: string, buff: Omit<Buff, 'id' | 'source'>) => string
  updateCustomBuff: (agentId: string, buffId: string, updates: Partial<Buff>) => void
  deleteCustomBuff: (agentId: string, buffId: string) => void
  
  // Settings
  setFontPreset: (preset: AppState['fontPreset']) => void

  // Stat weights
  setStatWeight: (stat: string, weight: number) => void
  
  // Area actions
  addArea: (area: Omit<Area, 'id'>) => string
  updateArea: (id: string, updates: Partial<Area>) => void
  
  // Import/Export
  importState: (state: Partial<AppState>) => void
  exportState: () => AppState
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      fontPreset: 'inter',
      agents: [],
      wEngines: [],
      areas: [],
      statWeights: {},
      selectedAgentId: null,

      addAgent: (agent) => {
        const id = generateId()
        const newAgent: Agent = {
          id,
          ...agent,
          loadouts: agent.loadouts.length > 0 
            ? agent.loadouts 
            : [{ id: generateId(), name: 'Default', discs: [null, null, null, null, null, null] }],
          currentLoadoutId: agent.currentLoadoutId || agent.loadouts[0]?.id || null,
        }
        set((state) => ({ agents: [...state.agents, newAgent] }))
        return id
      },

      updateAgent: (id, updates) => {
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }))
      },

      deleteAgent: (id) => {
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
          selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
        }))
      },

      selectAgent: (id) => {
        set({ selectedAgentId: id })
      },

      addWEngine: (wEngine) => {
        const id = generateId()
        const newWEngine: WEngine = { id, ...wEngine }
        set((state) => ({ wEngines: [...state.wEngines, newWEngine] }))
        return id
      },

      updateWEngine: (id, updates) => {
        set((state) => ({
          wEngines: state.wEngines.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }))
      },

      deleteWEngine: (id) => {
        set((state) => ({
          wEngines: state.wEngines.filter((w) => w.id !== id),
          agents: state.agents.map((a) => 
            a.equippedWEngineId === id ? { ...a, equippedWEngineId: null } : a
          ),
        }))
      },

      addLoadout: (agentId, loadout) => {
        const id = generateId()
        const newLoadout: Loadout = { id, ...loadout }
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, loadouts: [...a.loadouts, newLoadout] } : a
          ),
        }))
        return id
      },

      updateLoadout: (agentId, loadoutId, updates) => {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId
              ? {
                  ...a,
                  loadouts: a.loadouts.map((l) =>
                    l.id === loadoutId ? { ...l, ...updates } : l
                  ),
                }
              : a
          ),
        }))
      },

      deleteLoadout: (agentId, loadoutId) => {
        set((state) => ({
          agents: state.agents.map((a) => {
            if (a.id !== agentId) return a
            const filtered = a.loadouts.filter((l) => l.id !== loadoutId)
            return {
              ...a,
              loadouts: filtered,
              currentLoadoutId:
                a.currentLoadoutId === loadoutId
                  ? filtered[0]?.id || null
                  : a.currentLoadoutId,
            }
          }),
        }))
      },

      setCurrentLoadout: (agentId, loadoutId) => {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, currentLoadoutId: loadoutId } : a
          ),
        }))
      },

      setDisc: (agentId, loadoutId, slot, disc) => {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId
              ? {
                  ...a,
                  loadouts: a.loadouts.map((l) =>
                    l.id === loadoutId
                      ? {
                          ...l,
                          discs: l.discs.map((d, i) => (i === slot - 1 ? disc : d)),
                        }
                      : l
                  ),
                }
              : a
          ),
        }))
      },

      toggleBuff: (agentId, buffId) => {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId
              ? {
                  ...a,
                  activeBuffIds: a.activeBuffIds.includes(buffId)
                    ? a.activeBuffIds.filter((id) => id !== buffId)
                    : [...a.activeBuffIds, buffId],
                }
              : a
          ),
        }))
      },

      addCustomBuff: (agentId, buff) => {
        const id = generateId()
        const newBuff: Buff = { id, ...buff, source: 'custom', active: false }
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, customBuffs: [...a.customBuffs, newBuff] } : a
          ),
        }))
        return id
      },

      updateCustomBuff: (agentId, buffId, updates) => {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId
              ? {
                  ...a,
                  customBuffs: a.customBuffs.map((b) =>
                    b.id === buffId ? { ...b, ...updates } : b
                  ),
                }
              : a
          ),
        }))
      },

      deleteCustomBuff: (agentId, buffId) => {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId
              ? {
                  ...a,
                  customBuffs: a.customBuffs.filter((b) => b.id !== buffId),
                  activeBuffIds: a.activeBuffIds.filter((id) => id !== buffId),
                }
              : a
          ),
        }))
      },

      setFontPreset: (preset) => {
        set({ fontPreset: preset })
      },

      setStatWeight: (stat, weight) => {
        set((state) => ({
          statWeights: { ...state.statWeights, [stat]: weight },
        }))
      },

      addArea: (area) => {
        const id = generateId()
        const newArea: Area = { id, ...area }
        set((state) => ({ areas: [...state.areas, newArea] }))
        return id
      },

      updateArea: (id, updates) => {
        set((state) => ({
          areas: state.areas.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }))
      },

      importState: (importedState) => {
        set((state) => ({ ...state, ...importedState }))
      },

      exportState: () => {
        return get()
      },
    }),
    {
      name: 'zzz-disc-planner-storage',
    }
  )
)
