import openai from './client'

interface VitalSignsData {
  systolic_bp: number
  diastolic_bp: number
  blood_sugar: number
  fluid_input: number
  fluid_output: number
}

export async function processVitalsImage(imageBase64: string): Promise<VitalSignsData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the following vital signs from this image: Systolic BP, Diastolic BP, Blood Sugar, Fluid Input, and Fluid Output. Return only the numbers in a structured format. If any value is not found, return 0 for that value."
            },
            {
              type: "input_image",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    })

    // Parse the response to extract numbers
    const text = response.choices[0].message.content || ''
    const numbers = text.match(/\d+/g) || []
    
    // Map the numbers to the corresponding vital signs
    // Note: This is a simple implementation and might need adjustment based on your specific image format
    return {
      systolic_bp: parseInt(numbers[0]) || 0,
      diastolic_bp: parseInt(numbers[1]) || 0,
      blood_sugar: parseInt(numbers[2]) || 0,
      fluid_input: parseInt(numbers[3]) || 0,
      fluid_output: parseInt(numbers[4]) || 0
    }
  } catch (error) {
    console.error('Error processing image:', error)
    throw error
  }
} 