import { NextRequest, NextResponse } from "next/server"
import openai from "@/lib/openai"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Extract all the analysis parameters
    const {
      selectedCountry,
      conflictScenario,
      offensiveCountry,
      defensiveCountry,
      scenarioDetails,
      severityLevel,
      timeFrame,
      tradeDependencies,
      sanctionsImpact,
      marketStability,
      defenseCapabilities,
      allianceSupport,
      strategicResources,
      unSupport,
      regionalInfluence,
      publicOpinion
    } = body

    // Find country names (assume we can get these from the codes)
    const selectedCountryName = selectedCountry // Will be country name
    const offensiveCountryName = offensiveCountry
    const defensiveCountryName = defensiveCountry

    // Create detailed prompt for OpenAI
    const prompt = `
You are a professional geopolitical analyst. Analyze this political simulation scenario and provide realistic assessments.

SIMULATION SCENARIO:
- Perspective Country: ${selectedCountryName}
- Conflict Type: ${conflictScenario}
- Offensive Country: ${offensiveCountryName}
- Defensive Country: ${defensiveCountryName}
- Scenario Details: ${scenarioDetails || "No additional details provided"}
- Severity Level: ${severityLevel || "Not specified"}
- Time Frame: ${timeFrame || "Not specified"}

CURRENT PARAMETERS (0-100 scale):
Economic Factors:
- Trade Dependencies: ${tradeDependencies}%
- Economic Sanctions Impact: ${sanctionsImpact}%
- Market Stability: ${marketStability}%

Military Readiness:
- Defense Capabilities: ${defenseCapabilities}%
- Alliance Support: ${allianceSupport}%
- Strategic Resources: ${strategicResources}%

Diplomatic Relations:
- UN Support: ${unSupport}%
- Regional Influence: ${regionalInfluence}%
- Public Opinion: ${publicOpinion}%

Please provide a realistic analysis from ${selectedCountryName}'s perspective. Return ONLY a valid JSON object with these exact fields:

{
  "diplomaticResponse": <number 0-100>,
  "militaryReadiness": <number 0-100>,
  "economicImpact": <number -50 to 50>,
  "publicSupport": <number 0-100>,
  "allianceStrength": <number 0-100>,
  "recommendations": [
    "<recommendation 1>",
    "<recommendation 2>",
    "<recommendation 3>",
    "<recommendation 4>",
    "<recommendation 5>"
  ],
  "summary": "<2-3 sentence overall assessment>"
}

Consider the geopolitical realities, current parameters, and provide realistic percentages. Economic impact can be negative. Make recommendations specific and actionable.
`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert geopolitical analyst. Always respond with valid JSON only, no additional text or formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error("No response from OpenAI")
    }

    // Parse the JSON response
    let analysisResult
    try {
      analysisResult = JSON.parse(response)
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", response)
      throw new Error("Invalid JSON response from OpenAI")
    }

    // Validate required fields
    const requiredFields = ['diplomaticResponse', 'militaryReadiness', 'economicImpact', 'publicSupport', 'allianceStrength', 'recommendations']
    for (const field of requiredFields) {
      if (analysisResult[field] === undefined) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult
    })

  } catch (error) {
    console.error("Error in AI analysis:", error)
    
    // Return fallback analysis if OpenAI fails
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed",
      analysis: {
        diplomaticResponse: 75,
        militaryReadiness: 65,
        economicImpact: -10,
        publicSupport: 60,
        allianceStrength: 70,
        recommendations: [
          "Engage in diplomatic negotiations to de-escalate tensions",
          "Strengthen economic partnerships with allied nations",
          "Enhance intelligence sharing capabilities",
          "Prepare contingency plans for various scenarios",
          "Monitor public sentiment and maintain transparency"
        ],
        summary: "Analysis temporarily unavailable. These are fallback recommendations based on general geopolitical principles."
      }
    })
  }
} 