import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { BusinessSettings } from "../../types";
import { Menu, X, Sparkles, Scissors, ChevronDown, BookOpen, User, Sparkle } from "lucide-react";
import Preloader from "../ui/Preloader";
import { motion, AnimatePresence } from "motion/react";

import Logo from '../ui/Logo';

export default function PublicLayout() {
  const [settings, setSettings] = useState<Partial<BusinessSettings> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChildLoading, setIsChildLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [heroTheme, setHeroTheme] = useState<'light' | 'dark'>('light');
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<'services' | 'studio' | null>(null);

  const location = useLocation();
  const isHome = location.pathname === "/";

  const isFullyLoading = isLoading || isChildLoading;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const headerTextColor = (isHome && heroTheme === 'dark' && !isScrolled) ? 'text-white' : 'text-[#381A0F]';
  const headerButtonColor = (isHome && heroTheme === 'dark' && !isScrolled) ? 'bg-white text-black hover:bg-brand-100' : 'bg-[#1C1A19] text-white hover:bg-[#381A0F]';

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
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex items-center ${isScrolled ? 'h-[90px] mt-2' : 'h-[110px] mt-0'} px-4 sm:px-6 md:px-12 pointer-events-none`}>
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
            
            {/* Left Capsule: Logo & Desktop Links & Mobile Menu Toggle */}
            <div className={`relative flex items-center justify-between lg:justify-start rounded-full px-2 py-1.5 transition-all duration-500 border shadow-md w-full lg:w-auto ${
              isHome && heroTheme === 'dark' && !isScrolled
                ? 'bg-[#0D0B0A]/90 border-white/10 text-[#FCF9F5]'
                : 'bg-white/95 border-[#080808]/5 text-[#080808]'
            }`} id="nav-left-capsule">
              
              {/* Logo */}
              <Link to="/" className={`flex items-center gap-2 pl-3 md:pl-5 pr-4 md:pr-8 border-r ${isHome && heroTheme === 'dark' && !isScrolled ? 'border-white/10' : 'border-[#080808]/10'} group`}>
                <Scissors className="w-5 h-5 text-brand-peach animate-scissor-cut" />
                <span className="font-serif font-medium text-2xl tracking-tight text-current">{businessName}</span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center pr-2">
                <div className="flex items-center">
                  
                  {/* Services Dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setHoveredDropdown('services')}
                    onMouseLeave={() => setHoveredDropdown(null)}
                  >
                    <button className="flex items-center gap-1 px-5 py-2.5 text-[14px] font-secondary font-medium uppercase tracking-widest text-current/85 hover:text-brand-peach transition-colors cursor-pointer">
                      Services
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${hoveredDropdown === 'services' ? 'rotate-180 text-brand-peach' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {hoveredDropdown === 'services' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={`absolute top-full left-0 mt-3 w-64 rounded-2xl p-4 shadow-xl border ${
                            isHome && heroTheme === 'dark' && !isScrolled
                              ? 'bg-[#1C1613] border-white/10 text-[#FCF9F5]' 
                              : 'bg-white border-[#080808]/5 text-[#080808]'
                          } z-50`}
                        >
                          <div className="flex flex-col gap-1">
                            <Link 
                              to="/#services" 
                              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-peach/15 transition-colors text-xs uppercase tracking-widest font-semibold text-current"
                              onClick={() => setHoveredDropdown(null)}
                            >
                              <Sparkle className="w-3.5 h-3.5 text-brand-peach" />
                              Signature Services
                            </Link>
                            <Link 
                              to="/book" 
                              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-peach/15 transition-colors text-xs uppercase tracking-widest font-semibold text-current"
                              onClick={() => setHoveredDropdown(null)}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-brand-peach" />
                              Bridal & Editorial
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Studio Dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setHoveredDropdown('studio')}
                    onMouseLeave={() => setHoveredDropdown(null)}
                  >
                    <button className="flex items-center gap-1 px-5 py-2.5 text-[14px] font-secondary font-medium uppercase tracking-widest text-current/85 hover:text-brand-peach transition-colors cursor-pointer">
                      Studio
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${hoveredDropdown === 'studio' ? 'rotate-180 text-brand-peach' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {hoveredDropdown === 'studio' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={`absolute top-full left-0 mt-3 w-64 rounded-2xl p-4 shadow-xl border ${
                            isHome && heroTheme === 'dark' && !isScrolled
                              ? 'bg-[#1C1613] border-white/10 text-[#FCF9F5]' 
                              : 'bg-white border-[#080808]/5 text-[#080808]'
                          } z-50`}
                        >
                          <div className="flex flex-col gap-1">
                            <Link 
                              to="/about" 
                              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-peach/15 transition-colors text-xs uppercase tracking-widest font-semibold text-current"
                              onClick={() => setHoveredDropdown(null)}
                            >
                              <User className="w-3.5 h-3.5 text-brand-peach" />
                              About Us
                            </Link>
                            <Link 
                              to="/#about-studio" 
                              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-peach/15 transition-colors text-xs uppercase tracking-widest font-semibold text-current"
                              onClick={() => setHoveredDropdown(null)}
                            >
                              <Sparkle className="w-3.5 h-3.5 text-brand-peach" />
                              Our Philosophy
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Journal */}
                  <Link 
                    to="/#blog" 
                    className="px-5 py-2 text-[14px] font-secondary font-medium uppercase tracking-widest text-current/85 hover:text-brand-peach transition-colors"
                  >
                    Journal
                  </Link>

                  {/* Contact */}
                  <Link 
                    to="/contact" 
                    className="px-5 py-2 text-[14px] font-secondary font-medium uppercase tracking-widest text-current/85 hover:text-brand-peach transition-colors"
                  >
                    Contact
                  </Link>

                </div>
              </nav>

              {/* Mobile Menu Toggle inside capsule */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center px-4 py-2 text-current/70 hover:text-brand-peach transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

            {/* Right Capsule: Book Now CTA Button */}
            <div className={`hidden lg:flex items-center rounded-full p-1.5 border transition-all duration-500 shadow-md ${
              isHome && heroTheme === 'dark' && !isScrolled
                ? 'bg-[#0D0B0A]/90 border-white/10 text-white'
                : 'bg-white/95 border-[#080808]/5 text-[#080808]'
            }`} id="nav-right-capsule">
              <Link 
                to="/book" 
                className="px-8 md:px-10 py-2.5 md:py-3.5 bg-brand-peach text-white font-secondary text-[15px] font-medium rounded-full hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-500 uppercase tracking-widest shadow-sm"
              >
                Book Now
              </Link>
            </div>

          </div>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-lg border border-[#080808]/5 shadow-2xl rounded-3xl p-6 flex flex-col gap-5 z-50 pointer-events-auto"
              >
                <Link 
                  to="/#services" 
                  className="text-xs tracking-[0.2em] text-brand-900 uppercase font-bold hover:text-brand-peach transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link 
                  to="/about" 
                  className="text-xs tracking-[0.2em] text-brand-900 uppercase font-bold hover:text-brand-peach transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/book" 
                  className="text-xs tracking-[0.2em] text-brand-900 uppercase font-bold hover:text-brand-peach transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Booking
                </Link>
                <Link 
                  to="/contact" 
                  className="text-xs tracking-[0.2em] text-brand-900 uppercase font-bold hover:text-brand-peach transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  to="/book" 
                  className="inline-flex justify-center px-8 py-4 mt-2 bg-brand-peach text-white uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-brand-900 transition-all rounded-full shadow-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book Session
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

      <main className="flex-grow">
        <Outlet context={{ businessName, businessDescription, setIsChildLoading, heroTheme, setHeroTheme }} />
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
