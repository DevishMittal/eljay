import { patientService } from '@/services/patientService';
import { UserAppointment } from '@/types';

export interface PatientProcedureInfo {
  hasHAT: boolean;
  hasOAE: boolean;
  hatAppointments: UserAppointment[];
  oaeAppointments: UserAppointment[];
}

/**
 * Check if a patient has HAT or OAE procedures in their appointments
 */
export async function checkPatientProcedures(
  patientId: string, 
  token: string
): Promise<PatientProcedureInfo> {
  try {
    // Get user appointments
    const appointmentsResponse = await patientService.getUserAppointments(patientId, token);
    const appointments = appointmentsResponse.data?.appointments || [];

    // Check for HAT and OAE procedures
    const hatAppointments = appointments.filter(appointment => 
      appointment.procedures && 
      (appointment.procedures.toLowerCase().includes('hat') || 
       appointment.procedures.toLowerCase().includes('hearing aid trial') ||
       appointment.procedures.toLowerCase().includes('hearing aided testing'))
    );

    const oaeAppointments = appointments.filter(appointment => 
      appointment.procedures && 
      (appointment.procedures.toLowerCase().includes('oae') || 
       appointment.procedures.toLowerCase().includes('otoacoustic') ||
       appointment.procedures.toLowerCase().includes('emissions'))
    );

    return {
      hasHAT: hatAppointments.length > 0,
      hasOAE: oaeAppointments.length > 0,
      hatAppointments,
      oaeAppointments
    };
  } catch (error) {
    console.error('Error checking patient procedures:', error);
    return {
      hasHAT: false,
      hasOAE: false,
      hatAppointments: [],
      oaeAppointments: []
    };
  }
}

/**
 * Get procedure display name for better matching
 */
export function getProcedureDisplayName(procedureName: string): string {
  const lowerName = procedureName.toLowerCase();
  
  if (lowerName.includes('hat') || lowerName.includes('hearing aid trial') || lowerName.includes('hearing aided testing')) {
    return 'HAT';
  }
  
  if (lowerName.includes('oae') || lowerName.includes('otoacoustic') || lowerName.includes('emissions')) {
    return 'OAE';
  }
  
  return procedureName;
}
