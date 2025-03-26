'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface UploadVitalsButtonProps {
  patientId: string
  onUpload: () => void
}

export function UploadVitalsButton({ patientId, onUpload }: UploadVitalsButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    setProgress(10)

    try {
      // Convert image to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      setProgress(40)

      // Process image with OCR API
      const response = await fetch('/api/ocr/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64String }),
      })

      setProgress(70)

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      const vitalSigns = await response.json()
      console.log('Extracted vital signs:', vitalSigns)

      // Fetch existing vitals
      const { data: existingVitals, error: fetchError } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('taken_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing vitals:', fetchError)
      }

      // Merge new vitals with existing ones
      const mergedVitals = {
        systolic_bp: vitalSigns.blood_pressure_systolic || existingVitals?.systolic_bp || 0,
        diastolic_bp: vitalSigns.blood_pressure_diastolic || existingVitals?.diastolic_bp || 0,
        blood_sugar: vitalSigns.blood_sugar || existingVitals?.blood_sugar || 0,
        fluid_input: existingVitals?.fluid_input || 0,
        fluid_output: existingVitals?.fluid_output || 0,
      }

      setProgress(90)

      // Save merged vitals to database
      const { error: dbError } = await supabase
        .from('vital_signs')
        .insert([
          {
            patient_id: patientId,
            ...mergedVitals,
          },
        ])

      if (dbError) throw dbError
      
      setProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        setProgress(0)
        onUpload()
      }, 500)
    } catch (error) {
      console.error('Error uploading vitals:', error)
      setError('Failed to process image. Please try again.')
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        id="vitals-upload"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <label
        htmlFor="vitals-upload"
        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isUploading 
            ? 'bg-blue-400 cursor-wait' 
            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
      >
        {isUploading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Vitals
          </div>
        )}
      </label>
      
      {isUploading && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}
    </div>
  )
} 