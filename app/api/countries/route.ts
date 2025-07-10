import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'countries.json')
    const fileContents = readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    return NextResponse.json({
      success: true,
      data: data.countries,
      count: data.countries.length
    })
  } catch (error) {
    console.error('Error loading countries:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load countries data' 
      },
      { status: 500 }
    )
  }
} 