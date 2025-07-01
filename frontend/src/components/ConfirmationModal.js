import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmationModal({ show, handleClose, handleConfirm, message, showConfirmButton = true }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        {showConfirmButton && (
          <Button variant="danger" onClick={handleConfirm}>
            Delete
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
