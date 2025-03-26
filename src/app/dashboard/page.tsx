import { AddPatientForm } from '@/components/patients/add-patient-form'
import { PatientList } from '@/components/patients/patient-list'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Patient</h2>
        <AddPatientForm />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Patients</h2>
        <PatientList />
      </div>
    </div>
  )
} 