export const MODES = ['cycle', 'second', 'minute', 'hour']

export const MODE_CONFIG = {
  cycle:  { label: '/cycle', seconds: null, windowLabel: null,  trayLabel: '↻'    },
  second: { label: '/sec',   seconds: 1,    windowLabel: '1s',  trayLabel: '/s'   },
  minute: { label: '/min',   seconds: 60,   windowLabel: '1m',  trayLabel: '/min' },
  hour:   { label: '/hr',    seconds: 3600, windowLabel: '1h',  trayLabel: '/hr'  },
}