import type { Graphics } from "pixi.js";
import type { AnimationType, CombatAnimationDef } from "./combat-animation-types";

// ── Helper: degrees to radians ──
const DEG = Math.PI / 180;

// ── MELEE ANIMATIONS ──

const SWORD_SLASH: CombatAnimationDef = {
  id: "sword_slash",
  category: "melee",
  label: "Espada",
  drawWeapon: (g: Graphics, size: number) => {
    // Blade
    g.setStrokeStyle({ width: 2.5, color: 0xccccdd });
    g.moveTo(0, 0).lineTo(0, -size * 0.9).stroke();
    // Tip
    g.setStrokeStyle({ width: 1.5, color: 0xeeeeff });
    g.moveTo(-2, -size * 0.85).lineTo(0, -size * 1.0).lineTo(2, -size * 0.85).stroke();
    // Guard
    g.setStrokeStyle({ width: 3, color: 0x8b7340 });
    g.moveTo(-size * 0.2, 0).lineTo(size * 0.2, 0).stroke();
    // Grip
    g.setStrokeStyle({ width: 3, color: 0x5c3d1e });
    g.moveTo(0, 0).lineTo(0, size * 0.25).stroke();
  },
  windup: { duration: 250, startAngle: -120, endAngle: 60, startScale: 0.8, endScale: 1.0, trailEnabled: true, trailColor: 0xccccdd },
  projectile: null,
  impact: { duration: 300, ringColor: 0xffffff, ringMaxRadius: 0.6, flashColor: 0xffffff, flashAlpha: 0.3, shakeIntensity: 3, particleCount: 6, particleColor: 0xccccdd, particleSpread: 20 },
  miss: { duration: 300, swooshColor: 0xccccdd },
  sfxWindup: "combat:attack_miss_melee",
  sfxImpact: "combat:attack_hit_melee",
  sfxMiss: "combat:attack_miss_melee",
};

const AXE_SLAM: CombatAnimationDef = {
  id: "axe_slam",
  category: "melee",
  label: "Machado",
  drawWeapon: (g: Graphics, size: number) => {
    // Shaft
    g.setStrokeStyle({ width: 3, color: 0x5c3d1e });
    g.moveTo(0, size * 0.3).lineTo(0, -size * 0.5).stroke();
    // Axe head
    g.fill({ color: 0xaaaabb });
    g.moveTo(-size * 0.3, -size * 0.5);
    g.quadraticCurveTo(-size * 0.45, -size * 0.8, -size * 0.15, -size * 0.95);
    g.lineTo(0, -size * 0.5);
    g.closePath().fill();
    // Edge highlight
    g.setStrokeStyle({ width: 1, color: 0xeeeeff });
    g.moveTo(-size * 0.3, -size * 0.5);
    g.quadraticCurveTo(-size * 0.45, -size * 0.8, -size * 0.15, -size * 0.95);
    g.stroke();
  },
  windup: { duration: 300, startAngle: -150, endAngle: 30, startScale: 0.7, endScale: 1.1, trailEnabled: true, trailColor: 0xaaaabb },
  projectile: null,
  impact: { duration: 350, ringColor: 0xdd8833, ringMaxRadius: 0.7, flashColor: 0xffdd88, flashAlpha: 0.35, shakeIntensity: 4, particleCount: 8, particleColor: 0xccaaaa, particleSpread: 25 },
  miss: { duration: 300, swooshColor: 0xaaaabb },
  sfxWindup: "combat:attack_miss_melee",
  sfxImpact: "combat:attack_hit_melee",
  sfxMiss: "combat:attack_miss_melee",
};

