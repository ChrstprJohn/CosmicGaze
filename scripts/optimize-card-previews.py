"""Generate small homepage previews; preserve full-size artwork and downloads."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'public'
for name in ('galaxy', 'moon', 'moon-match', 'age', 'builder', 'planets', 'gravity'):
    source = root / 'previews' / f'{name}.webp'
    with Image.open(source) as image:
        image = image.resize((320, round(320 * image.height / image.width)), Image.Resampling.LANCZOS)
        target = source.with_name(f'{name}-320.webp')
        image.save(target, 'WEBP', quality=82, method=6)
        print(target.name, target.stat().st_size)
with Image.open(root / 'pets/nebula.png') as image:
    image.resize((240, 240), Image.Resampling.LANCZOS).save(root / 'pets/nebula-240.webp', 'WEBP', quality=85, method=6)
