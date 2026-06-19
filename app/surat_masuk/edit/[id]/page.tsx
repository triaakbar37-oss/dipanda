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
      <div className="animate-spin rounded-full h-20 w-20 border-t-8 border-blue-600 border-r-8 border-r-transparent"></div>
      <p className="font-black text-blue-600 tracking-widest uppercase">Sinkronisasi Data Cloud...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-4 border-blue-600 pb-8">
          <div className="flex items-center gap-6">
              <div className="bg-blue-600 text-white p-5 rounded-[1.5rem] text-3xl shadow-xl shadow-blue-200 font-black text-center min-w-[80px]">
                📩
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   UBAH <span className="text-blue-600">SURAT MASUK</span>
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

        {/* FORM CONTAINER - Menggunakan triggerConfirmModal saat submit */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR AGENDA</label>
              <input 
                type="text"
                required
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
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">ASAL INSTANSI</label>
              <input 
                type="text"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={asalInstansi}
                onChange={(e) => setAsalInstansi(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">PENERIMA (DI DINAS)</label>
              <input 
                type="text"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={penerima}
                onChange={(e) => setPenerima(e.target.value)}
              />
            </div>
          </div>

          {/* DISPOSISI DROP DOWN */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-red-600">DISPOSISI KEPADA</label>
            <select 
              className="w-full p-5 bg-red-50 border-4 border-transparent focus:border-red-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black appearance-none cursor-pointer"
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
          </div>

          {/* PERIHAL SURAT (INPUT BIASA) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">PERIHAL SURAT</label>
            <input 
              type="text"
              required
              placeholder="JUDUL PERIHAL SURAT"
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
            />
          </div>

          {/* KETERANGAN TAMBAHAN (TEXTAREA - LEBIH BANYAK KOLOM) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-slate-600">KETERANGAN TAMBAHAN</label>
            <textarea 
              placeholder="CATATAN DETAIL ATAU KETERANGAN TAMBAHAN..."
              rows={5}
              className="w-full p-5 bg-slate-50 border-4 border-transparent focus:border-slate-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-slate-300 transition-all shadow-inner resize-none text-black"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE */}
          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl">
            <label className="block text-sm font-black uppercase tracking-widest mb-2 text-white text-center">LINK GOOGLE DRIVE BERKAS DIGITAL</label>
            <p className="text-blue-400 text-[10px] text-center mb-4 uppercase">Ubah link jika ingin mengganti akses berkas</p>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full p-5 bg-slate-800 border-4 border-blue-600 rounded-[1.5rem] outline-none text-base font-bold text-blue-400 placeholder:text-slate-600 transition-all shadow-inner"
            />
            {fileUrl && (
               <p className="text-white/50 text-[10px] mt-4 text-center uppercase tracking-widest">
                 Tautan berkas saat ini terdaftar di sistem cloud
               </p>
            )}
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
              Apakah Anda yakin ingin menyimpan perubahan pada arsip surat masuk ini?
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
                {loading ? <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, SIMPAN'}
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
              Arsip digital surat masuk telah sukses diperbarui di Cloud Supabase.
            </p>
            <button 
              type="button" 
              onClick={closeSuccessAndRedirect} 
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