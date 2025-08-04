import { treatyRAG } from './treaty-rag'
import openai from './openai'

export interface RAGASMetrics {
  faithfulness: number
  answerRelevancy: number
  contextPrecision: number
  contextRecall: number
}

export interface TestQuestion {
  question: string
  groundTruth: string
  context?: string
  expectedTreaties?: string[]
}

export class RAGASEvaluator {
  private testQuestions: TestQuestion[] = [
    {
      question: "What treaties govern nuclear non-proliferation?",
      groundTruth: "The primary treaties governing nuclear non-proliferation include the Nuclear Non-Proliferation Treaty (NPT), the Comprehensive Test Ban Treaty (CTBT), and various bilateral agreements. These treaties aim to prevent the spread of nuclear weapons while promoting peaceful uses of nuclear energy.",
      expectedTreaties: ["Nuclear Non-Proliferation Treaty", "Comprehensive Test Ban Treaty"]
    },
    {
      question: "How have territorial disputes been resolved historically through treaties?",
      groundTruth: "Historical territorial disputes have been resolved through various types of treaties including border agreements, territorial exchanges, and international arbitration. Examples include the Treaty of Westphalia (1648), the Congress of Vienna (1815), and numerous bilateral border agreements.",
      expectedTreaties: ["Treaty of Westphalia", "Congress of Vienna"]
    },
    {
      question: "What are the key diplomatic immunity treaties?",
      groundTruth: "The Vienna Convention on Diplomatic Relations (1961) is the primary treaty governing diplomatic immunity, establishing the framework for diplomatic privileges and immunities that protect diplomats from prosecution in host countries.",
      expectedTreaties: ["Vienna Convention on Diplomatic Relations"]
    },
    {
      question: "What environmental treaties address climate change?",
      groundTruth: "Major environmental treaties addressing climate change include the UN Framework Convention on Climate Change (UNFCCC), the Kyoto Protocol, and the Paris Agreement, which establish frameworks for international cooperation on climate action.",
      expectedTreaties: ["UN Framework Convention on Climate Change", "Kyoto Protocol", "Paris Agreement"]
    },
    {
      question: "How do trade agreements resolve commercial disputes?",
      groundTruth: "Trade agreements typically include dispute resolution mechanisms such as arbitration panels, mediation processes, and appeals procedures. The WTO agreements provide a comprehensive framework for resolving trade disputes between member countries.",
      expectedTreaties: ["World Trade Organization", "WTO Agreements"]
    }
  ]

  async evaluateSystem(): Promise<{
    overallScore: RAGASMetrics
    individualResults: Array<{
      question: string
      metrics: RAGASMetrics
      response: string
      retrievedContext: string[]
    }>
  }> {
    console.log('Starting RAGAS evaluation...')
    
    const results = []
    let totalFaithfulness = 0
    let totalRelevancy = 0
    let totalPrecision = 0
    let totalRecall = 0

    for (const testQ of this.testQuestions) {
      console.log(`Evaluating: ${testQ.question}`)
      
      // Get RAG response
      const ragResult = await treatyRAG.queryTreaties(testQ.question)
      
      // Extract retrieved context
      const retrievedContext = ragResult.relevantTreaties.map(t => t.content)
      
      // Calculate metrics
      const faithfulness = await this.calculateFaithfulness(ragResult.answer, retrievedContext)
      const answerRelevancy = await this.calculateAnswerRelevancy(testQ.question, ragResult.answer)
      const contextPrecision = this.calculateContextPrecision(retrievedContext, testQ.expectedTreaties || [])
      const contextRecall = this.calculateContextRecall(retrievedContext, testQ.expectedTreaties || [])
      
      const metrics = {
        faithfulness,
        answerRelevancy,
        contextPrecision,
        contextRecall
      }
      
      results.push({
        question: testQ.question,
        metrics,
        response: ragResult.answer,
        retrievedContext
      })
      
      totalFaithfulness += faithfulness
      totalRelevancy += answerRelevancy
      totalPrecision += contextPrecision
      totalRecall += contextRecall
    }

    const count = this.testQuestions.length
    const overallScore = {
      faithfulness: totalFaithfulness / count,
      answerRelevancy: totalRelevancy / count,
      contextPrecision: totalPrecision / count,
      contextRecall: totalRecall / count
    }

    return {
      overallScore,
      individualResults: results
    }
  }

