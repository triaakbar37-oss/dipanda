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
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-4 border-blue-600 pb-8">
          <div className="flex items-center gap-6">
              <div className="bg-blue-600 text-white p-5 rounded-[1.5rem] text-3xl shadow-xl shadow-blue-200 font-black">
                🏛️
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   TAMBAH <span className="text-blue-600">SK BUPATI</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase text-blue-500/60">Arsip Digital Tanpa Data Pengiriman</p>
              </div>
          </div>
          <Link href="/sk_bupati" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase hover:bg-blue-600 transition-all">
            KEMBALI
          </Link>
        </div>

        {/* FORM */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR SK BUPATI</label>
              <input 
                type="text" required placeholder="CONTOH: 188/123/KEP/412.013/2026"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={nomerSk} onChange={(e) => setNomerSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL SK (FISIK)</label>
              <input 
                type="date" required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalSk} onChange={(e) => setTanggalSk(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-4 border-slate-50 pt-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">YANG MEMBUAT SK (BIDANG)</label>
              <input 
                type="text" required placeholder="BIDANG PENINGKATAN MUTU"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={yangMembuatSk} onChange={(e) => setYangMembuatSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TENTANG / PERIHAL</label>
              <textarea 
                required placeholder="URAIAN SINGKAT PERIHAL SK" rows={2}
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black resize-none transition-all shadow-inner text-black"
                value={tentangSk} onChange={(e) => setTentangSk(e.target.value)}
              />
            </div>
          </div>

          {/* KOLOM KETERANGAN LEBIH BESAR */}
          <div className="border-t-4 border-slate-50 pt-8">
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">KETERANGAN TAMBAHAN</label>
            <textarea 
              placeholder="CATATAN DETAIL MENGENAI SK INI (LOKASI FISIK, STATUS, DLL)"
              rows={5}
              className="w-full p-8 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[2.5rem] outline-none text-lg font-black resize-none transition-all shadow-inner text-black"
              value={keterangan} onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE */}
          <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FILE PDF UTAMA */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-blue-400 text-center">
                  LINK PDF FINAL (GOOGLE DRIVE)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-5 bg-slate-800 border-4 border-blue-600/30 focus:border-blue-500 rounded-[1.5rem] outline-none text-xs font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>

              {/* FILE MENTAHAN / KONSEP */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-emerald-400 text-center">
                  LINK FILE KONSEP (DOCX/XLSX)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-5 bg-slate-800 border-4 border-emerald-600/30 focus:border-emerald-500 rounded-[1.5rem] outline-none text-xs font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={fileMentahanUrl}
                  onChange={(e) => setFileMentahanUrl(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[9px] text-slate-500 text-center uppercase tracking-[0.3em]">
              PASTIKAN AKSES LINK GOOGLE DRIVE SUDAH DIATUR KE "SIAPA SAJA YANG MEMILIKI LINK"
            </p>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {loading ? 'MENYIMPAN DATA...' : 'SIMPAN KE DATABASE'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM KONEKSI CLOUD SUPABASE AKTIF — 2026
        </p>
      </div>

      {/* MODAL KONFIRMASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black">?</div>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-black">Verifikasi Data?</h2>
              <p className="text-slate-500 font-bold mb-10 uppercase text-xs tracking-widest leading-relaxed">
                Pastikan Nomor SK dan tautan Google Drive sudah bisa diakses oleh publik sebelum disimpan.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 py-6 rounded-[2rem] font-black uppercase tracking-widest">Batal</button>
                <button onClick={handleSimpan} className="bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest">Ya, Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BERHASIL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-xl border-8 border-white animate-in zoom-in duration-300 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-bounce">✓</div>
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter text-black">DATA SK BERHASIL MASUK CLOUD!</h2>
            <div className="flex flex-col gap-4">
              <button onClick={resetForm} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-lg">TAMBAH DATA LAGI</button>
              <button onClick={() => router.push('/sk_bupati')} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest">KEMBALI KE DAFTAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}