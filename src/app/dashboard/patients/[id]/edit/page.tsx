'use client'

import { EditPatientInfo } from '@/components/patients/edit-patient-info'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditPatientPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  if (!id) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200 mb-4"></div>
          <div className="h-4 w-40 bg-blue-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/dashboard/patients/${id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Patient Dashboard
        </Link>
      </div>
      
      <EditPatientInfo 
        patientId={id} 
        onSave={() => router.push(`/dashboard/patients/${id}`)} 
      />
    </div>
  )
} 