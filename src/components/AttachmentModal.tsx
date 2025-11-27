// src/components/AttachmentModal.tsx
import type { Attachment } from "../models/spacedRepetition";
import { useTranslation } from "../hooks/useTranslation";

interface AttachmentModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export function AttachmentModal({
  attachment,
  onClose,
}: AttachmentModalProps) {
  const { t } = useTranslation();

  if (!attachment) return null;

  const isImage = attachment.type === "image";

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-[90%] max-w-md max-h-[80vh] glass rounded-[2rem] p-5 flex flex-col gap-4">
        {/* Bouton fermer */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1b4332]/80 border border-[#52b788]/40 flex items-center justify-center text-[#d8f3dc] hover:bg-[#1b4332] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <h3 className="text-sm font-medium text-[#d8f3dc] pr-10">
          {t("attachment.modal.title")}
        </h3>
        <p className="text-xs text-[#74c69d] truncate">{attachment.name}</p>

        <div className="flex-1 overflow-auto rounded-2xl bg-[#050d0a]/40 flex items-center justify-center">
          {isImage ? (
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className="max-h-[60vh] max-w-full rounded-2xl object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-sm text-[#d8f3dc]">
  <span className="text-xs text-[#74c69d]">
    PDF · {attachment.name}
  </span>
  <button
    type="button"
    onClick={() => {
      try {
        // attachment.dataUrl = "data:application/pdf;base64,AAAA..."
        const parts = attachment.dataUrl.split(",");
        if (parts.length < 2) {
          window.alert("Unable to open PDF (invalid data).");
          return;
        }
        const base64 = parts[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener");
      } catch (err) {
        console.error(err);
        window.alert("Unable to open PDF.");
      }
    }}
    className="px-4 py-2 rounded-full bg-[#52b788] text-[#050d0a] text-sm font-medium hover:bg-[#40916c] transition-colors"
  >
    {t("attachment.modal.pdfButton")}
  </button>
</div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 self-center text-[11px] text-[#74c69d] hover:text-[#d8f3dc]"
        >
          {t("attachment.modal.close")}
        </button>
      </div>
    </div>
  );
}
