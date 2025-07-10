import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

const SIMULATIONS_FILE = path.join('/tmp', 'simulations.json')

// Read simulations from file
async function readSimulations() {
  try {
    const data = await fs.readFile(SIMULATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// GET - Retrieve a specific simulation setup by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const simulations = await readSimulations()
    
    const simulation = simulations.find((sim: any) => sim.id === id)
    
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(simulation)
    
  } catch (error) {
    console.error("Error reading simulation:", error)
    return NextResponse.json(
      { error: "Failed to retrieve simulation" },
      { status: 500 }
    )
  }
}

// DELETE - Remove a specific simulation setup by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const simulations = await readSimulations()
    
    const index = simulations.findIndex((sim: any) => sim.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 }
      )
    }
    
    // Remove the simulation
    simulations.splice(index, 1)
    
    // Save back to file
    await fs.writeFile(SIMULATIONS_FILE, JSON.stringify(simulations, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: "Simulation deleted successfully" 
    })
    
  } catch (error) {
    console.error("Error deleting simulation:", error)
    return NextResponse.json(
      { error: "Failed to delete simulation" },
      { status: 500 }
    )
  }
} 