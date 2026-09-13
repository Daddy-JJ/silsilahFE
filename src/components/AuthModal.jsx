import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, X, ArrowLeft, Mail } from 'lucide-react';
import { api } from '../services/api';
import logoApp from '../assets/logo-nexus.svg';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRegister = false,
  initialEmail = '',
}) {
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const googleBtnRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Sinkronkan tab Masuk vs Daftar saat modal dibuka dari Landing Page / Link Undangan
  useEffect(() => {
    if (isOpen) {
      setIsRegister(initialRegister);
      setIsForgotPassword(false);
      setForgotSuccess(false);
      if (initialEmail) {
        setEmail(initialEmail);
      } else {
        setEmail('');
      }
      setPassword('');
      setNamaLengkap('');
      setErrorMsg('');
    }
  }, [isOpen, initialRegister, initialEmail]);

  // Inisialisasi Google Identity Services Button
  useEffect(() => {
    if (!isOpen) return;

    const initGoogle = () => {
      if (window.google?.accounts?.id && googleClientId && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              if (response.credential) {
                setLoading(true);
                setErrorMsg('');
                try {
                  await onLoginSuccess('google', { credential: response.credential });
                } catch (err) {
                  setErrorMsg(err.message || 'Gagal masuk dengan akun Google.');
                } finally {
                  setLoading(false);
                }
              }
            },
          });

          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 336,
            text: isRegister ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        } catch (err) {
          console.warn('Gagal memuat Google Sign-In button:', err);
        }
      }
    };

    // Coba inisialisasi langsung atau tunggu SDK dimuat
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(timer);
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [isOpen, isRegister, googleClientId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        await onLoginSuccess('register', {
          email: email.trim(),
          password,
          nama_lengkap: namaLengkap.trim(),
        });
      } else {
        await onLoginSuccess('login', {
          email: email.trim(),
          password,
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Otentikasi gagal. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Harap masukkan alamat email Anda.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await api.auth.forgotPassword(email.trim());
      setForgotSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirimkan tautan pemulihan kata sandi.');
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

          {isForgotPassword ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setForgotSuccess(false);
                  setErrorMsg('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Masuk</span>
              </button>
              <div className="w-10 h-10 mx-auto rounded-xs bg-[#f7e043] text-black border border-yellow-400 font-mono font-black text-base flex items-center justify-center shadow-xs mb-2">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-zinc-900 tracking-tight uppercase">
                Lupa Kata Sandi
              </h2>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">
                Kirim tautan pemulihan ke email terdaftar Anda
              </p>
            </div>
          ) : (
            <div>
              <img
                src={logoApp}
                alt="Logo Silsilah"
                className="w-12 h-12 mx-auto object-contain rounded-lg shadow-xs mb-3"
              />
              <h2 className="text-lg font-black text-zinc-900 tracking-tight uppercase">
                Silsilah Keluarga
              </h2>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">
                Collaborative Tree Platform
              </p>

              {/* Segmented Tab */}
              <div className="flex bg-zinc-200 p-0.5 rounded mt-5 border border-zinc-300">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-1 text-xs font-mono font-bold uppercase transition-all rounded-xs ${
                    !isRegister ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-1 text-xs font-mono font-bold uppercase transition-all rounded-xs ${
                    isRegister ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Daftar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-4">
          {initialEmail && !isForgotPassword && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Anda diundang ke semesta silsilah keluarga! Silakan lengkapi pendaftaran akun untuk otomatis bergabung.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-medium block leading-tight">{errorMsg}</span>
                {!isRegister && !isForgotPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-mono font-bold text-rose-900 underline hover:text-rose-700 block text-left"
                  >
                    Lupa kata sandi Anda? Reset di sini.
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW 1: TAMPILAN LUPA KATA SANDI */}
          {isForgotPassword ? (
            forgotSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tautan Pemulihan Terkirim!</span>
                  </div>
                  <p className="leading-relaxed text-zinc-700">
                    Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke alamat:
                  </p>
                  <div className="p-2 bg-white rounded border border-emerald-200 font-mono font-bold text-zinc-900 text-center break-all">
                    {email}
                  </div>
                  <p className="text-[11px] text-zinc-500 italic">
                    Periksa kotak masuk (Inbox) atau folder Spam email Anda. Tautan berlaku selama 60 menit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotSuccess(false);
                    setErrorMsg('');
                  }}
                  className="w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black text-white rounded transition-colors shadow-xs"
                >
                  Kembali ke Halaman Masuk
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Email Akun Terdaftar
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white rounded transition-colors shadow-xs"
                >
                  <span>{loading ? 'MENGIRIM TAUTAN...' : 'KIRIM TAUTAN PEMULIHAN'}</span>
                </button>
              </form>
            )
          ) : (
            /* VIEW 2: TAMPILAN MASUK / DAFTAR BIASA */
            <>
              {/* Google OAuth Button Container */}
              <div>
                {googleClientId ? (
                  <div className="flex justify-center w-full min-h-[40px]">
                    <div ref={googleBtnRef} className="w-full flex justify-center" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('Untuk mengaktifkan tombol Google, daftarkan Client ID di Google Cloud Console dan masukkan ke file .env (VITE_GOOGLE_CLIENT_ID).');
                    }}
                    className="w-full py-2 px-3 border border-zinc-300 hover:border-zinc-400 rounded bg-white text-xs font-medium text-zinc-700 flex items-center justify-center gap-2 shadow-2xs hover:bg-zinc-50 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isRegister ? 'Daftar dengan Google' : 'Lanjutkan dengan Google'}</span>
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-zinc-200 w-full" />
                <span className="bg-white px-2.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400 absolute">
                  ATAU DENGAN EMAIL
                </span>
              </div>

              {/* Form Email + Password */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {isRegister && (
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                      Kata Sandi
                    </label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setForgotSuccess(false);
                          setErrorMsg('');
                        }}
                        className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 underline transition-colors"
                      >
                        Lupa kata sandi?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white rounded transition-colors shadow-xs"
                >
                  <span>{loading ? 'MEMPROSES...' : isRegister ? 'DAFTAR DENGAN EMAIL' : 'MASUK KE AKUN'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
