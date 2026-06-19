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
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-4 border-blue-600 pb-8">
          <div className="flex items-center gap-6">
              <div className="bg-slate-900 text-white p-5 rounded-[1.5rem] text-3xl shadow-xl shadow-blue-200 font-black">
                📜
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   TAMBAH <span className="text-blue-600">SK KADIN</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase">E-Arsip Peningkatan Mutu</p>
              </div>
          </div>
          <Link href="/sk_kadin" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase hover:bg-blue-600 transition-all">
            KEMBALI
          </Link>
        </div>

        {/* FORM */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-8">
          
          {/* BARIS TANGGAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL SK</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalSk}
                onChange={(e) => setTanggalSk(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL JADI SK</label>
              <input 
                type="date"
                required
                className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black"
                value={tanggalJadiSk}
                onChange={(e) => setTanggalJadiSk(e.target.value)}
              />
            </div>
          </div>

          {/* NOMOR SK */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR SK KEPALA DINAS</label>
            <input 
              type="text"
              required
              placeholder="CONTOH: 800/123/412.11/2026"
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black uppercase"
              value={nomerSk}
              onChange={(e) => setNomerSk(e.target.value)}
            />
          </div>

          {/* 1. YANG MEMBUAT SK (PINDAH KE ATAS) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">YANG MEMBUAT SK (NAMA/BIDANG)</label>
            <input 
              type="text"
              required
              placeholder="NAMA PETUGAS ATAU UNIT PEMBUAT"
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black uppercase"
              value={yangMembuatSk}
              onChange={(e) => setYangMembuatSk(e.target.value)}
            />
          </div>

          {/* 2. TENTANG/PERIHAL (RINGKASAN) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TENTANG / PERIHAL (RINGKASAN)</label>
            <input 
              type="text"
              required
              placeholder="RINGKASAN TENTANG SK"
              className="w-full p-4 bg-slate-50 border-4 border-transparent focus:border-blue-400 rounded-2xl outline-none text-sm font-bold placeholder:text-slate-200 transition-all shadow-inner text-black uppercase"
              value={tentangSk}
              onChange={(e) => setTentangSk(e.target.value)}
            />
          </div>

          {/* 3. KETERANGAN LENGKAP (PALING BAWAH & BESAR) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">KETERANGAN LENGKAP ARSIP</label>
            <textarea 
              required
              placeholder="MASUKKAN DETAIL KETERANGAN ARSIP SECARA LENGKAP"
              rows={6}
              className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner resize-none text-black"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* INPUT URL GOOGLE DRIVE */}
          <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FILE PDF UTAMA */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-blue-400 text-center">
                  LINK PDF FINAL (GOOGLE DRIVE)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-5 bg-slate-800 border-4 border-blue-600/30 focus:border-blue-500 rounded-[1.5rem] outline-none text-xs font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>

              {/* FILE MENTAHAN / KONSEP */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-emerald-400 text-center">
                  LINK FILE KONSEP (DOCX/XLSX)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-5 bg-slate-800 border-4 border-emerald-600/30 focus:border-emerald-500 rounded-[1.5rem] outline-none text-xs font-bold text-white transition-all shadow-inner placeholder:text-slate-600"
                  value={fileMentahanUrl}
                  onChange={(e) => setFileMentahanUrl(e.target.value)}
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
            {loading ? 'MEMPROSES...' : 'SIMPAN ARSIP SK KADIN'}
          </button>
        </form>

        <p className="text-center mt-10 text-black font-black uppercase tracking-[0.4em] text-[10px]">
          SISTEM E-ARSIP DINAS PENDIDIKAN — 2026
        </p>
      </div>

      {/* --- MODAL 1: KONFIRMASI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">?</div>
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none text-black">Simpan Data?</h2>
              <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed text-center">
                Periksa kembali Nomor SK dan Link Drive sebelum data masuk ke sistem database cloud.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)} className="bg-slate-100 py-6 rounded-[2rem] font-black uppercase tracking-widest">BATAL</button>
                <button type="button" disabled={loading} onClick={handleSimpan} className="bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200">YA, SIMPAN</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: BERHASIL --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-xl border-8 border-white animate-in zoom-in duration-300 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">✓</div>
            <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-black">DATA DISECURE!</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-xs tracking-[0.2em] leading-relaxed text-center">Arsip SK Kadin berhasil ditambahkan ke database.</p>
            <div className="flex flex-col gap-4">
              <button onClick={resetForm} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-blue-100">TAMBAH DATA BARU</button>
              <button onClick={() => router.push('/sk_kadin')} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest">KE DAFTAR ARSIP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}