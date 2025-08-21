'use client';

import MainLayout from '@/components/layout/main-layout';
import { useRouter } from 'next/navigation';


export default function PatientsPage() {
  const router = useRouter();
  
  const patients = [
    {
      id: 'PAT008',
      name: 'Anna Rodriguez',
      email: 'anna.rodriguez@email.com',
      phone: '+1 234 567 8907',
      age: 30,
      gender: 'Female',
      type: 'B2C',
      status: 'New',
      lastVisit: 'Never'
    },
    {
      id: 'PAT011',
      name: 'Baby Miller',
      email: 'jennifer.miller@email.com',
      phone: '+1 234 567 8910',
      age: 0,
      gender: 'Female',
      type: 'B2B',
      status: 'New',
      lastVisit: 'Never'
    },
    {
      id: 'PAT005',
      name: 'David Thompson',
      email: 'david.thompson@email.com',
      phone: '+1 234 567 8904',
      age: 44,
      gender: 'Male',
      type: 'B2B',
      status: 'Existing',
      lastVisit: '8/5/2025'
    },
    {
      id: 'PAT002',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 234 567 8901',
      age: 36,
      gender: 'Female',
      type: 'B2C',
      status: 'Existing',
      lastVisit: '20/4/2025'
    },
    {
      id: 'PAT003',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 234 567 8902',
      age: 59,
      gender: 'Male',
      type: 'B2C',
      status: 'Existing',
      lastVisit: '18/3/2025'
    },
    {
      id: 'PAT004',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@email.com',
      phone: '+1 234 567 8903',
      age: 33,
      gender: 'Female',
      type: 'B2C',
      status: 'New',
      lastVisit: 'Never'
    },
    {
      id: 'PAT006',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '+1 234 567 8905',
      age: 47,
      gender: 'Female',
      type: 'B2C',
      status: 'Existing',
      lastVisit: '22/5/2025'
    },
    {
      id: 'PAT009',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+1 234 567 8908',
      age: 56,
      gender: 'Male',
      type: 'B2B',
      status: 'Existing',
      lastVisit: '1/6/2025'
    },
    {
      id: 'PAT001',
      name: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1 234 567 8900',
      age: 50,
      gender: 'Male',
      type: 'B2C',
      status: 'Existing',
      lastVisit: '15/5/2025'
    },
    {
      id: 'PAT010',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 234 567 8909',
      age: 39,
      gender: 'Female',
      type: 'B2C',
      status: 'Existing',
      lastVisit: '30/5/2025'
    },
    {
      id: 'PAT007',
      name: 'Tom Wilson',
      email: 'tom.wilson@email.com',
      phone: '+1 234 567 8906',
      age: 69,
      gender: 'Male',
      type: 'B2C',
      status: 'Existing',
      lastVisit: '15/4/2025'
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    return status === 'New' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  };

  const handlePatientClick = (patientId: string) => {
    // Extract just the ID part (e.g., "PAT008" -> "PAT008")
    router.push(`/patients/${patientId}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#101828' }}>Patients</h1>
            <p className="text-sm" style={{ color: '#4A5565' }}>{patients.length} of {patients.length} patients</p>
          </div>
          <div className="flex items-center space-x-3">
                         <button 
               className="p-2 hover:bg-muted rounded-lg transition-colors"
               aria-label="Filter patients"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
               </svg>
             </button>
             <button 
               className="p-2 hover:bg-muted rounded-lg transition-colors"
               aria-label="Sort patients"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
               </svg>
             </button>
                         <div className="flex items-center space-x-1 bg-white border border-border rounded-lg p-1">
               <button 
                 className="p-2 bg-muted rounded-md"
                 aria-label="List view"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                 </svg>
               </button>
               <button 
                 className="p-2 hover:bg-muted rounded-md"
                 aria-label="Grid view"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                 </svg>
               </button>
             </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Patient</span>
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                                     <th className="px-6 py-3 text-left">
                                           <input 
                        type="checkbox" 
                        className="rounded border-gray-300" 
                        aria-label="Select all patients"
                        id="select-all-patients"
                      />
                   </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0A0A0A' }}>Patient</th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0A0A0A' }}>Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0A0A0A' }}>Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0A0A0A' }}>Age</th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0A0A0A' }}>Gender</th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0A0A0A' }}>Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0A0A0A' }}>Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0A0A0A' }}>Last Visit</th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0A0A0A' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handlePatientClick(patient.id)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300" 
                        aria-label={`Select ${patient.name}`}
                        id={`select-${patient.id}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {getInitials(patient.name)}
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#0A0A0A' }}>{patient.name}</div>
                          <div className="text-sm" style={{ color: '#717182' }}>{patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#717182' }}>{patient.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#717182' }}>{patient.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#717182' }}>{patient.age}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#717182' }}>{patient.gender}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#717182' }}>{patient.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#717182' }}>{patient.lastVisit}</span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="p-1 hover:bg-muted rounded-md transition-colors"
                        aria-label="More options"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm" style={{ color: '#717182' }}>
              Showing 1 to {patients.length} of {patients.length} patients
            </span>
                         <select 
               className="px-3 py-1 border border-border rounded-md text-sm" 
               style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
               aria-label="Items per page"
               id="items-per-page"
             >
               <option value="25">25</option>
               <option value="50">50</option>
               <option value="100">100</option>
             </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors" style={{ color: '#717182' }}>
              &lt; Previous
            </button>
            <button className="px-3 py-1 text-sm bg-primary text-white rounded-md">1</button>
            <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors" style={{ color: '#717182' }}>
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
