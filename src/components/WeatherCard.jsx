import React from "react";

function WeatherCard({ data }) {
  if (!data || !data.current) {
    return null;
  }

  const { location, current } = data;

  return (
    <article className="card weather-card">
      <h2 className="city">
        {location.name}, {location.region || location.country}
      </h2>

      {/* Centered Weather Icon */}
      <div className="weather-icon-container">
        <img
          src={`https:${current.condition.icon}`}
          alt={current.condition.text}
          className="weather-icon-large"
        />
      </div>

      {/* Temperature */}
      <p className="temperature">{Math.round(current.temp_c)}°C</p>
      <p className="temperature-f">{current.temp_f}°F</p>

      {/* Condition */}
      <p className="condition">{current.condition.text}</p>

      {/* Real-Time Details */}
      <div className="weather-details">
        <p>💧 Humidity: {current.humidity}%</p>
        <p>💨 Wind: {Math.round(current.wind_kph)} km/h</p>
        <p>🌡️ Feels like: {Math.round(current.feelslike_c)}°C</p>
      </div>
    </article>
  );
}

export default WeatherCard;