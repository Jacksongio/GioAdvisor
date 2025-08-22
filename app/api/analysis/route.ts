import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

const ANALYSIS_FILE = path.join('/tmp', 'analysis.json')

// Ensure tmp directory exists (it should always exist on Vercel)
async function ensureDataDir() {
  // /tmp directory always exists on Vercel, but we'll check anyway
  try {
    await fs.access('/tmp')
  } catch {
    await fs.mkdir('/tmp', { recursive: true })
  }
}

// Write analysis to file
async function writeAnalysis(analysisData: any) {
  await ensureDataDir()
  await fs.writeFile(ANALYSIS_FILE, JSON.stringify([analysisData], null, 2))
}

// Read analysis from file
async function readAnalysis() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(ANALYSIS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// POST - Save analysis parameters
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate required setup fields
    const { selectedCountry, offensiveCountry, defensiveCountry } = body
    if (!selectedCountry || !offensiveCountry || !defensiveCountry) {
      return NextResponse.json(
        { error: "Missing required setup fields" },
        { status: 400 }
      )
    }

    // Prevent user from selecting their own country as the aggressor
    if (selectedCountry === offensiveCountry) {
      return NextResponse.json(
        { error: "You cannot simulate your own country as the aggressor/offensive country" },
        { status: 400 }
      )
    }

    // Create analysis record (overwrite any existing one)
    const analysisData = {
      id: "current",
      // Setup data
      selectedCountry,
      conflictScenario: body.conflictScenario || "auto-detected",
      offensiveCountry,
      defensiveCountry,
      scenarioDetails: body.scenarioDetails || "",
      severityLevel: body.severityLevel || "",
      timeFrame: body.timeFrame || "",
      // Economic factors
      economicFactors: {
        tradeDependencies: body.tradeDependencies || 50,
        sanctionsImpact: body.sanctionsImpact || 50,
        marketStability: body.marketStability || 50
      },
      // Military readiness
      militaryReadiness: {
        defenseCapabilities: body.defenseCapabilities || 50,
        allianceSupport: body.allianceSupport || 50,
        strategicResources: body.strategicResources || 50
      },
      // Diplomatic relations
      diplomaticRelations: {
        unSupport: body.unSupport || 50,
        regionalInfluence: body.regionalInfluence || 50,
        publicOpinion: body.publicOpinion || 50
      },
      createdAt: new Date().toISOString()
    }
    
    // Save analysis (overwrite the file)
    await writeAnalysis(analysisData)
    
    return NextResponse.json({ 
      success: true, 
      id: analysisData.id,
      message: "Analysis parameters saved successfully" 
    })
    
  } catch (error) {
    console.error("Error saving analysis:", error)
    return NextResponse.json(
      { error: "Failed to save analysis parameters" },
      { status: 500 }
    )
  }
}

// GET - Retrieve the current analysis parameters
export async function GET() {
  try {
    const analysis = await readAnalysis()
    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error reading analysis:", error)
    return NextResponse.json(
      { error: "Failed to retrieve analysis parameters" },
      { status: 500 }
    )
  }
} 