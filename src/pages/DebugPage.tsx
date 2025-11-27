// src/pages/DebugPage.tsx
import { useState } from "react";
import { loadDB, resetDB } from "../services/storage";
import { useDebug } from "../context/DebugContext";

export function DebugPage() {
  const [version, setVersion] = useState(0);
  const [resetText, setResetText] = useState("");

  const { fakeToday, setFakeToday, clearFakeToday } = useDebug();

  // Re-charge le snapshot à chaque rendu
  const db = loadDB();

  const realToday = new Date();
  realToday.setHours(0, 0, 0, 0);

  const effectiveToday = fakeToday ?? realToday;

  const handleFakeTodayChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value; // "YYYY-MM-DD"
    if (!value) {
      clearFakeToday();
      return;
    }

    const d = new Date(value + "T12:00:00");
    if (Number.isNaN(d.getTime())) {
      alert("Invalid date format");
      return;
    }
    setFakeToday(d);
  };

  const handleClearFakeToday = () => {
    clearFakeToday();
  };

  const handleReset = () => {
    if (resetText !== "RESET") {
      alert('Type "RESET" in the field to confirm.');
      return;
    }
    resetDB();
    setVersion((v) => v + 1); // force un re-render après reset
    setResetText("");
  };

  // Format helpers
  const formatDate = (d: Date | null | undefined) => {
    if (!d) return "-";
    return d.toISOString().slice(0, 10);
  };

  const noteCount = db.notes.length;
  const repetitionCount = db.repetitions.length;

  return (
    <section className="min-h-screen bg-[#050d0a] text-[#d8f3dc] px-4 py-8 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Debug tools</h1>
          <p className="text-xs text-[#74c69d] mt-1">
            Version: {version} • Notes: {noteCount} • Repetitions:{" "}
            {repetitionCount}
          </p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-[#1b4332] text-[#74c69d] uppercase tracking-widest">
          DEV ONLY
        </span>
      </header>

      {/* Fake today panel */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold mb-1">Fake today</h2>
        <p className="text-xs text-[#74c69d]">
          Real today: <span className="font-mono">{formatDate(realToday)}</span>
        </p>
        <p className="text-xs text-[#74c69d]">
          Effective today (used by the app):{" "}
          <span className="font-mono">{formatDate(effectiveToday)}</span>
        </p>

        <div className="mt-2 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#74c69d]">
              Set fake date (YYYY-MM-DD):
            </label>
            <input
              type="date"
              value={fakeToday ? formatDate(fakeToday) : ""}
              onChange={handleFakeTodayChange}
              className="bg-[#050d0a]/60 border border-[#2d6a4f] rounded-lg text-xs px-2 py-1 outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788]/50"
            />
          </div>
          <button
            type="button"
            onClick={handleClearFakeToday}
            className="text-xs px-3 py-1 rounded-full border border-[#2d6a4f] bg-transparent text-[#74c69d] hover:bg-[#1b4332] transition-colors"
          >
            Clear fake date
          </button>
        </div>
      </div>

      {/* Notes snapshot */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Notes</h2>
        <p className="text-xs text-[#74c69d]">
          Quick snapshot of all notes stored in localStorage.
        </p>

        <div className="mt-2 max-h-64 overflow-auto space-y-2 text-xs">
          {db.notes.map((note) => (
            <div
              key={note.id}
              className="border border-[#2d6a4f]/60 rounded-xl p-2 bg-[#050d0a]/60"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium truncate max-w-[60%]">
                  {note.title || "(no title)"}
                </span>
                {note.archived && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#2d6a4f]/40 text-[#74c69d] uppercase tracking-widest">
                    archived
                  </span>
                )}
              </div>
              <p className="font-mono text-[10px] text-[#74c69d] break-all">
                id: {note.id}
              </p>
              <p className="font-mono text-[10px] text-[#74c69d]">
                createdAt: {note.createdAt}
              </p>
              {note.attachment && (
                <p className="font-mono text-[10px] text-[#74c69d] mt-1">
                  attachment: {note.attachment.name} ({note.attachment.type}) •
                  {` ${Math.round(note.attachment.sizeBytes / 1024)} kB`}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Repetitions snapshot */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Repetitions</h2>
        <p className="text-xs text-[#74c69d]">
          All scheduled repetitions (pending &amp; done).
        </p>

        <div className="mt-2 max-h-64 overflow-auto space-y-2 text-xs">
          {db.repetitions.map((rep) => (
            <div
              key={rep.id}
              className="border border-[#2d6a4f]/60 rounded-xl p-2 bg-[#050d0a]/60"
            >
              <p className="font-mono text-[10px] text-[#74c69d] break-all">
                id: {rep.id}
              </p>
              <p className="font-mono text-[10px] text-[#74c69d]">
                noteId: {rep.noteId}
              </p>
              <p className="font-mono text-[10px] text-[#74c69d]">
                index: {rep.index} • status: {rep.status}
              </p>
              <p className="font-mono text-[10px] text-[#74c69d]">
                dueDate: {rep.dueDate}
              </p>
              {rep.reviewedAt && (
                <p className="font-mono text-[10px] text-[#74c69d]">
                  reviewedAt: {rep.reviewedAt}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reset section */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-3 border border-red-900/60">
        <h2 className="text-sm font-semibold text-red-300">
          Danger zone – Reset data
        </h2>
        <p className="text-xs text-red-200/90">
          This will erase all notes and repetitions from localStorage. Use this
          only during development.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            value={resetText}
            onChange={(e) => setResetText(e.target.value)}
            placeholder='Type "RESET" to confirm'
            className="bg-[#050d0a]/60 border border-red-800 rounded-lg text-xs px-2 py-1 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-500/60 text-red-100"
          />
          <button
            type="button"
            onClick={handleReset}
            disabled={resetText !== "RESET"}
            className={
              "px-4 py-2 text-xs font-semibold rounded-full transition-all " +
              (resetText === "RESET"
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-red-900/60 text-red-300 cursor-not-allowed")
            }
          >
            Reset data
          </button>
        </div>
      </div>
    </section>
  );
}
