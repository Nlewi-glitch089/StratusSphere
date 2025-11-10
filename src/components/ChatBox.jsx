import React, { useState, useRef, useEffect } from "react";

function ChatBox({ messages, isLoading, onSendMessage }) {
	const messagesEndRef = useRef(null);

	useEffect(() => {
		// Auto-scroll to bottom when new messages arrive
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSuggestionClick = (suggestion) => {
		if (onSendMessage) {
			onSendMessage(suggestion);
		}
	};

	// Function to format assistant messages with better structure
	const formatMessage = (content, role) => {
		if (role === "assistant") {
			// Split content by lines and format sections
			const lines = content.split("\n");
			const formattedLines = lines
				.map((line, idx) => {
					// Handle headers (lines with ** around them)
					if (line.includes("**") && line.trim().length > 0) {
						const headerText = line.replace(/\*\*/g, "");
						return (
							<div key={idx} className="message-header">
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
							<div key={idx} className="message-list-item">
								{line}
							</div>
						);
					}
					// Handle empty lines for spacing
					else if (line.trim().length === 0) {
						return <div key={idx} className="message-spacer"></div>;
					}
					// Regular content
					else if (line.trim().length > 0) {
						return (
							<div key={idx} className="message-text">
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

	return (
		<div className="chatbox">
			<div className="chatbox-header">
				<div className="bot-avatar">🌤️</div>
				<div className="bot-info">
					<span className="bot-name">Storm Assistant</span>
					<span className="bot-status">Weather & Activity Planner</span>
				</div>
			</div>
			<div className="messages">
				{messages.length === 0 && (
					<div className="welcome-message">
						<div className="welcome-icon">👋</div>
						<div className="welcome-text">
							<p>
								Hi! I'm Storm, your personal weather and activity assistant!{" "}
							</p>
							<p>I can help you:</p>
							<ul>
								<li>🗓️ Build daily schedules based on weather</li>
								<li>👔 Recommend outfits for the conditions</li>
								<li>🎯 Suggest weather-appropriate activities</li>
								<li>📍 Provide location-specific advice</li>
							</ul>
							<p>
								<strong>Try asking:</strong>
							</p>
							<div className="suggestion-chips">
								<span
									className="chip"
									onClick={() => handleSuggestionClick("Plan my day")}
								>
									"Plan my day"
								</span>
								<span
									className="chip"
									onClick={() => handleSuggestionClick("What should I wear?")}
								>
									"What should I wear?"
								</span>
								<span
									className="chip"
									onClick={() => handleSuggestionClick("Activities for today?")}
								>
									"Activities for today?"
								</span>
							</div>
						</div>
					</div>
				)}

				{messages.map((msg, idx) => (
					<div key={idx} className={`message ${msg.role}`}>
						{msg.role === "assistant" && (
							<div className="message-avatar">🌤️</div>
						)}
						<div className="message-content">
							{msg.role === "assistant" ? (
								<div className="formatted-content">
									{formatMessage(msg.content, msg.role)}
								</div>
							) : (
								<p>{msg.content}</p>
							)}
						</div>
						{msg.role === "user" && (
							<div className="message-avatar user-avatar">👤</div>
						)}
					</div>
				))}

				{isLoading && (
					<div className="message assistant">
						<div className="message-avatar">🌤️</div>
						<div className="message-content">
							<div className="typing-indicator">
								<span className="typing-dots">
									<span></span>
									<span></span>
									<span></span>
								</span>
								<span className="typing-text">Storm is thinking...</span>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
}

export default ChatBox;
