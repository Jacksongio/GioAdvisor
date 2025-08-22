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

CRITICAL: Generate ACTUAL locations and amounts tailored to ${selectedCountry} - NEVER use generic terms like "India-specific weapons systems" or "French naval assets". ALWAYS use specific equipment names.

COUNTRY-SPECIFIC MILITARY ASSETS DATABASE:

USA:
- Aircraft: F-35A Lightning II, F-22A Raptor, F/A-18E/F Super Hornet, B-2 Spirit, B-52 Stratofortress
- Missiles: Tomahawk TLAM, SM-3 interceptors, HIMARS M270, Patriot PAC-3, JASSM-ER
- Naval: USS Gerald R. Ford (CVN-78), USS Nimitz class carriers, Arleigh Burke destroyers, Virginia-class submarines
- Bases: Naval Base Norfolk, Ramstein Air Base, Yokosuka Naval Base, Diego Garcia
- Alliances: NATO Article 5, ANZUS Treaty, US-Japan Security Treaty, AUKUS

FRANCE:
- Aircraft: Rafale B/C fighters, Mirage 2000D, A400M Atlas transport
- Missiles: SCALP cruise missiles, MICA air-to-air, Exocet anti-ship, M51 SLBM
- Naval: Charles de Gaulle (R91), FREMM frigates, Barracuda-class submarines, Mistral-class LHDs
- Bases: Istres Air Base, Base Aérienne 118 Mont-de-Marsan, Djibouti Base
- Alliances: NATO Article 5, EU Article 42.7, Franco-German Brigade

UK:
- Aircraft: Eurofighter Typhoon FGR4, F-35B Lightning II, RAF Voyager
- Missiles: Storm Shadow cruise missiles, Meteor BVRAAM, Brimstone anti-tank, Trident II SLBM
- Naval: HMS Queen Elizabeth (R08), Type 45 destroyers, Astute-class submarines, Type 23 frigates
- Bases: RAF Coningsby, RAF Akrotiri Cyprus, RAF Mount Pleasant Falklands
- Alliances: NATO Article 5, Five Eyes, AUKUS, UK-US Special Relationship

GERMANY:
- Aircraft: Eurofighter Typhoon, Tornado IDS/ECR, A400M Atlas
- Missiles: Taurus KEPD 350, IRIS-T air defense, RBS 15 anti-ship
- Naval: Baden-Württemberg-class frigates, Type 212A submarines
- Bases: Ramstein Air Base, Spangdahlem Air Base, Büchel Air Base
- Alliances: NATO Article 5, EU Article 42.7, Franco-German Brigade

INDIA:
- Aircraft: Su-30MKI Flanker-H, Rafale, MiG-29UPG, Tejas Mk1A, HAL Rudra
- Missiles: BrahMos supersonic cruise missiles, Akash air defense, Prithvi-II, Agni-V IRBM
- Naval: INS Vikramaditya (R33), Kolkata-class destroyers, Scorpène-class submarines
- Bases: Thanjavur Air Force Station, INS Kadamba Karwar, Adampur Air Force Station
- Alliances: Quad Alliance, Indo-Russian defense cooperation, India-France Strategic Partnership

CHINA:
- Aircraft: J-20 Mighty Dragon, J-16 Flanker, H-6K bomber, J-15 Flying Shark
- Missiles: DF-21D anti-ship ballistic, YJ-18 anti-ship cruise, HQ-9 air defense, DF-26 IRBM
- Naval: Liaoning (16), Shandong (17), Type 055 destroyers, Type 093 nuclear submarines
- Bases: Djibouti Support Base, Woody Island South China Sea, Hainan Naval Base
- Alliances: Shanghai Cooperation Organization, China-Russia Strategic Partnership

RUSSIA:
- Aircraft: Su-57 Felon, Su-35S Flanker-E, Tu-160 Blackjack, MiG-31BM Foxhound
- Missiles: Kalibr cruise missiles, S-400 Triumf air defense, Kinzhal hypersonic, RS-28 Sarmat ICBM
- Naval: Admiral Kuznetsov, Kirov-class battlecruisers, Yasen-class submarines
- Bases: Khmeimim Air Base Syria, Kaliningrad Naval Base, Severodvinsk Submarine Base
- Alliances: CSTO, China-Russia Strategic Partnership, Belarus Union State

