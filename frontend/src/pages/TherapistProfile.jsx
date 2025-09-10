import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const TherapistProfile = () => {
  const [workingDays, setWorkingDays] = useState([
    { day: 'Monday', isWorking: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', isWorking: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', isWorking: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', isWorking: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', isWorking: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', isWorking: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Sunday', isWorking: false, startTime: '09:00', endTime: '17:00' },
  ]);
  const [appointments, setAppointments] = useState([]);
  const [workingHoursEvents, setWorkingHoursEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingDuration, setWorkingDuration] = useState({
    start: new Date(),
    end: new Date()
  });

  const [busySlots, setBusySlots] = useState([]);
  const [leaveDays, setLeaveDays] = useState([]);
  const [therapistId, setTherapistId] = useState(null);

  useEffect(() => {
    fetchProfile();
    const fetchLeaveDays = async () => {
      try {
        const response = await axios.get("/api/therapists/leave-days");
        setLeaveDays(response.data.leaveDays);
      } catch (error) {
        console.error("Error fetching leave days:", error);
      }
    };
    fetchLeaveDays();
  }, []);

  // Regenerate working hours events when busy slots, appointments, or leave days change
  useEffect(() => {
    if (!loading) {
      try {
        generateWorkingHoursEvents(busySlots, appointments, leaveDays);
      } catch (error) {
        console.error('Error generating working hours events:', error);
        // Still try to generate with default data
        try {
          generateWorkingHoursEvents([], [], []);
        } catch (fallbackError) {
          console.error('Fallback working hours generation also failed:', fallbackError);
        }
      }
    }
  }, [busySlots, appointments, leaveDays, loading]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/therapists/profile');
      const profile = response.data;

      if (profile.working_hours) {
        setWorkingDays(profile.working_hours);
      }

      setWorkingDuration({
        start: timeStringToDate(profile.start_time || '09:00:00'),
        end: timeStringToDate(profile.end_time || '17:00:00')
      });

      // Fetch busy slots
      if (profile.therapist_id) {
        setTherapistId(profile.therapist_id);
        await fetchBusySlots(profile.therapist_id);
      }

      // Fetch appointments
      const appointmentsResponse = await axios.get('/api/appointments');
      const appointmentsData = appointmentsResponse.data;
      // Convert appointments to calendar events format
      const calendarEvents = appointmentsData.map(appointment => {
        const dateStr = appointment.appointment_date.split('T')[0];
        return {
          id: appointment.appointment_id,
          title: `${appointment.patient_first_name} ${appointment.patient_last_name} - ${appointment.treatment_type || 'Appointment'}`,
          start: new Date(`${dateStr}T${appointment.start_time}`),
          end: new Date(`${dateStr}T${appointment.end_time}`),
          resource: appointment,
          type: 'appointment'
        }
      });

      setAppointments(calendarEvents);

      // Generate working hours events
      try {
        generateWorkingHoursEvents(busySlots, calendarEvents, leaveDays);
      } catch (error) {
        console.error('Error generating working hours events:', error);
        // Still try to generate with default data
        try {
          generateWorkingHoursEvents([], [], []);
        } catch (fallbackError) {
          console.error('Fallback working hours generation also failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusySlots = async (id) => {
    try {
      const response = await axios.get(`/api/slots/busy/${id}`);
      setBusySlots(response.data);
    } catch (error) {
      console.error('Error fetching busy slots:', error);
    }
  };

  const timeStringToDate = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  };

  const generateWorkingHoursEvents = (busySlots, appointments, leaveDays) => {
    const events = [];
    const today = new Date();

    // Generate leave day events
    const leaveDayEvents = [];
    leaveDays.forEach(dayName => {
      for (let week = 0; week < 4; week++) {
        const eventDate = new Date(today);
        const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayName.toLowerCase());

        if (dayIndex !== -1) {
          const daysToAdd = ((dayIndex - today.getDay() + 7) % 7) + (week * 7);
          eventDate.setDate(today.getDate() + daysToAdd);

          // Only generate for future dates or today
          if (eventDate >= new Date(today.toDateString())) {
            leaveDayEvents.push({
              id: `leave-${dayName}-${week}-${eventDate.getTime()}`,
              title: `Leave Day (${dayName})`,
              start: new Date(eventDate.setHours(0, 0, 0, 0)),
              end: new Date(eventDate.setHours(23, 59, 59, 999)),
              type: 'leave-day',
              resource: { day: dayName, date: eventDate.toISOString().split('T')[0] }
            });
          }
        }
      }
    });

    // Generate busy slot events from busy slots data
    const busySlotEvents = busySlots.map(slot => ({
      id: `busy-${slot.date}-${slot.start_time}`,
      title: 'Busy',
      start: new Date(`${slot.date}T${slot.start_time}`),
      end: new Date(`${slot.date}T${slot.end_time}`),
      type: 'busy-slot',
      resource: slot
    }));

    // Generate busy slot events from appointments
    const appointmentSlots = appointments.map(appointment => ({
      date: appointment.start.toISOString().split('T')[0],
      start_time: appointment.start.toTimeString().slice(0, 5),
      end_time: appointment.end.toTimeString().slice(0, 5)
    }));

    // Convert leave days to busy slot format (full day leave for each occurrence of the day)
    const leaveSlots = [];
    leaveDays.forEach(dayName => {
      // Generate leave slots for the next 4 weeks for this day
      for (let week = 0; week < 4; week++) {
        const eventDate = new Date(today);
        const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayName.toLowerCase());

        if (dayIndex !== -1) {
          const daysToAdd = ((dayIndex - today.getDay() + 7) % 7) + (week * 7);
          eventDate.setDate(today.getDate() + daysToAdd);

          // Only generate for future dates or today
          if (eventDate >= new Date(today.toDateString())) {
            const dateString = eventDate.toISOString().split('T')[0];
            leaveSlots.push({
              date: dateString,
              start_time: '00:00:00',
              end_time: '23:59:59',
              slot_id: `leave-${dayName}-${week}-${dateString}`,
              status: 'leave'
            });
          }
        }
      }
    });

    const allBusySlots = [...busySlots, ...appointmentSlots, ...leaveSlots];

    // Group all busy slots by date
    const busySlotsByDate = {};
    allBusySlots.forEach(slot => {
      if (!busySlotsByDate[slot.date]) {
        busySlotsByDate[slot.date] = [];
      }
      busySlotsByDate[slot.date].push(slot);
    });

    // Generate working hours for the current week and next 3 weeks
    for (let week = 0; week < 4; week++) {
      // For each day of the week
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const eventDate = new Date(today);
        const daysToAdd = ((dayIndex - today.getDay() + 7) % 7) + (week * 7);
        eventDate.setDate(today.getDate() + daysToAdd);

        // Only generate events for future dates or today
        if (eventDate >= new Date(today.toDateString())) {
          const dateString = eventDate.toISOString().split('T')[0];
          const dayBusySlots = (busySlotsByDate[dateString] || []).sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
          );

          // Generate available slots based on gaps in busy slots
          const availableSlots = [];

          // Define working hours for this day (using therapist's configured times)
          const workingStart = new Date(eventDate);
          workingStart.setHours(workingDuration.start.getHours(), workingDuration.start.getMinutes(), 0, 0);

          const workingEnd = new Date(eventDate);
          workingEnd.setHours(workingDuration.end.getHours(), workingDuration.end.getMinutes(), 0, 0);

          // If no busy slots for this day, mark entire working day as available
          if (dayBusySlots.length === 0) {
            availableSlots.push({
              start: workingStart,
              end: workingEnd
            });
          } else {
            // Find gaps between busy slots within working hours
            let currentTime = new Date(workingStart);

            dayBusySlots.forEach(busySlot => {
              const busyStart = new Date(`${dateString}T${busySlot.start_time}`);
              const busyEnd = new Date(`${dateString}T${busySlot.end_time}`);

              // If there's a gap before this busy slot, add it as available
              if (currentTime < busyStart) {
                availableSlots.push({
                  start: new Date(currentTime),
                  end: new Date(busyStart)
                });
              }

              // Move current time to end of busy slot
              if (busyEnd > currentTime) {
                currentTime = new Date(busyEnd);
              }
            });

            // If there's time left after the last busy slot, add it as available
            if (currentTime < workingEnd) {
              availableSlots.push({
                start: new Date(currentTime),
                end: new Date(workingEnd)
              });
            }
          }

          // Add available slots as events
          availableSlots.forEach((slot, index) => {
            const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
            events.push({
              id: `available-${dateString}-${index}`,
              title: `Available (${dayName})`,
              start: slot.start,
              end: slot.end,
              type: 'working-hours',
              resource: { day: dayName, date: dateString }
            });
          });
        }
      }
    }

    setWorkingHoursEvents([...events, ...busySlotEvents, ...leaveDayEvents]);
  };

  const handleDayToggle = (index) => {
    setWorkingDays(prev => prev.map((day, i) =>
      i === index ? { ...day, isWorking: !day.isWorking } : day
    ));
  };

  const handleTimeChange = (index, field, value) => {
    setWorkingDays(prev => prev.map((day, i) =>
      i === index ? { ...day, [field]: value } : day
    ));
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/therapists/profile', {
        workingHours: workingDays
      });
      toast.success('Working days saved successfully!');

      // Regenerate working hours events after saving
      generateWorkingHoursEvents(busySlots, appointments, leaveDays);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save working days');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Therapist Profile</h1>

      {/* Working Days Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Working Days & Hours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {workingDays.map((day, index) => (
            <div key={day.day} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={day.isWorking}
                onChange={() => handleDayToggle(index)}
                className="rounded"
              />
              <span className="w-20">{day.day}</span>
              {day.isWorking && (
                <>
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Working Days
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Calendar</h2>
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={workingHoursEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            popup
            selectable
            onSelectEvent={(event) => {
              if (event.type === 'appointment') {
                toast.info(`Appointment: ${event.title}`);
              } else if (event.type === 'working-hours') {
                toast.info(`Available: ${event.resource.day} - ${moment(event.start).format('HH:mm')} to ${moment(event.end).format('HH:mm')}`);
              } else if (event.type === 'busy-slot') {
                toast.info(`Busy: ${moment(event.start).format('HH:mm')} to ${moment(event.end).format('HH:mm')}`);
              } else if (event.type === 'leave-day') {
                toast.info(`Leave Day: ${moment(event.start).format('YYYY-MM-DD')}`);
              }
            }}
            eventPropGetter={(event) => {
              if (event.type === 'working-hours') {
                return {
                  style: {
                    backgroundColor: '#10B981',
                    borderRadius: '4px',
                    opacity: 0.3,
                    color: '#065F46',
                    border: '1px solid #10B981',
                    display: 'block',
                    fontSize: '12px'
                  }
                };
              } else if (event.type === 'busy-slot') {
                return {
                  style: {
                    backgroundColor: '#EF4444',
                    borderRadius: '4px',
                    opacity: 0.8,
                    color: 'white',
                    border: '1px solid #DC2626',
                    display: 'block',
                    fontSize: '12px'
                  }
                };
              } else if (event.type === 'leave-day') {
                return {
                  style: {
                    backgroundColor: '#F59E0B',
                    borderRadius: '4px',
                    opacity: 0.9,
                    color: 'white',
                    border: '1px solid #D97706',
                    display: 'block',
                    fontSize: '12px'
                  }
                };
              } else {
                // Appointment styling
                return {
                  style: {
                    backgroundColor: '#3B82F6',
                    borderRadius: '4px',
                    opacity: 0.9,
                    color: 'white',
                    border: '0px',
                    display: 'block'
                  }
                };
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TherapistProfile;
