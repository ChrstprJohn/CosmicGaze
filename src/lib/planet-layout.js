// Shared by the camera and its loading silhouette, including narrow stages.
export function planetLayout(width, height, rings = false, decorative = false) {
  const angle = Math.PI / 10
  const fitAngle = Math.min(angle, Math.atan(Math.tan(angle) * width / height))
  const distance = (rings ? 2.36 : 1.12) / Math.sin(fitAngle) * (decorative ? 1.05 : 1.25)
  const diameter = height / (Math.tan(angle) * Math.sqrt(distance ** 2 - 1))
  return { distance, diameter }
}
