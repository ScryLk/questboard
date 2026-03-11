// ── Eldritch Eyes Cinematic Effect ──
// Two cosmic entity eyes open slowly in the darkness, observe briefly,
// then fade back into the void. Fully self-contained — no external CSS.

const CONTAINER_ID = "eldritch-eyes-effect";
const TOTAL_DURATION = 2800;

// Palette
const GREEN = "0, 220, 140";
const CYAN = "0, 180, 200";
const PALE = "180, 255, 220";

export function playEldritchEyesEffect(): void {
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
  createMist(container);
  createEye(container, -1); // left
  createEye(container, 1); // right
  createAmbientParticles(container);
  createEdgeVignette(container);

  setTimeout(() => container.remove(), TOTAL_DURATION + 200);
}

// ── Dark Overlay ──

function createDarkOverlay(parent: HTMLElement) {
  const el = createElement(parent, {
    position: "absolute",
    inset: "0",
    background: "rgba(0, 0, 0, 0.6)",
  });
  el.animate(
    [
      { opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { opacity: 1, offset: 0.75 },
      { opacity: 0 },
    ],
    { duration: TOTAL_DURATION, fill: "forwards" },
  );
}

// ── Mist / Fog ──

function createMist(parent: HTMLElement) {
  // Central dark mist
  const mist = createElement(parent, {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "900px",
    height: "450px",
    marginLeft: "-450px",
    marginTop: "-225px",
    background: `radial-gradient(ellipse, rgba(${GREEN}, 0.03) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)`,
    filter: "blur(30px)",
  });
  mist.animate(
    [
      { opacity: 0, transform: "scale(0.8)" },
      { opacity: 1, transform: "scale(1)", offset: 0.2 },
      { opacity: 1, transform: "scale(1.05)", offset: 0.7 },
      { opacity: 0, transform: "scale(1.1)" },
    ],
    { duration: TOTAL_DURATION, fill: "forwards" },
  );

  // Secondary swirl — offset, slower
  const swirl = createElement(parent, {
    position: "absolute",
    left: "50%",
    top: "48%",
    width: "1100px",
    height: "500px",
    marginLeft: "-550px",
    marginTop: "-250px",
    background: `radial-gradient(ellipse, rgba(${CYAN}, 0.02) 0%, transparent 60%)`,
    filter: "blur(40px)",
  });
  swirl.animate(
    [
      { opacity: 0, transform: "scale(0.9) rotate(-2deg)" },
      { opacity: 0.7, transform: "scale(1) rotate(0deg)", offset: 0.25 },
      { opacity: 0.8, transform: "scale(1.03) rotate(1deg)", offset: 0.65 },
      { opacity: 0, transform: "scale(1.08) rotate(2deg)" },
    ],
    { duration: TOTAL_DURATION, fill: "forwards" },
  );
}

// ── Single Eye ──

function createEye(parent: HTMLElement, side: -1 | 1) {
  const offsetX = side * 130; // px from center
  const baseDelay = 300; // eyes open after darkness settles

  // ── Outer glow (atmosphere around the eye)
  const glow = createElement(parent, {
    position: "absolute",
    left: `calc(50% + ${offsetX}px)`,
    top: "50%",
    width: "180px",
    height: "120px",
    marginLeft: "-90px",
    marginTop: "-60px",
    borderRadius: "50%",
    background: `radial-gradient(ellipse, rgba(${GREEN}, 0.15) 0%, rgba(${GREEN}, 0.05) 40%, transparent 70%)`,
    filter: "blur(18px)",
  });
  glow.animate(
    [
      { opacity: 0, transform: "scale(0.5)" },
      { opacity: 0, transform: "scale(0.5)", offset: 0.1 },
      { opacity: 1, transform: "scale(1)", offset: 0.35 },
      { opacity: 1, transform: "scale(1.1)", offset: 0.55 },
      // Pulse
      { opacity: 0.7, transform: "scale(1.0)", offset: 0.62 },
      { opacity: 1, transform: "scale(1.15)", offset: 0.7 },
      { opacity: 0, transform: "scale(0.8)" },
    ],
    { duration: TOTAL_DURATION, delay: baseDelay, fill: "forwards" },
  );

  // ── Eye shape (almond/slit that opens via scaleY)
  const eyeShape = createElement(parent, {
    position: "absolute",
    left: `calc(50% + ${offsetX}px)`,
    top: "50%",
    width: "110px",
    height: "48px",
    marginLeft: "-55px",
    marginTop: "-24px",
    borderRadius: "50%",
    background: `radial-gradient(ellipse, rgba(${GREEN}, 0.25) 0%, rgba(${GREEN}, 0.08) 50%, transparent 80%)`,
    boxShadow: `0 0 25px rgba(${GREEN}, 0.3), 0 0 50px rgba(${GREEN}, 0.15)`,
    transformOrigin: "center center",
  });
  eyeShape.animate(
    [
      { transform: "scaleY(0.05)", opacity: 0 },
      { transform: "scaleY(0.05)", opacity: 0, offset: 0.08 },
      { transform: "scaleY(0.1)", opacity: 0.5, offset: 0.15 },
      // Slow open
      { transform: "scaleY(0.6)", opacity: 0.8, offset: 0.35 },
      { transform: "scaleY(1)", opacity: 1, offset: 0.45 },
      // Hold open — the stare
      { transform: "scaleY(1)", opacity: 1, offset: 0.6 },
      // Pulse
      { transform: "scaleY(1.1)", opacity: 0.8, offset: 0.65 },
      { transform: "scaleY(1)", opacity: 1, offset: 0.7 },
      // Close
      { transform: "scaleY(0.3)", opacity: 0.6, offset: 0.85 },
      { transform: "scaleY(0.05)", opacity: 0 },
    ],
    { duration: TOTAL_DURATION, delay: baseDelay, fill: "forwards" },
  );

  // ── Iris
  const iris = createElement(parent, {
    position: "absolute",
    left: `calc(50% + ${offsetX}px)`,
    top: "50%",
    width: "36px",
    height: "36px",
    marginLeft: "-18px",
    marginTop: "-18px",
    borderRadius: "50%",
    background: `radial-gradient(circle, rgba(${PALE}, 0.6) 0%, rgba(${GREEN}, 0.4) 40%, rgba(${GREEN}, 0.1) 70%, transparent 100%)`,
    boxShadow: `0 0 16px rgba(${GREEN}, 0.5), 0 0 35px rgba(${GREEN}, 0.25)`,
    transformOrigin: "center center",
  });
  iris.animate(
    [
      { transform: "scaleY(0.05) scale(0.5)", opacity: 0 },
      { transform: "scaleY(0.05) scale(0.5)", opacity: 0, offset: 0.12 },
      { transform: "scaleY(0.3) scale(0.7)", opacity: 0.3, offset: 0.25 },
      { transform: "scaleY(1) scale(1)", opacity: 1, offset: 0.45 },
      // Hold — staring
      { transform: "scaleY(1) scale(1)", opacity: 1, offset: 0.6 },
      // Intensity pulse
      { transform: "scaleY(1) scale(1.15)", opacity: 0.7, offset: 0.65 },
      { transform: "scaleY(1) scale(1)", opacity: 1, offset: 0.7 },
      // Close
      { transform: "scaleY(0.2) scale(0.6)", opacity: 0.4, offset: 0.85 },
      { transform: "scaleY(0.05) scale(0.3)", opacity: 0 },
    ],
    { duration: TOTAL_DURATION, delay: baseDelay, fill: "forwards" },
  );

  // ── Vertical slit pupil
  const pupil = createElement(parent, {
    position: "absolute",
    left: `calc(50% + ${offsetX}px)`,
    top: "50%",
    width: "8px",
    height: "32px",
    marginLeft: "-4px",
    marginTop: "-16px",
    borderRadius: "4px",
    background: `linear-gradient(to bottom, transparent, rgba(${PALE}, 0.8) 30%, rgba(255,255,255,0.95) 50%, rgba(${PALE}, 0.8) 70%, transparent)`,
    boxShadow: `0 0 8px rgba(${PALE}, 0.6), 0 0 20px rgba(${GREEN}, 0.4)`,
    transformOrigin: "center center",
  });
  pupil.animate(
    [
      { transform: "scaleY(0) scaleX(0.5)", opacity: 0 },
      { transform: "scaleY(0) scaleX(0.5)", opacity: 0, offset: 0.15 },
      { transform: "scaleY(0.4) scaleX(0.8)", opacity: 0.4, offset: 0.3 },
      { transform: "scaleY(1) scaleX(1)", opacity: 1, offset: 0.45 },
      // Hold
      { transform: "scaleY(1) scaleX(1)", opacity: 1, offset: 0.6 },
      // Dilate pulse — pupil narrows then widens
      { transform: "scaleY(1) scaleX(0.6)", opacity: 0.9, offset: 0.64 },
      { transform: "scaleY(1) scaleX(1.2)", opacity: 1, offset: 0.7 },
      // Close
      { transform: "scaleY(0.2) scaleX(0.5)", opacity: 0.3, offset: 0.85 },
      { transform: "scaleY(0) scaleX(0.3)", opacity: 0 },
    ],
    { duration: TOTAL_DURATION, delay: baseDelay, fill: "forwards" },
  );

  // ── Specular highlight (cold reflection dot)
  const highlight = createElement(parent, {
    position: "absolute",
    left: `calc(50% + ${offsetX - 6}px)`,
    top: "calc(50% - 6px)",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.7)",
    boxShadow: "0 0 4px rgba(255,255,255,0.5)",
  });
  highlight.animate(
    [
      { opacity: 0 },
      { opacity: 0, offset: 0.35 },
      { opacity: 0.8, offset: 0.5 },
      { opacity: 0.8, offset: 0.6 },
      { opacity: 0.5, offset: 0.65 },
      { opacity: 0.9, offset: 0.7 },
      { opacity: 0, offset: 0.85 },
      { opacity: 0 },
    ],
    { duration: TOTAL_DURATION, delay: baseDelay, fill: "forwards" },
  );
}

