# ☁️ StratusSphere

**Real-Time Weather, Reimagined.**

StratusSphere is a responsive and visually engaging weather web application built with React to make climate data feel dynamic, personal, and accessible. It provides accurate forecasts, smooth transitions, and interactive visuals that adapt to user input and changing weather conditions. Designed for clarity and immersion, StratusSphere transforms traditional weather tracking into an experience that blends information with atmosphere.

## 🌦️ Features

- **Real-Time Weather Data**: WeatherAPI.com integration with 10-day forecast and hourly data
- **AI-Powered Assistance**: ChatGPT provides weather-based outfit recommendations, activity suggestions, and personalized scheduling
- **Interactive Search**: Look up weather details by city with instant updates on temperature, conditions, and forecasts
- **Dynamic Icons & Backgrounds**: Visuals adjust based on weather type (sunny, cloudy, rainy, etc.) for immersion
- **Smart Schedule Editor**: AI-generated schedules with auto-populated weather and outfit suggestions
- **Responsive Design**: Optimized for desktop and mobile with seamless performance across all devices
- **Smooth UI Experience**: Intuitive layouts and animated hover effects enhance usability and flow

## 🧠 Project Architecture

- **Weather Data**: WeatherAPI.com handles all real-time forecasts (current, hourly, daily, 10-day)
- **AI Intelligence**: ChatGPT provides weather analysis, outfit recommendations, activity suggestions, and schedule creation
- **Schedule Management**: AI-generated schedules auto-populate with weather and outfit data
- **Outfit Visualization**: Unsplash API provides images for outfit suggestions

## 🧩 Tech Stack

- **Frontend Framework**: React 18 with Hooks
- **Styling**: CSS3 with animations and responsive design
- **APIs**:
  - **WeatherAPI.com**: Real-time weather data (free tier, no credit card)
  - **OpenAI GPT-4o-mini**: AI chat and suggestions
  - **Unsplash API**: Outfit images
- **Build Tool**: Vite
- **Version Control**: GitHub / Git

## 📂 Project Structure

```
src/
├── components/
│   ├── ChatBubble.jsx       → AI chat interface with schedule detection
│   ├── ScheduleTable.jsx    → Interactive schedule editor with drag-and-drop
│   ├── WeatherCard.jsx      → Weather display card
│   ├── SearchBar.jsx        → Location search with smart detection
│   └── HourlyLineChart.jsx  → Forecast visualization
├── hooks/
│   ├── useWeatherChat.js    → WeatherAPI.com integration + ChatGPT
│   └── useWeatherData.js    → Weather state management
├── styles/
│   ├── App.css              → Main styles
│   └── index.css            → Global styles
├── App.jsx                  → Root component
└── main.jsx                 → Entry point
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Create a `.env.local` file in the project root:

```env
# OpenAI API Key - Get from https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=sk-proj-your-key-here

# WeatherAPI.com Key - Get from https://www.weatherapi.com/
# Free tier: 1 million calls/month, 10-day forecast, hourly data
VITE_WEATHERAPI_KEY=your-key-here

# Unsplash API Key - Get from https://unsplash.com/developers
# (Optional - falls back to generic outfit image if missing)
VITE_UNSPLASH_KEY=your-key-here
```

**See [WEATHERAPI_SETUP.md](./WEATHERAPI_SETUP.md) for detailed WeatherAPI.com setup instructions.**

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📖 How It Works

### Weather Forecasting

1. User enters a city or asks about weather
2. SearchBar detects location input and converts to weather query
3. App calls WeatherAPI.com for real-time data
4. Forecast displays as interactive cards and hourly charts

### AI Assistance

1. User asks for schedule, outfit, or activity recommendations
2. ChatGPT receives real-time weather context from WeatherAPI.com
3. AI generates personalized suggestions (weather notes, outfits, activities)
4. For schedules: Each item auto-generates weather + outfit suggestions + images

### Smart Schedules

1. User asks AI to create a schedule (e.g., "Plan my day in NYC")
2. AI generates schedule structure with times and activities
3. For each item: Weather and outfit are auto-generated from WeatherAPI.com data
4. Outfit images fetch from Unsplash
5. User can edit, reorder, or delete items in the interactive editor

## 🎨 Key Features in Detail

### Real-Time Weather Integration

- Automatic city detection from user input
- City slang recognition (philly → Philadelphia, NYC → New York, etc.)
- 10-day forecast with hourly breakdowns
- Current conditions: temperature, humidity, wind speed, "feels like"
- Weather alerts and severe weather notifications

### AI-Powered Suggestions

- **Weather Analysis**: Current conditions + forecast context
- **Outfit Recommendations**: Weather-appropriate clothing suggestions (2 sentences max)
- **Activity Ideas**: Indoor/outdoor activities based on forecast
- **Schedule Builder**: Auto-creates detailed daily plans with times

### Interactive Schedule Editor

- Drag-and-drop row and column reordering
- AI-powered field editing with loading states
- Visual feedback for editing and drag operations
- Pre-loaded with weather, outfit, and images when created by AI

## 🔑 API Keys Required

### WeatherAPI.com (Required)

- **Cost**: Free tier (1 million calls/month)
- **Signup**: https://www.weatherapi.com/
- **Documentation**: https://www.weatherapi.com/docs/
- **Features**: Current weather, 10-day forecast, hourly data, alerts

### OpenAI API (Required)

- **Cost**: Pay-as-you-go (~$0.01 per chat message)
- **Signup**: https://platform.openai.com/
- **Model**: gpt-4o-mini (fast and affordable)

### Unsplash API (Optional)

- **Cost**: Free tier (50 requests/hour)
- **Signup**: https://unsplash.com/developers
- **Used for**: Outfit suggestion images

## 📚 Documentation

- **[WEATHERAPI_SETUP.md](./WEATHERAPI_SETUP.md)** - WeatherAPI.com configuration and troubleshooting
- **[COPILOTINSTRUCTIONS.md](./COPILOTINSTRUCTIONS.md)** - Development guidelines and coding standards

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

**Important**: Add your environment variables in Vercel dashboard:

- `VITE_OPENAI_API_KEY`
- `VITE_WEATHERAPI_KEY`
- `VITE_UNSPLASH_KEY` (optional)

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

Add environment variables in Netlify Site Settings > Build & Deploy > Environment.

## 🐛 Troubleshooting

### Weather not loading?

- Check browser console (F12) for API errors
- Verify WeatherAPI.com key is correct and in `.env.local`
- Try a major city name (e.g., "London", "Tokyo")

### AI responses are slow?

- OpenAI API might be under load
- Check your API key has sufficient credits
- Weather context fetching might be slow (check network tab)

### Outfit images not showing?

- Falls back to generic image if Unsplash API not configured
- Add `VITE_UNSPLASH_KEY` to `.env.local` for custom images
- Check browser console for image fetch errors

## 🎯 Future Enhancements

- User accounts and saved preferences
- Multiple schedule management
- Weather alerts and notifications
- Dark/light mode toggle
- Map-based location selection
- Historical weather analysis
- Social sharing of schedules

## 👥 Team & Collaboration

**Team Stratus: StormStream**

This project demonstrates collaborative development with:

- Responsive component architecture
- Seamless API integration
- Interactive UI/UX design
- Comprehensive error handling

---

**Happy coding! Let's make StratusSphere shine! 🌟**
