import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PublicLayout() {
  const [businessName, setBusinessName] = useState("Studio Elegance");

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from("business_settings")
        .select("business_name")
        .maybeSingle();

      if (data && data.business_name) {
        setBusinessName(data.business_name);
      }
    }
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-900 selection:bg-brand-300 selection:text-brand-900">
      <header className="sticky top-0 z-50 glass-panel border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-serif tracking-wide uppercase">
            {businessName}
          </Link>
          <nav className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-medium">
            <Link to="/" className="hover:text-amber-700 transition-colors">Home</Link>
            <a href="/#services" className="hover:text-amber-700 transition-colors">Services</a>
            <a href="/#about" className="hover:text-amber-700 transition-colors">The Studio</a>
          </nav>
          <Link 
            to="/book" 
            className="px-6 py-3 bg-brand-900 text-brand-100 uppercase tracking-widest text-xs hover:bg-brand-800 transition-colors rounded-full"
          >
            Book Session
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-brand-900 text-brand-100 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-sm uppercase tracking-wider">
          <div>
            <h3 className="font-serif text-2xl mb-4 text-brand-200">{businessName}</h3>
            <p className="opacity-70 leading-relaxed normal-case tracking-normal text-brand-200">
              Refined beauty experiences for the modern romantic.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-brand-300">Explore</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="hover:text-brand-300 transition-colors">Home</Link>
              <Link to="/book" className="hover:text-brand-300 transition-colors">Book Appointment</Link>
              <Link to="/admin/login" className="hover:text-brand-300 transition-colors opacity-50 mt-4">Admin Login</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-brand-300">Contact</h4>
            <div className="flex flex-col gap-2 opacity-70">
              <p>Email for inquiries</p>
              <p>By Appointment Only</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
