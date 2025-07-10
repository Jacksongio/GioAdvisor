import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

const ANALYSIS_FILE = path.join('/tmp', 'analysis.json')

// Read analysis from file
async function readAnalysis() {
  try {
    const data = await fs.readFile(ANALYSIS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// GET - Retrieve a specific analysis by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const analyses = await readAnalysis()
    
    const analysis = analyses.find((a: any) => a.id === id)
    
    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(analysis)
    
  } catch (error) {
    console.error("Error reading analysis:", error)
    return NextResponse.json(
      { error: "Failed to retrieve analysis" },
      { status: 500 }
    )
  }
}

// DELETE - Remove a specific analysis by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const analyses = await readAnalysis()
    
    const index = analyses.findIndex((a: any) => a.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      )
    }
    
    // Remove the analysis
    analyses.splice(index, 1)
    
    // Save back to file
    await fs.writeFile(ANALYSIS_FILE, JSON.stringify(analyses, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: "Analysis deleted successfully" 
    })
    
  } catch (error) {
    console.error("Error deleting analysis:", error)
    return NextResponse.json(
      { error: "Failed to delete analysis" },
      { status: 500 }
    )
  }
} 