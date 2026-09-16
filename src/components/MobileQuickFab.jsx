import React, { useState } from 'react';
import { Plus, X, Layers, CheckSquare, BookOpen, UserPlus, Users, HelpCircle, Sparkles, MessageSquarePlus } from 'lucide-react';

export default function MobileQuickFab({
  onAddMember,
  onRelayout,
  onOpenApprovals,
  onOpenGuide,
  onOpenCollaborators,
  onOpenAboutFaq,
  onOpenUpgrade,
  onOpenFeedback,
  pendingCount = 0,
  canAdd = true,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2 sm:hidden [@media(max-height:500px)]:!flex select-none">
      {/* Sub-actions Menu */}
      {expanded && (
        <div className="flex flex-col items-end gap-2 mb-1 animate-in slide-in-from-bottom-3 duration-150">
          {/* Action: Beri Masukan & Saran */}
          {onOpenFeedback && (
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                onOpenFeedback();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-zinc-300 text-zinc-800 text-xs font-mono font-bold uppercase shadow-md active:scale-95 transition-all"
            >
              <span>Beri Masukan</span>
              <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
                <MessageSquarePlus className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </button>
          )}
          {/* Action: Upgrade Paket */}
          {onOpenUpgrade && (
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                onOpenUpgrade();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#f7e043] border border-yellow-500 text-black text-xs font-mono font-black uppercase shadow-md active:scale-95 transition-all"
            >
              <span>Upgrade Paket</span>
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-[#f7e043] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </button>
          )}
          {/* Action: Panduan */}
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              onOpenGuide();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-zinc-300 text-zinc-800 text-xs font-mono font-bold uppercase shadow-md active:scale-95 transition-all"
          >
            <span>Panduan UX</span>
            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-zinc-700" />
            </div>
          </button>

          {/* Action: About & FAQ */}
          {onOpenAboutFaq && (
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                onOpenAboutFaq();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-zinc-300 text-zinc-800 text-xs font-mono font-bold uppercase shadow-md active:scale-95 transition-all"
            >
              <span>About & FAQ</span>
              <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-700" />
              </div>
            </button>
          )}

          {/* Action: Kolaborator */}
          {onOpenCollaborators && (
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                onOpenCollaborators();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-zinc-300 text-zinc-800 text-xs font-mono font-bold uppercase shadow-md active:scale-95 transition-all"
            >
              <span>Kolaborator</span>
              <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-zinc-700" />
              </div>
            </button>
          )}

          {/* Action: Atur Layout Otomatis */}
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              onRelayout();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-zinc-300 text-zinc-800 text-xs font-mono font-bold uppercase shadow-md active:scale-95 transition-all"
          >
            <span>Rapikan Pohon</span>
            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-zinc-700" />
            </div>
          </button>

          {/* Action: Usulan Perubahan */}
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              onOpenApprovals();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-zinc-300 text-zinc-800 text-xs font-mono font-bold uppercase shadow-md active:scale-95 transition-all"
          >
            <span>Usulan {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center relative">
              <CheckSquare className="w-3.5 h-3.5 text-zinc-700" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#f7e043] border border-black" />
              )}
            </div>
          </button>

          {/* Action: Tambah Anggota */}
          {canAdd && (
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                onAddMember();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-900 text-[#f7e043] text-xs font-mono font-bold uppercase shadow-md active:scale-95 transition-all"
            >
              <span>+ Anggota Baru</span>
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5 text-[#f7e043]" />
              </div>
            </button>
          )}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-13 h-13 rounded-full bg-zinc-900 hover:bg-black text-[#f7e043] flex items-center justify-center shadow-xl border-2 border-[#f7e043] transition-all active:scale-95"
        aria-label="Menu Aksi Cepat Mobile"
      >
        {expanded ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-[#f7e043]" />}
      </button>
    </div>
  );
}
