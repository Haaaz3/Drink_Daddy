import { useMemo } from 'react';

const ZONE_COLORS = {
  sober: { bg: 'bg-slate-600', text: 'text-slate-400', glow: '' },
  warming: { bg: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
  approaching: { bg: 'bg-green-500', text: 'text-green-400', glow: 'shadow-green-500/30' },
  sweetspot: { bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/50' },
  over: { bg: 'bg-orange-500', text: 'text-orange-400', glow: 'shadow-orange-500/30' },
  danger: { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/30' },
};

export function IntoxicationGauge({ intoxication, sweetSpot }) {
  const {
    budLightEquivalents,
    projectedPeak,
    bac,
    projectedBac,
    level,
    minutesUntilSober,
    inDangerZone,
  } = intoxication;

  // Format time until sober
  const soberTime = useMemo(() => {
    if (minutesUntilSober === 0) return null;
    const hours = Math.floor(minutesUntilSober / 60);
    const mins = minutesUntilSober % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  }, [minutesUntilSober]);

  const colors = inDangerZone ? ZONE_COLORS.danger : ZONE_COLORS[level.zone];
  const showProjected = projectedPeak > budLightEquivalents + 0.2;

  return (
    <div className={`bg-slate-800 rounded-2xl p-6 ${inDangerZone ? 'ring-2 ring-red-500' : ''}`}>
      {/* Main number display */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3">
          <div className={`text-5xl font-bold ${colors.text} transition-colors duration-300`}>
            {budLightEquivalents.toFixed(1)}
          </div>
          {showProjected && (
            <>
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className={`text-3xl font-bold ${projectedPeak >= 6 ? 'text-red-400' : 'text-slate-400'} opacity-70`}>
                {projectedPeak.toFixed(1)}
              </div>
            </>
          )}
        </div>
        <div className="text-slate-400 text-sm mt-1">
          {showProjected ? 'Current → Projected' : 'Bud Light Equivalents'}
        </div>
      </div>

      {/* Status label */}
      <div className="text-center mb-4">
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${colors.bg} text-white shadow-lg ${colors.glow}`}>
          {inDangerZone ? 'DANGER ZONE' : level.label}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-slate-200">
            {bac.toFixed(3)}%
          </div>
          <div className="text-xs text-slate-500">BAC Now</div>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3 text-center">
          <div className={`text-xl font-bold ${projectedBac >= 0.08 ? 'text-red-400' : 'text-slate-200'}`}>
            {projectedBac.toFixed(3)}%
          </div>
          <div className="text-xs text-slate-500">BAC Peak</div>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-slate-200">
            {soberTime || '--'}
          </div>
          <div className="text-xs text-slate-500">Until Sober</div>
        </div>
      </div>

      {/* Sweet spot proximity */}
      {budLightEquivalents > 0 && !inDangerZone && (
        <div className="mt-4 text-center text-sm">
          {budLightEquivalents < sweetSpot * 0.85 && (
            <span className="text-slate-400">
              {(sweetSpot - budLightEquivalents).toFixed(1)} more to sweet spot
            </span>
          )}
          {budLightEquivalents >= sweetSpot * 0.85 && budLightEquivalents <= sweetSpot * 1.15 && (
            <span className="text-amber-400 font-medium">You're in the zone!</span>
          )}
          {budLightEquivalents > sweetSpot * 1.15 && budLightEquivalents < 6 && (
            <span className="text-orange-400">
              {(budLightEquivalents - sweetSpot).toFixed(1)} past sweet spot
            </span>
          )}
        </div>
      )}
    </div>
  );
}
