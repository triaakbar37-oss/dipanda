import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Inisialisasi Supabase Server Client untuk mengelola kuki sesi secara dinamis
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Menggunakan getSession agar pembacaan token kuki lebih aman dari konflik rute lama
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const url = request.nextUrl.clone()

  // 1. JIKA OPERATOR BELUM LOGIN dan mencoba mengakses halaman monitoring internal
  if (!user && url.pathname.startsWith('/monitoring')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. JIKA OPERATOR SUDAH LOGIN dan mencoba kembali ke halaman login/akar
  if (user && (url.pathname === '/login' || url.pathname === '/')) {
    url.pathname = '/monitoring'
    return NextResponse.redirect(url)
  }

  return response
}

// Proteksi rute-rute internal secara spesifik
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}