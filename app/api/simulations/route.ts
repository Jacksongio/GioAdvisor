import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

const SIMULATIONS_FILE = path.join(process.cwd(), 'data', 'simulations.json')

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Read simulations from file
async function readSimulations() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(SIMULATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, return empty array
    return []
  }
}

// Write simulations to file
async function writeSimulations(simulations: any[]) {
  await ensureDataDir()
  await fs.writeFile(SIMULATIONS_FILE, JSON.stringify(simulations, null, 2))
}

// POST - Save a new simulation setup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate required fields
    const { selectedCountry, conflictScenario, offensiveCountry, defensiveCountry } = body
    if (!selectedCountry || !conflictScenario || !offensiveCountry || !defensiveCountry) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create new simulation (overwrite any existing one)
    const newSimulation = {
      id: "current",
      ...body,
      createdAt: new Date().toISOString()
    }
    
    // Save only this simulation (overwrite the file)
    await writeSimulations([newSimulation])
    
    return NextResponse.json({ 
      success: true, 
      id: newSimulation.id,
      message: "Simulation setup saved successfully (overwrote previous)" 
    })
    
  } catch (error) {
    console.error("Error saving simulation:", error)
    return NextResponse.json(
      { error: "Failed to save simulation setup" },
      { status: 500 }
    )
  }
}

// GET - Retrieve the current simulation setup
export async function GET() {
  try {
    const simulations = await readSimulations()
    return NextResponse.json(simulations)
  } catch (error) {
    console.error("Error reading simulations:", error)
    return NextResponse.json(
      { error: "Failed to retrieve simulations" },
      { status: 500 }
    )
  }
} 