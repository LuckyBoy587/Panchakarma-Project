import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PatientProfile = () => {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    medicalConditions: '',
    allergies: '',
    currentMedications: '',
    pastSurgeries: '',
    familyMedicalHistory: '',
    lifestyleHabits: '',
    dietaryPreferences: '',
    exerciseRoutine: '',
  });

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const response = await axios.get('/api/patients');
      if (response.data.length > 0) {
        const patient = response.data[0];
        setPatientData(patient);
        setFormData({
          medicalConditions: patient.medical_conditions || '',
          allergies: patient.allergies || '',
          currentMedications: patient.current_medications || '',
          pastSurgeries: patient.past_surgeries || '',
          familyMedicalHistory: patient.family_medical_history || '',
          lifestyleHabits: patient.lifestyle_habits || '',
          dietaryPreferences: patient.dietary_preferences || '',
          exerciseRoutine: patient.exercise_routine || '',
        });
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      toast.error('Failed to load patient profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Log the form data to console instead of saving to database
      console.log('Patient Profile Data:', formData);

      // Show success message
      toast.success('Patient profile data logged successfully!');
    } catch (error) {
      console.error('Error logging patient profile:', error);
      toast.error('Failed to log patient profile');
    } finally {
      setSaving(false);
      
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Profile</h1>
          <p className="text-gray-600 mt-2">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Profile</h1>
        <p className="text-gray-600 mt-2">Manage your health information and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pre-existing Problems Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Health Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700">
                  Pre-existing Problems / Medical Conditions
                </label>
                <textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Please describe any pre-existing medical conditions, chronic illnesses, or health problems..."
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                  Allergies
                </label>
                <textarea
                  id="allergies"
                  name="allergies"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="List any allergies (food, medication, environmental, etc.)..."
                  value={formData.allergies}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="currentMedications" className="block text-sm font-medium text-gray-700">
                  Current Medications
                </label>
                <textarea
                  id="currentMedications"
                  name="currentMedications"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="List any medications you are currently taking..."
                  value={formData.currentMedications}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="pastSurgeries" className="block text-sm font-medium text-gray-700">
                  Past Surgeries
                </label>
                <textarea
                  id="pastSurgeries"
                  name="pastSurgeries"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="List any past surgeries or medical procedures..."
                  value={formData.pastSurgeries}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="familyMedicalHistory" className="block text-sm font-medium text-gray-700">
                  Family Medical History
                </label>
                <textarea
                  id="familyMedicalHistory"
                  name="familyMedicalHistory"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe any relevant family medical history..."
                  value={formData.familyMedicalHistory}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Lifestyle Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lifestyle Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="lifestyleHabits" className="block text-sm font-medium text-gray-700">
                  Lifestyle Habits
                </label>
                <textarea
                  id="lifestyleHabits"
                  name="lifestyleHabits"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe your daily habits, smoking, alcohol consumption, etc..."
                  value={formData.lifestyleHabits}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="dietaryPreferences" className="block text-sm font-medium text-gray-700">
                  Dietary Preferences
                </label>
                <textarea
                  id="dietaryPreferences"
                  name="dietaryPreferences"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe your dietary preferences, restrictions, or eating habits..."
                  value={formData.dietaryPreferences}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="exerciseRoutine" className="block text-sm font-medium text-gray-700">
                  Exercise Routine
                </label>
                <textarea
                  id="exerciseRoutine"
                  name="exerciseRoutine"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe your regular exercise or physical activity routine..."
                  value={formData.exerciseRoutine}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
