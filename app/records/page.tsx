'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/Card';
import Input from '@/components/Input';
import { medicalRecordApi, type MedicalRecord } from '@/lib/api';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Ongoing' | 'Resolved' | 'Cancelled'>('all');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await medicalRecordApi.getAll();
      if (response.success && response.data) {
        setRecords(response.data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Ongoing: 'bg-blue-100 text-blue-700',
      Resolved: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const filteredRecords = records
    .filter((record) =>
      (filter === 'all' || record.status === filter) &&
      (record.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>
          <p className="text-gray-600">View and manage patient medical records</p>
        </div>

        <Card>
          <Input
            label="Search Records"
            placeholder="Search by problem or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        <div className="flex gap-2 flex-wrap">
          {['all', 'Pending', 'Ongoing', 'Resolved', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">No medical records found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecords.map((record) => (
              <Card key={record.record_id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                        📋
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Record #{record.record_id}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(record.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Problem</p>
                      <p className="text-gray-900">{record.problem}</p>
                    </div>

                    {record.description && (
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Description</p>
                        <p className="text-gray-700 text-sm line-clamp-3">{record.description}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Uploaded: {new Date(record.upload_date).toLocaleString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

