"use client"

import { useState, useEffect } from "react"
import { OfficersService, PoliceOfficer, IncidentMapOfficer, CrimeLocation } from "@/app/services/officers"
import { useToast } from "@/components/ui/use-toast"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { User, AlertTriangle, Shield, Crosshair } from "lucide-react"

// Fix leaflet's default icon issue in Next.js
if (typeof window !== 'undefined' && L.Icon.Default) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  })
}

interface OfficerMapProps {
  showControls?: boolean
}

export function OfficerMap({ showControls = false }: OfficerMapProps) {
  const [officers, setOfficers] = useState<PoliceOfficer[]>([])
  const [incidentOfficers, setIncidentOfficers] = useState<IncidentMapOfficer[]>([])
  const [crimeLocations, setCrimeLocations] = useState<CrimeLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (showControls) {
          const data = await OfficersService.getAvailableOfficers()
          setOfficers(data)
        } else {
          const data = await OfficersService.getIncidentMap()
          setIncidentOfficers(data.active_officers)
          setCrimeLocations(data.crime_locations)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load map data",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [showControls, toast])

  const center: [number, number] = [-2.5489, 118.0149]

  // Custom icons for incidents
  const getIncidentIcon = (type: string) => {
    const color = type === "knife" ? "#ef4444" : type === "gun" ? "#0ea5e9" : "#f59e42"
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color === "#ef4444" ? "red" : color === "#0ea5e9" ? "blue" : "orange"}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      shadowSize: [41, 41],
    })
  }

  return (
    <div className="relative h-[350px] w-full overflow-hidden rounded-xl border shadow-md bg-white">
      <MapContainer center={center} zoom={5} scrollWheelZoom className="h-full w-full z-0 rounded-xl">
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showControls
          ? officers.map((officer) => (
              <Marker
                key={officer.id}
                position={[officer.location.latitude, officer.location.longitude]}
              >
                <Popup className="rounded-lg shadow-md p-2">
                  <div className="font-semibold mb-1 flex items-center gap-1">
                    <User className="inline h-4 w-4 text-blue-600" /> {officer.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{officer.office_name}</div>
                  <div className="text-xs text-muted-foreground">Phone: {officer.phone}</div>
                  <div className="text-xs text-muted-foreground">Status: {officer.status}</div>
                  <div className="text-xs text-muted-foreground">
                    Lat: {officer.location.latitude}, Lng: {officer.location.longitude}
                  </div>
                </Popup>
              </Marker>
            ))
          : <>
              {crimeLocations.map((incident) => (
                <Marker
                  key={incident.id}
                  position={[incident.coordinates.latitude, incident.coordinates.longitude]}
                  icon={getIncidentIcon(incident.incident_type)}
                >
                  <Popup className="rounded-lg shadow-md p-2">
                    <div className="font-semibold mb-1 flex items-center gap-1">
                      {incident.incident_type === "knife" ? <AlertTriangle className="inline h-4 w-4 text-red-600" /> : incident.incident_type === "gun" ? <Shield className="inline h-4 w-4 text-blue-600" /> : <Crosshair className="inline h-4 w-4 text-orange-600" />} {incident.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{incident.location}</div>
                    <div className="text-xs text-muted-foreground">Type: {incident.incident_type}</div>
                    <div className="text-xs text-muted-foreground">Status: {incident.status}</div>
                    <div className="text-xs text-muted-foreground">Source: {incident.source}{incident.cctv_name ? ` (${incident.cctv_name})` : ""}</div>
                    <div className="text-xs text-muted-foreground">Created: {new Date(incident.created_at).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      Lat: {incident.coordinates.latitude}, Lng: {incident.coordinates.longitude}
                    </div>
                  </Popup>
                </Marker>
              ))}
              {incidentOfficers.map((officer) => (
                <Marker
                  key={officer.id}
                  position={[officer.coordinates.latitude, officer.coordinates.longitude]}
                >
                  <Popup className="rounded-lg shadow-md p-2">
                    <div className="font-semibold mb-1 flex items-center gap-1">
                      <User className="inline h-4 w-4 text-blue-600" /> {officer.name}
                    </div>
                    <div className="text-xs text-muted-foreground">Status: {officer.status}</div>
                    <div className="text-xs text-muted-foreground">Assigned: {officer.assigned_to || "-"}</div>
                    <div className="text-xs text-muted-foreground">ETA: {officer.estimated_arrival || "-"}</div>
                    <div className="text-xs text-muted-foreground">
                      Lat: {officer.coordinates.latitude}, Lng: {officer.coordinates.longitude}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
        }
      </MapContainer>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <span className="text-muted-foreground">Loading map...</span>
        </div>
      )}
    </div>
  )
}
