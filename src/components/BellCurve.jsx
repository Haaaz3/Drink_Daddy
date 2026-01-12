import { useMemo, useState, useEffect } from 'react';

// Category to emoji mapping
const CATEGORY_EMOJI = {
  beer: '🍺',
  wine: '🍷',
  spirits: '🥃',
  cocktails: '🍸',
  seltzers: '🥤',
};

// Get emoji for a drink based on its category (primary) or name (fallback)
function getDrinkEmoji(drink) {
  // Use category if available
  if (drink.category && CATEGORY_EMOJI[drink.category]) {
    return CATEGORY_EMOJI[drink.category];
  }

  // Fallback to name-based detection
  const name = drink.name?.toLowerCase() || '';
  if (name.includes('wine') || name.includes('champagne') || name.includes('prosecco') || name.includes('rosé')) return '🍷';
  if (name.includes('beer') || name.includes('lager') || name.includes('ale') || name.includes('ipa') || name.includes('stout') || name.includes('pilsner') || name.includes('bud') || name.includes('coors') || name.includes('miller') || name.includes('corona') || name.includes('heineken')) return '🍺';
  if (name.includes('shot') || name.includes('whiskey') || name.includes('bourbon') || name.includes('vodka') || name.includes('rum') || name.includes('tequila') || name.includes('gin') || name.includes('scotch') || name.includes('fireball') || name.includes('jager')) return '🥃';
  if (name.includes('margarita') || name.includes('martini') || name.includes('cocktail') || name.includes('mojito') || name.includes('daiquiri') || name.includes('negroni') || name.includes('spritz')) return '🍸';
  if (name.includes('seltzer') || name.includes('claw') || name.includes('truly') || name.includes('high noon') || name.includes('vizzy')) return '🥤';
  return '🍹';
}

