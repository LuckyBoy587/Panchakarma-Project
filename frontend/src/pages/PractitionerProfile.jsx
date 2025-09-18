import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PatientViewModal from '../components/PatientViewModal';
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardData, setOnboardData] = useState({
    licenseNumber: '',
    qualification: '',
    specializations: '', // comma-separated input
    experienceYears: '',
    languagesSpoken: '', // comma-separated input
    consultationFee: '',
    clinicAffiliation: '',
    practiceStartDate: '',
    bio: '',
    startTime: '09:30:00',
    endTime: '17:30:00',
    leaveDays: '', // comma-separated
    consultationDuration: '',
    maxPatientsPerDay: '',
    emergencyAvailability: 0,
  });
  const [verificationFiles, setVerificationFiles] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editFiles, setEditFiles] = useState([]);
  const [workingDuration, setWorkingDuration] = useState({
    start: new Date(),
    end: new Date()
  });

  const [busySlots, setBusySlots] = useState([]);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [modalPatient, setModalPatient] = useState(null);
  const [leaveDays, setLeaveDays] = useState([]);
  const [practitionerId, setPractitionerId] = useState(null);

  const navigate = useNavigate();

  // Helper: safely parse stored array-like fields which may be JSON, CSV, or already arrays
  const safeParseArray = (val) => {
    if (val === null || val === undefined) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const s = val.trim();
      if (!s) return [];
      // If it's JSON-like, try parsing
      if (s.startsWith('[') || s.startsWith('{')) {
        try {
          const parsed = JSON.parse(s);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // fall through to CSV parsing
        }
      }
      // Fallback: comma-separated values
      return s.split(',').map(x => x.trim()).filter(x => x.length > 0);
    }
    // Other types: wrap in array
    return [val];
  };

  // Edit profile handlers (top-level so they're defined for rendering)
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleEditFilesChange = (e) => {
    setEditFiles(Array.from(e.target.files));
  };

  const submitEdit = async () => {
    try {
      // Upload new files if any
      const uploadedFileNames = [];
      for (const file of editFiles) {
        const form = new FormData();
        form.append('file', file);
        const res = await axios.post('/api/uploads', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedFileNames.push(res.data.filename || res.data.filePath || file.name);
      }
      // Merge old and new files
      const allFiles = [...(editData.verificationDocuments || []), ...uploadedFileNames];
      const payload = {
        licenseNumber: editData.licenseNumber,
        qualification: editData.qualification,
        specializations: editData.specializations ? editData.specializations.split(',').map(s => s.trim()) : [],
        experienceYears: Number(editData.experienceYears) || 0,
        languagesSpoken: editData.languagesSpoken ? editData.languagesSpoken.split(',').map(s => s.trim()) : [],
        consultationFee: Number(editData.consultationFee) || 0,
        clinicAffiliation: editData.clinicAffiliation || null,
        practiceStartDate: editData.practiceStartDate || null,
        bio: editData.bio || null,
        verificationDocuments: allFiles,
        startTime: editData.startTime,
        endTime: editData.endTime,
        leaveDays: editData.leaveDays ? editData.leaveDays.split(',').map(s => s.trim()) : [],
        consultationDuration: Number(editData.consultationDuration) || null,
        maxPatientsPerDay: Number(editData.maxPatientsPerDay) || null,
        emergencyAvailability: editData.emergencyAvailability ? 1 : 0,
      };
      await axios.put('/api/practitioners/profile', payload);
      toast.success('Profile updated successfully');
      setShowEdit(false);
      setLoading(true);
      await fetchProfile();
    } catch (error) {
      console.error('Edit submit error:', error);
      const msg = error.response?.data?.error || 'Failed to update profile';
      toast.error(msg);
    }
  };

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
        start: moment(`${slot.date}T${slot.start_time}`).toDate(),
        end: moment(`${slot.date}T${slot.end_time}`).toDate(),
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

  const fetchAndOpenPatient = async (patientResource) => {
    // patientResource can be an id or an object with patient_id
    let patientId = null;
    if (!patientResource) {
      return;
    }
    if (typeof patientResource === 'number' || typeof patientResource === 'string') {
      patientId = patientResource;
    } else {
      patientId = patientResource.patient_id || patientResource.patientId || patientResource.patient_id;
    }

    setModalPatient(null);
    setPatientModalOpen(true);

    try {
      if (patientId) {
        const res = await axios.get(`/api/patients/${patientId}`);
        setModalPatient(res.data);
      } else {
        const mapped = {
          first_name: patientResource.patient_first_name || patientResource.first_name,
          last_name: patientResource.patient_last_name || patientResource.last_name,
          phone: patientResource.patient_phone || patientResource.phone,
          email: patientResource.patient_email || patientResource.email,
          address: patientResource.patient_address || patientResource.address,
          dob: patientResource.patient_dob || patientResource.dob,
          gender: patientResource.patient_gender || patientResource.gender,
          notes: patientResource.patient_notes || patientResource.notes,
        };
        setModalPatient(mapped);
      }
    } catch (err) {
      console.error('Failed to load patient details:', err);
      toast.error('Failed to load patient details');
      setModalPatient(null);
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

      // Prepare editData for edit form
      setEditData({
        licenseNumber: profile.license_number || '',
        qualification: profile.qualification || '',
        specializations: safeParseArray(profile.specializations).join(', '),
        experienceYears: profile.experience_years || '',
        languagesSpoken: safeParseArray(profile.languages_spoken).join(', '),
        consultationFee: profile.consultation_fee || '',
        clinicAffiliation: profile.clinic_affiliation || '',
        practiceStartDate: profile.practice_start_date ? profile.practice_start_date.slice(0, 10) : '',
        bio: profile.bio || '',
        startTime: profile.start_time || '09:30:00',
        endTime: profile.end_time || '17:30:00',
        leaveDays: safeParseArray(profile.leave_days).join(', '),
        consultationDuration: profile.consultation_duration || '',
        maxPatientsPerDay: profile.max_patients_per_day || '',
        emergencyAvailability: profile.emergency_availability ? 1 : 0,
        verificationDocuments: safeParseArray(profile.verification_documents),
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
        const dateStr = moment(appointment.appointment_date).format('YYYY-MM-DD');
        return {
          id: appointment.appointment_id,
          title: `${appointment.patient_first_name} ${appointment.patient_last_name} - ${appointment.treatment_type || 'Appointment'}`,
          start: moment(`${dateStr}T${appointment.start_time}`).toDate(),
          end: moment(`${dateStr}T${appointment.end_time}`).toDate(),
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
      // If profile not found, show onboarding form
      if (error.response && error.response.status === 404) {
        setShowOnboarding(true);
      } else {
        toast.error('Failed to load profile data');
      }
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
      date: moment(appointment.resource.appointment_date).format('YYYY-MM-DD'),
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
          const workingStart = moment(eventDate).set({
            hour: workingDuration.start.getHours(),
            minute: workingDuration.start.getMinutes(),
            second: 0,
            millisecond: 0
          }).toDate();

          const workingEnd = moment(eventDate).set({
            hour: workingDuration.end.getHours(),
            minute: workingDuration.end.getMinutes(),
            second: 0,
            millisecond: 0
          }).toDate();

          // If no busy slots for this day, mark entire working day as available
          if (dayBusySlots.length === 0) {
            availableSlots.push({
              start: moment(workingStart).toDate(),
              end: moment(workingEnd).toDate()
            });
          } else {
            // Find gaps between busy slots within working hours
            let currentTime = new Date(workingStart);

            dayBusySlots.forEach(busySlot => {
              const busyStart = moment(`${dateString}T${busySlot.start_time}`).toDate();
              const busyEnd = moment(`${dateString}T${busySlot.end_time}`).toDate();

              // If there's a gap before this busy slot, add it as available
              if (currentTime < busyStart) {
                availableSlots.push({
                  start: moment(currentTime).toDate(),
                  end: moment(busyStart).toDate()
                });
              }

              // Move current time to end of this busy slot
              currentTime = busyEnd > currentTime ? busyEnd : currentTime;
            });

            // Add remaining time after last busy slot if within working hours
            if (currentTime < workingEnd) {
              availableSlots.push({
                start: moment(currentTime).toDate(),
                end: moment(workingEnd).toDate()
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
              start: moment(slot.start).toDate(),
              end: moment(slot.end).toDate(),
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
              start: moment(eventDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate(),
              end: moment(eventDate).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toDate(),
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

  // Onboarding form handlers
  const handleOnboardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOnboardData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleFilesChange = (e) => {
    setVerificationFiles(Array.from(e.target.files));
  };

  const submitOnboarding = async () => {
    try {
      // Upload files first (if any)
      const uploadedFileNames = [];
      for (const file of verificationFiles) {
        const form = new FormData();
        form.append('file', file);
        const res = await axios.post('/api/uploads', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedFileNames.push(res.data.filename || res.data.filePath || file.name);
      }

      const payload = {
        licenseNumber: onboardData.licenseNumber,
        qualification: onboardData.qualification,
        specializations: onboardData.specializations ? onboardData.specializations.split(',').map(s => s.trim()) : [],
        experienceYears: Number(onboardData.experienceYears) || 0,
        languagesSpoken: onboardData.languagesSpoken ? onboardData.languagesSpoken.split(',').map(s => s.trim()) : [],
        consultationFee: Number(onboardData.consultationFee) || 0,
        clinicAffiliation: onboardData.clinicAffiliation || null,
        practiceStartDate: onboardData.practiceStartDate || null,
        bio: onboardData.bio || null,
        verificationDocuments: uploadedFileNames,
        startTime: onboardData.startTime,
        endTime: onboardData.endTime,
        leaveDays: onboardData.leaveDays ? onboardData.leaveDays.split(',').map(s => s.trim()) : [],
        consultationDuration: Number(onboardData.consultationDuration) || null,
        maxPatientsPerDay: Number(onboardData.maxPatientsPerDay) || null,
        emergencyAvailability: onboardData.emergencyAvailability ? 1 : 0,
      };

      const res = await axios.post('/api/practitioners', payload);
      toast.success('Practitioner profile created successfully');
      setShowOnboarding(false);
      // Refresh profile
      setLoading(true);
      await fetchProfile();
    } catch (error) {
      console.error('Onboarding submit error:', error);
      const msg = error.response?.data?.error || 'Failed to create practitioner profile';
      toast.error(msg);
    }
  };

  // Simplified rendering to ensure JSX tags are balanced
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Practitioner Profile</h1>
        <p className="text-muted">Loading...</p>
        <PatientViewModal open={patientModalOpen} onClose={() => { setPatientModalOpen(false); setModalPatient(null); }} patient={modalPatient} />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Complete Your Practitioner Profile</h1>
        <p className="text-muted mb-4">Please complete onboarding to continue.</p>
        <div className="surface rounded-lg shadow p-4">
          <button onClick={submitOnboarding} className="btn-primary">Submit Onboarding</button>
        </div>
        <PatientViewModal open={patientModalOpen} onClose={() => { setPatientModalOpen(false); setModalPatient(null); }} patient={modalPatient} />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-app">Practitioner Profile</h1>
          <p className="text-muted mt-2">Manage your professional information and availability</p>
        </div>
        <button className="btn-primary" onClick={() => setShowEdit(true)}>Edit Profile</button>
      </div>

      {/* Main Calendar */}
      <div className="surface rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-app mb-4">Appointments Calendar</h2>
        <div style={{ height: 600 }}>
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
            onSelectEvent={async (event) => {
              if (event.type === 'appointment') {
                const resource = event.resource || {};
                await fetchAndOpenPatient(resource);
              } else if (event.type === 'working-hours') {
                toast.info(`Available: ${event.resource.day}`);
              } else if (event.type === 'busy-slot') {
                toast.info('Busy slot');
              } else if (event.type === 'leave-day') {
                toast.info('Leave day');
              }
            }}
            eventPropGetter={(event) => {
              // Lighter/pastel variants of the original palette with darker text
              if (event.type === 'appointment') {
                return { style: { backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '6px', padding: '2px 6px', border: '1px solid rgba(30,64,175,0.12)' } };
              }
              if (event.type === 'working-hours') {
                return { style: { backgroundColor: '#D1FAE5', color: '#047857', borderRadius: '6px', border: '1px solid rgba(4,120,87,0.12)' } };
              }
              if (event.type === 'busy-slot') {
                return { style: { backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px', border: '1px solid rgba(153,27,27,0.12)' } };
              }
              if (event.type === 'leave-day') {
                return { style: { backgroundColor: '#FFEDD5', color: '#92400E', borderRadius: '6px', border: '1px solid rgba(146,64,14,0.12)' } };
              }
              // default
              return { style: { backgroundColor: '#DBEAFE', color: '#1F4ED8' } };
            }}
          />
        </div>
      </div>
      <PatientViewModal open={patientModalOpen} onClose={() => { setPatientModalOpen(false); setModalPatient(null); }} patient={modalPatient} />
    </div>
  );
};

export default PractitionerProfile;
