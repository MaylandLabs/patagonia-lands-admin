import { useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function SearchControl({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  const map = useMap()

  useEffect(() => {
    const provider = new OpenStreetMapProvider()
    const searchControl = GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      searchLabel: 'Buscar ubicacion...',
      retainZoomLevel: false,
      autoClose: true,
    })

    map.addControl(searchControl)

    map.on('geosearch/showlocation', (e: any) => {
      onChange(e.location.y, e.location.x)
    })

    return () => {
      map.removeControl(searchControl)
    }
  }, [map, onChange])

  return null
}

function FlyToMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  const fly = useCallback(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 8))
  }, [lat, lng, map])
  fly()
  return null
}

interface MapPickerProps {
  latitude: number | null | undefined
  longitude: number | null | undefined
  onChange: (lat: number, lng: number) => void
}

const DEFAULT_CENTER: [number, number] = [-46.0, -69.0]
const DEFAULT_ZOOM = 5

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const hasMarker = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)

  return (
    <div className="border rounded-md overflow-hidden" style={{ height: 400 }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satelite">
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <SearchControl onChange={onChange} />
        <ClickHandler onChange={onChange} />
        {hasMarker && (
          <>
            <Marker position={[latitude, longitude]} icon={icon} />
            <FlyToMarker lat={latitude} lng={longitude} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
