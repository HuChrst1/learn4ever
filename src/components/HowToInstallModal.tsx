// src/components/HowToInstallModal.tsx
import { useTranslation } from "../hooks/useTranslation";

interface HowToInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowToInstallModal({ open, onClose }: HowToInstallModalProps) {
  const { language } = useTranslation(); // juste pour savoir FR / EN

  if (!open) return null;

  const isFrench = language === "fr";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="glass w-full max-w-sm mx-4 rounded-3xl p-6 relative">
        {/* Bouton fermer (croix en haut à droite) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-[#1b4332]/70 flex items-center justify-center text-[#b7e4c7] hover:bg-[#2d6a4f] transition-colors"
          aria-label={isFrench ? "Fermer" : "Close"}
        >
          <span className="text-sm">×</span>
        </button>

        <h2 className="text-lg font-medium text-white mb-3">
          {isFrench ? "Installer Learn4ever" : "Install Learn4ever"}
        </h2>

        <p className="text-xs text-[#b7e4c7] mb-3">
          {isFrench
            ? "Sur iPhone (Safari) :"
            : "On iPhone (Safari):"}
        </p>

        <ol className="list-decimal pl-5 space-y-2 text-xs text-[#d8f3dc] mb-4">
          <li>
            {isFrench
              ? "Appuie sur le bouton Partager (carré avec une flèche vers le haut)."
              : "Tap the Share button (square with an arrow ↑)."}
          </li>
          <li>
            {isFrench
              ? 'Choisis "Ajouter à l’écran d’accueil".'
              : 'Choose "Add to Home Screen".'}
          </li>
          <li>
            {isFrench
              ? 'Vérifie le nom "Learn4ever", puis appuie sur "Ajouter".'
              : 'Check the name "Learn4ever", then tap "Add".'}
          </li>
          <li>
            {isFrench
              ? "Ouvre Learn4ever depuis ton écran d’accueil comme une app classique."
              : "Open Learn4ever from your home screen like a normal app."}
          </li>
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full text-xs font-medium rounded-full bg-[#52b788] text-[#050d0a] py-2.5 hover:bg-[#40916c] transition-colors"
        >
          {isFrench ? "J'ai compris" : "Got it"}
        </button>
      </div>
    </div>
  );
}
