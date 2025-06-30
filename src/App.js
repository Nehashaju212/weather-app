"use client"

import { useState, useEffect } from "react"
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
  Loader2,
  Calendar,
  Clock,
} from "lucide-react"
import { WeatherEffects } from "./components/WeatherEffects"
import { Button } from "./components/ui/Button"
import "./App.css"

// For demo purposes, we'll use a proxy service or mock data
const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY
const PROXY_URL = "https://api.allorigins.win/raw?url="
const BASE_URL = "https://api.openweathermap.org/data/2.5"

const defaultLocations = [
  { name: "New York", country: "US", lat: 40.7128, lon: -74.006 },
  { name: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 },
  { name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
]

// Mock data for when API is not available
const mockWeatherData = {
  "New York": {
    city: "New York",
    country: "US",
    temperature: 22,
    condition: "cloudy",
    description: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    visibility: 8,
    feelsLike: 25,
    coordinates: { lat: 40.7128, lon: -74.006 },
  },
  London: {
    city: "London",
    country: "UK",
    temperature: 15,
    condition: "rainy",
    description: "Light Rain",
    humidity: 80,
    windSpeed: 15,
    visibility: 6,
    feelsLike: 13,
    coordinates: { lat: 51.5074, lon: -0.1278 },
  },
  Tokyo: {
    city: "Tokyo",
    country: "JP",
    temperature: 28,
    condition: "sunny",
    description: "Clear Sky",
    humidity: 55,
    windSpeed: 8,
    visibility: 10,
    feelsLike: 31,
    coordinates: { lat: 35.6762, lon: 139.6503 },
  },
  Sydney: {
    city: "Sydney",
    country: "AU",
    temperature: 25,
    condition: "sunny",
    description: "Sunny",
    humidity: 60,
    windSpeed: 10,
    visibility: 12,
    feelsLike: 27,
    coordinates: { lat: -33.8688, lon: 151.2093 },
  },
  Paris: {
    city: "Paris",
    country: "FR",
    temperature: 18,
    condition: "cloudy",
    description: "Overcast",
    humidity: 70,
    windSpeed: 6,
    visibility: 9,
    feelsLike: 20,
    coordinates: { lat: 48.8566, lon: 2.3522 },
  },
}

const mockForecastData = [
  {
    date: "Today",
    day: "Today",
    temp: 22,
    high: 25,
    low: 18,
    condition: "cloudy",
    description: "Partly Cloudy",
    precipitation: 20,
    time: "Now",
  },
  {
    date: "Tomorrow",
    day: "Tue",
    temp: 26,
    high: 28,
    low: 20,
    condition: "sunny",
    description: "Sunny",
    precipitation: 0,
    time: "2 AM",
  },
  {
    date: "Wed 29",
    day: "Wed",
    temp: 19,
    high: 22,
    low: 16,
    condition: "rainy",
    description: "Light Rain",
    precipitation: 80,
    time: "3 AM",
  },
  {
    date: "Thu 30",
    day: "Thu",
    temp: 23,
    high: 26,
    low: 19,
    condition: "cloudy",
    description: "Overcast",
    precipitation: 40,
    time: "4 AM",
  },
  {
    date: "Fri 31",
    day: "Fri",
    temp: 29,
    high: 32,
    low: 24,
    condition: "sunny",
    description: "Clear Sky",
    precipitation: 10,
    time: "5 AM",
  },
  {
    date: "Sat 1",
    day: "Sat",
    temp: 16,
    high: 19,
    low: 12,
    condition: "snowy",
    description: "Light Snow",
    precipitation: 60,
    time: "6 AM",
  },
  {
    date: "Sun 2",
    day: "Sun",
    temp: 21,
    high: 24,
    low: 17,
    condition: "rainy",
    description: "Showers",
    precipitation: 70,
    time: "7 AM",
  },
]

const hourlyData = [
  { time: "Now", temp: 22, condition: "cloudy" },
  { time: "1 PM", temp: 24, condition: "cloudy" },
  { time: "2 PM", temp: 26, condition: "sunny" },
  { time: "3 PM", temp: 28, condition: "sunny" },
  { time: "4 PM", temp: 27, condition: "sunny" },
  { time: "5 PM", temp: 25, condition: "cloudy" },
  { time: "6 PM", temp: 23, condition: "cloudy" },
  { time: "7 PM", temp: 21, condition: "rainy" },
  { time: "8 PM", temp: 20, condition: "rainy" },
  { time: "9 PM", temp: 19, condition: "rainy" },
]

const getWeatherIcon = (condition, size = 24, animated = false) => {
  const animationClass = animated
    ? {
        sunny: "animate-spin-slow",
        cloudy: "animate-float",
        rainy: "animate-bounce-slow",
        snowy: "animate-float",
      }[condition] || ""
    : ""

  const iconProps = {
    size,
    className: `text-white drop-shadow-lg ${animationClass}`,
  }

  switch (condition) {
    case "sunny":
      return <Sun {...iconProps} />
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
      return {
        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 25%, #B45309 50%, #92400E 75%, #78350F 100%)",
        pattern:
          "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251,191,36,0.15) 0%, transparent 50%)",
      }
    case "cloudy":
      return {
        background: "linear-gradient(135deg, #9CA3AF 0%, #6B7280 25%, #4B5563 50%, #374151 75%, #1F2937 100%)",
        pattern:
          "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 70%), radial-gradient(circle at 50% 10%, rgba(255,255,255,0.12) 0%, transparent 50%)",
      }
    case "rainy":
      return {
        background: "linear-gradient(135deg, #4682B4 0%, #1E90FF 25%, #0080FF 50%, #0066CC 75%, #004080 100%)",
        pattern:
          "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(173,216,230,0.2) 0%, transparent 50%)",
      }
    case "snowy":
      return {
        background: "linear-gradient(135deg, #E0F6FF 0%, #B8E6FF 25%, #87CEEB 50%, #4169E1 75%, #0047AB 100%)",
        pattern:
          "radial-gradient(circle at 40% 60%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 60% 40%, rgba(240,248,255,0.3) 0%, transparent 50%)",
      }
    default:
      return {
        background: "linear-gradient(135deg, #9CA3AF 0%, #6B7280 25%, #4B5563 50%, #374151 75%, #1F2937 100%)",
        pattern: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%)",
      }
  }
}

