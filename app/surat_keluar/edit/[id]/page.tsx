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
    <div className="min-h-screen flex items-center justify-center font-black text-blue-600 bg-[#f0f7ff]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="tracking-widest uppercase">MEMUAT DATA DARI CLOUD...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-4 border-blue-600 pb-8">
          <div className="flex items-center gap-6">
              <div className="bg-blue-600 text-white p-5 rounded-[1.5rem] text-3xl shadow-xl shadow-blue-200 font-black text-center min-w-[80px]">
                📤
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   UBAH <span className="text-blue-600">SURAT KELUAR</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase">Perbarui Arsip Digital (Supabase Cloud)</p>
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
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR AGENDA</label>
              <input 
                type="text"
                required
                placeholder="MASUKKAN NOMOR AGENDA"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={nomorAgenda}
                onChange={(e) => setNomorAgenda(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL SURAT (FISIK)</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR SURAT RESMI</label>
            <input 
              type="text"
              required
              placeholder="MASUKKAN NOMOR SURAT LENGKAP"
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TUJUAN SURAT</label>
              <input 
                type="text"
                required
                placeholder="NAMA INSTANSI TUJUAN"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">PENGIRIM</label>
              <input 
                type="text"
                required
                placeholder="NAMA PENGIRIM ATAU BIDANG"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={pengirim}
                onChange={(e) => setPengirim(e.target.value)}
              />
            </div>
          </div>

          {/* PERIHAL SEKARANG MENGGUNAKAN INPUT BIASA (POSISI DITUKAR SEPERTI FORM TAMBAH) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">PERIHAL SURAT</label>
            <input 
              type="text"
              required
              placeholder="RINGKASAN PERIHAL SURAT"
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
            />
          </div>

          {/* KETERANGAN SEKARANG MENGGUNAKAN TEXTAREA (POSISI DITUKAR SEPERTI FORM TAMBAH) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">KETERANGAN TAMBAHAN</label>
            <textarea 
              placeholder="CATATAN ATAU KETERANGAN DETAIL MENGENAI SURAT"
              rows={4}
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner resize-none text-black"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE */}
          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl">
            <label className="block text-sm font-black uppercase tracking-widest mb-2 text-white text-center">LINK GOOGLE DRIVE BERKAS DIGITAL</label>
            <p className="text-blue-400 text-[10px] text-center mb-4 uppercase tracking-widest">Masukkan link baru jika ingin mengganti link sebelumnya</p>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              className="w-full p-5 bg-slate-800 border-4 border-blue-600 rounded-[1.5rem] outline-none text-base font-bold text-blue-400 placeholder:text-slate-600 transition-all shadow-inner"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <p className="text-[10px] text-blue-300 text-center mt-3 uppercase tracking-widest">
              Akses link harus diatur ke "Siapa saja yang memiliki link"
            </p>
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
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => !loading && setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center text-black">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">?</div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Perbarui Data?</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
              Apakah Anda yakin ingin memperbarui data surat keluar ini? Pastikan seluruh informasi sudah benar.
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
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">BERHASIL!</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
              Data surat keluar Anda telah sukses diperbarui di Cloud Supabase.
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