import openai from './openai'
import fs from 'fs'
import path from 'path'

export interface TreatyChunk {
  id: string
  content: string
  metadata: {
    section: string
    treatyType: 'historical' | 'multilateral' | 'bilateral' | 'environmental' | 'trade' | 'un'
    year?: string
    parties?: string[]
    chunkIndex: number
  }
}

export interface TreatySearchResult {
  answer: string
  relevantTreaties: TreatyChunk[]
  searchQuery: string
  confidence: number
}

class TreatyRAG {
  private chunks: TreatyChunk[] = []
  private embeddings: Map<string, number[]> = new Map()
  private initialized = false

  async initialize() {
    if (this.initialized) return

    const treatiesPath = path.join(process.cwd(), 'data', 'treaties.txt')
    const content = fs.readFileSync(treatiesPath, 'utf-8')
    
    this.chunks = this.processTreatiesFile(content)
    await this.generateEmbeddings()
    
    this.initialized = true
    console.log(`Initialized TreatyRAG with ${this.chunks.length} chunks`)
  }

  private processTreatiesFile(content: string): TreatyChunk[] {
    const lines = content.split('\n')
    const chunks: TreatyChunk[] = []
    let currentSection = 'unknown'
    let currentTreatyType: TreatyChunk['metadata']['treatyType'] = 'historical'
    let chunkIndex = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Detect section headers
      if (line.startsWith('Section')) {
        currentSection = line
        if (line.includes('Historical Treaties')) {
          currentTreatyType = 'historical'
        } else if (line.includes('Multilateral Treaties') && line.includes('UN')) {
          currentTreatyType = 'un'
        } else if (line.includes('US Treaties')) {
          currentTreatyType = 'bilateral'
        } else if (line.includes('Environmental')) {
          currentTreatyType = 'environmental'
        } else if (line.includes('Trade')) {
          currentTreatyType = 'trade'
        } else {
          currentTreatyType = 'multilateral'
        }
        continue
      }

      // Skip chapter headers and other metadata lines
      if (line.startsWith('Chapter') || line.startsWith('Bilateral:') || line.startsWith('Multilateral:')) {
        continue
      }

      // Process treaty entries
      if (line.includes(':')) {
        const treatyData = this.parseTreatyLine(line)
        if (treatyData) {
          chunks.push({
            id: `treaty_${chunkIndex}`,
            content: line,
            metadata: {
              section: currentSection,
              treatyType: currentTreatyType,
              year: treatyData.year,
              parties: treatyData.parties,
              chunkIndex
            }
          })
          chunkIndex++
        }
      }
    }

