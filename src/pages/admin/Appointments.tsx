import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Appointment, Service } from "../../types";
import { format } from "date-fns";
import { Clock, Phone, Mail, FileText, Ban } from "lucide-react";

export default function Appointments() {
  const [appointments, setAppointments] = useState<(Appointment & { services: Partial<Service> })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    // Explicitly join on service_id to retrieve service name
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        services ( name, duration_minutes )
      `)
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: true });

    if (!error && data) {
      setAppointments(data as any);
    }
    setLoading(false);
  }

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      fetchAppointments();
    }
  };

  const filteredAppointments = appointments.filter(app => filter === 'all' ? true : app.status === filter);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl text-brand-900 mb-2">Appointments</h1>
          <p className="text-slate-500">Manage your bookings and client sessions.</p>
        </div>
      </header>

      <div className="flex gap-2 pb-4 overflow-x-auto">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-colors ${
              filter === f 
                ? 'bg-brand-900 text-white' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && appointments.length === 0 ? (
        <div className="py-12 text-center text-slate-500">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <p className="font-serif text-xl text-brand-900 mb-2">No Appointments Found</p>
          <p className="text-slate-500">You don't have any {filter !== 'all' ? filter : ''} appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((app) => (
            <div key={app.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Time & Date</p>
                  <p className="font-serif text-lg text-brand-900">{format(new Date(app.appointment_date), 'MMM d, yyyy')}</p>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                    <Clock className="w-4 h-4" />
                    {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Client</p>
                  <p className="font-serif text-lg text-brand-900">{app.full_name}</p>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                    <Phone className="w-4 h-4" />
                    {app.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                    <Mail className="w-4 h-4" />
                    {app.email}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Service</p>
                  <p className="font-medium text-brand-900">{app.services?.name || 'Unknown'}</p>
                  {app.notes && (
                    <div className="flex items-start gap-1.5 text-sm text-slate-500 mt-2 italic">
                      <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{app.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:items-end gap-3 self-center">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 md:text-right">Status</p>
                    <select 
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border-0 cursor-pointer ${getStatusColor(app.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  {app.status !== 'cancelled' && app.status !== 'completed' && (
                    <button
                      onClick={() => updateStatus(app.id, 'cancelled')}
                      className="text-[10px] sm:text-xs uppercase tracking-widest text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors mt-2"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
