import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface SimulationParams {
  userCountry: any
  conflictType: any
  offensiveCountry: any
  defensiveCountry: any
  economicFactors?: {
    tradeDependencies: number
    sanctionsImpact: number
    marketStability: number
  }
  militaryFactors?: {
    readiness: number
    capabilities: number
    allianceSupport: number
  }
  diplomaticFactors?: {
    influence: number
    relationships: number
    negotiationPosition: number
  }
}

export async function generateStrategicRecommendations(
  params: SimulationParams
): Promise<{
  recommendations: string[]
  analysis: {
    diplomaticSuccess: number
    militaryReadiness: number
    economicImpact: number
    publicSupport: number
    allianceStrength: number
  }
  summary: string
}> {
  try {
    const prompt = createAnalysisPrompt(params)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a senior political advisor and strategic analyst with expertise in international relations, geopolitics, and conflict resolution. Your task is to provide strategic recommendations for political scenarios involving ${params.userCountry.name}.

You must respond in a specific JSON format with exactly these fields:
{
  "recommendations": [array of 5-7 specific actionable recommendations],
  "analysis": {
    "diplomaticSuccess": number (0-100),
    "militaryReadiness": number (0-100), 
    "economicImpact": number (-50 to +50),
    "publicSupport": number (0-100),
    "allianceStrength": number (0-100)
  },
  "summary": "A brief strategic overview paragraph"
}

Base your analysis on real geopolitical factors, economic data, military capabilities, and diplomatic relationships. Consider historical precedents and current global dynamics.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const result = JSON.parse(response)
    
    // Validate the response structure
    if (!result.recommendations || !result.analysis || !result.summary) {
      throw new Error('Invalid response structure from OpenAI')
    }

    return result
  } catch (error) {
    console.error('Error generating recommendations:', error)
    
    // Return fallback analysis if OpenAI fails
    return generateFallbackAnalysis(params)
  }
}

function createAnalysisPrompt(params: SimulationParams): string {
  const { userCountry, conflictType, offensiveCountry, defensiveCountry } = params

  return `
SCENARIO ANALYSIS REQUEST:

Your Country: ${userCountry.name} (${userCountry.flag})
- Power Rating: ${userCountry.power_rating}/100
- GDP: $${userCountry.gdp.toLocaleString()} billion
- Military Budget: $${userCountry.military_budget.toLocaleString()} million
- Nuclear Weapons: ${userCountry.nuclear_weapons}
- Cyber Capabilities: ${userCountry.cyber_capabilities}/100
- Political Stability: ${userCountry.political_stability}/100
- Economic Stability: ${userCountry.economic_stability}/100
- Diplomatic Influence: ${userCountry.diplomatic_influence}/100

CONFLICT SCENARIO:
Type: ${conflictType.name} (${conflictType.icon})
Description: ${conflictType.description}
Typical Duration: ${conflictType.typical_duration}
Economic Impact Factor: ${conflictType.economic_impact_factor}
Military Requirement: ${conflictType.military_requirement}/100
Diplomatic Complexity: ${conflictType.diplomatic_complexity}/100

OFFENSIVE COUNTRY: ${offensiveCountry.name} (${offensiveCountry.flag})
- Power Rating: ${offensiveCountry.power_rating}/100
- GDP: $${offensiveCountry.gdp.toLocaleString()} billion
- Military Budget: $${offensiveCountry.military_budget.toLocaleString()} million
- Nuclear Weapons: ${offensiveCountry.nuclear_weapons}

DEFENSIVE COUNTRY: ${defensiveCountry.name} (${defensiveCountry.flag})
- Power Rating: ${defensiveCountry.power_rating}/100
- GDP: $${defensiveCountry.gdp.toLocaleString()} billion
- Military Budget: $${defensiveCountry.military_budget.toLocaleString()} million
- Nuclear Weapons: ${defensiveCountry.nuclear_weapons}

RELATIONSHIPS:
${userCountry.name} Allies: ${userCountry.allies.join(', ')}
${userCountry.name} Rivals: ${userCountry.rivals.join(', ')}
Trade Dependencies: ${userCountry.trade_dependencies.join(', ')}

ANALYSIS REQUEST:
Please provide a strategic analysis for how ${userCountry.name} should respond to this ${conflictType.name} between ${offensiveCountry.name} and ${defensiveCountry.name}. Consider:

1. Economic implications and trade relationships
2. Military capabilities and alliance structures
3. Diplomatic opportunities and risks
4. Domestic political considerations
5. International law and precedent
6. Long-term geopolitical consequences

Provide specific, actionable recommendations that ${userCountry.name} can implement immediately.
`
}

function generateFallbackAnalysis(params: SimulationParams) {
  const { userCountry, conflictType, offensiveCountry, defensiveCountry } = params

  // Calculate basic scores based on country data
  const diplomaticSuccess = Math.min(
    85, 
    userCountry.diplomatic_influence + 
    (userCountry.allies.length * 5) - 
    (conflictType.diplomatic_complexity * 0.3)
  )

  const militaryReadiness = Math.min(
    90,
    (userCountry.power_rating * 0.6) + 
    (userCountry.military_budget / 10000) +
    (userCountry.allies.length * 3)
  )

  const economicImpact = -Math.abs(
    (conflictType.economic_impact_factor * 100) *
    (userCountry.trade_dependencies.includes(offensiveCountry.code) || 
     userCountry.trade_dependencies.includes(defensiveCountry.code) ? 1.5 : 1)
  )

  const publicSupport = Math.min(
    85,
    userCountry.political_stability + 
    (userCountry.allies.includes(defensiveCountry.code) ? 15 : 0) -
    (userCountry.allies.includes(offensiveCountry.code) ? 20 : 0)
  )

  const allianceStrength = Math.min(
    95,
    (userCountry.allies.length * 8) + 
    userCountry.diplomatic_influence * 0.5
  )

  const recommendations = [
    `Strengthen diplomatic channels with key allies and regional partners`,
    `Monitor economic indicators and prepare contingency plans for trade disruption`,
    `Enhance intelligence sharing with trusted allies regarding the conflict`,
    `Prepare humanitarian aid packages if civilian populations are affected`,
    `Engage in multilateral forums to build international consensus`,
    `Review and update military readiness protocols as a precautionary measure`,
    `Maintain open communication channels with all parties to facilitate dialogue`
  ]

  return {
    recommendations,
    analysis: {
      diplomaticSuccess: Math.round(diplomaticSuccess),
      militaryReadiness: Math.round(militaryReadiness),
      economicImpact: Math.round(economicImpact),
      publicSupport: Math.round(publicSupport),
      allianceStrength: Math.round(allianceStrength)
    },
    summary: `Based on ${userCountry.name}'s current position and capabilities, a balanced approach emphasizing diplomatic engagement while maintaining defensive readiness is recommended. The country's strong diplomatic influence and alliance network provide significant leverage in this scenario.`
  }
} 