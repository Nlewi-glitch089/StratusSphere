# ☁️ StratusSphere

**Real-Time Weather, Reimagined.**

StratusSphere is a responsive and visually engaging weather web application built with React to make climate data feel dynamic, personal, and accessible. It provides accurate forecasts, smooth transitions, and interactive visuals that adapt to user input and changing weather conditions. Designed for clarity and immersion, StratusSphere transforms traditional weather tracking into an experience that blends information with atmosphere.

## 🌦️ Features

### Weather & Forecasting

- **Real-Time Weather Data**: Open-Meteo API integration with 7-day forecast and hourly data
- **WMO Weather Code Mapping**: Accurate emoji/icon display for weather conditions (☀️ sunny, ⛅ cloudy, 🌧️ rainy, ⛈️ thunderstorm, etc.)
- **Interactive Search**: Look up weather details by city with instant updates on temperature, conditions, and forecasts
- **Hourly Forecast Charts**: Canvas-based line chart visualization showing temperature trends throughout the day
- **Day Selection Tabs**: Browse 7-day forecast with easy day navigation

### AI & Personalization

- **AI-Powered Assistance**: ChatGPT provides weather-based outfit recommendations, activity suggestions, and personalized scheduling
- **Draggable Chat Bubble**: Resizable and repositionable chat interface with full conversation history
- **Smart Schedule Editor**: AI-generated schedules with auto-populated weather and outfit suggestions
- **Quick Action Buttons**: Export, print, and schedule editing with visual feedback

### UI/UX & Theming

- **Dark/Light Mode Toggle**: Complete theme system with persistent user preferences
- **Animated Backgrounds**:
  - **Light Mode**: Floating bubbles that drift across the page with smooth fading
  - **Dark Mode**: Twinkling stars creating a night sky atmosphere
- **Responsive Design**: Optimized for desktop and mobile with seamless performance across all devices
- **Smooth UI Experience**: Intuitive layouts and animated hover effects enhance usability and flow
- **Theme-Matched Components**: All buttons and UI elements adapt to light/dark theme colors

### Chat & Interaction

- **Smart Chat Opening**: Chatbot opens when search bar button is clicked (with or without text input)
- **Persistent Chat State**: Chat messages persist while navigating, close button for hiding
- **AI Context Awareness**: Chat sends real-time weather data to ChatGPT for context-aware responses

## 🧠 Project Architecture

- **Weather Data**: Open-Meteo API handles all real-time forecasts (current, hourly, daily, 7-day)
- **Weather Code System**: WMO weather codes mapped to descriptive emoji and text for visual clarity
- **AI Intelligence**: ChatGPT provides weather analysis, outfit recommendations, activity suggestions, and schedule creation
- **Schedule Management**: AI-generated schedules auto-populate with weather and outfit data
- **State Management**: React Context API for temperature unit and theme preferences (TemperatureContext, ThemeContext)
- **Background Animation**: Fixed position animated elements (bubbles/stars) that move independently of page content

## 🧩 Tech Stack

- **Frontend Framework**: React 18 with Hooks
- **Styling**: CSS3 with animations, flexbox, and responsive design
- **State Management**: React Context API (TemperatureContext, ThemeContext)
- **APIs**:
  - **Open-Meteo API**: Real-time weather data (free, no API key required, 7-day forecast)
  - **OpenAI GPT-4o-mini**: AI chat and suggestions
  - **Unsplash API**: Outfit images (optional fallback)
- **Build Tool**: Vite
- **Version Control**: GitHub / Git
- **Canvas**: HTML5 Canvas for hourly temperature charts

## 📂 Project Structure

```
src/
├── components/
│   ├── App.jsx                    → Root component with state management
│   ├── BackgroundAnimation.jsx    → Animated bubbles (light) / stars (dark)
│   ├── ChatBubble.jsx             → Draggable AI chat interface
│   ├── ChatBox.jsx                → Chat message display
│   ├── ScheduleTable.jsx          → Interactive schedule editor
│   ├── WeatherCard.jsx            → Weather display with emoji icons
│   ├── SearchBar.jsx              → Location search with smart detection
│   ├── HourlyLineChart.jsx        → Canvas-based temperature chart
│   ├── Settings.jsx               → Theme & temperature unit toggle
│   ├── About.jsx                  → App information & features
│   └── Chat-related components
├── hooks/
│   ├── useWeatherChat.js          → Open-Meteo API + ChatGPT integration
│   ├── useWeatherData.js          → Weather state management
│   └── useWeatherData.js          → Utility functions
├── context/
│   ├── TemperatureContext.jsx     → Manages F/C temperature unit
│   └── ThemeContext.jsx           → Manages dark/light theme
├── styles/
│   ├── App.css                    → Main component styles
│   ├── App.css (src/)             → Additional styling
│   ├── BackgroundAnimation.css    → Animated background styles
│   └── index.css                  → Global styles
├── App.jsx                        → Main application file
└── main.jsx                       → Entry point
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Create a `.env` file in the project root:

```env
# OpenAI API Key - Get from https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=sk-proj-your-key-here

