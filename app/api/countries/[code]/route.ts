import { NextRequest, NextResponse } from "next/server"
// @ts-ignore
import rawCountries from "world-countries"

export const runtime = "edge"

const countries: any[] = rawCountries as any[]

// Generate flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🏳️"
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

const maxArea = Math.max(...countries.map((c) => c.area || 0))

// Realistic power rankings based on actual geopolitical influence
const powerRankings: Record<string, { military: number; economic: number; diplomatic: number }> = {
  // Superpowers
  "US": { military: 95, economic: 95, diplomatic: 90 },
  "CN": { military: 90, economic: 92, diplomatic: 85 },
  "RU": { military: 88, economic: 65, diplomatic: 75 },
  
  // Major Powers
  "GB": { military: 78, economic: 85, diplomatic: 88 },
  "FR": { military: 75, economic: 82, diplomatic: 85 },
  "DE": { military: 65, economic: 88, diplomatic: 82 },
  "JP": { military: 65, economic: 85, diplomatic: 75 },
  "IN": { military: 80, economic: 75, diplomatic: 70 },
  
  // Regional Powers
  "BR": { military: 55, economic: 65, diplomatic: 60 },
  "CA": { military: 50, economic: 70, diplomatic: 75 },
  "AU": { military: 48, economic: 68, diplomatic: 65 },
  "KR": { military: 60, economic: 75, diplomatic: 55 },
  "IT": { military: 52, economic: 72, diplomatic: 70 },
  "ES": { military: 45, economic: 65, diplomatic: 65 },
  "TR": { military: 58, economic: 55, diplomatic: 50 },
  "IL": { military: 75, economic: 60, diplomatic: 45 },
  "SA": { military: 55, economic: 68, diplomatic: 55 },
  "IR": { military: 65, economic: 45, diplomatic: 40 },
  "PK": { military: 70, economic: 40, diplomatic: 35 },
  "EG": { military: 50, economic: 35, diplomatic: 45 },
  "ZA": { military: 40, economic: 50, diplomatic: 55 },
  "AR": { military: 35, economic: 45, diplomatic: 50 },
  "MX": { military: 30, economic: 55, diplomatic: 45 },
  "ID": { military: 45, economic: 50, diplomatic: 45 },
  "TH": { military: 40, economic: 48, diplomatic: 40 },
  "VN": { military: 55, economic: 45, diplomatic: 35 },
  "PH": { military: 35, economic: 42, diplomatic: 40 },
  "MY": { military: 30, economic: 50, diplomatic: 45 },
  "SG": { military: 35, economic: 75, diplomatic: 60 },
  "AE": { military: 40, economic: 65, diplomatic: 55 },
  "QA": { military: 25, economic: 60, diplomatic: 45 },
  "KW": { military: 20, economic: 55, diplomatic: 40 },
  "NO": { military: 35, economic: 70, diplomatic: 65 },
  "SE": { military: 30, economic: 72, diplomatic: 70 },
  "DK": { military: 25, economic: 68, diplomatic: 65 },
  "FI": { military: 30, economic: 65, diplomatic: 60 },
  "NL": { military: 35, economic: 75, diplomatic: 70 },
  "BE": { military: 25, economic: 68, diplomatic: 70 },
  "CH": { military: 30, economic: 80, diplomatic: 75 },
  "AT": { military: 20, economic: 65, diplomatic: 65 },
  "PL": { military: 45, economic: 58, diplomatic: 55 },
  "CZ": { military: 25, economic: 55, diplomatic: 55 },
  "HU": { military: 20, economic: 50, diplomatic: 50 },
  "GR": { military: 40, economic: 45, diplomatic: 50 },
  "PT": { military: 25, economic: 55, diplomatic: 60 },
  "IE": { military: 15, economic: 70, diplomatic: 65 },
  "NZ": { military: 20, economic: 55, diplomatic: 60 },
  "UA": { military: 60, economic: 25, diplomatic: 30 },
  "BY": { military: 35, economic: 20, diplomatic: 15 },
}

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  const country = countries.find((c) => c.cca2 === code)
  if (!country) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 })
  }
  
  const area = country.area || 0
  const areaRank = area / maxArea
  
  // Get predefined power ranking or calculate based on area/region
  const ranking = powerRankings[code]
  let military: number, economic: number, diplomatic: number
  
  if (ranking) {
    military = ranking.military
    economic = ranking.economic
    diplomatic = ranking.diplomatic
  } else {
    // Fallback calculation for smaller/unlisted countries
    const regionPower = country.region === "Europe" ? 15 : country.region === "Asia" ? 12 : country.region === "Americas" ? 8 : 5
    military = Math.min(Math.round(areaRank * 30 + regionPower), 45)
    economic = Math.min(Math.round(areaRank * 25 + regionPower), 40)
    diplomatic = Math.min(Math.round(areaRank * 20 + regionPower), 35)
  }
  
  const power = Math.round((military + economic + diplomatic) / 3)

  return NextResponse.json({
    code: country.cca2,
    name: country.name.common,
    flag: getFlagEmoji(country.cca2),
    region: country.region || "Unknown",
    subregion: country.subregion || "Unknown",
    population: Math.round(areaRank * 1400000000),
    area: country.area || 0,
    latlng: country.latlng || [0, 0],
    power,
    military,
    economic,
    diplomatic,
  })
} 