'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// Import konfigurasi supabase yang telah Anda buat di folder lib
import { supabase } from '@/lib/supabase'

export default function TambahSuratKeluar() {
  const router = useRouter()
  
  const [nomerSurat, setNomerSurat] = useState('')
  const [tujuan, setTujuan] = useState('')
  const [pengirim, setPengirim] = useState('')
  const [perihal, setPerihal] = useState('')
  const [nomerAgenda, setNomerAgenda] = useState('') 
  const [tanggalSurat, setTanggalSurat] = useState('') 
  const [keterangan, setKeterangan] = useState('') // STATE BARU UNTUK KETERANGAN
  
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)

  // --- STATE UNTUK MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal Konfirmasi
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) // Modal Berhasil

  // Fungsi untuk memicu modal konfirmasi muncul
  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  // Fungsi untuk reset form jika user ingin menambah lagi
  const resetForm = () => {
    setNomerSurat('')
    setTujuan('')
    setPengirim('')
    setPerihal('')
    setNomerAgenda('')
    setTanggalSurat('')
    setFileUrl('')
    setKeterangan('')
    setIsSuccessModalOpen(false)
  }

  async function handleSimpan() {
    setIsModalOpen(false) // Tutup modal konfirmasi
    setLoading(true)

    try {
      // PROSES INSERT LANGSUNG KE SUPABASE CLOUD
      const { data, error } = await supabase
        .from('surat_keluar')
        .insert([
          {
            nomor_surat: nomerSurat,
            tujuan: tujuan,
            perihal: perihal,
            pengirim: pengirim,
            nomor_agenda: nomerAgenda, // Sesuai kolom di DB: nomor_agenda
            tanggal_surat: tanggalSurat,
            file_url: fileUrl,
            keterangan: keterangan, // Menyimpan data keterangan
            is_deleted: false, // Default status
          },
        ])
        .select()

      if (error) {
        throw error
      }

      // Membuka Modal Berhasil
      setIsSuccessModalOpen(true)
      router.refresh()
      
    } catch (error: any) {
      console.error("Supabase Error:", error)
      alert('Gagal menyimpan ke Cloud: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

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
                  TAMBAH <span className="text-blue-600">SURAT KELUAR</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">Input Data Arsip Digital (Supabase Cloud)</p>
             </div>
          </div>
          <Link href="/surat_keluar" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-blue-600 transition-all shrink-0">
            KEMBALI
          </Link>
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
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black"
                value={nomerAgenda}
                onChange={(e) => setNomerAgenda(e.target.value)}
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
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black"
              value={nomerSurat}
              onChange={(e) => setNomerSurat(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TUJUAN INSTANSI</label>
              <input 
                type="text"
                required
                placeholder="NAMA INSTANSI TUJUAN"
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black"
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">PENGIRIM (DARI DINAS)</label>
              <input 
                type="text"
                required
                placeholder="NAMA PENGIRIM ATAU BIDANG"
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black"
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
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black"
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
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all shadow-inner resize-none text-black"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* LINK GOOGLE DRIVE CONTROLLER */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <label className="block text-[10px] font-black uppercase tracking-wider mb-2 text-white text-center">
              LINK GOOGLE DRIVE BERKAS DIGITAL (OPSIONAL)
            </label>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              className="w-full p-2.5 bg-slate-800 border border-blue-600 rounded-lg outline-none text-[11px] font-bold text-blue-400 placeholder:text-slate-600 transition-all"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <p className="text-[8px] text-blue-300 text-center mt-2 uppercase tracking-wider">
              Pastikan akses link sudah diset "Siapa saja yang memiliki link"
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-3.5 px-4 rounded-lg text-xs transition-all disabled:bg-gray-400 uppercase tracking-wider active:scale-95"
          >
            {loading ? 'MENYIMPAN DATA...' : 'SIMPAN DATA SEKARANG'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- MODAL 1: KONFIRMASI (COMPACT SIZE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
            onClick={() => !loading && setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white animate-in zoom-in-95 duration-200 text-center text-black">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">?</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Simpan Data?</h2>
            <p className="text-slate-500 font-medium mb-6 uppercase text-[9px] tracking-wider leading-normal text-center">
              Pastikan seluruh data surat keluar dan tautan berkas sudah benar sebelum disimpan ke cloud database.
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button 
                type="button"
                disabled={loading}
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all"
              >
                Batal
              </button>
              <button 
                type="button"
                disabled={loading}
                onClick={handleSimpan}
                className="bg-blue-600 hover:bg-slate-900 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, SIMPAN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: NOTIFIKASI BERHASIL (COMPACT SIZE) --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-sm border-2 border-white text-center text-black animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl animate-bounce">✓</div>
            <h2 className="text-md font-black mb-2 uppercase tracking-tight text-black">BERHASIL DISIMPAN!</h2>
            <p className="text-slate-500 font-medium mb-6 uppercase text-[9px] tracking-wider leading-normal text-center">
              Data surat keluar telah aman tersimpan di cloud database. Apa yang ingin Anda lakukan selanjutnya?
            </p>
            
            <div className="flex flex-col gap-2 text-[11px]">
              <button 
                onClick={resetForm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all shadow-md"
              >
                TAMBAH DATA BARU
              </button>
              <button 
                onClick={() => router.push('/surat_keluar')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all"
              >
                KEMBALI KE DAFTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}