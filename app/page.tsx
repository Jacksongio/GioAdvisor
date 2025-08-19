"use client"

import { useState, useEffect } from "react"
import { Globe, Users, Target, BarChart3, Play, FileText, AlertTriangle, Sword, Shield, RotateCcw, MessageCircle, Send, Check, ChevronsUpDown, Settings, Loader2, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { FlagIcon } from "@/components/ui/flag-icon"

export default function PoliticalAdvisor() {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [conflictScenario, setConflictScenario] = useState("")
  const [offensiveCountry, setOffensiveCountry] = useState("")
  const [defensiveCountry, setDefensiveCountry] = useState("")
  const [scenarioDetails, setScenarioDetails] = useState("")
  const [severityLevel, setSeverityLevel] = useState("")
  const [timeFrame, setTimeFrame] = useState("")
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Treaty Research state
  const [treatyResults, setTreatyResults] = useState<any>(null)
  const [isLoadingTreaties, setIsLoadingTreaties] = useState(false)
  const [treatyStatistics, setTreatyStatistics] = useState<any>(null)
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState("setup")
  
  // Country dropdown states
  const [selectedCountryOpen, setSelectedCountryOpen] = useState(false)
  const [offensiveCountryOpen, setOffensiveCountryOpen] = useState(false)
  const [defensiveCountryOpen, setDefensiveCountryOpen] = useState(false)
  
  // Economic factors sliders
  const [tradeDependencies, setTradeDependencies] = useState([50])
  const [sanctionsImpact, setSanctionsImpact] = useState([50])
  const [marketStability, setMarketStability] = useState([50])
  
  // Military readiness sliders
  const [defenseCapabilities, setDefenseCapabilities] = useState([50])
  const [allianceSupport, setAllianceSupport] = useState([50])
  const [strategicResources, setStrategicResources] = useState([50])
  
  // Diplomatic relations sliders
  const [unSupport, setUnSupport] = useState([50])
  const [regionalInfluence, setRegionalInfluence] = useState([50])
  const [publicOpinion, setPublicOpinion] = useState([50])
  
  const { toast } = useToast()

  // Automatically load relevant treaties based on scenario
  const loadRelevantTreaties = async () => {
    // Only load if we have a complete scenario
    if (!conflictScenario || !offensiveCountry || !defensiveCountry) {
      setTreatyResults(null)
      return
    }
    
    setIsLoadingTreaties(true)
    
    try {
      // Prepare current simulation context
      const scenarioContext = {
        selectedCountry: countries.find(c => c.code === selectedCountry)?.name || selectedCountry,
        conflictScenario,
        offensiveCountry: countries.find(c => c.code === offensiveCountry)?.name || offensiveCountry,
        defensiveCountry: countries.find(c => c.code === defensiveCountry)?.name || defensiveCountry,
        scenarioDetails,
        severityLevel,
        timeFrame,
        tradeDependencies: tradeDependencies[0],
        sanctionsImpact: sanctionsImpact[0],
        marketStability: marketStability[0],
        defenseCapabilities: defenseCapabilities[0],
        allianceSupport: allianceSupport[0],
        strategicResources: strategicResources[0],
        unSupport: unSupport[0],
        regionalInfluence: regionalInfluence[0],
        publicOpinion: publicOpinion[0],
        simulationResults
      }

      const response = await fetch('/api/treaties/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // No manual query - purely scenario-based
          scenarioContext,
          includeStatistics: treatyStatistics === null
        }),
      })

      if (!response.ok) {
        throw new Error('Treaty loading failed')
      }

      const result = await response.json()
      setTreatyResults(result)
      
      if (result.statistics && treatyStatistics === null) {
        setTreatyStatistics(result.statistics)
      }

    } catch (error) {
      console.error('Treaty loading error:', error)
      
      toast({
        title: "Loading Error",
        description: "Unable to load relevant treaties. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTreaties(false)
    }
  }

  // Load treaty statistics and auto-load relevant treaties based on scenario
  useEffect(() => {
    const loadTreatyStats = async () => {
      try {
        const response = await fetch('/api/treaties/query')
        if (response.ok) {
          const result = await response.json()
          setTreatyStatistics(result.statistics)
        }
      } catch (error) {
        console.log('Could not load treaty statistics:', error)
      }
    }
    
    loadTreatyStats()
  }, [])

  // Auto-load relevant treaties when scenario changes
  useEffect(() => {
    if (activeTab === 'chat') {
      loadRelevantTreaties()
    }
  }, [selectedCountry, conflictScenario, offensiveCountry, defensiveCountry, activeTab, scenarioDetails, severityLevel, timeFrame])

  // Reset analysis sliders to 50
  const resetValues = () => {
    setTradeDependencies([50])
    setSanctionsImpact([50])
    setMarketStability([50])
    setDefenseCapabilities([50])
    setAllianceSupport([50])
    setStrategicResources([50])
    setUnSupport([50])
    setRegionalInfluence([50])
    setPublicOpinion([50])
    
    toast({
      title: "Values Reset",
      description: "All analysis parameters have been reset to 50%.",
      variant: "default",
    })
  }

  // Clear all form fields
  const clearForm = () => {
    setSelectedCountry("")
    setConflictScenario("")
    setOffensiveCountry("")
    setDefensiveCountry("")
    setScenarioDetails("")
    setSeverityLevel("")
    setTimeFrame("")
    // Reset all analysis parameters to 50
    setTradeDependencies([50])
    setSanctionsImpact([50])
    setMarketStability([50])
    setDefenseCapabilities([50])
    setAllianceSupport([50])
    setStrategicResources([50])
    setUnSupport([50])
    setRegionalInfluence([50])
    setPublicOpinion([50])
    // Clear treaty results
    setTreatyResults(null)
    
    toast({
      title: "Form Cleared",
      description: "All simulation setup, analysis parameters, and treaty search have been reset.",
      variant: "default",
    })
  }

  interface Country {
    code: string
    name: string
    flag: string
    power: number
    military: number
    economic: number
    diplomatic: number
  }

  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch("/api/countries")
        if (!res.ok) throw new Error("Failed to fetch countries")
        const data: Country[] = await res.json()
        // Sort by power descending for nicer UX
        data.sort((a, b) => b.power - a.power)
        setCountries(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadCountries()
  }, [])

  const conflictTypes = [
    { id: "territorial", name: "Territorial Military Conflict", icon: "🗺️" },
    { id: "nuclear", name: "Nuclear Military Threat", icon: "☢️" },
    { id: "proxy", name: "Proxy Military War", icon: "🎭" },
    { id: "conventional", name: "Conventional Military War", icon: "⚔️" },
    { id: "naval", name: "Naval Military Conflict", icon: "🚢" },
    { id: "air", name: "Air Military Campaign", icon: "✈️" },
  ]

  // Automatically detect conflict type from scenario details
  const detectConflictType = (details: string): string => {
    if (!details) return ""
    
    const lowerDetails = details.toLowerCase()
    
    // Nuclear keywords (highest priority)
    if (lowerDetails.includes('nuclear') || lowerDetails.includes('nuke') || 
        lowerDetails.includes('atomic') || lowerDetails.includes('warhead') ||
        lowerDetails.includes('radiation') || lowerDetails.includes('fallout')) {
      return "nuclear"
    }
    
    // Naval keywords
    if (lowerDetails.includes('naval') || lowerDetails.includes('navy') || 
        lowerDetails.includes('fleet') || lowerDetails.includes('ship') ||
        lowerDetails.includes('submarine') || lowerDetails.includes('maritime') ||
        lowerDetails.includes('sea') || lowerDetails.includes('ocean') ||
        lowerDetails.includes('blockade') || lowerDetails.includes('port')) {
      return "naval"
    }
    
    // Air keywords
    if (lowerDetails.includes('air force') || lowerDetails.includes('aircraft') || 
        lowerDetails.includes('fighter') || lowerDetails.includes('bomber') ||
        lowerDetails.includes('missile') || lowerDetails.includes('drone') ||
        lowerDetails.includes('airspace') || lowerDetails.includes('bombing') ||
        lowerDetails.includes('aerial') || lowerDetails.includes('helicopter')) {
      return "air"
    }
    
    // Proxy war keywords
    if (lowerDetails.includes('proxy') || lowerDetails.includes('indirect') || 
        lowerDetails.includes('militia') || lowerDetails.includes('rebel') ||
        lowerDetails.includes('insurgent') || lowerDetails.includes('guerrilla') ||
        lowerDetails.includes('support') || lowerDetails.includes('backing')) {
      return "proxy"
    }
    
    // Territorial keywords
    if (lowerDetails.includes('territorial') || lowerDetails.includes('border') || 
        lowerDetails.includes('invasion') || lowerDetails.includes('occupy') ||
        lowerDetails.includes('annex') || lowerDetails.includes('territory') ||
        lowerDetails.includes('land') || lowerDetails.includes('region') ||
        lowerDetails.includes('disputed') || lowerDetails.includes('claim')) {
      return "territorial"
    }
    
    // Default to conventional if military terms but no specific type detected
    if (lowerDetails.includes('military') || lowerDetails.includes('army') || 
        lowerDetails.includes('troops') || lowerDetails.includes('soldier') ||
        lowerDetails.includes('war') || lowerDetails.includes('battle') ||
        lowerDetails.includes('combat') || lowerDetails.includes('attack') ||
        lowerDetails.includes('defense') || lowerDetails.includes('offensive')) {
      return "conventional"
    }
    
    return ""
  }

  // Auto-detect conflict type when scenario details change
  useEffect(() => {
    if (scenarioDetails.trim()) {
      const detectedType = detectConflictType(scenarioDetails)
      if (detectedType && detectedType !== conflictScenario) {
        setConflictScenario(detectedType)
      }
    }
  }, [scenarioDetails])

  const runSimulation = async () => {
    setIsSimulating(true)
    
    // Ensure conflict type is detected from scenario details if not already set
    const currentConflictScenario = conflictScenario || detectConflictType(scenarioDetails)
    if (!conflictScenario && currentConflictScenario) {
      setConflictScenario(currentConflictScenario)
    }
    
    // Collect all analysis parameters
    const analysisData = {
      // Setup data
      selectedCountry,
      conflictScenario: currentConflictScenario,
      offensiveCountry,
      defensiveCountry,
      scenarioDetails,
      severityLevel,
      timeFrame,
      // Economic factors
      tradeDependencies: tradeDependencies[0],
      sanctionsImpact: sanctionsImpact[0],
      marketStability: marketStability[0],
      // Military readiness
      defenseCapabilities: defenseCapabilities[0],
      allianceSupport: allianceSupport[0],
      strategicResources: strategicResources[0],
      // Diplomatic relations
      unSupport: unSupport[0],
      regionalInfluence: regionalInfluence[0],
      publicOpinion: publicOpinion[0]
    }

    try {
      // Save analysis parameters to database
      console.log('Submitting analysis data:', analysisData)
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      })

      if (!response.ok) {
        throw new Error('Failed to save analysis parameters')
      }

      const result = await response.json()
      console.log('Analysis parameters saved:', result)
      
      toast({
        title: "Analysis Saved",
        description: "Analysis parameters have been saved to database.",
        variant: "default",
      })

    } catch (error) {
      console.error('Error saving analysis:', error)
      toast({
        title: "Warning",
        description: "Failed to save analysis parameters, but simulation will continue.",
        variant: "destructive",
      })
    }

    // Get country names for better AI analysis
    const selectedCountryName = countries.find(c => c.code === selectedCountry)?.name || selectedCountry
    const offensiveCountryName = countries.find(c => c.code === offensiveCountry)?.name || offensiveCountry
    const defensiveCountryName = countries.find(c => c.code === defensiveCountry)?.name || defensiveCountry

    // Prepare data for AI analysis
    const aiAnalysisData = {
      ...analysisData,
      selectedCountry: selectedCountryName,
      offensiveCountry: offensiveCountryName,
      defensiveCountry: defensiveCountryName
    }

    try {
      // Call OpenAI analysis API
      console.log('Sending data to AI analysis:', aiAnalysisData)
      const aiResponse = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiAnalysisData),
      })

      if (!aiResponse.ok) {
        throw new Error('AI analysis failed')
      }

      const aiResult = await aiResponse.json()
      console.log('AI analysis result:', aiResult)
      
      if (aiResult.success) {
        setSimulationResults(aiResult.analysis)
        toast({
          title: "AI Analysis Complete",
          description: "Your simulation has been analyzed using advanced AI. You are now redirected to the results page.",
          variant: "default",
        })
        
        // Redirect to View Results tab
        setActiveTab("results")
      } else {
        // Use fallback results if AI analysis fails
        setSimulationResults(aiResult.analysis)
        toast({
          title: "Analysis Complete",
          description: "Showing fallback analysis due to AI service issues. Redirecting to results...",
          variant: "destructive",
        })
        
        // Redirect to View Results tab even with fallback
        setActiveTab("results")
      }

    } catch (error) {
      console.error('AI analysis error:', error)
      
      // Fallback to basic simulation results
      setSimulationResults({
        diplomaticResponse: 75,
        militaryReadiness: 65,
        economicImpact: -10,
        publicSupport: 60,
        allianceStrength: 70,
        recommendations: [
          "Engage in diplomatic negotiations to de-escalate tensions",
          "Strengthen economic partnerships with allied nations", 
          "Enhance intelligence sharing capabilities",
          "Prepare contingency plans for various scenarios",
          "Monitor public sentiment and maintain transparency"
        ],
        summary: "**SCENARIO CONTEXT:** This analysis represents a fallback assessment due to temporary AI service limitations. The specific military conflict scenario requires detailed intelligence analysis that considers multiple strategic factors.\n\n**STRATEGIC IMPLICATIONS:** Without access to real-time geopolitical data, this assessment provides general strategic guidance. The conflict situation demands careful evaluation of regional power dynamics and international response mechanisms.\n\n**RISK ASSESSMENT:** Military conflicts of this nature typically involve escalation risks, economic disruption, and diplomatic challenges. Success depends on multilateral coordination and strategic resource allocation.\n\n**TACTICAL CONSIDERATIONS:** Military preparedness, alliance coordination, and diplomatic engagement remain critical factors. Intelligence gathering and strategic communication are essential for favorable outcomes.\n\n**RECOMMENDATIONS:** The provided recommendations represent established geopolitical best practices. For mission-critical decisions, consult with specialized military and diplomatic advisors familiar with current regional conditions."
      })
      
      toast({
        title: "Analysis Warning",
        description: "AI analysis unavailable. Showing basic recommendations. Redirecting to results...",
        variant: "destructive",
      })
      
      // Redirect to View Results tab even with basic results
      setActiveTab("results")
    }

    setIsSimulating(false)
  }

  return (
    <div className="bg-dark-bg text-dark-text h-dvh flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-flame rounded-lg flex items-center justify-center">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark-text">GioAdvisor</h1>
                <p className="text-sm text-dark-muted">Military Conflict Simulation Platform</p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="text-center">
                <p className="text-lg font-semibold text-dark-text">Strategic Command Center</p>
                <p className="text-xs text-dark-muted">Real-time military analysis & intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 flex-1">
              <div className="hidden sm:flex items-center space-x-4 text-sm text-dark-muted">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Military Intelligence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Strategic Analysis</span>
                </div>
              </div>
              <Badge variant="outline" className="border-flame text-flame bg-transparent text-sm px-3 py-1">
                Beta v1.1
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 pb-12 lg:pb-96 flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-dark-card border border-dark-border h-12">
            <TabsTrigger
              value="setup"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-base"
            >
              Setup Simulation
            </TabsTrigger>

            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-base"
            >
              View Results
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-base"
            >
              Treaty Research
            </TabsTrigger>
          </TabsList>

                    {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Country Selection */}
              <Card className="border-dark-border bg-dark-card h-fit">
                <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10 py-4 tight-v">
                  <CardTitle className="flex items-center space-x-3 text-dark-text text-lg">
                    <Users className="w-5 h-5 text-flame" />
                    <span>Select Your Country</span>
                  </CardTitle>
                  <CardDescription className="text-dark-muted text-base">
                    Choose which country you want to simulate as
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Popover open={selectedCountryOpen} onOpenChange={setSelectedCountryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={selectedCountryOpen}
                        className="w-full justify-between bg-dark-bg border-dark-border text-dark-text hover:bg-dark-border hover:text-dark-text"
                      >
                        {selectedCountry ? (
                          <div className="flex items-center space-x-2">
                            <FlagIcon countryCode={selectedCountry} className="w-6 h-4" />
                            <span>{countries.find((c) => c.code === selectedCountry)?.name}</span>
                          </div>
                        ) : (
                          "Choose a country..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 bg-dark-card border-dark-border">
                      <Command className="bg-dark-card">
                        <CommandInput placeholder="Search countries..." className="text-dark-text" />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                key={country.code}
                                value={`${country.name} ${country.code}`}
                                onSelect={() => {
                                  setSelectedCountry(country.code)
                                  setSelectedCountryOpen(false)
                                }}
                                className="text-dark-text hover:bg-dark-border"
                              >
                                <div className="flex items-center space-x-3 w-full">
                                  <FlagIcon countryCode={country.code} className="w-6 h-4" />
                                  <span className="flex-1">{country.name}</span>
                                  <Badge variant="secondary" className="bg-dark-border text-dark-text">
                                    Power: {country.power}
                                  </Badge>
                                  <Check
                                    className={`ml-2 h-4 w-4 ${
                                      selectedCountry === country.code ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedCountry && (
                    <div className="mt-4 p-4 bg-dark-border rounded-lg">
                      <h4 className="font-semibold text-dark-text mb-2 flex items-center space-x-2">
                        <FlagIcon countryCode={selectedCountry} className="w-6 h-4" />
                        <span>Country Profile</span>
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-dark-muted">Military Strength:</span>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={countries.find((c) => c.code === selectedCountry)?.military || 0}
                              className="w-20"
                            />
                            <span className="text-flame font-medium">
                              {countries.find((c) => c.code === selectedCountry)?.military}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-dark-muted">Economic Power:</span>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={countries.find((c) => c.code === selectedCountry)?.economic || 0}
                              className="w-20"
                            />
                            <span className="text-flame font-medium">
                              {countries.find((c) => c.code === selectedCountry)?.economic}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-dark-muted">Diplomatic Influence:</span>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={countries.find((c) => c.code === selectedCountry)?.diplomatic || 0}
                              className="w-20"
                            />
                            <span className="text-flame font-medium">
                              {countries.find((c) => c.code === selectedCountry)?.diplomatic}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Military Conflict Scenario */}
              <Card className="border-dark-border bg-dark-card min-h-[600px] flex flex-col">
                <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10 py-4 tight-v">
                  <CardTitle className="flex items-center space-x-3 text-dark-text text-lg">
                    <AlertTriangle className="w-5 h-5 text-flame" />
                    <span>Military Conflict Scenario</span>
                  </CardTitle>
                  <CardDescription className="text-dark-muted text-base">
                    Define the military conflict situation to analyze
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4 flex-1">


                  {/* Attacking and Defending Military Forces */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium text-dark-text mb-3 block flex items-center">
                        <Sword className="w-5 h-5 mr-2 text-flame" />
                        Attacking Military Force
                      </label>
                      <Popover open={offensiveCountryOpen} onOpenChange={setOffensiveCountryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={offensiveCountryOpen}
                            className="w-full justify-between bg-dark-bg border-dark-border text-dark-text hover:bg-dark-border hover:text-dark-text"
                          >
                            {offensiveCountry ? (
                              <div className="flex items-center space-x-2">
                                <FlagIcon countryCode={offensiveCountry} className="w-6 h-4" />
                                <span>{countries.find((c) => c.code === offensiveCountry)?.name}</span>
                              </div>
                            ) : (
                              "Select aggressor..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0 bg-dark-card border-dark-border">
                          <Command className="bg-dark-card">
                            <CommandInput placeholder="Search countries..." className="text-dark-text" />
                            <CommandList>
                              <CommandEmpty>No country found.</CommandEmpty>
                              <CommandGroup>
                                {countries.map((country) => (
                                  <CommandItem
                                    key={country.code}
                                    value={`${country.name} ${country.code}`}
                                    disabled={country.code === defensiveCountry}
                                    onSelect={() => {
                                      if (country.code !== defensiveCountry) {
                                        setOffensiveCountry(country.code)
                                        setOffensiveCountryOpen(false)
                                      }
                                    }}
                                    className={`text-dark-text hover:bg-dark-border ${
                                      country.code === defensiveCountry ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 w-full">
                                      <FlagIcon countryCode={country.code} className="w-6 h-4" />
                                      <span className="flex-1">{country.name}</span>
                                      <Check
                                        className={`ml-2 h-4 w-4 ${
                                          offensiveCountry === country.code ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-base font-medium text-dark-text mb-3 block flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-flame" />
                        Defending Military Force
                      </label>
                      <Popover open={defensiveCountryOpen} onOpenChange={setDefensiveCountryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={defensiveCountryOpen}
                            className="w-full justify-between bg-dark-bg border-dark-border text-dark-text hover:bg-dark-border hover:text-dark-text"
                          >
                            {defensiveCountry ? (
                              <div className="flex items-center space-x-2">
                                <FlagIcon countryCode={defensiveCountry} className="w-6 h-4" />
                                <span>{countries.find((c) => c.code === defensiveCountry)?.name}</span>
                              </div>
                            ) : (
                              "Select defender..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0 bg-dark-card border-dark-border">
                          <Command className="bg-dark-card">
                            <CommandInput placeholder="Search countries..." className="text-dark-text" />
                            <CommandList>
                              <CommandEmpty>No country found.</CommandEmpty>
                              <CommandGroup>
                                {countries.map((country) => (
                                  <CommandItem
                                    key={country.code}
                                    value={`${country.name} ${country.code}`}
                                    disabled={country.code === offensiveCountry}
                                    onSelect={() => {
                                      if (country.code !== offensiveCountry) {
                                        setDefensiveCountry(country.code)
                                        setDefensiveCountryOpen(false)
                                      }
                                    }}
                                    className={`text-dark-text hover:bg-dark-border ${
                                      country.code === offensiveCountry ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 w-full">
                                      <FlagIcon countryCode={country.code} className="w-6 h-4" />
                                      <span className="flex-1">{country.name}</span>
                                      <Check
                                        className={`ml-2 h-4 w-4 ${
                                          defensiveCountry === country.code ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <label className="text-base font-medium text-dark-text mb-3 block">Military Scenario Details</label>
                    <Textarea
                      placeholder="Describe your military conflict scenario in detail. Include specific military actions, weapons, forces, or tactical elements. The system will automatically detect the conflict type (nuclear, territorial, naval, air, proxy, or conventional) based on your description..."
                      className="min-h-[120px] bg-dark-bg border-dark-border text-dark-text placeholder:text-dark-muted text-base p-4"
                      value={scenarioDetails}
                      onChange={(e) => setScenarioDetails(e.target.value)}
                    />
                    {conflictScenario && (
                      <div className="mt-3 flex items-center text-sm text-dark-muted">
                        <span className="mr-2">📊 Auto-detected conflict type:</span>
                        <span className="text-flame font-medium">
                          {conflictTypes.find(type => type.id === conflictScenario)?.icon} {conflictTypes.find(type => type.id === conflictScenario)?.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium text-dark-text mb-3 block">Severity Level</label>
                      <Select value={severityLevel} onValueChange={setSeverityLevel}>
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
                      <label className="text-base font-medium text-dark-text mb-3 block">Time Frame</label>
                      <Select value={timeFrame} onValueChange={setTimeFrame}>
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
              
            <div className="flex justify-between pt-6 border-t border-dark-border">
              <Button
                onClick={clearForm}
                variant="outline"
                className="border-dark-border text-dark-text hover:bg-dark-border bg-transparent px-6 py-3 text-base"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Clear All Fields
              </Button>
              
              <Button
                onClick={runSimulation}
                disabled={!selectedCountry || !offensiveCountry || !defensiveCountry || !scenarioDetails.trim() || isSimulating}
                className="bg-flame hover:bg-flame/90 text-white px-8 py-3 text-base"
              >
                {isSimulating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    AI Analysis in Progress...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Run AI Political Analysis
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="flex-1 min-h-0 mt-4">
            <div className="h-full overflow-y-auto">
              {simulationResults ? (
                <div className="grid gap-4 pb-4">
                  {/* AI Summary */}
                  {simulationResults.summary && (
                    <Card className="border-dark-border bg-dark-card">
                      <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10 py-3">
                        <CardTitle className="flex items-center space-x-2 text-dark-text text-base">
                          <Target className="w-4 h-4 text-flame" />
                          <span>AI Analysis Summary</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="text-dark-text leading-relaxed text-sm space-y-4">
                          {simulationResults.summary.split('\n\n').map((paragraph: string, index: number) => (
                            <div key={index} className="space-y-2">
                              {paragraph.includes('**') ? (
                                <div dangerouslySetInnerHTML={{
                                  __html: paragraph
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-flame font-semibold">$1</strong>')
                                    .replace(/\n/g, '<br />')
                                }} />
                              ) : (
                                <p className="text-dark-muted">{paragraph}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Key Metrics */}
                  <div className="grid grid-cols-5 gap-3">
                    <Card className="border-dark-border bg-dark-card">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-flame mb-1">{simulationResults.diplomaticResponse}%</div>
                        <div className="text-xs text-dark-muted">Diplomatic Success</div>
                        <Progress value={simulationResults.diplomaticResponse} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card className="border-dark-border bg-dark-card">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-flame mb-1">{simulationResults.militaryReadiness}%</div>
                        <div className="text-xs text-dark-muted">Military Readiness</div>
                        <Progress value={simulationResults.militaryReadiness} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card className="border-dark-border bg-dark-card">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-flame mb-1">{simulationResults.economicImpact}%</div>
                        <div className="text-xs text-dark-muted">Economic Impact</div>
                        <Progress value={Math.abs(simulationResults.economicImpact)} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card className="border-dark-border bg-dark-card">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-flame mb-1">{simulationResults.publicSupport}%</div>
                        <div className="text-xs text-dark-muted">Public Support</div>
                        <Progress value={simulationResults.publicSupport} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card className="border-dark-border bg-dark-card">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-flame mb-1">{simulationResults.allianceStrength}%</div>
                        <div className="text-xs text-dark-muted">Alliance Strength</div>
                        <Progress value={simulationResults.allianceStrength} className="mt-2" />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendations */}
                  <Card className="border-dark-border bg-dark-card">
                    <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10 py-3">
                      <CardTitle className="flex items-center space-x-2 text-dark-text text-base">
                        <FileText className="w-4 h-4 text-flame" />
                        <span>Strategic Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {simulationResults.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-dark-border rounded-lg">
                            <div className="w-5 h-5 bg-flame rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-dark-text text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strategic Response Matrix */}
                  <Card className="border-dark-border bg-dark-card">
                    <CardHeader className="py-3">
                      <CardTitle className="flex items-center space-x-2 text-dark-text text-base">
                        <Target className="w-4 h-4 text-flame" />
                        <span>Strategic Response Options</span>
                      </CardTitle>
                      <CardDescription className="text-dark-muted text-sm">
                        Military response strategies ranked by effectiveness and risk
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Diplomatic Response */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="font-medium text-dark-text">Diplomatic Resolution</span>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Recommended
                            </Badge>
                          </div>
                          <p className="text-sm text-dark-muted mb-3">
                            Negotiate through international channels, UN mediation, and multilateral talks.
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-green-500/10 rounded p-2">
                              <span className="text-green-400 font-medium">Pros:</span>
                              <div className="text-dark-muted">• Low casualties</div>
                              <div className="text-dark-muted">• Preserves alliances</div>
                            </div>
                            <div className="bg-red-500/10 rounded p-2">
                              <span className="text-red-400 font-medium">Risks:</span>
                              <div className="text-dark-muted">• Time-sensitive</div>
                              <div className="text-dark-muted">• May show weakness</div>
                            </div>
                          </div>
                        </div>

                        {/* Military Response */}
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Sword className="w-4 h-4 text-red-400" />
                              <span className="font-medium text-dark-text">Military Action</span>
                            </div>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              High Risk
                            </Badge>
                          </div>
                          <p className="text-sm text-dark-muted mb-3">
                            Direct military intervention with allied support and strategic coordination.
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-green-500/10 rounded p-2">
                              <span className="text-green-400 font-medium">Pros:</span>
                              <div className="text-dark-muted">• Decisive action</div>
                              <div className="text-dark-muted">• Strong deterrent</div>
                            </div>
                            <div className="bg-red-500/10 rounded p-2">
                              <span className="text-red-400 font-medium">Risks:</span>
                              <div className="text-dark-muted">• High casualties</div>
                              <div className="text-dark-muted">• Escalation risk</div>
                            </div>
                          </div>
                        </div>

                        {/* Economic Response */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-yellow-400" />
                              <span className="font-medium text-dark-text">Economic Pressure</span>
                            </div>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Moderate Risk
                            </Badge>
                          </div>
                          <p className="text-sm text-dark-muted mb-3">
                            Coordinated sanctions, trade restrictions, and financial pressure campaigns.
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-green-500/10 rounded p-2">
                              <span className="text-green-400 font-medium">Pros:</span>
                              <div className="text-dark-muted">• Non-violent</div>
                              <div className="text-dark-muted">• Broad support</div>
                            </div>
                            <div className="bg-red-500/10 rounded p-2">
                              <span className="text-red-400 font-medium">Risks:</span>
                              <div className="text-dark-muted">• Slow effects</div>
                              <div className="text-dark-muted">• Economic blowback</div>
                            </div>
                          </div>
                        </div>

                        {/* Alliance Response */}
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-purple-400" />
                              <span className="font-medium text-dark-text">Coalition Building</span>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              Low Risk
                            </Badge>
                          </div>
                          <p className="text-sm text-dark-muted mb-3">
                            Mobilize international coalitions and strengthen defensive partnerships.
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-green-500/10 rounded p-2">
                              <span className="text-green-400 font-medium">Pros:</span>
                              <div className="text-dark-muted">• Shared burden</div>
                              <div className="text-dark-muted">• Legitimacy</div>
                            </div>
                            <div className="bg-red-500/10 rounded p-2">
                              <span className="text-red-400 font-medium">Risks:</span>
                              <div className="text-dark-muted">• Complex coordination</div>
                              <div className="text-dark-muted">• Divided interests</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommended Strategy */}
                      <div className="mt-6 bg-gradient-to-r from-flame/20 to-flame/10 border border-flame/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Award className="w-5 h-5 text-flame" />
                          <span className="font-semibold text-dark-text">AI Recommended Strategy</span>
                        </div>
                        <p className="text-sm text-dark-text leading-relaxed">
                          🎯 <strong>Hybrid Strategy Recommended:</strong> Begin with diplomatic engagement while simultaneously building coalition support. Maintain economic pressure as leverage and keep military options in reserve. This multi-layered approach maximizes flexibility while minimizing escalation risks.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-dark-border bg-dark-card h-full flex items-center justify-center">
                  <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-6 h-6 text-dark-muted" />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-text mb-2">No Results Yet</h3>
                    <p className="text-dark-muted mb-4 text-sm">Run a simulation to see detailed analysis and recommendations</p>
                    <Button
                      variant="outline"
                      className="border-flame text-flame hover:bg-flame hover:text-white bg-transparent"
                      onClick={() => setActiveTab("setup")}
                    >
                      Go to Setup
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Treaty Research Tab */}
          <TabsContent value="chat" className="flex-1 min-h-0 mt-4">
            <Card className="border-dark-border bg-dark-card min-h-[50vh] lg:min-h-[600px] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10 py-4 tight-v flex-shrink-0">
                <CardTitle className="flex items-center space-x-3 text-dark-text text-lg">
                  <FileText className="w-5 h-5 text-flame" />
                  <span>Treaty Research & Analysis</span>
                </CardTitle>
                <CardDescription className="text-dark-muted text-base">
                  Automatically displays treaties relevant to your scenario with utilization guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex-1 min-h-0 flex flex-col">
                {/* Treaty Database Statistics */}
                {treatyStatistics && (
                  <Card className="bg-dark-border mb-4 flex-shrink-0">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-dark-text mb-3 text-base">Treaty Database Overview</h4>
                      <div className="grid md:grid-cols-3 gap-4 text-base">
                        <div>
                          <span className="text-dark-muted">Total Treaties: </span>
                          <span className="text-flame font-medium">{treatyStatistics.totalTreaties}</span>
                        </div>
                        <div>
                          <span className="text-dark-muted">Ancient Treaties: </span>
                          <span className="text-dark-text font-medium">{treatyStatistics.ancientTreaties}</span>
                        </div>
                        <div>
                          <span className="text-dark-muted">Modern Treaties: </span>
                          <span className="text-dark-text font-medium">{treatyStatistics.modernTreaties}</span>
                        </div>
                      </div>
                      {treatyStatistics.byType && (
                        <div className="mt-3 pt-3 border-t border-dark-border">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {Object.entries(treatyStatistics.byType).map(([type, count]) => (
                              <div key={type}>
                                <span className="text-dark-muted capitalize">{type}: </span>
                                <span className="text-dark-text">{count as number}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Current Scenario Context */}
                {selectedCountry && conflictScenario && (
                  <Card className="bg-dark-border mb-4 flex-shrink-0">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-dark-text mb-3 text-base">Current Scenario Context</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-base">
                        <div>
                          <span className="text-dark-muted">Your Country: </span>
                          <span className="text-flame font-medium flex items-center gap-2">
                            <FlagIcon countryCode={selectedCountry} className="w-6 h-4" />
                            {countries.find(c => c.code === selectedCountry)?.name || selectedCountry}
                          </span>
                        </div>
                        <div>
                          <span className="text-dark-muted">Scenario: </span>
                          <span className="text-dark-text font-medium">{conflictScenario}</span>
                        </div>
                        {offensiveCountry && (
                          <div>
                            <span className="text-dark-muted">Parties: </span>
                            <span className="text-dark-text font-medium flex items-center gap-2">
                              <FlagIcon countryCode={offensiveCountry} className="w-6 h-4" />
                              {countries.find(c => c.code === offensiveCountry)?.name || offensiveCountry}
                              {defensiveCountry && (
                                <>
                                  <span className="text-dark-muted">vs</span>
                                  <FlagIcon countryCode={defensiveCountry} className="w-6 h-4" />
                                  {countries.find(c => c.code === defensiveCountry)?.name || defensiveCountry}
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Search Results or Empty State */}
                <div className="flex-1 bg-dark-bg rounded-lg p-4 mb-4 overflow-y-auto min-h-0">
                  {!treatyResults && !isLoadingTreaties && (!conflictScenario || !offensiveCountry || !defensiveCountry) ? (
                    <div className="h-full flex items-center justify-center text-center text-dark-muted">
                      <div>
                        <Settings className="w-10 h-10 mx-auto mb-4 opacity-50" />
                        <p className="mb-3 font-medium text-base">Automatic Treaty Analysis</p>
                        <p className="text-base mb-4">Treaties will automatically appear when you complete your scenario setup.</p>
                        <p className="text-sm text-dark-muted mb-3">Go to the <span className="text-flame font-medium">Setup</span> tab and configure:</p>
                        <div className="space-y-1 text-sm text-dark-muted">
                          <div>• Conflict type and details</div>
                          <div>• Aggressor and victim countries</div>
                          <div>• Timeline and severity</div>
                        </div>
                      </div>
                    </div>
                  ) : isLoadingTreaties ? (
                    <div className="h-full flex items-center justify-center text-center text-dark-muted">
                      <div>
                        <Loader2 className="w-8 h-8 mx-auto mb-3 text-flame animate-spin" />
                        <p className="text-base">Analyzing scenario and loading relevant treaties...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Results Header */}
                      {treatyResults?.treaties && treatyResults.treaties.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-dark-text">
                              {treatyResults.metadata?.autoGenerated ? 
                                `${treatyResults.treaties?.length || 0} Treaties Directly Related to Your Scenario` : 
                                `Found ${treatyResults.treaties?.length || 0} Relevant Treaties`
                              }
                              {treatyResults.metadata?.mutualTreaties > 0 && (
                                <span className="text-green-600 ml-2">
                                  ({treatyResults.metadata.mutualTreaties} mutual)
                                </span>
                              )}
                              {treatyResults.treaties?.filter((t: any) => t.participation?.signingStatus === 'aggressor_only').length > 0 && (
                                <span className="text-red-600 ml-2">
                                  ({treatyResults.treaties?.filter((t: any) => t.participation?.signingStatus === 'aggressor_only').length || 0} aggressor only)
                                </span>
                              )}
                              {treatyResults.treaties?.filter((t: any) => t.participation?.signingStatus === 'victim_only').length > 0 && (
                                <span className="text-blue-600 ml-2">
                                  ({treatyResults.treaties?.filter((t: any) => t.participation?.signingStatus === 'victim_only').length || 0} victim only)
                                </span>
                              )}
                            </h5>
                            <div className="flex items-center space-x-2">
                              {treatyResults.metadata?.autoGenerated ? (
                                <Badge className="bg-blue-500 text-white text-sm">
                                  Auto-Generated
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-flame text-flame bg-transparent text-sm">
                                  {treatyResults.metadata?.searchQuery}
                                </Badge>
                              )}
                              {treatyResults.metadata?.scenarioContext && (
                                <Badge variant="outline" className="border-green-500 text-green-500 bg-transparent text-sm">
                                  Scenario Optimized
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {treatyResults.metadata?.autoGenerated && (
                            <div className="bg-blue-950 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-white-800">
                                <span className="font-semibold">Intelligent Analysis:</span> These treaties were automatically identified based on your current scenario: 
                                <span className="font-medium">{conflictScenario}</span> involving <span className="font-medium">{countries.find(c => c.code === selectedCountry)?.name}</span>
                                {offensiveCountry && <span>, <span className="font-medium">{countries.find(c => c.code === offensiveCountry)?.name}</span></span>}
                                {defensiveCountry && <span>, and <span className="font-medium">{countries.find(c => c.code === defensiveCountry)?.name}</span></span>}.
                                {treatyResults.metadata?.mutualTreaties > 0 && (
                                  <span className="block mt-1">
                                    <span className="font-semibold text-green-700">Priority:</span> Treaties where both parties are signatories are shown first, 
                                    as they carry the strongest legal obligations and enforcement mechanisms.
                                  </span>
                                )}
                                {treatyResults.treaties?.some((t: any) => t.participation?.signingStatus?.includes('_only')) && (
                                  <span className="block mt-1">
                                    <span className="font-semibold text-orange-700">Strategic Opportunities:</span> Treaties signed by only one party create leverage points - 
                                    use aggressor obligations for accountability or victim protections for international support.
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Treaty Results */}
                      {treatyResults?.treaties && treatyResults.treaties.length > 0 ? (
                        <div className="grid gap-4">
                          {treatyResults.treaties?.map((treaty: any, index: number) => (
                            <div key={index} className={`bg-dark-card border p-4 rounded-lg hover:border-flame/50 transition-colors ${
                              treaty.participation?.bothPartiesSigned ? 'border-green-500/50 bg-green-500/5' : 
                              treaty.participation?.signingStatus === 'aggressor_only' ? 'border-red-500/50 bg-red-500/5' :
                              treaty.participation?.signingStatus === 'victim_only' ? 'border-blue-500/50 bg-blue-500/5' :
                              'border-dark-border'
                            }`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Badge variant="outline" className="border-flame text-flame bg-transparent text-xs">
                                      {treaty.type}
                                    </Badge>
                                    {treaty.year && (
                                      <span className="text-xs text-dark-muted bg-dark-bg px-2 py-1 rounded">
                                        {treaty.year}
                                      </span>
                                    )}
                                    {treaty.participation?.bothPartiesSigned && (
                                      <Badge className="bg-green-500 text-white text-xs">
                                        Both Parties Signed
                                      </Badge>
                                    )}
                                    {treaty.participation?.signingStatus === 'aggressor_only' && (
                                      <Badge className="bg-red-500 text-white text-xs">
                                        Aggressor Only
                                      </Badge>
                                    )}
                                    {treaty.participation?.signingStatus === 'victim_only' && (
                                      <Badge className="bg-blue-500 text-white text-xs">
                                        Victim Only
                                      </Badge>
                                    )}
                                    {treaty.relevanceScore > 0.7 && !treaty.participation?.bothPartiesSigned && !treaty.participation?.signingStatus?.includes('_only') && (
                                      <Badge className="bg-purple-500 text-white text-xs">
                                        High Relevance
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-base text-dark-text leading-relaxed">{treaty.content}</p>
                                </div>
                              </div>

                              {/* Country Signing Status */}
                              {treaty.participation && (offensiveCountry || defensiveCountry) && (
                                <div className={`mt-3 p-3 border rounded-lg ${
                                  treaty.participation.bothPartiesSigned ? 'bg-green-950' :
                                  treaty.participation.signingStatus === 'aggressor_only' ? 'bg-green-950' :
                                  treaty.participation.signingStatus === 'victim_only' ? 'bg-green-950' :
                                  'bg-green-950'
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-semibold text-dark-text text-sm">Signing Status:</h6>
                                    {treaty.participation.signingStatus === 'aggressor_only' && (
                                      <Badge className="bg-red-100 text-red-800 text-xs">
                                        Strategic Leverage
                                      </Badge>
                                    )}
                                    {treaty.participation.signingStatus === 'victim_only' && (
                                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                                        Protection Rights
                                      </Badge>
                                    )}
                                    {treaty.participation.bothPartiesSigned && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        Mutual Obligations
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    {offensiveCountry && (
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-red-600">
                                          {countries.find(c => c.code === offensiveCountry)?.name || offensiveCountry} (Aggressor):
                                        </span>
                                        <span className={treaty.participation.offensiveCountrySigned ? 'text-green-600 font-medium' : 'text-red-600'}>
                                          {treaty.participation.offensiveCountrySigned ? '✓ Signed' : '✗ Not Signed'}
                                        </span>
                                      </div>
                                    )}
                                    {defensiveCountry && (
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-blue-600">
                                          {countries.find(c => c.code === defensiveCountry)?.name || defensiveCountry} (Victim):
                                        </span>
                                        <span className={treaty.participation.defensiveCountrySigned ? 'text-green-600 font-medium' : 'text-red-600'}>
                                          {treaty.participation.defensiveCountrySigned ? '✓ Signed' : '✗ Not Signed'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {treaty.participation.totalParties > 0 && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      Total parties to this treaty: {treaty.participation.totalParties}
                                    </div>
                                  )}
                                  
                                  {/* Strategic Implications */}
                                  {treaty.participation.signingStatus === 'aggressor_only' && (
                                    <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs">
                                      <span className="font-semibold text-red-800">Strategic Implication:</span>
                                      <span className="text-red-700"> The aggressor has treaty obligations that can be leveraged for accountability and pressure.</span>
                                    </div>
                                  )}
                                  {treaty.participation.signingStatus === 'victim_only' && (
                                    <div className="mt-2 p-2 bg-blue-100 border border-blue-200 rounded text-xs">
                                      <span className="font-semibold text-blue-800">Strategic Implication:</span>
                                      <span className="text-blue-700"> The victim has treaty protections and rights that can be invoked for international support.</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Violation Consequences */}
                              {treatyResults.violationConsequences && treatyResults.violationConsequences[treaty.id] && (
                                <div className="mt-4 p-3 bg-red-950  rounded-lg">
                                  <div className="flex items-start space-x-2">
                                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-white text-xs font-bold">⚠</span>
                                    </div>
                                    <div>
                                      <h6 className="font-semibold text-white text-sm mb-1">Consequences of Violation:</h6>
                                      <p className="text-sm text-white leading-relaxed">{treatyResults.violationConsequences[treaty.id]}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Utilization Guidance */}
                              {treatyResults.utilizationGuidance && treatyResults.utilizationGuidance[treaty.id] && (
                                <div className="mt-4 p-3 bg-flame/10 border border-flame/20 rounded-lg">
                                  <div className="flex items-start space-x-2">
                                    <div className="w-5 h-5 bg-flame rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-white text-xs font-bold">💡</span>
                                    </div>
                                    <div>
                                      <h6 className="font-semibold text-dark-text text-sm mb-1">How to Utilize in This Scenario:</h6>
                                      <p className="text-sm text-dark-text leading-relaxed">{treatyResults.utilizationGuidance[treaty.id]}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {treaty.parties && treaty.parties.length > 0 && (
                                <div className="text-sm text-dark-muted mt-3 pt-3 border-t border-dark-border">
                                  <span className="font-medium">All Parties:</span> {Array.isArray(treaty.parties) ? treaty.parties.join(', ') : treaty.parties}
                                </div>
                              )}
                              <div className="text-xs text-dark-muted mt-2">
                                <span className="font-medium">Section:</span> {treaty.section}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-8 h-8 mx-auto mb-3 text-dark-muted opacity-50" />
                          <p className="text-dark-muted">No treaties found matching your search. Try different keywords.</p>
                        </div>
                      )}

                      {!treatyResults && treatyResults !== null && (
                        <div className="text-center py-8">
                          <FileText className="w-8 h-8 mx-auto mb-3 text-dark-muted opacity-50" />
                          <p className="text-dark-muted">No relevant treaties found for this scenario configuration.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Automatic Intelligence Notice */}
                {treatyResults?.treaties && treatyResults.treaties.length > 0 && (
                  <div className="flex-shrink-0 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 text-center">
                      <span className="font-semibold">🤖 Automatic Intelligence:</span> These treaties were intelligently selected based on your scenario.
                      Mutual treaties (both parties signed) appear first for maximum legal leverage.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
