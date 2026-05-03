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
  const [pengirim, setPengirim] = useState('')
  const [perihal, setPerihal] = useState('')
  const [yangMembuat, setYangMembuat] = useState('') 
  const [penerima, setPenerima] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)

  // --- STATE UNTUK MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  // Fungsi untuk mengosongkan form jika user ingin menambah lagi
  const resetForm = () => {
    setNomerSurat('')
    setTanggalFisik('')
    setTanggalDikirim('')
    setPengirim('')
    setPerihal('')
    setYangMembuat('')
    setPenerima('')
    setFileUrl('')
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
            pengirim: pengirim,
            penerima: penerima, 
            perihal: perihal,
            yang_membuat: yangMembuat,
            file_url: fileUrl, 
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
                NOTE
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-black">
                   TAMBAH <span className="text-blue-600">NOTA DINAS</span>
                 </h1>
                 <p className="text-black font-black tracking-[0.3em] text-xs mt-2 uppercase">Input Data Arsip (Supabase Cloud Synchronized)</p>
              </div>
          </div>
          <Link href="/nota_dinas" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase hover:bg-blue-600 transition-all">
            KEMBALI
          </Link>
        </div>

        {/* FORM */}
        <form onSubmit={triggerConfirmModal} className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] p-10 md:p-16 border-8 border-white space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL FISIK SURAT</label>
              <input type="date" required className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black" value={tanggalFisik} onChange={(e) => setTanggalFisik(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">TANGGAL DIKIRIM</label>
              <input type="date" required className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black transition-all shadow-inner text-black" value={tanggalDikirim} onChange={(e) => setTanggalDikirim(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">NOMOR NOTA DINAS</label>
            <input type="text" required placeholder="CONTOH: 800/001/BKPSDM/2026" className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black" value={nomerSurat} onChange={(e) => setNomerSurat(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">PENERIMA KEMBALI NOTA DINAS <span className="text-slate-400 font-medium normal-case text-[10px]">(OPSIONAL)</span></label>
            <input type="text" placeholder="NAMA PENERIMA / TUJUAN NOTA" className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black" value={penerima} onChange={(e) => setPenerima(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">PENGIRIM (INSTANSI/BIDANG)</label>
              <input type="text" required placeholder="NAMA PENGIRIM NOTA" className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black" value={pengirim} onChange={(e) => setPengirim(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">YANG MEMBUAT NOTA</label>
              <input type="text" required placeholder="NAMA PETUGAS/PEMBUAT" className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner text-black" value={yangMembuat} onChange={(e) => setYangMembuat(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest mb-3 text-blue-600">PERIHAL NOTA DINAS</label>
            <textarea required placeholder="RINGKASAN PERIHAL NOTA" rows={3} className="w-full p-5 bg-blue-50 border-4 border-transparent focus:border-blue-600 rounded-[1.5rem] outline-none text-lg font-black placeholder:text-blue-200 transition-all shadow-inner resize-none text-black" value={perihal} onChange={(e) => setPerihal(e.target.value)} />
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl">
            <label className="block text-sm font-black uppercase tracking-widest mb-4 text-white text-center">TAUTAN BERKAS DIGITAL (GOOGLE DRIVE)</label>
            <input type="url" placeholder="https://drive.google.com/file/d/..." className="w-full p-5 bg-slate-800 border-4 border-slate-700 focus:border-blue-600 rounded-[1.5rem] outline-none text-base font-bold text-white placeholder:text-slate-500 transition-all shadow-inner" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-8 px-4 rounded-[2rem] text-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:bg-gray-400 uppercase tracking-widest active:scale-95">
            {loading ? 'MENYIMPAN KE CLOUD...' : 'SIMPAN NOTA DINAS SEKARANG'}
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
                Pastikan seluruh data nota dinas dan tautan berkas sudah benar sebelum disimpan ke cloud database.
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

      {/* --- MODAL BERHASIL (DENGAN 2 PILIHAN) --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-xl border-8 border-white animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">✓</div>
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-black">BERHASIL DISIMPAN!</h2>
              <p className="text-slate-500 font-bold mb-10 uppercase text-xs tracking-[0.2em] leading-relaxed">
                Data nota dinas telah aman tersimpan di cloud database. Apa yang ingin Anda lakukan selanjutnya?
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={resetForm}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
                >
                  TAMBAH DATA LAGI
                </button>
                <button 
                  onClick={() => router.push('/nota_dinas')}
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