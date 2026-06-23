'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx' // Import library XLSX

export default function DaftarNotaDinas() {
  const [nota, setNota] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- STATE UNTUK PENCARIAN & FILTER ---
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // State filter tanggal
  const [startTanggalSk, setStartTanggalSk] = useState('')
  const [endTanggalSk, setEndTanggalSk] = useState('')
  const [startTanggalKirim, setStartTanggalKirim] = useState('')
  const [endTanggalKirim, setEndTanggalKirim] = useState('')
  
  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // --- STATE MODAL SOFT DELETE ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function fetchNota() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('nota_dinas')
        .select('*')
        .or('is_deleted.eq.false,is_deleted.is.null') 
        .order('id', { ascending: false })

      if (error) throw error
      setNota(data || [])
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
  const filteredNota = nota.filter((item) => {
    const searchLow = searchTerm.toLowerCase()
    const matchText = (
      (item.nomer_surat?.toLowerCase().includes(searchLow)) ||
      (item.yang_membuat?.toLowerCase().includes(searchLow)) ||
      (item.perihal?.toLowerCase().includes(searchLow)) ||
      (item.keterangan?.toLowerCase().includes(searchLow))
    )

    const dateSk = item.tanggal_fisik ? item.tanggal_fisik.substring(0, 10) : ''
    const dateKirim = item.tanggal_dikirim ? item.tanggal_dikirim.substring(0, 10) : ''
    
    let matchSk = true
    if (startTanggalSk && endTanggalSk) {
      matchSk = dateSk >= startTanggalSk && dateSk <= endTanggalSk
    } else if (startTanggalSk) {
      matchSk = dateSk >= startTanggalSk
    } else if (endTanggalSk) {
      matchSk = dateSk <= endTanggalSk
    }

    let matchKirim = true
    if (startTanggalKirim && endTanggalKirim) {
      matchKirim = dateKirim >= startTanggalKirim && dateKirim <= endTanggalKirim
    } else if (startTanggalKirim) {
      matchKirim = dateKirim >= startTanggalKirim
    } else if (endTanggalKirim) {
      matchKirim = dateKirim <= endTanggalKirim
    }

    return matchText && matchSk && matchKirim
  })

  // --- FUNGSI DOWNLOAD EXCEL ---
  const downloadExcel = () => {
    if (filteredNota.length === 0) {
      alert("Tidak ada data untuk didownload");
      return;
    }

    // Map data agar format di Excel rapi
    const dataToExport = filteredNota.map((item, index) => ({
      'NO': index + 1,
      'TANGGAL FISIK': formatDate(item.tanggal_fisik),
      'TANGGAL KIRIM': formatDate(item.tanggal_dikirim),
      'NOMOR NOTA DINAS': item.nomer_surat || '-',
      'PEMBUAT': item.yang_membuat || '-',
      'PERIHAL': item.perihal || '-',
      'KETERANGAN': item.keterangan || '-',
      'LINK PDF': item.file_url || '-',
      'LINK KONSEP': item.file_mentahan_url || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Nota Dinas");

    // Download file
    XLSX.writeFile(workbook, `Arsip_Nota_Dinas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredNota.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredNota.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, startTanggalSk, endTanggalSk, startTanggalKirim, endTanggalKirim])

  async function confirmSoftDelete() {
    if (!selectedId) return
    
    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('nota_dinas')
        .update({ is_deleted: true })
        .eq('id', selectedId)

      if (error) throw error
      
      setShowDeleteModal(false)
      setSelectedId(null)
      fetchNota() 
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
    fetchNota()
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
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Pindahkan Ke Sampah?</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
              Data akan dipindahkan ke pusat sampah. Anda tetap bisa memulihkan data ini melalui menu sampah jika diperlukan.
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button 
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="bg-slate-100 py-2.5 rounded-lg font-black uppercase tracking-wider text-black"
              >
                Batal
              </button>
              <button 
                type="button"
                disabled={isDeleting}
                onClick={confirmSoftDelete}
                className="bg-red-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isDeleting ? 'PROSES...' : 'YA, PINDAHKAN'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mx-auto max-w-7xl">
        
        {/* HEADER COMPACT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b-2 border-blue-600 pb-4 gap-4 w-full">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 text-white p-3 rounded-xl text-2xl shadow-md font-black shrink-0">
               📝
             </div>
             <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-none text-black">
                  NOTA <span className="text-blue-600">DINAS</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">ARSIP NOTA DINAS CLOUD DATABASE</p>
             </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto text-[10px]">
            <button 
              onClick={downloadExcel}
              className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all hover:bg-slate-900 shadow-sm"
            >
              DOWNLOAD EXCEL
            </button>

            <Link 
              href="/nota_dinas/tambah"
              className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all hover:bg-slate-900 shadow-sm text-center"
            >
              TAMBAH NOTA BARU
            </Link>
          </div>
        </div>

        {/* --- PENCARIAN & TOGGLE FILTER COMPACT --- */}
        <div className="mb-4 w-full flex flex-col gap-3">
          <div className="flex flex-row items-center gap-3">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="CARI BERDASARKAN NOMOR, PEMBUAT, PERIHAL, ATAU KETERANGAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-wider text-black"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-blue-600'} border border-slate-200 shadow-sm rounded-lg px-4 py-2.5 text-[11px] font-black transition-all uppercase whitespace-nowrap`}
            >
              {showFilters ? 'TUTUP FILTER ▲' : 'FILTER TANGGAL ▼'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-blue-600 font-black uppercase text-[10px] mb-2 tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span> RENTANG TANGGAL FISIK (SK)
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <input 
                    type="date"
                    value={startTanggalSk}
                    onChange={(e) => setStartTanggalSk(e.target.value)}
                    className="bg-slate-50 p-2 rounded-md font-bold border border-slate-200 focus:outline-none focus:border-blue-600 uppercase text-black"
                  />
                  <input 
                    type="date"
                    value={endTanggalSk}
                    onChange={(e) => setEndTanggalSk(e.target.value)}
                    className="bg-slate-50 p-2 rounded-md font-bold border border-slate-200 focus:outline-none focus:border-blue-600 uppercase text-black"
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 font-black uppercase text-[10px] mb-2 tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span> RENTANG TANGGAL KIRIM
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <input 
                    type="date"
                    value={startTanggalKirim}
                    onChange={(e) => setStartTanggalKirim(e.target.value)}
                    className="bg-slate-50 p-2 rounded-md font-bold border border-slate-200 focus:outline-none focus:border-slate-900 uppercase text-black"
                  />
                  <input 
                    type="date"
                    value={endTanggalKirim}
                    onChange={(e) => setEndTanggalKirim(e.target.value)}
                    className="bg-slate-50 p-2 rounded-md font-bold border border-slate-200 focus:outline-none focus:border-slate-900 uppercase text-black"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- TABEL DATA COMPACT --- */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center font-black uppercase tracking-wider text-slate-300 animate-pulse">
            Syncing Cloud Data...
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <th className="p-3 text-center w-12 border-r border-slate-800">NO</th>
                      <th className="p-3 text-center w-28 border-r border-slate-800">TGL FISIK</th>
                      <th className="p-3 text-center w-28 border-r border-slate-800">TGL KIRIM</th>
                      <th className="p-3 border-r border-slate-800 w-52">NOMOR NODIN</th>
                      <th className="p-3 border-r border-slate-800 w-44">PEMBUAT</th>
                      <th className="p-3 border-r border-slate-800 w-64">PERIHAL</th>
                      <th className="p-3 border-r border-slate-800 w-52">KETERANGAN</th>
                      <th className="p-3 text-center w-32">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-16 text-center text-slate-300 font-black uppercase italic tracking-widest">
                          Hasil Pencarian Tidak Ditemukan
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-all">
                          <td className="p-2.5 text-center border-r border-slate-100 font-black text-slate-400">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="p-2.5 text-center border-r border-slate-100">
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold block whitespace-nowrap">
                              {formatDate(item.tanggal_fisik)}
                            </span>
                          </td>
                          <td className="p-2.5 text-center border-r border-slate-100">
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold block whitespace-nowrap">
                              {formatDate(item.tanggal_dikirim)}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-slate-100">
                            <p className="font-black uppercase tracking-tight text-black truncate" title={item.nomer_surat}>
                              {item.nomer_surat || 'TANPA NOMOR'}
                            </p>
                          </td>
                          <td className="p-2.5 border-r border-slate-100">
                            <p className="font-bold text-blue-600 uppercase truncate" title={item.yang_membuat}>
                              {item.yang_membuat || '-'}
                            </p>
                          </td>
                          <td className="p-2.5 border-r border-slate-100">
                            <p className="text-black font-bold uppercase line-clamp-2 leading-tight" title={item.perihal}>
                              {item.perihal || '-'}
                            </p>
                          </td>
                          <td className="p-2.5 border-r border-slate-100">
                            <p className="text-slate-500 font-medium uppercase line-clamp-2 leading-tight" title={item.keterangan}>
                              {item.keterangan || '-'}
                            </p>
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex flex-col gap-1.5 w-full">
                              {item.file_url ? (
                                <a 
                                  href={item.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="bg-blue-600 text-white py-1 rounded text-[9px] font-black uppercase text-center hover:bg-slate-900 transition-all tracking-wider whitespace-nowrap"
                                >
                                  LIHAT PDF ↗
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[9px] uppercase italic">No PDF</span>
                              )}

                              {item.file_mentahan_url ? (
                                <a 
                                  href={item.file_mentahan_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="bg-emerald-600 text-white py-1 rounded text-[9px] font-black uppercase text-center hover:bg-slate-900 transition-all tracking-wider whitespace-nowrap"
                                >
                                  FILE KONSEP ↗
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[9px] uppercase italic">No Konsep</span>
                              )}

                              <div className="grid grid-cols-2 gap-1 text-[9px]">
                                <Link 
                                  href={`/nota_dinas/edit/${item.id}`} 
                                  className="bg-slate-100 text-black py-1 rounded font-black uppercase text-center hover:bg-blue-600 hover:text-white transition-all border border-slate-200"
                                >
                                  EDIT
                                </Link>
                                <button 
                                  type="button"
                                  onClick={() => openDeleteModal(item.id)} 
                                  className="bg-red-50 text-red-600 py-1 rounded font-black uppercase text-center hover:bg-red-600 hover:text-white transition-all"
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
              <div className="mt-4 flex justify-center items-center gap-2 w-full text-[11px]">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-white px-3 py-1.5 rounded-md font-black shadow-sm disabled:opacity-30 hover:bg-blue-600 hover:text-white text-black border border-slate-200 uppercase"
                >
                  Prev
                </button>

                <div className="flex gap-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-md font-black text-xs transition-all ${
                          currentPage === pageNum 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'hover:bg-slate-100 text-black'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-white px-3 py-1.5 rounded-md font-black shadow-sm disabled:opacity-30 hover:bg-blue-600 hover:text-white text-black border border-slate-200 uppercase"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}