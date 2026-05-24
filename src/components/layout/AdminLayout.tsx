import { useEffect, useState } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { 
  Calendar, Clock, Lock, Settings, Sparkles, LayoutDashboard, 
  LogOut, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from '../ui/Logo';

export default function AdminLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function checkAdminAccess() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
          return;
        }

        if (mounted) setIsAuthenticated(true);

        const { data, error } = await supabase
          .from("admin_users")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (mounted) {
          if (data && !error) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.warn("Admin check failed", err);
        if (mounted && !isAuthenticated) {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
        }
      } else {
        if (mounted) setIsAuthenticated(true);
        const { data } = await supabase
          .from("admin_users")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (mounted) setIsAdmin(!!data);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 animate-pulse text-slate-800">
          <Sparkles className="w-8 h-8" />
          <p className="uppercase tracking-widest text-sm font-medium">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif mb-2 text-slate-900">Unauthorized</h2>
          <p className="text-slate-500 mb-8">
            You are signed in, but you are not authorized as an admin.
          </p>
          <button 
            onClick={handleSignOut}
            className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl uppercase tracking-wider text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/appointments", icon: Calendar, label: "Appointments" },
    { to: "/admin/services", icon: Sparkles, label: "Services" },
    { to: "/admin/business-hours", icon: Clock, label: "Business Hours" },
    { to: "/admin/blocked-dates", icon: Lock, label: "Blocked Dates" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 text-slate-50' : 'bg-[#F9FAFB] text-slate-900'}`}>
      
      {/* Mobile Top Header */}
      <div className={`md:hidden h-16 backdrop-blur-md border-b flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200/60'}`}>
        <div className="flex items-center gap-2">
          <Logo className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} />
          <span className="font-serif tracking-wide text-lg mt-1 relative top-[-1px]">Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2 rounded-lg transition-colors focus:outline-none ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] border-r flex flex-col z-40 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] md:translate-x-0 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:static md:h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
        <div className={`h-16 md:h-[72px] flex items-center px-6 border-b justify-between shrink-0 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100/50'}`}>
          <div className="flex items-center gap-3">
            <Logo className={`w-8 h-8 hidden md:flex ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} />
            <span className={`font-serif text-xl tracking-tight mt-1 uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>ADMIN</span>
          </div>
          <button 
            className={`md:hidden p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-4 scrollbar-hide">
          <p className={`px-4 text-[11px] font-semibold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Menu</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to !== "/admin" && location.pathname.startsWith(item.to + "/"));
            const isExactActive = location.pathname === item.to;
            const isMatched = item.to === "/admin" ? isExactActive : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isMatched 
                    ? theme === 'dark' ? "bg-white text-slate-900 shadow-sm" : "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                    : theme === 'dark' ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isMatched ? "" : ""}`} />
                <span className={`text-[14px] font-medium leading-none mt-0.5`}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100/50'}`}>
          <button 
            onClick={() => setShowSignOutDialog(true)}
            className={`flex items-center gap-3.5 px-4 py-2.5 w-full rounded-xl transition-all duration-200 group ${
              theme === 'dark' ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[14px] font-medium leading-none mt-0.5">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scrollbar-hide">
          <div className="max-w-[1400px] mx-auto min-h-full">
            <Outlet context={{ theme }} />
          </div>
        </main>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AnimatePresence>
        {showSignOutDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-slate-100 dark:border-slate-800"
            >
              <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-slate-900 dark:text-white mb-2">Sign Out</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Are you sure you want to sign out?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOutDialog(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSignOutDialog(false);
                    handleSignOut();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

