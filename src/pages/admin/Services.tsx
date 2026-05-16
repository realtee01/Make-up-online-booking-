import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Service } from "../../types";
import { Plus, Edit2, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function Services() {
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
      setServices(data);
    }
    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService.name || !currentService.duration_minutes || !currentService.price) return;

    if (currentService.id) {
      // Update
      const { error } = await supabase
        .from("services")
        .update({
          name: currentService.name,
          description: currentService.description,
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
      // Create
      const { error } = await supabase
        .from("services")
        .insert([{
          name: currentService.name,
          description: currentService.description,
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

  if (loading && !services.length) return <div className="p-8">Loading services...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl text-brand-900 mb-2">Services</h1>
          <p className="text-slate-500">Manage your makeup session offerings and pricing.</p>
        </div>
        <button
          onClick={() => openEdit(null)}
          className="flex items-center gap-2 bg-brand-900 text-white px-5 py-2.5 rounded-xl text-sm tracking-wide uppercase font-medium hover:bg-brand-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </header>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <h2 className="font-serif text-xl mb-6">{currentService.id ? "Edit Service" : "New Service"}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Service Name</label>
              <input
                required
                type="text"
                value={currentService.name || ""}
                onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-300"
                placeholder="e.g. Soft Glam Makeup"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Description</label>
              <textarea
                value={currentService.description || ""}
                onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-300 h-24"
                placeholder="Details about this look..."
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Duration (minutes)</label>
              <input
                required
                type="number"
                min="15"
                step="15"
                value={currentService.duration_minutes || ""}
                onChange={(e) => setCurrentService({ ...currentService, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Price ($)</label>
              <input
                required
                type="number"
                min="0"
                step="5"
                value={currentService.price || ""}
                onChange={(e) => setCurrentService({ ...currentService, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentService.is_active || false}
                  onChange={(e) => setCurrentService({ ...currentService, is_active: e.target.checked })}
                  className="w-5 h-5 accent-brand-900 rounded"
                />
                <span className="text-sm font-medium">Active (Visible to clients)</span>
              </label>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-brand-900 text-white rounded-lg text-sm uppercase tracking-widest hover:bg-brand-800 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {services.map((service) => (
          <div key={service.id} className={`bg-white border rounded-2xl p-6 relative ${service.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-serif text-xl text-brand-900">{service.name}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 hidden" />{service.duration_minutes} mins</span>
                  <span>•</span>
                  <span>${service.price}</span>
                  <span>•</span>
                  {service.is_active ? (
                    <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Active</span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400"><XCircle className="w-4 h-4" /> Inactive</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => openEdit(service)}
                className="p-2 text-slate-400 hover:text-brand-900 transition-colors bg-slate-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
