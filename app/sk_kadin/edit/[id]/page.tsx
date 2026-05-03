'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// Import client supabase yang sudah Anda konfigurasi
import { supabase } from '@/lib/supabase'

export default function EditSkKadin({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  // STATE SESUAI DATABASE MODEL SKKADIN
  const [nomerSk, setNomerSk] = useState('')
  const [tentangSk, setTentangSk] = useState('')
  const [tanggalSk, setTanggalSk] = useState('')
  const [yangMembuatSk, setYangMembuatSk] = useState('')
  const [tanggalJadiSk, setTanggalJadiSk] = useState('')
  
  // Berubah dari File ke String URL Google Drive
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // --- STATE BARU UNTUK SISTEM POP-UP ---
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal Konfirmasi
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) // Modal Berhasil

  // 1. AMBIL DATA LAMA BERDASARKAN ID LANGSUNG DARI SUPABASE
  useEffect(() => {
    async function getSk() {
      try {
        setFetching(true)
        
        // Query langsung ke tabel 'sk_kadin' berdasarkan ID
        const { data, error } = await supabase
          .from('sk_kadin')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          setNomerSk(data.nomer_sk || '')
          setTentangSk(data.tentang_sk || '')
          
          // Memastikan format tanggal cocok untuk input type="date" (YYYY-MM-DD)
          if (data.tanggal_sk) {
            setTanggalSk(new Date(data.tanggal_sk).toISOString().split('T')[0])
          }
          if (data.tanggal_jadi_sk) {
            setTanggalJadiSk(new Date(data.tanggal_jadi_sk).toISOString().split('T')[0])
          }
          
          setYangMembuatSk(data.yang_membuat_sk || '')
          setFileUrl(data.file_url || '') // Mengambil URL Drive yang sudah ada
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

  // Fungsi untuk memicu modal konfirmasi muncul
  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  // Fungsi untuk menutup modal sukses dan pindah halaman
  const closeSuccessAndGoBack = () => {
    setIsSuccessModalOpen(false)
    router.push('/sk_kadin')
    router.refresh()
  }

  // 2. FUNGSI SIMPAN PERUBAHAN KE SUPABASE
  async function handleSimpan() {
    setIsModalOpen(false) // Tutup modal konfirmasi
    setLoading(true)

    try {
      // PROSES UPDATE LANGSUNG KE SUPABASE
      const { error } = await supabase
        .from('sk_kadin')
        .update({
          nomer_sk: nomerSk,
          tentang_sk: tentangSk,
          tanggal_sk: tanggalSk,
          yang_membuat_sk: yangMembuatSk,
          tanggal_jadi_sk: tanggalJadiSk,
          file_url: fileUrl || null, // Simpan sebagai null jika kosong
        })
        .eq('id', id)

      if (error) throw error

      // Membuka Modal Berhasil
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
          <p className="font-black text-blue-600 uppercase tracking-widest">Menghubungkan ke Cloud...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-4 border-blue-600 pb-8">
          <div className="flex items-center gap-6">
              <div className="bg-slate-900 text-white p-5 rounded-[1.5rem] text-3xl shadow-xl shadow-blue-200 font-black text-center min-w-[80px]">
                KD
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   UBAH <span className="text-blue-600">SK KADIN</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase">Perbarui Arsip Keputusan Kepala Dinas</p>
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
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL SURAT KEPUTUSAN</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalSk}
                onChange={(e) => setTanggalSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL JADI / PENERBITAN</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalJadiSk}
                onChange={(e) => setTanggalJadiSk(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR SK KADIN</label>
            <input 
              type="text"
              required
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
              placeholder="Masukkan nomor SK lengkap..."
              value={nomerSk}
              onChange={(e) => setNomerSk(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TENTANG SK (RINGKASAN PERIHAL)</label>
            <textarea 
              required
              rows={4}
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner resize-none text-black"
              placeholder="Jelaskan perihal atau tentang SK tersebut secara jelas..."
              value={tentangSk}
              onChange={(e) => setTentangSk(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">YANG MEMBUAT / BIDANG TERKAIT</label>
            <input 
              type="text"
              required
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
              placeholder="Nama pembuat SK atau bidang pengusul..."
              value={yangMembuatSk}
              onChange={(e) => setYangMembuatSk(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE (OPSIONAL) */}
          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-center">
            <label className="block text-sm font-black uppercase tracking-widest mb-2 text-white">LINK GOOGLE DRIVE (OPSIONAL)</label>
            <p className="text-blue-400 text-[10px] mb-4 uppercase tracking-[0.2em]">Ganti atau masukkan URL jika ada perubahan dokumen</p>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              className="w-full p-5 bg-slate-800 border-4 border-blue-600/30 focus:border-blue-500 rounded-[1.5rem] outline-none text-base font-bold text-blue-400 transition-all shadow-inner placeholder:text-slate-600"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {loading ? 'SEDANG MENYIMPAN...' : 'SIMPAN PERUBAHAN SK KADIN'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM KEAMANAN ARSIP SK KADIN AKTIF — SUPABASE CLOUD 2026
        </p>
      </div>

      {/* --- 1. MODAL KONFIRMASI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => !loading && setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center text-black">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">?</div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-black">Perbarui Data?</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
              Apakah Anda yakin ingin memperbarui data SK Kepala Dinas ini? Perubahan akan langsung disimpan ke Cloud.
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

      {/* --- 2. MODAL BERHASIL --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center text-black">
            <div className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl animate-bounce">✓</div>
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter text-black">BERHASIL!</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed text-black">
              Data SK Kepala Dinas telah sukses diperbarui di Database Cloud.
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