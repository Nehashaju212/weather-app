"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  MapPin,
  Heart,
  Share,
  Search,
  Loader2,
} from "lucide-react"
import { WeatherEffects } from "@/components/weather-effects"

const defaultLocations = [
  { name: "New York", country: "US" },
  { name: "London", country: "UK" },
  { name: "Tokyo", country: "JP" },
  { name: "Sydney", country: "AU" },
  { name: "Paris", country: "FR" },
]

const getWeatherIcon = (condition, size = 24, animated = false) => {
  const animationClass = animated
    ? {
        sunny: "animate-spin",
        cloudy: "animate-pulse",
        rainy: "animate-bounce",
        snowy: "animate-pulse",
      }[condition] || ""
    : ""

  const iconProps = { size, className: `text-white drop-shadow-lg ${animationClass}` }

  switch (condition) {
    case "sunny":
      return <Sun {...iconProps} style={{ animationDuration: "8s" }} />
    case "cloudy":
      return <Cloud {...iconProps} />
    case "rainy":
      return <CloudRain {...iconProps} />
    case "snowy":
      return <CloudSnow {...iconProps} />
    default:
      return <Sun {...iconProps} />
  }
}

const getWeatherBackground = (condition) => {
  switch (condition) {
    case "sunny":
      return "linear-gradient(135deg, #ff9a56 0%, #ff6b35 25%, #f39c12 50%, #e67e22 75%, #d35400 100%)"
    case "cloudy":
      return "linear-gradient(135deg, #74b9ff 0%, #0984e3 25%, #4a90e2 50%, #357abd 75%, #2c5aa0 100%)"
    case "rainy":
      return "linear-gradient(135deg, #00cec9 0%, #00b894 25%, #00a085 50%, #008975 75%, #006b5b 100%)"
    case "snowy":
      return "linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 25%, #a78bfa 50%, #8b5cf6 75%, #7c3aed 100%)"
    default:
      return "linear-gradient(135deg, #74b9ff 0%, #0984e3 25%, #4a90e2 50%, #357abd 75%, #2c5aa0 100%)"
  }
}

