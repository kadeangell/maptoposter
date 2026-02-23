export function ExportAnimation() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-48 h-5 win-sunken bg-white p-px">
        <div
          className="h-full bg-primary"
          style={{ animation: "fill-progress 3s ease-in-out infinite" }}
        />
      </div>
      <p className="text-sm font-bold">Creating your poster...</p>
    </div>
  )
}
