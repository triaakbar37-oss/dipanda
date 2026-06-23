'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
// Import konfigurasi supabase yang telah dibuat sebelumnya
import { supabase } from '@/lib/supabase' 

export default function EditSuratMasuk() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [nomorSurat, setNomorSurat] = useState('') // Menggunakan 'nomor' sesuai standar sistem
  const [asalInstansi, setAsalInstansi] = useState('')
  const [penerima, setPenerima] = useState('')
  const [perihal, setPerihal] = useState('')
  const [disposisi, setDisposisi] = useState('') // State untuk Dropdown
  const [keterangan, setKeterangan] = useState('') // State untuk Keterangan
  const [nomorAgenda, setNomorAgenda] = useState('') // Menggunakan 'nomor' sesuai standar sistem
  const [tanggalSurat, setTanggalSurat] = useState('')
  
  // Berubah menjadi String untuk menampung link Google Drive
  const [fileUrl, setFileUrl] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // --- STATE UNTUK SISTEM POP-UP ---
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal Konfirmasi
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) // Modal Berhasil

  // 1. AMBIL DATA LAMA LANGSUNG DARI SUPABASE SAAT HALAMAN DIMUAT
  useEffect(() => {
    async function getSurat() {
      try {
        setFetching(true)
        
        // Query langsung ke tabel 'surat_masuk' berdasarkan ID
        const { data, error } = await supabase
          .from('surat_masuk')
          .select('*')
          .eq('id', id)
          .single() // Mengambil satu baris data
        
        if (error) {
          throw error
        }

        if (data) {
          // Mapping data dengan fallback string kosong, menggunakan field 'nomor'
          setNomorSurat(data.nomor_surat || data.nomer_surat || '')
          setAsalInstansi(data.asal_instansi || '')
          setPenerima(data.penerima || '')
          setPerihal(data.perihal || '')
          setDisposisi(data.disposisi || '')
          setKeterangan(data.keterangan || '')
          setNomorAgenda(data.nomor_agenda || data.nomer_agenda || '')
          setTanggalSurat(data.tanggal_surat || '')
          setFileUrl(data.file_url || '')
        }
      } catch (error: any) {
        console.error("Supabase Fetch Error:", error)
        alert('Gagal mengambil data dari Cloud: ' + error.message)
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

  // Fungsi untuk menutup modal sukses dan navigasi
  const closeSuccessAndRedirect = () => {
    setIsSuccessModalOpen(false)
    router.push('/surat_masuk') 
    router.refresh()
  }

  // 2. FUNGSI UPDATE DATA KE SUPABASE
  async function handleSimpan() {
    setIsModalOpen(false) // Tutup modal konfirmasi
    setLoading(true)

    try {
      // PROSES UPDATE LANGSUNG KE SUPABASE
      // Field diupdate menggunakan struktur 'nomor'
      const { error } = await supabase
        .from('surat_masuk')
        .update({
          nomer_surat: nomorSurat,
          asal_instansi: asalInstansi,
          penerima: penerima,
          perihal: perihal,
          disposisi: disposisi,
          keterangan: keterangan,
          nomor_agenda: nomorAgenda,
          tanggal_surat: tanggalSurat,
          file_url: fileUrl, // Update link Google Drive
        })
        .eq('id', id)

      if (error) {
        throw error
      }

      // Tampilkan Modal Berhasil (Menggantikan Alert standar)
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
      console.error("Supabase Update Error:", error)
      alert('Gagal memperbarui ke Cloud: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f7ff] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      <p className="font-black text-blue-600 text-xs tracking-widest uppercase">Sinkronisasi Data Cloud...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black font-bold text-xs">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-blue-600 gap-4">
          <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-3 rounded-xl text-xl shadow-md font-black shrink-0 text-center">
                📩
              </div>
              <div>
                 <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase leading-none text-black">
                   UBAH <span className="text-blue-600">SURAT MASUK</span>
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

        {/* FORM CONTAINER */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-xl shadow-sm p-5 md:p-8 border border-slate-200 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">NOMOR AGENDA</label>
              <input 
                type="text"
                required
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
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">ASAL INSTANSI</label>
              <input 
                type="text"
                required
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
                value={asalInstansi}
                onChange={(e) => setAsalInstansi(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">PENERIMA (DI DINAS)</label>
              <input 
                type="text"
                required
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black"
                value={penerima}
                onChange={(e) => setPenerima(e.target.value)}
              />
            </div>
          </div>

          {/* DISPOSISI DROP DOWN */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-red-600">DISPOSISI KEPADA</label>
            <div className="relative">
              <select 
                className="w-full p-2.5 bg-red-50/50 border border-slate-200 focus:border-red-600 rounded-lg outline-none text-xs font-bold transition-all text-black appearance-none cursor-pointer pr-10"
                value={disposisi}
                onChange={(e) => setDisposisi(e.target.value)}
              >
                <option value="">-- PILIH DISPOSISI (OPSIONAL) --</option>
                <option value="ANANG BUDIANTARA, S.Pd.SD">ANANG BUDIANTARA, S.Pd.SD</option>
                <option value="Drs. MUH. RINDWAN">Drs. MUH. RINDWAN</option>
                <option value="LILIS SETYORINI">LILIS SETYORINI</option>
                <option value="KASBIJANTO, S.H">KASBIJANTO, S.H</option>
                <option value="NUNING FAJAR UTAMI">NUNING FAJAR UTAMI</option>
                <option value="MOCH. EKO PURNOMO, S.Pd">MOCH. EKO PURNOMO, S.Pd</option>
                <option value="RETNO WIDIYASRINI">RETNO WIDIYASRINI</option>
                <option value="ANDI DWI HENDRA, A.Md">ANDI DWI HENDRA, A.Md</option>
                <option value="SIGIT SUGIHARTO, S.T">SIGIT SUGIHARTO, S.T</option>
                <option value="NUR LAILI ROHMATIN, S.Kom">NUR LAILI ROHMATIN, S.Kom</option>
                <option value="MUH. MISBAH KUROHMAN, S.Pd">MUH. MISBAH KUROHMAN, S.Pd</option>
                <option value="MUH. FAJAR SATRIYA">MUH. FAJAR SATRIYA</option>
                <option value="APRINIA MIFTHAKHUL LAILIA,S.E">APRINIA MIFTHAKHUL LAILIA,S.E</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-red-600">
                ▼
              </div>
            </div>
          </div>

          {/* PERIHAL SURAT */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">PERIHAL SURAT</label>
            <input 
              type="text"
              required
              placeholder="JUDUL PERIHAL SURAT"
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
            />
          </div>

          {/* KETERANGAN TAMBAHAN */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-slate-600">KETERANGAN TAMBAHAN</label>
            <textarea 
              placeholder="CATATAN DETAIL ATAU KETERANGAN TAMBAHAN..."
              rows={3}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-slate-600 rounded-lg outline-none text-xs font-bold placeholder:text-slate-300 transition-all resize-none text-black"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-white text-center">LINK GOOGLE DRIVE BERKAS DIGITAL</label>
            <p className="text-blue-400 text-[8px] text-center mb-3 uppercase tracking-wider">Ubah link jika ingin mengganti akses berkas</p>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-blue-600 rounded-lg outline-none text-[11px] font-bold text-blue-400 placeholder:text-slate-600 transition-all"
            />
            {fileUrl && (
               <p className="text-white/40 text-[8px] mt-2 text-center uppercase tracking-wider">
                 Tautan berkas saat ini terdaftar di sistem cloud
               </p>
            )}
          </div>

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
            <h2 className="text-base font-black mb-2 uppercase tracking-tight">Perbarui Data?</h2>
            <p className="text-slate-500 font-medium mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Apakah Anda yakin ingin menyimpan perubahan pada arsip surat masuk ini?
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
                {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, SIMPAN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. MODAL BERHASIL (COMPACT SIZE) --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-sm border-2 border-white text-center text-black animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl animate-bounce">✓</div>
            <h2 className="text-md font-black mb-2 uppercase tracking-tight">BERHASIL!</h2>
            <p className="text-slate-500 font-medium mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Arsip digital surat masuk telah sukses diperbarui di Cloud Supabase.
            </p>
            <button 
              type="button" 
              onClick={closeSuccessAndRedirect} 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-lg font-black text-[11px] uppercase tracking-wider transition-all active:scale-95"
            >
              OK, KEMBALI
            </button>
          </div>
        </div>
      )}
    </div>
  )
}