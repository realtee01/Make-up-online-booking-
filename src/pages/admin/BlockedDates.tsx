import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BlockedDate } from "../../types";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function BlockedDates() {
  const { theme } = useOutletContext<{ theme: 'light' | 'dark' }>();
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  async function fetchBlockedDates() {
    setLoading(true);
    const { data, error } = await supabase
      .from("blocked_dates")
      .select("*")
      .gte("blocked_date", new Date().toISOString().split('T')[0])
      .order("blocked_date", { ascending: true });

    if (!error && data) {
      setBlockedDates(data);
    }
    setLoading(false);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;

    const { error } = await supabase
      .from("blocked_dates")
      .insert([{ blocked_date: newDate, reason: newReason || null }]);

    if (!error) {
      setNewDate("");
      setNewReason("");
      fetchBlockedDates();
    }
  };

  const handleRemove = async (id: string) => {
    setBlockedDates(blockedDates.filter((b) => b.id !== id));
    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("id", id);

    if (error) {
      fetchBlockedDates(); // Revert on error
    }
  };

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-slate-800' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-100';
  const textColor = isDark ? 'text-slate-300' : 'text-slate-600';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-10">
      <header>
        <h1 className={`font-serif text-3xl font-semibold tracking-tight ${headingColor} mb-2`}>Blocked Dates</h1>
        <p className={textColor}>Block off specific days so clients cannot book appointments.</p>
      </header>

      <div className={`${cardBg} p-8 rounded-[2rem] border ${borderColor} shadow-sm transition-colors`}>
        <h2 className={`text-xl font-serif mb-8 ${headingColor}`}>Add Time Off</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full relative">
            <label className={`block text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-2.5`}>Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={`w-full px-5 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-300 focus:outline-none focus:border-brand-300 font-medium transition-colors ${
                isDark ? 'bg-slate-900 border-slate-700 text-white css-dark-datepicker' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>
          <div className="flex-[2] w-full relative">
            <label className={`block text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-2.5`}>Reason (Optional)</label>
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="e.g. Vacation, Holiday, Fully Booked"
              className={`w-full px-5 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-300 focus:outline-none focus:border-brand-300 font-medium transition-colors ${
                isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-slate-50 dark:bg-white dark:text-slate-900 px-8 py-3.5 rounded-xl text-sm tracking-widest uppercase font-bold hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Block Date
          </button>
        </form>
      </div>

      <div className={`${cardBg} border flex-1 ${borderColor} rounded-[2rem] overflow-hidden shadow-sm transition-colors`}>
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 md:p-8 flex items-center justify-between gap-6 animate-pulse">
                <div className="space-y-3">
                  <div className={`h-6 w-48 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                  <div className={`h-4 w-32 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                </div>
                <div className={`h-10 w-24 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              </div>
            ))}
          </div>
        ) : blockedDates.length === 0 ? (
          <div className={`p-16 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
            No upcoming blocked dates.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {blockedDates.map((block) => {
              // Fix timezone rendering issues
              const dateObj = new Date(`${block.blocked_date}T12:00:00Z`);
              
              return (
                <div key={block.id} className={`p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors duration-200 group ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50/50'}`}>
                  <div>
                    <p className={`font-serif text-2xl mb-1 ${headingColor}`}>
                      {format(dateObj, 'EEEE, MMMM d, yyyy')}
                    </p>
                    {block.reason && <p className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>{block.reason}</p>}
                  </div>
                  <button
                    onClick={() => handleRemove(block.id)}
                    className="px-5 py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-xl flex items-center gap-2 self-end sm:self-auto border border-transparent font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm uppercase tracking-wider">Remove</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        .css-dark-datepicker::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
}
