// src/pages/OverduePage.tsx
import { useEffect, useState } from "react";
import type { Note, Repetition, Attachment } from "../models/spacedRepetition";
import {
  loadDB,
  updateRepetition,
  updateNoteTitle,
  deleteRepetition,
  archiveNoteAndClean,
  rescheduleFromRepetition,
} from "../services/storage";
import { isBeforeDay } from "../utils/dateUtils";
import { useEffectiveToday } from "../hooks/useEffectiveToday";
import { useTranslation } from "../hooks/useTranslation";
import { NoteActionsMenu } from "../components/NoteActionsMenu";
import { AttachmentModal } from "../components/AttachmentModal";
import { differenceInCalendarDays } from "date-fns";

interface RepetitionWithNote {
  note: Note;
  repetition: Repetition;
}

export function OverduePage() {
  const [items, setItems] = useState<RepetitionWithNote[]>([]);
  const [openAttachment, setOpenAttachment] = useState<Attachment | null>(null);
  const { t, language } = useTranslation();
  const effectiveToday = useEffectiveToday();

  // Chargement des répétitions en retard
  useEffect(() => {
    const db = loadDB();
    const notesById = new Map<string, Note>();
    db.notes.forEach((n) => notesById.set(n.id, n));

    const today = effectiveToday;

    const overdue: RepetitionWithNote[] = db.repetitions
      .filter((rep) => {
        if (rep.status !== "pending") return false;
        const due = new Date(rep.dueDate);
        // dueDate strictement avant "today" (réel ou fake)
        return isBeforeDay(due, today);
      })
      .map((rep) => {
        const note = notesById.get(rep.noteId);
        if (!note) return null;
        if (note.archived) return null; // on ignore les notes archivées
        return { note, repetition: rep };
      })
      .filter((x): x is RepetitionWithNote => x !== null)
      .sort(
        (a, b) =>
          new Date(b.repetition.dueDate).getTime() -
          new Date(a.repetition.dueDate).getTime()
      );

    setItems(overdue);
  }, [effectiveToday]);

  // Texte "il y a X jours/semaines/mois"
  const formatOverdueLabel = (dueDateIso: string): string => {
    const today = effectiveToday;
    const due = new Date(dueDateIso);
    const daysLate = Math.max(
      1,
      differenceInCalendarDays(today, due) // today - due
    );

    if (language === "fr") {
      if (daysLate === 1) return "En retard depuis 1 jour";
      if (daysLate < 7) return `En retard depuis ${daysLate} jours`;

      const weeks = Math.round(daysLate / 7);
      if (weeks < 4) {
        return `En retard depuis ${weeks} semaine${
          weeks > 1 ? "s" : ""
        }`;
      }

      const months = Math.round(daysLate / 30);
      return `En retard depuis ${months} mois`;
    } else {
      // EN
      if (daysLate === 1) return "1 day overdue";
      if (daysLate < 7) return `${daysLate} days overdue`;

      const weeks = Math.round(daysLate / 7);
      if (weeks < 4) {
        return `${weeks} week${weeks > 1 ? "s" : ""} overdue`;
      }

      const months = Math.round(daysLate / 30);
      return `${months} month${months > 1 ? "s" : ""} overdue`;
    }
  };

  // Marquer une répétition comme revue (one-way : elle disparaît de Overdue)
  const handleMarkReviewed = (repId: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.repetition.id === repId);
      if (!target) return prev;

      const current = target.repetition;
      if (current.status === "done") {
        return prev;
      }

      const updated: Repetition = {
        ...current,
        status: "done",
        reviewedAt: new Date().toISOString(),
      };

      updateRepetition(updated);

      // On retire la carte de la liste Overdue
      return prev.filter((it) => it.repetition.id !== repId);
    });
  };

  const handleRenameNote = (noteId: string, currentTitle: string) => {
    const newTitle = window.prompt("Rename note", currentTitle);
    if (!newTitle) return;

    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === currentTitle) return;

    updateNoteTitle(noteId, trimmed);

    setItems((prev) =>
      prev.map((item) =>
        item.note.id === noteId
          ? { ...item, note: { ...item.note, title: trimmed } }
          : item
      )
    );
  };

  const handleDeleteRepetition = (repetitionId: string) => {
    const ok = window.confirm(
      "Delete this review only? This action cannot be undone."
    );
    if (!ok) return;

    deleteRepetition(repetitionId);

    setItems((prev) =>
      prev.filter((item) => item.repetition.id !== repetitionId)
    );
  };

  const handleArchiveNote = (noteId: string) => {
    const ok = window.confirm(
      "Archive this note? All future and overdue reviews for this note will be removed. Past reviews will stay in history."
    );
    if (!ok) return;

    const today = effectiveToday;
    archiveNoteAndClean(noteId, today);

    setItems((prev) => prev.filter((item) => item.note.id !== noteId));
  };

  const handleMoveRepetition = (
    noteId: string,
    repetitionId: string,
    index: number
  ) => {
    const defaultDate = effectiveToday.toISOString().slice(0, 10);

    const input = window.prompt(
      "New date for this review (YYYY-MM-DD)",
      defaultDate
    );

    if (!input) return;

    const parsed = new Date(input + "T12:00:00");
    if (Number.isNaN(parsed.getTime())) {
      window.alert("Invalid date. Please use format YYYY-MM-DD.");
      return;
    }

    rescheduleFromRepetition(noteId, index, parsed);

    // On enlève cette carte de la vue Overdue
    setItems((prev) =>
      prev.filter((item) => item.repetition.id !== repetitionId)
    );
  };

  // Empty state : aucun retard
  if (items.length === 0) {
    return (
      <section className="fade-enter-active flex flex-col text-center pt-16 pr-4 pb-16 pl-4 items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#1b4332] text-[#52b788] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(82,183,136,0.2)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            <path d="M20 2v4" />
            <path d="M22 4h-4" />
            <circle cx="4" cy="20" r="2" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-white tracking-tight">
  {t("overdue.emptyTitle")}
</h2>
<p className="text-[#74c69d] text-sm mt-2 max-w-[240px] leading-relaxed">
  {t("overdue.emptySubtitle")}
</p>
      </section>
    );
  }

  const totalRepetitions = 6; // 1 / 6, 2 / 6, etc.

  return (
    <section className="fade-enter-active flex flex-col gap-5 pb-4">
      <div className="flex items-center justify-end mb-1">
        <span className="bg-[#2d6a4f]/40 text-[#74c69d] border border-[#52b788]/20 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide">
          {items.length} Overdue
        </span>
      </div>

      <div className="flex flex-col gap-5 relative">
        {/* Ligne verticale type timeline */}
        <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#52b788]/30 to-transparent rounded-full z-0" />

        {items.map((item, index) => {
          const { note, repetition } = item;
          const isFirst = index === 0;
          const isDone = repetition.status === "done"; // en pratique, toujours pending ici
          const overdueLabel = formatOverdueLabel(repetition.dueDate);

          return (
            <div key={repetition.id} className="group relative z-10 pl-10">
              {/* Point sur la timeline */}
              <div
                className={`absolute left-2 top-8 rounded-full border-2 border-[#050d0a] ${
                  isFirst ? "w-4 h-4" : "w-3 h-3"
                } bg-[#e63946] shadow-[0_0_12px_rgba(230,57,70,0.7)] z-20`}
              />

              <div
                className={
                  "glass rounded-[2rem] p-1 transition-all duration-300 active:scale-[0.98]" +
                  (isDone ? " opacity-60" : " opacity-100")
                }
              >
                <div className="bg-gradient-to-br from-[#1b4332] to-[#0d1d16] rounded-[1.8rem] p-5 relative">
                  {isFirst && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#e63946]/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold tracking-wider text-[#f28482] uppercase">
                          Overdue
                        </span>
                        <h3 className="text-base font-normal text-white leading-tight">
                          {note.title}
                        </h3>
                      </div>

                      <NoteActionsMenu
                        note={note}
                        repetition={repetition}
                        onRename={() =>
                          handleRenameNote(note.id, note.title)
                        }
                        onMove={() =>
                          handleMoveRepetition(
                            note.id,
                            repetition.id,
                            repetition.index
                          )
                        }
                        onDelete={() =>
                          handleDeleteRepetition(repetition.id)
                        }
                        onArchive={() => handleArchiveNote(note.id)}
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#f28482]">
                          {overdueLabel}
                        </span>
                        <span className="text-[#74c69d]">
                          Repetition {repetition.index} / {totalRepetitions}
                        </span>

                        {note.attachment && (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenAttachment(note.attachment!)
                            }
                            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[#1b4332]/70 border border-[#2d6a4f]/70 text-[#b7e4c7]"
                          >
                            <span>📎</span>
                            <span>{t("attachment.badge.one")}</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMarkReviewed(repetition.id)}
                        className="pl-3 pr-2 py-1 rounded-full text-xs font-medium flex items-center gap-2 transition-all bg-[#52b788] text-[#050d0a] hover:bg-[#40916c]"
                      >
                        Review
                        <span className="bg-[#050d0a]/20 w-6 h-6 rounded-full flex items-center justify-center">
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
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AttachmentModal
        attachment={openAttachment}
        onClose={() => setOpenAttachment(null)}
      />
    </section>
  );
}