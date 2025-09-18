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
    // Personal Information
    fullName: '',
    age: '',
    gender: '',
    contactNumber: '',
    emailAddress: '',
    address: '',
    // Medical History
    existingHealthConditions: '',
    pastSurgeriesMajorIllnesses: '',
    allergiesDetailed: '',
    currentMedicationsDetailed: '',
    familyMedicalHistoryDetailed: '',
    // Lifestyle (Ayurveda focused)
    dietPattern: '',
    sleepPattern: '',
    dailyRoutine: '',
    stressLevel: '',
    addictionHistory: '',
    // legacy fields
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
            fullName: patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
            age: patient.age || '',
            gender: patient.gender || '',
            contactNumber: patient.contact_number || patient.phone || '',
            emailAddress: patient.email_address || patient.email || '',
            address: patient.address || '',
            existingHealthConditions: patient.existing_health_conditions || patient.medical_conditions || '',
            pastSurgeriesMajorIllnesses: patient.past_surgeries_major_illnesses || patient.past_surgeries || '',
            allergiesDetailed: patient.allergies_detailed || patient.allergies || '',
            currentMedicationsDetailed: patient.current_medications_detailed || patient.current_medications || '',
            familyMedicalHistoryDetailed: patient.family_medical_history_detailed || patient.family_medical_history || '',
            dietPattern: patient.diet_pattern || '',
            sleepPattern: patient.sleep_pattern || '',
            dailyRoutine: patient.daily_routine || '',
            stressLevel: patient.stress_level || '',
            addictionHistory: patient.addiction_history || '',
            // legacy
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
      // Send PUT to update patient profile
      const patientId = patientData ? patientData.patient_id : undefined;
      const url = patientId ? `/api/patients/${patientId}` : `/api/patients`;

      // build payload of only fields we care about to avoid sending unneeded props
      const payload = {
        fullName: formData.fullName,
        age: formData.age,
        gender: formData.gender,
        contactNumber: formData.contactNumber,
        emailAddress: formData.emailAddress,
        address: formData.address,
        existingHealthConditions: formData.existingHealthConditions,
        pastSurgeriesMajorIllnesses: formData.pastSurgeriesMajorIllnesses,
        allergiesDetailed: formData.allergiesDetailed,
        currentMedicationsDetailed: formData.currentMedicationsDetailed,
        familyMedicalHistoryDetailed: formData.familyMedicalHistoryDetailed,
        dietPattern: formData.dietPattern,
        sleepPattern: formData.sleepPattern,
        dailyRoutine: formData.dailyRoutine,
        stressLevel: formData.stressLevel,
        addictionHistory: formData.addictionHistory,
        // keep legacy fields too
        medicalConditions: formData.medicalConditions,
        allergies: formData.allergies,
        currentMedications: formData.currentMedications,
        pastSurgeries: formData.pastSurgeries,
        familyMedicalHistory: formData.familyMedicalHistory,
        lifestyleHabits: formData.lifestyleHabits,
        dietaryPreferences: formData.dietaryPreferences,
        exerciseRoutine: formData.exerciseRoutine,
      };

      let response;
      if (patientId) {
        response = await axios.put(url, payload);
      } else {
        response = await axios.post('/api/patients', payload);
      }

      // if backend returns the saved patient, update local state
      if (response && response.data && response.data.patient) {
        setPatientData(response.data.patient);
        toast.success(response.data.message || 'Patient profile saved successfully');
      } else {
        toast.success('Patient profile saved');
      }
    } catch (error) {
      console.error('Error logging patient profile:', error);
      const message = error?.response?.data?.error || error.message || 'Failed to save patient profile';
      toast.error(message);
    } finally {
      setSaving(false);
      
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-app">Patient Profile</h1>
          <p className="text-muted mt-2">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-app">Patient Profile</h1>
        <p className="text-muted mt-2">Manage your health information and preferences</p>
      </div>

      <div className="surface rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-medium text-app mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input name="age" value={formData.age} onChange={handleInputChange} placeholder="Age" className="mt-1 block w-full border rounded-md p-2" />
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="Contact Number" className="mt-1 block w-full border rounded-md p-2" />
              </div>
              <div>
                <input name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} placeholder="Email Address" className="mt-1 block w-full border rounded-md p-2" />
              </div>
              <div>
                <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} placeholder="Address" className="mt-1 block w-full border rounded-md p-2" />
              </div>
            </div>
          </div>

          {/* Medical History Section */}
          <div>
            <h3 className="text-lg font-medium text-app mb-4">Medical History</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted">Existing Health Conditions</label>
                <textarea name="existingHealthConditions" value={formData.existingHealthConditions} onChange={handleInputChange} rows={3} className="mt-1 block w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted">Past Surgeries / Major Illnesses</label>
                <textarea name="pastSurgeriesMajorIllnesses" value={formData.pastSurgeriesMajorIllnesses} onChange={handleInputChange} rows={3} className="mt-1 block w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted">Allergies (Food/Drug/Environmental)</label>
                <textarea name="allergiesDetailed" value={formData.allergiesDetailed} onChange={handleInputChange} rows={2} className="mt-1 block w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted">Current Medications (if any)</label>
                <textarea name="currentMedicationsDetailed" value={formData.currentMedicationsDetailed} onChange={handleInputChange} rows={2} className="mt-1 block w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted">Family Medical History (Hereditary diseases)</label>
                <textarea name="familyMedicalHistoryDetailed" value={formData.familyMedicalHistoryDetailed} onChange={handleInputChange} rows={2} className="mt-1 block w-full border rounded-md p-2" />
              </div>
            </div>
          </div>

          {/* Lifestyle (Ayurveda Focused) Section */}
          <div>
            <h3 className="text-lg font-medium text-app mb-4">Lifestyle Details (Ayurveda Focused)</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-3 gap-4">
                <select name="dietPattern" value={formData.dietPattern} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2">
                  <option value="">Diet Pattern</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="mixed">Mixed</option>
                </select>
                <select name="sleepPattern" value={formData.sleepPattern} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2">
                  <option value="">Sleep Pattern</option>
                  <option value="good">Good</option>
                  <option value="disturbed">Disturbed</option>
                  <option value="insomnia">Insomnia</option>
                </select>
                <select name="dailyRoutine" value={formData.dailyRoutine} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2">
                  <option value="">Daily Routine</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="moderately_active">Moderately Active</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="stressLevel" value={formData.stressLevel} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2">
                  <option value="">Stress Level</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
                <input name="addictionHistory" value={formData.addictionHistory} onChange={handleInputChange} placeholder="Addiction History (Smoking, Alcohol, Tobacco)" className="mt-1 block w-full border rounded-md p-2" />
              </div>
            </div>
          </div>
          {/* Pre-existing Problems Section */}
          <div>
            <h3 className="text-lg font-medium text-app mb-4">Health Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="medicalConditions" className="block text-sm font-medium text-muted">
                  Pre-existing Problems / Medical Conditions
                </label>
                <textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-transparent sm:text-sm"
                  placeholder="Please describe any pre-existing medical conditions, chronic illnesses, or health problems..."
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-muted">
                  Allergies
                </label>
                <textarea
                  id="allergies"
                  name="allergies"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-transparent sm:text-sm"
                  placeholder="List any allergies (food, medication, environmental, etc.)..."
                  value={formData.allergies}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="currentMedications" className="block text-sm font-medium text-muted">
                  Current Medications
                </label>
                <textarea
                  id="currentMedications"
                  name="currentMedications"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-transparent sm:text-sm"
                  placeholder="List any medications you are currently taking..."
                  value={formData.currentMedications}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="pastSurgeries" className="block text-sm font-medium text-muted">
                  Past Surgeries
                </label>
                <textarea
                  id="pastSurgeries"
                  name="pastSurgeries"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-transparent sm:text-sm"
                  placeholder="List any past surgeries or medical procedures..."
                  value={formData.pastSurgeries}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="familyMedicalHistory" className="block text-sm font-medium text-muted">
                  Family Medical History
                </label>
                <textarea
                  id="familyMedicalHistory"
                  name="familyMedicalHistory"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-transparent sm:text-sm"
                  placeholder="Describe any relevant family medical history..."
                  value={formData.familyMedicalHistory}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Lifestyle Information Section */}
          <div>
            <h3 className="text-lg font-medium text-app mb-4">Lifestyle Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="lifestyleHabits" className="block text-sm font-medium text-muted">
                  Lifestyle Habits
                </label>
                <textarea
                  id="lifestyleHabits"
                  name="lifestyleHabits"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-transparent sm:text-sm"
                  placeholder="Describe your daily habits, smoking, alcohol consumption, etc..."
                  value={formData.lifestyleHabits}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="dietaryPreferences" className="block text-sm font-medium text-muted">
                  Dietary Preferences
                </label>
                <textarea
                  id="dietaryPreferences"
                  name="dietaryPreferences"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-transparent sm:text-sm"
                  placeholder="Describe your dietary preferences, restrictions, or eating habits..."
                  value={formData.dietaryPreferences}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="exerciseRoutine" className="block text-sm font-medium text-muted">
                  Exercise Routine
                </label>
                <textarea
                  id="exerciseRoutine"
                  name="exerciseRoutine"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-transparent sm:text-sm"
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
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
