import { useDeferredValue, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { AuctionMap } from './components/AuctionMap'
import { FiltersPanel } from './components/FiltersPanel'
import { ListingCard } from './components/ListingCard'
import { ListingDetailsDialog } from './components/ListingDetailsDialog'
import { auctionListings } from './data/auctionListings'
import {
  decorateListings,
  formatCompactCurrency,
  sortListings,
  type ListingAssetFilter,
  type ListingQuadrantFilter,
  type ListingSort,
  type ListingTaxFilter,
} from './lib/auction'
import './App.css'

const allListings = decorateListings(auctionListings)
const auctionDateLabel = 'Thursday, April 23, 2026'
const auctionTimeLabel = '10:00 AM'
const auctionVenueLabel = 'Municipal Building, 800 Macleod Trail S.E.'

export function App() {
  const [query, setQuery] = useState('')
  const [quadrantFilter, setQuadrantFilter] =
    useState<ListingQuadrantFilter>('ALL')
  const [taxFilter, setTaxFilter] = useState<ListingTaxFilter>('ALL')
  const [assetFilter, setAssetFilter] = useState<ListingAssetFilter>('ALL')
  const [sortBy, setSortBy] = useState<ListingSort>('item')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(allListings[0]?.id ?? '')
  const [detailId, setDetailId] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  const filteredListings = sortListings(
    allListings.filter((listing) => {
      const matchesQuery =
        deferredQuery.length === 0 ||
        listing.searchBlob.includes(deferredQuery)
      const matchesQuadrant =
        quadrantFilter === 'ALL' || listing.quadrant === quadrantFilter
      const matchesTax =
        taxFilter === 'ALL' ||
        (taxFilter === 'OWING' && listing.taxStatus === 'Tax owing') ||
        (taxFilter === 'CLEAR_OR_CREDIT' &&
          listing.taxStatus !== 'Tax owing')
      const matchesAsset =
        assetFilter === 'ALL' || listing.assetType === assetFilter

      return matchesQuery && matchesQuadrant && matchesTax && matchesAsset
    }),
    sortBy,
  )

  const activeSelectedId = filteredListings.some(
    (listing) => listing.id === selectedId,
  )
    ? selectedId
    : (filteredListings[0]?.id ?? '')
  const selectedListing =
    filteredListings.find((listing) => listing.id === activeSelectedId) ??
    filteredListings[0] ??
    null

  const detailListing =
    allListings.find((listing) => listing.id === detailId) ?? null

  const totalReserve = filteredListings.reduce(
    (sum, listing) => sum + listing.reserveBid,
    0,
  )
  const totalOutstandingTax = filteredListings.reduce(
    (sum, listing) => sum + Math.max(listing.outstandingTax, 0),
    0,
  )
  const taxOwingCount = filteredListings.filter(
    (listing) => listing.outstandingTax > 0,
  ).length
  const activeFiltersCount =
    Number(quadrantFilter !== 'ALL') +
    Number(taxFilter !== 'ALL') +
    Number(assetFilter !== 'ALL') +
    Number(sortBy !== 'item')

  function handleResetFilters() {
    setQuery('')
    setQuadrantFilter('ALL')
    setTaxFilter('ALL')
    setAssetFilter('ALL')
    setSortBy('item')
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              CA
            </div>
            <div>
              <p className="brand-name">Calgary Auctions</p>
              <p className="brand-subtitle">Tax Property Investments</p>
            </div>
          </div>
        </div>

        <label className="search-shell" aria-label="Search auction listings">
          <Search className="search-shell__icon" size={18} />
          <input
            type="search"
            placeholder="Search by address, roll number, legal description, or quadrant"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="topbar-actions">
          <button
            className="filter-button"
            type="button"
            onClick={() => setFiltersOpen((isOpen) => !isOpen)}
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
            {activeFiltersCount > 0 ? (
              <span className="filter-badge">{activeFiltersCount}</span>
            ) : null}
          </button>
        </div>
      </header>

      <FiltersPanel
        open={filtersOpen}
        quadrantFilter={quadrantFilter}
        taxFilter={taxFilter}
        assetFilter={assetFilter}
        sortBy={sortBy}
        onQuadrantChange={setQuadrantFilter}
        onTaxChange={setTaxFilter}
        onAssetChange={setAssetFilter}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
      />

      <section className="workspace">
        <aside className="results-rail">
          <div className="results-rail__summary">
            <div className="results-rail__heading results-rail__heading--compact">
              <div className="results-rail__title-group">
                <p className="eyebrow">Calgary auction list</p>
              </div>
              <div className="results-count-pill">
                {filteredListings.length} properties
              </div>
            </div>

            <div className="summary-grid summary-grid--compact">
              <article className="summary-card">
                <span>Reserve</span>
                <strong>{formatCompactCurrency(totalReserve)}</strong>
              </article>
              <article className="summary-card">
                <span>Tax owing</span>
                <strong>{formatCompactCurrency(totalOutstandingTax)}</strong>
              </article>
              <article className="summary-card">
                <span>Listings owing</span>
                <strong>{taxOwingCount}</strong>
              </article>
            </div>

          </div>

          {filteredListings.length > 0 ? (
            <div className="results-list">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  selected={listing.id === activeSelectedId}
                  onSelect={() => setSelectedId(listing.id)}
                  onOpenDetails={() => setDetailId(listing.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="eyebrow">No matches</p>
              <h2>Nothing matches the current search or filter set.</h2>
              <p>
                Reset the filters to return to the full April 7, 2026 auction
                inventory.
              </p>
              <button
                className="secondary-action"
                type="button"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
          )}
        </aside>

        <section className="map-panel">
          <div className="map-panel__header">
            <div>
              <p className="eyebrow">Map-first workspace</p>
              <h2>Scan Calgary by location before you drill into the PDF data.</h2>
            </div>
            <div className="auction-chip">
              <span>{auctionDateLabel}</span>
              <strong>{auctionTimeLabel}</strong>
              <small>{auctionVenueLabel}</small>
            </div>
          </div>

          <div className="map-shell">
            <AuctionMap
              listings={filteredListings}
              selectedListing={selectedListing}
              onSelectListing={setSelectedId}
            />
          </div>
        </section>
      </section>

      <ListingDetailsDialog
        listing={detailListing}
        onClose={() => setDetailId(null)}
      />
    </main>
  )
}
