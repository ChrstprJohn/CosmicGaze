import PlanetSkeleton from './PlanetSkeleton.jsx'
import ResultSkeleton from './ResultSkeleton.jsx'

const pages = {
  '/birthday': ['Your birthday. Your picture.', 'image'],
  '/moon': ['Moon phase.', 'moon'],
  '/shuffle': ['Cosmic shuffle.', 'image'],
  '/solar-system': ['Solar System.', 'planet'],
  '/pets': ['Cosmic pets.', 'pets'],
  '/moon-match': ['Moon match.', 'match'],
  '/cosmic-age': ['Your cosmic age.', 'age'],
  '/build-your-planet': ['Build your planet.', 'builder'],
  '/gravity-playground': ['Gravity playground.', 'gravity'],
}

function Bars() {
  return <div className="page-skeleton-bars" aria-hidden="true"><span /><span /><span /></div>
}

export default function PageSkeleton({ path, label }) {
  const [title, kind] = pages[path.replace(/\/$/, '')] || ['Cosmicgaze', 'image']
  const model = ['planet', 'age', 'builder'].includes(kind)
  const previewFirst = model || kind === 'match' || kind === 'gravity'
  return <section className={`page-skeleton page-skeleton-${kind}${previewFirst ? ' page-skeleton-preview-first' : ''}`} aria-busy="true" aria-label={`Loading ${title}`}>
    <div className="page-skeleton-intro">
      <div className="page-skeleton-back" aria-hidden="true" />
      <h1>{title}</h1>
      <p className="page-skeleton-label" role="status">{label}</p>
    </div>
    {kind === 'pets' ? <div className="page-skeleton-gallery" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div key={index}><div className="page-skeleton-pet media-skeleton" /><Bars /></div>)}</div> : <>
      <div className="page-skeleton-controls" aria-hidden="true"><Bars /><div className="skeleton-control" /><Bars /><div className="skeleton-control" /></div>
      <div className="page-skeleton-result">
        {model ? <div className="planet-stage"><PlanetSkeleton rings={kind !== 'age'} decorative={kind === 'age'} label={label} /></div>
          : kind === 'moon' ? <div className="page-skeleton-moon-stage"><ResultSkeleton shape="round" overlay label={label} /></div>
          : kind === 'match' ? <div className="page-skeleton-moons">{[0, 1].map(index => <div key={index}><ResultSkeleton shape="round" overlay label={label} /></div>)}</div>
          : kind === 'gravity' ? <div className="page-skeleton-gravity" aria-hidden="true"><span /><span /></div>
          : <div className="page-skeleton-image media-skeleton" aria-hidden="true" />}
        <Bars />
      </div>
    </>}
  </section>
}
