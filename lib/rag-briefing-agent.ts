import OpenAI from 'openai'
import { TreatyRetrievalSystem, RetrievalQuery, RetrievedDocument } from './rag-retrieval-system'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface BriefingContext {
  scenario: string
  selectedCountry: string
  offensiveCountry: string
  defensiveCountry: string
  severityLevel: string
  timeFrame: string
  simulationResults: any
  date: string
}

export interface GeneratedBriefing {
  title: string
  sections: Array<{
    point: string
    content: string
  }>
  recommendations: string[]
  conclusion: string
  finalRecommendation: string
  classification: string
  author: string
  treatyReferences: Array<{
    title: string
    relevance: string
    keyProvisions: string
  }>
  legalAnalysis: {
    applicableTreaties: string[]
    legalObligations: string[]
    permissibleActions: string[]
    constraints: string[]
  }
}

export interface AgentAnalysis {
  retrievedTreaties: RetrievedDocument[]
  contextualAnalysis: string
  legalImplications: string
  strategicOptions: string[]
  generatedBriefing: GeneratedBriefing
  metadata: {
    processingTime: number
    treatiesAnalyzed: number
    confidenceScore: number
  }
}

export class RAGBriefingAgent {
  private retrievalSystem: TreatyRetrievalSystem
  private isInitialized = false

  constructor() {
    this.retrievalSystem = new TreatyRetrievalSystem()
  }

  /**
   * Initialize the RAG agent
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🤖 Initializing RAG Briefing Agent...')
    await this.retrievalSystem.initialize()
    this.isInitialized = true
    console.log('✅ RAG Briefing Agent ready for operation')
  }

  /**
   * Generate a comprehensive briefing using RAG
   */
  async generateBriefing(context: BriefingContext): Promise<AgentAnalysis> {
    await this.ensureInitialized()
    
    const startTime = Date.now()

    // Step 1: Retrieve relevant treaties
    console.log('📋 Retrieving relevant treaties...')
    const retrievalQuery: RetrievalQuery = {
      scenario: context.scenario,
      selectedCountry: context.selectedCountry,
      offensiveCountry: context.offensiveCountry,
      defensiveCountry: context.defensiveCountry,
      severityLevel: context.severityLevel,
      timeFrame: context.timeFrame
    }

    const retrievalResult = await this.retrievalSystem.hybridSearch(retrievalQuery, 12)
    console.log(`🎯 Retrieved ${retrievalResult.retrievedDocs.length} relevant treaties`)

    // Step 2: Analyze legal context
    console.log('⚖️ Analyzing legal implications...')
    const contextualAnalysis = await this.analyzeContext(context, retrievalResult.retrievedDocs)
    const legalImplications = await this.analyzeLegalImplications(context, retrievalResult.retrievedDocs)

    // Step 3: Generate strategic options
    console.log('📊 Generating strategic options...')
    const strategicOptions = await this.generateStrategicOptions(context, retrievalResult.retrievedDocs)

    // Step 4: Generate the formal briefing
    console.log('📝 Generating formal briefing document...')
    const generatedBriefing = await this.generateFormalBriefing(
      context, 
      retrievalResult.retrievedDocs, 
      contextualAnalysis, 
      legalImplications, 
      strategicOptions
    )

    const processingTime = Date.now() - startTime

    return {
      retrievedTreaties: retrievalResult.retrievedDocs,
      contextualAnalysis,
      legalImplications,
      strategicOptions,
      generatedBriefing,
      metadata: {
        processingTime,
        treatiesAnalyzed: retrievalResult.retrievedDocs.length,
        confidenceScore: this.calculateConfidenceScore(retrievalResult.retrievedDocs)
      }
    }
  }

