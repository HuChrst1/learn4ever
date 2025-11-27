// src/utils/dateUtils.ts

/**
 * Retourne le début de journée (00:00:00.000) pour une date donnée.
 */
export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  
  /**
   * Ajoute n jours à une date et renvoie une nouvelle Date.
   */
  export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  /**
   * Compare uniquement l'année, le mois et le jour.
   */
  export function isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  
  /**
   * Convertit une string ISO en Date.
   * (Si la string est invalide, renvoie une Date "Invalid Date" normale JS.)
   */
  export function parseISO(iso: string): Date {
    return new Date(iso);
  }
  
  /**
   * Indique si une répétition prévue à dueDateIso
   * est due exactement le jour targetDate (même jour civil).
   */
  export function isDueOnDate(dueDateIso: string, targetDate: Date): boolean {
    const dueDate = startOfDay(parseISO(dueDateIso));
    const target = startOfDay(targetDate);
    return isSameDay(dueDate, target);
  }
  
  /**
   * Renvoie la date d'aujourd'hui (à minuit).
   */
  export function todayStart(): Date {
    return startOfDay(new Date());
  }
  /**
 * Retourne true si la date a est strictement avant la date b (en comparant les jours civils).
 */
export function isBeforeDay(a: Date, b: Date): boolean {
    const da = startOfDay(a).getTime();
    const db = startOfDay(b).getTime();
    return da < db;
  }
  
  /**
   * Nombre de jours entiers entre deux dates (from -> to).
   * On suppose généralement que "from" est dans le passé.
   */
  export function differenceInDays(from: Date, to: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = startOfDay(to).getTime() - startOfDay(from).getTime();
    return Math.floor(diff / msPerDay);
  }
  
  /**
   * Formatte un texte de type "Il y a X jours / semaines / mois"
   * pour une date passée "from" par rapport à une date de référence "to".
   */
  export function formatRelativePast(from: Date, to: Date): string {
    const days = differenceInDays(from, to);
  
    if (days <= 0) {
      return "Aujourd'hui";
    }
  
    if (days < 7) {
      const d = days;
      return `Il y a ${d} jour${d > 1 ? "s" : ""}`;
    }
  
    if (days < 30) {
      const weeks = Math.round(days / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
    }
  
    const months = Math.round(days / 30);
    return `Il y a ${months} mois`;
  }
  