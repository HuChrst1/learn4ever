// src/components/LanguageSwitcher.tsx
import { useState } from "react";
import { useTranslation } from "../hooks/useTranslation";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSelect = (lang: "en" | "fr") => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="relative z-30">
      {/* Bouton globe */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full bg-[#1b4332]/60 border border-[#52b788]/30 flex items-center justify-center text-[#74c69d] hover:bg-[#1b4332] transition-all shadow-md shadow-black/40"
      >
        {/* Icône globe simple */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </button>

      {/* Menu EN / FR */}
      {open && (
        <div
          className="
            absolute right-0 mt-3 flex items-center gap-2
            bg-[#050d0a]/80 border border-[#2d6a4f]/60 rounded-full px-2 py-1
            shadow-[0_0_25px_rgba(0,0,0,0.6)]
            backdrop-blur-md
            animate-[fadeIn_0.18s_ease-out]
          "
        >
          {/* EN */}
          <button
            type="button"
            onClick={() => handleSelect("en")}
            className={
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all " +
              (language === "en"
                ? "bg-[#52b788] text-[#050d0a] shadow-[0_0_16px_rgba(82,183,136,0.9)]"
                : "bg-[#1b4332] text-[#74c69d] border border-[#2d6a4f] hover:bg-[#1b4332]/80")
            }
          >
            EN
          </button>

          {/* FR */}
          <button
            type="button"
            onClick={() => handleSelect("fr")}
            className={
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all " +
              (language === "fr"
                ? "bg-[#52b788] text-[#050d0a] shadow-[0_0_16px_rgba(82,183,136,0.9)]"
                : "bg-[#1b4332] text-[#74c69d] border border-[#2d6a4f] hover:bg-[#1b4332]/80")
            }
          >
            FR
          </button>
        </div>
      )}
    </div>
  );
}
