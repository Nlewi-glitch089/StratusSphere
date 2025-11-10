import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState(() => {
		// Load from localStorage on initialization
		const saved = localStorage.getItem("appTheme");
		return saved || "dark"; // Default to dark theme
	});

	// Save to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("appTheme", theme);
		// Apply theme to document root
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};
