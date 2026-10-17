export default function LoadingState({ children = 'Opening Cosmicgaze…', page = false, variant = 'image' }) {
  if (page) return <div className="loading-state loading-state-page" role="status" aria-label="Loading Cosmicgaze"><span className="sr-only">{children}</span></div>
  return <div className={`loading-state loading-state-${variant}${page ? ' loading-state-page' : ''}`} role="status" aria-live="polite">
    <div className="loading-skeleton" aria-hidden="true"><span /><span /><span /></div>
    <div className="loading-state-label"><p>{children}</p></div>
  </div>
}
