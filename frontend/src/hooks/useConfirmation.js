import { useState } from 'react';

const useConfirmation = () => {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    data: null,
    action: null,
    title: '',
    message: '',
    type: 'warning'
  });

  const showConfirmation = (data, action, title, message, type = 'warning') => {
    setConfirmDialog({
      open: true,
      data,
      action,
      title,
      message,
      type
    });
  };

  const hideConfirmation = () => {
    setConfirmDialog({
      open: false,
      data: null,
      action: null,
      title: '',
      message: '',
      type: 'warning'
    });
  };

  return {
    confirmDialog,
    showConfirmation,
    hideConfirmation
  };
};

export default useConfirmation;