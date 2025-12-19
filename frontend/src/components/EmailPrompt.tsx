import { useState } from 'react'

type Props = {
  onSave: (email: string) => void
}

export default function EmailPrompt({ onSave }: Props) {
  const [val, setVal] = useState('')
  return (
    <div className="space-y-2">
      <label className="block text-sm">Enter your email to save values</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)} className="flex-1 border rounded px-2 py-1" />
        <button className="px-3 py-1 bg-green-600 text-white rounded w-full sm:w-auto" onClick={() => onSave(val)}>
          Save
        </button>
      </div>
    </div>
  )
}
