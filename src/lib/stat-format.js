export function formatStat(value) {
  if (value == null) return '—'
  for (const [unit, suffix] of [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) {
    if (value >= unit) return `${Math.floor(value / unit * 10) / 10}${suffix}+`
  }
  return new Intl.NumberFormat('en').format(value)
}
