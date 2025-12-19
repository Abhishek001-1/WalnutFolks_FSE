import './App.css'
import { useEffect, useState } from 'react'
import CallChart from './components/CallChart'
import ChartControls from './components/ChartControls'
import AreaChart from './components/AreaChart'
import { supabase } from './supabaseClient'
import useDebounce from './hooks/useDebounce'

const dummyLabels = ['Agent success', 'Unsupported language', 'Incorrect ID', 'Customer hostility']

export default function App() {
  const [data, setData] = useState([40, 25, 20, 15])
  const [email, setEmail] = useState('')

  const [tableMissing, setTableMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  // area chart state: labels and data points
  const [areaLabels, setAreaLabels] = useState(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'])
  const [areaData, setAreaData] = useState<number[]>([120, 160, 140, 180, 170, 150, 190])

  const debouncedEmail = useDebounce(email, 400)

  useEffect(() => {
    // try to fetch saved values for email when set (debounced)
    if (!debouncedEmail) return
    ;(async () => {
  const { data: rows, error, status } = await supabase.from('user_values').select('*').eq('email', debouncedEmail).limit(1)
      // PostgREST returns 404 when the table doesn't exist
      if (status === 404 || (error && /not found/i.test(error.message || ''))) {
        setTableMissing(true)
        // fall back to localStorage
        const key = `user_values_${debouncedEmail}`
        const raw = localStorage.getItem(key)
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) setData(parsed)
          } catch (e) {
            console.error('Failed to parse localStorage data', e)
          }
        }
        return
        }
      if (rows && rows.length) {
        const existing = rows[0]
        if (existing.values) {
          setData(existing.values)
        }
        if (existing.area && Array.isArray(existing.area.labels) && Array.isArray(existing.area.data)) {
          setAreaLabels(existing.area.labels)
          setAreaData(existing.area.data)
        }
        // also handle localStorage fallback shape
        if (!existing.values && existing.pie) setData(existing.pie)
      }
    })()
  }, [debouncedEmail])

  async function saveValues(newValues: number[]) {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email before saving.' })
      return
    }
    setSaving(true)
  if (tableMissing) {
      // fallback to localStorage when Supabase table isn't available
      const key = `user_values_${email}`
      const prev = localStorage.getItem(key)
      if (prev) {
        const ok = confirm('Found previous local values. Overwrite?')
        if (!ok) return
      }
  const payload = { values: newValues, area: { labels: areaLabels, data: areaData } }
      localStorage.setItem(key, JSON.stringify(payload))
      setData(newValues)
      setSaving(false)
      setMessage({ type: 'success', text: 'Values saved to local browser storage.' })
      window.setTimeout(() => setMessage(null), 3000)
      return
    }

    // use Supabase when table exists
    const { data: rows, error, status } = await supabase.from('user_values').select('*').eq('email', email).limit(1)
    if (status === 404 || (error && /not found/i.test(error.message || ''))) {
      setTableMissing(true)
      // fallback to localStorage
      const key = `user_values_${email}`
  const payload = { values: newValues, area: { labels: areaLabels, data: areaData } }
      localStorage.setItem(key, JSON.stringify(payload))
      setData(newValues)
      return
    }

    try {
      if (rows && rows.length) {
        const ok = confirm('Overwrite previous saved values?')
        if (!ok) {
          setSaving(false)
          return
        }
  const { error } = await supabase.from('user_values').update({ values: newValues, area: { labels: areaLabels, data: areaData } }).eq('email', email)
        if (error) throw error
      } else {
  const { error } = await supabase.from('user_values').insert({ email, values: newValues, area: { labels: areaLabels, data: areaData } })
        if (error) throw error
      }
      setData(newValues)
      setMessage({ type: 'success', text: 'Values saved to Supabase.' })
    } catch (err) {
      let errorMessage = 'Unknown error'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      } else {
        try {
          errorMessage = JSON.stringify(err)
        } catch {
          errorMessage = String(err)
        }
      }
      setMessage({ type: 'error', text: `Save failed: ${errorMessage}` })
    } finally {
      setSaving(false)
      window.setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      {tableMissing && (
        <div className="max-w-4xl mx-auto mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
          <strong className="block">Supabase table `user_values` not found.</strong>
          <p className="text-sm">For full cloud persistence, create the table in your Supabase project with the SQL below, or leave using the local browser fallback.</p>
          <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">{`CREATE TABLE public.user_values (
  email text PRIMARY KEY,
  values jsonb
);
\n-- If you use Row Level Security, allow anon access for demo purposes:
ALTER TABLE public.user_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow anon" ON public.user_values FOR ALL USING (true) WITH CHECK (true);
`}</pre>
        </div>
      )}
      <header className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold">Call Analytics Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">Voice agent performance overview</p>
      </header>

      <main className="max-w-5xl mx-auto mt-6 space-y-6">
        <section className="bg-white p-4 sm:p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Call Duration Analysis</h2>
          <AreaChart labels={areaLabels} data={areaData} />

          {/* Read-only area chart (no maxima controls) */}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Sad Path Analysis</h2>
            <CallChart data={data} labels={dummyLabels} activeIndex={0} onActiveChange={() => setData((d) => d)} />
          </section>

          <aside className="md:col-span-1 bg-white p-4 rounded shadow space-y-4">
          <div>
            <label className="block text-sm">Email (required to save)</label>
            <input className="w-full border rounded px-2 py-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {dummyLabels.map((l, i) => (
            <ChartControls key={l} label={l} value={data[i]} onChange={(v) => setData((d) => d.map((x, idx) => (idx === i ? v : x)))} />
          ))}

          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => saveValues(data)}>
              {saving ? 'Saving...' : 'Save values'}
            </button>
            <button className="px-3 py-1 border rounded" onClick={() => setData([40, 25, 20, 15])}>
              Reset
            </button>
          </div>
          {message && (
            <div className={`mt-2 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}
        </aside>
        </div>
      </main>
    </div>
  )
}
