import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UILanguage } from "@/lib/constants"
import { DEFAULT_UI_LANGUAGE } from "@/lib/constants"

interface UIState {
  sidebarCollapsed: boolean
  locale: UILanguage
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setLocale: (locale: UILanguage) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      locale: DEFAULT_UI_LANGUAGE,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "translator-ui",
      partialize: (state) => ({ locale: state.locale }),
    },
  ),
)
