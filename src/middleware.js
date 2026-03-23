import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ૧. યુઝરનું સેશન મેળવો
  const { data: { user } } = await supabase.auth.getUser()

  // ૨. જો યુઝર '/admin' ના કોઈ પણ પેજ પર હોય
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // જો લોગિન ન હોય અને તે લોગિન પેજ પર પણ ન હોય, તો રિડાયરેક્ટ કરો
    if (!user && request.nextUrl.pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // (ઓપ્શનલ) જો લોગિન હોય પણ એડમિન ન હોય, તો પણ રોકી શકાય
    if (user && user.app_metadata?.is_admin !== true && request.nextUrl.pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * બધા પાથ પર ચાલશે પણ static ફાઈલોને છોડી દેશે
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}