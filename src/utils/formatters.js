const METRIC_THRESHOLDS = [
  [1e18, 'E'], [1e15, 'P'], [1e12, 'T'],
  [1e9,  'G'], [1e6,  'M'], [1e3,  'k'],
]

const DECIMAL_FACTORS = [1, 10, 100, 1_000, 10_000]

const isInvalid = (num) => typeof num !== 'number' || isNaN(num)
const trim = (num, places) => Math.round(num * DECIMAL_FACTORS[places]) / DECIMAL_FACTORS[places]

export const formatMetric = (num) => {
  if (isInvalid(num)) return String(num)
  for (const [value, suffix] of METRIC_THRESHOLDS) {
    if (Math.abs(num) >= value) return `${trim(num / value, 4)}${suffix}`
  }
  return String(trim(num, 4))
}

export const formatQuantity    = (num) => isInvalid(num) ? String(num) : String(trim(num, 4))
export const formatMachineCount = (num) => isInvalid(num) ? String(num) : String(trim(num, 2))

const S = { MINUTE: 60, HOUR: 3_600, DAY: 86_400, MONTH: 2_592_000, YEAR: 31_536_000 }

export const formatTime = (sec) => {
  if (isInvalid(sec)) return String(sec)
  if (sec < S.MINUTE) return `${trim(sec, 4)}s`
  const y  = Math.floor(sec / S.YEAR)
  const mo = Math.floor((sec % S.YEAR)  / S.MONTH)
  const d  = Math.floor((sec % S.MONTH) / S.DAY)
  const h  = Math.floor((sec % S.DAY)   / S.HOUR)
  const m  = Math.floor((sec % S.HOUR)  / S.MINUTE)
  const s  = trim(sec % S.MINUTE, 4)
  return [y&&`${y}y`, mo&&`${mo}mo`, d&&`${d}d`, h&&`${h}h`, m&&`${m}m`, s&&`${s}s`]
    .filter(Boolean).join(' ')
}