const BLUNT_SMASH: CombatAnimationDef = {
  id: "blunt_smash",
  category: "melee",
  label: "Maça",
  drawWeapon: (g: Graphics, size: number) => {
    // Shaft
    g.setStrokeStyle({ width: 3, color: 0x5c3d1e });
    g.moveTo(0, size * 0.3).lineTo(0, -size * 0.5).stroke();
    // Mace head
    g.fill({ color: 0x888899 });
    g.circle(0, -size * 0.65, size * 0.18).fill();
    // Shine
    g.fill({ color: 0xaaaabb, alpha: 0.5 });
    g.circle(-size * 0.05, -size * 0.7, size * 0.08).fill();
  },
  windup: { duration: 280, startAngle: -90, endAngle: 90, startScale: 0.9, endScale: 1.2, trailEnabled: false, trailColor: 0 },
  projectile: null,
  impact: { duration: 300, ringColor: 0xffdd44, ringMaxRadius: 0.75, flashColor: 0xffffaa, flashAlpha: 0.4, shakeIntensity: 5, particleCount: 10, particleColor: 0xffee88, particleSpread: 22 },
  miss: { duration: 300, swooshColor: 0x888899 },
  sfxWindup: "combat:attack_miss_melee",
  sfxImpact: "combat:attack_hit_melee",
  sfxMiss: "combat:attack_miss_melee",
};

const SPEAR_THRUST: CombatAnimationDef = {
  id: "spear_thrust",
  category: "melee",
  label: "Lança",
  drawWeapon: (g: Graphics, size: number) => {
    // Shaft
    g.setStrokeStyle({ width: 2.5, color: 0x6b4c2a });
    g.moveTo(0, size * 0.4).lineTo(0, -size * 0.8).stroke();
    // Spearhead
    g.fill({ color: 0xccccdd });
    g.moveTo(-size * 0.08, -size * 0.8).lineTo(0, -size * 1.05).lineTo(size * 0.08, -size * 0.8).closePath().fill();
  },
  windup: { duration: 200, startAngle: 0, endAngle: 0, startScale: 0.8, endScale: 1.0, trailEnabled: true, trailColor: 0xccccdd },
  projectile: null,
  impact: { duration: 250, ringColor: 0xccccdd, ringMaxRadius: 0.4, flashColor: 0xffcccc, flashAlpha: 0.25, shakeIntensity: 2, particleCount: 4, particleColor: 0xdd4444, particleSpread: 15 },
  miss: { duration: 250, swooshColor: 0xccccdd },
  sfxWindup: "combat:attack_miss_melee",
  sfxImpact: "combat:attack_hit_melee",
  sfxMiss: "combat:attack_miss_melee",
};

const DAGGER_STAB: CombatAnimationDef = {
  id: "dagger_stab",
  category: "melee",
  label: "Adaga",
  drawWeapon: (g: Graphics, size: number) => {
    // Short blade
    g.setStrokeStyle({ width: 2, color: 0xccccdd });
    g.moveTo(0, 0).lineTo(0, -size * 0.55).stroke();
    // Tip
    g.setStrokeStyle({ width: 1, color: 0xeeeeff });
    g.moveTo(-1.5, -size * 0.5).lineTo(0, -size * 0.65).lineTo(1.5, -size * 0.5).stroke();
    // Grip
    g.setStrokeStyle({ width: 2.5, color: 0x333333 });
    g.moveTo(0, 0).lineTo(0, size * 0.15).stroke();
  },
  windup: { duration: 150, startAngle: -30, endAngle: 30, startScale: 1.0, endScale: 1.0, trailEnabled: false, trailColor: 0 },
  projectile: null,
  impact: { duration: 200, ringColor: 0xdd4444, ringMaxRadius: 0.3, flashColor: 0xffaaaa, flashAlpha: 0.2, shakeIntensity: 1, particleCount: 3, particleColor: 0xdd4444, particleSpread: 12 },
  miss: { duration: 200, swooshColor: 0xccccdd },
  sfxWindup: "combat:attack_miss_melee",
  sfxImpact: "combat:attack_hit_melee",
  sfxMiss: "combat:attack_miss_melee",
};

const UNARMED_STRIKE: CombatAnimationDef = {
  id: "unarmed_strike",
  category: "melee",
  label: "Desarmado",
  drawWeapon: (g: Graphics, size: number) => {
    // 3 claw marks
    g.setStrokeStyle({ width: 2, color: 0xffcc88 });
    for (let i = -1; i <= 1; i++) {
      g.moveTo(i * size * 0.12, 0).lineTo(i * size * 0.15, -size * 0.5).stroke();
    }
  },
  windup: { duration: 180, startAngle: -60, endAngle: 40, startScale: 0.8, endScale: 1.0, trailEnabled: true, trailColor: 0xffcc88 },
  projectile: null,
  impact: { duration: 200, ringColor: 0xffcc88, ringMaxRadius: 0.4, flashColor: 0xffddbb, flashAlpha: 0.2, shakeIntensity: 2, particleCount: 4, particleColor: 0xdd4444, particleSpread: 15 },
  miss: { duration: 200, swooshColor: 0xffcc88 },
  sfxWindup: "combat:attack_miss_melee",
  sfxImpact: "combat:take_damage",
  sfxMiss: "combat:attack_miss_melee",
};

