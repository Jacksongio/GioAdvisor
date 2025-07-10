import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'conflicts.json')
    const fileContents = readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    return NextResponse.json({
      success: true,
      data: data.conflicts,
      count: data.conflicts.length
    })
  } catch (error) {
    console.error('Error loading conflicts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load conflicts data' 
      },
      { status: 500 }
    )
  }
} 