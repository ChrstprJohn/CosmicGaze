import { useEffect, useRef, useState } from 'react'

export default function PreviewSkeleton({ children }) {
  const host = useRef(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const images = [...host.current.querySelectorAll('img')]
    const update = () => setReady(images.every(image => image.complete))
    images.forEach(image => {
      image.addEventListener('load', update)
      image.addEventListener('error', update)
    })
    update()
    return () => images.forEach(image => {
      image.removeEventListener('load', update)
      image.removeEventListener('error', update)
    })
  }, [host])
  return <div ref={host} className={`preview-media${ready ? ' is-ready' : ''}`} aria-busy={!ready}>
    <div className="preview-media-content">{children}</div>
    {(!ready) && <div className="media-skeleton" aria-hidden="true" />}
  </div>
}
