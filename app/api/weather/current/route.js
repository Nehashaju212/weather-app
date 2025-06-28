import { NextResponse } from "next/server"

const API_KEY = process.env.OPENWEATHER_API_KEY
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!API_KEY) {
    return NextResponse.json({ error: "OpenWeatherMap API key not configured" }, { status: 500 })
  }

  if (!city && (!lat || !lon)) {
    return NextResponse.json({ error: "City name or coordinates are required" }, { status: 400 })
  }

  try {
    let url = `${BASE_URL}/weather?appid=${API_KEY}&units=metric`

    if (city) {
      url += `&q=${encodeURIComponent(city)}`
    } else {
      url += `&lat=${lat}&lon=${lon}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "City not found" }, { status: 404 })
      }
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to match our app's format
    const transformedData = {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      condition: getWeatherCondition(data.weather[0].main, data.weather[0].id),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      visibility: Math.round(data.visibility / 1000), // Convert m to km
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      uvIndex: 5, // OpenWeatherMap doesn't provide UV in free tier
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

function getWeatherCondition(main, id) {
  // Map OpenWeatherMap conditions to our app's conditions
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
