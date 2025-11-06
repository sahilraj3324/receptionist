'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { doctorApi, type Doctor } from '@/lib/api';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience_years: 0,
    city: '',
    phone_number: '',
    clinic_name: '',
    clinic_address: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorApi.getAll();
      if (response.success && response.data) {
        setDoctors(response.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialization: '',
      qualification: '',
      experience_years: 0,
      city: '',
      phone_number: '',
      clinic_name: '',
      clinic_address: '',
    });
    setShowModal(true);
  };

  const handleEditClick = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience_years: doctor.experience_years,
      city: doctor.city || '',
      phone_number: doctor.phone_number || '',
      clinic_name: doctor.clinic_name || '',
      clinic_address: doctor.clinic_address || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDoctor) {
        await doctorApi.update(editingDoctor.doctor_id, formData);
        alert('Doctor updated successfully!');
      } else {
        await doctorApi.create(formData);
        alert('Doctor added successfully!');
      }
      setShowModal(false);
      fetchDoctors();
    } catch (error: any) {
      alert(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await doctorApi.delete(id);
      alert('Doctor deleted successfully!');
      fetchDoctors();
    } catch (error: any) {
      alert(error.message || 'Delete failed');
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Doctors Management</h2>
            <p className="text-gray-600">View and manage all doctors</p>
          </div>
          <Button onClick={handleAddClick}>+ Add Doctor</Button>
        </div>

        <Card>
          <Input
            label="Search Doctors"
            placeholder="Search by name, specialization, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">No doctors found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.doctor_id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        👨‍⚕️
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-blue-600">{doctor.specialization}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doctor.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {doctor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📚 {doctor.qualification}</p>
                    <p>🕐 {doctor.experience_years} years experience</p>
                    {doctor.city && <p>📍 {doctor.city}</p>}
                    {doctor.phone_number && <p>📞 {doctor.phone_number}</p>}
                    {doctor.clinic_name && <p>🏥 {doctor.clinic_name}</p>}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" fullWidth onClick={() => handleEditClick(doctor)}>
                      Edit
                    </Button>
                    <Button variant="danger" fullWidth onClick={() => handleDelete(doctor.doctor_id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-2xl font-bold mb-6">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  />
                  <Input
                    label="Qualification"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    required
                  />
                  <Input
                    label="Experience (years)"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                    required
                  />
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                  <Input
                    label="Clinic Name"
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                  />
                  <Input
                    label="Clinic Address"
                    value={formData.clinic_address}
                    onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" fullWidth onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" fullWidth>
                    {editingDoctor ? 'Update' : 'Add'} Doctor
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

