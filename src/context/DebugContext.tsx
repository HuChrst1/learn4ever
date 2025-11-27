// src/context/DebugContext.tsx
import {
    createContext,
    useContext,
    useState,
    type ReactNode,
  } from "react";
  
  const FAKE_TODAY_KEY = "sn_fakeToday";
  
  export interface DebugContextValue {
    fakeToday: Date | null;
    setFakeToday: (date: Date | null) => void;
    clearFakeToday: () => void;
    resetAllData: () => void;
  }
  
  const DebugContext = createContext<DebugContextValue | undefined>(undefined);
  
  export function DebugProvider({ children }: { children: ReactNode }) {
    // Lecture de la fake date au démarrage depuis localStorage
    const [fakeToday, setFakeTodayState] = useState<Date | null>(() => {
      if (typeof window === "undefined") return null;
      try {
        const stored = window.localStorage.getItem(FAKE_TODAY_KEY);
        if (!stored) return null;
        const d = new Date(stored);
        if (Number.isNaN(d.getTime())) return null;
        return d;
      } catch {
        return null;
      }
    });
  
    const setFakeToday = (date: Date | null) => {
      setFakeTodayState(date);
      try {
        if (date) {
          window.localStorage.setItem(FAKE_TODAY_KEY, date.toISOString());
        } else {
          window.localStorage.removeItem(FAKE_TODAY_KEY);
        }
      } catch {
        // on ignore les erreurs de stockage
      }
    };
      // 🔹 nouvelle fonction : juste un wrapper pratique
      const clearFakeToday = () => {
        setFakeToday(null);
      };

    const resetAllData = () => {
      try {
        // Comme l'app est perso, on peut se permettre de tout vider
        window.localStorage.clear();
      } catch {
        // rien
      }
      // On repart sur une app complètement vierge
      window.location.reload();
    };
  
    const value: DebugContextValue = {
      fakeToday,
      setFakeToday,
      clearFakeToday,
      resetAllData,
    };
  
    return (
      <DebugContext.Provider value={value}>
        {children}
      </DebugContext.Provider>
    );
  }
  
  export function useDebug(): DebugContextValue {
    const ctx = useContext(DebugContext);
    if (!ctx) {
      throw new Error("useDebug must be used inside a DebugProvider");
    }
    return ctx;
  }
  