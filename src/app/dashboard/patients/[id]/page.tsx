import { PatientDashboard } from '@/components/patients/patient-dashboard'
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher'

interface PageProps {
  params: {
    id: string
  }
}

export default async function PatientPage({ params }: PageProps) {
  const { id } = await params
  return <PatientDashboard patientId={id} />
} 