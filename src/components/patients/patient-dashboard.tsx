'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Patient, VitalSigns, Medication } from '@/types'
import { UploadVitalsButton } from './upload-vitals-button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function PatientDashboard({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [todayVitals, setTodayVitals] = useState<VitalSigns | null>(null)
  const [todayMedications, setTodayMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPatientData()
  }, [patientId])

  async function fetchPatientData() {
    try {
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (patientError) throw patientError
      setPatient(patientData)

      // Fetch today's vital signs
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: vitalsData, error: vitalsError } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .gte('taken_at', today.toISOString())
        .order('taken_at', { ascending: false })
        .limit(1)
        .single()

      if (vitalsError && vitalsError.code !== 'PGRST116') throw vitalsError
      setTodayVitals(vitalsData)

      // Fetch today's medications
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .gte('taken_at', today.toISOString())
        .order('taken_at', { ascending: false })

      if (medicationsError) throw medicationsError
      setTodayMedications(medicationsData || [])

    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200 mb-4"></div>
          <div className="h-4 w-40 bg-blue-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-medium text-red-800">Patient Not Found</h2>
        <p className="mt-2 text-sm text-red-600">The requested patient record could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4">
      {/* Header with patient name and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{patient.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Patient ID: {patientId.slice(0, 8)}</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <UploadVitalsButton patientId={patientId} onUpload={fetchPatientData} />
          <Link href={`/dashboard/patients/${patientId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
            Edit Info
          </Link>
        </div>
      </div>

      {/* Vital Signs Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Today's Vital Signs</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-blue-700 mb-1">Systolic BP</div>
            <div className="text-3xl font-bold text-blue-900">{todayVitals?.systolic_bp || '-'}</div>
            <div className="text-xs text-blue-600 mt-1">mmHg</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-blue-700 mb-1">Diastolic BP</div>
            <div className="text-3xl font-bold text-blue-900">{todayVitals?.diastolic_bp || '-'}</div>
            <div className="text-xs text-blue-600 mt-1">mmHg</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-blue-700 mb-1">Blood Sugar</div>
            <div className="text-3xl font-bold text-blue-900">{todayVitals?.blood_sugar || '-'}</div>
            <div className="text-xs text-blue-600 mt-1">mg/dL</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-blue-700 mb-1">Fluid Input</div>
            <div className="text-3xl font-bold text-blue-900">{todayVitals?.fluid_input || '-'}</div>
            <div className="text-xs text-blue-600 mt-1">mL</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-blue-700 mb-1">Fluid Output</div>
            <div className="text-3xl font-bold text-blue-900">{todayVitals?.fluid_output || '-'}</div>
            <div className="text-xs text-blue-600 mt-1">mL</div>
          </div>
        </div>
      </div>

      {/* Medications Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-green-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Today's Medications</h2>
        </div>
        <div className="p-6">
          {todayMedications.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No medications recorded today</p>
              <p className="text-sm text-gray-400 mt-1">Medications will appear here when administered</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {todayMedications.map((medication) => (
                <div key={medication.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-800">{medication.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(medication.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}