    return chunks
  }

  private parseTreatyLine(line: string): { year?: string, parties?: string[] } | null {
    const yearMatch = line.match(/\((\d{4})\)/) || line.match(/(\d{4}):/) || line.match(/(\d{4}) BCE/) || line.match(/c\. (\d{4})/)
    const year = yearMatch ? yearMatch[1] : undefined

    // Extract parties (text in parentheses at the end)
    const partiesMatch = line.match(/\(([^)]+)\)$/)
    const parties = partiesMatch ? partiesMatch[1].split(',').map(p => p.trim()) : undefined

    return { year, parties }
  }

  private async generateEmbeddings() {
    console.log('Generating embeddings for treaty chunks...')
    
    const batchSize = 20 // Process in smaller batches to avoid API limits
    for (let i = 0; i < this.chunks.length; i += batchSize) {
      const batch = this.chunks.slice(i, i + batchSize)
      
      try {
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: batch.map(chunk => chunk.content)
        })

        batch.forEach((chunk, index) => {
          this.embeddings.set(chunk.id, response.data[index].embedding)
        })

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error generating embeddings for batch ${i}:`, error)
        throw error
      }
    }
    
    console.log(`Generated ${this.embeddings.size} embeddings`)
  }

  async searchTreaties(query: string, limit = 10): Promise<TreatyChunk[]> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Generate query embedding
    const queryResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query
    })
    const queryEmbedding = queryResponse.data[0].embedding

    // Calculate similarities
    const similarities: Array<{ chunk: TreatyChunk, similarity: number }> = []

    for (const chunk of this.chunks) {
      const chunkEmbedding = this.embeddings.get(chunk.id)
      if (chunkEmbedding) {
        const similarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding)
        similarities.push({ chunk, similarity })
      }
    }

    // Use enhanced hybrid retrieval
    const semanticScores = similarities.map((sim, index) => ({ index, score: sim.similarity }))
    const bm25Scores = this.computeBM25Scores(query)
    const hybridScores = this.fuseRankings(semanticScores, bm25Scores)
    
    const candidates = hybridScores
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(limit * 2, 16))
      .map(item => similarities[item.index].chunk)

    return this.crossEncoderRerank(query, candidates).then(results => results.slice(0, limit))
  }

  async queryTreaties(question: string, scenarioContext?: any): Promise<TreatySearchResult> {
    const relevantTreaties = await this.searchTreaties(question, 8)
    
    // Build context from relevant treaties
    const treatyContext = relevantTreaties
      .map(treaty => `Treaty: ${treaty.content}\nType: ${treaty.metadata.treatyType}\nSection: ${treaty.metadata.section}`)
      .join('\n\n')

    // Build scenario context if provided
    let scenarioPrompt = ''
    if (scenarioContext) {
      scenarioPrompt = `
CURRENT GEOPOLITICAL SCENARIO:
- Your Country: ${scenarioContext.selectedCountry || 'Not specified'}
- Conflict Type: ${scenarioContext.conflictScenario || 'Not specified'}
- Parties: ${scenarioContext.offensiveCountry || 'N/A'} vs ${scenarioContext.defensiveCountry || 'N/A'}
- Details: ${scenarioContext.scenarioDetails || 'None provided'}
- Time Frame: ${scenarioContext.timeFrame || 'Not specified'}
`
    }

    const systemPrompt = `You are an expert international law and treaty specialist. Use the following treaty database to answer questions about international agreements, their historical context, and their relevance to current geopolitical situations.

${scenarioPrompt}

TREATY DATABASE CONTEXT:
${treatyContext}

INSTRUCTIONS:
1. Answer the question using relevant treaties from the database
2. Cite specific treaties by name and year when possible
3. Explain the historical context and modern relevance
4. If the current scenario is provided, relate treaties to the specific situation
5. Distinguish between historical precedents and current active agreements
6. Provide actionable insights for policymakers

Be precise, factual, and cite your sources from the treaty database.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.2,
      max_tokens: 800
    })

    const answer = completion.choices[0]?.message?.content || "I couldn't generate a response."
    
    // Calculate confidence based on relevance of top treaties
    const avgSimilarity = relevantTreaties.length > 0 
      ? relevantTreaties.slice(0, 3).reduce((sum, treaty) => {
          const embedding = this.embeddings.get(treaty.id)
          return sum + (embedding ? 0.8 : 0.5) // Simplified confidence calculation
        }, 0) / Math.min(3, relevantTreaties.length)
      : 0.5

    return {
      answer,
      relevantTreaties,
      searchQuery: question,
      confidence: avgSimilarity
    }
  }

  async getTreatyStatistics() {
    if (!this.initialized) {
      await this.initialize()
    }

    const stats = {
      totalTreaties: this.chunks.length,
      byType: {} as Record<string, number>,
      byEra: {} as Record<string, number>,
      ancientTreaties: 0,
      modernTreaties: 0
    }

    this.chunks.forEach(chunk => {
      // Count by type
      stats.byType[chunk.metadata.treatyType] = (stats.byType[chunk.metadata.treatyType] || 0) + 1

      // Count by era
      if (chunk.metadata.year) {
        const year = parseInt(chunk.metadata.year)
        if (year < 1000) {
          stats.ancientTreaties++
          stats.byEra['Ancient (< 1000)'] = (stats.byEra['Ancient (< 1000)'] || 0) + 1
        } else if (year < 1500) {
          stats.byEra['Medieval (1000-1499)'] = (stats.byEra['Medieval (1000-1499)'] || 0) + 1
        } else if (year < 1800) {
          stats.byEra['Early Modern (1500-1799)'] = (stats.byEra['Early Modern (1500-1799)'] || 0) + 1
        } else if (year < 1945) {
          stats.byEra['Modern (1800-1944)'] = (stats.byEra['Modern (1800-1944)'] || 0) + 1
        } else {
          stats.modernTreaties++
          stats.byEra['Contemporary (1945+)'] = (stats.byEra['Contemporary (1945+)'] || 0) + 1
        }
      }
    })

    return stats
  }

  async generateScenarioQuery(scenarioContext: any): Promise<string> {
    // Generate intelligent search query based on scenario
    const scenario = scenarioContext.conflictScenario?.toLowerCase() || ''
    const countries = [
      scenarioContext.selectedCountry,
      scenarioContext.offensiveCountry, 
      scenarioContext.defensiveCountry
    ].filter(Boolean)

    let queryTerms = []

    // Add scenario-specific terms
    if (scenario.includes('nuclear')) queryTerms.push('nuclear', 'non-proliferation', 'disarmament')
    if (scenario.includes('trade') || scenario.includes('economic')) queryTerms.push('trade', 'economic', 'sanctions')
    if (scenario.includes('territorial') || scenario.includes('border')) queryTerms.push('territorial', 'border', 'dispute')
    if (scenario.includes('environmental')) queryTerms.push('environmental', 'climate', 'conservation')
    if (scenario.includes('cyber')) queryTerms.push('cyber', 'telecommunications', 'information')
    if (scenario.includes('space')) queryTerms.push('space', 'satellite', 'outer space')
    if (scenario.includes('diplomatic')) queryTerms.push('diplomatic', 'consular', 'immunity')

    // Add universal terms for any conflict
    queryTerms.push('united nations', 'geneva', 'peace', 'security')

    return queryTerms.join(' ')
  }

  async generateUtilizationGuidance(treaties: TreatyChunk[], scenarioContext: any): Promise<Record<string, string>> {
    if (treaties.length === 0) return {}

    const guidance: Record<string, string> = {}

    // Build scenario context
    const scenarioPrompt = `
CURRENT GEOPOLITICAL SCENARIO:
- Your Country: ${scenarioContext.selectedCountry || 'Not specified'}
- Conflict Type: ${scenarioContext.conflictScenario || 'Not specified'}
- Offensive Party: ${scenarioContext.offensiveCountry || 'Not specified'}
- Defensive Party: ${scenarioContext.defensiveCountry || 'Not specified'}
- Scenario Details: ${scenarioContext.scenarioDetails || 'None provided'}
- Time Frame: ${scenarioContext.timeFrame || 'Not specified'}
- Severity: ${scenarioContext.severityLevel || 'Not specified'}

ANALYSIS PARAMETERS:
Economic: Trade Dependencies ${scenarioContext.tradeDependencies || 50}%, Sanctions Impact ${scenarioContext.sanctionsImpact || 50}%
Military: Defense Capabilities ${scenarioContext.defenseCapabilities || 50}%, Alliance Support ${scenarioContext.allianceSupport || 50}%
Diplomatic: UN Support ${scenarioContext.unSupport || 50}%, Regional Influence ${scenarioContext.regionalInfluence || 50}%
`

    // Process treaties in batches to avoid API limits
    const batchSize = 3
    for (let i = 0; i < treaties.length; i += batchSize) {
      const batch = treaties.slice(i, i + batchSize)
      
      try {
        const prompt = `${scenarioPrompt}

For each of the following treaties, provide a concise 2-3 sentence explanation of how it can be utilized in this specific scenario. Focus on practical applications, obligations, and strategic opportunities.

${batch.map((treaty, index) => `${i + index + 1}. ${treaty.content}`).join('\n\n')}

Respond in this format:
Treaty 1: [Practical utilization guidance]
Treaty 2: [Practical utilization guidance]
Treaty 3: [Practical utilization guidance]`

        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 600
        })

        const response = completion.choices[0]?.message?.content || ""
        
        // Parse the response and map to treaty IDs
        const guidanceLines = response.split('\n').filter(line => line.trim().startsWith('Treaty'))
        
        batch.forEach((treaty, batchIndex) => {
          const guidanceLine = guidanceLines[batchIndex]
          if (guidanceLine) {
            const guidanceText = guidanceLine.replace(/^Treaty \d+:\s*/, '').trim()
            guidance[treaty.id] = guidanceText
          }
        })

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.warn(`Error generating guidance for batch ${i}:`, error)
        // Provide fallback guidance
        batch.forEach(treaty => {
          guidance[treaty.id] = "This treaty provides relevant legal framework and obligations that should be considered in the current scenario."
        })
      }
    }

    return guidance
  }

  async generateViolationConsequences(treaties: TreatyChunk[], scenarioContext: any): Promise<Record<string, string>> {
    if (treaties.length === 0) return {}

    const consequences: Record<string, string> = {}

    // Process treaties in batches
    const batchSize = 3
    for (let i = 0; i < treaties.length; i += batchSize) {
      const batch = treaties.slice(i, i + batchSize)
      
      try {
        const prompt = `For each of the following international treaties, describe the specific punishments, consequences, and enforcement mechanisms for violations. Focus on:
- Legal sanctions and penalties
- International court jurisdiction
- Economic/diplomatic consequences
- Enforcement bodies and procedures

${batch.map((treaty, index) => `${i + index + 1}. ${treaty.content}`).join('\n\n')}

Respond in this format:
Treaty 1: [Violation consequences and punishments]
Treaty 2: [Violation consequences and punishments]  
Treaty 3: [Violation consequences and punishments]`

        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 600
        })

        const response = completion.choices[0]?.message?.content || ""
        
        // Parse the response and map to treaty IDs
        const consequenceLines = response.split('\n').filter(line => line.trim().startsWith('Treaty'))
        
        batch.forEach((treaty, batchIndex) => {
          const consequenceLine = consequenceLines[batchIndex]
          if (consequenceLine) {
            const consequenceText = consequenceLine.replace(/^Treaty \d+:\s*/, '').trim()
            consequences[treaty.id] = consequenceText
          }
        })

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.warn(`Error generating consequences for batch ${i}:`, error)
        // Provide fallback consequences
        batch.forEach(treaty => {
          consequences[treaty.id] = "Violations may result in international legal action, diplomatic sanctions, and loss of treaty benefits."
        })
      }
    }

    return consequences
  }

  analyzeCountryParticipation(treaties: TreatyChunk[], scenarioContext: any): Record<string, any> {
    const participation: Record<string, any> = {}
    
    const countries = {
      selected: scenarioContext.selectedCountry?.toLowerCase(),
      offensive: scenarioContext.offensiveCountry?.toLowerCase(), 
      defensive: scenarioContext.defensiveCountry?.toLowerCase()
    }

    treaties.forEach(treaty => {
      const content = treaty.content.toLowerCase()
      const participation_info = {
        selectedCountrySigned: false,
        offensiveCountrySigned: false,
        defensiveCountrySigned: false,
        bothPartiesSigned: false,
        totalParties: treaty.metadata.parties?.length || 0,
        signingStatus: 'unknown'
      }

      // Check if countries are mentioned as parties (simplified detection)
      if (countries.selected && content.includes(countries.selected)) {
        participation_info.selectedCountrySigned = true
      }
      if (countries.offensive && content.includes(countries.offensive)) {
        participation_info.offensiveCountrySigned = true
      }
      if (countries.defensive && content.includes(countries.defensive)) {
        participation_info.defensiveCountrySigned = true
      }

      // For universal/multilateral treaties, assume major powers are signatories
      const universalTreaties = ['united nations', 'geneva', 'vienna convention', 'nuclear non-proliferation', 'chemical weapons', 'world trade']
      const isUniversal = universalTreaties.some(term => content.includes(term))
      
      if (isUniversal) {
        participation_info.selectedCountrySigned = true
        participation_info.offensiveCountrySigned = true
        participation_info.defensiveCountrySigned = true
      }

      // Determine signing status
      if (participation_info.offensiveCountrySigned && participation_info.defensiveCountrySigned) {
        participation_info.bothPartiesSigned = true
        participation_info.signingStatus = 'both_signed'
      } else if (participation_info.offensiveCountrySigned && !participation_info.defensiveCountrySigned) {
        participation_info.signingStatus = 'aggressor_only'
      } else if (!participation_info.offensiveCountrySigned && participation_info.defensiveCountrySigned) {
        participation_info.signingStatus = 'victim_only'
      } else {
        participation_info.signingStatus = 'neither_signed'
      }

      participation[treaty.id] = participation_info
    })

    return participation
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }

  // BM25 Keyword Search Implementation
  private computeBM25Scores(query: string): Array<{index: number, score: number}> {
    const k1 = 1.5 // Term frequency saturation parameter
    const b = 0.75  // Length normalization parameter
    
    const queryTerms = this.tokenize(query.toLowerCase())
    const avgDocLength = this.chunks.reduce((sum, chunk) => 
      sum + this.tokenize(chunk.content.toLowerCase()).length, 0) / this.chunks.length

    return this.chunks.map((chunk, index) => {
      const docTerms = this.tokenize(chunk.content.toLowerCase())
      const docLength = docTerms.length
      
      let score = 0
      for (const term of queryTerms) {
        const tf = docTerms.filter(t => t === term).length
        const df = this.chunks.filter(c => 
          this.tokenize(c.content.toLowerCase()).includes(term)).length
        
        if (df > 0) {
          const idf = Math.log((this.chunks.length - df + 0.5) / (df + 0.5))
          const numerator = tf * (k1 + 1)
          const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength))
          score += idf * (numerator / denominator)
        }
      }
      
      return { index, score }
    })
  }

  // Tokenization for BM25
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2)
  }

  // Reciprocal Rank Fusion
  private fuseRankings(
    semanticScores: Array<{index: number, score: number}>,
    bm25Scores: Array<{index: number, score: number}>
  ): Array<{index: number, score: number}> {
    const k = 60 // RRF parameter
    
    // Sort and create rankings
    const semanticRanked = semanticScores
      .sort((a, b) => b.score - a.score)
      .map((item, rank) => ({ index: item.index, rank: rank + 1 }))
    
    const bm25Ranked = bm25Scores
      .sort((a, b) => b.score - a.score)
      .map((item, rank) => ({ index: item.index, rank: rank + 1 }))

    // Combine rankings using RRF
    const fusedScores: Record<number, number> = {}
    
    semanticRanked.forEach(item => {
      fusedScores[item.index] = (fusedScores[item.index] || 0) + 1 / (k + item.rank)
    })
    
    bm25Ranked.forEach(item => {
      fusedScores[item.index] = (fusedScores[item.index] || 0) + 1 / (k + item.rank)
    })

    return Object.entries(fusedScores).map(([index, score]) => ({
      index: parseInt(index),
      score
    }))
  }

  // Cross-Encoder Reranking using GPT-4
  private async crossEncoderRerank(query: string, candidates: TreatyChunk[]): Promise<TreatyChunk[]> {
    if (candidates.length <= 3) return candidates

    try {
      const prompt = `Rate the relevance of each treaty to the query on a scale of 1-10.

Query: "${query}"

Treaties to rank:
${candidates.map((treaty, i) => `${i + 1}. ${treaty.content.substring(0, 200)}...`).join('\n\n')}

Respond with only the rankings in this format:
1: [score]
2: [score]
3: [score]
etc.`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 200
      })

      const response = completion.choices[0]?.message?.content || ""
      const scores = this.parseRerankingScores(response, candidates.length)
      
      // Combine candidates with scores and sort
      const scoredCandidates = candidates.map((treaty, index) => ({
        treaty,
        score: scores[index] || 0
      }))

      return scoredCandidates
        .sort((a, b) => b.score - a.score)
        .map(item => item.treaty)

    } catch (error) {
      console.warn('Cross-encoder reranking failed:', error)
      return candidates // Fallback to original order
    }
  }

  // Parse reranking scores from GPT response
  private parseRerankingScores(response: string, count: number): number[] {
    const scores = new Array(count).fill(5) // Default score
    
    const lines = response.split('\n')
    for (const line of lines) {
      const match = line.match(/(\d+):\s*(\d+(?:\.\d+)?)/)
      if (match) {
        const index = parseInt(match[1]) - 1
        const score = parseFloat(match[2])
        if (index >= 0 && index < count) {
          scores[index] = score
        }
      }
    }
    
    return scores
  }
}

export const treatyRAG = new TreatyRAG()