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
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black w-full font-bold relative">
      
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
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none text-black">Hapus Kegiatan?</h2>
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
                  {isDeleting ? <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, HAPUS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-4 border-blue-600 pb-8 gap-6 w-full">
          <div className="flex items-center gap-6">
             <div className="bg-blue-600 text-white p-6 rounded-[2rem] text-5xl shadow-2xl shadow-blue-300 font-black">
               📅
             </div>
             <div>
                <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-black">
                  KEGI<span className="text-blue-600">ATAN</span>
                </h1>
                <p className="text-black font-black tracking-[0.4em] text-base mt-2 uppercase">DOKUMENTASI PELAKSANAAN TUGAS BIDANG</p>
             </div>
          </div>
          
          {/* GRUP TOMBOL AKSI HEADER */}
          <div className="flex items-center gap-4">
            <button 
              onClick={downloadExcel}
              disabled={isExporting}
              className="bg-emerald-600 hover:bg-slate-900 text-white px-10 py-7 rounded-[2.5rem] font-black shadow-2xl shadow-emerald-100 transition-all active:scale-95 uppercase tracking-widest text-lg disabled:opacity-50"
            >
              {isExporting ? 'PROSES...' : 'DOWNLOAD EXCEL'}
            </button>
            <Link 
              href="/kegiatan/tambah"
              className="bg-blue-600 hover:bg-slate-900 text-white px-12 py-7 rounded-[2.5rem] font-black shadow-2xl shadow-blue-200 transition-all active:scale-95 uppercase tracking-widest text-lg"
            >
              TAMBAH KEGIATAN
            </Link>
          </div>
        </div>

        {/* SECTION PENCARIAN & FILTER */}
        <div className="mb-10 w-full flex flex-col gap-6">
          <div className="flex flex-row items-center gap-6">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="CARI NAMA KEGIATAN ATAU KETERANGAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-4 border-white shadow-2xl rounded-[2.5rem] px-10 py-7 text-xl font-black focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-widest"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 bg-red-100 text-red-600 px-6 py-3 rounded-2xl hover:bg-red-600 hover:text-white transition-all font-black uppercase text-xs shadow-lg"
                >
                  BERSIHKAN ✕
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-blue-600'} border-4 border-white shadow-2xl rounded-[2.5rem] px-10 py-7 text-base font-black transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter`}
            >
              {showFilters ? 'TUTUP FILTER ▲' : 'FILTER TANGGAL ▼'}
            </button>
          </div>

          {/* PANEL FILTER TANGGAL */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-blue-50">
                 <h3 className="text-blue-600 font-black uppercase text-sm mb-4 tracking-widest flex items-center gap-2">
                   <span className="w-3 h-3 bg-blue-600 rounded-full"></span> RENTANG TANGGAL KEGIATAN
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="date"
                      value={startTanggal}
                      onChange={(e) => setStartTanggal(e.target.value)}
                      className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                    />
                    <input 
                      type="date"
                      value={endTanggal}
                      onChange={(e) => setEndTanggal(e.target.value)}
                      className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                    />
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* TABEL DATA */}
        {loading ? (
          <div className="flex justify-center items-center h-96 w-full">
            <div className="animate-spin rounded-full h-20 w-20 border-t-8 border-blue-600"></div>
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(29,78,216,0.1)] overflow-hidden border-8 border-white w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="px-6 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 text-center w-24">NO</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 text-center w-44">TANGGAL</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 w-80">NAMA KEGIATAN</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 w-96">KETERANGAN / RINCIAN</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm text-center w-64">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-20 text-slate-300 font-black uppercase tracking-widest italic text-2xl">
                          DATA KEGIATAN TIDAK DITEMUKAN
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-blue-50/80 transition-all group">
                          <td className="px-6 py-12 text-center border-r border-slate-100 font-black text-xl text-slate-400">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="px-8 py-12 text-center border-r border-slate-100">
                            <div className="bg-blue-50 text-black p-4 rounded-2xl font-black text-base shadow-inner">
                              {formatDate(item.tgl_input)}
                            </div>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <p className="font-black text-black text-2xl tracking-tighter uppercase truncate overflow-hidden" title={item.nama_kegiatan}>
                                {item.nama_kegiatan || 'TANPA NAMA'}
                            </p>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <div className="w-full">
                               <p className="text-slate-500 font-black uppercase text-sm leading-relaxed line-clamp-3 overflow-hidden break-words" title={item.keterangan}>
                                   {item.keterangan || '-'}
                               </p>
                            </div>
                          </td>
                          <td className="px-8 py-12 text-center">
                            <div className="flex flex-col gap-3 min-w-[180px]">
                              {/* DOKUMEN SURAT TERKAIT */}
                              {item.surat_url ? (
                                  <a 
                                    href={item.surat_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-blue-600 text-white py-4 rounded-2xl text-xs font-black uppercase text-center shadow-lg hover:bg-slate-900 transition-all tracking-widest"
                                  >
                                    LIHAT SURAT ↗
                                  </a>
                              ) : (
                                <span className="text-slate-400 text-[10px] uppercase italic">Surat Tidak Ada</span>
                              )}

                              {/* DOKUMENTASI KEGIATAN */}
                              {item.dokumentasi_url ? (
                                  <a 
                                    href={item.dokumentasi_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black uppercase text-center shadow-lg hover:bg-slate-900 transition-all tracking-widest"
                                  >
                                    DOKUMENTASI ↗
                                  </a>
                              ) : (
                                <span className="text-slate-400 text-[10px] uppercase italic">Dokumentasi Kosong</span>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                <Link 
                                  href={`/kegiatan/edit/${item.id}`} 
                                  className="bg-slate-200 text-black py-3 rounded-2xl text-xs font-black uppercase text-center hover:bg-blue-600 hover:text-white transition-all"
                                >
                                  EDIT
                                </Link>
                                <button 
                                  onClick={() => openDeleteModal(item.id)} 
                                  className="bg-red-100 text-red-600 py-3 rounded-2xl text-xs font-black uppercase text-center hover:bg-red-600 hover:text-white transition-all"
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

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col items-center gap-8 w-full">
                <div className="flex justify-center items-center gap-6">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className="bg-white px-8 py-5 rounded-[1.5rem] font-black shadow-xl disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black text-lg border-2 border-slate-100 uppercase"
                  >
                    Prev
                  </button>
                  <div className="flex gap-3 bg-white p-4 rounded-[2.5rem] shadow-2xl border-4 border-blue-50">
                    {[...Array(totalPages)].map((_, index) => (
                        <button 
                          key={index + 1} 
                          onClick={() => setCurrentPage(index + 1)} 
                          className={`w-16 h-16 rounded-2xl font-black text-xl transition-all ${currentPage === index + 1 ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-300' : 'hover:bg-blue-50 text-black'}`}
                        >
                          {index + 1}
                        </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                    className="bg-white px-8 py-5 rounded-[1.5rem] font-black shadow-xl disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black text-lg border-2 border-slate-100 uppercase"
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