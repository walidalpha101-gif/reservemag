import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useFirebase } from '../context/FirebaseContext';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useFirebase();

  // If already logged in and admin, redirect to dashboard
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const loggedUser = await signInWithGoogle();
      
      // If the user isn't an admin but is logged in, show error
      // Note: FirebaseContext handles the isAdmin state automatically
      if (loggedUser && loggedUser.email !== 'walid.alpha101@gmail.com') {
        // We'll let the Context check firestore too, but for a fast UX
        // we check the owner email here.
        setError('Unauthorized access. This area is reserved for the primary administrator.');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed')) {
        setError('The sign-in window was closed before completion. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Unauthorized Domain: This URL is not whitelisted in your Firebase project. Please add it to "Authorized domains" in your Firebase Auth settings.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 border border-white/5 backdrop-blur-xl p-12"
      >
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
            <ShieldCheck className="text-reserve-accent" size={32} />
          </div>
          <h1 className="text-2xl font-serif tracking-[0.2em] mb-3">THE RESERVE</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em]">Proprietary Admin Portal</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500 text-xs text-center"
          >
            <AlertCircle size={16} className="shrink-0" />
            <p className="flex-1 text-left">{error}</p>
          </motion.div>
        )}

        {user && !isAdmin ? (
          <div className="text-center space-y-6">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Logged in as <span className="text-white font-bold">{user.email}</span>.<br />
              This account does not have editorial permissions.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="text-[10px] uppercase tracking-widest text-reserve-accent hover:underline"
            >
              Try another account
            </button>
          </div>
        ) : (
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-black py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-reserve-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale" alt="Google" />
                Connect with Google
              </>
            )}
          </button>
        )}

        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] leading-loose text-center">
            Secured via Google Cloud<br />
            © 2026 THE RESERVE ARCHIVE
          </p>
        </div>
      </motion.div>
    </div>
  );
}
