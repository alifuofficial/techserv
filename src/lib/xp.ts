/**
 * XP Calculation Logic
 * 
 * Base XP: 20 (Account Creation)
 * Per Order: 50 XP
 * Per Referral: 30 XP
 * 
 * Levels:
 * 1: 0 - 99 XP
 * 2: 100 - 249 XP
 * 3: 250 - 499 XP
 * 4: 500 - 999 XP
 * 5: 1000+ XP (Legendary)
 */

export interface XPStats {
  level: number
  currentXP: number
  nextLevelXP: number
  progress: number
  label: string
  color: string
}

export function calculateXP(orderCount: number = 0, referralCount: number = 0): XPStats {
  const xp = 20 + (orderCount * 50) + (referralCount * 30)
  
  if (xp < 100) {
    return { level: 1, currentXP: xp, nextLevelXP: 100, progress: (xp / 100) * 100, label: 'Novice', color: '#94a3b8' }
  }
  if (xp < 250) {
    return { level: 2, currentXP: xp, nextLevelXP: 250, progress: ((xp - 100) / 150) * 100, label: 'Apprentice', color: '#10b981' }
  }
  if (xp < 500) {
    return { level: 3, currentXP: xp, nextLevelXP: 500, progress: ((xp - 250) / 250) * 100, label: 'Professional', color: '#3b82f6' }
  }
  if (xp < 1000) {
    return { level: 4, currentXP: xp, nextLevelXP: 1000, progress: ((xp - 500) / 500) * 100, label: 'Elite', color: '#8b5cf6' }
  }
  return { level: 5, currentXP: xp, nextLevelXP: 1000, progress: 100, label: 'Legendary', color: '#f59e0b' }
}
