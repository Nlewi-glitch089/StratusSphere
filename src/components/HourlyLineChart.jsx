import React, { useRef, useEffect, useState } from 'react';

function HourlyLineChart({ hourlyData, showAll = false }) {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Filter data based on showAll prop
  const displayData = showAll ? hourlyData : hourlyData.filter((_, idx) => idx % 3 === 0);

  // Get weather icon emoji based on condition text
  const getWeatherEmoji = (conditionText) => {
    const condition = conditionText.toLowerCase();
    
    // Clear conditions
    if (condition.includes('clear sky') || condition.includes('clear') || condition.includes('sunny')) {
      return '☀️';
    }
    // Partly cloudy / mainly clear
    else if (condition.includes('mainly clear') || condition.includes('partly cloudy')) {
      return '⛅';
    }
    // Cloudy / overcast
    else if (condition.includes('overcast') || condition.includes('cloudy')) {
      return '☁️';
    }
    // Rain conditions
    else if (condition.includes('heavy rain') || condition.includes('violent rain')) {
      return '🌧️'; // Heavy rain cloud
    }
    else if (condition.includes('moderate rain') || condition.includes('rain showers')) {
      return '🌦️'; // Sun behind rain cloud
    }
    else if (condition.includes('rain')) {
      return '🌧️'; // General rain
    }
    // Snow conditions
    else if (condition.includes('heavy snow') || condition.includes('snow showers')) {
      return '🌨️';
    }
    else if (condition.includes('moderate snow') || condition.includes('slight snow') || condition.includes('snow grains')) {
      return '❄️';
    }
    else if (condition.includes('snow')) {
      return '❄️';
    }
    // Thunderstorms
    else if (condition.includes('thunderstorm') || condition.includes('hail')) {
      return '⛈️';
    }
    // Fog
    else if (condition.includes('fog')) {
      return '🌫️'; // Fog cloud
    }
    // Default for unknown conditions
    else {
      return '🌤️'; // Partly sunny as default
    }
  };

  useEffect(() => {
    if (!displayData || displayData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up colors based on your theme
    const lineColor = '#f5e960'; // electric-yellow
    const fillColor = 'rgba(245, 233, 96, 0.1)';
    const pointColor = '#7a3ff2'; // violet-surge
    const pointHoverColor = '#f5e960';
    const textColor = '#b3b7c4'; // silver-mist
    const gridColor = 'rgba(179, 183, 196, 0.2)';

    // Calculate dimensions and margins
    const margin = { top: 40, right: 20, bottom: 80, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Get temperature range
    const temps = displayData.map(d => d.temp_c);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRange = maxTemp - minTemp || 10; // Fallback if all temps are same

    // Add some padding to the range
    const paddedMin = minTemp - tempRange * 0.1;
    const paddedMax = maxTemp + tempRange * 0.1;

    // Helper functions for scaling
    const xScale = (index) => margin.left + (index / (displayData.length - 1)) * chartWidth;
    const yScale = (temp) => margin.top + ((paddedMax - temp) / (paddedMax - paddedMin)) * chartHeight;

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);

    // Horizontal grid lines (temperature)
    for (let i = 0; i <= 4; i++) {
      const temp = paddedMin + (paddedMax - paddedMin) * (i / 4);
      const y = yScale(temp);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      
      // Temperature labels
      ctx.fillStyle = textColor;
      ctx.font = '12px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(temp)}°`, margin.left - 10, y + 4);
    }

    // Vertical grid lines (time)
    for (let i = 0; i < displayData.length; i += Math.max(1, Math.floor(displayData.length / 6))) {
      const x = xScale(i);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartHeight);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Create gradient for fill
    const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
    gradient.addColorStop(0, fillColor);
    gradient.addColorStop(1, 'rgba(245, 233, 96, 0.02)');

    // Draw area fill
    ctx.beginPath();
    ctx.moveTo(xScale(0), margin.top + chartHeight);
    displayData.forEach((data, index) => {
      const x = xScale(index);
      const y = yScale(data.temp_c);
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(xScale(displayData.length - 1), margin.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    displayData.forEach((data, index) => {
      const x = xScale(index);
      const y = yScale(data.temp_c);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw weather icons above the line
    displayData.forEach((data, index) => {
      const x = xScale(index);
      const y = yScale(data.temp_c);
      const iconY = y - 25; // Position icons above the temperature points
      
      // Draw weather emoji
      ctx.font = hoveredPoint === index ? '20px system-ui' : '16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add a subtle glow effect for the icons
      if (hoveredPoint === index) {
        ctx.shadowColor = '#f5e960';
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      
      const emoji = getWeatherEmoji(data.condition.text);
      ctx.fillText(emoji, x, iconY);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    });

    // Draw points
    displayData.forEach((data, index) => {
      const x = xScale(index);
      const y = yScale(data.temp_c);
      
      ctx.beginPath();
      ctx.arc(x, y, hoveredPoint === index ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = hoveredPoint === index ? pointHoverColor : pointColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw time labels
    ctx.fillStyle = textColor;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';

    displayData.forEach((data, index) => {
      const x = xScale(index);
      const time = new Date(data.time);
      const timeStr = time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        hour12: true 
      });
      ctx.fillText(timeStr, x, height - margin.bottom + 20);
    });

  }, [displayData, hoveredPoint]);

  const handleMouseMove = (event) => {
    if (!displayData || displayData.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const margin = { top: 40, right: 20, bottom: 80, left: 20 };
    const chartWidth = canvas.width - margin.left - margin.right;

    // Find closest point
    let closestIndex = -1;
    let closestDistance = Infinity;

    displayData.forEach((_, index) => {
      const pointX = margin.left + (index / (displayData.length - 1)) * chartWidth;
      const distance = Math.abs(x - pointX);
      
      if (distance < closestDistance && distance < 30) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setHoveredPoint(closestIndex >= 0 ? closestIndex : null);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="hourly-line-chart">
      <canvas
        ref={canvasRef}
        width={800}
        height={280}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: 'auto',
          cursor: hoveredPoint !== null ? 'pointer' : 'default'
        }}
      />
      
      {/* Tooltip */}
      {hoveredPoint !== null && displayData[hoveredPoint] && (
        <div className="chart-tooltip">
          <div className="tooltip-content">
            <strong>{new Date(displayData[hoveredPoint].time).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              hour12: true 
            })}</strong>
            <div>{Math.round(displayData[hoveredPoint].temp_c)}°C</div>
            <div className="condition">{displayData[hoveredPoint].condition.text}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HourlyLineChart;