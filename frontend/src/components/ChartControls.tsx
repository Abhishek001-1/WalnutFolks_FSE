type Props = {
  label: string
  value: number
  onChange: (v: number) => void
}

export default function ChartControls({ label, value, onChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <label className="sm:w-32 text-sm break-words">{label}</label>
      <div className="flex items-center gap-2 w-full min-w-0">
        <input
          className="flex-1 min-w-0"
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          className="w-20 ml-2 border rounded px-1 flex-shrink-0"
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
