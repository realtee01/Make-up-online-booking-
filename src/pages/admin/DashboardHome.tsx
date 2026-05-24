import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Calendar, Users, Briefcase, Activity, 
  TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle2, UserPlus, AlertCircle, Sparkles
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { motion } from "motion/react";
import { useOutletContext } from "react-router-dom";

export default function DashboardHome() {
  const { theme } = useOutletContext<{ theme: 'light' | 'dark' }>();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Parallel data fetching with Promise.all
        const [appointmentsRes] = await Promise.all([
          supabase
            .from("appointments")
            .select(`
              *,
              services:service_id (name, price)
            `)
            .order('created_at', { ascending: false })
        ]);

        if (appointmentsRes.data) {
          setAppointments(appointmentsRes.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const analytics = useMemo(() => {
    let totalRev = 0;
    let pending = 0;
    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;
    let confirmed = 0;

    const serviceCount: Record<string, number> = {};
    const todayStr = new Date().toISOString().split('T')[0];

    // Process appointments
    appointments.forEach(app => {
      const servicePrice = app.services?.price || 0;
      const serviceName = app.services?.name || 'Unknown';

      // Revenue (only from confirmed/completed)
      if (app.status === 'completed' || app.status === 'confirmed') {
        totalRev += servicePrice;
      }

      // Stats
      if (app.status === 'pending') pending++;
      if (app.status === 'completed') completed++;
      if (app.status === 'cancelled') cancelled++;
      if (app.status === 'confirmed') confirmed++;

      if ((app.status === 'confirmed' || app.status === 'pending') && app.appointment_date >= todayStr) {
        upcoming++;
      }

      // Service Popularity
      if (app.status !== 'cancelled') {
        serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
      }
    });

    const totalStatus = pending + completed + cancelled + confirmed || 1;
    const appointmentStatusData = [
      { name: "Confirmed", value: Math.round((confirmed/totalStatus)*100) || 0, color: "#10b981" },
      { name: "Pending", value: Math.round((pending/totalStatus)*100) || 0, color: "#f59e0b" },
      { name: "Completed", value: Math.round((completed/totalStatus)*100) || 0, color: "#3b82f6" },
      { name: "Cancelled", value: Math.round((cancelled/totalStatus)*100) || 0, color: "#ef4444" }
    ].filter(s => s.value > 0);

    const servicePopularityData = Object.keys(serviceCount).map(name => ({
      name,
      bookings: serviceCount[name]
    })).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

    const recentActivity = appointments.slice(0, 4).map(app => {
      let type = 'booking';
      let action = `booked ${app.services?.name || 'a service'}`;
      let icon = Calendar;
      let color = 'text-indigo-500';
      let bg = 'bg-indigo-500/10';

      if (app.status === 'cancelled') {
         type = 'cancellation';
         action = 'cancelled appointment';
         icon = AlertCircle;
         color = 'text-red-500';
         bg = 'bg-red-500/10';
      }

      const date = new Date(app.created_at);
      const timeStr = date.toLocaleDateString();

      return {
        id: app.id,
        type,
        user: `${app.client_first_name} ${app.client_last_name}`,
        action,
        time: timeStr,
        icon, color, bg
      };
    });

    const revenueData = [
      { name: "Mon", revenue: totalRev * 0.1 },
      { name: "Tue", revenue: totalRev * 0.15 },
      { name: "Wed", revenue: totalRev * 0.2 },
      { name: "Thu", revenue: totalRev * 0.12 },
      { name: "Fri", revenue: totalRev * 0.25 },
      { name: "Sat", revenue: totalRev * 0.3 },
      { name: "Sun", revenue: totalRev * 0.1 },
    ];

    const bookingActivityData = [
      { time: "9 AM", bookings: Math.floor(appointments.length * 0.1) },
      { time: "11 AM", bookings: Math.floor(appointments.length * 0.2) },
      { time: "1 PM", bookings: Math.floor(appointments.length * 0.3) },
      { time: "3 PM", bookings: Math.floor(appointments.length * 0.25) },
      { time: "5 PM", bookings: Math.floor(appointments.length * 0.1) },
      { time: "7 PM", bookings: Math.floor(appointments.length * 0.05) },
    ];

    return {
      stats: { upcoming, pending, completed, totalRevenue: totalRev, totalBookings: appointments.length },
      appointmentStatusData,
      servicePopularityData,
      recentActivity,
      revenueData,
      bookingActivityData
    };
  }, [appointments]);

  const customerInsightsData = [
    { name: "New", value: 35 },
    { name: "Returning", value: 65 },
  ];
  const COLORS = ["#f59e0b", "#10b981"]; // Amber for new, Emerald for returning

  const statCards = [
    { label: "Total Revenue", value: `$${analytics.stats.totalRevenue.toLocaleString()}`, change: "+14.2%", isUp: true, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Bookings", value: analytics.stats.totalBookings.toString(), change: "+8.1%", isUp: true, icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Pending Appts", value: analytics.stats.pending.toString(), change: "-2.4%", isUp: false, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Returning Customers", value: "65%", change: "+12.5%", isUp: true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  const textColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  const headingColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-100';

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className={`font-serif text-3xl font-semibold tracking-tight ${headingColor}`}>Overview</h1>
          <p className={`mt-1 text-sm ${textColor}`}>Your business performance at a glance.</p>
        </div>
        <div className={`text-xs px-3 py-1.5 rounded-full border font-medium ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
          Last 30 Days
        </div>
      </div>

      {/* AI Insights Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`p-5 rounded-2xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${
          theme === 'dark' ? 'bg-gradient-to-r from-indigo-900/40 to-slate-800 border-indigo-500/20 text-indigo-200' : 'bg-gradient-to-r from-indigo-50 to-white border-indigo-100 text-indigo-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 text-white rounded-lg shadow-inner">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Smart Insights</h3>
            <p className={`text-sm mt-0.5 ${theme === 'dark' ? 'text-indigo-300/80' : 'text-indigo-700/80'}`}>
              Bookings are up 18% this week. Automated reminders reduced no-shows by 4.2% this month.
            </p>
          </div>
        </div>
        <button className={`text-xs px-4 py-2 font-medium rounded-lg transition-colors ${
          theme === 'dark' ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
        }`}>
          View Report
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }}
            key={idx} 
            className={`${cardBg} p-6 rounded-[20px] border ${borderColor} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                stat.isUp ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (theme === 'dark' ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600')
              }`}>
                {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <h3 className={`text-[13px] font-semibold uppercase tracking-wider mb-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>{stat.label}</h3>
              <p className={`text-3xl font-serif tracking-tight ${headingColor}`}>{isLoading ? '...' : stat.value}</p>
            </div>
            {/* Subtle background decoration */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`lg:col-span-2 ${cardBg} p-6 rounded-[20px] border ${borderColor} shadow-sm`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-semibold text-base ${headingColor}`}>Revenue Overview</h3>
            <select className={`text-xs p-1.5 rounded-lg border font-medium outline-none ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 600 }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`${cardBg} p-6 rounded-[20px] border ${borderColor} shadow-sm flex flex-col`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-semibold text-base ${headingColor}`}>Customer Insights</h3>
          </div>
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700/50">
            <div>
              <p className={`text-[11px] uppercase tracking-widest font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Avg. CLV</p>
              <p className={`text-xl font-serif ${headingColor}`}>$1,250</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <p className={`text-[11px] uppercase tracking-widest font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Repeat Rate</p>
              <p className={`text-xl font-serif ${headingColor}`}>65%</p>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerInsightsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {customerInsightsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 500 }}
                  formatter={(value: number) => [`${value}%`, 'Customers']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {customerInsightsData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                <span className={`text-sm font-medium ${textColor}`}>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className={`lg:col-span-2 ${cardBg} p-6 rounded-[20px] border ${borderColor} shadow-sm`}
        >
          <h3 className={`font-semibold text-base mb-6 ${headingColor}`}>Peak Booking Times</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.bookingActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#334155' : '#f8fafc' }}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} Bookings`, 'Total']}
                />
                <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className={`${cardBg} p-6 rounded-[20px] border ${borderColor} shadow-sm flex flex-col`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-semibold text-base ${headingColor}`}>Recent Activity</h3>
            <button className={`text-xs font-semibold ${theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>View All</button>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${headingColor}`}>
                    {activity.user}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activity.action}
                  </p>
                </div>
                <div className={`text-[10px] shrink-0 font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3 - New Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className={`${cardBg} p-6 rounded-[20px] border ${borderColor} shadow-sm`}
        >
          <h3 className={`font-semibold text-base mb-6 ${headingColor}`}>Service Popularity</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={analytics.servicePopularityData} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#e2e8f0' : '#475569', fontWeight: 500 }} width={80} />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#334155' : '#f8fafc' }}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} Bookings`, 'Total']}
                />
                <Bar dataKey="bookings" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className={`${cardBg} p-6 rounded-[20px] border ${borderColor} shadow-sm flex flex-col`}
        >
          <h3 className={`font-semibold text-base mb-6 ${headingColor}`}>Appointment Status</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 500 }}
                    formatter={(value: number) => [`${value}%`, 'Status']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4">
              {analytics.appointmentStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${headingColor}`}>{item.name}</span>
                    <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.value}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