JAPAN:
- Aircraft: F-35A Lightning II, F-15J Eagle, F-2A Viper Zero, P-1 maritime patrol
- Missiles: Type 12 anti-ship missiles, PAC-3 Patriot, SM-3 interceptors
- Naval: JS Izumo (DDH-183), Maya-class destroyers, Soryu-class submarines
- Bases: Misawa Air Base, Yokosuka Naval Base, Kadena Air Base Okinawa
- Alliances: US-Japan Security Treaty, Quad Alliance

SOUTH KOREA:
- Aircraft: F-35A Lightning II, KF-21 Boramae, F-15K Slam Eagle, KF-16 Fighting Falcon
- Missiles: Hyunmoo-3 cruise missiles, Cheongung air defense, Harpoon anti-ship
- Naval: ROKS Dokdo (LPH-6111), Sejong the Great-class destroyers, Chang Bogo-class submarines
- Bases: Osan Air Base, Kunsan Air Base, Busan Naval Base
- Alliances: US-ROK Mutual Defense Treaty

ISRAEL:
- Aircraft: F-35I Adir, F-15I Ra'am, F-16I Sufa, AH-64D Apache Longbow
- Missiles: Iron Dome interceptors, David's Sling, Arrow 3 anti-ballistic, Gabriel anti-ship
- Naval: Sa'ar 6-class corvettes, Dolphin-class submarines
- Bases: Nevatim Airbase, Ramat David Airbase, Haifa Naval Base
- Alliances: US-Israel Strategic Partnership

AUSTRALIA:
- Aircraft: F-35A Lightning II, F/A-18F Super Hornet, E-7A Wedgetail, P-8A Poseidon
- Missiles: AGM-158C LRASM, SM-2 Standard, RGM-84L Harpoon Block II
- Naval: HMAS Adelaide-class LHDs, Hobart-class destroyers, Collins-class submarines
- Bases: RAAF Base Tindal, RAAF Base Darwin, HMAS Stirling Naval Base
- Alliances: ANZUS Treaty, AUKUS, Five Eyes, Quad Alliance

CANADA:
- Aircraft: CF-18 Hornet, CP-140 Aurora maritime patrol, CH-147F Chinook
- Missiles: AIM-120C AMRAAM, AGM-84 Harpoon, RIM-162 ESSM
- Naval: Halifax-class frigates, Victoria-class submarines
- Bases: CFB Cold Lake, CFB Bagotville, CFB Esquimalt
- Alliances: NATO Article 5, NORAD, Five Eyes

ITALY:
- Aircraft: Eurofighter Typhoon, F-35A Lightning II, Tornado IDS, AV-8B Harrier II
- Missiles: MBDA Meteor, Storm Shadow, Aster 15/30, SCALP cruise missiles
- Naval: ITS Cavour (C 550), FREMM frigates, Todaro-class submarines
- Bases: Amendola Air Base, Decimomannu Air Base, La Spezia Naval Base
- Alliances: NATO Article 5, EU Article 42.7

SPAIN:
- Aircraft: Eurofighter Typhoon, F/A-18 Hornet, A400M Atlas, AV-8B Harrier II
- Missiles: MBDA Meteor, AIM-120 AMRAAM, Harpoon anti-ship
- Naval: Juan Carlos I (L-61), Álvaro de Bazán-class frigates, S-80 Plus submarines
- Bases: Morón Air Base, Rota Naval Base, Zaragoza Air Base
- Alliances: NATO Article 5, EU Article 42.7

NETHERLANDS:
- Aircraft: F-35A Lightning II, F-16 Fighting Falcon, CH-47 Chinook
- Missiles: MBDA Meteor, ESSM, Harpoon Block II
- Naval: De Zeven Provinciën-class frigates, Walrus-class submarines
- Bases: Volkel Air Base, Leeuwarden Air Base, Den Helder Naval Base
- Alliances: NATO Article 5, EU Article 42.7

