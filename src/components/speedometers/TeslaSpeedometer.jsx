import { MAX_SPEED } from './constants'
import { getTeslaGaugePoint } from './utils'

export function TeslaSpeedometer({ theme, speed }) {
  const isCyber = theme === 'cyber'
  const primary = isCyber ? '#f97316' : '#7dd3fc'
  const secondary = isCyber ? '#facc15' : '#dbeafe'
  const glow = isCyber ? 'rgba(249, 115, 22, 0.45)' : 'rgba(125, 211, 252, 0.45)'
  const pointer = getTeslaGaugePoint(speed)

  return (
    <div className={`tesla-speedometer tesla-speedometer--${theme}`}>
      <svg viewBox="0 0 300 200" role="img" aria-label={`${speed} kilómetros por hora`}>
        <defs>
          <linearGradient id={`${theme}-tesla-gradient`} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor={secondary} />
            <stop offset="45%" stopColor={primary} />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        <path d="M 30 150 A 120 120 0 0 1 270 150" className="tesla-speedometer__track" />
        <path
          d="M 30 150 A 120 120 0 0 1 270 150"
          className="tesla-speedometer__progress"
          pathLength={100}
          stroke={`url(#${theme}-tesla-gradient)`}
          strokeDasharray={`${(speed / MAX_SPEED) * 100} 100`}
          strokeLinecap="round"
        />

        <line
          x1="150"
          y1="150"
          x2={pointer.x}
          y2={pointer.y}
          className="tesla-speedometer__needle"
          stroke="#f5f5f5"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="150" cy="150" r="8" fill={primary} stroke="#f8fafc" strokeWidth="3" />
        <circle cx="150" cy="150" r="20" fill={glow} opacity="0.35" />

        <text x="150" y="92" textAnchor="middle" className="tesla-speedometer__value">
          {speed}
        </text>
        <text x="150" y="116" textAnchor="middle" className="tesla-speedometer__unit">
          km/h
        </text>
      </svg>
    </div>
  )
}