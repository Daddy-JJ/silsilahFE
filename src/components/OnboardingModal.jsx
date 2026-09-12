import React, { useState } from 'react';
import {
  GitBranch,
  UserPlus,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Shield,
  Sparkles,
} from 'lucide-react';

export default function OnboardingModal({
  isOpen,
  onClose,
  userName = 'Pengguna Baru',
  onCreateFirstTreeAndMember,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [treeName, setTreeName] = useState('');
  const [ancestorName, setAncestorName] = useState('');
  const [ancestorGender, setAncestorGender] = useState('L');
  const [ancestorBirthDate, setAncestorBirthDate] = useState('');
  // Pasangan leluhur (opsional)
  const [includeSpouse, setIncludeSpouse] = useState(false);
  const [spouseName, setSpouseName] = useState('');
  const [spouseBirthDate, setSpouseBirthDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const spouseGender = ancestorGender === 'L' ? 'P' : 'L';

  const handleNextStep1 = () => {
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    if (!treeName.trim()) {
      setErrorMsg('Harap berikan nama semesta pohon silsilah Anda.');
      return;
    }
    setErrorMsg('');
    setCurrentStep(3);
  };

  const handleFinish = async (e) => {
    e?.preventDefault();
    if (!ancestorName.trim()) {
      setErrorMsg('Nama leluhur utama wajib diisi.');
      return;
    }
    if (includeSpouse && !spouseName.trim()) {
      setErrorMsg('Nama pasangan leluhur wajib diisi jika toggle aktif.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await onCreateFirstTreeAndMember({
        treeName: treeName.trim(),
        ancestor: {
          nama_lengkap: ancestorName.trim(),
          jenis_kelamin: ancestorGender,
          tanggal_lahir: ancestorBirthDate || null,
        },
        spouse: includeSpouse
          ? {
              nama_lengkap: spouseName.trim(),
              jenis_kelamin: spouseGender,
              tanggal_lahir: spouseBirthDate || null,
            }
          : null,
      });
      setCurrentStep(4);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyiapkan silsilah pertama.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden border border-zinc-200 flex flex-col">
        {/* Header Ticker */}
        <div className="px-6 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-xs bg-[#f7e043] text-black font-mono font-black text-[10px] flex items-center justify-center">
              ✦
            </div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              PANDUAN PENGGUNA BARU (ONBOARDING)
            </span>
          </div>
          <div className="font-mono text-xs font-bold text-zinc-400">
            LANGKAH {currentStep} / 4
          </div>
        </div>

        {/* Progress Bar Indicator */}
        <div className="w-full h-1 bg-zinc-100 flex">
          <div
            className="h-full bg-zinc-900 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-8 flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: WELCOME & VALUE PROPOSITION */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f7e043] text-black font-mono text-[10px] font-black uppercase mb-3">
                  <Sparkles className="w-3 h-3" />
                  SELAMAT DATANG DI SILSILAH KELUARGA
                </div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
                  Halo, {userName}!
                </h2>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Aplikasi ini dirancang untuk membantu Anda dan keluarga besar mendokumentasikan silsilah garis keturunan secara interaktif, kolaboratif, dan terstruktur.
                </p>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded border border-zinc-200 bg-zinc-50/50 space-y-1.5">
                  <div className="w-6 h-6 rounded-xs bg-zinc-900 text-[#f7e043] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase font-mono">
                    Multi-Semesta
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Buat beberapa pohon sekaligus: keluarga kakek, nenek, atau mertua dalam satu akun.
                  </p>
                </div>

                <div className="p-3.5 rounded border border-zinc-200 bg-zinc-50/50 space-y-1.5">
                  <div className="w-6 h-6 rounded-xs bg-zinc-900 text-[#f7e043] flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase font-mono">
                    Kolaborasi
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Kerabat Anda dapat berkontribusi; setiap usulan ditinjau oleh Admin Utama.
                  </p>
                </div>

                <div className="p-3.5 rounded border border-zinc-200 bg-zinc-50/50 space-y-1.5">
                  <div className="w-6 h-6 rounded-xs bg-zinc-900 text-[#f7e043] flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase font-mono">
                    Kapasitas 50
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Visualisasi teroptimasi hingga 50 anggota per pohon dengan validasi anti-siklus.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-black text-[#f7e043] rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <span>Mulai Siapkan Pohon</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CREATE TREE UNIVERSE */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                  LANGKAH 1 — NAMA SEMESTA POHON
                </span>
                <h3 className="text-xl font-black text-zinc-900 tracking-tight uppercase">
                  Beri Nama Semesta Pohon Keluarga Anda
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Setiap semesta pohon dapat mewakili satu garis keturunan (contoh: keluarga besar ayah atau kakek).
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Nama Silsilah Keluarga <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={treeName}
                  onChange={(e) => setTreeName(e.target.value)}
                  placeholder="Contoh: Bani Ahmad Dahlan / Keluarga Besar Sudirman"
                  className="w-full text-sm border border-zinc-300 rounded px-3.5 py-2.5 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none font-medium"
                />
                <span className="text-[10px] font-mono text-zinc-400 mt-1.5 block">
                  Anda akan secara otomatis menjadi <strong>ADMIN_UTAMA</strong> untuk pohon ini.
                </span>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="flex items-center gap-2 px-5 py-2 bg-zinc-900 hover:bg-black text-[#f7e043] rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  <span>Lanjut: Input Leluhur</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INPUT FIRST ANCESTOR NODE + OPTIONAL SPOUSE */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                  LANGKAH 2 — TITIK AWAL SILSILAH
                </span>
                <h3 className="text-xl font-black text-zinc-900 tracking-tight uppercase">
                  Masukkan Sepasang Leluhur Utama
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Mulai dari pasangan puncak pohon (misal: Kakek & Nenek). Pasangan bersifat opsional — bisa ditambahkan nanti.
                </p>
              </div>

              {/* Ancestor utama */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  LELUHUR UTAMA
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={ancestorName}
                    onChange={(e) => setAncestorName(e.target.value)}
                    placeholder="Contoh: Kakek Raden Ahmad"
                    className="w-full text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Jenis Kelamin
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <label
                        className={`flex items-center justify-center p-1.5 rounded border text-[11px] font-mono font-bold uppercase cursor-pointer transition-all ${
                          ancestorGender === 'L'
                            ? 'border-zinc-900 bg-zinc-900 text-[#f7e043]'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ancestorGender"
                          value="L"
                          checked={ancestorGender === 'L'}
                          onChange={() => setAncestorGender('L')}
                          className="sr-only"
                        />
                        <span>L</span>
                      </label>
                      <label
                        className={`flex items-center justify-center p-1.5 rounded border text-[11px] font-mono font-bold uppercase cursor-pointer transition-all ${
                          ancestorGender === 'P'
                            ? 'border-zinc-900 bg-zinc-900 text-[#f7e043]'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ancestorGender"
                          value="P"
                          checked={ancestorGender === 'P'}
                          onChange={() => setAncestorGender('P')}
                          className="sr-only"
                        />
                        <span>P</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Tgl Lahir (Opsional)
                    </label>
                    <input
                      type="date"
                      value={ancestorBirthDate}
                      onChange={(e) => setAncestorBirthDate(e.target.value)}
                      className="w-full text-xs border border-zinc-300 rounded px-2 py-1.5 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle: Include Spouse */}
              <label className="flex items-center gap-3 p-3 rounded border border-zinc-200 bg-zinc-50/50 cursor-pointer hover:bg-zinc-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSpouse}
                  onChange={(e) => setIncludeSpouse(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 accent-[#f7e043]"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 uppercase font-mono">
                    💍 Sertakan Pasangan Leluhur
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    Tambahkan {ancestorGender === 'L' ? 'istri/nenek' : 'suami/kakek'} sebagai akar kedua pohon silsilah.
                  </span>
                </div>
              </label>

              {/* Spouse form (conditional) */}
              {includeSpouse && (
                <div className="space-y-3 p-4 rounded border-2 border-[#f7e043]/50 bg-[#f7e043]/5">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    💍 PASANGAN LELUHUR ({spouseGender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'})
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Nama Lengkap Pasangan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      placeholder={ancestorGender === 'L' ? 'Contoh: Nenek Siti Aminah' : 'Contoh: Kakek Raden Ahmad'}
                      className="w-full text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Tanggal Lahir Pasangan (Opsional)
                    </label>
                    <input
                      type="date"
                      value={spouseBirthDate}
                      onChange={(e) => setSpouseBirthDate(e.target.value)}
                      className="w-full text-xs border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-5 py-2 bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-[#f7e043] rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <span>{loading ? 'Menyiapkan...' : 'Simpan & Tampilkan Canvas'}</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ONBOARDING COMPLETE & TIPS */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center animate-in fade-in duration-150 py-2">
              <div className="w-12 h-12 rounded-xs bg-[#f7e043] text-black border border-yellow-400 mx-auto flex items-center justify-center font-mono font-black text-xl shadow-xs">
                ✓
              </div>

              <div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
                  Silsilah Pertama Anda Telah Siap!
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Semesta <strong>"{treeName}"</strong> telah dibuat bersama leluhur utama Anda.
                </p>
              </div>

              {/* Quick UX Tips Card */}
              <div className="bg-zinc-50 border border-zinc-200 rounded p-4 text-left space-y-2.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  CARA MEMANFAATKAN APLIKASI INI:
                </div>
                <ul className="text-xs text-zinc-700 space-y-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 text-[#f7e043] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      +
                    </span>
                    <span>
                      Klik <strong>+ Anak</strong> pada kartu untuk menambahkan keturunan; sistem otomatis mendeteksi kedua orang tua (*Smart Auto-Pair*).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 text-[#f7e043] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✎
                    </span>
                    <span>
                      Klik <strong>Ubah</strong> untuk edit data atau mengajukan usulan (*Proposal*). Buka panel samping untuk mengatur urutan kelahiran (Sulung/Bungsu).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 text-[#f7e043] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ⚡
                    </span>
                    <span>
                      Gunakan <strong>scroll 2 jari</strong> pada trackpad untuk menggeser kanvas, serta tombol <strong>Rapikan Layout (TB)</strong> untuk menata garis secara simetris otomatis.
                    </span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-zinc-900 hover:bg-black text-[#f7e043] font-mono text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-xs"
              >
                Mulai Jelajahi Canvas Silsilah
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
