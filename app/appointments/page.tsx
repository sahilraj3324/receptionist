'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { appointmentApi, type Appointment } from '@/lib/api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentApi.getAll();
      if (response.success && response.data) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await appointmentApi.updateStatus(id, status);
      alert('Status updated successfully!');
      fetchAppointments();
    } catch (error: any) {
      alert(error.message || 'Update failed');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const filteredAppointments = appointments
    .filter((apt) => filter === 'all' || apt.status === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-gray-600">Manage all patient appointments</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">No appointments found</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <Card key={apt.appointment_id}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                      <span className="text-sm text-gray-500">#{apt.appointment_id}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium">{new Date(apt.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium">{apt.time}</p>
                      </div>
                    </div>

                    {apt.remarks && (
                      <div className="text-sm">
                        <p className="text-gray-500">Remarks</p>
                        <p className="text-gray-700">{apt.remarks}</p>
                      </div>
                    )}
                  </div>

                  {apt.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(apt.appointment_id, 'confirmed')}
                        className="text-sm"
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleStatusUpdate(apt.appointment_id, 'cancelled')}
                        className="text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {apt.status === 'confirmed' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(apt.appointment_id, 'completed')}
                        className="text-sm"
                      >
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

