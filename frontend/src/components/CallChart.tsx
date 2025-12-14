import { useRef } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

type Props = {
  data: number[]
  labels: string[]
  activeIndex?: number
  onActiveChange?: (i: number) => void
}

export default function CallChart({ data, labels, activeIndex = 0, onActiveChange }: Props) {
  const ref = useRef<any>(null)

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: ['#60A5FA', '#34D399', '#F59E0B', '#F87171'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  }

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { usePointStyle: true, padding: 12 },
      },
      tooltip: { enabled: true },
    },
    cutout: '55%',
    maintainAspectRatio: false,
    onClick: (evt: any) => {
      if (!ref.current) return
      const chart = ref.current as any
      const elements = chart.getElementsAtEventForMode(evt.native, 'nearest', { intersect: true }, true)
      if (elements.length) {
        const idx = elements[0].index
        onActiveChange?.(idx)
      }
    },
  }
  const activeValue = data[activeIndex] ?? 0

  // Plugin to draw centered text inside the doughnut canvas so it remains centered
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart: any) => {
      try {
        const ctx = chart.ctx
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2

        ctx.save()

        // Draw main number
        ctx.font = '700 28px Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
        ctx.fillStyle = '#0f172a'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(activeValue), centerX, centerY - 6)

        // Draw caption
        ctx.font = '14px Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
        ctx.fillStyle = '#64748b'
        ctx.fillText('Calls', centerX, centerY + 20)

        ctx.restore()
      } catch (e) {
        // fail silently if chart not ready
      }
    },
  }

  return (
    <div style={{ position: 'relative', height: 320 }}>
      <Doughnut ref={ref} data={chartData} options={options} plugins={[centerTextPlugin]} />
    </div>
  )
}
