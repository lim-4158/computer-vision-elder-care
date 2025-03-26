import { checkDatabaseSchema } from '@/lib/supabase/schema'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const schemaStatus = await checkDatabaseSchema()
    return NextResponse.json(schemaStatus)
  } catch (error) {
    console.error('Error in schema check:', error)
    return NextResponse.json({ error: 'Failed to check schema' }, { status: 500 })
  }
} 