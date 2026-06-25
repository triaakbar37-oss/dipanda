'use client'
import './globals.css'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  
  // State untuk melacak sesi login aktif dan proses loading status
  const [session, setSession] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  
  // State UI Pendukung
  const [showDevInfo, setShowDevInfo] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 1. Jalankan Pengecekan Sesi Supabase Saat Aplikasi Dimuat
  useEffect(() => {
    // Ambil sesi saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    // Dengarkan perubahan status auth (login/logout) secara real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Proteksi Rute: Jika tidak ada sesi dan mencoba masuk ke area internal, tendang ke /login
  useEffect(() => {
    if (!authLoading && !session) {
      const isInternalPage = pathname?.startsWith('/dashboard') || 
                             pathname?.startsWith('/surat_masuk') || 
                             pathname?.startsWith('/surat_keluar') || 
                             pathname?.startsWith('/nota_dinas') || 
                             pathname?.startsWith('/kegiatan') || 
                             pathname?.startsWith('/sk_') || 
                             pathname?.startsWith('/sampah')

      if (isInternalPage) {
        router.push('/login')
      }
    }
  }, [session, authLoading, pathname, router])

  const isActive = (path: string) => pathname === path
  const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=triaakbar37@gmail.com&su=Tanya%20E-Arsip"

  // Tentukan apakah halaman termasuk kategori publik
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname?.startsWith('/e-pelayanan')

  // 3. JIKA SEDANG CEK STATUS AUTH: Tampilkan loading screen polos (mencegah kebocoran layout)
  if (authLoading) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-[#070c19] flex items-center justify-center text-white font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Memverifikasi Sesi...</p>
          </div>
        </body>
      </html>
    )
  }

  // 4. LAYOUT PUBLIK: Digunakan jika rute publik ATAU pengguna memang BELUM LOGIN
  if (isPublicPage || !session) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-[#070c19] text-white antialiased font-sans">
          <main className="w-full min-h-screen">
            {children}
          </main>
          <div id="modal-root"></div>
        </body>
      </html>
    )
  }

  // 5. LAYOUT UTAMA DASHBOARD INTERNAL: Hanya muncul jika USER SUDAH LOGIN & BERADA DI RUTE INTERNAL
  return (
    <html lang="en">
      <body className="flex flex-col md:flex-row min-h-screen bg-[#f0f7ff] text-slate-900 antialiased overflow-x-hidden font-sans">
        
        {/* HEADER TOP NAV KHUSUS DI HP */}
        <header className="md:hidden w-full bg-slate-900 text-white p-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">📂</span>
            <span className="font-black tracking-tighter uppercase text-[11px]">E-Arsip DIPANDA</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-7 h-7 flex items-center justify-center bg-slate-800 rounded-md text-sm active:scale-95 transition-all focus:outline-none"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </header>

        {/* SIDEBAR OPERATOR */}
        <aside className={`
          fixed inset-y-0 left-0 md:relative z-30
          w-44 bg-slate-900 text-white flex flex-col h-screen shadow-lg
          transition-transform duration-200 md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          {/* Header Kontainer */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shrink-0">
                <span className="text-sm">📂</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black tracking-tight uppercase italic text-white truncate">
                  E-Arsip DIPANDA
                </span>
                <span className="text-[6px] text-slate-400 font-bold uppercase tracking-wide truncate mt-0.5">
                  MUTU PENDIDIKAN DASAR
                </span>
              </div>
            </div>
          </div>
          
          {/* Menu Navigasi Dashboard */}
          <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto pb-4 custom-scrollbar text-[10px]">
            <div className="text-[7.5px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2 my-1.5">Main Menu</div>
            
            <Link 
              href="/dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md font-bold uppercase tracking-wide transition-all ${isActive('/dashboard') ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <span className="text-xs shrink-0">🏠</span> <span className="truncate">Dashboard</span>
            </Link>
            
            <div className="pt-2 text-[7.5px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2 my-1.5">Manajemen Surat</div>
            
            <Link 
              href="/surat_masuk" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md font-bold uppercase tracking-wide transition-all ${isActive('/surat_masuk') ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <span className="text-xs shrink-0">📩</span> <span className="truncate">Surat Masuk</span>
            </Link>
            
            <Link 
              href="/surat_keluar" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md font-bold uppercase tracking-wide transition-all ${isActive('/surat_keluar') ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <span className="text-xs shrink-0">📤</span> <span className="truncate">Surat Keluar</span>
            </Link>

            <div className="pt-2 text-[7.5px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2 my-1.5">Internal</div>

            <Link 
              href="/nota_dinas" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md font-bold uppercase tracking-wide transition-all ${isActive('/nota_dinas') ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <span className="text-xs shrink-0">📝</span> <span className="truncate">Nota Dinas</span>
            </Link>

            <div className="pt-2 text-[7.5px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2 my-1.5">Pelaksanaan</div>

            <Link 
              href="/kegiatan" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md font-bold uppercase tracking-wide transition-all ${isActive('/kegiatan') ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <span className="text-xs shrink-0">📅</span> <span className="truncate">Kegiatan</span>
            </Link>

            <div className="pt-2 text-[7.5px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2 my-1.5">Keputusan (SK)</div>

            <Link 
              href="/sk_bupati" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md font-bold uppercase tracking-wide transition-all ${isActive('/sk_bupati') ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <span className="text-xs shrink-0">🏛️</span> <span className="truncate">SK Bupati</span>
            </Link>

            <Link 
              href="/sk_kadin" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md font-bold uppercase tracking-wide transition-all ${isActive('/sk_kadin') ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <span className="text-xs shrink-0">📜</span> <span className="truncate">SK Kadin</span>
            </Link>

            <div className="pt-2 text-[7.5px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2 my-1.5">Pemeliharaan</div>

            <Link 
              href="/sampah" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md font-bold uppercase tracking-wide transition-all ${isActive('/sampah') ? 'bg-red-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <span className="text-xs shrink-0">🗑️</span> <span className="truncate">Pusat Sampah</span>
            </Link>

            {/* KEMBALI KE PORTAL UTAMA */}
            <div className="pt-2 border-t border-slate-800/50 mt-2">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md font-bold uppercase tracking-wide text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                <span className="text-xs shrink-0">🌐</span> <span className="truncate">Lihat Portal</span>
              </Link>
            </div>
          </nav>

          {/* Tombol Footer Developer Info */}
          <div className="p-2 border-t border-slate-800/80 shrink-0">
            <button 
              onClick={() => { setShowDevInfo(true); setIsMobileMenuOpen(false); }}
              className="w-full bg-slate-800/40 py-2 rounded-md border border-slate-700/50 text-center hover:bg-slate-800 transition-all active:scale-95 group"
            >
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                Version 1.0
              </p>
              <p className="text-[7px] font-bold text-blue-400 mt-0.5">&copy; 2026 ARCHIVE</p>
            </button>
          </div>
        </aside>

        {/* Lapisan Gelap di HP saat Sidebar terbuka */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* AREA KONTEN UTAMA DASHBOARD */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] md:h-screen overflow-y-auto relative z-10 w-full bg-[#f8fafc]">
          {children}
        </main>

        {/* MODAL PROFIL DEVELOPER */}
        {showDevInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-black">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDevInfo(false)}></div>
            
            <div className="bg-white rounded-xl p-4 max-w-[300px] w-full shadow-2xl relative z-10 border-2 border-white animate-in zoom-in-95 duration-150">
              <div className="text-center">
                <div className="w-11 h-11 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center text-lg shadow-sm">
                  👨‍💻
                </div>
                <h2 className="text-sm font-black uppercase tracking-tight">
                  Developer <span className="text-blue-600">Profile</span>
                </h2>
                <div className="h-0.5 w-6 bg-blue-600 mx-auto my-1.5 rounded-full"></div>
                
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[6.5px] mb-2.5 leading-tight">
                  E-Arsip Bidang Peningkatan Mutu Pendidikan Dasar Dinas Pendidikan Kabupaten Bojonegoro.
                </p>

                <div className="bg-blue-50/60 p-2.5 rounded-lg space-y-1 mb-2.5 text-left text-[10px]">
                  <div className="flex justify-between items-center border-b border-blue-100/40 pb-1">
                    <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Nama</span>
                    <span className="font-black uppercase text-slate-800">Detria Akbar</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-blue-100/40 pb-1">
                    <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Bidang</span>
                    <span className="font-black uppercase text-slate-800">Teknik Informatika</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Status</span>
                    <span className="font-black text-blue-600 uppercase italic">Active Dev</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <a 
                    href={gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-100 rounded-lg text-center"
                  >
                    <img src="https://cdn.simpleicons.org/gmail/EA4335" alt="Gmail" className="w-3.5 h-3.5 object-contain" />
                    <span className="text-[7px] font-black text-slate-700 uppercase">Gmail</span>
                  </a>
                  
                  <a 
                    href="https://instagram.com/dztry4" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-100 rounded-lg text-center"
                  >
                    <img src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" className="w-3.5 h-3.5 object-contain" />
                    <span className="text-[7px] font-black text-slate-700 uppercase">Instagram</span>
                  </a>
                </div>

                <button 
                  onClick={() => setShowDevInfo(false)}
                  className="w-full bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white font-black py-2 rounded-md uppercase tracking-wider text-[7.5px] transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        <div id="modal-root"></div>

      </body>
    </html>
  )
}