// ── RANGED ANIMATIONS ──

const BOW_ARROW: CombatAnimationDef = {
  id: "bow_arrow",
  category: "ranged",
  label: "Arco",
  drawWeapon: (g: Graphics, size: number) => {
    // Bow curve
    g.setStrokeStyle({ width: 2.5, color: 0x6b4c2a });
    g.moveTo(0, -size * 0.6).quadraticCurveTo(-size * 0.3, 0, 0, size * 0.6).stroke();
    // String
    g.setStrokeStyle({ width: 1, color: 0xccbbaa });
    g.moveTo(0, -size * 0.6).lineTo(0, size * 0.6).stroke();
  },
  windup: { duration: 300, startAngle: -10, endAngle: 10, startScale: 0.9, endScale: 1.0, trailEnabled: false, trailColor: 0 },
  projectile: {
    shape: "arrow", color: 0x6b4c2a, glowColor: 0x8b6c4a, size: 12,
    speed: 0.8, arc: 0.05, trailLength: 8, trailColor: 0x6b4c2a, trailAlpha: 0.3,
    particlesEnabled: false, particleColor: 0,
  },
  drawProjectile: (g: Graphics) => {
    // Arrow shaft
    g.setStrokeStyle({ width: 1.5, color: 0x6b4c2a });
    g.moveTo(0, 8).lineTo(0, -8).stroke();
    // Arrowhead
    g.fill({ color: 0xccccdd });
    g.moveTo(-3, -8).lineTo(0, -14).lineTo(3, -8).closePath().fill();
    // Fletching
    g.setStrokeStyle({ width: 1, color: 0xdd4444 });
    g.moveTo(-3, 6).lineTo(0, 8).lineTo(3, 6).stroke();
  },
  impact: { duration: 250, ringColor: 0x6b4c2a, ringMaxRadius: 0.35, flashColor: 0xffcccc, flashAlpha: 0.2, shakeIntensity: 2, particleCount: 3, particleColor: 0xdd4444, particleSpread: 15 },
  miss: { duration: 250, swooshColor: 0x6b4c2a },
  sfxWindup: "combat:attack_shot",
  sfxImpact: "combat:attack_hit_ranged",
  sfxMiss: "combat:attack_miss_melee",
};

const CROSSBOW_BOLT: CombatAnimationDef = {
  id: "crossbow_bolt",
  category: "ranged",
  label: "Besta",
  drawWeapon: (g: Graphics, size: number) => {
    // Body
    g.setStrokeStyle({ width: 3, color: 0x5c3d1e });
    g.moveTo(0, 0).lineTo(0, -size * 0.4).stroke();
    // Crossbar
    g.setStrokeStyle({ width: 2, color: 0x6b4c2a });
    g.moveTo(-size * 0.35, -size * 0.35).quadraticCurveTo(0, -size * 0.2, size * 0.35, -size * 0.35).stroke();
  },
  windup: { duration: 200, startAngle: 0, endAngle: 0, startScale: 1.0, endScale: 1.0, trailEnabled: false, trailColor: 0 },
  projectile: {
    shape: "bolt", color: 0x444444, glowColor: 0x666666, size: 10,
    speed: 1.2, arc: 0, trailLength: 6, trailColor: 0x444444, trailAlpha: 0.4,
    particlesEnabled: false, particleColor: 0,
  },
  drawProjectile: (g: Graphics) => {
    // Bolt shaft
    g.setStrokeStyle({ width: 2, color: 0x444444 });
    g.moveTo(0, 5).lineTo(0, -8).stroke();
    // Bolt tip
    g.fill({ color: 0xccccdd });
    g.moveTo(-2, -8).lineTo(0, -12).lineTo(2, -8).closePath().fill();
  },
  impact: { duration: 200, ringColor: 0x888888, ringMaxRadius: 0.35, flashColor: 0xffcccc, flashAlpha: 0.2, shakeIntensity: 2, particleCount: 3, particleColor: 0xdd4444, particleSpread: 12 },
  miss: { duration: 200, swooshColor: 0x444444 },
  sfxWindup: "combat:attack_shot",
  sfxImpact: "combat:attack_hit_ranged",
  sfxMiss: "combat:attack_miss_melee",
};

