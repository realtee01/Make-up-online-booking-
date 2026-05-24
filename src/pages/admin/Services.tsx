import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Service } from "../../types";
import { Plus, Edit2, CheckCircle2, Clock } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function Services() {
  const { theme } = useOutletContext<{ theme: 'light' | 'dark' }>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>({});

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false });
    if (!error && data) {
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
    setLoading(false);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        let MAX_WIDTH = 1200;
        let MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const compress = (q: number, w: number, h: number) => {
          canvas.width = w;
          canvas.height = h;
          if (ctx) {
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
          }
          return canvas.toDataURL("image/webp", q);
        };

        const targetSizeBytes = 150 * 1024; // 150 KB
        const estimateBytes = (dataUri: string) => {
          const base64str = dataUri.split(",")[1];
          return base64str ? Math.floor(base64str.length * 0.75) : 0;
        };

        let quality = 0.9;
        let minQ = 0.1;
        let maxQ = 0.9;
        let w = width;
        let h = height;
        let dataUrl = compress(quality, w, h);
        let bytes = estimateBytes(dataUrl);

        let attempts = 0;
        while (bytes > targetSizeBytes && attempts < 6) {
          maxQ = quality;
          quality = (minQ + maxQ) / 2;
          dataUrl = compress(quality, w, h);
          bytes = estimateBytes(dataUrl);
          attempts++;
        }
        
        while (bytes > targetSizeBytes && attempts < 10) {
          w *= 0.8;
          h *= 0.8;
          dataUrl = compress(quality, w, h);
          bytes = estimateBytes(dataUrl);
          attempts++;
        }

        setCurrentService({ ...currentService, image_url: dataUrl });
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService.name || !currentService.duration_minutes || !currentService.price) return;

    let finalDescription = currentService.description || "";
    if (currentService.image_url) {
      finalDescription += "|||IMAGE_URL|||" + currentService.image_url;
    }

    if (currentService.id) {
      const { error } = await supabase
        .from("services")
        .update({
          name: currentService.name,
          description: finalDescription,
          duration_minutes: currentService.duration_minutes,
          price: currentService.price,
          is_active: currentService.is_active,
        })
        .eq("id", currentService.id);
      
      if (!error) {
        setIsEditing(false);
        fetchServices();
      }
    } else {
      const { error } = await supabase
        .from("services")
        .insert([{
          name: currentService.name,
          description: finalDescription,
          duration_minutes: currentService.duration_minutes,
          price: currentService.price,
          is_active: currentService.is_active !== undefined ? currentService.is_active : true,
        }]);

      if (!error) {
        setIsEditing(false);
        fetchServices();
      }
    }
  };

  const openEdit = (service: Service | null) => {
    if (service) {
      setCurrentService(service);
    } else {
      setCurrentService({ is_active: true });
    }
    setIsEditing(true);
  };

  const toggleActive = async (service: Service) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !service.is_active })
      .eq("id", service.id);
    
    if (!error) {
      fetchServices();
    }
  };

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-slate-800' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-slate-300' : 'text-slate-600';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const inputBg = isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
        <div>
          <h1 className={`font-serif text-3xl font-semibold tracking-tight ${headingColor} mb-2`}>Services</h1>
          <p className={textColor}>Manage your makeup session offerings and pricing.</p>
        </div>
        <button
          onClick={() => openEdit(null)}
          className="flex items-center gap-2 bg-slate-900 text-slate-50 dark:bg-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm tracking-wide uppercase font-medium hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </header>

      {isEditing && (
        <div className={`${cardBg} p-8 rounded-[2rem] border ${borderColor} shadow-sm mb-8 transition-all duration-300`}>
          <h2 className={`font-serif text-2xl mb-8 ${headingColor}`}>{currentService.id ? "Edit Service" : "New Service"}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className={`block text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-2.5`}>Service Name</label>
              <input
                required
                type="text"
                value={currentService.name || ""}
                onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                className={`w-full px-5 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-300 focus:outline-none focus:border-brand-300 transition-colors font-medium ${inputBg}`}
                placeholder="e.g. Soft Glam Makeup"
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-2.5`}>Description</label>
              <textarea
                value={currentService.description || ""}
                onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                className={`w-full px-5 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-300 focus:outline-none focus:border-brand-300 transition-colors min-h-[120px] resize-y ${inputBg}`}
                placeholder="Details about this look..."
              />
            </div>
            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-2.5`}>Duration</label>
              <div className="relative flex items-center">
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={currentService.duration_minutes ?? ""}
                  onChange={(e) => setCurrentService({ ...currentService, duration_minutes: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                  className={`w-full pl-5 pr-14 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-300 focus:outline-none focus:border-brand-300 transition-colors font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${inputBg}`}
                  placeholder="e.g. 60"
                />
                <span className={`absolute right-5 font-medium text-sm pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>mins</span>
              </div>
            </div>
            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-2.5`}>Price</label>
              <div className="relative flex items-center">
                <span className={`absolute left-5 font-medium text-sm pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={currentService.price ?? ""}
                  onChange={(e) => setCurrentService({ ...currentService, price: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                  className={`w-full pl-9 pr-5 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-300 focus:outline-none focus:border-brand-300 transition-colors font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${inputBg}`}
                  placeholder="e.g. 150"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-2.5`}>Cover Image</label>
              <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
                {currentService.image_url && (
                  <div className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border ${borderColor}`}>
                    <img src={currentService.image_url} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row gap-3 w-full text-sm">
                    <button 
                      type="button"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="px-4 py-2.5 bg-slate-900 text-slate-50 dark:bg-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Upload Image
                    </button>
                    <input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                    <div className="flex-1">
                      <input
                        type="url"
                        value={currentService.image_url?.startsWith('data:') ? '' : (currentService.image_url || "")}
                        onChange={(e) => setCurrentService({ ...currentService, image_url: e.target.value })}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-300 focus:outline-none focus:border-brand-300 transition-colors font-medium ${inputBg}`}
                        placeholder="Or paste an image URL..."
                      />
                    </div>
                  </div>
                  <p className={`text-[11px] mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Upload an image from your device or paste a URL.</p>
                </div>
              </div>
            </div>
            <div className={`md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={currentService.is_active !== false}
                    onChange={(e) => setCurrentService({ ...currentService, is_active: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors ${isDark ? 'border-slate-600' : 'border-slate-300'}`}></div>
                  <CheckCircle2 className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className={`text-sm font-medium transition-colors ${textColor}`}>Active (Visible to clients)</span>
              </label>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-slate-900 text-slate-50 dark:bg-white dark:text-slate-900 rounded-xl text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all focus:ring-2 focus:ring-offset-2"
                >
                  Save Service
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            {[1, 2, 3, 4].map(skeleton => (
              <div key={skeleton} className={`${cardBg} border ${borderColor} rounded-[2rem] p-6 relative shadow-sm animate-pulse`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-4">
                    <div className={`h-8 w-48 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-16 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                      <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                    </div>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                </div>
                <div className="space-y-2 mt-8">
                  <div className={`h-3 w-full rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                  <div className={`h-3 w-3/4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          services.map((service) => (
            <div key={service.id} className={`${cardBg} border ${borderColor} rounded-[2rem] p-6 relative group transition-all duration-300 shadow-sm hover:shadow-md ${service.is_active ? '' : 'opacity-70 grayscale-[30%]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`font-serif text-2xl transition-colors ${service.is_active ? headingColor : (isDark ? 'text-slate-500' : 'text-slate-500')}`}>{service.name}</h3>
                  <div className={`flex items-center gap-3 mt-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{service.duration_minutes} mins</span>
                    <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
                    <span className={isDark ? 'text-white' : 'text-slate-900 font-semibold'}>${service.price}</span>
                  </div>
                  <div className={`flex items-center gap-3 mt-5 text-sm p-2 rounded-xl border w-fit transition-colors ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-xs uppercase tracking-widest font-semibold ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Status:</span>
                    <button 
                      onClick={() => toggleActive(service)}
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${service.is_active ? 'bg-emerald-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${service.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                    {service.is_active ? (
                      <span className="text-emerald-500 font-medium text-[11px] uppercase tracking-widest mr-1">Active</span>
                    ) : (
                      <span className={`font-medium text-[11px] uppercase tracking-widest mr-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Inactive</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openEdit(service)}
                  className={`p-2.5 rounded-xl shadow-sm transition-colors ${isDark ? 'text-slate-400 hover:text-white bg-slate-900 border border-slate-700 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'}`}
                  title="Edit Service"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className={`text-sm line-clamp-2 mt-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{service.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
