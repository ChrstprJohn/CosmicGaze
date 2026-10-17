import ResultLoading from './ResultLoading.jsx'
import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import OriginalImageDownload from './OriginalImageDownload.jsx'
import { formatDate } from './lib/dates.js'
import { imagePreviewSources, imagePreviewUrl } from './lib/image-preview.js'

export default function BirthdayImage({ entry, onStatusChange }) {
  const [imageStatus, setImageStatus] = useState('loading')
  const [retry, setRetry] = useState(0)
  useEffect(() => { onStatusChange?.(imageStatus) }, [imageStatus, onStatusChange])


  return (
    <figure className="birthday-image" aria-busy={imageStatus === 'loading'}>
      <div className="birthday-image-stage">
        {imageStatus === 'error' ? <div className="image-fallback"><p>The preview couldn’t load.</p><button type="button" className="image-download" onClick={() => { setImageStatus('loading'); setRetry((value) => value + 1) }}>Try again</button><a href={entry.image} target="_blank" rel="noreferrer">Open original image <ArrowUpRight size={14} aria-hidden="true" /></a></div> : <img key={retry} className={`original-image${imageStatus === 'loading' ? ' is-loading' : ''}`} src={imagePreviewUrl(entry.image, 800)} srcSet={imagePreviewSources(entry.image)} sizes="(max-width: 767px) min(480px, calc(100vw - 48px)), (max-width: 1440px) 45vw, 640px" alt={entry.alt} decoding="async" fetchPriority="high" onLoad={() => setImageStatus('ready')} onError={() => setImageStatus('error')} />}
        {imageStatus === 'loading' && <ResultLoading label="Loading NASA’s picture…" overlay />}
      </div>
      <div className="image-details">
        <figcaption><p className="result-date">{formatDate(entry.date)}</p><h2>{entry.title}</h2></figcaption>
        <OriginalImageDownload key={entry.image} entry={entry} />
      </div>
    </figure>
  )
}
