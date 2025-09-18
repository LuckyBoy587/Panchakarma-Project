import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PatientProfile = () => {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
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
  const [notifyBefore, setNotifyBefore] = useState('');

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
            // load preference if provided on patient object (optional)
            // preference is stored separately; fetch it separately if needed
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

  const handlePreferenceChange = (e) => {
    setNotifyBefore(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // If currently on Preferences tab, only submit preferences
      if (activeSection === 'preferences') {
        if (notifyBefore === '' || notifyBefore === null || notifyBefore === undefined) {
          toast.error('Please enter a value for notify before (minutes)');
          setSaving(false);
          return;
        }
        const prefValue = Number(notifyBefore);
        if (Number.isNaN(prefValue) || prefValue < 0) {
          toast.error('Please enter a valid non-negative number for minutes');
          setSaving(false);
          return;
        }

        try {
          await axios.post('/api/user-preferences', { notify_before: prefValue });
          toast.success('Preferences saved');
        } catch (prefErr) {
          console.error('Error saving preferences:', prefErr);
          const msg = prefErr?.response?.data?.error || prefErr.message || 'Failed to save preferences';
          toast.error(msg);
        } finally {
          setSaving(false);
        }

        return;
      }
      // Send PUT to update patient profile
      const patientId = patientData ? patientData.patient_id : undefined;
      const url = patientId ? `/api/patients/${patientId}` : `/api/patients`;

      // build payload using snake_case fields expected by backend
      const payload = {
        full_name: formData.fullName,
        age: formData.age,
        gender: formData.gender,
        contact_number: formData.contactNumber,
        email_address: formData.emailAddress,
        address: formData.address,
        existing_health_conditions: formData.existingHealthConditions,
        past_surgeries_major_illnesses: formData.pastSurgeriesMajorIllnesses,
        allergies_detailed: formData.allergiesDetailed,
        current_medications_detailed: formData.currentMedicationsDetailed,
        family_medical_history_detailed: formData.familyMedicalHistoryDetailed,
        diet_pattern: formData.dietPattern,
        sleep_pattern: formData.sleepPattern,
        daily_routine: formData.dailyRoutine,
        stress_level: formData.stressLevel,
        addiction_history: formData.addictionHistory,
        // legacy/other fields
        medical_conditions: formData.medicalConditions,
        allergies: formData.allergies,
        current_medications: formData.currentMedications,
        past_surgeries: formData.pastSurgeries,
        family_medical_history: formData.familyMedicalHistory,
        lifestyle_habits: formData.lifestyleHabits,
        dietary_preferences: formData.dietaryPreferences,
        exercise_routine: formData.exerciseRoutine,
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
      // Do not automatically submit preferences here — handled on Preferences tab
    } catch (error) {
      console.error('Error logging patient profile:', error);
      const message = error?.response?.data?.error || error.message || 'Failed to save patient profile';
      toast.error(message);
    } finally {
      setSaving(false);
      
    }
  };

  // helper for nav button classes to ensure active tab is visibly distinct
  const navBtnClass = (key) => `text-left p-2 rounded flex items-center justify-start transition-colors duration-150 ${activeSection===key ? 'bg-app text-app shadow-md border-2 border-app pl-3' : 'hover:bg-gray-100'}`;

  // ref to the form so we can submit from the header button
  const formRef = useRef(null);

  const submitForm = () => {
    if (!formRef.current) return;
    if (typeof formRef.current.requestSubmit === 'function') {
      formRef.current.requestSubmit();
    } else {
      formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
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
    <div className="flex gap-6">
      {/* Left vertical nav */}
      <aside className="w-56">
        <div className="surface rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Profile Sections</h2>
          <nav className="flex flex-col space-y-2">
            <button type="button" onClick={() => setActiveSection('personal')} aria-current={activeSection==='personal' ? 'page' : undefined} className={navBtnClass('personal')}>Personal</button>
            <button type="button" onClick={() => setActiveSection('medical')} aria-current={activeSection==='medical' ? 'page' : undefined} className={navBtnClass('medical')}>Medical History</button>
            <button type="button" onClick={() => setActiveSection('lifestyle')} aria-current={activeSection==='lifestyle' ? 'page' : undefined} className={navBtnClass('lifestyle')}>Ayurveda Lifestyle</button>
            <button type="button" onClick={() => setActiveSection('healthinfo')} aria-current={activeSection==='healthinfo' ? 'page' : undefined} className={navBtnClass('healthinfo')}>Health Info</button>
            <button type="button" onClick={() => setActiveSection('more')} aria-current={activeSection==='more' ? 'page' : undefined} className={navBtnClass('more')}>Lifestyle Details</button>
            <button type="button" onClick={() => setActiveSection('preferences')} aria-current={activeSection==='preferences' ? 'page' : undefined} className={navBtnClass('preferences')}>Preferences</button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-app">Patient Profile</h1>
              <p className="text-muted mt-2">Manage your health information and preferences</p>
            </div>
            <div className="flex items-center">
              <button type="button" onClick={submitForm} disabled={saving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          <div className="surface rounded-lg shadow p-6">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Section */}
              {activeSection === 'personal' && (
                <section>
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
                </section>
              )}

              {/* Medical History Section */}
              {activeSection === 'medical' && (
                <section>
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
                </section>
              )}

              {/* Ayurveda Lifestyle Section */}
              {activeSection === 'lifestyle' && (
                <section>
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
                </section>
              )}

              {/* Health Info Section */}
              {activeSection === 'healthinfo' && (
                <section>
                  <h3 className="text-lg font-medium text-app mb-4">Health Information</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="medicalConditions" className="block text-sm font-medium text-muted">Pre-existing Problems / Medical Conditions</label>
                      <textarea id="medicalConditions" name="medicalConditions" rows={4} className="mt-1 block w-full border rounded-md p-2" placeholder="Please describe any pre-existing medical conditions..." value={formData.medicalConditions} onChange={handleInputChange} />
                    </div>

                    <div>
                      <label htmlFor="allergies" className="block text-sm font-medium text-muted">Allergies</label>
                      <textarea id="allergies" name="allergies" rows={3} className="mt-1 block w-full border rounded-md p-2" placeholder="List any allergies..." value={formData.allergies} onChange={handleInputChange} />
                    </div>

                    <div>
                      <label htmlFor="currentMedications" className="block text-sm font-medium text-muted">Current Medications</label>
                      <textarea id="currentMedications" name="currentMedications" rows={3} className="mt-1 block w-full border rounded-md p-2" placeholder="List any medications you are currently taking..." value={formData.currentMedications} onChange={handleInputChange} />
                    </div>

                    <div>
                      <label htmlFor="pastSurgeries" className="block text-sm font-medium text-muted">Past Surgeries</label>
                      <textarea id="pastSurgeries" name="pastSurgeries" rows={3} className="mt-1 block w-full border rounded-md p-2" placeholder="List any past surgeries..." value={formData.pastSurgeries} onChange={handleInputChange} />
                    </div>

                    <div>
                      <label htmlFor="familyMedicalHistory" className="block text-sm font-medium text-muted">Family Medical History</label>
                      <textarea id="familyMedicalHistory" name="familyMedicalHistory" rows={3} className="mt-1 block w-full border rounded-md p-2" placeholder="Describe any relevant family medical history..." value={formData.familyMedicalHistory} onChange={handleInputChange} />
                    </div>
                  </div>
                </section>
              )}

              {/* More Lifestyle Details */}
              {activeSection === 'more' && (
                <section>
                  <h3 className="text-lg font-medium text-app mb-4">Lifestyle Information</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="lifestyleHabits" className="block text-sm font-medium text-muted">Lifestyle Habits</label>
                      <textarea id="lifestyleHabits" name="lifestyleHabits" rows={3} className="mt-1 block w-full border rounded-md p-2" placeholder="Describe your daily habits..." value={formData.lifestyleHabits} onChange={handleInputChange} />
                    </div>

                    <div>
                      <label htmlFor="dietaryPreferences" className="block text-sm font-medium text-muted">Dietary Preferences</label>
                      <textarea id="dietaryPreferences" name="dietaryPreferences" rows={3} className="mt-1 block w-full border rounded-md p-2" placeholder="Describe your dietary preferences..." value={formData.dietaryPreferences} onChange={handleInputChange} />
                    </div>

                    <div>
                      <label htmlFor="exerciseRoutine" className="block text-sm font-medium text-muted">Exercise Routine</label>
                      <textarea id="exerciseRoutine" name="exerciseRoutine" rows={3} className="mt-1 block w-full border rounded-md p-2" placeholder="Describe your regular exercise..." value={formData.exerciseRoutine} onChange={handleInputChange} />
                    </div>
                  </div>
                </section>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                <section>
                  <h3 className="text-lg font-medium text-app mb-4">Preferences</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="notifyBefore" className="block text-sm font-medium text-muted">Notify me before (minutes)</label>
                      <input id="notifyBefore" name="notifyBefore" value={notifyBefore} onChange={handlePreferenceChange} placeholder="e.g. 30" className="mt-1 block w-40 border rounded-md p-2" />
                      <p className="text-xs text-muted mt-1">Enter the number of minutes before an appointment you'd like to be notified.</p>
                    </div>
                  </div>
                </section>
              )}

              {/* bottom submit removed; primary save moved to header */}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;
