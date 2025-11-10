import React from 'react';

/**
 * Utility to handle OpenAI chat integration for weather queries
 * WeatherAPI.com provides real-time weather data and forecasts
 * ChatGPT handles outfit suggestions, activity recommendations, and scheduling
 */

/**
 * Fetch REAL-TIME weather data and forecast using WeatherAPI.com
 * Free tier: 1 million API calls/month, 10-day forecast, hourly data
 */
async function fetchWeatherFromWeatherAPI(city) {
  try {
    // Geocode the city to get coordinates
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      console.warn(`City not found: ${city}`);
      return null;
    }

    const { latitude, longitude, name, country, admin1 } = geoData.results[0];
    console.log(`Found: ${name}, ${admin1}, ${country} (${latitude}, ${longitude})`);

    // Fetch real-time weather with comprehensive current conditions and detailed forecast
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,weather_code,is_day,cloud_cover,pressure_msl,apparent_temperature,precipitation&forecast_days=7&hourly=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&timeformat=iso8601`
    );

    if (!weatherResponse.ok) {
      console.warn("Open-Meteo API error");
      return null;
    }

    const weatherData = await weatherResponse.json();
    console.log("Real-time weather data:", weatherData);
    console.log("Hourly times sample:", weatherData.hourly.time.slice(0, 5));
    console.log("Daily times:", weatherData.daily.time);

    // Validate we have the expected data structure from Open-Meteo
    if (!weatherData.current || !weatherData.hourly || !weatherData.daily) {
      throw new Error("Invalid weather data structure from Open-Meteo API");
    }

    console.log(`Processing weather data for ${name}: ${weatherData.hourly.time.length} hourly points, ${weatherData.daily.time.length} daily points`);

    // Helper function to get weather description and emoji from weather code
    const getWeatherInfo = (weatherCode) => {
      const weatherMap = {
        0: { text: "Clear sky", emoji: "☀️" },
        1: { text: "Mainly clear", emoji: "🌤️" },
        2: { text: "Partly cloudy", emoji: "⛅" },
        3: { text: "Overcast", emoji: "☁️" },
        45: { text: "Foggy", emoji: "🌫️" },
        48: { text: "Foggy", emoji: "🌫️" },
        51: { text: "Light drizzle", emoji: "🌦️" },
        53: { text: "Moderate drizzle", emoji: "🌦️" },
        55: { text: "Dense drizzle", emoji: "🌧️" },
        61: { text: "Slight rain", emoji: "🌦️" },
        63: { text: "Moderate rain", emoji: "🌧️" },
        65: { text: "Heavy rain", emoji: "⛈️" },
        71: { text: "Slight snow", emoji: "🌨️" },
        73: { text: "Moderate snow", emoji: "❄️" },
        75: { text: "Heavy snow", emoji: "❄️" },
        80: { text: "Slight rain showers", emoji: "🌦️" },
        81: { text: "Moderate rain showers", emoji: "🌧️" },
        82: { text: "Violent rain showers", emoji: "⛈️" },
        85: { text: "Slight snow showers", emoji: "🌨️" },
        86: { text: "Heavy snow showers", emoji: "❄️" },
        95: { text: "Thunderstorm", emoji: "⛈️" },
        96: { text: "Thunderstorm with hail", emoji: "⛈️" },
        99: { text: "Thunderstorm with hail", emoji: "⛈️" },
      };
      return weatherMap[weatherCode] || { text: "Unknown", emoji: "🌤️" };
    };

    return {
      location: { name, region: admin1, country, latitude, longitude },
      current: {
        temp_c: weatherData.current.temperature_2m,
        temp_f: Math.round(weatherData.current.temperature_2m * 9/5 + 32),
        humidity: weatherData.current.relative_humidity_2m,
        wind_kph: weatherData.current.wind_speed_10m,
        wind_degree: weatherData.current.wind_direction_10m,
        feelslike_c: weatherData.current.apparent_temperature,
        feelslike_f: Math.round(weatherData.current.apparent_temperature * 9/5 + 32),
        is_day: weatherData.current.is_day,
        cloud_cover: weatherData.current.cloud_cover,
        pressure_mb: weatherData.current.pressure_msl,
        precip_mm: weatherData.current.precipitation,
        condition: (() => {
          const info = getWeatherInfo(weatherData.current.weather_code);
          return {
            text: info.text,
            icon: info.emoji,
            code: weatherData.current.weather_code,
          };
        })(),
      },
      forecast: {
        forecastday: weatherData.daily.time.map((date, idx) => ({
          date: date,
          day: {
            maxtemp_c: weatherData.daily.temperature_2m_max[idx],
            mintemp_c: weatherData.daily.temperature_2m_min[idx],
            avgtemp_c: (weatherData.daily.temperature_2m_max[idx] + weatherData.daily.temperature_2m_min[idx]) / 2,
            avghumidity: 0,
            precip_mm: weatherData.daily.precipitation_sum[idx],
            wind_kph_max: weatherData.daily.wind_speed_10m_max[idx],
            condition: (() => {
              const info = getWeatherInfo(weatherData.daily.weather_code[idx]);
              return {
                text: info.text,
                icon: info.emoji,
                code: weatherData.daily.weather_code[idx],
              };
            })(),
            daily_chance_of_rain: 0,
            daily_chance_of_snow: 0,
          },
          // Hourly data for each day
          hour: weatherData.hourly.time
            .map((time, hourIdx) => {
              // Check if this hour belongs to this day
              if (!time.startsWith(date)) return null;
              
              return {
                time: time,
                temp_c: weatherData.hourly.temperature_2m[hourIdx],
                temp_f: Math.round(weatherData.hourly.temperature_2m[hourIdx] * 9/5 + 32),
                humidity: weatherData.hourly.relative_humidity_2m[hourIdx],
                wind_kph: weatherData.hourly.wind_speed_10m[hourIdx],
                condition: (() => {
                  const info = getWeatherInfo(weatherData.hourly.weather_code[hourIdx]);
                  return {
                    text: info.text,
                    icon: info.emoji,
                    code: weatherData.hourly.weather_code[hourIdx],
                  };
                })(),
                chance_of_rain: 0,
                chance_of_snow: 0,
              };
            })
            .filter(Boolean),
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching real-time weather:", error);
    return null;
  }
}

/**
 * Enhanced sendChatMessage with REAL-TIME weather context
 */
export async function sendChatMessage(userMessage, conversationHistory) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to .env");
  }

  try {
    // Extract city/location from user message
    const city = extractCityName(userMessage);
    console.log(`User message: "${userMessage}"`);
    console.log(`Extracted city: "${city}"`);
    let weatherContext = "";

    // If a location is found, fetch REAL-TIME weather
    if (city) {
      try {
        console.log(`Fetching real-time weather for: ${city}`);
        const realWeather = await fetchWeatherFromWeatherAPI(city);
        if (realWeather) {
          console.log(`Successfully fetched weather for: ${realWeather.location.name}`);
          weatherContext = `
[REAL-TIME WEATHER DATA for ${realWeather.location.name}, ${realWeather.location.region || ""} ${realWeather.location.country}]
Current: ${Math.round(realWeather.current.temp_c)}°C (${realWeather.current.temp_f}°F), ${realWeather.current.condition.text}
Humidity: ${realWeather.current.humidity}%
Wind: ${Math.round(realWeather.current.wind_kph)} kph
Feels like: ${Math.round(realWeather.current.feelslike_c)}°C
`;
        } else {
          console.log(`No weather data returned for: ${city}`);
        }
      } catch (weatherError) {
        console.warn("Could not fetch real-time weather:", weatherError);
        // Continue without real-time data
      }
    } else {
      console.log("No city detected in user message");
    }

    // Send to OpenAI with real-time data context
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Storm, a personal weather and activity assistant chatbot! 🌤️ You help users plan their day based on weather conditions by:

🗓️ **Building personalized schedules** - Create detailed daily plans based on weather and user preferences
👔 **Recommending outfits** - Suggest appropriate clothing for the weather conditions
🎯 **Activity suggestions** - Recommend indoor/outdoor activities based on weather
📍 **Location-specific advice** - Provide hyper-local recommendations

${weatherContext ? "You have REAL-TIME weather data. Use this accurate current data in your responses." : "Use typical weather patterns for your area."}

**Response Format:**
- Use emojis to make responses engaging (🌟, ⛅, 🧥, 🏃‍♂️, etc.)
- Structure responses with clear sections when building schedules
- Be conversational and friendly
- Ask follow-up questions to personalize recommendations
- Include specific times for activities when building schedules

**Example interactions:**
- "Plan my day" → Create a full schedule with activities
- "What should I wear?" → Outfit recommendations with reasons
- "Activities for today?" → Weather-appropriate activity suggestions

${weatherContext ? "\n" + weatherContext : ""}`,
          },
          ...conversationHistory,
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from OpenAI");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return { assistantMessage, city };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

