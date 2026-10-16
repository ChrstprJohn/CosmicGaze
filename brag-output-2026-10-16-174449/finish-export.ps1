$ErrorActionPreference='Stop'
$filmRoot=$PSScriptRoot
$repoRoot=Split-Path $filmRoot -Parent
$ffmpeg=Join-Path $repoRoot 'brag-output/tooling/render-tools/node_modules/ffmpeg-static/ffmpeg.exe'
& $ffmpeg -v error -y -ss 20.5 -i "$filmRoot/brag.raw.mp4" -frames:v 1 -q:v 2 "$filmRoot/brag.jpg"
if($LASTEXITCODE -ne 0){throw 'Poster extraction failed'}
& $ffmpeg -v error -y -i "$filmRoot/brag.raw.mp4" -i "$filmRoot/brag.jpg" -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" -map '[v]' -map '0:a?' -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -af 'loudnorm=I=-23:TP=-2:LRA=7' -c:a aac -b:a 192k -ar 48000 -t 22 -movflags +faststart "$filmRoot/brag.mp4"
if($LASTEXITCODE -ne 0){throw 'Final encoding failed'}
& $ffmpeg -v error -y -i "$filmRoot/brag.mp4" -an -c:v copy -movflags +faststart "$filmRoot/cosmicgaze-showcase-muted.mp4"
if($LASTEXITCODE -ne 0){throw 'Muted export failed'}
Copy-Item -LiteralPath "$filmRoot/cosmicgaze-showcase-muted.mp4" -Destination "$repoRoot/public/cosmicgaze-showcase.mp4"
& $ffmpeg -v error -y -i "$filmRoot/brag.jpg" -vf scale=960:540 -c:v libwebp -quality 86 "$repoRoot/public/previews/cosmicgaze-showcase.webp"
if($LASTEXITCODE -ne 0){throw 'Web poster failed'}
Write-Output 'Final film, muted website video, and poster exported.'
