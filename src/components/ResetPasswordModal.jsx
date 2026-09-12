import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function ResetPasswordModal({
  isOpen,
  onClose,
  token,
  email,
  onResetSuccess,
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setIsSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.auth.resetPassword({
        email,
        token,
        newPassword,
      });

      setIsSuccess(true);
      setTimeout(() => {
        if (onResetSuccess) {
          onResetSuccess(email);
        }
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengatur ulang kata sandi. Token mungkin telah kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-200 cursor-default"
      >
        {/* Header Modal */}
        <div className="relative p-6 text-center bg-zinc-50 border-b border-zinc-100">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/70 transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-10 h-10 mx-auto rounded-xs bg-[#f7e043] text-black border border-yellow-400 font-mono font-black text-base flex items-center justify-center shadow-xs mb-3">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-base font-black text-zinc-900 tracking-tight uppercase">
            Atur Kata Sandi Baru
          </h2>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">
            Buat kata sandi baru untuk akun Silsilah Keluarga Anda
          </p>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-tight">{errorMsg}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs space-y-2 text-center py-5">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-emerald-800">Kata Sandi Berhasil Diperbarui!</h3>
              <p className="text-zinc-600 leading-relaxed">
                Anda akan otomatis dialihkan ke halaman masuk dalam sekejap...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Akun Email
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full text-xs sm:text-sm bg-zinc-100 border border-zinc-200 text-zinc-600 rounded px-3 py-2 outline-none font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white rounded transition-colors shadow-xs mt-2"
              >
                <span>{loading ? 'MENYIMPAN...' : 'SIMPAN KATA SANDI BARU'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
