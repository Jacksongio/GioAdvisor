"use client"

import { useState, useEffect, useRef } from "react"
import { Users, Target, BarChart3, Play, FileText, AlertTriangle, Sword, Shield, RotateCcw, MessageCircle, Send, Check, ChevronsUpDown, Settings, Loader2, Award, Calendar, Clock, File, Copy } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { FlagIcon } from "@/components/ui/flag-icon"
import { useIsMobile } from "@/components/ui/use-mobile"
import LandingPage from "@/components/LandingPage"

export default function PoliticalAdvisor() {
  const [showLanding, setShowLanding] = useState(true)
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
  const isMobile = useIsMobile()
  
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
  
  // Mobile search states
  const [selectedCountrySearch, setSelectedCountrySearch] = useState("")
  const [offensiveCountrySearch, setOffensiveCountrySearch] = useState("")
  const [defensiveCountrySearch, setDefensiveCountrySearch] = useState("")

  // Filter countries based on search
  const filterCountries = (searchTerm: string, excludeCountries: string[] = []) => {
    return countries.filter(country => 
      !excludeCountries.includes(country.code) &&
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }
  
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

  // Example questions that auto-fill all fields
  const exampleQuestions = [
    {
      title: "Atlantic Space Port Rivalry",
      description: "Competitive space launch facility expansion",
      selectedCountry: "GB",
      offensiveCountry: "FR",
      defensiveCountry: "GB",
      conflictScenario: "Naval Expansion",
      scenarioDetails: "France deploys advanced naval assets to secure exclusive Atlantic launch corridors for their expanding space program, challenging British satellite deployment zones and threatening UK space industry competitiveness.",
      severityLevel: "high",
      timeFrame: "long",
      tradeDependencies: 75,
      sanctionsImpact: 85,
      marketStability: 30,
      defenseCapabilities: 65,
      allianceSupport: 90,
      strategicResources: 55
    },
    {
      title: "Alpine Energy Corridor Dispute",
      description: "Strategic pipeline route disagreement",
      selectedCountry: "IT",
      offensiveCountry: "DE",
      defensiveCountry: "IT",
      conflictScenario: "Territorial Dispute",
      scenarioDetails: "Germany establishes new energy infrastructure routes through disputed Alpine regions, challenging Italian territorial claims and prompting EU mediation responses in the area.",
      severityLevel: "extreme",
      timeFrame: "medium",
      tradeDependencies: 90,
      sanctionsImpact: 95,
      marketStability: 20,
      defenseCapabilities: 70,
      allianceSupport: 85,
      strategicResources: 80
    },
    {
      title: "Baltic Energy Infrastructure",
      description: "Critical pipeline security concerns",
      selectedCountry: "FI",
      offensiveCountry: "RU",
      defensiveCountry: "FI",
      conflictScenario: "Proxy Warfare",
      scenarioDetails: "Russian-backed groups target energy infrastructure in the Baltic region while Russia threatens direct intervention if Finland strengthens NATO cooperation.",
      severityLevel: "high",
      timeFrame: "medium",
      tradeDependencies: 60,
      sanctionsImpact: 70,
      marketStability: 40,
      defenseCapabilities: 85,
      allianceSupport: 80,
      strategicResources: 65
    },
    {
      title: "India-Pakistan Border Conflict",
      description: "Kashmir region military escalation",
      selectedCountry: "IN",
      offensiveCountry: "PK",
      defensiveCountry: "IN",
      conflictScenario: "Border Conflict",
      scenarioDetails: "Pakistan-backed militants cross the Line of Control, prompting Indian military response and raising nuclear escalation concerns.",
      severityLevel: "extreme",
      timeFrame: "immediate",
      tradeDependencies: 45,
      sanctionsImpact: 50,
      marketStability: 35,
      defenseCapabilities: 80,
      allianceSupport: 60,
      strategicResources: 70
    },
    {
      title: "North Korea Nuclear Escalation",
      description: "DPRK missile program advancement",
      selectedCountry: "KR",
      offensiveCountry: "KP",
      defensiveCountry: "KR",
      conflictScenario: "Nuclear Threat",
      scenarioDetails: "North Korea conducts ICBM tests and threatens preemptive nuclear strikes against South Korea and US military bases in the region.",
      severityLevel: "extreme",
      timeFrame: "immediate",
      tradeDependencies: 35,
      sanctionsImpact: 60,
      marketStability: 25,
      defenseCapabilities: 75,
      allianceSupport: 95,
      strategicResources: 50
    },
    {
      title: "Turkey-Greece Aegean Dispute",
      description: "Maritime boundaries and energy exploration",
      selectedCountry: "GR",
      offensiveCountry: "TR",
      defensiveCountry: "GR",
      conflictScenario: "Resource Conflict",
      scenarioDetails: "Turkey sends drilling ships into disputed Aegean waters claimed by Greece, escalating maritime tensions within NATO alliance.",
      severityLevel: "medium",
      timeFrame: "long",
      tradeDependencies: 55,
      sanctionsImpact: 40,
      marketStability: 60,
      defenseCapabilities: 65,
      allianceSupport: 70,
      strategicResources: 75
    },
    {
      title: "Antarctic Research Zone Dispute",
      description: "Scientific territory access rights",
      selectedCountry: "CL",
      offensiveCountry: "AR",
      defensiveCountry: "CL",
      conflictScenario: "Territorial Dispute",
      scenarioDetails: "Argentina establishes expanded research stations in disputed Antarctic zones, challenging Chilean scientific claims and potentially drawing in international Antarctic Treaty partners.",
      severityLevel: "high",
      timeFrame: "medium",
      tradeDependencies: 30,
      sanctionsImpact: 35,
      marketStability: 45,
      defenseCapabilities: 50,
      allianceSupport: 65,
      strategicResources: 40
    },
    {
      title: "Japan-China Maritime Tensions",
      description: "Senkaku/Diaoyu Islands dispute escalation",
      selectedCountry: "JP",
      offensiveCountry: "CN",
      defensiveCountry: "JP",
      conflictScenario: "Maritime Dispute",
      scenarioDetails: "Chinese coast guard and naval vessels increase presence around disputed islands, prompting Japanese military response and US alliance activation.",
      severityLevel: "medium",
      timeFrame: "long",
      tradeDependencies: 85,
      sanctionsImpact: 75,
      marketStability: 50,
      defenseCapabilities: 80,
      allianceSupport: 90,
      strategicResources: 60
    },
    {
      title: "Ethiopia-Egypt Nile Dam Crisis",
      description: "Water rights and infrastructure dispute",
      selectedCountry: "EG",
      offensiveCountry: "ET",
      defensiveCountry: "EG",
      conflictScenario: "Resource Conflict",
      scenarioDetails: "Ethiopia begins filling the Grand Renaissance Dam without agreement, threatening Egypt's water security and prompting military posturing.",
      severityLevel: "medium",
      timeFrame: "long",
      tradeDependencies: 40,
      sanctionsImpact: 30,
      marketStability: 55,
      defenseCapabilities: 60,
      allianceSupport: 45,
      strategicResources: 85
    },
    {
      title: "Venezuela-Guyana Border Dispute",
      description: "Essequibo territory and oil resources",
      selectedCountry: "GY",
      offensiveCountry: "VE",
      defensiveCountry: "GY",
      conflictScenario: "Resource Conflict",
      scenarioDetails: "Venezuela mobilizes forces near Essequibo region following major oil discoveries, challenging Guyana's territorial claims and threatening energy investments.",
      severityLevel: "medium",
      timeFrame: "long",
      tradeDependencies: 25,
      sanctionsImpact: 45,
      marketStability: 65,
      defenseCapabilities: 35,
      allianceSupport: 55,
      strategicResources: 90
    }
  ]

  // Function to apply example question
  const applyExampleQuestion = (example: typeof exampleQuestions[0]) => {
    setSelectedCountry(example.selectedCountry)
    setOffensiveCountry(example.offensiveCountry)
    setDefensiveCountry(example.defensiveCountry)
    setConflictScenario(example.conflictScenario)
    setScenarioDetails(example.scenarioDetails)
    setSeverityLevel(example.severityLevel)
    setTimeFrame(example.timeFrame)
    setTradeDependencies([example.tradeDependencies])
    setSanctionsImpact([example.sanctionsImpact])
    setMarketStability([example.marketStability])
    setDefenseCapabilities([example.defenseCapabilities])
    setAllianceSupport([example.allianceSupport])
    setStrategicResources([example.strategicResources])
    
    toast({
      title: "Example Applied!",
      description: `"${example.title}" scenario has been loaded into all fields.`,
    })
  }

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

  // Show landing page first, then simulation
  if (showLanding) {
    return <LandingPage onEnterSimulation={() => setShowLanding(false)} />
  }

  return (
    <div className="bg-dark-bg text-dark-text h-dvh flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-start w-full">
            <div 
              className="flex items-center space-x-3 sm:space-x-4 cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => setShowLanding(true)}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center overflow-hidden">
                <Image 
                  src="/fogreport.png" 
                  alt="FogReport Logo" 
                  width={48} 
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-dark-text">FogReport</h1>
                <p className="text-xs sm:text-sm text-dark-muted">Military Intelligence Briefing Platform</p>
              </div>
            </div>
            
            
            
            {/* <div className="flex items-center justify-end space-x-4 flex-1">
              
              <Badge variant="outline" className="border-flame text-flame bg-transparent text-sm px-3 py-1">
                Beta v1.4
              </Badge>
            </div> */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-8 sm:pb-12 lg:pb-96 flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-dark-card border border-dark-border h-10 sm:h-12">
            <TabsTrigger
              value="setup"
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-xs sm:text-base px-1 sm:px-3"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xxs:inline xs:hidden">Setup</span>
                <span className="hidden xs:inline sm:hidden">Setup</span>
                <span className="hidden sm:inline">Setup Simulation</span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="results"
              disabled={!briefingData}
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed px-1 sm:px-3"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:hidden">Briefing</span>
                <span className="hidden sm:inline">Intelligence Briefing</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              disabled={!briefingData}
              className="data-[state=active]:bg-flame data-[state=active]:text-white text-dark-text text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed px-1 sm:px-3"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:hidden">Sources</span>
                <span className="hidden sm:inline">Intelligence Sources</span>
              </div>
            </TabsTrigger>
          </TabsList>

                    {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Country Selection with Examples */}
              <div className="space-y-6">
                <Card className="border-dark-border bg-dark-card">
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
                  {isMobile ? (
                    // Mobile: Native select with search
                    <div className="space-y-3">
                      <Input
                        placeholder="Search countries..."
                        value={selectedCountrySearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedCountrySearch(e.target.value)}
                        className="bg-dark-bg border-dark-border text-dark-text h-12 text-base"
                      />
                      <div className="relative">
                        <select
                          value={selectedCountry}
                          onChange={(e) => {
                            const value = e.target.value
                            // If selecting a country that's currently the offensive country, clear it
                            if (value === offensiveCountry) {
                              setOffensiveCountry("")
                            }
                            setSelectedCountry(value)
                            setSelectedCountrySearch("") // Clear search after selection
                          }}
                          className="w-full h-12 px-3 bg-dark-bg border border-dark-border text-dark-text rounded-md text-base appearance-none focus:outline-none focus:ring-2 focus:ring-flame focus:border-transparent"
                        >
                          <option value="" disabled>Choose a country...</option>
                          {filterCountries(selectedCountrySearch, []).map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name} (Power: {country.power})
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronsUpDown className="h-4 w-4 text-dark-muted" />
                        </div>
                      </div>
                      {selectedCountry && (
                        <div className="flex items-center space-x-2 text-sm text-dark-text bg-dark-border p-2 rounded">
                          <FlagIcon countryCode={selectedCountry} className="w-5 h-3" />
                          <span>Selected: {countries.find((c) => c.code === selectedCountry)?.name}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Desktop: Custom searchable dropdown
                    <Popover open={selectedCountryOpen} onOpenChange={setSelectedCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={selectedCountryOpen}
                          className="w-full justify-between bg-dark-bg border-dark-border text-dark-text hover:bg-dark-border hover:text-dark-text h-10 text-base px-4"
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
                                    // If selecting a country that's currently the offensive country, clear it
                                    if (country.code === offensiveCountry) {
                                      setOffensiveCountry("")
                                    }
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
                  )}

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

                  {/* Example Questions Carousel */}
                  <div className="mt-6">
                    <div className="mb-4">
                      <h4 className="flex items-center space-x-2 text-dark-text text-base font-semibold mb-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>Example Scenarios</span>
                      </h4>
                      <p className="text-dark-muted text-sm">
                        Click any example to automatically fill all simulation fields
                      </p>
                    </div>
                    <Carousel className="w-full">
                      <CarouselContent className="-ml-2 md:-ml-4">
                        {exampleQuestions.map((example, index) => (
                          <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                            <Card 
                              className="h-full bg-dark-bg border-dark-border hover:border-blue-400/50 transition-colors cursor-pointer"
                              onClick={() => applyExampleQuestion(example)}
                            >
                              <CardContent className="p-4 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${
                                      example.severityLevel === 'extreme' ? 'bg-red-500/20 text-red-400' :
                                      example.severityLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }`}
                                  >
                                    {example.severityLevel === 'extreme' ? 'Critical' : 
                                     example.severityLevel === 'high' ? 'High' : 
                                     example.severityLevel === 'medium' ? 'Medium' : 'Low'}
                                  </Badge>
                                  <div className="flex items-center space-x-1">
                                    <FlagIcon countryCode={example.selectedCountry} className="w-4 h-3" />
                                    <span className="text-xs text-dark-muted">vs</span>
                                    <FlagIcon countryCode={example.offensiveCountry} className="w-4 h-3" />
                                  </div>
                                </div>
                                
                                <h3 className="font-semibold text-dark-text text-sm mb-1 line-clamp-2">
                                  {example.title}
                                </h3>
                                
                                <p className="text-xs text-dark-muted mb-3 line-clamp-2 flex-1">
                                  {example.description}
                                </p>
                                
                                                              <div className="flex items-center justify-between text-xs">
                                <span className="text-blue-400 font-medium">{example.conflictScenario}</span>
                                <span className="text-dark-muted">
                                  {example.timeFrame === 'immediate' ? '24h' :
                                   example.timeFrame === 'short' ? '1 week' :
                                   example.timeFrame === 'medium' ? '1 month' : '6+ months'}
                                </span>
                              </div>
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="text-dark-text border-dark-border hover:bg-dark-border" />
                      <CarouselNext className="text-dark-text border-dark-border hover:bg-dark-border" />
                    </Carousel>
                  </div>
                </CardContent>
                </Card>
              </div>

              {/* Military Conflict Scenario */}
              <Card className="border-dark-border bg-dark-card min-h-[400px] flex flex-col">
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
                      {isMobile ? (
                        // Mobile: Native select with search
                        <div className="space-y-3">
                          <Input
                            placeholder="Search countries..."
                            value={offensiveCountrySearch}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOffensiveCountrySearch(e.target.value)}
                            className="bg-dark-bg border-dark-border text-dark-text h-12 text-base"
                          />
                          <div className="relative">
                            <select
                              value={offensiveCountry}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value !== defensiveCountry && value !== selectedCountry) {
                                  setOffensiveCountry(value)
                                  setOffensiveCountrySearch("") // Clear search after selection
                                }
                              }}
                              className="w-full h-12 px-3 bg-dark-bg border border-dark-border text-dark-text rounded-md text-base appearance-none focus:outline-none focus:ring-2 focus:ring-flame focus:border-transparent"
                            >
                              <option value="" disabled>Select aggressor...</option>
                              {filterCountries(offensiveCountrySearch, [defensiveCountry, selectedCountry]).map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <ChevronsUpDown className="h-4 w-4 text-dark-muted" />
                            </div>
                          </div>
                          {offensiveCountry && (
                            <div className="flex items-center space-x-2 text-sm text-dark-text bg-dark-border p-2 rounded">
                              <FlagIcon countryCode={offensiveCountry} className="w-5 h-3" />
                              <span>Aggressor: {countries.find((c) => c.code === offensiveCountry)?.name}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Desktop: Custom searchable dropdown
                        <Popover open={offensiveCountryOpen} onOpenChange={setOffensiveCountryOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={offensiveCountryOpen}
                              className="w-full justify-between bg-dark-bg border-dark-border text-dark-text hover:bg-dark-border hover:text-dark-text h-10 text-base px-4"
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
                                      disabled={country.code === defensiveCountry || country.code === selectedCountry}
                                      onSelect={() => {
                                        if (country.code !== defensiveCountry && country.code !== selectedCountry) {
                                          setOffensiveCountry(country.code)
                                          setOffensiveCountryOpen(false)
                                        }
                                      }}
                                      className={`text-dark-text hover:bg-dark-border ${
                                        (country.code === defensiveCountry || country.code === selectedCountry) ? "opacity-50 cursor-not-allowed" : ""
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
                      )}
                    </div>

                    <div>
                      <label className="text-base font-medium text-dark-text mb-3 block flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-flame" />
                        Defending Military Force
                      </label>
                      {isMobile ? (
                        // Mobile: Native select with search
                        <div className="space-y-3">
                          <Input
                            placeholder="Search countries..."
                            value={defensiveCountrySearch}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDefensiveCountrySearch(e.target.value)}
                            className="bg-dark-bg border-dark-border text-dark-text h-12 text-base"
                          />
                          <div className="relative">
                            <select
                              value={defensiveCountry}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value !== offensiveCountry) {
                                  setDefensiveCountry(value)
                                  setDefensiveCountrySearch("") // Clear search after selection
                                }
                              }}
                              className="w-full h-12 px-3 bg-dark-bg border border-dark-border text-dark-text rounded-md text-base appearance-none focus:outline-none focus:ring-2 focus:ring-flame focus:border-transparent"
                            >
                              <option value="" disabled>Select defender...</option>
                              {filterCountries(defensiveCountrySearch, [offensiveCountry]).map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <ChevronsUpDown className="h-4 w-4 text-dark-muted" />
                            </div>
                          </div>
                          {defensiveCountry && (
                            <div className="flex items-center space-x-2 text-sm text-dark-text bg-dark-border p-2 rounded">
                              <FlagIcon countryCode={defensiveCountry} className="w-5 h-3" />
                              <span>Defender: {countries.find((c) => c.code === defensiveCountry)?.name}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Desktop: Custom searchable dropdown
                        <Popover open={defensiveCountryOpen} onOpenChange={setDefensiveCountryOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={defensiveCountryOpen}
                              className="w-full justify-between bg-dark-bg border-dark-border text-dark-text hover:bg-dark-border hover:text-dark-text h-10 text-base px-4"
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
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-base font-medium text-dark-text mb-3 block">Military Scenario Details</label>
                    <Textarea
                      placeholder="Describe your military conflict scenario in detail. Include specific military actions, weapons, forces, or tactical elements..."
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
                      {isMobile ? (
                        // Mobile: Native select
                        <div className="relative">
                          <select
                            value={severityLevel}
                            onChange={(e) => setSeverityLevel(e.target.value)}
                            className="w-full h-12 px-3 bg-dark-bg border border-dark-border text-dark-text rounded-md text-base appearance-none focus:outline-none focus:ring-2 focus:ring-flame focus:border-transparent"
                          >
                            <option value="" disabled>Select severity</option>
                            <option value="low">Low - Minor tensions</option>
                            <option value="medium">Medium - Escalating dispute</option>
                            <option value="high">High - Critical situation</option>
                            <option value="extreme">Extreme - Imminent threat</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronsUpDown className="h-4 w-4 text-dark-muted" />
                          </div>
                        </div>
                      ) : (
                        // Desktop: Custom dropdown
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
                      )}
                    </div>

                    <div>
                      <label className="text-base font-medium text-dark-text mb-3 block">Time Frame</label>
                      {isMobile ? (
                        // Mobile: Native select
                        <div className="relative">
                          <select
                            value={timeFrame}
                            onChange={(e) => setTimeFrame(e.target.value)}
                            className="w-full h-12 px-3 bg-dark-bg border border-dark-border text-dark-text rounded-md text-base appearance-none focus:outline-none focus:ring-2 focus:ring-flame focus:border-transparent"
                          >
                            <option value="" disabled>Response timeframe</option>
                            <option value="immediate">Immediate (24 hours)</option>
                            <option value="short">Short-term (1 week)</option>
                            <option value="medium">Medium-term (1 month)</option>
                            <option value="long">Long-term (6+ months)</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronsUpDown className="h-4 w-4 text-dark-muted" />
                          </div>
                        </div>
                      ) : (
                        // Desktop: Custom dropdown
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
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
              
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between pt-6 border-t border-dark-border">
              <Button
                onClick={clearForm}
                variant="outline"
                size="responsive"
                className="border-dark-border text-dark-text hover:bg-dark-border bg-transparent text-sm md:text-base"
              >
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Clear All Fields
              </Button>
              
              <Button
                onClick={generateBriefing}
                disabled={!selectedCountry || !offensiveCountry || !defensiveCountry || !scenarioDetails.trim() || isGeneratingBriefing}
                size="responsive-lg"
                className="bg-flame hover:bg-flame/90 text-white"
              >
                {isGeneratingBriefing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2"></div>
                    <span className="hidden xs:inline">Generating Briefing...</span>
                    <span className="xs:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    <span className="hidden xs:inline">Generate Briefing</span>
                    <span className="xs:hidden">Generate</span>
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

                  {/* AI Disclaimer for Legal Analysis */}
                  <Card className="border-yellow-500/30 bg-yellow-500/10 mt-6">
                    <CardContent className="p-4">
                      <p className="text-yellow-400 text-sm leading-relaxed font-medium">
                        ⚠️ <strong>IMPORTANT DISCLAIMER:</strong> This legal analysis is AI-generated content created for educational and simulation purposes only. This analysis should NOT be used as the basis for any real-world legal, military, diplomatic, or policy decisions. Any actual legal interpretation or strategic planning should involve consultation with qualified legal professionals, subject matter experts, and appropriate government authorities. The treaty interpretations and legal implications presented herein are hypothetical and do not reflect official government positions or legal opinions.
                      </p>
                    </CardContent>
                  </Card>

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
                        Estimated processing time: 30-60 seconds
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

                      {/* AI Disclaimer - Under Briefing Content */}
                      <div className="mt-8 pt-6 border-t border-dark-border">
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                          <p className="text-yellow-400 text-sm leading-relaxed font-medium">
                            ⚠️ <strong>IMPORTANT DISCLAIMER:</strong> This briefing is AI-generated content created for educational and simulation purposes only. This analysis should NOT be used as the basis for any real-world military, diplomatic, or policy decisions. Any actual strategic planning or crisis response should involve consultation with qualified professionals, subject matter experts, and appropriate government authorities. The scenarios, recommendations, and assessments presented herein are hypothetical and do not reflect official government positions or classified intelligence.
                          </p>
                        </div>
                      </div>
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

                    {/* AI Disclaimer */}
                    {briefingData.disclaimer && (
                      <div className="mt-6 pt-4 border-t border-dark-border">
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                          <p className="text-yellow-400 text-sm leading-relaxed font-medium">
                            {briefingData.disclaimer}
                          </p>
                        </div>
                      </div>
                    )}

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
                                  <div style="margin-top: 2em; padding: 1em; border: 1px solid #999; background-color: #f5f5f5;">
                                    <p style="font-size: 10px; line-height: 1.4; margin: 0;"><strong>DISCLAIMER:</strong> This briefing is AI-generated content created for educational and simulation purposes only. This analysis should NOT be used as the basis for any real-world military, diplomatic, or policy decisions. Any actual strategic planning or crisis response should involve consultation with qualified professionals, subject matter experts, and appropriate government authorities. The scenarios, recommendations, and assessments presented herein are hypothetical and do not reflect official government positions or classified intelligence.</p>
                                  </div>
                                  <div class="signature">
                                    <p>${briefingData.author}</p>
                                    <p>Generated: ${new Date().toLocaleString()}</p>
                        </div>
                                  ${briefingData.disclaimer ? `
                                    <div style="margin-top: 2em; padding: 1em; border: 1px solid #999; background-color: #f5f5f5;">
                                      <p style="font-size: 10px; line-height: 1.4; margin: 0;"><strong>DISCLAIMER:</strong> ${briefingData.disclaimer}</p>
                                    </div>
                                  ` : ''}
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

${briefingData.finalRecommendation || ''}

---
DISCLAIMER: This briefing is AI-generated content created for educational and simulation purposes only. This analysis should NOT be used as the basis for any real-world military, diplomatic, or policy decisions. Any actual strategic planning or crisis response should involve consultation with qualified professionals, subject matter experts, and appropriate government authorities. The scenarios, recommendations, and assessments presented herein are hypothetical and do not reflect official government positions or classified intelligence.

${briefingData.author}
Generated: ${new Date().toLocaleString()}

${briefingData.disclaimer ? `
---
DISCLAIMER: ${briefingData.disclaimer}
` : ''}
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
