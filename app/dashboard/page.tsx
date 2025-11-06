'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Calendar as CalendarIcon, 
  Users, 
  UserCheck, 
  Search, 
  LogOut, 
  UserCircle, 
  Clock, 
  Filter, 
  TrendingUp, 
  Bell, 
  Calendar as CalendarIconAlt 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { appointmentApi, doctorApi, patientApi } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    scheduled: 0,
    totalPatients: 0,
    totalDoctors: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock notifications (replace with real API)
  const notifications = [
    { id: 1, message: 'Doctor requested unavailability', time: '10 mins ago', read: false },
    { id: 2, message: 'Doctor cancelled slot', time: '1 hour ago', read: false },
    { id: 3, message: 'Schedule change requested', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all appointments
      const appointmentsRes = await appointmentApi.getAll();
      if (appointmentsRes.success && appointmentsRes.data) {
        setAppointments(appointmentsRes.data);
        
        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayApts = appointmentsRes.data.filter((apt: any) => 
          apt.date?.toString().startsWith(today)
        );
        const scheduled = appointmentsRes.data.filter((apt: any) => 
          apt.status === 'pending' || apt.status === 'confirmed'
        );
        const completed = appointmentsRes.data.filter((apt: any) => 
          apt.status === 'completed'
        );
        
        setStats(prev => ({
          ...prev,
          todayAppointments: todayApts.length,
          scheduled: scheduled.length,
          completionRate: appointmentsRes.data.length > 0 
            ? Math.round((completed.length / appointmentsRes.data.length) * 100) 
            : 0
        }));
      }

      // Fetch all doctors
      const doctorsRes = await doctorApi.getAll();
      if (doctorsRes.success && doctorsRes.data) {
        setDoctors(doctorsRes.data);
        setStats(prev => ({ ...prev, totalDoctors: doctorsRes.data.length }));
        if (doctorsRes.data.length > 0 && !selectedDoctor) {
          setSelectedDoctor(doctorsRes.data[0].doctor_id);
        }
      }

      // Fetch all patients count
      const patientsRes = await patientApi.getAll();
      if (patientsRes.success && patientsRes.data) {
        setStats(prev => ({ ...prev, totalPatients: patientsRes.data.length }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear auth data
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const handleConfirmAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to confirm this appointment?')) return;
    
    try {
      const result = await appointmentApi.update(appointmentId, { status: 'confirmed' });
      if (result.success) {
        alert('Appointment confirmed successfully!');
        fetchDashboardData(); // Refresh data
      } else {
        alert(result.message || 'Failed to confirm appointment');
      }
    } catch (error: any) {
      console.error('Error confirming appointment:', error);
      alert(error.message || 'Failed to confirm appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) return;
    
    try {
      const result = await appointmentApi.update(appointmentId, { status: 'cancelled' });
      if (result.success) {
        alert('Appointment cancelled successfully!');
        fetchDashboardData(); // Refresh data
      } else {
        alert(result.message || 'Failed to cancel appointment');
      }
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      alert(error.message || 'Failed to cancel appointment');
    }
  };

  const handleCompleteAppointment = async (appointmentId: number) => {
    if (!confirm('Mark this appointment as completed?')) return;
    
    try {
      const result = await appointmentApi.update(appointmentId, { status: 'completed' });
      if (result.success) {
        alert('Appointment marked as completed!');
        fetchDashboardData(); // Refresh data
      } else {
        alert(result.message || 'Failed to mark appointment as completed');
      }
    } catch (error: any) {
      console.error('Error completing appointment:', error);
      alert(error.message || 'Failed to complete appointment');
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) return;
    
    try {
      const result = await appointmentApi.delete(appointmentId);
      if (result.success) {
        alert('Appointment deleted successfully!');
        fetchDashboardData(); // Refresh data
      } else {
        alert(result.message || 'Failed to delete appointment');
      }
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      alert(error.message || 'Failed to delete appointment');
    }
  };

  // Helper function to check if appointment is completed
  const isAppointmentCompleted = (dateStr: string, timeStr: string) => {
    const now = new Date();
    const aptDate = new Date(dateStr);
    
    // Parse time (simplified)
    if (timeStr) {
      const timeParts = timeStr.split(':');
      if (timeParts.length >= 2) {
        aptDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
      }
    }
    
    return aptDate < now;
  };

  // Format appointments for display
  const formattedAppointments = appointments.map(apt => {
    // Get doctor and patient info if available
    const doctor = doctors.find(d => d.doctor_id === apt.doctor_id);
    
    return {
      ...apt,
      doctor_name: doctor?.name || 'Unknown Doctor',
      patient_name: `Patient ${apt.patient_id?.substring(0, 8) || 'Unknown'}`,
      hospital: doctor?.clinic_name || 'Hospital',
      date_formatted: apt.date ? new Date(apt.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'N/A',
      status_display: apt.status === 'pending' ? 'Pending' : 
                      apt.status === 'confirmed' ? 'Confirmed' : 
                      apt.status === 'completed' ? 'Completed' : 
                      apt.status === 'cancelled' ? 'Cancelled' : apt.status
    };
  });

  // Filter today's appointments
  const todayAppointments = formattedAppointments
    .filter(apt => {
      const today = new Date().toISOString().split('T')[0];
      return apt.date?.toString().startsWith(today);
    })
    .slice(0, 4);

  // Filter appointments based on search and status
  const filteredAppointments = formattedAppointments.filter(apt => {
    const matchesSearch = 
      apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      apt.status_display?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Mock time slots (in real app, fetch from backend)
  const getTimeSlotsForDate = (date: Date, doctorId: string) => {
    const slots = [];
    const hours = [9, 10, 11, 14, 15, 16];
    const minutes = [0, 30];
    
    for (const hour of hours) {
      for (const minute of minutes) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const timeDisplay = format(new Date().setHours(hour, minute), 'hh:mm a');
        
        // Check if slot is booked
        const isBooked = appointments.some(apt => 
          apt.doctor_id === doctorId &&
          apt.date &&
          new Date(apt.date).toDateString() === date.toDateString() &&
          apt.time?.startsWith(time)
        );
        
        slots.push({
          time: timeDisplay,
          status: isBooked ? 'booked' : 'available',
          patient: isBooked ? appointments.find(apt => 
            apt.doctor_id === doctorId && 
            apt.time?.startsWith(time)
          )?.patient_id : null
        });
      }
    }
    
    return slots;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-600">TCAMS</h1>
              <p className="text-gray-600 text-sm">Receptionist Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-gray-800 font-medium">Receptionist</p>
              <p className="text-gray-500 text-sm">Admin</p>
            </div>

            {/* Notifications */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Doctor Rescheduling Requests</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-gray-800">{notification.message}</p>
                          {!notification.read && (
                            <Badge className="bg-blue-600">New</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 text-sm">{notification.time}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              View Details
                            </Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-7">
                              Update Schedule
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 py-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1 text-sm">Today's Appointments</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayAppointments}</p>
              </div>
              <CalendarIcon className="w-7 h-7 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1 text-sm">Scheduled</p>
                <p className="text-2xl font-bold text-green-600">{stats.scheduled}</p>
              </div>
              <UserCheck className="w-7 h-7 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1 text-sm">Total Patients</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalPatients}</p>
              </div>
              <Users className="w-7 h-7 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1 text-sm">Total Doctors</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalDoctors}</p>
              </div>
              <UserCheck className="w-7 h-7 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4 bg-teal-50 border-teal-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-teal-600">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="w-7 h-7 text-teal-600" />
            </div>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Today's Schedule</h2>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments scheduled for today
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {todayAppointments.map((apt) => (
                <div key={apt.appointment_id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-800 text-sm font-medium">{apt.time || 'N/A'}</p>
                    </div>
                    <Badge
                      variant={apt.status === 'confirmed' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        apt.status === 'confirmed' ? 'bg-green-600' :
                        apt.status === 'pending' ? 'bg-orange-500' : ''
                      }`}
                    >
                      {apt.status_display}
                    </Badge>
                  </div>
                  <p className="text-gray-800 text-sm font-medium">{apt.patient_name}</p>
                  <p className="text-gray-500 text-xs">{apt.doctor_name}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Appointment Management */}
        <Card className="p-4 mb-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Appointment Management</h2>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient, doctor, or ID..."
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appointments Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 text-gray-700 text-sm font-semibold">Patient</th>
                  <th className="text-left p-3 text-gray-700 text-sm font-semibold">Doctor</th>
                  <th className="text-left p-3 text-gray-700 text-sm font-semibold">Hospital</th>
                  <th className="text-left p-3 text-gray-700 text-sm font-semibold">Reason</th>
                  <th className="text-left p-3 text-gray-700 text-sm font-semibold">Date</th>
                  <th className="text-left p-3 text-gray-700 text-sm font-semibold">Time</th>
                  <th className="text-left p-3 text-gray-700 text-sm font-semibold">Status</th>
                  <th className="text-left p-3 text-gray-700 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.appointment_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <p className="text-gray-800 text-sm font-medium">{apt.patient_name}</p>
                        <p className="text-gray-500 text-xs">#{apt.patient_id?.substring(0, 8)}</p>
                      </td>
                      <td className="p-3 text-gray-600 text-sm">{apt.doctor_name}</td>
                      <td className="p-3 text-gray-600 text-sm">{apt.hospital}</td>
                      <td className="p-3 text-gray-600 text-sm">{apt.remarks || 'Consultation'}</td>
                      <td className="p-3 text-gray-600 text-sm">{apt.date_formatted}</td>
                      <td className="p-3 text-gray-600 text-sm">{apt.time || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          apt.status === 'completed'
                            ? 'bg-gray-100 text-gray-700'
                            : apt.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : apt.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {apt.status_display}
                        </span>
                      </td>
                      <td className="p-3">
                        {apt.status === 'completed' ? (
                          <span className="text-gray-500 text-xs">Completed</span>
                        ) : apt.status === 'cancelled' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 text-xs h-7"
                            onClick={() => handleDeleteAppointment(apt.appointment_id)}
                          >
                            Delete
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            {apt.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 hover:text-green-700 text-xs h-7"
                                onClick={() => handleConfirmAppointment(apt.appointment_id)}
                              >
                                Confirm
                              </Button>
                            )}
                            {apt.status === 'confirmed' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-blue-600 hover:text-blue-700 text-xs h-7"
                                onClick={() => handleCompleteAppointment(apt.appointment_id)}
                              >
                                Complete
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 text-xs h-7"
                              onClick={() => handleCancelAppointment(apt.appointment_id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <p>Showing {filteredAppointments.length} of {appointments.length} appointments</p>
          </div>
        </Card>

        {/* Doctor Calendar View */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-gray-800">Doctor Calendar View</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.doctor_id} value={doctor.doctor_id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowCalendar(!showCalendar)}
                variant={showCalendar ? "default" : "outline"}
                size="sm"
              >
                <CalendarIconAlt className="w-4 h-4 mr-2" />
                {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
              </Button>
            </div>
          </div>

          {showCalendar ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Calendar */}
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <h3 className="text-gray-800 font-semibold mb-3">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </Card>
              </div>

              {/* Time Slots */}
              <div className="lg:col-span-2">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-800 font-semibold">
                      Available Slots - {doctors.find(d => d.doctor_id === selectedDoctor)?.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{format(selectedDate, 'MMMM dd, yyyy')}</p>
                  </div>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-2 gap-3">
                      {getTimeSlotsForDate(selectedDate, selectedDoctor).map((slot, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded border ${
                            slot.status === 'available'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-100 border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-800 font-medium">{slot.time}</span>
                            <Badge
                              variant={slot.status === 'available' ? 'default' : 'secondary'}
                              className={slot.status === 'available' ? 'bg-green-600' : ''}
                            >
                              {slot.status === 'available' ? 'Available' : 'Booked'}
                            </Badge>
                          </div>
                          {slot.patient && (
                            <p className="text-gray-600 text-xs">Patient: {slot.patient.substring(0, 8)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-700 text-sm">
                      <strong>Note:</strong> This is a view-only calendar. To create new appointments, 
                      doctors must manage their own availability through the Doctor Portal.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIconAlt className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Select a doctor and click "Show Calendar" to view their availability schedule
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
