import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Shield, CheckCircle2, AlertCircle, Mail, Crown } from 'lucide-react';
import { api } from '../services/api';

export default function CollaboratorsModal({
  isOpen,
  onClose,
  currentTree,
  onCollaboratorAdded,
  onOpenLimitModal,
}) {
  const [collaborators, setCollaborators] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('KONTRIBUTOR');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen && currentTree?.id) {
      loadCollaborators();
      setEmail('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, currentTree?.id]);

  const loadCollaborators = async () => {
    if (!currentTree?.id) return;
    setFetching(true);
    try {
      const res = await api.trees.getCollaborators(currentTree.id);
      if (res.success && res.data) {
        setCollaborators(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar kolaborator:', err);
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen || !currentTree) return null;

  const isAdminUtama = currentTree.role === 'ADMIN_UTAMA';
  const invitedCollaborators = collaborators.filter(
    (c) => c.role !== 'ADMIN_UTAMA' || c.user_id !== currentTree.created_by_user_id
  );
  const isLimitReached = invitedCollaborators.length >= 1;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (isLimitReached) {
      if (onOpenLimitModal) onOpenLimitModal('COLLABORATOR_LIMIT');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Harap masukkan alamat email.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.trees.addCollaborator(currentTree.id, {
        targetUserEmail: email.trim(),
        role,
      });

      if (res.success) {
        setSuccessMsg(`Berhasil mengundang "${email.trim()}" sebagai ${role}!`);
        setEmail('');
        await loadCollaborators();
        if (onCollaboratorAdded) onCollaboratorAdded();
      }
    } catch (err) {
      if (err.message && err.message.includes('Under development') && onOpenLimitModal) {
        onOpenLimitModal('COLLABORATOR_LIMIT', err.message);
      } else {
        setErrorMsg(err.message || 'Gagal mengundang kolaborator.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xs bg-zinc-900 text-[#f7e043] font-mono font-black text-xs flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight uppercase font-mono">
                Kolaborator Pohon
              </h3>
              <div className="text-[10px] text-zinc-400 font-mono">
                SEMESTA: {currentTree.nama_silsilah}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Undang Kolaborator (Hanya Admin Utama) */}
          {isAdminUtama ? (
            isLimitReached ? (
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-900">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Undang Kerabat ke Pohon Ini</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    1/1 Kuota Terpakai
                  </span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Batas Kolaborator Fase 1 Telah Tercapai</div>
                    <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                      Pada fase awal ini, setiap semesta dapat menambahkan maksimal 1 kolaborator. Fitur multi-kolaborator tim keluarga besar tanpa batas akan segera hadir pada fase berikutnya.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenLimitModal && onOpenLimitModal('COLLABORATOR_LIMIT')}
                  className="w-full py-2 bg-zinc-900 hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider rounded transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Pelajari Paket Fase Berikutnya</span>
                  <span className="text-[9px] bg-[#f7e043] text-black px-1.5 py-0.2 rounded font-black">PRO</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-900">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Undang Kerabat ke Pohon Ini</span>
                </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Email Akun Kerabat <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kerabat@email.com"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-zinc-300 rounded outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Peran Otoritas (Role)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-2 rounded border cursor-pointer transition-all flex flex-col gap-0.5 ${
                      role === 'KONTRIBUTOR'
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="collabRole"
                      value="KONTRIBUTOR"
                      checked={role === 'KONTRIBUTOR'}
                      onChange={() => setRole('KONTRIBUTOR')}
                      className="sr-only"
                    />
                    <span className="text-xs font-mono font-bold uppercase flex items-center gap-1">
                      ✍️ Kontributor
                    </span>
                    <span className={`text-[10px] leading-snug ${role === 'KONTRIBUTOR' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      Bisa tambah anak & ajukan usulan revisi.
                    </span>
                  </label>

                  <label
                    className={`p-2 rounded border cursor-pointer transition-all flex flex-col gap-0.5 ${
                      role === 'VIEWER'
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="collabRole"
                      value="VIEWER"
                      checked={role === 'VIEWER'}
                      onChange={() => setRole('VIEWER')}
                      className="sr-only"
                    />
                    <span className="text-xs font-mono font-bold uppercase flex items-center gap-1">
                      👀 Viewer
                    </span>
                    <span className={`text-[10px] leading-snug ${role === 'VIEWER' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      Hanya melihat kanvas & ekspor dokumen.
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">
                  * Kerabat harus sudah terdaftar di sistem.
                </span>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="px-4 py-2 bg-zinc-900 hover:bg-black disabled:bg-zinc-300 text-[#f7e043] rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  {loading ? 'Mengundang...' : 'Kirim Undangan'}
                </button>
              </div>
            </form>
          )) : (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-500">
              Hanya <strong>ADMIN_UTAMA</strong> yang dapat mengundang atau mengelola kolaborator pada semesta pohon ini.
            </div>
          )}

          {/* Daftar Kolaborator Saat Ini */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Anggota Semesta ({collaborators.length})
              </h4>
              {fetching && <span className="text-[10px] font-mono text-zinc-400">Memuat...</span>}
            </div>

            <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-md overflow-hidden bg-white">
              {collaborators.map((c) => {
                const isOwner = c.role === 'ADMIN_UTAMA';
                return (
                  <div key={c.id || c.user_id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.nama_lengkap} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {c.nama_lengkap?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 truncate flex items-center gap-1.5">
                          <span>{c.nama_lengkap}</span>
                          {isOwner && <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 truncate">
                          {c.email}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                          c.role === 'ADMIN_UTAMA'
                            ? 'bg-zinc-900 text-[#f7e043] border-zinc-900'
                            : c.role === 'KONTRIBUTOR'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}
                      >
                        {c.role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono font-bold uppercase text-zinc-600 hover:bg-zinc-200 rounded transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
