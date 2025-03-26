export interface Patient {
  id: string
  name: string
  created_at: string
}

export interface VitalSigns {
  id: string
  patient_id: string
  systolic_bp: number
  diastolic_bp: number
  blood_sugar: number
  fluid_input: number
  fluid_output: number
  taken_at: string
  created_at: string
}

export interface Medication {
  id: string
  patient_id: string
  name: string
  taken_at: string
  created_at: string
} 