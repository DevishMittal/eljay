// Commission calculation utilities based on Eljay ERP documentation
// Commission Structure from document:
// - Diagnostic procedures: 50%
// - Hearing aids below ₹15,000: 15%
// - Hearing aids ₹15,000-₹20,000: 20%
// - Hearing aids above ₹20,000: 25%

export interface CommissionCalculation {
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  category: 'diagnostic' | 'hearing_aid_low' | 'hearing_aid_medium' | 'hearing_aid_high';
}

export interface ProcedurePricing {
  name: string;
  price: number;
  category: 'diagnostic' | 'hearing_aid' | 'service';
}

// Procedure pricing from the document
export const PROCEDURE_PRICING: ProcedurePricing[] = [
  // Diagnostic procedures (50% commission)
  { name: 'ECochG', price: 3300, category: 'diagnostic' },
  { name: 'VNG', price: 3300, category: 'diagnostic' },
  { name: 'V-HIT', price: 2300, category: 'diagnostic' },
  { name: 'VNG with DVA', price: 4300, category: 'diagnostic' },
  { name: 'Balance Assessment (VEMP + ECochG + VNG + V-HIT)', price: 11500, category: 'diagnostic' },
  { name: 'Glycerol Dehydration Test', price: 1200, category: 'diagnostic' },
  { name: 'Pure Tone Audiometry', price: 500, category: 'diagnostic' },
  { name: 'PTA & IMP', price: 1000, category: 'diagnostic' },
  { name: 'Speech Audiometry', price: 400, category: 'diagnostic' },
  { name: 'Tinnitus', price: 400, category: 'diagnostic' },
  { name: 'OAE', price: 1200, category: 'diagnostic' },
  { name: 'VEMP', price: 2600, category: 'diagnostic' },
  { name: 'Free field Audiometry/Aided Audiogram', price: 500, category: 'diagnostic' },
  { name: 'ASSR', price: 2400, category: 'diagnostic' },
  { name: 'SISI/TDT', price: 400, category: 'diagnostic' },
  { name: 'BERA', price: 2400, category: 'diagnostic' },
  { name: 'Impedance Audiometry', price: 600, category: 'diagnostic' },
  
  // Services (no commission)
  { name: 'Home Visit', price: 500, category: 'service' },
  { name: 'Fine Tuning', price: 500, category: 'service' },
  { name: 'TRT', price: 500, category: 'service' },
  { name: 'Service', price: 0, category: 'service' },
  { name: 'Speech & Language Therapy', price: 600, category: 'service' },
  { name: 'Speech & Language Evaluation', price: 1000, category: 'service' },
  { name: 'Hearing Aid Consultation', price: 500, category: 'service' },
];

// Commission rates based on document
export const COMMISSION_RATES = {
  diagnostic: 0.50, // 50%
  hearing_aid_low: 0.15, // 15% (below ₹15,000)
  hearing_aid_medium: 0.20, // 20% (₹15,000-₹20,000)
  hearing_aid_high: 0.25, // 25% (above ₹20,000)
  service: 0, // 0% for services
};

/**
 * Calculate commission for a given amount and procedure type
 */
export function calculateCommission(
  amount: number, 
  procedureName?: string, 
  isHearingAid: boolean = false
): CommissionCalculation {
  let category: CommissionCalculation['category'] = 'diagnostic';
  let commissionRate = COMMISSION_RATES.diagnostic;

  if (isHearingAid) {
    if (amount < 15000) {
      category = 'hearing_aid_low';
      commissionRate = COMMISSION_RATES.hearing_aid_low;
    } else if (amount >= 15000 && amount <= 20000) {
      category = 'hearing_aid_medium';
      commissionRate = COMMISSION_RATES.hearing_aid_medium;
    } else {
      category = 'hearing_aid_high';
      commissionRate = COMMISSION_RATES.hearing_aid_high;
    }
  } else if (procedureName) {
    // Check if it's a service (no commission)
    const procedure = PROCEDURE_PRICING.find(p => 
      p.name.toLowerCase().includes(procedureName.toLowerCase()) ||
      procedureName.toLowerCase().includes(p.name.toLowerCase())
    );
    
    if (procedure && procedure.category === 'service') {
      commissionRate = COMMISSION_RATES.service;
    }
  }

  const commissionAmount = amount * commissionRate;

  return {
    amount,
    commissionRate,
    commissionAmount,
    category,
  };
}

/**
 * Get procedure price by name
 */
export function getProcedurePrice(procedureName: string): number {
  const procedure = PROCEDURE_PRICING.find(p => 
    p.name.toLowerCase().includes(procedureName.toLowerCase()) ||
    procedureName.toLowerCase().includes(p.name.toLowerCase())
  );
  
  return procedure ? procedure.price : 0;
}

/**
 * Check if a procedure is a hearing aid
 */
export function isHearingAid(procedureName: string): boolean {
  const hearingAidKeywords = [
    'hearing aid', 'hearing device', 'audéo', 'phonak', 'signia', 
    'resound', 'widex', 'hansaton', 'novax', 'ric', 'bte', 
    'receiver-in-canal', 'behind-the-ear'
  ];
  
  const lowerName = procedureName.toLowerCase();
  return hearingAidKeywords.some(keyword => lowerName.includes(keyword));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate total commission for multiple items
 */
export function calculateTotalCommission(items: Array<{
  amount: number;
  procedureName?: string;
  isHearingAid?: boolean;
}>): {
  totalAmount: number;
  totalCommission: number;
  breakdown: CommissionCalculation[];
} {
  const breakdown = items.map(item => 
    calculateCommission(item.amount, item.procedureName, item.isHearingAid)
  );
  
  const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);
  const totalCommission = breakdown.reduce((sum, item) => sum + item.commissionAmount, 0);
  
  return {
    totalAmount,
    totalCommission,
    breakdown,
  };
}

/**
 * Get commission rate description
 */
export function getCommissionRateDescription(rate: number): string {
  const percentage = (rate * 100).toFixed(0);
  return `${percentage}%`;
}

/**
 * Get category description
 */
export function getCategoryDescription(category: CommissionCalculation['category']): string {
  const descriptions = {
    diagnostic: 'Diagnostic Procedure',
    hearing_aid_low: 'Hearing Aid (< ₹15,000)',
    hearing_aid_medium: 'Hearing Aid (₹15,000-₹20,000)',
    hearing_aid_high: 'Hearing Aid (> ₹20,000)',
  };
  
  return descriptions[category];
}
