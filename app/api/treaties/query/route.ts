import { NextRequest, NextResponse } from "next/server"
import { treatyRAG } from "@/lib/treaty-rag"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      query, 
      scenarioContext,
      includeStatistics = false 
    } = body

    // Allow empty queries for automatic scenario-based analysis
    if (query !== undefined && typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: "Query must be a string" },
        { status: 400 }
      )
    }

    // Initialize the RAG system if needed
    await treatyRAG.initialize()

    let relevantTreaties, utilizationGuidance, violationConsequences, countryParticipation

    // Check if we have scenario context for auto-generation
    if ((!query || query.trim() === '') && scenarioContext && scenarioContext.conflictScenario && scenarioContext.offensiveCountry && scenarioContext.defensiveCountry) {
      const autoQuery = await treatyRAG.generateScenarioQuery(scenarioContext)
      relevantTreaties = await treatyRAG.searchTreaties(autoQuery, 10)
      utilizationGuidance = await treatyRAG.generateUtilizationGuidance(relevantTreaties, scenarioContext)
      violationConsequences = await treatyRAG.generateViolationConsequences(relevantTreaties, scenarioContext)
      countryParticipation = treatyRAG.analyzeCountryParticipation(relevantTreaties, scenarioContext)
    } else if (query && query.trim() !== '') {
      // Manual search with a valid query
      relevantTreaties = await treatyRAG.searchTreaties(query, 10)
      if (scenarioContext) {
        utilizationGuidance = await treatyRAG.generateUtilizationGuidance(relevantTreaties, scenarioContext)
        violationConsequences = await treatyRAG.generateViolationConsequences(relevantTreaties, scenarioContext)
        countryParticipation = treatyRAG.analyzeCountryParticipation(relevantTreaties, scenarioContext)
      }
    } else {
      // No query and insufficient scenario context
      return NextResponse.json(
        { success: false, error: "Either a query or complete scenario context (conflict type, aggressor, victim) is required" },
        { status: 400 }
      )
    }
    
    // Get statistics if requested
    let statistics = null
    if (includeStatistics) {
      statistics = await treatyRAG.getTreatyStatistics()
    }

    // Enhanced filtering based on scenario context
    let filteredTreaties = relevantTreaties
    if (scenarioContext && scenarioContext.conflictScenario) {
      const scenario = scenarioContext.conflictScenario.toLowerCase()
      const countries = [scenarioContext.selectedCountry, scenarioContext.offensiveCountry, scenarioContext.defensiveCountry].filter(Boolean)
      
      filteredTreaties = relevantTreaties.map(treaty => {
        let relevanceBoost = 0
        const content = treaty.content.toLowerCase()
        
        // Boost relevance based on scenario type
        if (scenario.includes('nuclear') && content.includes('nuclear')) relevanceBoost += 0.4
        if (scenario.includes('trade') && content.includes('trade')) relevanceBoost += 0.4
        if (scenario.includes('territorial') && (content.includes('territorial') || content.includes('border') || content.includes('dispute'))) relevanceBoost += 0.4
        if (scenario.includes('environmental') && content.includes('environment')) relevanceBoost += 0.4
        if (scenario.includes('cyber') && content.includes('cyber')) relevanceBoost += 0.4
        if (scenario.includes('space') && content.includes('space')) relevanceBoost += 0.4
        if (scenario.includes('diplomatic') && content.includes('diplomatic')) relevanceBoost += 0.3
        if (scenario.includes('economic') && (content.includes('economic') || content.includes('trade'))) relevanceBoost += 0.3
        
        // Boost for country-specific relevance
        countries.forEach(country => {
          if (country && content.includes(country.toLowerCase())) {
            relevanceBoost += 0.2
          }
        })
        
        // Boost for universal treaties (UN Charter, Geneva Conventions, etc.)
        if (content.includes('united nations') || content.includes('geneva') || content.includes('vienna convention')) {
          relevanceBoost += 0.2
        }

        // Major boost for treaties where both parties are signatories
        const participation = countryParticipation?.[treaty.id]
        if (participation?.bothPartiesSigned) {
          relevanceBoost += 0.6 // Highest priority for mutual treaties
        } else if (participation?.signingStatus === 'aggressor_only') {
          relevanceBoost += 0.4 // High priority for aggressor leverage
        } else if (participation?.signingStatus === 'victim_only') {
          relevanceBoost += 0.4 // High priority for victim protection
        } else if (participation?.offensiveCountrySigned || participation?.defensiveCountrySigned) {
          relevanceBoost += 0.2 // Lower priority for other single-party scenarios
        }
        
        return {
          ...treaty,
          relevanceScore: 0.5 + relevanceBoost
        }
      }).sort((a, b) => {
        // Complex sorting: mutual first, then single-party by strategic value, then by relevance
        const aParticipation = countryParticipation?.[a.id]
        const bParticipation = countryParticipation?.[b.id]
        
        // Mutual treaties first
        if (aParticipation?.bothPartiesSigned && !bParticipation?.bothPartiesSigned) return -1
        if (!aParticipation?.bothPartiesSigned && bParticipation?.bothPartiesSigned) return 1
        
        // Among single-party treaties, prioritize strategic leverage
        if (!aParticipation?.bothPartiesSigned && !bParticipation?.bothPartiesSigned) {
          const aStrategic = aParticipation?.signingStatus?.includes('_only')
          const bStrategic = bParticipation?.signingStatus?.includes('_only')
          
          if (aStrategic && !bStrategic) return -1
          if (!aStrategic && bStrategic) return 1
        }
        
        return (b.relevanceScore || 0) - (a.relevanceScore || 0)
      })
    }

    return NextResponse.json({
      success: true,
      treaties: filteredTreaties.map(treaty => ({
        content: treaty.content,
        type: treaty.metadata.treatyType,
        section: treaty.metadata.section,
        year: treaty.metadata.year,
        parties: treaty.metadata.parties,
        relevanceScore: treaty.relevanceScore || 0.5,
        id: treaty.id,
        participation: countryParticipation?.[treaty.id]
      })),
      utilizationGuidance,
      violationConsequences,
      countryParticipation,
      statistics,
      metadata: {
        searchQuery: query || "auto-generated from scenario",
        treatyCount: filteredTreaties.length,
        scenarioContext: !!scenarioContext,
        autoGenerated: !query && !!scenarioContext,
        mutualTreaties: filteredTreaties.filter(t => countryParticipation?.[t.id]?.bothPartiesSigned).length,
        aggressorOnlyTreaties: filteredTreaties.filter(t => countryParticipation?.[t.id]?.signingStatus === 'aggressor_only').length,
        victimOnlyTreaties: filteredTreaties.filter(t => countryParticipation?.[t.id]?.signingStatus === 'victim_only').length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("Error in treaty query:", error)
    
    return NextResponse.json({
      success: false,
      error: "Failed to process treaty query. Please try again."
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    await treatyRAG.initialize()
    const statistics = await treatyRAG.getTreatyStatistics()
    
    return NextResponse.json({
      success: true,
      statistics,
      message: "Treaty database is ready"
    })
  } catch (error) {
    console.error("Error getting treaty statistics:", error)
    
    return NextResponse.json({
      success: false,
      error: "Failed to get treaty statistics"
    }, { status: 500 })
  }
}