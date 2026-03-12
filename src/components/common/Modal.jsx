import { memo } from 'react'

const Modal = memo(({ title, onClose, children, className, headerRight }) => (
  <div className="ui-modal-overlay" onClick={onClose}>
    <div className={`ui-modal${className ? ` ${className}` : ''}`} onClick={e => e.stopPropagation()}>
      <div className="ui-modal-header">
        <span className="ui-modal-title">{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {headerRight}
          <button className="ui-modal-close" onClick={onClose}>✕</button>
        </div>
      </div>
      {children}
    </div>
  </div>
))

export default Modal