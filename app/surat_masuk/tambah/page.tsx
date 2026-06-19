'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// Import konfigurasi supabase yang telah dibuat sebelumnya
import { supabase } from '@/lib/supabase' 

export default function TambahSuratMasuk() {
  const router = useRouter()
  
  // State disesuaikan dengan skema tabel Supabase terbaru
  const [nomerAgenda, setNomerAgenda] = useState('') 
  const [tanggalSurat, setTanggalSurat] = useState('') 
  const [nomerSurat, setNomerSurat] = useState('')
  const [asalInstansi, setAsalInstansi] = useState('')
  const [penerima, setPenerima] = useState('')
  const [perihal, setPerihal] = useState('')
  const [disposisi, setDisposisi] = useState('') // State untuk Dropdown
  const [keterangan, setKeterangan] = useState('')
  // Link Berkas Utama (PDF/Drive)
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)

  // --- STATE UNTUK SISTEM POP-UP ---
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal Konfirmasi
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) // Modal Berhasil

  // Fungsi untuk memicu modal konfirmasi muncul saat form di-submit
  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  // Fungsi untuk reset form jika user ingin menambah data lagi
  const resetForm = () => {
    setNomerAgenda('')
    setTanggalSurat('')
    setNomerSurat('')
    setAsalInstansi('')
    setPenerima('')
    setPerihal('')
    setDisposisi('')
    setKeterangan('')
    setFileUrl('')
    setIsSuccessModalOpen(false)
  }

  async function handleSimpan() {
    setIsModalOpen(false) // Tutup modal konfirmasi
    setLoading(true)

    try {
      // PROSES SIMPAN KE SUPABASE 
      // Mapping field sesuai gambar {18E06B81-99BC-4B99-A72D-B9DB0F35CF82}.png
      const { data, error } = await supabase
        .from('surat_masuk')
        .insert([
          {
            nomor_agenda: nomerAgenda,
            tanggal_surat: tanggalSurat, 
            nomer_surat: nomerSurat,
            asal_instansi: asalInstansi,
            penerima: penerima,
            perihal: perihal,
            disposisi: disposisi,
            keterangan: keterangan,
            file_url: fileUrl, 
            is_deleted: false 
          }
        ])

      if (error) {
        throw error
      }

      // Membuka Modal Berhasil
      setIsSuccessModalOpen(true)
      router.refresh() 
      
    } catch (error: any) {
      console.error("Supabase Insert Error:", error)
      alert('Gagal menyimpan ke Cloud: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-4 border-blue-600 pb-8">
          <div className="flex items-center gap-6">
             <div className="bg-blue-600 text-white p-5 rounded-[1.5rem] text-3xl shadow-xl shadow-blue-200 font-black">
               📩
             </div>
             <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                  TAMBAH <span className="text-blue-600">SURAT MASUK</span>
                </h1>
                <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase">Input Data Arsip Digital (Supabase Cloud)</p>
             </div>
          </div>
          <Link href="/surat_masuk" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase hover:bg-blue-600 transition-all">
            KEMBALI
          </Link>
        </div>

        {/* FORM */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR AGENDA</label>
              <input 
                type="text"
                required
                placeholder="MASUKKAN NOMOR AGENDA"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black"
                value={nomerAgenda}
                onChange={(e) => setNomerAgenda(e.target.value)}
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
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black"
              value={nomerSurat}
              onChange={(e) => setNomerSurat(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">ASAL INSTANSI</label>
              <input 
                type="text"
                required
                placeholder="NAMA INSTANSI PENGIRIM"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black"
                value={asalInstansi}
                onChange={(e) => setAsalInstansi(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">PENERIMA (DI DINAS)</label>
              <input 
                type="text"
                required
                placeholder="NAMA PENERIMA ATAU BIDANG"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black"
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

          {/* PERIHAL (INPUT BIASA) */}
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

          {/* KETERANGAN (TEXTAREA - LEBIH BANYAK KOLOM) */}
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

          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl">
            <label className="block text-sm font-black uppercase tracking-widest mb-4 text-white text-center">
              LINK GOOGLE DRIVE BERKAS DIGITAL (PASTE URL)
            </label>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full p-5 bg-slate-800 border-4 border-blue-600 rounded-[1.5rem] outline-none text-base font-bold text-blue-400 placeholder:text-slate-600 transition-all shadow-inner"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {loading ? 'MENYIMPAN DATA KE CLOUD...' : 'SIMPAN DATA SEKARANG'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- MODAL 1: KONFIRMASI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300 text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">?</div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none text-black">Simpan Data?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)} className="bg-slate-100 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest">Batal</button>
              <button type="button" disabled={loading} onClick={handleSimpan} className="bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest">YA, SIMPAN</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: NOTIFIKASI BERHASIL --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-xl border-8 border-white text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce flex items-center justify-center">✓</div>
            <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter text-black">DATA TERSINKRON!</h2>
            <div className="flex flex-col gap-4">
              <button onClick={resetForm} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest">INPUT DATA LAGI</button>
              <button onClick={() => router.push('/surat_masuk')} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest">LIHAT DAFTAR ARSIP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}