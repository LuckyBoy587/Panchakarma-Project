import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, FileText, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, userType, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  if (!user) {
    return (
      <nav className="surface shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-app">
              Panchakarma
            </Link>
            <div className="flex items-center space-x-4 navbar-links">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-muted hover:text-app"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link to="/login" className="text-muted hover:text-app">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const roleHasTreatments = ['patient', 'practitioner', 'admin', 'staff'];

  return (
    <nav className="surface shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold text-app">
            Panchakarma
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-muted hover:text-app hover:surface"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6 navbar-links">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted hover:text-app"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              to="/dashboard"
              className="flex items-center space-x-1 text-muted hover:text-app"
            >
              <User size={18} />
              <span>Dashboard</span>
            </Link>

            {userType === 'patient' && (
              <Link
                to="/appointments"
                className="flex items-center space-x-1 text-muted hover:text-app"
              >
                <Calendar size={18} />
                <span>Appointments</span>
              </Link>
            )}

            {roleHasTreatments.includes(userType) && (
              <Link
                to="/treatment-plans"
                className="flex items-center space-x-1 text-muted hover:text-app"
              >
                <FileText size={18} />
                <span>Treatments</span>
              </Link>
            )}

            {userType === 'patient' && (
              <Link
                to="/profile"
                className="flex items-center space-x-1 text-muted hover:text-app"
              >
                <Settings size={18} />
                <span>Profile</span>
              </Link>
            )}

            {userType === 'practitioner' && (
              <Link
                to="/practitioner-profile"
                className="flex items-center space-x-1 text-muted hover:text-app"
              >
                <Settings size={18} />
                <span>Profile</span>
              </Link>
            )}

            {userType === 'therapist' && (
              <Link
                to="/therapist-profile"
                className="flex items-center space-x-1 text-muted hover:text-app"
              >
                <Settings size={18} />
                <span>Profile</span>
              </Link>
            )}

            {userType === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 text-muted hover:text-app"
              >
                <Settings size={18} />
                <span>Admin</span>
              </Link>
            )}

            {userType === 'staff' && (
              <Link
                to="/staff-dashboard"
                className="flex items-center space-x-1 text-muted hover:text-app"
              >
                <Settings size={18} />
                <span>Staff Dashboard</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-muted hover:text-danger"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-muted hover:text-app px-2 py-1 mobile-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={18} />
                <span>Dashboard</span>
              </Link>

              {userType === 'patient' && (
                <Link
                  to="/appointments"
                  className="flex items-center space-x-2 text-muted hover:text-app px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Calendar size={18} />
                  <span>Appointments</span>
                </Link>
              )}

              {roleHasTreatments.includes(userType) && (
                <Link
                  to="/treatment-plans"
                  className="flex items-center space-x-2 text-muted hover:text-app px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText size={18} />
                  <span>Treatments</span>
                </Link>
              )}

              {userType === 'patient' && (
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-muted hover:text-app px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Profile</span>
                </Link>
              )}

              {userType === 'practitioner' && (
                <Link
                  to="/practitioner-profile"
                  className="flex items-center space-x-2 text-muted hover:text-app px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Profile</span>
                </Link>
              )}

              {userType === 'therapist' && (
                <Link
                  to="/therapist-profile"
                  className="flex items-center space-x-2 text-muted hover:text-app px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Profile</span>
                </Link>
              )}

              {userType === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-muted hover:text-app px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Admin</span>
                </Link>
              )}

              {userType === 'staff' && (
                <Link
                  to="/staff-dashboard"
                  className="flex items-center space-x-2 text-muted hover:text-app px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Staff Dashboard</span>
                </Link>
              )}

              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-muted hover:text-app px-2 py-1 mobile-menu-link w-full"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span>Toggle Theme</span>
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-muted hover:text-danger px-2 py-1 text-left mobile-menu-link w-full"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
