import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  GitBranch,
  Edit3,
  Plus,
  Trash2,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Shield,
  Layers,
  Heart,
  Users,
  Link2,
  Unlink2,
} from 'lucide-react';
import { getAllSpouses } from '../utils/marriageUtils';
import { sortChildrenByOrder, saveChildOrder } from '../utils/orderUtils';

export default function MemberProfileDrawer({
  isOpen,
  onClose,
  member,
  allMembers = [],
  marriages = [],
  treeId,
  userRole = 'VIEWER',
  onEditMember,
  onAddChild,
  onAddSpouse,
  onDeleteMember,
  onSelectMember,
  onReorderChildren,
  onLinkSpouse,
  onUnlinkSpouse,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedSpouseToLink, setSelectedSpouseToLink] = useState('');

  if (!isOpen || !member) return null;

  const isMale = member.jenis_kelamin === 'L';
  const isAdmin = userRole === 'ADMIN_UTAMA';
  const canEdit = ['ADMIN_UTAMA', 'KONTRIBUTOR'].includes(userRole);

  // Cari data orang tua
  const ayah = allMembers.find((m) => m.id === member.ayah_id);
  const ibu = allMembers.find((m) => m.id === member.ibu_id);

  // Seluruh pasangan terpadu (anak bersama + pernikahan eksplisit dari DB)
  const allSpouses = getAllSpouses(member.id, allMembers, marriages);

  // Anggota lawan jenis yang memenuhi syarat untuk dihubungkan sebagai pasangan
  const currentSpouseIds = new Set(allSpouses.map((s) => s.spouse.id));
  const eligibleSpouses = allMembers.filter(
    (m) =>
      m.id !== member.id &&
      m.jenis_kelamin !== member.jenis_kelamin &&
      !currentSpouseIds.has(m.id)
  );

  const handleLinkExistingSpouse = () => {
    if (!selectedSpouseToLink) return;
    // Kirim ke App.jsx yang akan memanggil API
    if (onLinkSpouse) onLinkSpouse(member.id, selectedSpouseToLink);
    setSelectedSpouseToLink('');
  };

  const handleUnlinkSpouse = (e, spouseId, marriageId) => {
    e.stopPropagation();
    if (window.confirm('Batalkan hubungan pasangan ini?')) {
      // Kirim marriageId ke App.jsx yang akan memanggil DELETE /marriages/:id
      if (onUnlinkSpouse) onUnlinkSpouse(marriageId);
    }
  };

  // Cari seluruh anak yang memiliki ayah_id atau ibu_id anggota ini
  const rawChildren = allMembers.filter(
    (m) => m.ayah_id === member.id || m.ibu_id === member.id
  );

  // Urutkan anak berdasarkan urutan tersimpan
  const sortedChildren = sortChildrenByOrder(rawChildren, treeId, member.id);

  const handleMoveChild = (e, index, direction) => {
    e.stopPropagation();
    const newChildren = [...sortedChildren];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newChildren.length) return;

    const temp = newChildren[index];
    newChildren[index] = newChildren[targetIndex];
    newChildren[targetIndex] = temp;

    const orderedIds = newChildren.map((c) => c.id);
    saveChildOrder(treeId, member.id, orderedIds);
    if (onReorderChildren) {
      onReorderChildren();
    }
  };

  // Cari saudara kandung (ayah & ibu sama)
  const siblings = allMembers.filter(
    (m) =>
      m.id !== member.id &&
      ((member.ayah_id && m.ayah_id === member.ayah_id) ||
        (member.ibu_id && m.ibu_id === member.ibu_id))
  );

  // Hitung usia jika tanggal lahir ada
  let age = null;
  if (member.tanggal_lahir) {
    const birthYear = new Date(member.tanggal_lahir).getFullYear();
    const currentYear = new Date().getFullYear();
    if (!isNaN(birthYear)) {
      age = currentYear - birthYear;
    }
  }

  const handleDelete = () => {
    onDeleteMember(member.id);
    setConfirmDelete(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-2xs transition-all duration-300 select-none">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container: Slide from right on desktop, Bottom-sheet on mobile */}
      <div className="w-full sm:w-[420px] bg-white h-[85vh] sm:h-full mt-auto sm:mt-0 rounded-t-2xl sm:rounded-none border-l border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-200">
        {/* Mobile Pull Bar */}
        <div className="sm:hidden w-12 h-1.5 bg-zinc-300 rounded-full mx-auto my-2" />

        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-xs bg-[#f7e043] text-black font-mono font-black text-[10px] flex items-center justify-center">
              ✦
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 text-xs tracking-tight uppercase font-mono">
                Profil Anggota Silsilah
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">
                ID: {member.id.substring(0, 8)}...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700"
              title={`Versi data saat ini: v${member.version || 1}`}
            >
              v{member.version || 1}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Main Card Monogram Header */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center gap-4">
            {/* Avatar Circle with Yellow Tag */}
            <div className="relative shrink-0">
              {member.foto_profil ? (
                <div className="w-14 h-14 rounded-md overflow-hidden border border-zinc-200 shadow-xs">
                  <img src={member.foto_profil} alt={member.nama_lengkap} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className={`w-14 h-14 rounded-md border flex items-center justify-center font-mono font-black text-xl shadow-xs ${
                    isMale
                      ? 'bg-zinc-900 text-[#f7e043] border-zinc-900'
                      : 'bg-zinc-800 text-white border-zinc-800'
                  }`}
                >
                  {member.nama_lengkap?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-xs bg-[#f7e043] text-black font-mono font-black text-[10px] flex items-center justify-center border border-yellow-400 shadow-2xs">
                {isMale ? 'L' : 'P'}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold text-zinc-900 text-base leading-snug tracking-tight truncate">
                {member.nama_lengkap}
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 mt-1">
                <span>{isMale ? 'Laki-laki' : 'Perempuan'}</span>
                {age !== null && (
                  <>
                    <span>•</span>
                    <span>{age} Tahun</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Informasi Vital */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Informasi Kelahiran
            </h4>
            <div className="p-3 rounded border border-zinc-200 bg-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-600">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Tanggal Lahir</span>
              </div>
              <span className="font-mono font-bold text-zinc-900">
                {member.tanggal_lahir
                  ? member.tanggal_lahir.split('T')[0]
                  : 'Belum tercatat'}
              </span>
            </div>
          </div>

          {/* Silsilah Leluhur (Orang Tua) */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Garis Orang Tua (Leluhur)
            </h4>
            <div className="space-y-1.5">
              {/* Ayah */}
              <div
                onClick={() => ayah && onSelectMember(ayah)}
                className={`p-3 rounded border flex items-center justify-between text-xs transition-colors ${
                  ayah
                    ? 'border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 cursor-pointer'
                    : 'border-dashed border-zinc-200 bg-zinc-50/50 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-2xs bg-zinc-900 text-[#f7e043] text-[9px] font-mono font-bold flex items-center justify-center">
                    A
                  </span>
                  <span className="font-semibold text-zinc-800">
                    {ayah ? ayah.nama_lengkap : 'Ayah belum ditentukan'}
                  </span>
                </div>
                {ayah && <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
              </div>

              {/* Ibu */}
              <div
                onClick={() => ibu && onSelectMember(ibu)}
                className={`p-3 rounded border flex items-center justify-between text-xs transition-colors ${
                  ibu
                    ? 'border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 cursor-pointer'
                    : 'border-dashed border-zinc-200 bg-zinc-50/50 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-2xs bg-zinc-800 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    I
                  </span>
                  <span className="font-semibold text-zinc-800">
                    {ibu ? ibu.nama_lengkap : 'Ibu belum ditentukan'}
                  </span>
                </div>
                {ibu && <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
            </div>
          </div>

          {/* 💍 Pasangan (Suami/Istri) — DUKUNGAN LENGKAP POLIGAMI & PASANGAN TANPA ANAK */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-500 fill-pink-500/20" />
                Pasangan ({allSpouses.length})
              </h4>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onAddSpouse && onAddSpouse(member)}
                  className="text-[10px] font-mono font-bold uppercase text-zinc-900 hover:underline flex items-center gap-0.5"
                >
                  <Heart className="w-3 h-3 text-pink-500 fill-pink-500/20" />
                  <span>+ Tambah Baru</span>
                </button>
              )}
            </div>

            {allSpouses.length === 0 ? (
              <div className="p-3 rounded border border-dashed border-zinc-200 text-zinc-400 text-xs text-center font-mono">
                Belum ada pasangan terhubung.
                <br />
                <span className="text-[10px] text-zinc-400">
                  Gunakan tombol "+ Tambah Baru" atau hubungkan anggota yang sudah ada di bawah.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {allSpouses.map(({ spouse, sharedChildren, isExplicitOnly }) => (
                  <div
                    key={spouse.id}
                    className="p-3 rounded border border-zinc-200 hover:border-zinc-900 bg-white text-xs transition-colors space-y-2"
                  >
                    <div
                      onClick={() => onSelectMember(spouse)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-2xs bg-[#f7e043] text-black text-[9px] font-mono font-bold flex items-center justify-center">
                          {spouse.jenis_kelamin}
                        </span>
                        <div>
                          <span className="font-semibold text-zinc-800 group-hover:text-black">
                            {spouse.nama_lengkap}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 block">
                            {sharedChildren.length > 0
                              ? `${sharedChildren.length} anak bersama`
                              : 'Pasangan (belum ada anak bersama)'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-800" />
                    </div>

                    {/* Action Bar Khusus Pasangan Ini */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100 text-[10px] font-mono">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            // Prefill Ayah dan Ibu langsung dari pasangan ini
                            const isParentMale = member.jenis_kelamin === 'L';
                            onAddChild({
                              ...member,
                              forcedAyahId: isParentMale ? member.id : spouse.id,
                              forcedIbuId: isParentMale ? spouse.id : member.id,
                            });
                          }}
                          className="flex items-center gap-1 font-bold text-zinc-800 hover:text-black hover:underline"
                          title={`Tambah anak khusus dari pasangan ${spouse.nama_lengkap}`}
                        >
                          <Plus className="w-3 h-3 text-[#f7e043] bg-zinc-900 rounded-2xs p-0.5" />
                          <span>+ Anak dgn {spouse.nama_lengkap.split(' ')[0]}</span>
                        </button>
                      )}

                      {/* Tombol Putuskan Hubungan jika belum ada anak */}
                      {canEdit && isExplicitOnly && (
                        <button
                          type="button"
                          onClick={(e) => handleUnlinkSpouse(e, spouse.id, marriageId)}
                          className="flex items-center gap-0.5 text-rose-500 hover:text-rose-700 hover:underline ml-auto"
                          title="Batalkan hubungan pasangan ini"
                        >
                          <Unlink2 className="w-3 h-3" />
                          <span>Putuskan</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Opsi Hubungkan dengan Pasangan yang Sudah Ada */}
            {canEdit && eligibleSpouses.length > 0 && (
              <div className="pt-2 border-t border-dashed border-zinc-200">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-zinc-600" />
                  Hubungkan Pasangan yang Sudah Ada
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedSpouseToLink}
                    onChange={(e) => setSelectedSpouseToLink(e.target.value)}
                    className="flex-1 text-xs border border-zinc-300 rounded px-2 py-1.5 outline-none bg-white text-zinc-700"
                  >
                    <option value="">-- Pilih Anggota ({member.jenis_kelamin === 'L' ? 'Perempuan' : 'Laki-laki'}) --</option>
                    {eligibleSpouses.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama_lengkap} ({m.jenis_kelamin})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedSpouseToLink}
                    onClick={handleLinkExistingSpouse}
                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-black disabled:bg-zinc-200 disabled:text-zinc-400 text-[#f7e043] text-xs font-mono font-bold uppercase rounded transition-colors"
                  >
                    Hubungkan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Keturunan (Anak-Anak) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Garis Keturunan (Anak: {sortedChildren.length})
                </h4>
                {canEdit && sortedChildren.length > 1 && (
                  <span className="text-[9px] font-mono text-zinc-400 block">
                    Gunakan panah ▲ / ▼ untuk mengubah urutan kelahiran (kiri-ke-kanan di kanvas)
                  </span>
                )}
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onAddChild(member)}
                  className="text-[10px] font-mono font-bold uppercase text-zinc-900 hover:underline flex items-center gap-0.5 shrink-0"
                >
                  <Plus className="w-3 h-3 text-[#f7e043] bg-zinc-900 rounded-2xs p-0.5" />
                  <span>Tambah Anak</span>
                </button>
              )}
            </div>

            {sortedChildren.length === 0 ? (
              <div className="p-3 rounded border border-dashed border-zinc-200 text-zinc-400 text-xs text-center font-mono">
                Belum ada data anak terhubung.
              </div>
            ) : (
              <div className="space-y-1.5">
                {sortedChildren.map((child, index) => {
                  const isFirst = index === 0;
                  const isLast = index === sortedChildren.length - 1;
                  const orderLabel = isFirst && sortedChildren.length > 1 ? 'Sulung' : isLast && sortedChildren.length > 1 ? 'Bungsu' : null;

                  return (
                    <div
                      key={child.id}
                      onClick={() => onSelectMember(child)}
                      className="p-2.5 rounded border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Order Badge */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 font-mono font-bold text-[9px]">
                            #{index + 1}
                          </span>
                          {orderLabel && (
                            <span className="text-[8px] font-mono uppercase text-zinc-400 hidden sm:inline">
                              {orderLabel}
                            </span>
                          )}
                        </div>

                        <span className="w-4 h-4 rounded-2xs bg-[#f7e043] text-black text-[9px] font-mono font-bold flex items-center justify-center shrink-0">
                          {child.jenis_kelamin}
                        </span>
                        <span className="font-semibold text-zinc-800 truncate">
                          {child.nama_lengkap}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* Reorder Buttons */}
                        {canEdit && sortedChildren.length > 1 && (
                          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={(e) => handleMoveChild(e, index, -1)}
                              className="p-1 rounded hover:bg-zinc-200 text-zinc-600 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title="Geser ke nomor lebih awal (posisi lebih kiri)"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={(e) => handleMoveChild(e, index, 1)}
                              className="p-1 rounded hover:bg-zinc-200 text-zinc-600 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title="Geser ke nomor berikutnya (posisi lebih kanan)"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saudara Kandung / Sekeluarga */}
          {siblings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Saudara ({siblings.length})
              </h4>
              <div className="space-y-1.5">
                {siblings.map((sib) => (
                  <div
                    key={sib.id}
                    onClick={() => onSelectMember(sib)}
                    className="p-2 rounded border border-zinc-100 hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-zinc-700 truncate">
                      {sib.nama_lengkap}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {sib.jenis_kelamin === 'L' ? 'Saudara' : 'Saudari'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/80 flex items-center justify-between gap-2 shrink-0">
          {isAdmin ? (
            confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDelete}
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
                className="flex items-center gap-1 p-2 rounded text-xs font-mono text-rose-600 hover:bg-rose-50 transition-colors"
                title="Hapus Anggota Ini"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-bold">HAPUS</span>
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAddChild(member)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-600" />
              <span>+ Anak</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={() => onEditMember(member)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase bg-zinc-900 hover:bg-black text-[#f7e043] rounded transition-colors shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Ubah Data' : 'Usulkan'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
