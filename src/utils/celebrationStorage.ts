// src/utils/celebrationStorage.ts

const PREFIX = "spaced-notes-congrats:";

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Renvoie true si le popup de félicitations a déjà été affiché
 * pour cette date (quel que soit le moment de la journée).
 */
export function hasShownCongratsForDate(date: Date): boolean {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return false;
  }

  const key = PREFIX + formatDateKey(date);
  return window.localStorage.getItem(key) === "1";
}

/**
 * Enregistre le fait qu'on a affiché le popup de félicitations
 * pour cette date.
 */
export function markCongratsShownForDate(date: Date): void {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return;
  }

  const key = PREFIX + formatDateKey(date);
  window.localStorage.setItem(key, "1");
}
