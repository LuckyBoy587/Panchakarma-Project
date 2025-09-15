import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, Clock, User, Activity, CheckCircle, XCircle, AlertCircle, Clock as PendingIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const TreatmentPlans = () => {
  const { user, userType } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [therapies, setTherapies] = useState([]);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [treatmentSessions, setTreatmentSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    therapyId: '',
    startDate: '',
    numSessions: '',
    frequency: ''
  });

  useEffect(() => {
    if (userType === 'patient') {
      fetchPatientTreatmentSessions();
    } else if (userType === 'staff') {
      fetchStaffTreatmentSessions();
    } else {
      fetchPatients();
      fetchTherapies();
      fetchTreatmentPlans();
    }
  }, [userType]);

  const fetchPatientTreatmentSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/treatment-plans/sessions/patient');
      setTreatmentSessions(response.data);
    } catch (error) {
      console.error('Error fetching treatment sessions:', error);
      setError('Failed to load treatment sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffTreatmentSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/treatment-plans/sessions/staff');
      setTreatmentSessions(response.data);
    } catch (error) {
      console.error('Error fetching staff treatment sessions:', error);
      setError('Failed to load treatment sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments');
      // Get unique patients from appointments
      const uniquePatients = response.data.reduce((acc, appointment) => {
        const patientKey = appointment.patient_id;
        if (!acc.some(p => p.patient_id === patientKey)) {
          acc.push({
            patient_id: appointment.patient_id,
            first_name: appointment.patient_first_name,
            last_name: appointment.patient_last_name,
            appointment_date: appointment.appointment_date,
            start_time: appointment.start_time,
            status: appointment.status,
            service_type: appointment.service_type
          });
        }
        return acc;
      }, []);
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchTherapies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/therapies');
      setTherapies(response.data);
    } catch (error) {
      console.error('Error fetching therapies:', error);
    }
  };

  const fetchTreatmentPlans = async () => {
    try {
      const response = await axios.get('/api/treatment-plans');
      setTreatmentPlans(response.data);
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'scheduled':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'completed':
        return 'bg-slate-50 border-slate-200 text-slate-800';
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-amber-50 border-amber-200 text-amber-800';
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'consultation':
        return <User className="h-5 w-5" />;
      case 'treatment':
        return <Activity className="h-5 w-5" />;
      case 'follow_up':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const handleAssignPlan = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Treatment Plan:', {
      patientId: selectedPatient.patient_id,
      ...formData
    });
    axios.post('/api/scheduler/', {...formData, patientId: selectedPatient.patient_id })
      .then((response) => {
        toast.success(`Treatment plan created successfully! ${response.data.treatmentSessions?.length || 0} sessions scheduled in 30-minute slots.`);
        setShowModal(false);
        setFormData({ therapyId: '', startDate: '', numSessions: '', frequency: '' });
        // Refresh patients list to show updated data
        fetchPatients();
        fetchTreatmentPlans();
      })
      .catch((error) => {
        console.error('Error assigning treatment plan:', error);
        if (error.response && error.response.data && error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error('Failed to assign treatment plan');
        }
      });
  };

  const formatTimeToIST = (timeString) => {
    if (!timeString) return '';
    
    // Parse the time string (assuming format HH:MM or HH:MM:SS)
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    // Convert to 12-hour format
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(var(--primary))' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-app">Treatment Plans</h1>
          <p className="text-muted mt-2">View patients with appointments</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (userType === 'patient') {
    // Patient View - Show their treatment sessions
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-app">My Treatment Sessions</h1>
          <p className="text-muted mt-2">View your scheduled treatment sessions</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : treatmentSessions.length === 0 ? (
          <div className="surface rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Calendar className="h-16 w-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg">No treatment sessions found.</p>
            <p className="text-muted text-sm mt-2">Your treatment sessions will appear here once scheduled.</p>
          </div>
        ) : (
          <div className="surface rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-semibold text-app flex items-center">
                <Activity className="h-6 w-6 mr-3 text-blue-600" />
                Treatment Sessions
              </h2>
              <p className="text-muted mt-1">Your upcoming and completed treatment sessions</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {treatmentSessions.map((session) => (
                  <div key={session.session_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-app">{session.treatment_name}</h3>
                        <p className="text-sm text-muted">Session #{session.session_number}</p>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(session.session_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      {session.start_time && session.end_time && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatTimeToIST(session.start_time)} - {formatTimeToIST(session.end_time)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>Therapist: {session.therapist_first_name} {session.therapist_last_name}</span>
                      </div>
                      
                      {session.practitioner_first_name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>Practitioner: {session.practitioner_first_name} {session.practitioner_last_name}</span>
                        </div>
                      )}
                    </div>
                    
                    {session.procedures_performed && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Procedures:</p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const procedures = JSON.parse(session.procedures_performed);
                              return procedures.map((procedure, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {procedure}
                                </span>
                              ));
                            } catch (e) {
                              return (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {session.procedures_performed}
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {session.patient_response && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Your Response:</p>
                        <p className="text-sm text-gray-600 mt-1">{session.patient_response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (userType === 'staff') {
    // Staff View - Show their assigned treatment sessions
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Treatment Sessions</h1>
          <p className="text-gray-600 mt-2">View your assigned treatment sessions</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : treatmentSessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No treatment sessions assigned.</p>
            <p className="text-gray-400 text-sm mt-2">Your assigned treatment sessions will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="h-6 w-6 mr-3 text-blue-600" />
                Assigned Treatment Sessions
              </h2>
              <p className="text-gray-600 mt-1">Your scheduled treatment sessions with required items</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {treatmentSessions.map((session) => (
                  <div key={session.session_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{session.treatment_name}</h3>
                        <p className="text-sm text-muted">Session #{session.session_number} - Patient: {session.patient_first_name} {session.patient_last_name}</p>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(session.session_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      {session.start_time && session.end_time && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatTimeToIST(session.start_time)} - {formatTimeToIST(session.end_time)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>Therapist: {session.therapist_first_name} {session.therapist_last_name}</span>
                      </div>
                      
                      {session.practitioner_first_name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>Practitioner: {session.practitioner_first_name} {session.practitioner_last_name}</span>
                        </div>
                      )}
                    </div>
                    
                    {session.procedures_performed && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Required Procedures:</p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const procedures = JSON.parse(session.procedures_performed);
                              return procedures.map((procedure, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {procedure}
                                </span>
                              ));
                            } catch (e) {
                              return (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {session.procedures_performed}
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {session.oils_medicines_used && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Required Items/Medicines:</p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const items = JSON.parse(session.oils_medicines_used);
                              return items.map((item, index) => (
                                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {item}
                                </span>
                              ));
                            } catch (e) {
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {session.therapist_notes && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Therapist Notes:</p>
                        <p className="text-sm text-gray-600 mt-1">{session.therapist_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Practitioner/Staff/Admin View - Show patients and assign treatments
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{userType === 'staff' ? 'My Treatment Sessions' : 'My Patients'}</h1>
            <p className="text-blue-100 mt-2">
              {userType === 'staff' 
                ? 'View your assigned treatment sessions with required items' 
                : 'Manage your scheduled appointments and patient care'
              }
            </p>
          </div>
          <div className="hidden md:block">
            <Calendar className="h-16 w-16 text-blue-200 opacity-80" />
          </div>
        </div>
  {userType !== 'staff' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-200" />
                <div className="ml-3">
                  <p className="text-blue-100 text-sm">Total Patients</p>
                  <p className="text-2xl font-bold">{patients.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-emerald-300" />
                <div className="ml-3">
                  <p className="text-blue-100 text-sm">Confirmed</p>
                  <p className="text-2xl font-bold">
                    {patients.filter(p => p.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-amber-300" />
                <div className="ml-3">
                  <p className="text-blue-100 text-sm">Scheduled</p>
                  <p className="text-2xl font-bold">
                    {patients.filter(p => p.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patients List or Staff Sessions */}
  {userType === 'staff' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="h-6 w-6 mr-3 text-blue-600" />
              My Treatment Sessions
            </h2>
            <p className="text-gray-600 mt-1">Your assigned treatment sessions with required items</p>
          </div>
          <div className="p-6">
            {treatmentSessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No treatment sessions assigned.</p>
                <p className="text-gray-400 text-sm mt-2">Your assigned treatment sessions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {treatmentSessions.map((session) => (
                  <div key={session.session_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{session.treatment_name}</h3>
                        <p className="text-sm text-gray-600">Session #{session.session_number} - Patient: {session.patient_first_name} {session.patient_last_name}</p>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(session.session_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      {session.start_time && session.end_time && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatTimeToIST(session.start_time)} - {formatTimeToIST(session.end_time)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>Therapist: {session.therapist_first_name} {session.therapist_last_name}</span>
                      </div>
                      
                      {session.practitioner_first_name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>Practitioner: {session.practitioner_first_name} {session.practitioner_last_name}</span>
                        </div>
                      )}
                    </div>
                    
                    {session.procedures_performed && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Required Procedures:</p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const procedures = JSON.parse(session.procedures_performed);
                              return procedures.map((procedure, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {procedure}
                                </span>
                              ));
                            } catch (e) {
                              return (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {session.procedures_performed}
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {session.oils_medicines_used && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Required Items/Medicines:</p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const items = JSON.parse(session.oils_medicines_used);
                              return items.map((item, index) => (
                                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {item}
                                </span>
                              ));
                            } catch (e) {
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {session.therapist_notes && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Therapist Notes:</p>
                        <p className="text-sm text-gray-600 mt-1">{session.therapist_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="h-6 w-6 mr-3 text-blue-600" />
              Patient Appointments
            </h2>
            <p className="text-gray-600 mt-1">Your upcoming and recent patient sessions</p>
          </div>
          <div className="p-6">
            {patients.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No patients with appointments found.</p>
                <p className="text-gray-400 text-sm mt-2">New appointments will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-6">
                {patients.map((patient) => (
                  <div
                    key={patient.patient_id}
                    className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {patient.first_name[0]}{patient.last_name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {patient.first_name} {patient.last_name}
                            </h3>
                            <div className="flex items-center mt-2 space-x-4">
                              <div className="flex items-center text-gray-600">
                                {getServiceIcon(patient.service_type)}
                                <span className="ml-2 text-sm capitalize">{patient.service_type}</span>
                              </div>
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                                {getStatusIcon(patient.status)}
                                <span className="ml-1.5 capitalize">{patient.status}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <div className="bg-gray-50 rounded-lg p-4 min-w-[200px]">
                          <div className="flex items-center text-gray-600 mb-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              {new Date(patient.appointment_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">{formatTimeToIST(patient.start_time)}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          {treatmentPlans.some(plan => plan.patient_id === patient.patient_id) ? (
                            <span className="text-green-600 font-medium">Treatment Assigned</span>
                          ) : (
                            <button
                              onClick={() => handleAssignPlan(patient)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Assign Treatment Plan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">Assign Treatment Plan</h2>
            <p className="text-sm text-gray-600 mb-4">Sessions will be scheduled in 30-minute time slots during therapist working hours.</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Therapy</label>
                <select
                  value={formData.therapyId}
                  onChange={(e) => setFormData({...formData, therapyId: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Therapy</option>
                  {therapies.map(therapy => (
                    <option key={therapy.id} value={therapy.id}>{therapy.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Number of Sessions</label>
                <input
                  type="number"
                  value={formData.numSessions}
                  onChange={(e) => setFormData({...formData, numSessions: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                  min="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlans;
