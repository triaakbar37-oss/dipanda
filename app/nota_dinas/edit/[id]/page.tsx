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
    <div className="min-h-screen flex flex-col items-center justify-center font-black bg-[#f0f7ff] text-xs">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mb-3"></div>
      <p className="text-blue-600 tracking-widest uppercase">MENYINKRONKAN DATA CLOUD...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black font-bold text-xs">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER COMPACT */}
        <div className="flex justify-between items-center mb-4 border-b-2 border-blue-600 pb-4 w-full gap-4">
          <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-3 rounded-xl text-xl shadow-md font-black shrink-0 text-center">
                📝
              </div>
              <div>
                 <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-none text-black">
                   UBAH <span className="text-blue-600">NOTA DINAS</span>
                 </h1>
                 <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">Cloud Database Synchronized</p>
              </div>
          </div>
          <button 
            type="button"
            onClick={() => router.back()} 
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-blue-600 transition-all whitespace-nowrap"
          >
            KEMBALI
          </button>
        </div>

        {/* FORM CONTAINER COMPACT */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-xl shadow-sm p-5 sm:p-8 border border-slate-200 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TANGGAL FISIK SURAT</label>
              <input 
                type="date"
                required
                className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
                value={tanggalFisik}
                onChange={(e) => setTanggalFisik(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TANGGAL DIKIRIM</label>
              <input 
                type="date"
                required
                className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
                value={tanggalDikirim}
                onChange={(e) => setTanggalDikirim(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">NOMOR NOTA DINAS</label>
            <input 
              type="text"
              required
              className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black uppercase"
              value={nomerSurat}
              onChange={(e) => setNomerSurat(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">YANG MEMBUAT</label>
            <input 
              type="text"
              required
              className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black uppercase"
              value={yangMembuat}
              onChange={(e) => setYangMembuat(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">PERIHAL / RINGKASAN NOTA</label>
            <textarea 
              required
              rows={2}
              className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all resize-none text-black uppercase leading-normal"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">KETERANGAN TAMBAHAN <span className="text-slate-400 font-medium normal-case text-[9px]">(ASPEK DETAIL)</span></label>
            <textarea 
              placeholder="TAMBAHKAN DETAIL KETERANGAN SECARA LENGKAP DI SINI..."
              rows={4}
              className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all resize-none text-black uppercase leading-normal"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE COMPACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl shadow-md">
              <label className="block text-[9px] font-black uppercase tracking-wider mb-2 text-white text-center">TAUTAN BERKAS DIGITAL (PDF)</label>
              <input 
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                className="w-full p-2.5 bg-slate-800 border border-slate-700 focus:border-blue-600 rounded-lg outline-none text-[11px] font-bold text-white placeholder:text-slate-500 transition-all"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </div>
            <div className="bg-slate-900 p-4 rounded-xl shadow-md">
              <label className="block text-[9px] font-black uppercase tracking-wider mb-2 text-white text-center">TAUTAN FILE KONSEP (FILE MENTAHAN)</label>
              <input 
                type="url"
                placeholder="URL GOOGLE DRIVE FILE KONSEP"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 focus:border-blue-600 rounded-lg outline-none text-[11px] font-bold text-white placeholder:text-slate-500 transition-all"
                value={fileMentahanUrl}
                onChange={(e) => setFileMentahanUrl(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-3 px-4 rounded-xl text-sm transition-all shadow-md disabled:bg-gray-400 uppercase tracking-wider"
          >
            {loading ? 'MEMPERBARUI DATA...' : 'SIMPAN PERUBAHAN'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 font-bold uppercase tracking-widest text-[8px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- 1. MODAL KONFIRMASI (TANYA SEBELUM SIMPAN) COMPACT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs text-center border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">?</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Perbarui Data?</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Apakah Anda yakin ingin memperbarui data nota dinas ini? Pastikan seluruh informasi sudah benar.
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-100 text-slate-900 py-2.5 rounded-lg font-black uppercase tracking-wider text-black">Batal</button>
              <button type="button" onClick={handleSimpan} className="bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-2">
                {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, PERBARUI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. MODAL BERHASIL COMPACT --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs text-center border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">✓</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">BERHASIL!</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Data Nota Dinas Anda telah sukses diperbarui di Cloud Supabase Database.
            </p>
            <button 
              type="button" 
              onClick={closeSuccessAndGoBack} 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all"
            >
              OK, KEMBALI
            </button>
          </div>
        </div>
      )}
    </div>
  )
}