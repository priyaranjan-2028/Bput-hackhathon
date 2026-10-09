import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth, getRolePath } from './context/AuthContext';
import { UserRole } from './types';
import DashboardLayout from './components/layout/DashboardLayout';
import { ShieldAlert } from 'lucide-react';
import { NotificationsRoute } from './pages/common/NotificationsRoute';

class ProjectUserErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="mx-auto mt-16 max-w-xl rounded-xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert size={32} className="mx-auto text-rose-700" />
          <h1 className="mt-4 text-xl font-bold text-navy-900">Page error</h1>
          <p role="alert" className="mt-2 text-sm text-slate-600">{this.state.error.message}</p>
          <p className="mt-2 text-xs text-slate-500">Your saved records were not cleared. Reload the page or review this browser’s saved demo data.</p>
          <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-5">Reload workspace</button>
        </main>
      );
    }
    return this.props.children;
  }
}

// Public Pages
import LandingPage from './pages/public/LandingPage';
import FeaturesPage from './pages/public/FeaturesPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';

// Common Pages
import ProfilePage from './pages/common/ProfilePage';

// Project User Pages
import ProjectUserDashboard from './pages/project-user/ProjectUserDashboard';
import ProjectUserDataEntryPage from './pages/project-user/ProjectUserDataEntryPage';
import Scope1Page from './pages/project-user/Scope1Page';
import Scope2Page from './pages/project-user/Scope2Page';
import Scope3Page from './pages/project-user/Scope3Page';
import SectionCPage from './pages/project-user/SectionCPage';
import ProjectEvidencePage from './pages/project-user/ProjectEvidencePage';
import MySubmissionsPage from './pages/project-user/MySubmissionsPage';
import CorrectionsPage from './pages/project-user/CorrectionsPage';
import HelpSupportPage from './pages/project-user/HelpSupportPage';

// Project Supervisor Pages
import ProjectSupervisorDashboard from './pages/project-supervisor/ProjectSupervisorDashboard';
import ProjectUsersPage from './pages/project-supervisor/ProjectUsersPage';
import ParametersPage from './pages/project-supervisor/ParametersPage';
import SubmissionReviewPage from './pages/project-supervisor/SubmissionReviewPage';
import EvidenceReviewPage from './pages/project-supervisor/EvidenceReviewPage';
import ProjectConsolidationPage from './pages/project-supervisor/ProjectConsolidationPage';
import VerificationHistoryPage from './pages/project-supervisor/VerificationHistoryPage';

// Business Unit Pages
import BUDashboard from './pages/business-unit/BUDashboard';
import BUProjectsPage from './pages/business-unit/BUProjectsPage';
import BUSupervisorsPage from './pages/business-unit/BUSupervisorsPage';
import BUProjectReviewPage from './pages/business-unit/BUProjectReviewPage';
import BUConsolidationPage from './pages/business-unit/BUConsolidationPage';
import BUVerificationHistoryPage from './pages/business-unit/BUVerificationHistoryPage';

// Subsidiary Pages
import SubsidiaryDashboard from './pages/subsidiary/SubsidiaryDashboard';
import SubsidiaryBUsPage from './pages/subsidiary/SubsidiaryBUsPage';
import SubsidiarySupervisorsPage from './pages/subsidiary/SubsidiarySupervisorsPage';
import SubsidiaryReviewPage from './pages/subsidiary/SubsidiaryReviewPage';
import SubsidiaryConsolidationPage from './pages/subsidiary/SubsidiaryConsolidationPage';

