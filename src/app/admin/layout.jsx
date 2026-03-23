
'use client'
import { useState } from 'react' 
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const supabase = createClient()

  const [isProductOpen, setIsProductOpen] = useState(false)
  // logout function
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="bg-black text-white p-3"
        style={{ width: "240px", minHeight: "100vh", position: "sticky", top: 0 }}
      >
        <h4 className="mb-4 text-center border-bottom pb-3">Kiara Admin</h4>

        <ul className="list-unstyled">
          <li className="mb-3">
            <a href="/admin" className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded">
              📊 Dashboard
            </a>
          </li>
          <li className="mb-2">
            <div 
              onClick={() => setIsProductOpen(!isProductOpen)}
              className="text-white text-decoration-none d-flex align-items-center justify-content-between p-2 rounded hover-effect"
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <span className="me-2">📦</span> Products
              </div>
              {/* એરો આયકોન જે ફરશે */}
              <span style={{ 
                transform: isProductOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: '0.3s',
                fontSize: '12px'
              }}>▼</span>
            </div>

            {/* Sub-menu (Dropdown) */}
            {isProductOpen && (
              <ul className="list-unstyled ms-4 mt-1">
                <li className="mb-1">
                  <a href="/admin/products" className="text-gray-400 text-decoration-none d-block p-2 small hover-text-white">
                    • All Products
                  </a>
                </li>
                <li className="mb-1">
                  <a href="/admin/products/add" className="text-gray-400 text-decoration-none d-block p-2 small hover-text-white">
                    • Add New Product
                  </a>
                </li>
                <li className="mb-1">
                  <a href="/admin/products/edit/[id]" className="text-gray-400 text-decoration-none d-block p-2 small hover-text-white">
                    • Edit Product
                  </a>
                </li>
              </ul>
            )}
          </li>

          
          
          <li className="mb-3">
            <a href="/admin/orders" className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded">
              📜 Orders
            </a>
          </li>
          <li className="mb-3">
            <a href="/admin/users" className="text-white text-decoration-none d-block p-2 hover-bg-dark rounded">
              👥 Users
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 bg-light">
        
        {/* Admin Header */}
        <header className="navbar navbar-white bg-white border-bottom px-4 py-2 shadow-sm">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <span className="navbar-text fw-bold text-dark">
              Welcome back, Admin
            </span>
            
            <div className="d-flex align-items-center">
              <span className="me-3 text-muted small">khushali@admin</span>
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