import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Users, FileText, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect staff users to staff dashboard
  if (user && user.userType === 'staff') {
    return <Navigate to="/staff-dashboard" replace />;
  }

  const [stats, setStats] = useState({
    appointments: 0,
    treatmentPlans: 0,
    patients: 0,
    practitioners: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch appointments
      const appointmentsResponse = await axios.get('/api/appointments');
      const appointments = appointmentsResponse.data;

      // Fetch treatment plans (only for non-therapist users)
      let treatmentPlans = [];
      if (user.userType !== 'therapist') {
        try {
          const treatmentPlansResponse = await axios.get('/api/treatment-plans');
          treatmentPlans = treatmentPlansResponse.data;
        } catch (error) {
          console.error('Error fetching treatment plans:', error);
          // Treatment plans access denied for therapists, which is expected
        }
      }

      // Set stats based on user role
      if (user.userType === 'patient') {
        setStats({
          appointments: appointments.length,
          treatmentPlans: treatmentPlans.length,
          patients: 0,
          practitioners: 0,
        });
      } else if (user.userType === 'practitioner') {
        // For practitioners, count their patients and appointments
        const uniquePatients = new Set(appointments.map(app => app.patient_id)).size;
        setStats({
          appointments: appointments.length,
          treatmentPlans: treatmentPlans.length,
          patients: uniquePatients,
          practitioners: 0,
        });
      } else if (user.userType === 'therapist') {
        // For therapists, count their patients and appointments (but no treatment plans)
        const uniquePatients = new Set(appointments.map(app => app.patient_id)).size;
        setStats({
          appointments: appointments.length,
          treatmentPlans: 0, // Therapists don't see treatment plans
          patients: uniquePatients,
          practitioners: 0,
        });
      } else if (user.userType === 'admin') {
        // For admin, fetch all data
        const patientsResponse = await axios.get('/api/patients');
        const practitionersResponse = await axios.get('/api/practitioners');

        setStats({
          appointments: appointments.length,
          treatmentPlans: treatmentPlans.length,
          patients: patientsResponse.data.length,
          practitioners: practitionersResponse.data.length,
        });
      }

      // Set recent appointments (last 5)
      setRecentAppointments(appointments.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {console.log('Appointments:', recentAppointments)}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your {user.userType} dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stats-grid">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.appointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Treatment Plans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.treatmentPlans}</p>
            </div>
          </div>
        </div>

        {user.userType === 'admin' && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.patients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Practitioners</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.practitioners}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {user.userType === 'practitioner' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.patients}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Appointments</h2>
        </div>
        <div className="p-6">
          {recentAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No appointments found</p>
          ) : (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.appointment_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.userType === 'patient'
                          ? `${appointment.provider_first_name} ${appointment.provider_last_name}`
                          : `${appointment.patient_first_name} ${appointment.patient_last_name}`
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.start_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
