'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/Card';
import Input from '@/components/Input';
import { patientApi, type User } from '@/lib/api';

export default function PatientsPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await patientApi.getAll();
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <p className="text-gray-600">View all registered patients</p>
        </div>

        <Card>
          <Input
            label="Search Patients"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">No patients found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPatients.map((patient) => (
              <Card key={patient.user_id}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                      🏥
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {patient.contact_number && (
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{patient.contact_number}</p>
                      </div>
                    )}
                    {patient.gender && (
                      <div>
                        <p className="text-gray-500">Gender</p>
                        <p className="font-medium">{patient.gender}</p>
                      </div>
                    )}
                    {patient.blood_group && (
                      <div>
                        <p className="text-gray-500">Blood Group</p>
                        <p className="font-medium">{patient.blood_group}</p>
                      </div>
                    )}
                    {patient.city && (
                      <div>
                        <p className="text-gray-500">City</p>
                        <p className="font-medium">{patient.city}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Full Details →
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">Patient Details</h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Full Name</p>
                      <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{selectedPatient.email}</p>
                    </div>
                    {selectedPatient.contact_number && (
                      <div>
                        <p className="text-gray-500">Contact Number</p>
                        <p className="font-medium">{selectedPatient.contact_number}</p>
                      </div>
                    )}
                    {selectedPatient.gender && (
                      <div>
                        <p className="text-gray-500">Gender</p>
                        <p className="font-medium">{selectedPatient.gender}</p>
                      </div>
                    )}
                    {selectedPatient.date_of_birth && (
                      <div>
                        <p className="text-gray-500">Date of Birth</p>
                        <p className="font-medium">{new Date(selectedPatient.date_of_birth).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedPatient.blood_group && (
                      <div>
                        <p className="text-gray-500">Blood Group</p>
                        <p className="font-medium">{selectedPatient.blood_group}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="text-sm space-y-2">
                    {selectedPatient.city && <p>📍 {selectedPatient.city}</p>}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Registered: {new Date(selectedPatient.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

