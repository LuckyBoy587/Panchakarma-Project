import React from 'react';

const PatientViewModal = ({ open, onClose, patient }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Patient Details</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>

        {!patient ? (
          <p className="text-sm text-muted">Loading patient details...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted">Name</p>
              <p className="font-medium">{patient.first_name} {patient.last_name}</p>

              <p className="text-sm text-muted mt-3">Phone</p>
              <p className="font-medium">{patient.phone || '—'}</p>

              <p className="text-sm text-muted mt-3">Email</p>
              <p className="font-medium">{patient.email || '—'}</p>

              <p className="text-sm text-muted mt-3">Date of Birth</p>
              <p className="font-medium">{patient.dob ? new Date(patient.dob).toLocaleDateString() : '—'}</p>
            </div>

            <div>
              <p className="text-sm text-muted">Address</p>
              <p className="font-medium">{patient.address || '—'}</p>

              <p className="text-sm text-muted mt-3">Gender</p>
              <p className="font-medium">{patient.gender || '—'}</p>

              <p className="text-sm text-muted mt-3">Notes</p>
              <p className="font-medium whitespace-pre-wrap">{patient.notes || '—'}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-secondary px-4 py-2">Close</button>
        </div>
      </div>
    </div>
  );
};

export default PatientViewModal;
