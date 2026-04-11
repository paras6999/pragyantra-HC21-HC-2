import { useEffect, useRef, useState } from 'react'

export default function NearbyMap({ docType = 'government_office' }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [status, setStatus] = useState('locating') // locating, loading, ready, error
  const [centers, setCenters] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // 1. Get user location
    if (!navigator.geolocation) {
      setStatus('error')
      setErrorMsg('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        fetchCenters(latitude, longitude)
      },
      (error) => {
        setStatus('error')
        setErrorMsg('Could not get your location. Please enable location services.')
      }
    )

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [docType])

  const fetchCenters = async (lat, lng) => {
    setStatus('loading')
    try {
      const res = await fetch(`/api/nearby_centers?lat=${lat}&lng=${lng}&type=${docType}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.details || data.error || 'API Error')
      setCenters(data)
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Could not fetch nearby centers. Please try again.')
    }
  }

  useEffect(() => {
    if (status === 'ready' && userLocation && window.L && mapRef.current && !mapInstance.current) {
      mapInstance.current = window.L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 13)

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current)

      // User Marker
      const userIcon = window.L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      window.L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstance.current)
        .bindPopup('<b>You are here</b>')
        .openPopup()

      // Center Markers
      centers.forEach(c => {
        if (c.lat && c.lng) {
          const marker = window.L.marker([c.lat, c.lng]).addTo(mapInstance.current)
          
          const popupContent = `
            <div class="text-gray-800 p-2">
              <h3 class="font-bold text-sm mb-1">${c.name}</h3>
              <p class="text-xs mb-2">${c.address}</p>
              <a href="https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}" 
                 target="_blank" 
                 class="inline-block px-3 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition">
                Open in Google Maps →
              </a>
            </div>
          `
          marker.bindPopup(popupContent)
        }
      })
    }
  }, [status, centers, userLocation])

  return (
    <div className="w-full rounded-2xl overflow-hidden glass border border-white/10 relative" style={{ height: '300px' }}>
      {status !== 'ready' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 text-white p-4 text-center">
           {status === 'locating' && (
            <>
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2 mx-auto" />
              <p className="text-sm text-white/70">📍 Locating you...</p>
            </>
          )}
          {status === 'loading' && (
            <>
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2 mx-auto" />
              <p className="text-sm text-white/70">🔄 Finding nearby centers...</p>
            </>
          )}
          {status === 'error' && <p className="text-red-400">⚠️ {errorMsg}</p>}
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
