import { useEffect } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import { divIcon, LatLngBounds } from 'leaflet'
import { ExternalLink } from 'lucide-react'
import { formatCurrency, type DisplayAuctionListing } from '../lib/auction'

interface AuctionMapProps {
  listings: DisplayAuctionListing[]
  selectedListing: DisplayAuctionListing | null
  onSelectListing: (listingId: string) => void
}

function createMarkerIcon(selected: boolean) {
  return divIcon({
    className: 'property-marker__wrapper',
    html: `
      <div class="property-marker ${selected ? 'property-marker--selected' : ''}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10.5 12 4l8 6.5V20H15v-5H9v5H4z"></path>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  })
}

function MapViewport({
  listings,
  selectedListing,
}: Pick<AuctionMapProps, 'listings' | 'selectedListing'>) {
  const map = useMap()

  useEffect(() => {
    if (selectedListing) {
      map.flyTo([selectedListing.mapLatitude, selectedListing.mapLongitude], 13.8, {
        animate: true,
        duration: 0.7,
      })
      return
    }

    if (listings.length === 0) {
      map.flyTo([51.0447, -114.0719], 10.7, {
        animate: true,
        duration: 0.7,
      })
      return
    }

    const bounds = new LatLngBounds(
      listings.map((listing) => [listing.mapLatitude, listing.mapLongitude]),
    )

    map.fitBounds(bounds, {
      animate: true,
      duration: 0.7,
      maxZoom: 12.8,
      padding: [48, 48],
    })
  }, [listings, map, selectedListing])

  return null
}

export function AuctionMap({
  listings,
  selectedListing,
  onSelectListing,
}: AuctionMapProps) {
  return (
    <MapContainer
      center={[51.0447, -114.0719]}
      zoom={10.7}
      zoomControl={false}
      scrollWheelZoom
    >
      <ZoomControl position="topleft" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewport listings={listings} selectedListing={selectedListing} />

      {listings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.mapLatitude, listing.mapLongitude]}
          icon={createMarkerIcon(listing.id === selectedListing?.id)}
          eventHandlers={{
            click: () => onSelectListing(listing.id),
          }}
        >
          <Popup>
            <div className="map-popup">
              <p className="map-popup__eyebrow">
                Item {listing.item} · {listing.assetType}
              </p>
              <h3>{listing.fullAddress}</h3>
              <p>{listing.legalDescription}</p>
              <dl>
                <div>
                  <dt>Reserve bid</dt>
                  <dd>{formatCurrency(listing.reserveBid)}</dd>
                </div>
                <div>
                  <dt>Outstanding tax</dt>
                  <dd>{formatCurrency(listing.outstandingTax)}</dd>
                </div>
              </dl>
              <a href={listing.googleMapsUrl} target="_blank" rel="noreferrer">
                <span>Open in Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
