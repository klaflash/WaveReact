import React from 'react';

function Modal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Modal Title</h2>
        <p>This is the content of the modal.</p>
      </div>
    </div>
  );
}

export default Modal;