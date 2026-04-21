'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [recoveryAnswer, setRecoveryAnswer] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams?.get('next') || '/admin'
  const supabase = createClient()


  useEffect(() => {
  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email === 'khushaliramani22@gmail.com') {
        router.push(nextPath);
      }
    } catch (err) {
      console.error(err);
    } finally {
   
      setLoading(false); 
    }
  };
  checkExistingSession();
}, [router, supabase, nextPath]);

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg('');

  try {
   
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password: password.trim() 
    });

    if (error) throw error;

    const adminEmail = 'khushaliramani22@gmail.com';

 
    if (data?.user?.email === adminEmail) {
      router.push(nextPath); 
     
    } else {
      await supabase.auth.signOut();
      setErrorMsg("Access Denied: You do not have admin privileges.");
    }

  } catch (error) {
    setErrorMsg("Invalid credentials or unauthorized access.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 font-sans text-black">
      <div className="w-full max-w-md bg-white border border-gray-200 p-10 shadow-2xl relative">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-widest uppercase italic">KAIRA</h2>
          <p className="text-[10px] text-gray-400 mt-2 tracking-[0.3em] uppercase font-bold">Security Portal</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-black text-white text-[11px] py-3 px-4 mb-6 text-center uppercase tracking-tighter animate-pulse">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              className="w-full p-4 bg-gray-50 border border-gray-100 outline-none focus:border-black transition-all text-black"
              placeholder="admin@kaira.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-[9px] font-bold text-gray-400 hover:text-black uppercase tracking-tighter"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-4 bg-gray-50 border border-gray-100 outline-none focus:border-black transition-all pr-12 text-black"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl flex justify-center items-center disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : "Secure Login"}
          </button>
        </form>

        <div className="text-center mt-10">
          <a href="/" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black">
            ← Return to Store
          </a>
        </div>
      </div>

      {/* --- RECOVERY MODAL  --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm p-10 border border-gray-200 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-300 hover:text-black">✕</button>
            <div className="text-center mb-8">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Identity Recovery</p>
              <h2 className="text-lg font-black uppercase italic tracking-tighter mt-1">Security Bypass</h2>
            </div>
            <div className="space-y-6 text-black">
              <div className="p-4 bg-gray-100 text-[10px] font-bold text-gray-600 text-center uppercase border-y border-gray-200">
                Question: What was the name of your first school?
              </div>
              <input
                type="text"
                value={recoveryAnswer}
                onChange={(e) => setRecoveryAnswer(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 outline-none focus:border-black text-black"
                placeholder="Type your answer"
              />
              <button
                type="button"
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-900 shadow-lg"
              >
                Verify & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}