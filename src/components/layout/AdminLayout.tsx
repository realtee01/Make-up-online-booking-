import { useEffect, useState } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Calendar, Clock, Lock, Settings, Sparkles, LayoutDashboard, LogOut, Menu, X } from "lucide-react";

export default function AdminLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        console.error("Admin check failed", err);
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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-20">
        <span className="font-serif text-xl tracking-wide uppercase">Admin</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-brand-900 focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-30 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:static md:h-screen lg:w-64`}>
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <span className="font-serif text-xl tracking-wide uppercase">Admin</span>
          <button 
            className="md:hidden p-1 text-slate-500 hover:text-brand-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isMatched 
                    ? "bg-brand-100 text-brand-900 font-medium" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-brand-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full md:max-w-[calc(100vw-16rem)]">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
