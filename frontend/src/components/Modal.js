import React from 'react';
import ReactDOM from 'react-dom';

const MODAL_STYLES = (width,height) => ({
    position: 'fixed',
    top: '50%',
    left: '50%',
    backgroundColor: 'rgb(34, 34, 34)',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    height: height ||'90%', // Adjust height as needed
    width: width || '90%', // Use the passed width or default to 90%
    borderRadius: '8px',
    padding: '20px',
    overflowY: 'auto', // Allows scrolling if content overflows
});

const OVERLAY_STYLES = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
};

export default function Modal({ children, onClose, width,height }) { // <-- Add width as a prop
    const targetElement = document.getElementById('cart-root');

    if (!targetElement) {
        return null; // or handle the case where the element doesn't exist
    }
    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES} />
            <div style={MODAL_STYLES(width,height)}> {/* Pass width to MODAL_STYLES */}
                <button className='btn bg-danger fs-4' style={{ marginLeft: "90%", marginTop: "-35px" }} onClick={onClose}> X </button>
                {children}
            </div>
        </>,
        targetElement
    );
}
