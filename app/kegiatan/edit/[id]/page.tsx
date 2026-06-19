'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EditKegiatan() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  // STATE FORM SESUAI STRUKTUR DATABASE
  const [tglInput, setTglInput] = useState('')
  const [namaKegiatan, setNamaKegiatan] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [suratUrl, setSuratUrl] = useState('')
  const [dokumentasiUrl, setDokumentasiUrl] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // --- STATE UNTUK MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  // FETCH DATA LAMA BERDASARKAN ID
  useEffect(() => {
    async function getKegiatan() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('kegiatan')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          setTglInput(data.tgl_input ? data.tgl_input.substring(0, 10) : '')
          setNamaKegiatan(data.nama_kegiatan || '')
          setKeterangan(data.keterangan || '')
          setSuratUrl(data.surat_url || '')
          setDokumentasiUrl(data.dokumentasi_url || '')
        }
      } catch (error: any) {
        console.error('Error fetching data:', error.message)
        alert('Gagal mengambil data kegiatan')
        router.push('/kegiatan')
      } finally {
        setLoading(false)
      }
    }

    if (id) getKegiatan()
  }, [id, router])

  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  async function handleUpdate() {
    setIsModalOpen(false)
    setUpdating(true)

    try {
      const { error } = await supabase
        .from('kegiatan')
        .update({
          tgl_input: tglInput,
          nama_kegiatan: namaKegiatan,
          keterangan: keterangan,
          surat_url: suratUrl,
          dokumentasi_url: dokumentasiUrl,
        })
        .eq('id', id)

      if (error) throw error
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
      console.error('Update Error:', error)
      alert('Gagal memperbarui data: ' + error.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f7ff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-8 border-blue-600"></div>
      </div>
    )
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
                    EDIT <span className="text-blue-600">KEGIATAN</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase text-black">Perbarui Data Arsip Kegiatan (Supabase Cloud Synchronized)</p>
              </div>
          </div>
          <Link href="/kegiatan" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase hover:bg-blue-600 transition-all">
            BATAL
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
              {/* Spacer grid */}
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

          {/* INPUT URL GOOGLE DRIVE */}
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
            disabled={updating} 
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {updating ? 'MEMPERBARUI DATA...' : 'SIMPAN PERUBAHAN KEGIATAN'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- MODAL KONFIRMASI (SEBELUM UPDATE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !updating && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">?</div>
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none text-black">Perbarui Data?</h2>
              <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed text-black">
                Apakah Anda yakin ingin memperbarui data kegiatan ini? Data lama akan digantikan dengan input yang baru.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" disabled={updating} onClick={() => setIsModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all">Batal</button>
                <button type="button" disabled={updating} onClick={handleUpdate} className="bg-blue-600 hover:bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-200">
                  {updating ? 'PROSES...' : 'YA, UPDATE'}
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
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-black">BERHASIL DIPERBARUI!</h2>
              <p className="text-slate-500 font-bold mb-10 uppercase text-xs tracking-[0.2em] leading-relaxed text-black">
                Perubahan data kegiatan telah aman tersimpan di cloud database.
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => router.push('/kegiatan')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
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