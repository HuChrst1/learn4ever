// src/services/scheduler.ts
import type { Note, Repetition, SpacedNotesDB } from "../models/spacedRepetition";
import { SPACED_INTERVALS_DAYS } from "../models/spacedRepetition";

  
  /**
   * Petit helper pour générer un id unique simple.
   * (Suffisant pour une app locale.)
   */
  function generateId(prefix: string): string {
    const random = Math.random().toString(36).slice(2, 8);
    const timestamp = Date.now().toString(36);
    return `${prefix}_${timestamp}_${random}`;
  }
  
  /**
   * Ajoute un certain nombre de jours à une Date et renvoie une nouvelle Date.
   */
  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  /**
   * Crée une Note et toutes ses répétitions planifiées
   * selon les intervalles fixes (1, 7, 15, 30, 90, 180 jours).
   *
   * On renvoie:
   *  - la note
   *  - la liste des répétitions associées
   */
  export function createNoteWithSchedule(
    title: string,
    createdAtDate: Date = new Date()
  ): { note: Note; repetitions: Repetition[] } {
    const createdAtIso = createdAtDate.toISOString();
    const noteId = generateId("note");
  
    const note: Note = {
      id: noteId,
      title: title.trim(),
      createdAt: createdAtIso,
    };
  
    const repetitions: Repetition[] = SPACED_INTERVALS_DAYS.map((days, index) => {
      const dueDate = addDays(createdAtDate, days).toISOString();
  
      return {
        id: generateId("rep"),
        noteId,
        dueDate,
        index: index + 1, // 1 à 6
        status: "pending",
        reviewedAt: null,
      };
    });
  
    return { note, repetitions };
  }
  
  /**
   * Helper pour initialiser une base vide en mémoire.
   * On l'utilisera côté stockage.
   */
  export function createEmptyDB(): SpacedNotesDB {
    return {
      notes: [],
      repetitions: [],
    };
  }
  