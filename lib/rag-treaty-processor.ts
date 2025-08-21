import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TreatyDocument {
  id: string
  section: string
  title: string
  adoptionDate: string
  entryIntoForce: string
  parties: string
  description: string
  fullText: string
  embedding?: number[]
}

export interface ProcessedTreatyChunk {
  id: string
  content: string
  metadata: {
    section: string
    title: string
    adoptionDate: string
    parties: string
    chunkIndex: number
    totalChunks: number
  }
  embedding?: number[]
}

export class TreatyProcessor {
  private treaties: TreatyDocument[] = []
  private chunks: ProcessedTreatyChunk[] = []

  /**
   * Load and parse treaties from the treaties.txt file
   */
  async loadTreaties(): Promise<TreatyDocument[]> {
    const treatiesPath = path.join(process.cwd(), 'data', 'treaties.txt')
    const content = fs.readFileSync(treatiesPath, 'utf-8')
    const lines = content.split('\n')
    
    this.treaties = []
    let currentSection = ''
    let treatyCounter = 0

    for (const line of lines) {
      if (line.startsWith('Section ')) {
        currentSection = line.trim()
        continue
      }

      if (line.trim() && !line.startsWith('Section') && line.includes(':')) {
        const treaty = this.parseTreatyLine(line, currentSection)
        if (treaty) {
          treaty.id = `treaty_${treatyCounter++}`
          this.treaties.push(treaty)
        }
      }
    }

    console.log(`Loaded ${this.treaties.length} treaties from ${45} sections`)
    return this.treaties
  }

  /**
   * Parse a single treaty line into structured data
   */
  private parseTreatyLine(line: string, section: string): TreatyDocument | null {
    try {
      // Expected format: "Title: Adopted DATE, entered into force DATE; Parties: NUMBER; Description: TEXT"
      const parts = line.split(';')
      if (parts.length < 3) return null

      const titleAndDates = parts[0].trim()
      const partiesInfo = parts[1].trim()
      const description = parts.slice(2).join(';').trim()

      // Extract title (everything before first colon)
      const titleMatch = titleAndDates.match(/^([^:]+):/)
      if (!titleMatch) return null
      const title = titleMatch[1].trim()

      // Extract adoption date
      const adoptionMatch = titleAndDates.match(/Adopted ([^,]+),/)
      const adoptionDate = adoptionMatch ? adoptionMatch[1].trim() : 'Unknown'

      // Extract entry into force date
      const forceMatch = titleAndDates.match(/entered into force ([^;]+)/)
      const entryIntoForce = forceMatch ? forceMatch[1].trim() : 'Unknown'

      // Extract parties
      const partiesMatch = partiesInfo.match(/Parties: ([^;]+)/)
      const parties = partiesMatch ? partiesMatch[1].trim() : 'Unknown'

      // Extract description
      const descMatch = description.match(/Description: (.+)/)
      const desc = descMatch ? descMatch[1].trim() : description.replace('Description:', '').trim()

      return {
        id: '',
        section,
        title,
        adoptionDate,
        entryIntoForce,
        parties,
        description: desc,
        fullText: line
      }
    } catch (error) {
      console.warn('Failed to parse treaty line:', line, error)
      return null
    }
  }

  /**
   * Create semantic chunks from treaties for better retrieval
   */
  createSemanticChunks(): ProcessedTreatyChunk[] {
    this.chunks = []
    let chunkCounter = 0

    for (const treaty of this.treaties) {
      // Create chunks based on logical divisions
      const chunks = this.chunkTreaty(treaty)
      
      for (let i = 0; i < chunks.length; i++) {
        this.chunks.push({
          id: `chunk_${chunkCounter++}`,
          content: chunks[i],
          metadata: {
            section: treaty.section,
            title: treaty.title,
            adoptionDate: treaty.adoptionDate,
            parties: treaty.parties,
            chunkIndex: i,
            totalChunks: chunks.length
          }
        })
      }
    }

    console.log(`Created ${this.chunks.length} semantic chunks from ${this.treaties.length} treaties`)
    return this.chunks
  }

  /**
   * Intelligently chunk a single treaty
   */
  private chunkTreaty(treaty: TreatyDocument): string[] {
    const chunks: string[] = []
    
    // Main treaty information chunk
    const mainChunk = `Treaty: ${treaty.title}
Section: ${treaty.section}
Adoption Date: ${treaty.adoptionDate}
Entry into Force: ${treaty.entryIntoForce}
Parties: ${treaty.parties}
Description: ${treaty.description}`
    
    chunks.push(mainChunk)

    // If description is very long, create additional context chunks
    if (treaty.description.length > 200) {
      const contextChunk = `${treaty.title} - Additional Context:
Related to: ${this.extractKeywords(treaty.description)}
Legal Framework: ${treaty.section}
Temporal Scope: ${treaty.adoptionDate} to present
Jurisdictional Scope: ${treaty.parties} parties
Core Provisions: ${treaty.description}`
      
      chunks.push(contextChunk)
    }

    return chunks
  }

  /**
   * Extract key terms for enhanced searchability
   */
  private extractKeywords(text: string): string {
    const keywords = text.toLowerCase()
      .split(/[^\w]+/)
      .filter(word => word.length > 3)
      .filter(word => !['with', 'from', 'that', 'this', 'they', 'have', 'been', 'will', 'were', 'their', 'such'].includes(word))
      .slice(0, 5)
      .join(', ')
    
    return keywords
  }

  /**
   * Generate embeddings for all chunks
   */
  async generateEmbeddings(): Promise<ProcessedTreatyChunk[]> {
    console.log(`Generating embeddings for ${this.chunks.length} chunks...`)
    
    const batchSize = 100 // Process in batches to manage API limits
    const batches = []
    
    for (let i = 0; i < this.chunks.length; i += batchSize) {
      batches.push(this.chunks.slice(i, i + batchSize))
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} chunks)`)

      try {
        const embeddings = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch.map(chunk => chunk.content),
        })

        for (let i = 0; i < batch.length; i++) {
          batch[i].embedding = embeddings.data[i].embedding
        }

        // Small delay between batches to respect rate limits
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        console.error(`Error generating embeddings for batch ${batchIndex + 1}:`, error)
        throw error
      }
    }

    console.log('All embeddings generated successfully')
    return this.chunks
  }

  /**
   * Get all processed chunks
   */
  getChunks(): ProcessedTreatyChunk[] {
    return this.chunks
  }

  /**
   * Get all treaties
   */
  getTreaties(): TreatyDocument[] {
    return this.treaties
  }

  /**
   * Filter treaties by section
   */
  getTreatiesBySection(sectionPattern: string): TreatyDocument[] {
    return this.treaties.filter(treaty => 
      treaty.section.toLowerCase().includes(sectionPattern.toLowerCase())
    )
  }

  /**
   * Search treaties by keywords
   */
  searchTreaties(query: string): TreatyDocument[] {
    const queryLower = query.toLowerCase()
    return this.treaties.filter(treaty =>
      treaty.title.toLowerCase().includes(queryLower) ||
      treaty.description.toLowerCase().includes(queryLower) ||
      treaty.section.toLowerCase().includes(queryLower)
    )
  }
}
