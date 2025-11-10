import React, { useState, useRef, useEffect } from "react";

function ChatBubble({
	messages,
	isLoading,
	onSendMessage,
	isVisible,
	onClose,
	onScheduleDetected,
}) {
	const messagesEndRef = useRef(null);
	const bubbleRef = useRef(null);
	const [position, setPosition] = useState({ x: 20, y: 100 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isMinimized, setIsMinimized] = useState(false);
	const [size, setSize] = useState({ width: 300, height: 500 });
	const [isResizing, setIsResizing] = useState(false);
	const [resizeDirection, setResizeDirection] = useState(null);

	useEffect(() => {
		// Auto-scroll to bottom when new messages arrive
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Dragging functionality
	const handleMouseDown = (e) => {
		if (
			e.target.closest(".bubble-close-btn") ||
			e.target.closest(".bubble-minimize-btn") ||
			e.target.closest(".bubble-action-btn") ||
			e.target.closest(".resize-handle")
		) {
			return; // Don't start dragging if clicking on buttons or resize handles
		}

		setIsDragging(true);
		const rect = bubbleRef.current.getBoundingClientRect();
		setDragOffset({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
	};

	// Resizing functionality
	const handleResizeMouseDown = (e, direction) => {
		e.preventDefault();
		e.stopPropagation();

		setIsResizing(true);
		setResizeDirection(direction);

		const rect = bubbleRef.current.getBoundingClientRect();
		setDragOffset({
			x: e.clientX - rect.right,
			y: e.clientY - rect.bottom,
			startWidth: rect.width,
			startHeight: rect.height,
			startX: e.clientX,
			startY: e.clientY,
		});
	};

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (isDragging) {
				const newX = e.clientX - dragOffset.x;
				const newY = e.clientY - dragOffset.y;

				// Keep bubble within viewport bounds
				const maxX = window.innerWidth - size.width;
				const maxY = window.innerHeight - (isMinimized ? 60 : size.height);

				setPosition({
					x: Math.max(0, Math.min(newX, maxX)),
					y: Math.max(0, Math.min(newY, maxY)),
				});
			} else if (isResizing) {
				const deltaX = e.clientX - dragOffset.startX;
				const deltaY = e.clientY - dragOffset.startY;

				let newWidth = size.width;
				let newHeight = size.height;

				if (resizeDirection.includes("right")) {
					newWidth = Math.max(
						250,
						Math.min(600, dragOffset.startWidth + deltaX)
					);
				}
				if (resizeDirection.includes("bottom")) {
					newHeight = Math.max(
						200,
						Math.min(800, dragOffset.startHeight + deltaY)
					);
				}

				setSize({ width: newWidth, height: newHeight });
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			setIsResizing(false);
			setResizeDirection(null);
		};

		if (isDragging || isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, isResizing, dragOffset, size, isMinimized, resizeDirection]);

	// Function to format assistant messages with better structure
	const formatMessage = (content, role) => {
		if (role === "assistant") {
			// Check if this is a schedule response that should be formatted as a table
			if (
				content.toLowerCase().includes("schedule") ||
				content.toLowerCase().includes("plan") ||
				(content.includes(":") && content.includes("AM")) ||
				content.includes("PM")
			) {
				return formatScheduleAsTable(content);
			}

			// Split content by lines and format sections
			const lines = content.split("\n");
			const formattedLines = lines
				.map((line, idx) => {
					// Handle headers (lines with ** around them)
					if (line.includes("**") && line.trim().length > 0) {
						const headerText = line.replace(/\*\*/g, "");
						return (
							<div key={idx} className="bubble-message-header">
								{headerText}
							</div>
						);
					}
					// Handle bullet points or numbered lists
					else if (
						line.trim().startsWith("-") ||
						line.trim().startsWith("•") ||
						/^\d+\./.test(line.trim())
					) {
						return (
							<div key={idx} className="bubble-message-list-item">
								{line}
							</div>
						);
					}
					// Handle empty lines for spacing
					else if (line.trim().length === 0) {
						return <div key={idx} className="bubble-message-spacer"></div>;
					}
					// Regular content
					else if (line.trim().length > 0) {
						return (
							<div key={idx} className="bubble-message-text">
								{line}
							</div>
						);
					}
					return null;
				})
				.filter(Boolean);

			return formattedLines;
		}
		return content;
	};

	// Function to format schedule content as a table
	const formatScheduleAsTable = (content) => {
		const lines = content.split("\n");
		const scheduleItems = [];
		let currentSection = "";

		lines.forEach((line) => {
			const trimmed = line.trim();
			if (!trimmed) return;

			// Check if line contains time information
			const timeMatch = trimmed.match(
				/(\d{1,2}:\d{2}\s*(AM|PM)|\d{1,2}\s*(AM|PM))/i
			);

			if (timeMatch) {
				// Extract time and activity
				const time = timeMatch[0];
				const activity = trimmed
					.replace(timeMatch[0], "")
					.replace(/^[\s\-\•:]+|[\s\-\•:]+$/g, "");

				if (activity) {
					scheduleItems.push({
						time: time,
						activity: activity,
						weather: "", // We'll try to extract weather info if present
						outfit: "", // We'll try to extract outfit info if present
					});
				}
			} else if (
				trimmed.includes("**") ||
				trimmed.includes("Schedule") ||
				trimmed.includes("Plan")
			) {
				// This is a header/section
				currentSection = trimmed.replace(/\*\*/g, "");
			} else if (trimmed.length > 0 && !timeMatch) {
				// This might be additional info, weather, or outfit recommendation
				if (scheduleItems.length > 0) {
					const lastItem = scheduleItems[scheduleItems.length - 1];
					if (
						trimmed.toLowerCase().includes("wear") ||
						trimmed.toLowerCase().includes("outfit") ||
						trimmed.toLowerCase().includes("clothing")
					) {
						lastItem.outfit = trimmed;
					} else if (
						trimmed.toLowerCase().includes("weather") ||
						trimmed.toLowerCase().includes("temperature") ||
						trimmed.toLowerCase().includes("°")
					) {
						lastItem.weather = trimmed;
					} else {
						// Add to activity description
						lastItem.activity += ` - ${trimmed}`;
					}
				}
			}
		});

		if (scheduleItems.length === 0) {
			// Fallback to regular formatting if no schedule items found
			return formatRegularContent(content);
		}

		// If we have schedule items and a callback, trigger the full schedule view
		if (scheduleItems.length > 0 && onScheduleDetected) {
			// Show a preview with a button to open full editor
			return (
				<div className="schedule-container">
					{currentSection && (
						<div className="schedule-header">{currentSection}</div>
					)}
					<div className="schedule-preview">
						<p>📅 Schedule created with {scheduleItems.length} items!</p>
						<button
							className="open-schedule-btn"
							onClick={() => onScheduleDetected(scheduleItems, currentSection)}
						>
							📝 Open in Schedule Editor
						</button>
					</div>
					<div className="schedule-table-wrapper">
						<table className="schedule-table">
							<thead>
								<tr>
									<th>Time</th>
									<th>Activity</th>
									<th>Notes</th>
								</tr>
							</thead>
							<tbody>
								{scheduleItems.slice(0, 3).map((item, idx) => (
									<tr key={idx} className="schedule-row">
										<td className="schedule-time">{item.time}</td>
										<td className="schedule-activity">{item.activity}</td>
										<td className="schedule-notes">
											{item.weather && (
												<div className="weather-note">{item.weather}</div>
											)}
											{item.outfit && (
												<div className="outfit-note">{item.outfit}</div>
											)}
										</td>
									</tr>
								))}
								{scheduleItems.length > 3 && (
									<tr>
										<td colSpan="3" className="schedule-more">
											...and {scheduleItems.length - 3} more items
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			);
		}

		// Original table format if no callback provided
		return (
			<div className="schedule-container">
				{currentSection && (
					<div className="schedule-header">{currentSection}</div>
				)}
				<div className="schedule-table-wrapper">
					<table className="schedule-table">
						<thead>
							<tr>
								<th>Time</th>
								<th>Activity</th>
								<th>Notes</th>
							</tr>
						</thead>
						<tbody>
							{scheduleItems.map((item, idx) => (
								<tr key={idx} className="schedule-row">
									<td className="schedule-time">{item.time}</td>
									<td className="schedule-activity">{item.activity}</td>
									<td className="schedule-notes">
										{item.weather && (
											<div className="weather-note">{item.weather}</div>
										)}
										{item.outfit && (
											<div className="outfit-note">{item.outfit}</div>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	// Fallback function for regular content formatting
	const formatRegularContent = (content) => {
		const lines = content.split("\n");
		return lines
			.map((line, idx) => {
				if (line.includes("**") && line.trim().length > 0) {
					const headerText = line.replace(/\*\*/g, "");
					return (
						<div key={idx} className="bubble-message-header">
							{headerText}
						</div>
					);
				} else if (
					line.trim().startsWith("-") ||
					line.trim().startsWith("•") ||
					/^\d+\./.test(line.trim())
				) {
					return (
						<div key={idx} className="bubble-message-list-item">
							{line}
						</div>
					);
				} else if (line.trim().length === 0) {
					return <div key={idx} className="bubble-message-spacer"></div>;
				} else if (line.trim().length > 0) {
					return (
						<div key={idx} className="bubble-message-text">
							{line}
						</div>
					);
				}
				return null;
			})
			.filter(Boolean);
	};

	const handleSuggestionClick = (suggestion) => {
		if (onSendMessage) {
			onSendMessage(suggestion);
		}
	};

	const handleQuickAction = (action) => {
		const actionMessages = {
			schedule:
				"Create a detailed schedule for my day based on the current weather conditions",
			outfit:
				"What should I wear today? Please recommend an outfit based on the weather",
			activities:
				"Suggest some activities I can do today given the current weather conditions",
			planning:
				"Help me plan my day with weather-appropriate activities and timing",
		};

		if (onSendMessage && actionMessages[action]) {
			onSendMessage(actionMessages[action]);
		}
	};

	if (!isVisible) return null;

	return (
		<div
			className={`chat-bubble-sidebar ${isMinimized ? "minimized" : ""} ${
				isResizing ? "resizing" : ""
			}`}
			ref={bubbleRef}
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
				width: `${size.width}px`,
				height: isMinimized ? "60px" : `${size.height}px`,
				cursor: isDragging ? "grabbing" : isResizing ? "nw-resize" : "auto",
			}}
		>
			{/* Bubble Header - Draggable */}
			<div
				className="bubble-header"
				onMouseDown={handleMouseDown}
				style={{ cursor: isDragging ? "grabbing" : "grab" }}
			>
				<div className="bubble-bot-avatar">🌤️</div>
				<div className="bubble-bot-info">
					<span className="bubble-bot-name">Storm Assistant</span>
					<span className="bubble-bot-status">Weather & Activity Planner</span>
				</div>
				<div className="bubble-header-controls">
					<button
						className="bubble-minimize-btn"
						onClick={() => setIsMinimized(!isMinimized)}
						title={isMinimized ? "Expand" : "Minimize"}
					>
						{isMinimized ? "□" : "_"}
					</button>
					<button className="bubble-close-btn" onClick={onClose} title="Close">
						×
					</button>
				</div>
			</div>

			{/* Quick Action Buttons - Always visible */}
			{!isMinimized && (
				<div className="bubble-quick-actions">
					<button
						className="bubble-action-btn schedule-btn"
						onClick={() => handleQuickAction("schedule")}
						title="Create Schedule"
					>
						🗓️ Schedule
					</button>
					<button
						className="bubble-action-btn outfit-btn"
						onClick={() => handleQuickAction("outfit")}
						title="Outfit Suggestions"
					>
						👔 Outfit
					</button>
					<button
						className="bubble-action-btn activity-btn"
						onClick={() => handleQuickAction("activities")}
						title="Activity Ideas"
					>
						🎯 Activities
					</button>
					<button
						className="bubble-action-btn planning-btn"
						onClick={() => handleQuickAction("planning")}
						title="Day Planning"
					>
						📍 Plan Day
					</button>
				</div>
			)}

			{/* Messages Container - Only visible when not minimized */}
			{!isMinimized && (
				<div className="bubble-messages">
					{messages.length === 0 && (
						<div className="bubble-welcome-message">
							<div className="bubble-welcome-icon">👋</div>
							<div className="bubble-welcome-text">
								<p>Hi! I'm Storm, your personal weather assistant!</p>
								<p>
									Use the buttons above for quick actions, or chat with me
									directly.
								</p>
							</div>
						</div>
					)}

					{messages.map((msg, idx) => (
						<div key={idx} className={`bubble-message ${msg.role}`}>
							{msg.role === "assistant" && (
								<div className="bubble-message-avatar">🌤️</div>
							)}
							<div className="bubble-message-content">
								{msg.role === "assistant" ? (
									<div className="bubble-formatted-content">
										{formatMessage(msg.content, msg.role)}
									</div>
								) : (
									<p>{msg.content}</p>
								)}
							</div>
							{msg.role === "user" && (
								<div className="bubble-message-avatar bubble-user-avatar">
									👤
								</div>
							)}
						</div>
					))}

					{isLoading && (
						<div className="bubble-message assistant">
							<div className="bubble-message-avatar">🌤️</div>
							<div className="bubble-message-content">
								<div className="bubble-typing-indicator">
									<span className="bubble-typing-dots">
										<span></span>
										<span></span>
										<span></span>
									</span>
									<span className="bubble-typing-text">
										Storm is thinking...
									</span>
								</div>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			)}

			{/* Resize Handles */}
			{!isMinimized && (
				<>
					<div
						className="resize-handle resize-right"
						onMouseDown={(e) => handleResizeMouseDown(e, "right")}
					/>
					<div
						className="resize-handle resize-bottom"
						onMouseDown={(e) => handleResizeMouseDown(e, "bottom")}
					/>
					<div
						className="resize-handle resize-corner"
						onMouseDown={(e) => handleResizeMouseDown(e, "right-bottom")}
					/>
				</>
			)}
		</div>
	);
}

export default ChatBubble;