export function BellCurve({ intoxication, sweetSpot, drinks = [], meals = [] }) {
  const { budLightEquivalents, projectedPeak } = intoxication;
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(sweetSpot * 2, 8);

  const zones = useMemo(() => {
    const sweetSpotPct = (sweetSpot / maxValue) * 100;
    const dangerPct = (6 / maxValue) * 100;
    return {
      sweetSpot: sweetSpotPct,
      danger: dangerPct,
    };
  }, [sweetSpot, maxValue]);

  const drinkBlocks = useMemo(() => {
    if (drinks.length === 0) return [];

    const now = currentTime;
    const blocks = [];
    let cumulativeWidth = 0;

    const sortedDrinks = [...drinks].sort((a, b) => a.timestamp - b.timestamp);

    const getMealFactor = (drinkTimestamp) => {
      const relevantMeals = meals.filter(meal => {
        const timeSinceMeal = drinkTimestamp - meal.timestamp;
        return timeSinceMeal >= 0 && timeSinceMeal <= 2 * 60 * 60 * 1000;
      });
      if (relevantMeals.length === 0) return 1.0;
      return Math.min(...relevantMeals.map(m => m.factor));
    };

    sortedDrinks.forEach((drink) => {
      const minutesSinceDrink = (now - drink.timestamp) / 60000;
      const absorptionTime = 30;
      const absorptionProgress = Math.min(1, minutesSinceDrink / absorptionTime);

      const baseBL = drink.gramsAlcohol / 11.77;
      const mealFactor = getMealFactor(drink.timestamp);
      const effectiveBL = baseBL * mealFactor;

      const fullWidth = (effectiveBL / maxValue) * 100;
      const currentWidth = fullWidth * absorptionProgress;

      blocks.push({
        id: drink.id,
        name: drink.name,
        emoji: getDrinkEmoji(drink),
        fullWidth,
        currentWidth,
        startX: cumulativeWidth,
        absorptionProgress,
        effectiveBL,
      });

      cumulativeWidth += fullWidth;
    });

    return blocks;
  }, [drinks, meals, maxValue, currentTime]);

  const timeToPeak = useMemo(() => {
    if (drinks.length === 0) return null;
    const latestDrink = Math.max(...drinks.map(d => d.timestamp));
    const peakTime = latestDrink + 30 * 60 * 1000;
    const remaining = Math.max(0, peakTime - currentTime);
    if (remaining === 0) return null;
    return Math.ceil(remaining / 60000);
  }, [drinks, currentTime]);

  // Generate bell curve path
  const curvePath = useMemo(() => {
    const width = 100;
    const height = 60;
    const peakX = zones.sweetSpot;

    let path = `M 0 ${height}`;
    for (let x = 0; x <= width; x += 0.5) {
      const distFromPeak = x - peakX;
      const sigma = distFromPeak < 0 ? peakX * 0.45 : (width - peakX) * 0.35;
      const normalizedDist = distFromPeak / sigma;
      const y = height - (height * 0.95 * Math.exp(-0.5 * normalizedDist * normalizedDist));
      path += ` L ${x} ${y}`;
    }
    path += ` L ${width} ${height} Z`;
    return path;
  }, [zones.sweetSpot]);

  const showProjection = projectedPeak > budLightEquivalents + 0.2;
  const isAbsorbing = drinkBlocks.some(b => b.absorptionProgress < 1);

  return (
    <div className="bg-[#0d0d0d] -mx-4">
      {/* Header - Oura style */}
      <div className="px-5 pt-5 pb-4">
        <div className="text-[#8b8b8b] text-xs uppercase tracking-widest mb-2">
          {isAbsorbing ? 'Feels Like' : 'Current Level'}
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-light text-white">{budLightEquivalents.toFixed(1)}</span>
          <span className="text-[#6b6b6b] text-lg">Bud Lights</span>
        </div>

        {/* Projected peak - only show if still absorbing */}
        {showProjection && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[#6b6b6b] text-sm">Once absorbed</span>
            <span className="text-[#a0a0a0] text-lg font-medium">{projectedPeak.toFixed(1)}</span>
            {timeToPeak && (
              <span className="text-[#6b6b6b] text-sm">in {timeToPeak}m</span>
            )}
          </div>
        )}
      </div>

      {/* Full-width Bell Curve */}
      <div className="relative">
        <svg
          viewBox="0 0 100 60"
          className="w-full h-44"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id="bellClip">
              <path d={curvePath} />
            </clipPath>
            {/* Subtle gradient for sweet spot indicator */}
            <linearGradient id="sweetSpotGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd60a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffd60a" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background curve shape */}
          <path d={curvePath} fill="#1a1a1a" />

          {/* Drink blocks - clipped to curve, muted grey */}
          <g clipPath="url(#bellClip)">
            {drinkBlocks.map((block, index) => (
              <g key={block.id}>
                {/* Pending absorption (darker grey) */}
                {block.absorptionProgress < 1 && (
                  <rect
                    x={block.startX + block.currentWidth}
                    y="0"
                    width={block.fullWidth - block.currentWidth}
                    height="60"
                    fill="#2a2a2a"
                  />
                )}
                {/* Absorbed portion (muted grey) */}
                <rect
                  x={block.startX}
                  y="0"
                  width={Math.max(0.1, block.currentWidth)}
                  height="60"
                  fill="#4a4a4a"
                />
                {/* Subtle divider between drinks */}
                {index > 0 && (
                  <line
                    x1={block.startX}
                    y1="0"
                    x2={block.startX}
                    y2="60"
                    stroke="#0d0d0d"
                    strokeWidth="0.3"
                  />
                )}
              </g>
            ))}
          </g>

          {/* Emoji inside each drink block */}
          <g clipPath="url(#bellClip)">
            {drinkBlocks.map((block) => {
              const centerX = block.startX + block.fullWidth / 2;
              return (
                <text
                  key={`emoji-${block.id}`}
                  x={centerX}
                  y="38"
                  textAnchor="middle"
                  fontSize="7"
                  opacity={block.absorptionProgress < 1 ? 0.4 : 0.9}
                >
                  {block.emoji}
                </text>
              );
            })}
          </g>

          {/* Sweet spot marker - subtle glow instead of dashed line */}
          <rect
            x={zones.sweetSpot - 0.5}
            y="0"
            width="1"
            height="60"
            fill="url(#sweetSpotGlow)"
            clipPath="url(#bellClip)"
          />

          {/* Danger zone - subtle red fade on right edge */}
          {zones.danger < 100 && (
            <rect
              x={zones.danger}
              y="0"
              width={100 - zones.danger}
              height="60"
              fill="rgba(255, 69, 58, 0.1)"
              clipPath="url(#bellClip)"
            />
          )}

          {/* Curve outline - very subtle */}
          <path d={curvePath} fill="none" stroke="#2a2a2a" strokeWidth="1" />
        </svg>

        {/* Zone indicator below curve */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
          <div
            className="bg-[#3a3a3a]"
            style={{ width: `${zones.sweetSpot * 0.7}%` }}
          />
          <div
            className="bg-[#4a5a4a]"
            style={{ width: `${zones.sweetSpot * 0.3}%` }}
          />
          <div
            className="bg-[#5a5a3a]"
            style={{ width: `${(zones.danger - zones.sweetSpot) * 0.5}%` }}
          />
          <div
            className="bg-[#5a4a4a]"
            style={{ width: `${(zones.danger - zones.sweetSpot) * 0.5}%` }}
          />
          <div
            className="bg-[#4a3a3a]"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Minimal zone labels */}
      <div className="flex justify-between text-[10px] px-4 py-3">
        <span className="text-[#4a4a4a]">Sober</span>
        <span className="text-[#5a6a5a]">Sweet Spot</span>
        <span className="text-[#6a5a5a]">Limit</span>
      </div>
    </div>
  );
}
