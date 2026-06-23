'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TambahSkKadin() {
  const router = useRouter()
  
  // STATE SESUAI STRUKTUR DATABASE
  const [nomerSk, setNomerSk] = useState('')
  const [tentangSk, setTentangSk] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [tanggalSk, setTanggalSk] = useState('')
  const [yangMembuatSk, setYangMembuatSk] = useState('')
  const [tanggalJadiSk, setTanggalJadiSk] = useState('')
  const [fileUrl, setFileUrl] = useState('') 
  const [fileMentahanUrl, setFileMentahanUrl] = useState('') 
  const [loading, setLoading] = useState(false)

  // --- STATE UNTUK MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false) 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) 

  const triggerConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setNomerSk('')
    setTentangSk('')
    setKeterangan('')
    setTanggalSk('')
    setYangMembuatSk('')
    setTanggalJadiSk('')
    setFileUrl('')
    setFileMentahanUrl('')
    setIsSuccessModalOpen(false)
  }

  async function handleSimpan() {
    setIsModalOpen(false) 
    setLoading(true)

    try {
      const { error } = await supabase
        .from('sk_kadin')
        .insert([
          {
            nomer_sk: nomerSk,
            tentang_sk: tentangSk,
            keterangan: keterangan,
            tanggal_sk: tanggalSk,
            yang_membuat_sk: yangMembuatSk,
            tanggal_jadi_sk: tanggalJadiSk,
            file_url: fileUrl || null, 
            file_mentahan_url: fileMentahanUrl || null,
            is_deleted: false
          }
        ])

      if (error) throw new Error(error.message)
      setIsSuccessModalOpen(true)
      
    } catch (error: any) {
      alert('Gagal menyimpan ke database: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black font-bold text-xs">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER COMPACT */}
        <div className="flex justify-between items-center mb-4 border-b-2 border-blue-600 pb-4 gap-4">
          <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white p-3 rounded-xl text-xl shadow-md font-black shrink-0">
                📜
              </div>
              <div>
                 <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-none text-black">
                   TAMBAH <span className="text-blue-600">SK KADIN</span>
                 </h1>
                 <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">E-Arsip Peningkatan Mutu</p>
              </div>
          </div>
          <Link href="/sk_kadin" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-blue-600 transition-all tracking-wider shrink-0">
            KEMBALI
          </Link>
        </div>

        {/* FORM COMPACT */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-slate-200 space-y-4">
          
          {/* BARIS TANGGAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TANGGAL SK</label>
              <input 
                type="date"
                required
                className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg outline-none text-xs font-bold transition-all text-black uppercase"
                value={tanggalSk}
                onChange={(e) => setTanggalSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TANGGAL JADI SK</label>
              <input 
                type="date"
                required
                className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg outline-none text-xs font-bold transition-all text-black uppercase"
                value={tanggalJadiSk}
                onChange={(e) => setTanggalJadiSk(e.target.value)}
              />
            </div>
          </div>

          {/* NOMOR SK */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">NOMOR SK KEPALA DINAS</label>
            <input 
              type="text"
              required
              placeholder="CONTOH: 800/123/412.11/2026"
              className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black uppercase"
              value={nomerSk}
              onChange={(e) => setNomerSk(e.target.value)}
            />
          </div>

          {/* YANG MEMBUAT SK */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">YANG MEMBUAT SK (NAMA/BIDANG)</label>
            <input 
              type="text"
              required
              placeholder="NAMA PETUGAS ATAU UNIT PEMBUAT"
              className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black uppercase"
              value={yangMembuatSk}
              onChange={(e) => setYangMembuatSk(e.target.value)}
            />
          </div>

          {/* TENTANG/PERIHAL (RINGKASAN) */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TENTANG / PERIHAL (RINGKASAN)</label>
            <input 
              type="text"
              required
              placeholder="RINGKASAN TENTANG SK"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-lg outline-none text-xs font-bold placeholder:text-slate-300 transition-all text-black uppercase"
              value={tentangSk}
              onChange={(e) => setTentangSk(e.target.value)}
            />
          </div>

          {/* KETERANGAN LENGKAP */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">KETERANGAN LENGKAP ARSIP</label>
            <textarea 
              required
              placeholder="MASUKKAN DETAIL KETERANGAN ARSIP SECARA LENGKAP"
              rows={4}
              className="w-full p-2.5 bg-blue-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all resize-none text-black uppercase"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE COMPACT */}
          <div className="bg-slate-900 p-4 md:p-6 rounded-xl shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FILE PDF UTAMA */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-2 text-blue-400 text-center">
                  LINK PDF FINAL (GOOGLE DRIVE)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-2 bg-slate-800 border border-blue-600/30 focus:border-blue-500 rounded-md outline-none text-[10px] font-bold text-white transition-all placeholder:text-slate-600"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>

              {/* FILE MENTAHAN / KONSEP */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-2 text-emerald-400 text-center">
                  LINK FILE KONSEP (DOCX/XLSX)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-2 bg-slate-800 border border-emerald-600/30 focus:border-emerald-500 rounded-md outline-none text-[10px] font-bold text-white transition-all placeholder:text-slate-600"
                  value={fileMentahanUrl}
                  onChange={(e) => setFileMentahanUrl(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[8px] text-slate-500 text-center uppercase tracking-wider leading-none">
              PASTIKAN AKSES LINK GOOGLE DRIVE SUDAH DIATUR KE "SIAPA SAJA YANG MEMILIKI LINK"
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-3 px-4 rounded-xl text-sm transition-all shadow-md disabled:bg-gray-400 uppercase tracking-widest active:scale-95"
          >
            {loading ? 'MEMPROSES...' : 'SIMPAN ARSIP SK KADIN'}
          </button>
        </form>

        <p className="text-center mt-6 text-black font-black uppercase tracking-widest text-[8px]">
          SISTEM E-ARSIP DINAS PENDIDIKAN — 2026
        </p>
      </div>

      {/* --- MODAL 1: KONFIRMASI COMPACT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">?</div>
              <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Simpan Data?</h2>
              <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal text-center">
                Periksa kembali Nomor SK dan Link Drive sebelum data masuk ke sistem database cloud.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)} className="bg-slate-100 py-2.5 rounded-lg font-black uppercase tracking-wider">BATAL</button>
                <button type="button" disabled={loading} onClick={handleSimpan} className="bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider shadow-md">YA, SIMPAN</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: BERHASIL COMPACT --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl animate-bounce">✓</div>
            <h2 className="text-base font-black mb-1 uppercase tracking-tight text-black">DATA DISECURE!</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal text-center">Arsip SK Kadin berhasil ditambahkan ke database.</p>
            <div className="flex flex-col gap-2 text-[11px]">
              <button onClick={resetForm} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider shadow-sm">TAMBAH DATA BARU</button>
              <button onClick={() => router.push('/sk_kadin')} className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-black uppercase tracking-wider">KE DAFTAR ARSIP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}