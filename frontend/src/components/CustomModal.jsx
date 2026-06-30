import { Modal, Button } from 'react-bootstrap';

const CustomModal = ({ show, onHide, title, message, onConfirm, confirmText, cancelText }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Alert'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        {onConfirm ? (
          <>
            <Button variant="secondary" onClick={onHide}>
              {cancelText || 'Cancel'}
            </Button>
            <Button variant="primary" onClick={onConfirm}>
              {confirmText || 'OK'}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onHide}>
            OK
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;