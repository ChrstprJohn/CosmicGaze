"""Build the dedicated Cosmicgaze Hyperframes film from fresh site captures."""
from pathlib import Path
import json

out = Path(__file__).resolve().parent
plan = '''# Brag plan: Cosmicgaze

## Planning rubric
1. Cosmicgaze is an interactive astronomy website for exploring dates, Moons, planets, and imaginative worlds.
2. Strongest promise: “Your place among the stars.”
3. Visual hook: the real galaxy homepage inside a floating, perspective browser.
4. Actual UI: homepage, Moon match before/after, cosmic age Jupiter/Saturn, Solar System Saturn/Earth, planet builder and mobile Moon match.
5. Shortest satisfying cut: 22 seconds at 1920×1080, 30 fps.
6. Tone: polished, with cinematic depth. A premium product film dedicated to Cosmicgaze.
7. Audio: original warm ambient bed with quiet UI clicks and restrained reveal accents. No narration requested.
8. Share caption: Cosmicgaze. Your place among the stars. Explore your birthday Moons, your age on other worlds, and the Solar System.
9. Flow: enter Moon match → combine the phases; open cosmic age → choose Saturn; explore Solar System → switch to Earth.

## Identity
Midnight #070b17, lavender #c9c1f0, warm foreground #f3f0e9, secondary #b5bbd0. Instrument Serif display and DM Sans interface, self-hosted. Actual captured pages retain their exact UI. Synthetic demonstration birthdays only; no visitor information or analytics appears.

## Storyboard
- 0–3.4s: Hook. “Your place among the stars.” A large authentic homepage browser pivots into view beneath the headline, then pushes forward. Cosmicgaze is visible throughout.
- 3.4–8.3s: “Two birthdays. One Moon?” A browser enters from the right. Cursor moves to Combine our Moons, clicks at 5.8s, and the captured combined result appears. Hold the result for 1.9s. Soft UI click.
- 8.3–12.8s: “Your age. On other worlds.” Browser lands on the left, copy on the right. Cursor selects Saturn at 10.5s. The actual planetary age result changes from Jupiter to Saturn. Quiet click; hold to read.
- 12.8–17.8s: “Eight worlds. Get a little closer.” Wide browser becomes the primary subject. Select Earth at 15s; actual Saturn UI changes to Earth. Slow camera approach and quiet click.
- 17.8–22s: Cosmicgaze lockup. Homepage browser, planet-builder browser, and mobile Moon match fan into a depth composition. “Your place among the stars.” Brand and “Made by dcd” remain readable through the final frame. Best poster chosen at 20.5s.

Transitions: quick directional handoffs, eased camera rotations, deliberate settled holds. No rapid text flashes. Scene durations total 3.4 + 4.9 + 4.5 + 5 + 4.2 = 22s.

## Music cue guidance
Original score generated locally, with authored bell accents at the reveal (3.4s), Moon interaction (5.8s), and finale (17.8s). These are composition cues, not claimed detected beats. Natural reading time takes priority. Per-frame bands extracted using the Hyperframes creative helper drive a restrained background light. SFX: Kenney CC0 click2 and impactSoft_medium_001, low high-frequency risk. Sparse mixing with final fade.
'''
(out/'brag-plan.md').write_text(plan, encoding='utf8')
(out/'composition-brief.md').write_text('''# Cosmicgaze composition brief
Create a dedicated 22-second premium browser-mockup film, landscape 1920×1080 at 30fps. Follow brag-plan.md. Show the current real pages in composition/assets/screens, with explicit before/after interactions. Preserve midnight, lavender, Instrument Serif and DM Sans. Camera movement should feel like a crafted product launch: one strong subject at a time, clear text holds, depth from perspective and rotation. The final ensemble features real desktop and phone layouts. No voiceover. Original local music, three UI clicks, and two subdued impacts. Audio-reactive light uses extracted bands. The composition is deterministic and has one paused GSAP timeline registered as cosmicgaze. Run Hyperframes check before rendering locally; choose a settled poster and bake it into frame zero. The user explicitly requested generation and replacement of the homepage video.
''',encoding='utf8')
(out/'share-copy.txt').write_text('Cosmicgaze. Your place among the stars. Explore your birthday Moons, your age on other worlds, and the Solar System.\n',encoding='utf8')

