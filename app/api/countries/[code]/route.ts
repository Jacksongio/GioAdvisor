import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const filePath = join(process.cwd(), 'data', 'countries.json')
    const fileContents = readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    const country = data.countries.find(
      (c: any) => c.code.toLowerCase() === params.code.toLowerCase()
    )

    if (!country) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Country not found' 
        },
        { status: 404 }
      )
    }

    // Get related countries data for allies, rivals, etc.
    const relatedCountries = {
      allies: data.countries.filter((c: any) => 
        country.allies.includes(c.code)
      ).map((c: any) => ({ 
        code: c.code, 
        name: c.name, 
        flag: c.flag, 
        power_rating: c.power_rating 
      })),
      rivals: data.countries.filter((c: any) => 
        country.rivals.includes(c.code)
      ).map((c: any) => ({ 
        code: c.code, 
        name: c.name, 
        flag: c.flag, 
        power_rating: c.power_rating 
      })),
      trade_dependencies: data.countries.filter((c: any) => 
        country.trade_dependencies.includes(c.code)
      ).map((c: any) => ({ 
        code: c.code, 
        name: c.name, 
        flag: c.flag, 
        gdp: c.gdp 
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        ...country,
        related_countries: relatedCountries
      }
    })
  } catch (error) {
    console.error('Error loading country:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load country data' 
      },
      { status: 500 }
    )
  }
} 