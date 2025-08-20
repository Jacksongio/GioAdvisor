import { NextRequest, NextResponse } from 'next/server'

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
      timeFrame 
    } = body

    // Use OpenAI for enhanced briefing generation (if available)
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a senior intelligence analyst preparing a formal military briefing document in the style of declassified government intelligence documents from the 1960s Cuban Missile Crisis era. Write in formal, objective language and structure the briefing exactly like the historical document format with:

1. A date header
2. "Proposed plan of action in light of:" followed by points (a), (b), (c), (d)
3. A concluding assessment paragraph
4. "Therefore it seems to me a more aggressive action is indicated..." paragraph
5. Numbered recommendations (1), (2), (3), (4)
6. Final assessment paragraph
7. Classification and author signature

Use formal military intelligence language with some deliberate typewriter-style irregularities to match the historical authenticity. Include specific geopolitical analysis based on the scenario provided.`
            },
            {
              role: 'user',
              content: `Generate a formal intelligence briefing for the following scenario:

Date: ${date}
Scenario: ${scenario}
Primary Country: ${selectedCountry}
Offensive Force: ${offensiveCountry}
Defensive Force: ${defensiveCountry}
Severity Level: ${severityLevel}
Time Frame: ${timeFrame}

Current Analysis Results:
- Diplomatic Response: ${simulationResults.diplomaticResponse || 'N/A'}%
- Military Readiness: ${simulationResults.militaryReadiness || 'N/A'}%
- Economic Impact: ${simulationResults.economicImpact || 'N/A'}%
- Public Support: ${simulationResults.publicSupport || 'N/A'}%
- Alliance Strength: ${simulationResults.allianceStrength || 'N/A'}%

Please provide a JSON response with the following structure:
{
  "title": "Brief descriptive title for the briefing in historical document style",
  "sections": [
    {"point": "(a)", "content": "Detailed intelligence analysis point with specific geopolitical context"},
    {"point": "(b)", "content": "Military/strategic assessment with operational details"},
    {"point": "(c)", "content": "Economic and diplomatic impact analysis"},
    {"point": "(d)", "content": "Long-term strategic implications and threat assessment"}
  ],
  "recommendations": [
    "Immediate continuing aggressive political action designed to...",
    "Coordination through domestic and international channels to...", 
    "Enhanced intelligence gathering and surveillance operations to...",
    "Preparation of graduated response options including..."
  ],
  "conclusion": "Comprehensive concluding assessment stating 'The above assessments lead to the conclusion that...' with strategic outlook",
  "classification": "CONFIDENTIAL",
  "author": "Strategic Intelligence Division"
}`
            }
          ],
          max_tokens: 2500,
          temperature: 0.7,
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
      title: `Proposed plan of action for ${scenario.slice(0, 80)}${scenario.length > 80 ? '...' : ''} in the light of:`,
      sections: [
        {
          point: "(a)",
          content: `Intelligence assessments indicate escalating military tensions between ${offensiveCountry} and ${defensiveCountry}, with significant implications for ${selectedCountry} strategic interests. Recent developments suggest military preparations and potential force deployments during the ${timeFrame} timeframe.`
        },
        {
          point: "(b)", 
          content: `Analysis of regional communication intercepts and satellite reconnaissance suggests substantial military equipment movements and personnel deployments. The severity level is assessed at ${severityLevel}, indicating immediate attention required from national security apparatus.`
        },
        {
          point: "(c)",
          content: `Current diplomatic initiatives have achieved limited success, with international response coordination showing approximately ${simulationResults.diplomaticResponse || 65}% effectiveness. Economic factors and alliance considerations may prove insufficient without enhanced strategic coordination.`
        },
        {
          point: "(d)",
          content: `Assessment indicates that modified diplomatic approach will contribute importantly to intelligence gathering and will impede hostile regime's strategic progress, but will not be sufficient to frustrate the regime's advancement in view of evidence of substantial foreign technical assistance.`
        }
      ],
      recommendations: [
        "An immediate continuing aggressive political action designed to awaken and alarm all regional allies and the free world as to the extreme dangers inherent in the present situation.",
        "Appropriate actions should be taken through domestic and foreign channels to inform and mobilize support through the United Nations, regional organizations, and bilateral partnerships at the level of head of state and foreign minister.",
        "Enhanced intelligence gathering and surveillance operations to monitor military movements, communication channels, and strategic deployments in the affected region with immediate effect.",
        "The instantaneous commitment of sufficient diplomatic and economic pressure to contain the situation, establish deterrent capabilities, and maintain strategic stability in the region."
      ],
      conclusion: `The above assessments lead to the conclusion that with the passage of time, it is possible there will evolve a more dangerous and complex conflict situation that could serve as a model for similar actions by hostile forces throughout the region, and moreover as a potential escalation point for broader strategic confrontation. Therefore it seems to me a more aggressive action is indicated than any heretofore considered, and should be patterned along comprehensive strategic lines.`,
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
