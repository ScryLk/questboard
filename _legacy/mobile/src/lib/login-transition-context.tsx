import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type TransitionState = "idle" | "welcome" | "complete";

interface LoginTransitionContextType {
  state: TransitionState;
  userName: string;
  triggerWelcome: (name: string) => void;
  complete: () => void;
}

const LoginTransitionContext = createContext<LoginTransitionContextType | null>(null);

export function LoginTransitionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TransitionState>("idle");
  const [userName, setUserName] = useState("");

  const triggerWelcome = useCallback((name: string) => {
    setUserName(name);
    setState("welcome");
  }, []);

  const complete = useCallback(() => {
    setState("complete");
    // Reset after a frame so the tab bar entrance animation can finish
    setTimeout(() => setState("idle"), 500);
  }, []);

  return (
    <LoginTransitionContext.Provider
      value={{ state, userName, triggerWelcome, complete }}
    >
      {children}
    </LoginTransitionContext.Provider>
  );
}

export function useLoginTransition() {
  const ctx = useContext(LoginTransitionContext);
  if (!ctx) throw new Error("useLoginTransition must be used within LoginTransitionProvider");
  return ctx;
}
