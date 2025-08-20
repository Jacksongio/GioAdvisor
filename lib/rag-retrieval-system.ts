import OpenAI from 'openai'
import { ProcessedTreatyChunk, TreatyProcessor } from './rag-treaty-processor'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface RetrievalQuery {
  scenario: string
  selectedCountry: string
  offensiveCountry: string
  defensiveCountry: string
  severityLevel: string
  timeFrame: string
  conflictType?: string
}

export interface RetrievedDocument {
  chunk: ProcessedTreatyChunk
  similarity: number
  relevanceScore: number
  reason: string
}

export interface RetrievalResult {
  query: string
  retrievedDocs: RetrievedDocument[]
  metadata: {
    totalChunksSearched: number
    queryEmbeddingTime: number
    searchTime: number
    topK: number
  }
}

export class TreatyRetrievalSystem {
  private processor: TreatyProcessor
  private chunks: ProcessedTreatyChunk[] = []
  private isInitialized = false

  constructor() {
    this.processor = new TreatyProcessor()
  }

  /**
   * Initialize the retrieval system by loading and processing treaties
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🔄 Initializing Treaty Retrieval System...')
    
    // Load treaties
    await this.processor.loadTreaties()
    
    // Create semantic chunks
    this.processor.createSemanticChunks()
    
    // Generate embeddings
    this.chunks = await this.processor.generateEmbeddings()
    
    this.isInitialized = true
    console.log('✅ Treaty Retrieval System initialized with', this.chunks.length, 'searchable chunks')
  }

  /**
   * Ensure system is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  /**
   * Generate query embedding
   */
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })
    
    return embedding.data[0].embedding
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0
    
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }

  /**
   * Enhanced query construction with diplomatic/legal synonym expansion
   */
  private constructSearchQuery(query: RetrievalQuery): string {
    // Create base search terms
    const baseTerms = [
      `military conflict between ${query.offensiveCountry} and ${query.defensiveCountry}`,
      `${query.selectedCountry} foreign policy`,
      `international law ${query.severityLevel} severity`,
      `diplomatic relations`,
      `peace agreements`,
      `security treaties`,
      `bilateral agreements ${query.offensiveCountry} ${query.defensiveCountry}`,
      `multilateral defense`,
      `conflict resolution`,
      `humanitarian law`,
      query.scenario
    ]

    // Add region-specific terms
    const regionTerms = this.getRegionalTerms(query.offensiveCountry, query.defensiveCountry)
    baseTerms.push(...regionTerms)

    // Add conflict type specific terms
    if (query.conflictType) {
      baseTerms.push(...this.getConflictTypeTerms(query.conflictType))
    }

    // Apply enhanced query expansion with synonyms
    const expandedTerms = this.expandQueryWithSynonyms(baseTerms, query)

    // Intelligently limit expansion to avoid over-dilution
    const optimizedTerms = this.optimizeExpandedQuery(expandedTerms, baseTerms.length)

    // Debug logging for query expansion (can be disabled in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Query expansion: ${baseTerms.length} → ${expandedTerms.length} → ${optimizedTerms.length} terms`)
    }

    return optimizedTerms.join(' ')
  }

  /**
   * Enhanced query expansion with diplomatic/legal synonyms
   */
  private expandQueryWithSynonyms(baseTerms: string[], query: RetrievalQuery): string[] {
    const expandedTerms = [...baseTerms]
    
    // Core diplomatic/legal synonym mappings
    const synonymMap = this.getDiplomaticSynonyms()
    
    // Expand each term with relevant synonyms
    for (const term of baseTerms) {
      const lowerTerm = term.toLowerCase()
      
      // Check for each synonym category
      for (const [baseWord, synonyms] of Object.entries(synonymMap)) {
        if (lowerTerm.includes(baseWord.toLowerCase())) {
          // Add synonym variations
          for (const synonym of synonyms) {
            const expandedTerm = term.replace(new RegExp(baseWord, 'gi'), synonym)
            expandedTerms.push(expandedTerm)
          }
        }
      }
    }

    // Add country name variations
    expandedTerms.push(...this.expandCountryNames(query))
    
    // Add legal document type variations
    expandedTerms.push(...this.expandLegalDocumentTypes(query))
    
    // Add temporal/urgency variations
    expandedTerms.push(...this.expandTemporalTerms(query))

    // Remove duplicates and filter empty terms
    return [...new Set(expandedTerms.filter(term => term.trim().length > 0))]
  }

  /**
   * Core diplomatic and legal synonym dictionary
   */
  private getDiplomaticSynonyms(): Record<string, string[]> {
    return {
      // Legal document types
      'treaty': ['agreement', 'convention', 'accord', 'pact', 'compact', 'concordat', 'protocol'],
      'agreement': ['treaty', 'convention', 'accord', 'pact', 'understanding', 'arrangement'],
      'convention': ['treaty', 'agreement', 'protocol', 'charter', 'covenant'],
      
      // Conflict terminology
      'conflict': ['war', 'hostilities', 'aggression', 'dispute', 'confrontation', 'crisis', 'tension'],
      'war': ['conflict', 'hostilities', 'armed conflict', 'warfare', 'military action'],
      'dispute': ['conflict', 'disagreement', 'controversy', 'contention', 'friction'],
      'aggression': ['attack', 'invasion', 'assault', 'offensive', 'hostility'],
      
      // Diplomatic relations
      'diplomatic': ['bilateral', 'multilateral', 'international', 'foreign policy', 'external relations'],
      'negotiation': ['dialogue', 'talks', 'discussion', 'mediation', 'arbitration'],
      'relations': ['ties', 'connections', 'links', 'cooperation', 'partnership'],
      
      // Peace and security
      'peace': ['ceasefire', 'armistice', 'truce', 'resolution', 'settlement', 'reconciliation'],
      'security': ['defense', 'protection', 'safeguard', 'safety', 'stability'],
      'alliance': ['coalition', 'partnership', 'bloc', 'union', 'confederation'],
      
      // Legal terms
      'obligation': ['duty', 'responsibility', 'commitment', 'requirement', 'binding'],
      'violation': ['breach', 'infringement', 'contravention', 'transgression'],
      'sovereignty': ['autonomy', 'independence', 'self-determination', 'territorial integrity'],
      
      // International organizations
      'United Nations': ['UN', 'United Nations Organization', 'UNO'],
      'Security Council': ['UNSC', 'UN Security Council'],
      'General Assembly': ['UNGA', 'UN General Assembly'],
      
      // Military terms
      'military': ['armed forces', 'defense', 'army', 'naval', 'air force'],
      'defense': ['military', 'protection', 'security', 'safeguard'],
      'intervention': ['involvement', 'action', 'operation', 'deployment']
    }
  }

  /**
   * Expand country names with common variations
   */
  private expandCountryNames(query: RetrievalQuery): string[] {
    const countryVariations: Record<string, string[]> = {
      'United States': ['US', 'USA', 'America', 'American', 'United States of America'],
      'United Kingdom': ['UK', 'Britain', 'British', 'Great Britain', 'England'],
      'Russia': ['Russian Federation', 'Soviet Union', 'USSR', 'Russian'],
      'China': ['People\'s Republic of China', 'PRC', 'Chinese'],
      'Germany': ['Federal Republic of Germany', 'FRG', 'German'],
      'France': ['French Republic', 'French'],
      'Japan': ['Japanese'],
      'India': ['Republic of India', 'Indian'],
      'Canada': ['Canadian'],
      'Australia': ['Australian'],
      'Brazil': ['Brazilian'],
      'Iran': ['Islamic Republic of Iran', 'Persia', 'Persian'],
      'North Korea': ['DPRK', 'Democratic People\'s Republic of Korea'],
      'South Korea': ['Republic of Korea', 'ROK'],
      'Israel': ['Israeli'],
      'Pakistan': ['Pakistani'],
      'Turkey': ['Turkish', 'Türkiye']
    }

    const variations: string[] = []
    const countries = [query.selectedCountry, query.offensiveCountry, query.defensiveCountry]
    
    for (const country of countries) {
      if (countryVariations[country]) {
        variations.push(...countryVariations[country])
        // Add possessive forms
        variations.push(...countryVariations[country].map(v => `${v}'s`))
      }
    }
    
    return variations
  }

  /**
   * Expand legal document types based on scenario
   */
  private expandLegalDocumentTypes(query: RetrievalQuery): string[] {
    const documentTypes = [
      'bilateral treaty', 'multilateral treaty', 'international agreement',
      'peace treaty', 'defense pact', 'trade agreement', 'non-aggression pact',
      'diplomatic protocol', 'status of forces agreement', 'mutual defense treaty',
      'arms control agreement', 'nuclear treaty', 'environmental accord',
      'human rights convention', 'geneva convention', 'vienna convention',
      'charter', 'statute', 'covenant', 'memorandum of understanding',
      'joint declaration', 'communique', 'framework agreement'
    ]
    
    return documentTypes
  }

  /**
   * Expand temporal and urgency terms
   */
  private expandTemporalTerms(query: RetrievalQuery): string[] {
    const urgencyTerms = []
    
    if (query.severityLevel) {
      const severityMap: Record<string, string[]> = {
        'high': ['urgent', 'critical', 'emergency', 'immediate', 'pressing'],
        'medium': ['important', 'significant', 'moderate', 'notable'],
        'low': ['minor', 'limited', 'contained', 'manageable']
      }
      
      const level = query.severityLevel.toLowerCase()
      if (severityMap[level]) {
        urgencyTerms.push(...severityMap[level])
      }
    }
    
    if (query.timeFrame) {
      const timeMap: Record<string, string[]> = {
        'immediate': ['urgent', 'emergency', 'crisis', 'rapid response'],
        'short-term': ['quick', 'fast', 'rapid', 'immediate'],
        'medium-term': ['ongoing', 'sustained', 'continued'],
        'long-term': ['strategic', 'comprehensive', 'extended', 'prolonged']
      }
      
      const frame = query.timeFrame.toLowerCase()
      for (const [key, values] of Object.entries(timeMap)) {
        if (frame.includes(key)) {
          urgencyTerms.push(...values)
        }
      }
    }
    
    return urgencyTerms
  }

  /**
   * Optimize expanded query to prevent over-dilution while maintaining coverage
   */
  private optimizeExpandedQuery(expandedTerms: string[], originalCount: number): string[] {
    // Intelligent expansion ratio: limit to 3x original terms to maintain focus
    const maxTerms = Math.max(originalCount * 3, 50)
    
    if (expandedTerms.length <= maxTerms) {
      return expandedTerms
    }

    // Prioritize terms by importance
    const prioritizedTerms: { term: string; priority: number }[] = expandedTerms.map(term => ({
      term,
      priority: this.calculateTermPriority(term)
    }))

    // Sort by priority and take top terms
    return prioritizedTerms
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxTerms)
      .map(item => item.term)
  }

  /**
   * Calculate priority score for query terms
   */
  private calculateTermPriority(term: string): number {
    let priority = 1.0
    const lowerTerm = term.toLowerCase()

    // High priority terms
    const highPriorityKeywords = [
      'treaty', 'agreement', 'convention', 'conflict', 'war', 'peace',
      'security', 'diplomatic', 'military', 'defense', 'alliance'
    ]
    
    const mediumPriorityKeywords = [
      'bilateral', 'multilateral', 'international', 'negotiation',
      'resolution', 'violation', 'sovereignty'
    ]

    // Boost priority for key diplomatic/legal terms
    for (const keyword of highPriorityKeywords) {
      if (lowerTerm.includes(keyword)) {
        priority += 2.0
        break
      }
    }

    for (const keyword of mediumPriorityKeywords) {
      if (lowerTerm.includes(keyword)) {
        priority += 1.0
        break
      }
    }

    // Boost for country names (proper nouns typically more important)
    if (/^[A-Z]/.test(term)) {
      priority += 0.5
    }

    // Penalty for very long terms (likely over-specific)
    if (term.length > 50) {
      priority *= 0.7
    }

    // Boost for compound terms with multiple keywords
    const keywordCount = highPriorityKeywords.concat(mediumPriorityKeywords)
      .filter(keyword => lowerTerm.includes(keyword)).length
    
    if (keywordCount > 1) {
      priority += keywordCount * 0.3
    }

    return priority
  }

  /**
   * Get region-specific search terms
   */
  private getRegionalTerms(country1: string, country2: string): string[] {
    const regionMap: { [key: string]: string[] } = {
      'US': ['NATO', 'Americas', 'Pacific', 'Atlantic'],
      'China': ['Asia Pacific', 'South China Sea', 'Asian', 'ASEAN'],
      'Russia': ['European', 'Eastern Europe', 'CIS', 'Arctic'],
      'Iran': ['Middle East', 'Persian Gulf', 'Nuclear'],
      'North Korea': ['Korean Peninsula', 'Northeast Asia', 'Nuclear'],
      'Taiwan': ['Taiwan Strait', 'One China', 'Asia Pacific'],
      'Ukraine': ['Eastern Europe', 'NATO', 'European Union'],
      'Israel': ['Middle East', 'Mediterranean', 'Arab Israeli'],
      'India': ['South Asian', 'Indo Pacific', 'Kashmir'],
      'Pakistan': ['South Asian', 'Kashmir', 'Nuclear']
    }

    const terms: string[] = []
    if (regionMap[country1]) terms.push(...regionMap[country1])
    if (regionMap[country2]) terms.push(...regionMap[country2])
    
    return [...new Set(terms)] // Remove duplicates
  }

  /**
   * Get conflict type specific terms
   */
  private getConflictTypeTerms(conflictType: string): string[] {
    const typeMap: { [key: string]: string[] } = {
      'territorial': ['territorial disputes', 'border', 'sovereignty', 'territorial integrity'],
      'nuclear': ['nuclear weapons', 'nuclear non-proliferation', 'nuclear security', 'disarmament'],
      'proxy': ['proxy war', 'indirect conflict', 'third party', 'alliance'],
      'conventional': ['conventional weapons', 'military', 'armed forces'],
      'naval': ['maritime', 'naval', 'sea', 'ocean', 'waterways'],
      'air': ['airspace', 'aviation', 'air defense', 'aerospace']
    }

    return typeMap[conflictType] || []
  }

  /**
   * Calculate relevance score based on multiple factors
   */
  private calculateRelevanceScore(
    chunk: ProcessedTreatyChunk, 
    query: RetrievalQuery, 
    similarity: number
  ): { score: number; reason: string } {
    let score = similarity * 0.4 // Base similarity weight
    let reasons: string[] = []

    // Country relevance boost
    const countries = [query.selectedCountry, query.offensiveCountry, query.defensiveCountry]
    const contentLower = chunk.content.toLowerCase()
    
    for (const country of countries) {
      if (contentLower.includes(country.toLowerCase())) {
        score += 0.15
        reasons.push(`mentions ${country}`)
      }
    }

    // Section relevance boost
    const sectionLower = chunk.metadata.section.toLowerCase()
    if (sectionLower.includes('peace') || sectionLower.includes('security')) {
      score += 0.1
      reasons.push('peace/security treaty')
    }
    if (sectionLower.includes('disarmament') || sectionLower.includes('arms')) {
      score += 0.12
      reasons.push('arms control treaty')
    }
    if (sectionLower.includes('human rights')) {
      score += 0.08
      reasons.push('human rights treaty')
    }

    // Recent treaties get slight boost
    const adoptionYear = this.extractYear(chunk.metadata.adoptionDate)
    if (adoptionYear && adoptionYear > 1990) {
      score += 0.05
      reasons.push('recent treaty')
    }

    // High participation treaties get boost
    const parties = chunk.metadata.parties.toLowerCase()
    if (parties.includes('193') || parties.includes('190')) {
      score += 0.08
      reasons.push('universal participation')
    }

    return {
      score: Math.min(score, 1.0), // Cap at 1.0
      reason: reasons.join(', ') || 'semantic similarity'
    }
  }

  /**
   * Extract year from date string
   */
  private extractYear(dateStr: string): number | null {
    const yearMatch = dateStr.match(/(\d{4})/)
    return yearMatch ? parseInt(yearMatch[1]) : null
  }

  /**
   * Retrieve relevant treaty documents for a conflict scenario
   */
  async retrieveRelevantTreaties(
    query: RetrievalQuery, 
    topK: number = 10
  ): Promise<RetrievalResult> {
    await this.ensureInitialized()

    const startTime = Date.now()
    
    // Construct comprehensive search query
    const searchQuery = this.constructSearchQuery(query)
    console.log('🔍 Search query:', searchQuery.substring(0, 100) + '...')
    
    // Generate query embedding
    const queryEmbeddingStart = Date.now()
    const queryEmbedding = await this.generateQueryEmbedding(searchQuery)
    const queryEmbeddingTime = Date.now() - queryEmbeddingStart

    // Calculate similarities and relevance scores
    const searchStart = Date.now()
    const candidates: RetrievedDocument[] = []

    for (const chunk of this.chunks) {
      if (!chunk.embedding) continue

      const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding)
      const { score: relevanceScore, reason } = this.calculateRelevanceScore(chunk, query, similarity)

      candidates.push({
        chunk,
        similarity,
        relevanceScore,
        reason
      })
    }

    // Sort by relevance score and take top K
    candidates.sort((a, b) => b.relevanceScore - a.relevanceScore)
    const topCandidates = candidates.slice(0, topK)
    
    const searchTime = Date.now() - searchStart

    console.log(`🎯 Retrieved ${topCandidates.length} relevant treaties (${(Date.now() - startTime)}ms total)`)
    
    return {
      query: searchQuery,
      retrievedDocs: topCandidates,
      metadata: {
        totalChunksSearched: this.chunks.length,
        queryEmbeddingTime,
        searchTime,
        topK
      }
    }
  }

  /**
   * Get treaties by specific section
   */
  async getTreatiesBySection(sectionPattern: string): Promise<ProcessedTreatyChunk[]> {
    await this.ensureInitialized()
    
    return this.chunks.filter(chunk =>
      chunk.metadata.section.toLowerCase().includes(sectionPattern.toLowerCase())
    )
  }

  /**
   * Hybrid search combining semantic and keyword matching
   */
  async hybridSearch(
    query: RetrievalQuery,
    topK: number = 10,
    semanticWeight: number = 0.7
  ): Promise<RetrievalResult> {
    await this.ensureInitialized()

    // Get semantic results (optimized for speed when topK is small)
    const fetchMultiplier = topK <= 6 ? 1.5 : 2
    const semanticResults = await this.retrieveRelevantTreaties(query, Math.ceil(topK * fetchMultiplier))
    
    // Get keyword results
    const keywordResults = this.keywordSearch(query, Math.ceil(topK * fetchMultiplier))
    
    // Combine and rerank
    const combinedScores = new Map<string, RetrievedDocument>()
    
    // Add semantic scores
    for (const doc of semanticResults.retrievedDocs) {
      combinedScores.set(doc.chunk.id, {
        ...doc,
        relevanceScore: doc.relevanceScore * semanticWeight
      })
    }
    
    // Add keyword scores
    for (const doc of keywordResults) {
      const existing = combinedScores.get(doc.chunk.id)
      if (existing) {
        existing.relevanceScore += doc.relevanceScore * (1 - semanticWeight)
        existing.reason += `, ${doc.reason}`
      } else {
        combinedScores.set(doc.chunk.id, {
          ...doc,
          relevanceScore: doc.relevanceScore * (1 - semanticWeight)
        })
      }
    }
    
    // Sort by combined score and take top K
    const finalResults = Array.from(combinedScores.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK)
    
    return {
      ...semanticResults,
      retrievedDocs: finalResults
    }
  }

  /**
   * Simple keyword-based search
   */
  private keywordSearch(query: RetrievalQuery, topK: number): RetrievedDocument[] {
    const keywords = [
      query.selectedCountry.toLowerCase(),
      query.offensiveCountry.toLowerCase(),
      query.defensiveCountry.toLowerCase(),
      'peace', 'security', 'conflict', 'diplomatic'
    ]

    const results: RetrievedDocument[] = []

    for (const chunk of this.chunks) {
      let score = 0
      let matchedTerms: string[] = []
      
      const content = chunk.content.toLowerCase()
      
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          score += 0.1
          matchedTerms.push(keyword)
        }
      }
      
      if (score > 0) {
        results.push({
          chunk,
          similarity: score,
          relevanceScore: score,
          reason: `keyword matches: ${matchedTerms.join(', ')}`
        })
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, topK)
  }

  /**
   * Get system statistics
   */
  getStats(): { treaties: number; chunks: number; initialized: boolean } {
    return {
      treaties: this.processor.getTreaties().length,
      chunks: this.chunks.length,
      initialized: this.isInitialized
    }
  }
}
