import React from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function FeatureLimitModal({
  isOpen,
  onClose,
  limitType = 'TREE_LIMIT',
  customMessage = '',
}) {
  if (!isOpen) return null;

  const getLimitDetails = () => {
    switch (limitType) {
      case 'TREE_LIMIT':
        return {
          title: 'Maksimal 1 Semesta Keluarga',
          detailDesc:
            'Pada fase awal ini (Early Access), setiap akun dibatasi hanya dapat membuat maksimal 1 semesta silsilah keluarga. Fitur untuk mengelola banyak semesta silsilah keluarga tanpa batas (Multi-Universe) sedang dalam tahap pengembangan dan akan hadir pada paket fase berikutnya.',
          currentLimit: 'Maks. 1 Semesta',
          nextPhase: 'Multi-Universe Tanpa Batas',
        };
      case 'NODE_LIMIT':
        return {
          title: 'Kapasitas Maksimal 30 Anggota',
          detailDesc:
            'Pada fase awal ini, setiap semesta keluarga dibatasi hingga 30 node anggota. Dukungan silsilah keluarga besar (ratusan hingga ribuan generasi keluarga) sedang dalam tahap pengembangan dan akan hadir pada paket fase berikutnya.',
          currentLimit: 'Maks. 30 Anggota',
          nextPhase: 'Ribuan Anggota (Unlimited)',
        };
      case 'COLLABORATOR_LIMIT':
        return {
          title: 'Maksimal 1 Kolaborator Tambahan',
          detailDesc:
            'Pada fase awal ini, Anda dapat menambahkan maksimal 1 kolaborator tambahan (Kontributor atau Viewer). Fitur kolaborasi tim keluarga besar tanpa batas sedang dalam tahap pengembangan dan akan hadir pada paket fase berikutnya.',
          currentLimit: 'Maks. 1 Kolaborator',
          nextPhase: 'Multi-Kolaborator Tanpa Batas',
        };
      default:
        return {
          title: 'Batasan Fitur Fase Awal',
          detailDesc:
            customMessage ||
            'Fitur ini sedang dalam tahap pengembangan aktif untuk fase berikutnya. Nantikan update terbaru dari kami!',
          currentLimit: 'Batas Fase 1',
          nextPhase: 'Fitur Penuh',
        };
    }
  };

  const details = getLimitDetails();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 cursor-default flex flex-col"
      >
        {/* Header Visual */}
        <div className="relative p-6 text-center bg-zinc-900 text-white border-b border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-[#f7e043] text-black mb-3 shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>Fase 1 • Early Access</span>
          </div>

          <div className="w-12 h-12 mx-auto rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#f7e043] shadow-inner mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black text-white tracking-tight uppercase font-mono">
            Under Development
          </h2>
          <p className="text-xs font-mono text-[#f7e043] font-bold mt-1 tracking-wide">
            Nantikan update dari kami!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Box Penjelasan */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-900 font-mono uppercase">
                  {details.title}
                </div>
                <div className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                  {details.detailDesc}
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Matriks Perbandingan Fase */}
          <div className="border border-zinc-200 rounded-md overflow-hidden text-xs">
            <div className="bg-zinc-100 px-3 py-2 border-b border-zinc-200 font-mono font-bold text-[10px] text-zinc-500 uppercase">
              Perbandingan Paket Layanan
            </div>
            <div className="divide-y divide-zinc-100">
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="text-zinc-600 font-medium">Semesta Keluarga</span>
                <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
                  Maks. 1 Pohon
                </span>
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="text-zinc-600 font-medium">Batas Anggota (Nodes)</span>
                <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
                  Maks. 30 Anggota
                </span>
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="text-zinc-600 font-medium">Kolaborator Tambahan</span>
                <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
                  Maks. 1 Orang
                </span>
              </div>
              <div className="px-3 py-2.5 bg-emerald-50/60 flex items-center justify-between">
                <span className="text-emerald-900 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Fase Berikutnya (Pro)
                </span>
                <span className="font-mono font-bold text-emerald-800 uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                  Segera Hadir
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Tutup */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-zinc-900 hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider rounded-md transition-all shadow-md active:scale-98 cursor-pointer"
          >
            Mengerti & Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
