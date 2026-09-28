import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  ClassicSpeedometer,
  CircularSpeedometer,
  GaugeSpeedometer,
  RadialSpeedometer,
} from './components/speedometers/BasicSpeedometers'
import { MAX_SPEED } from './components/speedometers/constants'
import { ModernSpeedometer } from './components/speedometers/ModernSpeedometer'
import { TeslaSpeedometer } from './components/speedometers/TeslaSpeedometer'
import { formatOdometer } from './components/speedometers/utils'
import HourlyForecastModal from './components/weather/HourlyForecastModal'
import './App.css'

const MAX_DISTANCE = 999999
const NETWORK_IP = globalThis.__NETWORK_HOST__ || window.location.hostname
const STORAGE_KEY = 'adw-dashboard-state'
const DEFAULT_AUTONOMY_KM = 300
const DEFAULT_BATTERY_PERCENT = 100

function loadPersistedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function computeChargePercent(batteryOdometerMeters, baseline, autonomyKm) {
  if (!autonomyKm || autonomyKm <= 0) {
    return Math.min(100, Math.max(0, baseline.percent))
  }

  const distanceKm = (batteryOdometerMeters - baseline.odometerMeters) / 1000
  const consumedPercent = (distanceKm / autonomyKm) * 100

  return Math.min(100, Math.max(0, baseline.percent - consumedPercent))
}

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

