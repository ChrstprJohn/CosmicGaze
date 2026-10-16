$ErrorActionPreference = 'Stop'
$filmRoot = $PSScriptRoot
$repoRoot = Split-Path $filmRoot -Parent
$ffmpeg = Join-Path $repoRoot 'brag-output/tooling/render-tools/node_modules/ffmpeg-static/ffmpeg.exe'
$ffprobeDir = Join-Path $repoRoot 'brag-output/tooling/render-tools/node_modules/ffprobe-static/bin/win32/x64'
$cli = Join-Path $repoRoot 'brag-output/tooling/npm-cache/_npx/702923228c2ce1e6/node_modules/hyperframes/bin/hyperframes.mjs'
$env:PATH = (Split-Path $ffmpeg -Parent) + ';' + $ffprobeDir + ';' + $env:PATH
$env:HYPERFRAMES_BROWSER_PATH = 'C:\Users\picar\AppData\Local\ms-playwright\chromium_headless_shell-1228\chrome-headless-shell-win64\chrome-headless-shell.exe'
& node $cli check (Join-Path $filmRoot 'composition')
if ($LASTEXITCODE -ne 0) { throw 'Composition check failed' }
& node $cli render (Join-Path $filmRoot 'composition') --workers 1 --fps 30 --quality delivery --output (Join-Path $filmRoot 'brag.raw.mp4')
if ($LASTEXITCODE -ne 0) { throw 'Render failed' }
& $ffmpeg -v error -y -ss 20.5 -i (Join-Path $filmRoot 'brag.raw.mp4') -frames:v 1 -q:v 2 (Join-Path $filmRoot 'brag.jpg')
if ($LASTEXITCODE -ne 0) { throw 'Poster extraction failed' }
& $ffmpeg -v error -y -i (Join-Path $filmRoot 'brag.raw.mp4') -i (Join-Path $filmRoot 'brag.jpg') -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" -map '[v]' -map '0:a?' -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -af 'loudnorm=I=-23:TP=-2:LRA=7' -c:a aac -b:a 192k -ar 48000 -t 22 -movflags +faststart (Join-Path $filmRoot 'brag.mp4')
if ($LASTEXITCODE -ne 0) { throw 'Final encoding failed' }
& $ffmpeg -v error -y -i (Join-Path $filmRoot 'brag.mp4') -an -c:v copy -movflags +faststart (Join-Path $filmRoot 'cosmicgaze-showcase-muted.mp4')
if ($LASTEXITCODE -ne 0) { throw 'Muted export failed' }
