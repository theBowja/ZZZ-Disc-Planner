import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
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
  updateWEngine: (agentId: string, loadoutId: string, wEngine: WEngine | null) => void
  deleteWEngine: (agentId: string, loadoutId: string) => void
  
  // Loadout actions
  duplicateLoadout: (agentId: string, loadoutId: string) => string
  // addLoadout: (agentId: string, loadout: Omit<Loadout, 'id'>) => string
  updateLoadout: (agentId: string, loadoutId: string, updates: Partial<Loadout>) => void
  deleteLoadout: (agentId: string, loadoutId: string) => void
  setCurrentLoadout: (agentId: string, loadoutId: string) => void
  
  // Disc actions
  setDisc: (agentId: string, loadoutId: string, slot: number, disc: Disc | null) => void
  
  // Buff actions
  toggleBuff: (agentId: string, loadoutId: string, buffId: string) => void
  addCustomBuff: (agentId: string, loadoutId: string, buff: Omit<Buff, 'id' | 'source'>) => string
  // updateCustomBuff: (agentId: string, loadoutId: string, buffId: string, updates: Partial<Buff>) => void
  deleteCustomBuff: (agentId: string, loadoutId: string, buffId: string) => void
  
  // Settings
  setFontPreset: (preset: AppState['fontPreset']) => void

  // Stat weights
  setStatWeight: (stat: string, weight: number) => void
  
  // Area actions
  addArea: (area: Omit<Area, 'id'>) => string
  // updateArea: (id: string, updates: Partial<Area>) => void
  
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
    immer((set, get) => ({
      db: { agents: null, wengines: null },
      loadingStates: {},
      fontPreset: 'inter',
      agents: [],
      areas: [],
      statWeights: {},
      selectedAgentId: null,

      // #region Database

      fetchDb: async (key) => {
        if (get().db[key] || get().loadingStates[key]) return;

        set((state) => {
          state.loadingStates[key] = true;
        });

        try {
          console.log(`Testing: Delaying ${key} for 2 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const loaders: Record<keyof AppState['db'], () => Promise<any>> = {
            agents: loadAgentsData,
            wengines: loadWEnginesData,
          };

          const data = await loaders[key]();

          set((state) => {
            state.db[key] = data;
            state.loadingStates[key] = false;
          });
        } catch (error) {
          set((state) => {
            state.loadingStates[key] = false;
          });
        }
      },

      // #endregion

      // #region Agent

      addAgent: (dataId) => {
        const agentData = getAgentData(dataId);
        if (!agentData) throw new Error(`Agent with ID ${dataId} not found.`);

        const newAgent: Agent = {
          id: agentData.id,
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
        };

        set((state) => {
          state.agents.push(newAgent);
        });
        return dataId;
      },

      updateAgent: (id, updates) => {
        set((state) => {
          const agent = state.agents.find(a => a.id === id);
          if (agent) Object.assign(agent, updates);
        });
      },

      deleteAgent: (id) => {
        set((state) => {
          state.agents = state.agents.filter((a) => a.id !== id);
          if (state.selectedAgentId === id) state.selectedAgentId = null;
        });
      },

      selectAgent: (id) => set({ selectedAgentId: id }),
      // #endregion

      // #region WEngine

      updateWEngine: (agentId, loadoutId, wEngine) => {
        set((state) => {
          const agent = state.agents.find(a => a.id === agentId);
          const loadout = agent?.loadouts.find(l => l.id === loadoutId);
          if (loadout) loadout.wEngine = wEngine;
          else throw new Error(`Could not find loadout with ID ${loadoutId} for agent with ID ${agentId}.`);
        });
      },

      deleteWEngine: (agentId, loadoutId) => {
        set((state) => {
          const agent = state.agents.find(a => a.id === agentId);
          const loadout = agent?.loadouts.find(l => l.id === loadoutId);
          if (loadout) loadout.wEngine = null;
        });
      },

      // #endregion

      // #region Loadout

      duplicateLoadout: (agentId, loadoutId) => {
        const agent = get().agents.find((a) => a.id === agentId);
        if (!agent) throw new Error(`Agent with ID ${agentId} not found.`);
        const loadout = agent.loadouts.find((l) => l.id === loadoutId);
        if (!loadout) throw new Error(`Loadout with ID ${loadoutId} not found.`);
        if (agent.loadouts.length >= 5) throw new Error('Max 5 loadouts reached.');

        const newId = generateUniqueId();
        const clonedLoadout = structuredClone(loadout);
        clonedLoadout.id = newId;
        clonedLoadout.loadoutName = `Loadout ${agent.loadouts.length + 1}`;

        set((state) => {
          const targetAgent = state.agents.find(a => a.id === agentId);
          targetAgent?.loadouts.push(clonedLoadout);
        });
        return newId;
      },

      updateLoadout: (agentId, loadoutId, updates) => {
        set((state) => {
          const agent = state.agents.find(a => a.id === agentId);
          const loadout = agent?.loadouts.find(l => l.id === loadoutId);
          if (loadout) Object.assign(loadout, updates);
        });
      },

      deleteLoadout: (agentId, loadoutId) => {
        set((state) => {
          const agent = state.agents.find(a => a.id === agentId);
          if (!agent) return;
          
          agent.loadouts = agent.loadouts.filter(l => l.id !== loadoutId);
          if (agent.currentLoadoutId === loadoutId) {
            agent.currentLoadoutId = agent.loadouts[0]?.id || '';
          }
        });
      },

      setCurrentLoadout: (agentId, loadoutId) => {
        set((state) => {
          const agent = state.agents.find(a => a.id === agentId);
          if (agent) agent.currentLoadoutId = loadoutId;
        });
      },

      // #endregion

      // #region Disc & Buffs

      setDisc: (agentId, loadoutId, slot, disc) => {
        set((state) => {
          const agent = state.agents.find(a => a.id === agentId);
          const loadout = agent?.loadouts.find(l => l.id === loadoutId);
          if (loadout) {
            // slot is 1-indexed based on your type, array is 0-indexed
            loadout.discs[slot - 1] = disc;
          }
        });
      },

      toggleBuff: (agentId, loadoutId, buffId) => {
        set((state) => {
          const agent = state.agents.find(a => a.id === agentId);
          const loadout = agent?.loadouts.find(l => l.id === loadoutId);
          if (!loadout) return;

          const index = loadout.activeBuffIds.indexOf(buffId);
          if (index > -1) {
            loadout.activeBuffIds.splice(index, 1);
          } else {
            loadout.activeBuffIds.push(buffId);
          }
        });
      },

      addCustomBuff: (agentId, loadoutId, buff) => {
        const id = generateUniqueId();
        set((state) => {
          const agent = state.agents.find(a => a.id === agentId);
          const loadout = agent?.loadouts.find(l => l.id === loadoutId);
          if (loadout) {
            loadout.customBuffs.push({ ...buff, id, source: 'custom', active: false });
          }
        });
        return id;
      },

      deleteCustomBuff: (agentId, loadoutId, buffId) => {
        set((state) => {
          const agent = state.agents.find(a => a.id === agentId);
          const loadout = agent?.loadouts.find(l => l.id === loadoutId);
          if (loadout) {
            loadout.customBuffs = loadout.customBuffs.filter(b => b.id !== buffId);
            loadout.activeBuffIds = loadout.activeBuffIds.filter(id => id !== buffId);
          }
        });
      },

      // #endregion

      setFontPreset: (preset) => set((state) => { state.fontPreset = preset }),
      
      setStatWeight: (stat, weight) => set((state) => {
        state.statWeights[stat] = weight;
      }),

      addArea: (area) => {
        const id = generateUniqueId();
        set((state) => { state.areas.push({ id, ...area }) });
        return id;
      },

      importState: (importedState) => set((state) => {
        Object.assign(state, importedState);
      }),

      exportState: () => get(),
    })),
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
);
