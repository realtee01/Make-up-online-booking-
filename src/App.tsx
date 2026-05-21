/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";

// Lazy load pages
const Home = lazy(() => import("./pages/public/Home"));
const Booking = lazy(() => import("./pages/public/Booking"));
const Contact = lazy(() => import("./pages/public/Contact"));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const Login = lazy(() => import("./pages/admin/Login"));
const DashboardHome = lazy(() => import("./pages/admin/DashboardHome"));
const Appointments = lazy(() => import("./pages/admin/Appointments"));
const Services = lazy(() => import("./pages/admin/Services"));
const BusinessHours = lazy(() => import("./pages/admin/BusinessHours"));
const BlockedDates = lazy(() => import("./pages/admin/BlockedDates"));
const BusinessSettings = lazy(() => import("./pages/admin/BusinessSettings"));

// Beautiful loading state matching the luxury/timeless design
function ElegantLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FAFAFA]" aria-busy="true" aria-live="polite">
      <div className="w-12 h-12 rounded-full border border-brand-300/30 border-t-brand-900 animate-spin mb-4" />
      <span className="font-serif tracking-[0.2em] uppercase text-[10px] text-brand-800/40 animate-pulse">L'élégance...</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<ElegantLoading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="book" element={<Booking />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="services" element={<Services />} />
            <Route path="business-hours" element={<BusinessHours />} />
            <Route path="blocked-dates" element={<BlockedDates />} />
            <Route path="settings" element={<BusinessSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