function App() {
  const persistedState = useMemo(() => loadPersistedState(), [])

  const [speed, setSpeed] = useState(persistedState.speed ?? 65)
  const [speedometerType, setSpeedometerType] = useState('d3')
  const [gpsActive, setGpsActive] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('GPS desactivado')
  const [odometer, setOdometer] = useState(persistedState.tripOdometer ?? 0)
  const [batteryOdometer, setBatteryOdometer] = useState(persistedState.batteryOdometer ?? 0)
  const [autonomyKm, setAutonomyKm] = useState(persistedState.autonomyKm ?? DEFAULT_AUTONOMY_KM)
  const [batteryBaseline, setBatteryBaseline] = useState(
    persistedState.batteryBaseline ?? { percent: DEFAULT_BATTERY_PERCENT, odometerMeters: 0 },
  )
  const [isBatteryModalOpen, setBatteryModalOpen] = useState(false)
  const [isForecastModalOpen, setForecastModalOpen] = useState(false)
  const [chargeDraft, setChargeDraft] = useState(DEFAULT_BATTERY_PERCENT)
  const [autonomyDraft, setAutonomyDraft] = useState(DEFAULT_AUTONOMY_KM)
  const [weather, setWeather] = useState({
    temperature: null,
    icon: null,
    description: 'Clima pendiente',
  })
  const lastPositionRef = useRef(null)
  const isModernGauge = speedometerType === 'modern-sport' || speedometerType === 'modern-cockpit'

  const chargePercent = computeChargePercent(batteryOdometer, batteryBaseline, autonomyKm)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const payload = { speed, tripOdometer: odometer, batteryOdometer, autonomyKm, batteryBaseline }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [speed, odometer, batteryOdometer, autonomyKm, batteryBaseline])

  useEffect(() => {
    if (!isModernGauge) {
      return undefined
    }

    let isCurrent = true

    async function loadWeather(latitude, longitude) {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
      if (!apiKey) {
        setWeather({ temperature: null, icon: null, description: 'Falta configurar OpenWeather' })
        return
      }

      const query = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
        appid: apiKey,
        units: 'metric',
        lang: 'es',
      })

      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`)
        if (!response.ok) {
          throw new Error('No se pudo consultar OpenWeather')
        }

        const result = await response.json()
        if (isCurrent) {
          setWeather({
            temperature: result.main.temp,
            icon: result.weather[0].icon,
            description: result.weather[0].description,
          })
        }
      } catch {
        if (isCurrent) {
          setWeather({ temperature: null, icon: null, description: 'Clima no disponible' })
        }
      }
    }

    function requestWeather() {
      if (!navigator.geolocation) {
        setWeather({ temperature: null, icon: null, description: 'Ubicación no disponible' })
        return
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => loadWeather(coords.latitude, coords.longitude),
        () => setWeather({ temperature: null, icon: null, description: 'Ubicación no disponible' }),
        { enableHighAccuracy: false, maximumAge: 600000, timeout: 10000 },
      )
    }

    requestWeather()
    const intervalId = window.setInterval(requestWeather, 600000)

    return () => {
      isCurrent = false
      window.clearInterval(intervalId)
    }
  }, [isModernGauge])

  function resetOdometer() {
    setOdometer(0)
  }

  function openBatteryModal() {
    setChargeDraft(Math.round(chargePercent))
    setAutonomyDraft(autonomyKm)
    setBatteryModalOpen(true)
  }

  function closeBatteryModal() {
    setBatteryModalOpen(false)
  }

  function closeForecastModal() {
    setForecastModalOpen(false)
  }

  function saveBatteryModal(event) {
    event.preventDefault()
    const clampedCharge = Math.min(100, Math.max(0, Number(chargeDraft)))
    const parsedAutonomy = Math.max(1, Number(autonomyDraft) || 1)
    setBatteryBaseline({ percent: clampedCharge, odometerMeters: batteryOdometer })
    setAutonomyKm(parsedAutonomy)
    setBatteryModalOpen(false)
  }

  useEffect(() => {
    if (!gpsActive) {
      return undefined
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { coords, timestamp } = position
        const previousPosition = lastPositionRef.current
        let metersPerSecond = coords.speed

        if (previousPosition) {
          const deltaMeters = getDistanceInMeters(previousPosition.coords, coords)
          setOdometer((previous) => previous + deltaMeters)
          setBatteryOdometer((previous) => previous + deltaMeters)
        }

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

    setOdometer(0)
    setGpsStatus('Buscando ubicación...')
    setGpsActive(true)
  }

  function renderSpeedometer() {
    if (speedometerType === 'modern-sport') {
      return (
        <ModernSpeedometer
          theme="sport"
          speed={speed}
          odometerMeters={odometer}
          onResetOdometer={resetOdometer}
          chargePercent={chargePercent}
          onOpenBatteryModal={openBatteryModal}
          weather={weather}
          onOpenWeatherForecast={() => setForecastModalOpen(true)}
        />
      )
    }

    if (speedometerType === 'modern-cockpit') {
      return (
        <ModernSpeedometer
          theme="cockpit"
          speed={speed}
          odometerMeters={odometer}
          onResetOdometer={resetOdometer}
          chargePercent={chargePercent}
          onOpenBatteryModal={openBatteryModal}
          weather={weather}
          onOpenWeatherForecast={() => setForecastModalOpen(true)}
        />
      )
    }

    if (speedometerType === 'tesla-plaid') {
      return <TeslaSpeedometer theme="plaid" speed={speed} />
    }

    if (speedometerType === 'tesla-cyber') {
      return <TeslaSpeedometer theme="cyber" speed={speed} />
    }

    if (speedometerType === 'gauge') return <GaugeSpeedometer speed={speed} />
    if (speedometerType === 'circular') return <CircularSpeedometer speed={speed} />
    if (speedometerType === 'radial') return <RadialSpeedometer speed={speed} />
    return <ClassicSpeedometer speed={speed} />
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

      <label className="speedometer-selector" htmlFor="speedometer-type">
        <select
          id="speedometer-type"
          aria-label="Tipo de velocímetro"
          value={speedometerType}
          onChange={(event) => setSpeedometerType(event.target.value)}
        >
          {speedometerOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

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

      <label className="speed-control">
        <span>
          Distancia: <strong>{formatOdometer(odometer)}</strong>
        </span>
        <input
          type="range"
          min="0"
          max={MAX_DISTANCE}
          step="10"
          value={Math.round(odometer)}
          disabled={gpsActive}
          onChange={(event) => {
            const newValue = Number(event.target.value)
            setBatteryOdometer((previous) => previous + (newValue - odometer))
            setOdometer(newValue)
          }}
        />
      </label>

      {isBatteryModalOpen && (
        <div className="battery-modal-backdrop" role="presentation" onClick={closeBatteryModal}>
          <div
            className="battery-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Calibrar batería"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Calibrar batería</h2>
            <form onSubmit={saveBatteryModal}>
              <label>
                <span>Carga actual (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={chargeDraft}
                  onChange={(event) => setChargeDraft(event.target.value)}
                />
              </label>
              <label>
                <span>Autonomía total (km)</span>
                <input
                  type="number"
                  min="1"
                  value={autonomyDraft}
                  onChange={(event) => setAutonomyDraft(event.target.value)}
                />
              </label>
              <div className="battery-modal__actions">
                <button type="button" onClick={closeBatteryModal}>
                  Cancelar
                </button>
                <button type="submit" className="is-active">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isForecastModalOpen && <HourlyForecastModal onClose={closeForecastModal} />}
    </main>
  )
}

export default App
