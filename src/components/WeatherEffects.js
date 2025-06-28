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

      // Draw weather-specific effects
      if (condition === "cloudy") {
        drawClouds(ctx, canvas.width, canvas.height)
      } else if (condition === "sunny") {
        drawSunRays(ctx, canvas.width, canvas.height)
      }

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
        <SunGlow />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}

function SunGlow() {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div
        className="w-96 h-96 bg-amber-200/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-200/15 rounded-full blur-2xl animate-pulse"
        style={{ animationDuration: "6s", animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-200/20 rounded-full blur-xl animate-pulse"
        style={{ animationDuration: "4s", animationDelay: "2s" }}
      />
    </div>
  )
}

// Cloud data for consistent cloud shapes
const cloudData = [
  { x: 0.1, y: 0.2, size: 1.2, speed: 0.3 },
  { x: 0.3, y: 0.15, size: 0.8, speed: 0.2 },
  { x: 0.6, y: 0.25, size: 1.0, speed: 0.25 },
  { x: 0.8, y: 0.18, size: 0.9, speed: 0.35 },
  { x: 0.15, y: 0.4, size: 0.7, speed: 0.15 },
  { x: 0.45, y: 0.35, size: 1.1, speed: 0.28 },
  { x: 0.75, y: 0.42, size: 0.85, speed: 0.22 },
  { x: 0.05, y: 0.6, size: 0.95, speed: 0.18 },
  { x: 0.35, y: 0.55, size: 0.75, speed: 0.32 },
  { x: 0.65, y: 0.58, size: 1.05, speed: 0.26 },
  { x: 0.75, y: 0.42, size: 0.85, speed: 0.22 },
  { x: 0.05, y: 0.6, size: 0.95, speed: 0.18 },
  { x: 0.35, y: 0.55, size: 0.75, speed: 0.32 },
  { x: 0.65, y: 0.58, size: 1.05, speed: 0.26 },
]

let cloudOffset = 0

function drawClouds(ctx, width, height) {
  cloudOffset += 0.2 // Slow cloud movement

  cloudData.forEach((cloud, index) => {
    const x = ((cloud.x * width + cloudOffset * cloud.speed) % (width + 200)) - 100
    const y = cloud.y * height
    const size = cloud.size

    drawCloud(ctx, x, y, size)
  })
}

function drawCloud(ctx, x, y, scale = 1) {
  ctx.save()
  ctx.globalAlpha = 0.7

  // Cloud is made of multiple circles
  const baseSize = 50 * scale

  // Main cloud body (5 circles)
  const circles = [
    { x: x, y: y, radius: baseSize },
    { x: x - baseSize * 0.6, y: y + baseSize * 0.3, radius: baseSize * 0.8 },
    { x: x + baseSize * 0.6, y: y + baseSize * 0.3, radius: baseSize * 0.8 },
    { x: x - baseSize * 0.3, y: y - baseSize * 0.4, radius: baseSize * 0.7 },
    { x: x + baseSize * 0.3, y: y - baseSize * 0.4, radius: baseSize * 0.7 },
  ]

  // Draw cloud shadow first
  ctx.globalAlpha = 0.3
  ctx.fillStyle = "#4A5568"
  circles.forEach((circle) => {
    ctx.beginPath()
    ctx.arc(circle.x + 4, circle.y + 4, circle.radius, 0, Math.PI * 2)
    ctx.fill()
  })

  // Draw main cloud in grey tones
  ctx.globalAlpha = 0.8
  ctx.fillStyle = "#A0AEC0"
  circles.forEach((circle) => {
    ctx.beginPath()
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
    ctx.fill()
  })

  // Add cloud highlights in light grey
  ctx.globalAlpha = 0.6
  ctx.fillStyle = "#E2E8F0"
  circles.forEach((circle) => {
    ctx.beginPath()
    ctx.arc(circle.x - circle.radius * 0.3, circle.y - circle.radius * 0.3, circle.radius * 0.4, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.restore()
}

let sunRayRotation = 0

function drawSunRays(ctx, width, height) {
  sunRayRotation += 0.3 // Slower rotation for more pleasant effect

  const centerX = width / 2
  const centerY = height / 2

  ctx.save()

  // Draw main sun rays - MUCH THICKER and softer colors
  for (let i = 0; i < 16; i++) {
    const angle = ((i * 22.5 + sunRayRotation) * Math.PI) / 180
    const rayLength = Math.min(width, height) * 0.55
    const rayWidth = 12 // Much thicker rays

    const gradient = ctx.createLinearGradient(
      centerX,
      centerY,
      centerX + Math.cos(angle) * rayLength,
      centerY + Math.sin(angle) * rayLength,
    )
    // Softer, warmer colors
    gradient.addColorStop(0, "rgba(251, 191, 36, 0.6)") // Warm amber
    gradient.addColorStop(0.3, "rgba(245, 158, 11, 0.5)") // Golden
    gradient.addColorStop(0.7, "rgba(217, 119, 6, 0.3)") // Darker amber
    gradient.addColorStop(1, "rgba(180, 83, 9, 0)")

    ctx.strokeStyle = gradient
    ctx.lineWidth = rayWidth
    ctx.lineCap = "round"

    ctx.beginPath()
    ctx.moveTo(centerX + Math.cos(angle) * 120, centerY + Math.sin(angle) * 120)
    ctx.lineTo(centerX + Math.cos(angle) * rayLength, centerY + Math.sin(angle) * rayLength)
    ctx.stroke()
  }

  // Draw secondary rays - also thicker
  for (let i = 0; i < 8; i++) {
    const angle = ((i * 45 + 22.5 - sunRayRotation * 0.5) * Math.PI) / 180
    const rayLength = Math.min(width, height) * 0.35
    const rayWidth = 8 // Thicker secondary rays

    const gradient = ctx.createLinearGradient(
      centerX,
      centerY,
      centerX + Math.cos(angle) * rayLength,
      centerY + Math.sin(angle) * rayLength,
    )
    gradient.addColorStop(0, "rgba(245, 158, 11, 0.5)")
    gradient.addColorStop(0.5, "rgba(217, 119, 6, 0.4)")
    gradient.addColorStop(1, "rgba(180, 83, 9, 0)")

    ctx.strokeStyle = gradient
    ctx.lineWidth = rayWidth
    ctx.lineCap = "round"

    ctx.beginPath()
    ctx.moveTo(centerX + Math.cos(angle) * 100, centerY + Math.sin(angle) * 100)
    ctx.lineTo(centerX + Math.cos(angle) * rayLength, centerY + Math.sin(angle) * rayLength)
    ctx.stroke()
  }

  // Draw central sun glow with warmer colors
  const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 180)
  sunGradient.addColorStop(0, "rgba(251, 191, 36, 0.3)") // Warm amber
  sunGradient.addColorStop(0.3, "rgba(245, 158, 11, 0.25)") // Golden
  sunGradient.addColorStop(0.7, "rgba(217, 119, 6, 0.15)") // Darker amber
  sunGradient.addColorStop(1, "rgba(180, 83, 9, 0)")

  ctx.fillStyle = sunGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, 180, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function getParticleCount(condition) {
  switch (condition) {
    case "rainy":
      return 200
    case "snowy":
      return 100
    case "cloudy":
      return 0 // Using canvas clouds
    case "sunny":
      return 0 // Using canvas sun rays
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
        speed: 12 + Math.random() * 15,
        size: 1.5 + Math.random() * 2,
        opacity: 0.7 + Math.random() * 0.3,
        angle: Math.random() * 0.2 - 0.1,
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
    default:
      return {}
  }
}

function updateParticle(particle, condition, width, height) {
  switch (condition) {
    case "rainy":
      particle.y += particle.speed
      particle.x += Math.sin(particle.y * 0.01) * 2 + particle.angle * particle.speed
      break
    case "snowy":
      particle.y += particle.speed
      particle.x += particle.drift + Math.sin(particle.y * 0.005) * 0.5
      break
  }
}

function drawParticle(ctx, particle, condition) {
  ctx.save()
  ctx.globalAlpha = particle.opacity

  switch (condition) {
    case "rainy":
      // Water blue rain drops
      const gradient = ctx.createLinearGradient(particle.x, particle.y, particle.x, particle.y + particle.size * 6)
      gradient.addColorStop(0, "#87CEEB")
      gradient.addColorStop(0.5, "#4682B4")
      gradient.addColorStop(1, "#1E90FF")

      ctx.strokeStyle = gradient
      ctx.lineWidth = particle.size
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(particle.x - 3, particle.y + particle.size * 6)
      ctx.stroke()

      // Add small splash effect
      if (Math.random() < 0.1) {
        ctx.fillStyle = "#ADD8E6"
        ctx.globalAlpha = particle.opacity * 0.5
        ctx.beginPath()
        ctx.arc(particle.x, particle.y + particle.size * 6, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case "snowy":
      // Simple white snowflakes
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()

      // Add sparkle effect
      ctx.strokeStyle = "#E3F2FD"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(particle.x - particle.size, particle.y)
      ctx.lineTo(particle.x + particle.size, particle.y)
      ctx.moveTo(particle.x, particle.y - particle.size)
      ctx.lineTo(particle.x, particle.y + particle.size)
      ctx.stroke()
      break
  }

  ctx.restore()
}

function shouldResetParticle(particle, condition, width, height) {
  switch (condition) {
    case "rainy":
    case "snowy":
      return particle.y > height + 20 || particle.x < -50 || particle.x > width + 50
    default:
      return false
  }
}
