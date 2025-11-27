// src/pages/TodayPage.tsx
import { useEffect, useState } from "react";
import type {
  Note,
  Repetition,
  Attachment,
} from "../models/spacedRepetition";
import { SPACED_INTERVALS_DAYS } from "../models/spacedRepetition";
import {
  loadDB,
  updateRepetition,
  updateNoteTitle,
  updateNoteAttachment,
  deleteRepetition,
  archiveNoteAndClean,
  rescheduleFromRepetition,
} from "../services/storage";
import { isDueOnDate, isBeforeDay } from "../utils/dateUtils";
import {
  hasShownCongratsForDate,
  markCongratsShownForDate,
} from "../utils/celebrationStorage";
import { CongratsPopup } from "../components/CongratsPopup";
import { NoteActionsMenu } from "../components/NoteActionsMenu";
import { AttachmentModal } from "../components/AttachmentModal";
import { EditNoteModal } from "../components/EditNoteModal";
import { useTranslation } from "../hooks/useTranslation";
import { useEffectiveToday } from "../hooks/useEffectiveToday.ts";


interface RepetitionWithNote {
  note: Note;
  repetition: Repetition;
}

function sortRepetitionItems(items: RepetitionWithNote[]): RepetitionWithNote[] {
  return [...items].sort((a, b) => {
    // 1) pending en haut, done en bas
    if (a.repetition.status !== b.repetition.status) {
      return a.repetition.status === "pending" ? -1 : 1;
    }
    // 2) à statut égal, on trie par index (1 à 6)
    return a.repetition.index - b.repetition.index;
  });
}

export function TodayPage({ selectedDate }: { selectedDate: Date }) {
  const [items, setItems] = useState<RepetitionWithNote[]>([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [openAttachment, setOpenAttachment] = useState<Attachment | null>(null);

  // note actuellement en édition (titre + pièce jointe)
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const { t: rawT } = useTranslation();
  const t = (key: string) => rawT(key as any);

  const effectiveToday = useEffectiveToday();

  // Charger les répétitions du jour sélectionné
  useEffect(() => {
    const db = loadDB();
    const notesById = new Map<string, Note>();
    db.notes.forEach((n) => notesById.set(n.id, n));

    const isPastDay = isBeforeDay(selectedDate, effectiveToday);

    const forSelectedDay: RepetitionWithNote[] = db.repetitions
      .filter((rep) => isDueOnDate(rep.dueDate, selectedDate))
      .map((rep) => {
        const note = notesById.get(rep.noteId);
        if (!note) return null;

        // Si la note est archivée et que la date n'est pas passée,
        // on ignore cette répétition (on garde l'historique).
        if (note.archived && !isPastDay) {
          return null;
        }

        return { note, repetition: rep };
      })
      .filter((item): item is RepetitionWithNote => item !== null);

    setItems(sortRepetitionItems(forSelectedDay));
}, [selectedDate, effectiveToday]);

  // Détection "toutes les révisions de ce jour sont done"
  useEffect(() => {
    if (items.length === 0) return;

    const allDone = items.every((it) => it.repetition.status === "done");
    if (!allDone) return;

    if (hasShownCongratsForDate(selectedDate)) return;

    setShowCongrats(true);
    markCongratsShownForDate(selectedDate);
  }, [items, selectedDate]);

  // Auto-fermeture du popup de félicitations
  useEffect(() => {
    if (!showCongrats) return;
    const timeout = setTimeout(() => setShowCongrats(false), 2000);
    return () => clearTimeout(timeout);
  }, [showCongrats]);

  const totalRepetitions = SPACED_INTERVALS_DAYS.length;

  const handleMarkReviewed = (repId: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.repetition.id === repId);
      if (!target) return prev;

      const current = target.repetition;
      const nextStatus = current.status === "pending" ? "done" : "pending";

      const updated: Repetition = {
        ...current,
        status: nextStatus,
        reviewedAt: nextStatus === "done" ? new Date().toISOString() : null,
      };

      updateRepetition(updated);

      const updatedItems = prev.map((it) =>
        it.repetition.id === repId ? { ...it, repetition: updated } : it
      );

      return sortRepetitionItems(updatedItems);
    });
  };

  // Ouvre la modale d’édition pour cette note
  const openEditModalForNote = (note: Note) => {
    setEditingNote(note);
  };

  // Sauvegarde venant de la modale (titre + pièce jointe)
  const handleSaveEditNote = (params: {
    newTitle: string;
    attachment: Attachment | null | undefined;
  }) => {
    if (!editingNote) return;

    const { newTitle, attachment } = params;
    const noteId = editingNote.id;

    // 1) Base de données : null = aucune pièce jointe
    updateNoteTitle(noteId, newTitle);
    updateNoteAttachment(noteId, attachment ?? null);

    // 2) State local : undefined = aucune pièce jointe
    setItems((prev) =>
      prev.map((item) =>
        item.note.id === noteId
          ? {
              ...item,
              note: {
                ...item.note,
                title: newTitle,
                // si pas de pièce jointe => undefined (pas null)
                attachment: attachment ?? undefined,
              },
            }
          : item
      )
    );

    // 3) Fermer la modale
    setEditingNote(null);
  };

  const handleDeleteRepetition = (repetitionId: string) => {
    const ok = window.confirm(
      "Delete this review only? This action cannot be undone."
    );
    if (!ok) return;

    deleteRepetition(repetitionId);

    setItems((prev) =>
      prev.filter((it) => it.repetition.id !== repetitionId)
    );
  };

  const handleArchiveNote = (noteId: string) => {
    const ok = window.confirm(
      "Archive this note? All future and overdue reviews for this note will be removed. Past reviews will stay in history."
    );
    if (!ok) return;

    // utilise la vraie date OU la fake date (Debug)
    const today = effectiveToday;
    archiveNoteAndClean(noteId, today);

    setItems((prev) => prev.filter((it) => it.note.id !== noteId));
  };

  const handleMoveRepetition = (
    noteId: string,
    repetitionId: string,
    index: number
  ) => {
    const defaultDate = selectedDate.toISOString().slice(0, 10); // YYYY-MM-DD
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

    setItems((prev) =>
      prev.filter((it) => it.repetition.id !== repetitionId)
    );
  };

  // État vide pour ce jour
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
  {t("today.allCaughtUpTitle")}
