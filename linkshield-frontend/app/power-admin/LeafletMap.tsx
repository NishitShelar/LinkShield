'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Marker {
  name: string
  clicks: number
  coordinates: [number, number]
}

interface LeafletMapProps {
  markers: Marker[]
  maxClicks: number
  onMarkerClick: (countryName: string) => void
  highlightLocation?: [number, number] | null
}

const LeafletMap = ({ markers, maxClicks, onMarkerClick, highlightLocation }: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const highlightMarkerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([20, 0], 2)
    mapInstanceRef.current = map

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Add markers
    markers.forEach(marker => {
      const radius = Math.max(8, Math.min(25, (marker.clicks / maxClicks) * 20))
      const opacity = Math.max(0.3, Math.min(1, (marker.clicks / maxClicks) * 0.7 + 0.3))
      
      const circle = L.circleMarker(marker.coordinates, {
        radius,
        fillColor: '#3b82f6',
        color: '#1d4ed8',
        weight: 2,
        opacity: 1,
        fillOpacity: opacity
      }).addTo(map)

      // Add popup with click information
      circle.bindPopup(`
        <div class="text-center">
          <h3 class="font-bold text-lg">${marker.name}</h3>
          <p class="text-blue-600 font-semibold">${marker.clicks} clicks</p>
          <p class="text-sm text-gray-600">${((marker.clicks / maxClicks) * 100).toFixed(1)}% of total</p>
        </div>
      `)

      // Add click handler
      circle.on('click', () => {
        onMarkerClick(marker.name)
      })

      // Add hover effects
      circle.on('mouseover', function(this: L.CircleMarker) {
        this.setRadius(radius + 3)
        this.setStyle({ fillOpacity: Math.min(1, opacity + 0.2) })
      })

      circle.on('mouseout', function(this: L.CircleMarker) {
        this.setRadius(radius)
        this.setStyle({ fillOpacity: opacity })
      })
    })

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [markers, maxClicks, onMarkerClick])

  // Handle highlighting specific location
  useEffect(() => {
    if (!mapInstanceRef.current || !highlightLocation) return

    const map = mapInstanceRef.current

    // Remove previous highlight marker
    if (highlightMarkerRef.current) {
      map.removeLayer(highlightMarkerRef.current)
      highlightMarkerRef.current = null
    }

    // Add new highlight marker
    const highlightMarker = L.circleMarker(highlightLocation, {
      radius: 12,
      fillColor: '#ef4444',
      color: '#dc2626',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map)

    // Add pulsing animation
    highlightMarker.setStyle({
      fillOpacity: 0.8
    })

    // Add popup for highlighted location
    highlightMarker.bindPopup(`
      <div class="text-center">
        <h3 class="font-bold text-lg text-red-600">📍 Highlighted Location</h3>
        <p class="text-sm text-gray-600">This location was selected from link details</p>
      </div>
    `)

    // Zoom to the highlighted location
    map.setView(highlightLocation, 10)

    // Store reference for cleanup
    highlightMarkerRef.current = highlightMarker

    // Cleanup function
    return () => {
      if (highlightMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(highlightMarkerRef.current)
        highlightMarkerRef.current = null
      }
    }
  }, [highlightLocation])

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96"
      style={{ minHeight: '400px' }}
    />
  )
}

export default LeafletMap 