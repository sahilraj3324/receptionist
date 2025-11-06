'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearStoredReceptionist } from '@/lib/auth';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/doctors', label: 'Doctors', icon: '👨‍⚕️' },
  { href: '/patients', label: 'Patients', icon: '🏥' },
  { href: '/appointments', label: 'Appointments', icon: '📅' },
  { href: '/prescriptions', label: 'Prescriptions', icon: '💊' },
  { href: '/records', label: 'Medical Records', icon: '📋' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    clearStoredReceptionist();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white min-h-screen fixed left-0 top-0 shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-1">Reception Portal</h2>
        <p className="text-blue-100 text-sm">Medical Management</p>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition-all ${
                isActive
                  ? 'bg-blue-800 border-r-4 border-white font-semibold'
                  : 'hover:bg-blue-700'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-500">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-all active:scale-95"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

