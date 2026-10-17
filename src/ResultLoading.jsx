export default function ResultLoading({ label = 'Loading preview…', overlay = false }) {
  return <p className={`result-loading${overlay ? ' result-loading-overlay' : ''}`} role="status">{label}</p>
}
