'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TambahKegiatan() {
  const router = useRouter()
  
  // STATE FORM SESUAI STRUKTUR DATABASE BARU
  const [tglInput, setTglInput] = useState('')
  const [namaKegiatan, setNamaKegiatan] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [suratUrl, setSuratUrl] = useState('')
  const [dokumentasiUrl, setDokumentasiUrl] = useState('')
  
  const [loading, setLoading] = useState(false)

  // --- STATE UNTUK MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  // Fungsi untuk mengosongkan form jika user ingin menambah lagi
  const resetForm = () => {
    setTglInput('')
    setNamaKegiatan('')
    setKeterangan('')
    setSuratUrl('')
    setDokumentasiUrl('')
    setIsSuccessModalOpen(false)
  }

  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  async function handleSimpan() {
    setIsModalOpen(false)
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .insert([
          {
            tgl_input: tglInput,
            nama_kegiatan: namaKegiatan,
            keterangan: keterangan,
            surat_url: suratUrl, 
            dokumentasi_url: dokumentasiUrl,
            is_deleted: false
          },
        ])
        .select()

      if (error) throw error
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
      console.error('Supabase Error:', error)
      alert('Gagal menyimpan: ' + error.message)
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
                📅
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                    TAMBAH <span className="text-blue-600">KEGIATAN</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase">Input Data Arsip Kegiatan (Supabase Cloud Synchronized)</p>
              </div>
          </div>
          <Link href="/kegiatan" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase hover:bg-blue-600 transition-all">
            KEMBALI
          </Link>
        </div>

        {/* FORM */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL INPUT KEGIATAN</label>
              <input 
                type="date" 
                required 
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black" 
                value={tglInput} 
                onChange={(e) => setTglInput(e.target.value)} 
              />
            </div>
            <div>
              {/* Kolom kosong untuk menjaga keseimbangan grid seperti desain sebelumnya */}
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NAMA KEGIATAN</label>
            <input 
              type="text" 
              required 
              placeholder="CONTOH: RAPAT KOORDINASI PENINGKATAN MUTU" 
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black" 
              value={namaKegiatan} 
              onChange={(e) => setNamaKegiatan(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">KETERANGAN KEGIATAN</label>
            <textarea 
              required 
              placeholder="DESKRIPSI LENGKAP MENGENAI KEGIATAN..." 
              rows={6} 
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner resize-none text-black" 
              value={keterangan} 
              onChange={(e) => setKeterangan(e.target.value)} 
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE (SURAT & DOKUMENTASI) */}
          <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* SURAT URL */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-blue-400 text-center">
                  LINK SURAT / NOTA (GOOGLE DRIVE)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-5 bg-slate-800 border-4 border-blue-600/30 focus:border-blue-500 rounded-[1.5rem] outline-none text-xs font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={suratUrl}
                  onChange={(e) => setSuratUrl(e.target.value)}
                />
              </div>

              {/* DOKUMENTASI URL */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-emerald-400 text-center">
                  LINK DOKUMENTASI (FOTO/VIDEO)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/drive/..."
                  className="w-full p-5 bg-slate-800 border-4 border-emerald-600/30 focus:border-emerald-500 rounded-[1.5rem] outline-none text-xs font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={dokumentasiUrl}
                  onChange={(e) => setDokumentasiUrl(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[9px] text-slate-500 text-center uppercase tracking-[0.3em]">
              PASTIKAN AKSES LINK GOOGLE DRIVE SUDAH DIATUR KE "SIAPA SAJA YANG MEMILIKI LINK"
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {loading ? 'MENYIMPAN KE CLOUD...' : 'SIMPAN DATA KEGIATAN SEKARANG'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- MODAL KONFIRMASI (SEBELUM SIMPAN) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">?</div>
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none text-black">Simpan Data?</h2>
              <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
                Pastikan seluruh data kegiatan dan tautan berkas sudah benar sebelum disimpan ke cloud database.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all">Batal</button>
                <button type="button" disabled={loading} onClick={handleSimpan} className="bg-blue-600 hover:bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-200">
                  {loading ? 'PROSES...' : 'YA, SIMPAN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL BERHASIL --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-xl border-8 border-white animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">✓</div>
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-black">BERHASIL DISIMPAN!</h2>
              <p className="text-slate-500 font-bold mb-10 uppercase text-xs tracking-[0.2em] leading-relaxed">
                Data kegiatan telah aman tersimpan di cloud database. Apa yang ingin Anda lakukan selanjutnya?
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={resetForm}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
                >
                  TAMBAH DATA LAGI
                </button>
                <button 
                  onClick={() => router.push('/kegiatan')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all"
                >
                  KEMBALI KE DAFTAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}