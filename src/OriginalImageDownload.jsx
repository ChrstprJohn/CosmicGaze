import axios from 'axios'
import DownloadPreview from './DownloadPreview.jsx'

export default function OriginalImageDownload({ entry }) {
  async function prepare(signal) {
    const { data: blob } = await axios.get(entry.image, { responseType: 'blob', signal, timeout: 30000 })
    if (!blob.type.startsWith('image/')) throw new Error('The image file is unavailable.')
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif', 'image/tiff': 'tif', 'image/svg+xml': 'svg' }[blob.type.split(';')[0]] || 'img'
    return { url: URL.createObjectURL(blob), filename: `cosmicgaze-${entry.date}.${extension}` }
  }
  return <DownloadPreview className="image-download" label="Preview download" title={entry.title} prepare={prepare} />
}
