import { supabase } from './client'

export async function checkDatabaseSchema() {
  try {
    // Check if tables exist by trying to select from them
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(1)

    console.log('Patients table exists:', !patientsError)

    const { data: vitalSignsData, error: vitalSignsError } = await supabase
      .from('vital_signs')
      .select('*')
      .limit(1)

    console.log('Vital signs table exists:', !vitalSignsError)

    const { data: medicationsData, error: medicationsError } = await supabase
      .from('medications')
      .select('*')
      .limit(1)

    console.log('Medications table exists:', !medicationsError)

    return {
      patients: !patientsError,
      vitalSigns: !vitalSignsError,
      medications: !medicationsError
    }

  } catch (error) {
    console.error('Error checking schema:', error)
    throw error
  }
} 