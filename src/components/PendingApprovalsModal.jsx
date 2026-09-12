import React, { useState } from 'react';
import { X, Check, XCircle, AlertCircle, Clock } from 'lucide-react';

export default function PendingApprovalsModal({
  isOpen,
  onClose,
  approvals = [],
  userRole = 'VIEWER',
  onResolve,
  onRefresh,
}) {
  const [loadingId, setLoadingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isAdmin = userRole === 'ADMIN_UTAMA';

  const handleAction = async (approvalId, action) => {
    setLoadingId(approvalId);
    setErrorMsg('');

    try {
      await onResolve(approvalId, action, reviewNotes[approvalId] || '');
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses usulan');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-xs bg-[#f7e043] text-black font-mono font-bold text-[10px] flex items-center justify-center">
              ✓
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight uppercase">
                Persetujuan Usulan (Handover & Approval)
              </h3>
              <div className="text-[10px] text-zinc-400 font-mono">
                OTORISASI PERUBAHAN OLEH ADMIN UTAMA
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {approvals.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <Clock className="w-10 h-10 mx-auto mb-2 text-zinc-300 stroke-[1.5]" />
              <p className="font-mono text-xs uppercase tracking-wider">
                Tidak ada usulan perubahan yang tertunda.
              </p>
            </div>
          ) : (
            approvals.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded border border-zinc-200 bg-zinc-50/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-900 text-sm">
                      Target: {item.target_member_name || item.target_member_id}
                    </span>
                    <div className="text-xs text-zinc-500 font-mono">
                      Diusulkan: {item.proposed_by_name} ({item.proposed_by_email})
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f7e043] text-black font-bold border border-yellow-400">
                    TARGET v{item.target_version}
                  </span>
                </div>

                {/* Patch Data Preview */}
                <div className="bg-white rounded p-3 border border-zinc-200 text-xs">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Patch Data (JSON):
                  </div>
                  <pre className="text-zinc-800 font-mono text-[11px] bg-zinc-50 p-2 rounded overflow-x-auto border border-zinc-100">
                    {JSON.stringify(item.patch_data, null, 2)}
                  </pre>
                </div>

                {/* Review Actions for ADMIN_UTAMA */}
                {isAdmin && (
                  <div className="pt-2 border-t border-zinc-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      placeholder="Catatan peninjauan..."
                      value={reviewNotes[item.id] || ''}
                      onChange={(e) =>
                        setReviewNotes({ ...reviewNotes, [item.id]: e.target.value })
                      }
                      className="flex-1 text-xs border border-zinc-300 rounded px-3 py-1.5 bg-white outline-none focus:border-zinc-900"
                    />

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        disabled={loadingId === item.id}
                        onClick={() => handleAction(item.id, 'REJECTED')}
                        className="flex items-center gap-1 text-xs font-mono font-bold uppercase px-3 py-1.5 bg-white hover:bg-zinc-100 text-rose-600 border border-zinc-300 rounded transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>

                      <button
                        type="button"
                        disabled={loadingId === item.id}
                        onClick={() => handleAction(item.id, 'APPROVED')}
                        className="flex items-center gap-1 text-xs font-mono font-bold uppercase px-3 py-1.5 bg-zinc-900 hover:bg-black text-[#f7e043] rounded transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-bold uppercase text-zinc-700 hover:bg-zinc-200/60 rounded transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
