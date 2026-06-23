'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [counts, setCounts] = useState({ 
    masuk: 0, keluar: 0, notaDinas: 0, skBupati: 0, skKadin: 0, kegiatan: 0 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getStats() {
      try {
        setLoading(true)
        const [
          { count: cMasuk }, 
          { count: cKeluar }, 
          { count: cNota }, 
          { count: cSkBupati }, 
          { count: cSkKadin },
          { count: cKegiatan }
        ] = await Promise.all([
          supabase.from('surat_masuk').select('*', { count: 'exact', head: true }),
          supabase.from('surat_keluar').select('*', { count: 'exact', head: true }),
          supabase.from('nota_dinas').select('*', { count: 'exact', head: true }),
          supabase.from('sk_bupati').select('*', { count: 'exact', head: true }),
          supabase.from('sk_kadin').select('*', { count: 'exact', head: true }),
          supabase.from('kegiatan').select('*', { count: 'exact', head: true })
        ])
        setCounts({ 
          masuk: cMasuk || 0, 
          keluar: cKeluar || 0, 
          notaDinas: cNota || 0, 
          skBupati: cSkBupati || 0, 
          skKadin: cSkKadin || 0,
          kegiatan: cKegiatan || 0 
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    getStats()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden text-black">
      
      {/* 1. HEADER BANNER - Tinggi dikurangi di laptop agar hemat ruang */}
      <div className="relative w-full h-[25vh] md:h-[28vh] shrink-0">
        <img 
          src="/assets/header.png" 
          className="w-full h-full object-cover block"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/40 flex items-center p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl">
            <h1 className="text-white text-base sm:text-lg md:text-xl font-black tracking-tight uppercase leading-tight">
              Panel Statistik <br/> 
              <span className="text-blue-500">E-Arsip Bidang Peningkatan Mutu</span> <br/>
              <span className="text-blue-500">Pendidikan Dasar</span>
            </h1>
            <div className="w-10 h-0.5 bg-blue-500 my-2"></div>
            <p className="text-slate-400 text-[10px] md:text-[11px] font-medium max-w-xl leading-normal">
              Sistem Pemantauan Data Real-time Pengelolaan Arsip Digital Bidang Peningkatan Mutu Pendidikan Dasar Dinas Pendidikan Kabupaten Bojonegoro.
            </p>
          </div>
        </div>
      </div>

      {/* 2. STATISTIC BOXES - Grid otomatis 2 kolom di HP, 3 di tablet, dan 6 sejajar di laptop */}
      <div className="flex-1 flex items-center p-4 sm:p-6 md:p-8"> 
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 max-w-7xl w-full mx-auto">
          
          {[
            { label: 'Arsip Masuk', val: counts.masuk, icon: '📥', color: 'text-blue-600', fill: 'bg-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Arsip Keluar', val: counts.keluar, icon: '📤', color: 'text-emerald-600', fill: 'bg-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Nota Dinas', val: counts.notaDinas, icon: '📝', color: 'text-amber-500', fill: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'SK Bupati', val: counts.skBupati, icon: '🏛️', color: 'text-violet-600', fill: 'bg-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
            { label: 'SK Kadin', val: counts.skKadin, icon: '📜', color: 'text-red-500', fill: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-100' },
            { label: 'Kegiatan', val: counts.kegiatan, icon: '📅', color: 'text-sky-500', fill: 'bg-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-3 md:p-4 text-center border border-slate-200 shadow-sm flex flex-col items-center relative overflow-hidden group">
              
              {/* Decorative Circle Elements */}
              <div className={`absolute -top-6 -right-6 w-16 h-16 ${item.bg} rounded-full opacity-40 z-0`}></div>

              {/* Icon Container - Diperkecil biarnya seramping layout */}
              <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center text-base mb-2.5 ${item.color} relative z-10 shadow-inner`}>
                {item.icon}
              </div>

              {/* Label - Ukuran font disesuaikan menjadi kompak */}
              <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 relative z-10 truncate w-full px-1">
                {item.label}
              </h3>

              {/* Value - Ukuran disusutkan dari text-5xl ke text-2xl/3xl agar ramah di laptop */}
              <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800 margin-0 leading-none relative z-10 tracking-tight">
                {loading ? '...' : item.val}
              </p>

              {/* Progress Bar */}
              <div className="w-4/5 h-1 bg-slate-100 rounded-full mt-3 overflow-hidden relative z-10">
                <div 
                  className={`h-full ${item.fill} rounded-full transition-all duration-1000`}
                  style={{ width: loading ? '0%' : '100%' }}
                ></div>
              </div>
              
              <span className="mt-2 text-[7px] md:text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                Total Terdata
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FOOTER RESPONSIVE - Berubah dari susunan tabel kaku menjadi flexbox modern */}
      <footer className="bg-slate-900 text-white p-4 md:p-6 border-t-2 border-blue-600 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Sisi Kiri: Identitas Logo */}
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Logo" className="h-12 w-auto filter brightness-110 object-contain shrink-0" />
            <div className="pl-3 border-l border-slate-700">
              <h2 className="text-xs md:text-sm font-black uppercase tracking-tight">Dinas Pendidikan</h2>
              <p className="text-blue-500 font-bold uppercase text-[9px] md:text-[10px] leading-tight">Kabupaten Bojonegoro</p>
              <p className="text-[7.5px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Bidang Peningkatan Mutu Pendidikan Dasar
              </p>
            </div>
          </div>
          
          {/* Sisi Kanan: Alamat / Kontak */}
          <div className="flex flex-row sm:flex-col gap-x-4 gap-y-1 text-left sm:text-right text-[10px] md:text-[11px] border-t border-slate-800 pt-3 sm:pt-0 sm:border-t-0">
            <div>
              <span className="text-[7.5px] text-blue-400 font-black uppercase tracking-wider block">Alamat Kantor</span>
              <p className="text-slate-300 font-medium text-[10px]">Jl. Pattimura No.09, Bojonegoro, Jawa Timur</p>
            </div>
            <div className="sm:mt-1">
              <span className="text-[7.5px] text-blue-400 font-black uppercase tracking-wider block">Layanan Online</span>
              <p className="text-slate-300 font-medium text-[10px]">disdik.bojonegorokab.go.id</p>
            </div>
          </div>

        </div>

        {/* Hak Cipta Bawah */}
        <div className="border-t border-slate-800/60 mt-4 pt-3 text-center">
          <p className="text-[7px] md:text-[8px] text-slate-500 tracking-widest font-bold uppercase">
            © 2026 E-ARSIP DIGITAL — DINAS PENDIDIKAN | DESIGNED & DEVELOPED BY DETRIA AKBAR
          </p>
        </div>
      </footer>

    </div>
  )
}