/**
 * Extract city/location name from user message (supports city names and ZIP codes)
 */
function extractCityName(message) {
  const msg = message.toLowerCase();
  console.log(`Extracting city from message: "${message}"`);
  
  // Common city slang/nicknames mapping to full names
  const citySlangMap = {
    'philly': 'Philadelphia',
    'phili': 'Philadelphia',
    'ny': 'New York',
    'nyc': 'New York',
    'la': 'Los Angeles',
    'sf': 'San Francisco',
    'frisco': 'San Francisco',
    'dc': 'Washington',
    'chi': 'Chicago',
    'chi-town': 'Chicago',
    'atl': 'Atlanta',
    'bos': 'Boston',
    'dfw': 'Dallas',
    'dtw': 'Detroit',
    'mia': 'Miami',
    'sea': 'Seattle',
    'pdx': 'Portland',
    'Vegas': 'Las Vegas',
    'vegas': 'Las Vegas',
    'sin city': 'Las Vegas',
    'la': 'Los Angeles',
    'sd': 'San Diego',
    'mke': 'Milwaukee',
    'phl': 'Philadelphia',
    'hou': 'Houston',
    'aus': 'Austin',
    'den': 'Denver',
    'phoenix': 'Phoenix',
    'phoenix': 'Phoenix',
    'phx': 'Phoenix',
    'mpls': 'Minneapolis',
    'stl': 'Saint Louis',
    'nola': 'New Orleans',
    'big apple': 'New York',
    'windy city': 'Chicago',
    'city of angels': 'Los Angeles',
    'bean town': 'Boston',
    'music city': 'Nashville',
    'ptown': 'Portland',
  };

  // Check for slang first
  for (const [slang, fullName] of Object.entries(citySlangMap)) {
    if (msg.includes(slang.toLowerCase())) {
      console.log(`Detected city slang: "${slang}" → "${fullName}"`);
      return fullName;
    }
  }

  // Common weather-related keywords to avoid
  const weatherKeywords = ['weather', 'climate', 'forecast', 'temperature', 'conditions', 'rain', 'snow', 'hot', 'cold', 'is', 'it', 'what', 'how', 'the', 'today', 'tomorrow', 'now'];

  // Strategy 0: Check for 5-digit ZIP codes
  const zipMatch = message.match(/\b(\d{5})\b/);
  if (zipMatch) {
    console.log(`🔍 Detected ZIP code: ${zipMatch[1]}`);
    return zipMatch[1];
  }

  // Strategy 1: Direct patterns - improved and more comprehensive
  const directPatterns = [
    // "weather in [City]", "forecast for [City]", etc.
    /(?:weather|forecast|climate|conditions?|temperature)\s+(?:in|for|at|near|of)\s+([A-Za-z][A-Za-z\s,.-]+?)(?:\s*[\?\.]?\s*$|\s+(?:weather|forecast|climate|today|tomorrow|now|is|please))/i,
    // "in [City] weather", "[City] weather"
    /(?:^|\s)(?:in\s+)?([A-Za-z][A-Za-z\s,.-]+?)\s+(?:weather|forecast|climate|conditions?|temperature)/i,
    // "How's [City]", "What's the weather in [City]"
    /(?:how'?s|what'?s)\s+(?:the\s+)?(?:weather\s+)?(?:in\s+|for\s+|at\s+)?([A-Za-z][A-Za-z\s,.-]+?)(?:\s*[\?\.]?\s*$|\s+(?:like|today|now))/i,
    // Just a city name by itself or with minimal context
    /^([A-Za-z][A-Za-z\s,.-]+?)(?:\s*[\?\.]?\s*$)/i,
  ];

  for (const pattern of directPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      let city = match[1].trim();
      
      // Clean up the city name
      city = city.replace(/[,.\?!]+$/, ''); // Remove trailing punctuation
      city = city.replace(/^\s*(?:the\s+)?/i, ''); // Remove leading "the"
      
      // Split on comma and take first part (city, state -> city)
      city = city.split(/,\s*/)[0].trim();
      
      // Validate it's a reasonable city name
      if (city.length >= 2 && 
          !weatherKeywords.includes(city.toLowerCase()) &&
          /^[A-Za-z][A-Za-z\s.-]*$/.test(city)) {
        console.log(`Extracted city: "${city}"`);
        return city;
      }
    }
  }

  // Strategy 2: Look for proper nouns (capitalized words) after location prepositions
  const properNounPattern = /(?:in|for|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)/g;
  const properNounMatches = [...message.matchAll(properNounPattern)];
  
  for (const match of properNounMatches) {
    if (match[1]) {
      const city = match[1].trim();
      if (city.length > 2 && !weatherKeywords.includes(city.toLowerCase())) {
        console.log(`Found proper noun city: "${city}"`);
        return city;
      }
    }
  }

  // Strategy 3: If the message is mostly just a city name (fallback)
  const words = message.trim().split(/\s+/);
  if (words.length <= 3) {
    const potentialCity = words.find(word => 
      word.length >= 2 && 
      /^[A-Za-z][A-Za-z.-]*$/.test(word) &&
      !weatherKeywords.includes(word.toLowerCase())
    );
    
    if (potentialCity) {
      console.log(`Fallback city detection: "${potentialCity}"`);
      return potentialCity;
    }
  }

  console.log("No city found in message");
  return null;
}

