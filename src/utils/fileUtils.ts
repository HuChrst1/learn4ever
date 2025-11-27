// src/utils/fileUtils.ts

import type { Attachment } from "../models/spacedRepetition";

/**
 * Limite de taille : 2 Mo par fichier.
 */
export const MAX_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo

/**
 * Valide un fichier avant de l'accepter comme pièce jointe.
 * - taille max : 2 Mo
 * - types autorisés : image/* ou application/pdf
 *
 * errorKey sera utilisé avec i18n (messages.ts).
 */
export function validateAttachment(file: File): {
  ok: boolean;
  errorKey?: string;
} {
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return {
      ok: false,
      errorKey: "error.fileTooLarge",
    };
  }

  const mime = file.type;

  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf";

  if (!isImage && !isPdf) {
    return {
      ok: false,
      errorKey: "error.unsupportedFileType",
    };
  }

  return { ok: true };
}

/**
 * Détermine le type d'attachement ("image" ou "pdf") à partir du MIME type.
 */
export function getAttachmentType(file: File): Attachment["type"] {
  return file.type === "application/pdf" ? "pdf" : "image";
}

/**
 * Lit un fichier comme Data URL (base64) pour stockage local / affichage.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Unexpected FileReader result type"));
      }
    };

    reader.onerror = () => {
      reject(reader.error || new Error("Unknown FileReader error"));
    };

    reader.readAsDataURL(file);
  });
}