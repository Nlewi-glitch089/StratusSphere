import React, { useState, useEffect } from "react";
import "./styles/App.css";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import ChatBubble from "./components/ChatBubble";
import HourlyLineChart from "./components/HourlyLineChart";
import About from "./components/About";
import ScheduleTable from "./components/ScheduleTable";
import Settings from "./components/Settings";
import { TemperatureProvider } from "./context/TemperatureContext";
import { ThemeProvider } from "./context/ThemeContext";
import {
	sendChatMessage,
	getWeatherForCity,
	sendChatMessageWithCity,
} from "./hooks/useWeatherChat";

function App() {
	const [weatherData, setWeatherData] = useState(null);
	const [messages, setMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showChatBubble, setShowChatBubble] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [showAbout, setShowAbout] = useState(true);
	const [showSettings, setShowSettings] = useState(false);
	const [showScheduleTable, setShowScheduleTable] = useState(false);
	const [scheduleData, setScheduleData] = useState(null);
	const [outfitImages, setOutfitImages] = useState({}); // Maps rowIndex to image URL
	const [hasVisitedMain, setHasVisitedMain] = useState(false);

	// Check if user has already been welcomed
	useEffect(() => {
		const hasBeenWelcomed = localStorage.getItem("stratussphere_welcomed");
		if (hasBeenWelcomed) {
			setShowAbout(false);
			setHasVisitedMain(true);
		}
	}, []);

	const [showHourlyForecast, setShowHourlyForecast] = useState(false);
	const [selectedDay, setSelectedDay] = useState(null); // Will be set to current day index

	// Auto-show and scroll to forecast when weather data is loaded
	useEffect(() => {
		if (weatherData && weatherData.forecast) {
			setShowHourlyForecast(true);
			// Scroll to forecast section
			setTimeout(() => {
				const forecastSection = document.querySelector(".hourly-forecast");
				if (forecastSection) {
					forecastSection.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
				}
			}, 100);
		}
	}, [weatherData]);

	// Helper function to find current day index and set default selection
	const findCurrentDayIndex = (forecastDays) => {
		const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
		const currentDayIndex = forecastDays.findIndex((day) => day.date === today);
		return currentDayIndex >= 0 ? currentDayIndex : 0; // Default to first day if today not found
	};

	// Helper function to get weekday name
	const getDayLabel = (dayDate, index, currentDayIndex) => {
		const dayDateObj = new Date(dayDate);
		// Always return the full weekday name
		return dayDateObj.toLocaleDateString("en-US", { weekday: "long" });
	};

	const handleSendMessage = async (userMessage) => {
		// Add user message to chat
		setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
		setIsLoading(true);
		setShowChatBubble(true); // Show the bubble when user sends a message

		try {
			// Get response from OpenAI
			const { assistantMessage, city } = await sendChatMessage(
				userMessage,
				messages
			);

			// Add assistant response to chat
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: assistantMessage },
			]);

			// If a city was mentioned, try to fetch weather data
			if (city) {
				console.log(`App: Fetching weather for extracted city: ${city}`);
				const weather = await getWeatherForCity(city);
				if (weather) {
					console.log(
						`App: Weather data received for ${weather.location.name}`
					);
					setWeatherData(weather);
					// Set default selected day to current day
					if (weather.forecast && weather.forecast.forecastday) {
						// Try to extract date from user message
						let targetDayIndex = findCurrentDayIndex(
							weather.forecast.forecastday
						);

						// Common date patterns in user messages
						const messageLower = userMessage.toLowerCase();
						const dayPatterns = {
							tomorrow: 1,
							"day after tomorrow": 2,
							monday: 0,
							tuesday: 1,
							wednesday: 2,
							thursday: 3,
							friday: 4,
							saturday: 5,
							sunday: 6,
							"next week": 7,
						};

						// Check for day names or common date references
						for (const [pattern, offset] of Object.entries(dayPatterns)) {
							if (messageLower.includes(pattern)) {
								const potentialIndex =
									pattern === "sunday" || pattern === "monday"
										? offset
										: findCurrentDayIndex(weather.forecast.forecastday) +
											offset;
								if (
									potentialIndex >= 0 &&
									potentialIndex < weather.forecast.forecastday.length
								) {
									targetDayIndex = potentialIndex;
									break;
								}
							}
						}

						// Also try to match specific day of week if we're not already on that day
						const todayIndex = findCurrentDayIndex(
							weather.forecast.forecastday
						);
						if (
							messageLower.includes("monday") ||
							messageLower.includes("tuesday") ||
							messageLower.includes("wednesday") ||
							messageLower.includes("thursday") ||
							messageLower.includes("friday") ||
							messageLower.includes("saturday") ||
							messageLower.includes("sunday")
						) {
							// Find the next occurrence of that day
							for (let i = todayIndex; i < weather.forecast.forecastday.length; i++) {
								const dayDate = new Date(
									weather.forecast.forecastday[i].date
								);
								const dayName = dayDate
									.toLocaleDateString("en-US", { weekday: "long" })
									.toLowerCase();

								for (const pattern of Object.keys(dayPatterns)) {
									if (
										pattern !== "next week" &&
										pattern !== "tomorrow" &&
										pattern !== "day after tomorrow" &&
										messageLower.includes(pattern) &&
										dayName === pattern
									) {
										targetDayIndex = i;
										break;
									}
								}
							}
						}

						setSelectedDay(targetDayIndex);
					}
				} else {
					console.log(`App: No weather data returned for ${city}`);
				}
			} else {
				console.log("App: No city extracted from message");
			}
		} catch (error) {
			console.error("App: Error in handleSendMessage:", error);
			const errorMessage =
				error.message || "Failed to process your request. Please try again.";
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: `Error: ${errorMessage}` },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	// Generate outfit image using Unsplash API
	const generateOutfitImage = async (outfitDescription, activity) => {
		try {
			const searchQuery = `${
				outfitDescription.split(".")[0]
			} outfit ${activity}`.substring(0, 100);

			const response = await fetch(
				`https://api.unsplash.com/search/photos?query=${encodeURIComponent(
					searchQuery
				)}&per_page=1&order_by=relevant&client_id=YOUR_UNSPLASH_ACCESS_KEY`
			);

			if (response.ok) {
				const data = await response.json();
				if (data.results && data.results.length > 0) {
					return data.results[0].urls.regular;
				}
			}

			return `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop`;
		} catch (error) {
			console.error("Error generating outfit image:", error);
			return `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop`;
		}
	};

	// Auto-generate weather and outfit when schedule is first created
	const handleScheduleDetected = async (scheduleItems, title) => {
		try {
			setIsLoading(true);
			const enrichedItems = [];
			const newOutfitImages = {};

			// Loop through each schedule item and generate weather/outfit
			for (let i = 0; i < scheduleItems.length; i++) {
				const item = scheduleItems[i];
				const prompt = `You are Storm, a weather and activity assistant. For a schedule entry at ${item.time} with activity: "${item.activity}", generate SHORT and CONCISE suggestions:

1. WEATHER: Brief weather info (max 2 sentences - temperature, conditions, key recommendation)
2. OUTFIT: Brief outfit suggestions (max 2 sentences - key clothing items and materials)

Respond EXACTLY in this format:
WEATHER: [2-sentence weather info]
OUTFIT: [2-sentence outfit suggestions]`;

				try {
					// Call AI to generate weather and outfit
					const response = await sendChatMessageWithCity(prompt, []);
					console.log(`[Schedule Auto-Gen ${i}] Response:`, response);

					// Parse weather and outfit from response
					let weather = "";
					let outfit = "";

					const weatherMatch = response.match(/WEATHER:\s*(.+?)(?=OUTFIT:|$)/s);
					const outfitMatch = response.match(/OUTFIT:\s*(.+?)$/s);

					if (weatherMatch) {
						weather = weatherMatch[1].trim();
					}
					if (outfitMatch) {
						outfit = outfitMatch[1].trim();
					}

					console.log(
						`[Schedule Auto-Gen ${i}] Weather: "${weather}", Outfit: "${outfit}"`
					);

					// Generate outfit image
					if (outfit) {
						const imageUrl = await generateOutfitImage(outfit, item.activity);
						newOutfitImages[i] = imageUrl;
						console.log(`[Schedule Auto-Gen ${i}] Image URL:`, imageUrl);
					}

					// Create enriched item with generated data
					enrichedItems.push({
						...item,
						weather: weather || item.weather || "",
						outfit: outfit || item.outfit || "",
					});
				} catch (itemError) {
					console.error(
						`[Schedule Auto-Gen ${i}] Error generating data for item:`,
						itemError
					);
					enrichedItems.push(item);
				}
			}

			// Set state with enriched items and outfit images
			console.log("[Schedule Auto-Gen] Enriched items:", enrichedItems);
			console.log("[Schedule Auto-Gen] Outfit images:", newOutfitImages);
			setScheduleData({
				items: enrichedItems,
				title: title || "Daily Schedule",
			});
			setOutfitImages(newOutfitImages);
			setShowScheduleTable(true);
		} catch (error) {
			console.error("Error in handleScheduleDetected:", error);
			// Fallback: show schedule without auto-generated data
			setScheduleData({
				items: scheduleItems,
				title: title || "Daily Schedule",
			});
			setShowScheduleTable(true);
		} finally {
			setIsLoading(false);
		}
	};

	const handleScheduleSave = (updatedSchedule) => {
		console.log("Schedule saved:", updatedSchedule);
		// Here you could save to localStorage, send to API, etc.
		setShowScheduleTable(false);
	};

	const handleGetStarted = () => {
		setShowAbout(false);
		setHasVisitedMain(true);
		// Optionally save to localStorage that user has seen the welcome
		localStorage.setItem("stratussphere_welcomed", "true");
	};

	const handleAboutClose = () => {
		if (!hasVisitedMain) {
			// If this is their first time, treat it as "Get Started"
			handleGetStarted();
		} else {
			// Normal about page close
			setShowAbout(false);
		}
	};

	return (
		<ThemeProvider>
			<TemperatureProvider>
				<div className="app">
			{/* Header Section - Improved Glow */}
			<header className="header">
				<div className="header-content">
					<div className="header-text">
						<h1 className="title glow">
							<span className="glow-icon">☁️</span> StratusSphere
						</h1>
						<p className="subtitle glow-soft">
							Chasing storms. Perfecting precision. ⚡
						</p>
					</div>
					<div className="header-buttons">
						<button className="settings-btn" onClick={() => setShowSettings(true)}>
							⚙️ Settings
						</button>
						<button className="about-btn" onClick={() => setShowAbout(true)}>
							ℹ️ About
						</button>
					</div>
				</div>
			</header>

			{/* AI Search Bar (Compact) */}
			<section className="search-container">
				<SearchBar onSendMessage={handleSendMessage} isLoading={isLoading} />
			</section>

			<div className="divider"></div>

			{/* Current Weather Card - Now displays real-time data */}
			{weatherData && <WeatherCard data={weatherData} />}

			<div className="divider"></div>

			{/* Hourly Forecast - Multiple Days */}
			{weatherData &&
				weatherData.forecast &&
				weatherData.forecast.forecastday &&
				weatherData.forecast.forecastday.length > 0 && (
					<section className="hourly-forecast">
						<button
							className="forecast-header-btn"
							onClick={() => setShowHourlyForecast(!showHourlyForecast)}
						>
							<span>📅 Weekly Forecast</span>
							<span className="toggle-icon">
								{showHourlyForecast ? "▼" : "▶"}
							</span>
						</button>

						{showHourlyForecast && (
							<>
								{/* Day Selection Tabs - Organized chronologically starting from current day */}
								<div className="day-selector">
									{weatherData.forecast.forecastday.slice(0, 7).map((day, idx) => {
										const dayDate = new Date(day.date);
										const currentDayIndex = findCurrentDayIndex(
											weatherData.forecast.forecastday
										);
										const dayLabel = getDayLabel(
											day.date,
											idx,
											currentDayIndex
										);
										const shortLabel =
											dayLabel.length > 9 ? dayLabel.substring(0, 3) : dayLabel;

										// Add context for tooltip (Today, Tomorrow, etc.)
										const today = new Date();
										const dayDateObj = new Date(day.date);
										const diffDays = Math.floor(
											(dayDateObj - today) / (1000 * 60 * 60 * 24)
										);
										let contextLabel = "";
										if (diffDays === 0) contextLabel = " (Today)";
										else if (diffDays === 1) contextLabel = " (Tomorrow)";
										else if (diffDays === -1) contextLabel = " (Yesterday)";

										return (
											<button
												key={idx}
												className={`day-tab ${
													selectedDay === idx ? "active" : ""
												}`}
												onClick={() => setSelectedDay(idx)}
												title={`${dayDate.toLocaleDateString("en-US", {
													weekday: "long",
													month: "short",
													day: "numeric",
												})}${contextLabel}`}
											>
												{shortLabel}
											</button>
										);
									})}
								</div>

								{/* Hourly Data for Selected Day - Scrollable Chart */}
								{(() => {
									// Use current day as fallback if selectedDay is null
									const dayIndex =
										selectedDay !== null
											? selectedDay
											: findCurrentDayIndex(weatherData.forecast.forecastday);
									const selectedDayData =
										weatherData.forecast.forecastday[dayIndex];
									if (!selectedDayData) return null;

									// Always show all 24 hours for the selected day
									const allHourlyData = selectedDayData.hour || [];

									return (
										<div className="hourly-chart-container">
											<HourlyLineChart
												hourlyData={allHourlyData}
												showAll={true}
											/>
										</div>
									);
								})()}
							</>
						)}
					</section>
				)}

			<footer>
				<p>
					Designed with React & Vite⚡by the StormStream Team
				</p>
			</footer>

			{/* Chat Bubble - Floating overlay */}
			<ChatBubble
				messages={messages}
				isLoading={isLoading}
				onSendMessage={handleSendMessage}
				isVisible={showChatBubble}
				onClose={() => setShowChatBubble(false)}
				onScheduleDetected={handleScheduleDetected}
			/>

			{/* About Page Overlay */}
			{showAbout && (
				<About onClose={handleAboutClose} isWelcome={!hasVisitedMain} />
			)}

			{/* Settings Modal */}
			{showSettings && <Settings onClose={() => setShowSettings(false)} />}

			{/* Schedule Table Overlay */}
			{showScheduleTable && scheduleData && (
				<ScheduleTable
					scheduleData={scheduleData.items}
					outfitImages={outfitImages}
					onClose={() => setShowScheduleTable(false)}
					onSave={handleScheduleSave}
				/>
			)}
			</div>
			</TemperatureProvider>
		</ThemeProvider>
	);
}

export default App;
