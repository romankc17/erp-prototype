import { useState } from "react";
import { Lock } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function LockOverlay() {
  const { authLocked, currentUser, unlock, logout } = useStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!authLocked) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await unlock(pin);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setPin("");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Session Locked</div>
              <div className="text-xs text-slate-300">Unlock to continue{currentUser ? ` (${currentUser.name})` : ""}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="p-6 space-y-3">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
          >
            Unlock
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full h-10 text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            Switch User
          </button>
        </form>
      </div>
    </div>
  );
}