/**
 * Fetch real-time weather data for a city
 */
export async function getWeatherForCity(city) {
  if (!city) {
    console.log("No city provided");
    return null;
  }

  try {
    console.log(`Fetching weather for: "${city}" using WeatherAPI.com`);
    const weather = await fetchWeatherFromWeatherAPI(city);
    return weather;
  } catch (error) {
    console.warn(`Could not fetch weather data for "${city}":`, error);
    return null;
  }
}

/**
 * Enhanced sendChatMessage that allows manual city override
 */
export async function sendChatMessageWithCity(userMessage, conversationHistory, overrideCity = null) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to .env");
  }

  try {
    // Use override city or extract from message
    const city = overrideCity || extractCityName(userMessage);
    console.log(`Using city: "${city}" (override: ${!!overrideCity})`);
    let weatherContext = "";

    // If a location is found, fetch REAL-TIME weather from WeatherAPI.com
    if (city) {
      try {
        console.log(`Fetching real-time weather for: ${city}`);
        const realWeather = await fetchWeatherFromWeatherAPI(city);
        if (realWeather) {
          console.log(`Successfully fetched weather for: ${realWeather.location.name}`);
          weatherContext = `
[REAL-TIME WEATHER DATA for ${realWeather.location.name}, ${realWeather.location.region || ""} ${realWeather.location.country}]
Current: ${Math.round(realWeather.current.temp_c)}°C (${realWeather.current.temp_f}°F), ${realWeather.current.condition.text}
Humidity: ${realWeather.current.humidity}%
Wind: ${Math.round(realWeather.current.wind_kph)} kph
Feels like: ${Math.round(realWeather.current.feelslike_c)}°C
`;
        }
      } catch (weatherError) {
        console.warn("Could not fetch real-time weather:", weatherError);
      }
    }

    // Send to OpenAI with real-time data context
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Storm, a personal weather and activity assistant chatbot! 🌤️ You help users plan their day based on weather conditions by:

🗓️ **Building personalized schedules** - Create detailed daily plans based on weather and user preferences
👔 **Recommending outfits** - Suggest appropriate clothing for the weather conditions
🎯 **Activity suggestions** - Recommend indoor/outdoor activities based on weather
📍 **Location-specific advice** - Provide hyper-local recommendations

${weatherContext ? "You have REAL-TIME weather data. Use this accurate current data in your responses." : "Use typical weather patterns for your area."}

**Response Format:**
- Use emojis to make responses engaging (🌟, ⛅, 🧥, 🏃‍♂️, etc.)
- Structure responses with clear sections when building schedules
- Be conversational and friendly
- Ask follow-up questions to personalize recommendations
- Include specific times for activities when building schedules

**Example interactions:**
- "Plan my day" → Create a full schedule with activities
- "What should I wear?" → Outfit recommendations with reasons
- "Activities for today?" → Weather-appropriate activity suggestions

${weatherContext ? "\n" + weatherContext : ""}`,
          },
          ...conversationHistory,
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from OpenAI");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return { assistantMessage, city };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}