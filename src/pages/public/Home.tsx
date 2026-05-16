import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Service } from "../../types";
import { ArrowRight, Sparkles, Clock } from "lucide-react";

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setServices(data);
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#1C1A19]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1512496350731-92ebc9deea63?q=80&w=2670&auto=format&fit=crop" 
            alt="Makeup Studio" 
            className="w-full h-full object-cover opacity-50 transition-transform duration-1000 scale-105"
          />
          {/* Subtle Dust/Sparkle Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.15] mix-blend-color-dodge" 
            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}
          ></div>
          {/* Enhanced Gradient Overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A19] via-[#1C1A19]/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1A19]/70 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-brand-100 flex flex-col items-center">
          <span className="text-brand-300 uppercase tracking-[0.3em] text-sm mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 
            Premium Beauty Services
            <Sparkles className="w-4 h-4" />
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 font-light tracking-tight">
            Refined artistry <br/>
            <span className="italic text-brand-300">for the modern</span> <br/>
            romantic.
          </h1>
          <p className="max-w-xl text-lg md:text-xl font-sans font-light opacity-80 mb-12 leading-relaxed">
            Specializing in soft glam, bridal, and editorial looks. We enhance your natural elegance so you feel profoundly yourself, only more radiant.
          </p>
          <Link 
            to="/book" 
            className="group relative inline-flex items-center justify-center px-8 py-4 text-xs tracking-widest uppercase bg-brand-100 text-brand-900 hover:bg-white transition-all overflow-hidden rounded-full font-medium"
          >
            <span>Reserve Your Session</span>
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-brand-100 z-10 relative rounded-t-[3rem] -mt-12 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
            <div className="lg:col-span-4 lg:sticky lg:top-32 self-start">
              <span className="text-brand-800/50 uppercase tracking-widest text-xs font-semibold mb-4 block">The Offering</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-900 leading-tight mb-6">
                Curated <span className="italic text-brand-800">beauty</span> experiences.
              </h2>
              <p className="text-brand-800/70 leading-relaxed mb-8">
                From flawless bridal preparations to camera-ready photoshoot pacing, every session is tailored to your unique features and vision.
              </p>
            </div>
            
            <div className="lg:col-span-8 flex flex-col gap-8">
              {services.map((service, idx) => (
                <div key={service.id} className="group relative bg-white p-8 md:p-10 rounded-[2rem] premium-shadow border border-brand-200/50 hover:border-brand-300 transition-all flex flex-col md:flex-row gap-8 justify-between">
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl md:text-3xl text-brand-900 mb-3 group-hover:text-amber-800 transition-colors">{service.name}</h3>
                    <p className="text-brand-800/70 leading-relaxed mb-6 max-w-md">{service.description}</p>
                    <div className="flex items-center gap-6 text-sm uppercase tracking-widest text-brand-900/60 font-medium">
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {service.duration_minutes} Mins</span>
                      <span>—</span>
                      <span>${service.price}</span>
                    </div>
                  </div>
                  <div className="md:self-end">
                    <Link 
                      to="/book" 
                      state={{ selectedServiceId: service.id }}
                      className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-brand-200 text-brand-900 group-hover:bg-brand-900 group-hover:text-brand-100 transition-all"
                    >
                      <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
              
              {services.length === 0 && (
                <div className="text-slate-400 italic">No services available at the moment.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-brand-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="relative">
              <div className="aspect-[3/4] rounded-t-[10rem] overflow-hidden relative z-10 w-4/5">
                <img 
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2000&auto=format&fit=crop" 
                  alt="Makeup application detail" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-10 right-0 w-2/3 aspect-square rounded-full overflow-hidden border-8 border-brand-100 z-20 premium-shadow">
                <img 
                  src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=2000&auto=format&fit=crop" 
                  alt="Makeup artist tools" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div>
              <span className="text-brand-800/50 uppercase tracking-widest text-xs font-semibold mb-6 block">The Studio</span>
              <h2 className="font-serif text-4xl md:text-5xl text-brand-900 leading-tight mb-8">
                Enhancing your <span className="italic">natural architecture</span>.
              </h2>
              <div className="space-y-6 text-brand-800/70 leading-relaxed font-light text-lg">
                <p>
                  Studio Elegance was founded on a simple philosophy: makeup should elevate, not mask. We specialize in polished, breathable looks that translate beautifully in person and on camera.
                </p>
                <p>
                  From strict hygiene protocols to curating the finest luxury cosmetics, every detail of our studio environment is designed to provide a serene, trusting, and premium experience.
                </p>
              </div>
              
              <div className="mt-12 inline-flex flex-col">
                <Link to="/book" className="text-sm font-medium uppercase tracking-widest text-brand-900 hover:text-amber-700 transition-colors pb-2 border-b border-brand-900 flex items-center gap-2">
                  Plan your visit <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
