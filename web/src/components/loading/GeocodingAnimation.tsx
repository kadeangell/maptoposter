export function GeocodingAnimation() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Pulsing rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full border-2 border-red-500 animate-ping"
            style={{ animationDuration: "1.5s" }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-full border border-red-300 animate-ping"
            style={{ animationDuration: "2s", animationDelay: "0.3s" }}
          />
        </div>
        {/* Pin */}
        <svg width="48" height="48" viewBox="0 0 48 48" className="relative z-10">
          <circle cx="24" cy="20" r="8" fill="#ff0000" stroke="#800000" strokeWidth="2" />
          <circle cx="24" cy="20" r="3" fill="#ffffff" />
          <path d="M24 28 L24 42" stroke="#800000" strokeWidth="2" />
        </svg>
      </div>
      <p className="text-sm font-bold retro-blink">Finding your city...</p>
    </div>
  )
}
