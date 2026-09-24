import React, { useState } from 'react';
import {
  X,
  BookOpen,
  GitBranch,
  UserCheck,
  Shield,
  AlertTriangle,
  Layers,
  Smartphone,
  Palette,
  ArrowUpDown,
  Download,
  Heart,
  MousePointer,
  Sparkles,
} from 'lucide-react';

export default function UserGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('workflow');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-xs bg-[#f7e043] text-black font-mono font-black text-[10px] flex items-center justify-center">
              ?
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight uppercase">
                Buku Panduan & Alur Kerja Aplikasi (UX Workflow)
              </h3>
              <div className="text-[10px] text-zinc-400 font-mono">
                DOKUMENTASI STANDAR FITUR, NAVIGASI GESTUR & ESTETIKA VISUAL TERKINI
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

        {/* Tab Navigation */}
        <div className="px-6 border-b border-zinc-200 bg-white flex gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`py-2.5 px-3 text-xs font-mono font-bold uppercase border-b-2 transition-all shrink-0 ${
              activeTab === 'workflow'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            1. Alur Akun & Semesta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hierarchy')}
            className={`py-2.5 px-3 text-xs font-mono font-bold uppercase border-b-2 transition-all shrink-0 ${
              activeTab === 'hierarchy'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            2. Pasangan, Anak & Urutan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`py-2.5 px-3 text-xs font-mono font-bold uppercase border-b-2 transition-all shrink-0 ${
              activeTab === 'visual'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            3. Estetika Garis & Layout
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('collaboration')}
            className={`py-2.5 px-3 text-xs font-mono font-bold uppercase border-b-2 transition-all shrink-0 ${
              activeTab === 'collaboration'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            4. Kolaborasi & Usulan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export-nav')}
            className={`py-2.5 px-3 text-xs font-mono font-bold uppercase border-b-2 transition-all shrink-0 ${
              activeTab === 'export-nav'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            5. Gestur & Ekspor
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-zinc-700 text-xs leading-relaxed">
          {/* TAB 1: ALUR AKUN & SEMESTA */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="font-bold text-zinc-900 text-sm uppercase font-mono flex items-center gap-2">
                  <span className="w-5 h-5 rounded-xs bg-zinc-900 text-[#f7e043] flex items-center justify-center text-xs">
                    A
                  </span>
                  Mendaftar & Masuk ke Akun Keluarga
                </div>
                <p>
                  Anda dapat langsung masuk secara instan menggunakan <strong>Akun Google (1-Klik)</strong> atau mendaftar menggunakan email dan kata sandi. Akun Anda dilindungi dengan enkripsi keamanan modern, sehingga Anda dapat mengakses dan merawat silsilah keluarga secara leluasa dari laptop, tablet, maupun ponsel.
                </p>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="font-bold text-zinc-900 text-sm uppercase font-mono flex items-center gap-2">
                  <span className="w-5 h-5 rounded-xs bg-zinc-900 text-[#f7e043] flex items-center justify-center text-xs">
                    B
                  </span>
                  Wizard Inisialisasi Semesta & Sepasang Leluhur
                </div>
                <p>
                  Setelah mendaftar, wizard Onboarding membimbing Anda memberi nama pohon (contoh: <em>Bani H. Syamsuddin</em>) dan menginput <strong>sepasang leluhur utama</strong> (Kakek & Nenek). Anda otomatis menjadi <strong>ADMIN_UTAMA</strong> dengan otoritas penuh.
                </p>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="font-bold text-zinc-900 text-sm uppercase font-mono flex items-center gap-2">
                  <span className="w-5 h-5 rounded-xs bg-zinc-900 text-[#f7e043] flex items-center justify-center text-xs">
                    C
                  </span>
                  Multi-Universe & Batasan Kapasitas
                </div>
                <p>
                  Anda dapat membuat beberapa semesta pohon terpisah (misal: silsilah garis Ayah, garis Ibu, atau keluarga mertua) melalui menu header. Setiap pohon mendukung hingga <strong>30 anggota keluarga</strong> dengan validasi otomatis <em>Anti-Cycle DAG</em> (mencegah kekeliruan logika di mana anak menjadi orang tua dari leluhurnya).
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PASANGAN, ANAK & URUTAN */}
          {activeTab === 'hierarchy' && (
            <div className="space-y-4">
              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  1. Menautkan Pasangan (Suami & Istri)
                </h4>
                <p>
                  Setiap ikatan pernikahan tersimpan rapi dan otomatis tersinkronisasi di seluruh perangkat keluarga, sehingga bagan perkawinan tampil akurat dan terhubung dengan benar.
                </p>
                <ul className="list-disc list-inside space-y-1.5 pt-1 text-zinc-800">
                  <li><strong>Pasangan Baru:</strong> Klik tombol <strong>Pasangan</strong> pada kartu anggota untuk menambahkan suami atau istri baru.</li>
                  <li><strong>Pasangan yang Sudah Terdaftar:</strong> Jika suami/istri sudah ada di daftar anggota, Anda cukup menautkannya melalui panel profil samping.</li>
                  <li><strong>Pernikahan Lebih dari Sekali:</strong> Mendukung pencatatan lebih dari satu pasangan sah; setiap ikatan pernikahan akan memiliki garis cabang keturunan masing-masing yang teratur.</li>
                </ul>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  2. Smart Auto-Pair (+ Anak Otomatis)
                </h4>
                <p>
                  Cukup klik tombol <strong>+ Anak</strong> pada salah satu orang tua. Sistem cerdas akan mendeteksi pasangan resminya dan langsung mengisi kedua orang tua (Ayah & Ibu) secara otomatis, sehingga garis percabangan anak langsung mengalir dari simpul tengah kedua orang tua.
                </p>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-zinc-800" />
                  3. Mengatur Urutan Kelahiran (Sulung & Bungsu)
                </h4>
                <p>
                  Buka profil orang tua di panel samping. Pada daftar anak, klik tombol panah <strong>▲ (Naik)</strong> atau <strong>▼ (Turun)</strong> untuk menyusun urutan kelahiran. Posisi anak di kanvas silsilah akan otomatis tersusun rapi dari <strong>kiri (Sulung)</strong> ke <strong>kanan (Bungsu)</strong>!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ESTETIKA GARIS & LAYOUT */}
          {activeTab === 'visual' && (
            <div className="space-y-4">
              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-600" />
                  1. Subway Lineage Color-Coding
                </h4>
                <p>
                  Ketika pohon Anda berkembang dan memiliki banyak keluarga cabang (misal: orang tua dari mertua yang berada pada generasi yang sama), sistem secara otomatis memberikan <strong>warna garis dinamis</strong> (Hitam Utama, Biru, Hijau Zamrud, Ungu, Mawar, Sian) pada masing-masing simpul keluarga. Hal ini memudahkan mata membedakan muasal garis keturunan secara instan seperti peta *subway*.
                </p>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-zinc-800" />
                  2. Parallel Bus Staggering (Garis Tidak Melebur)
                </h4>
                <p>
                  Garis horizontal percabangan anak tidak pernah menumpuk di pixel yang sama. Sistem mengatur ketinggian garis secara bertingkat (paralel seperti sirkuit elektronik). Jika ada dua garis bersilangan, kurva lengkung (*Jump Arc*) otomatis disematkan sehingga visual tetap bersih dan tidak membingungkan.
                </p>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-800" />
                  3. Simpul Perkawinan Interaktif & "Rapikan Layout"
                </h4>
                <p>
                  Titik temu antara sepasang suami-istri ditandai dengan lingkaran simpul (*Knot Node*). Simpul ini dapat <strong>digeser bebas (*draggable*)</strong> oleh pengguna jika ingin menata posisi garis secara manual. Jika ingin merapikan kembali ke posisi simetris ideal secara otomatis, cukup klik tombol <strong>Rapikan Layout</strong> di tengah bilah atas.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: KOLABORASI & USULAN */}
          {activeTab === 'collaboration' && (
            <div className="space-y-4">
              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-3">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4 text-zinc-800" />
                  Tingkatan Hak Akses (Role-Based Access)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 bg-white border border-zinc-200 rounded">
                    <span className="font-mono font-bold text-zinc-900 block mb-1 text-[11px]">
                      ADMIN_UTAMA
                    </span>
                    <p className="text-[10px] text-zinc-500">
                      Otoritas penuh: mengubah data langsung, menghapus anggota/pernikahan, dan menyetujui/menolak usulan kontributor.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-zinc-200 rounded">
                    <span className="font-mono font-bold text-zinc-900 block mb-1 text-[11px]">
                      KONTRIBUTOR
                    </span>
                    <p className="text-[10px] text-zinc-500">
                      Dapat menambah anggota baru. Jika mengedit anggota yang sudah ada, tombol <em>Ubah</em> otomatis menjadi <strong>Pengajuan Usulan</strong>.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-zinc-200 rounded">
                    <span className="font-mono font-bold text-zinc-900 block mb-1 text-[11px]">
                      VIEWER
                    </span>
                    <p className="text-[10px] text-zinc-500">
                      Hanya dapat menjelajahi kanvas silsilah dan mengekspor gambar/dokumen tanpa hak mengubah isi data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase">
                  Alur Persetujuan & Optimistic Locking (v1, v2)
                </h4>
                <p>
                  Setiap kali Kontributor mengusulkan revisi data, lencana notifikasi merah akan muncul pada tombol <strong>Usulan</strong> di bilah navigasi Admin Utama. Admin dapat melihat komparasi data lama vs baru sebelum memutuskan untuk menyetujui. Mekanisme versi data (<em>Optimistic Locking</em>) menjamin tidak ada perubahan data yang tertimpa secara tidak sengaja.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: GESTUR & EKSPOR */}
          {activeTab === 'export-nav' && (
            <div className="space-y-4">
              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-zinc-800" />
                  Navigasi Gestur Trackpad & Mouse
                </h4>
                <ul className="space-y-1.5 text-zinc-600">
                  <li>• <strong>Scroll 2 Jari / Roda Mouse (Pan):</strong> Geser dua jari di trackpad ke kiri, kanan, atas, atau bawah untuk menjelajahi kanvas dengan sangat mulus.</li>
                  <li>• <strong>Cubit Trackpad / Pinch (Zoom):</strong> Cubit keluar atau masuk untuk memperbesar atau memperkecil diagram silsilah.</li>
                  <li>• <strong>Klik Kiri + Geser pada Kanvas Kosong:</strong> Menggeser seluruh area pandang silsilah.</li>
                  <li>• <strong>MiniMap Interaktif:</strong> Peta navigasi di pojok kanan bawah yang memudahkan orientasi pada pohon keluarga berukuran besar.</li>
                </ul>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase flex items-center gap-2">
                  <Download className="w-4 h-4 text-zinc-800" />
                  Opsi Ekspor Berkualitas Tinggi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white border border-zinc-200 rounded space-y-1">
                    <span className="font-mono font-bold text-zinc-900 block text-xs">
                      1. Ekspor Gambar PNG (HD)
                    </span>
                    <p className="text-[11px] text-zinc-500 leading-snug">
                      Menghasilkan tangkapan layar beresolusi tinggi (faktor skala 2x) dari seluruh semesta pohon keluarga, siap dicetak atau dibagikan ke grup WhatsApp keluarga.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-zinc-200 rounded space-y-1">
                    <span className="font-mono font-bold text-zinc-900 block text-xs">
                      2. Ekspor File HTML Mandiri
                    </span>
                    <p className="text-[11px] text-zinc-500 leading-snug">
                      Mengemas silsilah ke dalam satu file HTML portabel yang dapat dibuka langsung di browser apa pun tanpa membutuhkan koneksi internet atau server backend.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black text-[#f7e043] rounded transition-colors shadow-xs"
          >
            Saya Paham & Siap Menggunakan
          </button>
        </div>
      </div>
    </div>
  );
}
