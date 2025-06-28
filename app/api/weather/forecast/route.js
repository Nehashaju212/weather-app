import { NextResponse } from "next/server"

const API_KEY = process.env.OPENWEATHER_API_KEY
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!API_KEY) {
    return NextResponse.json({ error: "OpenWeatherMap API key not configured" }, { status: 500 })
  }

  if (!lat || !lon) {
    return NextResponse.json({ error: "Coordinates are required for forecast" }, { status: 400 })
  }

  try {
    const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`)
    }

    const data = await response.json()

    // Group forecast data by day and get daily highs/lows
    const dailyForecasts = groupForecastByDay(data.list)

    return NextResponse.json(dailyForecasts)
  } catch (error) {
    console.error("Forecast API error:", error)
    return NextResponse.json({ error: "Failed to fetch forecast data" }, { status: 500 })
  }
}

function groupForecastByDay(forecastList) {
  const dailyData = {}
  const today = new Date()

  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000)
    const dayKey = date.toDateString()

    if (!dailyData[dayKey]) {
      dailyData[dayKey] = []
    }
    dailyData[dayKey].push(item)
  })

  const result = Object.entries(dailyData)
    .slice(0, 7) // Get first 7 days
    .map(([dateKey, dayData], index) => {
      const temps = dayData.map((item) => item.main.temp)
      const high = Math.round(Math.max(...temps))
      const low = Math.round(Math.min(...temps))

      // Get the most common weather condition for the day
      const conditions = dayData.map((item) => item.weather[0])
      const mainCondition = conditions[Math.floor(conditions.length / 2)] // Middle of day

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
        precipitation: Math.round(Math.random() * 100), // Simplified for demo
      }
    })

  return result
}

function getWeatherCondition(main, id) {
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
