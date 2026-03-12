export const NODE_WIDTH        = 380
export const RECT_HEIGHT       = 44
export const RECT_GAP          = 8
export const RECT_STEP         = RECT_HEIGHT + RECT_GAP
export const SIDE_PADDING      = 10
export const COLUMN_GAP        = 20
export const IO_PADDING_TOP    = 12
export const IO_PADDING_BOTTOM = 12
export const IO_PADDING_TOTAL  = IO_PADDING_TOP + IO_PADDING_BOTTOM
export const TOP_SECTION_HEIGHT = 120
export const BOTTOM_PADDING    = 12

export const COL_WIDTH = (NODE_WIDTH - SIDE_PADDING * 2 - COLUMN_GAP) / 2

export const NODE_GAP = (NODE_WIDTH / 20) * 4

export const getHandleTop = (index, sideCount, maxCount) => {
  const vertOffset = ((maxCount - sideCount) * RECT_STEP) / 2
  return IO_PADDING_TOP + (BOTTOM_PADDING / 2) + vertOffset + index * RECT_STEP + (RECT_HEIGHT / 2)
}

export const getNodeHeight = (inputCount, outputCount) => {
  const maxCount = Math.max(inputCount, outputCount, 1)
  return TOP_SECTION_HEIGHT + maxCount * RECT_STEP - RECT_GAP + IO_PADDING_TOTAL + BOTTOM_PADDING
}