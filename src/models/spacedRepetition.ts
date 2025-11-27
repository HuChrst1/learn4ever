// src/models/spacedRepetition.ts

// Identifiants typés (juste des string, mais plus clair dans le code)
export type NoteId = string;
export type RepetitionId = string;

// Intervalles fixes en jours (Ebbinghaus personnalisé)
export const SPACED_INTERVALS_DAYS = [1, 7, 15, 30, 90, 180] as const;
export type SpacedIntervalDay = (typeof SPACED_INTERVALS_DAYS)[number];

// Une Note représente juste un titre que tu veux réviser
export interface Note {
    id: string;
    title: string;
    createdAt: string;
    archived?: boolean;
    attachment?: Attachment;   // 1 seule pièce jointe max pour l'instant
  }
  
// src/models/spacedRepetition.ts

export interface Attachment {
    id: string;
    name: string;                 // ex: "schema.pdf"
    type: "image" | "pdf";
    dataUrl: string;              // Data URL (base64) pour l'affichage / ouverture
    sizeBytes: number;            // taille du fichier en octets (pour info)
  }
  
// Statut d'une répétition
export type RepetitionStatus = "pending" | "done";

// Une Repetition correspond à "revoir telle note à telle date"
export interface Repetition {
  id: RepetitionId;
  noteId: NoteId;
  dueDate: string; // ISO string
  index: number; // 1 à 6 (position dans les intervalles)
  status: RepetitionStatus;
  reviewedAt?: string | null; // ISO string ou null
  difficulty?: "easy" | "medium" | "hard"; // optionnel, pour plus tard
}

// Petit type pour stocker tout dans localStorage
export interface SpacedNotesDB {
  notes: Note[];
  repetitions: Repetition[];
}
