"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, Users, Target, BarChart3, Play, FileText, AlertTriangle, Sword, Shield, RotateCcw, MessageCircle, Send, Check, ChevronsUpDown, Settings, Loader2, Award, Calendar, Clock, File, Copy } from "lucide-react"
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
  
  // Briefing state
  const [briefingData, setBriefingData] = useState<any>(null)
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false)
  const [ragMetadata, setRagMetadata] = useState<any>(null)
  const [currentProgressStep, setCurrentProgressStep] = useState(0)
  const progressTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Cleanup function for progress timeouts
  const clearProgressTimeouts = () => {
    progressTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    progressTimeoutsRef.current = []
  }



  // Intelligence Sources state
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
    // Clear treaty results and briefing data
    setTreatyResults(null)
    setBriefingData(null)
    setRagMetadata(null)
    setSimulationResults(null)
    setCurrentProgressStep(0)
    clearProgressTimeouts()
    
    // Reset to setup tab when clearing
    setActiveTab("setup")
    
    toast({
      title: "Form Cleared",
      description: "All simulation setup, analysis parameters, briefing data, and treaty search have been reset.",
      variant: "default",
    })
  }

  // Handle tab changes with validation
  const handleTabChange = (value: string) => {
    // Prevent switching to briefing tabs if no briefing data exists
    if ((value === "results" || value === "chat") && !briefingData) {
      toast({
        title: "Briefing Required",
        description: "Please generate a briefing first to access this tab.",
        variant: "destructive",
      })
      return
    }
    setActiveTab(value)
  }

  // Generate briefing document
  const generateBriefing = async () => {
    if (!selectedCountry || !scenarioDetails) {
      toast({
        title: "Cannot Generate Briefing",
        description: "Please fill in all required fields before generating a briefing.",
        variant: "destructive",
      })
      return
    }
    
    setIsGeneratingBriefing(true)
    setCurrentProgressStep(0)
    
    // Immediately redirect to briefing page to show progress
    setActiveTab("results")
    
    // Start simulation and briefing in parallel for maximum speed
    const simulationPromise = !simulationResults ? 
      runSimulation(true).catch(error => {
        console.error('Failed to run simulation:', error)
        toast({
          title: "Analysis Warning", 
          description: "Unable to generate fresh analysis. AI will work with basic parameters.",
          variant: "destructive",
        })
        return null
      }) : Promise.resolve(simulationResults)
    
    // Clear any existing timeouts
    clearProgressTimeouts()
    
    // Start step progression with optimized timing for better perceived speed
    const stepDurations = [1500, 2500, 4000, 3500, 5000] // 5 timed steps, 6th completes with API - Total: 16.5s
    
    // Create timeouts for each step
    let cumulativeTime = 0
    stepDurations.forEach((duration, index) => {
      cumulativeTime += duration
      const timeout = setTimeout(() => {
        setCurrentProgressStep(index + 1)
      }, cumulativeTime)
      progressTimeoutsRef.current.push(timeout)
    })
    
    try {
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })

      // Wait for simulation to complete (running in parallel)
      const completedSimulation = await simulationPromise
      
      // Update simulation results if we got new ones
      if (completedSimulation && completedSimulation !== simulationResults) {
        setSimulationResults(completedSimulation)
      }
      
      // Pre-compute country names and start briefing call earlier for better performance
      const selectedCountryName = countries.find(c => c.code === selectedCountry)?.name || selectedCountry
      const offensiveCountryName = countries.find(c => c.code === offensiveCountry)?.name || offensiveCountry  
      const defensiveCountryName = countries.find(c => c.code === defensiveCountry)?.name || defensiveCountry
      
      console.log('🚀 Starting briefing generation with optimized flow...')
      const briefingResponse = await fetch('/api/briefing/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: currentDate,
          scenario: scenarioDetails,
          simulationResults: completedSimulation || simulationResults,
          selectedCountry: selectedCountryName,
          offensiveCountry: offensiveCountryName,
          defensiveCountry: defensiveCountryName,
          severityLevel,
          timeFrame
        }),
      })
      
      const briefingResult = await briefingResponse.json()
      
      if (briefingResult.success) {
        // Complete the final step
        setCurrentProgressStep(5) // Last step (index 5)
        
        setBriefingData(briefingResult.briefing)
        setRagMetadata(briefingResult.metadata)
        
        const isRAGGenerated = briefingResult.metadata?.ragGenerated
        const treatiesCount = briefingResult.metadata?.treatiesAnalyzed || 0
        const processingTime = briefingResult.metadata?.processingTime || 0
        
        if (isRAGGenerated) {
          const ragasMetrics = briefingResult.metadata?.ragasMetrics
          const faithfulness = ragasMetrics ? (ragasMetrics.faithfulness * 100).toFixed(0) : 'N/A'
          const relevancy = ragasMetrics ? (ragasMetrics.answerRelevancy * 100).toFixed(0) : 'N/A'
          
      toast({
            title: "✅ RAG Intelligence Briefing Complete",
            description: `Analyzed ${treatiesCount} treaties in ${Math.round(processingTime/1000)}s (RAGAS: Faithfulness:${faithfulness}% Relevancy:${relevancy}%)`,
        variant: "default",
          })
        } else {
          toast({
            title: "⚠️ Standard AI Briefing Generated",
            description: "RAG system unavailable. Generated standard briefing without treaty analysis.",
            variant: "destructive",
          })
        }
      } else {
        // Generate fallback briefing
        setBriefingData({
          date: currentDate,
          title: `Proposed Plan of Action - ${scenarioDetails.slice(0, 50)}${scenarioDetails.length > 50 ? '...' : ''}`,
          sections: [
            {
              point: "(a)",
              content: `Intelligence assessments indicate heightened military tensions involving ${countries.find(c => c.code === offensiveCountry)?.name || offensiveCountry} and ${countries.find(c => c.code === defensiveCountry)?.name || defensiveCountry}, with ${countries.find(c => c.code === selectedCountry)?.name || selectedCountry} strategic interests directly impacted by potential escalation scenarios.`
            },
            {
              point: "(b)", 
              content: `Analysis of regional force deployments and communication intercepts suggest significant military preparations during the current ${timeFrame} timeframe, with severity assessed at ${severityLevel} level.`
            },
            {
              point: "(c)",
              content: `Current diplomatic initiatives have achieved limited success, with international response coordination showing ${simulationResults.diplomaticResponse || 65}% effectiveness in de-escalation efforts.`
            },
            {
              point: "(d)",
              content: `Economic and alliance factors indicate that standard containment strategies may prove insufficient given the current threat level and regional stability considerations.`
            }
          ],
          recommendations: [
            "Immediate deployment of enhanced intelligence collection assets to monitor military movements and communication channels in the affected region.",
            "Coordination with allied nations to establish unified response protocols and information sharing agreements through established intelligence partnerships.",
            "Implementation of graduated economic and diplomatic pressure measures through appropriate international organizations and bilateral channels.",
            "Preparation of contingency response plans for multiple escalation scenarios while maintaining strategic deterrent capabilities and force readiness."
          ],
          conclusion: `The above assessments lead to the conclusion that without immediate strategic action, the situation may evolve into a more complex and dangerous conflict. Therefore, implementation of the above recommendations is advised to address both immediate tactical concerns and long-term strategic stability objectives.`,
          classification: "CONFIDENTIAL",
          author: "Strategic Assessment Division"
        })
        
        toast({
          title: "⚠️ Fallback Briefing Generated",
          description: "AI generation failed. Generated emergency briefing template.",
          variant: "destructive",
        })
        // Don't redirect for fallback briefings
      }
    } catch (error) {
      console.error('Briefing generation error:', error)
      
      // Always provide a fallback briefing
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      setBriefingData({
        date: currentDate,
        title: `Intelligence Assessment - ${scenarioDetails.slice(0, 50)}${scenarioDetails.length > 50 ? '...' : ''}`,
        sections: [
          {
            point: "(a)",
            content: `Current threat assessment indicates elevated risk factors in the specified regional conflict zone affecting ${countries.find(c => c.code === selectedCountry)?.name || selectedCountry} strategic interests.`
          },
          {
            point: "(b)",
            content: `Intelligence reports suggest significant military and political developments requiring immediate attention from national security apparatus.`
          },
          {
            point: "(c)",
            content: `Analysis indicates that standard diplomatic protocols may be insufficient to address the scope of the current crisis without enhanced strategic coordination.`
          },
          {
            point: "(d)",
            content: `Strategic recommendations require implementation of enhanced security measures and coalition building initiatives to maintain regional stability.`
          }
        ],
        recommendations: [
          "Deploy enhanced intelligence assets to monitor regional developments and threat indicators with immediate effect.",
          "Coordinate with allied nations to establish unified response protocols and information sharing agreements.",
          "Implement economic and diplomatic pressure through appropriate international channels and multilateral organizations.",
          "Prepare contingency plans for escalation scenarios while maintaining deterrent capabilities and diplomatic engagement."
        ],
        conclusion: `Based on the current intelligence assessment, immediate action is recommended to address the evolving security situation and prevent further destabilization of the regional balance of power.`,
        classification: "CONFIDENTIAL", 
        author: "Intelligence Analysis Team"
      })
      
      toast({
        title: "💥 Critical System Error",
        description: "Complete briefing generation failure. Contact technical support immediately.",
        variant: "destructive",
      })
      // Don't redirect on critical errors
    }
    
    setIsGeneratingBriefing(false)
    setCurrentProgressStep(0)
    clearProgressTimeouts()
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

  const runSimulation = async (skipRedirect = false) => {
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
        
        if (!skipRedirect) {
        toast({
          title: "AI Analysis Complete",
          description: "Your simulation has been analyzed using advanced AI. You are now redirected to the results page.",
          variant: "default",
        })
        
        // Redirect to View Results tab
        setActiveTab("results")
        }
      } else {
        // Use fallback results if AI analysis fails
        setSimulationResults(aiResult.analysis)
        
        if (!skipRedirect) {
        toast({
          title: "Analysis Complete",
          description: "Showing fallback analysis due to AI service issues. Redirecting to results...",
          variant: "destructive",
        })
        
        // Redirect to View Results tab even with fallback
        setActiveTab("results")
        }
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
      
      if (!skipRedirect) {
      toast({
        title: "Analysis Warning",
        description: "AI analysis unavailable. Showing basic recommendations. Redirecting to results...",
        variant: "destructive",
      })
      
      // Redirect to View Results tab even with basic results
      setActiveTab("results")
      }
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
                <p className="text-sm text-dark-muted">Military Intelligence BriefingPlatform</p>
              </div>
            </div>
            
            
            
            <div className="flex items-center justify-end space-x-4 flex-1">
              
              <Badge variant="outline" className="border-flame text-flame bg-transparent text-sm px-3 py-1">
                Beta v1.4
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 pb-12 lg:pb-96 flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-dark-card border border-dark-border h-12">
            <TabsTrigger
              value="setup"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-base"
            >
              Setup Simulation
            </TabsTrigger>

            <TabsTrigger
              value="results"
              disabled={!briefingData}
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Intelligence Briefing
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              disabled={!briefingData}
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Intelligence Sources
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
                        <span>Your Country: </span>
                        <FlagIcon countryCode={selectedCountry} className="w-6 h-4" />
                        <span>{selectedCountry} </span>
                      </h4>
                      {/* <div className="space-y-2 text-sm">
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
                      </div> */}
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
                onClick={generateBriefing}
                disabled={!selectedCountry || !offensiveCountry || !defensiveCountry || !scenarioDetails.trim() || isGeneratingBriefing}
                className="bg-flame hover:bg-flame/90 text-white px-8 py-3 text-base"
              >
                {isGeneratingBriefing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Briefing...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate Briefing
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Intelligence Sources Tab */}
          <TabsContent value="chat" className="flex-1 min-h-0 mt-4">
            <div className="h-full overflow-y-auto">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-6 h-6 text-flame" />
                <h2 className="text-2xl font-bold text-dark-text">Intelligence Sources</h2>
                    </div>

              {ragMetadata?.ragGenerated ? (
                <div className="space-y-6">
                  {/* Main Intelligence Analysis Card */}
                  <Card className="border-dark-border bg-dark-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-dark-text">RAG Analysis Overview</h3>
                    </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 bg-dark-border/20 rounded-lg">
                          <div className="text-2xl font-bold text-flame">{ragMetadata.treatiesAnalyzed}</div>
                          <div className="text-sm text-dark-muted mt-1">Treaties Analyzed</div>
                          </div>
                        <div className="text-center p-4 bg-dark-border/20 rounded-lg">
                          <div className="text-sm font-bold text-flame">
                            Faithfulness: {ragMetadata.ragasMetrics ? (ragMetadata.ragasMetrics.faithfulness * 100).toFixed(0) : 'N/A'}% 
                            Relevancy: {ragMetadata.ragasMetrics ? (ragMetadata.ragasMetrics.answerRelevancy * 100).toFixed(0) : 'N/A'}%
                        </div>
                          <div className="text-sm text-dark-muted mt-1">RAGAS Metrics</div>
                          </div>
                        <div className="text-center p-4 bg-dark-border/20 rounded-lg">
                          <div className="text-2xl font-bold text-flame">{(ragMetadata.processingTime / 1000).toFixed(1)}s</div>
                          <div className="text-sm text-dark-muted mt-1">Processing Time</div>
                    </div>
                  </div>

                      {/* AI Reasoning */}
                      {ragMetadata.aiReasoning && (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-dark-text mb-3">AI System Reasoning</h4>
                          <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
                            <p className="text-dark-muted text-sm leading-relaxed">{ragMetadata.aiReasoning}</p>
                      </div>
                    </div>
                  )}

                      {/* Legal Implications */}
                      {ragMetadata.legalImplications && (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-dark-text mb-3">Legal Implications</h4>
                          <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
                            <div 
                              className="text-dark-muted text-sm leading-relaxed prose prose-sm prose-invert max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: ragMetadata.legalImplications
                                  .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-dark-text mb-2 mt-4">$1</h3>')
                                  .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-dark-text mb-3 mt-4">$1</h2>')
                                  .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-dark-text mb-4 mt-4">$1</h1>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/\n\n/g, '</p><p>')
                                  .replace(/\n/g, '<br/>')
                                  .replace(/^(.*)$/, '<p>$1</p>')
                                  .replace(/<p><\/p>/g, '')
                                  .replace(/^\d+\.\s/gm, '<strong>$&</strong>')
                                  .replace(/^-\s/gm, '• ')
                              }}
                            />
                </div>
                        </div>
                      )}
              </CardContent>
            </Card>

                  {/* Retrieved Treaties */}
                  {ragMetadata.retrievedTreaties && ragMetadata.retrievedTreaties.length > 0 && (
                    <Card className="border-dark-border bg-dark-card">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-dark-text mb-4">Key Treaties Referenced</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {ragMetadata.retrievedTreaties.map((treaty: any, index: number) => (
                            <Card key={index} className="bg-dark-bg border-dark-border">
                      <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-dark-text text-sm leading-snug" title={treaty.title}>
                                    {treaty.title}
                                  </h4>

                                </div>
                                <p className="text-dark-muted text-xs mb-3 leading-relaxed">
                                  <span className="font-medium">Relevance:</span> {treaty.relevance}
                                </p>
                                <div className="pt-2 border-t border-dark-border">
                                  <a 
                                    href={`https://www.google.com/search?q="${encodeURIComponent(treaty.title)}"+UN+treaty+filetype:pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-flame hover:text-flame/80 text-xs font-medium underline flex items-center gap-1"
                                  >
                                    🔍 Search PDF
                                  </a>
                                </div>
                      </CardContent>
                    </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Legal Analysis Summary */}
                  {briefingData?.legalAnalysis && (
                    <Card className="border-dark-border bg-dark-card">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-dark-text mb-4">Legal Framework Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {briefingData.legalAnalysis.applicableTreaties && briefingData.legalAnalysis.applicableTreaties.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-dark-text mb-2">Applicable Treaties</h4>
                              <ul className="text-dark-muted text-sm space-y-1">
                                {briefingData.legalAnalysis.applicableTreaties.map((treaty: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-flame mr-2">•</span>
                                    {treaty}
                                  </li>
                                ))}
                              </ul>
                  </div>
                          )}
                          
                          {briefingData.legalAnalysis.legalObligations && briefingData.legalAnalysis.legalObligations.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-dark-text mb-2">Legal Obligations</h4>
                              <ul className="text-dark-muted text-sm space-y-1">
                                {briefingData.legalAnalysis.legalObligations.map((obligation: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-flame mr-2">•</span>
                                    {obligation}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {briefingData.legalAnalysis.permissibleActions && briefingData.legalAnalysis.permissibleActions.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-dark-text mb-2">Permissible Actions</h4>
                              <ul className="text-dark-muted text-sm space-y-1">
                                {briefingData.legalAnalysis.permissibleActions.map((action: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                      </div>
                          )}
                          
                          {briefingData.legalAnalysis.constraints && briefingData.legalAnalysis.constraints.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-dark-text mb-2">Legal Constraints</h4>
                              <ul className="text-dark-muted text-sm space-y-1">
                                {briefingData.legalAnalysis.constraints.map((constraint: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-red-500 mr-2">⚠</span>
                                    {constraint}
                                  </li>
                                ))}
                              </ul>
                          </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                  )}
                </div>
              ) : (
                <Card className="border-dark-border bg-dark-card">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-dark-muted" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-text mb-2">No Intelligence Sources Available</h3>
                    <p className="text-dark-muted mb-6">
                      Generate a briefing to view detailed intelligence sources and treaty analysis
                    </p>
                    <Button
                      variant="outline"
                      className="border-flame text-flame hover:bg-flame hover:text-white bg-transparent"
                      onClick={() => setActiveTab("setup")}
                    >
                      Return to Setup
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="flex-1 min-h-0 mt-4">
            <div className="h-full overflow-y-auto">
              <div className="flex items-center space-x-3 mb-6">
                <File className="w-6 h-6 text-flame" />
                <h2 className="text-2xl font-bold text-dark-text">Intelligence Briefing</h2>
                        </div>

              {isGeneratingBriefing ? (
                <Card className="border-dark-border bg-dark-card max-w-5xl mx-auto">
                  <CardContent className="p-12 text-center">
                    <div className="space-y-6">
                      {/* Main Loading Animation */}
                      <div className="w-24 h-24 bg-flame/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-flame"></div>
                        </div>

                      {/* Progress Title */}
                      <h3 className="text-2xl font-bold text-dark-text mb-4">
                        Generating RAG Intelligence Briefing
                      </h3>

                      {/* Progress Steps */}
                      <div className="space-y-4 max-w-2xl mx-auto">
                        {[
                          "Loading treaty database (643 documents)",
                          "Processing scenario context and parameters", 
                          "Generating semantic embeddings",
                          "Retrieved relevant treaties",
                          "Analyzing legal implications",
                          "Generating strategic options"
                        ].map((stepName, index) => {
                          const isCompleted = currentProgressStep > index
                          const isActive = currentProgressStep === index
                          const isPending = currentProgressStep < index
                          
                          return (
                            <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                              isActive ? 'bg-flame/20 border border-flame/30' : 
                              isCompleted ? 'bg-green-500/20 border border-green-500/30' :
                              'bg-dark-bg border border-dark-border'
                            }`}>
                              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                                isActive ? 'animate-pulse bg-flame' :
                                isCompleted ? 'bg-green-500' :
                                'bg-dark-muted'
                              }`}></div>
                              <span className={`font-medium transition-all duration-500 ${
                                isActive ? 'text-flame' :
                                isCompleted ? 'text-green-400' :
                                'text-dark-muted'
                              }`}>
                                {stepName}
                          </span>
                              {isActive && (
                                <div className="ml-auto flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-flame border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-flame text-xs font-medium">Processing...</span>
                        </div>
                              )}
                              {isCompleted && (
                                <div className="ml-auto">
                                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 text-white text-xs">✓</div>
                          </div>
                      </div>
                              )}
                        </div>
                          )
                        })}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-dark-border rounded-full h-2 mt-8">
                        <div 
                          className="bg-flame h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{width: `${Math.min(((currentProgressStep + 1) / 6) * 100, 100)}%`}}
                        ></div>
                    </div>
                      
                      {/* Step Counter */}
                      <div className="text-center mt-2">
                        <span className="text-flame font-medium text-sm">
                          Step {currentProgressStep + 1} of 6
                                </span>
                          </div>
                          
                      {/* Estimated Time */}
                      <p className="text-dark-muted text-sm mt-4">
                        ⏱️ Estimated processing time: 30-60 seconds
                      </p>
                      <p className="text-dark-muted text-xs">
                        Please remain on this page while the AI analyzes international treaties
                              </p>
                            </div>
                  </CardContent>
                </Card>
              ) : briefingData ? (
                <Card className="border-dark-border bg-dark-card max-w-5xl mx-auto">
                  <CardContent className="p-8">
                    {/* Briefing Header */}
                    <div className="text-center mb-8 border-b border-dark-border pb-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="border-flame text-flame bg-transparent text-xs font-mono">
                          {briefingData.classification}
                                    </Badge>
                        <div className="text-right text-dark-muted text-sm font-mono">
                          <p>{briefingData.date}</p>
                          <p>{briefingData.author}</p>
                                  </div>
                                </div>
                      <h3 className="text-lg font-bold text-dark-text mb-2 text-left font-mono">
                        {briefingData.title}
                      </h3>
                              </div>



                    {/* Brief Introduction */}
                    <div className="mb-6 font-mono text-sm">
                      <p className="text-dark-text leading-relaxed text-justify">
                        The following intelligence assessment identifies four critical factors (a-d) requiring immediate policy consideration regarding the current crisis situation:
                      </p>
                                  </div>

                    {/* Intelligence Assessment Header */}
                    <div className="mb-4 font-mono">
                      <h4 className="text-md font-bold text-dark-text underline">INTELLIGENCE ASSESSMENT</h4>
                                      </div>

                    {/* Briefing Sections */}
                    <div className="space-y-6 mb-8 font-mono text-sm">
                      <div className="text-dark-text leading-relaxed">
                        <div className="space-y-4 ml-6">
                          {briefingData.sections.map((section: any, index: number) => (
                            <div key={index} className="flex text-justify">
                              <span className="font-bold mr-3 min-w-[30px] flex-shrink-0">{section.point}</span>
                              <p className="leading-relaxed">
                                {section.content}
                              </p>
                                      </div>
                          ))}
                                  </div>
                                    </div>

                      {/* Strategic Assessment Header */}
                      <div className="mt-8 pt-6 border-t border-dark-border">
                        <div className="mb-4 font-mono">
                          <h4 className="text-md font-bold text-dark-text underline">STRATEGIC ASSESSMENT</h4>
                                    </div>
                        <p className="text-dark-text leading-relaxed text-justify mb-6">
                          {briefingData.conclusion}
                        </p>
                                    </div>

                      {/* Recommended Actions Header */}
                      <div className="mt-6">
                        <div className="mb-4 font-mono">
                          <h4 className="text-md font-bold text-dark-text underline">RECOMMENDED ACTIONS</h4>
                                    </div>
                        <div className="space-y-4">
                          {briefingData.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex text-justify">
                              <span className="font-bold mr-3 min-w-[30px] flex-shrink-0">({index + 1})</span>
                              <p className="text-dark-text leading-relaxed">
                                {rec}
                              </p>
                                    </div>
                          ))}
                                  </div>
                                </div>

                      {/* Final Recommendation */}
                      {briefingData.finalRecommendation && (
                        <div className="mt-8 pt-6 border-t border-dark-border">
                          <div className="mb-4 font-mono">
                            <h4 className="text-md font-bold text-dark-text underline">PRIORITY RECOMMENDATION</h4>
                                    </div>
                          <p className="text-dark-text leading-relaxed text-justify font-medium">
                            {briefingData.finalRecommendation}
                          </p>
                                    </div>
                      )}
                                  </div>

                    {/* Signature Block */}
                    <div className="mt-8 pt-6 border-t border-dark-border text-right font-mono">
                      <p className="text-dark-muted text-sm">
                        {briefingData.author}
                      </p>
                      <p className="text-dark-muted text-xs mt-1">
                        Generated: {new Date().toLocaleTimeString()}
                      </p>
                                </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-dark-border">
                      <Button
                        variant="outline"
                        className="border-flame text-flame hover:bg-flame hover:text-white bg-transparent"
                        onClick={() => {
                          const printWindow = window.open('', '_blank')
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Intelligence Briefing</title>
                                  <style>
                                    body { font-family: 'Courier New', monospace; margin: 2cm; line-height: 1.8; font-size: 12px; }
                                    .classification { float: left; font-weight: bold; font-size: 10px; }
                                    .date { float: right; font-size: 10px; }
                                    .title { font-weight: bold; margin: 2em 0 1em 0; font-size: 14px; }
                                    .section { margin: 1em 0; text-align: justify; }
                                    .point { font-weight: bold; display: inline-block; width: 30px; vertical-align: top; }
                                    .conclusion { margin: 2em 0; text-align: justify; }
                                    .recommendations { margin: 1em 0; }
                                    .signature { text-align: right; margin-top: 3em; font-size: 10px; }
                                  </style>
                                </head>
                                <body>${briefingData ? `
                                  <div class="classification">${briefingData.classification}</div>
                                  <div class="date">${briefingData.date}<br/>${briefingData.author}</div>
                                  <div style="clear: both;"></div>
                                  <div class="title">${briefingData.title}</div>
                                  ${briefingData.sections.map((s: any) => `
                                    <div class="section">
                                      <span class="point">${s.point}</span>${s.content}
                                </div>
                                  `).join('')}
                                  <div class="conclusion">${briefingData.conclusion}</div>
                                  <p><strong>Therefore it seems to me a more aggressive action is indicated than any heretofore considered, and should be patterned along the following lines:</strong></p>
                                  <div class="recommendations">
                                    ${briefingData.recommendations.map((r: string, i: number) => `
                                      <div class="section">
                                        <span class="point">(${i + 1})</span>${r}
                              </div>
                                    `).join('')}
                            </div>
                                  <div class="signature">
                                    <p>${briefingData.author}</p>
                                    <p>Generated: ${new Date().toLocaleString()}</p>
                        </div>
                                ` : ''}</body>
                              </html>
                            `)
                            printWindow.document.close()
                            printWindow.print()
                          }
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Print Briefing
                      </Button>
                      <Button
                        variant="outline"
                        className="border-flame text-flame hover:bg-flame hover:text-white bg-transparent"
                        onClick={() => {
                          const briefingText = `
${briefingData.classification}
${briefingData.date}

${briefingData.title}

${briefingData.sections.map((s: any) => `${s.point} ${s.content}`).join('\n\n')}

${briefingData.conclusion}

Therefore it seems to me a more aggressive action is indicated than any heretofore considered, and should be patterned along the following lines:

${briefingData.recommendations.map((r: string, i: number) => `(${i + 1}) ${r}`).join('\n\n')}

${briefingData.author}
Generated: ${new Date().toLocaleString()}
                          `
                          navigator.clipboard.writeText(briefingText.trim())
                          toast({
                            title: "Briefing Copied",
                            description: "The briefing text has been copied to your clipboard.",
                            variant: "default",
                          })
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                        </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dark-border bg-dark-card">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
                      <File className="w-8 h-8 text-dark-muted" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-text mb-2">No Briefing Generated</h3>
                    <p className="text-dark-muted mb-6">
                      Complete a simulation and generate an intelligence briefing for formal documentation
                    </p>
                    <Button
                      variant="outline"
                      className="border-flame text-flame hover:bg-flame hover:text-white bg-transparent"
                      onClick={generateBriefing}
                      disabled={!simulationResults}
                    >
                      Generate Briefing Document
                    </Button>
              </CardContent>
            </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
