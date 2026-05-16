import React, { useEffect, useState, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Service, BusinessHours, BlockedDate, BusinessSettings, Appointment } from "../../types";
import { format, addMinutes, parse, startOfDay, endOfDay, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isBefore, isSameMonth } from "date-fns";
import { CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft, XCircle } from "lucide-react";

export default function Booking() {
  const location = useLocation();
  const initServiceId = location.state?.selectedServiceId;

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
    async function fetchBookingData() {
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

      if (servicesData) setServices(servicesData);
      if (hoursData) setBusinessHours(hoursData);
      if (blockedData) setBlockedDates(blockedData);
      if (settingsData) setSettings(settingsData);
      if (appointmentsData) setExistingAppointments(appointmentsData);

      if (initServiceId && servicesData) {
        const serv = servicesData.find(s => s.id === initServiceId);
        if (serv) setSelectedService(serv);
      }

      setLoading(false);
    }
    fetchBookingData();
  }, [initServiceId]);

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
    if (!dayHours || !dayHours.is_open) return [];

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
    <div className="bg-brand-100 min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-12 md:pt-20">
        
        {step < 4 && (
          <div className="mb-12">
            <h1 className="font-serif text-4xl text-brand-900 mb-6 tracking-tight">Reserve your session</h1>
            
            <div className="flex items-center gap-2 md:gap-4 text-xs font-medium uppercase tracking-widest text-slate-400">
              <span className={step >= 1 ? 'text-brand-900' : ''}>Service</span>
              <ChevronRight className="w-4 h-4" />
              <span className={step >= 2 ? 'text-brand-900' : ''}>Time</span>
              <ChevronRight className="w-4 h-4" />
              <span className={step >= 3 ? 'text-brand-900' : ''}>Details</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4">
              {services.map(service => (
                <div 
                  key={service.id} 
                  onClick={() => setSelectedService(service)}
                  className={`p-6 md:p-8 rounded-3xl cursor-pointer transition-all border ${
                    selectedService?.id === service.id 
                      ? 'bg-transparent border-brand-900 shadow-md ring-1 ring-brand-900' 
                      : 'bg-white border-transparent hover:border-brand-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-serif text-2xl text-brand-900">{service.name}</h3>
                    <div className="flex items-center gap-4 text-sm font-medium tracking-widest uppercase">
                      <span>{service.duration_minutes}m</span>
                      <span>${service.price}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed max-w-2xl">{service.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-end">
              <button 
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="bg-brand-900 text-brand-100 px-10 py-4 rounded-full uppercase tracking-widest text-xs font-semibold disabled:opacity-50 hover:bg-brand-800 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-500 hover:text-brand-900 mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Services
            </button>
            
            <div className="bg-white rounded-[2rem] p-6 md:p-10 premium-shadow">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl text-brand-900">{format(currentMonth, "MMMM yyyy")}</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        disabled={isBefore(currentMonth, startOfMonth(new Date()))}
                        className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-brand-200 hover:text-brand-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-brand-200 hover:text-brand-900"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] sm:text-xs tracking-widest uppercase text-slate-400">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarDays.map(date => {
                      const isSelected = selectedDate && isSameDay(date, selectedDate);
                      const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
                      const notInMonth = !isSameMonth(date, currentMonth);
                      
                      const isBlocked = blockedDates.some(b => b.blocked_date === format(date, 'yyyy-MM-dd'));
                      const isClosed = !businessHours.find(h => h.weekday === date.getDay())?.is_open;
                      const disabled = isPast || isBlocked || isClosed;

                      return (
                        <button
                          key={date.toISOString()}
                          disabled={disabled || notInMonth}
                          onClick={() => { setSelectedDate(date); setSelectedTimeSlot(null); }}
                          className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl transition-all aspect-square ${
                            notInMonth ? 'opacity-0 cursor-default pointer-events-none' :
                            disabled 
                              ? 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400' 
                              : isSelected 
                                ? 'bg-brand-900 text-brand-100 shadow-md ring-2 ring-brand-900 ring-offset-2' 
                                : 'bg-slate-50 hover:bg-brand-200 text-brand-900 hover:shadow-sm'
                          }`}
                        >
                          <span className="font-serif text-lg sm:text-xl">{format(date, 'd')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-xl text-brand-900 mb-6">Available Times</h3>
                  
                  {!selectedDate ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 italic py-12 lg:py-0 border-2 border-dashed border-slate-100 rounded-3xl">
                      Select a date to see times
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 italic py-12 lg:py-0 border-2 border-dashed border-slate-100 rounded-3xl">
                      No availability on this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {availableSlots.map((slot, i) => {
                        const isSelected = selectedTimeSlot?.start.getTime() === slot.start.getTime();
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-4 rounded-xl text-sm font-medium tracking-wide transition-all ${
                              isSelected 
                                ? 'bg-brand-900 text-brand-100 ring-2 ring-brand-900 ring-offset-2' 
                                : 'bg-slate-50 text-brand-900 hover:bg-brand-200'
                            }`}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button 
                disabled={!selectedTimeSlot}
                onClick={() => setStep(3)}
                className="bg-brand-900 text-brand-100 px-10 py-4 rounded-full uppercase tracking-widest text-xs font-semibold disabled:opacity-50 hover:bg-brand-800 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-500 hover:text-brand-900 mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Details
            </button>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2">
                <form id="booking-form" onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-10 premium-shadow space-y-6">
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

              <div className="md:col-span-1">
                <div className="bg-brand-900 text-brand-100 rounded-[2rem] p-8 sticky top-32">
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
          <div className="animate-in zoom-in-95 duration-500 max-w-lg mx-auto text-center py-20">
            {isCancelled ? (
              <>
                <div className="w-24 h-24 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-8 premium-shadow">
                  <XCircle className="w-12 h-12" />
                </div>
                
                <h2 className="font-serif text-4xl text-brand-900 mb-4">Booking Cancelled.</h2>
                <p className="text-slate-600 leading-relaxed mb-10">
                  Your session request has been successfully cancelled. You can book a new session at any time.
                </p>

                <Link 
                  to="/"
                  className="inline-flex items-center text-sm uppercase tracking-widest text-brand-900 font-medium hover:text-amber-700 transition-colors"
                >
                  Return Home
                </Link>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 premium-shadow">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                
                <h2 className="font-serif text-4xl text-brand-900 mb-4">Request sent.</h2>
                <p className="text-slate-600 leading-relaxed mb-10">
                  Thank you, {form.name.split(' ')[0]}. Your session request has been received. You will receive an email confirmation shortly containing details about your appointment and preparation steps.
                </p>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left mb-10 inline-block w-full">
                  <p className="font-serif text-xl border-b border-slate-100 pb-4 mb-4 text-brand-900">
                    {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500 uppercase tracking-widest">Time</span>
                    <span className="text-brand-900 text-base">{selectedTimeSlot?.label}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium mt-3">
                    <span className="text-slate-500 uppercase tracking-widest">Service</span>
                    <span className="text-brand-900 text-base">{selectedService?.name}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                    className="text-sm uppercase tracking-widest text-red-500 font-medium hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Booking"}
                  </button>
                  <Link 
                    to="/"
                    className="inline-flex items-center text-sm uppercase tracking-widest text-brand-900 font-medium hover:text-amber-700 transition-colors"
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
