import { useEffect, useState } from "react";
import { Link, useOutletContext, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Service } from "../../types";
import { ArrowRight, Sparkles, Clock, Award, BookOpen, Heart, ShieldCheck, CheckCircle2, Star, Calendar } from "lucide-react";

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [aboutTab, setAboutTab] = useState<"artist" | "records" | "press">("artist");
  const location = useLocation();
  
  // Provided by PublicLayout
  const { businessName, businessDescription, setIsChildLoading } = useOutletContext<{ 
    businessName: string, 
    businessDescription: string,
    setIsChildLoading?: (loading: boolean) => void 
  }>();

  // Smooth scroll to element matching the hash in the URL on load or route update
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        // slight delay to wait for any renders
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash, isLoadingServices]);

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

  return (
    <div className="flex flex-col bg-brand-50">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-brand-200 mb-8 shadow-sm">
              <span className="w-1.5 h-1.5 bg-brand-300 rounded-full animate-pulse"></span>
              <span className="text-[11px] tracking-[0.2em] font-bold uppercase text-brand-800/60">Now Booking · Spring Season</span>
            </div>
            
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[100px] leading-[1.1] sm:leading-[1] text-brand-900 mb-8 font-light tracking-tight">
              Soft light, <br className="hidden sm:block" />
              <span className="italic text-brand-800/40">refined</span> beauty.
            </h1>
            
            <p className="max-w-md text-lg text-brand-800/60 mb-12 leading-relaxed font-light">
              Maison Lumière is an intimate makeup atelier crafting bridal, editorial, and event looks tailored to your features, lighting, and the moment you're getting ready for.
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 mb-12 sm:mb-16">
              <Link 
                to="/book" 
                className="group px-8 py-4 sm:px-10 sm:py-5 bg-brand-900 text-brand-50 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/10 flex items-center justify-center gap-4"
              >
                Reserve your session
                <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </Link>
              <nav className="flex justify-center gap-8 text-[11px] tracking-[0.1em] text-brand-800 font-bold uppercase border-b border-brand-900/10 pb-1 hover:border-brand-900 transition-all cursor-pointer">
                <a href="#services">View the menu</a>
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-8 sm:gap-12 justify-center sm:justify-start">
              <div className="flex flex-col">
                <span className="text-2xl font-serif text-brand-900 leading-none mb-1">12+</span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-900/60">Years<br/>Artistry</span>
              </div>
              <div className="w-px h-10 bg-brand-200" aria-hidden="true"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif text-brand-900 leading-none mb-1">400+</span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-900/60">Brides<br/>Prepared</span>
              </div>
              <div className="w-px h-10 bg-brand-200" aria-hidden="true"></div>
              <div className="flex gap-1 text-amber-600" aria-label="5 out of 5 stars review rating">
                {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-lg" aria-hidden="true">★</span>)}
              </div>
            </div>
          </div>
          
          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 ease-out delay-200">
            <div className="aspect-[10/12] rounded-[4rem] overflow-hidden shadow-2xl shadow-brand-900/10 bg-brand-100">
              <img 
                src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?fm=webp&q=70&w=1000&auto=format&fit=crop" 
                alt="Refined Makeup Artistry" 
                className="w-full h-full object-cover"
                fetchPriority="high"
                width={500}
                height={600}
              />
            </div>
            {/* Absolute Floating Badge on Image */}
            <div className="absolute bottom-4 left-4 sm:bottom-10 sm:left-[-40px] right-4 sm:right-auto bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-xl shadow-brand-900/10 border border-white/50 sm:max-w-[280px]">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[11px] tracking-[0.1em] uppercase font-bold text-brand-800/60 mb-1">Bridal · Editorial · Event</p>
                  <p className="text-xs text-brand-800/40 font-medium">By appointment only</p>
                </div>
                <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center text-brand-50">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
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
                      src={service.image_url ? `${service.image_url}${service.image_url.includes('?') ? '&' : '?'}fm=webp&q=70&w=600` : `https://images.unsplash.com/photo-${[
                        '1522337660859-02fbefca4702',
                        '1594465919760-441fe5908ab0',
                        '1596462502278-27bfdc403348',
                        '1612817288484-6f916006741a',
                        '1616683693504-3ea7e9ad6fec',
                        '1596704017254-9b121068fb31',
                        '1580870059885-a4b5d63428df',
                        '1487412720507-e7ab37603c6f'
                      ][idx % 8]}?fm=webp&q=70&w=600&auto=format&fit=crop`}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                      width={400}
                      height={500}
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

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 md:py-32 lg:py-40 bg-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            
            {/* Left: Portait & Quick Stats */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-900/10">
                <img 
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?fm=webp&q=70&w=800&auto=format&fit=crop" 
                  alt="Sophie Laurent - Artist & Founder" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={400}
                  height={500}
                />
              </div>
              
              {/* Overlay Signature Badge - Relative on mobile, turns absolute on desktop */}
              <div className="relative lg:absolute mt-6 lg:mt-0 right-0 bottom-0 lg:-bottom-8 lg:-right-8 bg-brand-900 text-brand-50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl max-w-full sm:max-w-xs mx-auto lg:mx-0">
                <p className="font-serif text-xl italic text-brand-200 mb-1">Sophie Laurent</p>
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-200/60 mb-4">Founder / Lead Director</p>
                <p className="text-xs text-brand-50/70 font-light leading-relaxed">
                  "Artistry is not about altering who you are, but translating your natural light into the perfect medium for your moment."
                </p>
              </div>
            </div>
            
            {/* Right: Rich Interactive Records & Profile Content */}
            <div className="lg:col-span-7 pt-4">
              <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-brand-900/60 mb-4 block">The Director & Legacy</span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-brand-900 mb-8 leading-tight font-light">
                Meet the founder & <br/>
                <span className="italic text-brand-900/50">past records</span>.
              </h2>
              
              {/* Tab Navigation Controls with full ARIA landmarks and roles */}
              <div 
                className="flex border-b border-brand-200 mb-8 overflow-x-auto gap-2 sm:gap-4 no-scrollbar pb-0.5 scroll-smooth snap-x"
                role="tablist"
                aria-label="Founder professional background tabs"
              >
                <button 
                  id="tab-artist"
                  role="tab"
                  aria-selected={aboutTab === "artist"}
                  aria-controls="about-tab-panel"
                  onClick={() => setAboutTab("artist")}
                  className={`pb-4 px-2 text-[11px] sm:text-[12px] uppercase tracking-[0.15em] font-bold transition-all relative border-b-2 whitespace-nowrap snap-start focus:outline-none focus:ring-2 focus:ring-brand-900 rounded-sm ${
                    aboutTab === "artist" 
                      ? "text-brand-900 border-brand-900" 
                      : "text-brand-900/60 border-transparent hover:text-brand-900"
                  }`}
                >
                  The Artist
                </button>
                <button 
                  id="tab-records"
                  role="tab"
                  aria-selected={aboutTab === "records"}
                  aria-controls="about-tab-panel"
                  onClick={() => setAboutTab("records")}
                  className={`pb-4 px-2 text-[11px] sm:text-[12px] uppercase tracking-[0.15em] font-bold transition-all relative border-b-2 whitespace-nowrap snap-start focus:outline-none focus:ring-2 focus:ring-brand-900 rounded-sm ${
                    aboutTab === "records" 
                      ? "text-brand-900 border-brand-900" 
                      : "text-brand-900/60 border-transparent hover:text-brand-900"
                  }`}
                >
                  Historical Records
                </button>
                <button 
                  id="tab-press"
                  role="tab"
                  aria-selected={aboutTab === "press"}
                  aria-controls="about-tab-panel"
                  onClick={() => setAboutTab("press")}
                  className={`pb-4 px-2 text-[11px] sm:text-[12px] uppercase tracking-[0.15em] font-bold transition-all relative border-b-2 whitespace-nowrap snap-start focus:outline-none focus:ring-2 focus:ring-brand-900 rounded-sm ${
                    aboutTab === "press" 
                      ? "text-brand-900 border-brand-900" 
                      : "text-brand-900/60 border-transparent hover:text-brand-900"
                  }`}
                >
                  Press & Honors
                </button>
              </div>

              {/* Dynamic Content Panels with subtle transitions and screen reader live state support */}
              <div id="about-tab-panel" role="tabpanel" aria-labelledby={`tab-${aboutTab}`} className="min-h-[340px]">
                {aboutTab === "artist" && (
                  <div className="space-y-6 text-brand-800/70 leading-relaxed font-light text-base md:text-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p>
                      Sophie Laurent is an internationally acclaimed master makeup artist with over 12 years of hands-on expertise traveling across Paris, Stockholm, and private islands. Raised in Stockholm and educated in elite Parisian studio art institutions, Sophie has developed an architectural approach to beauty.
                    </p>
                    <p>
                      Maison Lumière is her dedicated studio, capturing clean-skin glows, structural highlighting, and seamless premium makeup. "We reject heavy layers. Each design is hand-tailored to look effortless under high-definition camera lenses and afternoon sun alike."
                    </p>
                    <p className="text-xs sm:text-sm italic text-brand-800/50 pt-3 border-t border-brand-100 flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-brand-900 flex-shrink-0" />
                      Based permanently in Paris and Stockholm, with worldwide booking availability for elite occasions.
                    </p>
                  </div>
                )}

                {aboutTab === "records" && (
                  <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-brand-800/60 leading-relaxed font-light text-base md:text-lg">
                      Our past records showcase a legacy of outstanding reliability, flawless timeline coordination, and professional acclaim.
                    </p>
                    
                    {/* Bento of Records & Milestones */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-brand-50/40 border border-brand-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex gap-4 items-start">
                        <div className="w-10 h-10 bg-brand-900 rounded-2xl flex items-center justify-center text-brand-100 flex-shrink-0 shadow-sm">
                          <Heart className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif text-base sm:text-lg text-brand-900 mb-1">400+ Wedding Parties</h4>
                          <p className="text-xs text-brand-800/60 leading-relaxed font-light">
                            Flawless record of zero late starts. Hand-logged personalized prep timelines that align perfectly with wedding planners.
                          </p>
                        </div>
                      </div>

                      <div className="bg-brand-50/40 border border-brand-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex gap-4 items-start">
                        <div className="w-10 h-10 bg-brand-900 rounded-2xl flex items-center justify-center text-brand-100 flex-shrink-0 shadow-sm">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif text-base sm:text-lg text-brand-900 mb-1">50+ Editorial Covers</h4>
                          <p className="text-xs text-brand-800/60 leading-relaxed font-light">
                            Signature concepts featured extensively across major digital & physical high-fashion magazines in Scandinavia and Southern Europe.
                          </p>
                        </div>
                      </div>

                      <div className="bg-brand-50/40 border border-brand-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex gap-4 items-start">
                        <div className="w-10 h-10 bg-brand-900 rounded-2xl flex items-center justify-center text-brand-100 flex-shrink-0 shadow-sm">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif text-base sm:text-lg text-brand-900 mb-1">28 International Shows</h4>
                          <p className="text-xs text-brand-800/60 leading-relaxed font-light">
                            Active backstage credentials across Paris, Stockholm, Milan, and New York Fashion Weeks since 2016.
                          </p>
                        </div>
                      </div>

                      <div className="bg-brand-50/40 border border-brand-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex gap-4 items-start">
                        <div className="w-10 h-10 bg-brand-900 rounded-2xl flex items-center justify-center text-brand-100 flex-shrink-0 shadow-sm">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif text-base sm:text-lg text-brand-900 mb-1">100% Client Clean State</h4>
                          <p className="text-xs text-brand-800/60 leading-relaxed font-light">
                            Full sanitation audits, customized skin allergy pre-logs, and supreme safety practices for your complete peace of mind.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aboutTab === "press" && (
                  <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-brand-800/60 leading-relaxed font-light text-base md:text-lg">
                      Maison Lumière has been featured in top physical and digital print publications. See what leading critics and luxury advisors write about our signature styles:
                    </p>
                    
                    <div className="space-y-4 pt-2">
                      <div className="border-l-2 border-brand-300 pl-4 sm:pl-6 py-1">
                        <p className="text-xs sm:text-sm italic text-brand-800/75 leading-relaxed font-light mb-2">
                          "Sophie's brush is driven by an incredible sense of lighting architecture. She behaves more like a sculptor than a cosmetic stylist."
                        </p>
                        <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-brand-900">- Vogue Scandinavia</p>
                      </div>

                      <div className="border-l-2 border-brand-300 pl-4 sm:pl-6 py-1">
                        <p className="text-xs sm:text-sm italic text-brand-800/75 leading-relaxed font-light mb-2">
                          "The most requested bridal artist for the discerning editorial romantic. Her technique ensures makeup translates transparently through state-of-the-art camera lenses."
                        </p>
                        <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-brand-900">- Brides UK</p>
                      </div>

                      <div className="border-l-2 border-brand-300 pl-4 sm:pl-6 py-1">
                        <p className="text-xs sm:text-sm italic text-brand-800/75 leading-relaxed font-light mb-2">
                          "A masterful grasp of modern color theory. Under Maison Lumière, beauty feels incredibly effortless, organic, and beautifully integrated."
                        </p>
                        <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-brand-900">- Harper's Bazaar</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location & Details Quick Box */}
              <div className="mt-8 pt-8 border-t border-brand-900/10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12">
                <div>
                  <h4 className="text-[11px] tracking-[0.2em] uppercase font-bold text-brand-900 mb-2">Principal Locations</h4>
                  <p className="text-sm text-brand-800/60 leading-relaxed font-light italic">Paris · Stockholm · Nice</p>
                </div>
                <div>
                  <h4 className="text-[11px] tracking-[0.2em] uppercase font-bold text-brand-900 mb-2">Philosophy</h4>
                  <p className="text-sm text-brand-800/60 leading-relaxed font-light italic">Luminous, timeless, clean skin</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
