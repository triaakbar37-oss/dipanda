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

  // 1. AMBIL SEMUA DATA
  async function fetchAllTrash() {
    setLoading(true)
    try {
      const tables = ['surat_masuk', 'surat_keluar', 'nota_dinas', 'sk_bupati', 'sk_kadin']
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

  // --- PENYESUAIAN KOLOM NOMOR/NOMER ---
  function renderIdentitas(item: any) {
    if (item.origin_table === 'surat_keluar') {
      return item.nomor_surat; // Sesuai permintaan: menggunakan 'nomor'
    } else if (item.origin_table === 'sk_bupati' || item.origin_table === 'sk_kadin') {
      return item.nomer_sk;
    }
    return item.nomer_surat;
  }

  function renderPerihal(item: any) {
    if (item.origin_table === 'sk_bupati' || item.origin_table === 'sk_kadin') {
      return item.tentang_sk;
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
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 text-black font-bold relative w-full">

      {/* --- MODAL POPUP --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => !isProcessing && setShowDeleteModal(false)}></div>
          <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl relative z-10 w-full max-w-xl text-center border-8 border-white animate-in zoom-in duration-300">
            <div className="w-28 h-28 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl font-black">!</div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none">Hapus Permanen?</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">
              {selectedItems.length} data terpilih akan dihapus selamanya.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button disabled={isProcessing} onClick={() => setShowDeleteModal(false)} className="bg-slate-100 py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all">Batal</button>
              <button disabled={isProcessing} onClick={handleHardDelete} className="bg-red-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all">
                {isProcessing ? 'PROSES...' : 'YA, HAPUS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PULIHKAN --- */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => !isProcessing && setShowRestoreModal(false)}></div>
          <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl relative z-10 w-full max-w-xl text-center border-8 border-white animate-in zoom-in duration-300">
            <div className="w-28 h-28 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl font-black">↺</div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none">Pulihkan Data?</h2>
            <p className="text-slate-500 font-bold mb-10 uppercase text-sm tracking-widest leading-relaxed">Data akan dikembalikan ke folder utama.</p>
            <div className="grid grid-cols-2 gap-4">
              <button disabled={isProcessing} onClick={() => setShowRestoreModal(false)} className="bg-slate-100 py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all">Batal</button>
              <button disabled={isProcessing} onClick={handleRestore} className="bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all">
                {isProcessing ? 'PROSES...' : 'YA, PULIHKAN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTAINER FULL SCREEN */}
      <div className="w-full">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-4 border-red-600 pb-8 gap-6">
          <div className="flex items-center gap-8">
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] text-5xl shadow-2xl shadow-blue-300 font-black">🗑️</div>
            <div>
              <h1 className="text-7xl font-black tracking-tighter uppercase leading-none text-black">
                PUSAT <span className="text-red-600">SAMPAH</span>
              </h1>
              <p className="text-black font-black tracking-[0.4em] text-sm mt-2 uppercase">Cloud Trash Management System</p>
            </div>
          </div>

          <div className="flex gap-4 w-full lg:w-auto">
            {selectedItems.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 lg:flex-none bg-red-600 text-white px-10 py-6 rounded-[2rem] font-black uppercase text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                HAPUS ({selectedItems.length})
              </button>
            )}
            <button
              onClick={() => {
                if (trashData.length === 0) return;
                setSelectedItems(trashData.map(item => ({ id: item.id, table: item.origin_table })))
                setShowDeleteModal(true)
              }}
              className="flex-1 lg:flex-none bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black uppercase text-sm shadow-2xl hover:bg-red-600 transition-all hover:scale-105 active:scale-95"
            >
              KOSONGKAN
            </button>
          </div>
        </div>

        {/* SEARCH BAR - FULL WIDTH */}
        <div className="mb-10 relative w-full">
          <input
            type="text"
            placeholder="CARI BERDASARKAN NOMOR ATAU PERIHAL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-4 border-white shadow-2xl rounded-[2.5rem] px-10 py-8 text-xl font-black focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-widest"
          />
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-300 text-3xl italic hidden md:block">SEARCH</div>
        </div>

        {/* TABLE SECTION - FULL WIDTH */}
        <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border-[12px] border-white w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-base tracking-[0.2em]">
                  <th className="p-10 text-center w-24 border-r border-slate-800">
                    <input
                      type="checkbox"
                      className="w-8 h-8 cursor-pointer accent-red-600"
                      onChange={toggleSelectAll}
                      checked={filteredTrash.length > 0 && selectedItems.length === filteredTrash.length}
                    />
                  </th>
                  <th className="p-10 border-r border-slate-800">Jenis</th>
                  <th className="p-10 border-r border-slate-800">Identitas</th>
                  <th className="p-10 border-r border-slate-800">Perihal</th>
                  <th className="p-10 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-32 text-center text-3xl font-black uppercase tracking-widest text-slate-300 animate-pulse">Syncing...</td>
                  </tr>
                ) : filteredTrash.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-40 text-center text-4xl text-slate-200 font-black uppercase italic">Kosong</td>
                  </tr>
                ) : (
                  filteredTrash.map((item) => {
                    const isSelected = !!selectedItems.find(i => i.id === item.id && i.table === item.origin_table)
                    return (
                      <tr key={`${item.origin_table}-${item.id}`} className={`transition-all ${isSelected ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                        <td className="p-10 text-center border-r border-slate-50">
                          <input
                            type="checkbox"
                            className="w-8 h-8 cursor-pointer accent-red-600"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id, item.origin_table)}
                          />
                        </td>
                        <td className="p-10 border-r border-slate-50">
                          <span className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap">
                            {item.origin_table.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-10 border-r border-slate-50">
                          <p className="text-3xl font-black uppercase tracking-tighter text-black leading-none whitespace-nowrap">
                            {renderIdentitas(item) || '---'}
                          </p>
                        </td>
                        <td className="p-10 border-r border-slate-50">
                          <p className="text-lg font-bold uppercase text-slate-500 leading-tight">
                            {renderPerihal(item) || '---'}
                          </p>
                        </td>
                        <td className="p-10 text-center">
                          <button
                            onClick={() => {
                              setTargetRestore({ id: item.id, table: item.origin_table })
                              setShowRestoreModal(true)
                            }}
                            className="bg-blue-600 text-white px-8 py-5 rounded-[1.5rem] text-sm font-black hover:bg-slate-900 transition-all uppercase tracking-widest shadow-xl"
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
      </div>
    </div>
  )
}