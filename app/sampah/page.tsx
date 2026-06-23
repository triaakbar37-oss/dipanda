'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PusatSampah() {
  const [trashData, setTrashData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<{ id: any, table: string }[]>([])

  // --- STATE UNTUK MODAL ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [targetRestore, setTargetRestore] = useState<{ id: any, table: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. AMBIL SEMUA DATA (TERMASUK TABEL KEGIATAN)
  async function fetchAllTrash() {
    setLoading(true)
    try {
      // Menambahkan 'kegiatan' ke dalam daftar tabel yang dicek
      const tables = ['surat_masuk', 'surat_keluar', 'nota_dinas', 'sk_bupati', 'sk_kadin', 'kegiatan']
      const requests = tables.map(table =>
        supabase.from(table).select('*').eq('is_deleted', true)
      )
      const results = await Promise.all(requests)
      const combined = results.flatMap((res, index) =>
        (res.data || []).map(item => ({
          ...item,
          origin_table: tables[index]
        }))
      )
      setTrashData(combined)
    } catch (error) {
      console.error("Error fetching trash:", error)
    } finally {
      setLoading(false)
    }
  }

  // --- LOGIKA FILTER PENCARIAN ---
  const filteredTrash = trashData.filter((item) => {
    const searchLow = searchTerm.toLowerCase()
    const identitas = (renderIdentitas(item) || '').toLowerCase()
    const perihal = (renderPerihal(item) || '').toLowerCase()
    const jenis = item.origin_table.toLowerCase()

    return identitas.includes(searchLow) || perihal.includes(searchLow) || jenis.includes(searchLow)
  })

  // --- PENYESUAIAN KOLOM IDENTITAS ---
  function renderIdentitas(item: any) {
    if (item.origin_table === 'surat_keluar') {
      return item.nomor_surat; 
    } else if (item.origin_table === 'sk_bupati' || item.origin_table === 'sk_kadin') {
      return item.nomer_sk;
    } else if (item.origin_table === 'kegiatan') {
      return item.tgl_input ? new Date(item.tgl_input).toLocaleDateString('id-ID') : 'TANPA TANGGAL';
    }
    return item.nomer_surat;
  }

  // --- PENYESUAIAN KOLOM PERIHAL ---
  function renderPerihal(item: any) {
    if (item.origin_table === 'sk_bupati' || item.origin_table === 'sk_kadin') {
      return item.tentang_sk;
    } else if (item.origin_table === 'kegiatan') {
      return item.nama_kegiatan;
    }
    return item.perihal;
  }

  // 2. LOGIKA CHECKLIST
  const toggleSelect = (id: any, table: string) => {
    const isSelected = selectedItems.find(i => i.id === id && i.table === table)
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => !(i.id === id && i.table === table)))
    } else {
      setSelectedItems([...selectedItems, { id, table }])
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredTrash.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredTrash.map(item => ({ id: item.id, table: item.origin_table })))
    }
  }

  // 3. EKSEKUSI HAPUS PERMANEN
  async function handleHardDelete() {
    setIsProcessing(true)
    try {
      for (const item of selectedItems) {
        await supabase.from(item.table).delete().eq('id', item.id)
      }
      setShowDeleteModal(false)
      setSelectedItems([])
      fetchAllTrash()
    } catch (error) {
      alert("Gagal menghapus data")
    } finally {
      setIsProcessing(false)
    }
  }

  // 4. EKSEKUSI PULIHKAN
  async function handleRestore() {
    if (!targetRestore) return
    setIsProcessing(true)
    try {
      await supabase.from(targetRestore.table).update({ is_deleted: false }).eq('id', targetRestore.id)
      setShowRestoreModal(false)
      setTargetRestore(null)
      fetchAllTrash()
    } catch (error) {
      alert("Gagal memulihkan data")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => { fetchAllTrash() }, [])

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-3 sm:p-6 text-black font-bold relative w-full text-xs">

      {/* --- MODAL POPUP HAPUS COMPACT --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isProcessing && setShowDeleteModal(false)}></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs text-center border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">!</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Hapus Permanen?</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">
              {selectedItems.length} data terpilih akan dihapus selamanya dari sistem cloud.
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button type="button" disabled={isProcessing} onClick={() => setShowDeleteModal(false)} className="bg-slate-100 py-2.5 rounded-lg font-black uppercase tracking-wider text-black">Batal</button>
              <button type="button" disabled={isProcessing} onClick={handleHardDelete} className="bg-red-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all shadow-md">
                {isProcessing ? 'PROSES...' : 'YA, HAPUS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PULIHKAN COMPACT --- */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isProcessing && setShowRestoreModal(false)}></div>
          <div className="bg-white rounded-xl p-6 shadow-xl relative z-10 w-full max-w-xs text-center border-2 border-white animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">↺</div>
            <h2 className="text-base font-black mb-2 uppercase tracking-tight text-black">Pulihkan Data?</h2>
            <p className="text-slate-500 font-bold mb-6 uppercase text-[9px] tracking-wider leading-normal">Data akan dikembalikan ke folder utama masing-masing.</p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <button type="button" disabled={isProcessing} onClick={() => setShowRestoreModal(false)} className="bg-slate-100 py-2.5 rounded-lg font-black uppercase tracking-wider text-black">Batal</button>
              <button type="button" disabled={isProcessing} onClick={handleRestore} className="bg-blue-600 text-white py-2.5 rounded-lg font-black uppercase tracking-wider transition-all shadow-md">
                {isProcessing ? 'PROSES...' : 'YA, PULIHKAN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTAINER FULL SCREEN */}
      <div className="w-full mx-auto max-w-7xl">
        {/* HEADER SECTION COMPACT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b-2 border-red-600 pb-4 gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-3 rounded-xl text-2xl shadow-md font-black shrink-0">🗑️</div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-none text-black">
                PUSAT <span className="text-red-600">SAMPAH</span>
              </h1>
              <p className="text-slate-400 font-bold tracking-wider text-[9px] mt-1 uppercase">Manajemen Arsip Terhapus (Terintegrasi Kegiatan)</p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto text-[10px]">
            {selectedItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all hover:bg-red-700 shadow-sm"
              >
                HAPUS ({selectedItems.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (trashData.length === 0) return;
                setSelectedItems(trashData.map(item => ({ id: item.id, table: item.origin_table })))
                setShowDeleteModal(true)
              }}
              className="flex-1 sm:flex-none bg-slate-900 text-white px-4 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all hover:bg-red-600 shadow-sm"
            >
              KOSONGKAN
            </button>
          </div>
        </div>

        {/* SEARCH BAR - COMPACT */}
        <div className="mb-4 relative w-full">
          <input
            type="text"
            placeholder="CARI NOMOR SURAT, NAMA KEGIATAN, ATAU JENIS ARSIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-wider text-black"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] font-black italic hidden md:block tracking-widest">SEARCH</div>
        </div>

        {/* TABLE SECTION - COMPACT */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="p-3 text-center w-12 border-r border-slate-800">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-red-600"
                      onChange={toggleSelectAll}
                      checked={filteredTrash.length > 0 && selectedItems.length === filteredTrash.length}
                    />
                  </th>
                  <th className="p-3 border-r border-slate-800 w-36">Jenis Arsip</th>
                  <th className="p-3 border-r border-slate-800 w-56">Nomer Surat / Tgl</th>
                  <th className="p-3 border-r border-slate-800">Perihal / Nama Kegiatan</th>
                  <th className="p-3 text-center w-28">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center font-black uppercase tracking-wider text-slate-300 animate-pulse">Syncing Cloud Data...</td>
                  </tr>
                ) : filteredTrash.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-slate-300 font-black uppercase italic tracking-widest">Folder Sampah Kosong</td>
                  </tr>
                ) : (
                  filteredTrash.map((item) => {
                    const isSelected = !!selectedItems.find(i => i.id === item.id && i.table === item.origin_table)
                    return (
                      <tr key={`${item.origin_table}-${item.id}`} className={`transition-all ${isSelected ? 'bg-red-50/60' : 'hover:bg-slate-50'}`}>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <input
                            type="checkbox"
                            className="w-4 h-4 cursor-pointer accent-red-600"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id, item.origin_table)}
                          />
                        </td>
                        <td className="p-2.5 border-r border-slate-100 font-medium">
                          <span className={`${item.origin_table === 'kegiatan' ? 'bg-blue-600' : 'bg-slate-900'} text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider whitespace-nowrap`}>
                            {item.origin_table.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2.5 border-r border-slate-100">
                          <p className="font-black uppercase tracking-tight text-black whitespace-nowrap max-w-[220px] truncate">
                            {renderIdentitas(item) || '---'}
                          </p>
                        </td>
                        <td className="p-2.5 border-r border-slate-100">
                          <p className="font-bold uppercase text-slate-500 line-clamp-1">
                            {renderPerihal(item) || '---'}
                          </p>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetRestore({ id: item.id, table: item.origin_table })
                              setShowRestoreModal(true)
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-[10px] font-black hover:bg-slate-900 transition-all uppercase tracking-wider"
                          >
                            PULIHKAN
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="text-center mt-6 text-black font-black uppercase tracking-[0.3em] text-[9px]">
          SISTEM KEAMANAN ARSIP DIGITAL AKTIF — 2026
        </p>
      </div>
    </div>
  )
}