import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, getRoleLabel } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { getNotificationsByUser, getProjectById, getBusinessUnitById, getSubsidiaryById } from '../../data/mockData';
import { getUserNotifications } from '../../services/notificationService';
import { readStoredValue } from '../../services/localStorageService';
import {
  LayoutDashboard, FileText, ClipboardList, CheckCircle2,
  AlertTriangle, Bell, User, Settings, LogOut, ChevronDown,
  Building2, FolderTree, BarChart3, Search, FileSearch,
  Layers, Shield, Menu, X, Leaf, Database, BookOpen,
  Users, FolderKanban, CircleDot, FileBarChart, ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}

function getProjectUserNavGroups(): NavGroup[] {
  return [
    {
      groupTitle: 'MAIN',
      items: [
        { label: 'Dashboard', path: '/project-user/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'ESG Data Entry', path: '/project-user/data-entry', icon: <FileText size={18} /> },
        { label: 'My Submissions', path: '/project-user/submissions', icon: <ClipboardList size={18} /> },
        { label: 'Corrections Required', path: '/project-user/corrections', icon: <AlertTriangle size={18} /> },
        { label: 'Notifications', path: '/project-user/notifications', icon: <Bell size={18} /> },
      ],
    },
    {
      groupTitle: 'SUPPORT',
      items: [
        { label: 'Help & Support', path: '/project-user/help', icon: <BookOpen size={18} /> },
        { label: 'Profile', path: '/project-user/profile', icon: <User size={18} /> },
      ],
    },
  ];
}

function getStandardNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case UserRole.PROJECT_SUPERVISOR:
      return [
        { label: 'Dashboard', path: '/project-supervisor', icon: <LayoutDashboard size={18} /> },
        { label: 'Project Users', path: '/project-supervisor/users', icon: <Users size={18} /> },
        { label: 'Parameters', path: '/project-supervisor/parameters', icon: <Database size={18} /> },
        { label: 'Submission Review', path: '/project-supervisor/review', icon: <CheckCircle2 size={18} /> },
        { label: 'Consolidation', path: '/project-supervisor/consolidation', icon: <Layers size={18} /> },
        { label: 'Verification History', path: '/project-supervisor/history', icon: <Shield size={18} /> },
        { label: 'Notifications', path: '/notifications', icon: <Bell size={18} /> },
      ];
    case UserRole.BU_SUPERVISOR:
      return [
        { label: 'Dashboard', path: '/business-unit', icon: <LayoutDashboard size={18} /> },
        { label: 'Projects', path: '/business-unit/projects', icon: <FolderKanban size={18} /> },
        { label: 'Project Supervisors', path: '/business-unit/supervisors', icon: <Users size={18} /> },
        { label: 'Submission Approval', path: '/business-unit/review', icon: <CheckCircle2 size={18} /> },
        { label: 'Verification History', path: '/business-unit/history', icon: <Shield size={18} /> },
        { label: 'Consolidation', path: '/business-unit/consolidation', icon: <Layers size={18} /> },
        { label: 'Notifications', path: '/notifications', icon: <Bell size={18} /> },
      ];
    case UserRole.SUBSIDIARY_SUPERVISOR:
      return [
        { label: 'Dashboard', path: '/subsidiary', icon: <LayoutDashboard size={18} /> },
        { label: 'Business Units', path: '/subsidiary/business-units', icon: <Building2 size={18} /> },
        { label: 'BU Supervisors', path: '/subsidiary/supervisors', icon: <Users size={18} /> },
        { label: 'BU Review', path: '/subsidiary/review', icon: <CheckCircle2 size={18} /> },
        { label: 'Consolidation', path: '/subsidiary/consolidation', icon: <Layers size={18} /> },
      ];
    case UserRole.MEIL_ADMIN:
      return [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
        { label: 'Subsidiaries', path: '/admin/subsidiaries', icon: <Building2 size={18} /> },
        { label: 'Org Hierarchy', path: '/admin/hierarchy', icon: <FolderTree size={18} /> },
        { label: 'ESG Overview', path: '/admin/esg-overview', icon: <Leaf size={18} /> },
        { label: 'Scope Analytics', path: '/admin/scope-analytics', icon: <BarChart3 size={18} /> },
        { label: 'Evidence Explorer', path: '/admin/evidence-explorer', icon: <FileSearch size={18} /> },
        { label: 'Consolidation', path: '/admin/consolidation', icon: <Layers size={18} /> },
        { label: 'Audit Trail', path: '/admin/audit', icon: <Shield size={18} /> },
        { label: 'BRSR Report', path: '/admin/brsr-report', icon: <FileBarChart size={18} /> },
        { label: 'Notifications', path: '/admin/notifications', icon: <Bell size={18} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
      ];
    default:
      return [];
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;

  const isProjectUser = user.role === UserRole.PROJECT_USER;
  const project = user.projectId ? getProjectById(user.projectId) : undefined;
  const businessUnit = user.businessUnitId ? getBusinessUnitById(user.businessUnitId) : undefined;
  const subsidiary = user.subsidiaryId ? getSubsidiaryById(user.subsidiaryId) : undefined;

  const userNotifications = isProjectUser
    ? getUserNotifications(user.id)
    : [...readStoredValue<ReturnType<typeof getNotificationsByUser>>('meil_notifications', []).filter(item => item.userId === user.id), ...getNotificationsByUser(user.id)];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return ['Home', 'Dashboard'];
    if (path.includes('/esg-data') || path.includes('/section-c')) {
      if (path.includes('scope-1')) return ['Home', 'ESG Data Entry', 'Scope 1'];
      if (path.includes('scope-2')) return ['Home', 'ESG Data Entry', 'Scope 2'];
      if (path.includes('scope-3')) return ['Home', 'ESG Data Entry', 'Scope 3'];
      if (path.includes('additional') || path.includes('other')) return ['Home', 'ESG Data Entry', 'Additional Section C'];
      return ['Home', 'ESG Data Entry'];
    }
    if (path.includes('/submissions')) return ['Home', 'My Submissions'];
    if (path.includes('/corrections')) return ['Home', 'Corrections Required'];
    if (path.includes('/notifications')) return ['Home', 'Notifications'];
    if (path.includes('/help')) return ['Home', 'Help & Support'];
    if (path.includes('/profile')) return ['Home', 'Profile'];
    return ['Home', 'Portal'];
  };

  const breadcrumbs = getBreadcrumb();

  const isItemActive = (path: string) => {
    if (path === '/project-user/esg-data/scope-1') {
      return location.pathname.startsWith('/project-user/esg-data') || location.pathname.startsWith('/section-c');
    }
    if (path === '/project-user/dashboard' && (location.pathname === '/project-user/dashboard' || location.pathname === '/dashboard')) {
      return true;
    }
    if (path === '/project-user/submissions' && (location.pathname.startsWith('/project-user/submissions') || location.pathname.startsWith('/submissions'))) {
      return true;
    }
    if (path === '/project-user/corrections' && (location.pathname.startsWith('/project-user/corrections') || location.pathname.startsWith('/corrections'))) {
      return true;
    }
    if (path === '/project-user/notifications' && (location.pathname.startsWith('/project-user/notifications') || location.pathname === '/notifications')) {
      return true;
    }
    if (path === '/project-user/help' && (location.pathname.startsWith('/project-user/help') || location.pathname === '/help')) {
      return true;
    }
    if (path === '/project-user/profile' && (location.pathname.startsWith('/project-user/profile') || location.pathname === '/profile')) {
      return true;
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-navy-900 text-white rounded-lg shadow-md border border-navy-700"
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} bg-[#0b1329] border-r border-navy-800`}>
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-navy-800/80 bg-[#070e20]">
          <Link to={isProjectUser ? '/project-user/dashboard' : '/'} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-inner">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide leading-tight">MEIL ESG / BRSR</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                Reporting Portal
              </div>
            </div>
          </Link>
        </div>

        {/* User Context Widget */}
        <div className="px-5 py-3.5 border-b border-navy-800/60 bg-navy-950/40">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Project Data User</div>
          <div className="text-sm font-semibold text-white mt-0.5 truncate">{user.name}</div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300">ID: {user.id}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-6">
          {isProjectUser ? (
            getProjectUserNavGroups().map((group, groupIndex) => (
              <div key={group.groupTitle ?? groupIndex} className="space-y-1">
                {group.groupTitle && (
                  <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    {group.groupTitle}
                  </div>
                )}
                {group.items.map(item => {
                  const active = isItemActive(item.path);
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm font-semibold'
                          : 'text-slate-300 hover:bg-navy-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.label === 'Notifications' && unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))
          ) : (
            getStandardNavItems(user.role).map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-navy-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })
          )}

          {/* Quick Logout for Project User in SUPPORT group */}
          {isProjectUser && (
            <div className="pt-2 px-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
              >
                <LogOut size={16} className="text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-navy-800/80 bg-[#070e20] text-center">
          <div className="text-[11px] font-medium text-slate-300">
            MEIL Enterprise ESG Portal
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            FY 2025–26 Compliance v2.4
          </div>
        </div>
      </aside>

      {/* Top Global Header */}
      <header className="top-header fixed top-0 right-0 left-[var(--sidebar-width)] h-[var(--header-height)] bg-white border-b border-slate-200 z-30 flex items-center justify-between px-6 shadow-xs">
        {/* Left Side: Brand, Breadcrumbs, Project Boundary */}
        <div className="flex items-center gap-4 min-w-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="font-semibold text-navy-950">MEIL ESG / BRSR Portal</span>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  <ChevronRight size={12} className="text-slate-400" />
                  <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-blue-700' : 'text-slate-500'}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* Project Context Info Line */}
            {isProjectUser && (
              <div className="hidden sm:flex items-center gap-2 mt-1 text-xs">
                <span className="font-semibold text-navy-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {project?.name ?? 'Zojila Tunnel Project'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">
                  {businessUnit?.name ?? 'Transportation'} → {subsidiary?.name ?? 'MEIL Infrastructure'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 font-medium text-[11px]">
                  {project?.reportingPeriod ?? 'FY 2025–26'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Alerts, Notifications & User Info */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Button */}
          <button
            onClick={() => navigate(isProjectUser ? '/project-user/notifications' : '/notifications')}
            aria-label="Open notifications"
            className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-navy-900 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {user.id} · {getRoleLabel(user.role)}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 divide-y divide-slate-100">
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-navy-900 mt-0.5">{user.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-700">
                      <span>Employee ID:</span>
                      <strong className="font-mono">{user.id}</strong>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to={isProjectUser ? '/project-user/profile' : '/profile'}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={15} className="text-slate-400" />
                      View Profile &amp; Assignment
                    </Link>
                    {isProjectUser && (
                      <Link
                        to="/project-user/help"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                        onClick={() => setProfileOpen(false)}
                      >
                        <BookOpen size={15} className="text-slate-400" />
                        Help &amp; Support Guide
                      </Link>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="page-container pt-20 pb-12 px-6">
        <div className="page-content animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
