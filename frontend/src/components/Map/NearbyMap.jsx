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
        mapInstance.current.off()
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

  // Handle Map Rendering
  useEffect(() => {
    if (status === 'ready' && userLocation && window.L && mapRef.current) {
      
      // Cleanup previous instance before recreating to avoid duplicate init error
      if (mapInstance.current) {
        mapInstance.current.off()
        mapInstance.current.remove()
        mapInstance.current = null
      }

      const map = window.L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 13)
      mapInstance.current = map

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

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
        .addTo(map)
        .bindPopup('<b>You are here</b>')
        .openPopup()

      // Center Markers
      centers.forEach(c => {
        if (c.lat && c.lng) {
          const marker = window.L.marker([c.lat, c.lng]).addTo(map)
          
          const popupContent = `
            <div class="text-[#1A2332] p-1 font-sans">
              <h3 class="font-bold text-sm mb-1">${c.name}</h3>
              <p class="text-xs mb-2 text-[#5C6B7A]">${c.address}</p>
              <a href="https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}" 
                 target="_blank" 
                 class="inline-block px-3 py-1.5 bg-[#1a3569] text-white rounded text-xs font-semibold hover:bg-[#0d1f3c] transition">
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
    <div className="w-full h-full min-h-[300px] bg-gray-50 relative">
      {status !== 'ready' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 text-[#1a3569] p-4 text-center">
           {status === 'locating' && (
            <>
              <div className="w-8 h-8 border-4 border-[#1a3569] border-t-transparent rounded-full animate-spin mb-3 mx-auto" />
              <p className="text-sm font-semibold text-[#1a3569]">📍 Locating you (Please allow access)...</p>
            </>
          )}
          {status === 'loading' && (
            <>
              <div className="w-8 h-8 border-4 border-[#FF6600] border-t-transparent rounded-full animate-spin mb-3 mx-auto" />
              <p className="text-sm font-semibold text-[#1A2332]">🔄 Finding nearby centers...</p>
            </>
          )}
          {status === 'error' && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700 font-semibold mb-1">⚠️ Error</p>
              <p className="text-red-600 text-sm max-w-xs mx-auto">{errorMsg}</p>
              <button 
                onClick={() => setStatus('locating')} 
                className="mt-3 px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-bold transition"
              >
                Retry Location
              </button>
            </div>
          )}
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '300px', backgroundColor: '#f3f4f6' }} />
    </div>
  )
}
