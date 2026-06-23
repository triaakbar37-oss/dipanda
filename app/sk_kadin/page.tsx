'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
// --- IMPORT XLSX UNTUK DOWNLOAD EXCEL ---
import * as XLSX from 'xlsx'

export default function DaftarSkKadin() {
  const [skData, setSkData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- STATE UNTUK PENCARIAN & FILTER ---
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter Tanggal SK
  const [startTanggalSk, setStartTanggalSk] = useState('')
  const [endTanggalSk, setEndTanggalSk] = useState('')

  // Filter Tanggal Jadi SK (Database: tanggal_jadi_sk)
  const [startTanggalJadi, setStartTanggalJadi] = useState('')
  const [endTanggalJadi, setEndTanggalJadi] = useState('')
  
  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // --- STATE UNTUK MODAL SOFT DELETE ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function fetchSk() {
    try {
      setLoading(true)
      // MENGGUNAKAN SOFT DELETE: Hanya ambil data yang is_deleted = false atau null
      const { data, error } = await supabase
        .from('sk_kadin')
        .select('*')
        .or('is_deleted.eq.false,is_deleted.is.null')
        .order('id', { ascending: false })

      if (error) throw error
      setSkData(data || [])
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

  // --- LOGIKA FILTERING ---
  const filteredSk = skData.filter((item) => {
    const searchLow = searchTerm.toLowerCase()
    const matchText = (
      (item.nomer_sk?.toLowerCase().includes(searchLow)) ||
      (item.tentang_sk?.toLowerCase().includes(searchLow)) ||
      (item.yang_membuat_sk?.toLowerCase().includes(searchLow)) ||
      (item.keterangan?.toLowerCase().includes(searchLow))
    )

    // Logika Filter Tanggal SK
    const dateSk = item.tanggal_sk ? item.tanggal_sk.substring(0, 10) : ''
    let matchSkDate = true
    if (startTanggalSk && endTanggalSk) {
      matchSkDate = dateSk >= startTanggalSk && dateSk <= endTanggalSk
    } else if (startTanggalSk) {
      matchSkDate = dateSk >= startTanggalSk
    } else if (endTanggalSk) {
      matchSkDate = dateSk <= endTanggalSk
    }

    // Logika Filter Tanggal Jadi SK (Mapping ke tanggal_jadi_sk)
    const dateJadi = item.tanggal_jadi_sk ? item.tanggal_jadi_sk.substring(0, 10) : ''
    let matchJadiDate = true
    if (startTanggalJadi && endTanggalJadi) {
      matchJadiDate = dateJadi >= startTanggalJadi && dateJadi <= endTanggalJadi
    } else if (startTanggalJadi) {
      matchJadiDate = dateJadi >= startTanggalJadi
    } else if (endTanggalJadi) {
      matchJadiDate = dateJadi <= endTanggalJadi
    }

    return matchText && matchSkDate && matchJadiDate
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredSk.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredSk.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, startTanggalSk, endTanggalSk, startTanggalJadi, endTanggalJadi])

  // --- FUNGSI PROSES SOFT DELETE ---
  async function confirmSoftDelete() {
    if (!selectedId) return

    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('sk_kadin')
        .update({ is_deleted: true })
        .eq('id', selectedId)

      if (error) throw error
      
      setShowDeleteModal(false)
      setSelectedId(null)
      fetchSk() 
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

  // --- FUNGSI DOWNLOAD EXCEL ---
  const downloadExcel = () => {
    if (filteredSk.length === 0) {
      alert("Tidak ada data untuk didownload");
      return;
    }

    // Mapping data agar header di Excel rapi
    const dataToExport = filteredSk.map((item, index) => ({
      'NO': index + 1,
      'TANGGAL SK': formatDate(item.tanggal_sk),
      'TANGGAL JADI': formatDate(item.tanggal_jadi_sk),
      'NOMOR SK': item.nomer_sk || '-',
      'TENTANG / PERIHAL': item.tentang_sk || '-',
      'PEMBUAT SK': item.yang_membuat_sk || '-',
      'KETERANGAN': item.keterangan || '-',
      'URL FILE': item.file_url || 'Tidak Ada',
      'URL KONSEP': item.file_mentahan_url || 'Tidak Ada'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar SK Kadin");
    
    // Download file
    XLSX.writeFile(workbook, `Arsip_SK_Kadin_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  useEffect(() => {
    fetchSk()
  }, [])

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black w-full font-bold relative text-xs">
      
      {/* --- POPUP MODAL DELETE (SOFT DELETE COMPACT SIZE) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          ></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="text-center text-black">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">!</div>
              <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Pindahkan Ke Sampah?</h2>
              <p className="text-slate-500 font-medium mb-6 uppercase text-[9px] tracking-wider leading-normal text-center">
                Data akan dipindahkan ke pusat sampah. Anda tetap bisa memulihkan data ini melalui menu sampah jika diperlukan.
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <button 
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmSoftDelete}
                  className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  {isDeleting ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'YA, PINDAHKAN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mx-auto">
        
        {/* HEADER COMPACT */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b-2 border-blue-600 gap-4 w-full">
          <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-3 rounded-xl text-xl shadow-md font-black shrink-0">
                📜
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase leading-none text-black">
                  SK <span className="text-blue-600">KADIN</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">ARSIP SK KEPALA DINAS CLOUD DATABASE</p>
              </div>
          </div>
          
          <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end text-[10px]">
            {/* TOMBOL DOWNLOAD EXCEL COMPACT */}
            <button 
              onClick={downloadExcel}
              className="bg-emerald-600 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-black transition-all active:scale-95 uppercase tracking-wider"
            >
              DOWNLOAD EXCEL
            </button>

            <Link 
              href="/sk_kadin/tambah"
              className="bg-blue-600 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-black transition-all active:scale-95 uppercase tracking-wider text-center"
            >
              TAMBAH SK BARU
            </Link>
          </div>
        </div>

        {/* SECTION PENCARIAN & FILTER COMPACT */}
        <div className="mb-4 w-full flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="CARI NOMOR SK, TENTANG, PEMBUAT, KETERANGAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 shadow-sm rounded-lg pl-3 pr-24 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-wider"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-100 text-red-600 px-2.5 py-1 rounded-md hover:bg-red-600 hover:text-white transition-all font-black uppercase text-[9px]"
                >
                  BERSIHKAN ✕
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-blue-600'} border border-slate-200 shadow-sm rounded-lg px-4 py-2.5 text-[10px] font-black transition-all hover:bg-blue-50 active:scale-95 uppercase tracking-wider`}
            >
              {showFilters ? 'TUTUP FILTER ▲' : 'FILTER TANGGAL ▼'}
            </button>
          </div>

          {/* PANEL FILTER TANGGAL COMPACT */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="text-blue-600 font-black uppercase text-[9px] mb-2 tracking-wider flex items-center gap-1.5">
                   <span className="w-2 h-2 bg-blue-600 rounded-full"></span> RENTANG TANGGAL SK
                 </h3>
                 <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date"
                      value={startTanggalSk}
                      onChange={(e) => setStartTanggalSk(e.target.value)}
                      className="bg-slate-50 p-2 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-blue-600 text-[11px] uppercase w-full"
                    />
                    <input 
                      type="date"
                      value={endTanggalSk}
                      onChange={(e) => setEndTanggalSk(e.target.value)}
                      className="bg-slate-50 p-2 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-blue-600 text-[11px] uppercase w-full"
                    />
                 </div>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="text-emerald-600 font-black uppercase text-[9px] mb-2 tracking-wider flex items-center gap-1.5">
                   <span className="w-2 h-2 bg-emerald-600 rounded-full"></span> RENTANG TANGGAL JADI SK
                 </h3>
                 <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date"
                      value={startTanggalJadi}
                      onChange={(e) => setStartTanggalJadi(e.target.value)}
                      className="bg-slate-50 p-2 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-emerald-600 text-[11px] uppercase w-full"
                    />
                    <input 
                      type="date"
                      value={endTanggalJadi}
                      onChange={(e) => setEndTanggalJadi(e.target.value)}
                      className="bg-slate-50 p-2 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-emerald-600 text-[11px] uppercase w-full"
                    />
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* TABEL DATA COMPACT */}
        {loading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse table-fixed text-[11px]">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-800">
                      <th className="px-3 py-3 font-black uppercase tracking-wider border-r border-slate-800 text-center w-12">NO</th>
                      <th className="px-3 py-3 font-black uppercase tracking-wider border-r border-slate-800 text-center w-28">TGL SK</th>
                      <th className="px-3 py-3 font-black uppercase tracking-wider border-r border-slate-800 text-center w-28">TGL JADI</th>
                      <th className="px-4 py-3 font-black uppercase tracking-wider border-r border-slate-800 w-48">NOMOR SK</th>
                      <th className="px-4 py-3 font-black uppercase tracking-wider border-r border-slate-800 w-64">TENTANG / PERIHAL</th>
                      <th className="px-4 py-3 font-black uppercase tracking-wider border-r border-slate-800 w-40">PEMBUAT SK</th>
                      <th className="px-4 py-3 font-black uppercase tracking-wider border-r border-slate-800 w-44">KETERANGAN</th>
                      <th className="px-3 py-3 font-black uppercase tracking-wider text-center w-36">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-bold text-slate-700">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-300 font-black uppercase tracking-widest italic text-sm">
                          HASIL PENCARIAN TIDAK DITEMUKAN
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-blue-50/50 transition-all text-black">
                          <td className="px-3 py-4 text-center border-r border-slate-100 font-black text-slate-400 text-xs">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="px-2 py-4 text-center border-r border-slate-100">
                            <span className="bg-blue-50/80 px-2 py-1.5 rounded-md font-black text-[10px] text-black border border-blue-100 inline-block w-full">
                              {formatDate(item.tanggal_sk)}
                            </span>
                          </td>
                          <td className="px-2 py-4 text-center border-r border-slate-100">
                            <span className="bg-emerald-50 px-2 py-1.5 rounded-md font-black text-[10px] text-black border border-emerald-100 inline-block w-full">
                              {formatDate(item.tanggal_jadi_sk)}
                            </span>
                          </td>
                          <td className="px-4 py-4 border-r border-slate-100">
                            <p className="font-black text-slate-900 text-xs tracking-tight uppercase truncate" title={item.nomer_sk}>
                                {item.nomer_sk || 'TANPA NOMOR'}
                            </p>
                          </td>
                          <td className="px-4 py-4 border-r border-slate-100">
                            <p className="text-slate-800 font-bold uppercase text-[10px] leading-normal line-clamp-2 break-words" title={item.tentang_sk}>
                                {item.tentang_sk || '-'}
                            </p>
                          </td>
                          <td className="px-4 py-4 border-r border-slate-100">
                            <p className="font-black text-blue-600 text-[10px] uppercase italic truncate" title={item.yang_membuat_sk}>
                                {item.yang_membuat_sk || '-'}
                            </p>
                          </td>
                          <td className="px-4 py-4 border-r border-slate-100">
                            <p className="text-slate-400 font-medium uppercase text-[9px] leading-normal line-clamp-2 break-words" title={item.keterangan}>
                                {item.keterangan || '-'}
                            </p>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <div className="flex flex-col gap-1.5 w-full text-[9px]">
                              {item.file_url ? (
                                  <a 
                                    href={item.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-blue-600 text-white py-1.5 rounded-md font-black uppercase text-center shadow-sm hover:bg-slate-900 transition-all tracking-wider"
                                  >
                                    LIHAT SK ↗
                                  </a>
                              ) : (
                                <span className="text-slate-400 text-[8px] uppercase italic">SK Kosong</span>
                              )}

                              {item.file_mentahan_url ? (
                                  <a 
                                    href={item.file_mentahan_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-emerald-600 text-white py-1.5 rounded-md font-black uppercase text-center shadow-sm hover:bg-slate-900 transition-all tracking-wider"
                                  >
                                    KONSEP ↗
                                  </a>
                              ) : (
                                <span className="text-slate-400 text-[8px] uppercase italic">Konsep Kosong</span>
                              )}

                              <div className="grid grid-cols-2 gap-1.5">
                                <Link 
                                  href={`/sk_kadin/edit/${item.id}`} 
                                  className="bg-slate-100 text-slate-800 py-1.5 rounded-md font-black uppercase text-center border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                                >
                                  EDIT
                                </Link>
                                <button 
                                  onClick={() => openDeleteModal(item.id)} 
                                  className="bg-red-50 text-red-600 py-1.5 rounded-md font-black uppercase text-center border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
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
              <div className="mt-4 flex flex-col items-center gap-3 w-full text-[11px]">
                <div className="flex justify-center items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className="bg-white px-3 py-1.5 rounded-lg font-black shadow-sm disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black border border-slate-200 uppercase text-[10px]"
                  >
                    Prev
                  </button>
                  <div className="flex gap-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                    {[...Array(totalPages)].map((_, index) => (
                        <button 
                          key={index + 1} 
                          onClick={() => setCurrentPage(index + 1)} 
                          className={`w-7 h-7 rounded-md font-black text-xs transition-all ${currentPage === index + 1 ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-blue-50 text-black'}`}
                        >
                          {index + 1}
                        </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                    className="bg-white px-3 py-1.5 rounded-lg font-black shadow-sm disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all text-black border border-slate-200 uppercase text-[10px]"
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