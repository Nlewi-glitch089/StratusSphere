import React from "react";

function About({ onClose, isWelcome = false }) {
	return (
		<div className="about-overlay">
			<div className="about-container">
				<div className="about-header">
					<h1 className="about-title">
						<span className="glow-icon">☁️</span> StratusSphere
					</h1>
					{!isWelcome && (
						<button className="about-close-btn" onClick={onClose}>
							×
						</button>
					)}
				</div>

				<div className="about-content">
					<div className="about-hero">
						<div className="about-intro">
							<p className="about-subtitle">
								Chasing storms. Perfecting precision. ⚡
							</p>
							<p className="about-description">
								{isWelcome
									? "Welcome to StratusSphere – your intelligent weather companion revolutionizing how you plan your day. We don't just tell you the weather; we help you master it. With AI-powered insights, real-time data, and smart scheduling, StratusSphere transforms weather forecasts into actionable plans that optimize your productivity, comfort, and safety."
									: "StratusSphere isn't your average weather app. We're your intelligent weather companion that goes beyond forecasts to help you plan, prepare, and optimize every activity based on real-time conditions. From AI-powered scheduling to interactive visualizations, experience weather intelligence like never before."}
							</p>
						</div>
					</div>

					<div className="features-overview">
						<h3 className="section-title">
							✨ Features & What Makes Us Unique
						</h3>

						<div className="features-grid">
							<div className="feature-card unique-feature">
								<div className="feature-icon-wrapper">
									<div className="feature-icon">🌤️</div>
								</div>
								<div className="feature-info">
									<h4>Storm AI Assistant</h4>
									<p>
										The only weather service with a fully integrated AI planning
										assistant powered by GPT-4o-mini. Receive personalized daily
										schedules optimized for your location's weather,
										AI-generated outfit recommendations based on temperature and
										conditions, and smart activity suggestions that adapt in
										real-time. Get weather-aware planning that learns your
										preferences.
									</p>
									<div className="unique-badge">🎯 Unique to StratusSphere</div>
								</div>
							</div>

							<div className="feature-card unique-feature">
								<div className="feature-icon-wrapper">
									<div className="feature-icon">🎛️</div>
								</div>
								<div className="feature-info">
									<h4>Draggable Interface</h4>
									<p>
										Experience a revolutionary customizable UI designed around
										your workflow. Drag, resize, and position the AI chat
										interface anywhere on your screen with complete freedom.
										Minimize when you need focus, expand when you need
										assistance. This level of customization puts you in complete
										control of your weather intelligence platform.
									</p>
									<div className="unique-badge">🎯 Unique to StratusSphere</div>
								</div>
							</div>

							<div className="feature-card unique-feature">
								<div className="feature-icon-wrapper">
									<div className="feature-icon">📅</div>
								</div>
								<div className="feature-info">
									<h4>Smart Scheduling</h4>
									<p>
										Let AI automatically generate weather-optimized daily plans
										tailored to your location and preferences. Manage your
										entire schedule with full editing capabilities, add custom
										events with weather considerations, and seamlessly export to
										CSV or print your optimized plans. Never let weather catch
										you unprepared again.
									</p>
									<div className="unique-badge">🎯 Unique to StratusSphere</div>
								</div>
							</div>

							<div className="feature-card standard-feature">
								<div className="feature-icon-wrapper">
									<div className="feature-icon">📊</div>
								</div>
								<div className="feature-info">
									<h4>Interactive Visualizations</h4>
									<p>
										Custom-built interactive charts give you deep insights into
										hourly temperature trends, weather patterns, and conditions.
										Hover over any point to see detailed information with
										integrated weather icons. Our canvas-based visualizations
										load instantly and provide a smooth, responsive experience
										that helps you understand weather at a glance.
									</p>
								</div>
							</div>

							<div className="feature-card standard-feature">
								<div className="feature-icon-wrapper">
									<div className="feature-icon">🌍</div>
								</div>
								<div className="feature-info">
									<h4>Real-Time Weather Data</h4>
									<p>
										Powered by the Open-Meteo API for accurate, reliable global
										weather information. Access comprehensive 7-day forecasts
										with hourly granularity, detailed precipitation forecasts,
										wind speeds, humidity levels, and more. Our real-time data
										ensures you always have the most current conditions for any
										location worldwide.
									</p>
								</div>
							</div>

							<div className="feature-card standard-feature">
								<div className="feature-icon-wrapper">
									<div className="feature-icon">📱</div>
								</div>
								<div className="feature-info">
									<h4>Modern Design</h4>
									<p>
										Built with a sleek glassmorphism design that's beautiful on
										every device. Responsive layouts automatically adapt from
										mobile phones to desktop displays, dark theme optimization
										reduces eye strain, and accessibility-focused features
										ensure everyone can benefit from intelligent weather
										planning. Form meets function.
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="comparison-section">
						<h3>⚡ How StratusSphere Compares</h3>
						<p className="comparison-intro">
							See how StratusSphere stacks up against other popular weather
							services:
						</p>

						<div className="comparison-table-wrapper">
							<div className="comparison-table-box">
								<table className="comparison-table">
									<thead>
										<tr>
											<th>Feature</th>
											<th className="stratussphere-col">StratusSphere</th>
											<th>Weather.com</th>
											<th>AccuWeather</th>
											<th>WeatherUnderground</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td className="feature-name">
												AI-Powered Personal Assistant
											</td>
											<td className="stratussphere-col">
												✅ Storm AI with GPT-4
											</td>
											<td>❌ Basic chatbot</td>
											<td>❌ No AI assistant</td>
											<td>❌ No AI features</td>
										</tr>
										<tr>
											<td className="feature-name">Smart Schedule Planning</td>
											<td className="stratussphere-col">
												✅ Auto-generated & editable
											</td>
											<td>❌ Manual planning only</td>
											<td>❌ No schedule features</td>
											<td>❌ No planning tools</td>
										</tr>
										<tr>
											<td className="feature-name">
												Interactive Weather Charts
											</td>
											<td className="stratussphere-col">
												✅ Custom HTML5 Canvas charts
											</td>
											<td>✅ Basic charts</td>
											<td>✅ Standard graphs</td>
											<td>✅ Simple visualizations</td>
										</tr>
										<tr>
											<td className="feature-name">Outfit Recommendations</td>
											<td className="stratussphere-col">
												✅ AI-powered suggestions
											</td>
											<td>❌ Generic tips only</td>
											<td>✅ Basic recommendations</td>
											<td>❌ No outfit features</td>
										</tr>
										<tr>
											<td className="feature-name">Draggable Interface</td>
											<td className="stratussphere-col">
												✅ Fully customizable UI
											</td>
											<td>❌ Fixed layout</td>
											<td>❌ Static interface</td>
											<td>❌ Traditional layout</td>
										</tr>
										<tr>
											<td className="feature-name">Schedule Export/Print</td>
											<td className="stratussphere-col">
												✅ CSV & Print support
											</td>
											<td>❌ No export features</td>
											<td>❌ Limited sharing</td>
											<td>❌ No export options</td>
										</tr>
										<tr>
											<td className="feature-name">Real-time Weather Data</td>
											<td className="stratussphere-col">✅ Open-Meteo API</td>
											<td>✅ Proprietary data</td>
											<td>✅ AccuWeather data</td>
											<td>✅ Community + professional</td>
										</tr>
										<tr>
											<td className="feature-name">Mobile Responsive</td>
											<td className="stratussphere-col">
												✅ Mobile-first design
											</td>
											<td>✅ Mobile app available</td>
											<td>✅ Mobile optimized</td>
											<td>✅ Responsive design</td>
										</tr>
										<tr>
											<td className="feature-name">Activity Suggestions</td>
											<td className="stratussphere-col">
												✅ AI-powered recommendations
											</td>
											<td>❌ Basic weather info only</td>
											<td>❌ Limited activity features</td>
											<td>❌ No activity planning</td>
										</tr>
										<tr>
											<td className="feature-name">Personalized Experience</td>
											<td className="stratussphere-col">
												✅ Fully customizable & intelligent
											</td>
											<td>⚠️ Limited personalization</td>
											<td>⚠️ Basic customization</td>
											<td>⚠️ Some personal features</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div className="about-footer">
					<div className="footer-content">
						<p>
							Built with ❤️ for weather enthusiasts and productivity seekers
							everywhere.
						</p>
						<p className="version-info">
							Version 1.0.0 | Last updated: November 2025
						</p>
						<p className="footer-credit">
							Designed with React & Vite⚡by the StormStream Team
						</p>
					</div>
					{isWelcome && (
						<div className="welcome-actions">
							<button className="get-started-btn" onClick={onClose}>
								Get Started with StratusSphere
							</button>
							<p className="welcome-note">
								Ready to experience intelligent weather planning? Click above to
								launch the app!
							</p>
						</div>
					)}
					{!isWelcome && (
						<div className="about-actions">
							<button className="return-to-app-btn" onClick={onClose}>
								Return to Weather App
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default About;
