// ── Sword Clash Cinematic Effect ──
// Two golden energy trails cross at screen center with impact flash,
// shockwave, lingering X scar, and particle burst.
// Fully self-contained — no external CSS required.

const CONTAINER_ID = "sword-clash-effect";
const IMPACT_TIME = 200; // ms when slashes meet
const TOTAL_DURATION = 750;

export function playSwordClashEffect(): void {
  // Prevent double-fire
  if (document.getElementById(CONTAINER_ID)) return;

  const container = document.createElement("div");
  container.id = CONTAINER_ID;
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    pointerEvents: "none",
    overflow: "hidden",
  });
  document.body.appendChild(container);

  createDarkOverlay(container);
  createSlashTrail(container, 45, 0);
  createSlashTrail(container, -45, 15);
  createImpactFlash(container);
  createScreenFlash(container);
  createShockwaveRing(container);
  createLingeringScars(container);
  createParticleBurst(container);

  setTimeout(() => container.remove(), TOTAL_DURATION + 100);
}

// ── Dark Overlay ──

function createDarkOverlay(parent: HTMLElement) {
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "absolute",
    inset: "0",
    background: "rgba(0, 0, 0, 0.35)",
  });
  parent.appendChild(el);
  el.animate(
    [
      { opacity: 0 },
      { opacity: 1, offset: 0.2 },
      { opacity: 0.8, offset: 0.5 },
      { opacity: 0 },
    ],
    { duration: TOTAL_DURATION, fill: "forwards" },
  );
}

// ── Slash Trails ──

function createSlashTrail(parent: HTMLElement, deg: number, delay: number) {
  // Main bright trail
  const trail = document.createElement("div");
  Object.assign(trail.style, {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "3px",
    height: "300px",
    marginLeft: "-1.5px",
    marginTop: "-150px",
    background: `linear-gradient(
      to bottom,
      transparent 0%,
      rgba(255,215,0,0.05) 10%,
      rgba(255,215,0,0.5) 35%,
      rgba(255,255,255,0.95) 48%,
      #fff 50%,
      rgba(255,255,255,0.95) 52%,
      rgba(255,215,0,0.5) 65%,
      rgba(255,215,0,0.05) 90%,
      transparent 100%
    )`,
    boxShadow:
      "0 0 8px rgba(255,215,0,0.7), 0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.2)",
    borderRadius: "2px",
    filter: "blur(0.5px)",
  });
  parent.appendChild(trail);

  const keyframes = createSlashKeyframes(deg);
  const timing: KeyframeAnimationOptions = {
    duration: 400,
    delay,
    easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
    fill: "forwards",
  };

  trail.animate(keyframes, timing);

  // Wider glow layer (behind)
  const glow = document.createElement("div");
  Object.assign(glow.style, {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "14px",
    height: "300px",
    marginLeft: "-7px",
    marginTop: "-150px",
    background: `linear-gradient(
      to bottom,
      transparent 0%,
      rgba(255,215,0,0.02) 20%,
      rgba(255,215,0,0.08) 45%,
      rgba(255,215,0,0.12) 50%,
      rgba(255,215,0,0.08) 55%,
      rgba(255,215,0,0.02) 80%,
      transparent 100%
    )`,
    borderRadius: "6px",
    filter: "blur(4px)",
  });
  parent.appendChild(glow);
  glow.animate(keyframes, timing);
}

function createSlashKeyframes(deg: number): Keyframe[] {
  return [
    { transform: `rotate(${deg}deg) translateY(450px)`, opacity: 0 },
    {
      transform: `rotate(${deg}deg) translateY(100px)`,
      opacity: 1,
      offset: 0.25,
    },
    {
      transform: `rotate(${deg}deg) translateY(0)`,
      opacity: 1,
      offset: 0.5,
    },
    {
      transform: `rotate(${deg}deg) translateY(-250px)`,
      opacity: 0.3,
      offset: 0.75,
    },
    { transform: `rotate(${deg}deg) translateY(-450px)`, opacity: 0 },
  ];
}

// ── Impact Flash ──

