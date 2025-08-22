import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

const SIMULATIONS_FILE = path.join('/tmp', 'simulations.json')

// Ensure tmp directory exists (it should always exist on Vercel)
async function ensureDataDir() {
  // /tmp directory always exists on Vercel, but we'll check anyway
  try {
    await fs.access('/tmp')
  } catch {
    await fs.mkdir('/tmp', { recursive: true })
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
    const { selectedCountry, offensiveCountry, defensiveCountry } = body
    if (!selectedCountry || !offensiveCountry || !defensiveCountry) {
      return NextResponse.json(
        { error: "Missing required fields" },
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