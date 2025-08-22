"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import StarryBackground from "./StarryBackground"

interface LandingPageProps {
  onEnterSimulation: () => void
}

export default function LandingPage({ onEnterSimulation }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Starry Background */}
      <StarryBackground />
      
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 relative z-10">
        
        {/* Logo Section */}
        <div className="flex-shrink-0 relative">
          <div className="relative overflow-hidden rounded-3xl glow-blue">
            {/* Light reflection animation overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-light-reflection"></div>
            <Image 
              src="/fogreport.png" 
              alt="FogReport Logo" 
              width={400} 
              height={400}
              className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain relative z-0 rounded-3xl"
              priority
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          
          {/* Main Quote */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-dark-text leading-tight">
            <span className="text-flame">Clarity</span> in real-time
            <br />
            through the{" "}
            <span className="text-flame">Fog of War.</span>
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-dark-muted max-w-lg">
            Simulate military conflicts and receive AI-powered strategic intelligence briefings instantly.
          </p>

          {/* Enter Button */}
          <Button
            onClick={onEnterSimulation}
            size="lg"
            className="bg-flame hover:bg-flame/90 text-white text-lg px-8 py-4 h-auto font-semibold transition-all duration-200 hover:scale-105 glow-flame hover-glow-flame"
          >
            Enter Simulation Platform
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      
    </div>
  )
}
