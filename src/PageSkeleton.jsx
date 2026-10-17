import { ArrowLeft, ArrowUpRight, CalendarDays, ChevronDown, Download, Hand, Minus, Plus, RotateCcw, Shuffle, SlidersHorizontal, Pause, Play, Combine } from 'lucide-react'
import DiscoveryLayout from './DiscoveryLayout.jsx'
import PlanetSkeleton from './PlanetSkeleton.jsx'
import ResultSkeleton from './ResultSkeleton.jsx'
import { PLANETS, findPlanet } from './lib/planets.js'
import { PETS } from './lib/pets.js'
import { WORLD_PALETTES } from './lib/world-builder.js'
import { formatDate, nasaToday } from './lib/dates.js'
import './date-picker.css'
import './moon-view.css'
import './moon-match.css'
import './pets.css'
import './playgrounds.css'
import './page-skeleton.css'

// Preserve the real text metrics and wrapping; only its paint changes.
const Ink = ({ children }) => <i className="skeleton-ink">{children}</i>
const Back = () => <a className="back-link"><ArrowLeft size={20} /><Ink>Back</Ink></a>
const Label = ({ children }) => <label><Ink>{children}</Ink></label>
function Button({ children, icon: Icon = Download, className = 'secondary-button' }) {
  return <button type="button" className={className}><Icon size={16} /><Ink>{children}</Ink></button>
}
function DateField({ date = '2000-01-01' }) {
  return <div className="date-picker"><button className="date-trigger" type="button"><CalendarDays size={19} /><span><Ink>{formatDate(date)}</Ink></span><ChevronDown size={16} /></button></div>
}
function DownloadCard({ children }) {
  return <div className="art-download-wrap"><Button>{children.replace(/^Download/, 'Preview')}</Button></div>
}
function Worlds({ planet = 'jupiter', solar = false, names }) {
  return <div className={solar ? 'planet-list' : 'world-selector'}>{(names || PLANETS).map(item => {
    const name = typeof item === 'string' ? item : item.name
    return <button type="button" key={name} className={solar ? 'planet-choice' : undefined} aria-pressed={item.id === planet}>{!names && <span className="planet-thumbnail skeleton-thumbnail" />}<Ink>{name}</Ink></button>
  })}</div>
}
function Model({ decorative = false, rings = false, customize = 'Customize' }) {
  return <div className={`planet-viewer${!decorative ? ' planet-viewer-customizable' : ''}`}>
    {!decorative && <p className="planet-rotation-hint"><Hand size={18} /><Ink>Drag or swipe the planet to rotate</Ink></p>}
    <div className={`planet-stage${decorative ? ' planet-stage-decorative' : ''}`}><PlanetSkeleton decorative={decorative} rings={rings} /></div>
    {!decorative && <div className="planet-view-controls"><a className="planet-customize-link"><SlidersHorizontal size={15} /><Ink>{customize}</Ink><ChevronDown size={14} /></a><p className="planet-drag-hint"><Ink>Scroll or pinch to zoom</Ink></p><div className="planet-control-buttons">{[Minus, Plus, RotateCcw].map((Icon, i) => <button type="button" key={i}><Icon size={17} /></button>)}</div></div>}
  </div>
}
function MoonDisc() {
  return <div className="moon-stage"><canvas className="moon-canvas" width="480" height="480" /><ResultSkeleton shape="round" overlay /></div>
}
function MoonShell() {
  const date = new Date().toLocaleDateString('en-CA')
  return <section className="moon-workspace sticky-moon-title">
    <div className="moon-controls"><Back /><h1><Ink>Moon</Ink> <em><Ink>phase.</Ink></em></h1><p className="moon-description"><Ink>A familiar world. A moment that’s yours.</Ink></p><div className="moon-form"><Label>Choose your date</Label><DateField date={date} /><p className="date-help"><Ink>Choose any day from 1900 to 2100.</Ink></p></div></div>
    <div className="moon-result"><figure className="moon-figure"><MoonDisc /><figcaption><p className="result-date"><Ink>{formatDate(date)}</Ink></p><h2><Ink>First quarter</Ink></h2><p className="moon-illumination"><Ink>48.5% illuminated</Ink></p></figcaption></figure><DownloadCard>Download my Moon card</DownloadCard><p className="moon-reference"><Ink>Phase visualization · 12:00 UTC · Simplified north-up view</Ink></p><div className="moon-sources"><a><Ink>Astronomy Engine</Ink><ArrowUpRight size={12} /></a><a><Ink>Surface texture</Ink><ArrowUpRight size={12} /></a></div></div>
  </section>
}
export function ImageResultSkeleton({ shuffle = false }) {
  return <><figure className={shuffle ? 'shuffle-figure' : 'birthday-image'}>
    <div className={shuffle ? 'shuffle-image-stage' : 'birthday-image-stage'}><svg className={shuffle ? 'shuffle-image' : 'original-image'} viewBox={shuffle ? '0 0 1000 1008' : '0 0 500 460'} aria-hidden="true"><rect width="100%" height="100%" fill="#151c30" /></svg></div>
    {shuffle ? <figcaption className="shuffle-details"><p className="result-date"><Ink>January 1, 2024</Ink></p><h2><Ink>NGC 1232: A Grand Design Spiral Galaxy</Ink></h2></figcaption> : <div className="image-details"><figcaption><p className="result-date"><Ink>{formatDate(nasaToday())}</Ink></p><h2><Ink>NASA’s Astronomy Picture of the Day</Ink></h2></figcaption><Button className="image-download">Preview download</Button></div>}
  </figure>{shuffle && <div className="shuffle-download"><Button className="image-download">Preview download</Button></div>}<div className={`result-attribution${shuffle ? ' shuffle-attribution' : ''}`}><p className="image-credit"><Ink>Image credit and source · NASA Astronomy Picture of the Day</Ink></p></div></>
}
function ImageShell({ shuffle = false }) {
  return <section className={shuffle ? 'shuffle-workspace' : 'birthday-workspace'}><div className={shuffle ? 'shuffle-controls' : 'birthday-controls'}><Back />
    {shuffle ? <><h1><Ink>Cosmic</Ink> <em><Ink>shuffle.</Ink></em></h1><p className="shuffle-description"><Ink>Let the universe surprise you.</Ink></p><Button className="primary-button lookup-button shuffle-button" icon={Shuffle}>Surprise me</Button></> : <><h1><Ink>Your birthday.</Ink><br /><em><Ink>Your picture.</Ink></em></h1><p className="birthday-description"><Ink>Choose your birthday or any date to see NASA’s Astronomy Picture of the Day. Some dates feature videos.</Ink></p><div className="birthday-form"><Label>Birthday or date</Label><DateField date={nasaToday()} /><p className="date-help"><Ink>Available from June 16, 1995.</Ink></p><Button className="secondary-button birthday-shuffle" icon={Shuffle}>Shuffle picture</Button></div></>}
  </div><div className={shuffle ? 'shuffle-result' : 'image-workspace'}><ImageResultSkeleton shuffle={shuffle} /></div></section>
}
function AgeShell() {
  return <DiscoveryLayout mobilePreview controlsTitle={<Ink>Find your cosmic age</Ink>} id="cosmic-age" title={<Ink>Your cosmic</Ink>} emphasis={<Ink>age.</Ink>} description={<Ink>Your age and next birthday on other worlds.</Ink>} controls={<><Label>Your birthday</Label><DateField /><p className="control-label"><Ink>Choose a world</Ink></p><Worlds /></>}>
    <div className="mobile-preview age-preview"><div className="age-planet"><Model decorative /></div><div className="age-caption"><p className="age-number"><Ink>2.26</Ink> <span><Ink>Jupiter years</Ink></span></p></div></div>
    <div className="age-caption age-details"><p><Ink>Next birthday: July 29, 2035</Ink></p><p className="age-countdown"><Ink>Turning 3 in about 3,206 Earth days.</Ink></p></div><div className="age-download"><DownloadCard>Download my cosmic age</DownloadCard></div>
  </DiscoveryLayout>
}
function MatchShell() {
  return <DiscoveryLayout mobilePreview controlsTitle={<Ink>Choose your birthdays</Ink>} id="moon-match" title={<Ink>Two birthdays.</Ink>} emphasis={<Ink>One Moon?</Ink>} description={<Ink>See how your birthday Moons fit together.</Ink>} controls={<><Label>Your birthday</Label><DateField date="2005-09-05" /><Label>Their birthday</Label><DateField date="2006-05-15" /><p className="discovery-note"><Ink>For fun. Moon phases don’t measure compatibility.</Ink></p></>}>
    <div className="mobile-preview match-preview"><div className="moon-match-visual">{['Your Moon · September 5, 2005', 'Their Moon · May 15, 2006'].map((date, i) => <figure className="match-moon" key={date}><div className="skeleton-match-disc"><canvas width="480" height="480" /><ResultSkeleton shape="round" overlay /></div><figcaption><span><Ink>{date}</Ink></span><h2><Ink>{i ? 'Waning gibbous' : 'Waxing crescent'}</Ink></h2><p><Ink>{i ? '94%' : '3%'} illuminated</Ink></p></figcaption></figure>)}</div><p className="match-score"><Ink>97%</Ink> <span><Ink>full-Moon fit</Ink></span></p></div>
    <div className="match-summary"><p><Ink>Nearly a full Moon, with little overlap.</Ink></p><p className="discovery-note"><Ink>Fit counts light from exactly one phase. Gaps and overlap lower the score.</Ink></p></div><div className="match-actions"><Button className="primary-button" icon={Combine}>Combine our Moons</Button><DownloadCard>Download our Moon card</DownloadCard></div>
  </DiscoveryLayout>
}
function Slider({ children, value, note }) {
  return <label><Ink>{children}</Ink><output><Ink>{value}</Ink></output><input type="range" readOnly value="50" />{note && <span className="discovery-note"><Ink>{note}</Ink></span>}</label>
}
function BuilderControls() {
  return <><Label>Name your world</Label><div className="text-field"><Ink>Asteria</Ink></div>
    <fieldset className="playground-fieldset"><legend><Ink>Choose the terrain</Ink></legend><Worlds names={['Oceans', 'Rocky', 'Gas bands']} /></fieldset>
    <fieldset className="playground-fieldset"><legend><Ink>Choose the colors</Ink></legend><div className="palette-selector">{WORLD_PALETTES.map(palette => <button type="button" key={palette.id}><span className="palette-colors skeleton-thumbnail" /><Ink>{palette.name}</Ink></button>)}</div><div className="world-custom-colors">{['Ocean / dark', 'Land / midtone', 'Peaks / light'].map(text => <label key={text}><span className="skeleton-color-input" /><Ink>{text}</Ink></label>)}</div></fieldset>
    <fieldset className="playground-fieldset world-sliders"><legend><Ink>Shape the surface</Ink></legend><Slider value="54%" note="Approximate coverage; varies with the landscape.">Ocean coverage</Slider><Slider value="3 / 6">Terrain detail</Slider><Slider value="0%">Polar ice size</Slider><Button icon={Shuffle}>New landscape</Button></fieldset>
    {['Add rings', 'Add clouds'].map(text => <label className="check-control" key={text}><input type="checkbox" readOnly checked /><Ink>{text}</Ink></label>)}
    <div className="world-sliders"><Slider value="65%">Cloud thickness</Slider><Slider value="22°">Planet tilt</Slider></div><p className="discovery-note"><Ink>This world comes from your imagination. Every landscape is generated here on your device.</Ink></p><p className="discovery-note"><a><Ink>Cloud and ring textures · Solar System Scope · CC BY 4.0</Ink><ArrowUpRight size={12} /></a></p>
  </>
}
function BuilderShell() {
  return <DiscoveryLayout mobilePreview controlsTitle={<Ink>Customize your planet</Ink>} id="world-builder" title={<Ink>Build your</Ink>} emphasis={<Ink>planet.</Ink>} description={<Ink>Shape an imaginary planet. Give it a name. Keep it as a card.</Ink>} controls={<BuilderControls />}>
    <div className="builder-preview mobile-preview"><div className="builder-planet"><Model rings /></div><div className="art-caption"><h2><Ink>Asteria</Ink></h2><p><Ink>Oceans and continents · Ringed · Clouded</Ink></p></div></div><div className="builder-actions"><div className="button-row"><Button icon={Shuffle}>Surprise me</Button><Button icon={RotateCcw}>Start over</Button></div><DownloadCard>Download my planet card</DownloadCard></div>
  </DiscoveryLayout>
}
function SolarShell() {
  const planet = findPlanet(new URLSearchParams(window.location.search).get('planet'))
  return <section className="solar-workspace mobile-workspace sticky-preview-title"><aside className="planet-sidebar"><div className="planet-mobile-intro"><Back /><div className="planet-introduction"><h1><Ink>{planet.name}</Ink></h1><p className="planet-subtitle"><Ink>{planet.subtitle}</Ink></p><p className="planet-description"><Ink>{planet.description}</Ink></p></div></div><div className="planet-selection"><p className="planet-selector-label"><Ink>Choose your planet</Ink></p><Worlds planet={planet.id} solar /></div></aside>
    <article className="planet-showcase mobile-preview"><Model rings={planet.id === 'saturn'} customize="Choose a planet" /></article><section className="planet-details"><dl className="planet-facts">{[['Equatorial diameter', planet.diameter], ['One rotation', planet.rotation], ['One year', planet.year], ['Planet type', planet.type]].map(([label, value]) => <div key={label}><dt><Ink>{label}</Ink></dt><dd><Ink>{value}</Ink></dd></div>)}</dl><details className="planet-story"><summary><Ink>About {planet.name}</Ink><ChevronDown size={16} /></summary></details><div className="planet-sources"><div><a><Ink>Textures: Solar System Scope · CC BY 4.0</Ink><ArrowUpRight size={12} /></a></div></div></section>
  </section>
}
function PetsShell() {
  return <section className="pets-page"><div className="pets-intro"><Back /><div className="pets-heading-row"><div><h1><Ink>Cosmic</Ink> <em><Ink>pets.</Ink></em></h1><p><Ink>Meet your little collection of cosmic companions.</Ink></p></div><Button className="pets-pause" icon={Pause}>Pause eyes</Button></div></div><div className="pets-gallery">{PETS.map(pet => <figure className="cosmic-pet" key={pet.id}><div className="pet-portrait"><div className="media-skeleton" /></div><figcaption><h2><Ink>{pet.name}</Ink></h2><p><Ink>{pet.description}</Ink></p><div className="pet-card-actions"><Button className="pet-download">Preview</Button></div></figcaption></figure>)}</div><p className="pets-hint"><Ink>Move your mouse. You have their attention.</Ink></p></section>
}
function GravityShell() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return <DiscoveryLayout mobilePreview controlsTitle={<Ink>Set up your jump</Ink>} id="gravity" title={<Ink>Gravity</Ink>} emphasis={<Ink>playground.</Ink>} description={<Ink>Compare the same jump on different worlds.</Ink>} controls={<><Label>Your mass (kg)</Label><div className="text-field"><Ink>70</Ink></div><fieldset className="playground-fieldset"><legend><Ink>Choose a world</Ink></legend><Worlds names={['Earth', 'Moon', 'Mars', 'Mercury', 'Venus', 'Pluto']} /></fieldset><Label>Your jump on Earth · 40 cm</Label><input type="range" className="sky-time-slider" readOnly value="40" /><div className="button-row"><Button icon={Play}>{reduced ? 'Show jump heights' : 'Try the jump'}</Button><Button icon={Pause}>Pause</Button><Button icon={RotateCcw}>Reset</Button></div><p className="discovery-note"><Ink>Same takeoff speed. Constant gravity, no air resistance.</Ink></p></>}>
    <div className="mobile-preview gravity-preview"><svg className="gravity-stage" viewBox="0 0 700 430">{[70, 160, 250].map(y => <g key={y}><rect x="30" y={y - 8} width="42" height="16" rx="4" fill="#252d45" /><path d={`M90 ${y}H650`} stroke="#282e44" strokeDasharray="3 8" /></g>)}<path d="M90 340H650M250 302V340M510 70V340" fill="none" stroke="#3f4664" />{[250, 510].map(x => <g key={x}><circle cx={x} cy="340" r="13" fill="#252d45" /><rect x={x - 33} y="357" width="66" height="30" rx="6" fill="#252d45" /><rect x={x - 54} y="398" width="108" height="16" rx="4" fill="#1c233a" /></g>)}</svg><p className="gravity-status"><Ink>{reduced ? 'Peak heights shown. Reduced motion is on.' : 'Ready to jump.'}</Ink></p></div>
    <div className="gravity-results"><h2><Ink>On Moon</Ink></h2><dl className="space-facts">{[['Your weight force', '112.0', 'N'], ['Earth-scale equivalent', '11.4', 'kg'], ['Jump height', '2.45', 'm'], ['Time in the air', '3.50', 's']].map(([label, value, unit]) => <div key={label}><dt><Ink>{label}</Ink></dt><dd><Ink>{value}</Ink> <span><Ink>{unit}</Ink></span></dd></div>)}</dl><p className="discovery-note"><Ink>Earth-scale reading. Your mass stays 70 kg.</Ink></p></div>
  </DiscoveryLayout>
}
const shells = { '/moon': MoonShell, '/birthday': ImageShell, '/moon-match': MatchShell, '/cosmic-age': AgeShell, '/build-your-planet': BuilderShell, '/solar-system': SolarShell, '/pets': PetsShell, '/gravity-playground': GravityShell }
export default function PageSkeleton({ path, label }) {
  const Shell = shells[path.replace(/\/$/, '')] || ImageShell
  return <div className="page-skeleton" aria-busy="true"><span className="sr-only" role="status">{label}</span><div inert aria-hidden="true">{path === '/shuffle' ? <ImageShell shuffle /> : <Shell />}</div></div>
}
