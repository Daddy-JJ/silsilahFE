import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Edit3 } from 'lucide-react';

export default function RenameTreeModal({ isOpen, onClose, currentTree, onRenameTree }) {
  const [namaSilsilah, setNamaSilsilah] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentTree?.nama_silsilah) {
      setNamaSilsilah(currentTree.nama_silsilah);
    }
    setErrorMsg('');
  }, [currentTree, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaSilsilah.trim()) {
      setErrorMsg('Nama semesta pohon silsilah wajib diisi.');
      return;
    }

    if (namaSilsilah.trim() === currentTree?.nama_silsilah) {
      onClose();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await onRenameTree({
        nama_silsilah: namaSilsilah.trim(),
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengubah nama semesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xs bg-[#f7e043] text-black font-mono font-bold text-xs flex items-center justify-center shadow-2xs border border-yellow-400">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight uppercase">
                Ubah Nama Semesta Silsilah
              </h3>
              <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                RENAME TREE UNIVERSE
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Nama Semesta Saat Ini
            </label>
            <div className="px-3 py-2 bg-zinc-100 border border-zinc-200 rounded text-xs font-mono text-zinc-500 mb-3 truncate">
              {currentTree?.nama_silsilah || '-'}
            </div>

            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Nama Silsilah Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={namaSilsilah}
              onChange={(e) => setNamaSilsilah(e.target.value)}
              placeholder="Masukkan nama semesta baru..."
              className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-colors"
            />
            <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
              Hanya dapat diubah oleh pemilik atau Admin Utama semesta ini.
            </span>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold uppercase text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !namaSilsilah.trim()}
              className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
