"use client"

import { useEffect, useState } from "react"

interface Star {
  id: number
  top: string
  left: string
  animationClass: string
  size: string
}

export default function StarryBackground() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const starCount = 50
      const newStars: Star[] = []
      
      for (let i = 0; i < starCount; i++) {
        const animationClasses = ['animate-twinkle', 'animate-twinkle-slow', 'animate-twinkle-slower']
        const sizes = ['w-1 h-1', 'w-0.5 h-0.5', 'w-1.5 h-1.5']
        
        newStars.push({
          id: i,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationClass: animationClasses[Math.floor(Math.random() * animationClasses.length)],
          size: sizes[Math.floor(Math.random() * sizes.length)]
        })
      }
      
      setStars(newStars)
    }

    generateStars()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute bg-white rounded-full ${star.size} ${star.animationClass}`}
          style={{
            top: star.top,
            left: star.left,
            animationDelay: `${Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  )
}
