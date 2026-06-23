'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx' // Import library Excel

export default function DaftarKegiatan() {
  const [kegiatanData, setKegiatanData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- STATE UNTUK PENCARIAN & FILTER ---
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter Tanggal Input Kegiatan
  const [startTanggal, setStartTanggal] = useState('')
  const [endTanggal, setEndTanggal] = useState('')
  
  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // --- STATE UNTUK MODAL SOFT DELETE ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // --- STATE UNTUK DOWNLOAD ---
  const [isExporting, setIsExporting] = useState(false)

  async function fetchKegiatan() {
    try {
      setLoading(true)
      // MENGGUNAKAN SOFT DELETE: Hanya ambil data yang is_deleted = false atau null
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .or('is_deleted.eq.false,is_deleted.is.null')
        .order('id', { ascending: false })

      if (error) throw error
      setKegiatanData(data || [])
    } catch (error: any) {
      console.error("Supabase Fetch Error:", error)
      alert('Gagal mengambil data dari Cloud: ' + error.message)
    } finally {
      setLoading(false)
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

  // --- FUNGSI DOWNLOAD EXCEL ---
  const downloadExcel = () => {
    try {
      setIsExporting(true)

      if (filteredKegiatan.length === 0) {
        alert("Tidak ada data untuk didownload")
        return
      }

      // Memetakan data agar tampilan di Excel lebih rapi
      const dataToExport = filteredKegiatan.map((item, index) => ({
        NO: index + 1,
        TANGGAL: formatDate(item.tgl_input),
        NAMA_KEGIATAN: item.nama_kegiatan || '-',
        KETERANGAN: item.keterangan || '-',
        URL_SURAT: item.surat_url || 'Tidak Ada',
        URL_DOKUMENTASI: item.dokumentasi_url || 'Tidak Ada'
      }))

      // Membuat worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kegiatan")

      // Atur lebar kolom otomatis (opsional)
      const maxWidth = 50
      worksheet['!cols'] = [
        { wch: 5 },  // NO
        { wch: 15 }, // TANGGAL
        { wch: 30 }, // NAMA_KEGIATAN
        { wch: 50 }, // KETERANGAN
        { wch: 30 }, // URL_SURAT
        { wch: 30 }  // URL_DOKUMENTASI
      ]

      // Download file
      const fileName = `Laporan_Kegiatan_${new Date().getTime()}.xlsx`
      XLSX.writeFile(workbook, fileName)

    } catch (error) {
      console.error("Download Error:", error)
      alert("Gagal mengunduh file Excel")
    } finally {
      setIsExporting(false)
    }
  }

  // --- LOGIKA FILTERING ---
  const filteredKegiatan = kegiatanData.filter((item) => {
    const searchLow = searchTerm.toLowerCase()
    const matchText = (
      (item.nama_kegiatan?.toLowerCase().includes(searchLow)) ||
      (item.keterangan?.toLowerCase().includes(searchLow))
    )

    // Logika Filter Tanggal
    const dateInput = item.tgl_input ? item.tgl_input.substring(0, 10) : ''
    let matchDate = true
    if (startTanggal && endTanggal) {
      matchDate = dateInput >= startTanggal && dateInput <= endTanggal
    } else if (startTanggal) {
      matchDate = dateInput >= startTanggal
    } else if (endTanggal) {
      matchDate = dateInput <= endTanggal
    }

    return matchText && matchDate
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredKegiatan.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredKegiatan.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, startTanggal, endTanggal])

  // --- FUNGSI PROSES SOFT DELETE ---
  async function confirmSoftDelete() {
    if (!selectedId) return

    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('kegiatan')
        .update({ is_deleted: true })
        .eq('id', selectedId)

      if (error) throw error
      
      setShowDeleteModal(false)
      setSelectedId(null)
      fetchKegiatan() 
    } catch (error: any) {
      alert("Gagal menghapus: " + error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  function openDeleteModal(id: any) {
    setSelectedId(id)
    setShowDeleteModal(true)
  }

  useEffect(() => {
    fetchKegiatan()
  }, [])

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black w-full font-bold relative text-xs">
      
      {/* --- POPUP MODAL DELETE (SOFT DELETE) COMPACT --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          ></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs text-center border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">!</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Hapus Kegiatan?</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Data akan dipindahkan ke pusat sampah. Anda tetap bisa memulihkan data ini melalui menu sampah jika diperlukan.
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button 
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all text-black"
              >
                Batal
              </button>
              <button 
                disabled={isDeleting}
                onClick={confirmSoftDelete}
                className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isDeleting ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, HAPUS'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mx-auto">
        
        {/* HEADER COMPACT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b-2 border-blue-600 pb-4 gap-4 w-full">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 text-white p-3 rounded-xl text-2xl shadow-md font-black shrink-0">
               📅
             </div>
             <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-none text-black">
                  KEGI<span className="text-blue-600">ATAN</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">DOKUMENTASI PELAKSANAAN TUGAS BIDANG</p>
             </div>
          </div>
          
          {/* GRUP TOMBOL AKSI HEADER COMPACT */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={downloadExcel}
              disabled={isExporting}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-black shadow-sm transition-all active:scale-95 uppercase tracking-wider text-[10px] disabled:opacity-50"
            >
              {isExporting ? 'PROSES...' : 'DOWNLOAD EXCEL'}
            </button>
            <Link 
              href="/kegiatan/tambah"
              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-black shadow-sm transition-all active:scale-95 uppercase tracking-wider text-[10px] text-center"
            >
              TAMBAH KEGIATAN
            </Link>
          </div>
        </div>

        {/* SECTION PENCARIAN & FILTER COMPACT */}
        <div className="mb-4 w-full flex flex-col gap-3">
          <div className="flex flex-row items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="CARI NAMA KEGIATAN ATAU KETERANGAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-wider"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-all font-black uppercase text-[9px]"
                >
                  ✕
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-blue-600'} border border-slate-200 shadow-sm rounded-lg px-4 py-2.5 text-[10px] font-black transition-all uppercase whitespace-nowrap`}
            >
              {showFilters ? 'TUTUP ▲' : 'FILTER ▼'}
            </button>
          </div>

          {/* PANEL FILTER TANGGAL COMPACT */}
          {showFilters && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                 <h3 className="text-blue-600 font-black uppercase text-[9px] mb-2 tracking-wider flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> RENTANG TANGGAL KEGIATAN
                 </h3>
                 <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date"
                      value={startTanggal}
                      onChange={(e) => setStartTanggal(e.target.value)}
                      className="bg-slate-50 p-2 border border-slate-200 rounded-md font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 uppercase text-xs"
                    />
                    <input 
                      type="date"
                      value={endTanggal}
                      onChange={(e) => setEndTanggal(e.target.value)}
                      className="bg-slate-50 p-2 border border-slate-200 rounded-md font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 uppercase text-xs"
                    />
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* TABEL DATA COMPACT */}
        {loading ? (
          <div className="flex justify-center items-center h-48 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px]">
                      <th className="px-3 py-3 font-black uppercase tracking-wider border-r border-slate-800 text-center w-12">NO</th>
                      <th className="px-3 py-3 font-black uppercase tracking-wider border-r border-slate-800 text-center w-28">TANGGAL</th>
                      <th className="px-4 py-3 font-black uppercase tracking-wider border-r border-slate-800 w-56">NAMA KEGIATAN</th>
                      <th className="px-4 py-3 font-black uppercase tracking-wider border-r border-slate-800 w-72">KETERANGAN / RINCIAN</th>
                      <th className="px-4 py-3 font-black uppercase tracking-wider text-center w-40">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-300 font-black uppercase tracking-widest italic text-sm">
                          DATA KEGIATAN TIDAK DITEMUKAN
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-blue-50/50 transition-all text-xs">
                          <td className="px-3 py-3 text-center border-r border-slate-100 font-black text-slate-400">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="px-3 py-3 text-center border-r border-slate-100">
                            <div className="bg-blue-50/70 text-black px-2 py-1 rounded-md font-bold text-[11px] shadow-inner inline-block">
                              {formatDate(item.tgl_input)}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-r border-slate-100">
                            <p className="font-black text-black tracking-tight uppercase truncate" title={item.nama_kegiatan}>
                                {item.nama_kegiatan || 'TANPA NAMA'}
                            </p>
                          </td>
                          <td className="px-4 py-3 border-r border-slate-100">
                            <p className="text-slate-500 font-bold uppercase text-[11px] leading-normal line-clamp-2 break-words" title={item.keterangan}>
                                {item.keterangan || '-'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col gap-1.5 w-full mx-auto">
                              {/* DOKUMEN SURAT TERKAIT */}
                              {item.surat_url ? (
                                  <a 
                                    href={item.surat_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-blue-600 text-white py-1.5 rounded-md text-[9px] font-black uppercase text-center shadow-sm hover:bg-slate-900 transition-all tracking-wider"
                                  >
                                    LIHAT SURAT ↗
                                  </a>
                              ) : (
                                <span className="text-slate-400 text-[9px] uppercase italic my-0.5">Surat Kosong</span>
                              )}

                              {/* DOKUMENTASI KEGIATAN */}
                              {item.dokumentasi_url ? (
                                  <a 
                                    href={item.dokumentasi_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-emerald-600 text-white py-1.5 rounded-md text-[9px] font-black uppercase text-center shadow-sm hover:bg-slate-900 transition-all tracking-wider"
                                  >
                                    DOKUMENTASI ↗
                                  </a>
                              ) : (
                                <span className="text-slate-400 text-[9px] uppercase italic my-0.5">Dokumentasi Kosong</span>
                              )}

                              <div className="grid grid-cols-2 gap-1.5">
                                <Link 
                                  href={`/kegiatan/edit/${item.id}`} 
                                  className="bg-slate-100 text-black py-1 rounded-md text-[9px] font-black uppercase text-center hover:bg-blue-600 hover:text-white transition-all border border-slate-200"
                                >
                                  EDIT
                                </Link>
                                <button 
                                  onClick={() => openDeleteModal(item.id)} 
                                  className="bg-red-50 text-red-600 py-1 rounded-md text-[9px] font-black uppercase text-center hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                >
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

            {/* PAGINATION COMPACT */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col items-center w-full">
                <div className="flex justify-center items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className="bg-white px-3 py-1.5 rounded-lg font-black shadow-sm disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black text-[10px] border border-slate-200 uppercase"
                  >
                    Prev
                  </button>
                  <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    {[...Array(totalPages)].map((_, index) => (
                        <button 
                          key={index + 1} 
                          onClick={() => setCurrentPage(index + 1)} 
                          className={`w-7 h-7 rounded-md font-black text-xs transition-all ${currentPage === index + 1 ? 'bg-blue-600 text-white scale-105 shadow-sm' : 'hover:bg-blue-50 text-black'}`}
                        >
                          {index + 1}
                        </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                    className="bg-white px-3 py-1.5 rounded-lg font-black shadow-sm disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black text-[10px] border border-slate-200 uppercase"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}