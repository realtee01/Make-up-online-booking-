import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BusinessSettings } from "../../types";
import { Save, CheckCircle2, Loader2 } from "lucide-react";

export default function BusinessSettingsConfig() {
  const [settings, setSettings] = useState<Partial<BusinessSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("business_settings")
      .select("*")
      .maybeSingle();

    if (!error && data) {
      setSettings(data);
    }
    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    if (settings.id) {
      const { error } = await supabase
        .from("business_settings")
        .update({
          business_name: settings.business_name,
          business_email: settings.business_email,
          business_phone: settings.business_phone,
          business_address: settings.business_address,
          slot_interval_minutes: settings.slot_interval_minutes,
          booking_notice_hours: settings.booking_notice_hours,
        })
        .eq("id", settings.id);
      
      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } else {
      const { error } = await supabase
        .from("business_settings")
        .insert([{
          business_name: settings.business_name,
          business_email: settings.business_email,
          business_phone: settings.business_phone,
          business_address: settings.business_address,
          slot_interval_minutes: settings.slot_interval_minutes || 30,
          booking_notice_hours: settings.booking_notice_hours || 24,
        }]);

      if (!error) {
        fetchSettings();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    }
    setSaving(false);
  };

  if (loading && !settings.id) return <div className="p-8 text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <header>
        <h1 className="font-serif text-3xl text-brand-900 mb-2">Settings</h1>
        <p className="text-slate-500">Configure your studio details and booking rules.</p>
      </header>

      <form onSubmit={handleSave} className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-12">
        <div>
          <h2 className="text-2xl font-serif text-brand-900 mb-8 pb-4 relative after:absolute after:bottom-0 after:left-0 after:w-16 after:h-px after:bg-brand-900/20">Studio Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5">Studio Name</label>
              <input
                required
                type="text"
                value={settings.business_name || ""}
                onChange={(e) => setSettings({...settings, business_name: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-colors font-medium text-brand-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5">Studio Email</label>
              <input
                required
                type="email"
                value={settings.business_email || ""}
                onChange={(e) => setSettings({...settings, business_email: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-colors font-medium text-brand-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5">Studio Phone</label>
              <input
                required
                type="tel"
                value={settings.business_phone || ""}
                onChange={(e) => setSettings({...settings, business_phone: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-colors font-medium text-brand-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5">Studio Address</label>
              <input
                required
                type="text"
                value={settings.business_address || ""}
                onChange={(e) => setSettings({...settings, business_address: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-colors font-medium text-brand-900"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-serif text-brand-900 mb-8 pb-4 relative after:absolute after:bottom-0 after:left-0 after:w-16 after:h-px after:bg-brand-900/20">Booking Logic</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Slot Interval (Minutes)</label>
              <p className="text-[13px] text-slate-400 mb-3.5 italic">Time between available booking slots.</p>
              <select
                required
                value={settings.slot_interval_minutes || 30}
                onChange={(e) => setSettings({...settings, slot_interval_minutes: parseInt(e.target.value)})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-colors font-medium text-brand-900 cursor-pointer"
              >
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 1 hour</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Booking Notice (Hours)</label>
              <p className="text-[13px] text-slate-400 mb-3.5 italic">Minimum notice required before an appointment.</p>
              <input
                required
                type="number"
                min="0"
                value={settings.booking_notice_hours ?? ""}
                onChange={(e) => setSettings({...settings, booking_notice_hours: e.target.value === "" ? 0 : parseInt(e.target.value)})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-colors font-medium text-brand-900"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving || saveSuccess}
            className={`flex items-center gap-2 px-10 py-3.5 rounded-xl text-sm tracking-widest uppercase font-bold transition-all duration-300 min-w-[200px] justify-center shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 ${
              saveSuccess 
                ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                : "bg-brand-900 text-brand-100 hover:bg-brand-800 shadow-brand-900/20 hover:shadow-lg hover:shadow-brand-900/30 disabled:opacity-50"
            }`}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 animate-in zoom-in duration-300" />
                <span>Saved !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 cursor-pointer" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