// ── Ambient Particles (dark motes drifting upward) ──

function createAmbientParticles(parent: HTMLElement) {
  const particleConfigs = [
    { x: -120, y: 30, size: 3, dur: 2200, del: 400 },
    { x: 80, y: -20, size: 2, dur: 2000, del: 600 },
    { x: -60, y: 50, size: 2.5, dur: 2400, del: 300 },
    { x: 140, y: 10, size: 2, dur: 1800, del: 800 },
    { x: -30, y: -40, size: 3, dur: 2100, del: 500 },
    { x: 100, y: 40, size: 1.5, dur: 2300, del: 700 },
    { x: -100, y: -10, size: 2, dur: 1900, del: 550 },
    { x: 50, y: 60, size: 2.5, dur: 2500, del: 350 },
  ];

  particleConfigs.forEach(({ x, y, size, dur, del }) => {
    const p = createElement(parent, {
      position: "absolute",
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: `rgba(${GREEN}, 0.3)`,
      boxShadow: `0 0 ${size * 2}px rgba(${GREEN}, 0.15)`,
      filter: "blur(0.5px)",
    });
    p.animate(
      [
        { transform: "translateY(0) scale(0)", opacity: 0 },
        { transform: "translateY(-5px) scale(1)", opacity: 0.6, offset: 0.2 },
        {
          transform: "translateY(-25px) scale(0.8)",
          opacity: 0.4,
          offset: 0.7,
        },
        { transform: "translateY(-45px) scale(0.3)", opacity: 0 },
      ],
      { duration: dur, delay: del, fill: "forwards" },
    );
  });
}

// ── Edge Vignette (intensified during effect) ──

function createEdgeVignette(parent: HTMLElement) {
  const el = createElement(parent, {
    position: "absolute",
    inset: "0",
    background:
      "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
  });
  el.animate(
    [
      { opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { opacity: 1, offset: 0.75 },
      { opacity: 0 },
    ],
    { duration: TOTAL_DURATION, fill: "forwards" },
  );
}

// ── Helper ──

function createElement(
  parent: HTMLElement,
  styles: Record<string, string>,
): HTMLElement {
  const el = document.createElement("div");
  Object.assign(el.style, styles);
  parent.appendChild(el);
  return el;
}
