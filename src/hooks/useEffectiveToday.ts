// src/hooks/useEffectiveToday.ts
import { useDebug } from "../context/DebugContext";
import { todayStart } from "../utils/dateUtils";

/**
 * Renvoie "la date d'aujourd'hui" utilisée par l'app :
 *  - soit la vraie date système
 *  - soit la fake date choisie dans la page Debug.
 */
export function useEffectiveToday(): Date {
  const { fakeToday } = useDebug();

  if (!fakeToday) {
    // date réelle (début de journée)
    return todayStart();
  }

  // on clone pour être sûr de ne pas modifier l'objet d'origine
  const d = new Date(fakeToday);
  d.setHours(0, 0, 0, 0);
  return d;
}
