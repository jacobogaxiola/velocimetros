import { networkInterfaces } from 'node:os'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

function getNetworkHost() {
  const addresses = Object.entries(networkInterfaces()).flatMap(([name, detailsList]) =>
    detailsList
      .filter((details) => details.family === 'IPv4' && !details.internal)
      .map((details) => ({ address: details.address, name })),
  )
  const privateAddresses = addresses.filter(
    ({ address }) =>
      address.startsWith('192.168.') ||
      address.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(address),
  )
  const wirelessAddress = privateAddresses.find(({ name }) => /wi-?fi|wireless|wlan/i.test(name))

  return wirelessAddress?.address || privateAddresses[0]?.address || addresses[0]?.address || 'localhost'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  define: {
    'globalThis.__NETWORK_HOST__': JSON.stringify(getNetworkHost()),
  },
})
