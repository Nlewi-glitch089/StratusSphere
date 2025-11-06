import React, { useState } from "react";
import './styles/App.css';
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import ChatBox from "./components/ChatBox";
import { sendChatMessage, getWeatherForCity } from "./hooks/useWeatherChat";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! Ask me about the weather in any location, climate information, or anything else!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showMoreHourly, setShowMoreHourly] = useState(false);
  const [showHourlyForecast, setShowHourlyForecast] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today, 1 = tomorrow, 2 = day after

  const handleSendMessage = async (userMessage) => {
    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Get response from OpenAI
      const { assistantMessage, city } = await sendChatMessage(userMessage, messages);

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);

      // If a city was mentioned, try to fetch weather data
      if (city) {
        const weather = await getWeatherForCity(city);
        if (weather) {
          setWeatherData(weather);
        }
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to process your request. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Header Section - Improved Glow */}
      <header className="header">
        <h1 className="title glow">
          <span className="glow-icon">☁️</span> StratusSphere
        </h1>
        <p className="subtitle glow-soft">Chasing storms. Perfecting precision. ⚡</p>
      </header>

      {/* AI Search Bar (Compact) */}
      <section className="search-container">
        <SearchBar onSendMessage={handleSendMessage} isLoading={isLoading} />
        {showChat && <ChatBox messages={messages} isLoading={isLoading} />}
      </section>

      <div className="divider"></div>

      {/* Current Weather Card - Now displays real-time data */}
      {weatherData && <WeatherCard data={weatherData} />}

      <div className="divider"></div>

      {/* Hourly Forecast - Multiple Days */}
      {weatherData && weatherData.forecast && weatherData.forecast.forecastday && weatherData.forecast.forecastday.length > 0 && (
        <section className="hourly-forecast">
          <button 
            className="forecast-header-btn"
            onClick={() => setShowHourlyForecast(!showHourlyForecast)}
          >
            <span>📅 Weekly Forecast</span>
            <span className="toggle-icon">{showHourlyForecast ? '▼' : '▶'}</span>
          </button>
          
          {showHourlyForecast && (
            <>
              {/* Day Selection Tabs - Show all available days with full weekday names */}
              <div className="day-selector">
                {weatherData.forecast.forecastday.map((day, idx) => {
                  const dayDate = new Date(day.date);
                  const weekday = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <button
                      key={idx}
                      className={`day-tab ${selectedDay === idx ? 'active' : ''}`}
                      onClick={() => setSelectedDay(idx)}
                      title={dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    >
                      {weekday}
                    </button>
                  );
                })}
              </div>

              {/* Hourly Data for Selected Day */}
              {(() => {
                const selectedDayData = weatherData.forecast.forecastday[selectedDay];
                if (!selectedDayData) return null;
                
                // Always show all 24 hours for the selected day
                const allHourlyData = selectedDayData.hour || [];
                const hourlyData = allHourlyData.filter((_, idx) => idx % 3 === 0);
                
                return (
                  <>
                    <div className="hourly-scroll">
                      {(showMoreHourly ? allHourlyData : hourlyData).map((hour, idx) => (
                        <article key={idx} className="hourly-item-forecast">
                          <p className="time">{new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
                          <img src={`https:${hour.condition.icon}`} alt={hour.condition.text} />
                          <p className="temp">{Math.round(hour.temp_c)}°</p>
                        </article>
                      ))}
                    </div>
                    <button className="see-more-btn" onClick={() => setShowMoreHourly(!showMoreHourly)}>
                      {showMoreHourly ? '▼ Less' : '▲ More'}
                    </button>
                  </>
                );
              })()}
            </>
          )}
        </section>
      )}

      <footer>
        <p style={{ color: "#B3B7C4", marginTop: "2rem" }}>
          Designed with React & Vite⚡by the StormStream Team
        </p>
      </footer>
    </div>
  );
}

export default App;
