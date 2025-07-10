import { NextRequest, NextResponse } from "next/server"
// @ts-ignore
import rawCountries from "world-countries"

export const runtime = "edge"

const countries: any[] = rawCountries as any[]

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  const country = countries.find((c) => c.cca2 === code)
  if (!country) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 })
  }
  return NextResponse.json({
    code: country.cca2,
    name: country.name.common,
    flag: country.flag,
    region: country.region,
    subregion: country.subregion,
    population: country.population,
    area: country.area,
    latlng: country.latlng,
  })
} 