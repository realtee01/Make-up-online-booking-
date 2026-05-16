/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
import Home from "./pages/public/Home";
import Booking from "./pages/public/Booking";
import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/admin/Login";
import DashboardHome from "./pages/admin/DashboardHome";
import Appointments from "./pages/admin/Appointments";
import Services from "./pages/admin/Services";
import BusinessHours from "./pages/admin/BusinessHours";
import BlockedDates from "./pages/admin/BlockedDates";
import BusinessSettings from "./pages/admin/BusinessSettings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="book" element={<Booking />} />
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
    </BrowserRouter>
  );
}