  private async calculateFaithfulness(answer: string, context: string[]): Promise<number> {
    // Check if the answer is grounded in the retrieved context
    const prompt = `Rate the faithfulness of this answer based on the provided context. Faithfulness measures whether the answer is grounded in and supported by the given context.

Context:
${context.join('\n\n')}

Answer:
${answer}

Rate faithfulness from 0.0 to 1.0, where:
- 1.0 = Answer is completely supported by the context
- 0.5 = Answer is partially supported by the context  
- 0.0 = Answer contradicts or is not supported by the context

Respond with only a number between 0.0 and 1.0.`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 10
      })

      const score = parseFloat(response.choices[0]?.message?.content || "0.5")
      return Math.max(0, Math.min(1, score))
    } catch (error) {
      console.warn('Error calculating faithfulness:', error)
      return 0.5
    }
  }

  private async calculateAnswerRelevancy(question: string, answer: string): Promise<number> {
    // Check if the answer is relevant to the question
    const prompt = `Rate the relevancy of this answer to the given question. Answer relevancy measures how well the answer addresses the specific question asked.

Question:
${question}

Answer:
${answer}

Rate relevancy from 0.0 to 1.0, where:
- 1.0 = Answer directly and completely addresses the question
- 0.5 = Answer partially addresses the question
- 0.0 = Answer is not relevant to the question

Respond with only a number between 0.0 and 1.0.`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 10
      })

      const score = parseFloat(response.choices[0]?.message?.content || "0.5")
      return Math.max(0, Math.min(1, score))
    } catch (error) {
      console.warn('Error calculating answer relevancy:', error)
      return 0.5
    }
  }

  private calculateContextPrecision(retrieved: string[], expected: string[]): number {
    if (retrieved.length === 0) return 0
    
    let relevantCount = 0
    for (const context of retrieved) {
      for (const expectedTreaty of expected) {
        if (context.toLowerCase().includes(expectedTreaty.toLowerCase())) {
          relevantCount++
          break
        }
      }
    }
    
    return relevantCount / retrieved.length
  }

  private calculateContextRecall(retrieved: string[], expected: string[]): number {
    if (expected.length === 0) return 1
    
    let foundCount = 0
    for (const expectedTreaty of expected) {
      for (const context of retrieved) {
        if (context.toLowerCase().includes(expectedTreaty.toLowerCase())) {
          foundCount++
          break
        }
      }
    }
    
    return foundCount / expected.length
  }

  async generateSyntheticTestData(count = 10): Promise<TestQuestion[]> {
    // Generate additional test questions using AI
    const prompt = `Generate ${count} test questions for evaluating a treaty research system. Each question should be about international treaties, agreements, or diplomatic history.

Format each question as:
Question: [question]
Expected Answer: [brief expected answer]
Relevant Treaties: [comma-separated list of relevant treaty names]

Focus on diverse topics like:
- Nuclear agreements
- Trade treaties  
- Environmental accords
- Territorial disputes
- Diplomatic relations
- Military alliances
- Human rights treaties

Make questions specific enough to have clear expected answers.`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content || ""
      
      // Parse the generated questions (simplified parsing)
      const questions: TestQuestion[] = []
      const blocks = content.split('\n\n')
      
      for (const block of blocks) {
        const lines = block.split('\n')
        const questionLine = lines.find(l => l.startsWith('Question:'))
        const answerLine = lines.find(l => l.startsWith('Expected Answer:'))
        const treatiesLine = lines.find(l => l.startsWith('Relevant Treaties:'))
        
        if (questionLine && answerLine) {
          questions.push({
            question: questionLine.replace('Question:', '').trim(),
            groundTruth: answerLine.replace('Expected Answer:', '').trim(),
            expectedTreaties: treatiesLine 
              ? treatiesLine.replace('Relevant Treaties:', '').split(',').map(t => t.trim())
              : []
          })
        }
      }
      
      return questions
    } catch (error) {
      console.warn('Error generating synthetic test data:', error)
      return []
    }
  }
}

export const ragasEvaluator = new RAGASEvaluator()