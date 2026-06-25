'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EPelayananPage() {
  const router = useRouter()
  
  // Perbaikan 1: Setel default ke false agar portal publik langsung terbuka instan tanpa delay
  const [authLoading, setAuthLoading] = useState(false)
  
  // State untuk Fitur Portal & FAQ
  const [activeTab, setActiveTab] = useState<'pip' | 'mutasi' | 'ijazah'>('pip')
  const [searchQuery, setSearchQuery] = useState('')
  
  // State untuk Modal Login E-Arsip
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Perbaikan 2: Lakukan pengecekan sesi di latar belakang (background check) tanpa mengunci UI publik
  useEffect(() => {
    // Jalankan pengecekan sesi secara asinkronus
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Jika operator terdeteksi sudah login, kunci layar sebentar lalu lempar ke dashboard
          setAuthLoading(true)
          router.replace('/dashboard')
        }
      } catch (error) {
        console.error("Auth check error:", error)
      }
    }

    checkSession()
  }, [router])

  // 1. DATA FAQ PIP RESMI KABUPATEN BOJONEGORO
  const pipData = [
    { q: "Apa yang dimaksud dengan Program Indonesia Pintar (PIP)?", a: "Program Indonesia Pintar (PIP) merupakan salah satu program bantuan dari pemerintah yang diberikan kepada peserta didik yang membutuhkan dukungan biaya pendidikan. Bantuan ini bertujuan untuk membantu siswa agar tetap dapat melanjutkan pendidikan dan mengurangi risiko putus sekolah karena kendala ekonomi." },
    { q: "Siapa saja yang berhak mendapatkan bantuan PIP?", a: "Penerima PIP adalah peserta didik yang memenuhi kriteria sesuai ketentuan pemerintah, terutama siswa yang berasal dari keluarga kurang mampu atau memiliki kondisi tertentu yang membutuhkan bantuan pendidikan. Beberapa peserta didik yang menjadi prioritas antara lain: Memiliki Kartu Indonesia Pintar (KIP), terdata sebagai keluarga kurang mampu, memiliki kondisi khusus seperti yatim/piatu atau terdampak kondisi tertentu, serta berpotensi mengalami hambatan dalam melanjutkan sekolah." },
    { q: "Apakah semua siswa kurang mampu pasti mendapatkan PIP?", a: "Tidak semua siswa yang kurang mampu langsung mendapatkan bantuan PIP. Penerima ditentukan melalui proses pendataan, pengusulan dari sekolah, verifikasi data, serta penyesuaian dengan kuota dan kebijakan pemerintah." },
    { q: "Bagaimana cara mendapatkan bantuan PIP?", a: "Orang tua atau wali tidak mengajukan langsung ke Dinas Pendidikan. Proses pengusulan dilakukan melalui sekolah masing-masing. Sekolah akan melakukan pendataan peserta didik, memastikan kelengkapan data, kemudian mengusulkan siswa yang memenuhi kriteria melalui sistem yang telah ditentukan pemerintah." },
    { q: "Apa saja persyaratan agar bisa diusulkan mendapatkan PIP?", a: "Secara umum, peserta didik perlu memastikan beberapa data sudah sesuai, seperti: Memiliki NISN, memiliki NIK yang benar, terdaftar sebagai siswa aktif, data keluarga sesuai kondisi sebenarnya, dan memenuhi kriteria penerima bantuan." },
    { q: "Bagaimana cara mengetahui apakah anak saya mendapatkan PIP?", a: "Informasi penerima PIP dapat ditanyakan melalui pihak sekolah masing-masing. Sekolah dapat membantu melakukan pengecekan status penerimaan berdasarkan data peserta didik." },
    { q: "Mengapa tahun lalu mendapatkan PIP tetapi tahun ini tidak mendapatkan?", a: "Penerima PIP dapat berubah setiap periode karena dilakukan pemutakhiran data. Siswa yang pernah menerima bantuan sebelumnya tidak otomatis menjadi penerima kembali pada tahun berikutnya." },
    { q: "Berapa jumlah bantuan yang diterima dari PIP?", a: "Besaran bantuan PIP menyesuaikan jenjang pendidikan peserta didik, yaitu: Jenjang SD/sederajat Rp450.000 per tahun, Jenjang SMP/sederajat Rp750.000 per tahun, dan Jenjang SMA/SMK/sederajat Rp1.000.000 per tahun. Jumlah tersebut dapat menyesuaikan kebijakan dan ketentuan yang berlaku." },
    { q: "Kapan dana PIP bisa dicairkan?", a: "Pencairan dana PIP dilakukan secara bertahap sesuai jadwal yang ditetapkan pemerintah. Waktu pencairan setiap siswa dapat berbeda tergantung proses administrasi dan status penerima." },
    { q: "Apa yang harus dilakukan jika dana PIP belum masuk?", a: "Apabila dana belum diterima, orang tua/wali dapat melakukan pengecekan terlebih dahulu melalui sekolah. Kemungkinan terdapat proses yang masih berjalan seperti aktivasi rekening, verifikasi data, atau menunggu tahap pencairan." },
    { q: "Apakah siswa pindahan masih bisa mendapatkan PIP?", a: "Siswa pindahan tetap memiliki kesempatan mendapatkan PIP selama data peserta didik sudah diperbarui oleh sekolah dan memenuhi ketentuan penerima bantuan." },
    { q: "Apakah wajib memiliki KIP untuk mendapatkan PIP?", a: "Tidak selalu. KIP menjadi salah satu dasar penerima bantuan, namun penetapan penerima PIP juga mempertimbangkan hasil pendataan dan pengusulan sesuai kriteria yang berlaku." },
    { q: "Mengapa teman satu sekolah mendapatkan PIP sedangkan anak saya belum?", a: "Setiap siswa memiliki kondisi data yang berbeda. Penetapan penerima berdasarkan data yang masuk, hasil verifikasi, serta kriteria yang telah ditentukan pemerintah." },
    { q: "Apakah Dinas Pendidikan dapat langsung memberikan atau mencairkan dana PIP?", a: "Dinas Pendidikan tidak melakukan pencairan dana secara langsung kepada siswa. Dinas berperan dalam koordinasi, pendampingan, dan pelayanan informasi terkait pelaksanaan program PIP." }
  ]

  // 2. DATA FAQ MUTASI RESMI KABUPATEN BOJONEGORO
  const mutasiData = [
    { q: "Apa saja persyaratan Mutasi Keluar Siswa Jenjang SD/SMP Sederajat?", a: "Persyaratan meliputi: 1) Surat pernyataan pindah dari orang tua, 2) Surat Keterangan dari sekolah asal, 3) Surat keterangan bersedia menerima siswa baru dari sekolah tujuan, 4) Fotokopi KTP, 5) Fotokopi KK, 6) Fotokopi Akta Lahir, dan 7) Fotokopi Raport Semester Akhir." },
    { q: "Apa saja persyaratan Mutasi Masuk Siswa Jenjang SD/SMP Sederajat?", a: "Persyaratan meliputi: 1) Surat Rekomendasi dari Dinas Pendidikan/Kemenag, 2) Surat Pernyataan pindah dari orang tua, 3) Surat Keterangan dari asal sekolah, 4) Surat Keterangan bersedia menerima siswa baru dari sekolah tujuan, 5) Fotokopi KTP, 6) Fotokopi KK, 7) Fotokopi Akta Lahir, dan 8) Fotokopi Raport Semester Akhir." },
    { q: "Apakah mutasi bisa dilakukan jika sekolah tujuan sudah penuh?", a: "Mutasi tetap harus memperhatikan daya tampung sekolah tujuan. Apabila jumlah siswa sudah memenuhi kapasitas, sekolah dapat mempertimbangkan sesuai aturan yang berlaku." },
    { q: "Apakah siswa dari luar Kabupaten Bojonegoro bisa masuk ke sekolah di Bojonegoro?", a: "Bisa, selama memenuhi persyaratan mutasi dan mendapatkan persetujuan dari sekolah tujuan serta mengikuti prosedur administrasi yang berlaku." },
    { q: "Apakah siswa dari Kabupaten Bojonegoro bisa pindah ke luar daerah?", a: "Bisa. Siswa dapat mengajukan mutasi keluar dengan mengikuti prosedur yang ditetapkan sekolah asal dan sekolah tujuan." },
    { q: "Bagaimana jika data siswa belum masuk di sekolah baru?", a: "Setelah proses mutasi selesai, sekolah tujuan akan melakukan pembaruan data peserta didik sesuai mekanisme pendataan yang berlaku. Orang tua/wali dapat berkoordinasi dengan sekolah tujuan." },
    { q: "Apakah mutasi siswa harus melalui Dinas Pendidikan?", a: "Tidak semua proses mutasi harus datang langsung ke Dinas Pendidikan. Umumnya proses administrasi dilakukan melalui sekolah asal dan sekolah tujuan. Dinas Pendidikan berperan dalam pelayanan, koordinasi, serta penanganan apabila terdapat kendala sesuai kewenangan." },
    { q: "Apakah siswa kelas akhir bisa melakukan mutasi?", a: "Mutasi pada kelas akhir perlu memperhatikan ketentuan yang berlaku karena berkaitan dengan administrasi kelulusan, ujian, dan pendataan peserta didik." },
    { q: "Bagaimana jika orang tua sudah pindah tempat tinggal tetapi anak masih sekolah di tempat lama?", a: "Orang tua dapat melakukan konsultasi dengan sekolah terkait pilihan terbaik, apakah tetap melanjutkan di sekolah lama atau mengajukan mutasi sesuai kondisi yang ada." }
  ]

  // 3. DATA FAQ IJAZAH RESMI KABUPATEN BOJONEGORO
  const ijazahData = [
    { q: "Bagaimana latar belakang pengurusan dan pembagian Ijazah?", a: "Ijazah diberikan setelah peserta didik dinyatakan lulus dan seluruh proses administrasi sekolah selesai. Waktu pembagian ijazah menyesuaikan dengan kebijakan sekolah dan ketentuan dari pemerintah. Ijazah diambil melalui sekolah tempat peserta didik menyelesaikan pendidikan terakhir. Dinas Pendidikan tidak membagikan ijazah secara langsung kepada peserta didik karena penerbitan dan penyerahan dilakukan oleh satuan pendidikan." },
    { q: "Apa yang harus dilakukan pertama kali jika ijazah hilang atau rusak?", a: "Pemilik ijazah dapat melakukan pengurusan dokumen pengganti melalui sekolah yang menerbitkan ijazah tersebut. Langkah awal yang dilakukan: 1) Melapor kepada pihak sekolah asal/penerbit ijazah, 2) Menyiapkan dokumen pendukung, 3) Mengikuti proses verifikasi data oleh sekolah, dan 4) Mengajukan penerbitan dokumen pengganti sesuai prosedur." },
    { q: "Apakah ijazah bisa diperbaiki langsung di Dinas Pendidikan?", a: "Perbaikan ijazah tidak langsung dilakukan oleh Dinas Pendidikan. Proses awal dilakukan melalui sekolah penerbit karena sekolah memiliki data dan dokumen pendukung peserta didik." },
    { q: "Bagaimana jika sekolah sudah tidak beroperasi atau berganti nama?", a: "Apabila sekolah sudah tidak beroperasi, peserta didik dapat melakukan konsultasi dengan Dinas Pendidikan untuk mendapatkan informasi terkait penyelesaian administrasi ijazah sesuai ketentuan yang berlaku." },
    { q: "Apakah ijazah boleh diambil oleh orang lain?", a: "Pengambilan ijazah dapat dilakukan oleh orang yang diberi kewenangan sesuai ketentuan sekolah. Biasanya diperlukan identitas asli penerima kuasa dan bukti hubungan dengan peserta didik." },
    { q: "Apakah surat keterangan lulus bisa menggantikan ijazah?", a: "Surat Keterangan Lulus (SKL) dapat digunakan sementara untuk kebutuhan tertentu sebelum ijazah diterbitkan atau diterima, sesuai dengan kebijakan lembaga yang membutuhkan dokumen tersebut." },
    { q: "Bagaimana jika nama di ijazah berbeda dengan Kartu Keluarga atau KTP?", a: "Segera lakukan pengecekan dan konsultasi kepada sekolah penerbit ijazah. Perbedaan data perlu diselesaikan melalui proses verifikasi dokumen pendukung." },
    { q: "Apakah ijazah boleh dilaminasi?", a: "Sebaiknya tidak melakukan perubahan fisik pada ijazah seperti laminasi, karena dapat memengaruhi keaslian dan kondisi dokumen apabila diperlukan pemeriksaan hukum." },
    { q: "Apakah Dinas Pendidikan dapat membantu mengecek keaslian ijazah?", a: "Dinas Pendidikan dapat memberikan pelayanan informasi dan membantu proses koordinasi sesuai kewenangan. Pengecekan biasanya dilakukan berdasarkan data penerbitan ijazah dari satuan pendidikan." }
  ]

  // Filter Data Berdasarkan Tab Aktif & Input Pencarian
  const activeData = activeTab === 'pip' ? pipData : activeTab === 'mutasi' ? mutasiData : ijazahData
  const filteredData = activeData.filter(item => 
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Fungsi Login Supabase Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      setIsModalOpen(false)
      window.location.href = '/dashboard'
    } catch (error: any) {
      alert('Koneksi Gagal/Kredensial Salah: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Hanya memblokir layar jika proses pengalihan rute ke /dashboard sedang berjalan
  if (authLoading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.15em', color: '#64748b', textTransform: 'uppercase' }}>
            Mengalihkan ke Dashboard Internal...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.glowLight1}></div>
      <div style={styles.glowLight2}></div>

      {/* NAVBAR ATAS */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>
          <div style={styles.iconBox}>📂</div>
          <div>
            <span style={styles.navTitle}>E-PELAYANAN <span style={{color: '#3b82f6'}}>DIPANDA</span></span>
            <div style={styles.navSubtitle}>DINAS PENDIDIKAN KABUPATEN BOJONEGORO</div>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={styles.loginTriggerBtn}>
          🔒 LOGIN OPERATOR
        </button>
      </nav>

      {/* HERO SECTION */}
      <header style={styles.hero}>
        <h2 style={styles.heroTitle}>Pusat Informasi & Pelayanan Mandiri</h2>
        <p style={styles.heroDesc}>Silakan cari panduan pengurusan Program Indonesia Pintar (PIP), Mutasi Siswa, dan Penggantian Ijazah secara transparan.</p>
        
        <div style={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Ketik kata kunci pertanyaan Anda di sini..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </header>

      {/* MAIN CONTENT FAQ */}
      <main style={styles.mainContent}>
        <div style={styles.tabWrapper}>
          <button 
            onClick={() => { setActiveTab('pip'); setSearchQuery(''); }} 
            style={{...styles.tabBtn, backgroundColor: activeTab === 'pip' ? '#2563eb' : '#1e293b'}}
          >
            💳 PROGRAM INDONESIA PINTAR (PIP)
          </button>
          <button 
            onClick={() => { setActiveTab('mutasi'); setSearchQuery(''); }} 
            style={{...styles.tabBtn, backgroundColor: activeTab === 'mutasi' ? '#2563eb' : '#1e293b'}}
          >
            🔄 MUTASI SISWA (SD/SMP)
          </button>
          <button 
            onClick={() => { setActiveTab('ijazah'); setSearchQuery(''); }} 
            style={{...styles.tabBtn, backgroundColor: activeTab === 'ijazah' ? '#2563eb' : '#1e293b'}}
          >
            🎓 TENTANG IJAZAH
          </button>
        </div>

        {/* NOTIFIKASI KHUSUS JIKA MEMBUKA TAB IJAZAH */}
        {activeTab === 'ijazah' && (
          <div style={styles.driveAlert}>
            <span style={{fontSize: '16px'}}>📄</span>
            <div style={{flex: 1}}>
              <span style={{fontWeight: 'bold', display: 'block', fontSize: '11px', color: '#3b82f6'}}>DOKUMEN PANDUAN RESMI</span>
              <p style={{margin: '2px 0 0 0', fontSize: '10px', color: '#94a3b8'}}>Terkait Persyaratan dan Format Pengurusan Ijazah yang hilang/rusak dapat diunduh pada tautan berkas berikut:</p>
            </div>
            <a 
              href="https://drive.google.com/drive/folders/1_LYdixWL5d7824cyhVnTD9h0jpeaNRUN" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.driveLinkBtn}
            >
              BUKA GOOGLE DRIVE ↗
            </a>
          </div>
        )}

        {/* DAFTAR FAQ */}
        <section style={styles.faqList}>
          {filteredData.length > 0 ? (
            filteredData.map((item, idx) => (
              <div key={idx} style={styles.faqCard}>
                <h4 style={styles.faqQuestion}>❓ {item.q}</h4>
                <p style={styles.faqAnswer}>{item.a}</p>
              </div>
            ))
          ) : (
            <p style={{color: '#94a3b8', textAlign: 'center', marginTop: '20px'}}>Informasi yang Anda cari tidak ditemukan.</p>
          )}
        </section>

        {/* INFORMASI PENTING DI BAGIAN BAWAH */}
        {activeTab === 'pip' && (
          <div style={styles.infoBoxSection}>
            <h5 style={styles.infoBoxTitle}>⚠️ INFORMASI PENTING PROGRAM PIP</h5>
            <ul style={styles.infoBoxList}>
              <li>Pastikan data anak di sekolah sudah benar, terutama pencatatan NIK dan NISN.</li>
              <li>Selalu lakukan koordinasi terpusat dengan pihak sekolah terkait pengusulan informasi PIP.</li>
              <li>Jangan sembarangan memberikan data pribadi seperti NIK atau nomor rekening kepada pihak luar yang tidak jelas.</li>
              <li>Layanan mandiri resmi juga dapat diakses langsung melalui laman kementerian: <a href="https://pip.kemendikdasmen.go.id/home_v1" target="_blank" rel="noreferrer" style={{color: '#3b82f6', textDecoration: 'none'}}>https://pip.kemendikdasmen.go.id</a></li>
            </ul>
          </div>
        )}
      </main>

      {/* OVERLAY MODAL LOGIN OPERATOR */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.card}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={styles.modalTitle}>AUTENTIKASI OPERATOR</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeModalBtn}>✕</button>
            </div>
            <div style={styles.divider}></div>
            
            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>EMAIL OPERATOR</label>
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.toggleButton} tabIndex={-1}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'MEMVERIFIKASI...' : 'MASUK KE E-ARSIP'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// PREMIUM STYLING DI-PANDA UPDATE 2026
const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: '100vh', backgroundColor: '#070c19', backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)`, backgroundSize: '32px 32px', fontFamily: 'sans-serif', color: '#ffffff', position: 'relative', overflowX: 'hidden', paddingBottom: '50px' },
  glowLight1: { position: 'absolute', width: '500px', height: '500px', top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  glowLight2: { position: 'absolute', width: '500px', height: '500px', top: '40%', right: '-10%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' },
  brand: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconBox: { backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px', fontWeight: 'bold' },
  navTitle: { fontSize: '16px', fontWeight: 900, letterSpacing: '0.05em' },
  navSubtitle: { fontSize: '9px', color: '#94a3b8', marginTop: '2px', fontWeight: 'bold' },
  loginTriggerBtn: { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' },
  hero: { textAlign: 'center', padding: '60px 20px 40px 20px', maxWidth: '800px', margin: '0 auto' },
  heroTitle: { fontSize: '28px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' },
  heroDesc: { color: '#94a3b8', fontSize: '14px', marginBottom: '30px', lineHeight: '1.6' },
  searchContainer: { maxWidth: '500px', margin: '0 auto' },
  searchInput: { width: '100%', padding: '14px 20px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '30px', color: '#ffffff', fontSize: '13px', outline: 'none' },
  mainContent: { maxWidth: '900px', margin: '0 auto', padding: '0 20px' },
  tabWrapper: { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' },
  tabBtn: { border: 'none', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'background-color 0.2s' },
  faqList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  faqCard: { backgroundColor: 'rgba(22, 32, 54, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(5px)' },
  faqQuestion: { margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: '#f8fafc' },
  faqAnswer: { margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' },
  driveAlert: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', padding: '15px 20px', marginBottom: '20px' },
  driveLinkBtn: { backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.05em', transition: 'background-color 0.2s' },
  infoBoxSection: { marginTop: '35px', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', padding: '25px', border: '1px solid rgba(255,255,255,0.03)' },
  infoBoxTitle: { margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', color: '#f43f5e', letterSpacing: '0.05em' },
  infoBoxList: { margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.8' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
  card: { width: '100%', maxWidth: '380px', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155', padding: '30px', boxSizing: 'border-box', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  modalTitle: { fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em', color: '#94a3b8', margin: 0 },
  closeModalBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: '16px', cursor: 'pointer' },
  divider: { height: '1px', backgroundColor: '#1e293b', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  label: { fontSize: '9px', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' },
  input: { padding: '12px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px', color: '#ffffff', outline: 'none', width: '100%', boxSizing: 'border-box' },
  toggleButton: { position: 'absolute', right: '14px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  button: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
}