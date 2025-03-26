'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface UploadMedicationButtonProps {
  patientId: string
  onUpload: () => void
}

export function UploadMedicationButton({ patientId, onUpload }: UploadMedicationButtonProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // TODO: Implement OCR processing here
      // For now, we'll just create a placeholder medication record
      const { error } = await supabase
        .from('medications')
        .insert([
          {
            patient_id: patientId,
            name: 'Placeholder Medication',
          },
        ])

      if (error) throw error
      onUpload()
    } catch (error) {
      console.error('Error uploading medication:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        id="medication-upload"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <label
        htmlFor="medication-upload"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Upload Medication'}
      </label>
    </div>
  )
} 