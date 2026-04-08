import { useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { formatCurrency, type DisplayAuctionListing } from '../lib/auction'

interface ListingDetailsDialogProps {
  listing: DisplayAuctionListing | null
  onClose: () => void
}

export function ListingDetailsDialog({
  listing,
  onClose,
}: ListingDetailsDialogProps) {
  useEffect(() => {
    if (!listing) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [listing, onClose])

  if (!listing) {
    return null
  }

  return (
    <div
      className="details-dialog"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="details-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-dialog-title"
      >
        <div className="details-dialog__header">
          <div>
            <p className="eyebrow">Auction listing</p>
            <h2 id="details-dialog-title">{listing.fullAddress}</h2>
            <p>
              Item {listing.item} - Roll {listing.rollNumber} - {listing.assetType}
            </p>
          </div>

          <div className="details-dialog__header-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Close details"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="details-dialog__content">
          <div className="details-dialog__grid">
            <article className="details-card">
              <span>Legal description</span>
              <strong>{listing.legalDescription}</strong>
            </article>
            <article className="details-card">
              <span>Outstanding tax</span>
              <strong>{formatCurrency(listing.outstandingTax)}</strong>
            </article>
            <article className="details-card">
              <span>Reserve bid</span>
              <strong>{formatCurrency(listing.reserveBid)}</strong>
            </article>
          </div>

          <div className="details-dialog__footer">
            <div className="details-dialog__footer-copy">
              <p>Public auction: Thursday, April 23, 2026 at 10:00 AM, Municipal Building, 800 Macleod Trail S.E., Calgary.</p>
            </div>

            <a
              className="primary-action"
              href={listing.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>Open in Google Maps</span>
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
