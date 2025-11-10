import React, { useContext } from "react";
import { TemperatureContext } from "../context/TemperatureContext";
import { ThemeContext } from "../context/ThemeContext";

function Settings({ onClose }) {
	const { temperatureUnit, toggleTemperatureUnit } = useContext(
		TemperatureContext
	);
	const { theme, toggleTheme } = useContext(ThemeContext);

	return (
		<div className="settings-overlay">
			<div className="settings-modal">
				<div className="settings-header">
					<h2>⚙️ Settings</h2>
					<button className="close-btn" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="settings-content">
					<div className="setting-item">
						<div className="setting-label">
							<span>🌡️ Temperature Unit</span>
							<p className="setting-description">
								Choose how temperatures are displayed across the website
							</p>
						</div>
						<div className="temperature-toggle">
							<button
								className={`toggle-btn ${temperatureUnit === "F" ? "active" : ""}`}
								onClick={toggleTemperatureUnit}
							>
								°F Fahrenheit
							</button>
							<button
								className={`toggle-btn ${temperatureUnit === "C" ? "active" : ""}`}
								onClick={toggleTemperatureUnit}
							>
								°C Celsius
							</button>
						</div>
						<p className="current-unit">
							Currently displaying in{" "}
							<strong>{temperatureUnit === "F" ? "Fahrenheit" : "Celsius"}</strong>
						</p>
					</div>

					<div className="setting-item">
						<div className="setting-label">
							<span>🌓 Theme</span>
							<p className="setting-description">
								Switch between dark and light mode
							</p>
						</div>
						<div className="theme-toggle">
							<button
								className={`toggle-btn ${theme === "dark" ? "active" : ""}`}
								onClick={toggleTheme}
							>
								🌙 Dark Mode
							</button>
							<button
								className={`toggle-btn ${theme === "light" ? "active" : ""}`}
								onClick={toggleTheme}
							>
								☀️ Light Mode
							</button>
						</div>
						<p className="current-unit">
							Currently using <strong>{theme === "dark" ? "Dark" : "Light"}</strong> mode
						</p>
					</div>
				</div>

				<div className="settings-footer">
					<button className="done-btn" onClick={onClose}>
						Done
					</button>
				</div>
			</div>
		</div>
	);
}

export default Settings;
