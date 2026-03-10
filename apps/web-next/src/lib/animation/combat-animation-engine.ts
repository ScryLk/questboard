import { Container, Graphics } from "pixi.js";
import { COMBAT_ANIMATION_REGISTRY } from "./combat-animation-registry";
import type {
  AnimationSettings,
  CombatAnimationDef,
  CombatAnimationRequest,
  TokenPosition,
} from "./combat-animation-types";
import { playSFX } from "../audio/sfx-triggers";

// ── Singleton ──

let _engine: CombatAnimationEngine | null = null;
export function setCombatEngine(e: CombatAnimationEngine | null) {
  _engine = e;
}
export function getCombatEngine() {
  return _engine;
}

// ── Easing ──

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ── Particle ──

interface Particle {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

// ── Engine ──

export class CombatAnimationEngine {
  private container: Container;
  private scaledCell = 40;
  private settings: AnimationSettings = {
    enabled: true,
    particles: true,
    reducedMotion: false,
    noFlash: false,
    noShake: false,
    particleLimit: 40,
    batterySaver: false,
  };

  private particles: Particle[] = [];
  private animFrameId: number | null = null;
  private activeCount = 0;

  constructor(container: Container) {
    this.container = container;
  }

  setScale(scaledCell: number) {
    this.scaledCell = scaledCell;
  }

  updateSettings(s: AnimationSettings) {
    this.settings = s;
  }

  // ── Main API ──

  async play(
    request: CombatAnimationRequest,
    positions: Map<string, TokenPosition>,
  ): Promise<void> {
    if (!this.settings.enabled) return;

    const def = COMBAT_ANIMATION_REGISTRY[request.animationType];
    if (!def) return;

    const attackerPos = positions.get(request.attackerTokenId);
    const targetPos = positions.get(request.targetTokenId);
    if (!attackerPos || !targetPos) return;

    const ax = attackerPos.x * this.scaledCell + (attackerPos.size * this.scaledCell) / 2;
    const ay = attackerPos.y * this.scaledCell + (attackerPos.size * this.scaledCell) / 2;
    const tx = targetPos.x * this.scaledCell + (targetPos.size * this.scaledCell) / 2;
    const ty = targetPos.y * this.scaledCell + (targetPos.size * this.scaledCell) / 2;

    const critMult = request.isCrit ? 1.5 : 1.0;

    // Calculate angle from attacker to target
    const angle = Math.atan2(ty - ay, tx - ax);

    this.activeCount++;
    this.startLoop();

    try {
      // Phase 1: Windup
      playSFX(def.sfxWindup);
      await this.playWindup(ax, ay, angle, def, critMult);

      if (request.isHit) {
        // Phase 2: Projectile (ranged/magic only)
        if (def.projectile) {
          await this.playProjectile(ax, ay, tx, ty, def, critMult);
        }

        // Phase 3: Impact
        playSFX(def.sfxImpact);
        await this.playImpact(tx, ty, def, critMult);
      } else {
        // Miss
        playSFX(def.sfxMiss);
        if (def.projectile) {
          // Projectile goes slightly past target
          const missX = tx + Math.cos(angle) * this.scaledCell * 0.5;
          const missY = ty + Math.sin(angle) * this.scaledCell * 0.5;
          await this.playProjectile(ax, ay, missX, missY, def, 1.0);
        }
        await this.playMiss(tx, ty, def);
      }
    } finally {
      this.activeCount--;
      if (this.activeCount <= 0) {
        this.stopLoop();
      }
    }
  }

  // ── Windup ──

  private playWindup(
    x: number,
    y: number,
    aimAngle: number,
    def: CombatAnimationDef,
    critMult: number,
  ): Promise<void> {
    if (this.settings.reducedMotion) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const weaponG = new Graphics();
      this.container.addChild(weaponG);
      weaponG.position.set(x, y);

      const { windup } = def;
      const duration = windup.duration;
      const startAngle = (windup.startAngle * Math.PI) / 180;
      const endAngle = (windup.endAngle * Math.PI) / 180;
      const startTime = performance.now();

      // Trail graphics (optional)
      let trailG: Graphics | null = null;
      if (windup.trailEnabled && !this.settings.batterySaver) {
        trailG = new Graphics();
        trailG.position.set(x, y);
        this.container.addChild(trailG);
      }

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const e = easeOutCubic(t);

        const currentAngle = startAngle + (endAngle - startAngle) * e;
        const scale =
          (windup.startScale + (windup.endScale - windup.startScale) * e) * critMult;

        weaponG.clear();
        weaponG.rotation = aimAngle + currentAngle;
        weaponG.scale.set(scale);
        def.drawWeapon(weaponG, this.scaledCell * 0.4);

        // Trail arc
        if (trailG && t < 0.9) {
          trailG.clear();
          trailG.setStrokeStyle({
            width: 2,
            color: windup.trailColor,
            alpha: 0.4 * (1 - t),
          });
          const trailRadius = this.scaledCell * 0.35 * scale;
          trailG.arc(0, 0, trailRadius, aimAngle + startAngle, aimAngle + currentAngle);
          trailG.stroke();
        }

        if (t >= 1) {
          this.container.removeChild(weaponG);
          weaponG.destroy();
          if (trailG) {
            this.container.removeChild(trailG);
            trailG.destroy();
          }
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    });
  }

