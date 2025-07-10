import { NextRequest, NextResponse } from "next/server"
import openai from "@/lib/openai"

export const runtime = "edge"

interface SimulationRequest {
  user_country: string
  conflict_type: string
  offensive_country: string
  defensive_country: string
  parameters?: Record<string, any>
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SimulationRequest

  const {
    user_country,
    conflict_type,
    offensive_country,
    defensive_country,
    parameters = {},
  } = body

  if (!user_country || !conflict_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const prompt = `You are a political advisor analyzing a ${conflict_type} scenario.\n\nUser Country: ${user_country}\nOffensive Country: ${offensive_country}\nDefensive Country: ${defensive_country}\nParameters: ${JSON.stringify(parameters)}\n\nProvide a strategic risk assessment and five actionable recommendations.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert geopolitical strategist." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content

    return NextResponse.json({ recommendations: content })
  } catch (err: any) {
    console.error("OpenAI error", err)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
} 