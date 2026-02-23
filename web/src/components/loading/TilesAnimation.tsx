export function TilesAnimation() {
  const anim = (delay: string) => ({
    animation: `draw-loop 1.8s ease-in-out ${delay} infinite alternate`,
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="120" height="80" viewBox="0 0 120 80" className="text-current">
        {/* Road */}
        <line
          x1="0" y1="65" x2="120" y2="65"
          stroke="currentColor" strokeWidth="3"
          strokeDasharray="120"
          strokeDashoffset="120"
          style={anim("0s")}
        />
        {/* Buildings drawn stroke-by-stroke */}
        <rect
          x="10" y="30" width="15" height="35"
          fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="100"
          strokeDashoffset="100"
          style={anim("0.15s")}
        />
        <rect
          x="30" y="15" width="12" height="50"
          fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="124"
          strokeDashoffset="124"
          style={anim("0.3s")}
        />
        <rect
          x="47" y="25" width="18" height="40"
          fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="116"
          strokeDashoffset="116"
          style={anim("0.45s")}
        />
        <rect
          x="70" y="10" width="10" height="55"
          fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="130"
          strokeDashoffset="130"
          style={anim("0.6s")}
        />
        <rect
          x="85" y="35" width="25" height="30"
          fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="110"
          strokeDashoffset="110"
          style={anim("0.75s")}
        />
      </svg>
      <p className="text-sm font-bold">Drawing the streets...</p>
    </div>
  )
}
