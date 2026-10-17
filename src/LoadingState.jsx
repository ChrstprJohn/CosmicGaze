import { Orbit } from 'lucide-react'

export default function LoadingState({ children = 'Opening Cosmicgaze…', page = false, variant = 'image' }) {
  return <div className={`loading-state loading-state-${variant}${page ? ' loading-state-page' : ''}`} role="status" aria-live="polite">
    {page ? <><Orbit className="loading-logo-mark" size={48} strokeWidth={1.2} aria-hidden="true" /><p className="sr-only">{children}</p></> : <p>{children}</p>}
  </div>
}
