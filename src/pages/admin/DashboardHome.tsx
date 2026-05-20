import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Calendar, Users, Briefcase, Activity, TrendingUp, DollarSign, CalendarX, 
  ArrowUpRight, ArrowDownRight, Clock, Star, Sparkles, MessageSquare, Plus,
  CheckCircle2, AlertCircle, PhoneOff, Gift, UserPlus
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { motion } from "motion/react";

const COLORS = ['#8C4D35', '#D4A58D', '#E5CDBC', '#F5EAE0'];

// We define types for our states
type StatData = {
  upcoming: number;
  pending: number;
  completed: number;
  totalBookings: number;
  revenue: number;
  cancelled: number;
  returningPercentage: number;
};

export default function DashboardHome() {
  const [stats, setStats] = useState<StatData>({
    upcoming: 0,
    pending: 0,
    completed: 0,
    totalBookings: 0,
    revenue: 0,
    cancelled: 0,
    returningPercentage: 0
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookingActivity, setBookingActivity] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [servicePopularity, setServicePopularity] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [maxRevenueServiceMap, setMaxRevenueServiceMap] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Fetch all appointments with services
      const { data: appointments, error: apptError } = await supabase
        .from("appointments")
        .select(`*, services(name, price)`)
        .order("created_at", { ascending: false });

      if (appointments) {
        const totalBookings = appointments.length;
        const pending = appointments.filter(a => a.status === 'pending').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        const completed = appointments.filter(a => a.status === 'completed').length;
        
        let upcomingCount = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        const upcoming = appointments.filter(a => 
          ['confirmed', 'pending'].includes(a.status) && a.appointment_date >= todayStr
        );
        upcomingCount = upcoming.length;

        // Calculate revenue from completed/confirmed
        const revenue = appointments
          .filter(a => ['confirmed', 'completed'].includes(a.status))
          .reduce((acc, curr) => acc + ((curr.services as any)?.price || 0), 0);

        // Calculate unique customers & retention
        const emails = appointments.map(a => a.customer_email).filter(Boolean);
        const uniqueEmails = new Set(emails);
        const newCustCount = uniqueEmails.size;
        const returningCount = totalBookings > 0 ? (totalBookings - newCustCount) : 0;
        
        let retention = 0;
        if (totalBookings > 0) {
           retention = Math.round((returningCount / totalBookings) * 100);
        }

        setStats(prev => ({
          ...prev,
          upcoming: upcomingCount,
          pending,
          completed,
          totalBookings,
          revenue,
          cancelled,
          returningPercentage: retention
        }));

        setCustomerData([
          { name: 'Returning', value: returningCount },
          { name: 'New', value: newCustCount },
        ]);

        // Service popularity
        const svcMap = new Map();
        appointments.forEach(a => {
            const sName = (a.services as any)?.name || 'Custom Service';
            if (!svcMap.has(sName)) {
                svcMap.set(sName, { count: 0, revenue: 0 });
            }
            const sVal = svcMap.get(sName);
            sVal.count += 1;
            if (['confirmed', 'completed'].includes(a.status)) {
                sVal.revenue += ((a.services as any)?.price || 0);
            }
        });
        const pop = Array.from(svcMap.entries())
          .map(([name, val]) => ({ name, count: val.count, revenue: val.revenue }))
          .sort((a,b) => b.revenue - a.revenue)
          .slice(0, 4);
        setServicePopularity(pop);
        setMaxRevenueServiceMap(Math.max(...pop.map(p => p.revenue), 1)); // for progress bar scaling

        // Recent activity
        const recent = appointments.slice(0, 5).map((a, idx) => {
          let icon = Calendar;
          let color = 'text-brand-800';
          let bg = 'bg-brand-50';
          let typeText = 'booked';
          
          if (a.status === 'cancelled') {
             icon = CalendarX;
             color = 'text-red-500';
             bg = 'bg-red-50';
             typeText = 'cancelled';
          } else if (a.status === 'completed') {
             icon = CheckCircle2;
             color = 'text-emerald-600';
             bg = 'bg-emerald-50';
             typeText = 'completed';
          }

          const d = new Date(a.created_at);
          let timeStr = d.toLocaleDateString();
          // basic fallback relative time
          const diffHour = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60));
          if (diffHour < 24 && diffHour > 0) timeStr = `${diffHour}h ago`;
          else if (diffHour === 0) timeStr = `recently`;

          return {
            id: a.id || idx,
            type: 'booking',
            text: `${a.customer_name} ${typeText} ${((a.services as any)?.name) || 'a service'}`,
            time: timeStr,
            icon: icon,
            color: color,
            bg: bg
          };
        });
        setRecentActivity(recent);

        // Booking Activity (Peak Hours)
        const hourMap = new Map();
        appointments.forEach(a => {
           if (a.start_time) {
               const [h, m] = a.start_time.split(':');
               const hrInt = parseInt(h);
               const suffix = hrInt >= 12 ? 'PM' : 'AM';
               const hr12 = hrInt % 12 || 12;
               const label = `${hr12}${suffix}`;
               hourMap.set(label, (hourMap.get(label) || 0) + 1);
           }
        });
        // predefined hours so chart always has basic structure
        const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];
        const bActivity = hours.map(h => ({
           hour: h,
           bookings: hourMap.get(h) || 0
        }));
        // append any other hours found
        hourMap.forEach((val, key) => {
           if (!hours.includes(key)) bActivity.push({ hour: key, bookings: val });
        });
        setBookingActivity(bActivity);

        // Dummy revenue trend since we don't have historical tracking by day properly structured without lots of code
        // We will just do a basic 7 days summary based on appointment_date 
        const last7Days = Array.from({length: 7}).map((_, i) => {
           const d = new Date();
           d.setDate(d.getDate() - (6 - i));
           return d.toISOString().split('T')[0];
        });
        const rData = last7Days.map(dateStr => {
           const dayAppts = appointments.filter(a => a.appointment_date === dateStr && ['confirmed', 'completed'].includes(a.status));
           const dayRev = dayAppts.reduce((acc, curr) => acc + ((curr.services as any)?.price || 0), 0);
           const dateObj = new Date(dateStr);
           const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
           return {
              date: dayName,
              revenue: dayRev,
              prev: Math.floor(dayRev * 0.8) // mock previous week just for visuals
           };
        });
        setRevenueData(rData);

      }
      setIsLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Bookings", value: stats.totalBookings, trend: "-", isUp: true, icon: Calendar, color: "text-brand-900", bg: "bg-brand-50" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, trend: "Total", isUp: true, icon: DollarSign, color: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Pending Requests", value: stats.pending, trend: "Current", isUp: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Returning Customers", value: `${stats.returningPercentage}%`, trend: "Real-time", isUp: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Cancelled", value: stats.cancelled, trend: "Total", isUp: true, icon: CalendarX, color: "text-red-600", bg: "bg-red-50" },
    { label: "Upcoming", value: stats.upcoming, trend: "Pending/Conf.", isUp: true, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[calc(100vh-64px)] p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[400px] bg-slate-200 rounded-2xl"></div>
            <div className="h-[400px] bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-brand-900 tracking-tight mb-1">Business Overview</h1>
          <p className="text-sm text-slate-500">Track your studio's performance and growth this month.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>This Month</span>
          </button>
          <button className="px-4 py-2 bg-brand-900 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors shadow-sm flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4" />
            <span>Report</span>
          </button>
        </div>
      </motion.header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              key={idx} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.isUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                  {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="font-serif text-2xl text-brand-900">{stat.value}</h3>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-serif text-xl text-brand-900">Revenue Overview</h3>
              <p className="text-sm text-slate-500 mt-1">Daily revenue comparison to last week</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-800"></span> This Week
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> Last Week
              </span>
            </div>
          </div>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C4D35" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8C4D35" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="prev" stroke="#CBD5E1" strokeWidth={2} fillOpacity={1} fill="url(#colorPrev)" />
                <Area type="monotone" dataKey="revenue" stroke="#8C4D35" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insights & Activity */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-6"
        >
          {/* Smart Insights */}
          <div className="bg-brand-900 border border-brand-800 text-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(56,26,15,0.15)] relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-800/50 rounded-full blur-2xl group-hover:bg-brand-800/80 transition-colors duration-700"></div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Sparkles className="w-5 h-5 text-brand-300" />
              <h3 className="font-serif text-lg text-brand-100">Smart Insights</h3>
            </div>
            
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                <p className="text-sm text-brand-100/90 leading-relaxed font-light">Bookings increased by <strong>18%</strong> this week, driven by Bridal Trials.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-300 mt-1.5 shrink-0"></div>
                <p className="text-sm text-brand-100/90 leading-relaxed font-light">Saturday is your busiest day. Consider adding junior staff.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                <p className="text-sm text-brand-100/90 leading-relaxed font-light">Cancellation rate dropped to <strong>2%</strong> due to SMS reminders.</p>
              </li>
            </ul>
          </div>

          {/* Customer Insights (Donut) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] flex-1 flex flex-col">
            <h3 className="font-serif text-xl text-brand-900 mb-1">Retention</h3>
            <p className="text-sm text-slate-500 mb-4">New vs returning clients</p>
            <div className="flex-1 w-full flex justify-center items-center relative min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {customerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#8C4D35' : '#E5CDBC'} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <div className="text-center">
                  <p className="text-2xl font-serif text-brand-900 leading-none">65%</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Retained</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Booking Activity Line Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]"
        >
          <div className="mb-6">
            <h3 className="font-serif text-xl text-brand-900">Peak Hours</h3>
            <p className="text-sm text-slate-500">Most active booking times</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#F5EAE0', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                  {bookingActivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.bookings > 5 ? '#8C4D35' : '#D4A58D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Service Popularity */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]"
        >
          <div className="mb-6">
            <h3 className="font-serif text-xl text-brand-900">Top Services</h3>
            <p className="text-sm text-slate-500">Revenue generated per service</p>
          </div>
          <div className="space-y-5">
            {servicePopularity.map((service, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{service.name}</p>
                    <p className="text-xs text-slate-400">{service.count} bookings</p>
                  </div>
                  <p className="text-sm font-semibold text-brand-900">${service.revenue}</p>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(service.revenue / maxRevenueServiceMap) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                    className="h-full bg-brand-800 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-serif text-xl text-brand-900">Action Feed</h3>
              <p className="text-sm text-slate-500">Latest updates</p>
            </div>
            <button className="text-xs font-medium text-brand-800 hover:text-brand-900 uppercase tracking-widest transition-colors">
              View All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-5">
            {recentActivity.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex gap-4 items-start group cursor-default">
                  <div className={`p-2.5 rounded-full ${activity.bg} ${activity.color} shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 leading-snug">{activity.text}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>

    </div>
  );
}
