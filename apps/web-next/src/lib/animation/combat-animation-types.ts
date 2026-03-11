import type { Graphics } from "pixi.js";

// ── Attack categories ──

export type AttackCategory = "melee" | "ranged" | "magic";

export type AnimationType =
  | "sword_slash"
  | "axe_slam"
  | "blunt_smash"
  | "spear_thrust"
  | "dagger_stab"
  | "unarmed_strike"
  | "bow_arrow"
  | "crossbow_bolt"
  | "fire_bolt"
  | "ice_ray"
  | "lightning_bolt"
  | "heal_holy"
  | "dark_necrotic"
  | "magic_missile";

// ── Phase configs ──

export interface WindupConfig {
  duration: number;
  startAngle: number;
  endAngle: number;
  startScale: number;
  endScale: number;
  trailEnabled: boolean;
  trailColor: number;
}

export interface ProjectileConfig {
  shape: "arrow" | "bolt" | "orb" | "zigzag" | "multi_orb";
  color: number;
  glowColor: number;
  size: number;
  speed: number;
  arc: number;
  trailLength: number;
  trailColor: number;
  trailAlpha: number;
  particlesEnabled: boolean;
  particleColor: number;
  count?: number;
}

export interface ImpactConfig {
  duration: number;
  ringColor: number;
  ringMaxRadius: number;
  flashColor: number;
  flashAlpha: number;
  shakeIntensity: number;
  particleCount: number;
  particleColor: number;
  particleSpread: number;
}

export interface MissConfig {
  duration: number;
  swooshColor: number;
}

// ── Full animation definition ──

export interface CombatAnimationDef {
  id: AnimationType;
  category: AttackCategory;
  label: string;
  drawWeapon: (g: Graphics, size: number) => void;
  windup: WindupConfig;
  projectile: ProjectileConfig | null;
  drawProjectile?: (g: Graphics) => void;
  impact: ImpactConfig;
  miss: MissConfig;
  sfxWindup: string;
  sfxImpact: string;
  sfxMiss: string;
}

// ── Request / Position ──

export interface CombatAnimationRequest {
  animationType: AnimationType;
  attackerTokenId: string;
  targetTokenId: string;
  isHit: boolean;
  isCrit: boolean;
  damageTotal: number;
  damageType: string;
}

export interface TokenPosition {
  x: number;
  y: number;
  size: number;
}

// ── Settings ──

export interface AnimationSettings {
  enabled: boolean;
  particles: boolean;
  reducedMotion: boolean;
  noFlash: boolean;
  noShake: boolean;
  particleLimit: number;
  batterySaver: boolean;
}
