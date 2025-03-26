'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Patient } from '@/types'
import Link from 'next/link'

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
  }, [])

  async function fetchPatients() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading patients...</div>
  }

  if (patients.length === 0) {
    return <div className="text-gray-500">No patients added yet</div>
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <Link
          key={patient.id}
          href={`/dashboard/patients/${patient.id}`}
          className="block"
        >
          <div className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-500">
              Added on {new Date(patient.created_at).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
} 