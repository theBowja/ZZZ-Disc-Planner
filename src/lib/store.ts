import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAgentData } from './agents-data'
import { loadAgentsData, type AgentData } from './agents-data'
import { loadWEnginesData, type WEngineData } from './wengines-data'

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
  loadoutName: string
  tracking: boolean
  wEngine: WEngine | null
  discs: (Disc | null)[] // 6 slots
  activeBuffIds: string[] // buff IDs that are active
  customBuffs: Buff[] // custom buffs added by user
}

export interface WEngine {
  id: string
  overclock: 1 | 2 | 3 | 4 | 5
}

export interface Agent {
  id: string
  tracking: boolean
  currentLoadoutId: string
  loadouts: Loadout[]
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
  // Static game data (Not persisted)
  db: {
    agents: Record<string, AgentData> | null;
    wengines: Record<string, WEngineData> | null;
  };
  loadingStates: Record<string, boolean>;

  // Persisted
  fontPreset: 'inter' | 'jetbrains' | 'space' | 'system'
  agents: Agent[]
  areas: Area[]
  statWeights: StatWeights
  selectedAgentId: string | null

  // Actions
  fetchDb: (key: keyof AppState['db']) => Promise<void>;
  
  // Agent actions
  addAgent: (dataId: string) => string
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  selectAgent: (id: string | null) => void
  
  // W-Engine actions
  updateWEngine: (id: string, updates: WEngine) => void
  deleteWEngine: (id: string) => void
  
  // Loadout actions
  duplicateLoadout: (agentId: string, loadoutId: string) => string
  // addLoadout: (agentId: string, loadout: Omit<Loadout, 'id'>) => string
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

/**
 * Generates a unique ID for a new entity.
 * @returns A unique ID
 */
const generateUniqueId = () => crypto.randomUUID();

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      db: { agents: null, wengines: null },
      loadingStates: {},

      fontPreset: 'inter',
      agents: [],
      areas: [],
      statWeights: {},
      selectedAgentId: null,

      // #region Database

      fetchDb: async (key) => {
        const { db, loadingStates } = get();
        if (db[key] || loadingStates[key]) return;

        set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: true }
        }));

        try {
          console.log(`Testing: Delaying ${key} for 3 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const loaders: Record<keyof AppState['db'], () => Promise<any>> = {
            agents: loadAgentsData,
            wengines: loadWEnginesData,
          };

          const data = await loaders[key]();

          set((state) => ({
            db: { ...state.db, [key]: data },
            loadingStates: { ...state.loadingStates, [key]: false }
          }));
        } catch (error) {
          set((state) => ({
            loadingStates: { ...state.loadingStates, [key]: false }
          }));
        }
      },

      // #endregion

      // #region Agent

      addAgent: (dataId) => {
        const agent = getAgentData(dataId)
        if (!agent) throw new Error(`Agent with ID ${dataId} not found.`)

        const newAgent: Agent = {
          id: agent.id,
          tracking: true,
          currentLoadoutId: 'default',
          loadouts: [
            {
              id: 'default',
              loadoutName: 'Default Loadout',
              tracking: true,
              wEngine: null,
              discs: [null, null, null, null, null, null],
              activeBuffIds: [],
              customBuffs: [],
            }
          ]
        }

        set((state) => ({ agents: [...state.agents, newAgent] }))
        return dataId
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

      // #endregion

      // #region WEngine

      updateWEngine: (agentId, wEngine) => {
        // set((state) => ({ TODO
        //   agent
        //   wEngines: state.wEngines.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        // }))
      },

      deleteWEngine: (agentId) => {
        // set((state) => ({ TODO
        //   agents: state.agents.map((a) => 
        //     a.equippedWEngineId === id ? { ...a, equippedWEngineId: null } : a
        //   ),
        // }))
      },

      // #endregion

      // #region Loadout

      duplicateLoadout: (agentId, loadoutId) => {
        const agent = get().agents.find((a) => a.id === agentId)
        if (!agent) throw new Error(`Agent with ID ${agentId} not found.`)
        const loadout = agent.loadouts.find((l) => l.id === loadoutId)
        if (!loadout) throw new Error(`Loadout with ID ${loadoutId} not found.`)
        if (agent.loadouts.length >= 5) throw new Error('Cannot have more than 5 loadouts.')

        const id = generateUniqueId()
        const newLoadout: Loadout = structuredClone(loadout)
        newLoadout.id = id
        newLoadout.loadoutName = `Loadout ${agent.loadouts.length + 1}`

        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, loadouts: [...a.loadouts, newLoadout] } : a
          ),
        }))
        return id
      },

      // addLoadout: (agentId, loadout) => {
      //   const id = generateId()
      //   const newLoadout: Loadout = { id, ...loadout }
      //   set((state) => ({
      //     agents: state.agents.map((a) =>
      //       a.id === agentId ? { ...a, loadouts: [...a.loadouts, newLoadout] } : a
      //     ),
      //   }))
      //   return id
      // },

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
                  ? filtered[0]?.id
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

      // #endregion

      setDisc: (agentId, loadoutId, slot, disc) => {
        // set((state) => ({
        //   agents: state.agents.map((a) =>
        //     a.id === agentId
        //       ? {
        //           ...a,
        //           loadouts: a.loadouts.map((l) =>
        //             l.id === loadoutId
        //               ? {
        //                   ...l,
        //                   discs: l.discs.map((d, i) => (i === slot - 1 ? disc : d)),
        //                 }
        //               : l
        //           ),
        //         }
        //       : a
        //   ),
        // }))
      },

      toggleBuff: (agentId, buffId) => {
        // set((state) => ({
        //   agents: state.agents.map((a) =>
        //     a.id === agentId
        //       ? {
        //           ...a,
        //           activeBuffIds: a.activeBuffIds.includes(buffId)
        //             ? a.activeBuffIds.filter((id) => id !== buffId)
        //             : [...a.activeBuffIds, buffId],
        //         }
        //       : a
        //   ),
        // }))
      },

      addCustomBuff: (agentId, buff) => {
        // const id = generateUniqueId()
        // const newBuff: Buff = { id, ...buff, source: 'custom', active: false }
        // set((state) => ({
        //   agents: state.agents.map((a) =>
        //     a.id === agentId ? { ...a, customBuffs: [...a.customBuffs, newBuff] } : a
        //   ),
        // }))
        // return id
      },

      updateCustomBuff: (agentId, buffId, updates) => {
        // set((state) => ({
        //   agents: state.agents.map((a) =>
        //     a.id === agentId
        //       ? {
        //           ...a,
        //           customBuffs: a.customBuffs.map((b) =>
        //             b.id === buffId ? { ...b, ...updates } : b
        //           ),
        //         }
        //       : a
        //   ),
        // }))
      },

      deleteCustomBuff: (agentId, buffId) => {
        // set((state) => ({
        //   agents: state.agents.map((a) =>
        //     a.id === agentId
        //       ? {
        //           ...a,
        //           customBuffs: a.customBuffs.filter((b) => b.id !== buffId),
        //           activeBuffIds: a.activeBuffIds.filter((id) => id !== buffId),
        //         }
        //       : a
        //   ),
        // }))
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
        const id = generateUniqueId()
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
      partialize: (state) => ({ 
        fontPreset: state.fontPreset,
        agents: state.agents,
        areas: state.areas,
        selectedAgentId: state.selectedAgentId,
        statWeights: state.statWeights,
      })
    }
  )
)
