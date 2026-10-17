import { LoaderCircle } from 'lucide-react'

export default function LoadingState({ children = 'Opening Cosmicgaze…', page = false, variant = 'image' }) {
  return <div className={`loading-state loading-state-${variant}${page ? ' loading-state-page' : ''}`} role="status" aria-live="polite">
    <div className="loading-skeleton" aria-hidden="true"><span /><span /><span /></div>
    <div className="loading-state-label"><LoaderCircle className="loading-icon" size={20} strokeWidth={1.5} aria-hidden="true" /><p>{children}</p></div>
  </div>
}
