'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface EditPatientInfoProps {
  patientId: string
  onSave: () => void
}

export function EditPatientInfo({ patientId, onSave }: EditPatientInfoProps) {
  const [patientName, setPatientName] = useState('')
  const [medications, setMedications] = useState<string[]>([])
  const [newMedication, setNewMedication] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchPatientData()
  }, [patientId])

  const fetchPatientData = async () => {
    try {
      setIsLoading(true)
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (patientError) throw patientError
      setPatientName(patientData.name || '')

      // Fetch medications
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('medications')
        .select('name')
        .eq('patient_id', patientId)
        .order('name', { ascending: true })

      if (medicationsError) throw medicationsError
      setMedications(medicationsData.map((med: any) => med.name))
    } catch (error) {
      console.error('Error fetching patient data:', error)
      setError('Failed to fetch patient data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      // Check for duplicates
      if (!medications.includes(newMedication.trim())) {
        setMedications([...medications, newMedication.trim()])
      }
      setNewMedication('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddMedication()
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      // Update patient name
      if (patientName.trim()) {
        const { error: nameError } = await supabase
          .from('patients')
          .update({ name: patientName.trim() })
          .eq('id', patientId)

        if (nameError) throw nameError
      }

      // Clear existing medications
      const { error: deleteError } = await supabase
        .from('medications')
        .delete()
        .eq('patient_id', patientId)

      if (deleteError) throw deleteError

      // Add new medications
      if (medications.length > 0) {
        const { error: medsError } = await supabase
          .from('medications')
          .insert(
            medications.map(name => ({ 
              patient_id: patientId, 
              name,
              taken_at: new Date().toISOString(),
              is_administered: false
            }))
          )

        if (medsError) throw medsError
      }

      setSaveSuccess(true)
      setTimeout(() => {
        onSave()
      }, 1000)
    } catch (error) {
      console.error('Error saving patient info:', error)
      setError('Failed to save patient information. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded mb-6"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2 mb-6"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Patient Information</h2>
      
      {/* Patient Name */}
      <div className="mb-6">
        <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-2">
          Patient Name
        </label>
        <input
          type="text"
          id="patient-name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition duration-200"
          placeholder="Enter patient name"
        />
      </div>
      
      {/* Medications */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medications
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMedication}
            onChange={(e) => setNewMedication(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition duration-200"
            placeholder="Enter medication name"
          />
          <button
            type="button"
            onClick={handleAddMedication}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            disabled={!newMedication.trim()}
          >
            Add
          </button>
        </div>
        
        {/* Medication List */}
        <div className="mt-4">
          {medications.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center text-gray-500">
              No medications added yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
              {medications.map((medication, index) => (
                <li key={index} className="flex justify-between items-center p-3 bg-white hover:bg-gray-50">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-800">{medication}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMedications(medications.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                    aria-label="Remove medication"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200
          `}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      {saveSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Patient information saved successfully!
          </div>
        </div>
      )}
    </div>
  )
} 