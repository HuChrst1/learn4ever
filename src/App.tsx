// src/App.tsx
import { useEffect, useState } from "react";
import "./App.css";

import { TodayPage } from "./pages/TodayPage";
import { NewNotePage } from "./pages/NewNotePage";
import { OverduePage } from "./pages/OverduePage";

import { CalendarStrip } from "./components/CalendarStrip";
import { todayStart } from "./utils/dateUtils";

import { format } from "date-fns";
import { useTranslation } from "./hooks/useTranslation";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { getDateLocale } from "./i18n/dateLocale";

import { DebugPage } from "./pages/DebugPage";
import { HowToInstallModal } from "./components/HowToInstallModal";
import { NotificationBell } from "./components/NotificationBell";
import { DataBackupModal } from "./components/DataBackupModal";


export type TabName = "today" | "create" | "overdue";

function App() {
  const [activeTab, setActiveTab] = useState<TabName>("today");
  const [selectedDate, setSelectedDate] = useState<Date>(() => todayStart());
  const [isDebug, setIsDebug] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const { t, language } = useTranslation();
  const dateLocale = getDateLocale(language);

  // #debug → affiche la DebugPage
  useEffect(() => {
    const checkHash = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.toLowerCase();
      setIsDebug(hash === "#debug");
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  // --- Vue spéciale debug ---------------------------------------------------
  if (isDebug) {
    return (
      <div className="antialiased min-h-screen bg-[#050d0a] text-[#d8f3dc] flex justify-center">
        <div className="relative w-full max-w-md min-h-screen selection:bg-[#52b788] selection:text-[#050d0a] overflow-x-hidden">
          {/* halos de fond */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 bg-[#1b4332] opacity-40 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none z-0" />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#2d6a4f] opacity-20 blur-[80px] rounded-full translate-y-1/3 pointer-events-none z-0" />

          <main className="w-full flex flex-col relative z-10 pb-8 min-h-screen">
            <DebugPage />
          </main>
        </div>
      </div>
    );
  }

  // --- Vue normale ----------------------------------------------------------
  return (
    <div className="antialiased min-h-screen bg-[#050d0a] text-[#d8f3dc] flex justify-center">
      {/* Conteneur "téléphone" */}
      <div className="relative w-full max-w-md min-h-screen selection:bg-[#52b788] selection:text-[#050d0a] overflow-x-hidden">
        {/* halos de fond */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 bg-[#1b4332] opacity-40 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none z-0" />
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#2d6a4f] opacity-20 blur-[80px] rounded-full translate-y-1/3 pointer-events-none z-0" />

        <main className="w-full flex flex-col relative z-10 pb-28 min-h-screen">
          {/* HEADER */}
          <header className="pt-8 px-6 flex flex-col gap-6">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#52b788] to-[#1b4332] flex items-center justify-center text-[#050d0a] font-bold text-sm shadow-lg shadow-[#52b788]/20">
                  SN
                </div>
                <div>
                  <p className="text-xs text-[#74c69d] font-normal">
                    {t("header.welcomeBack")}
                  </p>
                  <h1 className="text-base font-medium text-[#d8f3dc]">
                    {activeTab === "today"
                      ? t("header.readyToReview")
                      : t("header.createNote")}
                  </h1>
                </div>
              </div>

              {/* À droite : cloche + globe + paramètres */}
              <div className="flex items-center gap-2">
                   <NotificationBell />
                   <LanguageSwitcher />
                   <button
                     onClick={() => setShowBackupModal(true)}
                     className="w-10 h-10 rounded-full flex items-center justify-center text-[#74c69d] hover:text-[#d8f3dc] hover:bg-[#1b4332] transition-all"
                     aria-label="Settings"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                       <circle cx="12" cy="12" r="3" />
                     </svg>
                   </button>
              </div>
            </div>

            {/* Mois courant */}
            <p className="text-xs text-[#74c69d] tracking-wide uppercase">
              {format(selectedDate, "MMMM yyyy", { locale: dateLocale })}
            </p>

            {/* Lien aide installation */}
            <button
              type="button"
              onClick={() => setShowInstallHelp(true)}
              className="self-end text-[10px] text-[#74c69d] hover:text-[#d8f3dc] underline underline-offset-2"
            >
              How to install on iPhone
            </button>

            {/* Calendrier horizontal (uniquement Today) */}
            {activeTab === "today" && (
              <CalendarStrip
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </header>

          {/* CONTENU */}
          <div className="relative mt-8 px-6 flex-1">
            {activeTab === "today" && (
              <TodayPage selectedDate={selectedDate} />
            )}
            {activeTab === "create" && <NewNotePage />}
            {activeTab === "overdue" && <OverduePage />}
          </div>
        </main>

        {/* Modale "How to install" */}
        <HowToInstallModal
          open={showInstallHelp}
          onClose={() => setShowInstallHelp(false)}
        />

        <DataBackupModal
          open={showBackupModal}
          onClose={() => setShowBackupModal(false)}
        />

        {/* BOTTOM NAV */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-6 z-50 pointer-events-none">
          <div className="glass-nav rounded-[2rem] px-2 py-2 flex justify-between items-center shadow-2xl shadow-black/50 pointer-events-auto">
            {/* Today */}
            <button
              onClick={() => setActiveTab("today")}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[1.5rem] transition-all ${
                activeTab === "today"
                  ? "text-[#52b788]"
                  : "text-[#74c69d] hover:text-[#d8f3dc]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mb-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M3 10h18" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
                <path d="M16 18h.01" />
              </svg>
              <span className="text-[10px] font-medium">
                {t("tab.today")}
              </span>
            </button>

            <div className="w-px h-8 bg-[#2d6a4f]/40" />

            {/* Add Note */}
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[1.5rem] transition-all ${
                activeTab === "create"
                  ? "text-[#52b788]"
                  : "text-[#74c69d] hover:text-[#d8f3dc]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mb-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
              <span className="text-[10px] font-medium">
                {t("tab.addNote")}
              </span>
            </button>

            <div className="w-px h-8 bg-[#2d6a4f]/40" />

            {/* Overdue */}
            <button
              type="button"
              onClick={() => setActiveTab("overdue")}
              className={
                "flex-1 flex flex-col items-center gap-1 py-3 rounded-[1.5rem] transition-all " +
                (activeTab === "overdue"
                  ? "text-[#52b788]"
                  : "text-[#74c69d] hover:text-[#d8f3dc] opacity-80")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mb-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span className="text-[10px] font-medium">
                {t("tab.overdue")}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;

