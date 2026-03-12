import { memo } from 'react'

const RemoveBtn = memo(({ onClick }) => (
  <button className="de-arr-remove" onClick={onClick}>✕</button>
))

export default RemoveBtn