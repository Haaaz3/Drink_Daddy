export function SafetyWarning({ shouldNotDrive, inDangerZone, bac, projectedBac }) {
  if (!shouldNotDrive && !inDangerZone) return null;

  return (
    <div className={`rounded-xl p-4 ${inDangerZone ? 'bg-red-900/50 border border-red-500' : 'bg-orange-900/50 border border-orange-500'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${inDangerZone ? 'bg-red-500' : 'bg-orange-500'}`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          {inDangerZone && (
            <div className="mb-2">
              <div className="font-bold text-red-400">DANGER ZONE</div>
              <p className="text-sm text-red-300">
                You're at or approaching dangerous intoxication levels. Stop drinking and hydrate.
              </p>
            </div>
          )}
          {shouldNotDrive && (
            <div>
              <div className="font-bold text-orange-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                DO NOT DRIVE
              </div>
              <p className="text-sm text-orange-300 mt-1">
                {bac >= 0.08 ? (
                  <>Your BAC ({bac.toFixed(3)}%) is at or above the legal limit (0.08%).</>
                ) : projectedBac >= 0.08 ? (
                  <>Your BAC will reach {projectedBac.toFixed(3)}% when fully absorbed - above the legal limit.</>
                ) : (
                  <>Your BAC ({bac.toFixed(3)}%) may impair driving ability. Wait until completely sober.</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
