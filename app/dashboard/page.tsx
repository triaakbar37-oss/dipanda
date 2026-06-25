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
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setOperatorName(session.user.email.split('@')[0].toUpperCase())
        }

        const tables = ['surat_masuk', 'surat_keluar', 'nota_dinas', 'kegiatan', 'sk_bupati', 'sk_kadin']
        const counts: { [key: string]: number } = {}

        for (const table of tables) {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          if (error) {
            console.warn(`Gagal membaca statistik tabel [${table}]:`, error.message)
            counts[table] = 0 
          } else {
            counts[table] = count || 0
          }
        }

        setStats({
          suratMasuk: counts['surat_masuk'],
          suratKeluar: counts['surat_keluar'],
          notaDinas: counts['nota_dinas'],
          kegiatan: counts['kegiatan'],
          skBupati: counts['sk_bupati'],
          skKadin: counts['sk_kadin'],
        })

      } catch (error) {
        console.error('Gagal mengambil data statistik internal:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getGreeting = () => {
    const hours = new Date().getHours()
    if (hours < 11) return 'Selamat Pagi'
    if (hours < 15) return 'Selamat Siang'
    if (hours < 19) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER BANNER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            {getGreeting()}, <span className="text-blue-600">{operatorName}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">
            Monitor efektivitas dan kelola dokumen arsip kedinasan Anda hari ini.
          </p>
        </div>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest shadow-lg">
          📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </header>

      {/* GRID STATISTIK */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Surat Masuk" count={loading ? '...' : stats.suratMasuk} icon="📩" color="border-l-emerald-500" />
        <StatCard title="Surat Keluar" count={loading ? '...' : stats.suratKeluar} icon="📤" color="border-l-blue-500" />
        <StatCard title="Nota Dinas" count={loading ? '...' : stats.notaDinas} icon="📝" color="border-l-amber-500" />
        <StatCard title="Agenda Kegiatan" count={loading ? '...' : stats.kegiatan} icon="📅" color="border-l-indigo-500" />
        <StatCard title="SK Bupati" count={loading ? '...' : stats.skBupati} icon="🏛️" color="border-l-purple-500" />
        <StatCard title="SK Kepala Dinas" count={loading ? '...' : stats.skKadin} icon="📜" color="border-l-rose-500" />
      </section>

      {/* PANEL INFORMASI ESTETIK */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="text-[120px]">📂</span>
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Sistem Terintegrasi</h3>
          <p className="text-xl font-bold leading-relaxed max-w-sm">
            E-Arsip DIPANDA dirancang untuk mempermudah alur administrasi dengan standar keamanan tinggi dan aksesibilitas cepat.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Standar Operasional</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-blue-50 text-blue-600 font-bold p-3 rounded-lg h-fit text-sm">01</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Format Penamaan</p>
                <p className="text-xs text-slate-500">Gunakan kode klasifikasi resmi untuk setiap berkas agar pencarian lebih akurat.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 text-blue-600 font-bold p-3 rounded-lg h-fit text-sm">02</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Validasi Data</p>
                <p className="text-xs text-slate-500">Pastikan tanggal fisik surat sinkron dengan entri database untuk pelacakan audit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, count, icon, color }: StatCardProps) {
  return (
    <div className={`bg-white border border-slate-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 ${color}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</span>
      </div>
      <span className="text-3xl font-black text-slate-900">{count}</span>
    </div>
  )
}