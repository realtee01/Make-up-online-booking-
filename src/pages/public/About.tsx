import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function About() {
  const { businessName, businessDescription, setIsChildLoading } = useOutletContext<{ 
    businessName: string, 
    businessDescription: string,
    setIsChildLoading?: (loading: boolean) => void 
  }>();

  useEffect(() => {
    setIsChildLoading?.(false);
  }, [setIsChildLoading]);

  return (
    <div className="flex flex-col bg-brand-50 pt-20 pb-40">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="relative animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl shadow-brand-900/10">
              <img 
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop" 
                alt="Artist at work" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-12 -right-12 w-64 aspect-square rounded-[3rem] overflow-hidden border-[12px] border-white shadow-2xl hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200&auto=format&fit=crop" 
                alt="Makeup detail" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="animate-in fade-in slide-in-from-right-12 duration-1000 delay-150 relative z-10">
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-brand-800/40 mb-8 block">About the artist</span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-900 mb-10 leading-tight font-light transition-all">
              Crafting <br/>
              <span className="italic text-brand-800/40">luminous</span> presence.
            </h1>
            <div className="space-y-6 text-brand-800/60 leading-relaxed font-light sm:text-lg">
              <p>
                With over a decade of experience in the editorial and bridal industry, I founded {businessName} to bring a refined, sophisticated approach to makeup artistry. My work has graced the pages of international magazines and accompanied hundreds of brides on their most important day.
              </p>
              <p className="whitespace-pre-wrap">
                {businessDescription}
              </p>
              <p>
                My philosophy is simple: makeup should enhance, not mask. It should catch the light beautifully, feel weightless, and photograph flawlessly. I specialize in skin-focused artistry that feels timeless, elegant, and unmistakably you.
              </p>
            </div>
            
            <div className="mt-12 pt-12 border-t border-brand-900/10 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
              <div>
                <h4 className="text-[11px] tracking-[0.2em] uppercase font-bold text-brand-900 mb-4">Past Records</h4>
                <ul className="text-sm text-brand-800/60 leading-relaxed font-light space-y-2">
                  <li>• Over 400 brides prepared</li>
                  <li>• Published in Vogue & Elle</li>
                  <li>• 12+ years of industry experience</li>
                  <li>• Certified in advanced color theory</li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] tracking-[0.2em] uppercase font-bold text-brand-900 mb-4">Philosophy</h4>
                <p className="text-sm text-brand-800/60 leading-relaxed font-light italic">Timeless, luminous, effortless. The best version of you, illuminated.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
