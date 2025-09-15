import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const PractitionerProfile = () => {
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
  const [practitionerId, setPractitionerId] = useState(null);

  useEffect(() => {
    fetchProfile();
    const fetchLeaveDays = async () => {
      try {
        const response = await axios.get("/api/practitioners/leave-days");
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
        console.error('Error regenerating working hours events:', error);
      }
    }
  }, [busySlots, appointments, leaveDays, loading]);

  const timeStringToDate = (timeStr) => {
    const [h, m, s] = timeStr.split(":").map(Number);

    const time = new Date();
    time.setHours(h, m, s, 0);
    return time;
  };

  const fetchBusySlots = async (pracId) => {
    try {
      const response = await axios.post(`/api/slots/busy/${pracId}`);
      const busySlotsData = response.data;

      // Convert busy slots to calendar events
      const busyEvents = busySlotsData.map(slot => ({
        id: `busy-${slot.slot_id}`,
        title: 'Busy',
        start: new Date(`${slot.date}T${slot.start_time}`),
        end: new Date(`${slot.date}T${slot.end_time}`),
        type: 'busy-slot',
        resource: slot
      }));

      setBusySlots(busyEvents);
      console.log('Fetched busy slots:', busySlotsData.length);
    } catch (error) {
      console.error('Error fetching busy slots:', error);
      toast.error('Failed to load busy slots');
    }
  };

  const fetchProfile = async () => {
    try {
      // Fetch profile data
      const profileResponse = await axios.get('/api/practitioners/profile');
      const profile = profileResponse.data;
      console.log('Fetched profile:', profile);
      console.log('Working hours data:', profile.working_hours);

      // Set practitioner ID
      setPractitionerId(profile.practitioner_id);

      if (profile.working_hours) {
        setWorkingDays(profile.working_hours);
      }

      setWorkingDuration({
        start: timeStringToDate(profile.start_time || '09:00:00'),
        end: timeStringToDate(profile.end_time || '17:00:00')
      });

      // Fetch busy slots
      if (profile.practitioner_id) {
        await fetchBusySlots(profile.practitioner_id);
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

  const generateWorkingHoursEvents = (busySlotsEvents = [], appointmentsData = [], leaveDaysData = []) => {
    const events = [];
    const today = new Date();

    // Extract raw slot data from busy slots events
    const busySlotsData = busySlotsEvents.map(event => event.resource).filter(slot => slot);

    // Convert appointments to busy slot format
    const appointmentSlots = appointmentsData.map(appointment => ({
      date: appointment.resource.appointment_date.split('T')[0],
      start_time: appointment.resource.start_time,
      end_time: appointment.resource.end_time,
      slot_id: `appointment-${appointment.appointment_id}`,
      status: 'booked'
    }));

    console.log("Appointment slots:", appointmentSlots);
    appointmentsData.forEach(slot => {
      console.log(`Appointment - Date: ${slot.resource.appointment_date}, Start: ${slot.resource.start_time}, End: ${slot.resource.end_time}`);
    });

    // Convert leave days to busy slot format (full day leave for each occurrence of the day)
    const leaveSlots = [];
    leaveDaysData.forEach(dayName => {
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

    // Combine busy slots, appointments, and leave days
    const allBusySlots = [...busySlotsData, ...appointmentSlots, ...leaveSlots];

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

          // Define working hours for this day (using practitioner's configured times)
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

              // Move current time to end of this busy slot
              currentTime = busyEnd > currentTime ? busyEnd : currentTime;
            });

            // Add remaining time after last busy slot if within working hours
            if (currentTime < workingEnd) {
              availableSlots.push({
                start: new Date(currentTime),
                end: new Date(workingEnd)
              });
            }
          }

          // Filter out slots that are outside working hours or too short
          const validAvailableSlots = availableSlots.filter(slot =>
            slot.start >= workingStart &&
            slot.end <= workingEnd &&
            (slot.end - slot.start) >= 30 * 60 * 1000 // At least 30 minutes
          );

          // Create events for available slots
          validAvailableSlots.forEach((slot, index) => {
            events.push({
              id: `available-${week}-${dayIndex}-${index}-${eventDate.getTime()}`,
              title: 'Available',
              start: slot.start,
              end: slot.end,
              type: 'working-hours',
              resource: {
                day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex],
                isWorking: true
              }
            });
          });
        }
      }
    }

    // Create leave day events for each occurrence of leave days
    const leaveDayEvents = [];
    leaveDaysData.forEach(dayName => {
      // Generate leave day events for the next 4 weeks for this day
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

    setWorkingHoursEvents([...events, ...leaveDayEvents]);
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
      await axios.put('/api/practitioners/profile', {
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-app">Practitioner Profile</h1>
          <p className="text-muted mt-2">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-app">Practitioner Profile</h1>
        <p className="text-muted mt-2">Manage your professional information and availability</p>
      </div>

      {/* Appointments Calendar */}
      <div className="surface rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-app mb-4">Appointments Calendar</h2>
        <p className="text-muted mb-6">View your scheduled appointments and availability</p>

        {/* Calendar Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-muted">Appointments</span>
          </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded opacity-30 border border-green-500"></div>
              <span className="text-sm text-muted">Available Hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-muted">Busy Slots</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-muted">Leave Days</span>
            </div>
        </div>

        <div className="calendar-container" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={[...appointments, ...workingHoursEvents, ...busySlots]}
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

export default PractitionerProfile;