export default function WeatherApp() {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [selectedDay, setSelectedDay] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchCity, setSearchCity] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Load initial weather data
  useEffect(() => {
    loadWeatherData(defaultLocations[0].name)
  }, [])

  const loadWeatherData = async (city) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch current weather
      const currentResponse = await fetch(`/api/weather/current?city=${encodeURIComponent(city)}`)
      if (!currentResponse.ok) {
        throw new Error("Failed to fetch current weather")
      }
      const currentData = await currentResponse.json()
      setCurrentWeather(currentData)

      // Fetch forecast
      const forecastResponse = await fetch(
        `/api/weather/forecast?lat=${currentData.coordinates.lat}&lon=${currentData.coordinates.lon}`,
      )
      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast")
      }
      const forecastData = await forecastResponse.json()
      setForecast(forecastData)
      setSelectedDay(0)
    } catch (err) {
      setError(err.message)
      console.error("Weather data error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchCity.trim()) return

    setIsSearching(true)
    try {
      await loadWeatherData(searchCity.trim())
      setSearchCity("")
    } catch (err) {
      setError("City not found. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleDaySelect = (dayIndex) => {
    if (dayIndex === selectedDay) return

    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedDay(dayIndex)
      setIsTransitioning(false)
    }, 300)
  }

  const handleLocationChange = () => {
    const nextIndex = (currentLocationIndex + 1) % defaultLocations.length
    setCurrentLocationIndex(nextIndex)
    loadWeatherData(defaultLocations[nextIndex].name)
  }

  const getCurrentWeatherData = () => {
    if (!currentWeather || !forecast.length) return null

    if (selectedDay === 0) {
      return {
        temperature: currentWeather.temperature,
        condition: currentWeather.condition,
        description: currentWeather.description,
        humidity: currentWeather.humidity,
        windSpeed: currentWeather.windSpeed,
        visibility: currentWeather.visibility,
        feelsLike: currentWeather.feelsLike,
      }
    } else {
      const selectedForecast = forecast[selectedDay]
      return {
        temperature: selectedForecast.temp,
        condition: selectedForecast.condition,
        description: selectedForecast.description,
        humidity: currentWeather.humidity,
        windSpeed: currentWeather.windSpeed,
        visibility: currentWeather.visibility,
        feelsLike: selectedForecast.temp + 2,
      }
    }
  }

  const weatherData = getCurrentWeatherData()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center p-6">
        <div className="text-center text-white max-w-md">
          <p className="text-lg mb-4">Error: {error}</p>
          <Button
            onClick={() => loadWeatherData(defaultLocations[0].name)}
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!weatherData) return null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Weather Card */}
      <div
        className={`relative min-h-screen transition-all duration-700 ease-in-out ${isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
        style={{
          background: getWeatherBackground(weatherData.condition),
        }}
      >
        {/* Weather Effects */}
        <WeatherEffects condition={weatherData.condition} intensity={1} />

        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), 
                             linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%)`,
            backgroundSize: "60px 60px, 80px 80px, 20px 20px, 20px 20px",
          }}
        />

        {/* Main content overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20" />

        <div className="relative z-10 flex flex-col min-h-screen p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-white/70" />
              <span className="text-white text-base font-medium">
                {currentWeather?.city}, {currentWeather?.country}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/20 p-2">
                <Heart size={16} />
              </Button>
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/20 p-2">
                <Share size={16} />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2 max-w-sm">
              <Input
                type="text"
                placeholder="Search city..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSearching}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </Button>
            </div>
          </form>

          {/* Date and Time */}
          <div className="mb-8">
            <div className="text-white/80 text-sm mb-1">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="text-white/60 text-xs">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Main Weather Display */}
          <div className="flex-1 flex flex-col justify-center items-center text-center mb-8">
            <div className="mb-6">{getWeatherIcon(weatherData.condition, 100, true)}</div>

            <div className="text-7xl md:text-8xl font-extralight text-white mb-3 tracking-tight">
              {weatherData.temperature}°
            </div>

            <div className="text-white/90 text-xl mb-8 capitalize font-light">{weatherData.description}</div>

            {/* Weather Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <div className="text-white/70 text-xs mb-1 flex items-center justify-center gap-1">
                  <Droplets size={12} />
                  Humidity
                </div>
                <div className="text-white text-base font-medium">{weatherData.humidity}%</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <div className="text-white/70 text-xs mb-1 flex items-center justify-center gap-1">
                  <Wind size={12} />
                  Wind
                </div>
                <div className="text-white text-base font-medium">{weatherData.windSpeed} km/h</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <div className="text-white/70 text-xs mb-1 flex items-center justify-center gap-1">
                  <Eye size={12} />
                  Visibility
                </div>
                <div className="text-white text-base font-medium">{weatherData.visibility} km</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <div className="text-white/70 text-xs mb-1 flex items-center justify-center gap-1">
                  <Thermometer size={12} />
                  Feels like
                </div>
                <div className="text-white text-base font-medium">{weatherData.feelsLike}°</div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          {forecast.length > 0 && (
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-base font-medium">7-day forecast</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLocationChange}
                  className="text-white/70 hover:text-white hover:bg-white/20 text-xs px-3 py-1"
                >
                  Change Location
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {forecast.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDaySelect(index)}
                    className={`relative p-2.5 rounded-xl text-center transition-all duration-300 ${
                      selectedDay === index
                        ? "bg-white/30 scale-105 shadow-lg border border-white/20"
                        : "bg-white/10 hover:bg-white/20 hover:scale-102 border border-white/5"
                    }`}
                  >
                    <div className="text-white/80 text-xs mb-2 font-medium">{index === 0 ? "Today" : day.day}</div>

                    <div className="mb-2 flex justify-center">{getWeatherIcon(day.condition, 20)}</div>

                    <div className="text-white text-xs font-semibold mb-0.5">{day.high}°</div>

                    <div className="text-white/60 text-xs">{day.low}°</div>

                    {day.precipitation > 0 && <div className="text-white/50 text-xs mt-1">{day.precipitation}%</div>}

                    {selectedDay === index && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
