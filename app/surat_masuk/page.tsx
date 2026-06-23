'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
// Import konfigurasi supabase yang telah Anda buat di folder lib
import { supabase } from '@/lib/supabase'

export default function DaftarSuratMasuk() {
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
      
      // Query ke tabel 'surat_masuk' dengan filter is_deleted = false
      const { data, error } = await supabase
        .from('surat_masuk')
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
      (item.asal_surat?.toLowerCase().includes(searchLow)) || // Menyesuaikan field asal/pengirim surat masuk
      (item.perihal?.toLowerCase().includes(searchLow)) ||
      (item.keterangan?.toLowerCase().includes(searchLow)) || 
      (item.nomor_agenda?.toString().toLowerCase().includes(searchLow)) 
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

  // --- FUNGSI DOWNLOAD CSV (EXCEL FRIENDLY) ---
  const downloadCSV = () => {
    if (filteredSurat.length === 0) {
      alert("Tidak ada data untuk didownload");
      return;
    }

    // Header Kolom
    const headers = ["No", "Tanggal Fisik", "Tanggal Input", "Nomor Agenda", "Nomor Surat", "Asal Surat", "Perihal", "Keterangan"];
    
    // Konversi Data ke Baris CSV
    const csvRows = filteredSurat.map((item, index) => [
      index + 1,
      item.tanggal_surat ? formatDate(item.tanggal_surat) : '-',
      item.created_at ? formatDate(item.created_at) : '-',
      `"${item.nomor_agenda || '-'}"`, // Menggunakan tanda kutip untuk menjaga format teks
      `"${item.nomor_surat || '-'}"`,
      `"${item.asal_surat || '-'}"`,
      `"${item.perihal?.replace(/\n/g, ' ').replace(/"/g, '""') || '-'}"`, // Menghapus line break dan escape double quotes
      `"${item.keterangan?.replace(/\n/g, ' ').replace(/"/g, '""') || '-'}"`
    ]);

    // Gabungkan Header dan Data dengan separator koma
    // Menambahkan BOM (Byte Order Mark) agar Excel membaca UTF-8 dengan benar (karakter spesial aman)
    const csvContent = "\uFEFF" + [headers, ...csvRows].map(e => e.join(",")).join("\n");
    
    // Proses Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Surat_Masuk_${new Date().toISOString().substring(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      // Mengubah status is_deleted menjadi true (Soft Delete) pada tabel surat_masuk
      const { error } = await supabase
        .from('surat_masuk')
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
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black w-full font-bold text-xs">
      <div className="w-full mx-auto">
        
        {/* HEADER - Ukuran ikon, teks, padding, dan kelengkungan disusutkan total */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b-2 border-blue-600 gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 text-white p-3 rounded-xl text-2xl shadow-md font-black shrink-0">
               📥
             </div>
             <div>
                <h1 className="text-lg sm:text-2xl font-black tracking-tight uppercase leading-none text-black">
                  SURAT <span className="text-blue-600">MASUK</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">ARSIP SURAT MASUK CLOUD DATABASE</p>
             </div>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
            <button 
              onClick={downloadCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-black shadow-sm transition-all active:scale-95 uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5"
            >
              EXCEL
            </button>

            <Link 
              href="/surat_masuk/tambah"
              className="bg-blue-600 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-black shadow-sm transition-all active:scale-95 uppercase tracking-wider text-[11px] flex items-center justify-center text-center"
            >
              + BARU
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="mb-4 w-full flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full">
              <input 
                type="text"
                placeholder="CARI DATA SM (NOMOR, PERIHAL, ASAL, ATAU TANGGAL)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-wide"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-50 text-red-600 px-2 py-1 rounded-md hover:bg-red-600 hover:text-white transition-all font-black uppercase text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:w-44 ${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-blue-600'} border border-slate-200 shadow-sm rounded-lg px-4 py-2.5 text-[11px] font-black transition-all uppercase tracking-wider text-center`}
            >
              {showFilters ? 'TUTUP ▲' : 'FILTER ▼'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                  <h3 className="text-blue-600 font-black uppercase text-[10px] mb-2 tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span> TANGGAL INPUT
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                     <input 
                       type="date"
                       value={startDate}
                       onChange={(e) => setStartDate(e.target.value)}
                       className="bg-white border border-slate-200 p-2 rounded-md font-black focus:outline-none focus:ring-1 focus:ring-blue-600 uppercase text-xs w-full"
                     />
                     <input 
                       type="date"
                       value={endDate}
                       onChange={(e) => setEndDate(e.target.value)}
                       className="bg-white border border-slate-200 p-2 rounded-md font-black focus:outline-none focus:ring-1 focus:ring-blue-600 uppercase text-xs w-full"
                     />
                  </div>
              </div>

              <div className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                  <h3 className="text-slate-500 font-black uppercase text-[10px] mb-2 tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span> TANGGAL FISIK
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                     <input 
                       type="date"
                       value={startTanggalFisik}
                       onChange={(e) => setStartTanggalFisik(e.target.value)}
                       className="bg-white border border-slate-200 p-2 rounded-md font-black focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase text-xs w-full"
                     />
                     <input 
                       type="date"
                       value={endTanggalFisik}
                       onChange={(e) => setEndTanggalFisik(e.target.value)}
                       className="bg-white border border-slate-200 p-2 rounded-md font-black focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase text-xs w-full"
                     />
                  </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
          </div>
        ) : (
          <div className="w-full">
            
            {/* ========================================================================= */}
            {/* TAMPILAN 1: TAMPILAN MOBILE CARD LIST ( block md:hidden ) - PAS DI LAYAR HP */}
            {/* ========================================================================= */}
            <div className="block md:hidden space-y-2">
              {currentItems.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-slate-300 font-black uppercase italic">
                  DATA TIDAK DITEMUKAN
                </div>
              ) : (
                currentItems.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-mono">
                        NO. {indexOfFirstItem + index + 1}
                      </span>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-black border border-blue-100">
                          FISIK: {formatDate(item.tanggal_surat)}
                        </span>
                        <span className="text-slate-400 text-[8px]">
                          INPUT: {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Nomor Surat</p>
                        <p className="font-black text-slate-900 break-words leading-tight">{item.nomor_surat || 'TANPA NOMOR'}</p>
                        <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-mono mt-1 inline-block">
                          AGENDA: {item.nomor_agenda || '-'}
                        </span>
                      </div>

                      <div className="pt-1 border-t border-slate-50">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Asal Surat</p>
                        <p className="font-bold text-blue-600 italic break-words">{item.asal_surat || '-'}</p>
                      </div>

                      <div className="pt-1 border-t border-slate-50">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Perihal</p>
                        <p className="text-slate-700 font-medium bg-slate-50 p-2 rounded-md text-[11px] leading-normal mt-0.5 break-words">
                          {item.perihal || '-'}
                        </p>
                      </div>

                      {item.keterangan && (
                        <div className="pt-1">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Keterangan</p>
                          <p className="text-slate-400 italic text-[10px] break-words">{item.keterangan}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 mt-1">
                      {item.file_url && (
                        <a 
                          href={item.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white py-2 rounded-lg text-[10px] font-black uppercase text-center tracking-wider block"
                        >
                          LIHAT PDF ↗
                        </a>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/surat_masuk/edit/${item.id}`} className="bg-slate-100 text-center text-black py-2 rounded-lg text-[10px] font-black uppercase">
                          EDIT
                        </Link>
                        <button onClick={() => triggerDeleteModal(item.id)} className="bg-red-50 text-red-600 py-2 rounded-lg text-[10px] font-black uppercase">
                          HAPUS
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ========================================================================= */}
            {/* TAMPILAN 2: TAMPILAN TABEL LAPTOP ( hidden md:block ) - RAMPIING & MINI */}
            {/* ========================================================================= */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] tracking-wider uppercase border-b border-slate-800">
                    <th className="p-2.5 w-[5%] text-center border-r border-slate-800">NO</th>
                    <th className="p-2.5 w-[14%] text-center border-r border-slate-800">TANGGAL</th>
                    <th className="p-2.5 w-[20%] border-r border-slate-800">NOMER SURAT</th>
                    <th className="p-2.5 w-[18%] border-r border-slate-800">ASAL SURAT</th>
                    <th className="p-2.5 w-[22%] border-r border-slate-800">PERIHAL</th>
                    <th className="p-2.5 w-[11%] border-r border-slate-800">KETERANGAN</th>
                    <th className="p-2.5 w-[10%] text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-300 font-black tracking-widest italic text-lg">
                        DATA TIDAK DITEMUKAN
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-2.5 text-center border-r border-slate-100 font-bold text-slate-400">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="p-2.5 border-r border-slate-100 text-center">
                          <div className="flex flex-col gap-0.5 text-[10px] font-black">
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 block truncate" title="Tanggal Fisik">
                              F: {formatDate(item.tanggal_surat)}
                            </span>
                            <span className="text-slate-400 block text-[9px] truncate" title="Tanggal Input">
                              In: {formatDate(item.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-slate-100 font-black text-slate-900 break-words leading-tight">
                          <p className="text-xs uppercase tracking-tight">{item.nomor_surat || 'TANPA NOMOR'}</p>
                          <span className="bg-blue-100 text-blue-800 text-[8px] px-1.5 py-0.5 rounded font-mono mt-0.5 inline-block">
                            A: {item.nomor_agenda || '-'} 
                          </span>
                        </td>
                        <td className="p-2.5 border-r border-slate-100 break-words text-blue-600 italic font-bold leading-tight">
                          {item.asal_surat || '-'}
                        </td>
                        <td className="p-2.5 border-r border-slate-100 break-words text-slate-600 font-medium text-[11px] leading-tight">
                          {item.perihal || '-'}
                        </td>
                        <td className="p-2.5 border-r border-slate-100 break-words text-slate-400 font-normal italic text-[10px] leading-tight">
                          {item.keterangan || '-'}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex flex-col gap-1 text-[9px] font-black">
                            {item.file_url ? (
                              <a 
                                href={item.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white py-1 rounded font-bold uppercase block tracking-wider"
                              >
                                PDF ↗
                              </a>
                            ) : (
                              <span className="text-slate-300 text-[8px] italic block">No File</span>
                            )}
                            <div className="grid grid-cols-2 gap-1">
                              <Link href={`/surat_masuk/edit/${item.id}`} className="bg-slate-100 text-black py-1 rounded hover:bg-blue-600 hover:text-white transition-all text-center">
                                EDIT
                              </Link>
                              <button onClick={() => triggerDeleteModal(item.id)} className="bg-red-50 text-red-600 py-1 rounded hover:bg-red-600 hover:text-white transition-all">
                                DEL
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

            {/* PAGINATION - Ukuran tombol diturunkan ke skala normal */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-3 text-xs">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="bg-white px-3 py-2 rounded-lg font-bold shadow-sm disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black border border-slate-200 uppercase text-[10px]"
                >
                  Prev
                </button>
                <div className="flex gap-1 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)} 
                      className={`w-7 h-7 rounded-md font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-blue-50 text-black'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages} 
                  className="bg-white px-3 py-2 rounded-lg font-bold shadow-sm disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black border border-slate-200 uppercase text-[10px]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- POPUP MODAL DELETE (SOFT DELETE) - RAMPING & PAS DI HP --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          ></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-sm border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">!</div>
              <h2 className="text-lg font-black mb-2 uppercase tracking-tight text-black">Pindahkan Ke Sampah?</h2>
              <p className="text-slate-400 font-semibold mb-6 uppercase text-[10px] tracking-wide leading-normal">
                Data akan dipindahkan ke pusat sampah. Anda tetap bisa memulihkan data ini melalui menu sampah jika diperlukan.
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <button 
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-lg font-black uppercase tracking-wider transition-all"
                >
                  Batal
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={confirmSoftDelete}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, PINDAHKAN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}