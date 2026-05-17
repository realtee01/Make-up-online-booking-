import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem("admin_login_email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  useEffect(() => {
    localStorage.setItem("admin_login_email", email);
  }, [email]);

  useEffect(() => {
    let isMounted = true;
    async function checkExistingSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          if (session) {
            setIsSuccess(true);
            navigate(from, { replace: true });
          } else {
            setIsCheckingSession(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }
    checkExistingSession();
    return () => {
      isMounted = false;
    };
  }, [navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          throw new Error("Incorrect email or password. Please try again.");
        }
        throw authError;
      }
      
      // Briefly show success state before redirecting for a smoother experience
      setIsSuccess(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 600); // reduced from typical 1000ms to feel faster but still show success
      
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-100 p-6">
        <Loader2 className="w-8 h-8 animate-spin text-brand-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-100 p-6 selection:bg-brand-300 transition-colors duration-500">
      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl premium-shadow border border-brand-200 relative overflow-hidden">
        <Link 
          to="/" 
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-slate-400 hover:text-brand-900 hover:bg-slate-50 rounded-full transition-colors z-20"
          aria-label="Back to website"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* Animated Success Overlay */}
        <div 
          className={`absolute inset-0 z-10 bg-emerald-500 flex flex-col items-center justify-center text-white transition-all duration-500 ease-in-out ${
            isSuccess ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <CheckCircle2 className="w-16 h-16 mb-4 animate-[bounce_1s_ease-in-out]" />
          <h2 className="font-serif text-3xl mb-2">Welcome Back</h2>
          <p className="text-emerald-100 font-sans tracking-wide">Logging you in...</p>
        </div>

        <div className="text-center mb-10 transition-all duration-300">
          <h1 className="font-serif text-3xl mb-2 text-brand-900">Admin Login</h1>
          <p className="text-sm text-gray-500 font-sans tracking-wide">Studio Management Dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-brand-800 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-900 transition-all font-sans"
              placeholder="admin@studio.com"
              disabled={isLoading || isSuccess}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-brand-800 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-900 transition-all font-sans"
              placeholder="••••••••"
              disabled={isLoading || isSuccess}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full py-4 mt-4 bg-brand-900 text-brand-100 rounded-xl uppercase tracking-[0.2em] text-xs font-semibold hover:bg-brand-800 disabled:opacity-80 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading && !isSuccess ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
