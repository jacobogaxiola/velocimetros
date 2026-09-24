import { useEffect, useRef, useState } from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import GaugeComponent from 'react-gauge-component'
import { QRCodeSVG } from 'qrcode.react'
import ReactSpeedometer from 'react-d3-speedometer'
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'
import 'react-circular-progressbar/dist/styles.css'
import './App.css'

const MAX_SPEED = 100
const NETWORK_IP = globalThis.__NETWORK_HOST__ || window.location.hostname

function getDistanceInMeters(firstPosition, secondPosition) {
  const earthRadius = 6371000
  const latitudeDelta = ((secondPosition.latitude - firstPosition.latitude) * Math.PI) / 180
  const longitudeDelta = ((secondPosition.longitude - firstPosition.longitude) * Math.PI) / 180
  const firstLatitude = (firstPosition.latitude * Math.PI) / 180
  const secondLatitude = (secondPosition.latitude * Math.PI) / 180
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

const speedometerOptions = [
  { id: 'd3', label: 'Clásico' },
  { id: 'gauge', label: 'Gauge' },
  { id: 'circular', label: 'Circular' },
  { id: 'radial', label: 'Radial' },
  { id: 'tesla-plaid', label: 'Tesla Plaid' },
  { id: 'tesla-cyber', label: 'Tesla Cyber' },
  { id: 'modern-sport', label: 'Sport' },
  { id: 'modern-cockpit', label: 'Cockpit' },
]

function getTeslaGaugePoint(speedValue, radius = 110) {
  const progress = Math.min(Math.max(speedValue / MAX_SPEED, 0), 1)
  const angle = Math.PI * (1 - progress)

  return {
    x: 150 + radius * Math.cos(angle),
    y: 150 - radius * Math.sin(angle),
  }
}

function renderTeslaGauge(theme, speedValue) {
  const isCyber = theme === 'cyber'
  const primary = isCyber ? '#f97316' : '#7dd3fc'
  const secondary = isCyber ? '#facc15' : '#dbeafe'
  const glow = isCyber ? 'rgba(249, 115, 22, 0.45)' : 'rgba(125, 211, 252, 0.45)'
  const pointer = getTeslaGaugePoint(speedValue)

  return (
    <div className={`tesla-speedometer tesla-speedometer--${theme}`}>
      <svg viewBox="0 0 300 200" role="img" aria-label={`${speedValue} kilómetros por hora`}>
        <defs>
          <linearGradient id={`${theme}-tesla-gradient`} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor={secondary} />
            <stop offset="45%" stopColor={primary} />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        <path
          d="M 30 150 A 120 120 0 0 1 270 150"
          className="tesla-speedometer__track"
        />
        <path
          d="M 30 150 A 120 120 0 0 1 270 150"
          className="tesla-speedometer__progress"
          pathLength={100}
          stroke={`url(#${theme}-tesla-gradient)`}
          strokeDasharray={`${(speedValue / MAX_SPEED) * 100} 100`}
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
          {speedValue}
        </text>
        <text x="150" y="116" textAnchor="middle" className="tesla-speedometer__unit">
          km/h
        </text>
      </svg>
    </div>
  )
}

function getModernGaugePoint(speedValue, radius = 104) {
  const progress = Math.min(Math.max(speedValue / MAX_SPEED, 0), 1)
  const angle = ((140 + progress * 260) * Math.PI) / 180

  return {
    x: 150 + radius * Math.cos(angle),
    y: 125 + radius * Math.sin(angle),
  }
}

function renderModernGauge(theme, speedValue) {
  const isCockpit = theme === 'cockpit'
  const accent = isCockpit ? '#38bdf8' : '#f43f5e'
  const pointer = getModernGaugePoint(speedValue)
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
      <svg viewBox="0 0 300 245" role="img" aria-label={`${speedValue} kilómetros por hora`}>
        <path d="M 79.5 184 A 92 92 0 1 1 220.5 184" className="modern-speedometer__track" />
        <path
          d="M 79.5 184 A 92 92 0 1 1 220.5 184"
          className="modern-speedometer__progress"
          pathLength="100"
          stroke={accent}
          strokeDasharray={`${(speedValue / MAX_SPEED) * 100} 100`}
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
          {speedValue}
        </text>
        <text x="150" y="108" textAnchor="middle" className="modern-speedometer__unit">
          KM/H
        </text>
        <text x="150" y="193" textAnchor="middle" className="modern-speedometer__caption">
          {isCockpit ? 'DRIVE / READY' : 'SPORT'}
        </text>
      </svg>
    </div>
  )
}