// MEIL Admin Pages
import MEILDashboard from './pages/admin/MEILDashboard';
import SubsidiariesPage from './pages/admin/SubsidiariesPage';
import HierarchyPage from './pages/admin/HierarchyPage';
import ESGOverviewPage from './pages/admin/ESGOverviewPage';
import ScopeAnalyticsPage from './pages/admin/ScopeAnalyticsPage';
import EvidenceExplorerPage from './pages/admin/EvidenceExplorerPage';
import ConsolidationCenterPage from './pages/admin/ConsolidationCenterPage';
import AuditTrailPage from './pages/admin/AuditTrailPage';
import BRSRReportGeneratorPage from './pages/admin/BRSRReportGeneratorPage';
import ReportPreviewPage from './pages/admin/ReportPreviewPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const routeRoleMap: Record<string, UserRole> = {
    '/project-user': UserRole.PROJECT_USER,
    '/dashboard': UserRole.PROJECT_USER,
    '/section-c': UserRole.PROJECT_USER,
    '/submissions': UserRole.PROJECT_USER,
    '/corrections': UserRole.PROJECT_USER,
    '/help': UserRole.PROJECT_USER,
    '/project-supervisor': UserRole.PROJECT_SUPERVISOR,
    '/business-unit': UserRole.BU_SUPERVISOR,
    '/subsidiary': UserRole.SUBSIDIARY_SUPERVISOR,
    '/admin': UserRole.MEIL_ADMIN,
  };
  const requiredRole = Object.entries(routeRoleMap).find(([prefix]) =>
    location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  )?.[1];

  if ((allowedRoles && !allowedRoles.includes(user.role)) || (requiredRole && user.role !== requiredRole)) {
    return (
      <ProjectUserErrorBoundary><DashboardLayout>
        <div className="mx-auto max-w-xl rounded-xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert size={32} className="mx-auto text-rose-700" />
          <h1 className="mt-4 text-xl font-bold text-navy-900">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">Your current role does not have permission to access this page.</p>
          <Link to={getRolePath(user.role)} className="btn-primary mt-5 inline-flex">Return to your workspace</Link>
        </div>
      </DashboardLayout></ProjectUserErrorBoundary>
    );
  }

  return <ProjectUserErrorBoundary><DashboardLayout>{children}</DashboardLayout></ProjectUserErrorBoundary>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          {/* Common Authenticated Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsRoute /></ProtectedRoute>} />

          {/* Project User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><ProjectUserDashboard /></ProtectedRoute>} />
          <Route path="/section-c" element={<Navigate to="/section-c/scope-1" replace />} />
          <Route path="/section-c/scope-1" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><Scope1Page /></ProtectedRoute>} />
          <Route path="/section-c/scope-2" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><Scope2Page /></ProtectedRoute>} />
          <Route path="/section-c/scope-3" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><Scope3Page /></ProtectedRoute>} />
          <Route path="/section-c/other" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><SectionCPage /></ProtectedRoute>} />
          <Route path="/submissions" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><MySubmissionsPage /></ProtectedRoute>} />
          <Route path="/submissions/:submissionId" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><MySubmissionsPage /></ProtectedRoute>} />
          <Route path="/corrections" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><CorrectionsPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><HelpSupportPage /></ProtectedRoute>} />
          <Route path="/project-user" element={<Navigate to="/dashboard" replace />} />
          <Route path="/project-user/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/project-user/esg-data" element={<Navigate to="/section-c/scope-1" replace />} />
          <Route path="/project-user/esg-data/scope-1" element={<Navigate to="/section-c/scope-1" replace />} />
          <Route path="/project-user/esg-data/scope-2" element={<Navigate to="/section-c/scope-2" replace />} />
          <Route path="/project-user/esg-data/scope-3" element={<Navigate to="/section-c/scope-3" replace />} />
          <Route path="/project-user/esg-data/additional" element={<Navigate to="/section-c/other" replace />} />
          <Route path="/project-user/help" element={<Navigate to="/help" replace />} />
          <Route path="/project-user/profile" element={<Navigate to="/profile" replace />} />
          <Route path="/project-user/data-entry" element={<ProtectedRoute allowedRoles={[UserRole.PROJECT_USER]}><ProjectUserDataEntryPage /></ProtectedRoute>} />
          <Route path="/project-user/data-entry/scope-1" element={<Navigate to="/section-c/scope-1" replace />} />
          <Route path="/project-user/data-entry/scope-2" element={<Navigate to="/section-c/scope-2" replace />} />
          <Route path="/project-user/data-entry/scope-3" element={<Navigate to="/section-c/scope-3" replace />} />
          <Route path="/project-user/data-entry/section-c" element={<Navigate to="/section-c/other" replace />} />
          <Route path="/project-user/evidence" element={<ProtectedRoute><ProjectEvidencePage /></ProtectedRoute>} />
          <Route path="/project-user/submissions" element={<Navigate to="/submissions" replace />} />
          <Route path="/project-user/corrections" element={<Navigate to="/corrections" replace />} />
          <Route path="/project-user/notifications" element={<Navigate to="/notifications" replace />} />

          {/* Project Supervisor Routes */}
          <Route path="/project-supervisor" element={<ProtectedRoute><ProjectSupervisorDashboard /></ProtectedRoute>} />
          <Route path="/project-supervisor/users" element={<ProtectedRoute><ProjectUsersPage /></ProtectedRoute>} />
          <Route path="/project-supervisor/parameters" element={<ProtectedRoute><ParametersPage /></ProtectedRoute>} />
          <Route path="/project-supervisor/review" element={<ProtectedRoute><SubmissionReviewPage /></ProtectedRoute>} />
          <Route path="/project-supervisor/evidence" element={<ProtectedRoute><EvidenceReviewPage /></ProtectedRoute>} />
          <Route path="/project-supervisor/consolidation" element={<ProtectedRoute><ProjectConsolidationPage /></ProtectedRoute>} />
          <Route path="/project-supervisor/history" element={<ProtectedRoute><VerificationHistoryPage /></ProtectedRoute>} />

          {/* Business Unit Routes */}
          <Route path="/business-unit" element={<ProtectedRoute><BUDashboard /></ProtectedRoute>} />
          <Route path="/business-unit/projects" element={<ProtectedRoute><BUProjectsPage /></ProtectedRoute>} />
          <Route path="/business-unit/supervisors" element={<ProtectedRoute><BUSupervisorsPage /></ProtectedRoute>} />
          <Route path="/business-unit/review" element={<ProtectedRoute><BUProjectReviewPage /></ProtectedRoute>} />
          <Route path="/business-unit/history" element={<ProtectedRoute><BUVerificationHistoryPage /></ProtectedRoute>} />
          <Route path="/business-unit/consolidation" element={<ProtectedRoute><BUConsolidationPage /></ProtectedRoute>} />

          {/* Subsidiary Routes */}
          <Route path="/subsidiary" element={<ProtectedRoute><SubsidiaryDashboard /></ProtectedRoute>} />
          <Route path="/subsidiary/business-units" element={<ProtectedRoute><SubsidiaryBUsPage /></ProtectedRoute>} />
          <Route path="/subsidiary/supervisors" element={<ProtectedRoute><SubsidiarySupervisorsPage /></ProtectedRoute>} />
          <Route path="/subsidiary/review" element={<ProtectedRoute><SubsidiaryReviewPage /></ProtectedRoute>} />
          <Route path="/subsidiary/consolidation" element={<ProtectedRoute><SubsidiaryConsolidationPage /></ProtectedRoute>} />

          {/* MEIL Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><MEILDashboard /></ProtectedRoute>} />
          <Route path="/admin/subsidiaries" element={<ProtectedRoute><SubsidiariesPage /></ProtectedRoute>} />
          <Route path="/admin/hierarchy" element={<ProtectedRoute><HierarchyPage /></ProtectedRoute>} />
          <Route path="/admin/esg-overview" element={<ProtectedRoute><ESGOverviewPage /></ProtectedRoute>} />
          <Route path="/admin/scope-analytics" element={<ProtectedRoute><ScopeAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/evidence-explorer" element={<ProtectedRoute><EvidenceExplorerPage /></ProtectedRoute>} />
          <Route path="/admin/consolidation" element={<ProtectedRoute><ConsolidationCenterPage /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute><AuditTrailPage /></ProtectedRoute>} />
          <Route path="/admin/brsr-report" element={<ProtectedRoute><BRSRReportGeneratorPage /></ProtectedRoute>} />
          <Route path="/admin/report-preview" element={<ProtectedRoute><ReportPreviewPage /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotificationsPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
