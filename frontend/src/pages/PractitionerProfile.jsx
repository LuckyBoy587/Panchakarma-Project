import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/practitioners/profile');
      const profile = response.data;
      console.log('Fetched profile:', profile);
      if (profile.working_hours) {
        setWorkingDays(profile.working_hours);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
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
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save working days');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Practitioner Profile</h1>
          <p className="text-gray-600 mt-2">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Practitioner Profile</h1>
        <p className="text-gray-600 mt-2">Manage your professional information and availability</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Working Days & Hours</h2>
        <p className="text-gray-600 mb-6">Set your availability for each day of the week</p>

        <div className="space-y-4">
          {workingDays.map((dayData, index) => (
            <div key={dayData.day} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id={dayData.day}
                  checked={dayData.isWorking}
                  onChange={() => handleDayToggle(index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={dayData.day} className="ml-2 text-sm font-medium text-gray-900">
                  {dayData.day}
                </label>
              </div>

              {dayData.isWorking && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={dayData.startTime}
                      onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={dayData.endTime}
                      onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Availability
          </button>
        </div>
      </div>
    </div>
  );
};

export default PractitionerProfile;