def browser(id, image, after=None, cls='', url=''):
    second = f'<img id="{id}-after" class="after" src="assets/screens/{after}.png" alt="Updated Cosmicgaze page after selection">' if after else ''
    return f'<div id="{id}" class="browser {cls}"><div class="chrome"><span class="dots"><i></i><i></i><i></i></span><span class="address">cosmicgaze{url}</span><span class="chrome-mark">✧</span></div><div class="viewport"><img src="assets/screens/{image}.png" alt="Cosmicgaze {image} page">{second}</div></div>'

def cursor(id):
    return f'<svg id="{id}" class="cursor" viewBox="0 0 32 40" aria-hidden="true"><path d="M3 2v31l9-8 6 12 6-3-6-12h11Z" fill="#f3f0e9" stroke="#070b17" stroke-width="2"/></svg><div id="{id}-tap" class="tap" aria-hidden="true"></div>'

html = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><title>Cosmicgaze — Your place among the stars</title>
<script src="assets/gsap.min.js"></script><script src="assets/audio-data.js"></script>
<style>
@font-face{font-family:'Instrument Serif';src:url('assets/fonts/instrument-serif-latin-400-normal.woff2')}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url('assets/fonts/instrument-serif-latin-400-italic.woff2')}
@font-face{font-family:'DM Sans';font-weight:400;src:url('assets/fonts/dm-sans-latin-400-normal.woff2')}
@font-face{font-family:'DM Sans';font-weight:500;src:url('assets/fonts/dm-sans-latin-500-normal.woff2')}
*{box-sizing:border-box}html,body{margin:0;background:#070b17;color:#f3f0e9;font-family:'DM Sans',sans-serif}#root{position:relative;width:100%;height:100%;overflow:hidden;background:#070b17}
.clip,.scene{position:absolute;inset:0}.scene{perspective:2200px}.brand{position:absolute;left:90px;top:52px;display:flex;align-items:center;gap:14px;font-size:34px;letter-spacing:-.025em;z-index:10}.brand svg{width:34px;height:34px;color:#c9c1f0}.top-note{position:absolute;right:90px;top:62px;font-size:20px;color:#b5bbd0;z-index:10}
.light{position:absolute;left:450px;top:200px;width:1250px;height:750px;background:radial-gradient(ellipse,#51436e66,transparent 68%);opacity:.55;pointer-events:none}.orbit{position:absolute;left:140px;top:80px;width:1640px;height:920px;border:1px solid #c9c1f022;border-radius:50%;pointer-events:none}
.browser{position:absolute;border:1px solid #5e6280;border-radius:16px;overflow:hidden;background:#101528;box-shadow:20px 44px 80px #02040acc;transform-style:preserve-3d}.chrome{height:42px;display:flex;align-items:center;padding:0 17px;background:#171c2d;border-bottom:1px solid #343a50;position:relative}.dots{display:flex;gap:7px}.dots i{width:7px;height:7px;border-radius:50%;background:#666c85}.address{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#c2c6d8;font-size:15px}.chrome-mark{margin-left:auto;color:#c9c1f0;font-size:21px}.viewport{position:relative;aspect-ratio:1440/900;overflow:hidden;background:#070b17}.viewport img{display:block;width:100%;height:100%;object-fit:contain}.viewport .after{position:absolute;inset:0;opacity:0}
h1,h2,p{margin:0}h1,h2{font-family:'Instrument Serif',serif;font-weight:400;letter-spacing:-.025em;line-height:1.06}em{font-weight:400;color:#c9c1f0}.copy{position:absolute;width:580px}.copy h2{font-size:98px}.copy p{font-size:25px;line-height:1.5;color:#b5bbd0;margin-top:26px}.line{display:block}
#hook-title{position:absolute;left:90px;top:154px;font-size:94px;max-width:1750px}#hook-browser{left:385px;top:285px;width:1150px}
#match-copy{left:90px;top:370px;width:500px}#match-browser{left:650px;top:215px;width:1160px}
#age-browser{left:98px;top:215px;width:1160px}#age-copy{left:1330px;top:362px;width:510px}
#solar-title{position:absolute;left:90px;top:152px;font-size:78px}#solar-browser{left:360px;top:260px;width:1200px}
.cursor{position:absolute;width:32px;height:40px;z-index:7;opacity:0;filter:drop-shadow(2px 4px 3px #02040a99)}.tap{position:absolute;width:46px;height:46px;border:2px solid #c9c1f0;border-radius:50%;z-index:6;opacity:0}
#final-title{position:absolute;left:90px;top:160px;font-size:108px}#final-home{left:100px;top:350px;width:980px;z-index:2}#final-builder{left:1070px;top:278px;width:730px;z-index:1}#final-phone{position:absolute;left:1150px;top:510px;width:230px;padding:9px;border:2px solid #72718d;border-radius:30px;background:#121626;box-shadow:12px 24px 45px #02040acc;z-index:3}#final-phone img{display:block;width:100%;border-radius:21px}#final-credit{position:absolute;left:90px;bottom:52px;color:#b5bbd0;font-size:22px}#final-tagline{position:absolute;right:90px;bottom:52px;color:#c9c1f0;font-size:24px}
</style></head><body><div id="root" data-composition-id="cosmicgaze" data-width="1920" data-height="1080" data-start="0" data-duration="22">
<div id="light" class="light" aria-hidden="true"></div><div id="orbit" class="orbit" aria-hidden="true"></div>
<div class="brand"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="16" cy="16" r="4"/><ellipse cx="16" cy="16" rx="14" ry="7" transform="rotate(-35 16 16)"/><circle cx="26" cy="8" r="2" fill="#c9c1f0"/></svg><span>cosmicgaze</span></div><div class="top-note">Your place among the stars.</div>
'''
html += '<section id="scene-hook" class="clip" data-start="0" data-duration="3.4" data-track-index="1"><div class="scene"><h1 id="hook-title">Your place <em>among the stars.</em></h1>'+browser('hook-browser','home')+'</div></section>'
html += '<section id="scene-moon-match" class="clip" data-start="3.4" data-duration="4.9" data-track-index="1"><div class="scene"><div id="match-copy" class="copy"><h2><span class="line">Two birthdays.</span><em class="line">One Moon?</em></h2><p>See how your birthday<br>Moons fit together.</p></div>'+browser('match-browser','match-before','match-after',url='/moon-match')+cursor('match-cursor')+'</div></section>'
html += '<section id="scene-cosmic-age" class="clip" data-start="8.3" data-duration="4.5" data-track-index="1"><div class="scene">'+browser('age-browser','age-jupiter','age-saturn',url='/cosmic-age')+'<div id="age-copy" class="copy"><h2><span class="line">Your age.</span><em class="line">On other</em><em class="line">worlds.</em></h2><p>Your next birthday,<br>a little further away.</p></div>'+cursor('age-cursor')+'</div></section>'
html += '<section id="scene-solar-system" class="clip" data-start="12.8" data-duration="5" data-track-index="1"><div class="scene"><h2 id="solar-title">Eight worlds. <em>Get a little closer.</em></h2>'+browser('solar-browser','saturn','earth',url='/solar-system')+cursor('solar-cursor')+'</div></section>'
html += '<section id="scene-finale" class="clip" data-start="17.8" data-duration="4.2" data-track-index="1"><div class="scene"><h2 id="final-title">Meet <em>cosmicgaze.</em></h2>'+browser('final-home','home')+browser('final-builder','builder',url='/build-your-planet')+'<div id="final-phone"><img src="assets/screens/phone-match.png" alt="Cosmicgaze Moon match on mobile"></div><p id="final-credit">Made by dcd</p><p id="final-tagline">Explore astronomy, planets, and a little imagination.</p></div></section>'
html += '<audio id="music" src="assets/music/cosmicgaze-ambient.wav" data-start="0" data-duration="22" data-track-index="10" data-volume="0.7" data-fade-in="0.5" data-fade-out="1.4"></audio>'
for i,t in enumerate([5.8,10.5,15.0]):
    html += f'<audio id="click-{i}" src="assets/sfx/click2.ogg" data-start="{t}" data-duration="0.06" data-track-index="{11+i}" data-volume="0.25"></audio>'
for i,t in enumerate([3.4,17.8]):
    html += f'<audio id="impact-{i}" src="assets/sfx/impactSoft_medium_001.ogg" data-start="{t}" data-duration="0.18" data-track-index="{15+i}" data-volume="0.2"></audio>'
html += '''</div><script>
const tl=gsap.timeline({paused:true});
tl.fromTo('#orbit',{rotation:-12,scale:1},{rotation:9,scale:1.08,duration:22,ease:'none'},0);
// Pre-extracted music bands modulate the existing lavender light, with seek-safe per-frame tweens.
for(let f=0;f<AUDIO_DATA.frames.length;f++){const energy=AUDIO_DATA.frames[f].bands[0];tl.to('#light',{opacity:.38+energy*.26,duration:1/30,ease:'none'},f/30)}
function arrive(sel,at,from){tl.fromTo(sel,from,{opacity:1,x:0,y:0,scale:1,rotationX:0,rotationY:0,rotation:0,duration:.85,ease:'expo.out',immediateRender:false},at)}
function copy(sel,at){tl.fromTo(sel,{opacity:0,y:24},{opacity:1,y:0,duration:.55,ease:'power3.out',immediateRender:false},at)}
function exit(selectors,at){tl.to(selectors,{opacity:0,y:-22,duration:.22,ease:'power2.in'},at)}
copy('#hook-title',.05);arrive('#hook-browser',.12,{opacity:0,y:90,scale:.91,rotationX:8,rotationY:-8});tl.to('#hook-browser',{scale:1.035,y:-18,duration:2.25,ease:'none'},1);exit(['#hook-title','#hook-browser'],3.18);
arrive('#match-browser',3.4,{opacity:0,x:130,rotationY:-13,rotationX:3});copy('#match-copy',3.6);
arrive('#age-browser',8.3,{opacity:0,x:-130,rotationY:12,rotationX:2});copy('#age-copy',8.5);
copy('#solar-title',12.85);arrive('#solar-browser',12.8,{opacity:0,y:85,scale:.93,rotationX:8});tl.to('#solar-browser',{scale:1.025,duration:3.9,ease:'none'},13.7);
function interact(id,after,t,start,end){tl.set('#'+id,{x:start[0],y:start[1],opacity:0},0);tl.to('#'+id,{opacity:1,duration:.15},t-.8);tl.to('#'+id,{x:end[0],y:end[1],duration:.6,ease:'power2.inOut'},t-.65);tl.fromTo('#'+id+'-tap',{x:end[0]-12,y:end[1]-12,scale:.5,opacity:.7},{scale:1.8,opacity:0,duration:.45,immediateRender:false},t);tl.to('#'+after,{opacity:1,duration:.38,ease:'power2.out'},t+.06);tl.to('#'+id,{opacity:0,duration:.2},t+.5)}
// Authored music cue: the soft Moon selection accent lands at 5.8s.
interact('match-cursor','match-browser-after',5.8,[1150,710],[1391,945]);
interact('age-cursor','age-browser-after',10.5,[660,650],[271,852]);
interact('solar-cursor','solar-browser-after',15,[920,760],[622,719]);
exit(['#match-browser','#match-copy','#match-cursor'],8.08);exit(['#age-browser','#age-copy','#age-cursor'],12.58);exit(['#solar-browser','#solar-title','#solar-cursor'],17.58);
copy('#final-title',17.85);arrive('#final-builder',17.8,{opacity:0,x:120,y:-40,rotationY:-12});arrive('#final-home',17.95,{opacity:0,x:-80,y:70,rotationY:9});arrive('#final-phone',18.18,{opacity:0,y:110,rotation:8});copy('#final-credit',18.5);copy('#final-tagline',18.55);
tl.to('#final-home',{y:-14,duration:2.9,ease:'sine.inOut'},18.9);tl.to('#final-builder',{y:12,duration:3.2,ease:'sine.inOut'},18.7);
window.__timelines=window.__timelines||{};window.__timelines.cosmicgaze=tl;
</script></body></html>'''
# Body copy uses natural wrapping instead of forced line breaks.
html=html.replace('birthday<br>Moons','birthday Moons').replace('birthday,<br>a','birthday, a')
(out/'composition/index.html').write_text(html,encoding='utf8')
(out/'composition/hyperframes.json').write_text(json.dumps({'name':'cosmicgaze-showcase','skill':'brag','fps':30}),encoding='utf8')
(out/'composition/design.md').write_text('# Cosmicgaze film\nMidnight #070b17, lavender #c9c1f0, warm text #f3f0e9, secondary #b5bbd0. Instrument Serif regular/italic and DM Sans. Premium browser mockups using authentic pages; readable holds; restrained depth and motion.\n',encoding='utf8')
print(out)
