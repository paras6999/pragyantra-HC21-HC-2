import { useState, useEffect } from 'react'
import NearbyMap from './NearbyMap'

export default function GreyZoneMapPanel({ missingDocs = [] }) {
  const [docDetails, setDocDetails] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)

  useEffect(() => {
    // Fetch guidance for all missing docs
    const fetchGuidance = async () => {
      const details = []
      for (const docKey of missingDocs) {
        try {
          const res = await fetch(`/api/document_guidance/${docKey}`)
          if (res.ok) {
            const data = await res.json()
            details.push({ key: docKey, ...data })
          }
        } catch (e) {
          console.error("Failed to fetch guidance for", docKey)
        }
      }
      setDocDetails(details)
      if (details.length > 0) setSelectedDoc(details[0])
    }

    if (missingDocs.length > 0) {
      fetchGuidance()
    }
  }, [missingDocs])

  if (missingDocs.length === 0) return null

  return (
    <div className="mt-4 p-5 rounded-2xl glass-dark border border-yellow-500/30">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🟡</span>
        <h3 className="text-lg font-bold text-yellow-100">Missing Documents Action Plan</h3>
      </div>
      
      <p className="text-sm text-white/70 mb-4">
        You need these documents to become eligible. Select a document to see where to get it nearby.
      </p>

      {/* Doc Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-2">
        {docDetails.map(doc => (
          <button
            key={doc.key}
            onClick={() => setSelectedDoc(doc)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedDoc?.key === doc.key 
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' 
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
            }`}
          >
            {doc.icon} {doc.name}
          </button>
        ))}
      </div>

      {selectedDoc && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Steps & Info */}
          <div>
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
              <span>📍</span> Go to: {selectedDoc.where_to_get}
            </h4>
            
            <div className="space-y-2 mb-4">
              <div className="bg-black/30 rounded-lg p-3 text-sm">
                <span className="text-white/40 block text-xs uppercase tracking-wider mb-1">Steps</span>
                <ol className="list-decimal pl-4 space-y-1 text-white/80">
                  {selectedDoc.steps?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 rounded-lg p-3 text-sm">
                  <span className="text-white/40 block text-xs uppercase tracking-wider">Time</span>
                  <span className="text-white/90">{selectedDoc.estimated_days}</span>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-sm">
                  <span className="text-white/40 block text-xs uppercase tracking-wider">Cost</span>
                  <span className="text-white/90">{selectedDoc.cost}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <span className="text-white/40 block text-xs uppercase tracking-wider mb-2">Nearby Centers</span>
            <NearbyMap docType={selectedDoc.osm_search_term || 'government_office'} />
          </div>
        </div>
      )}
    </div>
  )
}
