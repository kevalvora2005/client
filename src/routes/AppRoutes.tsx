import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GuestRoute from './GuestRoute';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardLayout from '../components/layout/AdminLayout/DashboardLayout';
import ResidentsPage from '../features/residents/pages/ResidentsPage';
import ResidentDetailPage from '../features/residents/pages/ResidentDetailPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import ApartmentsPage from '../features/apartments/pages/ApartmentsPage';
import ApartmentDetailPage from '../features/apartments/pages/ApartmentDetailPage';
import MyApartmentPage from '../features/myApartment/pages/MyApartmentPage';
import TenantManagementPage from '../features/tenantRequests/pages/TenantManagementPage';
import TenantDetailPage from '../features/tenantRequests/pages/TenantDetailPage';
import TenantRequestsPage from '../features/tenantRequests/pages/TenantRequestsPage';
import TenantRequestDetailPage from '../features/tenantRequests/pages/TenantRequestDetailPage';
import TenantWelcomePage from '../features/tenantRequests/pages/TenantWelcomePage';
import NoticesPage from '../features/notices/pages/NoticesPage';
import ComplaintsPage from '../features/complaints/pages/ComplaintsPage';
import MaintenancePage from '../features/maintenance/pages/MaintenancePage';
import DocumentsPage from '../features/documents/pages/DocumentsPage';
import DocumentRequestDetailPage from '../features/documents/pages/DocumentRequestDetailPage';
import AmenitiesPage from '../features/amenities/pages/AmenitiesPage';
import AmenityDetailPage from '../features/amenities/pages/AmenityDetailPage';
import MyBookingsPage from '../features/amenities/pages/MyBookingsPage';
import BookingsAdminPage from '../features/amenities/pages/BookingsAdminPage';
import BookingDetailPage from '../features/amenities/pages/BookingDetailPage';
import CheckInPage from '../features/visitors/pages/CheckInPage';
import CheckOutPage from '../features/visitors/pages/CheckOutPage';
import VisitorLogPage from '../features/visitors/pages/VisitorLogPage';

// ─── Placeholder pages (replace as you build each module) ─────────
const ResidentDashboard = () => <div className="p-4">Resident Dashboard — coming soon</div>;

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ─── Guest routes (only for unauthenticated users) ─── */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* ─── Password reset route ─── */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ─── Protected routes (admin only) ───────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/residents" replace />} />
            <Route path="/residents" element={<ResidentsPage />} />
            <Route path="/residents/:id" element={<ResidentDetailPage />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route path="/apartments/:id" element={<ApartmentDetailPage />} />
            <Route path="/tenant-requests" element={<TenantRequestsPage />} />
            <Route path="/tenant-requests/:id" element={<TenantRequestDetailPage />} />
            <Route path="/bookings" element={<BookingsAdminPage />} />
            <Route path="/bookings/:id" element={<BookingDetailPage />} />
            <Route path="/bookings/stats" element={<Navigate to="/bookings" replace />} />
          </Route>
        </Route>

        {/* ─── Protected routes (resident only) ───────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/resident" element={<ResidentDashboard />} />
            <Route path="/my-apartment" element={<MyApartmentPage />} />
            <Route path="/tenant" element={<TenantManagementPage />} />
            <Route path="/tenant/:id" element={<TenantDetailPage />} />
            <Route path="/bookings/me" element={<MyBookingsPage />} />
          </Route>
        </Route>

        {/* ─── Tenant pre-occupancy gate (standalone, no dashboard chrome) ─── */}
        <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
          <Route path="/tenant-welcome" element={<TenantWelcomePage />} />
        </Route>

        {/* ─── Protected routes (security only) ───────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['security']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/security" element={<CheckInPage />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="/checkout" element={<CheckOutPage />} />
          </Route>
        </Route>

        {/* ─── Shared routes (admin + resident) ───────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'resident']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:id" element={<DocumentRequestDetailPage />} />
            <Route path="/amenities" element={<AmenitiesPage />} />
            <Route path="/amenities/:id" element={<AmenityDetailPage />} />
          </Route>
        </Route>

        {/* ─── Shared routes (admin, resident, security) ───────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'resident', 'security']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/visitor-logs" element={<VisitorLogPage />} />
            <Route path="/my-visitors" element={<VisitorLogPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ─── Utility routes ───────────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;