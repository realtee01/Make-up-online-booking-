import { useEffect, useState, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Service } from "../../types";
import { 
  ArrowRight, Sparkles, Clock, ShieldCheck, Heart, 
  Sun, Moon, Scissors, Brush, Palette, Smile, Sparkle, Quote, ChevronLeft, ChevronRight, BookOpen, PenTool, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
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

  const testimonials = [
    {
      quote: "The custom bridal look Sarah created for me felt weightless but lasted through twelve hours of crying and dancing. She is truly a skin sculptor.",
      name: "Eleanor Vance",
      role: "Bridal Client · June 2025"
    },
    {
      quote: "Helena has a mastery over color theory that I've never seen before. My face undertone has never caught the light so flawlessly.",
      name: "Charlotte Sinclair",
      role: "Editorial Director · March 2026"
    },
    {
      quote: "The Signature Makeup is an absolute ritual of pure relaxation. Walking out of Aura makes me feel like I am glowing from inside.",
      name: "Margot Dubois",
      role: "Fashion Consultant · February 2026"
    }
  ];

  const blogArticles = [
    {
      title: "The Architecture of Dewy, Luminous Skin",
      category: "Rituals",
      date: "April 12, 2026",
      readTime: "5 Min Read",
      image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=800",
      excerpt: "Understanding skin-prep techniques that catch light perfectly on camera and live in natural setting."
    },
    {
      title: "Seasonal Color Harmony & Undertones",
      category: "Masterclass",
      date: "March 28, 2026",
      readTime: "8 Min Read",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800",
      excerpt: "How to identify your structural warm or cool tones and pair them with hand-mixed palettes."
    },
    {
      title: "Bridal Editorial: Behind the Scenes",
      category: "Behind the Scenes",
      date: "February 15, 2026",
      readTime: "4 Min Read",
      image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800",
      excerpt: "An inside look at our specialized long-wear bridal preparation methods for spring ceremonies."
    }
  ];

  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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
              className="w-full"
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 md:mb-8 ${borderColor} bg-white/10 backdrop-blur-sm self-start`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLight ? 'bg-[#381A0F]' : 'bg-brand-100'}`}></span>
                <span className={`text-[10px] tracking-[0.3em] font-bold uppercase ${textColor}`}>Atelier Aura · Spring 2026</span>
              </div>
              
              <h1 className={`font-serif text-5xl sm:text-6xl lg:text-[76px] leading-[1.08] font-medium tracking-tight ${textColor} mb-6`}>
                Unleash Your <br />
                <span className="italic font-light opacity-90">Inner Radiance</span>
              </h1>
              
              <p className={`max-w-md text-base sm:text-lg ${subtextColor} mb-8 md:mb-10 leading-relaxed font-light`}>
                Look effortlessly radiant with bespoke makeup artistry crafted to align with the natural lighting and architecture of your unique features.
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
                  <Link to="/#services">View the menu</Link>
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
                className="relative aspect-[10/12] w-full max-w-[480px] rounded-[3rem] md:rounded-[4.5rem] overflow-hidden shadow-2xl shadow-black/15 group"
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
                    <p className="text-[11px] tracking-[0.1em] uppercase font-bold opacity-80 mb-0.5">Atelier Aura</p>
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

      {/* Section: Salon (Our Philosophy with beautiful Arches) */}
      <section className="py-28 bg-white relative overflow-hidden" id="about-studio">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Images Column */}
          <div className="relative flex items-center justify-center w-full">
            <div className="grid grid-cols-2 gap-6 w-full max-w-[500px]">
              <div className="space-y-6 pt-12">
                <div className="rounded-t-full overflow-hidden aspect-[3/4] shadow-lg group">
                  <img 
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200" 
                    alt="Artistry Session" 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                  />
                </div>
                <div className="rounded-full aspect-square bg-brand-peach/10 flex items-center justify-center p-8">
                  <div className="text-center">
                    <span className="font-serif text-5xl text-brand-peach block mb-2">12+</span>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-brand-900/60 font-bold">Years Artistry</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-full overflow-hidden aspect-square shadow-lg group">
                  <img 
                    src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200" 
                    alt="Artistry Detail" 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                  />
                </div>
                <div className="rounded-t-full overflow-hidden aspect-[3/4] shadow-lg group">
                  <img 
                    src="https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200" 
                    alt="Luminous Skin" 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Text Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sand rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-brand-peach" />
              <span className="font-sans text-[10px] tracking-widest uppercase font-bold text-brand-900/80">Our Philosophy</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-900 font-light leading-tight">
              Our salon is where <br />
              artistry meets <span className="italic text-brand-peach">personality</span>.
            </h2>
            <p className="font-sans text-brand-900/60 leading-relaxed font-light text-base">
              We believe beauty is an extension of your identity. Each service is meticulously crafted around your facial architecture, skin undertone, and lifestyle. Step into an oasis of elegant tranquility.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-brand-900/10">
              <div>
                <h4 className="font-serif text-xl text-brand-900 mb-2 font-medium">Bespoke Direction</h4>
                <p className="font-sans text-xs sm:text-sm text-brand-900/50 leading-relaxed font-light">Custom looks designed exclusively for your features and personal brand.</p>
              </div>
              <div>
                <h4 className="font-serif text-xl text-brand-900 mb-2 font-medium">Sustainable Luxury</h4>
                <p className="font-sans text-xs sm:text-sm text-brand-900/50 leading-relaxed font-light">We use only organic, toxic-free and premium grade cruelty-free ingredients.</p>
              </div>
            </div>
            <div className="pt-4">
              <Link 
                to="/about" 
                className="inline-flex items-center gap-3 bg-brand-900 text-white px-8 py-4 rounded-full font-sans text-[11px] font-bold uppercase tracking-widest hover:bg-brand-peach transition-all duration-300 shadow-md"
              >
                Discover Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section with Dynamic Loading */}
      <section id="services" className="py-28 bg-brand-sand/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-cream/20 rounded-full blur-[100px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-end mb-20">
            <div>
              <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-brand-peach mb-4 block">The Menu</span>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-900 leading-tight">
                Signature services
              </h2>
            </div>
            <div className="max-w-md ml-auto text-left md:text-right">
              <p className="font-sans text-brand-900/60 leading-relaxed font-light text-base">
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
              <div className="text-brand-900/40 italic py-12">No signature services available at the moment.</div>
            ) : (
              services.map((service, idx) => (
                <motion.div 
                  key={service.id} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="group bg-white p-6 rounded-[2.5rem] border border-brand-900/5 hover:border-brand-peach/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-inner">
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
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-brand-900/5">
                      <span className="text-xs font-bold text-brand-900 tracking-wider">${service.price}</span>
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <h3 className="font-serif text-2xl text-brand-900 leading-none group-hover:text-brand-peach transition-colors">{service.name}</h3>
                      <span className="flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase font-bold text-brand-900/40 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-brand-peach" /> {service.duration_minutes} Min
                      </span>
                    </div>
                    <p className="text-sm text-brand-900/60 leading-relaxed font-light line-clamp-2 mb-6">
                      {service.description}
                    </p>
                    <div className="pt-2 border-t border-brand-900/5">
                      <Link 
                        to="/book" 
                        state={{ selectedServiceId: service.id }}
                        className="inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-widest text-brand-900 hover:text-brand-peach transition-colors"
                      >
                        Reserve Session
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Section: Experience Grid (Curated luxury panels) */}
      <section className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sand rounded-full mx-auto">
              <Brush className="w-3.5 h-3.5 text-brand-peach" />
              <span className="font-sans text-[10px] tracking-widest uppercase font-bold text-brand-900/80">Bespoke Experience</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl text-brand-900 font-light">Crafted just for your essence</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Experience Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group bg-brand-sand/30 hover:bg-brand-cream/10 p-8 rounded-[3rem] transition-all duration-500 hover:shadow-lg border border-transparent hover:border-brand-peach/15 flex flex-col justify-between h-[420px]"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-brand-peach/10 flex items-center justify-center text-brand-peach">
                  <Brush className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-3xl text-brand-900 leading-snug">Couture Styling</h3>
                <p className="font-sans text-sm text-brand-900/55 leading-relaxed font-light">Transformative makeup look tailored precisely to your facial shape, skin depth, and event theme.</p>
              </div>
              <div className="pt-6">
                <Link to="/book" className="inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-widest text-brand-900 hover:text-brand-peach transition-colors">
                  Book Session
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Experience Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group bg-brand-sand/30 hover:bg-brand-cream/10 p-8 rounded-[3rem] transition-all duration-500 hover:shadow-lg border border-transparent hover:border-brand-peach/15 flex flex-col justify-between h-[420px]"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-brand-peach/10 flex items-center justify-center text-brand-peach">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-3xl text-brand-900 leading-snug">Color Harmony</h3>
                <p className="font-sans text-sm text-brand-900/55 leading-relaxed font-light">Advanced analysis of warm or cool undertones and custom pigments selected only for your glow.</p>
              </div>
              <div className="pt-6">
                <Link to="/book" className="inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-widest text-brand-900 hover:text-brand-peach transition-colors">
                  Book Session
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Experience Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group bg-brand-sand/30 hover:bg-brand-cream/10 p-8 rounded-[3rem] transition-all duration-500 hover:shadow-lg border border-transparent hover:border-brand-peach/15 flex flex-col justify-between h-[420px]"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-brand-peach/10 flex items-center justify-center text-brand-peach">
                  <Scissors className="w-5 h-5 animate-scissor-cut" />
                </div>
                <h3 className="font-serif text-3xl text-brand-900 leading-snug">Elite Grooming</h3>
                <p className="font-sans text-sm text-brand-900/55 leading-relaxed font-light">Brow styling and flawless lash alignments designed to frame your gaze with ultimate symmetry.</p>
              </div>
              <div className="pt-6">
                <Link to="/book" className="inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-widest text-brand-900 hover:text-brand-peach transition-colors">
                  Book Session
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Experience Card 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group bg-brand-sand/30 hover:bg-brand-cream/10 p-8 rounded-[3rem] transition-all duration-500 hover:shadow-lg border border-transparent hover:border-brand-peach/15 flex flex-col justify-between h-[420px]"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-brand-peach/10 flex items-center justify-center text-brand-peach">
                  <Smile className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-3xl text-brand-900 leading-snug">Bespoke Bridal</h3>
                <p className="font-sans text-sm text-brand-900/55 leading-relaxed font-light">A comprehensive trial and custom look that photographs flawlessly and wears beautifully all night.</p>
              </div>
              <div className="pt-6">
                <Link to="/book" className="inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-widest text-brand-900 hover:text-brand-peach transition-colors">
                  Book Session
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section: Membership & Counter (Luxurious deep mahogany / black section) */}
      <section className="py-28 bg-[#0D0B0A] text-[#FCF9F5] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-brand-peach" />
              <span className="font-sans text-[10px] tracking-widest uppercase font-bold text-brand-cream">Elite Membership</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight">
              Join the collective. <br />Unlock <span className="italic text-brand-peach">unlimited glow</span>.
            </h2>
            <p className="font-sans text-white/60 leading-relaxed font-light text-base">
              Our exclusive Aura Membership offers priority booking, complimentary seasonal consultations, and customized home-care beauty packages. Your skin's architecture deserves nothing less.
            </p>
            <div className="pt-4">
              <Link 
                to="/book" 
                className="inline-flex items-center gap-3 bg-brand-peach text-white px-8 py-4 rounded-full font-sans text-[12px] font-bold uppercase tracking-widest hover:bg-white hover:text-brand-900 transition-all duration-300 shadow-lg"
              >
                Become a Member
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-8 lg:pl-12">
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-center space-y-2 hover:bg-white/10 transition-colors duration-300">
              <span className="font-serif text-5xl text-brand-peach block">12+</span>
              <span className="font-sans text-[11px] uppercase tracking-widest text-white/50 block font-bold">Years Artistry</span>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-center space-y-2 hover:bg-white/10 transition-colors duration-300">
              <span className="font-serif text-5xl text-brand-peach block">5★</span>
              <span className="font-sans text-[11px] uppercase tracking-widest text-white/50 block font-bold">Bridal Ratings</span>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-center space-y-2 hover:bg-white/10 transition-colors duration-300">
              <span className="font-serif text-5xl text-brand-peach block">400+</span>
              <span className="font-sans text-[11px] uppercase tracking-widest text-white/50 block font-bold">Happy Brides</span>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-center space-y-2 hover:bg-white/10 transition-colors duration-300">
              <span className="font-serif text-5xl text-brand-peach block">100%</span>
              <span className="font-sans text-[11px] uppercase tracking-widest text-white/50 block font-bold">Organic Care</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Team/Artisans */}
      <section className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sand rounded-full mx-auto">
              <Smile className="w-3.5 h-3.5 text-brand-peach" />
              <span className="font-sans text-[10px] tracking-widest uppercase font-bold text-brand-900/80">The Artisans</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl text-brand-900 font-light">The master minds of our studio</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Member 1 */}
            <div className="group text-center space-y-6">
              <div className="aspect-[4/5] rounded-full overflow-hidden w-full max-w-[280px] mx-auto shadow-md border-4 border-brand-sand group-hover:border-brand-peach/40 transition-colors duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=600" 
                  alt="Sarah Jenkins" 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                />
              </div>
              <div>
                <h4 className="font-serif text-3xl text-brand-900">Sarah Jenkins</h4>
                <p className="font-sans text-xs text-brand-peach tracking-widest uppercase font-bold mt-1">Founder & Lead Artist</p>
              </div>
            </div>

            {/* Member 2 */}
            <div className="group text-center space-y-6">
              <div className="aspect-[4/5] rounded-full overflow-hidden w-full max-w-[280px] mx-auto shadow-md border-4 border-brand-sand group-hover:border-brand-peach/40 transition-colors duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600" 
                  alt="Helena Rose" 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                />
              </div>
              <div>
                <h4 className="font-serif text-3xl text-brand-900">Helena Rose</h4>
                <p className="font-sans text-xs text-brand-peach tracking-widest uppercase font-bold mt-1">Color Alchemist</p>
              </div>
            </div>

            {/* Member 3 */}
            <div className="group text-center space-y-6">
              <div className="aspect-[4/5] rounded-full overflow-hidden w-full max-w-[280px] mx-auto shadow-md border-4 border-brand-sand group-hover:border-brand-peach/40 transition-colors duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600" 
                  alt="Marcus Laurent" 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                />
              </div>
              <div>
                <h4 className="font-serif text-3xl text-brand-900">Marcus Laurent</h4>
                <p className="font-sans text-xs text-brand-peach tracking-widest uppercase font-bold mt-1">Nail Architect</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: Testimonials with real Interactive Transition */}
      <section className="py-28 bg-brand-sand relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10 relative">
          <Quote className="w-12 h-12 text-brand-peach/40 mx-auto" />
          
          <div className="relative overflow-hidden min-h-[220px] sm:min-h-[180px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 max-w-3xl mx-auto"
              >
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-900 leading-relaxed font-light italic">
                  "{testimonials[currentTestimonial].quote}"
                </p>
                <div>
                  <h5 className="font-sans text-xs tracking-widest uppercase font-bold text-brand-900">{testimonials[currentTestimonial].name}</h5>
                  <p className="font-sans text-[10px] text-brand-900/40 tracking-wider uppercase mt-1">{testimonials[currentTestimonial].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Controls */}
          <div className="flex justify-center gap-6 pt-4">
            <button 
              onClick={handlePrevTestimonial}
              className="w-10 h-10 rounded-full border border-brand-900/10 hover:border-brand-peach flex items-center justify-center text-brand-900 hover:text-brand-peach transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextTestimonial}
              className="w-10 h-10 rounded-full border border-brand-900/10 hover:border-brand-peach flex items-center justify-center text-brand-900 hover:text-brand-peach transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Section: Stylish Blog */}
      <section className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sand rounded-full">
                <BookOpen className="w-3.5 h-3.5 text-brand-peach" />
                <span className="font-sans text-[10px] tracking-widest uppercase font-bold text-brand-900/80">Lumière Notes</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl text-brand-900 font-light">Beauty perspectives & rituals</h2>
            </div>
            <div>
              <Link to="/contact" className="inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-widest text-brand-900 hover:text-brand-peach transition-colors border-b-2 border-brand-peach pb-1">
                View All Articles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogArticles.map((article, idx) => (
              <motion.article 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group space-y-6"
              >
                <div className="rounded-t-full overflow-hidden aspect-[4/5] shadow-md relative">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                  />
                  <span className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full font-sans text-[10px] tracking-widest uppercase font-bold text-brand-900 shadow-sm">
                    {article.category}
                  </span>
                </div>
                <div className="space-y-2 px-2">
                  <span className="font-sans text-[10px] text-brand-900/40 uppercase tracking-widest font-bold">
                    {article.date} · {article.readTime}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-brand-900 leading-snug group-hover:text-brand-peach transition-colors">
                    {article.title}
                  </h3>
                  <p className="font-sans text-sm text-brand-900/50 leading-relaxed font-light line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Luxury CTA Card */}
      <section className="py-28 bg-brand-sand/30 relative">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-[4rem] p-12 md:p-20 text-center space-y-10 shadow-lg relative overflow-hidden border border-brand-900/5"
          >
            {/* Decorative inner curve frame */}
            <div className="absolute inset-4 rounded-[3.2rem] border border-brand-peach/10 pointer-events-none"></div>
            
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <span className="font-sans text-[11px] tracking-[0.4em] uppercase font-bold text-brand-peach block">Appointments</span>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-900 font-light leading-tight">
                Ready to meet <br />the best version of <span className="italic text-brand-peach">you</span>?
              </h2>
              <p className="font-sans text-brand-900/55 leading-relaxed font-light text-base">
                Spaces are highly limited for weekend bridal events and editorial sessions. Lock in your consultation with our master alchemists today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link 
                to="/book" 
                className="w-full sm:w-auto inline-flex items-center justify-center bg-brand-peach text-white px-10 py-5 rounded-full font-sans text-[11px] font-bold uppercase tracking-widest hover:bg-brand-900 transition-all duration-300 shadow-md"
              >
                Book Appointment
              </Link>
              <Link 
                to="/contact" 
                className="w-full sm:w-auto inline-flex items-center justify-center border border-brand-900/10 text-brand-900 px-10 py-5 rounded-full font-sans text-[11px] font-bold uppercase tracking-widest hover:bg-brand-sand transition-all duration-300"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
