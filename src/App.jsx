import React, { useState } from "react";
import "./styles/App.css";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import ChatBox from "./components/ChatBox";
import ChatBubble from "./components/ChatBubble";
import HourlyLineChart from "./components/HourlyLineChart";
import ScheduleTable from "./components/ScheduleTable";
import Settings from "./components/Settings";
import About from "./components/About";
import BackgroundAnimation from "./components/BackgroundAnimation";
import { TemperatureProvider } from "./context/TemperatureContext";
import { ThemeProvider } from "./context/ThemeContext";
import {
	sendChatMessage,
	sendChatMessageWithCity,
	getWeatherForCity,
} from "./hooks/useWeatherChat";

// Helper function to find current day index in forecast
function findCurrentDayIndex(forecastDays) {
	const today = new Date().toISOString().split("T")[0];
	return forecastDays.findIndex((day) => day.date === today) || 0;
}

function App() {
	const [weatherData, setWeatherData] = useState(null);
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content:
				"Hi! Ask me about the weather in any location, climate information, or anything else!",
		},
	]);
	const [isLoading, setIsLoading] = useState(false);
	const [showChat, setShowChat] = useState(true);
	const [showDetails, setShowDetails] = useState(false);
	const [showMoreHourly, setShowMoreHourly] = useState(false);
	const [showHourlyForecast, setShowHourlyForecast] = useState(false);
	const [selectedDay, setSelectedDay] = useState(0); // 0 = today, 1 = tomorrow, 2 = day after
	const [showSettings, setShowSettings] = useState(false);
	const [showChatBubble, setShowChatBubble] = useState(false);
	const [hasVisitedMain, setHasVisitedMain] = useState(() => {
		// Check if user has visited before
		const hasVisited = localStorage.getItem("stratussphere_welcomed");
		return !!hasVisited;
	});
	const [showAbout, setShowAbout] = useState(() => {
		// Show About page on first visit
		const hasVisited = localStorage.getItem("stratussphere_welcomed");
		return !hasVisited;
	});
	const [scheduleData, setScheduleData] = useState(null);
	const [showScheduleTable, setShowScheduleTable] = useState(false);
	const [outfitImages, setOutfitImages] = useState({});

	const handleSendMessage = async (userMessage) => {
		// Just show chatbot if empty message (button clicked but no text entered)
		if (!userMessage.trim()) {
			setShowChatBubble(true);
			return;
		}

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
							for (
								let i = todayIndex;
								i < weather.forecast.forecastday.length;
								i++
							) {
								const dayDate = new Date(weather.forecast.forecastday[i].date);
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
			// Simply store the schedule items and show the table
			setScheduleData({
				items: scheduleItems,
				title: title || "Daily Schedule",
			});
			setShowScheduleTable(true);
		} catch (error) {
			console.error("Error in handleScheduleDetected:", error);
			// Fallback: still show the schedule
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
		<TemperatureProvider>
			<ThemeProvider>
				<BackgroundAnimation />
				<div className="app">
					{/* Header Section - Improved Glow */}
					<header className="header">
						<button
							className="about-btn"
							onClick={() => setShowAbout(true)}
							title="About"
						>
							ℹ️
						</button>
						<div className="header-center">
							<h1 className="title glow">
								<span className="glow-icon">☁️</span> StratusSphere
							</h1>
							<p className="subtitle glow-soft">
								Chasing storms. Perfecting precision. ⚡
							</p>
						</div>
						<button
							className="settings-btn"
							onClick={() => setShowSettings(true)}
							title="Settings"
						>
							⚙️
						</button>
					</header>

					{/* AI Search Bar (Compact) */}
					<section className="search-container">
						<SearchBar
							onSendMessage={handleSendMessage}
							isLoading={isLoading}
						/>
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
										{/* Day Selection Tabs - Show all available days with full weekday names */}
										<div className="day-selector">
											{weatherData.forecast.forecastday.map((day, idx) => {
												const dayDate = new Date(day.date);
												const weekday = dayDate.toLocaleDateString("en-US", {
													weekday: "short",
												});
												return (
													<button
														key={idx}
														className={`day-tab ${
															selectedDay === idx ? "active" : ""
														}`}
														onClick={() => setSelectedDay(idx)}
														title={dayDate.toLocaleDateString("en-US", {
															weekday: "long",
															month: "short",
															day: "numeric",
														})}
													>
														{weekday}
													</button>
												);
											})}
										</div>

										{/* Hourly Data for Selected Day - Line Chart */}
										{(() => {
											const selectedDayData =
												weatherData.forecast.forecastday[selectedDay];
											if (!selectedDayData) return null;

											// Always show all 24 hours for the selected day
											const allHourlyData = selectedDayData.hour || [];

											return (
												<>
													<HourlyLineChart
														hourlyData={allHourlyData}
														showAll={showMoreHourly}
													/>
													<button
														className="see-more-btn"
														onClick={() => setShowMoreHourly(!showMoreHourly)}
													>
														{showMoreHourly
															? "Show Less Detail"
															: "Show All Hours"}
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

					{showSettings && <Settings onClose={() => setShowSettings(false)} />}
					{showAbout && <About onClose={handleAboutClose} />}
					{showScheduleTable && scheduleData && (
						<ScheduleTable
							scheduleData={scheduleData}
							outfitImages={outfitImages}
							onClose={() => setShowScheduleTable(false)}
							onSave={handleScheduleSave}
						/>
					)}

					{/* Chat Bubble - Draggable and Resizable */}
					<ChatBubble
						messages={messages}
						isLoading={isLoading}
						onSendMessage={handleSendMessage}
						isVisible={showChatBubble}
						onClose={() => setShowChatBubble(false)}
						onScheduleDetected={handleScheduleDetected}
					/>
				</div>
			</ThemeProvider>
		</TemperatureProvider>
	);
}

export default App;
