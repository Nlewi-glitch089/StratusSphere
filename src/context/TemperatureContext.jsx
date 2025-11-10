import React, { createContext, useState, useEffect } from "react";

export const TemperatureContext = createContext();

export const TemperatureProvider = ({ children }) => {
	const [temperatureUnit, setTemperatureUnit] = useState(() => {
		// Load from localStorage on initialization
		const saved = localStorage.getItem("temperatureUnit");
		return saved || "F"; // Default to Fahrenheit
	});

	// Save to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("temperatureUnit", temperatureUnit);
	}, [temperatureUnit]);

	const toggleTemperatureUnit = () => {
		setTemperatureUnit((prev) => (prev === "F" ? "C" : "F"));
	};

	return (
		<TemperatureContext.Provider value={{ temperatureUnit, toggleTemperatureUnit }}>
			{children}
		</TemperatureContext.Provider>
	);
};
