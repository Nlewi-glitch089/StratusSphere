# WeatherAPI.com Integration Setup

## Overview

StratusSphere now uses **weatherapi.com** for real-time weather forecasts (current conditions, hourly, and daily forecasts). ChatGPT handles all other AI-powered features (weather suggestions, outfit recommendations, scheduling).

## Setup Instructions

### 1. Get a Free API Key from WeatherAPI.com

1. Visit: https://www.weatherapi.com/
2. Click **"Sign Up"** (top right)
3. Create a free account (no credit card required)
4. Verify your email
5. Go to your **Dashboard** and copy your **API Key**

### 2. Configure Your Environment

#### Option A: Using `.env.local` (Recommended for Development)

Create a `.env.local` file in the root of your project:

```bash
# In c:\Projects\StratusSphere-3\.env.local

VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_WEATHERAPI_KEY=your_weatherapi_key_here
```

#### Option B: Using `.env` (For Production)

Add to your existing `.env` file:

```bash
VITE_WEATHERAPI_KEY=your_weatherapi_key_here
```

### 3. Verify the Setup

Start the development server and test:

```bash
npm run dev
```

- Try asking the app about weather in different cities
- Check that forecasts load correctly
- Open browser DevTools (F12) > Console to see any errors

## WeatherAPI.com Free Tier Limits

- **API Calls**: 1,000,000 per month
- **Forecast Days**: Up to 10 days
- **Hourly Data**: Available for all forecast days
- **Real-time Data**: Current conditions updated every 10-15 minutes
- **No Credit Card**: Completely free with no time limit

## API Response Structure

The weatherapi.com API returns data in this structure:

```json
{
	"location": {
		"name": "New York",
		"region": "New York",
		"country": "United States",
		"lat": 40.71,
		"lon": -74.01,
		"tz_id": "America/New_York",
		"localtime_epoch": 1234567890,
		"localtime": "2024-01-15 14:30"
	},
	"current": {
		"temp_c": 5.2,
		"temp_f": 41.4,
		"humidity": 72,
		"feelslike_c": 2.8,
		"feelslike_f": 37.0,
		"wind_kph": 12.5,
		"condition": {
			"text": "Partly cloudy",
			"icon": "//cdn.weatherapi.com/weather/128x128/day/302.png"
		}
	},
	"forecast": {
		"forecastday": [
			{
				"date": "2024-01-15",
				"day": {
					"maxtemp_c": 8.5,
					"mintemp_c": 3.2,
					"condition": {
						"text": "Partly cloudy",
						"icon": "//cdn.weatherapi.com/weather/128x128/day/302.png"
					}
				},
				"hour": [
					{
						"time": "2024-01-15 00:00",
						"temp_c": 4.2,
						"humidity": 70,
						"wind_kph": 10.5,
						"condition": {
							"text": "Clear",
							"icon": "//cdn.weatherapi.com/weather/128x128/night/113.png"
						}
					}
					// ... more hours
				]
			}
			// ... more days
		]
	}
}
```

## Code Integration

The integration replaces the Open-Meteo API calls with weatherapi.com in:

### File: `src/hooks/useWeatherChat.js`

**New Function**: `fetchWeatherFromWeatherAPI(city)`

- Replaces `fetchRealTimeWeather(city)`
- Calls: `https://api.weatherapi.com/v1/forecast.json`
- Returns standardized weather data object

**Updated Functions**:

- `getWeatherForCity(city)` - Now uses weatherapi.com
- `sendChatMessageWithCity(userMessage, conversationHistory, overrideCity)` - Pulls forecast from weatherapi.com

### Changes from Open-Meteo:

- ✅ No geocoding step needed (weatherapi.com handles city names directly)
- ✅ Simpler API call (single endpoint instead of two)
- ✅ Faster response times
- ✅ More detailed weather icons
- ✅ Better condition descriptions

## Troubleshooting

### Error: "VITE_WEATHERAPI_KEY is not defined"

**Solution**: Make sure your `.env.local` file is in the root directory and contains:

```
VITE_WEATHERAPI_KEY=your_actual_key_here
```

Restart the dev server after adding the env variable.

### Error: "Weather data not available"

**Solution**:

- Verify your API key is correct
- Check your remaining API calls at https://www.weatherapi.com/my/account.jsp
- Ensure the city name is valid (try a major city like "London" or "Tokyo")

### Missing Forecast Data

**Solution**: The API might be returning incomplete data. Check:

- Browser Console for API response errors
- That you're requesting a valid forecast day (current day to +10 days)
- Your API key has forecast access enabled

## Features Supported by ChatGPT

ChatGPT still handles:

- ✅ Weather-based outfit recommendations
- ✅ Activity suggestions based on forecast
- ✅ Personalized weather advice
- ✅ Schedule creation and management
- ✅ Natural language processing
- ✅ City slang recognition (NYC → New York, etc.)

## API Documentation

For more details on weatherapi.com capabilities:

- Full Documentation: https://www.weatherapi.com/docs/
- API Console: https://www.weatherapi.com/api-explorer.aspx
- Postman Collection: https://www.getpostman.com/collections/f5e2e0aded98ba47a4da

## Costs

**WeatherAPI.com Free Tier**:

- No payment required
- 1 million API calls per month
- Current conditions + 10-day forecast
- Hourly data available
- Perfect for development and small applications

## FAQ

**Q: Will I run out of API calls?**
A: With 1 million calls/month, you can make ~33,000 calls per day. Most users won't exceed this.

**Q: Can I use this for production?**
A: Yes! The free tier works for small to medium applications. Consider upgrading if you expect high traffic.

**Q: How often is weather data updated?**
A: Current conditions update every 10-15 minutes. Forecasts update every few hours.

---

Need help? Check the console logs in your browser (F12 > Console) for debugging information.