// ── MAGIC ANIMATIONS ──

function drawStaff(g: Graphics, size: number, orbColor: number, orbAlpha: number) {
  g.setStrokeStyle({ width: 2.5, color: 0x5c3d1e });
  g.moveTo(0, size * 0.4).lineTo(0, -size * 0.5).stroke();
  g.fill({ color: orbColor, alpha: orbAlpha });
  g.circle(0, -size * 0.6, size * 0.15).fill();
}

const FIRE_BOLT: CombatAnimationDef = {
  id: "fire_bolt",
  category: "magic",
  label: "Fogo",
  drawWeapon: (g: Graphics, size: number) => {
    drawStaff(g, size, 0xff6600, 0.8);
    g.fill({ color: 0xffaa00, alpha: 0.5 });
    g.circle(0, -size * 0.6, size * 0.1).fill();
  },
  windup: { duration: 350, startAngle: -5, endAngle: 5, startScale: 0.9, endScale: 1.1, trailEnabled: false, trailColor: 0 },
  projectile: {
    shape: "orb", color: 0xff4400, glowColor: 0xffaa00, size: 7,
    speed: 0.6, arc: 0, trailLength: 12, trailColor: 0xff6600, trailAlpha: 0.5,
    particlesEnabled: true, particleColor: 0xffaa00,
  },
  drawProjectile: (g: Graphics) => {
    g.fill({ color: 0xff4400, alpha: 0.9 }).circle(0, 0, 7).fill();
    g.fill({ color: 0xffaa00, alpha: 0.6 }).circle(0, 0, 5).fill();
    g.fill({ color: 0xffdd44, alpha: 0.4 }).circle(0, 0, 3).fill();
  },
  impact: { duration: 400, ringColor: 0xff4400, ringMaxRadius: 0.9, flashColor: 0xff6600, flashAlpha: 0.4, shakeIntensity: 3, particleCount: 15, particleColor: 0xffaa00, particleSpread: 30 },
  miss: { duration: 300, swooshColor: 0xff4400 },
  sfxWindup: "combat:spell_cast",
  sfxImpact: "magic:fire",
  sfxMiss: "combat:spell_cast",
};

const ICE_RAY: CombatAnimationDef = {
  id: "ice_ray",
  category: "magic",
  label: "Gelo",
  drawWeapon: (g: Graphics, size: number) => {
    g.setStrokeStyle({ width: 2.5, color: 0x5c3d1e });
    g.moveTo(0, size * 0.4).lineTo(0, -size * 0.5).stroke();
    // Ice crystal
    g.fill({ color: 0x88ddff, alpha: 0.7 });
    g.moveTo(0, -size * 0.75).lineTo(-size * 0.1, -size * 0.6).lineTo(0, -size * 0.5).lineTo(size * 0.1, -size * 0.6).closePath().fill();
  },
  windup: { duration: 300, startAngle: -3, endAngle: 3, startScale: 0.9, endScale: 1.05, trailEnabled: false, trailColor: 0 },
  projectile: {
    shape: "orb", color: 0x44bbff, glowColor: 0xaaeeff, size: 6,
    speed: 0.7, arc: 0, trailLength: 10, trailColor: 0x88ddff, trailAlpha: 0.4,
    particlesEnabled: true, particleColor: 0xcceeff,
  },
  drawProjectile: (g: Graphics) => {
    g.fill({ color: 0x44bbff, alpha: 0.8 }).circle(0, 0, 6).fill();
    g.fill({ color: 0xaaeeff, alpha: 0.5 }).circle(0, 0, 4).fill();
  },
  impact: { duration: 400, ringColor: 0x88ddff, ringMaxRadius: 0.75, flashColor: 0xaaeeff, flashAlpha: 0.3, shakeIntensity: 2, particleCount: 12, particleColor: 0xcceeff, particleSpread: 25 },
  miss: { duration: 300, swooshColor: 0x44bbff },
  sfxWindup: "combat:spell_cast",
  sfxImpact: "magic:ice",
  sfxMiss: "combat:spell_cast",
};

