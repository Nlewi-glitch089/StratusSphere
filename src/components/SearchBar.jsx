import { useState } from "react";

function SearchBar({ onSendMessage, isLoading }) {
	const [query, setQuery] = useState("");

	// Detect if input is a location (not a question or command)
	const isLocationInput = (input) => {
		const lowerInput = input.toLowerCase().trim();
		// If it's a simple word/phrase without question marks or action words, treat as location
		return (
			!lowerInput.includes("?") &&
			!lowerInput.includes("plan") &&
			!lowerInput.includes("recommend") &&
			!lowerInput.includes("suggest") &&
			!lowerInput.includes("what") &&
			!lowerInput.includes("when") &&
			!lowerInput.includes("how") &&
			!lowerInput.includes("should") &&
			!lowerInput.includes("activities") &&
			lowerInput.length > 0
		);
	};

	const handleSearch = async () => {
		const trimmedQuery = query.trim();
		if (!trimmedQuery) {
			// Just show the chatbot without sending a message
			onSendMessage("");
			return;
		}

		// If input looks like a location, ask for weather
		const messageToSend = isLocationInput(trimmedQuery)
			? `What's the weather in ${trimmedQuery}?`
			: trimmedQuery;

		// Send query to parent (App) to handle OpenAI chat
		onSendMessage(messageToSend);
		setQuery("");
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !isLoading) {
			handleSearch();
		}
	};

	return (
		<div className="search-bar">
			<input
				type="text"
				placeholder="Ask Storm to plan your day, recommend outfits, or suggest activities... (e.g., 'Plan my day in NYC', 'What should I wear?', 'Activities for today?')"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyPress={handleKeyPress}
				disabled={isLoading}
			/>
			<button onClick={handleSearch} disabled={isLoading}>
				{isLoading ? "⏳" : "💬"}
			</button>
		</div>
	);
}

export default SearchBar;
