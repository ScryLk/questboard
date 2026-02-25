import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function SplashPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      // TODO: Check auth state — if authenticated go to /, else /auth
      navigate("/auth");
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-6">
      <div
        className={`transition-all duration-slow ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <div className="text-6xl font-display font-extrabold text-accent tracking-tight">
          QB
        </div>
      </div>
      <div
        className={`transition-all duration-slow delay-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-text-muted text-sm font-body">Sua mesa de RPG, online</p>
      </div>
      <div className="mt-8">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
