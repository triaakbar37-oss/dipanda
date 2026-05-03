'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [counts, setCounts] = useState({ 
    masuk: 0, keluar: 0, notaDinas: 0, skBupati: 0, skKadin: 0 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getStats() {
      try {
        setLoading(true)
        const [
          { count: cMasuk }, { count: cKeluar }, { count: cNota }, { count: cSkBupati }, { count: cSkKadin }
        ] = await Promise.all([
          supabase.from('surat_masuk').select('*', { count: 'exact', head: true }),
          supabase.from('surat_keluar').select('*', { count: 'exact', head: true }),
          supabase.from('nota_dinas').select('*', { count: 'exact', head: true }),
          supabase.from('sk_bupati').select('*', { count: 'exact', head: true }),
          supabase.from('sk_kadin').select('*', { count: 'exact', head: true })
        ])
        setCounts({ 
          masuk: cMasuk || 0, keluar: cKeluar || 0, notaDinas: cNota || 0, skBupati: cSkBupati || 0, skKadin: cSkKadin || 0 
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    getStats()
  }, [])

  return (
    <div style={{ backgroundColor: '#f8fafc', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"Plus Jakarta Sans", sans-serif', overflow: 'hidden' }}>
      
      {/* 1. HEADER BANNER */}
      <div style={{ position: 'relative', width: '100%', height: '38vh' }}>
        <img 
          src="/assets/header.png" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          alt="Banner"
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 20%, rgba(15, 23, 42, 0.4) 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 60px' 
        }}>
          <div>
            <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: '1.1', letterSpacing: '-0.03em' }}>
              PANEL STATISTIK <br/> 
              <span style={{ color: '#3b82f6' }}>E-ARSIP BIDANG PENINGKATAN MUTU</span> <br></br>
              <span style={{ color: '#3b82f6' }}>PENDIDIKAN DASAR</span> <br></br>
            </h1>
            <div style={{ width: '60px', height: '4px', backgroundColor: '#3b82f6', margin: '20px 0' }}></div>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500, maxWidth: '500px', lineHeight: '1.6', margin: 0 }}>
              Sistem Pemantauan Data Real-time Pengelolaan Arsip Digital Bidang Peningkatan Mutu Pendidikan Dasar Dinas Pendidikan Kabupaten Bojonegoro.
            </p>
          </div>
        </div>
      </div>

      {/* 2. STATISTIC BOXES - Lebih Variatif & Terisi */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 60px' }}> 
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '25px',
          maxWidth: '1500px',
          width: '100%',
          margin: '0 auto'
        }}>
          
          {[
            { label: 'Arsip Masuk', val: counts.masuk, icon: '📥', color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Arsip Keluar', val: counts.keluar, icon: '📤', color: '#10b981', bg: '#ecfdf5' },
            { label: 'Nota Dinas', val: counts.notaDinas, icon: '📝', color: '#f59e0b', bg: '#fffbeb' },
            { label: 'SK Bupati', val: counts.skBupati, icon: '🏛️', color: '#8b5cf6', bg: '#f5f3ff' },
            { label: 'SK Kadin', val: counts.skKadin, icon: '📜', color: '#ef4444', bg: '#fef2f2' }
          ].map((item, i) => (
            <div key={i} style={{ 
              background: '#ffffff', 
              borderRadius: '32px', 
              padding: '40px 20px', 
              textAlign: 'center', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease'
            }}>
              {/* Decorative Background Element agar tidak kosong */}
              <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                right: '-20px', 
                width: '100px', 
                height: '100px', 
                background: item.bg, 
                borderRadius: '50%', 
                zIndex: 0,
                opacity: 0.5
              }}></div>

              {/* Icon Container */}
              <div style={{ 
                width: '64px', height: '64px', 
                backgroundColor: item.bg, borderRadius: '20px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', marginBottom: '20px',
                color: item.color,
                position: 'relative',
                zIndex: 1,
                boxShadow: `0 10px 15px -3px ${item.bg}`
              }}>
                {item.icon}
              </div>

              {/* Label */}
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 800, 
                color: '#64748b', 
                textTransform: 'uppercase', 
                letterSpacing: '2px', 
                marginBottom: '10px',
                position: 'relative',
                zIndex: 1 
              }}>
                {item.label}
              </h3>

              {/* Value */}
              <p style={{ 
                fontSize: '4rem', 
                fontWeight: 900, 
                color: '#1e293b', 
                margin: 0, 
                lineHeight: 1,
                position: 'relative',
                zIndex: 1,
                letterSpacing: '-2px'
              }}>
                {loading ? '...' : item.val}
              </p>

              {/* Progress/Indicator bar mini agar visual lebih padat */}
              <div style={{ 
                width: '80%', 
                height: '6px', 
                backgroundColor: '#f1f5f9', 
                borderRadius: '10px', 
                marginTop: '25px',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ 
                  width: loading ? '0%' : '100%', 
                  height: '100%', 
                  backgroundColor: item.color,
                  borderRadius: '10px',
                  transition: 'width 1s ease-out'
                }}></div>
              </div>
              
              <span style={{ 
                marginTop: '10px', 
                fontSize: '10px', 
                color: '#94a3b8', 
                fontWeight: 700,
                textTransform: 'uppercase' 
              }}>
                Total Terdata
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FOOTER */}
      <footer style={{ backgroundColor: '#0f172a', color: 'white', padding: '30px 60px 25px 60px', borderTop: '4px solid #3b82f6' }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '100px' }}>
                  <img src="/assets/logo.png" alt="Logo" style={{ height: '85px', width: 'auto', filter: 'brightness(1.1)' }} />
                </td>
                <td style={{ paddingLeft: '30px', borderLeft: '2px solid rgba(59, 130, 246, 0.5)' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Dinas Pendidikan</h2>
                  <p style={{ color: '#3b82f6', fontWeight: 700, margin: '2px 0', textTransform: 'uppercase', fontSize: '13px' }}>Kabupaten Bojonegoro</p>
                  <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Bidang Peningkatan Mutu Pendidikan Dasar
                  </p>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '9px', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Alamat Kantor</span>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0', fontWeight: 500 }}>Jl. Pattimura No.09, Bojonegoro, Jawa Timur</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Layanan Online</span>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0', fontWeight: 500 }}>disdik.bojonegorokab.go.id</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '25px', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '9px', color: '#475569', letterSpacing: '3px', fontWeight: 800, margin: 0 }}>
              © 2026 E-ARSIP DIGITAL — DINAS PENDIDIKAN | DESIGNED & DEVELOPED BY DETRIA AKBAR
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}