import React from 'react';
import { useNavigate } from 'react-router-dom';

function ConfirmationModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleOk = () => {
    onClose();
    navigate('/results');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '5px',
        textAlign: 'center'
      }}>
        <h2>Image Uploaded Successfully!</h2>
        <button onClick={handleOk}>OK</button>
      </div>
    </div>
  );
}

export default ConfirmationModal;
