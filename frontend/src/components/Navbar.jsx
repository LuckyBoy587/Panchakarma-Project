import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, FileText, Settings, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) {
    return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Panchakarma
            </Link>
            <div className="flex items-center space-x-4 navbar-links">
              <Link to="/login" className="text-gray-600 hover:text-blue-600">
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

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            Panchakarma
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6 navbar-links">
            <Link
              to="/dashboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
            >
              <User size={18} />
              <span>Dashboard</span>
            </Link>

            {user.userType === 'patient' && (
              <Link
                to="/appointments"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
              >
                <Calendar size={18} />
                <span>Appointments</span>
              </Link>
            )}

            {(user.userType === 'patient' || user.userType === 'practitioner') && (
              <Link
                to="/treatment-plans"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
              >
                <FileText size={18} />
                <span>Treatments</span>
              </Link>
            )}

            {user.userType === 'patient' && (
              <Link
                to="/profile"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
              >
                <Settings size={18} />
                <span>Profile</span>
              </Link>
            )}

            {user.userType === 'practitioner' && (
              <Link
                to="/practitioner-profile"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
              >
                <Settings size={18} />
                <span>Profile</span>
              </Link>
            )}

            {user.userType === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
              >
                <Settings size={18} />
                <span>Admin</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
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
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-2 py-1 mobile-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={18} />
                <span>Dashboard</span>
              </Link>

              {user.userType === 'patient' && (
                <Link
                  to="/appointments"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Calendar size={18} />
                  <span>Appointments</span>
                </Link>
              )}

              {(user.userType === 'patient' || user.userType === 'practitioner') && (
                <Link
                  to="/treatment-plans"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText size={18} />
                  <span>Treatments</span>
                </Link>
              )}

              {user.userType === 'patient' && (
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Profile</span>
                </Link>
              )}

              {user.userType === 'practitioner' && (
                <Link
                  to="/practitioner-profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Profile</span>
                </Link>
              )}

              {user.userType === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Admin</span>
                </Link>
              )}

              {user.userType === 'staff' && (
                <Link
                  to="/staff-dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-2 py-1 mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Staff Dashboard</span>
                </Link>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-2 py-1 text-left mobile-menu-link w-full"
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
