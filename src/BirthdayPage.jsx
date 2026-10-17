import { ImageResultSkeleton } from './PageSkeleton.jsx'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, LoaderCircle, Orbit, Shuffle, Telescope } from 'lucide-react'
import axios from 'axios'
import { fetchApod } from './lib/apod.js'
import { ARCHIVE_START, nasaToday, validateDate } from './lib/dates.js'
import BirthdayImage from './BirthdayImage.jsx'
import DatePicker from './DatePicker.jsx'
import { imageIdentity, nextDiscovery, prepareDiscoveryImage } from './lib/shuffle.js'

function EmptyPreview({ loading = false }) {
  if (loading) return <div aria-busy="true"><span className="sr-only" role="status">Loading NASA’s picture…</span><div inert aria-hidden="true"><ImageResultSkeleton /></div></div>
  return (
    <div className="empty-preview" role={loading ? 'status' : undefined}>
      {loading ? <LoaderCircle className="loading-icon" size={32} strokeWidth={1.5} aria-hidden="true" /> : <Orbit size={40} strokeWidth={1} aria-hidden="true" />}<p>{loading ? 'Loading NASA’s picture' : 'Choose a date'}</p>
    </div>
  )
}

function VideoResult({ entry }) {
  return (
    <div className="video-result">
      {entry.mediaType === 'video' && entry.video ? <iframe className="result-video" src={entry.video} title={entry.title} allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <Telescope size={40} strokeWidth={1.2} aria-hidden="true" />}
      <p className="media-note">{entry.mediaType === 'video' ? 'This date features a video.' : 'The image preview is unavailable for this date.'}</p>
    </div>
  )
}

export default function BirthdayPage() {
  const request = useRef(null)
  const [today] = useState(nasaToday)
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [imageStatus, setImageStatus] = useState('loading')
  const [shuffling, setShuffling] = useState(false)
  const seenDates = useRef(new Set([today]))
  const seenImages = useRef(new Set())
  const busy = loading || Boolean(result?.mediaType === 'image' && result.image && imageStatus === 'loading')
  useEffect(() => {
    if (!result) return
    seenDates.current.add(result.date)
    if (result.image) seenImages.current.add(imageIdentity(result.image))
  }, [result])
  useEffect(() => {
    const controller = new AbortController()
    request.current = controller
    fetchApod(today, controller.signal).then((entry) => {
      if (!controller.signal.aborted) setResult(entry)
    }).catch((issue) => {
      if (!axios.isCancel(issue) && !controller.signal.aborted) setError(issue.message)
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => { controller.abort(); request.current?.abort() }
  }, [today])

  async function discover(selectedDate) {
    setShuffling(false)
    setDate(selectedDate)
    request.current?.abort()
    const validation = validateDate(selectedDate, today)
    if (validation) { setError(validation); setLoading(false); return }
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setImageStatus('loading')
    setError('')
    try {
      const entry = await fetchApod(selectedDate, controller.signal)
      if (!controller.signal.aborted) {
        setResult(entry)

      }
    } catch (issue) {
      if (!axios.isCancel(issue) && !controller.signal.aborted) setError(issue.message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  async function shufflePicture() {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setShuffling(true)
    setError('')
    try {
      const entry = await nextDiscovery({ fetchEntry: fetchApod, prepareImage: prepareDiscoveryImage, seenDates: seenDates.current, seenImages: seenImages.current, signal: controller.signal, today })
      if (!controller.signal.aborted) {
        setImageStatus('loading')
        setDate(entry.date)
        setResult(entry)
      }
    } catch (issue) {
      if (!controller.signal.aborted) setError(issue.message?.replace('Press Surprise me', 'Press Shuffle picture') || 'Couldn’t find a picture. Shuffle again to retry.')
    } finally {
      if (!controller.signal.aborted) { setLoading(false); setShuffling(false) }
    }
  }

  return (
    <section className="birthday-workspace" aria-labelledby="birthday-title">
      <div className="birthday-controls">
        <a className="back-link" href="/#services"><ArrowLeft size={20} aria-hidden="true" /> Back</a>
        <h1 id="birthday-title">Your birthday.<br /><em>Your picture.</em></h1>
        <p className="birthday-description">Choose your birthday or any date to see NASA’s Astronomy Picture of the Day. Some dates feature videos.</p>
        <div id="birthday" className="birthday-form" aria-busy={loading}>
          <label htmlFor="birthdate">Birthday or date</label>
          <DatePicker id="birthdate" name="birthdate" label="Birthday or date" min={ARCHIVE_START} max={today} today={today} value={date} onChange={discover} describedBy={error ? 'date-help lookup-error' : 'date-help'} invalid={Boolean(error)} />
          <p id="date-help" className="date-help">Available from June 16, 1995.</p>
          <button className="secondary-button birthday-shuffle" type="button" disabled={busy} onClick={shufflePicture}>{shuffling ? <LoaderCircle className="loading-icon" size={18} aria-hidden="true" /> : <Shuffle size={18} aria-hidden="true" />}{shuffling ? 'Finding a picture…' : 'Shuffle picture'}</button>
          {error && <p id="lookup-error" className="form-error" role="alert">{error}</p>}
          <p className="date-help" role="status">{loading ? shuffling ? 'Finding a different picture from NASA’s archive…' : 'Looking up NASA’s picture for your selected date…' : ''}</p>
        </div>
      </div>

      <div className="image-workspace" role="region" aria-label="NASA archive preview" tabIndex={-1} aria-busy={busy}>
        {loading ? <EmptyPreview loading /> : result ? <>
          {result.mediaType === 'image' && result.image ? <BirthdayImage key={result.date} entry={result} onStatusChange={setImageStatus} /> : <VideoResult entry={result} />}
          {result.credit && <div className="result-attribution"><p className="image-credit">{result.credit}</p></div>}
        </> : <EmptyPreview loading={loading} />}
      </div>
    </section>
  )
}