const LIGHTNING_BOLT: CombatAnimationDef = {
  id: "lightning_bolt",
  category: "magic",
  label: "Raio",
  drawWeapon: (g: Graphics, size: number) => {
    g.setStrokeStyle({ width: 2.5, color: 0x5c3d1e });
    g.moveTo(0, size * 0.4).lineTo(0, -size * 0.5).stroke();
    // Lightning crackle
    g.setStrokeStyle({ width: 1.5, color: 0xffff44 });
    g.moveTo(-size * 0.1, -size * 0.7).lineTo(size * 0.05, -size * 0.6).lineTo(-size * 0.05, -size * 0.55).lineTo(size * 0.1, -size * 0.45).stroke();
  },
  windup: { duration: 250, startAngle: -2, endAngle: 2, startScale: 1.0, endScale: 1.15, trailEnabled: false, trailColor: 0 },
  projectile: {
    shape: "zigzag", color: 0xffff44, glowColor: 0xffff88, size: 10,
    speed: 1.5, arc: 0, trailLength: 15, trailColor: 0xffff88, trailAlpha: 0.6,
    particlesEnabled: true, particleColor: 0xffff88,
  },
  drawProjectile: (g: Graphics) => {
    g.setStrokeStyle({ width: 2, color: 0xffff44, alpha: 0.9 });
    g.moveTo(0, -5).lineTo(4, -1).lineTo(-3, 2).lineTo(3, 5).stroke();
    g.setStrokeStyle({ width: 4, color: 0xffff88, alpha: 0.3 });
    g.moveTo(0, -5).lineTo(4, -1).lineTo(-3, 2).lineTo(3, 5).stroke();
  },
  impact: { duration: 350, ringColor: 0xffff44, ringMaxRadius: 0.8, flashColor: 0xffffaa, flashAlpha: 0.45, shakeIntensity: 4, particleCount: 10, particleColor: 0xffff88, particleSpread: 28 },
  miss: { duration: 250, swooshColor: 0xffff44 },
  sfxWindup: "combat:spell_cast",
  sfxImpact: "magic:lightning",
  sfxMiss: "combat:spell_cast",
};

const HEAL_HOLY: CombatAnimationDef = {
  id: "heal_holy",
  category: "magic",
  label: "Cura",
  drawWeapon: (g: Graphics, size: number) => {
    // Holy symbol (cross)
    g.setStrokeStyle({ width: 2, color: 0xffdd44 });
    g.moveTo(0, -size * 0.3).lineTo(0, -size * 0.7).stroke();
    g.moveTo(-size * 0.15, -size * 0.5).lineTo(size * 0.15, -size * 0.5).stroke();
  },
  windup: { duration: 400, startAngle: 0, endAngle: 0, startScale: 0.8, endScale: 1.2, trailEnabled: false, trailColor: 0 },
  projectile: {
    shape: "orb", color: 0x44ff88, glowColor: 0xaaffcc, size: 6,
    speed: 0.5, arc: 0.15, trailLength: 10, trailColor: 0x88ffaa, trailAlpha: 0.3,
    particlesEnabled: true, particleColor: 0xaaffcc,
  },
  drawProjectile: (g: Graphics) => {
    g.fill({ color: 0x44ff88, alpha: 0.6 }).circle(0, 0, 6).fill();
    g.fill({ color: 0xaaffcc, alpha: 0.3 }).circle(0, 0, 9).fill();
  },
  impact: { duration: 500, ringColor: 0x44ff88, ringMaxRadius: 0.75, flashColor: 0xccffdd, flashAlpha: 0.3, shakeIntensity: 0, particleCount: 12, particleColor: 0xaaffcc, particleSpread: 25 },
  miss: { duration: 300, swooshColor: 0x44ff88 },
  sfxWindup: "combat:spell_cast",
  sfxImpact: "combat:heal",
  sfxMiss: "combat:spell_cast",
};

