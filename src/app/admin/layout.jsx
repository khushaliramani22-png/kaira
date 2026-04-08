'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({ children }) {
  const router = useRouter()
  const supabase = createClient()
  const pathname = usePathname()

  const [isProductOpen, setIsProductOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState('Loading...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (pathname === '/admin/login') {
        setLoading(false)
        return
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (!user || authError) {
        console.log("User not logged in. Redirecting to login...");
        router.push('/admin/login')
        return
      }

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log("Log-in ID:", user.email);
      console.log("Database Role:", userData?.role);

      if (dbError || !userData || userData.role !== 'admin') {
        console.error("Access Denied: this id is not admin!");
        router.push('/')
        return
      }

      setAdminEmail(user.email)
      setLoading(false)
    }

    checkAdminAccess()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, pathname])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/admin/login');
    } else {
      console.error("Logout Error:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans text-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="d-flex">
      {/* Sidebar - Added 'no-print' class for clean printing */}
      <div
        className="bg-black text-white p-3 no-print"
        style={{ width: "240px", minHeight: "100vh", position: "sticky", top: 0 }}
      >
        <h4 className="mb-4 text-center border-bottom pb-3">Kiara Admin</h4>

        <ul className="list-unstyled">
          <li className="mb-3">
            <div onClick={() => router.push('/admin')} className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded" style={{ cursor: 'pointer' }}>
              📊 Dashboard
            </div>
          </li>

          {/* Products Dropdown */}
          <li className="mb-2">
            <div
              onClick={() => setIsProductOpen(!isProductOpen)}
              className="text-white text-decoration-none d-flex align-items-center justify-content-between p-2 rounded hover-effect"
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <span className="me-2">📦</span> Products
              </div>
              <span style={{
                transform: isProductOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.3s',
                fontSize: '12px'
              }}>▼</span>
            </div>

            {isProductOpen && (
              <ul className="list-unstyled ms-4 mt-1">
                <li className="mb-1">
                  <div onClick={() => router.push('/admin/products')} className="text-gray-400 text-decoration-none d-block p-2 small hover-text-white" style={{ cursor: 'pointer' }}>
                    • All Products
                  </div>
                </li>
                <li className="mb-1">
                  <div onClick={() => router.push('/admin/products/add')} className="text-gray-400 text-decoration-none d-block p-2 small hover-text-white" style={{ cursor: 'pointer' }}>
                    • Add New Product
                  </div>
                </li>
              </ul>
            )}
          </li>

          <li className="mb-3">
            <div onClick={() => router.push('/admin/orders')} className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded" style={{ cursor: 'pointer' }}>
              📜 Orders
            </div>
          </li>

          {/* --- ન્યૂઝલેટર ઓપ્શન અહીં એડ કર્યું છે --- */}
          <li className="mb-3">
            <div onClick={() => router.push('/admin/subscribers')} className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded" style={{ cursor: 'pointer' }}>
              📧 Subscribers
            </div>
          </li>

          <li className="mb-3">
            <div onClick={() => router.push('/admin/users')} className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded" style={{ cursor: 'pointer' }}>
              👥 Users
            </div>
          </li>
          <li className="mb-3">
            <div
              onClick={() => router.push('/admin/reviews')}
              className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded"
              style={{ cursor: 'pointer' }}
            >
              ⭐ Reviews
            </div>
          </li>
          <li className="mb-3">
            <div
              onClick={() => router.push('/admin/wishlist')}
              className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded"
              style={{ cursor: 'pointer' }}
            >
             ❤️  wishlist
            </div>
          </li>
          <li className="mb-3">
            <div onClick={() => router.push('/admin/messages')} className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded" style={{ cursor: 'pointer' }}>
              💬 Messages
            </div>
          </li>
          <li className="mb-3">
            <div onClick={() => router.push('/admin/settings')} className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded" style={{ cursor: 'pointer' }}>
              ⚙️ Settings
            </div>
          </li>

        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 bg-light">

        {/* Admin Header - Added 'no-print' class */}
        <header className="navbar navbar-white bg-white border-bottom px-4 py-2 shadow-sm no-print">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <span className="navbar-text fw-bold text-dark">
              Welcome back, Admin
            </span>

            <div className="d-flex align-items-center">
              <span className="me-3 text-muted small">{adminEmail}</span>
              <button
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}