// src/i18n/dateLocale.ts
import type { Locale } from "date-fns";
import { enUS, fr } from "date-fns/locale";

/**
 * Retourne la locale date-fns en fonction de la langue de l'app.
 */
export function getDateLocale(language: "en" | "fr"): Locale {
  return language === "fr" ? fr : enUS;
}
