"use client"

import { useEffect, useState } from "react"
import { getRoundColor } from "@/lib/corruption"

interface HorrorBackgroundProps {
  round: number
  isGenerating: boolean
}

export function HorrorBackground({ round, isGenerating }: HorrorBackgroundProps) {
  const [bloodDrops, setBloodDrops] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([])
  const [flashOpacity, setFlashOpacity] = useState(0)

  // Generate blood drops for rounds 2-4
  useEffect(() => {
    if (round >= 2) {
      const dropCount = round === 2 ? 3 : round === 3 ? 8 : 15
      const drops = Array.from({ length: dropCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
      }))
      setBloodDrops(drops)
    } else {
      setBloodDrops([])
    }
  }, [round])

  // Random flashing for rounds 3-4
  useEffect(() => {
    if (round >= 3 && isGenerating) {
      const flashInterval = setInterval(() => {
        const intensity = round === 3 ? 0.1 : 0.2
        const shouldFlash = Math.random() > 0.7

        if (shouldFlash) {
          setFlashOpacity(intensity)
          setTimeout(() => setFlashOpacity(0), 100 + Math.random() * 200)
        }
      }, round === 3 ? 3000 : 1500)

      return () => clearInterval(flashInterval)
    }
  }, [round, isGenerating])

  const backgroundColor = getRoundColor(round)
  const showVignette = round >= 2
  const showGrain = round >= 1

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base color overlay with gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,${round * 0.15}) 100%)`
        }}
      />

      {/* Film grain effect */}
      {showGrain && (
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.6 + round * 0.2}' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            animation: round >= 3 ? "grain 0.5s steps(4) infinite" : "none"
          }}
        />
      )}

      {/* Vignette effect */}
      {showVignette && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
            opacity: round === 2 ? 0.3 : round === 3 ? 0.6 : 0.9
          }}
        />
      )}

      {/* Blood drips */}
      {bloodDrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute top-0 w-1 bg-gradient-to-b from-blood-red to-transparent"
          style={{
            left: `${drop.left}%`,
            height: round === 2 ? "30px" : round === 3 ? "60px" : "120px",
            animationName: "bloodDrip",
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in",
            opacity: round === 2 ? 0.3 : round === 3 ? 0.5 : 0.7,
          }}
        />
      ))}

      {/* Pulsing glow for round 4 */}
      {round === 4 && (
        <div
          className="absolute inset-0 bg-blood-red mix-blend-screen"
          style={{
            animation: "pulse 3s ease-in-out infinite",
            opacity: 0.05,
          }}
        />
      )}

      {/* Random flash overlay */}
      {flashOpacity > 0 && (
        <div
          className="absolute inset-0 bg-white transition-opacity duration-100"
          style={{ opacity: flashOpacity }}
        />
      )}

      <style jsx>{`
        @keyframes bloodDrip {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.02;
          }
          50% {
            opacity: 0.08;
          }
        }

        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2%, -2%); }
          50% { transform: translate(2%, 2%); }
          75% { transform: translate(-2%, 2%); }
        }
      `}</style>
    </div>
  )
}
