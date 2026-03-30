import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ૧. યુઝરનું સેશન મેળવો
  const { data: { user } } = await supabase.auth.getUser()

  const is_admin_page = request.nextUrl.pathname.startsWith('/admin')
  const is_login_page = request.nextUrl.pathname === '/admin/login'

  // ૨. જો એડમિન પેજ પર હોય અને લોગિન ન હોય
  if (is_admin_page && !is_login_page && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // ૩. જો લોગિન હોય અને ફરી લોગિન પેજ પર જવાની ટ્રાય કરે તો ડેશબોર્ડ મોકલો
  if (user && is_login_page) {
    return NextResponse.redirect(new URL('/admin/orders', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}