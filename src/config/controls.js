export const CONTROLS = {
  DELETE_NODE:        { ctrl: true, alt: true  },
  CLEAR_HANDLE_EDGES: { ctrl: true, alt: false },
}

export const matches = (e, { ctrl, alt }) =>
  e.ctrlKey === ctrl && e.altKey === alt