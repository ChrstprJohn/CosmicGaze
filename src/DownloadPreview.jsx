import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, Eye, LoaderCircle, X } from 'lucide-react'
import './download-preview.css'

export default function DownloadPreview({ prepare, filename, label = 'Preview download', title = 'Download preview', disabled = false, className = 'secondary-button' }) {
  const dialog = useRef(null)
  const trigger = useRef(null)
  const request = useRef(0)
  const activeUrl = useRef('')
  const controller = useRef(null)
  const [open, setOpen] = useState(false)
  const [state, setState] = useState({ phase: 'loading' })
  const [imageReady, setImageReady] = useState(false)
  const [dimensions, setDimensions] = useState('')
  const heading = useId()
  function release() {
    request.current++
    controller.current?.abort()
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current)
    activeUrl.current = ''
  }
  useEffect(() => () => { request.current++; controller.current?.abort(); if (activeUrl.current) URL.revokeObjectURL(activeUrl.current) }, [])
  useEffect(() => {
    if (!open) return
    const element = dialog.current
    element.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = previous }
  }, [open])
  useEffect(() => {
    const element = dialog.current
    if (open && element?.open && !element.contains(document.activeElement)) element.querySelector('button')?.focus()
  }, [open, state.phase])
  function close() { release(); dialog.current?.close(); setOpen(false); trigger.current?.focus({ preventScroll: true }) }
  async function preview() {
    release()
    const id = request.current
    controller.current = new AbortController()
    setOpen(true)
    setState({ phase: 'loading' })
    setImageReady(false)
    setDimensions('')
    try {
      const result = await prepare(controller.current.signal)
      const file = typeof result === 'string' ? { url: result, filename } : result
      if (id !== request.current) { if (file?.url) URL.revokeObjectURL(file.url); return }
      if (!file?.url) throw new Error('No image was generated.')
      activeUrl.current = file.url
      setState({ phase: 'ready', ...file, filename: file.filename || filename })
    } catch {
      if (id === request.current) setState({ phase: 'error' })
    }
  }
  return <>
    <button ref={trigger} type="button" className={className} disabled={disabled} aria-haspopup="dialog" onClick={preview}><Eye size={16} aria-hidden="true" /><span>{label}</span></button>
    {open && createPortal(<dialog ref={dialog} className="download-preview" aria-labelledby={heading} onCancel={event => { event.preventDefault(); close() }} onKeyDown={event => {
      if (event.key !== 'Tab') return
      const controls = [...event.currentTarget.querySelectorAll('button:not([disabled]), a[href]')]
      const first = controls[0], last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }} onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close()
    }}>
      <header className="download-preview-header"><div><h2 id={heading}>{title}</h2><p>Check your image before saving it.</p></div><button type="button" className="download-preview-close" aria-label="Close preview" onClick={close} autoFocus><X size={21} aria-hidden="true" /></button></header>
      <div className="download-preview-body" aria-busy={state.phase === 'loading' || (state.phase === 'ready' && !imageReady)}>
        {state.phase === 'loading' && <div className="download-preview-state" role="status"><LoaderCircle className="loading-icon" size={24} aria-hidden="true" /><p>Preparing your preview…</p></div>}
        {state.phase === 'error' && <div className="download-preview-state"><p role="alert">The preview couldn’t load. Please try again.</p><button type="button" className="secondary-button" onClick={preview}>Try again</button></div>}
        {state.phase === 'ready' && !imageReady && <p className="download-preview-loading" role="status">Loading your image…</p>}
        {state.phase === 'ready' && <img src={state.url} alt={title} onLoad={event => { setImageReady(true); setDimensions(`${event.currentTarget.naturalWidth} × ${event.currentTarget.naturalHeight}`) }} onError={() => setState({ phase: 'error' })} />}
      </div>
      <footer className="download-preview-footer"><p className="download-preview-dimensions" aria-live="polite">{dimensions}</p><div><button type="button" className="secondary-button" onClick={close}>Close</button>{state.phase === 'ready' && imageReady ? <a className="primary-button" href={state.url} download={state.filename}><Download size={17} aria-hidden="true" />Download</a> : <button type="button" className="primary-button" disabled><Download size={17} aria-hidden="true" />Download</button>}</div></footer>
    </dialog>, document.body)}
  </>
}
