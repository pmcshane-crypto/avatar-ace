import { AvatarType } from '@/types/avatar';

import avatarFire from '@/assets/avatar-fire.png';
import avatarFireLevel2 from '@/assets/avatar-fire-level2.png';
import avatarFireLevel3 from '@/assets/avatar-fire-level3.png';
import avatarWater from '@/assets/avatar-water.png';
import avatarWaterLevel2 from '@/assets/avatar-water-level2.png';
import avatarWaterLevel3 from '@/assets/avatar-water-level3.png';
import avatarNature from '@/assets/avatar-nature.png';
import avatarNatureLevel2 from '@/assets/avatar-nature-level2.png';
import avatarNatureLevel3 from '@/assets/avatar-nature-level3.png';
import avatarChungloid from '@/assets/avatar-chungloid.png';
import avatarChungloidLevel2 from '@/assets/avatar-chungloid-level2.png';
import avatarChungloidLevel3 from '@/assets/avatar-chungloid-level3.png';
import avatarChickenNugget from '@/assets/avatar-chicken-nugget.png';
import avatarChickenNuggetLevel2 from '@/assets/avatar-chicken-nugget-level2.png';
import avatarChickenNuggetLevel3 from '@/assets/avatar-chicken-nugget-level3.png';
import avatarFlarion from '@/assets/avatar-flarion.png';
import avatarFlarionLevel2 from '@/assets/avatar-flarion-level2.png';
import avatarFlarionLevel3 from '@/assets/avatar-flarion-level3.png';
import avatarAuarlis from '@/assets/avatar-auarlis.png';
import avatarAuarlisLevel2 from '@/assets/avatar-auarlis-level2.png';
import avatarAuarlisLevel3 from '@/assets/avatar-auarlis-level3.png';
import avatarTeddy from '@/assets/avatar-teddy.png';
import avatarTeddyLevel2 from '@/assets/avatar-teddy-level2.png';
import avatarTeddyLevel3 from '@/assets/avatar-teddy-level3.png';

type AvatarImages = {
  [key in AvatarType]: {
    1: string;
    2: string;
    3: string;
  };
};

export const AVATAR_IMAGES: AvatarImages = {
  fire: { 1: avatarFire, 2: avatarFireLevel2, 3: avatarFireLevel3 },
  water: { 1: avatarWater, 2: avatarWaterLevel2, 3: avatarWaterLevel3 },
  nature: { 1: avatarNature, 2: avatarNatureLevel2, 3: avatarNatureLevel3 },
  chungloid: { 1: avatarChungloid, 2: avatarChungloidLevel2, 3: avatarChungloidLevel3 },
  'chicken-nugget': { 1: avatarChickenNugget, 2: avatarChickenNuggetLevel2, 3: avatarChickenNuggetLevel3 },
  flarion: { 1: avatarFlarion, 2: avatarFlarionLevel2, 3: avatarFlarionLevel3 },
  auarlis: { 1: avatarAuarlis, 2: avatarAuarlisLevel2, 3: avatarAuarlisLevel3 },
  teddy: { 1: avatarTeddy, 2: avatarTeddyLevel2, 3: avatarTeddyLevel3 },
};

export function getAvatarImage(type: AvatarType, level: number): string {
  const avatarSet = AVATAR_IMAGES[type] || AVATAR_IMAGES.fire;
  // Direct mapping: Level 1 = stage 1, Level 2 = stage 2, Level 3+ = stage 3
  const evolutionStage: 1 | 2 | 3 = level <= 1 ? 1 : level === 2 ? 2 : 3;
  return avatarSet[evolutionStage];
}

export function getAvatarGlow(type: AvatarType): string {
  const glowColors: Record<AvatarType, string> = {
    fire: 'shadow-[0_0_30px_hsl(15_100%_60%/0.6)]',
    water: 'shadow-[0_0_30px_hsl(217_91%_60%/0.6)]',
    nature: 'shadow-[0_0_30px_hsl(142_76%_45%/0.6)]',
    chungloid: 'shadow-[0_0_30px_hsl(280_70%_50%/0.6)]',
    'chicken-nugget': 'shadow-[0_0_30px_hsl(38_92%_50%/0.6)]',
    flarion: 'shadow-[0_0_30px_hsl(350_80%_55%/0.6)]',
    auarlis: 'shadow-[0_0_30px_hsl(180_70%_50%/0.6)]',
    teddy: 'shadow-[0_0_30px_hsl(30_60%_45%/0.6)]',
  };
  return glowColors[type] || glowColors.fire;
}

export function getAvatarBorderColor(type: AvatarType): string {
  const borderColors: Record<AvatarType, string> = {
    fire: 'border-orange-500/50',
    water: 'border-blue-500/50',
    nature: 'border-green-500/50',
    chungloid: 'border-purple-500/50',
    'chicken-nugget': 'border-amber-500/50',
    flarion: 'border-red-500/50',
    auarlis: 'border-cyan-500/50',
    teddy: 'border-amber-700/50',
  };
  return borderColors[type] || borderColors.fire;
}

export function isRareAvatar(type: AvatarType): boolean {
  const rareAvatars: AvatarType[] = ['chungloid', 'chicken-nugget', 'flarion', 'auarlis', 'teddy'];
  return rareAvatars.includes(type);
}
