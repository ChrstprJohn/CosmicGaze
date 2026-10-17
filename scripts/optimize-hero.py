"""Generate hero variants from the original NASA/ESO photograph.

Download the source URL to output/hero-galaxy-original.jpg before running.
Requires Pillow. Original discovery downloads remain unchanged.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
with Image.open(root / 'output/hero-galaxy-original.jpg') as source:
    for width in (640, 1100, 1600):
        image = source.convert('RGB')
        image = image.resize((width, round(width * image.height / image.width)), Image.Resampling.LANCZOS)
        target = root / f'public/previews/hero-galaxy-{width}.webp'
        image.save(target, 'WEBP', quality=82, method=6)
        print(target.name, target.stat().st_size)
        avif = target.with_suffix('.avif')
        image.save(avif, 'AVIF', quality=45, speed=6)
        print(avif.name, avif.stat().st_size)
