import type { Metadata } from 'next';
import MainLayout from '@/components/layout/main-layout';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Hearing Care Management Dashboard - Manage appointments, patients, and practice operations.',
  keywords: ['dashboard', 'hearing care', 'audiologist', 'appointments', 'patients'],
};

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, Dr. Smith!</h1>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening in your practice today.</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Add New Patient
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Patients</h3>
            <p className="text-3xl font-bold text-foreground">1,234</p>
            <p className="text-sm text-green-600 flex items-center mt-2">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +12% from last month
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Upcoming Appointments</h3>
            <p className="text-3xl font-bold text-foreground">45</p>
            <p className="text-sm text-red-600 flex items-center mt-2">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              -5% from last week
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-foreground">$12,345</p>
            <p className="text-sm text-green-600 flex items-center mt-2">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +8% from last month
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {[
                {
                  name: 'John Doe',
                  time: '10:00 AM',
                  type: 'Hearing Test',
                  avatar: 'JD'
                },
                {
                  name: 'Jane Smith',
                  time: '11:30 AM',
                  type: 'Follow-up',
                  avatar: 'JS'
                },
                {
                  name: 'Mike Johnson',
                  time: '2:00 PM',
                  type: 'Consultation',
                  avatar: 'MJ'
                }
              ].map((appointment, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground">{appointment.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{appointment.name}</p>
                    <p className="text-sm text-muted-foreground">{appointment.time} • {appointment.type}</p>
                  </div>
                  <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Overview Chart */}
          <div className="bg-white p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Patient Overview</h2>
            <div className="h-64 flex items-end justify-center space-x-2">
              {[
                { month: 'Jan', new: 45, returning: 32 },
                { month: 'Feb', new: 52, returning: 38 },
                { month: 'Mar', new: 48, returning: 41 },
                { month: 'Apr', new: 61, returning: 35 },
                { month: 'May', new: 55, returning: 44 },
                { month: 'Jun', new: 58, returning: 47 }
              ].map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="flex flex-col space-y-1">
                    <div 
                      className="w-8 bg-primary rounded-t"
                      style={{ height: `${(data.new / 70) * 120}px` }}
                    ></div>
                    <div 
                      className="w-8 bg-accent rounded-t"
                      style={{ height: `${(data.returning / 70) * 120}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span className="text-sm text-muted-foreground">New Patients</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded"></div>
                <span className="text-sm text-muted-foreground">Returning Patients</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
