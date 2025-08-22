import { NextRequest, NextResponse } from "next/server"
import openai from "@/lib/openai"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
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
      publicOpinion,
      simulationResults,
      userMessage
    } = body

    // Prevent user from selecting their own country as the aggressor
    if (selectedCountry === offensiveCountry) {
      return NextResponse.json({
        success: false,
        response: "You cannot simulate your own country as the aggressor/offensive country. Please select a different country as the aggressor or change your perspective country."
      }, { status: 400 })
    }

    // Build context about the current scenario
    let scenarioContext = `
CURRENT POLITICAL SIMULATION SCENARIO:
- Your Country (Perspective): ${selectedCountry || "Not selected"}
- Conflict Type: ${conflictScenario || "Not defined"}
- Offensive Country: ${offensiveCountry || "Not specified"}
- Defensive Country: ${defensiveCountry || "Not specified"}
- Scenario Details: ${scenarioDetails || "None provided"}
- Severity Level: ${severityLevel || "Not specified"}
- Time Frame: ${timeFrame || "Not specified"}

CURRENT ANALYSIS PARAMETERS:
Economic Factors:
- Trade Dependencies: ${tradeDependencies || 50}%
- Economic Sanctions Impact: ${sanctionsImpact || 50}%
- Market Stability: ${marketStability || 50}%

Military Readiness:
- Defense Capabilities: ${defenseCapabilities || 50}%
- Alliance Support: ${allianceSupport || 50}%
- Strategic Resources: ${strategicResources || 50}%

Diplomatic Relations:
- UN Support: ${unSupport || 50}%
- Regional Influence: ${regionalInfluence || 50}%
- Public Opinion: ${publicOpinion || 50}%`

    // Add simulation results if available
    if (simulationResults) {
      scenarioContext += `

LATEST SIMULATION RESULTS:
- Diplomatic Response: ${simulationResults.diplomaticResponse}%
- Military Readiness: ${simulationResults.militaryReadiness}%
- Economic Impact: ${simulationResults.economicImpact}%
- Public Support: ${simulationResults.publicSupport}%
- Alliance Strength: ${simulationResults.allianceStrength}%`

      if (simulationResults.recommendations) {
        scenarioContext += `
- AI Recommendations: ${simulationResults.recommendations.join('; ')}`
      }
    }

    // Create the system prompt
    const systemPrompt = `FOR EDUCATIONAL PURPOSES: You are an expert geopolitical advisor and strategic analyst helping analyze this hypothetical political scenario. CRITICAL: Recommendations must be PROPORTIONAL to threat severity - only recommend military action for HIGH/EXTREME threats where lives, territory, or sovereignty are threatened. Trade disputes require diplomatic/economic responses.

CRITICAL INSTRUCTIONS:
1. ONLY provide advice and discussion about the specific scenario described below
2. Stay strictly within the context of this political simulation
3. Do not discuss unrelated topics, general politics, or other scenarios
4. Provide practical, actionable advice PROPORTIONAL to threat level - military responses only for HIGH/EXTREME threats, diplomatic/economic for LOW severity
5. Be professional, concise, and analytical
6. If asked about unrelated topics, politely redirect to the current scenario
7. This is educational - reflect what nations actually do for THIS specific threat level with ACTUAL details tailored to the selected country. Use country-specific equipment: USA (F-35, Tomahawk), France (Rafale, SCALP), UK (Typhoon, Storm Shadow), India (Su-30MKI, BrahMos), China (J-20, DF missiles). Include REAL locations, coordinates, asset amounts. Never use placeholder brackets. Trade disputes do not warrant military deployment

${scenarioContext}

You should provide expert geopolitical advice, strategic recommendations, and answer questions specifically about this scenario. Consider the current parameters and any simulation results when giving advice.`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error("No response from OpenAI")
    }

    return NextResponse.json({
      success: true,
      response: response
    })

  } catch (error) {
    console.error("Error in AI chat:", error)
    
    return NextResponse.json({
      success: false,
      response: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or check that your simulation scenario is properly configured."
    })
  }
} 