"use client";

import Link from "next/link";

export default function LandingPage() {

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-brand-primary">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Nebula / Aurora layers */}
        <div className="hero-nebula hero-nebula-1" />
        <div className="hero-nebula hero-nebula-2" />
        <div className="hero-nebula hero-nebula-3" />

        {/* Star field */}
        <div className="hero-stars" />
        <div className="hero-stars-2" />

        {/* Light sweep */}
        <div className="hero-sweep" />

        {/* Floating embers */}
        {[
          { left: "7%", bottom: "-2%", delay: "0s", duration: "14s", size: 2.5 },
          { left: "18%", bottom: "-6%", delay: "3s", duration: "18s", size: 2 },
          { left: "32%", bottom: "-4%", delay: "7s", duration: "16s", size: 3 },
          { left: "48%", bottom: "-8%", delay: "1s", duration: "20s", size: 2 },
          { left: "60%", bottom: "-3%", delay: "5s", duration: "15s", size: 2.5 },
          { left: "72%", bottom: "-7%", delay: "9s", duration: "17s", size: 1.5 },
          { left: "85%", bottom: "-5%", delay: "4s", duration: "19s", size: 2 },
          { left: "93%", bottom: "-1%", delay: "11s", duration: "14s", size: 3 },
          { left: "40%", bottom: "-9%", delay: "6s", duration: "22s", size: 1.5 },
          { left: "55%", bottom: "-4%", delay: "13s", duration: "16s", size: 2 },
        ].map((e, i) => (
          <div
            key={i}
            className="hero-ember"
            style={{
              left: e.left,
              bottom: e.bottom,
              width: e.size,
              height: e.size,
              animationDelay: e.delay,
              animationDuration: e.duration,
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.15) 40%, rgba(10,10,15,0.25) 60%, rgba(10,10,15,0.80) 100%)",
          }}
        />
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.55) 100%)",
        }}
      />

      {/* Content */}
      <div className="fixed inset-0 z-10 flex flex-col justify-between p-8 md:px-12 md:py-8">
        {/* Navbar */}
        <nav className="animate-fade-down flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Shield icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-accent shadow-[0_0_20px_rgba(124,92,252,0.4)]">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-white"
              >
                <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" />
              </svg>
            </div>
            <span className="font-cinzel text-xl font-semibold tracking-wide text-white">
              QuestBoard
            </span>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/[0.08] px-4 py-2 text-[13px] text-white/80 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[15px] w-[15px]"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            Painel do Mestre
          </Link>
        </nav>

        {/* Hero — right aligned */}
        <div className="flex items-center justify-end">
          <div className="flex max-w-[480px] flex-col items-end gap-5 text-right md:items-end md:text-right max-md:items-start max-md:text-left max-md:max-w-full">
            <p className="animate-fade-up-1 font-cinzel text-[10px] font-normal uppercase tracking-[0.35em] text-brand-gold">
              Sua Mesa de RPG Online
            </p>

            <h1
              className="animate-fade-up-2 font-cinzel text-[clamp(34px,4vw,58px)] font-black leading-[1.1] text-white"
              style={{
                textShadow:
                  "0 0 60px rgba(124,92,252,0.3), 0 2px 30px rgba(0,0,0,0.7)",
              }}
            >
              Onde a{" "}
              <span className="bg-gradient-to-br from-purple-400 to-brand-accent bg-clip-text text-transparent">
                historia
              </span>
              <br />
              ganha vida
            </h1>

            <p className="animate-fade-up-3 max-w-[340px] text-sm font-light leading-[1.7] text-white/50">
              Gerencie campanhas, sessoes e personagens com sua mesa — de
              qualquer lugar, em tempo real.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-up-4 mt-1 flex flex-wrap items-center justify-end gap-2.5 max-md:justify-start">
              {/* App Store */}
              <a
                href="#"
                title="App Store"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.08] text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/20"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[22px] w-[22px]">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </a>

              {/* Google Play */}
              <a
                href="#"
                title="Google Play"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.08] text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/20"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[22px] w-[22px]">
                  <path d="M3.18 23.76c.3.17.64.24.99.2L14.38 12 3.18.04c-.35-.04-.69.03-.99.2C1.59.8 1.2 1.57 1.2 2.48v19.04c0 .91.39 1.68.98 2.24zM15.84 13.46l2.79 2.79-9.09 5.23 6.3-8.02zM22.3 10.51c.42.3.7.78.7 1.49s-.28 1.19-.7 1.49l-2.77 1.59-3.14-3.14 3.14-3.14 2.77 1.71z" />
                </svg>
              </a>

              {/* Web App */}
              <Link
                href="/dashboard"
                className="flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-5 text-[13px] font-normal tracking-wide text-white/80 backdrop-blur-sm transition-colors hover:border-brand-accent hover:bg-brand-accent/[0.12] hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[15px] w-[15px]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                Usar no Navegador
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="animate-fade-up-5 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-5">
          {/* System badges */}
          <div className="flex items-center gap-2">
            {["D&D 5e", "Tormenta 20", "CoC", "+12 sistemas"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/20 px-2.5 py-1 text-[11px] tracking-wide text-white/50"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Spacer for balance */}
          <div className="w-[200px] max-md:hidden" />
        </div>
      </div>
    </div>
  );
}
