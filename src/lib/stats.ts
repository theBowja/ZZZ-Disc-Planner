// import { getAllAgentsData } from './agents-data'
import { type Agent, type Buff, type Disc } from './store'

export interface StatContributor {
  source: string
  value: number
  type: 'base' | 'w-engine' | 'disc-main' | 'disc-sub' | 'buff'
}

export interface CalculatedStats {
  [stat: string]: {
    total: number
    contributors: StatContributor[]
  }
}

export function calculateAgentStats(
  agent: Agent,
  allBuffs: Buff[]
): CalculatedStats {
  const stats: CalculatedStats = {}
  agent
  allBuffs
  
  // // Initialize with base stats
  // agent.baseStats.forEach((stat) => {
  //   stats[stat.stat] = {
  //     total: stat.value,
  //     contributors: [{ source: 'Base', value: stat.value, type: 'base' }],
  //   }
  // })
  
  // // Add W-Engine stats
  // if (agent.equippedWEngineId) {
  //   const wEngine = wEngines.find((w) => w.id === agent.equippedWEngineId)
  //   if (wEngine) {
  //     wEngine.stats.forEach((stat) => {
  //       if (!stats[stat.stat]) {
  //         stats[stat.stat] = { total: 0, contributors: [] }
  //       }
  //       stats[stat.stat].total += stat.value
  //       stats[stat.stat].contributors.push({
  //         source: wEngine.name,
  //         value: stat.value,
  //         type: 'w-engine',
  //       })
  //     })
  //   }
  // }
  
  // // Add disc stats from current loadout
  // const currentLoadout = agent.loadouts.find(
  //   (l) => l.id === agent.currentLoadoutId
  // )
  // if (currentLoadout) {
  //   currentLoadout.discs.forEach((disc, index) => {
  //     if (disc) {
  //       // Main stat
  //       if (!stats[disc.mainStat.stat]) {
  //         stats[disc.mainStat.stat] = { total: 0, contributors: [] }
  //       }
  //       stats[disc.mainStat.stat].total += disc.mainStat.value
  //       stats[disc.mainStat.stat].contributors.push({
  //         source: `Disc ${index + 1} (Main)`,
  //         value: disc.mainStat.value,
  //         type: 'disc-main',
  //       })
        
  //       // Substats
  //       disc.substats.forEach((substat) => {
  //         if (!stats[substat.stat]) {
  //           stats[substat.stat] = { total: 0, contributors: [] }
  //         }
  //         stats[substat.stat].total += substat.value
  //         stats[substat.stat].contributors.push({
  //           source: `Disc ${index + 1} (Sub)`,
  //           value: substat.value,
  //           type: 'disc-sub',
  //         })
  //       })
  //     }
  //   })
  // }
  
  // // Add active buffs
  // const activeBuffs = allBuffs.filter((b) => agent.activeBuffIds.includes(b.id))
  // activeBuffs.forEach((buff) => {
  //   buff.stats.forEach((stat) => {
  //     if (!stats[stat.stat]) {
  //       stats[stat.stat] = { total: 0, contributors: [] }
  //     }
  //     stats[stat.stat].total += stat.value
  //     stats[stat.stat].contributors.push({
  //       source: buff.label,
  //       value: stat.value,
  //       type: 'buff',
  //     })
  //   })
  // })
  
  return stats
}

export function calculateWeaponMaxBaseStat(baseAttack: number) {
  return Math.round(baseAttack * (1 + 94090 / 10000 + 0.8922 * 5) * 100) / 100
}

export function calculateWeaponMaxSecondaryStat(baseValue: number) {
  return baseValue * (1 + 0.3 * 5)
}

export function getAllBuffsForAgent(agent: Agent): Buff[] {
  const buffs: Buff[] = []
  agent
  
  // // Add custom buffs
  // buffs.push(...agent.customBuffs)
  
  // // Add W-Engine buffs
  // if (agent.equippedWEngineId) {
  //   const wEngine = wEngines.find((w) => w.id === agent.equippedWEngineId)
  //   if (wEngine) {
  //     buffs.push(...wEngine.buffs)
  //   }
  // }
  
  // // TODO: Add disc buffs and self buffs when implemented
  
  return buffs
}

export function calculateUpgradeChance(
  disc: Disc | null,
  _statWeights: Record<string, number>
): number {
  if (!disc) return 0
  
  // Placeholder: simple probability calculation
  // User will fine-tune this later
  return disc.upgradeChance
}

export function calculateAreaUpgradeChance(
  agent: Agent,
  _areaId: string,
  _statWeights: Record<string, number>
): number {
  const currentLoadout = agent.loadouts.find(
    (l) => l.id === agent.currentLoadoutId
  )
  if (!currentLoadout) return 0
  
  // Placeholder: aggregate upgrade chances for discs that could drop from this area
  // For now, just sum all disc upgrade chances
  const totalChance = currentLoadout.discs.reduce((sum, disc) => {
    if (!disc) return sum
    return sum + calculateUpgradeChance(disc, {})
  }, 0)
  
  return Math.min(totalChance, 1) // Cap at 100%
}
