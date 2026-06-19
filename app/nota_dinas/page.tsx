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


      <div className="w-full mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-4 border-blue-600 pb-8 gap-6">
          <div className="flex items-center gap-6">
             <div className="bg-blue-600 text-white p-6 rounded-[2rem] text-5xl shadow-2xl shadow-blue-300 font-black">
               📝
             </div>
             <div>
                <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-black">
                  NOTA <span className="text-blue-600">DINAS</span>
                </h1>
                <p className="text-black font-black tracking-[0.4em] text-base mt-2 uppercase">ARSIP NOTA DINAS CLOUD DATABASE</p>
             </div>
          </div>
          
          <div className="flex flex-row gap-4">
            {/* TOMBOL DOWNLOAD EXCEL - DITAMBAHKAN DISINI */}
            <button 
              onClick={downloadExcel}
              className="bg-emerald-600 hover:bg-slate-900 text-white px-10 py-7 rounded-[2.5rem] font-black shadow-2xl shadow-emerald-200 transition-all active:scale-95 uppercase tracking-widest text-lg"
            >
              DOWNLOAD EXCEL
            </button>

            <Link 
              href="/nota_dinas/tambah"
              className="bg-blue-600 hover:bg-slate-900 text-white px-12 py-7 rounded-[2.5rem] font-black shadow-2xl shadow-blue-200 transition-all active:scale-95 uppercase tracking-widest text-lg"
            >
              TAMBAH NOTA BARU
            </Link>
          </div>
        </div>

        {/* --- PENCARIAN & TOGGLE FILTER --- */}
        <div className="mb-10 w-full flex flex-col gap-6">
          <div className="flex flex-row items-center gap-6">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="CARI BERDASARKAN NOMOR, PEMBUAT, PERIHAL, ATAU KETERANGAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-4 border-white shadow-2xl rounded-[2.5rem] px-10 py-7 text-xl font-black focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-widest"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-blue-600'} border-4 border-white shadow-2xl rounded-[2.5rem] px-10 py-7 text-base font-black transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter`}
            >
              {showFilters ? 'Tutup Filter ▲' : 'Filter Tanggal ▼'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-blue-50">
                <h3 className="text-blue-600 font-black uppercase text-sm mb-4 tracking-widest flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-600 rounded-full"></span> RENTANG TANGGAL FISIK (SK)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="date"
                    value={startTanggalSk}
                    onChange={(e) => setStartTanggalSk(e.target.value)}
                    className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                  />
                  <input 
                    type="date"
                    value={endTanggalSk}
                    onChange={(e) => setEndTanggalSk(e.target.value)}
                    className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                  />
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-slate-50">
                <h3 className="text-slate-500 font-black uppercase text-sm mb-4 tracking-widest flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-400 rounded-full"></span> RENTANG TANGGAL KIRIM
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="date"
                    value={startTanggalKirim}
                    onChange={(e) => setStartTanggalKirim(e.target.value)}
                    className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase"
                  />
                  <input 
                    type="date"
                    value={endTanggalKirim}
                    onChange={(e) => setEndTanggalKirim(e.target.value)}
                    className="bg-slate-50 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- TABEL DATA --- */}
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
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 text-center w-40">TGL FISIK</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 text-center w-40">TGL KIRIM</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 w-64">NOMOR NODIN</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 w-56">PEMBUAT</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 w-72">PERIHAL</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm border-r border-slate-700 w-64">KETERANGAN</th>
                      <th className="px-8 py-10 font-black uppercase tracking-wider text-sm text-center w-48">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-20 text-slate-300 font-black uppercase tracking-widest italic text-2xl">
                          HASIL PENCARIAN TIDAK DITEMUKAN
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-blue-50/80 transition-all group">
                          <td className="px-6 py-12 text-center border-r border-slate-100 font-black text-xl text-slate-400">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="px-8 py-12 text-center border-r border-slate-100">
                            <div className="bg-blue-50 text-black p-4 rounded-2xl font-black text-base">
                              {formatDate(item.tanggal_fisik)}
                            </div>
                          </td>
                          <td className="px-8 py-12 text-center border-r border-slate-100">
                            <div className="bg-slate-100 text-black p-4 rounded-2xl font-black text-base shadow-inner">
                              {formatDate(item.tanggal_dikirim)}
                            </div>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <p className="font-black text-black text-2xl tracking-tighter uppercase truncate overflow-hidden" title={item.nomer_surat}>
                                {item.nomer_surat || 'TANPA NOMOR'}
                            </p>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <p className="font-black text-blue-600 text-lg uppercase italic truncate" title={item.yang_membuat}>
                                {item.yang_membuat || '-'}
                            </p>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <div className="w-full">
                               <p className="text-black font-black uppercase text-sm leading-relaxed line-clamp-3 overflow-hidden break-words" title={item.perihal}>
                                   {item.perihal || '-'}
                               </p>
                            </div>
                          </td>
                          <td className="px-8 py-12 border-r border-slate-100">
                            <div className="w-full">
                               <p className="text-slate-500 font-bold uppercase text-xs leading-relaxed line-clamp-3 overflow-hidden break-words" title={item.keterangan}>
                                   {item.keterangan || '-'}
                               </p>
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
                                    LIHAT PDF ↗
                                  </a>
                               ) : (
                                  <span className="text-slate-400 text-[10px] uppercase italic">PDF Tidak Ada</span>
                               )}

                               {item.file_mentahan_url ? (
                                  <a 
                                    href={item.file_mentahan_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black uppercase text-center shadow-lg hover:bg-slate-900 transition-all tracking-widest"
                                  >
                                    FILE KONSEP ↗
                                  </a>
                               ) : (
                                  <span className="text-slate-400 text-[10px] uppercase italic">Konsep Tidak Ada</span>
                               )}

                              <div className="grid grid-cols-2 gap-3">
                                <Link 
                                  href={`/nota_dinas/edit/${item.id}`} 
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
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-16 h-16 rounded-2xl font-black text-xl transition-all ${
                            currentPage === pageNum 
                            ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-300' 
                            : 'hover:bg-blue-50 text-black'
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