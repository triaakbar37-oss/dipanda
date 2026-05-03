'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
// Import konfigurasi supabase yang telah Anda buat di folder lib
import { supabase } from '@/lib/supabase'

export default function DaftarSuratKeluar() {
  const [surat, setSurat] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('') // STATE UNTUK PENCARIAN TEKS
  
  // --- STATE UNTUK PENCARIAN TANGGAL ---
  const [startDate, setStartDate] = useState('') 
  const [endDate, setEndDate] = useState('')
  const [startTanggalFisik, setStartTanggalFisik] = useState('') 
  const [endTanggalFisik, setEndTanggalFisik] = useState('')     
  const [showFilters, setShowFilters] = useState(false)          

  // --- STATE MODAL HAPUS (POP-UP) ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 1. FUNGSI AMBIL DATA LANGSUNG DARI SUPABASE
  async function fetchSurat() {
    try {
      setLoading(true)
      
      // Query ke tabel 'surat_keluar' dengan filter is_deleted = false
      const { data, error } = await supabase
        .from('surat_keluar')
        .select('*')
        .eq('is_deleted', false) // Sesuai protokol Soft Delete
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setSurat(data || [])
    } catch (error: any) {
      console.error("Supabase Fetch Error:", error)
      alert('Gagal mengambil data dari Cloud: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // --- LOGIKA FILTER PENCARIAN (CLIENT-SIDE SEARCH) ---
  const filteredSurat = surat.filter((item) => {
    const searchLow = searchTerm.toLowerCase()
    const matchText = (
      (item.nomor_surat?.toLowerCase().includes(searchLow)) ||
      (item.tujuan?.toLowerCase().includes(searchLow)) ||
      (item.pengirim?.toLowerCase().includes(searchLow)) ||
      (item.perihal?.toLowerCase().includes(searchLow)) ||
      (item.nomor_agenda?.toString().toLowerCase().includes(searchLow)) // PENYESUAIAN: Menggunakan nomor_agenda
    )

    // Logika Filter Tanggal Input
    const itemDateInput = item.created_at ? item.created_at.substring(0, 10) : ''
    let matchDateInput = true
    if (startDate && endDate) {
      matchDateInput = itemDateInput >= startDate && itemDateInput <= endDate
    } else if (startDate) {
      matchDateInput = itemDateInput >= startDate
    } else if (endDate) {
      matchDateInput = itemDateInput <= endDate
    }

    // Logika Filter Tanggal Fisik
    const itemDateFisik = item.tanggal_surat ? item.tanggal_surat.substring(0, 10) : ''
    let matchDateFisik = true
    if (startTanggalFisik && endTanggalFisik) {
      matchDateFisik = itemDateFisik >= startTanggalFisik && itemDateFisik <= endTanggalFisik
    } else if (startTanggalFisik) {
      matchDateFisik = itemDateFisik >= startTanggalFisik
    } else if (endTanggalFisik) {
      matchDateFisik = itemDateFisik <= endTanggalFisik
    }

    return matchText && matchDateInput && matchDateFisik
  })

  // LOGIKA PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredSurat.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredSurat.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, startDate, endDate, startTanggalFisik, endTanggalFisik])

  // --- FUNGSI MODAL & DELETE ---
  const triggerDeleteModal = (id: number) => {
    setSelectedId(id)
    setShowDeleteModal(true)
  }

  async function confirmSoftDelete() {
    if (!selectedId) return

    try {
      setIsDeleting(true)
      // Mengubah status is_deleted menjadi true (Soft Delete)
      const { error } = await supabase
        .from('surat_keluar')
        .update({ is_deleted: true })
        .eq('id', selectedId)

      if (error) throw error
      
      setShowDeleteModal(false)
      setSelectedId(null)
      fetchSurat() // Refresh data
    } catch (error: any) {
      alert("Gagal menghapus: " + error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: any) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return "-";
    }
  }

  useEffect(() => {
    fetchSurat()
  }, [])

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black w-full font-bold">
      <div className="w-full mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-4 border-blue-600 pb-8 gap-6">
          <div className="flex items-center gap-6">
             <div className="bg-slate-900 text-white p-6 rounded-[2rem] text-5xl shadow-2xl shadow-blue-300 font-black">
               📤
             </div>
             <div>
                <h1 className="text-7xl font-black tracking-tighter uppercase leading-none text-black">
                  SURAT <span className="text-blue-600">KELUAR</span>
                </h1>
                <p className="text-black font-black tracking-[0.4em] text-sm mt-2 uppercase">ARSIP SURAT KELUAR CLOUD DATABASE</p>
             </div>
          </div>
          <Link 
            href="/surat_keluar/tambah"
            className="bg-blue-600 hover:bg-slate-900 text-white px-12 py-7 rounded-[2.5rem] font-black shadow-2xl shadow-blue-200 transition-all active:scale-95 uppercase tracking-widest text-lg"
          >
            TAMBAH SURAT BARU
          </Link>
        </div>

        {/* SEARCH & FILTER */}
        <div className="mb-10 w-full flex flex-col gap-6">
          <div className="flex flex-row items-center gap-6">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="CARI DATA SK (NOMOR, TENTANG, PEMBUAT, ATAU TANGGAL)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-4 border-white shadow-2xl rounded-[2.5rem] px-10 py-8 text-xl font-black focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-widest"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 bg-red-100 text-red-600 px-6 py-3 rounded-2xl hover:bg-red-600 hover:text-white transition-all font-black uppercase text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-blue-600'} border-4 border-white shadow-2xl rounded-[2.5rem] px-12 py-8 text-sm font-black transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter`}
            >
              {showFilters ? 'TUTUP FILTER ▲' : 'FILTER TANGGAL ▼'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-blue-50">
                  <h3 className="text-blue-600 font-black uppercase text-sm mb-4 tracking-widest flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded-full"></span> RENTANG TANGGAL Input
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <input 
                       type="date"
                       value={startDate}
                       onChange={(e) => setStartDate(e.target.value)}
                       className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                     />
                     <input 
                       type="date"
                       value={endDate}
                       onChange={(e) => setEndDate(e.target.value)}
                       className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                     />
                  </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-slate-50">
                  <h3 className="text-slate-500 font-black uppercase text-sm mb-4 tracking-widest flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span> RENTANG TANGGAL FISIK
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <input 
                       type="date"
                       value={startTanggalFisik}
                       onChange={(e) => setStartTanggalFisik(e.target.value)}
                       className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase"
                     />
                     <input 
                       type="date"
                       value={endTanggalFisik}
                       onChange={(e) => setEndTanggalFisik(e.target.value)}
                       className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase"
                     />
                  </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-20 w-20 border-t-8 border-blue-600"></div>
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] overflow-hidden border-8 border-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="px-6 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 text-center w-20">NO</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 text-center">TGL INPUT</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 text-center">TGL FISIK</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700">IDENTITAS SURAT</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700">TUJUAN</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700">PENGIRIM</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700">PERIHAL</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-20 text-slate-300 font-black uppercase tracking-widest italic text-2xl">
                          DATA TIDAK DITEMUKAN
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-blue-50/80 transition-all group">
                          <td className="px-6 py-12 text-center border-r border-slate-100 font-black text-xl text-slate-400">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="px-8 py-12 text-center border-r border-slate-100">
                            <div className="bg-slate-100 text-black p-4 rounded-2xl font-black text-base shadow-inner">
                              {formatDate(item.created_at)}
                            </div>
                          </td>
                          <td className="px-8 py-12 text-center border-r border-slate-100">
                            <div className="bg-blue-50 text-black p-4 rounded-2xl font-black text-base">
                              {formatDate(item.tanggal_surat)}
                            </div>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <p className="font-black text-black text-2xl tracking-tighter uppercase mb-2">{item.nomor_surat || 'TANPA NOMOR'}</p>
                            <p className="text-blue-600 font-black text-xs uppercase tracking-widest bg-blue-100/50 inline-block px-3 py-1 rounded-lg">
                              AGENDA: {item.nomor_agenda || '-'} {/* PENYESUAIAN: nomor_agenda */}
                            </p>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <p className="font-black text-black text-lg leading-tight uppercase">{item.tujuan || '-'}</p>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <p className="font-black text-blue-600 text-lg uppercase italic">{item.pengirim || '-'}</p>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <div className="max-w-[280px]">
                               <p className="text-black font-black uppercase text-sm leading-relaxed">{item.perihal || '-'}</p>
                            </div>
                          </td>
                          <td className="px-8 py-12 text-center">
                            <div className="flex flex-col gap-3 min-w-[160px]">
                              {item.file_url ? (
                                  <a 
                                    href={item.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 text-white py-4 rounded-2xl text-xs font-black uppercase text-center shadow-lg hover:bg-slate-900 transition-all tracking-widest"
                                  >
                                    BUKA DRIVE ↗
                                  </a>
                              ) : (
                                <span className="text-slate-400 text-[10px] uppercase italic">Link Tidak Tersedia</span>
                              )}
                              <div className="grid grid-cols-2 gap-3">
                                <Link href={`/surat_keluar/edit/${item.id}`} className="bg-slate-200 text-black py-3 rounded-2xl text-xs font-black uppercase text-center hover:bg-blue-600 hover:text-white transition-all">
                                  EDIT
                                </Link>
                                <button onClick={() => triggerDeleteModal(item.id)} className="bg-red-100 text-red-600 py-3 rounded-2xl text-xs font-black uppercase text-center hover:bg-red-600 hover:text-white transition-all">
                                  HAPUS
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col items-center gap-8">
                <div className="flex justify-center items-center gap-6">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="bg-white px-8 py-5 rounded-[1.5rem] font-black shadow-xl disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black text-lg border-2 border-slate-100 uppercase">Prev</button>
                  <div className="flex gap-3 bg-white p-4 rounded-[2.5rem] shadow-2xl border-4 border-blue-50">
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-16 h-16 rounded-2xl font-black text-xl transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-300' : 'hover:bg-blue-50 text-black'}`}>{i + 1}</button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="bg-white px-8 py-5 rounded-[1.5rem] font-black shadow-xl disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black text-lg border-2 border-slate-100 uppercase">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- POPUP MODAL DELETE (SOFT DELETE) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          ></div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 w-full max-w-lg border-8 border-white animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black">!</div>
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none text-black">Pindahkan Ke Sampah?</h2>
              <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
                Data akan dipindahkan ke pusat sampah. Anda tetap bisa memulihkan data ini melalui menu sampah jika diperlukan.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all"
                >
                  Batal
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={confirmSoftDelete}
                  className="bg-red-600 hover:bg-red-700 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, PINDAHKAN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}