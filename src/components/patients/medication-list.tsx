import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface MedicationListProps {
  patientId: string
}

interface Medication {
  id: string
  name: string
  given: boolean
}

export function MedicationList({ patientId }: MedicationListProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMedications()
  }, [patientId])

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)

      if (error) throw error
      setMedications(data.map((med: any) => ({ ...med, given: false })))
    } catch (error) {
      console.error('Error fetching medications:', error)
      setError('Failed to fetch medications. Please try again.')
    }
  }

  const handleToggleGiven = (id: string) => {
    setMedications(medications.map(med => med.id === id ? { ...med, given: !med.given } : med))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const updates = medications.filter(med => med.given).map(med => ({ id: med.id, given: med.given }))
      const { error: dbError } = await supabase
        .from('medications')
        .upsert(updates, { onConflict: 'id' })

      if (dbError) throw dbError
      fetchMedications() // Refresh the list
    } catch (error) {
      console.error('Error saving medications:', error)
      setError('Failed to save medications. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Medications</h2>
      <ul className="mb-4">
        {medications.map((medication) => (
          <li key={medication.id} className="flex justify-between items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={medication.given}
                onChange={() => handleToggleGiven(medication.id)}
                className="mr-2"
              />
              {medication.name}
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
} 