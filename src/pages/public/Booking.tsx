import React, { useEffect, useState, useMemo } from "react";
import { useLocation, Link, useOutletContext } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Service, BusinessHours, BlockedDate, BusinessSettings, Appointment } from "../../types";
import { format, addMinutes, parse, startOfDay, endOfDay, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isBefore, isSameMonth } from "date-fns";
import { CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft, ArrowRight, Clock, XCircle } from "lucide-react";

export default function Booking() {
  const location = useLocation();
  const initServiceId = location.state?.selectedServiceId;

  const { setIsChildLoading } = useOutletContext<{ setIsChildLoading?: (loading: boolean) => void }>();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  // Selection
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date, end: Date } | null>(null);
  
  // Form
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  useEffect(() => {
    let isMounted = true;
    setIsChildLoading?.(true);
    async function fetchBookingData() {
      try {
        const [
          { data: servicesData },
          { data: hoursData },
          { data: blockedData },
          { data: settingsData },
          { data: appointmentsData }
        ] = await Promise.all([
          supabase.from("services").select("*").eq("is_active", true).order("created_at", { ascending: true }),
          supabase.from("business_hours").select("*"),
          supabase.from("blocked_dates").select("*").gte("blocked_date", new Date().toISOString().split('T')[0]),
          supabase.from("business_settings").select("*").maybeSingle(),
          supabase.from("appointments").select("*").gte("appointment_date", new Date().toISOString().split('T')[0]).neq("status", "cancelled")
        ]);

        if (isMounted) {
          if (servicesData) {
            const parsedData = servicesData.map(service => {
              let desc = service.description || "";
              let imgUrl = undefined;
              if (desc.includes("|||IMAGE_URL|||")) {
                 const parts = desc.split("|||IMAGE_URL|||");
                 desc = parts[0];
                 imgUrl = parts[1];
              }
              return { ...service, description: desc, image_url: imgUrl };
            });
            setServices(parsedData);
          }
          if (hoursData) setBusinessHours(hoursData);
          if (blockedData) setBlockedDates(blockedData);
          if (settingsData) setSettings(settingsData);
          if (appointmentsData) setExistingAppointments(appointmentsData);

          if (initServiceId && servicesData) {
            const parsedData = servicesData.map((service: any) => {
              let desc = service.description || "";
              let imgUrl = undefined;
              if (desc.includes("|||IMAGE_URL|||")) {
                 const parts = desc.split("|||IMAGE_URL|||");
                 desc = parts[0];
                 imgUrl = parts[1];
              }
              return { ...service, description: desc, image_url: imgUrl };
            });
            const serv = parsedData.find((s: any) => s.id === initServiceId);
            if (serv) setSelectedService(serv);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch booking data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsChildLoading?.(false);
        }
      }
    }
    fetchBookingData();
    return () => {
      isMounted = false;
      setIsChildLoading?.(false);
    };
  }, [initServiceId, setIsChildLoading]);

  // Generate available slots for the selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedService || !settings) return [];

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    // 1. Check if blocked date
    const isBlocked = blockedDates.some(b => b.blocked_date === dateStr);
    if (isBlocked) return [];

    // 2. Get business hours for this weekday
    const weekday = selectedDate.getDay();
    const dayHours = businessHours.find(h => h.weekday === weekday);
    if (!dayHours || !dayHours.is_open || !dayHours.start_time || !dayHours.end_time) return [];

    // Generate slots
    const slots: { start: Date, end: Date, label: string }[] = [];
    const [startH, startM] = dayHours.start_time.split(':').map(Number);
    const [endH, endM] = dayHours.end_time.split(':').map(Number);
    
    let currentSlotStart = new Date(selectedDate);
    currentSlotStart.setHours(startH, startM, 0, 0);

    const closingTime = new Date(selectedDate);
    closingTime.setHours(endH, endM, 0, 0);

    const now = new Date();
    const noticeTimeMs = settings.booking_notice_hours * 60 * 60 * 1000;

    while (currentSlotStart < closingTime) {
      const currentSlotEnd = addMinutes(currentSlotStart, selectedService.duration_minutes);

      // Check if slot exceeds closing time
      if (currentSlotEnd > closingTime) break;

      // Check booking notice
      if (currentSlotStart.getTime() - now.getTime() < noticeTimeMs) {
        currentSlotStart = addMinutes(currentSlotStart, settings.slot_interval_minutes);
        continue;
      }

      // Check overlap with appointments
      const hasOverlap = existingAppointments.some(app => {
        if (!isSameDay(new Date(app.appointment_date), selectedDate)) return false;
        if (!app.start_time || !app.end_time) return false;
        
        const appStart = new Date(selectedDate);
        const [aStartH, aStartM] = app.start_time.split(':').map(Number);
        appStart.setHours(aStartH, aStartM, 0, 0);

        const appEnd = new Date(selectedDate);
        const [aEndH, aEndM] = app.end_time.split(':').map(Number);
        appEnd.setHours(aEndH, aEndM, 0, 0);

        return currentSlotStart < appEnd && currentSlotEnd > appStart;
      });

      if (!hasOverlap) {
        slots.push({
          start: currentSlotStart,
          end: currentSlotEnd,
          label: format(currentSlotStart, 'h:mm a')
        });
      }

      currentSlotStart = addMinutes(currentSlotStart, settings.slot_interval_minutes);
    }

    return slots;
  }, [selectedDate, selectedService, settings, businessHours, blockedDates, existingAppointments]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTimeSlot) return;

    setIsSubmitting(true);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startStr = format(selectedTimeSlot.start, 'HH:mm:ss');
    const endStr = format(selectedTimeSlot.end, 'HH:mm:ss');

    const { error } = await supabase.from("appointments").insert([{
      full_name: form.name,
      email: form.email,
      phone: form.phone,
      service_id: selectedService.id,
      appointment_date: dateStr,
      start_time: startStr,
      end_time: endStr,
      status: 'pending',
      notes: form.notes || null
    }]);

    setIsSubmitting(false);

    if (!error) {
      setStep(4); // Success
      setIsCancelled(false);
    } else {
      alert("There was an error booking your appointment. Please try again.");
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) return;

    setIsCancelling(true);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startStr = format(selectedTimeSlot.start, 'HH:mm:ss');

    const { error } = await supabase
      .from("appointments")
      .update({ status: 'cancelled' })
      .match({
        email: form.email,
        appointment_date: dateStr,
        start_time: startStr,
        service_id: selectedService.id
      });

    setIsCancelling(false);

    if (!error) {
      setIsCancelled(true);
    } else {
      alert("Failed to cancel booking. Please contact the studio directly.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-100">Loading booking system...</div>;
  }

  return (
    <div className="bg-brand-50 min-h-screen pb-24 font-sans selection:bg-brand-300">
      <div className="max-w-6xl mx-auto px-6 pt-12 md:pt-24">
        
        {step < 4 && (
          <div className="mb-20 text-center flex flex-col items-center">
            <span className="text-[11px] tracking-[0.4em] uppercase font-bold text-brand-800/40 mb-6 block">Reserve</span>
            <h1 className="font-serif text-5xl md:text-6xl text-brand-900 mb-8 font-light leading-tight">Book your appointment</h1>
            <p className="max-w-xl text-brand-800/60 leading-relaxed font-light mb-16">
              Choose a service, a date and time that suits you, and we'll confirm within a few hours.
            </p>
            
            <div className="flex items-center justify-center gap-4 sm:gap-12 md:gap-24 w-full overflow-x-auto pb-4 px-4 sm:px-0 sm:overflow-visible">
              {[
                { n: 1, label: 'Service' },
                { n: 2, label: 'Date & Time' },
                { n: 3, label: 'Your Details' },
                { n: 4, label: 'Confirmed' }
              ].map((s, i) => (
                <div key={s.n} className="flex flex-col items-center gap-4 relative min-w-[80px]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ring-4 ring-white shadow-sm z-10 shrink-0 ${
                    step > s.n 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : step === s.n 
                        ? 'bg-brand-900 text-brand-50' 
                        : 'bg-brand-100 text-brand-800/40'
                  }`}>
                    {step > s.n ? '✓' : s.n}
                  </div>
                  <span className={`text-[10px] tracking-[0.2em] uppercase font-bold whitespace-nowrap ${
                    step >= s.n ? 'text-brand-900' : 'text-brand-800/30'
                  }`}>
                    {s.label}
                  </span>
                  {i < 3 && (
                    <div className="hidden sm:block absolute top-5 left-1/2 w-full h-[1px] bg-brand-900/10 -z-0 ml-5"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in-up max-w-5xl mx-auto">
            <h2 className="font-serif text-3xl text-brand-900 mb-10 font-light">Choose a service</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, idx) => (
                <div 
                  key={service.id} 
                  onClick={() => setSelectedService(service)}
                  className={`group relative p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] cursor-pointer transition-all duration-500 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-2 ${
                    selectedService?.id === service.id 
                      ? 'bg-white border-brand-900 shadow-xl shadow-brand-900/5' 
                      : 'bg-white/40 border-transparent hover:bg-white hover:border-brand-200'
                  }`}
                >
                  <div className="w-full sm:w-20 h-32 sm:h-20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm flex-shrink-0">
                    <img 
                      src={service.image_url ? `${service.image_url}${service.image_url.includes('?') ? '&' : '?'}q=80&w=650` : `https://images.unsplash.com/photo-${[
                        '1522337660859-02fbefca4702',
                        '1594465919760-441fe5908ab0',
                        '1596462502278-27bfdc403348',
                        '1612817288484-6f916006741a',
                        '1616683693504-3ea7e9ad6fec',
                        '1596704017254-9b121068fb31',
                        '1580870059885-a4b5d63428df',
                        '1487412720507-e7ab37603c6f'
                      ][idx % 8]}?q=80&w=650&auto=format&fit=crop`}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-serif text-xl text-brand-900">{service.name}</h3>
                      <span className="text-sm font-bold text-brand-900">${service.price}</span>
                    </div>
                    <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-brand-800/40 mb-2">{service.duration_minutes} Min Session</p>
                    <p className="text-xs text-brand-800/60 leading-relaxed line-clamp-2 font-light">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <button 
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="bg-brand-900 text-brand-50 px-16 py-5 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold disabled:opacity-30 hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/10 flex items-center gap-4"
              >
                Continue to date & time
                <ArrowRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-right max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl text-brand-900 font-light">Select a date & time</h2>
              <button onClick={() => setStep(1)} className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-800/40 hover:text-brand-900 transition-colors flex items-center gap-2">
                ← Change service
              </button>
            </div>
            
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12 shadow-xl shadow-brand-900/5">
              <div className="mb-10 sm:mb-12 overflow-x-auto pb-4 -mx-2 sm:-mx-4 px-2 sm:px-4 scrollbar-hide">
                <div className="flex gap-4 min-w-max">
                  {eachDayOfInterval({ 
                    start: startOfDay(new Date()), 
                    end: addMonths(startOfDay(new Date()), 2) 
                  }).map(date => {
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isBlocked = blockedDates.some(b => b.blocked_date === format(date, 'yyyy-MM-dd'));
                    const isClosed = !businessHours.find(h => h.weekday === date.getDay())?.is_open;
                    const disabled = isBlocked || isClosed;

                    return (
                      <button
                        key={date.toISOString()}
                        disabled={disabled}
                        onClick={() => { setSelectedDate(date); setSelectedTimeSlot(null); }}
                        className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-3xl transition-all duration-300 border-2 ${
                          disabled 
                            ? 'opacity-20 cursor-not-allowed bg-transparent border-transparent' 
                            : isSelected 
                              ? 'bg-brand-900 border-brand-900 text-brand-50 shadow-lg shadow-brand-900/20' 
                              : 'bg-brand-100 border-transparent text-brand-900 hover:border-brand-200'
                        }`}
                      >
                        <span className="text-[10px] tracking-[0.2em] uppercase font-bold mb-1 opacity-40">{format(date, 'EEE')}</span>
                        <span className="font-serif text-2xl font-light">{format(date, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`transition-all duration-700 ease-out flex flex-col ${!selectedDate ? 'opacity-40 grayscale pointer-events-none translate-y-4' : 'opacity-100 grayscale-0 translate-y-0'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-serif text-2xl text-brand-900 font-light">Available times</h3>
                  {selectedDate && <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-800/40">{format(selectedDate, 'EEEE, MMMM do')}</span>}
                </div>
                
                {!selectedDate ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-brand-800/30 italic py-20 border-2 border-dashed border-brand-100 rounded-[3rem]">
                    Select a date to see available times
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="animate-fade-in-up py-20 bg-brand-100/50 rounded-[3rem] text-center">
                    <p className="text-brand-800/40 italic">No availability on this date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 animate-fade-in-up">
                    {availableSlots.map((slot, i) => {
                      const isSelected = selectedTimeSlot?.start.getTime() === slot.start.getTime();
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-4 rounded-2xl text-[11px] font-bold tracking-[0.1em] transition-all duration-300 border-2 ${
                            isSelected 
                              ? 'bg-brand-900 border-brand-900 text-brand-50 shadow-lg shadow-brand-900/10' 
                              : 'bg-brand-100 border-transparent text-brand-900 hover:border-brand-200'
                          }`}
                        >
                          {slot.label.replace(' ', '')}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              <button 
                disabled={!selectedTimeSlot}
                onClick={() => setStep(3)}
                className="bg-brand-900 text-brand-50 px-16 py-5 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold disabled:opacity-30 hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/10 flex items-center gap-4"
              >
                Continue to details
                <ArrowRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-right">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-500 hover:text-brand-900 mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Details
            </button>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="md:col-span-2">
                <form id="booking-form" onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl shadow-brand-900/5 space-y-6">
                  <h3 className="font-serif text-2xl text-brand-900 mb-6">Your Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 transition-all font-sans"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 transition-all font-sans"
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 transition-all font-sans"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Additional Notes (Optional)</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({...form, notes: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 transition-all font-sans h-24"
                        placeholder="Any skin sensitivities or specific looks you'd like?"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="md:col-span-1 flex flex-col-reverse md:flex-col">
                <div className="bg-brand-900 text-brand-50 rounded-[2rem] p-6 sm:p-8 mt-8 md:mt-0 md:sticky md:top-32 shadow-xl shadow-brand-900/20">
                  <h3 className="font-serif text-xl mb-8 text-brand-300">Session Summary</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Service</p>
                      <p className="font-medium text-lg">{selectedService?.name}</p>
                    </div>
                    
                    <div className="h-px w-full bg-white/10"></div>
                    
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Date</p>
                      <p className="font-medium text-lg">{selectedDate && format(selectedDate, 'MMMM d, yyyy')}</p>
                    </div>

                    <div className="h-px w-full bg-white/10"></div>
                    
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Time</p>
                      <p className="font-medium text-lg">
                        {selectedTimeSlot && `${selectedTimeSlot.label} - ${format(selectedTimeSlot.end, 'h:mm a')}`}
                      </p>
                      <p className="text-sm opacity-60 mt-1">{selectedService?.duration_minutes} minutes</p>
                    </div>

                    <div className="h-px w-full bg-white/10"></div>
                    
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Total</p>
                      <p className="font-serif text-3xl">${selectedService?.price}</p>
                    </div>
                  </div>

                  <button
                    form="booking-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-8 py-4 bg-brand-100 text-brand-900 rounded-xl uppercase tracking-[0.2em] text-xs font-bold hover:bg-white disabled:opacity-50 transition-colors text-center block"
                  >
                    {isSubmitting ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up max-w-lg mx-auto text-center py-20">
            {isCancelled ? (
              <>
                <div className="w-24 h-24 bg-brand-50 text-brand-900 shadow-xl shadow-brand-900/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <XCircle className="w-12 h-12" />
                </div>
                
                <h2 className="font-serif text-4xl sm:text-5xl text-brand-900 mb-6 font-light">Session Cancelled</h2>
                <p className="text-brand-800/60 leading-relaxed font-light mb-12">
                  Your session request has been successfully cancelled. You can book a new session at any time.
                </p>

                <Link 
                  to="/"
                  className="inline-flex items-center text-[11px] uppercase tracking-[0.2em] font-bold text-brand-900 hover:text-brand-700 transition-colors"
                >
                  Return Home
                </Link>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-brand-900 text-brand-50 shadow-xl shadow-brand-900/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                
                <h2 className="font-serif text-4xl sm:text-5xl text-brand-900 mb-6 font-light">See you soon.</h2>
                <p className="text-brand-800/60 leading-relaxed font-light mb-12">
                  Thank you, {(form.name || '').split(' ')[0]}. Your session request has been received. You will receive an email confirmation shortly containing details about your appointment and preparation steps.
                </p>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-brand-900/5 text-left mb-12 inline-block w-full">
                  <p className="font-serif text-2xl border-b border-brand-100 pb-6 mb-6 text-brand-900 font-light">
                    {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-brand-800/40">Time</span>
                    <span className="text-brand-900 text-base">{selectedTimeSlot?.label}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium mt-4">
                    <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-brand-800/40">Service</span>
                    <span className="text-brand-900 text-base">{selectedService?.name}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                  <button
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                    className="text-[11px] uppercase tracking-[0.2em] text-red-900/50 font-bold hover:text-red-900 transition-colors disabled:opacity-50"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Booking"}
                  </button>
                  <Link 
                    to="/"
                    className="inline-flex px-10 py-5 bg-brand-900 text-brand-50 rounded-full items-center text-[11px] uppercase tracking-[0.2em] font-bold shadow-xl shadow-brand-900/10 hover:bg-brand-800 transition-colors"
                  >
                    Return Home
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
