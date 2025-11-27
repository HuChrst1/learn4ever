// src/components/CongratsPopup.tsx
type CongratsPopupProps = {
    visible: boolean;
    onClose: () => void;
  };
  
  export function CongratsPopup({ visible, onClose }: CongratsPopupProps) {
    if (!visible) return null;
  
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
        {/* Fond assombri */}
        <div
  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
  onClick={onClose}
/>
        {/* Bulle centrale */}
        <div className="relative z-10 pointer-events-auto bg-[#0b2018] border border-[#2d6a4f] rounded-3xl px-8 py-6 shadow-[0_0_40px_rgba(82,183,136,0.6)] flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#52b788] flex items-center justify-center animate-bounce">
            <span className="text-3xl">😊</span>
          </div>
          <p className="text-sm text-[#d8f3dc] font-medium text-center">
            Bravo, tu as terminé tes révisions !
          </p>
        </div>
      </div>
    );
  }
  