export default function ResultSkeleton({ label = 'Loading preview…', shape = 'image', overlay = false }) {
  return <div className={`result-skeleton result-skeleton-${shape}${overlay ? ' result-skeleton-overlay' : ''}`} role="status" aria-label={label}>
    <div className="result-skeleton-shape media-skeleton" aria-hidden="true" />
    {shape === 'facts' && <div className="result-skeleton-shape media-skeleton" aria-hidden="true" />}
  </div>
}
