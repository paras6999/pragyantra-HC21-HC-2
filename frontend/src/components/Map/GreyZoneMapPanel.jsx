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
    <div className="mt-4 p-5 rounded-xl bg-white border border-amber-200 shadow-sm relative overflow-hidden">
      {/* Decorative top strip */}
      <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />

      <div className="flex items-center gap-2 mb-4 mt-1">
        <span className="text-xl">🟡</span>
        <h3 className="text-lg font-bold text-[#1a3569]">Missing Documents Action Plan</h3>
      </div>

      <p className="text-sm text-[#5C6B7A] mb-5">
        You need these documents to become eligible. Select a document to see where to get it nearby.
      </p>

      {/* Doc Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 border-b border-gray-100">
        {docDetails.map(doc => {
          const isSelected = selectedDoc?.key === doc.key
          return (
            <button
              key={doc.key}
              onClick={() => setSelectedDoc(doc)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isSelected
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm'
                  : 'bg-gray-50 text-[#5C6B7A] border border-gray-200 hover:bg-gray-100 hover:text-[#1a3569]'
                }`}
            >
              {doc.icon} {doc.name}
            </button>
          )
        })}
      </div>

      {selectedDoc && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Steps & Info */}
          <div>
            <h4 className="text-[#1a3569] font-bold mb-3 flex items-center gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
              <span>📍</span> Go to: {selectedDoc.where_to_get}
            </h4>

            <div className="space-y-3 mb-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <span className="text-[#1a3569] font-bold block text-xs uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Steps to Follow</span>
                <ol className="list-decimal pl-4 space-y-1.5 text-[#5C6B7A] text-sm">
                  {selectedDoc.steps?.map((step, i) => (
                    <li key={i} className="pl-1">{step}</li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#EEF2FF] border border-[#1a3569]/20 rounded-lg p-3 text-center">
                  <span className="text-[#5C6B7A] font-bold block text-xs uppercase tracking-wider mb-1">Time</span>
                  <span className="text-[#1a3569] font-semibold text-sm">{selectedDoc.estimated_days}</span>
                </div>
                <div className="bg-[#FFFBEB] border border-amber-200 rounded-lg p-3 text-center">
                  <span className="text-[#92400e] font-bold block text-xs uppercase tracking-wider mb-1">Cost</span>
                  <span className="text-[#b45309] font-semibold text-sm">{selectedDoc.cost}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex flex-col">
            <span className="text-[#1a3569] font-bold block text-xs uppercase tracking-wider mb-2">🗺️ Nearby Centers</span>
            <div className="flex-1 min-h-[250px] relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <NearbyMap docType={selectedDoc.osm_search_term || 'government_office'} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
