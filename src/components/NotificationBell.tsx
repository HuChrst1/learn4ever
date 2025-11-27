// src/components/NotificationBell.tsx
import { useEffect, useState, type ChangeEvent } from "react";
import { loadDB } from "../services/storage";
import { todayStart, isDueOnDate } from "../utils/dateUtils";
import { useTranslation } from "../hooks/useTranslation";

const STORAGE_KEY = "learn4ever.notification.settings";

interface NotificationSettings {
  enabled: boolean;
  hour: number; // 0–23
  minute: number; // 0–59
  lastNotifiedDate?: string; // "YYYY-MM-DD"
}

function loadSettings(): NotificationSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.enabled === "boolean" &&
      typeof parsed.hour === "number" &&
      typeof parsed.minute === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveSettings(settings: NotificationSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // on ignore
  }
}

function formatTime(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, "0");
  const m = minute.toString().padStart(2, "0");
  return `${h}:${m}`;
}

// renvoie "YYYY-MM-DD" pour une date
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function NotificationBell() {
  const { t, language } = useTranslation();

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const loaded = loadSettings();
    return (
      loaded ?? {
        enabled: false,
        hour: 12,
        minute: 0,
        lastNotifiedDate: undefined,
      }
    );
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isRequesting, setIsRequesting] = useState(false);

  // Vérifier si les notifications sont supportées
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSupported("Notification" in window);
  }, []);

  // Sauvegarde dans localStorage à chaque changement
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Au montage + à chaque changement d’horaire / activation :
  // si on est proche de l’heure choisie et pas encore notifié aujourd’hui → notif
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (!settings.enabled) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const todayStr = ymd(now);

    // déjà notifié aujourd’hui ?
    if (settings.lastNotifiedDate === todayStr) {
      return;
    }

    // heure cible aujourd’hui
    const target = new Date();
    target.setHours(settings.hour, settings.minute, 0, 0);

    const diffMs = Math.abs(now.getTime() - target.getTime());
    const windowMs = 30 * 60 * 1000; // fenêtre de 30 minutes

    if (diffMs > windowMs) {
      return;
    }

    // Calcul du nombre de révisions en attente aujourd’hui
    const db = loadDB();
    const today = todayStart();
    const pendingCount = db.repetitions.filter(
      (rep) => rep.status === "pending" && isDueOnDate(rep.dueDate, today)
    ).length;

    const title = "Learn4ever";

    // Corps du message localisé
    let body: string;
    if (pendingCount > 0) {
      if (language === "fr") {
        body =
          pendingCount === 1
            ? "Tu as 1 note à réviser aujourd'hui."
            : `Tu as ${pendingCount} notes à réviser aujourd'hui.`;
      } else {
        body =
          pendingCount === 1
            ? "You have 1 note to review today."
            : `You have ${pendingCount} notes to review today.`;
      }
    } else {
      body =
        language === "fr"
          ? "C'est l'heure de revoir tes notes."
          : "Time to review your notes.";
    }

    try {
      new Notification(title, { body });
      setSettings((prev) => ({
        ...prev,
        lastNotifiedDate: todayStr,
      }));
    } catch {
      // si la notif échoue, on ignore
    }
  }, [settings.enabled, settings.hour, settings.minute, language]);

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // "HH:MM"
    const [hStr, mStr] = value.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isNaN(h) || Number.isNaN(m)) return;

    setSettings((prev) => ({
      ...prev,
      hour: Math.min(23, Math.max(0, h)),
      minute: Math.min(59, Math.max(0, m)),
    }));
  };

  const handleToggle = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      // petit message FR/EN direct
      alert(
        language === "fr"
          ? "Les notifications ne sont pas supportées sur cet appareil."
          : "Notifications are not supported on this device."
      );
      return;
    }

    if (settings.enabled) {
      // désactivation simple
      setSettings((prev) => ({ ...prev, enabled: false }));
      return;
    }

    // activation → demander la permission
    setIsRequesting(true);
    try {
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        alert(t("notifications.permissionDenied"));
        return;
      }
      setSettings((prev) => ({ ...prev, enabled: true }));
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isSupported) {
    // pas de Notification API → on cache la cloche
    return null;
  }

  return (
    <>
      {/* Bouton cloche dans le header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full bg-[#1b4332]/50 hover:bg-[#1b4332] text-[#74c69d] transition-colors border border-[#52b788]/10 relative"
        title={t("notifications.bellTooltip")}
      >
        {/* icône cloche */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.268 21a2 2 0 0 0 3.464 0" />
          <path d="M4 10a8 8 0 0 1 16 0c0 3.87 1.5 5 2 6H2c.5-1 2-2.13 2-6Z" />
        </svg>
        {settings.enabled && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#52b788]" />
        )}
      </button>

      {/* Petite modale de réglage */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass w-full max-w-xs mx-4 rounded-3xl p-5 relative">
            <h2 className="text-sm font-medium text-white mb-2">
              {t("notifications.panelTitle")}
            </h2>
            <p className="text-xs text-[#74c69d] mb-4">
              {t("notifications.testInfo")}
            </p>

            <label className="flex flex-col gap-2 mb-4 text-xs text-[#d8f3dc]">
              <span className="text-[11px] font-semibold text-[#74c69d] uppercase tracking-widest">
                {t("notifications.timeLabel")}
              </span>
              <input
                type="time"
                value={formatTime(settings.hour, settings.minute)}
                onChange={handleTimeChange}
                className="bg-[#050d0a]/60 border border-[#2d6a4f] rounded-xl px-3 py-2 text-xs text-[#d8f3dc] outline-none focus:ring-2 focus:ring-[#52b788]/40 focus:border-[#52b788]"
              />
            </label>

            <button
              type="button"
              onClick={handleToggle}
              disabled={isRequesting}
              className="w-full mb-3 text-xs font-medium rounded-xl px-4 py-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-[#52b788] text-[#050d0a] hover:bg-[#40916c]"
            >
              {settings.enabled
                ? language === "fr"
                  ? "Désactiver le rappel"
                  : "Disable reminder"
                : t("notifications.enableButton")}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full text-xs font-medium text-[#74c69d] hover:text-[#d8f3dc] py-1"
            >
              {language === "fr" ? "Fermer" : "Close"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

