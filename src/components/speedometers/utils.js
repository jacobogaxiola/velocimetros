import { MAX_SPEED } from './constants'

export function getBatteryColor(chargePercent) {
  if (chargePercent > 60) return '#22c55e'
  if (chargePercent > 20) return '#f59e0b'
  return '#ef4444'
}

export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}.png`
}

export function getTeslaGaugePoint(speedValue, radius = 110) {
  const progress = Math.min(Math.max(speedValue / MAX_SPEED, 0), 1)
  const angle = Math.PI * (1 - progress)

  return {
    x: 150 + radius * Math.cos(angle),
    y: 150 - radius * Math.sin(angle),
  }
}

export function getModernGaugePoint(speedValue, radius = 104) {
  const progress = Math.min(Math.max(speedValue / MAX_SPEED, 0), 1)
  const angle = ((140 + progress * 260) * Math.PI) / 180

  return {
    x: 150 + radius * Math.cos(angle),
    y: 125 + radius * Math.sin(angle),
  }
}

export function formatOdometer(meters) {
  return `${Math.floor(meters).toString().padStart(6, '0')} m`
}