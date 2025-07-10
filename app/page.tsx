"use client"

import { useState, useEffect } from "react"
import { Globe, Users, Target, BarChart3, Play, FileText, AlertTriangle, Sword, Shield, RotateCcw, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

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
        description: "Simulation setup saved!",
        variant: "default",
      })
      
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
          description: "Your simulation has been analyzed using advanced AI.",
          variant: "default",
        })
      } else {
        // Use fallback results if AI analysis fails
        setSimulationResults(aiResult.analysis)
        toast({
          title: "Analysis Complete",
          description: "Showing fallback analysis due to AI service issues.",
          variant: "destructive",
        })
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
        description: "AI analysis unavailable. Showing basic recommendations.",
        variant: "destructive",
      })
    }

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
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="setup" className="space-y-6">
                          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-dark-card border border-dark-border">
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
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text"
            >
              Chat with AI
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
                      {selectedCountry ? (
                        <div className="flex items-center space-x-2">
                          <span>{countries.find((c) => c.code === selectedCountry)?.flag}</span>
                          <span>{countries.find((c) => c.code === selectedCountry)?.name}</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Choose a country..." />
                      )}
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
                      <h4 className="font-semibold text-dark-text mb-2 flex items-center space-x-2">
                        <span>{countries.find((c) => c.code === selectedCountry)?.flag}</span>
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
                          {offensiveCountry ? (
                            <div className="flex items-center space-x-2">
                              <span>{countries.find((c) => c.code === offensiveCountry)?.flag}</span>
                              <span>{countries.find((c) => c.code === offensiveCountry)?.name}</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Select aggressor..." />
                          )}
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
                          {defensiveCountry ? (
                            <div className="flex items-center space-x-2">
                              <span>{countries.find((c) => c.code === defensiveCountry)?.flag}</span>
                              <span>{countries.find((c) => c.code === defensiveCountry)?.name}</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Select defender..." />
                          )}
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
                      value={scenarioDetails}
                      onChange={(e) => setScenarioDetails(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dark-text mb-2 block">Severity Level</label>
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
                      <label className="text-sm font-medium text-dark-text mb-2 block">Time Frame</label>
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
              
            <div className="flex justify-between mt-8">
              <Button
                onClick={clearForm}
                variant="outline"
                className="border-dark-border text-dark-text hover:bg-dark-border bg-transparent px-6 py-3 text-lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Clear All Fields
              </Button>
              
              <Button
                onClick={submitSetup}
                disabled={!selectedCountry || !conflictScenario || !offensiveCountry || !defensiveCountry || isSubmitting}
                className="bg-flame hover:bg-flame/90 text-white px-8 py-3 text-lg"
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
                    <div className="space-y-4">
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

                  <div className="space-y-4">
                    <h4 className="font-semibold text-dark-text">Military Readiness</h4>
                    <div className="space-y-4">
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

                  <div className="space-y-4">
                    <h4 className="font-semibold text-dark-text">Diplomatic Relations</h4>
                    <div className="space-y-4">
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

                <div className="flex justify-between items-center pt-6">
                  <Button
                    onClick={resetValues}
                    variant="outline"
                    className="border-dark-border text-dark-text hover:bg-dark-border bg-transparent px-6 py-3 text-lg"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset Values
                  </Button>
                  
                  <Button
                    onClick={runSimulation}
                    disabled={!selectedCountry || !conflictScenario || isSimulating}
                    className="bg-flame hover:bg-flame/90 text-white px-8 py-3 text-lg"
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {simulationResults ? (
              <div className="grid gap-6">
                {/* AI Summary */}
                {simulationResults.summary && (
                  <Card className="border-dark-border bg-dark-card">
                    <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10">
                      <CardTitle className="flex items-center space-x-2 text-dark-text">
                        <Target className="w-5 h-5 text-flame" />
                        <span>AI Analysis Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-dark-text text-lg leading-relaxed">{simulationResults.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Key Metrics */}
                <div className="grid md:grid-cols-5 gap-4">
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

                  <Card className="border-dark-border bg-dark-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-flame mb-2">{simulationResults.allianceStrength}%</div>
                      <div className="text-sm text-dark-muted">Alliance Strength</div>
                      <Progress value={simulationResults.allianceStrength} className="mt-2" />
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
                          <Progress value={simulationResults.diplomaticResponse} className="w-32" />
                          <span className="text-sm text-flame">{simulationResults.diplomaticResponse}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-dark-text">Economic Measures</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={Math.abs(simulationResults.economicImpact) + 50} className="w-32" />
                          <span className="text-sm text-flame">{simulationResults.economicImpact}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-dark-text">Military Readiness</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={simulationResults.militaryReadiness} className="w-32" />
                          <span className="text-sm text-flame">{simulationResults.militaryReadiness}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-dark-text">Alliance Strength</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={simulationResults.allianceStrength} className="w-32" />
                          <span className="text-sm text-flame">{simulationResults.allianceStrength}%</span>
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

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="border-dark-border bg-dark-card">
              <CardHeader className="bg-gradient-to-r from-flame/20 to-flame/10">
                <CardTitle className="flex items-center space-x-2 text-dark-text">
                  <MessageCircle className="w-5 h-5 text-flame" />
                  <span>AI Political Advisor</span>
                </CardTitle>
                <CardDescription className="text-dark-muted">
                  Ask questions and get advice about your current political simulation scenario
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Current Scenario Summary */}
                {selectedCountry && conflictScenario && (
                  <Card className="bg-dark-border mb-6">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-dark-text mb-2">Current Scenario</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-dark-muted">Your Country: </span>
                          <span className="text-flame font-medium">
                            {countries.find(c => c.code === selectedCountry)?.flag} {countries.find(c => c.code === selectedCountry)?.name || selectedCountry}
                          </span>
                        </div>
                        <div>
                          <span className="text-dark-muted">Scenario: </span>
                          <span className="text-dark-text font-medium">{conflictScenario}</span>
                        </div>
                        {offensiveCountry && (
                          <div>
                            <span className="text-dark-muted">Offensive Country: </span>
                            <span className="text-dark-text font-medium">
                              {countries.find(c => c.code === offensiveCountry)?.flag} {countries.find(c => c.code === offensiveCountry)?.name || offensiveCountry}
                            </span>
                          </div>
                        )}
                        {defensiveCountry && (
                          <div>
                            <span className="text-dark-muted">Defensive Country: </span>
                            <span className="text-dark-text font-medium">
                              {countries.find(c => c.code === defensiveCountry)?.flag} {countries.find(c => c.code === defensiveCountry)?.name || defensiveCountry}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Chat Messages */}
                <div className="h-96 bg-dark-bg rounded-lg p-4 mb-4 overflow-y-auto space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-dark-muted py-16">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Start a conversation with your AI Political Advisor</p>
                      <p className="text-sm">Ask questions about your scenario, strategies, or get expert geopolitical advice</p>
                    </div>
                  ) : (
                    chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-flame text-white'
                              : 'bg-dark-card border border-dark-border text-dark-text'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-2 opacity-70 ${
                            message.role === 'user' ? 'text-white' : 'text-dark-muted'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {isChatting && (
                    <div className="flex justify-start">
                      <div className="bg-dark-card border border-dark-border text-dark-text p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse">AI is thinking...</div>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-flame"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
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
                    className="flex-1 px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-flame focus:border-transparent"
                    disabled={isChatting}
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isChatting}
                    className="bg-flame hover:bg-flame/90 text-white px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>

                {/* Quick Questions */}
                {chatMessages.length === 0 && selectedCountry && conflictScenario && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-dark-text mb-3">Quick Questions to Get Started:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
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
                          className="justify-start text-left h-auto p-3 border-dark-border text-dark-text hover:bg-dark-border bg-transparent"
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
