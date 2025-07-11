"use client"

import { useState, useEffect } from "react"
import { Globe, Users, Target, BarChart3, Play, FileText, AlertTriangle, Sword, Shield, RotateCcw, MessageCircle, Send, Check, ChevronsUpDown } from "lucide-react"
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
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string, timestamp: string}>>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatting, setIsChatting] = useState(false)
  
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

  // Send chat message to AI
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date().toISOString()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setChatInput("")
    setIsChatting(true)
    
    try {
      // Prepare current simulation context
      const contextData = {
        // Setup data
        selectedCountry: countries.find(c => c.code === selectedCountry)?.name || selectedCountry,
        conflictScenario,
        offensiveCountry: countries.find(c => c.code === offensiveCountry)?.name || offensiveCountry,
        defensiveCountry: countries.find(c => c.code === defensiveCountry)?.name || defensiveCountry,
        scenarioDetails,
        severityLevel,
        timeFrame,
        // Analysis parameters
        tradeDependencies: tradeDependencies[0],
        sanctionsImpact: sanctionsImpact[0],
        marketStability: marketStability[0],
        defenseCapabilities: defenseCapabilities[0],
        allianceSupport: allianceSupport[0],
        strategicResources: strategicResources[0],
        unSupport: unSupport[0],
        regionalInfluence: regionalInfluence[0],
        publicOpinion: publicOpinion[0],
        // Current simulation results (if available)
        simulationResults,
        // User's question
        userMessage: userMessage.content
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contextData),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const result = await response.json()
      
      const aiMessage = {
        role: "assistant",
        content: result.response,
        timestamp: new Date().toISOString()
      }
      
      setChatMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: "assistant", 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Chat Error",
        description: "Unable to connect to AI advisor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChatting(false)
    }
  }

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
    // Clear chat
    setChatMessages([])
    setChatInput("")
    
    toast({
      title: "Form Cleared",
      description: "All simulation setup, analysis parameters, and chat history have been reset.",
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

  // Submit setup data to database
  const submitSetup = async () => {
    setIsSubmitting(true)
    
    const setupData = {
      selectedCountry,
      conflictScenario,
      offensiveCountry,
      defensiveCountry,
      scenarioDetails,
      severityLevel,
      timeFrame,
      timestamp: new Date().toISOString()
    }

    try {
      console.log('Submitting setup data:', setupData)
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit setup')
      }

      const result = await response.json()
      console.log('Setup submitted successfully:', result)
      toast({
        title: "Success!",
        description: "Simulation setup saved! Redirecting to analysis...",
        variant: "default",
      })
      
      // Redirect to Run Analysis tab
      setActiveTab("simulate")
      
    } catch (error) {
      console.error('Error submitting setup:', error)
      toast({
        title: "Error",
        description: "Failed to save simulation setup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
    { id: "territorial", name: "Territorial Dispute", icon: "🗺️" },
    { id: "trade", name: "Trade War", icon: "💼" },
    { id: "cyber", name: "Cyber Attack", icon: "💻" },
    { id: "nuclear", name: "Nuclear Threat", icon: "☢️" },
    { id: "humanitarian", name: "Humanitarian Crisis", icon: "🏥" },
    { id: "resource", name: "Resource Conflict", icon: "⛽" },
    { id: "proxy", name: "Proxy War", icon: "🎭" },
    { id: "sanctions", name: "Economic Sanctions", icon: "🚫" },
    { id: "terrorist", name: "Terrorist Attack", icon: "💥" },
    { id: "other", name: "Other", icon: "❓" },
  ]

  const runSimulation = async () => {
    setIsSimulating(true)
    
    // Collect all analysis parameters
    const analysisData = {
      // Setup data
      selectedCountry,
      conflictScenario,
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
        summary: "Basic analysis provided due to technical issues."
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
    <div className="bg-dark-bg text-dark-text">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-flame rounded-lg flex items-center justify-center">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark-text">GioAdvisor</h1>
                <p className="text-sm text-dark-muted">Global Conflict Simulation Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-flame text-flame bg-transparent text-sm px-3 py-1">
                Beta v1.1
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 pb-96">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-dark-card border border-dark-border h-12">
            <TabsTrigger
              value="setup"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-base"
            >
              Setup Simulation
            </TabsTrigger>
            <TabsTrigger
              value="simulate"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-base"
            >
              Run Analysis
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
              Chat with AI
            </TabsTrigger>
          </TabsList>

                    {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Country Selection */}
              <Card className="border-dark-border bg-dark-card h-fit">
                <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10 py-4">
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

              {/* Conflict Scenario */}
              <Card className="border-dark-border bg-dark-card min-h-[600px] flex flex-col">
                <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10 py-4">
                  <CardTitle className="flex items-center space-x-3 text-dark-text text-lg">
                    <AlertTriangle className="w-5 h-5 text-flame" />
                    <span>Conflict Scenario</span>
                  </CardTitle>
                  <CardDescription className="text-dark-muted text-base">
                    Define the conflict situation to analyze
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4 flex-1">
                  <div>
                    <label className="text-base font-medium text-dark-text mb-3 block">Conflict Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {conflictTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant={conflictScenario === type.id ? "default" : "outline"}
                          className={`justify-start py-3 px-4 ${
                            conflictScenario === type.id
                              ? "bg-flame hover:bg-flame/90 text-white"
                              : "border-dark-border text-dark-text hover:bg-dark-border bg-transparent"
                          }`}
                          onClick={() => setConflictScenario(type.id)}
                        >
                          <span className="mr-3 text-lg">{type.icon}</span>
                          <span className="text-base">{type.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Offensive and Defensive Country Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium text-dark-text mb-3 block flex items-center">
                        <Sword className="w-5 h-5 mr-2 text-flame" />
                        Offensive Country
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
                        Defensive Country
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
                    <label className="text-base font-medium text-dark-text mb-3 block">Scenario Details</label>
                    <Textarea
                      placeholder="Describe the specific conflict scenario, involved parties, and key factors..."
                      className="min-h-[120px] bg-dark-bg border-dark-border text-dark-text placeholder:text-dark-muted text-base p-4"
                      value={scenarioDetails}
                      onChange={(e) => setScenarioDetails(e.target.value)}
                    />
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
                onClick={submitSetup}
                disabled={!selectedCountry || !conflictScenario || !offensiveCountry || !defensiveCountry || isSubmitting}
                className="bg-flame hover:bg-flame/90 text-white px-8 py-3 text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving Setup...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Save Simulation Setup
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Simulate Tab */}
          <TabsContent value="simulate" className="flex-1 min-h-0 flex flex-col mt-4">
            <Card className="border-dark-border bg-dark-card flex-1 min-h-0 flex flex-col">
              <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10 py-3 flex-shrink-0">
                <CardTitle className="flex items-center space-x-2 text-dark-text text-base">
                  <Target className="w-4 h-4 text-flame" />
                  <span>Advanced Parameters (Optional)</span>
                </CardTitle>
                <CardDescription className="text-dark-muted text-sm">
                  Configure advanced settings for your political simulation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-1 min-h-0 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-dark-text text-sm">Economic Factors</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-dark-muted">Trade Dependencies</label>
                            <span className="text-sm text-flame font-medium">{tradeDependencies[0]}%</span>
                          </div>
                          <Slider
                            value={tradeDependencies}
                            onValueChange={setTradeDependencies}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-dark-muted">Economic Sanctions Impact</label>
                            <span className="text-sm text-flame font-medium">{sanctionsImpact[0]}%</span>
                          </div>
                          <Slider
                            value={sanctionsImpact}
                            onValueChange={setSanctionsImpact}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-dark-muted">Market Stability</label>
                            <span className="text-sm text-flame font-medium">{marketStability[0]}%</span>
                          </div>
                          <Slider
                            value={marketStability}
                            onValueChange={setMarketStability}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-dark-text text-sm">Military Readiness</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-dark-muted">Defense Capabilities</label>
                            <span className="text-sm text-flame font-medium">{defenseCapabilities[0]}%</span>
                          </div>
                          <Slider
                            value={defenseCapabilities}
                            onValueChange={setDefenseCapabilities}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-dark-muted">Alliance Support</label>
                            <span className="text-sm text-flame font-medium">{allianceSupport[0]}%</span>
                          </div>
                          <Slider
                            value={allianceSupport}
                            onValueChange={setAllianceSupport}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-dark-muted">Strategic Resources</label>
                            <span className="text-sm text-flame font-medium">{strategicResources[0]}%</span>
                          </div>
                          <Slider
                            value={strategicResources}
                            onValueChange={setStrategicResources}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-dark-text text-sm">Diplomatic Relations</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-dark-muted">UN Support</label>
                            <span className="text-sm text-flame font-medium">{unSupport[0]}%</span>
                          </div>
                          <Slider
                            value={unSupport}
                            onValueChange={setUnSupport}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-dark-muted">Regional Influence</label>
                            <span className="text-sm text-flame font-medium">{regionalInfluence[0]}%</span>
                          </div>
                          <Slider
                            value={regionalInfluence}
                            onValueChange={setRegionalInfluence}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-dark-muted">Public Opinion</label>
                            <span className="text-sm text-flame font-medium">{publicOpinion[0]}%</span>
                          </div>
                          <Slider
                            value={publicOpinion}
                            onValueChange={setPublicOpinion}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conflict Overview */}
                  {offensiveCountry && defensiveCountry && (
                    <div className="p-3 bg-dark-border rounded-lg">
                      <h4 className="font-semibold text-dark-text mb-2 text-sm">Conflict Overview</h4>
                      <div className="flex items-center justify-center space-x-6">
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            <FlagIcon countryCode={offensiveCountry} className="w-8 h-6" />
                          </div>
                          <div className="text-xs text-dark-text font-medium">
                            {countries.find((c) => c.code === offensiveCountry)?.name}
                          </div>
                          <div className="text-xs text-flame">Offensive</div>
                        </div>
                        <div className="text-flame text-xl">⚔️</div>
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            <FlagIcon countryCode={defensiveCountry} className="w-8 h-6" />
                          </div>
                          <div className="text-xs text-dark-text font-medium">
                            {countries.find((c) => c.code === defensiveCountry)?.name}
                          </div>
                          <div className="text-xs text-flame">Defensive</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-dark-border flex-shrink-0">
                  <Button
                    onClick={resetValues}
                    variant="outline"
                    className="border-dark-border text-dark-text hover:bg-dark-border bg-transparent px-4 py-2"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Values
                  </Button>
                  
                  <Button
                    onClick={runSimulation}
                    disabled={!selectedCountry || !conflictScenario || isSimulating}
                    className="bg-flame hover:bg-flame/90 text-white px-6 py-2"
                  >
                    {isSimulating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        AI Analysis in Progress...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run AI Political Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                      <CardContent className="p-4">
                        <p className="text-dark-text leading-relaxed text-sm">{simulationResults.summary}</p>
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

                  {/* Analysis Chart */}
                  <Card className="border-dark-border bg-dark-card">
                    <CardHeader className="py-3">
                      <CardTitle className="flex items-center space-x-2 text-dark-text text-base">
                        <BarChart3 className="w-4 h-4 text-flame" />
                        <span>Response Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-dark-text">Diplomatic Approach</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={simulationResults.diplomaticResponse} className="w-24" />
                            <span className="text-sm text-flame">{simulationResults.diplomaticResponse}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-dark-text">Economic Measures</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={Math.abs(simulationResults.economicImpact) + 50} className="w-24" />
                            <span className="text-sm text-flame">{simulationResults.economicImpact}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-dark-text">Military Readiness</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={simulationResults.militaryReadiness} className="w-24" />
                            <span className="text-sm text-flame">{simulationResults.militaryReadiness}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-dark-text">Alliance Strength</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={simulationResults.allianceStrength} className="w-24" />
                            <span className="text-sm text-flame">{simulationResults.allianceStrength}%</span>
                          </div>
                        </div>
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
                      onClick={() => setActiveTab("simulate")}
                    >
                      Go to Simulation
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 min-h-0 mt-4">
            <Card className="border-dark-border bg-dark-card min-h-[600px] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10 py-4 flex-shrink-0">
                <CardTitle className="flex items-center space-x-3 text-dark-text text-lg">
                  <MessageCircle className="w-5 h-5 text-flame" />
                  <span>AI Political Advisor</span>
                </CardTitle>
                <CardDescription className="text-dark-muted text-base">
                  Ask questions and get advice about your current political simulation scenario
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex-1 min-h-0 flex flex-col">
                {/* Current Scenario Summary */}
                {selectedCountry && conflictScenario && (
                  <Card className="bg-dark-border mb-4 flex-shrink-0">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-dark-text mb-3 text-base">Current Scenario</h4>
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
                            <span className="text-dark-muted">Offensive Country: </span>
                            <span className="text-dark-text font-medium flex items-center gap-2">
                              <FlagIcon countryCode={offensiveCountry} className="w-6 h-4" />
                              {countries.find(c => c.code === offensiveCountry)?.name || offensiveCountry}
                            </span>
                          </div>
                        )}
                        {defensiveCountry && (
                          <div>
                            <span className="text-dark-muted">Defensive Country: </span>
                            <span className="text-dark-text font-medium flex items-center gap-2">
                              <FlagIcon countryCode={defensiveCountry} className="w-6 h-4" />
                              {countries.find(c => c.code === defensiveCountry)?.name || defensiveCountry}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Chat Messages */}
                <div className="flex-1 bg-dark-bg rounded-lg p-4 mb-4 overflow-y-auto min-h-0">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-dark-muted">
                      <div>
                        <MessageCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                        <p className="mb-3 font-medium text-base">Start a conversation with your AI Political Advisor</p>
                        <p className="text-base">Ask questions about your scenario, strategies, or get expert geopolitical advice</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-flame text-white'
                                : 'bg-dark-card border border-dark-border text-dark-text'
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-base">{message.content}</p>
                            <p className={`text-sm mt-2 opacity-70 ${
                              message.role === 'user' ? 'text-white' : 'text-dark-muted'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isChatting && (
                        <div className="flex justify-start">
                          <div className="bg-dark-card border border-dark-border text-dark-text p-4 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="animate-pulse text-base">AI is thinking...</div>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-flame"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-3 flex-shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isChatting) {
                        sendChatMessage()
                      }
                    }}
                    placeholder="Ask about strategies, consequences, alternatives..."
                    className="flex-1 px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-flame focus:border-transparent text-base"
                    disabled={isChatting}
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isChatting}
                    className="bg-flame hover:bg-flame/90 text-white px-6 py-3 text-base"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>

                {/* Quick Questions */}
                {chatMessages.length === 0 && selectedCountry && conflictScenario && (
                  <div className="mt-4 flex-shrink-0">
                    <h4 className="font-semibold text-dark-text mb-3 text-base">Quick Questions to Get Started:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        "What are the best diplomatic approaches for this scenario?",
                        "What are the potential economic consequences?", 
                        "How should we engage with our allies?",
                        "What are the main risks we should consider?"
                      ].map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setChatInput(question)}
                          className="justify-start text-left h-auto p-3 border-dark-border text-dark-text hover:bg-dark-border bg-transparent text-sm"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
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
