import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      )
    }

    // Format the base64 image for OpenAI Vision API
    const imageUrl = `data:image/jpeg;base64,${image}`

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Please analyze this medical vital signs image and extract the following values in JSON format: blood_pressure_systolic, blood_pressure_diastolic, heart_rate, blood_sugar, oxygen_saturation. Return ONLY a JSON object with these keys and numeric values. If a value is not found, use 0."
          },
          {
            type: "input_image",
            image_url: imageUrl,
            detail: "high"
          }
        ]
      }]
    })

    const content = response.output_text
    if (!content) {
      throw new Error('No content in response')
    }

    try {
      const jsonString = content.replace(/```json\s*|\s*```/g, '');
      const parsedContent = JSON.parse(jsonString);
      const vitals = {
        blood_pressure_systolic: Number(parsedContent.blood_pressure_systolic) || 0,
        blood_pressure_diastolic: Number(parsedContent.blood_pressure_diastolic) || 0,
        heart_rate: Number(parsedContent.heart_rate) || 0,
        blood_sugar: Number(parsedContent.blood_sugar) || 0,
        oxygen_saturation: Number(parsedContent.oxygen_saturation) || 0
      }
      return NextResponse.json(vitals)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', content)
      throw new Error('Failed to parse OpenAI response')
    }
  } catch (error: any) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
} 