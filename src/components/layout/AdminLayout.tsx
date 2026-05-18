import { useEffect, useState } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Calendar, Clock, Lock, Settings, Sparkles, LayoutDashboard, LogOut, Menu, X } from "lucide-react";

import Logo from '../ui/Logo';

export default function AdminLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
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
        // Fallback state
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
        // Re-check admin on token refresh or sign in
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-100">
        <div className="flex flex-col items-center gap-4 animate-pulse text-brand-800">
          <Sparkles className="w-8 h-8" />
          <p className="uppercase tracking-widest text-sm">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-100 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif mb-2">Unauthorized</h2>
          <p className="text-gray-600 mb-8">
            You are signed in, but you are not authorized as an admin.
          </p>
          <button 
            onClick={handleSignOut}
            className="w-full py-3 px-4 bg-brand-900 text-white rounded-lg uppercase tracking-wider text-sm hover:bg-brand-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Overview" },
    { to: "/admin/appointments", icon: Calendar, label: "Appointments" },
    { to: "/admin/services", icon: Sparkles, label: "Services" },
    { to: "/admin/business-hours", icon: Clock, label: "Business Hours" },
    { to: "/admin/blocked-dates", icon: Lock, label: "Blocked Dates" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA] font-sans selection:bg-brand-300 selection:text-brand-900 duration-500 transition-colors">
      {/* Mobile Top Header */}
      <div className="md:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-brand-900" />
          <span className="font-serif tracking-wide uppercase text-brand-900 mt-1">Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-500 hover:text-brand-900 hover:bg-brand-50 rounded-lg transition-colors focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/60 flex flex-col z-30 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] md:translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:static md:h-screen lg:w-64`}>
        <div className="h-16 md:h-24 flex items-center px-6 md:px-8 border-b border-slate-100/50 justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 text-brand-900 hidden md:flex" />
            <span className="font-serif text-xl tracking-widest uppercase text-brand-900 mt-1">Admin</span>
          </div>
          <button 
            className="md:hidden p-1.5 text-slate-400 hover:text-brand-900 hover:bg-slate-50 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 flex flex-col gap-1.5 px-4 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to !== "/admin" && location.pathname.startsWith(item.to + "/"));
            // Keep the exactly matched logic for root dashboard
            const isExactActive = location.pathname === item.to;
            const isMatched = item.to === "/admin" ? isExactActive : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                  isMatched 
                    ? "bg-brand-900 text-brand-100 shadow-md shadow-brand-900/10" 
                    : "text-slate-500 hover:bg-brand-50 hover:text-brand-900"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isMatched ? "scale-110" : "group-hover:scale-110"}`} />
                <span className={`text-sm font-medium tracking-wide ${isMatched ? "" : "group-hover:translate-x-1"} transition-transform duration-300`}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-slate-100/50">
          <button 
            onClick={() => setShowSignOutDialog(true)}
            className="flex items-center gap-3.5 px-4 py-3.5 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium tracking-wide group-hover:translate-x-1 transition-transform duration-300">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 w-full md:max-w-[calc(100vw-16rem)] overflow-y-auto">
        <div className="max-w-6xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Sign Out Confirmation Dialog */}
      {showSignOutDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-brand-900 mb-2">Sign Out</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignOutDialog(false);
                  handleSignOut();
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-m shadow-red-600/20"
              >
                Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
