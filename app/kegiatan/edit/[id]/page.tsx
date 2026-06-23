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
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black font-bold text-xs">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER COMPACT */}
        <div className="flex justify-between items-center mb-4 border-b-2 border-blue-600 pb-4">
          <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-3 rounded-xl text-2xl shadow-md font-black">
                📅
              </div>
              <div>
                 <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-none text-black">
                    EDIT <span className="text-blue-600">KEGIATAN</span>
                 </h1>
                 <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">Perbarui Data Arsip Kegiatan (Supabase Cloud Synchronized)</p>
              </div>
          </div>
          <Link href="/kegiatan" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-blue-600 transition-all">
            BATAL
          </Link>
        </div>

        {/* FORM COMPACT */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-slate-200 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TANGGAL INPUT KEGIATAN</label>
              <input 
                type="date" 
                required 
                className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all shadow-inner text-black uppercase" 
                value={tglInput} 
                onChange={(e) => setTglInput(e.target.value)} 
              />
            </div>
            <div>
              {/* Spacer grid */}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">NAMA KEGIATAN</label>
            <input 
              type="text" 
              required 
              placeholder="CONTOH: RAPAT KOORDINASI PENINGKATAN MUTU" 
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all shadow-inner text-black uppercase" 
              value={namaKegiatan} 
              onChange={(e) => setNamaKegiatan(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">KETERANGAN KEGIATAN</label>
            <textarea 
              required 
              placeholder="DESKRIPSI LENGKAP MENGENAI KEGIATAN..." 
              rows={4} 
              className="w-full p-2.5 bg-blue-50/50 border border-slate-200 focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all shadow-inner resize-none text-black uppercase leading-relaxed" 
              value={keterangan} 
              onChange={(e) => setKeterangan(e.target.value)} 
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE COMPACT */}
          <div className="bg-slate-900 p-4 md:p-6 rounded-xl shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SURAT URL */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-2 text-blue-400 text-center">
                  LINK SURAT / NOTA (GOOGLE DRIVE)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-2.5 bg-slate-800 border border-blue-600/30 focus:border-blue-500 rounded-lg outline-none text-[11px] font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={suratUrl}
                  onChange={(e) => setSuratUrl(e.target.value)}
                />
              </div>

              {/* DOKUMENTASI URL */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-2 text-emerald-400 text-center">
                  LINK DOKUMENTASI (FOTO/VIDEO)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/drive/..."
                  className="w-full p-2.5 bg-slate-800 border border-emerald-600/30 focus:border-emerald-500 rounded-lg outline-none text-[11px] font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={dokumentasiUrl}
                  onChange={(e) => setDokumentasiUrl(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[8px] text-slate-500 text-center uppercase tracking-wider leading-none">
              PASTIKAN AKSES LINK GOOGLE DRIVE SUDAH DIATUR KE "SIAPA SAJA YANG MEMILIKI LINK"
            </p>
          </div>

          <button 
            type="submit" 
            disabled={updating} 
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-3 px-4 rounded-lg text-xs transition-all shadow-md disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {updating ? 'MEMPERBARUI DATA...' : 'SIMPAN PERUBAHAN KEGIATAN'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 font-bold uppercase tracking-widest text-[8px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- MODAL KONFIRMASI (SEBELUM UPDATE) COMPACT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !updating && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs text-center border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">?</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Perbarui Data?</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal text-black">
              Apakah Anda yakin ingin memperbarui data kegiatan ini? Data lama akan digantikan dengan input yang baru.
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button type="button" disabled={updating} onClick={() => setIsModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all text-black">Batal</button>
              <button type="button" disabled={updating} onClick={handleUpdate} className="bg-blue-600 hover:bg-slate-900 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all shadow-sm">
                {updating ? 'PROSES...' : 'YA, UPDATE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL BERHASIL COMPACT --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs text-center border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl animate-bounce">✓</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">BERHASIL DIPERBARUI!</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal text-black">
              Perubahan data kegiatan telah aman tersimpan di cloud database.
            </p>
            
            <div className="flex flex-col gap-2 text-[11px]">
              <button 
                onClick={() => router.push('/kegiatan')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all shadow-sm"
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