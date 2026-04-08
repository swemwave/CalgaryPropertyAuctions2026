import { Eye, Landmark, MapPin, Scale } from 'lucide-react'
import { formatCurrency, type DisplayAuctionListing } from '../lib/auction'

interface ListingCardProps {
  listing: DisplayAuctionListing
  selected: boolean
  onSelect: () => void
  onOpenDetails: () => void
}

export function ListingCard({
  listing,
  selected,
  onSelect,
  onOpenDetails,
}: ListingCardProps) {
  return (
    <article
      className={`listing-card ${selected ? 'listing-card--selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <p className="listing-card__eyebrow">Full Address</p>
      <h3>{listing.fullAddress}</h3>

      <div className="listing-card__tags">
        <span>{listing.assetType}</span>
        <span>{listing.taxStatus}</span>
        <span>{listing.quadrant}</span>
      </div>

      <dl className="listing-card__meta">
        <div>
          <dt>Item</dt>
          <dd>{listing.item}</dd>
        </div>
        <div>
          <dt>Roll Number</dt>
          <dd>{listing.rollNumber}</dd>
        </div>
      </dl>

      <div className="listing-card__info">
        <MapPin size={16} />
        <div>
          <p>Municipal Address</p>
          <strong>{listing.fullAddress}</strong>
        </div>
      </div>

      <div className="listing-card__info">
        <Scale size={16} />
        <div>
          <p>Legal Description</p>
          <strong>{listing.legalDescription}</strong>
        </div>
      </div>

      <div className="listing-card__money-grid">
        <div>
          <p>Outstanding Tax</p>
          <strong
            className={
              listing.outstandingTax > 0
                ? 'listing-card__tax listing-card__tax--danger'
                : 'listing-card__tax'
            }
          >
            {formatCurrency(listing.outstandingTax)}
          </strong>
        </div>
        <div>
          <p>Reserve Bid</p>
          <strong>{formatCurrency(listing.reserveBid)}</strong>
        </div>
      </div>

      <div className="listing-card__footnote">
        <Landmark size={15} />
        <span>Approximate map pin based on the civic address.</span>
      </div>

      <button
        className="listing-card__cta"
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onOpenDetails()
        }}
      >
        <Eye size={18} />
        <span>View Full Details</span>
      </button>
    </article>
  )
}
