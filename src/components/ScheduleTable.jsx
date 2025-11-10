import React, { useState, useRef } from "react";
import { sendChatMessageWithCity } from "../hooks/useWeatherChat";

function ScheduleTable({
	scheduleData,
	outfitImages: initialOutfitImages,
	onClose,
	onSave,
}) {
	// Handle both array and object formats for scheduleData
	const initialItems = Array.isArray(scheduleData)
		? scheduleData
		: scheduleData?.items || [];
	const scheduleTitle =
		typeof scheduleData === "object" && !Array.isArray(scheduleData)
			? scheduleData?.title || "Daily Schedule"
			: "Daily Schedule";

	const [schedule, setSchedule] = useState(initialItems);
	const [title, setTitle] = useState(scheduleTitle);
	const [isEditing, setIsEditing] = useState(null);
	const [editValue, setEditValue] = useState("");
	const [columnOrder, setColumnOrder] = useState([
		"time",
		"activity",
		"weather",
		"outfit",
		"actions",
	]);
	const [draggedColumn, setDraggedColumn] = useState(null);
	const [draggedRowIndex, setDraggedRowIndex] = useState(null);
	const [dragOverRowIndex, setDragOverRowIndex] = useState(null);
	const [aiLoading, setAiLoading] = useState(null);
	const [outfitImages, setOutfitImages] = useState(initialOutfitImages || {});
	const tableRef = useRef(null);

	// Add new schedule item
	const addScheduleItem = () => {
		const newItem = {
			time: "12:00 PM",
			activity: "New activity",
			weather: "",
			outfit: "",
		};
		setSchedule([...schedule, newItem]);
	};

	// Delete schedule item
	const deleteScheduleItem = (index) => {
		const updatedSchedule = schedule.filter((_, i) => i !== index);
		setSchedule(updatedSchedule);
	};

	// Start editing a cell
	const startEditing = (rowIndex, field, currentValue) => {
		setIsEditing(`${rowIndex}-${field}`);
		setEditValue(currentValue);
	};

	// Generate outfit image from description
	const generateOutfitImage = async (outfitDescription, time, activity) => {
		try {
			// Create a search query from outfit description and activity
			const searchQuery = `${
				outfitDescription.split(".")[0]
			} outfit ${activity}`.substring(0, 100);

			// Use Unsplash API to fetch related outfit images
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

			// Fallback: Use a generic clothing/fashion image if API fails
			return `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop`;
		} catch (error) {
			console.error("Error generating outfit image:", error);
			// Return a fallback image
			return `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop`;
		}
	};

	// Save edit
	const saveEdit = async (rowIndex, field) => {
		const updatedSchedule = [...schedule];
		if (field === "notes") {
			// For notes, we need to handle weather and outfit separately
			updatedSchedule[rowIndex].weather = editValue.includes("🌤️")
				? editValue
				: "";
			updatedSchedule[rowIndex].outfit = editValue.includes("👔")
				? editValue
				: "";
		} else {
			updatedSchedule[rowIndex][field] = editValue;
		}
		setSchedule(updatedSchedule);
		setIsEditing(null);

		// Trigger AI generation for all fields when activity or time is updated
		if ((field === "activity" || field === "time") && editValue.trim()) {
			try {
				setAiLoading(rowIndex);
				const time = updatedSchedule[rowIndex].time;
				const activity = updatedSchedule[rowIndex].activity;

				// Generate comprehensive schedule information
				const prompt = `You are Storm, a weather and activity assistant. For a schedule entry at ${time} with activity: "${activity}", generate SHORT and CONCISE suggestions:

1. WEATHER: Brief weather info (max 2 sentences - temperature, conditions, key recommendation)
2. OUTFIT: Brief outfit suggestions (max 2 sentences - key clothing items and materials)

Respond EXACTLY in this format:
WEATHER: [2-sentence weather info]
OUTFIT: [2-sentence outfit suggestions]`;

				console.log("Sending prompt to AI:", prompt);
				const { assistantMessage } = await sendChatMessageWithCity(prompt, []);
				console.log("AI Response:", assistantMessage);

				// Parse the AI response to fill different fields
				const weatherMatch = assistantMessage.match(
					/WEATHER:\s*(.+?)(?=OUTFIT:|$)/is
				);
				const outfitMatch = assistantMessage.match(/OUTFIT:\s*(.+?)$/is);

				console.log("Weather Match:", weatherMatch);
				console.log("Outfit Match:", outfitMatch);

				if (weatherMatch && weatherMatch[1]) {
					updatedSchedule[rowIndex].weather = weatherMatch[1].trim();
					console.log("Updated weather:", updatedSchedule[rowIndex].weather);
				}
				if (outfitMatch && outfitMatch[1]) {
					updatedSchedule[rowIndex].outfit = outfitMatch[1].trim();
					console.log("Updated outfit:", updatedSchedule[rowIndex].outfit);

					// Generate outfit image
					const outfitDescription = outfitMatch[1].trim();
					const imageUrl = await generateOutfitImage(
						outfitDescription,
						time,
						activity
					);
					setOutfitImages((prev) => ({
						...prev,
						[rowIndex]: imageUrl,
					}));
				}

				setSchedule(updatedSchedule);
			} catch (error) {
				console.error("Error generating schedule info via AI:", error);
			} finally {
				setAiLoading(null);
			}
		}

		setEditValue("");
	};

	// Cancel edit
	const cancelEdit = () => {
		setIsEditing(null);
		setEditValue("");
	};

	// Handle column drag start
	const handleColumnDragStart = (e, column) => {
		setDraggedColumn(column);
		e.dataTransfer.effectAllowed = "move";
	};

	// Handle column drag over
	const handleColumnDragOver = (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	// Handle column drop
	const handleColumnDrop = (e, targetColumn) => {
		e.preventDefault();
		if (!draggedColumn || draggedColumn === targetColumn) {
			setDraggedColumn(null);
			return;
		}

		const draggedIndex = columnOrder.indexOf(draggedColumn);
		const targetIndex = columnOrder.indexOf(targetColumn);

		const newOrder = [...columnOrder];
		newOrder.splice(draggedIndex, 1);
		newOrder.splice(targetIndex, 0, draggedColumn);

		setColumnOrder(newOrder);
		setDraggedColumn(null);
	};

	// Handle row drag start
	const handleRowDragStart = (e, rowIndex) => {
		setDraggedRowIndex(rowIndex);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/html", e.currentTarget);
	};

	// Handle row drag over
	const handleRowDragOver = (e, rowIndex) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOverRowIndex(rowIndex);
	};

	// Handle row drag leave
	const handleRowDragLeave = () => {
		setDragOverRowIndex(null);
	};

	// Handle row drop
	const handleRowDrop = (e, targetRowIndex) => {
		e.preventDefault();
		setDragOverRowIndex(null);
		if (draggedRowIndex === null || draggedRowIndex === targetRowIndex) {
			setDraggedRowIndex(null);
			return;
		}

		const newSchedule = [...schedule];
		const draggedRow = newSchedule[draggedRowIndex];
		newSchedule.splice(draggedRowIndex, 1);
		newSchedule.splice(targetRowIndex, 0, draggedRow);

		setSchedule(newSchedule);
		setDraggedRowIndex(null);
	};

	// Get column headers in the correct order
	const columnHeaders = {
		time: "Time",
		activity: "Activity",
		weather: "Weather Notes",
		outfit: "Outfit Suggestions",
		actions: "Actions",
	};

	// Render table cell based on column type
	const renderTableCell = (item, rowIndex, column) => {
		switch (column) {
			case "time":
				return (
					<td
						key="time"
						className="editable-cell time-cell"
						onClick={() => startEditing(rowIndex, "time", item.time)}
					>
						{isEditing === `${rowIndex}-time` ? (
							<input
								type="text"
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
								onBlur={() => saveEdit(rowIndex, "time")}
								onKeyDown={(e) => handleKeyPress(e, rowIndex, "time")}
								autoFocus
								className="edit-input"
							/>
						) : (
							<span className="time-display">{item.time}</span>
						)}
					</td>
				);
			case "activity":
				return (
					<td
						key="activity"
						className="editable-cell activity-cell"
						onClick={() => startEditing(rowIndex, "activity", item.activity)}
					>
						{isEditing === `${rowIndex}-activity` ? (
							<textarea
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
								onBlur={() => saveEdit(rowIndex, "activity")}
								onKeyDown={(e) => handleKeyPress(e, rowIndex, "activity")}
								autoFocus
								className="edit-textarea"
								rows="2"
							/>
						) : (
							<span>{item.activity}</span>
						)}
					</td>
				);
			case "weather":
				return (
					<td
						key="weather"
						className={`editable-cell weather-cell ${
							aiLoading === rowIndex ? "ai-loading" : ""
						}`}
						onClick={() => startEditing(rowIndex, "weather", item.weather)}
					>
						{aiLoading === rowIndex ? (
							<span className="ai-generating">✨ Generating weather...</span>
						) : isEditing === `${rowIndex}-weather` ? (
							<input
								type="text"
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
								onBlur={() => saveEdit(rowIndex, "weather")}
								onKeyDown={(e) => handleKeyPress(e, rowIndex, "weather")}
								autoFocus
								className="edit-input"
								placeholder="☀️ Temperature, conditions, wind, precipitation..."
							/>
						) : (
							<span className="weather-note">
								{item.weather || "Add weather notes..."}
							</span>
						)}
					</td>
				);
			case "outfit":
				return (
					<td
						key="outfit"
						className={`editable-cell outfit-cell ${
							aiLoading === rowIndex ? "ai-loading" : ""
						}`}
						onClick={() => startEditing(rowIndex, "outfit", item.outfit)}
					>
						{aiLoading === rowIndex ? (
							<span className="ai-generating">✨ Generating outfit...</span>
						) : isEditing === `${rowIndex}-outfit` ? (
							<input
								type="text"
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
								onBlur={() => saveEdit(rowIndex, "outfit")}
								onKeyDown={(e) => handleKeyPress(e, rowIndex, "outfit")}
								autoFocus
								className="edit-input"
								placeholder="👕 Layers, accessories, shoes, materials..."
							/>
						) : (
							<div className="outfit-content">
								{outfitImages[rowIndex] && (
									<img
										src={outfitImages[rowIndex]}
										alt="Outfit suggestion"
										className="outfit-image"
									/>
								)}
								<span className="outfit-note">
									{item.outfit || "Add outfit suggestions..."}
								</span>
							</div>
						)}
					</td>
				);
			case "actions":
				return (
					<td key="actions" className="actions-cell">
						<button
							className="delete-btn"
							onClick={() => deleteScheduleItem(rowIndex)}
							title="Delete this item"
						>
							🗑️
						</button>
					</td>
				);
			default:
				return null;
		}
	};

	// Handle key press in edit mode
	const handleKeyPress = (e, rowIndex, field) => {
		if (e.key === "Enter") {
			saveEdit(rowIndex, field);
		} else if (e.key === "Escape") {
			cancelEdit();
		}
	};

	// Export to CSV
	const exportToCSV = () => {
		const csvContent = [
			["Time", "Activity", "Weather", "Outfit"],
			...schedule.map((item) => [
				item.time,
				item.activity,
				item.weather,
				item.outfit,
			]),
		]
			.map((row) => row.map((field) => `"${field}"`).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `schedule-${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	// Print schedule
	const printSchedule = () => {
		const printWindow = window.open("", "_blank");
		const printContent = `
      <html>
        <head>
          <title>Daily Schedule</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Daily Schedule</h1>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr><th>Time</th><th>Activity</th><th>Weather</th><th>Outfit</th></tr>
            </thead>
            <tbody>
              ${schedule
								.map(
									(item) => `
                <tr>
                  <td>${item.time}</td>
                  <td>${item.activity}</td>
                  <td>${item.weather}</td>
                  <td>${item.outfit}</td>
                </tr>
              `
								)
								.join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
		printWindow.document.write(printContent);
		printWindow.document.close();
		printWindow.print();
	};

	return (
		<div className="schedule-table-overlay">
			<div className="schedule-table-container">
				<div className="schedule-table-header">
					<div className="schedule-table-title">
						<h2>📅 Daily Schedule Editor</h2>
						<p>
							Drag rows to reorder • Click cells to edit • Drag column headers
							to reorder
						</p>
					</div>
					<div className="schedule-table-actions">
						<button className="schedule-btn add-btn" onClick={addScheduleItem}>
							➕ Add Item
						</button>
						<button className="schedule-btn export-btn" onClick={exportToCSV}>
							📥 Export CSV
						</button>
						<button className="schedule-btn print-btn" onClick={printSchedule}>
							🖨️ Print
						</button>
						<button
							className="schedule-btn save-btn"
							onClick={() => onSave && onSave(schedule)}
						>
							💾 Save
						</button>
						<button className="schedule-close-btn" onClick={onClose}>
							×
						</button>
					</div>
				</div>

				<div className="schedule-table-wrapper">
					<table className="editable-schedule-table" ref={tableRef}>
						<thead>
							<tr>
								{columnOrder.map((column) => (
									<th
										key={column}
										draggable
										onDragStart={(e) => handleColumnDragStart(e, column)}
										onDragOver={handleColumnDragOver}
										onDrop={(e) => handleColumnDrop(e, column)}
										className={draggedColumn === column ? "dragging" : ""}
										title="Drag to reorder columns"
									>
										{columnHeaders[column]}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{schedule.map((item, rowIndex) => (
								<tr
									key={rowIndex}
									className={`schedule-table-row ${
										draggedRowIndex === rowIndex ? "dragging" : ""
									} ${dragOverRowIndex === rowIndex ? "drag-over" : ""}`}
									draggable
									onDragStart={(e) => handleRowDragStart(e, rowIndex)}
									onDragOver={(e) => handleRowDragOver(e, rowIndex)}
									onDragLeave={handleRowDragLeave}
									onDrop={(e) => handleRowDrop(e, rowIndex)}
									title="Drag to reorder rows"
								>
									{columnOrder.map((column) =>
										renderTableCell(item, rowIndex, column)
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{schedule.length === 0 && (
					<div className="empty-schedule">
						<div className="empty-icon">📅</div>
						<p>No schedule items yet.</p>
						<button className="schedule-btn add-btn" onClick={addScheduleItem}>
							➕ Add Your First Item
						</button>
					</div>
				)}

				<div className="schedule-table-footer">
					<p className="schedule-help">
						<strong>💡 Tips:</strong> Drag rows to reorder • Click cells to edit
						• Enter to save • Escape to cancel • Drag columns to reorder •
						Weather: temp, conditions, wind • Outfit: layers, accessories, shoes
					</p>
				</div>
			</div>
		</div>
	);
}

export default ScheduleTable;
