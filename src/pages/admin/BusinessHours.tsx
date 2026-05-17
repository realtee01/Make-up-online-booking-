import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BusinessHours } from "../../types";
import { Save, CheckCircle2, Loader2 } from "lucide-react";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BusinessHoursConfig() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchHours();
  }, []);

  async function fetchHours() {
    setLoading(true);
    const { data, error } = await supabase
      .from("business_hours")
      .select("*")
      .order("weekday", { ascending: true });

    if (!error && data) {
      // Ensure all 7 days exist
      const fullWeek = Array.from({ length: 7 }).map((_, i) => {
        const existing = data.find(d => d.weekday === i);
        return existing || { id: `new_${i}`, weekday: i, is_open: false, start_time: "09:00", end_time: "17:00" };
      });
      setHours(fullWeek as BusinessHours[]);
    }
    setLoading(false);
  }

  const updateDay = (weekday: number, field: keyof BusinessHours, value: any) => {
    setHours(prev => prev.map(h => h.weekday === weekday ? { ...h, [field]: value } : h));
  };

  const saveHours = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      for (const h of hours) {
        if (h.id.startsWith("new_")) {
          // Insert
          await supabase.from("business_hours").insert([{
            weekday: h.weekday,
            is_open: h.is_open,
            start_time: h.start_time,
            end_time: h.end_time
          }]);
        } else {
          // Update
          await supabase.from("business_hours").update({
            is_open: h.is_open,
            start_time: h.start_time,
            end_time: h.end_time
          }).eq("id", h.id);
        }
      }
      
      await fetchHours();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !hours.length) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl text-brand-900 mb-2">Business Hours</h1>
          <p className="text-slate-500">Define your weekly studio availability.</p>
        </div>
        <button
          onClick={saveHours}
          disabled={saving || saveSuccess}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm tracking-wide uppercase font-medium transition-all duration-300 min-w-[170px] justify-center ${
            saveSuccess 
              ? "bg-emerald-500 text-white" 
              : "bg-brand-900 text-white hover:bg-brand-800 disabled:opacity-50"
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
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </header>

      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="divide-y divide-slate-100/80">
          {hours.map((h) => (
            <div key={h.weekday} className={`p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-300 ${!h.is_open ? 'bg-slate-50/50 grayscale-[20%]' : 'hover:bg-brand-50/10'}`}>
              <div className="flex items-center gap-6 w-full md:w-auto">
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={h.is_open}
                    onChange={(e) => updateDay(h.weekday, 'is_open', e.target.checked)}
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-emerald-500 group-hover:shadow-[0_0_12px_rgba(0,0,0,0.05)] transition-all"></div>
                </label>
                <span className={`font-serif text-2xl w-32 ${h.is_open ? 'text-brand-900 font-medium' : 'text-slate-400'}`}>
                  {WEEKDAYS[h.weekday]}
                </span>
              </div>

              {h.is_open ? (
                <div className="flex items-center gap-4 w-full md:w-auto bg-white/50 p-2 border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex flex-col relative px-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1 absolute -top-4 left-3 bg-white px-1">Opening</label>
                    <input 
                      type="time" 
                      value={h.start_time || ""}
                      onChange={(e) => updateDay(h.weekday, 'start_time', e.target.value)}
                      className="px-4 py-2 border-none bg-transparent rounded-lg focus:ring-0 font-medium text-brand-900 cursor-pointer"
                    />
                  </div>
                  <span className="text-slate-200 h-8 w-px bg-slate-200 block"></span>
                  <div className="flex flex-col relative px-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1 absolute -top-4 left-3 bg-white px-1">Closing</label>
                    <input 
                      type="time" 
                      value={h.end_time || ""}
                      onChange={(e) => updateDay(h.weekday, 'end_time', e.target.value)}
                      className="px-4 py-2 border-none bg-transparent rounded-lg focus:ring-0 font-medium text-brand-900 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 font-medium tracking-wide w-full md:w-auto md:text-right pr-4 uppercase text-sm">
                  Closed
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
