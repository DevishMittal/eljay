'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { Patient } from '@/types';
import { patientService } from '@/services/patientService';
import { hatService, HATFormData, HearingAidTrial } from '@/services/hatService';
import { useAuth } from '@/contexts/AuthContext';

type HATSubsection = 'audiologist' | 'assessment' | 'preferences' | 'trial' | 'order' | 'plan' | 'followup';
type FollowupSubsection = 'lead_management' | 'haf' | 'advance_paid';

export default function HATFormPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const { token } = useAuth();
  const [id, setId] = useState<string>('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubsection, setActiveSubsection] = useState<HATSubsection>('audiologist');
  const [activeFollowupSubsection, setActiveFollowupSubsection] = useState<FollowupSubsection>('lead_management');
  const [isEditing, setIsEditing] = useState(false);
  const [hearingAidTrials, setHearingAidTrials] = useState<HearingAidTrial[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [loadingHATForms, setLoadingHATForms] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState<HATFormData>({
    conductingAudiologist: '',
    hearingDifficultiesPerception: 'No',
    needForHearingAids: 'No',
    dexterityIssues: 'No',
    previousHearingAidExposure: 'No',
    visionProblems: 'No',
    smartphoneUsageFrequency: 'Often',
    additionalComments: '',
    priority1Situation: '',
    priority2Situation: '',
    priority3Situation: '',
    preferredEnvironments: [],
    trialConducted: 'No',
    manufacturer: '',
    style: '',
    color: '',
    earImpressionsTaken: 'No',
    hearingAidType: '',
    model: '',
    patientDecision: '',
    aphabProvided: 'No',
    followUpPlanningType: 'HAT - Lead Management',
    leadType: 'In Progress',
    reasonsForInProcess: '',
    nextFollowUpDate: '',
    additionalRemarks: ''
  });

  const subsections: { key: HATSubsection; label: string }[] = [
    { key: 'audiologist', label: 'Audiologist' },
    { key: 'assessment', label: 'Assessment' },
    { key: 'preferences', label: 'Preferences' },
    { key: 'trial', label: 'Trial' },
    { key: 'order', label: 'Order' },
    { key: 'plan', label: 'Plan' },
    { key: 'followup', label: 'Follow-up' }
  ];

  // Constants for dropdown options
  const hearingAidTypes = ['RIC (Receiver-in-Canal)', 'Behind-the-ear (BTE)'];
  const manufacturers = ['Phonak', 'Signia', 'Resound', 'Widex', 'Hansaton', 'Novax', 'Oticon', 'Unitron', 'Starkey', 'Bernafon', 'Other'];
  const styles = ['Behind-the-Ear (BTE)', 'Receiver-in-Canal (RIC)', 'In-the-Ear (ITE)', 'In-the-Canal (ITC)', 'Completely-in-Canal (CIC)', 'Invisible-in-Canal (IIC)', 'Custom'];
  const reasonsForInProcess = ['Given hearing devices for home trial', 'Wants to consult with family member', 'Wants to consult with doctor', 'Needs time to arrange money', 'Other'];
  const reasonsForNotPurchase = ['Placed order for hearing aids', 'Waiting for custom earpiece (Mould)', 'Other'];

  // Resolve params promise
  useEffect(() => {
    params.then(resolvedParams => {
      setId(resolvedParams.id);
    });
  }, [params]);

  const fetchHATForms = useCallback(async () => {
    if (!token || !patient || !patient.id || loadingHATForms) {
      return;
    }
    
    try {
      setLoadingHATForms(true);
      const response = await hatService.getHATForms(token);
      const patientHATForms = response.data.hatForms.filter(form => form.userId === patient.id);
      
      if (patientHATForms.length > 0) {
        // Use the most recent HAT form (sort by createdAt)
        const latestForm = patientHATForms.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setHasSavedData(true);
        setCurrentFormId(latestForm.id);
        
        // Add sample trial data if trial was conducted
        if (latestForm.trialConducted === 'Yes') {
          setHearingAidTrials([
            {
              id: '1',
              hearingAidType: 'RIC',
              manufacturer: 'Not specified',
              priceQuoted: 0,
              styleAndTechnologyLevel: 'Not specified'
            },
            {
              id: '2', 
              hearingAidType: 'RIC',
              manufacturer: 'Not specified',
              priceQuoted: 0,
              styleAndTechnologyLevel: 'Not specified'
            }
          ]);
        }
        
        setFormData({
          conductingAudiologist: latestForm.conductingAudiologist || '',
          hearingDifficultiesPerception: latestForm.hearingDifficultiesPerception || 'No',
          needForHearingAids: latestForm.needForHearingAids || 'No',
          dexterityIssues: latestForm.dexterityIssues || 'No',
          previousHearingAidExposure: latestForm.previousHearingAidExposure || 'No',
          visionProblems: latestForm.visionProblems || 'No',
          smartphoneUsageFrequency: latestForm.smartphoneUsageFrequency || 'Often',
          additionalComments: latestForm.additionalComments || '',
          priority1Situation: latestForm.priority1Situation || '',
          priority2Situation: latestForm.priority2Situation || '',
          priority3Situation: latestForm.priority3Situation || '',
          preferredEnvironments: latestForm.preferredEnvironments || [],
          trialConducted: latestForm.trialConducted || 'No',
          manufacturer: latestForm.manufacturer || '',
          style: latestForm.style || '',
          color: latestForm.color || '',
          earImpressionsTaken: latestForm.earImpressionsTaken || 'No',
          hearingAidType: latestForm.hearingAidType || '',
          model: latestForm.model || '',
          patientDecision: latestForm.patientDecision || '',
          aphabProvided: latestForm.aphabProvided || 'No',
          followUpPlanningType: latestForm.followUpPlanningType || 'HAT - Lead Management',
          leadType: latestForm.leadType || 'In Progress',
          reasonsForInProcess: latestForm.reasonsForInProcess || '',
          nextFollowUpDate: latestForm.nextFollowUpDate || '',
          additionalRemarks: latestForm.additionalRemarks || '',
          // HAF fields
          manufacturerName: latestForm.manufacturerName || '',
          styleHaf: latestForm.styleHaf || '',
          modelHaf: latestForm.modelHaf || '',
          leftSerial: latestForm.leftSerial || '',
          rightSerial: latestForm.rightSerial || '',
          mrp: latestForm.mrp || 0,
          dateOfBilling: latestForm.dateOfBilling || '',
          firstReviewDate: latestForm.firstReviewDate || '',
          discountedRate: latestForm.discountedRate || 0,
          rechargeable: latestForm.rechargeable || 'No',
          additionalCommentsHaf: latestForm.additionalCommentsHaf || '',
          // HA Advance Paid fields
          amountPaid: latestForm.amountPaid || 0,
          mrpAdvance: latestForm.mrpAdvance || 0,
          modelAdvance: latestForm.modelAdvance || '',
          reasonsForNotPurchase: latestForm.reasonsForNotPurchase || '',
          receipt: latestForm.receipt || '',
          manufacturerNameAdvance: latestForm.manufacturerNameAdvance || '',
          colorAdvance: latestForm.colorAdvance || ''
        });
        // Set to view mode when data is loaded
        setIsEditing(false);
      } else {
        setHasSavedData(false);
        setCurrentFormId(null);
        setIsEditing(true); // Allow editing when no saved data
      }
    } catch (error) {
      console.error('Error fetching HAT forms:', error);
      setHasSavedData(false);
      setCurrentFormId(null);
      setIsEditing(true); // Allow editing on error
    } finally {
      setLoadingHATForms(false);
    }
  }, [token, patient, loadingHATForms]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await patientService.getPatientById(id, token || undefined);
        setPatient(response.patient);
        
        // HAT forms will be loaded by the dedicated useEffect when patient is set
      } catch (err) {
        setError('Failed to fetch patient details. Please try again.');
        console.error('Error fetching patient:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPatient();
    }
  }, [id, token]);

  // Single useEffect to load HAT forms when patient is available
  useEffect(() => {
    if (patient && token && patient.id && !loadingHATForms) {
      fetchHATForms();
    }
  }, [patient, token, fetchHATForms, loadingHATForms]);

  const handleInputChange = (field: keyof HATFormData, value: string | string[] | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof HATFormData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const addHearingAidTrial = () => {
    const newTrial: HearingAidTrial = {
      id: Date.now().toString(),
      hearingAidType: '',
      manufacturer: '',
      priceQuoted: 0,
      styleAndTechnologyLevel: ''
    };
    setHearingAidTrials(prev => [...prev, newTrial]);
  };

  const removeHearingAidTrial = (trialId: string) => {
    setHearingAidTrials(prev => prev.filter(trial => trial.id !== trialId));
  };

  const updateHearingAidTrial = (trialId: string, field: keyof HearingAidTrial, value: string | number) => {
    setHearingAidTrials(prev => 
      prev.map(trial => 
        trial.id === trialId ? { ...trial, [field]: value } : trial
      )
    );
  };

  const saveHATForm = async () => {
    if (!token || !patient) return;
    
    try {
      setSaving(true);
      const formDataToSave = {
        ...formData,
        userId: patient.id,
        staffId: '451f0c8d-916f-422e-b12d-90fadeb8ebd0', // This should come from auth context
        // Note: hearingAidTrials is not included as it's not expected by the backend
      };
      
      if (currentFormId) {
        // Update existing form using PUT
        await hatService.updateHATForm(currentFormId, formDataToSave, token);
        alert('HAT form updated successfully!');
      } else {
        // Create new form using POST
        const response = await hatService.createHATForm(formDataToSave, token);
        setCurrentFormId(response.data.id);
        alert('HAT form saved successfully!');
      }
      
      // Fetch the updated form data after successful save
      await fetchHATForms();
      
      // Set to view mode after saving
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving HAT form:', error);
      alert('Failed to save HAT form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderAudiologistSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-6">Audiologist Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Conducting Audiologist
          </label>
          {hasSavedData && !isEditing ? (
            <div className="text-xs text-gray-900">
              {formData.conductingAudiologist || 'Not specified'}
            </div>
          ) : (
            <input
              type="text"
              value={formData.conductingAudiologist}
              onChange={(e) => handleInputChange('conductingAudiologist', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
              placeholder="Enter audiologist name"
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderAssessmentSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-6">Patient Assessment</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Hearing Difficulties Perception
            </label>
            {hasSavedData && !isEditing ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                {formData.hearingDifficultiesPerception || 'Not specified'}
              </span>
            ) : (
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="hearingDifficultiesPerception"
                      value={option}
                      checked={formData.hearingDifficultiesPerception === option}
                      onChange={(e) => handleInputChange('hearingDifficultiesPerception', e.target.value as 'Yes' | 'No')}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-xs text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Need for Hearing Aids
            </label>
            {hasSavedData && !isEditing ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                {formData.needForHearingAids || 'Not specified'}
              </span>
            ) : (
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="needForHearingAids"
                      value={option}
                      checked={formData.needForHearingAids === option}
                      onChange={(e) => handleInputChange('needForHearingAids', e.target.value as 'Yes' | 'No')}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-xs text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Dexterity Issues
            </label>
            {hasSavedData && !isEditing ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                {formData.dexterityIssues || 'Not specified'}
              </span>
            ) : (
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="dexterityIssues"
                      value={option}
                      checked={formData.dexterityIssues === option}
                      onChange={(e) => handleInputChange('dexterityIssues', e.target.value as 'Yes' | 'No')}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-xs text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Previous Hearing Aid Exposure
            </label>
            {hasSavedData && !isEditing ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                {formData.previousHearingAidExposure || 'Not specified'}
              </span>
            ) : (
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="previousHearingAidExposure"
                      value={option}
                      checked={formData.previousHearingAidExposure === option}
                      onChange={(e) => handleInputChange('previousHearingAidExposure', e.target.value as 'Yes' | 'No')}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-xs text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Vision Problems
            </label>
            {hasSavedData && !isEditing ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                {formData.visionProblems || 'Not specified'}
              </span>
            ) : (
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="visionProblems"
                      value={option}
                      checked={formData.visionProblems === option}
                      onChange={(e) => handleInputChange('visionProblems', e.target.value as 'Yes' | 'No')}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-xs text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Smartphone Usage Frequency
            </label>
            {hasSavedData && !isEditing ? (
              <div className="text-xs text-gray-900">
                {formData.smartphoneUsageFrequency || 'Not specified'}
              </div>
            ) : (
              <select
                value={formData.smartphoneUsageFrequency}
                onChange={(e) => handleInputChange('smartphoneUsageFrequency', e.target.value as 'Often' | 'Sometimes' | 'Rarely' | 'Never')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                aria-label="Smartphone Usage Frequency"
              >
                <option value="Often">Often</option>
                <option value="Sometimes">Sometimes</option>
                <option value="Rarely">Rarely</option>
                <option value="Never">Never</option>
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Additional Comments
        </label>
        {hasSavedData && !isEditing ? (
          <div className="text-xs text-gray-500 italic">
            {formData.additionalComments || 'No additional comments'}
          </div>
        ) : (
          <textarea
            value={formData.additionalComments}
            onChange={(e) => handleInputChange('additionalComments', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
            placeholder="Enter any additional observations"
          />
        )}
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-6">Listening Preferences</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-3">Top 3 Hearing Improvement Situations</h3>
          {hasSavedData && !isEditing ? (
            <div className="text-xs text-gray-500 italic">
              {formData.priority1Situation || formData.priority2Situation || formData.priority3Situation 
                ? `${formData.priority1Situation || 'Not specified'}, ${formData.priority2Situation || 'Not specified'}, ${formData.priority3Situation || 'Not specified'}`
                : 'No priority situations specified'
              }
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority 1 situation</label>
                <input
                  type="text"
                  value={formData.priority1Situation}
                  onChange={(e) => handleInputChange('priority1Situation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Priority 1 situation"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority 2 situation</label>
                <input
                  type="text"
                  value={formData.priority2Situation}
                  onChange={(e) => handleInputChange('priority2Situation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Priority 2 situation"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority 3 situation</label>
                <input
                  type="text"
                  value={formData.priority3Situation}
                  onChange={(e) => handleInputChange('priority3Situation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Priority 3 situation"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-3">Preferred Environments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {[
                'Conversation with 1-2 people in quiet',
                'Group conversation in quiet',
                'Television/Radio at normal volume',
                'Unfamiliar speaker on phone',
                'Hearing doorbell or knock',
                'Increased social contact',
                'Other specific situations'
              ].map((environment) => (
                <label key={environment} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.preferredEnvironments.includes(environment)}
                    onChange={(e) => handleArrayChange('preferredEnvironments', environment, e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-xs text-gray-700">{environment}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              {[
                'Conversation with 1-2 people in noise',
                'Group conversation in noise',
                'Familiar speaker on phone',
                'Hearing phone ring from another room',
                'Hearing traffic',
                'Place of worship'
              ].map((environment) => (
                <label key={environment} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.preferredEnvironments.includes(environment)}
                    onChange={(e) => handleArrayChange('preferredEnvironments', environment, e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-xs text-gray-700">{environment}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrialSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-6">Trial Assessment</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {hasSavedData && !isEditing ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
              {formData.trialConducted || 'Not specified'}
            </span>
          ) : (
            <>
              <input
                type="checkbox"
                id="trialConducted"
                checked={formData.trialConducted === 'Yes'}
                onChange={(e) => handleInputChange('trialConducted', e.target.checked ? 'Yes' : 'No')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="trialConducted" className="text-xs font-medium text-gray-700">
                Trial Conducted
              </label>
            </>
          )}
        </div>

        {(formData.trialConducted === 'Yes' || (hasSavedData && !isEditing)) && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-gray-700">Hearing Aid Trials</h3>
              {!hasSavedData || isEditing ? (
                <button
                  onClick={addHearingAidTrial}
                  className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-1 text-xs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Trial</span>
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              {hearingAidTrials.map((trial, index) => (
                <div key={trial.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-medium text-gray-700">Trial {index + 1}</h4>
                    <button
                      onClick={() => removeHearingAidTrial(trial.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                      aria-label="Remove trial"
                      title="Remove trial"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Hearing Aid Type</label>
                      <select
                        value={trial.hearingAidType}
                        onChange={(e) => updateHearingAidTrial(trial.id, 'hearingAidType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                        aria-label="Hearing Aid Type"
                      >
                        <option value="">Select type</option>
                        {hearingAidTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Manufacturer</label>
                      <select
                        value={trial.manufacturer}
                        onChange={(e) => updateHearingAidTrial(trial.id, 'manufacturer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                        aria-label="Manufacturer"
                      >
                        <option value="">Select manufacturer</option>
                        {manufacturers.map(manufacturer => (
                          <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price Quoted (₹)</label>
                      <input
                        type="number"
                        value={trial.priceQuoted}
                        onChange={(e) => updateHearingAidTrial(trial.id, 'priceQuoted', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                        placeholder="Enter price"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Style and Technology Level</label>
                      <input
                        type="text"
                        value={trial.styleAndTechnologyLevel}
                        onChange={(e) => updateHearingAidTrial(trial.id, 'styleAndTechnologyLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                        placeholder="Enter style and technology level"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrderSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-6">Order Details</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-xs text-blue-800">Order details for the hearing aid purchase.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Manufacturer</label>
            {hasSavedData && !isEditing ? (
              <div className="text-xs text-gray-900">
                {formData.manufacturer || 'Not specified'}
              </div>
            ) : (
              <select
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                aria-label="Manufacturer"
              >
                <option value="">Select manufacturer</option>
                {manufacturers.map(manufacturer => (
                  <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Style</label>
            {hasSavedData && !isEditing ? (
              <div className="text-xs text-gray-900">
                {formData.style || 'Not specified'}
              </div>
            ) : (
              <input
                type="text"
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                placeholder="Enter style"
              />
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
            {hasSavedData && !isEditing ? (
              <div className="text-xs text-gray-900">
                {formData.color || 'Not specified'}
              </div>
            ) : (
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                placeholder="Enter color"
              />
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Hearing Aid Type</label>
            {hasSavedData && !isEditing ? (
              <div className="text-xs text-gray-900">
                {formData.hearingAidType || 'Not specified'}
              </div>
            ) : (
              <select
                value={formData.hearingAidType}
                onChange={(e) => handleInputChange('hearingAidType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                aria-label="Hearing Aid Type"
              >
                <option value="">Select hearing aid type</option>
                {hearingAidTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Model</label>
            {hasSavedData && !isEditing ? (
              <div className="text-xs text-gray-900">
                {formData.model || 'Not specified'}
              </div>
            ) : (
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                placeholder="Enter model"
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="earImpressionsTaken"
            checked={formData.earImpressionsTaken === 'Yes'}
            onChange={(e) => handleInputChange('earImpressionsTaken', e.target.checked ? 'Yes' : 'No')}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="earImpressionsTaken" className="text-xs font-medium text-gray-700">
            Ear Impressions Taken
          </label>
        </div>
      </div>
    </div>
  );

  const renderPlanSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-6">Plan</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-3">Patient Decision</h3>
          {hasSavedData && !isEditing ? (
            <div className="text-xs text-gray-900">
              {formData.patientDecision || 'Not specified'}
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { value: 'Wants to discuss with family', label: 'Wants to discuss with family' },
                { value: 'Proceeding with purchase', label: 'Proceeding with purchase' },
                { value: 'Not interested', label: 'Not interested' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="patientDecision"
                    value={option.value}
                    checked={formData.patientDecision === option.value}
                    onChange={(e) => handleInputChange('patientDecision', e.target.value)}
                    className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-xs text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {hasSavedData && !isEditing ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                {formData.aphabProvided || 'Not specified'}
              </span>
            ) : (
              <>
                <input
                  type="checkbox"
                  id="aphabProvided"
                  checked={formData.aphabProvided === 'Yes'}
                  onChange={(e) => handleInputChange('aphabProvided', e.target.checked ? 'Yes' : 'No')}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="aphabProvided" className="text-xs font-medium text-gray-700">
                  APHAB Provided
                </label>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="followUpContactScheduled"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              disabled
            />
            <label htmlFor="followUpContactScheduled" className="text-xs font-medium text-gray-500">
              Follow-up Contact Scheduled (Not saved to backend)
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFollowupSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-6">Follow-up Planning</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-xs text-blue-800">Follow-up planning based on the patient&apos;s current status and needs.</p>
      </div>
      
      {/* Follow-up Subsection Navigation */}
      <div className="bg-[#ECECF0] rounded-full p-1 mb-6">
        <div className="flex">
          {[
            { key: 'lead_management', label: 'HAT - Lead Management' },
            { key: 'haf', label: 'HAF - Hearing Aid Fitting' },
            { key: 'advance_paid', label: 'HA Advance Paid' }
          ].map((subsection) => (
            <button
              key={subsection.key}
              onClick={() => setActiveFollowupSubsection(subsection.key as FollowupSubsection)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium transition-all duration-200 rounded-full flex-1 justify-center ${
                activeFollowupSubsection === subsection.key
                  ? 'text-[#0A0A0A] bg-white shadow-sm'
                  : 'text-[#0A0A0A] hover:bg-white/50'
              }`}
            >
              <span>{subsection.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Follow-up Content */}
      {activeFollowupSubsection === 'lead_management' && (
        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-4">Lead Management</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Lead Type Selection</label>
              <div className="flex space-x-4">
                {['Closed', 'In Progress'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="leadType"
                      value={option}
                      checked={formData.leadType === option}
                      onChange={(e) => handleInputChange('leadType', e.target.value as 'Closed' | 'In Progress')}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-xs text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.leadType === 'In Progress' && (
              <div className="border-l-4 border-blue-500 pl-4">
                <label className="block text-xs font-medium text-blue-700 mb-2">For In Progress Leads</label>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Reasons for in process</label>
                  <select
                    value={formData.reasonsForInProcess}
                    onChange={(e) => handleInputChange('reasonsForInProcess', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                    aria-label="Reasons for in process"
                  >
                    <option value="">Select reason</option>
                    {reasonsForInProcess.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Next Follow-up Date</label>
              <input
                type="date"
                value={formData.nextFollowUpDate}
                onChange={(e) => handleInputChange('nextFollowUpDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                aria-label="Next Follow-up Date"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Additional Remarks</label>
              <textarea
                value={formData.additionalRemarks}
                onChange={(e) => handleInputChange('additionalRemarks', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                placeholder="Enter additional remarks"
              />
            </div>
          </div>
        </div>
      )}

      {activeFollowupSubsection === 'haf' && (
        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-4">HAF (Hearing Aid Fitting)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Manufacturer Name</label>
                <select
                  value={formData.manufacturerName || ''}
                  onChange={(e) => handleInputChange('manufacturerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Manufacturer Name"
                >
                  <option value="">Select manufacturer</option>
                  {manufacturers.map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={formData.modelHaf || ''}
                  onChange={(e) => handleInputChange('modelHaf', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter model"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Left - Serial</label>
                <input
                  type="text"
                  value={formData.leftSerial || ''}
                  onChange={(e) => handleInputChange('leftSerial', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter left - serial"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Discounted Rate (₹)</label>
                <input
                  type="number"
                  value={formData.discountedRate || ''}
                  onChange={(e) => handleInputChange('discountedRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter discounted rate (₹)"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">First Review Date</label>
                              <input
                type="date"
                value={formData.firstReviewDate || ''}
                onChange={(e) => handleInputChange('firstReviewDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                aria-label="First Review Date"
              />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Additional Comments</label>
                <textarea
                  value={formData.additionalCommentsHaf || ''}
                  onChange={(e) => handleInputChange('additionalCommentsHaf', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter any additional comments"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Style</label>
                <select
                  value={formData.styleHaf || ''}
                  onChange={(e) => handleInputChange('styleHaf', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Style"
                >
                  <option value="">Select style</option>
                  {styles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Right - Serial</label>
                <input
                  type="text"
                  value={formData.rightSerial || ''}
                  onChange={(e) => handleInputChange('rightSerial', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter right - serial"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">MRP (₹)</label>
                <input
                  type="number"
                  value={formData.mrp || ''}
                  onChange={(e) => handleInputChange('mrp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter mrp (₹)"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Date of Billing</label>
                              <input
                type="date"
                value={formData.dateOfBilling || ''}
                onChange={(e) => handleInputChange('dateOfBilling', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                aria-label="Date of Billing"
              />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Rechargeable?</label>
                <div className="flex space-x-4">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="rechargeable"
                        value={option}
                        checked={formData.rechargeable === option}
                        onChange={(e) => handleInputChange('rechargeable', e.target.value as 'Yes' | 'No')}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="text-xs text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeFollowupSubsection === 'advance_paid' && (
        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-4">HA Advance Paid</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={formData.amountPaid || ''}
                  onChange={(e) => handleInputChange('amountPaid', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter amount paid (₹)"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">MRP (₹)</label>
                <input
                  type="number"
                  value={formData.mrpAdvance || ''}
                  onChange={(e) => handleInputChange('mrpAdvance', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter mrp (₹)"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={formData.modelAdvance || ''}
                  onChange={(e) => handleInputChange('modelAdvance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter model"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Reasons for not purchase</label>
                <select
                  value={formData.reasonsForNotPurchase || ''}
                  onChange={(e) => handleInputChange('reasonsForNotPurchase', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Reasons for not purchase"
                >
                  <option value="">Select reason</option>
                  {reasonsForNotPurchase.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Receipt</label>
                <input
                  type="text"
                  value={formData.receipt || ''}
                  onChange={(e) => handleInputChange('receipt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter receipt"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Manufacturer Name</label>
                <select
                  value={formData.manufacturerNameAdvance || ''}
                  onChange={(e) => handleInputChange('manufacturerNameAdvance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Manufacturer Name"
                >
                  <option value="">Select manufacturer</option>
                  {manufacturers.map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  value={formData.colorAdvance || ''}
                  onChange={(e) => handleInputChange('colorAdvance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter color"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSubsection) {
      case 'audiologist':
        return renderAudiologistSection();
      case 'assessment':
        return renderAssessmentSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'trial':
        return renderTrialSection();
      case 'order':
        return renderOrderSection();
      case 'plan':
        return renderPlanSection();
      case 'followup':
        return renderFollowupSection();
      default:
        return renderAudiologistSection();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading HAT form...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !patient) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error || 'Patient not found'}</p>
            <button 
              onClick={() => router.back()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/patients/${id}`} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <div>
                <h1 className="text-sm font-bold text-gray-900">New Hearing Aid Trial (HAT)</h1>
                <p className="text-xs text-gray-600">
                  Patient: {patient.full_name} • {new Date().toLocaleDateString()}
                  {hasSavedData && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Saved Data Loaded
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Options menu"
              title="Options"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <button 
              onClick={saveHATForm}
              disabled={saving}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-xs ${
                saving 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{currentFormId ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                
                  <span>{currentFormId ? 'Update' : 'Save'}</span>
                </>
              )}
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 text-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{isEditing ? 'View' : 'Edit'}</span>
            </button>
          </div>
        </div>

        {/* Subsection Navigation */}
        <div className="bg-[#ECECF0] rounded-full p-1">
          <div className="flex">
            {subsections.map((subsection) => (
              <button
                key={subsection.key}
                onClick={() => setActiveSubsection(subsection.key)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium transition-all duration-200 rounded-full flex-1 justify-center ${
                  activeSubsection === subsection.key
                    ? 'text-[#0A0A0A] bg-white shadow-sm'
                    : 'text-[#0A0A0A] hover:bg-white/50'
                }`}
              >
                <span>{subsection.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderCurrentSection()}
      </div>
    </MainLayout>
  );
}
