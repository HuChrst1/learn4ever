// src/i18n/messages.ts

// Langues supportées
export type Language = "en" | "fr";

// Langue par défaut (ta demande : anglais)
export const DEFAULT_LANGUAGE: Language = "en";

/**
 * Définition des messages de base (en anglais).
 * On utilise ce shape comme référence pour typer les clés.
 */
const baseMessages = {
  // Header / App
  "header.welcomeBack": "Welcome back",
  "header.readyToReview": "Ready to review?",
  "header.createNote": "Create a new note",

  // Tabs (bottom nav)
  "tab.today": "Today",
  "tab.addNote": "Add Note",
  "tab.overdue": "Overdue",

  // Today page
  "today.pendingLabel": "pending",
  "today.reviewButton": "Review",
  "today.allCaughtUpTitle": "All caught up!",
  "today.allCaughtUpSubtitle":
    "Enjoy your day. You've completed all scheduled reviews.",
  "today.repetitionLabel": "Repetition {index} / {total}",


  "editNote.title": "Edit note",
  "editNote.fieldTitleLabel": "Title",
  "editNote.fieldTitlePlaceholder": "Note title",
  "editNote.attachmentLabel": "Attachment (optional)",
  "editNote.fileAttachedLabel": "File attached",
  "editNote.attachmentHelper": "You can attach one image or PDF to this note.",
  "editNote.removeFile": "Remove file",
  "editNote.replaceFile": "Replace file",
  "editNote.cancel": "Cancel",
  "editNote.save": "Save",

  // Overdue page
  "overdue.title": "Overdue",
  "overdue.emptyTitle": "No overdue reviews",
  "overdue.emptySubtitle":
    "Nice job! You don't have any late reviews for now.",
  "overdue.sinceDays": "{count} days ago",
  "overdue.sinceWeeks": "{count} weeks ago",
  "overdue.sinceMonths": "{count} months ago",

    // New note page
    "newNote.title": "Create Note",
    "newNote.subtitle": "Add to your knowledge base.",
    "newNote.noteTitleLabel": "Note Title",
    "newNote.scheduleButton": "Schedule review",
    "newNote.intervalsHint":
      "Spaced repetition algorithm will schedule reviews at optimal intervals (1, 7, 15, 30, 90, 180 days).",
    "newNote.categoryLabel": "Category",
    "newNote.category.study": "Study",
    "newNote.category.work": "Work",
    "newNote.category.personal": "Personal",
    "newNote.titlePlaceholder": "e.g. Memory Models",
  
  // Confirmations / dialogs
  "confirm.deleteReview":
    "Delete this review only? This action cannot be undone.",
  "confirm.archiveNote":
    "Archive this note? All future and overdue reviews for this note will be removed. Past reviews will stay in history.",
  "confirm.moveReviewPrompt":
    "New date for this review (YYYY-MM-DD)",
  "confirm.invalidDate":
    "Invalid date. Please use format YYYY-MM-DD.",

  // Prompts
  "prompt.renameNoteTitle": "Rename note",

  // Celebration popup
  "celebration.message": "Bravo, you finished today's reviews!",

    // Attachments / files
    "newNote.addFile": "Add file",
    "newNote.changeFile": "Change file",
    "newNote.removeFile": "Remove file",
    "newNote.fileSelected": "File selected",
    "newNote.fileOptionalHelper":
      "Optional: attach an image or PDF for this note.",
  
    "error.fileTooLarge": "File is too large (max 2 MB).",
    "error.unsupportedFileType":
      "Unsupported file type. Please use an image or PDF.",
    "error.fileReadFailed": "Could not read file. Please try again.",
  
    "attachment.badge.one": "1 file",

    "attachment.modal.title": "Attachment",
    "attachment.modal.pdfButton": "Open PDF in new tab",
    "attachment.modal.close": "Close",  

      // Notifications (UI)
  "notifications.bellTooltip": "Daily reminder",
  "notifications.panelTitle": "Daily reminder",
  "notifications.timeLabel": "Reminder time",
  "notifications.enableButton": "Enable notifications",
  "notifications.permissionDenied":
    "Notifications are blocked in your browser settings.",
  "notifications.saved":
    "Reminder time saved.",
  "notifications.testInfo":
    "Notifications can only appear when the app is open.",

} as const;

// Type des clés
export type MessageKey = keyof typeof baseMessages;
/**
 * Messages pour chaque langue.
 * En anglais on reprend le baseMessages.
 */
