// src/components/EditNoteModal.tsx
import { useEffect, useRef, useState } from "react";
import type { Attachment } from "../models/spacedRepetition";
import {
  validateAttachment,
  readFileAsDataUrl,
  getAttachmentType,
} from "../utils/fileUtils";
import { useTranslation } from "../hooks/useTranslation";


interface EditNoteModalProps {
  isOpen: boolean;
  initialTitle: string;
  initialAttachment?: Attachment | null;
  onCancel: () => void;
  onSave: (params: {
    newTitle: string;
    attachment: Attachment | null | undefined;
  }) => void;
}

/**
 * Modale pour :
 *  - changer le titre de la note
 *  - ajouter / remplacer / supprimer une pièce jointe (unique)
 */
export function EditNoteModal({
  isOpen,
  initialTitle,
  initialAttachment,
  onCancel,
  onSave,
}: EditNoteModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [attachment, setAttachment] = useState<Attachment | null>(
    initialAttachment ?? null
  );
  const [isWorking, setIsWorking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Quand on ouvre sur une autre note, on resynchronise
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    setAttachment(initialAttachment ?? null);
  }, [initialAttachment]);

  if (!isOpen) {
    return null;
  }

  const { t } = useTranslation();

  const generateAttachmentId = () => {
    const random = Math.random().toString(36).slice(2, 8);
    const ts = Date.now().toString(36);
    return `att_${ts}_${random}`;
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAttachment(file);
    if (!validation.ok) {
      alert(validation.errorKey ?? "Invalid file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const kind = getAttachmentType(file); // "image" | "pdf" | null
    if (!kind) {
      alert("Unsupported file type");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsWorking(true);
      const dataUrl = await readFileAsDataUrl(file);

      const att: Attachment = {
        id: generateAttachmentId(),
        name: file.name,
        type: kind,
        dataUrl,
        sizeBytes: file.size,
      };

      setAttachment(att);
    } catch (err) {
      console.error(err);
      alert("Failed to read file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsWorking(false);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    onSave({
      newTitle: trimmed,
      attachment: attachment ?? null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-sm mx-4 rounded-[2rem] p-6 relative">
      <h2 className="text-lg font-medium text-white mb-4">
  {t("editNote.title")}
</h2>


        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Titre */}
          <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold text-[#74c69d] uppercase tracking-widest">
  {t("editNote.fieldTitleLabel")}
</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#050d0a]/50 border border-[#2d6a4f] text-[#d8f3dc] text-sm rounded-xl focus:ring-2 focus:ring-[#52b788]/50 focus:border-[#52b788] block p-3 outline-none transition-all placeholder:text-[#2d6a4f]"
              placeholder={t("editNote.fieldTitlePlaceholder")}
            />
          </div>

                    {/* Pièce jointe */}
                      {/* Pièce jointe */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#74c69d] uppercase tracking-widest">
              {t("editNote.attachmentLabel")}
            </span>

            <div className="flex items-center gap-3">
              {attachment ? (
                // ======= CAS AVEC FICHIER =======
                <div className="flex items-center justify-between w-full gap-3">
                  {/* Infos fichier à gauche */}
                  <div className="flex flex-col text-xs text-[#d8f3dc] flex-1 min-w-0">
                    <span className="font-medium">
                      {t("editNote.fileAttachedLabel")}
                    </span>
                    <span className="text-[11px] text-[#74c69d] truncate">
                      {attachment.name}
                    </span>
                  </div>

                  {/* Icônes actions à droite */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Supprimer */}
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      disabled={isWorking}
                      className="w-9 h-9 rounded-full bg-[#641e1e] border border-[#ff8787]/60 flex items-center justify-center text-[#ffe3e3] hover:bg-[#7f1d1d] transition-all shadow-md shadow-black/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">
                        {t("editNote.removeFile")}
                      </span>
                      {/* Icône croix */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M18 6 6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Remplacer */}
                    <button
                      type="button"
                      onClick={handleTriggerFileSelect}
                      disabled={isWorking}
                      className="w-9 h-9 rounded-full bg-[#1b4332] border border-[#52b788]/60 flex items-center justify-center text-[#d8f3dc] hover:bg-[#2d6a4f] transition-all shadow-md shadow-black/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">
                        {t("editNote.replaceFile")}
                      </span>
                      {/* Icône “recycler / refresh” */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M21 2v6h-6" />
                        <path d="M3 22v-6h6" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L21 8" />
                        <path d="M3 16l2.64 2.36A9 9 0 0 0 20.49 15" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                // ======= CAS SANS FICHIER =======
                <>
                  <button
                    type="button"
                    onClick={handleTriggerFileSelect}
                    disabled={isWorking}
                    className="w-9 h-9 rounded-full bg-[#1b4332]/60 border border-[#52b788]/40 flex items-center justify-center text-[#d8f3dc] text-lg font-semibold hover:bg-[#1b4332] transition-all shadow-md shadow-black/40 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <p className="text-xs text-[#74c69d] max-w-[220px]">
                    {t("editNote.attachmentHelper")}
                  </p>
                </>
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

          {/* Boutons */}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-[#74c69d] hover:text-[#d8f3dc] rounded-full bg-transparent"
            >
              {t("editNote.cancel")}
            </button>
            <button
              type="submit"
              disabled={isWorking}
              className="px-5 py-2 text-xs font-medium rounded-full bg-[#52b788] text-[#050d0a] hover:bg-[#40916c] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t("editNote.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
