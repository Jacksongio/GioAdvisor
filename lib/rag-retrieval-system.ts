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
   * Enhanced query construction for better retrieval
   */
  private constructSearchQuery(query: RetrievalQuery): string {
    // Create a comprehensive search query that captures the conflict context
    const searchTerms = [
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
    searchTerms.push(...regionTerms)

    // Add conflict type specific terms
    if (query.conflictType) {
      searchTerms.push(...this.getConflictTypeTerms(query.conflictType))
    }

    return searchTerms.join(' ')
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

    // Get semantic results
    const semanticResults = await this.retrieveRelevantTreaties(query, topK * 2)
    
    // Get keyword results
    const keywordResults = this.keywordSearch(query, topK * 2)
    
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
