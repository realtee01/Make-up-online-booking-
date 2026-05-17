import { MapPin, Phone, Mail, Instagram, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BusinessSettings } from "../../types";

export default function Contact() {
  const [settings, setSettings] = useState<Partial<BusinessSettings> | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      const { data } = await supabase.from("business_settings").select("*").single();
      if (isMounted && data) {
        setSettings(data);
      }
    };
    fetchSettings();
    return () => { isMounted = false };
  }, []);

  return (
    <div className="bg-brand-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="font-serif text-5xl lg:text-7xl text-brand-900 mb-8 font-light tracking-tight">
              Get in <span className="italic text-brand-800/40">touch</span>
            </h1>
            <p className="text-xl text-brand-800/60 leading-relaxed mb-12 font-light max-w-lg">
              Whether you're inquiring about your wedding day, a special event, or editorial work, we would love to hear from you.
            </p>

            <div className="space-y-10">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-brand-900/5 text-brand-900">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-800/40 mb-2">Location</h3>
                  <p className="text-brand-900 text-lg">{settings?.address || '123 Atelier Street, Suite 4B\nParis, TX 75460'}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-brand-900/5 text-brand-900">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-800/40 mb-2">Email</h3>
                  <a href={`mailto:${settings?.email || 'hello@maisonlumiere.com'}`} className="text-brand-900 text-lg hover:text-brand-700 transition-colors">
                    {settings?.email || 'hello@maisonlumiere.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-brand-900/5 text-brand-900">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-800/40 mb-2">Phone</h3>
                  <a href={`tel:${settings?.phone || '+1234567890'}`} className="text-brand-900 text-lg hover:text-brand-700 transition-colors">
                    {settings?.phone || '+1 (234) 567-890'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-brand-900/5 text-brand-900">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-800/40 mb-2">Social</h3>
                  <a href="#" className="text-brand-900 text-lg hover:text-brand-700 transition-colors">
                    @maisonlumiere
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-150">
            <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-900/10">
              <img 
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop" 
                alt="Studio space with makeup station" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent flex items-end p-8 sm:p-12">
                <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-xl w-full max-w-sm">
                  <div className="flex items-center gap-4 mb-4 text-brand-900">
                    <Clock className="w-6 h-6" />
                    <h3 className="font-serif text-xl">Studio Hours</h3>
                  </div>
                  <div className="space-y-2 text-sm text-brand-800/70">
                    <div className="flex justify-between"><span>Monday - Friday</span><span className="font-medium text-brand-900">9am - 6pm</span></div>
                    <div className="flex justify-between"><span>Saturday</span><span className="font-medium text-brand-900">8am - 4pm</span></div>
                    <div className="flex justify-between"><span>Sunday</span><span className="font-medium text-brand-900">By Appt Only</span></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-10 -right-10 w-64 h-64 bg-brand-100 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50"></div>
            <div className="absolute bottom-10 -left-10 w-48 h-48 bg-brand-200 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50"></div>
          </div>

        </div>
      </div>
    </div>
  );
}
