import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

const CATEGORY_EMOJI = {
  beer: '🍺',
  wine: '🍷',
  spirits: '🥃',
  cocktails: '🍸',
  seltzers: '🥤',
};

function getDrinkEmoji(drink) {
  if (drink.category && CATEGORY_EMOJI[drink.category]) {
    return CATEGORY_EMOJI[drink.category];
  }
  const name = drink.name?.toLowerCase() || '';
  if (name.includes('beer') || name.includes('lager') || name.includes('bud') || name.includes('coors')) return '🍺';
  if (name.includes('wine') || name.includes('champagne')) return '🍷';
  if (name.includes('shot') || name.includes('whiskey') || name.includes('vodka') || name.includes('tequila')) return '🥃';
  if (name.includes('seltzer') || name.includes('claw') || name.includes('truly')) return '🥤';
  return '🍸';
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function IntoxicationChart({ intoxication, sweetSpot, drinks = [], meals = [] }) {
  const { budLightEquivalents, projectedPeak, minutesUntilSober } = intoxication;
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewMode, setViewMode] = useState('now'); // 'now' = 2 hours centered, 'full' = 6 hours

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Observe container width for responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setContainerWidth(container.offsetWidth);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Dynamic chart dimensions based on container
  const chartWidth = Math.max(300, containerWidth - 16); // 16px for padding
  const chartHeight = Math.max(200, Math.min(280, containerWidth * 0.6));
  const marginTop = 24;
  const marginBottom = 50;
  const marginLeft = 40;
  const marginRight = 16;
  const plotWidth = chartWidth - marginLeft - marginRight;
  const plotHeight = chartHeight - marginTop - marginBottom;

  // Y-axis scale
  const yMax = Math.max(8, sweetSpot * 2, projectedPeak * 1.3);
  const yScale = useCallback((value) => marginTop + plotHeight * (1 - value / yMax), [marginTop, plotHeight, yMax]);

  // Time windows based on view mode
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  const windowMs = viewMode === 'now' ? TWO_HOURS_MS : SIX_HOURS_MS;

  // Calculate curve data with proper trend modeling
  const chartData = useMemo(() => {
    const now = currentTime;

    let timeStart, timeEnd;

    if (drinks.length === 0) {
      // No drinks - show window from now
      timeStart = now - (windowMs / 4); // Start a bit before now
      timeEnd = timeStart + windowMs;
    } else {
      const sessionStart = Math.min(...drinks.map(d => d.timestamp));

      if (viewMode === 'now') {
        // "Right now" view - center on current time, show 2 hours
        timeStart = now - (windowMs / 2); // 1 hour before now
        timeEnd = now + (windowMs / 2);   // 1 hour after now

        // But don't start before session
        if (timeStart < sessionStart) {
          timeStart = sessionStart;
          timeEnd = sessionStart + windowMs;
        }
      } else {
        // "Full" view - show 6 hours from session start
        timeStart = sessionStart;
        timeEnd = sessionStart + windowMs;

        // If we're past the window, shift it
        if (now > timeEnd - 30 * 60 * 1000) {
          timeEnd = now + 30 * 60 * 1000;
          timeStart = timeEnd - windowMs;
        }
      }
    }

    const xScale = (time) => marginLeft + ((time - timeStart) / (timeEnd - timeStart)) * plotWidth;

    if (drinks.length === 0) {
      return {
        points: [],
        drinkEvents: [],
        mealEvents: [],
        timeRange: { start: timeStart, end: timeEnd },
        nowX: xScale(now),
        xScale,
      };
    }

    // Get meal factor for a given drink timestamp
    const getMealFactor = (drinkTimestamp) => {
      const relevantMeals = meals.filter(meal => {
        const timeSinceMeal = drinkTimestamp - meal.timestamp;
        return timeSinceMeal >= 0 && timeSinceMeal <= 2 * 60 * 60 * 1000;
      });
      if (relevantMeals.length === 0) return 1.0;
      return Math.min(...relevantMeals.map(m => m.factor));
    };

    // Generate curve points every 1 minute for smooth curve
    const points = [];
    const stepMs = 1 * 60 * 1000;

    // Metabolism rate: ~0.015 BAC per hour, roughly 0.6-0.8 BL per hour
    const metabolismPerHour = 0.7;

    for (let time = timeStart; time <= timeEnd; time += stepMs) {
      let totalBL = 0;

      drinks.forEach(drink => {
        if (time < drink.timestamp) return;

        const minutesSinceDrink = (time - drink.timestamp) / 60000;
        const hoursSinceDrink = minutesSinceDrink / 60;
        const drinkBL = drink.gramsAlcohol / 11.77;
        const mealFactor = getMealFactor(drink.timestamp);

        // Absorption: sigmoid curve peaking at 30-45 min
        const absorptionTime = mealFactor < 0.8 ? 45 : 30;
        let absorbed;
        if (minutesSinceDrink >= absorptionTime * 1.5) {
          absorbed = 1.0;
        } else if (minutesSinceDrink <= 0) {
          absorbed = 0;
        } else {
          // Smoother sigmoid-like absorption
          const t = minutesSinceDrink / absorptionTime;
          absorbed = t < 1 ? (3 * t * t - 2 * t * t * t) : 1; // Smoothstep
        }

        // Peak BAC contribution from this drink
        const peakBL = drinkBL * mealFactor;

        // Current absorbed amount
        const absorbedBL = peakBL * absorbed;

        // Metabolism starts immediately but only affects absorbed alcohol
        const metabolized = Math.min(absorbedBL, metabolismPerHour * hoursSinceDrink);

        const effective = Math.max(0, absorbedBL - metabolized);
        totalBL += effective;
      });

      points.push({
        time,
        x: xScale(time),
        y: yScale(totalBL),
        value: totalBL,
        isFuture: time > now,
        isNow: Math.abs(time - now) < stepMs,
      });
    }

    // Find the "now" point more precisely
    const nowPointIndex = points.findIndex(p => p.isNow || (p.time <= now && points[points.indexOf(p) + 1]?.time > now));

    // Drink events for markers
    const drinkEvents = drinks.map(drink => ({
      ...drink,
      x: xScale(drink.timestamp),
      emoji: getDrinkEmoji(drink),
      bl: drink.gramsAlcohol / 11.77,
    })).filter(d => d.x >= marginLeft && d.x <= marginLeft + plotWidth);

    // Meal events
    const mealEvents = meals.map(meal => ({
      ...meal,
      x: xScale(meal.timestamp),
    })).filter(m => m.x >= marginLeft && m.x <= marginLeft + plotWidth);

    return {
      points,
      drinkEvents,
      mealEvents,
      timeRange: { start: timeStart, end: timeEnd },
      nowX: xScale(now),
      nowPointIndex,
      xScale,
    };
  }, [drinks, meals, currentTime, plotWidth, marginLeft, yScale, windowMs, viewMode]);

  // Generate SVG paths
  const { pastPath, futurePath, areaPath, nowPoint } = useMemo(() => {
    if (chartData.points.length === 0) {
      return { pastPath: '', futurePath: '', areaPath: '', nowPoint: null };
    }

    const { points, nowPointIndex } = chartData;
    let past = '';
    let future = '';
    let area = '';

    const actualNowIndex = nowPointIndex >= 0 ? nowPointIndex : points.findIndex(p => p.isFuture) - 1;
    const nowPt = points[actualNowIndex] || points[0];

    points.forEach((point, i) => {
      const cmd = i === 0 ? 'M' : 'L';

      if (i <= actualNowIndex) {
        past += `${cmd} ${point.x.toFixed(1)} ${point.y.toFixed(1)} `;
      }

      if (i >= actualNowIndex) {
        const futureCmd = i === actualNowIndex ? 'M' : 'L';
        future += `${futureCmd} ${point.x.toFixed(1)} ${point.y.toFixed(1)} `;
      }

      area += `${cmd} ${point.x.toFixed(1)} ${point.y.toFixed(1)} `;
    });

    // Close area path
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      const firstPoint = points[0];
      const baseY = yScale(0);
      area += `L ${lastPoint.x.toFixed(1)} ${baseY.toFixed(1)} L ${firstPoint.x.toFixed(1)} ${baseY.toFixed(1)} Z`;
    }

    return {
      pastPath: past.trim(),
      futurePath: future.trim(),
      areaPath: area.trim(),
      nowPoint: nowPt,
    };
  }, [chartData, yScale]);

  // Time axis labels - adjust interval based on view mode
  const timeLabels = useMemo(() => {
    if (!chartData.timeRange) return [];

    const { start, end } = chartData.timeRange;
    const labels = [];

    // 30 min intervals for "now" view, 1 hour for "full" view
    const intervalMs = viewMode === 'now' ? 30 * 60 * 1000 : 60 * 60 * 1000;

    // Round start to nearest interval
    const firstInterval = Math.ceil(start / intervalMs) * intervalMs;

    for (let time = firstInterval; time <= end; time += intervalMs) {
      if (time >= start) {
        labels.push({
          time,
          x: chartData.xScale(time),
          label: formatTime(time),
        });
      }
    }

    return labels;
  }, [chartData, viewMode]);

  // Y-axis labels
  const yLabels = useMemo(() => {
    const labels = [];
    const step = yMax <= 6 ? 1 : 2;
    for (let i = 0; i <= yMax; i += step) {
      labels.push({ value: i, y: yScale(i) });
    }
    return labels;
  }, [yMax, yScale]);

  const isAbsorbing = drinks.some(d => (currentTime - d.timestamp) < 30 * 60 * 1000);
  const drinkCount = drinks.length;
  const totalBL = drinks.reduce((sum, d) => sum + d.gramsAlcohol / 11.77, 0);

  // Check if in sweet spot
  const inSweetSpot = budLightEquivalents >= sweetSpot * 0.85 && budLightEquivalents <= sweetSpot * 1.15 && budLightEquivalents > 0;

  // Calculate peak time and sober time
  const { peakTime, soberTime } = useMemo(() => {
    if (drinks.length === 0) return { peakTime: null, soberTime: null };

    // Find peak from the curve data
    let peakValue = 0;
    let peakTimeMs = currentTime;

    chartData.points.forEach(point => {
      if (point.value > peakValue) {
        peakValue = point.value;
        peakTimeMs = point.time;
      }
    });

    // Find when we hit ~0 (sober)
    let soberTimeMs = null;
    for (let i = chartData.points.length - 1; i >= 0; i--) {
      if (chartData.points[i].value > 0.1) {
        soberTimeMs = chartData.points[i].time;
        break;
      }
    }

    return {
      peakTime: peakTimeMs > currentTime ? peakTimeMs : null,
      soberTime: soberTimeMs && soberTimeMs > currentTime ? soberTimeMs : null,
    };
  }, [chartData.points, drinks.length, currentTime]);

  // Format time for display
  const formatTimeShort = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div ref={containerRef} className="bg-[#111111] rounded-2xl overflow-hidden w-full">
      {/* Header Stats */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4">
        {/* Main "Feels Like" display */}
        <div className="mb-4">
          <div className="text-[#888] text-sm sm:text-base">
            Feels like{' '}
            <span className="text-white text-3xl sm:text-4xl font-light">
              {budLightEquivalents.toFixed(1)}
            </span>
            {' '}Bud Lights
          </div>
          {isAbsorbing && projectedPeak > budLightEquivalents + 0.2 && (
            <div className="text-[#666] text-xs sm:text-sm mt-1">
              Trending to {projectedPeak.toFixed(1)} as drinks absorb
            </div>
          )}
        </div>

        {/* Time indicators */}
        <div className="flex gap-4 sm:gap-6 mb-3">
          {peakTime && (
            <div className="flex-1 bg-[#1a1a1a] rounded-lg px-3 py-2">
              <div className="text-[#666] text-[10px] sm:text-[11px] uppercase tracking-wider">Peak at</div>
              <div className="text-white text-base sm:text-lg font-light mt-0.5">
                {formatTimeShort(peakTime)}
              </div>
            </div>
          )}
          {soberTime && (
            <div className="flex-1 bg-[#1a1a1a] rounded-lg px-3 py-2">
              <div className="text-[#666] text-[10px] sm:text-[11px] uppercase tracking-wider">Sober by</div>
              <div className="text-white text-base sm:text-lg font-light mt-0.5">
                {formatTimeShort(soberTime)}
              </div>
            </div>
          )}
          <div className="bg-[#1a1a1a] rounded-lg px-3 py-2">
            <div className="text-[#666] text-[10px] sm:text-[11px] uppercase tracking-wider">Drinks</div>
            <div className="text-white text-base sm:text-lg font-light mt-0.5">
              {drinkCount}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (budLightEquivalents / yMax) * 100)}%`,
                background: budLightEquivalents >= 6
                  ? '#ef4444'
                  : budLightEquivalents >= sweetSpot * 0.85 && budLightEquivalents <= sweetSpot * 1.15
                    ? '#22c55e'
                    : '#666',
              }}
            />
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#555] font-medium min-w-[55px] sm:min-w-[60px] text-right">
            {budLightEquivalents >= sweetSpot * 0.85 && budLightEquivalents <= sweetSpot * 1.15
              ? 'Sweet Spot'
              : budLightEquivalents < sweetSpot * 0.85
                ? `${(sweetSpot - budLightEquivalents).toFixed(1)} to go`
                : budLightEquivalents >= 6
                  ? 'Danger'
                  : 'Over target'}
          </span>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="px-4 sm:px-5 pb-3">
        <div className="inline-flex bg-[#1a1a1a] rounded-lg p-1">
          <button
            onClick={() => setViewMode('now')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              viewMode === 'now'
                ? 'bg-[#333] text-white'
                : 'text-[#666] hover:text-[#888]'
            }`}
          >
            Right Now
          </button>
          <button
            onClick={() => setViewMode('full')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              viewMode === 'full'
                ? 'bg-[#333] text-white'
                : 'text-[#666] hover:text-[#888]'
            }`}
          >
            Full Session
          </button>
        </div>
      </div>

      {/* Chart - Full Width */}
      <div className="w-full px-1 sm:px-2 pb-2 relative">
        {/* Jon Hamm party gif when in sweet spot */}
        {inSweetSpot && (
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <img
              src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGt5eHBmemtsOGZ5ZWkyODNlcmtreDNoMGVteXVubXpsMWowcDV5OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/m7URgFktt1JjDPjGKy/giphy.gif"
              alt="Jon Hamm Clubbing"
              className="w-full h-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#11111180] to-[#111111]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg animate-pulse">
                  You're in the Sweet Spot!
                </div>
              </div>
            </div>
          </div>
        )}
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible relative z-10"
        >
          <defs>
            <linearGradient id="chartAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="futureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#666666" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#666666" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yLabels.map(({ value, y }) => (
            <g key={value}>
              <line
                x1={marginLeft}
                y1={y}
                x2={chartWidth - marginRight}
                y2={y}
                stroke="#1f1f1f"
                strokeWidth="1"
              />
              <text
                x={marginLeft - 8}
                y={y + 4}
                textAnchor="end"
                fill="#444"
                fontSize="11"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {value}
              </text>
            </g>
          ))}

          {/* Sweet spot zone */}
          <rect
            x={marginLeft}
            y={yScale(sweetSpot * 1.15)}
            width={plotWidth}
            height={Math.max(0, yScale(sweetSpot * 0.85) - yScale(sweetSpot * 1.15))}
            fill="#22c55e"
            opacity="0.12"
          />
          <line
            x1={marginLeft}
            y1={yScale(sweetSpot)}
            x2={chartWidth - marginRight}
            y2={yScale(sweetSpot)}
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeDasharray="6,4"
            opacity="0.6"
          />
          <text
            x={chartWidth - marginRight - 6}
            y={yScale(sweetSpot) - 8}
            textAnchor="end"
            fill="#22c55e"
            fontSize="10"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="500"
          >
            Sweet Spot ({sweetSpot})
          </text>

          {/* Danger zone */}
          {yScale(6) > marginTop && (
            <>
              <rect
                x={marginLeft}
                y={marginTop}
                width={plotWidth}
                height={Math.max(0, yScale(6) - marginTop)}
                fill="#ef4444"
                opacity="0.08"
              />
              <line
                x1={marginLeft}
                y1={yScale(6)}
                x2={chartWidth - marginRight}
                y2={yScale(6)}
                stroke="#ef4444"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x={marginLeft + 6}
                y={yScale(6) - 6}
                fill="#ef4444"
                fontSize="9"
                fontFamily="system-ui, -apple-system, sans-serif"
                opacity="0.7"
              >
                Danger Zone
              </text>
            </>
          )}

          {/* Area fill under curve */}
          {areaPath && <path d={areaPath} fill="url(#chartAreaGradient)" />}

          {/* Past curve line (solid) */}
          {pastPath && (
            <path
              d={pastPath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Future curve line (dashed) */}
          {futurePath && (
            <path
              d={futurePath}
              fill="none"
              stroke="#555"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8,6"
            />
          )}

          {/* "Now" vertical indicator */}
          {chartData.nowX >= marginLeft && chartData.nowX <= marginLeft + plotWidth && (
            <line
              x1={chartData.nowX}
              y1={marginTop}
              x2={chartData.nowX}
              y2={chartHeight - marginBottom}
              stroke="#ffffff"
              strokeWidth="1"
              opacity="0.15"
            />
          )}

          {/* Current position dot */}
          {nowPoint && (
            <g>
              <circle
                cx={nowPoint.x}
                cy={nowPoint.y}
                r="8"
                fill="#111111"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <circle
                cx={nowPoint.x}
                cy={nowPoint.y}
                r="4"
                fill="#ffffff"
              />
            </g>
          )}

          {/* Drink markers */}
          {chartData.drinkEvents.map((drink, i) => (
            <g key={drink.id || i}>
              <line
                x1={drink.x}
                y1={chartHeight - marginBottom}
                x2={drink.x}
                y2={chartHeight - marginBottom - 12}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={drink.x}
                y={chartHeight - marginBottom + 20}
                textAnchor="middle"
                fontSize="16"
              >
                {drink.emoji}
              </text>
            </g>
          ))}

          {/* Meal markers */}
          {chartData.mealEvents?.map((meal, i) => (
            <text
              key={meal.id || i}
              x={meal.x}
              y={chartHeight - marginBottom + 36}
              textAnchor="middle"
              fontSize="14"
            >
              🍽️
            </text>
          ))}

          {/* Time axis labels */}
          {timeLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={chartHeight - 10}
              textAnchor="middle"
              fill="#555"
              fontSize="10"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {label.label}
            </text>
          ))}

          {/* Y-axis label */}
          <text
            x={14}
            y={marginTop + plotHeight / 2}
            textAnchor="middle"
            fill="#444"
            fontSize="10"
            fontFamily="system-ui, -apple-system, sans-serif"
            transform={`rotate(-90, 14, ${marginTop + plotHeight / 2})`}
          >
            Bud Lights
          </text>
        </svg>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-5 pb-3 sm:pb-4 pt-2 border-t border-[#1a1a1a]">
        <div className="flex justify-between text-[10px] sm:text-[11px]">
          <div className="text-[#555]">
            Total: <span className="text-[#888]">{totalBL.toFixed(1)} BL</span>
          </div>
          {minutesUntilSober > 0 && (
            <div className="text-[#555]">
              Sober in <span className="text-[#888]">{Math.floor(minutesUntilSober / 60)}h {minutesUntilSober % 60}m</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
