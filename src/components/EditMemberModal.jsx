import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, AlertCircle, Send, Upload, UserCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import ImageCropperModal from './ImageCropperModal';
import { fileToBase64, dataUrlToFile } from '../utils/cropUtils';

export default function EditMemberModal({
  isOpen,
  onClose,
  member,
  userRole = 'VIEWER',
  members = [],
  onUpdateDirect,
  onProposeChange,
  onDeleteMember,
}) {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('L');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [ayahId, setAyahId] = useState('');
  const [ibuId, setIbuId] = useState('');
  const [fotoProfil, setFotoProfil] = useState(null); // base64 string
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Avatar Upload States
  const fileInputRef = useRef(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);

  useEffect(() => {
    if (member && isOpen) {
      setNamaLengkap(member.nama_lengkap || '');
      setJenisKelamin(member.jenis_kelamin || 'L');
      setTanggalLahir(member.tanggal_lahir ? member.tanggal_lahir.split('T')[0] : '');
      setAyahId(member.ayah_id || '');
      setIbuId(member.ibu_id || '');
      setFotoProfil(member.foto_profil || null);
      setErrorMsg('');
      setConfirmDelete(false);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const isAdmin = userRole === 'ADMIN_UTAMA';
  const isContributor = userRole === 'KONTRIBUTOR';
  const canEdit = isAdmin || isContributor;

  /**
   * Kumpulkan seluruh ID keturunan (anak, cucu, dst) dari anggota ini secara rekursif.
   * Digunakan untuk mencegah siklus silsilah (A sebagai orang tua dari B, B sebagai orang tua dari A).
   * Siklus menyebabkan Dagre crash karena DAG tidak boleh memiliki siklus.
   */
  function getDescendantIds(memberId, allMembers, visited = new Set()) {
    if (visited.has(memberId)) return visited;
    visited.add(memberId);
    allMembers
      .filter((m) => m.ayah_id === memberId || m.ibu_id === memberId)
      .forEach((child) => getDescendantIds(child.id, allMembers, visited));
    return visited;
  }

  const descendantIds = getDescendantIds(member.id, members);

  // Filter parent candidates: exclude diri sendiri DAN seluruh keturunannya
  const maleMembers = members.filter(
    (m) => m.jenis_kelamin === 'L' && !descendantIds.has(m.id)
  );
  const femaleMembers = members.filter(
    (m) => m.jenis_kelamin === 'P' && !descendantIds.has(m.id)
  );

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // 10MB limit check
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal adalah 10 MB.');
        return;
      }
      try {
        const imageDataUrl = await fileToBase64(file);
        setSelectedImageSrc(imageDataUrl);
        setCropperOpen(true);
      } catch (err) {
        setErrorMsg('Gagal membaca file gambar.');
      }
      e.target.value = ''; // reset input
    }
  };

  const handleCropComplete = async (croppedImageBlobUrl) => {
    setCropperOpen(false);
    setLoading(true);
    try {
      // Ubah dari blob url ke File
      const file = await dataUrlToFile(croppedImageBlobUrl, 'avatar.jpg');
      
      // Kompresi (Target sangat kecil untuk prototype base64: ~50KB, max width 250px)
      const options = {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 250,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };
      
      const compressedFile = await imageCompression(file, options);
      const compressedBase64 = await fileToBase64(compressedFile);
      
      setFotoProfil(compressedBase64);
    } catch (_err) {
      setErrorMsg('Gagal mengompres gambar.');
    } finally {
      setLoading(false);
      // Bebaskan blob URL dari memori browser agar tidak terjadi memory leak
      // URL.createObjectURL() mencadangkan memori hingga direvokeObjectURL
      URL.revokeObjectURL(croppedImageBlobUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const patchData = {
      nama_lengkap: namaLengkap.trim(),
      jenis_kelamin: jenisKelamin,
      tanggal_lahir: tanggalLahir || null,
      ayah_id: ayahId || null,
      ibu_id: ibuId || null,
      foto_profil: fotoProfil,
    };

    try {
      if (isAdmin) {
        // Admin Utama: Pembaruan langsung dengan Optimistic Locking
        await onUpdateDirect(member.id, member.version, patchData);
      } else if (isContributor) {
        // Kontributor: Pengajuan usulan perubahan (Handover proposal)
        await onProposeChange({
          target_member_id: member.id,
          target_version: member.version,
          patch_data: patchData,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses perubahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await onDeleteMember(member.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menghapus anggota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-xs bg-[#f7e043] text-black font-mono font-bold text-[10px] flex items-center justify-center">
              ✎
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight uppercase">
                {isAdmin ? 'Ubah Data Anggota' : 'Usulkan Perubahan'}
              </h3>
              <div className="text-[10px] text-zinc-400 font-mono">
                NODE: {member.id.substring(0, 8)}... • VERSI: v{member.version}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {isContributor && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded text-xs">
              <span className="font-bold text-zinc-900 uppercase font-mono block mb-1">
                KONTRIBUTOR HANDOVER
              </span>
              Perubahan Anda akan diajukan ke Admin Utama untuk disetujui melalui mekanisme otorisasi persetujuan.
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex items-center gap-4 py-2 border-b border-zinc-100 pb-4">
            <div className="w-16 h-16 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 overflow-hidden relative group">
              {fotoProfil ? (
                <img src={fotoProfil} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-8 h-8 text-zinc-400" />
              )}
              {canEdit && (
                <div 
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Foto Profil
              </label>
              <div className="text-[10px] text-zinc-500 mb-2">Max 10MB. Otomatis kompres & potong wajah 1:1.</div>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-[#f7e043] text-[10px] font-mono font-bold uppercase tracking-wider rounded transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Unggah Foto
                  </button>
                  {fotoProfil && (
                    <button
                      type="button"
                      onClick={() => setFotoProfil(null)}
                      className="px-2 py-1.5 text-[10px] font-mono text-rose-500 hover:text-rose-700 transition-colors uppercase font-bold"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!canEdit}
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none disabled:bg-zinc-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Jenis Kelamin <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center justify-center gap-2 p-2 rounded border text-xs font-bold font-mono uppercase cursor-pointer transition-all ${
                  jenisKelamin === 'L'
                    ? 'border-zinc-900 bg-zinc-900 text-[#f7e043] shadow-xs'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                }`}
              >
                <input
                  type="radio"
                  name="editJenisKelamin"
                  disabled={!canEdit}
                  value="L"
                  checked={jenisKelamin === 'L'}
                  onChange={() => setJenisKelamin('L')}
                  className="sr-only"
                />
                <span>LAKI-LAKI (L)</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2 p-2 rounded border text-xs font-bold font-mono uppercase cursor-pointer transition-all ${
                  jenisKelamin === 'P'
                    ? 'border-zinc-900 bg-zinc-900 text-[#f7e043] shadow-xs'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                }`}
              >
                <input
                  type="radio"
                  name="editJenisKelamin"
                  disabled={!canEdit}
                  value="P"
                  checked={jenisKelamin === 'P'}
                  onChange={() => setJenisKelamin('P')}
                  className="sr-only"
                />
                <span>PEREMPUAN (P)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              disabled={!canEdit}
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none disabled:bg-zinc-100 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Pilih Ayah (Leluhur)
              </label>
              <select
                disabled={!canEdit}
                value={ayahId}
                onChange={(e) => setAyahId(e.target.value)}
                className="w-full text-xs border border-zinc-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none bg-white disabled:bg-zinc-100 transition-colors"
              >
                <option value="">-- Tanpa Ayah --</option>
                {maleMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama_lengkap}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Pilih Ibu (Leluhur)
              </label>
              <select
                disabled={!canEdit}
                value={ibuId}
                onChange={(e) => setIbuId(e.target.value)}
                className="w-full text-xs border border-zinc-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none bg-white disabled:bg-zinc-100 transition-colors"
              >
                <option value="">-- Tanpa Ibu --</option>
                {femaleMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama_lengkap}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            {isAdmin ? (
              confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-2.5 py-1.5 text-[11px] font-mono font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
                  >
                    YAKIN HAPUS?
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 text-[11px] font-mono text-zinc-500 hover:text-zinc-800"
                  >
                    BATAL
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1 text-xs font-mono text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>HAPUS</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-mono font-bold uppercase text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
              >
                Tutup
              </button>

              {canEdit && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white rounded shadow-xs transition-colors"
                >
                  <span>
                    {loading
                      ? 'MEMPROSES...'
                      : isAdmin
                      ? 'SIMPAN PERUBAHAN'
                      : 'KIRIM USULAN'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={selectedImageSrc}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
