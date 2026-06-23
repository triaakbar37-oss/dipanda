'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TambahSkBupati() {
  const router = useRouter()
  
  // --- STATE DATABASE MODEL BARU ---
  const [nomerSk, setNomerSk] = useState('')
  const [tentangSk, setTentangSk] = useState('')
  const [tanggalSk, setTanggalSk] = useState('')
  const [yangMembuatSk, setYangMembuatSk] = useState('')
  const [keterangan, setKeterangan] = useState('') // Pengganti field lama
  
  // --- STATE URL GOOGLE DRIVE ---
  const [fileUrl, setFileUrl] = useState('') // URL PDF
  const [fileMentahanUrl, setFileMentahanUrl] = useState('') // URL Konsep/Mentahan
  
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setNomerSk('')
    setTentangSk('')
    setTanggalSk('')
    setYangMembuatSk('')
    setKeterangan('')
    setFileUrl('')
    setFileMentahanUrl('')
    setIsSuccessModalOpen(false)
  }

  async function handleSimpan() {
    setIsModalOpen(false)
    setLoading(true)

    try {
      const { error } = await supabase
        .from('sk_bupati') 
        .insert([
          {
            nomer_sk: nomerSk,
            tentang_sk: tentangSk,
            tanggal_sk: tanggalSk,
            yang_membuat_sk: yangMembuatSk,
            keterangan: keterangan,
            file_url: fileUrl, 
            file_mentahan_url: fileMentahanUrl,
            is_deleted: false
          },
        ])

      if (error) throw new Error(error.message)
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
      alert('Gagal menyimpan ke Cloud: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black w-full font-bold relative text-xs">
      <div className="w-full mx-auto max-w-4xl">
        
        {/* HEADER COMPACT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b-2 border-blue-600 pb-4 gap-4 w-full">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 text-white p-3 rounded-xl text-2xl shadow-md font-black shrink-0">
               🏛️
             </div>
             <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-none text-black">
                  TAMBAH <span className="text-blue-600">SK BUPATI</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">Arsip Digital Tanpa Data Pengiriman</p>
             </div>
          </div>
          
          <Link 
            href="/sk_bupati" 
            className="w-full sm:w-auto bg-slate-900 text-white px-4 py-2.5 rounded-lg font-black text-center transition-all hover:bg-blue-600 uppercase tracking-wider text-[10px]"
          >
            KEMBALI
          </Link>
        </div>

        {/* FORM COMPACT */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-xl shadow-sm p-5 sm:p-8 border border-slate-200 space-y-4 w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">NOMOR SK BUPATI</label>
              <input 
                type="text" required placeholder="CONTOH: 188/123/KEP/412.013/2026"
                className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all shadow-inner text-black placeholder:text-slate-300 uppercase tracking-wider"
                value={nomerSk} onChange={(e) => setNomerSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TANGGAL SK (FISIK)</label>
              <input 
                type="date" required
                className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all shadow-inner text-black uppercase"
                value={tanggalSk} onChange={(e) => setTanggalSk(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">YANG MEMBUAT SK (BIDANG)</label>
              <input 
                type="text" required placeholder="BIDANG PENINGKATAN MUTU"
                className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all shadow-inner text-black placeholder:text-slate-300 uppercase tracking-wider"
                value={yangMembuatSk} onChange={(e) => setYangMembuatSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TENTANG / PERIHAL</label>
              <textarea 
                required placeholder="URAIAN SINGKAT PERIHAL SK" rows={2}
                className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold resize-none transition-all shadow-inner text-black placeholder:text-slate-300 uppercase tracking-wider"
                value={tentangSk} onChange={(e) => setTentangSk(e.target.value)}
              />
            </div>
          </div>

          {/* KOLOM KETERANGAN COMPACT */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">KETERANGAN TAMBAHAN</label>
            <textarea 
              placeholder="CATATAN DETAIL MENGENAI SK INI (LOKASI FISIK, STATUS, DLL)"
              rows={4}
              className="w-full p-3 bg-blue-50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold resize-none transition-all shadow-inner text-black placeholder:text-slate-300 uppercase tracking-wider"
              value={keterangan} onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE COMPACT */}
          <div className="bg-slate-900 p-4 sm:p-6 rounded-xl shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FILE PDF UTAMA */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest mb-2 text-blue-400 text-center">
                  LINK PDF FINAL (GOOGLE DRIVE)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-2.5 bg-slate-800 border border-blue-600/30 focus:border-blue-500 rounded-lg outline-none text-[11px] font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>

              {/* FILE MENTAHAN / KONSEP */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest mb-2 text-emerald-400 text-center">
                  LINK FILE KONSEP (DOCX/XLSX)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-2.5 bg-slate-800 border border-emerald-600/30 focus:border-emerald-500 rounded-lg outline-none text-[11px] font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={fileMentahanUrl}
                  onChange={(e) => setFileMentahanUrl(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[8px] text-slate-500 text-center uppercase tracking-widest">
              PASTIKAN AKSES LINK GOOGLE DRIVE SUDAH DIATUR KE "SIAPA SAJA YANG MEMILIKI LINK"
            </p>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-3 px-4 rounded-lg text-[11px] transition-all shadow-sm disabled:bg-gray-400 uppercase tracking-wider active:scale-95"
          >
            {loading ? 'MENYIMPAN DATA...' : 'SIMPAN KE DATABASE'}
          </button>
        </form>

        <p className="text-center mt-6 text-black font-black uppercase tracking-[0.3em] text-[9px]">
          SISTEM KONEKSI CLOUD SUPABASE AKTIF — 2026
        </p>
      </div>

      {/* MODAL KONFIRMASI COMPACT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">?</div>
              <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Verifikasi Data?</h2>
              <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
                Pastikan Nomor SK dan tautan Google Drive sudah bisa diakses oleh publik sebelum disimpan.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 py-2.5 rounded-lg font-black uppercase tracking-wider">Batal</button>
                <button onClick={handleSimpan} className="bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider shadow-md">Ya, Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BERHASIL COMPACT */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl animate-bounce">✓</div>
            <h2 className="text-sm font-black mb-6 uppercase tracking-tight text-black">DATA SK BERHASIL MASUK CLOUD!</h2>
            <div className="flex flex-col gap-2 text-[11px]">
              <button onClick={resetForm} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider shadow-md">TAMBAH DATA LAGI</button>
              <button onClick={() => router.push('/sk_bupati')} className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-black uppercase tracking-wider">KEMBALI KE DAFTAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}