'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// Import client supabase yang sudah dikonfigurasi
import { supabase } from '@/lib/supabase'

export default function TambahSkBupati() {
  const router = useRouter()
  
  // STATE SESUAI DATABASE MODEL SKBUPATI
  const [nomerSk, setNomerSk] = useState('')
  const [tentangSk, setTentangSk] = useState('')
  const [tanggalSk, setTanggalSk] = useState('')
  const [yangMembuatSk, setYangMembuatSk] = useState('')
  const [namaPengirim, setNamaPengirim] = useState('')
  const [tanggalPengirim, setTanggalPengirim] = useState('')
  const [tanggalKembali, setTanggalKembali] = useState('') 
  const [diterimaOleh, setDiterimaOleh] = useState('')
  
  // STATE URL Google Drive
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
    setNomerSk('')
    setTentangSk('')
    setTanggalSk('')
    setYangMembuatSk('')
    setNamaPengirim('')
    setTanggalPengirim('')
    setTanggalKembali('')
    setDiterimaOleh('')
    setFileUrl('')
    setIsSuccessModalOpen(false)
  }

  async function handleSimpan() {
    setIsModalOpen(false) // Tutup modal konfirmasi
    setLoading(true)

    try {
      // PROSES SIMPAN LANGSUNG KE SUPABASE
      const { data, error } = await supabase
        .from('sk_bupati') 
        .insert([
          {
            nomer_sk: nomerSk,
            tentang_sk: tentangSk,
            tanggal_sk: tanggalSk,
            yang_membuat_sk: yangMembuatSk,
            nama_pengirim: namaPengirim,
            tanggal_pengirim: tanggalPengirim,
            tanggal_kembali: tanggalKembali || null, 
            diterima_oleh: diterimaOleh,
            file_url: fileUrl, 
          },
        ])
        .select()

      if (error) {
        throw new Error(error.message)
      }

      // Membuka Modal Berhasil (Menggantikan Alert)
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
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
                SK
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   TAMBAH <span className="text-blue-600">SK BUPATI</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase text-blue-500/60">Input Data Arsip Digital (Cloud Supabase)</p>
              </div>
          </div>
          <Link href="/sk_bupati" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase hover:bg-blue-600 transition-all">
            KEMBALI
          </Link>
        </div>

        {/* FORM - Menggunakan triggerConfirmModal saat submit */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR SK BUPATI</label>
              <input 
                type="text"
                required
                placeholder="MASUKKAN NOMOR SK"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black"
                value={nomerSk}
                onChange={(e) => setNomerSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL SK (FISIK)</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalSk}
                onChange={(e) => setTanggalSk(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TENTANG SK (PERIHAL)</label>
            <textarea 
              required
              placeholder="URAIAN TENTANG KEPUTUSAN BUPATI"
              rows={3}
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner resize-none text-black"
              value={tentangSk}
              onChange={(e) => setTentangSk(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-4 border-slate-50 pt-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">YANG MEMBUAT SK</label>
              <input 
                type="text"
                required
                placeholder="NAMA BIDANG / BAGIAN"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black"
                value={yangMembuatSk}
                onChange={(e) => setYangMembuatSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NAMA PENGIRIM</label>
              <input 
                type="text"
                required
                placeholder="NAMA PETUGAS PENGIRIM"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black"
                value={namaPengirim}
                onChange={(e) => setNamaPengirim(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL PENGIRIMAN</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalPengirim}
                onChange={(e) => setTanggalPengirim(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600 italic">TANGGAL KEMBALI (OPSIONAL)</label>
              <input 
                type="date"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">DITERIMA OLEH</label>
              <input 
                type="text"
                required
                placeholder="NAMA PENERIMA"
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black"
                value={diterimaOleh}
                onChange={(e) => setDiterimaOleh(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl border-4 border-blue-600">
            <label className="block text-sm font-black uppercase tracking-widest mb-4 text-white text-center">
              LINK ARSIP DIGITAL (URL GOOGLE DRIVE)
            </label>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full p-5 bg-slate-800 border-4 border-transparent focus:border-blue-500 rounded-[1.5rem] outline-none text-base font-bold placeholder:text-slate-600 transition-all shadow-inner text-blue-400"
            />
            <p className="text-[10px] text-blue-300 text-center mt-3 uppercase tracking-widest">
              PASTIKAN LINK GOOGLE DRIVE SUDAH DI-SET "ANYONE WITH THE LINK" (PUBLIK)
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {loading ? 'MENYIMPAN KE CLOUD...' : 'SIMPAN DATA KE SUPABASE'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM KONEKSI CLOUD SUPABASE AKTIF — 2026
        </p>
      </div>

      {/* --- MODAL 1: KONFIRMASI (SEBELUM SIMPAN) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => !loading && setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">?</div>
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none text-black">Simpan Data?</h2>
              <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed text-center">
                Pastikan seluruh data SK Bupati dan tautan berkas sudah benar sebelum disimpan ke cloud database.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  disabled={loading}
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  disabled={loading}
                  onClick={handleSimpan}
                  className="bg-blue-600 hover:bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {loading ? 'PROSES...' : 'YA, SIMPAN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: NOTIFIKASI BERHASIL (DUA PILIHAN) --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-xl border-8 border-white animate-in zoom-in duration-300 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">✓</div>
            <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-black">BERHASIL DISIMPAN!</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-xs tracking-[0.2em] leading-relaxed text-center">
              Data SK Bupati telah aman tersimpan di cloud database. Apa yang ingin Anda lakukan selanjutnya?
            </p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={resetForm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
              >
                TAMBAH DATA LAGI
              </button>
              <button 
                onClick={() => router.push('/sk_bupati')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all"
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