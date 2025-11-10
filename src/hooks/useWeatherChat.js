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
    const apiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    
    if (!apiKey) {
      throw new Error(
        'VITE_WEATHERAPI_KEY is not configured. Please add it to your .env.local file. ' +
        'Get a free key at https://www.weatherapi.com/'
      );
    }

    // Call WeatherAPI.com forecast endpoint
    // days=10 for 10-day forecast, aqi=yes for air quality index
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?` +
      `key=${apiKey}&` +
      `q=${encodeURIComponent(city)}&` +
      `days=10&` +
      `aqi=yes&` +
      `alerts=yes`
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          'WeatherAPI.com API key is invalid. Please verify your VITE_WEATHERAPI_KEY in .env.local'
        );
      } else if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(`City not found: ${errorData.error?.message || city}`);
      }
      throw new Error(`WeatherAPI.com error: ${response.statusText}`);
    }

    const weatherData = await response.json();
    console.log("WeatherAPI.com data received:", weatherData);

    // Validate we have the expected data structure
    if (!weatherData.location || !weatherData.current || !weatherData.forecast) {
      throw new Error("Invalid weather data structure from WeatherAPI.com");
    }

    console.log(
      `Processing weather for ${weatherData.location.name}: ` +
      `Current: ${weatherData.current.temp_c}°C, ` +
      `Forecast: ${weatherData.forecast.forecastday.length} days`
    );

    // Transform WeatherAPI.com response to our standard format
    return {
      location: {
        name: weatherData.location.name,
        region: weatherData.location.region,
        country: weatherData.location.country,
        latitude: weatherData.location.lat,
        longitude: weatherData.location.lon,
        timezone: weatherData.location.tz_id,
      },
      current: {
        temp_c: weatherData.current.temp_c,
        temp_f: weatherData.current.temp_f,
        humidity: weatherData.current.humidity,
        wind_kph: weatherData.current.wind_kph,
        feelslike_c: weatherData.current.feelslike_c,
        feelslike_f: weatherData.current.feelslike_f,
        condition: {
          text: weatherData.current.condition.text,
          icon: weatherData.current.condition.icon,
        },
        aqi: weatherData.current.air_quality ? {
          us_epa_index: weatherData.current.air_quality['us-epa-index'],
          gb_defra_index: weatherData.current.air_quality['gb-defra-index'],
        } : null,
      },
      forecast: {
        forecastday: weatherData.forecast.forecastday.map((day, idx) => ({
          date: day.date,
          day: {
            maxtemp_c: day.day.maxtemp_c,
            mintemp_c: day.day.mintemp_c,
            avgtemp_c: day.day.avgtemp_c,
            avghumidity: day.day.avghumidity,
            condition: {
              text: day.day.condition.text,
              icon: day.day.condition.icon,
            },
            daily_chance_of_rain: day.day.daily_chance_of_rain,
            daily_chance_of_snow: day.day.daily_chance_of_snow,
          },
          // Hourly data for each day
          hour: day.hour.map((hour) => ({
            time: hour.time,
            temp_c: hour.temp_c,
            temp_f: hour.temp_f,
            humidity: hour.humidity,
            wind_kph: hour.wind_kph,
            condition: {
              text: hour.condition.text,
              icon: hour.condition.icon,
            },
            chance_of_rain: hour.chance_of_rain,
            chance_of_snow: hour.chance_of_snow,
          })),
        })),
      },
      alerts: weatherData.alerts?.alert || [],
    };
  } catch (error) {
    console.error("Error fetching weather from WeatherAPI.com:", error);
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
  console.log(`Extracting city from message: "${message}"`);
  
  // Clean message
  const msg = message.toLowerCase();

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

  // Strategy 0: Check for ZIP codes (5 digits)
  const zipMatch = message.match(/\b(\d{5})\b/);
  if (zipMatch) {
    console.log(`Detected ZIP code: ${zipMatch[1]}`);
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