function createImpactFlash(parent: HTMLElement) {
  const flash = document.createElement("div");
  Object.assign(flash.style, {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "150px",
    height: "150px",
    marginLeft: "-75px",
    marginTop: "-75px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,215,0,0.7) 25%, rgba(255,215,0,0.3) 50%, transparent 75%)",
  });
  parent.appendChild(flash);
  flash.animate(
    [
      { transform: "scale(0)", opacity: 0 },
      { transform: "scale(0.8)", opacity: 1, offset: 0.2 },
      { transform: "scale(1.5)", opacity: 0.7, offset: 0.5 },
      { transform: "scale(2.5)", opacity: 0 },
    ],
    {
      duration: 350,
      delay: IMPACT_TIME,
      easing: "ease-out",
      fill: "forwards",
    },
  );
}

// ── Screen Flash ──

function createScreenFlash(parent: HTMLElement) {
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "absolute",
    inset: "0",
    background:
      "radial-gradient(circle at center, rgba(255,215,0,0.15) 0%, transparent 70%)",
  });
  parent.appendChild(el);
  el.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], {
    duration: 300,
    delay: IMPACT_TIME,
    easing: "ease-out",
    fill: "forwards",
  });
}

// ── Shockwave Ring ──

function createShockwaveRing(parent: HTMLElement) {
  const ring = document.createElement("div");
  Object.assign(ring.style, {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "20px",
    height: "20px",
    marginLeft: "-10px",
    marginTop: "-10px",
    borderRadius: "50%",
    border: "2px solid rgba(255, 215, 0, 0.6)",
    boxShadow:
      "0 0 8px rgba(255,215,0,0.3), inset 0 0 8px rgba(255,215,0,0.1)",
  });
  parent.appendChild(ring);
  ring.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(8)", opacity: 0.3, offset: 0.5 },
      { transform: "scale(12)", opacity: 0 },
    ],
    {
      duration: 400,
      delay: IMPACT_TIME,
      easing: "ease-out",
      fill: "forwards",
    },
  );
}

// ── Lingering X Scars ──

function createLingeringScars(parent: HTMLElement) {
  [45, -45].forEach((deg) => {
    const scar = document.createElement("div");
    Object.assign(scar.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "2px",
      height: "200px",
      marginLeft: "-1px",
      marginTop: "-100px",
      background:
        "linear-gradient(to bottom, transparent, rgba(255,215,0,0.4) 30%, rgba(255,215,0,0.6) 50%, rgba(255,215,0,0.4) 70%, transparent)",
      transform: `rotate(${deg}deg)`,
      boxShadow: "0 0 6px rgba(255,215,0,0.3)",
      filter: "blur(0.5px)",
    });
    parent.appendChild(scar);
    scar.animate(
      [
        { opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { opacity: 0.6, offset: 0.5 },
        { opacity: 0 },
      ],
      {
        duration: 500,
        delay: IMPACT_TIME,
        easing: "ease-out",
        fill: "forwards",
      },
    );
  });
}

// ── Particle Burst ──

const PARTICLE_DIRECTIONS = [
  { x: 90, y: 0 },
  { x: 64, y: -64 },
  { x: 0, y: -90 },
  { x: -64, y: -64 },
  { x: -90, y: 0 },
  { x: -64, y: 64 },
  { x: 0, y: 90 },
  { x: 64, y: 64 },
  { x: 45, y: -80 },
  { x: -45, y: 80 },
  { x: 80, y: -30 },
  { x: -80, y: 30 },
];

function createParticleBurst(parent: HTMLElement) {
  PARTICLE_DIRECTIONS.forEach(({ x, y }) => {
    const p = document.createElement("div");
    const size = 1.5 + Math.random() * 2.5;
    Object.assign(p.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: `${size}px`,
      height: `${size}px`,
      marginLeft: `${-size / 2}px`,
      marginTop: `${-size / 2}px`,
      borderRadius: "50%",
      background: "#FFD700",
      boxShadow: "0 0 3px #FFD700, 0 0 6px rgba(255,215,0,0.5)",
    });
    parent.appendChild(p);

    const spread = 0.6 + Math.random() * 0.8;
    p.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${x * spread}px, ${y * spread}px) scale(0.4)`,
          opacity: 0.5,
          offset: 0.6,
        },
        {
          transform: `translate(${x * spread * 1.6}px, ${y * spread * 1.6}px) scale(0)`,
          opacity: 0,
        },
      ],
      {
        duration: 350,
        delay: IMPACT_TIME + 20,
        easing: "ease-out",
        fill: "forwards",
      },
    );
  });
}
