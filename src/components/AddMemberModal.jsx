import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Heart, UserPlus, Users } from 'lucide-react';

export default function AddMemberModal({
  isOpen,
  onClose,
  onAddMember,
  members = [],
  prefill = {},
  mode = 'default', // 'default' | 'spouse' | 'child'
}) {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('L');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [ayahId, setAyahId] = useState('');
  const [ibuId, setIbuId] = useState('');
  const [selectedCoParentId, setSelectedCoParentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNamaLengkap('');
      setTanggalLahir('');
      setErrorMsg('');
      setSelectedCoParentId('');

      if (mode === 'spouse' && prefill.forceGender) {
        // Spouse mode: lock gender to opposite of the member
        setJenisKelamin(prefill.forceGender);
        setAyahId('');
        setIbuId('');
      } else {
        setJenisKelamin('L');
        setAyahId(prefill.ayah_id || '');
        setIbuId(prefill.ibu_id || '');
      }
    }
  }, [isOpen, prefill, mode]);

  if (!isOpen) return null;

  const isSpouseMode = mode === 'spouse';
  const isChildMode = mode === 'child';

  // Kasus poligami: Ada daftar pasangan yang harus dipilih
  const hasSpouseChoices = isChildMode && prefill.spouseChoices && prefill.spouseChoices.length > 0;

  // Kasus non-poligami: kedua orang tua sudah terkunci
  const bothParentsLocked = isChildMode && prefill.ayah_id && prefill.ibu_id && !hasSpouseChoices;

  const maleMembers = members.filter((m) => m.jenis_kelamin === 'L');
  const femaleMembers = members.filter((m) => m.jenis_kelamin === 'P');

  // Resolve parent names for locked display
  const lockedAyahName = bothParentsLocked
    ? maleMembers.find((m) => m.id === prefill.ayah_id)?.nama_lengkap
    : null;
  const lockedIbuName = bothParentsLocked
    ? femaleMembers.find((m) => m.id === prefill.ibu_id)?.nama_lengkap
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    // Validasi: jika ada pilihan pasangan, harus dipilih dulu
    if (hasSpouseChoices && !selectedCoParentId) {
      setErrorMsg('Harap pilih pasangan (co-parent) terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const memberData = {
        nama_lengkap: namaLengkap.trim(),
        jenis_kelamin: jenisKelamin,
        tanggal_lahir: tanggalLahir || null,
      };

      if (isSpouseMode) {
        memberData.ayah_id = null;
        memberData.ibu_id = null;
      } else if (hasSpouseChoices && selectedCoParentId) {
        // Kasus poligami: tentukan Ayah/Ibu berdasarkan pilihan pasangan
        const parentNode = prefill.parentNode;
        const coParent = prefill.spouseChoices.find(s => s.id === selectedCoParentId);
        if (parentNode && coParent) {
          if (parentNode.jenis_kelamin === 'L') {
            memberData.ayah_id = parentNode.id;
            memberData.ibu_id = coParent.id;
          } else {
            memberData.ibu_id = parentNode.id;
            memberData.ayah_id = coParent.id;
          }
        }
      } else {
        memberData.ayah_id = ayahId || null;
        memberData.ibu_id = ibuId || null;
      }

      await onAddMember(memberData);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menambahkan anggota keluarga');
    } finally {
      setLoading(false);
    }
  };

  // Modal header config per mode
  const headerConfig = {
    spouse: {
      icon: '💍',
      title: 'Tambah Pasangan (Suami/Istri)',
      subtitle: `PASANGAN UNTUK: ${prefill.spouseOf?.nama_lengkap || '—'}`,
    },
    child: {
      icon: '+',
      title: 'Tambah Anak',
      subtitle: 'PENYUSUNAN NODE KETURUNAN BARU',
    },
    default: {
      icon: '+',
      title: 'Tambah Anggota Keluarga',
      subtitle: 'PENYUSUNAN NODE SILSILAH BARU',
    },
  };

  const header = headerConfig[mode] || headerConfig.default;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 cursor-default"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-xs bg-[#f7e043] text-black font-mono font-bold text-[10px] flex items-center justify-center">
              {header.icon}
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight uppercase">
                {header.title}
              </h3>
              <div className="text-[10px] text-zinc-400 font-mono">
                {header.subtitle}
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Spouse mode: info banner */}
          {isSpouseMode && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded text-xs flex items-start gap-2">
              <Heart className="w-4 h-4 shrink-0 mt-0.5 text-[#f7e043]" />
              <div>
                <span className="font-bold text-zinc-900 uppercase font-mono block mb-0.5">
                  MODE PASANGAN
                </span>
                Pasangan akan ditambahkan sebagai anggota baru. Untuk menghubungkan
                keduanya di silsilah, klik <strong>+ Anak</strong> pada salah
                satu pasangan — kedua orang tua akan terisi otomatis.
              </div>
            </div>
          )}

          {/* POLIGAMI: Pilihan Co-Parent (Pasangan mana yang jadi Ibu/Ayah dari anak ini) */}
          {hasSpouseChoices && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs space-y-2">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold text-amber-900 uppercase font-mono block mb-0.5">
                    PILIH CO-PARENT (WAJIB)
                  </span>
                  <span className="text-amber-800">
                    <strong>{prefill.parentNode?.nama_lengkap}</strong> memiliki lebih dari satu pasangan.
                    Pilih pasangan mana yang menjadi orang tua bersama dari anak ini:
                  </span>
                </div>
              </div>
              <select
                value={selectedCoParentId}
                onChange={(e) => setSelectedCoParentId(e.target.value)}
                className="w-full text-xs border border-amber-400 rounded px-2.5 py-2 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white font-semibold"
                required
              >
                <option value="">-- Pilih Pasangan Co-Parent --</option>
                {prefill.spouseChoices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_lengkap} ({s.jenis_kelamin === 'L' ? 'Ayah' : 'Ibu'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Child mode with auto-pair: info banner */}
          {bothParentsLocked && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded text-xs flex items-start gap-2">
              <UserPlus className="w-4 h-4 shrink-0 mt-0.5 text-zinc-500" />
              <div>
                <span className="font-bold text-zinc-900 uppercase font-mono block mb-0.5">
                  AUTO-PAIR AKTIF
                </span>
                Kedua orang tua telah otomatis terdeteksi sebagai pasangan.
                Anak ini akan langsung terhubung ke keduanya.
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder={
                isSpouseMode
                  ? 'Contoh: Nyai Siti Aminah'
                  : 'Contoh: Raden Mas Danang'
              }
              maxLength={100}
              autoComplete="off"
              className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Jenis Kelamin <span className="text-rose-500">*</span>
              {isSpouseMode && (
                <span className="text-zinc-400 normal-case font-normal ml-1">
                  (otomatis berlawanan)
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center justify-center gap-2 p-2 rounded border text-xs font-bold font-mono uppercase transition-all ${
                  isSpouseMode ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
                  jenisKelamin === 'L'
                    ? 'border-zinc-900 bg-zinc-900 text-[#f7e043] shadow-xs'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                }`}
              >
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="L"
                  checked={jenisKelamin === 'L'}
                  onChange={() => !isSpouseMode && setJenisKelamin('L')}
                  disabled={isSpouseMode}
                  className="sr-only"
                />
                <span>LAKI-LAKI (L)</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2 p-2 rounded border text-xs font-bold font-mono uppercase transition-all ${
                  isSpouseMode ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
                  jenisKelamin === 'P'
                    ? 'border-zinc-900 bg-zinc-900 text-[#f7e043] shadow-xs'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                }`}
              >
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="P"
                  checked={jenisKelamin === 'P'}
                  onChange={() => !isSpouseMode && setJenisKelamin('P')}
                  disabled={isSpouseMode}
                  className="sr-only"
                />
                <span>PEREMPUAN (P)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Tanggal Lahir (Opsional)
            </label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-colors"
            />
          </div>

          {/* Parent Selection — hidden in spouse mode, locked or editable in child/default */}
          {!isSpouseMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Pilih Ayah (Leluhur)
                  {bothParentsLocked && (
                    <span className="text-[#f7e043] ml-1">🔒</span>
                  )}
                </label>
                {bothParentsLocked ? (
                  <div className="w-full text-xs border border-zinc-200 rounded px-2.5 py-2 bg-zinc-50 text-zinc-800 font-semibold">
                    {lockedAyahName || 'Ayah terpilih'}
                  </div>
                ) : (
                  <select
                    value={ayahId}
                    onChange={(e) => setAyahId(e.target.value)}
                    className="w-full text-xs border border-zinc-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none bg-white transition-colors"
                  >
                    <option value="">-- Tanpa Ayah --</option>
                    {maleMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama_lengkap}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Pilih Ibu (Leluhur)
                  {bothParentsLocked && (
                    <span className="text-[#f7e043] ml-1">🔒</span>
                  )}
                </label>
                {bothParentsLocked ? (
                  <div className="w-full text-xs border border-zinc-200 rounded px-2.5 py-2 bg-zinc-50 text-zinc-800 font-semibold">
                    {lockedIbuName || 'Ibu terpilih'}
                  </div>
                ) : (
                  <select
                    value={ibuId}
                    onChange={(e) => setIbuId(e.target.value)}
                    className="w-full text-xs border border-zinc-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none bg-white transition-colors"
                  >
                    <option value="">-- Tanpa Ibu --</option>
                    {femaleMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama_lengkap}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

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
              disabled={loading}
              className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white rounded transition-colors shadow-xs"
            >
              {loading
                ? 'Menyimpan...'
                : isSpouseMode
                ? 'Simpan Pasangan'
                : 'Simpan Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
