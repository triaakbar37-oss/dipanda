'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EditSkKadin({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  // STATE SESUAI STRUKTUR DATABASE TERBARU
  const [nomerSk, setNomerSk] = useState('')
  const [tentangSk, setTentangSk] = useState('')
  const [keterangan, setKeterangan] = useState('') // Tambahan baru
  const [tanggalSk, setTanggalSk] = useState('')
  const [yangMembuatSk, setYangMembuatSk] = useState('')
  const [tanggalJadiSk, setTanggalJadiSk] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [fileMentahanUrl, setFileMentahanUrl] = useState('') // Tambahan baru
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // --- STATE UNTUK SISTEM POP-UP ---
  const [isModalOpen, setIsModalOpen] = useState(false) 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) 

  // 1. AMBIL DATA LAMA DARI SUPABASE
  useEffect(() => {
    async function getSk() {
      try {
        setFetching(true)
        const { data, error } = await supabase
          .from('sk_kadin')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          setNomerSk(data.nomer_sk || '')
          setTentangSk(data.tentang_sk || '')
          setKeterangan(data.keterangan || '')
          
          if (data.tanggal_sk) {
            setTanggalSk(new Date(data.tanggal_sk).toISOString().split('T')[0])
          }
          if (data.tanggal_jadi_sk) {
            setTanggalJadiSk(new Date(data.tanggal_jadi_sk).toISOString().split('T')[0])
          }
          
          setYangMembuatSk(data.yang_membuat_sk || '')
          setFileUrl(data.file_url || '')
          setFileMentahanUrl(data.file_mentahan_url || '')
        }
      } catch (error: any) {
        alert('Gagal mengambil data dari Cloud: ' + error.message)
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
    router.push('/sk_kadin')
    router.refresh()
  }

  // 2. FUNGSI SIMPAN PERUBAHAN
  async function handleSimpan() {
    setIsModalOpen(false) 
    setLoading(true)

    try {
      const { error } = await supabase
        .from('sk_kadin')
        .update({
          nomer_sk: nomerSk,
          tentang_sk: tentangSk,
          keterangan: keterangan,
          tanggal_sk: tanggalSk,
          yang_membuat_sk: yangMembuatSk,
          tanggal_jadi_sk: tanggalJadiSk,
          file_url: fileUrl || null,
          file_mentahan_url: fileMentahanUrl || null,
        })
        .eq('id', id)

      if (error) throw error
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
      alert('Gagal memperbarui: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f7ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-8 border-blue-600 border-solid"></div>
          <p className="font-black text-blue-600 uppercase tracking-widest text-black">Menyinkronkan Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-4 border-blue-600 pb-8 text-black">
          <div className="flex items-center gap-6 text-black">
              <div className="bg-slate-900 text-white p-5 rounded-[1.5rem] text-3xl shadow-xl shadow-blue-200 font-black text-center min-w-[80px]">
                📜
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   UBAH <span className="text-blue-600">SK KADIN</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase">Perbarui Arsip Peningkatan Mutu</p>
              </div>
          </div>
          <button 
            type="button"
            onClick={() => router.back()} 
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase hover:bg-blue-600 transition-all"
          >
            KEMBALI
          </button>
        </div>

        {/* FORM CONTAINER */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-8 text-black">
          
          {/* BARIS TANGGAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600 text-black">TANGGAL SK</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalSk}
                onChange={(e) => setTanggalSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600 text-black">TANGGAL JADI SK</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalJadiSk}
                onChange={(e) => setTanggalJadiSk(e.target.value)}
              />
            </div>
          </div>

          {/* NOMOR SK */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600 text-black">NOMOR SK KEPALA DINAS</label>
            <input 
              type="text"
              required
              placeholder="CONTOH: 800/123/412.11/2026"
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black uppercase"
              value={nomerSk}
              onChange={(e) => setNomerSk(e.target.value)}
            />
          </div>

          {/* 1. PEMBUAT SK (ATAS) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600 text-black">YANG MEMBUAT SK (NAMA/BIDANG)</label>
            <input 
              type="text"
              required
              placeholder="NAMA PETUGAS ATAU UNIT PEMBUAT"
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black uppercase"
              value={yangMembuatSk}
              onChange={(e) => setYangMembuatSk(e.target.value)}
            />
          </div>

          {/* 2. TENTANG (TENGAH) */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400 text-black">TENTANG / PERIHAL (RINGKASAN)</label>
            <input 
              type="text"
              required
              placeholder="RINGKASAN TENTANG SK"
              className="w-full p-4 bg-slate-50 border-4 border-transparent focus:border-blue-400 rounded-2xl outline-none text-sm font-bold placeholder:text-slate-200 transition-all shadow-inner text-black uppercase"
              value={tentangSk}
              onChange={(e) => setTentangSk(e.target.value)}
            />
          </div>

          {/* 3. KETERANGAN (BAWAH & BESAR) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600 text-black">KETERANGAN LENGKAP ARSIP</label>
            <textarea 
              required
              placeholder="MASUKKAN DETAIL KETERANGAN ARSIP SECARA LENGKAP"
              rows={6}
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner resize-none text-black"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE */}
          <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-8 text-black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black">
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
                <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-emerald-400 text-center text-black">
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
            <p className="text-[9px] text-slate-500 text-center uppercase tracking-[0.3em] text-black">
              PASTIKAN AKSES LINK GOOGLE DRIVE SUDAH DIATUR KE "SIAPA SAJA YANG MEMILIKI LINK"
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {loading ? 'MENYIMPAN PERUBAHAN...' : 'SIMPAN PERUBAHAN SK KADIN'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM KEAMANAN ARSIP SK KADIN AKTIF — SUPABASE CLOUD 2026
        </p>
      </div>

      {/* --- 1. MODAL KONFIRMASI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center text-black">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black text-black">?</div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-black">Perbarui Data?</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed text-black">
              Apakah Anda yakin ingin memperbarui data SK ini? Perubahan akan langsung disinkronkan ke Cloud.
            </p>
            <div className="grid grid-cols-2 gap-4 text-black">
              <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)} className="bg-slate-100 py-6 rounded-[2rem] font-black uppercase tracking-widest text-black">BATAL</button>
              <button type="button" disabled={loading} onClick={handleSimpan} className="bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 text-black">YA, PERBARUI</button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. MODAL BERHASIL --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 text-black">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md text-black"></div>
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center text-black">
            <div className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl animate-bounce text-black">✓</div>
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter text-black">DATA UPDATED!</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed text-center text-black">
              Perubahan data SK Kepala Dinas telah berhasil disimpan ke database.
            </p>
            <button 
              type="button" 
              onClick={closeSuccessAndGoBack} 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.2em] transition-all shadow-2xl text-black"
            >
              OK, KEMBALI
            </button>
          </div>
        </div>
      )}
    </div>
  )
}