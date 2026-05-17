import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Calendar, Users, Briefcase, Activity } from "lucide-react";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    completed: 0,
    activeServices: 0
  });

  useEffect(() => {
    async function fetchStats() {
      // Fetch upcoming appointments
      const { count: upcomingCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("appointment_date", new Date().toISOString().split('T')[0])
        .in("status", ["confirmed", "pending"]);

      const { count: pendingCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: completedCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { count: servicesCount } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      setStats({
        upcoming: upcomingCount || 0,
        pending: pendingCount || 0,
        completed: completedCount || 0,
        activeServices: servicesCount || 0
      });
    }

    fetchStats();
  }, []);

  const statCards = [
    { label: "Upcoming Bookings", value: stats.upcoming, icon: Calendar, color: "bg-amber-50 text-amber-600" },
    { label: "Pending Requests", value: stats.pending, icon: Activity, color: "bg-blue-50 text-blue-600" },
    { label: "Completed Sessions", value: stats.completed, icon: Users, color: "bg-emerald-50 text-emerald-600" },
    { label: "Active Services", value: stats.activeServices, icon: Briefcase, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="font-serif text-3xl text-brand-900 mb-2">Overview</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening at your studio today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex items-center gap-5 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${stat.color}`}>
                <Icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="flex flex-col">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-slate-400 mb-1">{stat.label}</p>
                <p className="font-serif text-3xl text-brand-900 leading-none">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
