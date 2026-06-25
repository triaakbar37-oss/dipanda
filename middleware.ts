import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Inisialisasi Supabase Client Khusus untuk Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Mengambil data sesi user aktif dari Supabase Auth
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // --- LOGIKA PENGALIHAN RUTE (ROUTING) ---

  // 1. JIKA USER BELUM LOGIN:
  // Hanya kunci halaman yang berada di dalam folder '/dashboard'
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/' // Lempar balik ke portal utama E-Pelayanan
    return NextResponse.redirect(url)
  }

  // 2. JIKA USER SUDAH LOGIN:
  // Jika mereka berada di halaman utama ('/') atau mencoba mengakses '/login',
  // langsung alihkan ke dalam dashboard internal agar bisa bekerja
  if (user && (url.pathname === '/' || url.pathname.startsWith('/login'))) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

// Konfigurasi pencocokan rute agar asset statis tidak ikut tersaring
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}