const DARK_NECROTIC: CombatAnimationDef = {
  id: "dark_necrotic",
  category: "magic",
  label: "Sombrio",
  drawWeapon: (g: Graphics, size: number) => {
    g.setStrokeStyle({ width: 2.5, color: 0x333333 });
    g.moveTo(0, size * 0.4).lineTo(0, -size * 0.5).stroke();
    g.fill({ color: 0x6622aa, alpha: 0.7 }).circle(0, -size * 0.6, size * 0.14).fill();
    g.fill({ color: 0x220044, alpha: 0.5 }).circle(0, -size * 0.6, size * 0.09).fill();
  },
  windup: { duration: 300, startAngle: -5, endAngle: 5, startScale: 0.9, endScale: 1.1, trailEnabled: false, trailColor: 0 },
  projectile: {
    shape: "orb", color: 0x6622cc, glowColor: 0x8844dd, size: 6,
    speed: 0.7, arc: 0, trailLength: 10, trailColor: 0x8844dd, trailAlpha: 0.5,
    particlesEnabled: true, particleColor: 0x8844dd,
  },
  drawProjectile: (g: Graphics) => {
    g.fill({ color: 0x6622cc, alpha: 0.8 }).circle(0, 0, 6).fill();
    g.fill({ color: 0x220044, alpha: 0.6 }).circle(0, 0, 4).fill();
  },
  impact: { duration: 400, ringColor: 0x6622cc, ringMaxRadius: 0.7, flashColor: 0x440088, flashAlpha: 0.35, shakeIntensity: 2, particleCount: 10, particleColor: 0x8844dd, particleSpread: 25 },
  miss: { duration: 300, swooshColor: 0x6622cc },
  sfxWindup: "combat:spell_cast",
  sfxImpact: "magic:dark",
  sfxMiss: "combat:spell_cast",
};

const MAGIC_MISSILE: CombatAnimationDef = {
  id: "magic_missile",
  category: "magic",
  label: "Mísseis Mágicos",
  drawWeapon: (g: Graphics, size: number) => {
    g.fill({ color: 0x6c5ce7, alpha: 0.6 });
    g.circle(0, -size * 0.4, size * 0.12).fill();
    g.circle(-size * 0.12, -size * 0.35, size * 0.08).fill();
    g.circle(size * 0.12, -size * 0.35, size * 0.08).fill();
  },
  windup: { duration: 200, startAngle: 0, endAngle: 0, startScale: 0.9, endScale: 1.1, trailEnabled: false, trailColor: 0 },
  projectile: {
    shape: "multi_orb", color: 0x8b6cf7, glowColor: 0xccbbff, size: 4,
    speed: 0.8, arc: 0.3, trailLength: 8, trailColor: 0xaa99ff, trailAlpha: 0.4,
    particlesEnabled: true, particleColor: 0xccbbff, count: 3,
  },
  drawProjectile: (g: Graphics) => {
    g.fill({ color: 0x8b6cf7, alpha: 0.9 }).circle(0, 0, 4).fill();
    g.fill({ color: 0xccbbff, alpha: 0.5 }).circle(0, 0, 6).fill();
  },
  impact: { duration: 250, ringColor: 0x8b6cf7, ringMaxRadius: 0.4, flashColor: 0xaa99ff, flashAlpha: 0.25, shakeIntensity: 1, particleCount: 5, particleColor: 0xccbbff, particleSpread: 15 },
  miss: { duration: 200, swooshColor: 0x8b6cf7 },
  sfxWindup: "combat:spell_cast",
  sfxImpact: "combat:spell_hit",
  sfxMiss: "combat:spell_cast",
};

// ── REGISTRY ──

export const COMBAT_ANIMATION_REGISTRY: Record<AnimationType, CombatAnimationDef> = {
  sword_slash: SWORD_SLASH,
  axe_slam: AXE_SLAM,
  blunt_smash: BLUNT_SMASH,
  spear_thrust: SPEAR_THRUST,
  dagger_stab: DAGGER_STAB,
  unarmed_strike: UNARMED_STRIKE,
  bow_arrow: BOW_ARROW,
  crossbow_bolt: CROSSBOW_BOLT,
  fire_bolt: FIRE_BOLT,
  ice_ray: ICE_RAY,
  lightning_bolt: LIGHTNING_BOLT,
  heal_holy: HEAL_HOLY,
  dark_necrotic: DARK_NECROTIC,
  magic_missile: MAGIC_MISSILE,
};

// Suppress unused variable warning
void DEG;
