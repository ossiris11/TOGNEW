export type GpuTier = 'ENTRY' | 'MID' | 'HIGH' | 'ULTRA';

interface GpuProfile {
  name: string;
  tier: GpuTier;
  // Baseline FPS for CS2 at 1080p
  baseCs2Fps: number;
  // Baseline FPS for Cyberpunk at 1440p
  baseCp2077Fps: number;
}

// Ordered roughly by performance
const gpuProfiles: GpuProfile[] = [
  { name: 'rtx 5090', tier: 'ULTRA', baseCs2Fps: 800, baseCp2077Fps: 160 },
  { name: 'rtx 5080', tier: 'ULTRA', baseCs2Fps: 700, baseCp2077Fps: 140 },
  { name: 'rtx 4090', tier: 'ULTRA', baseCs2Fps: 650, baseCp2077Fps: 130 },
  { name: 'rtx 4080', tier: 'ULTRA', baseCs2Fps: 550, baseCp2077Fps: 110 },
  { name: 'rtx 5070', tier: 'HIGH', baseCs2Fps: 500, baseCp2077Fps: 95 },
  { name: 'rtx 4070 ti', tier: 'HIGH', baseCs2Fps: 480, baseCp2077Fps: 90 },
  { name: 'rtx 4070 super', tier: 'HIGH', baseCs2Fps: 450, baseCp2077Fps: 85 },
  { name: 'rtx 4070', tier: 'HIGH', baseCs2Fps: 420, baseCp2077Fps: 80 },
  { name: 'rx 7800 xt', tier: 'HIGH', baseCs2Fps: 400, baseCp2077Fps: 75 },
  { name: 'rx 7700 xt', tier: 'MID', baseCs2Fps: 350, baseCp2077Fps: 65 },
  { name: 'rtx 5060', tier: 'MID', baseCs2Fps: 380, baseCp2077Fps: 70 },
  { name: 'rtx 4060 ti', tier: 'MID', baseCs2Fps: 330, baseCp2077Fps: 60 },
  { name: 'rtx 4060', tier: 'MID', baseCs2Fps: 290, baseCp2077Fps: 50 },
  { name: 'rtx 3070', tier: 'MID', baseCs2Fps: 310, baseCp2077Fps: 55 },
  { name: 'rtx 3060 ti', tier: 'MID', baseCs2Fps: 280, baseCp2077Fps: 50 },
  { name: 'rx 6700 xt', tier: 'MID', baseCs2Fps: 290, baseCp2077Fps: 50 },
  { name: 'rtx 5050', tier: 'ENTRY', baseCs2Fps: 250, baseCp2077Fps: 40 },
  { name: 'rtx 3060', tier: 'ENTRY', baseCs2Fps: 230, baseCp2077Fps: 35 },
  { name: 'rx 6600 xt', tier: 'ENTRY', baseCs2Fps: 240, baseCp2077Fps: 35 },
  { name: 'rx 6600', tier: 'ENTRY', baseCs2Fps: 210, baseCp2077Fps: 30 },
  { name: 'rtx 3050', tier: 'ENTRY', baseCs2Fps: 180, baseCp2077Fps: 25 },
  { name: 'rtx 2060 super', tier: 'ENTRY', baseCs2Fps: 200, baseCp2077Fps: 28 },
  { name: 'gtx 1660 super', tier: 'ENTRY', baseCs2Fps: 160, baseCp2077Fps: 20 },
  { name: 'gtx 1650', tier: 'ENTRY', baseCs2Fps: 110, baseCp2077Fps: 15 },
  { name: 'rx 580', tier: 'ENTRY', baseCs2Fps: 100, baseCp2077Fps: 12 },
];

export const fallbackEntryGpu: GpuProfile = { name: 'rtx 3050 / rx 6600', tier: 'ENTRY', baseCs2Fps: 190, baseCp2077Fps: 28 };
export const fallbackMidGpu: GpuProfile = { name: 'rtx 4060 / 5060', tier: 'MID', baseCs2Fps: 320, baseCp2077Fps: 55 };
export const fallbackHighGpu: GpuProfile = { name: 'rtx 4070 / 5070', tier: 'HIGH', baseCs2Fps: 450, baseCp2077Fps: 85 };
export const fallbackUltraGpu: GpuProfile = { name: 'rtx 5080', tier: 'ULTRA', baseCs2Fps: 700, baseCp2077Fps: 140 };

export function parseGpuProfile(text: string): GpuProfile {
  const lowerText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  for (const profile of gpuProfiles) {
    if (lowerText.includes(profile.name)) {
      return profile;
    }
    // Also match without space (e.g. rtx4060)
    const noSpaceName = profile.name.replace(/\s+/g, '');
    if (lowerText.includes(noSpaceName)) {
      return profile;
    }
  }
  return fallbackEntryGpu; // Safe fallback
}

export function getBudgetTier(budget: number): GpuTier {
  if (budget >= 160000) return 'ULTRA';
  if (budget >= 100000) return 'HIGH';
  if (budget >= 70000) return 'MID';
  return 'ENTRY';
}

export function getFallbackProfileForBudget(budget: number): GpuProfile {
  const tier = getBudgetTier(budget);
  switch (tier) {
    case 'ULTRA': return fallbackUltraGpu;
    case 'HIGH': return fallbackHighGpu;
    case 'MID': return fallbackMidGpu;
    default: return fallbackEntryGpu;
  }
}

export function calculateFps(profile: GpuProfile, game: 'Counter-Strike 2' | 'Cyberpunk 2077' | 'Работа / 3D / AI', resolution: '1080p' | '1440p' | '4K'): number {
  if (game === 'Работа / 3D / AI') return 0; // N/A
  
  const base = game === 'Counter-Strike 2' ? profile.baseCs2Fps : profile.baseCp2077Fps;
  
  // Resolution scaling (approximate standard scaling factors)
  let factor = 1;
  if (resolution === '1080p') {
    factor = game === 'Counter-Strike 2' ? 1.0 : 1.4; // base is 1080p for CS2, 1440p for Cyberpunk in our profile logic
  } else if (resolution === '1440p') {
    factor = game === 'Counter-Strike 2' ? 0.75 : 1.0;
  } else if (resolution === '4K') {
    factor = game === 'Counter-Strike 2' ? 0.45 : 0.55;
  }

  // Slight randomization based on CPU/RAM constraints wouldn't hurt, but keeping it deterministic for now
  return Math.round(base * factor);
}

export function getTierLabel(tier: GpuTier): string {
  switch (tier) {
    case 'ULTRA': return '4K & Heavy Duty';
    case 'HIGH': return '2K Gaming';
    case 'MID': return 'Full HD / 2K';
    default: return 'Full HD';
  }
}

export function getBuildClass(tier: GpuTier): string {
  switch (tier) {
    case 'ULTRA': return 'Флагманский ULTRA';
    case 'HIGH': return 'Продвинутый PRO';
    case 'MID': return 'Сбалансированный MEDIUM';
    default: return 'Стартовый START';
  }
}
