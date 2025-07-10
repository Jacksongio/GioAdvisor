"use client"

import { useState } from "react"
import { Globe, Users, Target, BarChart3, Settings, Play, FileText, AlertTriangle, Sword, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function PoliticalAdvisor() {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [conflictScenario, setConflictScenario] = useState("")
  const [offensiveCountry, setOffensiveCountry] = useState("")
  const [defensiveCountry, setDefensiveCountry] = useState("")
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸", power: 95 },
    { code: "CN", name: "China", flag: "🇨🇳", power: 90 },
    { code: "RU", name: "Russia", flag: "🇷🇺", power: 85 },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", power: 80 },
    { code: "FR", name: "France", flag: "🇫🇷", power: 78 },
    { code: "DE", name: "Germany", flag: "🇩🇪", power: 76 },
    { code: "JP", name: "Japan", flag: "🇯🇵", power: 74 },
    { code: "IN", name: "India", flag: "🇮🇳", power: 72 },
    { code: "BR", name: "Brazil", flag: "🇧🇷", power: 65 },
    { code: "CA", name: "Canada", flag: "🇨🇦", power: 63 },
    { code: "AU", name: "Australia", flag: "🇦🇺", power: 60 },
    { code: "KR", name: "South Korea", flag: "🇰🇷", power: 58 },
    { code: "IT", name: "Italy", flag: "🇮🇹", power: 55 },
    { code: "ES", name: "Spain", flag: "🇪🇸", power: 52 },
    { code: "TR", name: "Turkey", flag: "🇹🇷", power: 50 },
  ]

  const conflictTypes = [
    { id: "territorial", name: "Territorial Dispute", icon: "🗺️" },
    { id: "trade", name: "Trade War", icon: "💼" },
    { id: "cyber", name: "Cyber Attack", icon: "💻" },
    { id: "nuclear", name: "Nuclear Threat", icon: "☢️" },
    { id: "humanitarian", name: "Humanitarian Crisis", icon: "🏥" },
    { id: "resource", name: "Resource Conflict", icon: "⛽" },
    { id: "proxy", name: "Proxy War", icon: "🎭" },
    { id: "sanctions", name: "Economic Sanctions", icon: "🚫" },
  ]

  const runSimulation = async () => {
    setIsSimulating(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setSimulationResults({
      diplomaticResponse: 85,
      militaryReadiness: 60,
      economicImpact: -15,
      publicSupport: 72,
      allianceStrength: 88,
      recommendations: [
        "Engage in multilateral diplomatic talks",
        "Strengthen economic sanctions",
        "Increase intelligence sharing with allies",
        "Prepare humanitarian aid packages",
        "Monitor regional stability indicators",
      ],
    })
    setIsSimulating(false)
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-flame rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark-text">GioAdvisor</h1>
                <p className="text-sm text-dark-muted">Global Conflict Simulation Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-flame text-flame bg-transparent">
                Beta v1.0
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-dark-border text-dark-text hover:bg-dark-border bg-transparent"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-dark-card border border-dark-border">
            <TabsTrigger
              value="setup"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text"
            >
              Setup Simulation
            </TabsTrigger>
            <TabsTrigger
              value="simulate"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text"
            >
              Run Analysis
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text"
            >
              View Results
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Country Selection */}
              <Card className="border-dark-border bg-dark-card">
                <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10">
                  <CardTitle className="flex items-center space-x-2 text-dark-text">
                    <Users className="w-5 h-5 text-flame" />
                    <span>Select Your Country</span>
                  </CardTitle>
                  <CardDescription className="text-dark-muted">
                    Choose which country you want to simulate as
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-full bg-dark-bg border-dark-border text-dark-text">
                      <SelectValue placeholder="Choose a country..." />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-dark-border">
                      {countries.map((country) => (
                        <SelectItem
                          key={country.code}
                          value={country.code}
                          className="text-dark-text hover:bg-dark-border"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{country.flag}</span>
                            <span>{country.name}</span>
                            <Badge variant="secondary" className="ml-auto bg-dark-border text-dark-text">
                              Power: {country.power}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedCountry && (
                    <div className="mt-4 p-4 bg-dark-border rounded-lg">
                      <h4 className="font-semibold text-dark-text mb-2">Country Profile</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-dark-muted">Military Strength:</span>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={countries.find((c) => c.code === selectedCountry)?.power || 0}
                              className="w-20"
                            />
                            <span className="text-flame font-medium">
                              {countries.find((c) => c.code === selectedCountry)?.power}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-dark-muted">Economic Power:</span>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={(countries.find((c) => c.code === selectedCountry)?.power || 0) - 10}
                              className="w-20"
                            />
                            <span className="text-flame font-medium">
                              {(countries.find((c) => c.code === selectedCountry)?.power || 0) - 10}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-dark-muted">Diplomatic Influence:</span>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={(countries.find((c) => c.code === selectedCountry)?.power || 0) - 5}
                              className="w-20"
                            />
                            <span className="text-flame font-medium">
                              {(countries.find((c) => c.code === selectedCountry)?.power || 0) - 5}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Conflict Scenario */}
              <Card className="border-dark-border bg-dark-card">
                <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10">
                  <CardTitle className="flex items-center space-x-2 text-dark-text">
                    <AlertTriangle className="w-5 h-5 text-flame" />
                    <span>Conflict Scenario</span>
                  </CardTitle>
                  <CardDescription className="text-dark-muted">
                    Define the conflict situation to analyze
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-text mb-2 block">Conflict Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {conflictTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant={conflictScenario === type.id ? "default" : "outline"}
                          className={`justify-start ${
                            conflictScenario === type.id
                              ? "bg-flame hover:bg-flame/90 text-white"
                              : "border-dark-border text-dark-text hover:bg-dark-border bg-transparent"
                          }`}
                          onClick={() => setConflictScenario(type.id)}
                        >
                          <span className="mr-2">{type.icon}</span>
                          {type.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Offensive and Defensive Country Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dark-text mb-2 block flex items-center">
                        <Sword className="w-4 h-4 mr-2 text-flame" />
                        Offensive Country
                      </label>
                      <Select value={offensiveCountry} onValueChange={setOffensiveCountry}>
                        <SelectTrigger className="bg-dark-bg border-dark-border text-dark-text">
                          <SelectValue placeholder="Select aggressor..." />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-border">
                          {countries.map((country) => (
                            <SelectItem
                              key={country.code}
                              value={country.code}
                              className="text-dark-text hover:bg-dark-border"
                              disabled={country.code === defensiveCountry}
                            >
                              <div className="flex items-center space-x-2">
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-dark-text mb-2 block flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-flame" />
                        Defensive Country
                      </label>
                      <Select value={defensiveCountry} onValueChange={setDefensiveCountry}>
                        <SelectTrigger className="bg-dark-bg border-dark-border text-dark-text">
                          <SelectValue placeholder="Select defender..." />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-border">
                          {countries.map((country) => (
                            <SelectItem
                              key={country.code}
                              value={country.code}
                              className="text-dark-text hover:bg-dark-border"
                              disabled={country.code === offensiveCountry}
                            >
                              <div className="flex items-center space-x-2">
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-dark-text mb-2 block">Scenario Details</label>
                    <Textarea
                      placeholder="Describe the specific conflict scenario, involved parties, and key factors..."
                      className="min-h-[100px] bg-dark-bg border-dark-border text-dark-text placeholder:text-dark-muted"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dark-text mb-2 block">Severity Level</label>
                      <Select>
                        <SelectTrigger className="bg-dark-bg border-dark-border text-dark-text">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-border">
                          <SelectItem value="low" className="text-dark-text hover:bg-dark-border">
                            Low - Minor tensions
                          </SelectItem>
                          <SelectItem value="medium" className="text-dark-text hover:bg-dark-border">
                            Medium - Escalating dispute
                          </SelectItem>
                          <SelectItem value="high" className="text-dark-text hover:bg-dark-border">
                            High - Critical situation
                          </SelectItem>
                          <SelectItem value="extreme" className="text-dark-text hover:bg-dark-border">
                            Extreme - Imminent threat
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-dark-text mb-2 block">Time Frame</label>
                      <Select>
                        <SelectTrigger className="bg-dark-bg border-dark-border text-dark-text">
                          <SelectValue placeholder="Response timeframe" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-border">
                          <SelectItem value="immediate" className="text-dark-text hover:bg-dark-border">
                            Immediate (24 hours)
                          </SelectItem>
                          <SelectItem value="short" className="text-dark-text hover:bg-dark-border">
                            Short-term (1 week)
                          </SelectItem>
                          <SelectItem value="medium" className="text-dark-text hover:bg-dark-border">
                            Medium-term (1 month)
                          </SelectItem>
                          <SelectItem value="long" className="text-dark-text hover:bg-dark-border">
                            Long-term (6+ months)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Simulate Tab */}
          <TabsContent value="simulate" className="space-y-6">
            <Card className="border-dark-border bg-dark-card">
              <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10">
                <CardTitle className="flex items-center space-x-2 text-dark-text">
                  <Target className="w-5 h-5 text-flame" />
                  <span>Simulation Parameters</span>
                </CardTitle>
                <CardDescription className="text-dark-muted">
                  Configure advanced settings for your political simulation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-dark-text">Economic Factors</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-dark-muted">Trade Dependencies</label>
                        <Progress value={75} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-dark-muted">Economic Sanctions Impact</label>
                        <Progress value={60} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-dark-muted">Market Stability</label>
                        <Progress value={45} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-dark-text">Military Readiness</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-dark-muted">Defense Capabilities</label>
                        <Progress value={80} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-dark-muted">Alliance Support</label>
                        <Progress value={85} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-dark-muted">Strategic Resources</label>
                        <Progress value={70} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-dark-text">Diplomatic Relations</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-dark-muted">UN Support</label>
                        <Progress value={65} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-dark-muted">Regional Influence</label>
                        <Progress value={72} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-dark-muted">Public Opinion</label>
                        <Progress value={58} className="mt-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conflict Overview */}
                {offensiveCountry && defensiveCountry && (
                  <div className="mt-6 p-4 bg-dark-border rounded-lg">
                    <h4 className="font-semibold text-dark-text mb-3">Conflict Overview</h4>
                    <div className="flex items-center justify-center space-x-8">
                      <div className="text-center">
                        <div className="text-2xl mb-2">{countries.find((c) => c.code === offensiveCountry)?.flag}</div>
                        <div className="text-sm text-dark-text font-medium">
                          {countries.find((c) => c.code === offensiveCountry)?.name}
                        </div>
                        <div className="text-xs text-flame">Offensive</div>
                      </div>
                      <div className="text-flame text-2xl">⚔️</div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">{countries.find((c) => c.code === defensiveCountry)?.flag}</div>
                        <div className="text-sm text-dark-text font-medium">
                          {countries.find((c) => c.code === defensiveCountry)?.name}
                        </div>
                        <div className="text-xs text-flame">Defensive</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center pt-6">
                  <Button
                    onClick={runSimulation}
                    disabled={!selectedCountry || !conflictScenario || isSimulating}
                    className="bg-flame hover:bg-flame/90 text-white px-8 py-3 text-lg"
                  >
                    {isSimulating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Running Simulation...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Run Political Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {simulationResults ? (
              <div className="grid gap-6">
                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="border-dark-border bg-dark-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-flame mb-2">{simulationResults.diplomaticResponse}%</div>
                      <div className="text-sm text-dark-muted">Diplomatic Success</div>
                      <Progress value={simulationResults.diplomaticResponse} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card className="border-dark-border bg-dark-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-flame mb-2">{simulationResults.militaryReadiness}%</div>
                      <div className="text-sm text-dark-muted">Military Readiness</div>
                      <Progress value={simulationResults.militaryReadiness} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card className="border-dark-border bg-dark-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-flame mb-2">{simulationResults.economicImpact}%</div>
                      <div className="text-sm text-dark-muted">Economic Impact</div>
                      <Progress value={Math.abs(simulationResults.economicImpact)} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card className="border-dark-border bg-dark-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-flame mb-2">{simulationResults.publicSupport}%</div>
                      <div className="text-sm text-dark-muted">Public Support</div>
                      <Progress value={simulationResults.publicSupport} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card className="border-dark-border bg-dark-card">
                  <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10">
                    <CardTitle className="flex items-center space-x-2 text-dark-text">
                      <FileText className="w-5 h-5 text-flame" />
                      <span>Strategic Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {simulationResults.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-dark-border rounded-lg">
                          <div className="w-6 h-6 bg-flame rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <p className="text-dark-text">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Chart */}
                <Card className="border-dark-border bg-dark-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-dark-text">
                      <BarChart3 className="w-5 h-5 text-flame" />
                      <span>Response Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-dark-text">Diplomatic Approach</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={85} className="w-32" />
                          <span className="text-sm text-flame">85%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-dark-text">Economic Measures</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={70} className="w-32" />
                          <span className="text-sm text-flame">70%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-dark-text">Military Posturing</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={45} className="w-32" />
                          <span className="text-sm text-flame">45%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-dark-text">International Coalition</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={88} className="w-32" />
                          <span className="text-sm text-flame">88%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-dark-border bg-dark-card">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-dark-muted" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-text mb-2">No Results Yet</h3>
                  <p className="text-dark-muted mb-6">Run a simulation to see detailed analysis and recommendations</p>
                  <Button
                    variant="outline"
                    className="border-flame text-flame hover:bg-flame hover:text-white bg-transparent"
                  >
                    Go to Simulation
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
