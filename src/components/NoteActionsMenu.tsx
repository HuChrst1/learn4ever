// src/components/NoteActionsMenu.tsx
import { useState } from "react";
import type { Note, Repetition } from "../models/spacedRepetition";

type NoteActionsMenuProps = {
  note: Note;
  repetition: Repetition;
  onRename?: () => void;
  onMove?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
};

export function NoteActionsMenu({
    note,
    repetition: _repetition,
    onRename,
    onMove,
    onDelete,
    onArchive,
  }: NoteActionsMenuProps) {
  
  const [open, setOpen] = useState(false);

  const handleAction = (action?: () => void) => {
    if (action) {
      action();
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Bouton 3 points */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full bg-[#ffffff]/10 flex items-center justify-center text-[#d8f3dc] hover:bg-[#ffffff]/20 transition-colors relative z-20"
        aria-label={`Actions for note ${note.title}`}
      >
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
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {/* Menu arrondi autour du bouton */}
      {open && (
        <div className="absolute right-0 top-0 z-10 pointer-events-none">
          {/* Conteneur centré autour du bouton 3 points */}
          <div className="relative w-28 h-28 -translate-x-1/2 -translate-y-1/2">
            {/* Renommer – au-dessus */}
            <button
              type="button"
              onClick={() => handleAction(onRename)}
              className="absolute w-9 h-9 rounded-full bg-[#1b4332] border border-[#52b788]/60 flex items-center justify-center text-[#d8f3dc] text-[10px] shadow-[0_0_12px_rgba(82,183,136,0.6)] hover:bg-[#2d6a4f] transition-all pointer-events-auto"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) translate(0, -42px)",
              }}
              aria-label="Rename note"
              title="Rename"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 17 2 2 14-14-2-2Z" />
                <path d="M14 3 21 10" />
                <path d="M3 21h7" />
              </svg>
            </button>

            {/* Déplacer – à droite */}
            <button
              type="button"
              onClick={() => handleAction(onMove)}
              className="absolute w-9 h-9 rounded-full bg-[#1b4332] border border-[#52b788]/60 flex items-center justify-center text-[#d8f3dc] text-[10px] shadow-[0_0_12px_rgba(82,183,136,0.6)] hover:bg-[#2d6a4f] transition-all pointer-events-auto"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) translate(42px, 0)",
              }}
              aria-label="Move review"
              title="Move"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
            </button>

            {/* Supprimer – en dessous */}
            <button
              type="button"
              onClick={() => handleAction(onDelete)}
              className="absolute w-9 h-9 rounded-full bg-[#1b4332] border border-[#e63946]/60 flex items-center justify-center text-[#ffb4b4] text-[10px] shadow-[0_0_12px_rgba(230,57,70,0.7)] hover:bg-[#2b1b1b] transition-all pointer-events-auto"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) translate(0, 42px)",
              }}
              aria-label="Delete review"
              title="Delete"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>

            {/* Archiver – à gauche */}
            <button
              type="button"
              onClick={() => handleAction(onArchive)}
              className="absolute w-9 h-9 rounded-full bg-[#1b4332] border border-[#52b788]/60 flex items-center justify-center text-[#d8f3dc] text-[10px] shadow-[0_0_12px_rgba(82,183,136,0.6)] hover:bg-[#2d6a4f] transition-all pointer-events-auto"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) translate(-42px, 0)",
              }}
              aria-label="Archive note"
              title="Archive"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="4" rx="1" />
                <path d="M5 7v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
                <path d="M10 12h4" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
