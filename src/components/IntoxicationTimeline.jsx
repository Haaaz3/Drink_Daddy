import { useMemo, useState, useEffect } from 'react';

// Category to emoji mapping
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

export function IntoxicationTimeline({ intoxication, sweetSpot, drinks = [] }) {
  const { budLightEquivalents, projectedPeak, minutesUntilSober } = intoxication;
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate the intoxication curve data points
  const curveData = useMemo(() => {
    if (drinks.length === 0) return { points: [], nowIndex: 0, peakIndex: 0, drinkMarkers: [] };

    const sessionStart = Math.min(...drinks.map(d => d.timestamp));
    const now = currentTime;

    // Project forward: time until sober + 30 min buffer
    const projectedEnd = now + (minutesUntilSober + 30) * 60 * 1000;

    // Generate points every 5 minutes
    const points = [];
    const stepMs = 5 * 60 * 1000; // 5 minutes

    // Metabolism rate (BL equivalents per hour, roughly)
    const metabolismPerHour = 0.75; // ~0.75 BL per hour

    for (let time = sessionStart; time <= projectedEnd; time += stepMs) {
      let totalBL = 0;

      drinks.forEach(drink => {
        if (time < drink.timestamp) return; // Drink not consumed yet

        const minutesSinceDrink = (time - drink.timestamp) / 60000;
        const drinkBL = drink.gramsAlcohol / 11.77;

        // Absorption curve (sigmoid-ish, peaks at 30 min)
        const absorptionTime = 30;
        const absorbed = minutesSinceDrink >= absorptionTime
          ? 1.0
          : Math.pow(minutesSinceDrink / absorptionTime, 0.8);

        // Metabolism (linear decay after absorption starts)
        const hoursSinceDrink = minutesSinceDrink / 60;
        const metabolized = Math.min(drinkBL, metabolismPerHour * hoursSinceDrink);

        const effective = Math.max(0, (drinkBL * absorbed) - metabolized);
        totalBL += effective;
      });

      points.push({
        time,
        value: totalBL,
        isFuture: time > now,
      });
    }

    // Find current position and peak
    let nowIndex = 0;
    let peakIndex = 0;
    let peakValue = 0;

    points.forEach((p, i) => {
      if (p.time <= now) nowIndex = i;
      if (p.value > peakValue) {
        peakValue = p.value;
        peakIndex = i;
      }
    });

    // Drink markers (positioned on the curve)
    const drinkMarkers = drinks.map(drink => {
      const pointIndex = points.findIndex(p => p.time >= drink.timestamp);
      return {
        ...drink,
        emoji: getDrinkEmoji(drink),
        pointIndex: Math.max(0, pointIndex),
      };
    });

    return { points, nowIndex, peakIndex, drinkMarkers, sessionStart, projectedEnd };
  }, [drinks, currentTime, minutesUntilSober]);

  // SVG dimensions (constants to avoid re-renders)
  const width = 100;
  const height = 50;
  const paddingTop = 8;
  const paddingBottom = 12;
  const paddingLeft = 2;
  const paddingRight = 2;
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  // Scale values
  const maxValue = Math.max(sweetSpot * 1.5, 6, projectedPeak * 1.2, 4);
  const sweetSpotY = paddingTop + graphHeight * (1 - sweetSpot / maxValue);
  const dangerY = paddingTop + graphHeight * (1 - 6 / maxValue);

  // Generate SVG path
  const { nowX, nowY } = useMemo(() => {
    if (curveData.points.length === 0) {
      return { nowX: paddingLeft, nowY: height - paddingBottom };
    }

    const { points, nowIndex } = curveData;
    const nX = paddingLeft + (nowIndex / (points.length - 1)) * graphWidth;
    const nY = paddingTop + graphHeight * (1 - points[nowIndex].value / maxValue);

    return { nowX: nX, nowY: nY };
  }, [curveData, graphWidth, graphHeight, maxValue, paddingLeft, paddingTop, paddingBottom, height]);

  // Split path into past and future
  const { pastPath, futurePath } = useMemo(() => {
    if (curveData.points.length === 0) return { pastPath: '', futurePath: '' };

    const { points, nowIndex } = curveData;
    let past = '';
    let future = '';

    points.forEach((point, i) => {
      const x = paddingLeft + (i / (points.length - 1)) * graphWidth;
      const y = paddingTop + graphHeight * (1 - point.value / maxValue);

      if (i <= nowIndex) {
        past += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
      }
      if (i >= nowIndex) {
        future += (i === nowIndex ? `M ${x} ${y}` : ` L ${x} ${y}`);
      }
    });

    return { pastPath: past, futurePath: future };
  }, [curveData, graphWidth, graphHeight, maxValue, paddingLeft, paddingTop]);

  // Time labels
  const timeLabels = useMemo(() => {
    if (curveData.points.length === 0) return [];

    const { sessionStart, projectedEnd } = curveData;
    const now = currentTime;
    const labels = [];

    // Start time
    labels.push({ x: paddingLeft, label: formatTime(sessionStart) });

    // Now
    const nowPct = (now - sessionStart) / (projectedEnd - sessionStart);
    labels.push({ x: paddingLeft + nowPct * graphWidth, label: 'Now', isNow: true });

    // End (sober)
    if (minutesUntilSober > 0) {
      labels.push({ x: width - paddingRight, label: formatTime(projectedEnd) });
    }

    return labels;
  }, [curveData, currentTime, minutesUntilSober, graphWidth, paddingLeft, paddingRight, width]);

  const isAbsorbing = drinks.some(d => (currentTime - d.timestamp) < 30 * 60 * 1000);
  const showProjection = projectedPeak > budLightEquivalents + 0.2;

  return (
    <div className="bg-[#0d0d0d] -mx-4">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[#6b6b6b] text-xs uppercase tracking-widest mb-1">
              {isAbsorbing ? 'Feels Like' : 'Current Level'}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light text-white">{budLightEquivalents.toFixed(1)}</span>
              <span className="text-[#4b4b4b] text-base">Bud Lights</span>
            </div>
          </div>

          {showProjection && (
            <div className="text-right">
              <div className="text-[#6b6b6b] text-xs uppercase tracking-widest mb-1">Peak</div>
              <div className="text-2xl font-light text-[#8b8b8b]">{projectedPeak.toFixed(1)}</div>
            </div>
          )}
        </div>

        {minutesUntilSober > 0 && (
          <div className="mt-2 text-[#4b4b4b] text-sm">
            Sober in {Math.floor(minutesUntilSober / 60)}h {minutesUntilSober % 60}m
          </div>
        )}
      </div>

      {/* Timeline Chart */}
      <div className="px-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36" preserveAspectRatio="none">
          <defs>
            {/* Gradient for the filled area */}
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="futureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Sweet spot zone */}
          <rect
            x={paddingLeft}
            y={sweetSpotY - 2}
            width={graphWidth}
            height={4}
            fill="#3a5a3a"
            opacity="0.5"
          />

          {/* Danger zone (above 6 BL) */}
          {dangerY > paddingTop && (
            <rect
              x={paddingLeft}
              y={paddingTop}
              width={graphWidth}
              height={dangerY - paddingTop}
              fill="#5a3a3a"
              opacity="0.3"
            />
          )}

          {/* Filled area under past curve */}
          {pastPath && (
            <path
              d={`${pastPath} L ${nowX} ${height - paddingBottom} L ${paddingLeft} ${height - paddingBottom} Z`}
              fill="url(#areaGradient)"
            />
          )}

          {/* Filled area under future curve */}
          {futurePath && (
            <path
              d={`${futurePath} L ${width - paddingRight} ${height - paddingBottom} L ${nowX} ${height - paddingBottom} Z`}
              fill="url(#futureGradient)"
            />
          )}

          {/* Past curve line */}
          <path
            d={pastPath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Future curve line (dashed) */}
          <path
            d={futurePath}
            fill="none"
            stroke="#555555"
            strokeWidth="0.6"
            strokeDasharray="1.5,1"
            strokeLinecap="round"
          />

          {/* Current position marker */}
          <circle cx={nowX} cy={nowY} r="2" fill="#ffffff" />
          <circle cx={nowX} cy={nowY} r="4" fill="none" stroke="#ffffff" strokeWidth="0.3" opacity="0.5" />

          {/* Drink markers */}
          {curveData.drinkMarkers?.map((drink, i) => {
            if (curveData.points.length === 0) return null;
            const x = paddingLeft + (drink.pointIndex / (curveData.points.length - 1)) * graphWidth;
            const point = curveData.points[drink.pointIndex];
            const y = point ? paddingTop + graphHeight * (1 - point.value / maxValue) : nowY;

            return (
              <text
                key={drink.id || i}
                x={x}
                y={y - 3}
                textAnchor="middle"
                fontSize="4"
                opacity="0.8"
              >
                {drink.emoji}
              </text>
            );
          })}

          {/* Sweet spot label */}
          <text
            x={width - paddingRight - 1}
            y={sweetSpotY + 1}
            textAnchor="end"
            fontSize="2.5"
            fill="#5a8a5a"
          >
            Sweet Spot
          </text>
        </svg>

        {/* Time axis */}
        <div className="flex justify-between px-3 -mt-1 pb-4">
          {timeLabels.map((label, i) => (
            <span
              key={i}
              className={`text-[10px] ${label.isNow ? 'text-white font-medium' : 'text-[#4a4a4a]'}`}
              style={label.isNow ? { position: 'absolute', left: `${(label.x / width) * 100}%`, transform: 'translateX(-50%)' } : {}}
            >
              {!label.isNow && label.label}
            </span>
          ))}
        </div>
      </div>

      {/* Current state indicator */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-3">
          <div className={`h-2 flex-1 rounded-full overflow-hidden bg-[#1a1a1a]`}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (budLightEquivalents / maxValue) * 100)}%`,
                background: budLightEquivalents >= 6
                  ? '#ff453a'
                  : budLightEquivalents >= sweetSpot * 0.85 && budLightEquivalents <= sweetSpot * 1.15
                    ? '#4a9a4a'
                    : '#4a4a4a'
              }}
            />
          </div>
          <span className="text-[10px] text-[#4a4a4a] w-12 text-right">
            {budLightEquivalents >= sweetSpot * 0.85 && budLightEquivalents <= sweetSpot * 1.15
              ? 'In Zone'
              : budLightEquivalents < sweetSpot
                ? `${(sweetSpot - budLightEquivalents).toFixed(1)} to go`
                : 'Over'}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
