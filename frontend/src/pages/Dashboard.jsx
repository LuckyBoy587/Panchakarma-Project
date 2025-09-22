import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api';
import { Calendar, Users, FileText, TrendingUp, Clock, User } from 'lucide-react';

const Dashboard = () => {
  const { user, userType } = useAuth();

  // Redirect staff users to staff dashboard
  if (user && userType === 'staff') {
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
  const [treatmentSessions, setTreatmentSessions] = useState([]);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [userType]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch appointments
  const appointmentsResponse = await api.get('/api/appointments');
      const appointments = appointmentsResponse.data;

      // Fetch treatment plans (only for non-therapist users)
      let treatmentPlans = [];
      if (userType !== 'therapist') {
        try {
          const treatmentPlansResponse = await api.get('/api/treatment-plans');
          treatmentPlans = treatmentPlansResponse.data;
        } catch (error) {
          console.error('Error fetching treatment plans:', error);
          // Treatment plans access denied for therapists, which is expected
        }
      }

      // Fetch treatment sessions for patients
      if (userType === 'patient') {
        try {
          const sessionsResponse = await api.get('/api/treatment-plans/sessions/patient');
          setTreatmentSessions(sessionsResponse.data);
        } catch (error) {
          console.error('Error fetching treatment sessions:', error);
        }
      }

      // Set stats based on user role
      if (userType === 'patient') {
        setStats({
          appointments: appointments.length,
          treatmentPlans: treatmentPlans.length,
          patients: 0,
          practitioners: 0,
        });
      } else if (userType === 'practitioner') {
        // For practitioners, count their patients and appointments
        const uniquePatients = new Set(appointments.map(app => app.patient_id)).size;
        setStats({
          appointments: appointments.length,
          treatmentPlans: treatmentPlans.length,
          patients: uniquePatients,
          practitioners: 0,
        });
      } else if (userType === 'therapist') {
        // For therapists, count their patients and appointments (but no treatment plans)
        const uniquePatients = new Set(appointments.map(app => app.patient_id)).size;
        setStats({
          appointments: appointments.length,
          treatmentPlans: 0, // Therapists don't see treatment plans
          patients: uniquePatients,
          practitioners: 0,
        });
      } else if (userType === 'admin') {
        // For admin, fetch all data
  const patientsResponse = await api.get('/api/patients');
  const practitionersResponse = await api.get('/api/practitioners');

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

  const handleTreatmentClick = () => {
    if (userType === 'patient') {
      setShowTreatmentModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(var(--primary))' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {console.log('Appointments:', recentAppointments)}
      <div>
<h1 className="text-2xl sm:text-3xl font-bold text-app">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-muted mt-2">
          Here's an overview of your {userType} dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stats-grid">
        <div className="surface rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Appointments</p>
              <p className="text-2xl font-bold text-app">{stats.appointments}</p>
            </div>
          </div>
        </div>

        <div 
          className={`surface rounded-lg shadow p-6 ${userType === 'patient' ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} 
          onClick={userType === 'patient' ? handleTreatmentClick : undefined}
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Treatment Plans</p>
              <p className="text-2xl font-bold text-app">{stats.treatmentPlans}</p>
            </div>
          </div>
        </div>

        {userType === 'admin' && (
          <>
            <div className="surface rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted">Patients</p>
                  <p className="text-2xl font-bold text-app">{stats.patients}</p>
                </div>
              </div>
            </div>

            <div className="surface rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted">Practitioners</p>
                  <p className="text-2xl font-bold text-app">{stats.practitioners}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {userType === 'practitioner' && (
          <div className="surface rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted">My Patients</p>
                <p className="text-2xl font-bold text-app">{stats.patients}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Appointments */}
      <div className="surface rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-app">Recent Appointments</h2>
        </div>
        <div className="p-6">
          {recentAppointments.length === 0 ? (
            <p className="text-muted text-center py-4">No appointments found</p>
          ) : (
<div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.appointment_id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-app">
                          {userType === 'patient'
                            ? `${appointment.provider_first_name} ${appointment.provider_last_name}`
                            : `${appointment.patient_first_name} ${appointment.patient_last_name}`
                          }
                        </p>
                        <p className="text-sm text-muted">
                          {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.start_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center sm:justify-end">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Treatment Sessions Modal */}
      {showTreatmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Treatment Sessions</h2>
              <button
                onClick={() => setShowTreatmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {treatmentSessions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No treatment sessions found.</p>
                <p className="text-gray-400 text-sm mt-2">Your treatment sessions will appear here once scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {treatmentSessions.map((session) => (
                  <div key={session.session_id} className="flex flex-col md:flex-row md:items-center justify-between border border-gray-200 rounded-lg p-4 hover:shadow transition-shadow bg-white">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{session.treatment_name}</h3>
                          <p className="text-sm text-gray-600">Session #{session.session_number}</p>
                        </div>
                        <div className="hidden md:flex md:flex-col md:items-end md:ml-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>{session.status}</span>
                          {session.start_time && session.end_time && (
                            <span className="text-xs text-gray-500 mt-2">{session.start_time} - {session.end_time}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>Therapist: {session.therapist_first_name} {session.therapist_last_name}</span>
                        </div>
                        {session.practitioner_first_name && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>Practitioner: {session.practitioner_first_name} {session.practitioner_last_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 md:mt-0 md:ml-4 flex-shrink-0 md:w-48 flex flex-col items-start md:items-end">
                      <div className="md:hidden mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>{session.status}</span>
                      </div>
                      {session.start_time && session.end_time && (
                        <div className="text-sm text-gray-500">{session.start_time} - {session.end_time}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
