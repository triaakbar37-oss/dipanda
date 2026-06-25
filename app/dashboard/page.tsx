'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface StatCardProps {
  title: string
  count: number | string
  icon: string
  color: string
}

export default function DashboardPage() {
  // State untuk data statistik real-time dari database
  const [stats, setStats] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    notaDinas: 0,
    kegiatan: 0,
    skBupati: 0,
    skKadin: 0,
  })
  const [loading, setLoading] = useState(true)
  const [operatorName, setOperatorName] = useState('Operator')

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Ambil data user yang sedang login
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setOperatorName(user.email.split('@')[0].toUpperCase())
        }

        // Contoh pengambilan jumlah data secara paralel dari masing-masing tabel Supabase
        // Catatan: Sesuaikan nama tabel jika berbeda di database Anda
        const [smCount, skCount, ndCount, kgCount, skbCount, skkCount] = await Promise.all([
          supabase.from('surat_masuk').select('*', { count: 'exact', head: true }),
          supabase.from('surat_keluar').select('*', { count: 'exact', head: true }),
          supabase.from('nota_dinas').select('*', { count: 'exact', head: true }),
          supabase.from('kegiatan').select('*', { count: 'exact', head: true }),
          supabase.from('sk_bupati').select('*', { count: 'exact', head: true }),
          supabase.from('sk_kadin').select('*', { count: 'exact', head: true }),
        ])

        setStats({
          suratMasuk: smCount.count || 0,
          suratKeluar: skCount.count || 0,
          notaDinas: ndCount.count || 0,
          kegiatan: kgCount.count || 0,
          skBupati: skbCount.count || 0,
          skKadin: skkCount.count || 0,
        })
      } catch (error) {
        console.error('Gagal mengambil data statistik:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Mendapatkan waktu salam dinamis
  const getGreeting = () => {
    const hours = new Date().getHours()
    if (hours < 11) return 'Selamat Pagi'
    if (hours < 15) return 'Selamat Siang'
    if (hours < 19) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* BANNER SELAMAT DATANG */}
      <section className="bg-slate-950 border border-slate-800 text-white p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tight">
            {getGreeting()}, <span className="text-blue-500">{operatorName}</span> 👋
          </h1>
          <p className="text-xs text-slate-400 max-w-xl font-medium">
            Sistem Digital E-Arsip Bidang Peningkatan Mutu Pendidikan Dasar. Kelola, pantau, dan amankan seluruh dokumentasi surat-menyurat kedinasan di sini.
          </p>
        </div>
        <div className="text-right text-[10px] bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 font-bold shrink-0 z-10">
          📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </section>

      {/* GRID STATISTIK ARSIP UTAMA */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <StatCard 
          title="Surat Masuk" 
          count={loading ? '...' : stats.suratMasuk} 
          icon="📩" 
          color="border-l-4 border-l-emerald-500"
        />
        <StatCard 
          title="Surat Keluar" 
          count={loading ? '...' : stats.suratKeluar} 
          icon="📤" 
          color="border-l-4 border-l-blue-500"
        />
        <StatCard 
          title="Nota Dinas" 
          count={loading ? '...' : stats.notaDinas} 
          icon="📝" 
          color="border-l-4 border-l-amber-500"
        />
        <StatCard 
          title="Agenda Kegiatan" 
          count={loading ? '...' : stats.kegiatan} 
          icon="📅" 
          color="border-l-4 border-l-indigo-500"
        />
        <StatCard 
          title="SK Bupati" 
          count={loading ? '...' : stats.skBupati} 
          icon="🏛️" 
          color="border-l-4 border-l-purple-500"
        />
        <StatCard 
          title="SK Kepala Dinas" 
          count={loading ? '...' : stats.skKadin} 
          icon="📜" 
          color="border-l-4 border-l-rose-500"
        />
      </section>

      {/* PANEL PANDUAN PENGGUNAAN & MONITORING LOG */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LOG AKTIVITAS / INFORMASI TERKINI */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span>🔔</span> Log Aktivitas Terakhir
            </h3>
            <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase">Sistem Aktif</span>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-[11px]">
              <div className="bg-emerald-50 text-emerald-600 p-1 rounded font-bold shrink-0">➕</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">Surat Masuk Berhasil Diarsipkan</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Oleh Operator Bidang Dipanda</p>
              </div>
              <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">Baru saja</span>
            </div>

            <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-[11px]">
              <div className="bg-blue-50 text-blue-600 p-1 rounded font-bold shrink-0">📝</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">Pembaruan Berkas SK Kepala Dinas</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Sinkronisasi data dokumen digital selesai</p>
              </div>
              <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">2 jam yang lalu</span>
            </div>

            <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-[11px]">
              <div className="bg-amber-50 text-amber-600 p-1 rounded font-bold shrink-0">🔄</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">Backup Database Terjadwal</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Sistem otomatis mencadangkan data ke cloud storage</p>
              </div>
              <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">Hari ini, 00:00</span>
            </div>
          </div>
        </div>

        {/* PANDUAN PANDUAN OPERATOR */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex flex-col">
          <div className="pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span>💡</span> Standar Operasional
            </h3>
          </div>
          <div className="text-[11px] text-slate-500 space-y-3 leading-relaxed">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-800 block mb-0.5">1. Format Penamaan</span>
              Gunakan kode klasifikasi resmi dinas untuk setiap berkas PDF yang diunggah agar memudahkan pelacakan.
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-800 block mb-0.5">2. Validasi Tanggal</span>
              Pastikan tanggal surat disesuaikan dengan tanggal fisik lembar surat, bukan tanggal saat melakukan entri data.
            </div>
          </div>
        </div>

      </section>
    </div>
  )
}

// Komponen Pembantu Kartu Statistik (Clean & Modern UI)
function StatCard({ title, count, icon, color }: StatCardProps) {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200 ${color}`}>
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
          {title}
        </span>
        <span className="text-xl md:text-2xl font-black text-slate-800 block">
          {count}
        </span>
      </div>
      <div className="text-2xl bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-inner">
        {icon}
      </div>
    </div>
  )
}