TURKEY:
- Aircraft: F-16C/D Fighting Falcon, F-4E Phantom II, A400M Atlas
- Missiles: AIM-120C AMRAAM, Harpoon anti-ship, HISAR air defense
- Naval: TCG Anadolu (L-400), Ada-class corvettes, Reis-class submarines
- Bases: Incirlik Air Base, Konya Air Base, Aksaz Naval Base
- Alliances: NATO Article 5

BRAZIL:
- Aircraft: F-39 Gripen, A-1 AMX, Super Tucano, AF-1 Skyhawk
- Missiles: AIM-120C AMRAAM, MAA-1 Piranha, Exocet MM40
- Naval: NAe São Paulo, Niterói-class frigates, Tupi-class submarines
- Bases: Anápolis Air Base, Santa Cruz Air Base, Rio de Janeiro Naval Base
- Alliances: Rio Treaty (TIAR), UNASUR

SAUDI ARABIA:
- Aircraft: F-15SA Eagle, Eurofighter Typhoon, F-15C Eagle, Tornado IDS
- Missiles: AIM-120C AMRAAM, Storm Shadow, AGM-84 Harpoon
- Naval: Al Riyadh-class frigates, Al Jubail-class corvettes
- Bases: King Abdulaziz Air Base, Prince Sultan Air Base, King Faisal Naval Base
- Alliances: GCC Defense Cooperation, US-Saudi Security Cooperation

CRITICAL: For ${selectedCountry}, ONLY use equipment, bases, and alliances from their specific section above. NEVER use generic terms or equipment from other countries.

MANDATORY FAILSAFE FOR UNLISTED COUNTRIES:
If ${selectedCountry} is NOT listed in the database above, you MUST COMPLETELY REPLACE the standard military recommendations with country-specific realistic actions:

STEP 1: IDENTIFY COUNTRY TYPE
- SMALL TERRITORIES/MICROSTATES: Cayman Islands, Monaco, Vatican, San Marino, Liechtenstein, Andorra, etc.
- SMALL ISLAND NATIONS: Barbados, Malta, Fiji, Palau, etc.  
- NON-MILITARY FOCUSED STATES: Costa Rica (no army), Iceland (coast guard only), etc.
- MEDIUM COUNTRIES WITH LIMITED MILITARY: Denmark, Norway, Belgium, etc.

STEP 2: RESEARCH ACTUAL CAPABILITIES AND RELATIONSHIPS
For ${selectedCountry}, determine:
- What is their actual military capability? (police force only, coast guard, small military, etc.)
- Who is their main ally/protector? (UK, USA, France, etc.)
- What international bodies are they part of? (UN, EU, NATO, regional organizations)
- What is their main leverage? (financial services, diplomatic, economic)

STEP 3: GENERATE SPECIFIC REALISTIC RECOMMENDATIONS
Replace ALL four recommendations with actions the country can ACTUALLY take:

FOR CAYMAN ISLANDS SPECIFICALLY:
- "Activate the Cayman Islands Crisis Management Committee and request immediate consultation with the UK Foreign Office under the 2009 Constitution Order"
- "Invoke the UK's responsibility for defense and external affairs, requesting Royal Navy vessels from the Caribbean Fleet to provide maritime security"
- "Coordinate with regional partners through CARICOM (Caribbean Community) frameworks and request emergency session of the CARICOM Security Council"
- "Leverage Cayman's role as a major financial center by implementing targeted financial sanctions and asset freezes through the Cayman Islands Monetary Authority"

FOR OTHER SMALL TERRITORIES/NATIONS:
- Monaco: "Request French military protection under the 1861 Treaty of Franco-Monégasque Friendship"
- Vatican: "Invoke the Lateran Treaty and request Italian police protection through the Vatican Gendarmerie coordination protocols"
- Malta: "Activate EU Article 42.7 mutual assistance clause and request immediate consultation with EU partners"
- Iceland: "Invoke NATO Article 4 consultation procedures and request US/NATO air policing mission enhancement"

