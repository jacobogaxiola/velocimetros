import { BATTERY_SEGMENT_OFFSETS, MAX_SPEED } from './constants'
import { formatOdometer, getBatteryColor, getModernGaugePoint, getWeatherIconUrl } from './utils'

export function ModernSpeedometer({
  theme,
  speed,
  odometerMeters,
  onResetOdometer,
  chargePercent,
  onOpenBatteryModal,
  weather,
  onOpenWeatherForecast,
}) {
  const isCockpit = theme === 'cockpit'
  const accent = isCockpit ? '#38bdf8' : '#f43f5e'
  const pointer = getModernGaugePoint(speed)
  const batteryColor = getBatteryColor(chargePercent)
  const filledSegments = chargePercent <= 0 ? 0 : Math.min(5, Math.ceil(chargePercent / 20))
  const ticks = Array.from({ length: 11 }, (_, index) => {
    const angle = ((140 + index * 26) * Math.PI) / 180
    const outerRadius = 101
    const innerRadius = index % 5 === 0 ? 90 : 95

    return {
      x1: 150 + innerRadius * Math.cos(angle),
      y1: 125 + innerRadius * Math.sin(angle),
      x2: 150 + outerRadius * Math.cos(angle),
      y2: 125 + outerRadius * Math.sin(angle),
    }
  })
  const scaleLabels = Array.from({ length: 11 }, (_, index) => {
    const angle = ((140 + index * 26) * Math.PI) / 180
    const labelRadius = 111

    return {
      value: index * 10,
      x: 150 + labelRadius * Math.cos(angle),
      y: 125 + labelRadius * Math.sin(angle),
    }
  })

  return (
    <div className={`modern-speedometer modern-speedometer--${theme}`}>
      <svg viewBox="0 0 300 245" role="img" aria-label={`${speed} kilómetros por hora`}>
        <path d="M 79.5 184 A 92 92 0 1 1 220.5 184" className="modern-speedometer__track" />
        <path
          d="M 79.5 184 A 92 92 0 1 1 220.5 184"
          className="modern-speedometer__progress"
          pathLength="100"
          stroke={accent}
          strokeDasharray={`${(speed / MAX_SPEED) * 100} 100`}
        />
        {ticks.map((tick, index) => (
          <line key={index} {...tick} className="modern-speedometer__tick" />
        ))}
        {scaleLabels.map((label) => (
          <text
            key={label.value}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            className="modern-speedometer__scale"
          >
            {label.value}
          </text>
        ))}
        <line
          x1="150"
          y1="125"
          x2={pointer.x}
          y2={pointer.y}
          className="modern-speedometer__needle"
          stroke={accent}
        />
        <circle cx="150" cy="125" r="9" fill={accent} className="modern-speedometer__hub" />
        <text x="150" y="96" textAnchor="middle" className="modern-speedometer__value">
          {speed}
        </text>
        <text x="150" y="108" textAnchor="middle" className="modern-speedometer__unit">
          KM/H
        </text>
        <g
          className="modern-speedometer__battery"
          transform="translate(97, 125)"
          role="button"
          tabIndex={0}
          aria-label="Batería estimada, doble clic para calibrar"
          onDoubleClick={onOpenBatteryModal}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              onOpenBatteryModal()
            }
          }}
        >
          <rect x="-16" y="-8" width="28" height="16" rx="3" className="modern-speedometer__battery-body" />
          <rect x="12" y="-4" width="4" height="8" rx="1" className="modern-speedometer__battery-nub" />
          {BATTERY_SEGMENT_OFFSETS.map((x, index) => (
            <rect
              key={x}
              x={x}
              y="-5"
              width="3.6"
              height="10"
              rx="0.8"
              fill={index < filledSegments ? batteryColor : 'rgba(148, 163, 184, 0.25)'}
            />
          ))}
          <text x="-2" y="20" textAnchor="middle" className="modern-speedometer__battery-label">
            {Math.round(chargePercent)}%
          </text>
        </g>
        <g
          className="modern-speedometer__weather"
          transform="translate(180, 125)"
          role="button"
          tabIndex={0}
          aria-label={`${weather.description}, ${weather.temperature === null ? 'temperatura no disponible' : `${Math.round(weather.temperature)} grados Celsius`}. Doble clic para ver el pronóstico por hora`}
          onDoubleClick={onOpenWeatherForecast}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              onOpenWeatherForecast()
            }
          }}
        >
          {weather.icon && (
            <image
              href={getWeatherIconUrl(weather.icon)}
              x="-15"
              y="-15"
              width="30"
              height="30"
              preserveAspectRatio="xMidYMid meet"
            />
          )}
          <text x="16" y="5" className="modern-speedometer__temperature">
            {weather.temperature === null ? '--°C' : `${Math.round(weather.temperature)}°C`}
          </text>
          <title>{weather.description}</title>
        </g>
        <g
          className="modern-speedometer__odo-container"
          transform="translate(150, 160)"
          role="button"
          tabIndex={0}
          aria-label="Odómetro, doble clic para reiniciar"
          onDoubleClick={onResetOdometer}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              onResetOdometer()
            }
          }}
        >
          <rect x="-44" y="-14" width="88" height="28" rx="8" className="modern-speedometer__odo-bg" />
          <text x="0" y="4" textAnchor="middle" className="modern-speedometer__odometer">
            {formatOdometer(odometerMeters)}
          </text>
        </g>
        <text x="150" y="193" textAnchor="middle" className="modern-speedometer__caption">
          {isCockpit ? 'DRIVE / READY' : 'SPORT'}
        </text>
      </svg>
    </div>
  )
}