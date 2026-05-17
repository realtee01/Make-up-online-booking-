import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BlockedDate } from "../../types";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";

export default function BlockedDates() {
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
    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchBlockedDates();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <header>
        <h1 className="font-serif text-3xl text-brand-900 mb-2">Blocked Dates</h1>
        <p className="text-slate-500">Block off specific days so clients cannot book appointments.</p>
      </header>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-xl font-serif mb-8 text-brand-900">Add Time Off</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5">Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-300 font-medium text-brand-900 transition-colors"
            />
          </div>
          <div className="flex-[2] w-full relative">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5">Reason (Optional)</label>
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="e.g. Vacation, Holiday, Fully Booked"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-300 font-medium placeholder:text-slate-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-900 text-brand-100 px-8 py-3.5 rounded-xl text-sm tracking-widest uppercase font-bold hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-900/20 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-brand-900"
          >
            <Plus className="w-5 h-5" />
            Block Date
          </button>
        </form>
      </div>

      <div className="bg-white border flex-1 border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {loading && !blockedDates.length ? (
          <div className="p-12 text-center text-brand-800/50 uppercase tracking-widest text-sm font-medium animate-pulse">Loading dates...</div>
        ) : blockedDates.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-medium">
            No upcoming blocked dates.
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {blockedDates.map((block) => (
              <div key={block.id} className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors duration-300 group">
                <div>
                  <p className="font-serif text-2xl text-brand-900 mb-1 drop-shadow-sm">
                    {format(new Date(block.blocked_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  {block.reason && <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>{block.reason}</p>}
                </div>
                <button
                  onClick={() => handleRemove(block.id)}
                  className="px-5 py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl flex items-center gap-2 self-end sm:self-auto border border-transparent hover:border-red-100 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm uppercase tracking-wider">Remove</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
