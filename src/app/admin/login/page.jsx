'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      // ૧. Supabase દ્વારા ઇમેઇલ અને પાસવર્ડથી લોગિન
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // ૨. ચેક કરો કે યુઝર પાસે Admin એક્સેસ છે કે નહીં
      // નોંધ: જો તમે હજુ SQL રન ન કરી હોય, તો અત્યારે આ ચેક કામચલાઉ હટાવી શકાય છે
      const isAdmin = data.user?.app_metadata?.is_admin === true

      if (isAdmin) {
        // સફળ લોગિન - એડમિન ડેશબોર્ડ પર મોકલો
        router.push('/admin')
        router.refresh() // પેજ રિફ્રેશ જેથી લેઆઉટ અપડેટ થાય
      } else {
        setErrorMsg("તમારી પાસે એડમિન એક્સેસ નથી!")
        await supabase.auth.signOut() // બિન-એડમિન યુઝરને લોગઆઉટ કરો
      }

    } catch (error) {
      setErrorMsg("ખોટો ઇમેઇલ અથવા પાસવર્ડ! ફરી પ્રયાસ કરો.")
      console.error('Login Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
        
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark">Kiara Admin</h2>
          <p className="text-muted">login your admin Account</p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 px-3 small mb-3 text-center border-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-dark w-100 py-2 fw-bold shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : null}
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/" className="text-decoration-none text-muted small">
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  )
}