  /**
   * Analyze the contextual relevance of retrieved treaties
   */
  private async analyzeContext(
    context: BriefingContext, 
    treaties: RetrievedDocument[]
  ): Promise<string> {
    const treatyDescriptions = treaties.slice(0, 6).map(doc => 
      `- ${doc.chunk.metadata.title}: ${doc.chunk.content.substring(0, 200)}... (Relevance: ${doc.reason})`
    ).join('\n')

    const prompt = `As a senior legal analyst, provide a concise analysis of how these international treaties relate to the following conflict scenario:

SCENARIO: ${context.scenario}
COUNTRIES INVOLVED: ${context.offensiveCountry} vs ${context.defensiveCountry} (Analysis from ${context.selectedCountry} perspective)
SEVERITY: ${context.severityLevel}
TIMEFRAME: ${context.timeFrame}

RELEVANT TREATIES:
${treatyDescriptions}

Provide a 2-3 paragraph analysis of:
1. How these treaties create the legal framework for this conflict
2. Which specific provisions are most relevant
3. What obligations or constraints they place on the involved parties

Keep the analysis focused and actionable for policy makers.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
    })

    return response.choices[0].message.content || 'Unable to generate contextual analysis'
  }

  /**
   * Analyze legal implications and constraints
   */
  private async analyzeLegalImplications(
    context: BriefingContext, 
    treaties: RetrievedDocument[]
  ): Promise<string> {
    const treatyTitles = treaties.map(doc => doc.chunk.metadata.title).join(', ')

    const prompt = `As an international law expert, analyze the legal implications of this conflict scenario:

CONFLICT: ${context.scenario}
KEY ACTORS: ${context.offensiveCountry}, ${context.defensiveCountry}, ${context.selectedCountry}

APPLICABLE TREATIES: ${treatyTitles}

Provide a concise legal analysis covering:
1. Legal obligations under international law
2. Permissible responses and actions
3. Legal constraints and prohibited actions
4. Potential consequences of various response options

Focus on practical legal guidance for policy makers. Be specific about what actions are legally supported vs. prohibited.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
    })

    return response.choices[0].message.content || 'Unable to generate legal analysis'
  }

  /**
   * Generate strategic options based on treaty framework
   */
  private async generateStrategicOptions(
    context: BriefingContext, 
    treaties: RetrievedDocument[]
  ): Promise<string[]> {
    const treatyContext = treaties.slice(0, 5).map(doc => 
      `${doc.chunk.metadata.title}: ${doc.chunk.metadata.description}`
    ).join('\n')

    const prompt = `Based on the following international legal framework, generate 4-6 specific strategic options for ${context.selectedCountry}'s response:

SITUATION: ${context.scenario}
LEGAL FRAMEWORK:
${treatyContext}

Generate strategic options that are:
1. Legally grounded in the treaty framework
2. Proportionate to ${context.severityLevel} severity level
3. Actionable within ${context.timeFrame}
4. Consider ${context.selectedCountry}'s international obligations

Format as a simple list of strategic options, each 1-2 sentences.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
    })

    const content = response.choices[0].message.content || ''
    return content.split('\n').filter(line => line.trim().length > 0).slice(0, 6)
  }

  /**
   * Generate the formal intelligence briefing
   */
  private async generateFormalBriefing(
    context: BriefingContext,
    treaties: RetrievedDocument[],
    contextualAnalysis: string,
    legalImplications: string,
    strategicOptions: string[]
  ): Promise<GeneratedBriefing> {
    // Prepare treaty references
    const treatyReferences = treaties.slice(0, 5).map(doc => ({
      title: doc.chunk.metadata.title,
      relevance: doc.reason,
      keyProvisions: doc.chunk.content.substring(
        doc.chunk.content.indexOf('Description:') + 12, 
        doc.chunk.content.indexOf('Description:') + 150
      ).trim() + '...'
    }))

    // Prepare legal analysis structure
    const legalAnalysis = {
      applicableTreaties: treaties.slice(0, 3).map(doc => doc.chunk.metadata.title),
      legalObligations: this.extractLegalObligations(legalImplications),
      permissibleActions: this.extractPermissibleActions(legalImplications),
      constraints: this.extractConstraints(legalImplications)
    }

    const prompt = `You are a senior intelligence analyst at the National Security Council. Generate a CONFIDENTIAL intelligence briefing in the exact style of declassified 1960s Cuban Missile Crisis documents.

SCENARIO CONTEXT:
Date: ${context.date}
Conflict: ${context.scenario}
Primary Analysis Country: ${context.selectedCountry}
Opposing Forces: ${context.offensiveCountry} vs ${context.defensiveCountry}
Severity Level: ${context.severityLevel}
Operational Timeframe: ${context.timeFrame}

LEGAL FRAMEWORK ANALYSIS:
${contextualAnalysis}

INTERNATIONAL LAW IMPLICATIONS:
${legalImplications}

STRATEGIC OPTIONS AVAILABLE:
${strategicOptions.join('\n')}

RELEVANT TREATY FRAMEWORK:
${treatyReferences.map(ref => `- ${ref.title}: ${ref.keyProvisions}`).join('\n')}

SIMULATION INTELLIGENCE:
- Diplomatic Response Capability: ${context.simulationResults?.diplomaticResponse || 'N/A'}%
- Military Readiness Assessment: ${context.simulationResults?.militaryReadiness || 'N/A'}%
- Economic Impact Projection: ${context.simulationResults?.economicImpact || 'N/A'}%
- Public Support Analysis: ${context.simulationResults?.publicSupport || 'N/A'}%
- Alliance Coordination Strength: ${context.simulationResults?.allianceStrength || 'N/A'}%

Generate a JSON response with this exact structure:
{
  "title": "CONFIDENTIAL briefing title in 1960s government style",
  "sections": [
    {"point": "(a)", "content": "Legal framework analysis based on applicable treaties and international law obligations"},
    {"point": "(b)", "content": "Intelligence assessment of military and diplomatic developments with treaty implications"},
    {"point": "(c)", "content": "Current diplomatic initiatives effectiveness and legal constraints analysis"},
    {"point": "(d)", "content": "Strategic assessment of permissible actions under international law framework"}
  ],
  "recommendations": [
    "Specific immediate action ${context.selectedCountry} should take regarding ${context.offensiveCountry}-${context.defensiveCountry} conflict while ensuring compliance with applicable treaties and international law",
    "Specific diplomatic coordination ${context.selectedCountry} should pursue through named allied countries and international organizations with legal authority under existing treaty frameworks", 
    "Specific intelligence/surveillance operations ${context.selectedCountry} should implement with operational details while respecting international monitoring agreements",
    "Specific military/economic response options ${context.selectedCountry} should prepare within UN Charter and applicable defense treaty constraints"
  ],
  "conclusion": "Assessment paragraph starting with 'The above legal and strategic assessments lead to the conclusion that with the passage of time, regarding the ${context.offensiveCountry}-${context.defensiveCountry} situation...' and ending with 'Therefore it seems to me a more aggressive action is indicated than any heretofore considered regarding the ${context.offensiveCountry}-${context.defensiveCountry} situation, and should be patterned along the following lines:'",
  "finalRecommendation": "Single paragraph explaining which of the 4 recommendations above is most critical for ${context.selectedCountry} and should be prioritized, with specific reasoning based on treaty obligations and strategic considerations",
  "classification": "CONFIDENTIAL",
  "author": "Strategic Intelligence Division, Legal Affairs Section"
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.3,
    })

    try {
      const briefingData = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        ...briefingData,
        treatyReferences,
        legalAnalysis
      }
    } catch (error) {
      console.error('Error parsing briefing JSON:', error)
      // Return fallback briefing
      return this.createFallbackBriefing(context, treatyReferences, legalAnalysis)
    }
  }

  /**
   * Extract legal obligations from analysis text
   */
  private extractLegalObligations(text: string): string[] {
    const obligations = []
    if (text.toLowerCase().includes('obligation')) {
      obligations.push('Treaty compliance obligations')
    }
    if (text.toLowerCase().includes('charter')) {
      obligations.push('UN Charter obligations')
    }
    if (text.toLowerCase().includes('international law')) {
      obligations.push('International law compliance')
    }
    return obligations.length > 0 ? obligations : ['General international law obligations']
  }

  /**
   * Extract permissible actions from analysis text
   */
  private extractPermissibleActions(text: string): string[] {
    const actions = []
    if (text.toLowerCase().includes('self-defense') || text.toLowerCase().includes('article 51')) {
      actions.push('Self-defense under UN Charter Article 51')
    }
    if (text.toLowerCase().includes('diplomatic')) {
      actions.push('Diplomatic engagement and negotiation')
    }
    if (text.toLowerCase().includes('sanction')) {
      actions.push('Economic sanctions within legal framework')
    }
    return actions.length > 0 ? actions : ['Standard diplomatic responses']
  }

  /**
   * Extract constraints from analysis text
   */
  private extractConstraints(text: string): string[] {
    const constraints = []
    if (text.toLowerCase().includes('prohibited') || text.toLowerCase().includes('violation')) {
      constraints.push('Prohibition on actions violating international law')
    }
    if (text.toLowerCase().includes('proportional')) {
      constraints.push('Proportionality requirements')
    }
    if (text.toLowerCase().includes('civilian')) {
      constraints.push('Protection of civilian populations')
    }
    return constraints.length > 0 ? constraints : ['General international law constraints']
  }

  /**
   * Create fallback briefing if AI generation fails
   */
  private createFallbackBriefing(
    context: BriefingContext,
    treatyReferences: any[],
    legalAnalysis: any
  ): GeneratedBriefing {
    return {
      title: `CONFIDENTIAL: Legal Framework Analysis - ${context.scenario.slice(0, 60)}...`,
      sections: [
        {
          point: "(a)",
          content: `International legal framework analysis indicates applicable treaty obligations between ${context.offensiveCountry} and ${context.defensiveCountry} require immediate assessment of ${context.selectedCountry} obligations under relevant international agreements.`
        },
        {
          point: "(b)",
          content: `Intelligence assessments suggest military developments during the ${context.timeFrame} timeframe must be evaluated against existing treaty commitments and international law constraints.`
        },
        {
          point: "(c)",
          content: `Current diplomatic initiatives show ${context.simulationResults?.diplomaticResponse || 65}% effectiveness within established legal frameworks, requiring enhanced coordination through appropriate treaty mechanisms.`
        },
        {
          point: "(d)",
          content: `Strategic assessment indicates that response options must comply with international legal obligations while maintaining effective deterrent capabilities under applicable defense agreements.`
        }
      ],
      recommendations: [
        "Ensure all intelligence operations comply with applicable international monitoring agreements and treaty obligations.",
        "Activate diplomatic consultations through established multilateral frameworks and bilateral treaty mechanisms.",
        "Implement response measures within international law constraints including applicable trade and sanctions frameworks.",
        "Prepare legal justifications for potential actions under UN Charter provisions and relevant defense treaty authorities."
      ],
      conclusion: `The above legal and strategic assessments lead to the conclusion that ${context.selectedCountry} response options must be carefully calibrated to comply with international legal obligations while maintaining strategic effectiveness.`,
      finalRecommendation: `Recommended approach prioritizes treaty-compliant diplomatic engagement while maintaining legal justification for graduated response options under applicable international law frameworks.`,
      classification: "CONFIDENTIAL",
      author: "Strategic Intelligence Division, Legal Affairs Section",
      treatyReferences,
      legalAnalysis
    }
  }

  /**
   * Calculate confidence score based on retrieval quality
   */
  private calculateConfidenceScore(treaties: RetrievedDocument[]): number {
    if (treaties.length === 0) return 0.1

    const avgRelevance = treaties.reduce((sum, doc) => sum + doc.relevanceScore, 0) / treaties.length
    const topScore = treaties[0]?.relevanceScore || 0
    
    // Confidence based on both average relevance and top result quality
    return Math.min((avgRelevance * 0.6 + topScore * 0.4), 0.95)
  }

  /**
   * Ensure agent is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  /**
   * Get agent statistics
   */
  getStats() {
    return {
      initialized: this.isInitialized,
      retrievalStats: this.retrievalSystem.getStats()
    }
  }
}