const getWeatherCondition = (main, id) => {
  switch (main.toLowerCase()) {
    case "clear":
      return "sunny"
    case "clouds":
      return "cloudy"
    case "rain":
    case "drizzle":
      return "rainy"
    case "snow":
      return "snowy"
    case "thunderstorm":
      return "rainy"
    case "mist":
    case "fog":
    case "haze":
      return "cloudy"
    default:
      return "sunny"
  }
}

function App() {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [selectedDay, setSelectedDay] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
  const [useRealAPI, setUseRealAPI] = useState(false)

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Load initial weather data
  useEffect(() => {
    // Check if API key is available
    if (API_KEY && API_KEY !== "your_openweathermap_api_key_here") {
      setUseRealAPI(true)
      loadWeatherData(defaultLocations[0].name)
    } else {
      // Use mock data
      console.log("Using mock data. Add your OpenWeatherMap API key to use real data.")
      loadMockData(defaultLocations[0].name)
    }
  }, [])

  const loadMockData = (cityName) => {
    setLoading(true)
    setError(null)

    // Simulate API delay
    setTimeout(() => {
      const weatherData = mockWeatherData[cityName] || mockWeatherData["New York"]
      setCurrentWeather(weatherData)
      setForecast(mockForecastData)
      setSelectedDay(0)
      setLoading(false)
    }, 1000)
  }

  const fetchCurrentWeather = async (city) => {
    try {
      const url = `${PROXY_URL}${encodeURIComponent(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`)}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data = await response.json()

      return {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        condition: getWeatherCondition(data.weather[0].main, data.weather[0].id),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        visibility: Math.round(data.visibility / 1000),
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon,
        },
      }
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  const fetchForecast = async (lat, lon) => {
    try {
      const url = `${PROXY_URL}${encodeURIComponent(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch forecast data")
      }

      const data = await response.json()
      return groupForecastByDay(data.list)
    } catch (error) {
      console.error("Forecast API Error:", error)
      return mockForecastData // Fallback to mock data
    }
  }

  const groupForecastByDay = (forecastList) => {
    const dailyData = {}

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000)
      const dayKey = date.toDateString()

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = []
      }
      dailyData[dayKey].push(item)
    })

    const result = Object.entries(dailyData)
      .slice(0, 7)
      .map(([dateKey, dayData], index) => {
        const temps = dayData.map((item) => item.main.temp)
        const high = Math.round(Math.max(...temps))
        const low = Math.round(Math.min(...temps))

        const conditions = dayData.map((item) => item.weather[0])
        const mainCondition = conditions[Math.floor(conditions.length / 2)]

        const date = new Date(dateKey)
        const dayName =
          index === 0 ? "Today" : index === 1 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "short" })

        const dateString =
          index === 0
            ? "Today"
            : index === 1
              ? "Tomorrow"
              : date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

        return {
          date: dateString,
          day: dayName,
          temp: Math.round(temps[Math.floor(temps.length / 2)]),
          high,
          low,
          condition: getWeatherCondition(mainCondition.main, mainCondition.id),
          description: mainCondition.description,
          precipitation: Math.round(Math.random() * 100),
        }
      })

    return result
  }

  const loadWeatherData = async (city) => {
    try {
      setLoading(true)
      setError(null)

      if (useRealAPI) {
        // Try real API first
        try {
          const currentData = await fetchCurrentWeather(city)
          setCurrentWeather(currentData)
          const forecastData = await fetchForecast(currentData.coordinates.lat, currentData.coordinates.lon)
          setForecast(forecastData)
        } catch (apiError) {
          console.log("API failed, falling back to mock data")
          loadMockData(city)
          return
        }
      } else {
        loadMockData(city)
        return
      }

      setSelectedDay(0)
    } catch (err) {
      setError(err.message)
      console.error("Weather data error:", err)
    } finally {
      setLoading(false)
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
  const backgroundStyle = weatherData ? getWeatherBackground(weatherData.condition) : getWeatherBackground("cloudy")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: backgroundStyle.background }}>
        <div className="glass-card p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white text-lg font-medium">Loading weather data...</p>
          {!useRealAPI && <p className="text-white-70 text-sm mt-2">Using demo data</p>}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: backgroundStyle.background }}
      >
        <div className="glass-card p-8 text-center max-w-md w-full">
          <p className="text-white text-lg mb-6">Error: {error}</p>
          <div className="space-y-3">
            <Button onClick={() => loadWeatherData(defaultLocations[0].name)} className="w-full glass-button" size="lg">
              Try Again
            </Button>
            <Button
              onClick={() => {
                setUseRealAPI(false)
                loadMockData(defaultLocations[0].name)
              }}
              variant="ghost"
              className="w-full glass-button-ghost"
              size="lg"
            >
              Use Demo Data
            </Button>
          </div>
          {!useRealAPI && (
            <p className="text-white-60 text-sm mt-4">Add your OpenWeatherMap API key to .env file for real data</p>
          )}
        </div>
      </div>
    )
  }

  if (!weatherData) return null

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: backgroundStyle.background }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{ background: backgroundStyle.pattern }} />

      {/* Weather Effects */}
      <WeatherEffects condition={weatherData.condition} intensity={1} />

      <div className="relative z-10 min-h-screen p-6 lg:p-8">
        {/* Desktop Layout */}
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-white-70" />
              <span className="text-white text-xl font-medium">
                {currentWeather?.city}, {currentWeather?.country}
              </span>
              {!useRealAPI && <span className="text-white-50 text-sm">(Demo)</span>}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Weather */}
            <div className="lg:col-span-2">
              {/* Main Weather Card */}
              <div
                className={`glass-card p-8 mb-6 transition-all duration-500 ${isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Left side - Weather info */}
                  <div className="text-center md:text-left">
                    {/* Today Dropdown */}
                    <div className="flex items-center justify-center md:justify-start mb-6">
                      <span className="text-white-80 text-xl font-medium">Today</span>
                    </div>

                    {/* Date and Time */}
                    <div className="mb-8">
                      <div className="text-white-90 text-lg mb-2">
                        {currentTime.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-white-60 text-sm">
                        {currentTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Temperature and Description */}
                    <div className="mb-6">
                      <div className="text-white text-9xl font-extralight mb-4 tracking-tight">
                        {weatherData.temperature}°
                      </div>
                      <div className="text-white-90 text-2xl capitalize font-light mb-2">{weatherData.description}</div>
                      <div className="text-white-70 text-base">Feels like {weatherData.feelsLike}° | Sunset 18:20</div>
                    </div>
                  </div>

                  {/* Right side - Weather icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      {getWeatherIcon(weatherData.condition, 200, true)}
                      <div className="absolute inset-0 bg-white-10 rounded-full blur-3xl scale-150 opacity-30"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly Forecast */}
              <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={18} className="text-white-70" />
                  <h3 className="text-white text-lg font-medium">24-hour forecast</h3>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2">
                  {hourlyData.map((hour, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 text-center p-4 rounded-xl bg-white-10 hover-bg-white-15 transition-all duration-300 min-w-20"
                    >
                      <div className="text-white-80 text-sm mb-3 font-medium">{hour.time}</div>
                      <div className="mb-3 flex justify-center">{getWeatherIcon(hour.condition, 24)}</div>
                      <div className="text-white text-lg font-semibold">{hour.temp}°</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Stats and Forecast */}
            <div className="space-y-6">
              {/* Weather Stats Grid */}
              <div className="glass-card p-6">
                <h3 className="text-white text-lg font-medium mb-6">Weather Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-stat-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets size={16} className="text-white-70" />
                      <span className="text-white-70 text-sm">Humidity</span>
                    </div>
                    <div className="text-white text-2xl font-semibold">{weatherData.humidity}%</div>
                  </div>

                  <div className="glass-stat-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Wind size={16} className="text-white-70" />
                      <span className="text-white-70 text-sm">Wind</span>
                    </div>
                    <div className="text-white text-2xl font-semibold">{weatherData.windSpeed} km/h</div>
                  </div>

                  <div className="glass-stat-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={16} className="text-white-70" />
                      <span className="text-white-70 text-sm">Visibility</span>
                    </div>
                    <div className="text-white text-2xl font-semibold">{weatherData.visibility} km</div>
                  </div>

                  <div className="glass-stat-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Thermometer size={16} className="text-white-70" />
                      <span className="text-white-70 text-sm">Feels like</span>
                    </div>
                    <div className="text-white text-2xl font-semibold">{weatherData.feelsLike}°</div>
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast */}
              {forecast.length > 0 && (
                <div className="glass-card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-white-70" />
                      <h3 className="text-white text-lg font-medium">7-day forecast</h3>
                    </div>
                    <Button size="sm" variant="ghost" onClick={handleLocationChange} className="glass-button-small">
                      Change Location
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {forecast.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handleDaySelect(index)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl glass-forecast-button ${
                          selectedDay === index ? "selected" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-white-80 text-sm font-medium min-w-16 text-left">
                            {index === 0 ? "Today" : day.day}
                          </div>
                          <div className="flex items-center gap-3">
                            {getWeatherIcon(day.condition, 20)}
                            <span className="text-white-70 text-sm">{day.description}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white text-sm font-semibold">{day.high}°</span>
                          <span className="text-white-60 text-sm">{day.low}°</span>
                          {day.precipitation > 0 && <span className="text-white-50 text-xs">{day.precipitation}%</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
