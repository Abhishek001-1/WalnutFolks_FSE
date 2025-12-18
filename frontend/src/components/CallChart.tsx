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
  // No center text plugin — show only the donut chart

  return (
    <div style={{ position: 'relative', height: 320 }} data-active-index={activeIndex}>
      <Doughnut ref={ref} data={chartData} options={options} />
    </div>
  )
}
