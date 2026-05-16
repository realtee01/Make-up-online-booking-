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

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-serif mb-6 text-brand-900">Add Time Off</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="flex-[2] w-full">
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Reason (Optional)</label>
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="e.g. Vacation, Holiday, Fully Booked"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-900 text-white px-8 py-3 rounded-xl text-sm tracking-wide uppercase font-medium hover:bg-brand-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Block Date
          </button>
        </form>
      </div>

      <div className="bg-white border flex-1 border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading && !blockedDates.length ? (
          <div className="p-8 text-slate-500 text-center">Loading dates...</div>
        ) : blockedDates.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No upcoming blocked dates.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {blockedDates.map((block) => (
              <div key={block.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-xl text-brand-900">
                    {format(new Date(block.blocked_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  {block.reason && <p className="text-sm text-slate-500 mt-1">{block.reason}</p>}
                </div>
                <button
                  onClick={() => handleRemove(block.id)}
                  className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl flex items-center gap-2 self-end sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Remove</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
