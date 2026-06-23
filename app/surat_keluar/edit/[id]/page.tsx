'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
// Import client supabase yang sudah Anda konfigurasi sebelumnya
import { supabase } from '@/lib/supabase'

export default function EditSuratKeluar({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  // State disesuaikan dengan struktur tabel Supabase
  const [nomorSurat, setNomorSurat] = useState('')
  const [tujuan, setTujuan] = useState('')
  const [pengirim, setPengirim] = useState('')
  const [perihal, setPerihal] = useState('')
  const [nomorAgenda, setNomorAgenda] = useState('') 
  const [tanggalSurat, setTanggalSurat] = useState('')
  const [keterangan, setKeterangan] = useState('') // Tambahan state keterangan agar sama dengan form tambah
  
  // Berubah dari File ke String untuk menampung URL Google Drive
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // --- STATE UNTUK SISTEM POP-UP ---
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal Konfirmasi
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) // Modal Berhasil

  // 1. AMBIL DATA LAMA LANGSUNG DARI SUPABASE
  useEffect(() => {
    async function getSurat() {
      try {
        setFetching(true)
        
        const { data, error } = await supabase
          .from('surat_keluar')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          setNomorSurat(data.nomor_surat || '')
          setTujuan(data.tujuan || '')
          setPengirim(data.pengirim || '')
          setPerihal(data.perihal || '')
          setNomorAgenda(data.nomor_agenda || '')
          setTanggalSurat(data.tanggal_surat || '')
          setFileUrl(data.file_url || '') 
          setKeterangan(data.keterangan || '') // Mengambil data keterangan lama
        }
      } catch (error: any) {
        alert('Gagal mengambil data dari Supabase: ' + error.message)
        router.back()
      } finally {
        setFetching(false)
      }
    }
    if (id) getSurat()
  }, [id, router])

  // Fungsi untuk memicu modal konfirmasi muncul
  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  // Fungsi untuk menutup modal sukses dan kembali ke halaman sebelumnya
  const closeSuccessAndGoBack = () => {
    setIsSuccessModalOpen(false)
    router.back()
    router.refresh()
  }

  // 2. FUNGSI UPDATE DATA KE SUPABASE
  async function handleSimpan() {
    setIsModalOpen(false) // Tutup modal konfirmasi
    setLoading(true)

    try {
      const { error } = await supabase
        .from('surat_keluar')
        .update({
          nomor_surat: nomorSurat,
          tujuan: tujuan,
          pengirim: pengirim,
          perihal: perihal,
          nomor_agenda: nomorAgenda,
          tanggal_surat: tanggalSurat,
          file_url: fileUrl, // Update link Google Drive
          keterangan: keterangan, // Update keterangan
        })
        .eq('id', id)

      if (error) throw error

      // Tampilkan Modal Berhasil (Menggantikan Alert)
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
      alert('Gagal memperbarui ke Cloud: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center font-black text-blue-600 bg-[#f0f7ff] text-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="tracking-widest uppercase">MEMUAT DATA DARI CLOUD...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black font-bold text-xs">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER - Ukuran dikompakkan agar hemat ruang di laptop */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-blue-600 gap-4">
          <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-3 rounded-xl text-xl shadow-md font-black shrink-0 text-center">
                📤
              </div>
              <div>
                 <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase leading-none text-black">
                   UBAH <span className="text-blue-600">SURAT KELUAR</span>
                 </h1>
                 <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">Perbarui Arsip Digital (Supabase Cloud)</p>
              </div>
          </div>
          <button 
            type="button"
            onClick={() => router.back()} 
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-blue-600 transition-all shrink-0"
          >
            KEMBALI
          </button>
        </div>

        {/* FORM CONTAINER - Spacing dan padding disesuaikan agar pas di resolusi laptop */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-xl shadow-sm p-5 md:p-8 border border-slate-200 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">NOMOR AGENDA</label>
              <input 
                type="text"
                required
                placeholder="MASUKKAN NOMOR AGENDA"
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
                value={nomorAgenda}
                onChange={(e) => setNomorAgenda(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TANGGAL SURAT (FISIK)</label>
              <input 
                type="date"
                required
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black uppercase"
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">NOMOR SURAT RESMI</label>
            <input 
              type="text"
              required
              placeholder="MASUKKAN NOMOR SURAT LENGKAP"
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TUJUAN SURAT</label>
              <input 
                type="text"
                required
                placeholder="NAMA INSTANSI TUJUAN"
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">PENGIRIM</label>
              <input 
                type="text"
                required
                placeholder="NAMA PENGIRIM ATAU BIDANG"
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
                value={pengirim}
                onChange={(e) => setPengirim(e.target.value)}
              />
            </div>
          </div>

          {/* PERIHAL MENGGUNAKAN INPUT BIASA */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">PERIHAL SURAT</label>
            <input 
              type="text"
              required
              placeholder="RINGKASAN PERIHAL SURAT"
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
            />
          </div>

          {/* KETERANGAN MENGGUNAKAN TEXTAREA */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">KETERANGAN TAMBAHAN</label>
            <textarea 
              placeholder="CATATAN ATAU KETERANGAN DETAIL MENGENAI SURAT"
              rows={3}
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all shadow-inner resize-none text-black"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE CONTROLLER */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-white text-center">LINK GOOGLE DRIVE BERKAS DIGITAL</label>
            <p className="text-blue-400 text-[8px] text-center mb-2.5 uppercase tracking-wider">Masukkan link baru jika ingin mengganti link sebelumnya</p>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              className="w-full p-2.5 bg-slate-800 border border-blue-600 rounded-lg outline-none text-[11px] font-bold text-blue-400 placeholder:text-slate-600 transition-all"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <p className="text-[8px] text-blue-300 text-center mt-2 uppercase tracking-wider">
              Akses link harus diatur ke "Siapa saja yang memiliki link"
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-3.5 px-4 rounded-lg text-xs transition-all disabled:bg-gray-400 uppercase tracking-wider active:scale-95"
          >
            {loading ? 'MEMPERBARUI DATA...' : 'SIMPAN PERUBAHAN'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- 1. MODAL KONFIRMASI (COMPACT SIZE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
            onClick={() => !loading && setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white animate-in zoom-in-95 duration-200 text-center text-black">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">?</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Perbarui Data?</h2>
            <p className="text-slate-500 font-medium mb-6 uppercase text-[9px] tracking-wider leading-normal text-center">
              Apakah Anda yakin ingin memperbarui data surat keluar ini? Pastikan seluruh informasi sudah benar.
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="bg-slate-100 text-slate-900 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleSimpan} 
                className="bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, PERBARUI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. MODAL BERHASIL (COMPACT SIZE) --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white text-center text-black animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl animate-bounce">✓</div>
            <h2 className="text-md font-black mb-2 uppercase tracking-tight text-black">BERHASIL!</h2>
            <p className="text-slate-500 font-medium mb-6 uppercase text-[9px] tracking-wider leading-normal text-center">
              Data surat keluar Anda telah sukses diperbarui di Cloud Supabase.
            </p>
            <button 
              type="button" 
              onClick={closeSuccessAndGoBack} 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-lg font-black uppercase tracking-wider transition-all active:scale-95"
            >
              OK, KEMBALI
            </button>
          </div>
        </div>
      )}
    </div>
  )
}