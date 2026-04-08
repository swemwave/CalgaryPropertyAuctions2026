import type {
  ListingAssetFilter,
  ListingQuadrantFilter,
  ListingSort,
  ListingTaxFilter,
} from '../lib/auction'

interface FiltersPanelProps {
  open: boolean
  quadrantFilter: ListingQuadrantFilter
  taxFilter: ListingTaxFilter
  assetFilter: ListingAssetFilter
  sortBy: ListingSort
  onQuadrantChange: (value: ListingQuadrantFilter) => void
  onTaxChange: (value: ListingTaxFilter) => void
  onAssetChange: (value: ListingAssetFilter) => void
  onSortChange: (value: ListingSort) => void
  onReset: () => void
}

const quadrantOptions: ListingQuadrantFilter[] = ['ALL', 'NE', 'NW', 'SE', 'SW']
const taxOptions: ListingTaxFilter[] = ['ALL', 'OWING', 'CLEAR_OR_CREDIT']
const assetOptions: ListingAssetFilter[] = [
  'ALL',
  'Full property',
  'Unit',
]

function formatTaxFilterLabel(value: ListingTaxFilter) {
  if (value === 'ALL') {
    return 'All tax statuses'
  }

  if (value === 'OWING') {
    return 'Tax owing'
  }

  return 'Clear or credit'
}

export function FiltersPanel({
  open,
  quadrantFilter,
  taxFilter,
  assetFilter,
  sortBy,
  onQuadrantChange,
  onTaxChange,
  onAssetChange,
  onSortChange,
  onReset,
}: FiltersPanelProps) {
  return (
    <section
      id="filter-panel"
      className={`filters-panel ${open ? 'filters-panel--open' : ''}`}
      aria-hidden={!open}
    >
      <div className="filters-panel__top-row">
        <div className="filter-group">
          <p>Quadrant</p>
          <div className="filter-chip-row">
            {quadrantOptions.map((option) => (
              <button
                key={option}
                className={`filter-chip ${quadrantFilter === option ? 'filter-chip--active' : ''}`}
                type="button"
                onClick={() => onQuadrantChange(option)}
              >
                {option === 'ALL' ? 'All Calgary' : option}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <p>Tax status</p>
          <div className="filter-chip-row">
            {taxOptions.map((option) => (
              <button
                key={option}
                className={`filter-chip ${taxFilter === option ? 'filter-chip--active' : ''}`}
                type="button"
                onClick={() => onTaxChange(option)}
              >
                {formatTaxFilterLabel(option)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <p>Asset type</p>
          <div className="filter-chip-row">
            {assetOptions.map((option) => (
              <button
                key={option}
                className={`filter-chip ${assetFilter === option ? 'filter-chip--active' : ''}`}
                type="button"
                onClick={() => onAssetChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-group filter-group--sort">
        <p>Sort results</p>
        <label className="sort-shell">
          <span className="sr-only">Sort listings</span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as ListingSort)}
          >
            <option value="item">Auction item order</option>
            <option value="reserve-desc">Highest reserve bid</option>
            <option value="tax-desc">Highest tax owing</option>
          </select>
        </label>
      </div>

      <button className="reset-button" type="button" onClick={onReset}>
        Reset filters
      </button>
    </section>
  )
}
