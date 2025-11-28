import { useRef, useState } from "react";
import { getDBAsJSON, importDBFromJSON } from "../services/storage";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DataBackupModal({ open, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleExport = () => {
    const json = getDBAsJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `learn4ever-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const success = importDBFromJSON(content);
      if (success) {
        // On recharge la page pour appliquer la nouvelle base de données
        window.location.reload();
      } else {
        setError("Fichier invalide ou corrompu.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Fond sombre flouté */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenu de la modale */}
      <div className="relative bg-[#050d0a] border border-[#2d6a4f] rounded-2xl p-6 w-full max-w-sm shadow-2xl text-[#d8f3dc]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#74c69d] hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-[#52b788]">Sauvegarde & Restauration</h2>
        
        <div className="flex flex-col gap-4">
            {/* Zone Export */}
            <div className="p-4 bg-[#1b4332]/30 rounded-xl border border-[#2d6a4f]/50">
                <h3 className="font-semibold mb-2 text-[#74c69d]">Exporter les données</h3>
                <p className="text-xs text-[#d8f3dc]/70 mb-3">
                    Téléchargez une copie de toutes vos notes et progressions sur votre appareil.
                </p>
                <button
                    onClick={handleExport}
                    className="w-full py-2 bg-[#2d6a4f] hover:bg-[#40916c] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger JSON
                </button>
            </div>

            {/* Zone Import */}
            <div className="p-4 bg-[#1b4332]/30 rounded-xl border border-[#2d6a4f]/50">
                <h3 className="font-semibold mb-2 text-[#74c69d]">Importer une sauvegarde</h3>
                <p className="text-xs text-[#d8f3dc]/70 mb-3">
                    Restaurez vos données depuis un fichier. <span className="text-red-400">Attention : cela remplacera les données actuelles.</span>
                </p>
                <button
                    onClick={handleImportClick}
                    className="w-full py-2 border border-[#52b788] text-[#52b788] hover:bg-[#52b788] hover:text-[#050d0a] rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Choisir un fichier
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json" 
                    className="hidden" 
                />
                {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
            </div>
        </div>
      </div>
    </div>
  );
}