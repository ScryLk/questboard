import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface CreateSheetContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CreateSheetContext = createContext<CreateSheetContextType | null>(null);

export function CreateSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CreateSheetContext.Provider value={{ isOpen, open, close }}>
      {children}
    </CreateSheetContext.Provider>
  );
}

export function useCreateSheet() {
  const ctx = useContext(CreateSheetContext);
  if (!ctx) throw new Error("useCreateSheet must be used within CreateSheetProvider");
  return ctx;
}
