import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, FileText } from 'lucide-react';

const TreatmentPlans = () => {
  const { user } = useAuth();
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [requiredItems, setRequiredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [treatmentForm, setTreatmentForm] = useState({
    selectedTherapyId: '',
    startDate: '',
    endDate: '',
    totalSessions: 1,
    totalCost: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [treatmentPlansRes, patientsRes, therapiesRes] = await Promise.all([
        axios.get('/api/treatment-plans'),
        axios.get('/api/patients'),
        axios.get('/api/therapies')
      ]);
      
      setTreatmentPlans(treatmentPlansRes.data);
      setPatients(patientsRes.data);
      setTherapies(therapiesRes.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get patients without treatment plans
  const getPatientsWithoutTreatments = () => {
    const patientsWithTreatments = new Set(
      treatmentPlans.map(plan => plan.patient_id)
    );
    
    return patients.filter(patient => !patientsWithTreatments.has(patient.patient_id));
  };

  const handleAssignTreatment = (patient) => {
    setSelectedPatient(patient);
    setShowAssignModal(true);
  };

  const fetchRequiredItems = async (therapyId) => {
    if (!therapyId) {
      setRequiredItems([]);
      return;
    }
    
    try {
      const response = await axios.get(`/api/therapies/${therapyId}/required-items`);
      setRequiredItems(response.data);
    } catch (err) {
      console.error('Error fetching required items:', err);
      setRequiredItems([]);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTreatmentForm(prev => ({
      ...prev,
      [name]: value
    }));

    // If therapy selection changed, fetch required items
    if (name === 'selectedTherapyId') {
      fetchRequiredItems(value);
    }
  };

  const handleSubmitTreatment = async (e) => {
    e.preventDefault();
    
    // Find the selected therapy
    const selectedTherapy = therapies.find(therapy => therapy.id.toString() === treatmentForm.selectedTherapyId);
    if (!selectedTherapy) {
      setError('Please select a therapy');
      return;
    }
    
    try {
      await axios.post('/api/treatment-plans', {
        patientId: selectedPatient.patient_id,
        therapyId: parseInt(treatmentForm.selectedTherapyId),
        treatmentName: selectedTherapy.name,
        startDate: treatmentForm.startDate,
        endDate: treatmentForm.endDate,
        totalSessions: parseInt(treatmentForm.totalSessions),
        totalCost: parseFloat(treatmentForm.totalCost),
      });

      setShowAssignModal(false);
      setTreatmentForm({
        selectedTherapyId: '',
        startDate: '',
        endDate: '',
        totalSessions: 1,
        totalCost: 0
      });
      setSelectedPatient(null);
      setRequiredItems([]);
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error creating treatment plan:', err);
      setError('Failed to create treatment plan');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Treatment Plans</h1>
          <p className="text-gray-600 mt-2">View and manage Panchakarma treatment plans</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading treatment plans...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Treatment Plans</h1>
          <p className="text-gray-600 mt-2">View and manage Panchakarma treatment plans</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const patientsWithoutTreatments = getPatientsWithoutTreatments();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Treatment Plans</h1>
        <p className="text-gray-600 mt-2">
          {user?.userType === 'practitioner' 
            ? 'View patients assigned to your treatment plans' 
            : 'View and manage Panchakarma treatment plans'
          }
        </p>
      </div>

      {/* Patients with Treatment Plans */}
      {treatmentPlans.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Patients with Treatment Plans
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treatment Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treatment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {treatmentPlans.map((plan) => (
                  <tr key={plan.treatment_plan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {plan.patient_first_name} {plan.patient_last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.treatment_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.treatment_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(plan.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(plan.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        plan.status === 'active' ? 'bg-green-100 text-green-800' :
                        plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        plan.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.sessions_completed || 0} / {plan.total_sessions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patients without Treatment Plans */}
      {patientsWithoutTreatments.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Patients without Treatment Plans
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign treatment plans to these patients
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patientsWithoutTreatments.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(patient.date_of_birth).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleAssignTreatment(patient)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Assign Treatment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {treatmentPlans.length === 0 && patientsWithoutTreatments.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">No patients found.</p>
        </div>
      )}

      {/* Assign Treatment Modal */}
      {showAssignModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign Treatment to {selectedPatient.first_name} {selectedPatient.last_name}
                </h3>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setRequiredItems([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmitTreatment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Therapy
                  </label>
                  <select
                    name="selectedTherapyId"
                    value={treatmentForm.selectedTherapyId}
                    onChange={handleFormChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a therapy...</option>
                    {therapies.map((therapy) => (
                      <option key={therapy.id} value={therapy.id}>
                        {therapy.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Required Items Display */}
                {requiredItems.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Items for this Therapy
                    </label>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-32 overflow-y-auto">
                      <div className="space-y-2">
                        {requiredItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">{item.item_name}</span>
                              <span className="text-gray-500 ml-2">({item.category})</span>
                            </div>
                            <div className="text-gray-600">
                              {item.quantity} {item.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      These items will be required for each session of this therapy.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={treatmentForm.startDate}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={treatmentForm.endDate}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Sessions
                    </label>
                    <input
                      type="number"
                      name="totalSessions"
                      value={treatmentForm.totalSessions}
                      onChange={handleFormChange}
                      min="1"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Cost ($)
                    </label>
                    <input
                      type="number"
                      name="totalCost"
                      value={treatmentForm.totalCost}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setRequiredItems([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Assign Treatment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlans;