export const messages: Record<Language, Record<MessageKey, string>> = {
  en: {
    ...baseMessages,
  },
  fr: {
    // Header / App
    "header.welcomeBack": "Bon retour",
    "header.readyToReview": "Prêt à réviser ?",
    "header.createNote": "Créer une nouvelle note",

    // Tabs
    "tab.today": "Aujourd'hui",
    "tab.addNote": "Ajouter une note",
    "tab.overdue": "Retards",

    // Today page
    "today.pendingLabel": "en attente",
    "today.reviewButton": "Réviser",
    "today.allCaughtUpTitle": "Tu es à jour !",
    "today.allCaughtUpSubtitle":
      "Profite de ta journée, tu as terminé toutes tes révisions.",
    "today.repetitionLabel": "Répétition {index} / {total}",


    "editNote.title": "Modifier la note",
    "editNote.fieldTitleLabel": "Titre",
    "editNote.fieldTitlePlaceholder": "Titre de la note",
    "editNote.attachmentLabel": "Pièce jointe (optionnel)",
    "editNote.fileAttachedLabel": "Fichier joint",
    "editNote.attachmentHelper": "Tu peux joindre une image ou un PDF à cette note.",
    "editNote.removeFile": "Supprimer le fichier",
    "editNote.replaceFile": "Remplacer le fichier",
    "editNote.cancel": "Annuler",
    "editNote.save": "Enregistrer",

    // Overdue page
    "overdue.title": "Retards",
    "overdue.emptyTitle": "Aucun retard",
    "overdue.emptySubtitle":
      "Bravo ! Tu n'as aucune révision en retard pour l'instant.",
    "overdue.sinceDays": "il y a {count} jours",
    "overdue.sinceWeeks": "il y a {count} semaines",
    "overdue.sinceMonths": "il y a {count} mois",

        // New note page
        "newNote.title": "Créer une note",
        "newNote.subtitle": "Ajoute à ta base de connaissances.",
        "newNote.noteTitleLabel": "Titre de la note",
        "newNote.scheduleButton": "Planifier les révisions",
        "newNote.intervalsHint":
          "L'algorithme de répétition espacée planifie les révisions à des intervalles optimaux (1, 7, 15, 30, 90, 180 jours).",
        "newNote.categoryLabel": "Catégorie",
        "newNote.category.study": "Études",
        "newNote.category.work": "Travail",
        "newNote.category.personal": "Personnel",
        "newNote.titlePlaceholder": "ex : Modèles de mémoire",
    
    // Confirmations / dialogs
    "confirm.deleteReview":
      "Supprimer uniquement cette révision ? Cette action est irréversible.",
    "confirm.archiveNote":
      "Archiver cette note ? Toutes les révisions futures et en retard seront supprimées. Les révisions passées resteront dans l'historique.",
    "confirm.moveReviewPrompt":
      "Nouvelle date pour cette révision (AAAA-MM-JJ)",
    "confirm.invalidDate":
      "Date invalide. Utilise le format AAAA-MM-JJ.",

          // Prompts
    "prompt.renameNoteTitle": "Renommer la note",

    // Celebration popup
    "celebration.message": "Bravo, tu as terminé tes révisions !",

        // Pièces jointes / fichiers
        "newNote.addFile": "Ajouter un fichier",
        "newNote.changeFile": "Changer le fichier",
        "newNote.removeFile": "Supprimer le fichier",
        "newNote.fileSelected": "Fichier sélectionné",
        "newNote.fileOptionalHelper":
          "Optionnel : ajoute une image ou un PDF pour cette note.",
    
        "error.fileTooLarge": "Fichier trop volumineux (max 2 Mo).",
        "error.unsupportedFileType":
          "Type de fichier non pris en charge. Utilise une image ou un PDF.",
        "error.fileReadFailed":
          "Impossible de lire le fichier. Réessaie.",
    
        "attachment.badge.one": "1 fichier",

        "attachment.modal.title": "Pièce jointe",
        "attachment.modal.pdfButton": "Ouvrir le PDF dans un nouvel onglet",
        "attachment.modal.close": "Fermer",  
        
            // Notifications (UI)
    "notifications.bellTooltip": "Rappel quotidien",
    "notifications.panelTitle": "Rappel quotidien",
    "notifications.timeLabel": "Heure du rappel",
    "notifications.enableButton": "Activer les notifications",
    "notifications.permissionDenied":
      "Les notifications sont bloquées dans les réglages du navigateur.",
    "notifications.saved":
      "Heure du rappel enregistrée.",
    "notifications.testInfo":
      "Les notifications ne peuvent apparaître que quand l'app est ouverte.",

  },
};

/**
 * Fonction de traduction de base.
 * - Essaie d'abord dans la langue demandée,
 * - sinon retombe sur l'anglais,
 * - remplace les {variables} si fournies.
 */
export function translate(
  language: Language,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  const langTable = messages[language] ?? messages.en;
  let template = langTable[key] ?? messages.en[key];

  if (!template) {
    // Si la clé n'existe vraiment pas, on renvoie la clé brute
    return key;
  }

  if (vars) {
    Object.entries(vars).forEach(([name, value]) => {
      const regex = new RegExp(`{${name}}`, "g");
      template = template.replace(regex, String(value));
    });
  }

  return template;
}
