import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import GaugeComponent from 'react-gauge-component'
import ReactSpeedometer from 'react-d3-speedometer'
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'
import { MAX_SPEED } from './constants'

export function ClassicSpeedometer({ speed }) {
  return (
    <ReactSpeedometer
      value={speed}
      minValue={0}
      maxValue={MAX_SPEED}
      currentValueText="${value} km/h"
    />
  )
}

export function GaugeSpeedometer({ speed }) {
  return (
    <GaugeComponent
      value={speed}
      minValue={0}
      maxValue={MAX_SPEED}
      arc={{
        width: 0.3,
        padding: 0.02,
        subArcs: [
          { limit: 333, color: '#224ec5' },
          { limit: 666, color: '#f59e0b' },
          { color: '#ef4444' },
        ],
      }}
      pointer={{ type: 'needle', color: '#f1e313', length: 0.75 }}
      labels={{
        valueLabel: { formatTextValue: (value) => `${value} km/h` },
      }}
    />
  )
}

export function CircularSpeedometer({ speed }) {
  return (
    <div className="circular-speedometer">
      <CircularProgressbar
        value={speed}
        maxValue={MAX_SPEED}
        text={`${speed} km/h`}
        styles={buildStyles({
          pathColor: '#0f766e',
          textColor: '#172033',
          trailColor: '#d8e1e8',
        })}
      />
    </div>
  )
}

export function RadialSpeedometer({ speed }) {
  return (
    <div className="radial-speedometer">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="68%"
          outerRadius="100%"
          barSize={28}
          data={[{ speed, fill: '#d35b37' }]}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, MAX_SPEED]} tick={false} />
          <RadialBar background dataKey="speed" cornerRadius={14} />
        </RadialBarChart>
      </ResponsiveContainer>
      <span>{speed} km/h</span>
    </div>
  )
}