'use client'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // State untuk Modal Profil Developer
  const [showDevInfo, setShowDevInfo] = useState(false)

  const isActive = (path: string) => pathname === path

  // Ganti alamat email di bawah ini dengan alamat Gmail asli Anda
  const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=triaakbar37@gmail.com&su=Tanya%20E-Arsip"

  return (
    <html lang="en">
      <body className="flex min-h-screen bg-[#f0f7ff] text-slate-900 antialiased overflow-hidden">
        
        {/* SIDEBAR - Gaya Kantor Profesional */}
        <aside className="w-80 bg-slate-900 text-white flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.05)] relative z-20 h-screen">
          
          <div className="p-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/40">
                <span className="text-2xl">📂</span>
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase italic text-white">
                E-Arsip
              </span>
            </div>
          </div>
          
          <nav className="flex-1 px-6 space-y-4 overflow-y-auto pb-10 custom-scrollbar">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mb-4">Main Menu</div>
            
            <Link href="/" className={`flex items-center gap-4 p-5 rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all ${isActive('/') ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/50 translate-x-2' : 'hover:bg-slate-800 text-slate-400'}`}>
              <span className="text-xl">🏠</span> Dashboard
            </Link>
            
            <div className="pt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mb-4">Manajemen Surat</div>
            
            <Link href="/surat_masuk" className={`flex items-center gap-4 p-5 rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all ${isActive('/surat_masuk') ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/50 translate-x-2' : 'hover:bg-slate-800 text-slate-400'}`}>
              <span className="text-xl">📩</span> Surat Masuk
            </Link>
            
            <Link href="/surat_keluar" className={`flex items-center gap-4 p-5 rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all ${isActive('/surat_keluar') ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/50 translate-x-2' : 'hover:bg-slate-800 text-slate-400'}`}>
              <span className="text-xl">📤</span> Surat Keluar
            </Link>

            <div className="pt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mb-4">Internal</div>

            <Link href="/nota_dinas" className={`flex items-center gap-4 p-5 rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all ${isActive('/nota_dinas') ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/50 translate-x-2' : 'hover:bg-slate-800 text-slate-400'}`}>
              <span className="text-xl">📝</span> Nota Dinas
            </Link>

            <div className="pt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mb-4">Keputusan (SK)</div>

            <Link href="/sk_bupati" className={`flex items-center gap-4 p-5 rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all ${isActive('/sk_bupati') ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/50 translate-x-2' : 'hover:bg-slate-800 text-slate-400'}`}>
              <span className="text-xl">🏛️</span> SK Bupati
            </Link>

            <Link href="/sk_kadin" className={`flex items-center gap-4 p-5 rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all ${isActive('/sk_kadin') ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/50 translate-x-2' : 'hover:bg-slate-800 text-slate-400'}`}>
              <span className="text-xl">📜</span> SK Kadin
            </Link>

            <div className="pt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mb-4">Pemeliharaan</div>

            <Link href="/sampah" className={`flex items-center gap-4 p-5 rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all ${isActive('/sampah') ? 'bg-red-600 text-white shadow-xl shadow-red-900/50 translate-x-2' : 'hover:bg-slate-800 text-slate-400'}`}>
              <span className="text-xl">🗑️</span> Pusat Sampah
            </Link>
          </nav>

          {/* Tombol Tersembunyi untuk Profile Developer */}
          <div className="p-8">
            <button 
              onClick={() => setShowDevInfo(true)}
              className="w-full bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 text-center hover:bg-slate-800 transition-all active:scale-95 group"
            >
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                Version 1.0
              </p>
              <p className="text-[10px] font-bold text-blue-400 mt-1">&copy; 2026 DIGITAL ARCHIVE</p>
            </button>
          </div>
        </aside>

        {/* CONTENT UTAMA */}
        <main className="flex-1 h-screen overflow-y-auto relative z-10">
          {children}
        </main>

        {/* MODAL PROFIL PENGEMBANG */}
        {showDevInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-black">
            {/* Overlay Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              onClick={() => setShowDevInfo(false)}
            ></div>
            
            {/* Card Modal */}
            <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative z-10 border-8 border-white animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-xl shadow-blue-200">
                  👨‍💻
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">
                  Developer <span className="text-blue-600">Profile</span>
                </h2>
                <div className="h-1.5 w-16 bg-blue-600 mx-auto my-4 rounded-full"></div>
                
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mb-6 leading-relaxed">
                  Aplikasi E-Arsip Bidang Peningkatan Mutu Pendidikan Dasar Dinas Pendidikan Kabupaten Bojonegoro.
                </p>

                <div className="bg-blue-50 p-6 rounded-[2rem] space-y-4 mb-6 text-left">
                  <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nama</span>
                    <span className="text-sm font-black uppercase text-black">Detria Akbar</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Bidang</span>
                    <span className="text-sm font-black uppercase text-black">Teknik Informatika</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Status</span>
                    <span className="text-sm font-black text-blue-600 uppercase italic">Active Dev</span>
                  </div>
                </div>

                {/* --- KONTAK GMAIL DAN IG DENGAN LOGO ORIGINAL --- */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <a 
                    href={gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-5 bg-white border-2 border-slate-100 rounded-3xl hover:border-red-500 hover:shadow-xl transition-all active:scale-95 group"
                  >
                    <img 
                      src="https://cdn.simpleicons.org/gmail/EA4335" 
                      alt="Gmail Logo" 
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter italic">Buka Gmail</span>
                  </a>
                  
                  <a 
                    href="https://instagram.com/dztry4" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-5 bg-white border-2 border-slate-100 rounded-3xl hover:border-pink-500 hover:shadow-xl transition-all active:scale-95 group"
                  >
                    <img 
                      src="https://cdn.simpleicons.org/instagram/E4405F" 
                      alt="Instagram Logo" 
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">Instagram</span>
                  </a>
                </div>

                <button 
                  onClick={() => setShowDevInfo(false)}
                  className="w-full bg-blue-100 text-blue-600 font-black py-5 rounded-[1.5rem] uppercase tracking-[0.2em] text-[10px] hover:bg-blue-600 hover:text-white transition-all shadow-md active:scale-95"
                >
                  Tutup Informasi
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