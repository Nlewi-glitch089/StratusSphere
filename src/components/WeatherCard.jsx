import React, { useContext } from "react";
import { TemperatureContext } from "../context/TemperatureContext";

function WeatherCard({ data }) {
	const { temperatureUnit } = useContext(TemperatureContext);

	if (!data || !data.current) {
		return null;
	}

	const { location, current } = data;

	// Get temperature values based on selected unit
	const primaryTemp =
		temperatureUnit === "F" ? current.temp_f : Math.round(current.temp_c);
	const secondaryTemp =
		temperatureUnit === "F" ? Math.round(current.temp_c) : current.temp_f;
	const primaryUnit = temperatureUnit === "F" ? "°F" : "°C";
	const secondaryUnit = temperatureUnit === "F" ? "°C" : "°F";

	const feelsLikeTemp =
		temperatureUnit === "F"
			? Math.round(current.feelslike_f)
			: Math.round(current.feelslike_c);

	return (
		<article className="card weather-card">
			<h2 className="city">
				{location.name}, {location.region || location.country}
			</h2>

			{/* Centered Weather Icon */}
			<div className="weather-icon-container">
				<span
					className="weather-emoji"
					role="img"
					aria-label={current.condition.text}
				>
					{current.condition.icon}
				</span>
			</div>

			{/* Temperature */}
			<p className="temperature">
				{primaryTemp}
				{primaryUnit}
			</p>
			<p className="temperature-f">
				{secondaryTemp}
				{secondaryUnit}
			</p>

			{/* Condition */}
			<p className="condition">{current.condition.text}</p>

			{/* Real-Time Details */}
			<div className="weather-details">
				<p>💧 Humidity: {current.humidity}%</p>
				<p>💨 Wind: {Math.round(current.wind_kph)} km/h</p>
				<p>
					🌡️ Feels like: {feelsLikeTemp}
					{primaryUnit}
				</p>
			</div>
		</article>
	);
}

export default WeatherCard;
