import { create } from "zustand";

/**
 * Estado do drawer mobile do dashboard. Em `<md` o sidebar esconde e
 * vira drawer flutuante; `open` controla se está aberto. Em desktop o
 * sidebar é sempre visível e o estado é irrelevante.
 *
 * Store separado (em vez de useState no layout) pra o botão hamburger
 * no header e os links do sidebar conseguirem tocar no mesmo estado
 * sem prop drilling.
 */
interface MobileSidebarState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useMobileSidebar = create<MobileSidebarState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
