"use client"

import { useEffect, useRef } from "react"

export function WeatherEffects({ condition, intensity = 1 }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles based on weather condition
    const initParticles = () => {
      particlesRef.current = []
      const particleCount = getParticleCount(condition) * intensity

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(condition, canvas.width, canvas.height))
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, index) => {
        updateParticle(particle, condition, canvas.width, canvas.height)
        drawParticle(ctx, particle, condition)

        // Reset particle if it goes off screen
        if (shouldResetParticle(particle, condition, canvas.width, canvas.height)) {
          particlesRef.current[index] = createParticle(condition, canvas.width, canvas.height)
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [condition, intensity])

  if (condition === "sunny") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <SunRays />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}

function SunRays() {
  return (
    <div className="absolute inset-0">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent animate-pulse"
          style={{
            height: "40%",
            transformOrigin: "center bottom",
            transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: "3s",
          }}
        />
      ))}
    </div>
  )
}

function getParticleCount(condition) {
  switch (condition) {
    case "rainy":
      return 150
    case "snowy":
      return 100
    case "cloudy":
      return 20
    default:
      return 0
  }
}

function createParticle(condition, width, height) {
  switch (condition) {
    case "rainy":
      return {
        x: Math.random() * width,
        y: -10,
        speed: 5 + Math.random() * 10,
        size: 1 + Math.random() * 2,
        opacity: 0.6 + Math.random() * 0.4,
      }
    case "snowy":
      return {
        x: Math.random() * width,
        y: -10,
        speed: 1 + Math.random() * 3,
        size: 2 + Math.random() * 4,
        opacity: 0.7 + Math.random() * 0.3,
        drift: Math.random() * 2 - 1,
      }
    case "cloudy":
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1,
        size: 20 + Math.random() * 40,
        opacity: 0.1 + Math.random() * 0.2,
        direction: Math.random() * Math.PI * 2,
      }
    default:
      return {}
  }
}

function updateParticle(particle, condition, width, height) {
  switch (condition) {
    case "rainy":
      particle.y += particle.speed
      particle.x += Math.sin(particle.y * 0.01) * 0.5
      break
    case "snowy":
      particle.y += particle.speed
      particle.x += particle.drift
      break
    case "cloudy":
      particle.x += Math.cos(particle.direction) * particle.speed
      particle.y += Math.sin(particle.direction) * particle.speed
      break
  }
}

function drawParticle(ctx, particle, condition) {
  ctx.save()
  ctx.globalAlpha = particle.opacity

  switch (condition) {
    case "rainy":
      ctx.strokeStyle = "#87CEEB"
      ctx.lineWidth = particle.size
      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(particle.x, particle.y + particle.size * 3)
      ctx.stroke()
      break
    case "snowy":
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      break
    case "cloudy":
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      break
  }

  ctx.restore()
}

function shouldResetParticle(particle, condition, width, height) {
  switch (condition) {
    case "rainy":
    case "snowy":
      return particle.y > height + 10
    case "cloudy":
      return (
        particle.x < -particle.size ||
        particle.x > width + particle.size ||
        particle.y < -particle.size ||
        particle.y > height + particle.size
      )
    default:
      return false
  }
}
