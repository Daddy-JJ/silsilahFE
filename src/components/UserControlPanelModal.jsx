import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  KeyRound,
  Mail,
  Users,
  TreeDeciduous,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api, setToken } from '../services/api';

export default function UserControlPanelModal({
  isOpen,
  onClose,
  user,
  trees = [],
  currentTree,
  onSelectTree,
  onUserUpdated,
  onLogout,
  onOpenFeedback,
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'invitations', 'trees'

  // Tab 1: Profile State
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Tab 2: Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ type: '', text: '' });

  // Tab 3: Invitations State
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationFilter, setInvitationFilter] = useState('ALL'); // 'ALL', 'KONTRIBUTOR', 'VIEWER', 'PENDING', 'ACCEPTED'
  const [copiedId, setCopiedId] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [inviteActionMsg, setInviteActionMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen && user) {
      setNamaLengkap(user.nama_lengkap || '');
      setEmail(user.email || '');
      setProfileMsg({ type: '', text: '' });
      setSecurityMsg({ type: '', text: '' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadInvitations();
    }
  }, [isOpen, user]);

  const loadInvitations = async () => {
    setInvitationsLoading(true);
    try {
      const res = await api.auth.getMyInvitations();
      if (res.success && res.data) {
        setInvitations(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat riwayat undangan:', err);
    } finally {
      setInvitationsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  // Handle Edit Profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      setProfileMsg({ type: 'error', text: 'Nama lengkap wajib diisi.' });
      return;
    }
    if (!email.trim()) {
      setProfileMsg({ type: 'error', text: 'Alamat email wajib diisi.' });
      return;
    }

    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const res = await api.auth.updateProfile({
        nama_lengkap: namaLengkap.trim(),
        email: email.trim(),
      });

      if (res.success && res.data) {
        if (res.data.token) {
          setToken(res.data.token);
        }
        if (onUserUpdated) {
          onUserUpdated(res.data.user);
        }
        setProfileMsg({ type: 'success', text: 'Profil akun berhasil diperbarui!' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Gagal memperbarui profil akun.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Ganti Kata Sandi
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      setSecurityMsg({ type: 'error', text: 'Kata sandi saat ini wajib diisi.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setSecurityMsg({ type: 'error', text: 'Kata sandi baru minimal harus 6 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    setSecurityLoading(true);
    setSecurityMsg({ type: '', text: '' });

    try {
      const res = await api.auth.changePassword({
        oldPassword,
        newPassword,
      });
      if (res.success) {
        setSecurityMsg({ type: 'success', text: 'Kata sandi berhasil diperbarui dengan aman!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setSecurityMsg({ type: 'error', text: err.message || 'Gagal memperbarui kata sandi.' });
    } finally {
      setSecurityLoading(false);
    }
  };

  // Salin Tautan Undangan
  const handleCopyInviteLink = (invite) => {
    const origin = window.location.origin;
    const inviteUrl = `${origin}?invite=${invite.token}&email=${encodeURIComponent(invite.email)}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Kirim Ulang Email Undangan
  const handleResendInviteEmail = async (invite) => {
    setResendingId(invite.id);
    setInviteActionMsg({ type: '', text: '' });
    try {
      const res = await api.trees.resendInvitation(invite.tree_id, invite.id);
      if (res.success) {
        setInviteActionMsg({
          type: 'success',
          text: `Email undangan berhasil dikirimkan ulang ke "${invite.email}"!`,
        });
        setTimeout(() => setInviteActionMsg({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      setInviteActionMsg({
        type: 'error',
        text: err.message || 'Gagal mengirim ulang email undangan.',
      });
    } finally {
      setResendingId(null);
    }
  };

  // Filter Invitations
  const filteredInvitations = invitations.filter((inv) => {
    if (invitationFilter === 'KONTRIBUTOR') return inv.role === 'KONTRIBUTOR';
    if (invitationFilter === 'VIEWER') return inv.role === 'VIEWER';
    if (invitationFilter === 'PENDING') return inv.status === 'PENDING';
    if (invitationFilter === 'ACCEPTED') return inv.status === 'ACCEPTED';
    return true;
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200 cursor-default"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-zinc-50 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 text-[#f7e043] flex items-center justify-center font-mono font-black text-lg shadow-xs">
              {user.nama_lengkap?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight uppercase">
                  Pusat Kontrol Pengguna
                </h2>
                {user.system_role === 'SUPER_ADMIN' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-yellow-400">
                    SUPER ADMIN
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-zinc-500">
                {user.email} • Bergabung sejak {new Date(user.created_at || Date.now()).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/70 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-200 bg-zinc-100/70 px-4 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono font-bold uppercase transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-zinc-900 text-zinc-900 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profil Akun</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono font-bold uppercase transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-zinc-900 text-zinc-900 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Keamanan & Sandi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invitations')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono font-bold uppercase transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'invitations'
                ? 'border-zinc-900 text-zinc-900 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Riwayat Undangan</span>
            {invitations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-zinc-200 text-zinc-700">
                {invitations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trees')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono font-bold uppercase transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'trees'
                ? 'border-zinc-900 text-zinc-900 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <TreeDeciduous className="w-3.5 h-3.5" />
            <span>Semesta Pohon</span>
            {trees.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-zinc-200 text-zinc-700">
                {trees.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 1: PROFIL AKUN */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-lg mx-auto py-2">
              {profileMsg.text && (
                <div
                  className={`p-3 rounded text-xs flex items-start gap-2 border ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  )}
                  <span className="font-medium">{profileMsg.text}</span>
                </div>
              )}

              <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-zinc-900 text-[#f7e043] flex items-center justify-center font-mono font-black text-xl">
                    {user.nama_lengkap?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-black text-zinc-900">{user.nama_lengkap}</div>
                    <div className="text-xs text-zinc-500 font-mono">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-zinc-200 text-zinc-800">
                    {user.auth_provider === 'GOOGLE' ? 'Google OAuth' : 'Email & Sandi'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                  />
                  <p className="text-[10px] font-mono text-zinc-400 mt-1">
                    Email ini digunakan untuk login dan menerima notifikasi usulan silsilah.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white rounded transition-colors shadow-xs"
                  >
                    {profileLoading ? 'MENYIMPAN PERUBAHAN...' : 'SIMPAN PERUBAHAN PROFIL'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 2: KEAMANAN & KATA SANDI */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="space-y-4 max-w-lg mx-auto py-2">
              {user.auth_provider === 'GOOGLE' ? (
                <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-lg text-center space-y-3">
                  <Shield className="w-10 h-10 text-zinc-700 mx-auto" />
                  <h3 className="font-bold text-sm text-zinc-900">Masuk Terhubung dengan Google</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
                    Akun Anda dibuat menggunakan Google Sign-In. Pengaturan keamanan, otentikasi dua faktor, dan kata sandi Anda dilindungi secara langsung oleh Google.
                  </p>
                </div>
              ) : (
                <>
                  {securityMsg.text && (
                    <div
                      className={`p-3 rounded text-xs flex items-start gap-2 border ${
                        securityMsg.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {securityMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      )}
                      <span className="font-medium">{securityMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-1">
                        Kata Sandi Saat Ini
                      </label>
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Masukkan kata sandi lama"
                        className="w-full text-xs sm:text-sm border border-zinc-300 rounded px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
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

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={securityLoading}
                        className="w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white rounded transition-colors shadow-xs"
                      >
                        {securityLoading ? 'MEMPERBARUI KATA SANDI...' : 'PERBARUI KATA SANDI'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 3: RIWAYAT UNDANGAN (KONTRIBUTOR & VIEWER) */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'invitations' && (
            <div className="space-y-4 py-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                    Daftar Kerabat yang Pernah Anda Undang
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500">
                    Pantau status kontributor dan pembaca (viewer) yang Anda ajak merawat silsilah keluarga.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono">
                  {['ALL', 'KONTRIBUTOR', 'VIEWER', 'PENDING', 'ACCEPTED'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setInvitationFilter(filter)}
                      className={`px-2 py-1 rounded transition-colors ${
                        invitationFilter === filter
                          ? 'bg-zinc-900 text-white font-bold'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {inviteActionMsg.text && (
                <div
                  className={`p-3 rounded text-xs flex items-start gap-2 border ${
                    inviteActionMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {inviteActionMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  )}
                  <span className="font-medium">{inviteActionMsg.text}</span>
                </div>
              )}

              {invitationsLoading ? (
                <div className="py-12 text-center text-xs font-mono text-zinc-400 animate-pulse">
                  Memuat riwayat undangan...
                </div>
              ) : filteredInvitations.length === 0 ? (
                <div className="py-12 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-lg space-y-2">
                  <Mail className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-xs font-bold text-zinc-700">Belum Ada Undangan</p>
                  <p className="text-[11px] font-mono text-zinc-400 max-w-sm mx-auto">
                    {invitationFilter === 'ALL'
                      ? 'Anda belum pernah mengundang kerabat. Gunakan tombol "Kolaborator" di Navbar untuk mengajak keluarga bergabung.'
                      : `Tidak ditemukan riwayat undangan dengan filter "${invitationFilter}".`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-900">
                            {inv.recipient_name || inv.email.split('@')[0]}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                              inv.role === 'KONTRIBUTOR'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-sky-100 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {inv.role}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                              inv.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800 animate-pulse'
                                : 'bg-zinc-100 text-zinc-500'
                            }`}
                          >
                            {inv.status === 'ACCEPTED' ? '✓ TELAH BERGABUNG' : inv.status === 'PENDING' ? '⏳ MENUNGGU' : inv.status}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-zinc-500 flex flex-wrap items-center gap-2">
                          <span>📧 {inv.email}</span>
                          <span>•</span>
                          <span>🌳 {inv.tree_name}</span>
                          <span>•</span>
                          <span className="text-zinc-400">
                            {new Date(inv.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons for PENDING invites */}
                      {inv.status === 'PENDING' && (
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleCopyInviteLink(inv)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2.5 py-1.5 rounded transition-colors"
                            title="Salin Tautan Undangan"
                          >
                            {copiedId === inv.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin Tautan</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={resendingId === inv.id}
                            onClick={() => handleResendInviteEmail(inv)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold bg-zinc-900 hover:bg-black text-white px-2.5 py-1.5 rounded transition-colors disabled:bg-zinc-400"
                            title="Kirim Ulang Email Undangan"
                          >
                            <Send className="w-3 h-3" />
                            <span>{resendingId === inv.id ? 'Mengirim...' : 'Kirim Ulang'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 4: RINGKASAN SEMESTA POHON */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'trees' && (
            <div className="space-y-3 py-2">
              <div className="pb-1">
                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                  Daftar Pohon Silsilah Anda
                </h3>
                <p className="text-[11px] font-mono text-zinc-500">
                  Semesta keluarga yang Anda miliki atau di mana Anda berkontribusi.
                </p>
              </div>

              <div className="space-y-2.5">
                {trees.map((t) => {
                  const isActive = currentTree?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isActive
                          ? 'border-zinc-900 bg-zinc-50 shadow-2xs'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-900">
                            🌳 {t.nama_silsilah}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#f7e043] text-black">
                              AKTIF
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-200 text-zinc-800">
                            {t.role}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">
                          Batas Kuota: {t.max_members || 30} Anggota • Dibuat pada{' '}
                          {new Date(t.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>

                      {!isActive && onSelectTree && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTree(t);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-zinc-900 hover:bg-black text-white px-3 py-1.5 rounded transition-colors self-end sm:self-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Semesta Ini</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onOpenFeedback && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 hover:text-black hover:underline px-2 py-1 transition-colors cursor-pointer"
              >
                <span>💬 Beri Masukan & Saran</span>
              </button>
            )}
            <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
              • Silsilah Keluarga v2.0
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-mono font-bold text-rose-600 hover:text-rose-800 hover:underline px-2 py-1 transition-colors cursor-pointer"
          >
            Keluar dari Akun (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}
