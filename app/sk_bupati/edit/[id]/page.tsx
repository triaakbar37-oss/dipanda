'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// Pastikan file konfigurasi ini sudah Anda buat di @/lib/supabase
import { supabase } from '@/lib/supabase'

export default function EditSkBupati({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  // STATE SESUAI STRUKTUR DATABASE
  const [nomerSk, setNomerSk] = useState('')
  const [tentangSk, setTentangSk] = useState('')
  const [tanggalSk, setTanggalSk] = useState('')
  const [yangMembuatSk, setYangMembuatSk] = useState('')
  const [namaPengirim, setNamaPengirim] = useState('')
  const [tanggalPengirim, setTanggalPengirim] = useState('')
  const [tanggalKembali, setTanggalKembali] = useState('')
  const [diterimaOleh, setDiterimaOleh] = useState('')
  const [fileUrl, setFileUrl] = useState('') // State untuk link Google Drive
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // --- STATE UNTUK SISTEM POP-UP ---
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal Konfirmasi
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) // Modal Berhasil

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
          setNamaPengirim(data.nama_pengirim || '')
          setTanggalPengirim(data.tanggal_pengirim || '')
          setTanggalKembali(data.tanggal_kembali || '')
          setDiterimaOleh(data.diterima_oleh || '')
          setFileUrl(data.file_url || '')
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

  // Fungsi untuk memicu modal konfirmasi muncul
  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  // Fungsi untuk menutup modal sukses dan pindah halaman
  const closeSuccessAndGoBack = () => {
    setIsSuccessModalOpen(false)
    router.push('/sk_bupati')
    router.refresh()
  }

  // 2. FUNGSI UPDATE DATA
  async function handleSimpan() {
    setIsModalOpen(false) // Tutup modal konfirmasi terlebih dahulu
    setLoading(true)

    try {
      const { error } = await supabase
        .from('sk_bupati')
        .update({
          nomer_sk: nomerSk,
          tentang_sk: tentangSk,
          tanggal_sk: tanggalSk,
          yang_membuat_sk: yangMembuatSk,
          nama_pengirim: namaPengirim,
          tanggal_pengirim: tanggalPengirim,
          // Mengirim null jika kosong agar tidak melanggar constraint di DB
          tanggal_kembali: tanggalKembali || null, 
          diterima_oleh: diterimaOleh,
          file_url: fileUrl 
        })
        .eq('id', id)

      if (error) throw error

      // Membuka Modal Berhasil (Menggantikan Alert)
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
      <p className="animate-pulse tracking-widest">MENGAMBIL DATA ARSIP...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-4 border-blue-600 pb-8">
          <div className="flex items-center gap-6">
              <div className="bg-blue-600 text-white p-5 rounded-[1.5rem] text-3xl shadow-xl shadow-blue-200 font-black text-center min-w-[80px]">
                EDIT
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   UBAH <span className="text-blue-600">SK BUPATI</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase opacity-50">Sinkronisasi Cloud Supabase — 2026</p>
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

        {/* FORM CONTAINER - Menggunakan triggerConfirmModal saat submit */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR SK BUPATI</label>
              <input 
                type="text"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={nomerSk}
                onChange={(e) => setNomerSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL SK (FISIK)</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalSk}
                onChange={(e) => setTanggalSk(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TENTANG SK (PERIHAL)</label>
            <textarea 
              required
              rows={3}
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner resize-none text-black"
              value={tentangSk}
              onChange={(e) => setTentangSk(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-4 border-slate-50 pt-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">YANG MEMBUAT SK</label>
              <input 
                type="text"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={yangMembuatSk}
                onChange={(e) => setYangMembuatSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NAMA PENGIRIM</label>
              <input 
                type="text"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={namaPengirim}
                onChange={(e) => setNamaPengirim(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL PENGIRIM</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalPengirim}
                onChange={(e) => setTanggalPengirim(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600 italic">TANGGAL KEMBALI (OPSIONAL)</label>
              <input 
                type="date"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">DITERIMA OLEH</label>
              <input 
                type="text"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={diterimaOleh}
                onChange={(e) => setDiterimaOleh(e.target.value)}
              />
            </div>
          </div>

          {/* INPUT URL GOOGLE DRIVE */}
          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl border-4 border-blue-600">
            <label className="block text-sm font-black uppercase tracking-widest mb-2 text-white text-center">GANTI LINK ARSIP DIGITAL (GOOGLE DRIVE URL)</label>
            <p className="text-blue-400 text-[10px] text-center mb-4 uppercase">Gunakan link publik agar dokumen dapat diakses kembali</p>
            <input 
              type="url"
              placeholder="https://drive.google.com/..."
              className="w-full p-5 bg-slate-800 border-4 border-transparent focus:border-blue-500 rounded-[1.5rem] outline-none text-base font-bold transition-all shadow-inner text-blue-400 placeholder:text-slate-600"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {loading ? 'MEMPERBARUI DATA...' : 'SIMPAN PERUBAHAN KE CLOUD'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM KEAMANAN ARSIP SK BUPATI AKTIF — 2026
        </p>
      </div>

      {/* --- 1. MODAL KONFIRMASI (TANYA SEBELUM SIMPAN) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => !loading && setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center text-black">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">?</div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Perbarui Data?</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
              Apakah Anda yakin ingin memperbarui data SK Bupati ini? Pastikan seluruh informasi sudah benar.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="bg-slate-100 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleSimpan} 
                className="bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {loading ? <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, PERBARUI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. MODAL BERHASIL (PENGGANTI ALERT) --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center text-black">
            <div className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl animate-bounce">✓</div>
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">BERHASIL!</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
              Data SK Bupati Anda telah sukses diperbarui di Cloud Supabase Database.
            </p>
            <button 
              type="button" 
              onClick={closeSuccessAndGoBack} 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95"
            >
              OK, KEMBALI
            </button>
          </div>
        </div>
      )}
    </div>
  )
}