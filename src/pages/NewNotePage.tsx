// src/pages/NewNotePage.tsx
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import type { Attachment } from "../models/spacedRepetition";
import { createNoteWithOptionalAttachment } from "../services/storage";
import {
  validateAttachment,
  readFileAsDataUrl,
  getAttachmentType,
} from "../utils/fileUtils";
import { useTranslation } from "../hooks/useTranslation";

export function NewNotePage() {
  const [title, setTitle] = useState("");
  const [pendingAttachment, setPendingAttachment] =
    useState<Attachment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  // Génère un id simple pour l'attachement
  const generateAttachmentId = () => {
    const random = Math.random().toString(36).slice(2, 8);
    const ts = Date.now().toString(36);
    return `att_${ts}_${random}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      // Création de la note + répétitions + éventuelle pièce jointe
      createNoteWithOptionalAttachment(trimmed, pendingAttachment || undefined);

      // Reset du formulaire
      setTitle("");
      setPendingAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // (Option : on peut rajouter une petite notification plus tard)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // 1) Validation taille / type de base
    const validation = validateAttachment(file);
    if (!validation.ok) {
      if (validation.errorKey) {
        alert(t(validation.errorKey as any));
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPendingAttachment(null);
      return;
    }
  
    // 2) Déterminer le type d'attachement via ton utilitaire
    const kind = getAttachmentType(file); // "image" | "pdf" | null/undefined
    if (!kind) {
      alert(t("error.unsupportedFileType"));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPendingAttachment(null);
      return;
    }
  
    try {
      // 3) Lire le fichier en Data URL
      const dataUrl = await readFileAsDataUrl(file);
  
      const attachment: Attachment = {
        id: generateAttachmentId(),
        name: file.name,
        type: kind,           // <-- plus de isImage ici
        dataUrl,
        sizeBytes: file.size,
      };
  
      setPendingAttachment(attachment);
    } catch (err) {
      console.error(err);
      alert(t("error.fileReadFailed"));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPendingAttachment(null);
    }
  };  

  const handleRemoveAttachment = () => {
    setPendingAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="fade-enter-active flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-xl font-medium tracking-tight text-white">
          {t("newNote.title")}
        </h2>
        <p className="text-[#74c69d] text-sm mt-1">
          {t("newNote.subtitle")}
        </p>
      </div>

      {/* Form Card */}
      <div className="glass rounded-[2rem] p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Titre de la note */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="note-title"
              className="text-[10px] font-bold text-[#74c69d] uppercase tracking-widest"
            >
              {t("newNote.noteTitleLabel")}
            </label>
            <input
              id="note-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("newNote.titlePlaceholder")}
              className="w-full bg-[#050d0a]/50 border border-[#2d6a4f] text-[#d8f3dc] text-sm rounded-xl focus:ring-2 focus:ring-[#52b788]/50 focus:border-[#52b788] block p-4 outline-none transition-all placeholder:text-[#2d6a4f] placeholder:font-light"
            />
          </div>

          {/* Pièce jointe (optionnelle) */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-[#74c69d] uppercase tracking-widest">
              {t("newNote.addFile")}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTriggerFileSelect}
                className="w-9 h-9 rounded-full bg-[#1b4332]/60 border border-[#52b788]/40 flex items-center justify-center text-[#d8f3dc] text-lg font-semibold hover:bg-[#1b4332] transition-all shadow-md shadow-black/40"
              >
                +
              </button>

              {pendingAttachment ? (
                <div className="flex flex-col text-xs text-[#d8f3dc]">
                  <span className="font-medium">
                    {t("newNote.fileSelected")}
                  </span>
                  <span className="text-[11px] text-[#74c69d] max-w-[180px] truncate">
                    {pendingAttachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="mt-1 text-[11px] text-[#74c69d] hover:text-[#d8f3dc] underline-offset-2 hover:underline"
                  >
                    {t("newNote.removeFile")}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#74c69d] max-w-[220px]">
                  {t("newNote.fileOptionalHelper")}
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Bouton submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-[#050d0a] bg-[#52b788] hover:bg-[#40916c] font-medium rounded-xl text-sm px-5 py-4 text-center transition-all duration-300 shadow-[0_0_20px_rgba(82,183,136,0.3)] hover:shadow-[0_0_25px_rgba(82,183,136,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {t("newNote.scheduleButton")}
            </button>
          </div>
        </form>
      </div>

      <div className="flex gap-4 p-4 rounded-2xl bg-[#1b4332]/20 border border-[#2d6a4f]/30">
        <div className="w-10 h-10 rounded-full bg-[#2d6a4f]/30 flex items-center justify-center shrink-0 text-[#52b788]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M9 13a4.5 4.5 0 0 0 3-4" />
            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
            <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
            <path d="M6 18a4 4 0 0 1-1.967-.516" />
            <path d="M12 13h4" />
            <path d="M12 18h6a2 2 0 0 1 2 2v1" />
            <path d="M12 8h8" />
            <path d="M16 8V5a2 2 0 0 1 2-2" />
            <circle cx="16" cy="13" r=".5" />
            <circle cx="18" cy="3" r=".5" />
            <circle cx="20" cy="21" r=".5" />
            <circle cx="20" cy="8" r=".5" />
          </svg>
        </div>
        <p className="text-xs text-[#74c69d] leading-relaxed">
          {t("newNote.intervalsHint")}
        </p>
      </div>
    </section>
  );
}