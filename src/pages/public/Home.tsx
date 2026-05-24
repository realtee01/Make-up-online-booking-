import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Service } from "../../types";
import { ArrowRight, Sparkles, Clock } from "lucide-react";

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  
  // Provided by PublicLayout
  const { businessName, businessDescription, setIsChildLoading } = useOutletContext<{ 
    businessName: string, 
    businessDescription: string,
    setIsChildLoading?: (loading: boolean) => void 
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
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-800/40">Years<br/>Artistry</span>
              </div>
              <div className="w-px h-10 bg-brand-200"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif text-brand-900 leading-none mb-1">400+</span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-800/40">Brides<br/>Prepared</span>
              </div>
              <div className="w-px h-10 bg-brand-200"></div>
              <div className="flex gap-1 text-amber-500/60">
                {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-lg">★</span>)}
              </div>
            </div>
          </div>
          
          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 ease-out delay-200">
            <div className="aspect-[10/12] rounded-[4rem] overflow-hidden shadow-2xl shadow-brand-900/10">
              <img 
                src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2669&auto=format&fit=crop" 
                alt="Refined Makeup Artistry" 
                className="w-full h-full object-cover"
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
