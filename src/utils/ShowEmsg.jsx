// src/utils/showEmsg.js
import { toast } from 'react-toastify';

export const showEmsg = (message, type) => {
  toast(message, {
    type, // 'info', 'success', 'warning', 'error'
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
