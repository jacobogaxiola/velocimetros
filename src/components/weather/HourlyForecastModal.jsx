import { useEffect, useState } from 'react'

const FORECAST_CACHE_TTL_MS = 3 * 60 * 60 * 1000
let forecastCache = null

function getLocalDateKey(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000)
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
}

function formatLocalHour(timestamp, timezoneOffset) {
  return new Date((timestamp + timezoneOffset) * 1000).toISOString().slice(11, 16)
}

export default function HourlyForecastModal({ onClose }) {
  const [status, setStatus] = useState(() => {
    if (!navigator.geolocation) return 'Este dispositivo no ofrece ubicación.'
    if (!import.meta.env.VITE_OPENWEATHER_API_KEY) return 'Falta configurar OpenWeather.'
    return 'Solicitando ubicación...'
  })
  const [hours, setHours] = useState([])

  useEffect(() => {
    let isCurrent = true
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

    async function loadForecast(latitude, longitude) {
      if (!apiKey) {
        return
      }

      const locationKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`
      if (forecastCache?.locationKey === locationKey && forecastCache.expiresAt > Date.now()) {
        setHours(forecastCache.hours)
        setStatus(forecastCache.status)
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
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}`)
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || 'OpenWeather no pudo obtener el pronóstico.')
        }

        if (!isCurrent) return

        const timezoneOffset = result.city.timezone ?? 0
        const todayKey = getLocalDateKey(Date.now() / 1000, timezoneOffset)
        const todayHours = result.list
          .filter((forecast) => getLocalDateKey(forecast.dt, timezoneOffset) === todayKey)
          .map((forecast) => ({
            timestamp: forecast.dt,
            time: formatLocalHour(forecast.dt, timezoneOffset),
            temperature: forecast.main.temp,
            icon: forecast.weather[0].icon,
            description: forecast.weather[0].description,
          }))
        const nextStatus = todayHours.length ? '' : 'No hay horas disponibles para hoy.'

        forecastCache = {
          locationKey,
          expiresAt: Date.now() + FORECAST_CACHE_TTL_MS,
          hours: todayHours,
          status: nextStatus,
        }

        setHours(todayHours)
        setStatus(nextStatus)
      } catch (error) {
        if (isCurrent) {
          setStatus(error.message || 'No se pudo cargar el pronóstico.')
        }
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => loadForecast(coords.latitude, coords.longitude),
        () => {
          if (isCurrent) {
            setStatus('Permite el acceso a la ubicación para consultar el pronóstico.')
          }
        },
        { enableHighAccuracy: false, maximumAge: 600000, timeout: 10000 },
      )
    }

    return () => {
      isCurrent = false
    }
  }, [])

  return (
    <div className="forecast-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="forecast-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forecast-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="forecast-modal__header">
          <h2 id="forecast-modal-title">Pronóstico de hoy (cada 3 h)</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar pronóstico">
            Cerrar
          </button>
        </header>
        {status ? (
          <p className="forecast-modal__status" role="status">
            {status}
          </p>
        ) : (
          <div className="forecast-modal__list">
            {hours.map((hour) => (
              <div className="forecast-modal__row" key={hour.timestamp}>
                <time dateTime={new Date(hour.timestamp * 1000).toISOString()}>{hour.time}</time>
                <img
                  src={`https://openweathermap.org/img/wn/${hour.icon}@2x.png`}
                  alt={hour.description}
                  width="40"
                  height="40"
                />
                <span className="forecast-modal__description">{hour.description}</span>
                <strong>{Math.round(hour.temperature)}°C</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}