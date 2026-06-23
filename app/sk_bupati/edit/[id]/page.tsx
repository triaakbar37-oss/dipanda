'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EditSkBupati({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  // --- STATE SESUAI STRUKTUR DATABASE BARU ---
  const [nomerSk, setNomerSk] = useState('')
  const [tentangSk, setTentangSk] = useState('')
  const [tanggalSk, setTanggalSk] = useState('')
  const [yangMembuatSk, setYangMembuatSk] = useState('')
  const [keterangan, setKeterangan] = useState('') 
  
  // --- STATE URL GOOGLE DRIVE ---
  const [fileUrl, setFileUrl] = useState('') // URL PDF
  const [fileMentahanUrl, setFileMentahanUrl] = useState('') // URL Konsep/Mentahan
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // --- STATE UNTUK SISTEM POP-UP ---
  const [isModalOpen, setIsModalOpen] = useState(false) 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) 

  // 1. AMBIL DATA DARI SUPABASE SAAT HALAMAN DIMUAT
  useEffect(() => {
    async function getSk() {
      try {
        setFetching(true)
        const { data, error } = await supabase
          .from('sk_bupati')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          setNomerSk(data.nomer_sk || '')
          setTentangSk(data.tentang_sk || '')
          setTanggalSk(data.tanggal_sk || '')
          setYangMembuatSk(data.yang_membuat_sk || '')
          setKeterangan(data.keterangan || '')
          setFileUrl(data.file_url || '')
          setFileMentahanUrl(data.file_mentahan_url || '')
        }
      } catch (error: any) {
        alert('Gagal mengambil data: ' + error.message)
        router.back()
      } finally {
        setFetching(false)
      }
    }
    if (id) getSk()
  }, [id, router])

  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const closeSuccessAndGoBack = () => {
    setIsSuccessModalOpen(false)
    router.push('/sk_bupati')
    router.refresh()
  }

  // 2. FUNGSI UPDATE DATA
  async function handleSimpan() {
    setIsModalOpen(false) 
    setLoading(true)

    try {
      const { error } = await supabase
        .from('sk_bupati')
        .update({
          nomer_sk: nomerSk,
          tentang_sk: tentangSk,
          tanggal_sk: tanggalSk,
          yang_membuat_sk: yangMembuatSk,
          keterangan: keterangan,
          file_url: fileUrl,
          file_mentahan_url: fileMentahanUrl
        })
        .eq('id', id)

      if (error) throw error
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
      alert('Gagal memperbarui ke Cloud: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-black text-blue-600 gap-4 bg-[#f0f7ff]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="animate-pulse tracking-widest uppercase text-xs">Sinkronisasi Data...</p>
    </div>
  )

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
                  UBAH <span className="text-blue-600">SK BUPATI</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">Arsip Digital Tanpa Data Pengiriman</p>
             </div>
          </div>
          
          <button 
            type="button"
            onClick={() => router.back()} 
            className="w-full sm:w-auto bg-slate-900 text-white px-4 py-2.5 rounded-lg font-black text-center transition-all hover:bg-blue-600 uppercase tracking-wider text-[10px]"
          >
            KEMBALI
          </button>
        </div>

        {/* FORM CONTAINER COMPACT */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-xl shadow-sm p-5 sm:p-8 border border-slate-200 space-y-4 w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">NOMOR SK BUPATI</label>
              <input 
                type="text" required
                className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all shadow-inner text-black uppercase tracking-wider"
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
                type="text" required
                className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all shadow-inner text-black uppercase tracking-wider"
                value={yangMembuatSk} onChange={(e) => setYangMembuatSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TENTANG / PERIHAL</label>
              <textarea 
                required rows={2}
                className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold resize-none transition-all shadow-inner text-black uppercase tracking-wider"
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
              className="w-full p-3 bg-blue-50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold resize-none transition-all shadow-inner text-black uppercase tracking-wider"
              value={keterangan} onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* DUA URL GOOGLE DRIVE BERSANDINGAN COMPACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900 p-4 rounded-xl border border-blue-600">
              <label className="block text-[9px] font-black uppercase tracking-widest mb-2 text-white text-center">
                📄 URL FILE PDF (FINAL)
              </label>
              <input 
                type="url" placeholder="Link PDF Drive..."
                value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-transparent focus:border-blue-500 rounded-md outline-none text-[11px] font-bold text-blue-400 text-center"
              />
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500">
              <label className="block text-[9px] font-black uppercase tracking-widest mb-2 text-white text-center">
                📝 URL FILE KONSEP (MENTAHAN)
              </label>
              <input 
                type="url" placeholder="Link Word/Docx Drive..."
                value={fileMentahanUrl} onChange={(e) => setFileMentahanUrl(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-transparent focus:border-emerald-500 rounded-md outline-none text-[11px] font-bold text-emerald-400 text-center"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-3 px-4 rounded-lg text-[11px] transition-all shadow-sm disabled:bg-gray-400 uppercase tracking-wider active:scale-95"
          >
            {loading ? 'MEMPERBARUI DATA...' : 'SIMPAN PERUBAHAN KE CLOUD'}
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
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">?</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Perbarui Data?</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Pastikan Nomor SK dan tautan Google Drive sudah benar sebelum memperbarui arsip.
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-100 py-2.5 rounded-lg font-black uppercase tracking-wider text-black">Batal</button>
              <button type="button" onClick={handleSimpan} className="bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider shadow-md">Ya, Perbarui</button>
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
            <h2 className="text-sm font-black mb-2 uppercase tracking-tight text-black">BERHASIL!</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Perubahan data SK Bupati telah sukses disimpan secara permanen di Cloud.
            </p>
            <button 
              type="button" 
              onClick={closeSuccessAndGoBack} 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all"
            >
              OK, SELESAI
            </button>
          </div>
        </div>
      )}
    </div>
  )
}