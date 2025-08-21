import { NextRequest, NextResponse } from 'next/server'
import { RAGBriefingAgent, BriefingContext } from '@/lib/rag-briefing-agent'

// Initialize RAG agent as singleton
let ragAgent: RAGBriefingAgent | null = null

async function getRagAgent(): Promise<RAGBriefingAgent> {
  if (!ragAgent) {
    ragAgent = new RAGBriefingAgent()
    await ragAgent.initialize()
  }
  return ragAgent
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      date, 
      scenario, 
      simulationResults, 
      selectedCountry, 
      offensiveCountry, 
      defensiveCountry, 
      severityLevel, 
      timeFrame,
      useRAG = true  // Default to using RAG system
    } = body

    // Validate required parameters
    if (!scenario || !selectedCountry || !offensiveCountry || !defensiveCountry) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required briefing parameters' 
      }, { status: 400 })
    }

    console.log('🤖 Generating RAG-based intelligence briefing...')

    // Use RAG-based briefing generation
    if (useRAG) {
      try {
        const agent = await getRagAgent()
        
        const briefingContext: BriefingContext = {
          scenario,
          selectedCountry,
          offensiveCountry,
          defensiveCountry,
          severityLevel,
          timeFrame,
          simulationResults,
          date
        }

        console.log('📋 Starting RAG briefing generation...')
        const agentAnalysis = await agent.generateBriefing(briefingContext, true) // Fast mode enabled
        
        console.log(`✅ RAG briefing generated successfully! (${agentAnalysis.metadata.processingTime}ms, ${agentAnalysis.metadata.treatiesAnalyzed} treaties analyzed, RAGAS: Faithfulness:${(agentAnalysis.metadata.ragasMetrics.faithfulness * 100).toFixed(1)}% Relevancy:${(agentAnalysis.metadata.ragasMetrics.answerRelevancy * 100).toFixed(1)}%)`)

        return NextResponse.json({
          success: true,
          briefing: agentAnalysis.generatedBriefing,
          metadata: {
            ragGenerated: true,
            treatiesAnalyzed: agentAnalysis.metadata.treatiesAnalyzed,
            processingTime: agentAnalysis.metadata.processingTime,
            ragasMetrics: agentAnalysis.metadata.ragasMetrics,
            aiReasoning: agentAnalysis.aiReasoning,
            legalImplications: agentAnalysis.legalImplications,
            retrievedTreaties: agentAnalysis.generatedBriefing.treatyReferences.map(ref => ({
              title: ref.title,
              relevance: ref.relevance,
              score: agentAnalysis.retrievedTreaties.find(doc => doc.chunk.metadata.title === ref.title)?.relevanceScore || 0
            }))
          }
        })
      } catch (ragError) {
        console.error('RAG briefing generation failed:', ragError)
        console.log('🔄 Falling back to standard AI generation...')
        // Fall through to standard generation
      }
    }

    // Fallback to standard OpenAI generation
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `FOR EDUCATIONAL PURPOSES: You are a senior intelligence analyst preparing a realistic military briefing document for this hypothetical scenario in the style of declassified government intelligence documents from the 1960s Cuban Missile Crisis era. Write in formal, objective language and structure the briefing exactly like the historical document format with:

CRITICAL: This is an educational simulation for ${severityLevel} severity conflict. Response must be PROPORTIONAL to threat level:
- LOW severity (trade disputes, economic issues): Diplomatic and economic responses ONLY - NO military action
- MEDIUM severity (military buildups, cyber attacks): Defensive readiness with diplomatic pressure
- HIGH/EXTREME severity (attacks on citizens, territorial invasion): Military action appropriate

SEVERITY CHECK: For ${severityLevel} conflicts, only recommend military action if it matches what governments actually do for THIS threat level. Trade embargos do not warrant military deployment.

1. A date header
2. "Proposed plan of action for ${scenario}" followed by "in the light of:" and points (a), (b), (c), (d) - each point should be specific to the current conflict scenario
3. A concluding assessment paragraph that synthesizes the specific situation between ${offensiveCountry} and ${defensiveCountry} and its implications for ${selectedCountry}
4. "Therefore it seems to me that more decisive action may be indicated than any heretofore considered regarding the ${offensiveCountry}-${defensiveCountry} situation, and should be patterned along the following lines:" paragraph
5. Numbered recommendations (1), (2), (3), (4) - THESE MUST BE PROPORTIONAL TO ${severityLevel} SEVERITY:
   - LOW: Diplomatic channels, economic countermeasures, legal remedies
   - MEDIUM: Defensive preparations with diplomatic pressure  
   - HIGH/EXTREME: Military action, economic warfare, decisive responses
6. A final recommendation paragraph explaining which of the 4 options you specifically recommend for ${selectedCountry} and why
7. Classification and author signature

CRITICAL: Make all content PROPORTIONAL to ${severityLevel} severity. Only recommend military action for HIGH/EXTREME threats where lives, territory, or sovereignty are threatened. Trade disputes and economic issues require diplomatic and economic responses, not military deployment.

SPECIFICITY REQUIREMENTS - NO PLACEHOLDER BRACKETS:
LOW SEVERITY - Diplomatic/Economic Details:
- Treaties: UN Charter articles, WTO agreements, EU Treaty provisions
- Bodies: UN Security Council procedures, WTO Dispute Settlement mechanisms
- Economic: GATT articles, sanctions frameworks, specific asset amounts

MEDIUM SEVERITY - Defensive/Alliance Details:
- Military: AMX-56 Leclerc tanks, Rafale squadrons, FREMM frigates
- Bases: Istres Air Base, Avord Air Base, Solenzara Air Base
- Alliances: NATO Article 4, EU Article 42.7, bilateral defense treaties

HIGH/EXTREME SEVERITY - Military/Operational Details:
- Weapons: SCALP missiles, Rafale jets, FREMM frigates
- Targets: ACTUAL naval bases (Qingdao, Dalian), coordinates (16°N 114°E)
- Straits: Strait of Malacca, Taiwan Strait, Bosphorus
- Assets: REAL amounts (€50 billion, €200 billion)
- Units: 1st RPIMa, specific squadrons, carrier groups

CRITICAL: Generate ACTUAL locations and amounts tailored to ${selectedCountry} - NOT brackets. Use ${selectedCountry}'s specific military equipment and alliances:
- USA: F-35 fighters, Tomahawk missiles, USS carriers, NATO Article 5, ANZUS
- France: Rafale jets, SCALP missiles, Charles de Gaulle carrier, NATO Article 5, EU Article 42.7
- UK: Typhoon fighters, Storm Shadow missiles, HMS carriers, NATO Article 5, Five Eyes
- Germany: Leopard 2 tanks, Tornado jets, NATO Article 5, EU Article 42.7
- India: Su-30MKI fighters, BrahMos missiles, INS carriers, Quad Alliance
- China: J-20 fighters, DF missiles, PLAN carriers, Shanghai Cooperation

Generate appropriate equipment for ${selectedCountry}, not generic examples.`
            },
            {
              role: 'user',
              content: `Generate a formal intelligence briefing for the following scenario:

Date: ${date}
Scenario: ${scenario}
Primary Country: ${selectedCountry} (tailor all recommendations to this country's capabilities)
Offensive Force: ${offensiveCountry}
Defensive Force: ${defensiveCountry}
Severity Level: ${severityLevel}
Time Frame: ${timeFrame}

IMPORTANT: Use ${selectedCountry}'s actual military equipment, bases, alliances, and capabilities. Do not use French equipment for US briefings or NATO articles for non-NATO countries.

Current Analysis Results:
- Diplomatic Response: ${simulationResults.diplomaticResponse || 'N/A'}%
- Military Readiness: ${simulationResults.militaryReadiness || 'N/A'}%
- Economic Impact: ${simulationResults.economicImpact || 'N/A'}%
- Public Support: ${simulationResults.publicSupport || 'N/A'}%
- Alliance Strength: ${simulationResults.allianceStrength || 'N/A'}%

Generate ONLY the specific recommendation content for ${severityLevel} severity - do not include template prefixes like "Primary response ${selectedCountry} should take regarding...". Output direct, actionable recommendations.

Please provide a JSON response with the following structure:
{
  "title": "Proposed plan of action for [specific scenario description] in the light of:",
  "sections": [
    {"point": "(a)", "content": "Specific intelligence analysis about current developments between ${offensiveCountry} and ${defensiveCountry}"},
    {"point": "(b)", "content": "Military/strategic assessment with specific details about troop movements, equipment, or diplomatic actions"},
    {"point": "(c)", "content": "Analysis of current diplomatic initiatives and their effectiveness in this specific conflict"},
    {"point": "(d)", "content": "Assessment of how this situation specifically affects ${selectedCountry}'s strategic interests and regional stability"}
  ],
  "recommendations": [
    "[LOW: File diplomatic protest via UN Article 2(3), invoke WTO Article XXIII dispute resolution, impose tariffs under GATT Article XIX] [MEDIUM: Deploy ${selectedCountry}-specific military assets to strategic positions, invoke ${selectedCountry}'s alliance consultation mechanisms] [HIGH/EXTREME: Launch ${selectedCountry}-specific weapons systems against ${offensiveCountry} military targets, deploy ${selectedCountry} naval/carrier groups, invoke ${selectedCountry}'s primary alliance articles]",
    "[LOW: UN Security Council Chapter VI procedures, coordinate through ${selectedCountry}'s diplomatic channels, engage multilateral economic frameworks] [MEDIUM: Invoke ${selectedCountry}'s alliance consultation mechanisms, coordinate with primary allies] [HIGH/EXTREME: Invoke ${selectedCountry}'s primary alliance articles, coordinate ${selectedCountry} naval forces with allied fleets, activate bilateral defense partnerships]", 
    "[LOW: Economic intelligence via ${selectedCountry}'s commercial networks, monitor through ${selectedCountry}'s satellite/intelligence assets] [MEDIUM: Deploy ${selectedCountry}-specific surveillance aircraft from national bases, enhance ${selectedCountry} HUMINT operations] [HIGH/EXTREME: Deploy ${selectedCountry}-specific drones/reconnaissance assets, conduct ${selectedCountry} special forces reconnaissance, satellite surveillance using ${selectedCountry} intelligence systems]",
    "[LOW: Implement ${selectedCountry}-appropriate sanctions frameworks, freeze assets through ${selectedCountry} financial systems, invoke ${selectedCountry}'s trade safeguard measures] [MEDIUM: Deploy ${selectedCountry}-specific air defense systems, position ${selectedCountry} military units strategically] [HIGH/EXTREME: Naval blockade using ${selectedCountry} naval vessels at strategic chokepoints, seize ${offensiveCountry} assets through ${selectedCountry} banking system, establish no-fly zones enforced by ${selectedCountry} air force]"
  ],
  "conclusion": "Paragraph starting with 'The above assessments lead to the conclusion that with the passage of time, regarding the ${offensiveCountry}-${defensiveCountry} situation...' and ending with 'Therefore it seems to me a more aggressive action is indicated than any heretofore considered regarding the ${offensiveCountry}-${defensiveCountry} situation, and should be patterned along the following lines:'",
  "finalRecommendation": "Single paragraph explaining which of the 4 recommendations above is most critical for ${selectedCountry} and should be prioritized, with specific reasoning",
  "classification": "CONFIDENTIAL",
  "author": "Strategic Intelligence Division"
}`
            }
          ],
          max_tokens: 2500,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      })

      if (openaiResponse.ok) {
        const openaiResult = await openaiResponse.json()
        const briefingContent = JSON.parse(openaiResult.choices[0].message.content)
        
        return NextResponse.json({
          success: true,
          briefing: {
            ...briefingContent,
            date: date
          }
        })
      }
    } catch (openaiError) {
      console.error('OpenAI briefing error:', openaiError)
      // Fall through to fallback generation
    }

    // Fallback briefing generation in authentic 1960s style
    const briefing = {
      date: date,
      title: `Proposed plan of action for ${scenario.slice(0, 60)}${scenario.length > 60 ? '...' : ''} in the light of:`,
      sections: [
        {
          point: "(a)",
          content: `Intelligence assessments indicate escalating military tensions between ${offensiveCountry} and ${defensiveCountry}, with immediate strategic implications for ${selectedCountry} regional interests and security posture. Recent SIGINT and HUMINT suggest active military preparations and potential force deployments during the ${timeFrame} operational window.`
        },
        {
          point: "(b)", 
          content: `Analysis of intercepted communications and reconnaissance imagery confirms substantial military equipment movements by ${offensiveCountry} forces, with estimated ${severityLevel} threat level requiring immediate ${selectedCountry} national security response and possible alliance consultation protocols.`
        },
        {
          point: "(c)",
          content: `Current ${selectedCountry} diplomatic initiatives toward the ${offensiveCountry}-${defensiveCountry} crisis have achieved approximately ${simulationResults?.diplomaticResponse || 65}% effectiveness rating. Economic leverage and existing alliance frameworks may prove insufficient without enhanced ${selectedCountry} strategic coordination and possible military deterrent positioning.`
        },
        {
          point: "(d)",
          content: `Strategic assessment indicates that continued passive diplomatic approach will contribute to intelligence collection but will not sufficient to prevent ${offensiveCountry} strategic objectives against ${defensiveCountry}, potentially creating precedent threatening ${selectedCountry} regional influence and requiring immediate policy recalibration.`
        }
      ],
      recommendations: [
        `Immediate ${selectedCountry} diplomatic offensive to mobilize NATO/regional allies regarding ${offensiveCountry} aggression, including direct consultation with Pentagon, State Department, and allied defense ministers within 48-72 hours.`,
        `Deploy ${selectedCountry} intelligence assets to monitor ${offensiveCountry}-${defensiveCountry} developments through enhanced SIGINT collection, satellite reconnaissance, and coordination with allied intelligence services for real-time situational awareness.`,
        `Activate ${selectedCountry} economic response mechanisms including targeted sanctions coordination with allies, strategic reserve positioning, and preparation of military aid packages for ${defensiveCountry} should escalation continue.`,
        `Position ${selectedCountry} military assets for rapid response including carrier group repositioning, forward base alertness levels, and coordination with allied commands for potential humanitarian or peacekeeping intervention scenarios.`
      ],
      conclusion: `The above assessments lead to the conclusion that with the passage of time, regarding the ${offensiveCountry}-${defensiveCountry} situation, it is possible there will evolve a more dangerous regional conflict that could serve as a model for similar aggressive actions throughout the area, and moreover as a direct challenge to ${selectedCountry} strategic interests and alliance credibility. Therefore it seems to me a more aggressive action is indicated than any heretofore considered regarding the ${offensiveCountry}-${defensiveCountry} situation, and should be patterned along the following lines:`,
      finalRecommendation: `Based on current intelligence assessments and ${selectedCountry} strategic priorities, I recommend immediate implementation of Option 1 (diplomatic mobilization) as the primary response, supported by concurrent activation of Option 2 (intelligence enhancement). This approach maximizes ${selectedCountry} leverage while maintaining escalation control and preserving alliance unity. Options 3 and 4 should remain in ready status for rapid deployment should diplomatic efforts fail within the 7-14 day window.`,
      classification: "CONFIDENTIAL",
      author: "Strategic Intelligence Division"
    }

    return NextResponse.json({
      success: true,
      briefing: briefing
    })

  } catch (error) {
    console.error('Briefing generation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate briefing',
      briefing: null
    }, { status: 500 })
  }
}
