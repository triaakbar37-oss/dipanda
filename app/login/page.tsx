'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // MENGARAHKAN LANGSUNG KE DASHBOARD UTAMA YANG BARU
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      alert('Gagal Login: ' + error.message)
    } finally {
      loading && setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Efek Cahaya Estetis */}
      <div style={styles.glowLight1}></div>
      <div style={styles.glowLight2}></div>

      {/* KOTAK LOGIN */}
      <div style={styles.card}>
        {/* HEADER BRANDING */}
        <div style={styles.header}>
          <div style={styles.iconBox}>
            <span style={{ fontSize: '18px' }}>📂</span>
          </div>
          <div style={styles.brandContainer}>
            <h1 style={styles.title}>
              E-Arsip <span style={styles.accentText}>DIPANDA</span>
            </h1>
            <p style={styles.tagline}>MUTU PENDIDIKAN DASAR</p>
          </div>
        </div>

        <div style={styles.divider}></div>

        {/* FORM AUTENTIKASI */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>ALAMAT EMAIL OPERATOR</label>
            <input
              type="email"
              required
              placeholder="admin@dipanda.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>KATA SANDI</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: '42px', width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {/* Tombol Lihat Password Menggunakan Icon Mata Elegan */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
                tabIndex={-1}
                title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
              >
                {showPassword ? (
                  // Ikon Mata Terbuka
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  // Ikon Mata Dicoret / Tertutup
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'MEMVERIFIKASI...' : 'MASUK KE DASHBOARD'}
          </button>
        </form>

        {/* FOOTER */}
        <p style={styles.footerText}>
          &copy; 2026 ARCHIVE SYSTEM • DINAS PENDIDIKAN
        </p>
      </div>
    </div>
  )
}

// ARSITEKTUR STYLING GAYA GELAP MODERN
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1329', 
    backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '24px 24px',
    fontFamily: 'sans-serif',
    padding: '16px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
  },
  glowLight1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    top: '-10%',
    left: '-5%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  glowLight2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    bottom: '-15%',
    right: '-5%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: '360px',
    backgroundColor: 'rgba(15, 23, 42, 0.85)', 
    backdropFilter: 'blur(12px)', 
    borderRadius: '16px',
    border: '1px solid rgba(51, 65, 85, 0.5)', 
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
    padding: '32px',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 10, 
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  iconBox: {
    backgroundColor: '#2563eb', 
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)', 
  },
  brandContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '15px',
    fontWeight: 900,
    color: '#ffffff',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '-0.025em',
    fontStyle: 'italic',
  },
  accentText: {
    color: '#3b82f6', 
  },
  tagline: {
    fontSize: '7px',
    color: '#94a3b8', 
    fontWeight: 'bold',
    letterSpacing: '0.1em',
    margin: '2px 0 0 0',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(to right, rgba(51, 65, 85, 1), rgba(51, 65, 85, 0.2))',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    fontSize: '8.5px',
    fontWeight: 800,
    color: '#94a3b8',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '11px 14px',
    backgroundColor: 'rgba(30, 41, 59, 0.7)', 
    border: '1px solid #334155',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  toggleButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  button: {
    backgroundColor: '#2563eb', 
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    marginTop: '8px',
    textTransform: 'uppercase',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '7px',
    fontWeight: 700,
    color: '#475569',
    marginTop: '28px',
    letterSpacing: '0.05em',
    margin: '28px 0 0 0',
  },
}