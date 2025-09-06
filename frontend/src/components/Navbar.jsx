import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, FileText, Settings, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Panchakarma
            </Link>
            <div className="space-x-4">
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

          <div className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
            >
              <User size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/appointments"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
            >
              <Calendar size={18} />
              <span>Appointments</span>
            </Link>

            <Link
              to="/treatment-plans"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
            >
              <FileText size={18} />
              <span>Treatments</span>
            </Link>

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
      </div>
    </nav>
  );
};

export default Navbar;
