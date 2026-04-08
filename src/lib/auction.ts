import type { AuctionListing } from '../data/auctionListings'

export type ListingQuadrantFilter = 'ALL' | 'NE' | 'NW' | 'SE' | 'SW'
export type ListingTaxFilter = 'ALL' | 'OWING' | 'CLEAR_OR_CREDIT'
export type ListingAssetFilter =
  | 'ALL'
  | 'Full property'
  | 'Unit'
export type ListingSort = 'item' | 'reserve-desc' | 'tax-desc'

export interface DisplayAuctionListing extends AuctionListing {
  assetType: Exclude<ListingAssetFilter, 'ALL'>
  quadrant: Exclude<ListingQuadrantFilter, 'ALL'>
  taxStatus: 'Tax owing' | 'No tax owing' | 'Credit balance'
  mapLatitude: number
  mapLongitude: number
  googleMapsUrl: string
  searchBlob: string
}

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

function getListingAssetType(address: string): DisplayAuctionListing['assetType'] {
  const unitMatch = address.match(/^#([0-9A-Z]+)/i)

  if (!unitMatch) {
    return 'Full property'
  }

  return 'Unit'
}

function getListingQuadrant(address: string): DisplayAuctionListing['quadrant'] {
  const match = address.match(/\b(NE|NW|SE|SW)\b$/)
  return (match?.[1] as DisplayAuctionListing['quadrant']) ?? 'NE'
}

function getTaxStatus(amount: number): DisplayAuctionListing['taxStatus'] {
  if (amount > 0) {
    return 'Tax owing'
  }

  if (amount < 0) {
    return 'Credit balance'
  }

  return 'No tax owing'
}

function createSearchBlob(listing: AuctionListing) {
  return [
    listing.item,
    listing.rollNumber,
    listing.fullAddress,
    listing.legalDescription,
    getListingAssetType(listing.fullAddress),
    getListingQuadrant(listing.fullAddress),
    getTaxStatus(listing.outstandingTax),
  ]
    .join(' ')
    .toLowerCase()
}

export function decorateListings(
  listings: AuctionListing[],
): DisplayAuctionListing[] {
  const coordinateCounts = new Map<string, number>()

  return listings.map((listing) => {
    const coordinateKey = `${listing.latitude.toFixed(6)}:${listing.longitude.toFixed(6)}`
    const duplicateIndex = coordinateCounts.get(coordinateKey) ?? 0
    coordinateCounts.set(coordinateKey, duplicateIndex + 1)

    const angle = duplicateIndex * 1.3
    const distance = duplicateIndex === 0 ? 0 : 0.00028 + duplicateIndex * 0.00004

    return {
      ...listing,
      assetType: getListingAssetType(listing.fullAddress),
      quadrant: getListingQuadrant(listing.fullAddress),
      taxStatus: getTaxStatus(listing.outstandingTax),
      mapLatitude: listing.latitude + Math.cos(angle) * distance,
      mapLongitude: listing.longitude + Math.sin(angle) * distance,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${listing.fullAddress}, Calgary, Alberta`,
      )}`,
      searchBlob: createSearchBlob(listing),
    }
  })
}

export function sortListings(
  listings: DisplayAuctionListing[],
  sortBy: ListingSort,
) {
  const nextListings = [...listings]

  if (sortBy === 'reserve-desc') {
    nextListings.sort((left, right) => right.reserveBid - left.reserveBid)
    return nextListings
  }

  if (sortBy === 'tax-desc') {
    nextListings.sort(
      (left, right) => right.outstandingTax - left.outstandingTax,
    )
    return nextListings
  }

  nextListings.sort((left, right) => left.item - right.item)
  return nextListings
}

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount)
}

export function formatCompactCurrency(amount: number) {
  return compactCurrencyFormatter.format(amount)
}
