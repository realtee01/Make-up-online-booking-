import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BusinessSettings } from "../../types";
import { Menu, X } from "lucide-react";
import Preloader from "../ui/Preloader";

import Logo from '../ui/Logo';

export default function PublicLayout() {
  const [settings, setSettings] = useState<Partial<BusinessSettings> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChildLoading, setIsChildLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isFullyLoading = isLoading || isChildLoading;

  useEffect(() => {
    let isMounted = true;
    
    async function fetchSettings() {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("business_settings")
          .select("*")
          .maybeSingle();

        if (isMounted && data) {
          setSettings(data);
        }
      } catch (err) {
        console.warn("Failed to fetch settings:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchSettings();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const businessName = settings?.business_name || "Studio Elegance";
  const businessDescription = settings?.business_description || "Refined beauty experiences for the modern romantic.";

  // If we return completely here, Preloader doesn't get the updated business name until it's loaded. 
  // It's better to render Preloader as an overlay so the rest of the app can load in the background.

  return (
    <>
      {showPreloader && (
        <Preloader 
          businessName={businessName} 
          onComplete={() => setShowPreloader(false)} 
          isLoading={isFullyLoading}
        />
      )}
      
      {/* We only show the main content if we're not loading, or if we want it to render behind the preloader 
          It's usually better to render it behind so images can start loading. */}
      <div 
        className={`min-h-screen flex flex-col font-sans text-brand-900 selection:bg-brand-300 selection:text-brand-900 transition-colors duration-500 ${showPreloader ? 'h-screen overflow-hidden' : ''}`}
        style={{ opacity: isFullyLoading ? 0 : 1 }}
      >
        <header className="sticky top-0 z-50 bg-brand-50/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className="w-12 h-12 text-brand-900" />
            <span className="text-2xl font-serif tracking-[0.02em] font-light text-brand-900">
              {businessName}
            </span>
          </Link>
          <nav className="hidden lg:flex gap-10 text-[13px] tracking-[0.1em] text-brand-800/80 uppercase font-medium ml-12">
            <Link to="/#services" className="hover:text-brand-900 transition-colors">Services</Link>
            <Link to="/about" className="hover:text-brand-900 transition-colors">About</Link>
            <Link to="/book" className="hover:text-brand-900 transition-colors">Booking</Link>
            <Link to="/contact" className="hover:text-brand-900 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-8">
            <span className="hidden xl:block text-[11px] tracking-[0.2em] uppercase font-bold text-brand-800/40">Studio</span>
            <Link 
              to="/book" 
              className="hidden md:inline-flex px-8 py-3 bg-brand-900 text-brand-50 uppercase tracking-[0.15em] text-[11px] font-bold hover:bg-brand-800 transition-all rounded-full shadow-lg shadow-brand-900/10"
            >
              Book Session
            </Link>
            <button 
              className="lg:hidden p-2 -mr-2 text-brand-900" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-brand-50/95 backdrop-blur-md border-t border-brand-200/50 shadow-xl shadow-brand-900/5 p-6 flex flex-col gap-6">
            <Link to="/#services" className="text-[13px] tracking-[0.1em] text-brand-800/80 uppercase font-medium hover:text-brand-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
            <Link to="/about" className="text-[13px] tracking-[0.1em] text-brand-800/80 uppercase font-medium hover:text-brand-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/book" className="text-[13px] tracking-[0.1em] text-brand-800/80 uppercase font-medium hover:text-brand-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Booking</Link>
            <Link to="/contact" className="text-[13px] tracking-[0.1em] text-brand-800/80 uppercase font-medium hover:text-brand-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            <Link 
              to="/book" 
              className="inline-flex justify-center px-8 py-4 mt-4 bg-brand-900 text-brand-50 uppercase tracking-[0.15em] text-[11px] font-bold hover:bg-brand-800 transition-all rounded-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book Session
            </Link>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet context={{ businessName, businessDescription, setIsChildLoading }} />
      </main>

      <footer className="bg-brand-100 py-24 border-t border-brand-200 text-brand-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
            <div className="max-w-xs">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <Logo className="w-10 h-10 text-brand-900" />
                <span className="font-serif text-2xl tracking-wide">{businessName}</span>
              </Link>
              <p className="text-sm text-brand-800/50 leading-relaxed font-light normal-case tracking-normal">
                Tailored makeup artistry for bridal, editorial and special events. Focused on light and the unique architecture of your features.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12 md:gap-24">
              <div>
                <h4 className="text-[11px] tracking-[0.4em] uppercase font-bold text-brand-900 mb-6">Explore</h4>
                <nav className="flex flex-col gap-4 text-[11px] tracking-[0.1em] uppercase font-medium text-brand-800/60">
                  <Link to="/" className="hover:text-brand-900 transition-colors">Home</Link>
                  <Link to="/book" className="hover:text-brand-900 transition-colors">Booking</Link>
                  <Link to="/#services" className="hover:text-brand-900 transition-colors">Services</Link>
                </nav>
              </div>
              <div>
                <h4 className="text-[11px] tracking-[0.4em] uppercase font-bold text-brand-900 mb-6">Access</h4>
                <nav className="flex flex-col gap-4 text-[11px] tracking-[0.1em] uppercase font-medium text-brand-800/60">
                  <Link to="/admin/login" className="hover:text-brand-900 transition-colors">Admin Login</Link>
                  <a href="#" className="hover:text-brand-900 transition-colors">Instagram</a>
                  <Link to="/contact" className="hover:text-brand-900 transition-colors">Contact</Link>
                </nav>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-12 border-t border-brand-900/10 text-[10px] tracking-[0.2em] uppercase font-bold text-brand-800/30">
            <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
            <div className="flex gap-8">
              <span>Paris · Stockholm</span>
              <span>Lumière Studio</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