  // ── Projectile ──

  private playProjectile(
    ax: number,
    ay: number,
    tx: number,
    ty: number,
    def: CombatAnimationDef,
    critMult: number,
  ): Promise<void> {
    const projDef = def.projectile;
    if (!projDef) return Promise.resolve();

    // Multi-orb: play multiple projectiles with staggered arcs
    if (projDef.shape === "multi_orb" && (projDef.count ?? 1) > 1) {
      const count = projDef.count ?? 3;
      const arcs = [-0.3, 0, 0.3].slice(0, count);
      return Promise.all(
        arcs.map((arcOffset) =>
          this.playSingleProjectile(ax, ay, tx, ty, def, critMult, arcOffset),
        ),
      ).then(() => {});
    }

    return this.playSingleProjectile(ax, ay, tx, ty, def, critMult, 0);
  }

  private playSingleProjectile(
    ax: number,
    ay: number,
    tx: number,
    ty: number,
    def: CombatAnimationDef,
    critMult: number,
    arcOffset: number,
  ): Promise<void> {
    const projDef = def.projectile!;

    return new Promise((resolve) => {
      const projG = new Graphics();
      this.container.addChild(projG);

      const dx = tx - ax;
      const dy = ty - ay;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = projDef.speed * this.scaledCell * 0.1; // px per ms
      const duration = dist / Math.max(speed, 0.1);
      const angle = Math.atan2(dy, dx);
      const arc = (projDef.arc + arcOffset) * dist;

      const trailPositions: { x: number; y: number; alpha: number }[] = [];
      const trailG = new Graphics();
      this.container.addChild(trailG);

      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const e = easeInOutQuad(t);

        // Position with arc (quadratic bezier feel)
        const px = ax + dx * e;
        const py = ay + dy * e + arc * Math.sin(Math.PI * e);

        projG.clear();
        projG.position.set(px, py);
        projG.rotation = angle;
        projG.scale.set(critMult);

        if (def.drawProjectile) {
          def.drawProjectile(projG);
        } else {
          // Fallback orb
          projG.fill({ color: projDef.color, alpha: 0.8 });
          projG.circle(0, 0, projDef.size).fill();
        }

        // Trail
        trailPositions.push({ x: px, y: py, alpha: 1 });
        if (trailPositions.length > projDef.trailLength) {
          trailPositions.shift();
        }
        trailG.clear();
        for (let i = 0; i < trailPositions.length; i++) {
          const tp = trailPositions[i];
          const trailAlpha = (i / trailPositions.length) * projDef.trailAlpha;
          trailG.fill({ color: projDef.trailColor, alpha: trailAlpha });
          trailG.circle(tp.x, tp.y, projDef.size * 0.5 * (i / trailPositions.length)).fill();
        }

        // Particles during flight
        if (
          projDef.particlesEnabled &&
          this.settings.particles &&
          !this.settings.batterySaver &&
          Math.random() < 0.3
        ) {
          this.spawnParticles(px, py, 1, projDef.particleColor, 8, 300);
        }

        if (t >= 1) {
          this.container.removeChild(projG);
          projG.destroy();
          this.container.removeChild(trailG);
          trailG.destroy();
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    });
  }

  // ── Impact ──

  private playImpact(
    x: number,
    y: number,
    def: CombatAnimationDef,
    critMult: number,
  ): Promise<void> {
    const { impact } = def;

    return new Promise((resolve) => {
      const ringG = new Graphics();
      this.container.addChild(ringG);
      ringG.position.set(x, y);

      const duration = impact.duration;
      const maxRadius = impact.ringMaxRadius * this.scaledCell * critMult;
      const startTime = performance.now();

      // Flash
      if (!this.settings.noFlash) {
        this.flashAt(x, y, impact.flashColor, impact.flashAlpha * critMult, duration * 0.6);
      }

      // Screen shake
      if (!this.settings.noShake && impact.shakeIntensity > 0) {
        this.shake(impact.shakeIntensity * critMult, duration * 0.4);
      }

      // Burst particles
      if (this.settings.particles && !this.settings.batterySaver) {
        const count = Math.min(
          Math.round(impact.particleCount * critMult),
          this.settings.particleLimit,
        );
        this.spawnParticles(
          x,
          y,
          count,
          impact.particleColor,
          impact.particleSpread * critMult,
          duration,
        );
      }

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const e = easeOutCubic(t);

        ringG.clear();
        const radius = maxRadius * e;
        const alpha = 1 - e;
        ringG.setStrokeStyle({ width: 2, color: impact.ringColor, alpha });
        ringG.circle(0, 0, radius).stroke();

        // Crit: second golden ring
        if (critMult > 1 && t < 0.7) {
          ringG.setStrokeStyle({
            width: 3,
            color: 0xffd700,
            alpha: alpha * 0.6,
          });
          ringG.circle(0, 0, radius * 1.3).stroke();
        }

        if (t >= 1) {
          this.container.removeChild(ringG);
          ringG.destroy();
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    });
  }

  // ── Miss ──

  private playMiss(x: number, y: number, def: CombatAnimationDef): Promise<void> {
    const { miss } = def;

    return new Promise((resolve) => {
      const missG = new Graphics();
      this.container.addChild(missG);

      const duration = miss.duration;
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const alpha = 1 - t;

        missG.clear();
        missG.position.set(x, y);

        // Swoosh arc
        missG.setStrokeStyle({ width: 2, color: miss.swooshColor, alpha });
        const radius = this.scaledCell * 0.3;
        missG.arc(0, 0, radius, -Math.PI * 0.3, Math.PI * 0.3);
        missG.stroke();

        if (t >= 1) {
          this.container.removeChild(missG);
          missG.destroy();
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    });
  }

  // ── Particles ──

  private spawnParticles(
    x: number,
    y: number,
    count: number,
    color: number,
    spread: number,
    lifetime: number,
  ) {
    const remaining = this.settings.particleLimit - this.particles.length;
    const actual = Math.min(count, remaining);

    for (let i = 0; i < actual; i++) {
      const g = new Graphics();
      g.fill({ color, alpha: 0.8 });
      g.circle(0, 0, 1.5 + Math.random() * 1.5).fill();
      g.position.set(x, y);
      this.container.addChild(g);

      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 0.5) * (spread / lifetime) * 16;

      this.particles.push({
        g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: lifetime,
        maxLife: lifetime,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.container.removeChild(p.g);
        p.g.destroy();
        this.particles.splice(i, 1);
        continue;
      }

      p.g.position.x += p.vx * dt;
      p.g.position.y += p.vy * dt;
      p.g.alpha = p.life / p.maxLife;
      // Slow down
      p.vx *= 0.98;
      p.vy *= 0.98;
    }
  }

  // ── Flash ──

  private flashAt(
    x: number,
    y: number,
    color: number,
    alpha: number,
    duration: number,
  ) {
    const g = new Graphics();
    g.fill({ color, alpha });
    g.circle(0, 0, this.scaledCell * 0.5).fill();
    g.position.set(x, y);
    this.container.addChild(g);

    const startTime = performance.now();
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      g.alpha = alpha * (1 - t);
      g.scale.set(1 + t * 0.5);

      if (t >= 1) {
        this.container.removeChild(g);
        g.destroy();
      } else {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  // ── Screen Shake ──

  private shake(intensity: number, duration: number) {
    const startTime = performance.now();
    const origX = this.container.position.x;
    const origY = this.container.position.y;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      if (t >= 1) {
        this.container.position.set(origX, origY);
        return;
      }

      const decay = 1 - t;
      const ox = (Math.random() - 0.5) * intensity * 2 * decay;
      const oy = (Math.random() - 0.5) * intensity * 2 * decay;
      this.container.position.set(origX + ox, origY + oy);

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  // ── rAF Loop (for particles) ──

  private lastFrameTime = 0;

  private startLoop() {
    if (this.animFrameId !== null) return;
    this.lastFrameTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = now - this.lastFrameTime;
      this.lastFrameTime = now;

      this.updateParticles(dt);

      if (this.activeCount > 0 || this.particles.length > 0) {
        this.animFrameId = requestAnimationFrame(loop);
      } else {
        this.animFrameId = null;
      }
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private stopLoop() {
    // Loop will auto-stop when no active animations and no particles remain
  }

  // ── Cleanup ──

  destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    // Clean up remaining particles
    for (const p of this.particles) {
      this.container.removeChild(p.g);
      p.g.destroy();
    }
    this.particles = [];
    this.activeCount = 0;
  }
}
