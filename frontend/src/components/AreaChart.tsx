import { useRef, useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

type Props = {
  data: number[]
  labels: string[]
}

export default function AreaChart({ data, labels }: Props) {
  const chartRef = useRef<any>(null)

  // compute vertical padding so points don't sit on the edge of the chart
  const minVal = Math.min(...data)
  const maxVal = Math.max(...data)
  const vRange = Math.max(10, maxVal - minVal)
  const vPad = Math.ceil(vRange * 0.12)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Average call duration (s)',
        data,
        fill: true,
        backgroundColor: 'rgba(96,165,250,0.12)',
        borderColor: '#60A5FA',
  // smoother curve: use monotone cubic interpolation to avoid sharp corners
  tension: 0.4,
  cubicInterpolationMode: 'monotone' as const,
  // hide point markers for a clean, non-editable line chart
  pointRadius: 0,
  pointHoverRadius: 0,
  borderWidth: 3,
      },
    ],
  }

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#475569' } },
      y: {
        grid: { color: 'rgba(2,6,23,0.06)' },
        ticks: { color: '#475569' },
        // leave some headroom so points / handles don't get clipped
        suggestedMin: Math.max(0, minVal - vPad),
        suggestedMax: maxVal + vPad,
      },
    },
    // give breathing room around top/bottom
    layout: { padding: { top: 18, bottom: 18 } },
    maintainAspectRatio: false,
    responsive: true,
  animation: { duration: 140 },
    // speed up the tension/y movement so dragging feels snappy
    animations: {
      tension: { duration: 120 },
      y: { duration: 120 },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  }

  // no pointer/drag handling: chart is read-only (non-adjustable)
  useEffect(() => {
    // noop - included so chartRef updates when data/labels change
    return () => {}
  }, [labels, data])

  // no overlay handles for read-only chart
  // compute single maxima index for display
  const maxIndex = data.indexOf(Math.max(...data))

  // marker state: only render marker when we have valid pixel coords
  const [markerPos, setMarkerPos] = useState<{ left: number; top: number } | null>(null)
  const markerSize = 12

  const updateMarker = () => {
    const chart = chartRef.current as any
    if (!chart || !chart.scales) {
      setMarkerPos(null)
      return
    }

    try {
      const left = chart.scales.x.getPixelForValue(maxIndex)
      const top = chart.scales.y.getPixelForValue(data[maxIndex])
      if (typeof left === 'number' && typeof top === 'number' && !Number.isNaN(left) && !Number.isNaN(top)) {
        setMarkerPos({ left, top })
      } else {
        setMarkerPos(null)
      }
    } catch (e) {
      setMarkerPos(null)
    }
  }

  useEffect(() => {
    // update marker once chart has mounted and whenever data/labels change
    // small timeout lets the chart finish layout in most cases
    const t = setTimeout(updateMarker, 50)

    // also update on window resize so marker stays aligned
    window.addEventListener('resize', updateMarker)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', updateMarker)
    }
  }, [data, labels])

  return (
    <div className="relative h-56 sm:h-72 md:h-80">
      <Line ref={chartRef} data={chartData} options={options} />
      {/* single maxima marker — render only when we have valid pixel positions */}
      {markerPos ? (
        <div
          style={{
            position: 'absolute',
            left: markerPos.left - markerSize / 2,
            top: markerPos.top - markerSize / 2,
            width: markerSize,
            height: markerSize,
            borderRadius: markerSize / 2,
            background: '#2563EB',
            boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
            pointerEvents: 'none',
          }}
          title="Maxima"
        />
      ) : null}
    </div>
  )
}
