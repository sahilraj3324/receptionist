'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/Card';
import Input from '@/components/Input';
import { prescriptionApi, type Prescription } from '@/lib/api';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionApi.getAll();
      if (response.success && response.data) {
        setPrescriptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) =>
    prescription.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.prescription_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
          <p className="text-gray-600">View all patient prescriptions</p>
        </div>

        <Card>
          <Input
            label="Search Prescriptions"
            placeholder="Search by problem or prescription ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">No prescriptions found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.prescription_id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                        💊
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID: {prescription.prescription_id}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Problem</p>
                      <p className="text-gray-900">{prescription.problem}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 font-medium">Doctor's Notes</p>
                      <p className="text-gray-700 line-clamp-2">{prescription.doctor_notes}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 font-medium">Medicines</p>
                      <p className="text-gray-700 line-clamp-2">{prescription.medicines}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => setSelectedPrescription(prescription)}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                    >
                      View Details
                    </button>
                    {prescription.pdf_link && (
                      <a
                        href={prescription.pdf_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                      >
                        📄 PDF
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Prescription Details Modal */}
        {selectedPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">Prescription Details</h3>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Prescription ID</p>
                  <p className="text-lg font-semibold">{selectedPrescription.prescription_id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">Problem</p>
                  <p className="text-gray-900">{selectedPrescription.problem}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">Doctor's Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPrescription.doctor_notes}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">Prescribed Medicines</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPrescription.medicines}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(selectedPrescription.created_at).toLocaleString()}
                  </p>
                </div>

                {selectedPrescription.pdf_link && (
                  <a
                    href={selectedPrescription.pdf_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-all"
                  >
                    📄 Download PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