function App() {
  const [speed, setSpeed] = useState(65)
  const [speedometerType, setSpeedometerType] = useState('d3')
  const [gpsActive, setGpsActive] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('GPS desactivado')
  const lastPositionRef = useRef(null)

  useEffect(() => {
    if (!gpsActive) {
      return undefined
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { coords, timestamp } = position
        const previousPosition = lastPositionRef.current
        let metersPerSecond = coords.speed

        if (
          (metersPerSecond === null || !Number.isFinite(metersPerSecond)) &&
          previousPosition
        ) {
          const elapsedSeconds = (timestamp - previousPosition.timestamp) / 1000
          if (elapsedSeconds > 0) {
            metersPerSecond =
              getDistanceInMeters(previousPosition.coords, coords) / elapsedSeconds
          }
        }

        lastPositionRef.current = { coords, timestamp }
        const kilometersPerHour = Math.max(0, (metersPerSecond || 0) * 3.6)
        setSpeed(Math.min(MAX_SPEED, Math.round(kilometersPerHour)))
        setGpsStatus('GPS activo')
      },
      () => {
        lastPositionRef.current = null
        setGpsStatus('No se pudo obtener la ubicación')
        setGpsActive(false)
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [gpsActive])

  function toggleGps() {
    if (gpsActive) {
      lastPositionRef.current = null
      setGpsActive(false)
      setGpsStatus('GPS desactivado')
      return
    }

    if (!navigator.geolocation) {
      setGpsStatus('GPS no disponible en este dispositivo')
      return
    }

    if (!window.isSecureContext) {
      setGpsStatus('El GPS requiere abrir la app con HTTPS')
      return
    }

    setGpsStatus('Buscando ubicación...')
    setGpsActive(true)
  }

  function renderSpeedometer() {
    if (speedometerType === 'gauge') {
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

    if (speedometerType === 'circular') {
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

    if (speedometerType === 'radial') {
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

    if (speedometerType === 'tesla-plaid') {
      return renderTeslaGauge('plaid', speed)
    }

    if (speedometerType === 'tesla-cyber') {
      return renderTeslaGauge('cyber', speed)
    }

    if (speedometerType === 'modern-sport') {
      return renderModernGauge('sport', speed)
    }

    if (speedometerType === 'modern-cockpit') {
      return renderModernGauge('cockpit', speed)
    }

    return (
      <ReactSpeedometer
        value={speed}
        minValue={0}
        maxValue={MAX_SPEED}
        currentValueText="${value} km/h"
      />
    )
  }

  const qrUrl = new URL(window.location.href)
  qrUrl.hostname = NETWORK_IP

  return (
    <main id="center">
      <div className="title-row">
        <h1>Velocímetro</h1>
        <div className="qr-launch">
          <QRCodeSVG
            value={qrUrl.toString()}
            size={76}
            bgColor="#ffffff"
            fgColor="#111827"
            level="M"
            aria-label="Código QR para abrir el velocímetro"
          />
          <span>Abrir en celular</span>
        </div>
      </div>

      <div className="speedometer-selector" role="group" aria-label="Tipo de velocímetro">
        {speedometerOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={speedometerType === option.id ? 'is-active' : ''}
            onClick={() => setSpeedometerType(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className="speedometer-display" aria-live="polite">
        {renderSpeedometer()}
      </section>

      <div className="gps-control" aria-live="polite">
        <button type="button" onClick={toggleGps} className={gpsActive ? 'is-active' : ''}>
          {gpsActive ? 'Desactivar GPS' : 'Activar GPS'}
        </button>
        <span>{gpsStatus}</span>
      </div>

      <label className="speed-control">
        <span>
          Velocidad: <strong>{speed} km/h</strong>
        </span>
        <input
          type="range"
          min="0"
          max={MAX_SPEED}
          value={speed}
          disabled={gpsActive}
          onChange={(event) => setSpeed(Number(event.target.value))}
        />
      </label>
    </main>
  )
}

export default App
