import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "../styles/BackgroundAnimation.css";

function BackgroundAnimation() {
	const { theme } = useContext(ThemeContext);
	const [elements, setElements] = useState([]);

	useEffect(() => {
		// Generate random elements (bubbles for light mode, stars for dark mode)
		const generateElements = () => {
			const count = theme === "light" ? 15 : 20; // More stars than bubbles
			const newElements = Array.from({ length: count }, (_, i) => ({
				id: i,
				left: Math.random() * 100,
				top: Math.random() * 100,
				size:
					theme === "light"
						? Math.random() * 60 + 20 // 20-80px for bubbles
						: Math.random() * 3 + 1, // 1-4px for stars
				duration: Math.random() * 30 + 25, // 25-55 seconds animation for more movement
				delay: Math.random() * 8, // 0-8 seconds stagger
			}));
			setElements(newElements);
		};

		generateElements();
	}, [theme]);

	return (
		<div className="background-animation" data-theme={theme}>
			{theme === "light" ? (
				// Bubbles for light mode
				<div className="bubbles-container">
					{elements.map((bubble) => (
						<div
							key={bubble.id}
							className="bubble"
							style={{
								left: `${bubble.left}%`,
								top: `${bubble.top}%`,
								width: `${bubble.size}px`,
								height: `${bubble.size}px`,
								animation: `float ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,
							}}
						/>
					))}
				</div>
			) : (
				// Twinkling stars for dark mode
				<div className="stars-container">
					{elements.map((star) => (
						<div
							key={star.id}
							className="star"
							style={{
								left: `${star.left}%`,
								top: `${star.top}%`,
								width: `${star.size}px`,
								height: `${star.size}px`,
								animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default BackgroundAnimation;
