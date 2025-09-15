import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaClock, FaUserMd, FaCheck } from 'react-icons/fa';

const Appointments = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(null);

  // Common time slots for selection
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    fetchUserAppointments();
  }, []);

  const fetchUserAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
      console.log('Appointments response:', response.data);
      setUserAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setUserAppointments([]);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    try {
      console.log('Fetching available slots for:', selectedDate, selectedTime);
      const response = await axios.post(`/api/slots/available`, { date: selectedDate, time: selectedTime });
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedTime]);

  const bookAppointment = async (practitioner) => {
    setBookingSlot(practitioner.practitioner_id);
    try {
      // First, get patient ID
      const patientResponse = await axios.get('/api/patients');
      const patient = patientResponse.data.find(p => p.user_id === user.userId);

      if (!patient) {
        toast.error('Patient profile not found. Please complete your profile first.');
        return;
      }

      // Create appointment with the selected practitioner
      const appointmentData = {
        practitionerId: practitioner.practitioner_id,
        appointmentDate: selectedDate,
        startTime: selectedTime + ':00', // Add seconds
        endTime: selectedTime.replace(/(\d{2}):(\d{2})/, (match, hours, minutes) => {
          const newHours = (parseInt(hours) + 1) % 24;
          return `${newHours.toString().padStart(2, '0')}:${minutes}:00`;
        }),
        serviceType: 'consultation',
        consultationType: 'in_person',
        specialInstructions: '',
        preparationNotes: ''
      };

      const response = await axios.post('/api/appointments', appointmentData);

      toast.success('Appointment booked successfully!');
      setAvailableSlots(prev => prev.filter(p => p.practitioner_id !== practitioner.practitioner_id));
      fetchUserAppointments();

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setBookingSlot(null);
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-app">Appointments</h1>
        <p className="text-muted mt-2">Book appointments with practitioners and manage your schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book New Appointment */}
        <div className="surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600" />
            Book New Appointment
          </h2>

          <div className="space-y-4">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-app"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Select Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-app"
              >
                <option value="">Choose a time...</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
            </div>

            {/* Available Doctors */}
            {selectedDate && selectedTime && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FaClock className="mr-2 text-green-600" />
                  Available Doctors for {new Date(selectedDate).toLocaleDateString()} at {formatTime(selectedTime)}
                </h3>
                {loading ? (
                  <div className="text-center py-4">Loading available doctors...</div>
                ) : availableSlots.length > 0 ? (
                  <div className="space-y-2">
                    {availableSlots.map((practitioner) => (
                      <button
                        key={practitioner.practitioner_id}
                        onClick={() => bookAppointment(practitioner)}
                        disabled={bookingSlot === practitioner.practitioner_id}
                        className="w-full p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-green-800">
                              Dr. {practitioner.first_name} {practitioner.last_name}
                            </p>
                            <p className="text-sm text-green-600">
                              {(() => {
                                try {
                                  const specs = typeof practitioner.specializations === 'string' 
                                    ? JSON.parse(practitioner.specializations) 
                                    : practitioner.specializations;
                                  return specs && specs.length > 0 ? specs.join(', ') : 'General Practitioner';
                                } catch {
                                  return 'General Practitioner';
                                }
                              })()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-800">
                              {bookingSlot === practitioner.practitioner_id ? 'Booking...' : 'Book Now'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">No doctors available for this date and time</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* My Appointments */}
        <div className="surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaUserMd className="mr-2 text-purple-600" />
            My Appointments
          </h2>

          {userAppointments.length > 0 ? (
            <div className="space-y-3">
                {userAppointments.map((appointment) => (
                  <div key={appointment.appointment_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="font-medium text-app">
                          Dr. {appointment.provider_first_name} {appointment.provider_last_name}
                        </p>
                        <p className="text-sm text-muted">
                          {new Date(appointment.appointment_date).toLocaleDateString()} at {formatTime(appointment.start_time)}
                        </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                    <p className="text-sm text-muted">
                      Service: {appointment.service_type}
                    </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No appointments found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