</h2>
<p className="text-[#74c69d] text-sm mt-2 max-w-[240px] leading-relaxed">
  {t("today.allCaughtUpSubtitle")}
</p>

        <CongratsPopup
          visible={showCongrats}
          onClose={() => setShowCongrats(false)}
        />

        <AttachmentModal
          attachment={openAttachment}
          onClose={() => setOpenAttachment(null)}
        />
      </section>
    );
  }

  const pendingCount = items.filter(
    (it) => it.repetition.status === "pending"
  ).length;

  return (
    <section className="fade-enter-active flex flex-col gap-5 pb-4">
      <div className="flex items-center justify-end mb-1">
      <span className="bg-[#2d6a4f]/40 text-[#74c69d] border border-[#52b788]/20 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide">
  {pendingCount} {t("today.pendingLabel")}
</span>
      </div>

      <div className="flex flex-col gap-5 relative">
        {/* Ligne verticale pour l'effet timeline */}
        <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#52b788]/30 to-transparent rounded-full z-0" />

        {items.map((item, index) => {
          const { note, repetition } = item;
          const isFirst = index === 0;
          const isDone = repetition.status === "done";

          const isLate =
            isBeforeDay(selectedDate, effectiveToday) &&
            repetition.status === "pending";

          return (
            <div key={repetition.id} className="group relative z-10 pl-10">
              {/* Point sur la timeline */}
              <div
                className={`absolute ${
                  isFirst ? "left-1.5 w-4 h-4" : "left-2 w-3 h-3"
                } top-8 rounded-full border-2 border-[#050d0a] ${
                  isFirst ? "bg-[#52b788]" : "bg-[#2d6a4f]"
                } shadow-[0_0_10px_rgba(82,183,136,0.5)] z-20`}
              />

              <div
                className={
                  "glass rounded-[2rem] p-1 transition-all duration-300 active:scale-[0.98]" +
                  (isDone ? " opacity-60" : " opacity-100")
                }
              >
                <div className="bg-gradient-to-br from-[#1b4332] to-[#0d1d16] rounded-[1.8rem] p-5 relative">
                  {/* Taches lumineuses */}
                  {isFirst && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#40916c]/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                  )}
                  {!isFirst && (
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2d6a4f]/20 blur-3xl rounded-full -translate-x-10 translate-y-10" />
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold tracking-wider text-[#74c69d] uppercase">
                          NOTE
                        </span>
                        <h3 className="text-base font-normal text-white leading-tight">
                          {note.title}
                        </h3>

                        {/* Badge R si en retard (jour passé + pending) */}
                        {isLate && (
                          <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-[#ff6b6b]/20 text-[#ff8787] text-[10px] font-semibold tracking-wide">
                            R
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {note.attachment && (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenAttachment(note.attachment as Attachment)
                            }
                            className="w-7 h-7 rounded-full bg-[#1b4332] border border-[#52b788]/40 flex items-center justify-center text-[#74c69d] hover:bg-[#2d6a4f] transition-colors"
                            title="Open attachment"
                          >
                            {/* Icône trombone */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3.5 h-3.5"
                            >
                              <path d="M21.44 11.05 12.97 19.5a5 5 0 0 1-7.07-7.07l8.49-8.49a3.5 3.5 0 0 1 4.95 4.95l-8.49 8.49a2 2 0 0 1-2.83-2.83l7.78-7.78" />
                            </svg>
                          </button>
                        )}

                        <NoteActionsMenu
                          note={note}
                          repetition={repetition}
                          onRename={() => openEditModalForNote(note)}
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
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#74c69d] text-xs">
                        <span>
                          Repetition {repetition.index} / {totalRepetitions}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMarkReviewed(repetition.id)}
                        className={
                          "pl-3 pr-2 py-1 rounded-full text-xs font-medium flex items-center gap-2 transition-all " +
                          (isDone
                            ? "bg-[#1b4332]/80 border border-[#52b788]/50"
                            : "bg-[#52b788] text-[#050d0a] hover:bg-[#40916c]")
                        }
                      >
                        {isDone ? (
                          <span className="w-7 h-7 rounded-full bg-[#52b788] flex items-center justify-center shadow-[0_0_16px_rgba(82,183,136,0.9)]">
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
                        ) : (
                          <>
                            {t("today.reviewButton")}
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
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EditNoteModal
        isOpen={editingNote !== null}
        initialTitle={editingNote?.title ?? ""}
        initialAttachment={editingNote?.attachment ?? null}
        onCancel={() => setEditingNote(null)}
        onSave={handleSaveEditNote}
      />

      <CongratsPopup
        visible={showCongrats}
        onClose={() => setShowCongrats(false)}
      />

      <AttachmentModal
        attachment={openAttachment}
        onClose={() => setOpenAttachment(null)}
      />
    </section>
  );
}