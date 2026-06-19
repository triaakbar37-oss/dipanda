'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
// Import client supabase yang sudah Anda konfigurasi
import { supabase } from '@/lib/supabase'

export default function EditNotaDinas({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  // State disesuaikan dengan struktur Nota Dinas terbaru di Supabase
  const [nomerSurat, setNomerSurat] = useState('')
  const [tanggalFisik, setTanggalFisik] = useState('') 
  const [tanggalDikirim, setTanggalDikirim] = useState('') 
  const [perihal, setPerihal] = useState('')
  const [yangMembuat, setYangMembuat] = useState('') 
  
  // Perubahan: State untuk URL (bukan File object)
  const [fileUrl, setFileUrl] = useState('')
  
  // PENAMBAHAN STATE BARU SESUAI TAMBAH NOTA DINAS
  const [keterangan, setKeterangan] = useState('')
  const [fileMentahanUrl, setFileMentahanUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // --- STATE UNTUK MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal Konfirmasi
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) // Modal Berhasil

  // 1. AMBIL DATA DARI SUPABASE (GET BY ID)
  useEffect(() => {
    async function getNota() {
      try {
        setFetching(true)
        
        const { data, error } = await supabase
          .from('nota_dinas')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          setNomerSurat(data.nomer_surat || '')
          setTanggalFisik(data.tanggal_fisik || '')
          setTanggalDikirim(data.tanggal_dikirim || '')
          setPerihal(data.perihal || '')
          setYangMembuat(data.yang_membuat || '')
          setFileUrl(data.file_url || '')
          // Sinkronisasi data tambahan
          setKeterangan(data.keterangan || '')
          setFileMentahanUrl(data.file_mentahan_url || '')
        }
      } catch (error: any) {
        console.error('Fetch error:', error)
        alert('Gagal mengambil data dari Supabase: ' + error.message)
        router.back()
      } finally {
        setFetching(false)
      }
    }
    if (id) getNota()
  }, [id, router])

  // 2. FUNGSI UPDATE KE SUPABASE
  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  async function handleSimpan() {
    setIsModalOpen(false)
    setLoading(true)

    try {
      const { error } = await supabase
        .from('nota_dinas')
        .update({
          nomer_surat: nomerSurat,
          tanggal_fisik: tanggalFisik,
          tanggal_dikirim: tanggalDikirim,
          // PENGIRIM DAN PENERIMA DIHAPUS SESUAI INSTRUKSI
          perihal: perihal,
          yang_membuat: yangMembuat,
          file_url: fileUrl, 
          // UPDATE KOLOM BARU
          keterangan: keterangan,
          file_mentahan_url: fileMentahanUrl,
        })
        .eq('id', id)

      if (error) throw error

      // Mengganti alert() dengan membuka Modal Berhasil
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
      console.error('Update error:', error)
      alert('Gagal memperbarui ke Cloud: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk menutup modal berhasil dan kembali ke halaman sebelumnya
  const closeSuccessAndGoBack = () => {
    setIsSuccessModalOpen(false)
    router.back()
    router.refresh()
  }

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-black bg-[#f0f7ff]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"></div>
      <p className="text-blue-600 tracking-widest uppercase">MENYINKRONKAN DATA CLOUD...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-4 border-blue-600 pb-8">
          <div className="flex items-center gap-6">
              <div className="bg-blue-600 text-white p-5 rounded-[1.5rem] text-3xl shadow-xl shadow-blue-200 font-black text-center min-w-[80px]">
                📝
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   UBAH <span className="text-blue-600">NOTA DINAS</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase text-blue-500/50">Cloud Database Synchronized</p>
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
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL FISIK SURAT</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalFisik}
                onChange={(e) => setTanggalFisik(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL DIKIRIM</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalDikirim}
                onChange={(e) => setTanggalDikirim(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR NOTA DINAS</label>
            <input 
              type="text"
              required
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
              value={nomerSurat}
              onChange={(e) => setNomerSurat(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">YANG MEMBUAT</label>
            <input 
              type="text"
              required
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
              value={yangMembuat}
              onChange={(e) => setYangMembuat(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">PERIHAL / RINGKASAN NOTA</label>
            <textarea 
              required
              rows={2}
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner resize-none text-black"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
            />
          </div>

          {/* KETERANGAN DIBUAT LEBIH BESAR (ROWS 6) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">KETERANGAN TAMBAHAN <span className="text-slate-400 font-medium normal-case text-[10px]">(ASPEK DETAIL)</span></label>
            <textarea 
              placeholder="TAMBAHKAN DETAIL KETERANGAN SECARA LENGKAP DI SINI..."
              rows={6}
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner resize-none text-black"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl">
              <label className="block text-xs font-black uppercase tracking-widest mb-4 text-white text-center">TAUTAN BERKAS DIGITAL (PDF)</label>
              <input 
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                className="w-full p-5 bg-slate-800 border-4 border-slate-700 focus:border-blue-600 rounded-[1.5rem] outline-none text-sm font-bold text-white placeholder:text-slate-500 transition-all shadow-inner"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </div>
            <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl">
              <label className="block text-xs font-black uppercase tracking-widest mb-4 text-white text-center">TAUTAN FILE KONSEP (FILE MENTAHAN)</label>
              <input 
                type="url"
                placeholder="URL GOOGLE DRIVE FILE KONSEP"
                className="w-full p-5 bg-slate-800 border-4 border-slate-700 focus:border-blue-600 rounded-[1.5rem] outline-none text-sm font-bold text-white placeholder:text-slate-500 transition-all shadow-inner"
                value={fileMentahanUrl}
                onChange={(e) => setFileMentahanUrl(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {loading ? 'MEMPERBARUI DATA...' : 'SIMPAN PERUBAHAN'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- 1. MODAL KONFIRMASI (TANYA SEBELUM SIMPAN) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">?</div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-black">Perbarui Data?</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
              Apakah Anda yakin ingin memperbarui data nota dinas ini? Pastikan seluruh informasi sudah benar.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-100 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest">Batal</button>
              <button type="button" onClick={handleSimpan} className="bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
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
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center">
            <div className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl animate-bounce">✓</div>
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter text-black">BERHASIL!</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
              Data Nota Dinas Anda telah sukses diperbarui di Cloud Supabase Database.
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