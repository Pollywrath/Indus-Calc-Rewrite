export const FLOW_STATES = { EXCESS: 'excess', DEFICIT: 'deficit', BALANCED: 'balanced' }

export const FLOW_COLORS = {
  [FLOW_STATES.EXCESS]:   'var(--handle-output-excess)',
  [FLOW_STATES.DEFICIT]:  'var(--handle-input-deficient)',
  [FLOW_STATES.BALANCED]: 'var(--input-border)',
}