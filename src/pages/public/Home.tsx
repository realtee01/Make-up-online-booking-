import { useEffect, useState, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Service } from "../../types";
import { 
  ArrowRight, Sparkles, Clock, ShieldCheck, Heart, 
  Instagram, Facebook, Twitter, Linkedin, Play, X, Sun, Moon 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  
  // Provided by PublicLayout
  const { businessName, businessDescription, setIsChildLoading, heroTheme, setHeroTheme } = useOutletContext<{ 
    businessName: string, 
    businessDescription: string,
    setIsChildLoading?: (loading: boolean) => void,
    heroTheme: 'light' | 'dark',
    setHeroTheme: (theme: 'light' | 'dark') => void
  }>();

  useEffect(() => {
    let isMounted = true;
    setIsChildLoading?.(true);
    async function fetchServices() {
      setIsLoadingServices(true);
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (isMounted && !error && data) {
          const parsedData = data.map(service => {
            let desc = service.description || "";
            let imgUrl = undefined;
            if (desc.includes("|||IMAGE_URL|||")) {
               const parts = desc.split("|||IMAGE_URL|||");
               desc = parts[0];
               imgUrl = parts[1];
            }
            return { ...service, description: desc, image_url: imgUrl };
          });
          setServices(parsedData);
        }
      } catch (err) {
        console.warn("Failed to fetch services:", err);
      } finally {
        if (isMounted) {
          setIsLoadingServices(false);
          setIsChildLoading?.(false);
        }
      }
    }
    fetchServices();
    return () => {
      isMounted = false;
      setIsChildLoading?.(false);
    };
  }, [setIsChildLoading]);

  const isLight = heroTheme === 'light';
  const textColor = isLight ? 'text-[#381A0F]' : 'text-[#FCF9F5]';
  const subtextColor = isLight ? 'text-[#381A0F]/60' : 'text-[#FCF9F5]/70';
  const borderColor = isLight ? 'border-[#381A0F]/10' : 'border-white/10';

  return (
    <div className="flex flex-col bg-brand-50">
      {/* Dynamic Glowmuse Hero Section */}
      <section 
        className="relative min-h-[100svh] flex items-center pt-[120px] pb-16 overflow-hidden transition-all duration-1000 ease-in-out font-sans"
        style={{ backgroundColor: isLight ? '#E6CEBC' : '#0D0B0A' }}
      >
        {/* Absolute Theme Control Capsule (Beige/Midnight) - Desktop */}
        <div className="absolute bottom-12 right-12 z-20 hidden md:flex gap-1 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <button 
            onClick={() => setHeroTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] tracking-[0.1em] uppercase font-bold transition-all ${
              isLight 
                ? 'bg-[#381A0F] text-white shadow-sm' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sun className="w-2.5 h-2.5" />
            Warm Beige
          </button>
          <button 
            onClick={() => setHeroTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] tracking-[0.1em] uppercase font-bold transition-all ${
              !isLight 
                ? 'bg-white text-black shadow-sm' 
                : 'text-[#381A0F]/60 hover:text-[#381A0F]'
            }`}
          >
            <Moon className="w-2.5 h-2.5" />
            Deep Noir
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full md:pt-0">
          {/* Left Text and Features Column */}
          <div className="flex flex-col items-start text-left order-2 md:order-1 mt-8 md:mt-0">
            <motion.div
              key={heroTheme}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full animate-in fade-in slide-in-from-left-8 duration-1000 ease-out"
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 md:mb-8 ${borderColor} bg-white/10 backdrop-blur-sm self-start`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLight ? 'bg-[#381A0F]' : 'bg-brand-100'}`}></span>
                <span className={`text-[10px] tracking-[0.3em] font-bold uppercase ${textColor}`}>Glowmuse Atelier · Spring 2026</span>
              </div>
              
              <h1 className={`font-serif text-5xl sm:text-6xl lg:text-[76px] leading-[1.08] font-medium tracking-tight ${textColor} mb-6`}>
                Unleash Your <br />
                <span className="italic font-light opacity-90">Inner Radiance</span>
              </h1>
              
              <p className={`max-w-md text-base sm:text-lg ${subtextColor} mb-8 md:mb-10 leading-relaxed font-light`}>
                Look effortlessly radiant with easy-to-apply products that save time and feel like you. Crafted custom for your skincare architecture.
              </p>
              
              {/* Call-to-action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 mb-10 w-full sm:w-auto">
                <Link 
                  to="/book" 
                  className={`group px-8 py-4 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-4 border shadow-xl ${
                    isLight 
                      ? 'bg-[#1C1A19] text-white border-[#1C1A19] hover:bg-[#381A0F] hover:border-[#381A0F] shadow-[#381A0F]/10' 
                      : 'bg-white text-black border-white hover:bg-brand-100 hover:border-brand-100 shadow-black/10'
                  }`}
                >
                  Reserve your session
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <nav className={`flex justify-center gap-8 text-[11px] tracking-[0.1em] font-bold uppercase border-b pb-1 transition-all cursor-pointer ${isLight ? 'text-[#381A0F] border-[#381A0F]/10 hover:border-[#381A0F]' : 'text-white border-white/10 hover:border-white'}`}>
                  <a href="#services">View the menu</a>
                </nav>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-8 sm:gap-12 justify-center sm:justify-start">
                <div className="flex flex-col">
                  <span className={`text-2xl font-serif leading-none mb-1 ${textColor}`}>12+</span>
                  <span className={`text-[10px] tracking-[0.2em] uppercase font-bold ${subtextColor}`}>Years<br/>Artistry</span>
                </div>
                <div className={`w-px h-10 ${isLight ? 'bg-[#381A0F]/10' : 'bg-white/10'}`}></div>
                <div className="flex flex-col">
                  <span className={`text-2xl font-serif leading-none mb-1 ${textColor}`}>400+</span>
                  <span className={`text-[10px] tracking-[0.2em] uppercase font-bold ${subtextColor}`}>Brides<br/>Prepared</span>
                </div>
                <div className={`w-px h-10 ${isLight ? 'bg-[#381A0F]/10' : 'bg-white/10'}`}></div>
                <div className="flex gap-1 text-amber-500/60">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-lg">★</span>)}
                </div>
              </div>

              {/* High-quality highlights section from original layout */}
              <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 md:pt-12 border-t ${borderColor} w-full mt-12 md:mt-16`}>
                <div className="flex flex-col items-start gap-3 text-left">
                  <ShieldCheck className={`w-5 h-5 opacity-80 ${textColor}`} />
                  <p className={`text-[11px] leading-relaxed font-light opacity-80 ${subtextColor}`}>
                    Safe, clean beauty tested by dermatologists.
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 text-left">
                  <Clock className={`w-5 h-5 opacity-80 ${textColor}`} />
                  <p className={`text-[11px] leading-relaxed font-light opacity-80 ${subtextColor}`}>
                    Fast & flawless makeup made for real mornings.
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 text-left">
                  <Heart className={`w-5 h-5 opacity-80 ${textColor}`} />
                  <p className={`text-[11px] leading-relaxed font-light opacity-80 ${subtextColor}`}>
                    No animal testing — ever. Certified cruelty-free.
                  </p>
                </div>
              </div>

              {/* Mobile Theme Control Capsule */}
              <div className="flex md:hidden gap-1 p-1 mt-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mx-auto self-center">
                <button 
                  onClick={() => setHeroTheme('light')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] tracking-[0.1em] uppercase font-bold transition-all ${
                    isLight 
                      ? 'bg-[#381A0F] text-white shadow-sm' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  Warm Beige
                </button>
                <button 
                  onClick={() => setHeroTheme('dark')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] tracking-[0.1em] uppercase font-bold transition-all ${
                    !isLight 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-[#381A0F]/60 hover:text-[#381A0F]'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  Deep Noir
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column: Model Face photo with complex textured edge */}
          <div className="relative w-full z-10 flex justify-center order-1 md:order-2">
            <AnimatePresence mode="wait">
              <motion.div 
                key={heroTheme}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-[10/12] w-full max-w-[480px] rounded-[3rem] md:rounded-[4.5rem] overflow-hidden shadow-2xl shadow-black/15 group animate-in fade-in slide-in-from-right-12 duration-1000 ease-out delay-200"
              >
                {/* Background Shadow Layer */}
                <div className={`absolute inset-0 z-0 bg-gradient-to-t ${isLight ? 'from-black/10' : 'from-black/40'} to-transparent`} />
                
                <img 
                  src={
                    isLight 
                      ? "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop" 
                      : "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=1200&auto=format&fit=crop"
                  } 
                  alt="Refined Makeup Artistry" 
                  className="w-full h-full object-cover z-0 transition-transform duration-[1500ms] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Layer 1: shadow cream rip effect */}
                <svg 
                  className="absolute top-0 bottom-0 left-0 h-full w-24 opacity-35 transition-all duration-700 pointer-events-none fill-current z-10 hidden md:block" 
                  viewBox="0 0 100 1000" 
                  preserveAspectRatio="none"
                  style={{ color: isLight ? '#D5CDBC' : '#1C1613' }}
                >
                  <path d="M 100 0 C 80 120, 25 220, 70 370 C 110 520, 35 670, 75 820 C 95 910, 70 960, 100 1000 L 0 1000 L 0 0 Z" />
                </svg>

                {/* Layer 2: Main match-bg block cream ripped divider shape */}
                <svg 
                  className="absolute top-0 bottom-0 left-[-2px] h-full w-20 transition-all duration-700 pointer-events-none fill-current z-10 hidden md:block" 
                  viewBox="0 0 100 1000" 
                  preserveAspectRatio="none"
                  style={{ color: isLight ? '#E6CEBC' : '#0D0B0A' }}
                >
                  <path d="M 100 0 C 85 100, 30 200, 75 350 C 115 500, 40 650, 80 800 C 100 900, 75 950, 100 1000 L 0 1000 L 0 0 Z" />
                </svg>

                {/* Floating card indicator */}
                <div className={`absolute bottom-6 left-6 right-6 p-5 rounded-[2rem] border backdrop-blur-md flex items-center justify-between z-20 ${
                  isLight 
                    ? 'bg-white/80 border-white/50 shadow-lg text-brand-900' 
                    : 'bg-black/80 border-white/10 shadow-lg text-white'
                }`}>
                  <div>
                    <p className="text-[11px] tracking-[0.1em] uppercase font-bold opacity-80 mb-0.5">Atelier Glowmuse</p>
                    <p className={`text-xs opacity-60 ${isLight ? 'text-brand-800' : 'text-slate-300'}`}>Specialized Bridal & Editorial Looks</p>
                  </div>
                  <Link 
                    to="/book" 
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                      isLight ? 'bg-brand-900 text-white' : 'bg-white text-black'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-end mb-24">
            <div>
              <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-brand-800/40 mb-6 block">The Menu</span>
              <h2 className="font-serif text-5xl md:text-6xl text-brand-900 leading-tight">
                Signature services
              </h2>
            </div>
            <div className="max-w-md ml-auto text-right">
              <p className="text-brand-800/60 leading-relaxed font-light">
                Each session is built around your features and the lighting of your event — long-wear formulas, hand-mixed shades, on-camera tested.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingServices ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] rounded-[3rem] bg-brand-100 animate-pulse"></div>
              ))
            ) : services.length === 0 ? (
              <div className="text-brand-800/40 italic py-12">No signature services available at the moment.</div>
            ) : (
              services.map((service, idx) => (
                <div key={service.id} className="group cursor-pointer">
                  <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden mb-8 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-brand-900/5 group-hover:-translate-y-1">
                    <img 
                      src={service.image_url || `https://images.unsplash.com/photo-${[
                        '1522337660859-02fbefca4702',
                        '1594465919760-441fe5908ab0',
                        '1596462502278-27bfdc403348',
                        '1612817288484-6f916006741a',
                        '1616683693504-3ea7e9ad6fec',
                        '1596704017254-9b121068fb31',
                        '1580870059885-a4b5d63428df',
                        '1487412720507-e7ab37603c6f'
                      ][idx % 8]}?q=80&w=1200&auto=format&fit=crop`}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
                      <span className="text-[13px] font-bold text-brand-900 tracking-wider">${service.price}</span>
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-2xl text-brand-900 leading-none">{service.name}</h3>
                      <span className="flex items-center gap-3 text-[11px] tracking-[0.1em] uppercase font-bold text-brand-800/40 whitespace-nowrap">
                        <Clock className="w-3 h-3" /> {service.duration_minutes} min
                      </span>
                    </div>
                    <p className="text-[14px] text-brand-800/60 leading-relaxed font-light line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
