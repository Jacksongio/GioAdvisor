import { NextRequest, NextResponse } from "next/server"
import { ragasEvaluator } from "@/lib/ragas-evaluation"
import { treatyRAG } from "@/lib/treaty-rag"

export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes for evaluation

export async function POST(req: NextRequest) {
  try {
    await treatyRAG.initialize()
    
    const body = await req.json()
    const { 
      includeBaseline = true,
      generateSynthetic = false,
      syntheticCount = 5 
    } = body

    console.log('Starting RAGAS evaluation...')
    
    let results
    
    if (generateSynthetic) {
      // Generate synthetic test data and evaluate
      const syntheticQuestions = await ragasEvaluator.generateSyntheticTestData(syntheticCount)
      console.log(`Generated ${syntheticQuestions.length} synthetic questions`)
      
      // TODO: Evaluate with synthetic data
      results = { 
        message: `Generated ${syntheticQuestions.length} synthetic test questions`,
        syntheticQuestions 
      }
    } else {
      // Run standard evaluation
      results = await ragasEvaluator.evaluateSystem()
    }

    return NextResponse.json({
      success: true,
      evaluation: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error in RAGAS evaluation:", error)
    
    return NextResponse.json({
      success: false,
      error: "Failed to run evaluation. This may take several minutes - please try again."
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Quick evaluation status or sample questions
    return NextResponse.json({
      success: true,
      message: "RAGAS evaluation endpoint is ready",
      availableMetrics: ["faithfulness", "answerRelevancy", "contextPrecision", "contextRecall"],
      sampleQuestions: [
        "What treaties govern nuclear non-proliferation?",
        "How have territorial disputes been resolved historically?",
        "What are the key diplomatic immunity treaties?"
      ]
    })
  } catch (error) {
    console.error("Error getting evaluation status:", error)
    
    return NextResponse.json({
      success: false,
      error: "Failed to get evaluation status"
    }, { status: 500 })
  }
}