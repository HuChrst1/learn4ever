// src/services/storage.ts
import type {
    Note,
    Repetition,
    SpacedNotesDB,
    Attachment,
  } from "../models/spacedRepetition";
  import { SPACED_INTERVALS_DAYS } from "../models/spacedRepetition";
  import { createEmptyDB, createNoteWithSchedule } from "./scheduler";
  
  const STORAGE_KEY = "spaced-notes-db";
  
  /**
   * Charge la base depuis localStorage.
   * Si rien n'existe ou si le JSON est corrompu, on repart d'une base vide.
   */
  export function loadDB(): SpacedNotesDB {
    if (typeof window === "undefined" || !window.localStorage) {
      // fallback très simple (SSR ou autre)
      return createEmptyDB();
    }
  
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const empty = createEmptyDB();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
      return empty;
    }
  
    try {
      const parsed = JSON.parse(raw) as SpacedNotesDB;
      if (!Array.isArray(parsed.notes) || !Array.isArray(parsed.repetitions)) {
        throw new Error("Invalid DB shape");
      }
      return parsed;
    } catch {
      const empty = createEmptyDB();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
      return empty;
    }
  }
  
  export function resetDB(): void {
    const empty = createEmptyDB();
    saveDB(empty);
  }
  /**
   * Sauvegarde la base dans localStorage.
   */
  function saveDB(db: SpacedNotesDB): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
  
  /**
   * Ajoute une note + toutes ses répétitions planifiées.
   * Utilisée quand on crée une nouvelle note via le formulaire "Add Note".
   */
  export function saveNoteWithRepetitions(
    note: Note,
    repetitions: Repetition[]
  ): void {
    const db = loadDB();
    db.notes.push(note);
    db.repetitions.push(...repetitions);
    saveDB(db);
  }
  
  /**
   * Met à jour une répétition (used pour marquer done / changer statut).
   */
  export function updateRepetition(updated: Repetition): void {
    const db = loadDB();
    const index = db.repetitions.findIndex((r) => r.id === updated.id);
    if (index === -1) return;
  
    db.repetitions[index] = { ...db.repetitions[index], ...updated };
    saveDB(db);
  }
  
  /**
   * Met à jour une note entière (titre, archived, etc.).
   */
  export function updateNote(updated: Note): void {
    const db = loadDB();
    const index = db.notes.findIndex((n) => n.id === updated.id);
    if (index === -1) {
      return;
    }
    db.notes[index] = { ...db.notes[index], ...updated };
    saveDB(db);
  }
  
  /**
   * Met à jour uniquement le titre d'une note.
   */
  export function updateNoteTitle(noteId: string, newTitle: string): void {
    const db = loadDB();
    const index = db.notes.findIndex((n) => n.id === noteId);
    if (index === -1) {
      return;
    }
    db.notes[index] = { ...db.notes[index], title: newTitle };
    saveDB(db);
  }
  export function updateNoteAttachment(
    noteId: string,
    attachment: Attachment | null
  ): void {
    const db = loadDB();
  
    const idx = db.notes.findIndex((n) => n.id === noteId);
    if (idx === -1) {
      // note introuvable -> on ne fait rien
      return;
    }
  
    const note = db.notes[idx];
  
    const updated: Note = {
      ...note,
      // si attachment === null -> on retire la pièce jointe
      attachment: attachment ?? undefined,
    };
  
    db.notes[idx] = updated;
    saveDB(db);
  }  
  /**
   * Supprime une répétition unique (la carte actuelle).
   */
  export function deleteRepetition(repetitionId: string): void {
    const db = loadDB();
    db.repetitions = db.repetitions.filter((rep) => rep.id !== repetitionId);
    saveDB(db);
  }
  
  /**
   * Archive une note :
   *  - note.archived = true
   *  - supprime toutes les répétitions futures (>= today)
   *  - supprime aussi les répétitions en retard encore "pending"
   *  - garde l'historique des répétitions déjà faites dans le passé
   */
  export function archiveNoteAndClean(noteId: string, today: Date): void {
    const db = loadDB();
  
    const noteIndex = db.notes.findIndex((n) => n.id === noteId);
    if (noteIndex === -1) {
      return;
    }
  
    const note = db.notes[noteIndex];
    const archivedNote: Note = { ...note, archived: true };
    db.notes[noteIndex] = archivedNote;
  
    const startOfDay = (d: Date): number => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy.getTime();
    };
  
    const todayMs = startOfDay(today);
  
    db.repetitions = db.repetitions.filter((rep) => {
      if (rep.noteId !== noteId) {
        // Autres notes : on garde
        return true;
      }
  
      const due = new Date(rep.dueDate);
      const dueMs = startOfDay(due);
  
      const isFutureOrToday = dueMs >= todayMs;
      const isOverduePending = dueMs < todayMs && rep.status === "pending";
  
      // On supprime les futures et les retards pending
      if (isFutureOrToday || isOverduePending) {
        return false;
      }
  
      // On garde les répétitions passées déjà faites (historique)
      return true;
    });
  
    saveDB(db);
  }
  
  export function createNoteWithOptionalAttachment(
    title: string,
    attachment?: Attachment
  ): void {
    const db = loadDB();
  
    // On crée la note + ses répétitions via le scheduler
    const { note, repetitions } = createNoteWithSchedule(title, new Date());
  
    const finalNote: Note = attachment ? { ...note, attachment } : note;
  
    db.notes.push(finalNote);
    db.repetitions.push(...repetitions);
  
    // On sauve la base dans le localStorage
    saveDB(db);
  }  

  // Met à jour la pièce jointe (unique) d'une note.
// - attachment = undefined ou null → supprime la pièce jointe
// - attachment défini           → remplace/ajoute cette pièce jointe
  /**
   * Recalage d'une note à partir d'une répétition donnée :
   *  - on choisit une nouvelle date pour l'index donné (fromIndex)
   *  - toutes les répétitions pending de cette note, à partir de cet index,
   *    sont recalculées selon la courbe SPACED_INTERVALS_DAYS
   */
  export function rescheduleFromRepetition(
    noteId: string,
    fromIndex: number,
    newBaseDate: Date
  ): void {
    const db = loadDB();
  
    const repsForNote = db.repetitions
      .filter((rep) => rep.noteId === noteId)
      .sort((a, b) => a.index - b.index);
  
    if (repsForNote.length === 0) {
      return;
    }
  
    const baseOffset = SPACED_INTERVALS_DAYS[fromIndex - 1];
    if (baseOffset === undefined) {
      // index en dehors des intervalles définis
      return;
    }
  
    const baseDate = new Date(newBaseDate);
    // on fixe l'heure à midi pour stabilité
    baseDate.setHours(12, 0, 0, 0);
  
    for (const rep of repsForNote) {
      // On ne touche qu'à cette répétition et aux suivantes
      if (rep.index < fromIndex) continue;
      // On ne touche pas aux répétitions déjà faites
      if (rep.status !== "pending") continue;
  
      const targetOffset = SPACED_INTERVALS_DAYS[rep.index - 1];
      if (targetOffset === undefined) continue;
  
      const deltaDays = targetOffset - baseOffset;
  
      const newDue = new Date(baseDate);
      newDue.setDate(newDue.getDate() + deltaDays);
  
      rep.dueDate = newDue.toISOString();
    }
  
    saveDB(db);
  }
  