# Open-Meteo API (Free - No key required)
# Documentation: https://open-meteo.com/

# Optional: Unsplash API Key for outfit images
# Get from https://unsplash.com/developers
VITE_UNSPLASH_KEY=your-key-here
```

**Note**: Open-Meteo is free and doesn't require an API key! WeatherAPI.com has been replaced with Open-Meteo for better performance and no quota limits.

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📖 How It Works

### Weather Forecasting

1. User enters a city or asks about weather
2. SearchBar detects location input and converts to weather query
3. App calls Open-Meteo API with city coordinates (reverse geocoding)
4. Weather data displays with WMO code to emoji conversion:
   - 0 = ☀️ Clear sky
   - 2 = ⛅ Partly cloudy
   - 3 = ☁️ Overcast
   - 45-48 = 🌫️ Foggy
   - 51-82 = 🌦️🌧️ Rain/Drizzle
   - 71-86 = 🌨️❄️ Snow
   - 95-99 = ⛈️ Thunderstorm
5. Hourly chart visualizes temperature trends with canvas-based line graph
6. User can toggle between Fahrenheit and Celsius

### AI Assistance

1. User types message or clicks search bar button
2. Chat bubble appears (draggable and resizable)
3. ChatGPT receives real-time weather context from Open-Meteo
4. AI generates personalized suggestions (outfit, activities, schedule)
5. User can close chat bubble and reopen by clicking search bar button again

### Smart Schedules

1. User asks AI to create a schedule (e.g., "Plan my day in NYC")
2. AI generates schedule structure with times and activities
3. For each item: Weather and outfit are auto-generated from Open-Meteo data
4. Outfit images fetch from Unsplash (with fallback)
5. User can edit, reorder, or delete items in the interactive editor
6. Export or print schedule for personal use

### Theme System

- **Dark Mode** (default):
  - Deep charcoal background with animated twinkling stars
  - Purple (#7a3ff2) and yellow (#f5e960) accent colors
  - All text and buttons optimized for dark background
- **Light Mode**:

  - Light cream background with floating bubble animations
  - Light purple (#9d7ee8) and dark gold (#d4a500) accent colors
  - All text and buttons optimized for light background

- **Temperature Unit**:
  - Toggle between Fahrenheit (°F) and Celsius (°C)
  - Preference persisted to localStorage

## 🎨 Key Features in Detail

### Real-Time Weather Integration

- **City Lookup**: Smart city name detection with slang recognition (NYC → New York)
- **7-Day Forecast**: Daily weather cards with min/max temps and conditions
- **Hourly Breakdown**: 24-hour temperature trend visualization
- **Current Conditions**: Temperature, humidity, wind speed, "feels like", weather description
- **WMO Code Mapping**: Accurate weather emoji display based on meteorological codes

### AI-Powered Suggestions

- **Weather Analysis**: Current conditions + 7-day forecast context
- **Outfit Recommendations**: Weather-appropriate clothing suggestions with images
- **Activity Ideas**: Indoor/outdoor activities based on forecast
- **Schedule Builder**: Auto-creates detailed daily plans with times, activities, and weather

### Interactive Components

- **Draggable Chat Bubble**: Reposition and resize chat interface anywhere on screen
- **Editable Schedule Table**: Edit cells, add/delete rows, reorder items with drag-and-drop
- **Day Tabs**: Easy navigation between forecast days with active state
- **Animated Backgrounds**: Non-intrusive floating elements that enhance visual appeal

### User Preferences

- **Theme Toggle**: Dark/Light mode with smooth transitions
- **Temperature Unit**: Display temperatures in Fahrenheit or Celsius
- **Persistent Storage**: Preferences saved to localStorage

## 🔑 API Keys Required

### OpenAI API (Required)

- **Cost**: Pay-as-you-go (~$0.01 per chat message)
- **Signup**: https://platform.openai.com/
- **Model**: gpt-4o-mini (fast, affordable, capable)
- **Documentation**: https://platform.openai.com/docs/

### Open-Meteo API (Free - No key required!)

- **Cost**: Completely FREE with no API key needed
- **Signup**: https://open-meteo.com/
- **Documentation**: https://open-meteo.com/docs/
- **Features**:
  - Current weather, 7-day forecast, hourly data
  - Geocoding for city name to coordinates
  - Weather alerts and severe weather data
  - No rate limits for reasonable use
  - No credit card required

### Unsplash API (Optional)

- **Cost**: Free tier (50 requests/hour)
- **Signup**: https://unsplash.com/developers
- **Used for**: Outfit suggestion images
- **Fallback**: Generic placeholder if API not configured

## 📚 Documentation

- **[WEATHERAPI_SETUP.md](./WEATHERAPI_SETUP.md)** - Open-Meteo configuration and troubleshooting
- **[COPILOTINSTRUCTIONS.md](./COPILOTINSTRUCTIONS.md)** - Development guidelines and coding standards
- **[CODE_CHANGES.md](./CODE_CHANGES.md)** - Recent updates and bug fixes

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

**Important**: Add environment variables in Vercel dashboard under Settings > Environment Variables:

- `VITE_OPENAI_API_KEY` - Your OpenAI API key

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

Add environment variables in Netlify Site Settings > Build & Deploy > Environment.

### GitHub Pages

```bash
npm run build
# Deploy dist folder to gh-pages branch
```

Update `vite.config.js` with your repository name for correct asset paths.

## 🐛 Troubleshooting

### Weather not loading?

- Check browser console (F12) for API errors
- Verify OpenAI API key is correct and in `.env`
- Try a major city name (e.g., "London", "Tokyo", "New York")
- Open-Meteo is free with no key needed - should always work for geocoding

### Chat bubble not appearing?

- Click the search bar button (💬) to open chat
- Works with or without text input
- Chat persists while navigating app
- Click the X to close, then click button again to reopen

### AI responses are slow?

- OpenAI API might be under load
- Check your API key has sufficient credits ($5+ recommended)
- Weather context fetching might be slow (check Network tab in F12)

### Outfit images not showing?

- Falls back to generic image if Unsplash API not configured
- Add `VITE_UNSPLASH_KEY` to `.env` for custom images
- Check browser console for image fetch errors
- Unsplash free tier is 50 requests/hour

### Theme not persisting?

- Check browser localStorage is enabled
- Clear cache and try again
- Check DevTools > Application > Storage > Local Storage

### Schedule editor not opening?

- Ensure chat message mentions schedule or planning
- Try: "Can you plan my day in [city]?"
- Check for JavaScript errors in browser console

## 🎯 Future Enhancements

- [ ] User accounts and saved preferences
- [ ] Multiple schedule management and sharing
- [ ] Weather alerts and push notifications
- [ ] Map-based location selection with drag-and-drop
- [ ] Historical weather analysis and trends
- [ ] Social sharing of schedules and forecasts
- [ ] Customizable dashboard widgets
- [ ] Voice input for accessibility
- [ ] Calendar integration
- [ ] Weather-based reminder system

## 🔄 Recent Updates

### Version 1.2.0 - Theme & UI Enhancements

- ✨ Added Dark/Light theme system with persistent preferences
- ✨ Animated backgrounds: floating bubbles (light) & twinkling stars (dark)
- ✨ Theme-matched UI components across entire app
- 🐛 Fixed chatbot visibility when search button clicked
- 🐛 Fixed "Show All Hours" button styling to match theme

### Version 1.1.0 - API Migration

- ✨ Migrated from WeatherAPI.com to Open-Meteo (free, no key required)
- ✨ Implemented WMO weather code to emoji mapping
- ✨ Added 7-day forecast with hourly breakdown
- 🐛 Fixed weather data structure mismatches
- 🐛 Fixed merge conflicts in useWeatherChat.js

### Version 1.0.0 - Initial Release

- 🚀 Core weather functionality with real-time data
- 🚀 AI-powered chat and suggestions
- 🚀 Interactive schedule editor
- 🚀 Responsive design for all devices

## 👥 Team & Collaboration

**Team Stratus: StormStream**

This project demonstrates:

- Responsive component architecture with React Hooks
- Seamless API integration (Open-Meteo + OpenAI)
- Interactive UI/UX design with animations
- Comprehensive error handling and user feedback
- State management with Context API
- Theme system with persistent preferences

---

**Happy coding! Let's make StratusSphere shine! 🌟**
