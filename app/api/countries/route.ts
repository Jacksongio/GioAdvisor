import { NextResponse } from "next/server"
// @ts-ignore - world-countries has no type definitions
import rawCountries from "world-countries"

export const runtime = "edge"

interface CountryResponse {
  code: string
  name: string
  flag: string
  region: string
  subregion: string
  population: number
  area: number
  latlng: number[]
}

const countries: any[] = rawCountries as any[]

export async function GET() {
  const payload: CountryResponse[] = countries.map((c: any) => ({
    code: c.cca2,
    name: c.name.common,
    flag: c.flag,
    region: c.region,
    subregion: c.subregion,
    population: c.population,
    area: c.area,
    latlng: c.latlng,
  }))

  return NextResponse.json(payload)
} 