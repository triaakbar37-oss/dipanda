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
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black font-bold text-xs">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER - Ukuran dikompakkan agar hemat ruang di laptop */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-blue-600 gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 text-white p-3 rounded-xl text-xl shadow-md font-black shrink-0">
               📩
             </div>
             <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase leading-none text-black">
                  TAMBAH <span className="text-blue-600">SURAT MASUK</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">Input Data Arsip Digital (Supabase Cloud)</p>
             </div>
          </div>
          <Link href="/surat_masuk" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-blue-600 transition-all shrink-0">
            KEMBALI
          </Link>
        </div>

        {/* FORM - Spacing dan padding disesuaikan agar pas tanpa scrolling berlebih */}
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
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">ASAL INSTANSI</label>
              <input 
                type="text"
                required
                placeholder="NAMA INSTANSI PENGIRIM"
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black"
                value={asalInstansi}
                onChange={(e) => setAsalInstansi(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">PENERIMA (DI DINAS)</label>
              <input 
                type="text"
                required
                placeholder="NAMA PENERIMA ATAU BIDANG"
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black"
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

          {/* PERIHAL (INPUT BIASA) */}
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

          {/* KETERANGAN (TEXTAREA) */}
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

          {/* LINK GOOGLE DRIVE CONTAINER */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <label className="block text-[10px] font-black uppercase tracking-wider mb-2 text-white text-center">
              LINK GOOGLE DRIVE BERKAS DIGITAL (PASTE URL)
            </label>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-blue-600 rounded-lg outline-none text-[11px] font-bold text-blue-400 placeholder:text-slate-600 transition-all"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-3.5 px-4 rounded-lg text-xs transition-all disabled:bg-gray-400 uppercase tracking-wider active:scale-95"
          >
            {loading ? 'MENYIMPAN DATA KE CLOUD...' : 'SIMPAN DATA SEKARANG'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- MODAL 1: KONFIRMASI (COMPACT SIZE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">?</div>
            <h2 className="text-base font-black mb-4 uppercase tracking-tight text-black">Simpan Data?</h2>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)} className="bg-slate-100 text-slate-900 py-2.5 rounded-lg font-black uppercase tracking-wider">Batal</button>
              <button type="button" disabled={loading} onClick={handleSimpan} className="bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider">YA, SIMPAN</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: NOTIFIKASI BERHASIL (COMPACT SIZE) --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-sm border-2 border-white text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl animate-bounce">✓</div>
            <h2 className="text-md font-black mb-6 uppercase tracking-tight text-black">DATA TERSINKRON!</h2>
            <div className="flex flex-col gap-2 text-[11px]">
              <button onClick={resetForm} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider">INPUT DATA LAGI</button>
              <button onClick={() => router.push('/surat_masuk')} className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-black uppercase tracking-wider">LIHAT DAFTAR ARSIP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}