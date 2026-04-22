import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  itemName = 'this item',
}) => {
  const [inputValue, setInputValue] = useState('');
  const isConfirmed = inputValue.trim().toLowerCase() === 'delete';

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmed) {
      onConfirm();
      setInputValue('');
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleConfirm} className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Warning: This action cannot be undone.</p>
            <p>You are about to delete <strong>{itemName}</strong>.</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Please type <strong>delete</strong> to confirm.
          </label>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="delete"
            autoFocus
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isConfirmed}
            className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300 disabled:dark:bg-red-800/50"
          >
            Delete
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConfirmDeleteModal;