CRITICAL: DO NOT use the template recommendations for countries without significant military. CREATE entirely new, specific recommendations based on their actual capabilities and relationships.`
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

CRITICAL INSTRUCTION: You MUST use EXACT equipment names from the ${selectedCountry} database above. 

MANDATORY CHECK: Is ${selectedCountry} in the military assets database above?

IF FOUND IN DATABASE: Use exact equipment from their database section
- Must contain 2-3 specific equipment names, bases, alliance articles
- Follow normal military recommendation template

IF NOT FOUND IN DATABASE: COMPLETELY ABANDON the standard template
- DO NOT use any of the standard recommendation templates 
- DO NOT mention "[Country]-specific weapons systems" or "[Country] naval forces"
- INSTEAD: Create 4 entirely new recommendations based on their ACTUAL capabilities
- Research their real alliances, protector countries, and leverage points

EXAMPLES OF TEMPLATE ABANDONMENT:
❌ WRONG (Standard template): "Launch Cayman Islands-specific weapons systems against Luxembourg targets"
✅ CORRECT (Country-specific): "Activate Cayman Islands Crisis Management Committee and request UK Foreign Office consultation under 2009 Constitution Order"

❌ WRONG (Standard template): "Deploy Monaco naval/carrier groups" 
✅ CORRECT (Country-specific): "Request French military protection under 1861 Treaty of Franco-Monégasque Friendship"

FORBIDDEN FOR SMALL COUNTRIES:
- Any mention of their non-existent military assets
- Standard military recommendation templates
- Generic "[Country]-specific" terminology
- Impossible actions like naval blockades by landlocked countries

REQUIRED FOR SMALL COUNTRIES:
- Specific constitutional/treaty references
- Named international organizations they belong to
- Actual government agencies they have
- Real diplomatic relationships and protection agreements

Current Analysis Results:
- Diplomatic Response: ${simulationResults.diplomaticResponse || 'N/A'}%
- Military Readiness: ${simulationResults.militaryReadiness || 'N/A'}%
- Economic Impact: ${simulationResults.economicImpact || 'N/A'}%
- Public Support: ${simulationResults.publicSupport || 'N/A'}%
- Alliance Strength: ${simulationResults.allianceStrength || 'N/A'}%

Generate ONLY the specific recommendation content for ${severityLevel} severity - do not include template prefixes like "Primary response ${selectedCountry} should take regarding...". Output direct, actionable recommendations.

FINAL INSTRUCTION: If ${selectedCountry} is NOT in the military database above, you MUST research their actual:
- Government structure (Crisis Management Committee, Foreign Ministry, etc.)
- Constitutional relationships (UK Constitution Order, French Treaty, etc.) 
- Regional organizations (CARICOM, EU, GCC, etc.)
- Economic leverage (financial center, banking, trade)
- Protection agreements (UK defense responsibility, French protection, etc.)

Use this research to create SPECIFIC, REALISTIC recommendations that reference actual institutions, treaties, and capabilities.

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
    "RECOMMENDATION 1: [IF ${selectedCountry} IS IN DATABASE: Use LOW/MEDIUM/HIGH template with specific equipment] [IF ${selectedCountry} NOT IN DATABASE: Create entirely new recommendation based on their actual capabilities - e.g., for Cayman Islands: 'Activate Cayman Islands Crisis Management Committee and request immediate UK Foreign Office consultation under 2009 Constitution Order']",
    "RECOMMENDATION 2: [IF ${selectedCountry} IS IN DATABASE: Use standard alliance/coordination template with specific treaties] [IF ${selectedCountry} NOT IN DATABASE: Create realistic diplomatic recommendation - e.g., for Cayman Islands: 'Invoke UK responsibility for defense and external affairs, requesting Royal Navy Caribbean Fleet maritime security assistance']", 
    "RECOMMENDATION 3: [IF ${selectedCountry} IS IN DATABASE: Use intelligence/surveillance template with specific assets] [IF ${selectedCountry} NOT IN DATABASE: Create realistic information gathering recommendation - e.g., for Cayman Islands: 'Coordinate through CARICOM frameworks and request emergency CARICOM Security Council session']",
    "RECOMMENDATION 4: [IF ${selectedCountry} IS IN DATABASE: Use economic/military positioning template] [IF ${selectedCountry} NOT IN DATABASE: Leverage their actual strengths - e.g., for Cayman Islands: 'Implement targeted financial sanctions through Cayman Islands Monetary Authority leveraging major financial center status']"
  ],
  "conclusion": "Paragraph starting with 'The above assessments lead to the conclusion that with the passage of time, regarding the ${offensiveCountry}-${defensiveCountry} situation...' and ending with 'Therefore it seems to me a more aggressive action is indicated than any heretofore considered regarding the ${offensiveCountry}-${defensiveCountry} situation, and should be patterned along the following lines:'",
  "finalRecommendation": "Single paragraph explaining which of the 4 recommendations above is most critical for ${selectedCountry} and should be prioritized, with specific reasoning",
  "classification": "CONFIDENTIAL",
  "author": "Strategic Intelligence Division",
  "disclaimer": "⚠️ IMPORTANT DISCLAIMER: This briefing is AI-generated content created for educational and simulation purposes only. This analysis should NOT be used as the basis for any real-world military, diplomatic, or policy decisions. Any actual strategic planning or crisis response should involve consultation with qualified professionals, subject matter experts, and appropriate government authorities. The scenarios, recommendations, and assessments presented herein are hypothetical and do not reflect official government positions or classified intelligence."
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
        `Immediate ${selectedCountry} diplomatic offensive to mobilize allies regarding ${offensiveCountry} aggression, including direct consultation with relevant defense ministries and alliance structures within 48-72 hours using established diplomatic channels.`,
        `Deploy ${selectedCountry} intelligence and surveillance capabilities to monitor ${offensiveCountry}-${defensiveCountry} developments through enhanced SIGINT collection, satellite reconnaissance systems, and coordination with allied intelligence services for real-time situational awareness.`,
        `Activate ${selectedCountry} economic response mechanisms including targeted sanctions coordination with allies, strategic reserve positioning, and preparation of appropriate aid packages for ${defensiveCountry} should escalation continue beyond diplomatic resolution.`,
        `Position ${selectedCountry} military forces for rapid response readiness including naval asset repositioning, air base alert status elevation, and coordination with allied commands for potential humanitarian or peacekeeping intervention scenarios as circumstances develop.`
      ],
      conclusion: `The above assessments lead to the conclusion that with the passage of time, regarding the ${offensiveCountry}-${defensiveCountry} situation, it is possible there will evolve a more dangerous regional conflict that could serve as a model for similar aggressive actions throughout the area, and moreover as a direct challenge to ${selectedCountry} strategic interests and alliance credibility. Therefore it seems to me a more aggressive action is indicated than any heretofore considered regarding the ${offensiveCountry}-${defensiveCountry} situation, and should be patterned along the following lines:`,
      finalRecommendation: `Based on current intelligence assessments and ${selectedCountry} strategic priorities, I recommend immediate implementation of Option 1 (diplomatic mobilization) as the primary response, supported by concurrent activation of Option 2 (intelligence enhancement). This approach maximizes ${selectedCountry} leverage while maintaining escalation control and preserving alliance unity. Options 3 and 4 should remain in ready status for rapid deployment should diplomatic efforts fail within the 7-14 day window.`,
      classification: "CONFIDENTIAL",
      author: "Strategic Intelligence Division",
      disclaimer: "⚠️ IMPORTANT DISCLAIMER: This briefing is AI-generated content created for educational and simulation purposes only. This analysis should NOT be used as the basis for any real-world military, diplomatic, or policy decisions. Any actual strategic planning or crisis response should involve consultation with qualified professionals, subject matter experts, and appropriate government authorities. The scenarios, recommendations, and assessments presented herein are hypothetical and do not reflect official government positions or classified intelligence."
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
