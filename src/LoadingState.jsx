import { lazy, Suspense } from 'react'
import PlanetSkeleton from './PlanetSkeleton.jsx'

// Start discovery placeholders alongside their route, without downloading the
// full collection of workspace layouts on the homepage.
const initialSkeleton = window.location.pathname !== '/' ? import('./PageSkeleton.jsx') : null
const PageSkeleton = lazy(() => initialSkeleton || import('./PageSkeleton.jsx'))

export default function LoadingState({ children = 'Opening Cosmicgaze…', page = false, variant = 'image', decorative = false, rings = false }) {
  if (page) return <Suspense fallback={<div className="loading-state loading-state-page" role="status"><p>{children}</p></div>}><PageSkeleton path={window.location.pathname} label={children} /></Suspense>
  if (variant === 'planet') return <div className="planet-viewer planet-viewer-loading" aria-busy="true">
    {!decorative && <p className="planet-rotation-hint">{children}</p>}
    <div className="planet-stage"><PlanetSkeleton decorative={decorative} rings={rings} label={children} /></div>
    {!decorative && <div className="planet-view-controls" aria-hidden="true"><span className="skeleton-control" /></div>}
  </div>
  return <div className={`loading-state loading-state-${variant}${page ? ' loading-state-page' : ''}`} role="status" aria-live="polite">
    <div className="loading-skeleton" aria-hidden="true"><span /><span /><span /></div>
    <div className="loading-state-label"><p>{children}</p></div>
  </div>
}
