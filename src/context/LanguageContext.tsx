// src/context/LanguageContext.tsx
import {
    createContext,
    useState,
    useEffect,
    type ReactNode,
    useMemo,
  } from "react";
  import {
    DEFAULT_LANGUAGE,
    type Language,
    type MessageKey,
    translate,
  } from "../i18n/messages";
  
  const STORAGE_KEY = "spaced-notes-language";
  
  export interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  }
  
  export const LanguageContext = createContext<LanguageContextValue | undefined>(
    undefined
  );
  
  interface LanguageProviderProps {
    children: ReactNode;
  }
  
  export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  
    // Au montage : essayer de charger la langue depuis localStorage
    useEffect(() => {
      if (typeof window === "undefined") return;
  
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fr") {
        setLanguageState(stored);
      }
    }, []);
  
    const setLanguage = (lang: Language) => {
      setLanguageState(lang);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, lang);
      }
    };
  
    const value: LanguageContextValue = useMemo(
      () => ({
        language,
        setLanguage,
        t: (key, vars) => translate(language, key, vars),
      }),
      [language]
    );
  
    return (
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    );
  }
  