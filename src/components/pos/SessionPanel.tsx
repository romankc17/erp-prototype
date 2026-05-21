import { useState } from "react";
import { Banknote, Unlock, Lock, Plus, Minus, User as UserIcon, X } from "lucide-react";
import { DENOMINATIONS, BRANCHES, REGISTERS, USERS, type User } from "../../lib/posTypes";
import type { Session } from "../../lib/posTypes";
import { todayDate, nowTime } from "./posUtils";

interface Props {
  session: Session | null;
  currentUser: User | null;
  onOpen: (partial: Omit<Session, "id" | "status" | "cashInDrawer" | "addedCash" | "removedCash" | "cashEvents" | "closingCash" | "closingDenoms" | "closedAt" | "closedBy" | "shortOver" | "receiptCounter">) => void;
  onClose: (countedCash: number, denoms: Record<number, number>, closedBy: string, closedAt: string) => void;
  onCashEvent: (type: "in" | "out", amount: number, note: string, by: string) => void;
}

export default function SessionPanel({ session, currentUser, onOpen, onClose, onCashEvent }: Props) {
  const [openMode, setOpenMode] = useState<"denoms" | "amount">("denoms");
  const [openDenom, setOpenDenom] = useState<Record<number, number>>({});
  const [openSimpleAmount, setOpenSimpleAmount] = useState("");
  const [branchId, setBranchId] = useState(currentUser?.branchId ?? BRANCHES[0].id);
  const [registerId, setRegisterId] = useState(REGISTERS.find(r => r.branchId === branchId)?.id ?? REGISTERS[0].id);
  const [closeMode, setCloseMode] = useState<"denoms" | "amount">("denoms");
  const [closeDenom, setCloseDenom] = useState<Record<number, number>>({});
  const [closeSimpleAmount, setCloseSimpleAmount] = useState("");
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [cashAction, setCashAction] = useState<"in" | "out">("in");
  const [cashAmount, setCashAmount] = useState("");
  const [cashNote, setCashNote] = useState("");

  const openDenomTotal = Object.entries(openDenom).reduce((s, [d, c]) => s + Number(d) * c, 0);
  const openTotal = openMode === "denoms" ? openDenomTotal : Number(openSimpleAmount) || 0;

  const closeDenomTotal = Object.entries(closeDenom).reduce((s, [d, c]) => s + Number(d) * c, 0);
  const closeTotal = closeMode === "denoms" ? closeDenomTotal : Number(closeSimpleAmount) || 0;

  const expectedCash = session?.cashInDrawer ?? 0;

  const handleOpen = () => {
    const branch = BRANCHES.find(b => b.id === branchId);
    const register = REGISTERS.find(r => r.id === registerId);
    const cashier = currentUser ?? USERS[0];
    onOpen({
      branchId,
      branchName: branch?.name ?? "",
      registerId,
      registerName: register?.name ?? "",
      cashierId: cashier.id,
      cashierName: cashier.name,
      openedAt: new Date().toISOString(),
      openingCash: openTotal,
      openingDenoms: openMode === "denoms" ? { ...openDenom } : {},
    });
  };

  const handleClose = () => {
    if (!session) return;
    onClose(closeTotal, closeMode === "denoms" ? { ...closeDenom } : {}, currentUser?.name ?? "Unknown", new Date().toISOString());
    setShowCloseDialog(false);
    setCloseDenom({});
    setCloseSimpleAmount("");
  };

  const handleCashEvent = () => {
    const amt = Number(cashAmount);
    if (amt <= 0 || !currentUser) return;
    onCashEvent(cashAction, amt, cashNote || (cashAction === "in" ? "Cash added" : "Cash removed"), currentUser.name);
    setShowCashDialog(false);
    setCashAmount("");
    setCashNote("");
  };

  if (!session || session.status === "closed") {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-[540px] overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-7">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Open POS Session</h2>
                <p className="text-sm text-blue-200 mt-0.5">Select branch, register, and count opening cash</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" />{currentUser?.name ?? "Not logged in"}</span>
              <span className="text-blue-400">•</span>
              <span>{todayDate()}</span>
              <span className="text-blue-400">•</span>
              <span>{nowTime()}</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch</label>
                <select value={branchId} onChange={e => { const bid = e.target.value; setBranchId(bid); const firstReg = REGISTERS.find(r => r.branchId === bid); if (firstReg) setRegisterId(firstReg.id); }} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 bg-white">
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Register</label>
                <select value={registerId} onChange={e => setRegisterId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 bg-white">
                  {REGISTERS.filter(r => r.branchId === branchId).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
              <button onClick={() => setOpenMode("denoms")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${openMode === "denoms" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Count by Denominations</button>
              <button onClick={() => setOpenMode("amount")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${openMode === "amount" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Enter Amount Only</button>
            </div>

            {openMode === "denoms" ? (
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {DENOMINATIONS.map(d => (
                  <div key={d} className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-sm font-semibold text-slate-700 w-20">Rs. {d}</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button onClick={() => setOpenDenom({ ...openDenom, [d]: Math.max(0, (openDenom[d] || 0) - 1) })} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-colors"><Minus className="w-3 h-3 text-slate-500" /></button>
                      <input type="number" min={0} value={openDenom[d] || ""} onChange={e => setOpenDenom({ ...openDenom, [d]: Number(e.target.value) || 0 })} className="w-14 h-7 px-1 rounded-lg border border-slate-200 text-sm text-center font-semibold focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 bg-white" placeholder="0" />
                      <button onClick={() => setOpenDenom({ ...openDenom, [d]: (openDenom[d] || 0) + 1 })} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-colors"><Plus className="w-3 h-3 text-slate-500" /></button>
                    </div>
                    <span className={`text-sm font-semibold w-24 text-right ${(openDenom[d] || 0) > 0 ? "text-blue-600" : "text-slate-400"}`}>Rs. {((openDenom[d] || 0) * d).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Opening Cash Amount (Rs.)</label>
                <input type="number" value={openSimpleAmount} onChange={e => setOpenSimpleAmount(e.target.value)} placeholder="0" className="w-full h-14 px-4 rounded-xl border border-slate-200 text-2xl font-bold text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 text-slate-900" />
                <p className="text-xs text-slate-400">Enter total without tracking individual denominations</p>
              </div>
            )}

            <div className={`mt-5 p-4 rounded-xl flex items-center justify-between transition-all ${openTotal > 0 ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white" : "bg-slate-100"}`}>
              <span className={`text-sm font-medium ${openTotal > 0 ? "text-blue-100" : "text-slate-500"}`}>Total Opening Cash</span>
              <span className={`text-2xl font-bold ${openTotal > 0 ? "text-white" : "text-slate-400"}`}>Rs. {openTotal.toLocaleString("en-IN")}</span>
            </div>

            <button onClick={handleOpen} disabled={openTotal === 0 || !currentUser} className={`w-full mt-4 h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${openTotal > 0 && currentUser ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
              <Unlock className="w-4 h-4" /> Open Session
            </button>
            {!currentUser && <p className="text-xs text-red-500 text-center mt-2">Please log in to open a session</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Session Open
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-600 font-medium">{todayDate()}</span>
          <span className="text-xs text-slate-400">{nowTime()}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-600"><span className="text-slate-400">Branch:</span> {session.branchName}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-600"><span className="text-slate-400">Register:</span> {session.registerName}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-600"><span className="text-slate-400">Cashier:</span> {session.cashierName}</span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Drawer: Rs. {session.cashInDrawer.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setCashAction("in"); setShowCashDialog(true); }} className="h-8 px-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"><Plus className="w-3 h-3" /> Cash In</button>
          <button onClick={() => { setCashAction("out"); setShowCashDialog(true); }} className="h-8 px-3 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-amber-100 transition-colors"><Minus className="w-3 h-3" /> Cash Out</button>
          <button onClick={() => setShowCloseDialog(true)} className="h-8 px-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-red-100 transition-colors"><Lock className="w-3 h-3" /> Close Session</button>
        </div>
      </div>

      {showCashDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCashDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[380px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">{cashAction === "in" ? "Cash In" : "Cash Out"}</h3>
              <button onClick={() => setShowCashDialog(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input type="number" value={cashAmount} onChange={e => setCashAmount(e.target.value)} placeholder="Enter amount..." className="w-full h-12 px-3 rounded-xl border border-slate-200 text-base font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 mb-3" />
            <input type="text" value={cashNote} onChange={e => setCashNote(e.target.value)} placeholder="Note / reason..." className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setShowCashDialog(false)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleCashEvent} disabled={!cashAmount || Number(cashAmount) <= 0} className={`flex-1 h-11 text-white text-sm font-bold rounded-xl ${cashAction === "in" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"}`}>{cashAction === "in" ? "Add Cash" : "Remove Cash"}</button>
            </div>
          </div>
        </div>
      )}

      {showCloseDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCloseDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[480px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Close Session</h3>
                <p className="text-sm text-slate-400 mt-0.5">Count closing cash to end your shift</p>
              </div>
              <button onClick={() => setShowCloseDialog(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center mt-0.5"><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1 mb-4 mt-4">
              <button onClick={() => setCloseMode("denoms")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${closeMode === "denoms" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Count by Denominations</button>
              <button onClick={() => setCloseMode("amount")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${closeMode === "amount" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Enter Amount Only</button>
            </div>

            {closeMode === "denoms" ? (
              <div className="space-y-1.5">
                {DENOMINATIONS.map(d => (
                  <div key={d} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                    <span className="text-sm font-semibold text-slate-700 w-20">Rs. {d}</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button onClick={() => setCloseDenom({ ...closeDenom, [d]: Math.max(0, (closeDenom[d] || 0) - 1) })} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Minus className="w-3 h-3 text-slate-500" /></button>
                      <input type="number" min={0} value={closeDenom[d] || ""} onChange={e => setCloseDenom({ ...closeDenom, [d]: Number(e.target.value) || 0 })} className="w-14 h-7 px-1 rounded-lg border border-slate-200 text-sm text-center font-semibold focus:outline-none focus:border-blue-400 bg-white" placeholder="0" />
                      <button onClick={() => setCloseDenom({ ...closeDenom, [d]: (closeDenom[d] || 0) + 1 })} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Plus className="w-3 h-3 text-slate-500" /></button>
                    </div>
                    <span className={`text-sm font-semibold w-24 text-right ${(closeDenom[d] || 0) > 0 ? "text-blue-600" : "text-slate-400"}`}>Rs. {((closeDenom[d] || 0) * d).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Closing Cash Amount (Rs.)</label>
                <input type="number" value={closeSimpleAmount} onChange={e => setCloseSimpleAmount(e.target.value)} placeholder="0" className="w-full h-14 px-4 rounded-xl border border-slate-200 text-2xl font-bold text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15" />
              </div>
            )}

            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Counted Cash</span><span className="font-bold text-blue-600">Rs. {closeTotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Expected Cash</span><span className="font-bold text-slate-900">Rs. {expectedCash.toLocaleString("en-IN")}</span></div>
              {closeTotal !== expectedCash && (
                <div className="flex justify-between text-sm">
                  <span className={closeTotal > expectedCash ? "text-emerald-600" : "text-red-600"}>{closeTotal > expectedCash ? "Over" : "Short"}</span>
                  <span className={`font-bold ${closeTotal > expectedCash ? "text-emerald-600" : "text-red-600"}`}>Rs. {Math.abs(closeTotal - expectedCash).toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCloseDialog(false)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleClose} className="flex-1 h-11 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600">Close Session</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
