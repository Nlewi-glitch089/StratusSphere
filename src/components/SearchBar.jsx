import { useState } from "react";

function SearchBar({ onSendMessage, isLoading }) {
	const [query, setQuery] = useState("");

	const handleSearch = async () => {
		if (!query.trim()) return;

		// Send query to parent (App) to handle OpenAI chat
		onSendMessage(query);
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
				placeholder="Ask about weather... (e.g., 'Weather in New York', 'Tokyo weather', 'How's London?')"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyPress={handleKeyPress}
				disabled={isLoading}
			/>
			<button onClick={handleSearch} disabled={isLoading}>
				{isLoading ? "..." : "Ask"}
			</button>
		</div>
	);
}

export default SearchBar;
