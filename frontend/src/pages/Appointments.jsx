import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaClock, FaUserMd, FaCheck } from 'react-icons/fa';

const Appointments = () => {
  const { user } = useAuth();
  const [practitioners, setPractitioners] = useState([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(null);

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  useEffect(() => {
    fetchPractitioners();
    fetchUserAppointments();
  }, []);

  const fetchPractitioners = async () => {
    try {
      const response = await axios.get('/api/practitioners');
      console.log('Practitioners response:', response.data);
      setPractitioners(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      toast.error('Failed to load practitioners');
      setPractitioners([]);
    }
  };

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
    if (!selectedPractitioner || !selectedDate) return;

    setLoading(true);
    try {
      // Get the day of the week from the selected date
      const date = new Date(selectedDate);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      const response = await axios.get(`/api/slots/${selectedPractitioner}?day=${dayOfWeek}&status=free`);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPractitioner && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedPractitioner, selectedDate]);

  const bookAppointment = async (slot) => {
    setBookingSlot(slot.slot_id);
    try {
      // First, get patient ID
      const patientResponse = await axios.get('/api/patients');
      const patient = patientResponse.data.find(p => p.user_id === user.userId);

      if (!patient) {
        toast.error('Patient profile not found. Please complete your profile first.');
        return;
      }

      // Create appointment
      const appointmentData = {
        practitionerId: selectedPractitioner,
        appointmentDate: selectedDate,
        startTime: slot.start_time,
        endTime: slot.end_time,
        serviceType: 'consultation',
        consultationType: 'in_person',
        specialInstructions: '',
        preparationNotes: ''
      };

      const response = await axios.post('/api/appointments', appointmentData);

      // Update slot status to booked
      await axios.put(`/api/slots/${slot.slot_id}`, { status: 'booked' });

      toast.success('Appointment booked successfully!');
      setAvailableSlots(prev => prev.filter(s => s.slot_id !== slot.slot_id));
      fetchUserAppointments(); // Refresh appointments list

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
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600 mt-2">Book appointments with practitioners and manage your schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book New Appointment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600" />
            Book New Appointment
          </h2>

          <div className="space-y-4">
            {/* Practitioner Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Practitioner
              </label>
              <select
                value={selectedPractitioner}
                onChange={(e) => setSelectedPractitioner(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a practitioner...</option>
                {practitioners.map((practitioner) => (
                  <option key={practitioner.practitioner_id} value={practitioner.practitioner_id}>
                    Dr. {practitioner.first_name} {practitioner.last_name} - {practitioner.specializations ? (practitioner.specializations).join(', ') : 'General'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Generate Slots Button - Only for admin/practitioner */}
            {selectedPractitioner && (user?.userType === 'admin' || user?.userType === 'practitioner') && (
              <div className="mt-4">
                <button
                  onClick={async () => {
                    try {
                      await axios.post(`/api/slots/generate/${selectedPractitioner}`);
                      toast.success('Slots generated successfully!');
                      if (selectedDate) {
                        fetchAvailableSlots();
                      }
                    } catch (error) {
                      toast.error('Failed to generate slots');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Generate Slots for This Practitioner
                </button>
              </div>
            )}

            {/* Available Slots */}
            {selectedPractitioner && selectedDate && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FaClock className="mr-2 text-green-600" />
                  Available Slots for {new Date(selectedDate).toLocaleDateString()}
                </h3>
                {loading ? (
                  <div className="text-center py-4">Loading slots...</div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.slot_id}
                        onClick={() => bookAppointment(slot)}
                        disabled={bookingSlot === slot.slot_id}
                        className="p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md text-sm font-medium text-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingSlot === slot.slot_id ? 'Booking...' : `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No available slots for this date</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* My Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
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
                      <p className="font-medium text-gray-900">
                        Dr. {appointment.practitioner_first_name} {appointment.practitioner_last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.appointment_date} at {formatTime(appointment.start_time)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
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
