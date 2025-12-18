type Props = {
  label: string
  value: number
  onChange: (v: number) => void
}

export default function ChartControls({ label, value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-32 text-sm">{label}</label>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <input
        className="w-16 ml-2 border rounded px-1"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
