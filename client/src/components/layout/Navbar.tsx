import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../../features/notifications/NotificationDropdown';
import {
  Wrench,
  LayoutDashboard,
  PlusCircle,
  Megaphone,
  LogOut,
  Shield,
  Settings as SettingsIcon,
  ListTodo,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  FixFlow
                  {isAdmin && (
                    <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block leading-none">
                  Greenfield Heights CHS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {isAdmin ? (
                  <>
                    <Link to="/admin" className={navLinkClass('/admin')}>
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Executive Dashboard</span>
                    </Link>
                    <Link to="/admin/complaints" className={navLinkClass('/admin/complaints')}>
                      <ListTodo className="w-4 h-4" />
                      <span>All Issues</span>
                    </Link>
                    <Link to="/notices" className={navLinkClass('/notices')}>
                      <Megaphone className="w-4 h-4" />
                      <span>Notice Board</span>
                    </Link>
                    <Link to="/admin/settings" className={navLinkClass('/admin/settings')}>
                      <SettingsIcon className="w-4 h-4" />
                      <span>SLA Settings</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/" className={navLinkClass('/')}>
                      <LayoutDashboard className="w-4 h-4" />
                      <span>My Home</span>
                    </Link>
                    <Link to="/report" className={navLinkClass('/report')}>
                      <PlusCircle className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-brand-700">Report Issue</span>
                    </Link>
                    <Link to="/notices" className={navLinkClass('/notices')}>
                      <Megaphone className="w-4 h-4" />
                      <span>Notice Board</span>
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Right User Actions */}
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationDropdown />

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {user.role === 'RESIDENT'
                      ? `Flat ${user.flatNumber || ''} (${user.building || 'Resident'})`
                      : 'Society Administrator'}
                  </p>
                </div>

                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shadow-xs">
                  {user.name.charAt(0)}
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-4 py-2"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
