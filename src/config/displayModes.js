export const MODES = ['cycle', 'second', 'minute', 'hour']

export const MODE_CONFIG = {
  cycle:  { label: '/cycle', seconds: null, windowLabel: null  },
  second: { label: '/sec',   seconds: 1,    windowLabel: '1s'  },
  minute: { label: '/min',   seconds: 60,   windowLabel: '1m'  },
  hour:   { label: '/hr',    seconds: 3600, windowLabel: '1h'  },
}