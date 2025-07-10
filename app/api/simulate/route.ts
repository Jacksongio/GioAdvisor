import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { generateStrategicRecommendations, type SimulationParams } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { selectedCountry, conflictScenario, offensiveCountry, defensiveCountry } = body

    // Validate required fields
    if (!selectedCountry || !conflictScenario || !offensiveCountry || !defensiveCountry) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: selectedCountry, conflictScenario, offensiveCountry, defensiveCountry' 
        },
        { status: 400 }
      )
    }

    // Load data files
    const countriesPath = join(process.cwd(), 'data', 'countries.json')
    const conflictsPath = join(process.cwd(), 'data', 'conflicts.json')
    
    const countriesData = JSON.parse(readFileSync(countriesPath, 'utf8'))
    const conflictsData = JSON.parse(readFileSync(conflictsPath, 'utf8'))

    // Find country and conflict data
    const userCountryData = countriesData.countries.find(
      (c: any) => c.code === selectedCountry
    )
    const offensiveCountryData = countriesData.countries.find(
      (c: any) => c.code === offensiveCountry
    )
    const defensiveCountryData = countriesData.countries.find(
      (c: any) => c.code === defensiveCountry
    )
    const conflictTypeData = conflictsData.conflicts.find(
      (c: any) => c.id === conflictScenario
    )

    if (!userCountryData || !offensiveCountryData || !defensiveCountryData || !conflictTypeData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid country code or conflict type' 
        },
        { status: 400 }
      )
    }

    // Prepare simulation parameters
    const simulationParams: SimulationParams = {
      userCountry: userCountryData,
      conflictType: conflictTypeData,
      offensiveCountry: offensiveCountryData,
      defensiveCountry: defensiveCountryData,
      economicFactors: body.economicFactors,
      militaryFactors: body.militaryFactors,
      diplomaticFactors: body.diplomaticFactors
    }

    // Generate AI recommendations
    const aiResults = await generateStrategicRecommendations(simulationParams)

    // Calculate additional metrics based on country data and conflict
    const additionalMetrics = calculateAdditionalMetrics(
      userCountryData,
      conflictTypeData,
      offensiveCountryData,
      defensiveCountryData
    )

    const simulationResult = {
      id: generateSimulationId(),
      timestamp: new Date().toISOString(),
      parameters: {
        userCountry: userCountryData.name,
        conflictType: conflictTypeData.name,
        offensiveCountry: offensiveCountryData.name,
        defensiveCountry: defensiveCountryData.name
      },
      analysis: {
        ...aiResults.analysis,
        ...additionalMetrics
      },
      recommendations: aiResults.recommendations,
      summary: aiResults.summary,
      conflictDetails: {
        description: conflictTypeData.description,
        typical_duration: conflictTypeData.typical_duration,
        key_factors: conflictTypeData.key_factors,
        typical_responses: conflictTypeData.typical_responses
      },
      geopoliticalContext: {
        userCountryAllies: userCountryData.allies,
        userCountryRivals: userCountryData.rivals,
        tradeDependencies: userCountryData.trade_dependencies,
        territorialDisputes: userCountryData.territorial_disputes
      }
    }

    return NextResponse.json({
      success: true,
      data: simulationResult
    })

  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run simulation. Please try again.' 
      },
      { status: 500 }
    )
  }
}

function calculateAdditionalMetrics(
  userCountry: any,
  conflictType: any,
  offensiveCountry: any,
  defensiveCountry: any
) {
  // Calculate risk assessment
  const riskLevel = calculateRiskLevel(userCountry, conflictType, offensiveCountry, defensiveCountry)
  
  // Calculate economic vulnerability
  const economicVulnerability = calculateEconomicVulnerability(userCountry, offensiveCountry, defensiveCountry)
  
  // Calculate strategic advantage
  const strategicAdvantage = calculateStrategicAdvantage(userCountry, offensiveCountry, defensiveCountry)

  return {
    riskLevel,
    economicVulnerability,
    strategicAdvantage,
    conflictDuration: conflictType.typical_duration,
    escalationPotential: getNumericValue(conflictType.escalation_potential),
    internationalSupport: calculateInternationalSupport(userCountry, defensiveCountry)
  }
}

function calculateRiskLevel(userCountry: any, conflictType: any, offensiveCountry: any, defensiveCountry: any): number {
  let risk = 30 // base risk

  // Increase risk if user country is involved directly
  if (userCountry.rivals.includes(offensiveCountry.code) || userCountry.rivals.includes(defensiveCountry.code)) {
    risk += 20
  }

  // Increase risk based on conflict type
  risk += conflictType.military_requirement * 0.3
  risk += conflictType.diplomatic_complexity * 0.2

  // Nuclear factor
  if (offensiveCountry.nuclear_weapons > 0 || defensiveCountry.nuclear_weapons > 0) {
    risk += 15
  }

  // Trade dependency factor
  if (userCountry.trade_dependencies.includes(offensiveCountry.code) || 
      userCountry.trade_dependencies.includes(defensiveCountry.code)) {
    risk += 10
  }

  return Math.min(100, Math.round(risk))
}

function calculateEconomicVulnerability(userCountry: any, offensiveCountry: any, defensiveCountry: any): number {
  let vulnerability = 20 // base vulnerability

  // Trade dependency vulnerability
  if (userCountry.trade_dependencies.includes(offensiveCountry.code)) {
    vulnerability += 25
  }
  if (userCountry.trade_dependencies.includes(defensiveCountry.code)) {
    vulnerability += 20
  }

  // Economic stability factor
  vulnerability += (100 - userCountry.economic_stability) * 0.3

  // GDP comparison - smaller economies are more vulnerable
  const avgOtherGDP = (offensiveCountry.gdp + defensiveCountry.gdp) / 2
  if (userCountry.gdp < avgOtherGDP) {
    vulnerability += 15
  }

  return Math.min(100, Math.round(vulnerability))
}

function calculateStrategicAdvantage(userCountry: any, offensiveCountry: any, defensiveCountry: any): number {
  let advantage = userCountry.power_rating * 0.5

  // Alliance advantage
  advantage += userCountry.allies.length * 3

  // Diplomatic influence
  advantage += userCountry.diplomatic_influence * 0.3

  // Nuclear deterrent
  if (userCountry.nuclear_weapons > 0) {
    advantage += 10
  }

  // Cyber capabilities
  advantage += userCountry.cyber_capabilities * 0.2

  return Math.min(100, Math.round(advantage))
}

function calculateInternationalSupport(userCountry: any, defensiveCountry: any): number {
  let support = userCountry.diplomatic_influence * 0.6

  // Allied support
  if (userCountry.allies.includes(defensiveCountry.code)) {
    support += 20
  }

  // Number of allies factor
  support += userCountry.allies.length * 2

  return Math.min(100, Math.round(support))
}

function getNumericValue(textValue: string): number {
  const mapping: { [key: string]: number } = {
    'low': 25,
    'medium': 50,
    'high': 75,
    'very high': 90,
    'extreme': 100
  }
  return mapping[textValue] || 50
}

function generateSimulationId(): string {
  return 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
} 