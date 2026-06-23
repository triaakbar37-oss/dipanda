'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TambahNotaDinas() {
  const router = useRouter()
  
  // STATE FORM
  const [nomerSurat, setNomerSurat] = useState('')
  const [tanggalFisik, setTanggalFisik] = useState('') 
  const [tanggalDikirim, setTanggalDikirim] = useState('') 
  const [perihal, setPerihal] = useState('')
  const [yangMembuat, setYangMembuat] = useState('') 
  const [fileUrl, setFileUrl] = useState('')
  // --- STATE TAMBAHAN SESUAI DATABASE BARU ---
  const [keterangan, setKeterangan] = useState('')
  const [fileMentahanUrl, setFileMentahanUrl] = useState('')
  
  const [loading, setLoading] = useState(false)

  // --- STATE UNTUK MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  // Fungsi untuk mengosongkan form jika user ingin menambah lagi
  const resetForm = () => {
    setNomerSurat('')
    setTanggalFisik('')
    setTanggalDikirim('')
    setPerihal('')
    setYangMembuat('')
    setFileUrl('')
    setKeterangan('')
    setFileMentahanUrl('')
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
        .from('nota_dinas')
        .insert([
          {
            nomer_surat: nomerSurat,
            tanggal_fisik: tanggalFisik,
            tanggal_dikirim: tanggalDikirim,
            // PENGIRIM DAN PENERIMA DIHAPUS SESUAI INSTRUKSI
            perihal: perihal,
            yang_membuat: yangMembuat,
            file_url: fileUrl, 
            // PENYESUAIAN KOLOM BARU
            keterangan: keterangan,
            file_mentahan_url: fileMentahanUrl,
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
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black font-bold text-xs">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER COMPACT */}
        <div className="flex justify-between items-center mb-4 border-b-2 border-blue-600 pb-4 w-full gap-4">
          <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-3 rounded-xl text-xl shadow-md font-black shrink-0">
                📝
              </div>
              <div>
                 <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-none text-black">
                   TAMBAH <span className="text-blue-600">NOTA DINAS</span>
                 </h1>
                 <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">Input Data Arsip (Supabase Cloud Synchronized)</p>
              </div>
          </div>
          <Link href="/nota_dinas" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-blue-600 transition-all whitespace-nowrap">
            KEMBALI
          </Link>
        </div>

        {/* FORM COMPACT */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-xl shadow-sm p-5 sm:p-8 border border-slate-200 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TANGGAL FISIK SURAT</label>
              <input type="date" required className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black" value={tanggalFisik} onChange={(e) => setTanggalFisik(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">TANGGAL DIKIRIM</label>
              <input type="date" required className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold transition-all text-black" value={tanggalDikirim} onChange={(e) => setTanggalDikirim(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">NOMOR NOTA DINAS</label>
            <input type="text" required placeholder="CONTOH: 800/001/BKPSDM/2026" className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black uppercase" value={nomerSurat} onChange={(e) => setNomerSurat(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">YANG MEMBUAT NOTA</label>
            <input type="text" required placeholder="NAMA PETUGAS/PEMBUAT" className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all text-black uppercase" value={yangMembuat} onChange={(e) => setYangMembuat(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">PERIHAL NOTA DINAS</label>
            <textarea required placeholder="RINGKASAN PERIHAL NOTA" rows={2} className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all resize-none text-black uppercase leading-normal" value={perihal} onChange={(e) => setPerihal(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-blue-600">KETERANGAN TAMBAHAN <span className="text-slate-400 font-medium normal-case text-[9px]">(ASPEK DETAIL)</span></label>
            <textarea placeholder="TAMBAHKAN DETAIL KETERANGAN SECARA LENGKAP DI SINI..." rows={4} className="w-full p-2.5 bg-blue-50 border border-transparent focus:border-blue-600 rounded-lg outline-none text-xs font-bold placeholder:text-blue-200 transition-all resize-none text-black uppercase leading-normal" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </div>

          {/* INPUT URL GOOGLE DRIVE COMPACT */}
          <div className="bg-slate-900 p-4 sm:p-6 rounded-xl shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FILE PDF UTAMA */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-2 text-blue-400 text-center">
                  LINK PDF FINAL (GOOGLE DRIVE)
                </label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  className="w-full p-2.5 bg-slate-800 border border-blue-600/30 focus:border-blue-500 rounded-lg outline-none text-[11px] font-bold text-white transition-all placeholder:text-slate-600"
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
                  className="w-full p-2.5 bg-slate-800 border border-emerald-600/30 focus:border-emerald-500 rounded-lg outline-none text-[11px] font-bold text-white transition-all placeholder:text-slate-600"
                  value={fileMentahanUrl}
                  onChange={(e) => setFileMentahanUrl(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[8px] text-slate-500 text-center uppercase tracking-wider">
              PASTIKAN AKSES LINK GOOGLE DRIVE SUDAH DIATUR KE "SIAPA SAJA YANG MEMILIKI LINK"
            </p>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-3 px-4 rounded-xl text-sm transition-all shadow-md disabled:bg-gray-400 uppercase tracking-wider">
            {loading ? 'MENYIMPAN KE CLOUD...' : 'SIMPAN NOTA DINAS SEKARANG'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 font-bold uppercase tracking-widest text-[8px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>

      {/* --- MODAL KONFIRMASI (SEBELUM SIMPAN) COMPACT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !loading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs text-center border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">?</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Simpan Data?</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Pastikan seluruh data nota dinas dan tautan berkas sudah benar sebelum disimpan ke cloud database.
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)} className="bg-slate-100 py-2.5 rounded-lg font-black uppercase tracking-wider text-black">Batal</button>
              <button type="button" disabled={loading} onClick={handleSimpan} className="bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all shadow-md">
                {loading ? 'PROSES...' : 'YA, SIMPAN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL BERHASIL COMPACT --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs text-center border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">✓</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">BERHASIL DISIMPAN!</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Data nota dinas telah aman tersimpan di cloud database. Apa yang ingin Anda lakukan selanjutnya?
            </p>
            
            <div className="flex flex-col gap-2 text-[11px]">
              <button 
                type="button"
                onClick={resetForm}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all shadow-sm"
              >
                TAMBAH DATA LAGI
              </button>
              <button 
                type="button"
                onClick={() => router.push('/nota_dinas')}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all"
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